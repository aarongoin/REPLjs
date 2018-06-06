import React, { Component } from 'react';
import {
	StyleSheet,
	View,
	Text,
} from 'react-native';
import Token  from './Token';

// renders the executed code colored and styled
export default class CodeBody extends Component {
	constructor(props) {
		super(props);
	}

	renderRow(tokens, rowID) {
		return (
			<View
				style={styles.container}
				key={rowID}
			>
				<Text
					style={styles.gutter}
				>
					{rowID}
				</Text>
				<Text
					style={{paddingLeft: 1, flex: 1, color: '#ffffff', backgroundColor: '#333333'}}
				>
					{tokens.map((token, i) => <Token key={i} source={token} />)}
				</Text>
			</View>
		);
	}

	render() {
		return (
			<View
				style={{paddingTop: 2, backgroundColor: '#222222'}}
			>
				{this.props.body.map((row, i) => this.renderRow(row, (this.props.index + i)))}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'stretch',
		backgroundColor: '#222222'
	},
	gutter: {
		paddingTop: 1.5,
		width: 24,
		backgroundColor: '#222222',
		textAlign: 'center',
		color: '#999999',
		fontSize: 8
	}
});