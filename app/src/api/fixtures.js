import { CamlConverter } from "./fixtures/camlconverter";
export class FixturesAPI {
  constructor() {
    this.baseUrl = "http://localhost:3000/";
    this.settings = [];
    let _this = this;
    this.taxonomy = {
      getTermSetAsTree(id) {
        return fetch(_this.baseUrl + id).then(i => i.json());
      }
    };
  }

  getAllListItemsPnP(params) {
    var call = this.baseUrl + params.list;
    var paramBuilder = [];
    if (params.orderBy) paramBuilder.push("_sort=" + params.orderBy);
    if (params.orderType) paramBuilder.push("_order=" + params.orderType);
    if (params.rowLimit) paramBuilder.push("_start=0&_end=" + params.rowLimit);
    return fetch(call + "?" + paramBuilder.join("&")).then(i => i.json());
  }

  getUserProperty(loginName, propertyName) {
    return new Promise((resolve,reject)=>{
      const blah = {}
      resolve(blah);
    });
  }
  getUserGroups(loginName, propertyName) {
    return new Promise((resolve,reject)=>{
      const blah = {}
      resolve(blah);
    });
  }
  getSiteUsersPnP() {
    return fetch(this.baseUrl + "Users").then(i => i.json());
  }
  getUsersInGroup(groupName) {
    return fetch(this.baseUrl + "Users").then(i => i.json());
  }
  getUserPnP(id) {
    return fetch(this.baseUrl + "Users" + "/" + id).then(i => i.json());
  }
  getUserByAccountNamePnP(account) {
    return fetch(this.baseUrl + "Users?AccountName=" + account).then(i =>
      i.json()
    );
  }
  getAllListItemsPaged(list, rowLimit) {
    return pnp.sp.web.lists
      .getByTitle(list)
      .top(rowLimit)
      .getPaged()
      .then(i => i.json());
  }
  getListItemById(list, id) {
    return fetch(this.baseUrl + list + "/" + id).then(i => i.json());
  }
  deleteListItemById(list, id) {
    return fetch(this.baseUrl + list + "/" + id, {method:"DELETE"}).then(i => i.json());
  }
  async getListItemsByCaml(list, caml) {
    let call = this.baseUrl + list;
    let camlconverter = new CamlConverter();
    if (caml) {
      let query = await camlconverter.convert(caml);
      return fetch(call + query).then(i => i.json());
    } else return fetch(call).then(i => i.json());
  }
  csomGetListItems(params) {
    return fetch(this.baseUrl + params.list).then(i => i.json());
  }
  createListItemPnP(list, item, keys) {
    return new Promise((resolve, reject) => {
      fetch(this.baseUrl + list, {
        method: "POST",
        body: JSON.stringify({
          ...item,
          Modified: moment().format(),
          Created: moment().format()
        }),
        headers: { "Content-Type": "application/json" }
      })
        .then(response => response.json())
        .then(json => resolve(json));
    });
  }
  updateListItemPnP(list, item, id, keys) {
    return new Promise((resolve, reject) => {
      let itemsToAdd = keys ? _.pick(item, keys) : item;
      fetch(this.baseUrl + list + "/" + id, {
        method: "PUT",
        body: JSON.stringify({ ...itemsToAdd, Modified: moment().format() }),
        headers: { "Content-Type": "application/json" }
      })
        .then(response => response.json())
        .then(json => resolve(json));
    });
  }
  async removeListItemPnP(listName, id) {
    return await fetch(this.baseUrl + listName + "/" + id, {
      method: "DELETE"
    });
  }
  getChoiceValues(fieldName, list) {
    return fetch(this.baseUrl + fieldName).then(i => i.json());
  }
  async sendEmail(to, body, subject) {
    console.log("email sent to:")
    console.log(to)
    console.log("subject: "+ subject)
    console.log("body: "+body)
    return "no fixture available";
  }
  async sendEmailCustom(to, body, subject) {
    console.log("email sent to:")
    console.log(to)
    console.log("subject: "+ subject)
    console.log("body: "+body)
    return "no fixture available";
  }
  async sendEmailREST(to, body, subject) {
    return "no fixture available";
  }
  async getConfig() {
    this.settings = await fetch(this.baseUrl + "Configuration").then(i =>
      i.json()
    );
  }
  getConfigItem(key) {
    let item = this.settings.find(i => i.Title == key);
    return item ? item.ConfigValue : null;
  }
  getAttachmentsForItem(list, itemId) {
    return []
  }

  async addAttachmentsToItem(listName, itemId, attachment) {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  async deleteAttachments(listName, itemId, attachments) {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }
}
