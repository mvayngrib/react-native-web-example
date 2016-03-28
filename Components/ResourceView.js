'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var ShowPropertiesView = require('./ShowPropertiesView');
// var PhotoView = require('./PhotoView');
// var PhotoList = require('./PhotoList');
// var AddNewIdentity = require('./AddNewIdentity');
// var SwitchIdentity = require('./SwitchIdentity');
// var ShowRefList = require('./ShowRefList');
// var IdentitiesList = require('./IdentitiesList');
// var Actions = require('../Actions/Actions');
// var Reflux = require('reflux');
// var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var ResourceViewMixin = require('./ResourceViewMixin');
var QRCode = require('../utils/qrcode')
// var buttonStyles = require('../styles/buttonStyles');

var extend = require('extend');
var constants = require('@tradle/constants');

var {
  StyleSheet,
  ScrollView,
  Image,
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Component
} = React;

class ResourceView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resource: props.resource,
      embedHeight: {height: 0},
      isLoading: props.resource.id ? true : false
    }
  }
  render() {
    if (this.state.isLoading)
      return <View/>
    var resource = this.state.resource;
    var modelName = resource[constants.TYPE];
    var model = utils.getModel(modelName).value;
    var photos = [];
    if (resource.photos  &&  resource.photos.length > 1) {
      extend(photos, resource.photos);
      photos.splice(0, 1);
    }
    var actionPanel;
    var isIdentity = model.id === constants.TYPES.PROFILE;
    var isOrg = model.id === constants.TYPES.ORGANIZATION;
    var me = utils.getMe()
    var isMe = isIdentity ? resource[constants.ROOT_HASH] === me[constants.ROOT_HASH] : true;
    if ((isIdentity  &&  !isMe) || (isOrg  &&  (!me.organization  ||  utils.getId(me.organization) !== utils.getId(resource))))
    // if (isIdentity  &&  !isMe)
      actionPanel = <View/>
    else
      actionPanel = <ShowRefList resource={resource} currency={this.props.currency} navigator={this.props.navigator} />

    // var qrcode = (Object.keys(model.properties).length === 2)
    //            ? <View />
    //            : <View>
    //               <QRCode inline={true} content={resource[constants.ROOT_HASH]} dimension={370} />
    //             </View>

          // <AddNewIdentity resource={resource} navigator={this.props.navigator} />
          // <SwitchIdentity resource={resource} navigator={this.props.navigator} />
    return (
      <ScrollView  ref='this' style={styles.container}>
        <ShowPropertiesView resource={resource}
                            showItems={this.showResources.bind(this)}
                            showRefResource={this.getRefResource.bind(this)}
                            currency={this.props.currency}
                            excludedProperties={['photos']}
                            navigator={this.props.navigator} />
      </ScrollView>
    );
  }

  // getRefResource(resource, prop) {
  //   var model = utils.getModel(this.props.resource[constants.TYPE]).value;

  //   this.state.prop = prop;
  //   this.state.propValue = utils.getId(resource.id);
  //   Actions.getItem(resource.id);
  // }

}
// reactMixin(ResourceView.prototype, Reflux.ListenerMixin);
reactMixin(ResourceView.prototype, ResourceViewMixin);

var styles = StyleSheet.create({
  container: {
    marginTop: 64,
    flex: 1,
  },
  photoBG: {
    backgroundColor: '#245D8C',
    alignItems: 'center',
  },
  // footer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: '#eeeeee',
  //   borderBottomColor: '#eeeeee',
  //   borderRightColor: '#eeeeee',
  //   borderLeftColor: '#eeeeee',
  //   borderWidth: 1,
  //   borderTopColor: '#cccccc',
  //   height: 35,
  //   paddingVertical: 5,
  //   paddingHorizontal: 10,
  //   alignSelf: 'stretch'
  // }

});

module.exports = ResourceView;
