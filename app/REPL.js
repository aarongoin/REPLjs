import React, { Component } from 'react';
import {
	StyleSheet,
	View,
	ScrollView,
	LayoutAnimation,
	Text,
	TouchableWithoutFeedback,
	AppState,
	AsyncStorage,
	RefreshControl
} from 'react-native';
import Sandbox from './Sandbox';
import Tokenizer from './Tokenizer';
import CodeBody from './CodeBody';
import Console from './Console';
import Prompt from './Prompt';

// the REPL (Read-Eval-Print-Loop) acts much like the Console does in browser dev tools. Users can type code and execute it. The code along with any resuting console output is displayed for the user. User-defined state persists until the user drags down from the top to clear the history of the console.
export default class REPL extends Component {
	constructor(props) {
		super(props);

		this.state = {
			inputText: '\0',
			canExecute: false,
			keyboardSpace: 0,
			entries: [],
			willClear: false
		};
		// handle optional props
		this.onExec = props.onExec || (() => {});
		this.global = props.predef || {};
		// initialize the sandbox environment
		this.sandbox = new Sandbox(this.consoleOut.bind(this), this.global);
		this.tokenizer = new Tokenizer();

		
		this.scroll = {
			content: 0,
			height: props.dims.height
		};

		// this array is where REPL console output will be stored
		this._console = [];
		this.appStateListener = this.appStateListener.bind(this);
		AppState.addEventListener('change', this.appStateListener);
	}
	componentWillReceiveProps(props) {
		if (this.state.keyboardSpace > 0) this.setState({keyboardSpace: props.dims.keyboard});
	}

	componentWillUnmount() {
		AppState.removeEventListener('change', this.appStateListener);
	}

	appStateListener(currentAppState) {
		if (currentAppState === 'background') {
			// save entries
			AsyncStorage.multiSet([
				['REPL_entries', JSON.stringify(this.state.entries)],
				['REPL_input', this.state.inputText]
			]);
		} else if (currentAppState === 'active') {
			// retrieve entries
			AsyncStorage.multiGet(['REPL_entries', 'REPL_input'], (err, result) => {
				if (err) {

				} else {
					this.setState({entries: JSON.parse(result[0][1]), inputText: result[1][1]})
				}
			});
		}
	}

	newEntry(body) {
		var i = this.state.entries.length - 1;
		this.state.entries.push({
			index: (i < 0) ? 0 : (this.state.entries[i].index + this.state.entries[i].body.length),
			body: body,
			console: []
		});
		this._console = this.state.entries[++i].console;
		this.forceUpdate();
	}

	consoleOut(consoleObj) {
		this._console.push(consoleObj);
		this.forceUpdate();
	}

	runInSandbox(text) {
		text = text.replace('\0', '');
		this.onExec(this.sandbox.execute(text));
	}

	renderEntries() {
		return this.state.entries.map((entry, i) => (
			<View
				key={'v' + i}
			>
				<CodeBody
					body={entry.body}
					index={entry.index}
				/>
				<Console
					source={entry.console}
					style={styles.console}
				/>
			</View>
		));
	}

	executeButton() {
		return (
			<TouchableWithoutFeedback
				onPress={() => {
					this.newEntry(this.tokenizer.tokenize(this.state.inputText));
					this.runInSandbox(this.state.inputText);
					LayoutAnimation.spring();
					this.setState({ inputText: '\0', canExecute: false })
				}}
				onPressIn={() => { this.setState({ isDown: true }); }}
				onPressOut={() => { this.setState({ isDown: false }); }}
				activeOpacity={1.0}
			>
				<View
					style={[
						styles.gutter,
						{
							backgroundColor: this.state.isDown ? '#cccccc' : '#0076ff',
							width: this.props.dims.width,
						}
					]}
				>
					<Text style={styles.buttonText}>Evaluate</Text>
				</View>
			</TouchableWithoutFeedback>
		);
	}

	scrollToBottom() {
		if (this.scroll.content > this.scroll.height) {
			this.refs.scrollView.scrollTo({y: this.scroll.content - this.scroll.height, animated: true});
		} else {
			this.refs.scrollView.scrollTo({y: 0, animated: true});
		}
	}

	render() {
		return (
			<View
				style={styles.container}
			>
				<ScrollView
					ref={'scrollView'}
					style={{height: this.props.dims.height, backgroundColor: '#111111'}}
					indicatorStyle={'white'}
					onScroll={(e) => {
						this.scroll.content = e.nativeEvent.contentSize.height;
						this.scroll.height = e.nativeEvent.layoutMeasurement.height;
					}}
					keyboardDismissMode={'interactive'}
					onContentSizeChange={(w, height) => {
						this.scroll.content = height;
						this.scrollToBottom();
					}}
					onStartShouldSetResponderCapture={(e) => false}
					onMoveShouldSetResponderCapture={(e) => false}
					scrollEventThrottle={16}
				
					refreshControl={
						<RefreshControl
							enabled={true}
							title='clear all entries'
							titleColor='#cc0066'
							colors={['#cc0066']}
							tintColor='#cc0066'
							progressBackgroundColor='#ffffff'
							style={{backgroundColor: '#ffffff'}}
							refreshing={this.state.willClear}
							onRefresh={() => {
								this.setState({willClear: true});
								this.sandbox.clear();
								this.setState({entries: [], willClear: false});
							}}
						/>
					}
				>
					{(this.state.canExecute) ? (
						<View
							style={{
								backgroundColor: '#555555',
								height: 40
							}} 
						/>
					) : null}
					{this.renderEntries()}
					<Prompt
						text={this.state.inputText}
						gutter='>'
						onFocus={() => {
							this.setState({keyboardSpace: this.props.dims.keyboard});
						}}
						dismissKeyboard={() => {
							this.setState({keyboardSpace: 0});
						}}
						onChangeText={(text) => {
							LayoutAnimation.spring();
							this.setState({
								inputText: text,
								canExecute: (text.match(/\w/))
							});
						}}
					/>
					<View
						style={{flex: 1}}
					/>
					<View
						style={{
							backgroundColor: '#111111',
							height: this.state.keyboardSpace
						}} 
					/>
				</ScrollView>
				{(this.state.canExecute) ? this.executeButton() : null}
				{this.props.children}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'stretch',
		backgroundColor: '#111111'
	},
	buttonText: {
		textAlign: 'center',
		color: '#eeeeee',
		fontSize: 18,
		fontFamily: 'Menlo-Regular'
	},
	console: {
		backgroundColor: '#222222',
		paddingTop: 2,
		width: undefined
	},
	gutter: {
		position: 'absolute',
		top: 0,
		left: 0,
		height: 40,
		justifyContent: 'center'
	}
});