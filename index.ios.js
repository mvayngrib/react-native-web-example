/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

import 'whatwg-fetch'
var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  Platform,
  Navigator,
  Component
} = React;

var t = require('tcomb-form-native')
var voc = require('@tradle/models')
var formDefaults = require('@tradle/models').formDefaults

var utils = require('./utils/utils')
var translate = utils.translate
var NewResource = require('./Components/NewResource')
var NewItem = require('./Components/NewItem')
var ResourceList = require('./Components/ResourceList')
var Form = t.form.Form;
var EnumList = require('./Components/EnumList')
var QRCodeView = require('./Components/QRCodeView')
var Person = t.struct({
  name: t.String,
  surname: t.String
})

var Animal = t.struct({
  dog: t.Boolean
})
var models = voc
var options = {}; // optional rendering options (see documentation)
if (!('__DEV__' in window)) window.__DEV__ = false

class ReactNativeWebExample extends Component {
  render() {
    utils.setModels(voc)

    let product = utils.firstKey(window.Tradle.provider.products)
    let forms = window.Tradle.provider.products[product]
    if (forms.indexOf('tradle.MortgageDetail') !== -1 || forms.indexOf('tradle.ORV') !== -1) {
      // hack for mortgage to not ask for personal info
      const piIdx = forms.indexOf('tradle.PersonalInfo')
      if (piIdx !== -1) {
        forms.splice(piIdx, 1)
      }
    }

    // let m = utils.getModel(product)
    // forms = m.forms
    let route = {
      component: NewResource,
      rightButtonTitle: translate('done'),
      title: translate('pleaseFillOutTheForm', translate(utils.getModel(forms[0]))),
      id: 4,
      passProps: {
        product: product,
        model: utils.getModel(forms[0]),
        forms: [],
        bankStyle: window.Tradle.provider.style,
        currency: window.Tradle.provider.org.currency
      }
    }
    if (__DEV__  &&  formDefaults[forms[0]])
      route.passProps.resource = formDefaults[forms[0]]

    let style = window.Tradle.provider.style
    return (
      <Navigator
        initialRoute={route}
        configureScene={(route) => {
          if (route.sceneConfig)
            return route.sceneConfig;
          return {...Navigator.SceneConfigs.FloatFromRight, springFriction:26, springTension:200};
        }}
        renderScene={this.renderScene.bind(this)}
        navigationBar={
          <Navigator.NavigationBar
            routeMapper={NavigationBarRouteMapper}
            style={[styles.navBar, style ? {backgroundColor: style.STRUCTURED_MESSAGE_COLOR, borderBottomColor: style.LINK_COLOR} : {backgroundColor: '#f7f7f7'}]}
          />
        }
      />
    );
  }
        // renderScene={(route, navigator) => {
        //     // count the number of func calls
        //   if (route.component) {
        //     return React.createElement(route.component, { navigator });
        //   }
        // }}

  renderScene(route, nav) {
    var props = route.passProps;
    if (this.state  &&  !this.state.navigator) {
      this._navListeners = [
        nav.navigationContext.addListener('willfocus', this.onNavigatorBeforeTransition),
        nav.navigationContext.addListener('didfocus', this.onNavigatorAfterTransition)
      ]

      this.state.navigator = nav;
    }

    switch (route.id) {
    case 4:
      return <NewResource navigator={nav} {...props } />
    case 6:
      return <NewItem navigator={nav} {...props } />
    case 22:
      return <EnumList navigator={nav} { ...props } />
    case 23:
      return <QRCodeView navigator={nav} { ...props } />
    case 10:
    default: // 10
      return <ResourceList navigator={nav} {...props} />;
    }
  }
}

