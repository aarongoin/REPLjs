import React, { Component } from 'react';
import {
  Platform,
	StyleSheet,
	ActionSheetIOS,
  Text,
	View,
	AsyncStorage,
	Dimensions,
	LayoutAnimation
} from 'react-native';
import REPL from './app/REPL';
// import Orientation from 'react-native-orientation';
// import RNShakeEventIOS from 'react-native-shake-event-ios';
// import { BlurView } from 'react-native-blur';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component<{}> {
  constructor(props) {
    super(props);

    this.state = {
			orientation: 'PORTRAIT',
			statusBar: true,
			blur: false
		};

		// Orientation.getOrientation((orientation, device) => {
		// 	orientation = (orientation === 'UNKNOWN') ? this.state.orientation : orientation;
		// 	this.setState({ orientation, device });
		// });

		// this._setOrientation = this.setOrientation.bind(this);
		// Orientation.addOrientationListener(this._setOrientation);
		// RNShakeEventIOS.addEventListener('shake', () => { 
		// 	if (this.state.blur) return;
		// 	LayoutAnimation.linear();   
		// 	this.setState({blur: true})
		// 	ActionSheetIOS.showActionSheetWithOptions({
		// 		options: ['Settings', 'Cancel'],
		// 		cancelButtonIndex: 1
		// 	},
		// 	(buttonIndex) => {
		// 		LayoutAnimation.linear(); 
		// 		this.setState({blur: false});
		// 	}
		// 	);
    // });
    console.log('Hello from App');
  }

  setOrientation({ orientation, device }) {
		orientation = (orientation === 'UNKNOWN') ? this.state.orientation : orientation;
		this.setState({ orientation, device , statusBar: (orientation === 'PORTRAIT' || device === 'iPad')});
	}

	componentWillUnmount() {
		// Orientation.removeOrientationListener(this._setOrientation);
		// RNShakeEventIOS.removeEventListener('shake');
	}

	getKeyboardForDevice() {
	var dims = Dimensions.get('window');
		switch (dims.height) {
			case 480: // iPhone 4
				return (this.state.orientation === 'PORTRAIT') ? 216 : 162;
			case 568: // iPhone 5
				return (this.state.orientation === 'PORTRAIT') ? 216 : 162;
			case 667: // iPhone 6
				return (this.state.orientation === 'PORTRAIT') ? 216 : 162;
			case 736: // iPhone 6 Plus
				return (this.state.orientation === 'PORTRAIT') ? 226 : 162;
			case 1024: // iPad 2/Mini/Air
				return (this.state.orientation === 'PORTRAIT') ? 312 : 398;
			case 1366: // iPad Pro
        return (this.state.orientation === 'PORTRAIT') ? 370 : 458;
		}
	}

  render() {
    var windowDimensions = Dimensions.get('window'),
    style = {
      width: (this.state.orientation === 'PORTRAIT') ? windowDimensions.width : windowDimensions.height, 
      height: (this.state.orientation === 'PORTRAIT') ? windowDimensions.height : windowDimensions.width
    };
    return (
      <View
        style={[
          styles.container,
          style
        ]}
      >
        {(this.state.statusBar) ? (<View style={styles.topbar} />) : null}
        <REPL
          dims={{
            width: style.width,
            height: (this.state.statusBar) ? (style.height - 20) : style.height,
            keyboard: this.getKeyboardForDevice()
          }}
        >
          {this.state.blur ? (<BlurView blurType='light' style={[styles.blur, {width: style.width, height: (this.state.statusBar ? (style.height - 20) : style.height)}]}/>) : null}
        </REPL>
      </View>
    );
  }
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'stretch',
		backgroundColor: '#111111',
	},
	topbar: {
		height: 20,
		backgroundColor:'#ffffff'
	},
	blur: {
		position: 'absolute',
		left: 0,
		bottom: 0,
		backgroundColor: 'transparent'
	}
});
