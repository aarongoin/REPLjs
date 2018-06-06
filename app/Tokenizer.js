var tokenNames = [
	'spacer',		// 0
	'comment',		// 1
	'punctuator',	// 2
	'keyword',		// 3
	'identifier',	// 4
	'literal',		// 5
	'operator',		// 6
	'newline'		// 7
],
	tokenTypes = {
	spacer: [
		'[ \\f\\t\\v\\u00a0\\u1680\\u180e\\u2000-\\u200a\\u202f\\u205f\\u3000\\ufeff]+'
	],
	keyword: [
		'await\\b',
		'break\\b',
		'case\\b',
		'class\\b',
		'catch\\b',
		'const\\b',
		'continue\\b',
		'debugger\\b',
		'default\\b',
		'delete\\b',
		'do\\b',
		'else\\b',
		'enum\\b',
		'export\\b',
		'extends\\b',
		'finally\\b',
		'for\\b',
		'function\\b',
		'if\\b',
		'implements\\b',
		'import\\b',
		'in\\b',
		'instanceof\\b',
		'interface\\b',
		'let\\b',
		'new\\b',
		'package\\b',
		'private\\b',
		'protected\\b',
		'public\\b',
		'return\\b',
		'static\\b',
		'super\\b',
		'switch\\b',
		'this\\b',
		'throw\\b',
		'try\\b',
		'typeof\\b',
		'var\\b',
		'void\\b',
		'while\\b',
		'with\\b',
		'yield\\b'
	],
	literal: [
		'undefined\\b',
		'null\\b',
		// boolean
		'true\\b', 'false\\b',
		// number
		'[0-9]+',
		// strings
		'".*"', '\'.*\''
	],
	identifier: [
		'[$_a-zA-Z]{1}[$_a-zA-Z0-9]*\\b',
		'\\\\u....\\b'
	],
	operator: [
		'=>',
		// assignment
		'\\+=', '-=', '\\*=', '/=', '%=', '\\*\\*=', '<<=', '>>=', '>>>=', '&=', '\\^=', '\\|=',
		// logical
		'&&', '\\|\\|',
		// bitwise
		'>>>', '>>', '<<', '&', '\\|', '\\^', '~',
		// comparison
		'===', '==', '!==', '!=', '>=', '>', '<=', '<',
		// arithmetic
		'\\+\\+', '\\+', '--', '-', '\\*\\*', '\\*', '%', 
		'=',
		'!',
		'\\+',
		'-',
		':',
		'\\?',
		'\\*',
		'/'
	],
	punctuator: [
		// braces
		'\\{', '\\}',
		// brackets 
		'\\[', '\\]',
		// parethesis
		'\\(', '\\)',
		// semicolon
		';',
		// dot accessor
		'\\.',
		// comma
		','
	],
	comment: [
		'\\/\\/.*$', // line comment
		'\\/\\*(?:.|\\s)*\\*\\/' // block comment
	],
	newline: [
		'[\\n\\r\\u2028\\u2029]'
	]
};

export default class Tokenizer {
	constructor() {
		var regexString = '',
			i = -1;

		this.types = [];

		while (++i < tokenNames.length) {
			regexString += '(' + tokenTypes[ tokenNames[i] ].join('|') + ')';
			if (i + 1 < tokenNames.length) regexString += '|';
		}

		this.regexp = new RegExp(regexString, 'gm');
	}

	tokenize(input) {
		var body = [],
			line = [],
			match,
			i;

		this.regexp.lastIndex = 0;

		while (match = this.regexp.exec(input)) {
			i = 0;
			while (++i < 9) { // 0 index is the match so we ignore it, 1-8 indices for captured token
				if (match[i] !== undefined) {
					if (i === 8) { // 8 index is the newline token
						body.push(line);
						line = [];
					} else {
						line.push([ tokenNames[i - 1], match[i] ]);
					}
				}
			}
		}
		body.push(line);
		return body;
	}
}