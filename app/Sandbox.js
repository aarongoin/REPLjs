var deepFreeze = function(obj) {
	'use strict';

	// Retrieve the property names defined on obj
	var propNames = Object.getOwnPropertyNames(obj);

	// Freeze properties before freezing self
	propNames.forEach(function(name) {
		var prop = obj[name];

		// Freeze prop if it is an object
		if (typeof prop === 'object' && prop !== null) deepFreeze(prop);
	});

	// Freeze self (no-op if already frozen)
	return Object.freeze(obj);
};

var stringifyArgs = function(args) {
	'use strict';

	var string = '',
		i = -1;
	while (++i < args.length) {
		string += args[i];
	}
	return string;
};

// Sandbox creates a "safe" space to run code where all existing global variables are frozen (and cannot be modified by malicious code)
// also persists a private global space for users so they can define things in one execution, and then later use them, but keeps them out of the true JS global object
// probably still has security weaknesses. Nothing is safe...
export default class Sandbox {
	constructor(consoleOut, globalObj) {

		var windowKeys = Object.getOwnPropertyNames(window),
			i = -1,
			key;

		this.validGlobals = [
			'Math',
			'Array',
			'ArrayBuffer',
			'Blob',
			'Date',
			'Event',
			'Symbol',
			'CustomEvent',
			'Float32Array',
			'Float64Array',
			'Int8Array',
			'Int16Array',
			'Int32Array',
			'UInt8Array',
			'UInt16Array',
			'UInt32Array',
			'JSON',
			'Promise',
			'Headers',
			'Request',
			'Response',
			'XMLHttpRequest',
			'XMLHttpRequestEventTarget',
			'XMLHttpRequestUpload',
			'String',
			'Function',
			'Infinity',
			'NaN',
			'Number',
			'Object',
			'isNaN',
			'parseFloat',
			'Proxy',
			'parseInt',
			'setImmediate',
			'setInterval',
			'setTimeout',
			'clearImmediate',
			'clearInterval',
			'clearTimeout',
			'weakSet',
			'Set',
			'TextDecoder',
			'TextEncoder',
			'WebSocket',
			'SyntaxError',
			'TypeError',
			'ImageBitmap',
			'ImageData',
			'alert'
		];

		this.global = globalObj || {};
		this.global._vars = {};

		this.spoofed = {identifiers: [], args: [], mask: ''};

		this.consoleOut = consoleOut;
		this.console = {
			log: function() {
				consoleOut({method: 'log', arguments: stringifyArgs(arguments)});
			},
			warn: function() {
				consoleOut({method: 'warn', arguments: stringifyArgs(arguments)});
			},
			error: function() {
				consoleOut({method: 'error', arguments: stringifyArgs(arguments)});
			},
		};
		deepFreeze(this.console);

		this.args = [];
		this.mask = "code, ";

		// build the sandboxed window object and freeze it
		i = -1;
		while (++i < this.validGlobals.length) {
			this.global[this.validGlobals[i]] = window[this.validGlobals[i]];

			this.args.push( this.global[this.validGlobals[i]] );
			this.mask += this.validGlobals[i] + ', ';
		}

		this.args = this.args.concat(this.console, window.eval, this.global, this.global);
		this.mask += "console, eval, self, window, ";

		// mask all properties of window object` that are not in validGlobals
		while(++i < windowKeys.length) {
			key = windowKeys[i];
			if (this.validGlobals.indexOf(key) === -1 && key !== 'console' && key !== 'window' && key !== 'self' && key !== 'eval') {
				this.mask += windowKeys[i];
				if ((i + 1) < windowKeys.length) this.mask += ", ";
			}
		}

		// create the sandbox function
		this.sandbox = this.boxItUp(this.mask);
		Object.freeze(window);
	}

	boxItUp(mask) {
		return new Function(mask, "var REPLRETURN = eval(code); return {arguments: Array.prototype.slice.call(arguments), eval: REPLRETURN};");
	}

	clear() {
		var keys = Object.keys(this.global),
			k;
		while (k = keys.pop()) if (this.validGlobals.indexOf(k) < 0) this.global[k] = undefined;
		this.spoofed = {identifiers: [], args: [], mask: ''};
	}

