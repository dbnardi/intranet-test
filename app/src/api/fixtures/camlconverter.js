var parseString = require("xml2js").parseString;
export class CamlConverter {
  constructor() {
    this.searchString = "?";
  }
  convert(caml) {
    var _this = this;
    return new Promise(function(res, rej) {
      parseString(caml, function(err, result) {
        var where = result.Where;
        var query = {},
          connector = "";
        if (where["And"]) {
          connector = "&";
          query = where["And"][0];
        }
        //I don't think JSON server actually supports OR queries...
        else if (where["Or"]) {
          connector = "&";
          query = where["Or"][0];
        } else query = where;
        _this.recursiveBuild(connector, query);
        res(_this.searchString.substring(0, _this.searchString.length - 1));
      });
    });
  }

  Eq(connector, query) {
    var qry = [],
      _this = this;
    _.each(query, q => {
      qry.push(_this.buildString(q, "="));
    });
    return qry.join(connector);
  }

  Neq(connector, query) {
    var qry = [],
      _this = this;
    _.each(query, q => {
      qry.push(_this.buildString(q, "_ne="));
    });
    return qry.join(connector);
  }

  Contains(connector, query) {
    var qry = [],
      _this = this;
    _.each(query, q => {
      qry.push(_this.buildString(q, "_like="));
    });
    return qry.join(connector);
  }

  NotContains(connector, query) {
    throw "No equivalent function exists";
  }

  Geq(connector, query) {
    var qry = [],
      _this = this;
    _.each(query, q => {
      qry.push(_this.buildString(q, "_gte="));
    });
    return qry.join(connector);
  }

  Leq(connector, query) {
    var qry = [],
      _this = this;
    _.each(query, q => {
      qry.push(_this.buildString(q, "_lte="));
    });
    return qry.join(connector);
  }

  Gt(connector, query) {
    var qry = [],
      _this = this;
    _.each(query, q => {
      qry.push(_this.buildString(q, "_gte="));
    });
    return qry.join(connector);
  }

  Lt(connector, query) {
    var qry = [],
      _this = this;
    _.each(query, q => {
      qry.push(_this.buildString(q, "_lte="));
    });
    return qry.join(connector);
  }

  buildString(query, operand) {
    var field = query.FieldRef[0].$.Name;
    var value = query.Value[0]._;
    return field + operand + value;
  }

  recursiveBuild(connector, query) {
    var _this = this;
    _.each(query, (val, key) => {
      if (key == "And" || key == "Or") {
        _this.recursiveBuild("&", val[0]);
      } else {
        _this.searchString += _this[key](connector, val) + "&";
      }
    });
  }
}
