'use strict';

var React = require('react-native');
var qrcode = require('../utils/qrcode')

var {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Component
} = React;

class QRCodeView extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    var code = qrcode(this.props.qrcode, {
      width: 300,
      height: 300,
      foreground: this.props.bankStyle.STRUCTURED_MESSAGE_COLOR
    })

    return (
      <View  ref='this' style={styles.container}>
        <View style={{position: 'absolute', top: 20, left: 20}}>
          <Image source={{uri: 'http://tradle.io/images/scan-qr-tutorial1.gif'}} style={{width: 300}} />
        </View>
        <View style={{left: (Dimensions.get('window').width/2) - 150, position: 'absolute', top: 20}}>
          {code}
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    marginTop: 64,
    flexDirection: 'row',
    // alignSelf: 'center',
    // flex: 1,
  },
});

module.exports = QRCodeView;
