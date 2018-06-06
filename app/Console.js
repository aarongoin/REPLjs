import React, { Component } from 'react';
import {
	StyleSheet,
	Text,
	View
} from 'react-native';

// renders and console output that resulted from user's executed code with special formatting per console output type
export default class Console extends Component {
	constructor(props) {
		super(props);
	}

	renderLogs() {
		var logs = [],
			i = -1;
		while (++i < this.props.source.length) {
			logs.push(
				<Text
					key={i.toString()}
					style={[styles.text, styles[this.props.source[i].method]]}
				>
					{'' + this.props.source[i].arguments}
				</Text>
			);
		}

		return logs;
	}

	render() {
		return (
			<View
				style={this.props.style}
			>
				{this.renderLogs()}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	text: {
		flex: 1,
		marginBottom: 2,
		paddingLeft: 5,
		paddingRight: 5,
		paddingTop: 2,
		paddingBottom: 1,
		borderStyle: 'solid',
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderTopColor: '#000000',
		fontSize: 14,
		fontFamily: 'Menlo-Regular'
	},
	log: {
		color: '#222222',
		backgroundColor: '#cccccc'
	},
	warn: {
		color: '#222222',
		backgroundColor: '#ffee66'
	},
	error: {
		color: '#ffffff',
		fontWeight: '500',
		backgroundColor: '#ee2233'
	}
});