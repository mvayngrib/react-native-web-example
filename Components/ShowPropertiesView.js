'use strict';

var React = require('react-native');
// var PhotoList = require('./PhotoList');
// var ArticleView = require('./ArticleView');
var utils = require('../utils/utils');
var constants = require('@tradle/constants');
var RowMixin = require('./RowMixin')
var reactMixin = require('react-mixin')
var Accordion = require('react-native-accordion')
var Icon = require('react-native-vector-icons/Ionicons')

var DEFAULT_CURRENCY_SYMBOL = '£'
var CURRENCY_SYMBOL
var cnt = 0;

var {
  StyleSheet,
  Image,
  View,
  ListView,
  LayoutAnimation,
  Text,
  TextInput,
  TouchableHighlight,
  Component
} = React;

class ShowPropertiesView extends Component {
  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      resource: this.props.resource,
      viewStyle: {margin: 3},
      dataSource: dataSource
    }
    CURRENCY_SYMBOL = props.currency ? props.currency.symbol || props.currency : DEFAULT_CURRENCY_SYMBOL
  }

  render() {
    var viewCols = this.getViewCols();
    return (
      <View key={this.getNextKey()}>
        {viewCols}
      </View>
    );
  }

  getViewCols(resource, model) {
    var resource = this.state.resource;
    var modelName = resource[constants.TYPE];
    var model = utils.getModel(modelName).value;
    var vCols = model.viewCols;

    var excludedProperties = this.props.excludedProperties;
    var props = model.properties;
    if (excludedProperties) {
      var mapped = [];
      excludedProperties.forEach((p) =>  {
        if (props[p]) {
          mapped.push(p);
        }
      })
      excludedProperties = mapped;
    }

    if (!vCols) {
      vCols = [];
      for (var p in props) {
        if (p != constants.TYPE)
          vCols.push(p)
      }
      // vCols = utils.objectToArray(model.properties);
      // var idx = vCols.indexOf(constants.TYPE);
      // delete vCols[idx];
    }
    var isMessage = model.interfaces;
    if (!isMessage) {
      var len = vCols.length;
      for (var i=0; i<len; i++) {
        if (props[vCols[i]].displayName) {
          vCols.splice(i, 1);
          len--;
        }
      }
    }
    var self = this;
    var first = true;
    var viewCols = vCols.map(function(p) {
      if (excludedProperties  &&  excludedProperties.indexOf(p) !== -1)
        return;

      var val = resource[p];
      var pMeta = model.properties[p];
      var isRef;
      var isItems
      var isDirectionRow;
      if (!val) {
        if (pMeta.displayAs)
          val = utils.templateIt(pMeta, resource);
        else
          return;
      }
      else if (pMeta.ref) {
        if (pMeta.ref == constants.TYPES.MONEY)
          val = (val.currency || CURRENCY_SYMBOL) + val.value
        // Could be enum like props
        else if (Object.keys(utils.getModel(pMeta.ref).value.properties).length === 2)
          val = val.title
        else if (self.props.showRefResource) {
          // ex. property that is referencing to the Organization for the contact
          var value = val[constants.TYPE] ? utils.getDisplayName(val, utils.getModel(val[constants.TYPE]).value.properties) : val.title;

          val = <TouchableHighlight onPress={self.props.showRefResource.bind(self, val, pMeta)} underlayColor='transparent'>
                 <Text style={[styles.title, styles.linkTitle]}>{value}</Text>
               </TouchableHighlight>

          isRef = true;
        }
      }
      else if (pMeta.type === 'date')
        val = utils.formatDate(val);

      if (!val)
        return <View key={self.getNextKey()}></View>;
      if (!isRef) {
        if (val instanceof Array) {
          if (pMeta.items.backlink)
            return <View  key={self.getNextKey()} />
          var vCols = pMeta.viewCols;
          var cnt = val.length;
          val = <View>{self.renderItems(val, pMeta)}</View>

          isItems = true
               // <View style={[styles.textContainer, {padding: 10}, isDirectionRow ? {flexDirection: 'row'} : {flexDirection: 'column'}]}>
          first = false;
          title = <View style={{flexDirection: 'row'}}>
                    <Text style={styles.title}>{pMeta.title || utils.makeLabel(p)}</Text>
                    <Icon name={'ios-arrow-down'} size={15} color='#7AAAC3' style={{position: 'absolute', right: 10, top: 10}}/>
                  </View>

          val = <View key={self.getNextKey()}>
                  {separator}
                  <Accordion
                    header={title}
                    content={val}
                    underlayColor='transparent'
                    easing='easeInCirc' />
               </View>
        }
        else  {
          if (props[p].units  &&  props[p].units.charAt(0) != '[') {
            val += ' ' + props[p].units
          }
          if (typeof val === 'number'  ||  typeof val === 'boolean')
            val = <Text style={styles.description}>{val}</Text>;
          // else if (pMeta.type !== 'object'  &&  (val.indexOf('http://') == 0  ||  val.indexOf('https://') === 0))
          //   val = <Text onPress={self.onPress.bind(self, val)} style={[styles.description, {color: '#7AAAC3'}]}>{val}</Text>;
          else {
            // if (val.length < 30)
            //   isDirectionRow = true;
            val = <Text style={[styles.description]} numberOfLines={2}>{val}</Text>;
            // val = <Text style={[styles.description, {flexWrap: 'wrap'}]} numberOfLines={2}>{val}</Text>;
            // val = <Text style={[styles.description, isDirectionRow ? {alignSelf: 'flex-end'} : {alignSelf: 'flex-start'}]}>{val}</Text>;
          }
        }
      }
      var title = pMeta.skipLabel  ||  isItems
                ? <View />
                : <Text style={styles.title}>{pMeta.title || utils.makeLabel(p)}</Text>
      var separator = first
                    ? <View />
                    : <View style={styles.separator}></View>;

      first = false;
      return (<View key={self.getNextKey()}>
               {separator}
               <View style={[styles.textContainer, {padding: 10}, isDirectionRow ? {flexDirection: 'row'} : {flexDirection: 'column'}]}>
                 {title}
                 {val}
               </View>
             </View>
             );
    });
    if (resource.txId) {
      viewCols.push(<View key={self.getNextKey()}>
                     <View style={styles.separator}></View>
                     <View style={[styles.textContainer, {padding: 10}]}>
                       <Text style={styles.title}>{'Transaction uri'}</Text>
                       <Text onPress={self.onPress.bind(self, 'http://tbtc.blockr.io/tx/info/' + resource.txId)} style={[styles.description, {color: '#7AAAC3'}]}>{resource.txId}</Text>
                      </View>
                    </View>)
    }
    return viewCols;
  }
  renderItems(val, pMeta) {
    var itemsMeta = pMeta.items.properties;
    if (!itemsMeta) {
      var ref = pMeta.items.ref;
      if (ref) {
        pMeta = utils.getModel(ref).value;
        itemsMeta = pMeta.properties;
      }
    }
    var counter = 0;
    var vCols = pMeta.viewCols;
    if (!vCols) {
      vCols = [];
      for (var p in itemsMeta)
        vCols.push(p);
    }
    var cnt = val.length;
    var self = this;
    return val.map(function(v) {
      var ret = [];
      counter++;
      vCols.forEach((p) =>  {
        var itemMeta = itemsMeta[p];
        if (!v[p]  &&  !itemMeta.displayAs)
          return
        if (itemMeta.displayName)
          return
        var value;
        if (itemMeta.displayAs)
          value = utils.templateIt(itemMeta, v)
        else if (itemMeta.type === 'date')
          value = utils.formatDate(v[p]);
        else if (itemMeta.type !== 'object') {
          // if (p == 'photos') {
          //   var photos = [];
          //   ret.push(
          //      <PhotoList photos={v.photos} navigator={self.props.navigator} numberInRow={4} resource={resource}/>
          //   );
          //   return
          // }
          // else
            value = v[p];
        }
        else if (itemMeta.ref)
          value = v[p].title  ||  utils.getDisplayName(v[p], utils.getModel(itemMeta.ref).value.properties);
        else
          value = v[p].title;

        if (!value)
          return

          // ret.push(
          //   <View>
          //     <TouchableHighlight onPress={self.showResource.bind(this, value)} underlayColor='transparent'>
          //       <View style={value.length > 60 ? styles.itemColContainer : styles.itemContainer}>
          //         <Text style={itemMeta.skipLabel ? {height: 0} : styles.title}>{itemMeta.skipLabel ? '' : utils.makeLabel(p)}</Text>
          //         <Text style={styles.description}>{value.title}</Text>
          //       </View>
          //      </TouchableHighlight>
          //  </View>);
        ret.push(
          <View style={{padding: 10}} key={self.getNextKey()}>
           <View style={styles.itemColContainer} key={self.getNextKey()}>
             <Text style={itemMeta.skipLabel ? {height: 0} : styles.title} key={self.getNextKey()}>{itemMeta.skipLabel ? '' : itemMeta.title || utils.makeLabel(p)}</Text>
             <Text style={styles.description} key={self.getNextKey()}>{value}</Text>
           </View>
         </View>
        );
      })
      return (
        <View key={self.getNextKey()}>
           {ret}
           {counter == cnt ? <View></View> : <View style={styles.itemSeparator}></View>}
        </View>
      )
    });
  }
  // onPress(url, event) {
  //   var model = utils.getModel(this.props.resource[constants.TYPE]).value;
  //   this.props.navigator.push({
  //     id: 7,
  //     backButtonTitle: 'Back',
  //     title: utils.getDisplayName(this.props.resource, model.properties),
  //     component: ArticleView,
  //     passProps: {url: url ? url : this.props.resource.url}
  //   });
  // }
}
reactMixin(ShowPropertiesView.prototype, RowMixin);

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    // flexWrap: 'wrap'
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  itemColContainer: {
    flex: 1,
    // flexWrap: 'wrap',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
    marginHorizontal: 15
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#D7E6ED',
    marginHorizontal: 7
  },
  title: {
    fontSize: 16,
    fontFamily: 'Avenir Next',
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7,
    color: '#9b9b9b'
  },
  linkTitle: {
    color: '#2892C6'
  },
  description: {
    fontSize: 16,
    marginVertical: 3,
    marginHorizontal: 7,
    color: '#2E3B4E',
  },
  photo: {
    width: 86,
    height: 86,
    marginLeft: 1,
  },
  icon: {
    width: 40,
    height: 40
  }
});

module.exports = ShowPropertiesView;
