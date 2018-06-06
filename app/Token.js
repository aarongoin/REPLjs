import React, { Component } from 'react';
import {
	StyleSheet,
	Text
} from 'react-native';

var needSpaces = [
	"identifier",
	"keyword"
];

// renders token with appropriate style
export default class Token extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<Text
				style={[styles.text, styles[this.props.source[0]]]}
				numberOfLines={1}
			>
				{(this.props.source[0] === 'identifier') ? JSON.parse('"' + this.props.source[1] + '"') : this.props.source[1]}
			</Text>
		);
	}
}

const styles = StyleSheet.create({
	text: {
		fontSize: 14,
		fontFamily: 'Menlo-Regular'
	},
	comment: {
		color: '#cccccc'
	},
	keyword: {
		color: '#cc0066',
		fontWeight: '500'
	},
	identifier: {
		color: '#ffffff'
	},
	literal: {
		color: '#666699',
		fontWeight: '400'
	},
	operator: {
		color: '#cc0066',
		fontWeight: '500'
	},
	punctuator: {
		color: '#ffffff'
	}
});