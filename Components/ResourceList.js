'use strict';

var React = require('react-native');
// var SearchBar = require('react-native-search-bar'); //('./SearchBar');
// var NoResources = require('./NoResources');
var ResourceRow = require('./ResourceRow');
var ResourceView = require('./ResourceView');
var VerificationRow = require('./VerificationRow');
var NewResource = require('./NewResource');
// var MessageList = require('./MessageList');
// var MessageView = require('./MessageView')
var utils = require('../utils/utils');
var data = require('../data/data')
var translate = utils.translate
var reactMixin = require('react-mixin');
// var Store = require('../Store/Store');
// var Actions = require('../Actions/Actions');
// var Reflux = require('reflux');
var constants = require('@tradle/constants');
var Icon = require('react-native-vector-icons/Ionicons');
// var QRCodeScanner = require('./QRCodeScanner')
// var QRCode = require('./QRCode')
var buttonStyles = require('../styles/buttonStyles');
var bankStyles = require('../styles/bankStyles')
var ENUM = 'tradle.Enum'

var {
  ListView,
  Component,
  StyleSheet,
  Navigator,
  AlertIOS,
  PropTypes,
  TouchableHighlight,
  ActionSheetIOS,
  Image,
  StatusBarIOS,
  View,
  Text
} = React;

