'use strict'

var Q = require('q')
var voc = require('@tradle/models')
var t = require('tcomb-form-native');
var moment = require('moment');
var extend = require('xtend')
var parseDBValue = function (pair) {
  return pair[1] && rebuf(JSON.parse(pair[1]))
}
var strMap = {
  'Please fill out this form and attach a snapshot of the original document': 'fillTheForm'
}
var translatedStrings = {
  en: require('./strings_en.json'),
  nl: require('./strings_nl.json')
}
var constants = require('@tradle/constants');
var TYPE = constants.TYPE
var VERIFICATION = constants.TYPES.VERIFICATION
// var LocalizedStrings = require('react-native-localization')
let defaultLanguage = 'nl'; //new LocalizedStrings({ en: {}, nl: {} }).getLanguage()
var dictionaries = require('@tradle/models').dict

var strings = translatedStrings[defaultLanguage]
var dictionary = dictionaries[defaultLanguage]

var propTypesMap = {
  'string': t.Str,
  'boolean': t.Bool,
  'date': t.Dat,
  'number': t.Num
};
var models, me;

var DEFAULT_FETCH_TIMEOUT = 5000
var utils = {
  isEmpty(obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
        return false;
    }
    return true;
  },
  setMe(meR) {
    me = meR;
    if (!me)
      return

    if (me.languageCode) {
      strings = translatedStrings[me.languageCode]
      if (me.dictionary)
        dictionary = me.dictionary
      else if (dictionaries[me.languageCode])
        dictionary = dictionaries[me.languageCode]
    }
    if (!strings)
      strings = translatedStrings[defaultLanguage]
  },

  getMe() {
    return me;
  },
  setModels(modelsRL) {
    models = {}
    for (let m of modelsRL) {
      models[m.id] = m
      this.addNameAndTitleProps(m)
    }
  },
  addNameAndTitleProps(m, aprops) {
    var mprops = aprops  ||  m.properties
    for (var p in mprops) {
      if (p.charAt(0) === '_')
        continue
      if (!mprops[p].name)
        mprops[p].name = p
      if (!mprops[p].title)
        mprops[p].title = utils.makeLabel(p)
      if (mprops[p].type === 'array') {
        var aprops = mprops[p].items.properties
        if (aprops)
          this.addNameAndTitleProps(m, aprops)
      }
    }
  },
  getModels() {
    return models;
  },
  getModel(modelName) {
    return models ? models[modelName] : null;
  },
  translate(...args) {
    if (typeof args[0] === 'string')
      return utils.translateString(...args)
    if (args.length === 1)
      return utils.translateModel(args[0])
    else
      return utils.translateProperty(args[0], args[1])
  },
  translateProperty(property, model) {
    if (!dictionary)
      return property.title || utils.makeLabel(property.name)
    let translations = dictionary.properties[property.name]
    return (translations) ? translations[model.id] || translations.Default : property.title || utils.makeLabel(property.name)
  },
  translateItemProperty(property, itemsProperty, model) {
    if (!dictionary)
      return property.title || utils.makeLabel(property.name)
    let itemsProp = dictionary.properties[itemsProperty.name]
    return  itemsProp && itemsProp.items && itemsProp.items[property.name]
          ? itemsProp.items[property.name]
          : property.title || utils.makeLabel(property.name)
  },
  translateModel(model) {
    if (!dictionary)
      return model.title
    return dictionary.models[model.id] || model.title

  },
  translateString(...args) {
    if (!strings)
      return args[0]

    let s = strings[args[0]]
    if (!s)
      return args[0]

    // if (args.length === 2  &&  typeof args[1] === 'object') {
    //   let pos = 0
    //   do {
    //     let i1 = s.indexOf('{', pos)
    //     if (i1 === -1)
    //       break
    //     let i2 = s.indexOf('}, i1')
    //     if (i2 === -1)
    //       break
    //     s = s.substring(0, i1) + args[1][s.substring(i1 + 1, i2)] + s.substring(i2 + 1)
    //   } while(true)
    // }
    // else
    if (args.length > 1) {
      for (let i=1; i<args.length; i++) {
        let insert = '{' + i + '}'
        let idx = s.indexOf(insert)
        if (idx === -1)
          continue
        s = s.substring(0, idx) + args[i] + s.substring(idx + insert.length)
      }
    }
    return s ? s : args[0]
  },
  getStringName(str) {
    return strMap[str]
  },
  createAndTranslate(s, isEnumValue) {
    let stringName = s.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
    stringName = stringName.replace(/[^a-zA-Z0-9]/g, '')
    // stringName = stringName.charAt(0).toLowerCase() + stringName.slice(1)
    let t = utils.translate(stringName)
    // return t !== stringName ? t : (isEnumValue ? s : utils.makeLabel(s))
    return t !== stringName ? t : s
  },
  makeLabel(label) {
    return label
          // insert a space before all caps
          .replace(/([A-Z])/g, ' $1')
          // uppercase the first character
          .replace(/^./, function(str){ return str.toUpperCase(); })
  },
  arrayToObject(arr) {
    if (!arr)
      return;

    var obj = arr.reduce(function(o, v, i) {
      o[v.trim()] = i;
      return o;
    }, {});
    return obj;
  },
  objectToArray(obj) {
    if (!obj)
      return;

    return Object.keys(obj).map(function (key) {return obj[key]});
  },
  getImplementors(iModel, excludeModels) {
    var implementors = [];
    for (var p in models) {
      var m = models[p].value;
      if (excludeModels) {
        var found = false
        for (var i=0; i<excludeModels.length && !found; i++) {
          if (p === excludeModels[i])
            found = true
          else {
            var em = this.getModel(p).value
            if (em.subClassOf  &&  em.subClassOf === excludeModels[i])
              found = true;
          }
        }
        if (found)
          continue
      }
      if (m.interfaces  &&  m.interfaces.indexOf(iModel) != -1)
        implementors.push(m);
    }
    return implementors;
  },
  getAllSubclasses(iModel) {
    var subclasses = [];
    for (var p in models) {
      var m = models[p].value;
      if (m.subClassOf  &&  m.subClassOf === iModel)
        subclasses.push(m);
    }
    return subclasses;
  },
  getId(r) {
    if (typeof r === 'string') {
      var idArr = r.split('_');
      return idArr.length === 2 ? r : idArr[0] + '_' + idArr[1];
    }
    if (r.id) {
      var idArr = r.id.split('_');
      return idArr.length === 2 ? r.id : idArr[0] + '_' + idArr[1];
    }
    else
      return r[constants.TYPE] + '_' + r[constants.ROOT_HASH];
  },
  getFormattedDate(dateTime) {
    var date = new Date(dateTime);
    var dayDiff = moment(new Date()).dayOfYear() - moment(date).dayOfYear();
    var val;
    switch (dayDiff) {
    case 0:
      val = moment(date).format('[today], h:mA');
      break;
    case 1:
      val = moment(date).format('[yesterday], h:m');
      break;
    default:
      val = moment(date).format('MMMM Do YYYY, h:mm:ss a');
    }
    return val;
  },
  getItemsMeta(metadata) {
    var props = metadata.properties;
    var required = utils.arrayToObject(metadata.required);
    // if (!required)
    //   return;
    var itemsMeta = {};
    for (var p in props) {
      if (props[p].type == 'array')  //  &&  required[p]) {
        itemsMeta[p] = props[p];
    }
    return itemsMeta;
  },
  makeTitle(resourceTitle, prop) {
    return (resourceTitle.length > 28) ? resourceTitle.substring(0, 28) + '...' : resourceTitle;
  },
  getDisplayName(resource, meta) {
    if (!meta) {
      if (resource.title)
        return resource.title
      else
        meta = this.getModel(resource[constants.TYPE]).value.properties
    }
    var displayName = '';
    for (var p in meta) {
      if (meta[p].displayName) {
        if (resource[p]) {
          if (meta[p].type == 'object') {
            var title = resource[p].title || this.getDisplayName(resource[p], utils.getModel(resource[p][constants.TYPE]).value.properties);
            displayName += displayName.length ? ' ' + title : title;
          }
          else
            displayName += displayName.length ? ' ' + resource[p] : resource[p];
        }
        else if (meta[p].displayAs) {
          var dn = this.templateIt(meta[p], resource);
          if (dn)
            displayName += displayName.length ? ' ' + dn : dn;
        }

      }
    }
    return displayName;
  },

  templateIt(prop, resource) {
    var template = prop.displayAs;
    var val = '';
    if (template instanceof Array) {
      template.forEach(function(t) {
        if (t.match(/[a-z]/i)) {
          if (resource[t]) {
            if (val  &&  val.charAt(val.length - 1).match(/[a-z,]/i))
              val += ' ';
            val += (typeof resource[t] === 'object') ? resource[t].title : resource[t];
          }
        }
        else if (val.length  &&  val.indexOf(t) != val.length - 1)
          val += t;
      });
    }
    return val;
  },
  formatDate(date) {
    var dayDiff = moment(new Date()).dayOfYear() - moment(date).dayOfYear();
    var val;
    switch (dayDiff) {
    case 0:
      val = moment(date).fromNow();
      break;
    case 1:
      val = moment(date).format('[yesterday], h:mA');
      break;
    default:
      val = moment(date).format('LL');
    }
    return val;
  },
  splitMessage(message) {
    if (!message)
      return []
    var lBr = message.indexOf('[');
    var msg;
    if (lBr == -1)
      return [message];
    var rBr = message.indexOf(']', lBr);
    if (rBr == -1)
      return [message];
    if (message.charAt(rBr + 1) != '(')
      return [message];
    var rRoundBr = message.indexOf(')', rBr);
    if (rRoundBr == -1)
      return [message];
    else {
      if (lBr)
        return [message.substring(0, lBr), message.substring(lBr + 1, rBr), message.substring(rBr + 2, rRoundBr)];
      else
        return [message.substring(lBr + 1, rBr), message.substring(rBr + 2, rRoundBr)];
    }
  },
  getImageUri(url) {
    if (!url)
      return null;
    if (url.indexOf('data') === 0 || url.indexOf('assets-') === 0 || url.indexOf('http') === 0)
      return url;
    else if (url.indexOf('file:///') === 0)
      return url.replace('file://', '')
    else if (url.indexOf('../') === 0)
      return url
    // else if (url.indexOf('/var/mobile/') == 0)
    //   return url;
    else
      return 'http://' + url;
  },

  optimizeResource(res) {
    var properties = this.getModel(res[TYPE]).value.properties
    for (var p in res) {
      if (p.charAt(0) === '_'  ||  !properties[p])
        continue
      if (res[p].id  &&  res[p].title)
        continue
      if (properties[p].type === 'object'  &&  properties[p].ref !== constants.TYPES.MONEY) {
        res[p] = {
          id: this.getId(res[p]),
          title: this.getDisplayName(res[p], properties)
        }
      }
      else if (properties[p].type === 'array'  &&  properties[p].items.ref) {
        var arr = []
        res[p].forEach(function(r) {
          if (r.id)
            return
          var rr = {}
          rr.id = utils.getId(r)
          var m = utils.getModel(r[TYPE])
          rr.title = utils.getDisplayName(r, m.properties)
          arr.push(rr)
        })
        res[p] = arr
      }
    }
  },

  firstKey: function firstKey (obj) {
    return Object.keys(obj)
    .sort(function (a, b) {
      return a < b ? -1 : (a > b ? 1 : 0)
    })[0]
  }

}
module.exports = utils;