	spoof(text) {
		// regexp: /(newScope)|(endOfScope)||(string)(varKeyword)|(identifier)|(newVarInDeclaration)|(endOfVarDeclaration)/gm
		var macDaddyRegExp = /([{\[\(])|([}\])])|(".*"|\'.*\')|(var\b)|((?:[$_a-zA-Z]{1}[$_a-zA-Z0-9]*\b)|\\u....\b)|(,)|(;)/gm;
		var body = '',
			match,
			identifiers = [],
			i,
			scope = 0,
			vars = [],
			indices = [],
			current = [0],
			inVar = false;
		while(match = macDaddyRegExp.exec(text)) {
			i = 0;
			while (++i < 8) { // 0 index is the match so we ignore it, 1-6 indices for captured token
				if (match[i] !== undefined) {
					if (i === 1) {
						scope++;
						i = 8;
					}
					else if (i === 2) {
						scope--;
						i = 8;
					} else if (i === 3) {
						i = 8; // ignore strings
					} else if (scope === 0) { // ignore matches found outside of global scope as they are function scope
						switch (i) {
							case 4: // var keyword
								if ((macDaddyRegExp.lastIndex - 3) === 0) {
									current = [];
								} else {
									current.push(macDaddyRegExp.lastIndex - 3);
									indices.push(current);
									current = [];
								}
								inVar = true;
								i = 8;
								break;
							case 5: // identifier
								if (inVar) {
									current.push(macDaddyRegExp.lastIndex - match[5].length);
									identifiers.push(match[5]);
								}
								i = 8;
								break;
							case 6: // end of a var declaration, start of another under same "var"
								if (inVar) {
									current.push(macDaddyRegExp.lastIndex - 1);
									indices.push(current);
									current = [];
								}
								i = 8;
								break;
							case 7: // end of var(s)
								if (inVar) {
									current.push(macDaddyRegExp.lastIndex);
									indices.push(current);
									vars.push(indices);
									indices = [];
									current = [];
									inVar = false;
								}
								i = 8;
								break;
						}
					}
				}
			}
		}
		if (inVar && current.length === 1) {
			current.push(text.length);
			indices.push(current);
			vars.push(indices);
			indices = [];
			current = [];
			inVar = false;
		}
		i = -1;
		while (++i < vars.length) {
			scope = -1; // scope nothing more than iterator here
			// handle each seperate "var" declarion 
			while (++scope < vars[i].length) {
				match = vars[i][scope];
				if (match[1] >= text.length) body += text.substring(match[0]);
				else body += text.substring(match[0], match[1]);
				if (scope > 0) body += '; ';
			}
		}

		// add identifiers to args and mask
		i = -1;
		while (++i < identifiers.length) {
			if (this.spoofed.identifiers.indexOf(identifiers[i]) === -1 && window[identifiers[i]] === undefined) {
				this.spoofed.identifiers.push(identifiers[i]);
				this.spoofed.mask += identifiers[i] + ', ';
				this.spoofed.args.length = this.spoofed.identifiers.length;
			}
		}
		this.sandbox = this.boxItUp(this.spoofed.mask + this.mask);

		return (vars.length) ? body : text;
	}

	execute(code) {
		var args,
			r;

		// spoof persistent global scope (user can execute "var hello = 'hello';" and then later execute "hello" and access the variable)
		code = this.spoof(code);
		args = this.spoofed.args.concat([code]);

		// try executing the code
		try {
			args = args.concat(this.args);
			r = this.sandbox.apply(this.global, args);
			this.console.log(r.eval);
		} catch(error) {

			// hide any spoofed global vars
			//error = error.toString().replace(/this\._vars\./g, '');

			this.consoleOut({method: 'error', arguments: error});
		}

		if (r && r.arguments) {
			this.spoofed.identifiers.forEach( (v, i) => {
				if (this.spoofed) {
					this.spoofed.args[i] = r.arguments[i];
				}
			});
		} 

		return {global: this.global, return: r};
	}
}