class ResourceList extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    modelName: PropTypes.string.isRequired,
    resource: PropTypes.object.isRequired,
    returnRoute: PropTypes.object,
    callback: PropTypes.func,
    filter: PropTypes.string,
    sortProperty: PropTypes.string,
    prop: PropTypes.object,
    isAggregation: PropTypes.bool,
    isRegistration: PropTypes.bool,
  };
  constructor(props) {
    super(props);

    this.state = {
      isLoading: utils.getModels() ? false : true,
      dataSource: new ListView.DataSource({
        rowHasChanged: function(row1, row2) {
          return row1 !== row2
        }
      }),
      filter: this.props.filter,
      userInput: ''
    };

    if (utils.getModel(this.props.modelName).subClassOf == ENUM) {
      let resources = data.getResources()
      let self = this
      let list = resources.filter(function(r) {
        if (r._t === self.props.modelName)
          return true
      })
      this.state.dataSource = this.state.dataSource.cloneWithRows(list)
    }

    var isRegistration = this.props.isRegistration ||  (this.props.resource  &&  this.props.resource[constants.TYPE] === constants.TYPES.PROFILE  &&  !this.props.resource[constants.ROOT_HASH]);
    if (isRegistration)
      this.state.isRegistration = isRegistration;
  }
  // componentWillMount() {
  //   StatusBarIOS.setHidden(false);
  //   var params = {
  //     modelName: this.props.modelName,
  //     to: this.props.resource
  //   };
  //   if (this.props.isAggregation)
  //     params.isAggregation = true;
  //   if (this.props.sortProperty)
  //     params.sortProperty = this.props.sortProperty;
  //   if (this.props.prop)
  //     params.prop = utils.getModel(this.props.resource[constants.TYPE]).value.properties[this.props.prop.name];
  //   if (params.prop) {
  //     let m = utils.getModel(this.props.resource[constants.TYPE]).value
  //     if (m.interfaces) {
  //       if (utils.getModel(this.props.modelName).value.interfaces)
  //         params.to = this.props.resource.to
  //     }
  //   }
  //   // this.state.isLoading = true;
  //   utils.onNextTransitionEnd(this.props.navigator, () => Actions.list(params));
  // }
  // componentDidMount() {
  //   this.listenTo(Store, 'onListUpdate');
  // }

  // onListUpdate(params) {
  //   if (params.error)
  //     return;
  //   var action = params.action;
  //   if (action === 'addItem'  ||  action === 'addMessage') {
  //     var model = action === 'addMessage'
  //               ? utils.getModel(this.props.modelName).value
  //               : utils.getModel(params.resource[constants.TYPE]).value;
  //     if (action === 'addItem'  &&  model.id !== this.props.modelName)
  //       return
  //     if (action === 'addMessage'  &&  this.props.modelName !== constants.TYPES.PROFILE)
  //       return
  //     // this.state.isLoading = true;
  //     Actions.list({
  //       query: this.state.filter,
  //       modelName: model.id,
  //       to: this.props.resource,
  //       sortProperty: model.sort
  //     });

  //     return;
  //   }
  //   if (action === 'talkToEmployee') {
  //     if (!params.to)
  //       return
  //     var route = {
  //       title: params.to.name,
  //       component: MessageList,
  //       id: 11,
  //       backButtonTitle: 'Back',
  //       passProps: {
  //         resource: params.to,
  //         filter: '',
  //         modelName: constants.TYPES.MESSAGE,
  //         currency: params.to.currency,
  //         bankStyle: params.to.bankStyle,
  //         dictionary: params.dictionary
  //       },
  //     }
  //     var me = utils.getMe()
  //     var msg = {
  //       message: me.firstName + ' is waiting for the response',
  //       _t: constants.TYPES.SELF_INTRODUCTION,
  //       identity: params.myIdentity,
  //       from: me,
  //       to: params.to
  //     }
  //     // var sendNotification = (resource.name === 'Rabobank'  &&  (!me.organization  ||  me.organization.name !== 'Rabobank'))
  //     // Actions.addMessage(msg, true, sendNotification)
  //     utils.onNextTransitionEnd(this.props.navigator, () => Actions.addMessage(msg, true))
  //     this.props.navigator.push(route)
  //     return
  //   }
  //   if (action !== 'list' ||  !params.list || params.isAggregation !== this.props.isAggregation)
  //     return;
  //   var list = params.list;
  //   if (!list.length) {
  //    if (!this.state.filter  ||  !this.state.filter.length)
  //      this.setState({
  //        isLoading: false
  //      })
  //     else
  //      this.setState({
  //        isLoading: false,
  //        dataSource: this.state.dataSource.cloneWithRows(list),
  //        list: list
  //      })
  //     return;
  //   }
  //   var type = list[0][constants.TYPE];
  //   if (type  !== this.props.modelName) {
  //     var m = utils.getModel(type).value;
  //     if (!m.subClassOf  ||  m.subClassOf != this.props.modelName)
  //       return;
  //   }
  //   this.setState({
  //     dataSource: this.state.dataSource.cloneWithRows(list),
  //     list: list,
  //     forceUpdate: params.forceUpdate,
  //     dictionary: params.dictionary,
  //     isLoading: false
  //   })
  // }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.forceUpdate)
      return true
    if (!this.state.list && !nextState.list)
      return true
    if (!this.state.list  ||  !nextState.list  ||  this.state.list.length !== nextState.list.length)
      return true
    var isDiff = false
    for (var i=0; i<this.state.list.length  &&  !isDiff; i++) {
      if (this.state.list[i][constants.ROOT_HASH] !== nextState.list[i][constants.ROOT_HASH])
        isDiff = true
    }
    return isDiff
  }

  selectResource(resource) {
    var me = utils.getMe();
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    var model = utils.getModel(this.props.modelName);
    var isIdentity = this.props.modelName === constants.TYPES.PROFILE;
    var isVerification = model.id === constants.TYPES.VERIFICATION
    var isForm = model.id === constants.TYPES.FORM
    var isOrganization = this.props.modelName === constants.TYPES.ORGANIZATION;
    if (!isIdentity         &&
        !isOrganization     &&
        !this.props.callback) {
      var m = utils.getModel(resource[constants.TYPE]);

      if (isVerification || isForm) {
        this.props.navigator.push({
          title: m.title,
          id: 5,
          component: MessageView,
          // titleTextColor: '#7AAAC3',
          backButtonTitle: translate('back'),
          passProps: {resource: resource}
        });
      }
      else {
        var title = utils.makeTitle(utils.getDisplayName(resource, m.properties))
        this.props.navigator.push({
          title: title,
          id: 3,
          component: ResourceView,
          // titleTextColor: '#7AAAC3',
          backButtonTitle: translate('back'),
          rightButtonTitle: translate('edit'),
          onRightButtonPress: {
            title: title,
            id: 4,
            component: NewResource,
            titleTextColor: '#7AAAC3',
            backButtonTitle: translate('back'),
            rightButtonTitle: translate('done'),
            passProps: {
              model: m,
              currency: this.props.currency,
              bankStyle: this.props.bankStyle,
              resource: resource
            }
          },

          passProps: {resource: resource}
        });
      }
      return;
    }
    if (this.props.prop) {
      this._selectResource(resource);
      return;
    }
  }

  _selectResource(resource) {
    var model = utils.getModel(this.props.modelName);
    var title = utils.getDisplayName(resource, model.properties);
    var newTitle = title;
    if (title.length > 20) {
      var t = title.split(' ');
      newTitle = '';
      t.forEach(function(word) {
        if (newTitle.length + word.length > 20)
          return;
        newTitle += newTitle.length ? ' ' + word : word;
      })
    }

    var route = {
      title: utils.makeTitle(newTitle),
      id: 3,
      component: ResourceView,
      parentMeta: model,
      backButtonTitle: translate('back'),
      passProps: {
        resource: resource,
        currency: this.props.currency
      },
    }
    // Edit resource
    // var me = utils.getMe();
    // if ((me || this.state.isRegistration) &&  this.props.prop) {
    //   this.props.callback(this.props.prop, resource); // HACK for now
    //   this.props.navigator.popToRoute(this.props.returnRoute);
    //   return;
    // }
    if (this.props.prop) {
      this.props.callback(this.props.prop, resource); // HACK for now
      this.props.navigator.popToRoute(this.props.returnRoute);

      return;
    }
    if (me                       &&
       !model.isInterface  &&
       (resource[constants.ROOT_HASH] === me[constants.ROOT_HASH]  ||  resource[constants.TYPE] !== constants.TYPES.PROFILE)) {
      var self = this ;
      route.rightButtonTitle = translate('edit')
      route.onRightButtonPress = /*() =>*/ {
        title: translate('edit'),
        id: 4,
        component: NewResource,
        rightButtonTitle: translate('done'),
        titleTextColor: '#7AAAC3',
        passProps: {
          model: utils.getModel(resource[constants.TYPE]),
          currency: this.props.currency,
          bankStyle: this.props.bankStyle,
          resource: me
        }
      };
    }
    this.props.navigator.push(route);
  }
  showRefResources(resource, prop) {
    var props = utils.getModel(resource[constants.TYPE]).properties;
    var propJson = props[prop];
    var resourceTitle = utils.getDisplayName(resource, props);
    resourceTitle = utils.makeTitle(resourceTitle);

    var backlinksTitle = propJson.title + ' - ' + resourceTitle;
    backlinksTitle = utils.makeTitle(backlinksTitle);
    var modelName = propJson.items.ref;

    this.props.navigator.push({
      title: backlinksTitle,
      id: 10,
      component: ResourceList,
      backButtonTitle: translate('back'),
      titleTextColor: '#7AAAC3',
      passProps: {
        resource: resource,
        prop: prop,
        modelName: modelName
      },
      rightButtonTitle: translate('details'),
      onRightButtonPress: {
        title: resourceTitle,
        id: 3,
        component: ResourceView,
        titleTextColor: '#7AAAC3',
        backButtonTitle: translate('back'),
        rightButtonTitle: translate('edit'),
        onRightButtonPress: {
          title: resourceTitle,
          id: 4,
          component: NewResource,
          titleTextColor: '#7AAAC3',
          backButtonTitle: translate('back'),
          rightButtonTitle: translate('done'),
          passProps: {
            model: utils.getModel(resource[constants.TYPE]),
            currency: this.props.currency,
            bankStyle: this.props.bankStyle,
            resource: resource
          }
        },

        passProps: {
          resource: resource,
          currency: this.props.currency
        }
      }
    });
  }

  // onSearchChange(filter) {
  //   this.state.filter = filter
  //   Actions.list({
  //     query: filter,
  //     modelName: this.props.modelName,
  //     to: this.props.resource
  //   });
  // }

  renderRow(resource)  {
    var model = utils.getModel(this.props.modelName);
 // || (model.id === constants.TYPES.FORM)
    var isVerification = model.id === constants.TYPES.VERIFICATION
    var isForm = model.id === constants.TYPES.FORM
    // let hasBacklink = this.props.prop && this.props.prop.items  &&  this.props.prop.backlink
    return /*hasBacklink  &&*/  (isVerification  || isForm || (model.subClassOf  &&  (model.subClassOf === constants.TYPES.VERIFICATION  ||  model.subClassOf === constants.TYPES.FORM)))
    ? (<VerificationRow
        onSelect={() => this.selectResource(isVerification ? resource.document : resource)}
        key={resource[constants.ROOT_HASH]}
        navigator={this.props.navigator}
        prop={this.props.prop}
        currency={this.props.currency}
        isChooser={this.props.isChooser}
        resource={resource} />
      )
    : (<ResourceRow
        onSelect={() => this.selectResource(resource)}
        key={resource[constants.ROOT_HASH]}
        currency={this.props.currency}
        showRefResources={this.showRefResources.bind(this)}
        resource={resource} />
    );
  }
  renderFooter() {
    var me = utils.getMe();
    if (!me  ||  (this.props.prop  &&  (this.props.prop.readOnly || (this.props.prop.items  &&  this.props.prop.items.readOnly))))
      return <View />;
    var model = utils.getModel(this.props.modelName)
    if (model.subClassOf  &&  model.subClassOf === constants.TYPES.FINANCIAL_PRODUCT)
      return <View />
    // var qrInfo = (model.id === constants.TYPES.PROFILE)
    //            ? <View style={styles.row}>
    //                <TouchableHighlight underlayColor='transparent'
    //                   onPress={this.showQRCode.bind(this, 'Contact Info', me[constants.ROOT_HASH])}>
    //                 <View style={{alignSelf: 'center'}}>
    //                   <View style={{marginTop: -12}}>
    //                     <Icon name='ios-barcode'  size={30}  color='#999999' style={styles.icon} />
    //                   </View>
    //                   <View style={{marginTop: -5}}>
    //                     <Text style={[buttonStyles.text, {color:'#999999'}]}>My QR Code</Text>
    //                   </View>
    //                 </View>
    //               </TouchableHighlight>
    //               <TouchableHighlight underlayColor='transparent' onPress={this.scanQRCode.bind(this)}>
    //                 <View style={styles.row}>
    //                   <View style={{marginTop: -5}}>
    //                     <Text style={styles.resourceTitle}>Scan new contact</Text>
    //                   </View>
    //                   <View style={{marginTop: -12}}>
    //                     <Icon name='qr-scanner'  size={30}  color='#999999' style={styles.icon} />
    //                   </View>
    //                 </View>
    //               </TouchableHighlight>
    //             </View>
    //           : <View />

    return (
      <View style={styles.footer}>
        <TouchableHighlight underlayColor='transparent' onPress={this.showMenu.bind(this)}>
          <View style={{marginTop: -10}}>
            <Icon name='plus-circled'  size={55}  color='#ffffff' style={styles.icon} />
          </View>
        </TouchableHighlight>
      </View>
    );
    // return (
    //   <View style={styles.footer}>
    //     <TouchableHighlight underlayColor='transparent' onPress={this.scanQRCode.bind(this)}>
    //       <View style={{marginTop: -10}}>
    //         <Icon name='qrcode'  size={45}  color='#ffffff' style={styles.icon} />
    //       </View>
    //     </TouchableHighlight>
    //   </View>
    // );
  }
  showMenu() {
    var buttons = [translate('addServerUrl')/*, 'Scan QR code'*/, translate('cancel')]
    let allowToAdd = this.props.prop  &&  this.props.prop.allowToAdd
    var buttons = allowToAdd
                ? [translate('add'), translate('addServerUrl')/*, 'Scan QR code'*/, translate('cancel')]
                : [translate('addServerUrl')/*, 'Scan QR code'*/, translate('cancel')]
    var self = this;
    ActionSheetIOS.showActionSheetWithOptions({
      options: buttons,
      // cancelButtonIndex: 2
      cancelButtonIndex: allowToAdd ? 2 : 1
    }, function(buttonIndex) {
      switch (buttonIndex) {
      // case 0:
      //   Actions.talkToRepresentative(self.props.resource)
      //   break
      case 0:
        if (allowToAdd)
          self.addNew()
        else
          self.onSettingsPressed()
        break
      case 1:
        if (allowToAdd)
          self.onSettingsPressed()
        // else
        // self.scanQRCode()
        break;
      default:
        return
      }
    });
  }
  // onSettingsPressed() {
  //   var model = utils.getModel(constants.TYPES.SETTINGS).value
  //   var route = {
  //     component: NewResource,
  //     title: 'Settings',
  //     backButtonTitle: translate('back'),
  //     rightButtonTitle: translate('done'),
  //     id: 4,
  //     titleTextColor: '#7AAAC3',
  //     passProps: {
  //       model: model,
  //       callback: () => {
  //         this.props.navigator.pop()
  //         Actions.list({modelName: this.props.modelName})
  //       }
  //       // callback: this.register.bind(this)
  //     },
  //   }

  //   this.props.navigator.push(route)
  // }

        // <TouchableHighlight underlayColor='transparent' onPress={this.showBanks.bind(this)}>
        //   <View>
        //     <Image source={require('../img/banking.png')} style={styles.image} />
        //   </View>
        // </TouchableHighlight>
      // <View>
        //   <TouchableHighlight underlayColor='transparent' onPress={this.showDeals.bind(this, DEAL_MODEL)}>
        //     <View>
        //       <Icon name='ion|nuclear'  size={30}  color='#999999'  style={styles.icon} />
        //     </View>
        //   </TouchableHighlight>
        // </View>
  showBanks() {
    this.props.navigator.push({
      title: translate('officialAccounts'),
      id: 10,
      component: ResourceList,
      backButtonTitle: translate('back'),
      titleTextColor: '#7AAAC3',
      passProps: {
        modelName: constants.TYPES.ORGANIZATION,
        currency: this.props.currency,
      }
    });
  }
  addNew() {
    var model = utils.getModel(this.props.modelName)
    var r;
    // resource if present is a container resource as for example subreddit for posts or post for comments
    // if to is passed then resources only of this container need to be returned
    if (this.props.resource) {
      var props = model.properties;
      for (var p in props) {
        var isBacklink = props[p].ref  &&  props[p].ref === this.props.resource[constants.TYPE];
        if (props[p].ref  &&  !isBacklink) {
          if (utils.getModel(props[p].ref).isInterface  &&  model.interfaces  &&  model.interfaces.indexOf(props[p].ref) !== -1)
            isBacklink = true;
        }
        if (isBacklink) {
          r = {};
          r[constants.TYPE] = this.props.modelName;
          r[p] = { id: this.props.resource[constants.TYPE] + '_' + this.props.resource[constants.ROOT_HASH] };

          if (this.props.resource.relatedTo  &&  props.relatedTo) // HACK for now for main container
            r.relatedTo = this.props.resource.relatedTo;
        }
      }
    }
    // Setting some property like insured person. The value for it will be another form
    //
    if (this.props.prop  &&  model.subClassOf === constants.TYPES.FORM) {
      if (!r)
        r = {}
      r[constants.TYPE] = this.props.prop.ref;
      r.from = this.props.resource.from
      r.to = this.props.resource.to
    }
    this.props.navigator.push({
      title: model.title,
      id: 4,
      component: NewResource,
      titleTextColor: '#7AAAC3',
      backButtonTitle: translate('back'),
      rightButtonTitle: translate('done'),
      passProps: {
        model: model,
        currency: this.props.currency,
        bankStyle: this.props.bankStyle,
        resource: r,
        // callback: () => Actions.list({
        //   modelName: this.props.modelName,
        //   to: this.props.resource
        // }),
      }
    })
  }
  render() {
    // AlertIOS.alert('Rendering list ' + this.state.isLoading)
    // if (this.state.isLoading)
    //   return <View/>
    var content;
    var model = utils.getModel(this.props.modelName)
    // if (this.state.dataSource.getRowCount() === 0              &&
    //     model.subClassOf !== ENUM                              &&
    //     this.props.modelName !== constants.TYPES.PROFILE       &&
    //     this.props.modelName !== constants.TYPES.VERIFICATION  &&
    //     this.props.modelName !== constants.TYPES.ORGANIZATION  &&
    //     !this.props.isChooser                                  &&
    //     (!model.subClassOf  ||  model.subClassOf !== ENUM)) {
    //   content = <NoResources
    //               filter={this.state.filter}
    //               model={model}
    //               isLoading={this.state.isLoading}/>
    // }
    // else {
      var model = utils.getModel(this.props.modelName)
      content = <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          renderHeader={this.renderHeader.bind(this)}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode='on-drag'
          style={styles.width}
          keyboardShouldPersistTaps={true}
          initialListSize={10}
          pageSize={20}
          scrollRenderAhead={10}
          showsVerticalScrollIndicator={false} />;
    // }
    var model = utils.getModel(this.props.modelName);
    var Footer = this.renderFooter();
    var header = this.renderHeader();
    return (
      <View style={styles.container}>
        {content}
        {Footer}
      </View>
    );
    // return (
    //   <View style={styles.container}>
    //     <SearchBar
    //       onChangeText={this.onSearchChange.bind(this)}
    //       placeholder={translate('search')}
    //       showsCancelButton={false}
    //       hideBackground={true}
    //       />
    //     <View style={styles.separator} />
    //     {content}
    //     {Footer}
    //   </View>
    // );
  }

  renderHeader() {
    return <View />
    // return (this.props.modelName === constants.TYPES.PROFILE)
    //       ? <View style={{padding: 5, backgroundColor: '#CDE4F7'}}>
    //           <TouchableHighlight underlayColor='transparent' onPress={this.showBanks.bind(this)}>
    //             <View style={styles.row}>
    //               <View>
    //                 <Image source={require('../img/banking.png')} style={styles.cellImage} />
    //               </View>
    //               <View style={styles.textContainer}>
    //                 <Text style={styles.resourceTitle}>Official Accounts</Text>
    //               </View>
    //             </View>
    //           </TouchableHighlight>
    //         </View>
    //       : <View />

  }

  // showQRCode1(purpose, content) {
  //   this.props.navigator.push({
  //     title: 'QR Code: ' + purpose,
  //     id: 17,
  //     component: QRCode,
  //     titleTextColor: '#eeeeee',
  //     backButtonTitle: translate('back'),
  //     passProps: {
  //       fullScreen: true,
  //       content: content
  //     }
  //   })
  // }

  scanQRCode() {
    var qrcode = {
      code: '71e4b7cd6c11ab7221537275988f113a879029eb:6aefc09f4da125095409770592eb96ac142fb579'
    }
    // Actions.getEmployeeInfo(qrcode.code)
    return
    // this.props.navigator.push({
    //   title: 'Scan QR Code of contact',
    //   id: 16,
    //   component: QRCodeScanner,
    //   titleTintColor: '#eeeeee',
    //   backButtonTitle: 'Cancel',
    //   // rightButtonTitle: 'ion|ios-reverse-camera',
    //   passProps: {
    //     onread: function (result) {
    //       console.log(result)
    //     }
    //   }
    // })
  }
}
// reactMixin(ResourceList.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    marginTop: 64,
  },
  width: {
   width: 600,
   alignSelf: 'center'
  },
  centerText: {
    alignItems: 'center',
  },
  separator: {
    height: 0,
    backgroundColor: '#cccccc',
  },
  icon: {
    marginLeft: -30,
    marginTop: -25,
    // color: '#629BCA',
    color: 'red'
  },
  image: {
    width: 25,
    height: 25,
    marginRight: 5,
    // color: '#cccccc'
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    height: 45,
    paddingTop: 5,
    paddingHorizontal: 10,
    backgroundColor: '#eeeeee',
    borderBottomColor: '#eeeeee',
    borderRightColor: '#eeeeee',
    borderLeftColor: '#eeeeee',
    borderWidth: 1,
    borderTopColor: '#cccccc',
  },
  row: {
    // backgroundColor: 'white',
    // justifyContent: 'space-around',
    flexDirection: 'row',
    padding: 5,
  },
  textContainer: {
    flex: 1,
  },
  resourceTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 2,
    paddingLeft: 5
  },
  cellImage: {
    // backgroundColor: '#dddddd',
    height: 50,
    marginRight: 10,
    width: 50,
    // borderColor: '#7AAAc3',
    // borderRadius: 30,
    // borderWidth: 1,
  },

});

module.exports = ResourceList;

  // showDeals(modelName) {
  //   var model = utils.getModel(modelName).value;
  //   // var model = utils.getModel(this.props.modelName).value;
  //   this.props.navigator.push({
  //     title: model.title,
  //     id: 10,
  //     component: ResourceList,
  //     titleTextColor: '#7AAAC3',
  //     backButtonTitle: 'Back',
  //     passProps: {
  //       filter: '',
  //       modelName: DEAL_MODEL,
  //     },
  //   })
  // }
  // onSearchChange1(event) {
  //   var filter = event.nativeEvent.text.toLowerCase();
  //   Actions.list({
  //     query: filter,
  //     modelName: this.props.modelName,
  //     to: this.props.resource
  //   });
  // }
