import React, { Component } from 'react';
import {
	StyleSheet,
	Text,
	View,
	TextInput
} from 'react-native';

// renders code text input box with line numbers in a gutter
export default class Prompt extends Component {
	constructor(props) {
		super(props);
	}

	onChangeText(textBody) {
		this.props.onChangeText(textBody);
	}

	render() {
		var height = this.props.text.split(/\r\n|\r|\n/).length * 16.5 + 13.5;
		return (
			<View
				style={[styles.container, {height: height + 10}]}
			>
				<View
					style={[styles.gutter, {height: height}]}
				>
					<Text
						style={styles.gutterText}
					>
						{this.props.gutter}
					</Text>
				</View>
				<TextInput
					autoCorrect={false}
					autoCapitalize={'none'}
					onFocus={this.props.onFocus}
					onChangeText={this.onChangeText.bind(this)}
					onEndEditing={this.props.dismissKeyboard}
					defaultValue={'\0'}
					value={this.props.text}
					maxLength={1000}
					multiline={true}
					style={[styles.input, {height: height}]}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'stretch',
		backgroundColor: '#222222',
		borderTopColor: '#cccccc',
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderBottomColor: '#cccccc',
		paddingTop: 5,
		paddingBottom: 5
		
	},
	gutter: {
		justifyContent: 'center',
		alignItems: 'stretch',
		backgroundColor: '#222222',
		width: 32
	},
	gutterText: {
		width: 32,
		textAlign: 'center',
		color: '#eeeeee',
		fontSize: 18,
		fontFamily: 'Menlo-Regular'
	},
	input: {
		flex: 1,
		paddingTop: 2,
		backgroundColor: '#222222',
		color: '#eeeeee',
		fontSize: 14,
		fontFamily: 'Menlo-Regular'
	}
});