var NavigationBarRouteMapper = {
  LeftButton: function(route, navigator, index, navState) {
    if (!route.backButtonTitle || route.noLeftButton)
      return null;

    var color = '#7AAAC3'
    if (route.passProps.bankStyle  &&  route.passProps.bankStyle.LINK_COLOR)
      color = route.passProps.bankStyle.LINK_COLOR

    var previousRoute = navState.routeStack[index - 1];
    var lbTitle = 'backButtonTitle' in route ? route.backButtonTitle : previousRoute.title;
    if (!lbTitle)
      return null;

    var style = [styles.navBarText];
    if (route.tintColor)
      style.push(route.tintColor);
    else {
      style.push(styles.navBarButtonText);
      var st = {color: color}
      style.push(st);
    }

    var title = lbTitle.indexOf('|') == -1
              ?  <Text style={style}>
                    {lbTitle}
                 </Text>
              : <Icon name={lbTitle.substring(4)} size={20} color='#7AAAC3' style={styles.icon}/>;
    // if (route.component === ResourceList  &&  index === 1)
    //   Actions.cleanup()

    return (
      <TouchableOpacity
        onPress={() => route.onLeftButtonPress ? navigator.replace(route.onLeftButtonPress) : navigator.pop()}>
        <View style={styles.navBarLeftButton}>
          {title}
        </View>
      </TouchableOpacity>
    );
  },

  RightButton: function(route, navigator, index, navState) {
    if (!route.rightButtonTitle)
      return <View/>
    var style = [styles.navBarText, styles.navBarButtonText];
    if (route.tintColor)
      style.push({color: route.tintColor});
    else if (route.passProps.bankStyle)
      style.push({color: route.passProps.bankStyle.LINK_COLOR || '#7AAAC3'})
    var title = route.rightButtonTitle.indexOf('|') == -1
              ?  <Text style={style}>
                    {route.rightButtonTitle}
                 </Text>
              : <Icon name={route.rightButtonTitle.substring(4)} size={20} color='#7AAAC3' style={styles.icon}/>;

    return (
      <TouchableOpacity
        onPress={() => {
                  // 'Done' button case for creating new resources
                  if (typeof route.onRightButtonPress === 'function') {
                    route.onRightButtonPress()
                  }
                  else if (route.onRightButtonPress.stateChange) {
                    if (route.onRightButtonPress.before)
                      route.onRightButtonPress.before();
                    route.onRightButtonPress.stateChange();
                    if (route.onRightButtonPress.after)
                      route.onRightButtonPress.after();
                  }
                  else
                    navigator.push(route.onRightButtonPress)
               }
        }>
        <View style={styles.navBarRightButton}>
          {title}
        </View>
      </TouchableOpacity>
    );
  },

  Title: function(route, navigator, index, navState) {
    var org;
    var style = [styles.navBarText, styles.navBarTitleText];
    if (route.passProps.modelName) {
      if (route.passProps.modelName === 'tradle.Message') {
        if (route.passProps.resource  &&  route.passProps.resource[constants.TYPE] === constants.TYPES.PROFILE) {
          // if (route.passProps.resource.organization  &&  route.passProps.resource.organization.photo)
          //   org = <Image source={{uri: route.passProps.resource.organization.photo}} style={styles.orgImage} />
          if (route.passProps.resource.organization)
            org = <Text style={style}> - {route.passProps.resource.organization.title}</Text>
        }
      }
    }
    if (!org)
      org = <View />;
    if (route.titleTextColor)
      style.push({color: route.titleTextColor});
    else
      style.push(window.Tradle.provider.style ? {color: window.Tradle.provider.style.NAV_TITLE} : {color: '#2E3B4E'})
    return (
      <View style={{flexDirection: 'row', flex: 1}}>
        <Text style={style}>
          {route.title}
        </Text>
        {org}
      </View>
    );
  },

};


// var Form1 = React.createClass({
//   render: function () {
//     return (
//       <View style={styles.container}>
//         <Form
//           ref="form"
//           type={Person}
//           options={options}
//         />

//         <TouchableHighlight style={styles.button} onPress={this.onPress} underlayColor='#99d9f4'>
//           <Text style={styles.buttonText}>Next</Text>
//         </TouchableHighlight>
//       </View>
//     )
//   },
//   onPress: function () {
//     this.props.navigator.push({
//       name: 'Form2',
//       component: Form2
//     })
//   }
// })

// var Form2 = React.createClass({
//   render: function () {
//     return (
//       <View style={styles.container}>
//         <Form
//           ref="form"
//           type={Animal}
//           options={options}
//         />
//       </View>
//     )
//   }
// })

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  button: {
    color: '#dfaabc'
  },
  navBar: {
    // marginTop: 10,
    padding: 3,
    borderColor: '#ffffff',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 0.5,
    backgroundColor: '#f7f7f7'
  },
  navBarText: {
    fontSize: 16,
    // marginBottom: 7
  },
  navBarTitleText: {
    color: '#2E3B4E',
    fontWeight: '400',
    fontSize: 17,
  },
  navBarLeftButton: {
    paddingLeft: 15,
    paddingRight: 25,
    // paddingBottom: 10
  },
  navBarRightButton: {
    paddingLeft: 25,
    paddingRight: 15,
    // paddingBottom: 10
  },
  navBarButtonText: {
    color: '#7AAAC3',
  },
});


AppRegistry.registerComponent('ReactNativeWebExample', () => ReactNativeWebExample);

if (Platform.OS == 'web') {
  var app = document.createElement('div');
  document.body.appendChild(app);

  AppRegistry.runApplication('ReactNativeWebExample', {
    rootTag: app
  })
}
