/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Platform,
  Navigator,
} = React;

var t = require('tcomb-form-native')

var Form = t.form.Form;

var Person = t.struct({
  name: t.String,
  surname: t.String
})

var Animal = t.struct({
  dog: t.Boolean
})

var options = {}; // optional rendering options (see documentation)

var ReactNativeWebExample = React.createClass({
  render: function() {
    return (
      <Navigator
        initialRoute={{name: 'Form1', component: Form1}}
        configureScene={() => {
          return Navigator.SceneConfigs.FloatFromRight;
        }}
        renderScene={(route, navigator) => {
            // count the number of func calls
          if (route.component) {
            return React.createElement(route.component, { navigator });
          }
        }}
      />
    );
  }
});

var Form1 = React.createClass({
  render: function () {
    return (
      <View style={styles.container}>
        <Form
          ref="form"
          type={Person}
          options={options}
        />

        <TouchableHighlight style={styles.button} onPress={this.onPress} underlayColor='#99d9f4'>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableHighlight>
      </View>
    )
  },
  onPress: function () {
    this.props.navigator.push({
      name: 'Form2',
      component: Form2
    })
  }
})

var Form2 = React.createClass({
  render: function () {
    return (
      <View style={styles.container}>
        <Form
          ref="form"
          type={Animal}
          options={options}
        />
      </View>
    )
  }
})

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
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
  }
});

AppRegistry.registerComponent('ReactNativeWebExample', () => ReactNativeWebExample);

if (Platform.OS == 'web'){
  var app = document.createElement('div');
  document.body.appendChild(app);

  AppRegistry.runApplication('ReactNativeWebExample', {
    rootTag: app
  })
}
