import { Item, sp, Web } from "@pnp/sp/presets/all";
export class SharePointAPI {
  constructor() {
    //setup pnp for JSON light (sp environments that aren't patched)
    sp.setup({
      sp: {
        headers: {
          Accept: "application/json; odata=verbose",
        },
      },
    });
  }

  _currentUser = null;

  async searchAPIQuery(query) {
    return await sp.search(query);
  }

  async getFieldByTitle(title) {
    return await this.web.fields.getByInternalNameOrTitle(title).get();
  }

  addImagePnP(item, id) {
    sp.web
      .getFolderByServerRelativeUrl(
        _spPageContextInfo.webServerRelativeUrl + "/Images"
      )
      .files.add(id, item, true);
  }

  getSiteUsersPnP() {
    return sp.web.siteUsers.get();
  }

  getUser(id) {
    return Promise.all([
      sp.web.siteUsers.getById(id).get(),
      sp.web.siteUsers.getById(id).groups.get(),
    ]);
  }

  getRootDocumentURL(documentName) {
    return `${_spPageContextInfo.siteAbsoluteUrl}/documents/${documentName}`
  }

  getUsersInGroup(groupName) {
    return sp.web.siteGroups.getByName(groupName).users.get();
  }

  getUserProperty(loginName, propertyName) {
    let result;
    if (propertyName) {
      result = {
        propertyName: sp.profiles.getUserProfilePropertyFor(
          loginName,
          propertyName
        ),
      };
    } else {
      result = sp.profiles.getPropertiesFor(loginName);
    }
    return result;
  }

  getUserGroups(loginName) {
    return sp.web.siteUsers.getByLoginName(loginName).groups.get();
  }

  getCurrentUserGroups() {
    return sp.web.currentUser.groups();
  }

  async getCurrentUser() {
    SharePointAPI._currentUser ??= await sp.web.currentUser();
    return SharePointAPI._currentUser;
  }

  async getUserPnP(id) {
    let user = await this.getUser(id);
    let fullUser = await sp.profiles.getPropertiesFor(user[0].LoginName);
    fullUser.groups = user[1];
    fullUser.LoginName = user[0].LoginName;
    return fullUser;
  }

  async getUserByAccountNamePnP(account) {
    let user = await sp.profiles.getPropertiesFor(account);
    return user.DisplayName;
  }

  async getUserByLoginName(loginName) {
    return await sp.web.siteUsers.getByLoginName(loginName).get();
  }

  searchUsersPnP(search) {
    const result = sp.profiles.clientPeoplePickerSearchUser({
      AllowEmailAddresses: true,
      AllowMultipleEntities: false,
      AllUrlZones: false,
      MaximumEntitySuggestions: 50,
      PrincipalSource: 15,
      PrincipalType: 15,
      QueryString: search,
      Required: false,
      UrlZoneSpecified: false,
    });
    return result;
  }

  async getAllListItemsPnP(params, urlSubdirectory = null) {
    /*
      params = {
        listName: (string) - name of list,
        select: (string[]) - list of properties to select,
        expand: (string[]) - list of expand properties,
        rowLimit: (number) - number of rows to return,
        orderBy: (string) - name of field to order by,
        ascending: (bool) - order by ascending (otherwise descending)
        parent: (boolean) - if list is in parent site
        filter: (string) - filter string
        paginate: (bool) - paginate the query?
      }
    */
    let web = urlSubdirectory ? new Web(urlSubdirectory) : sp.web;
    web = params.parent ? await sp.web.getParentWeb() : web;

    const query = web.lists.getByTitle(params.listName).items;

    return this.constructAndCallQuery(
      params,
      query
    );
  }

  async getAttachmentsForItem(listName, itemId, urlSubdirectory) {
    let result = null,
      item = null;
    if (urlSubdirectory) {
      let web = new Web(urlSubdirectory);
      item = await web.lists.getByTitle(listName).items.getById(itemId);
    } else item = await sp.web.lists.getByTitle(listName).items.getById(itemId);
    if (item) result = await item.attachmentFiles.get();
    return result;
  }

  async addAttachmentsToItem(listName, itemId, attachment, urlSubdirectory) {
    /*
            attachment must be either an object like: 
            {
                name: "filename",
                content: "string, blob or array"
            }
            or an array of objects in the same format.
        */
    let result = null,
      item = null;
    if (urlSubdirectory) {
      let web = new Web(urlSubdirectory);
      item = await web.lists.getByTitle(listName).items.getById(itemId);
    } else {
      item = await sp.web.lists.getByTitle(listName).items.getById(itemId);
    }

    if (item) {
      let fileInfos = [];
      if (Array.isArray(attachment)) {
        fileInfos = attachment;
      } else {
        fileInfos.push(attachment);
      }
      result = await item.attachmentFiles.addMultiple(fileInfos);
    }
    return result;
  }

  async deleteAttachments(listName, itemId, attachments, urlSubdirectory) {
    let result = null,
      item = null;
    if (urlSubdirectory) {
      let web = new Web(urlSubdirectory);
      item = await web.lists.getByTitle(listName).items.getById(itemId);
    } else item = await sp.web.lists.getByTitle(listName).items.getById(itemId);
    if (item)
      result = await item.attachmentFiles.deleteMultiple(...attachments);
    return result;
  }

  getListItemById(list, id, urlSubdirectory) {
    if (urlSubdirectory) {
      let web = new Web(urlSubdirectory);
      return web.lists.getByTitle(list).items.getById(id).get();
    }
    return sp.web.lists.getByTitle(list).items.getById(id).get();
  }

