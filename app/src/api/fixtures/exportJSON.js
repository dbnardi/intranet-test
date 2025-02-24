//register jquery
var s = document.createElement("script");
s.type = "text/javascript";
s.src = "https://code.jquery.com/jquery-3.3.1.min.js";
$("head").append(s);

//register underscore
var t = document.createElement("script");
t.type = "text/javascript";
t.src = "https://underscorejs.org/underscore-min.js";
$("head").append(t);

//ensure internal SP fields are omitted
var columnExclusions = [
  "__metadata",
  "FirstUniqueAncestorSecurableObject",
  "RoleAssignments",
  "AttachmentFiles",
  "ContentType",
  "FieldValuesAsHtml",
  "FieldValuesAsText",
  "FieldValuesForEdit",
  "File",
  "Folder",
  "ParentList",
  "FileSystemObjectType",
  "ContentTypeId",
  "OData__UIVersionString",
  "Attachments",
  "GUID"
];

//Retrieve all of the list items
function getListItems(listName) {
  var url =
    _spPageContextInfo.webAbsoluteUrl +
    "/_api/lists/getbytitle('" +
    listName +
    "')/items";
  $.ajax({
    url: url,
    type: "GET",
    headers: {
      accept: "application/json;odata=verbose"
    },
    success: function(results) {
      let res = _.map(results.d.results, i => _.omit(i, columnExclusions));
      console.log('{"' + listName + '":' + JSON.stringify(res) + "}");
    },
    error: function(error) {
      console.log("Error in getting List: " + listName);
      $(_options.container).html("Error retrieving your " + listName + ".");
    }
  });
}