  deleteListItemById(list, id, urlSubdirectory) {
    if (urlSubdirectory) {
      let web = new Web(urlSubdirectory);
      return web.lists.getByTitle(list).items.getById(id).delete();
    }
    return sp.web.lists.getByTitle(list).items.getById(id).delete();
  }

  async getListItemsWithHTMLField(list, imageList, params = {}, urlSubdirectory = null) {
    /*
      params = {
        list: (string) - name of list, // duplicate listname ??? TODO: FIX
        selects: (string[]) - list of properties to select,
        rowLimit: (number) - number of rows to return,
        orderBy: (string) - name of field to order by,
        ascending: (bool) - order by ascending (otherwise descending),
        filter: (string) - filter string
        paginate: (bool) - paginate the query?
      }
    */
    const web = urlSubdirectory ? new Web(urlSubdirectory) : sp.web;
    const query = web.lists.getByTitle(list).items;

    var response = await this.constructAndCallQuery(params, query);
    var items = params.paginate ? response.results : response;

    if (imageList) {
      items = await Promise.all(
        items.map((item) => {
          return this.getImage(item, list, imageList);
        })
      );
    }

    if (params.paginate) {
      response.results = items;
      return response;
    }

    return items;
  }

  async getImage(item, list, imageList, web) {
    web = web ? web : sp.web;
    var query = web.lists.getByTitle(list).items;
    var htmlValues = new Item(query.getById(item.Id), "FieldValuesAsHtml");
    for (let image of imageList) {
      let htmlVal = await htmlValues.select(image).get();
      item[image] = htmlVal[image];
    }
    return item;
  }

  async constructAndCallQuery({ filter, select, expand, rowLimit, orderBy, ascending, paginate },
    query
  ) {
    if (ascending === undefined) ascending = true;
    if (filter) query.filter(filter);
    if (select) query.select(select);
    if (expand) query.expand(expand);
    if (rowLimit) query.top(rowLimit);
    if (orderBy) query.orderBy(orderBy, ascending);

    const response = paginate ? await query.getPaged() : await query.get();
    return response
  }

  async getListItemsByCaml(list, query, urlSubdirectory, rowLimit) {
    return new Promise(async (resolve, reject) => {
      try {
        const web = urlSubdirectory ? new Web(urlSubdirectory) : sp.web;
        const rowLimitString = rowLimit
          ? `<RowLimit>${rowLimit}</RowLimit>`
          : "";
        const items = await web.lists.getByTitle(list).getItemsByCAMLQuery(
          {
            ViewXml: `<View><Query>${query}</Query>${rowLimitString}</View>`,
          },
          "FieldValuesAsHtml",
          "FieldValuesAsText"
        );
        resolve(items);
      } catch (e) {
        reject(e);
      }
    });
  }

  async createListItemPnP(list, item, keys, urlSubdirectory) {
    let itemsToAdd = keys ? _.pick(item, keys) : item;
    if (itemsToAdd.Id === null) {
      delete itemsToAdd.Id;
    }
    let i = null;
    if (urlSubdirectory) {
      let web = new Web(urlSubdirectory);
      i = await web.lists.getByTitle(list).items.add(itemsToAdd);
    } else i = await sp.web.lists.getByTitle(list).items.add(itemsToAdd);
    return i.data;
  }

  async updateListItemPnPByFilter(list, item, filter, urlSubdirectory) {
    const web = urlSubdirectory ? new Web(urlSubdirectory) : sp.web;

    const target = await web.lists
      .getByTitle(list)
      .items.top(1)
      .filter(filter)
      .get();

    if (target.length > 0) {
      return web.lists
        .getByTitle(list)
        .items.getById(target[0].Id)
        .update(item);
    }

    return null;
  }

  updateListItemPnP(list, item, id, keys, urlSubdirectory) {
    let itemsToAdd = keys ? _.pick(item, keys) : item;
    if (urlSubdirectory) {
      let web = new Web(urlSubdirectory);
      return web.lists.getByTitle(list).items.getById(id).update(itemsToAdd);
    } else
      return sp.web.lists.getByTitle(list).items.getById(id).update(itemsToAdd);
  }

  async getFieldValues(fieldName, urlSubdirectory) {
    let web = sp.web;
    if (urlSubdirectory) web = new Web(urlSubdirectory);

    const field = await web.fields.getByInternalNameOrTitle(fieldName).get();
    return field.Choices.results;
  }

  async getChoiceValues(fieldName, listName, urlSubdirectory) {
    let web = sp.web;
    if (urlSubdirectory) web = new Web(urlSubdirectory);

    const list = web.lists.getByTitle(listName);
    const field = await list.fields.getByInternalNameOrTitle(fieldName).get();
    return field.Choices.results;
  }

  sendEmailCustom(to, body, subject) {
    //Get the relative url of the site
    var siteurl = _spPageContextInfo.siteAbsoluteUrl;
    var urlTemplate = siteurl + "/_layouts/15/API/api.aspx/SendEmail";
    UpdateFormDigest(_spPageContextInfo.webServerRelativeUrl, 1000);
    return fetch(urlTemplate, {
      method: "POST",
      body: JSON.stringify({
        toAddress: to.join(","),
        message: body,
        subject: subject,
      }),
      headers: {
        Accept: "application/json",
        "content-type": "application/json; charset=utf-8",
        "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value,
      },
    });
  }

  sendEmail(to, body, subject) {
    /*
            to: array of email addresses,
            body: html string email body,
            subject: subject string
        */
    const emailProps = {
      To: Array.isArray(to) ? to : [to],
      Subject: subject,
      Body: body,
    };
    return sp.utility.sendEmail(emailProps);
  }
}

const sharepoint = new SharePointAPI();
export default sharepoint;
