export default class Node {


	static sanitizeName({ name }) {
		return name.toLowerCase()
			.replace(/[!"()]+/g, '') // ASCII removed.
			.replace(/[#$%&'*+,/:;<=>?@[\\\]^_`{|}~\s]+/g, '-') // ASCII replaced.
			.replace(/[æÆ]/g, 'ae').replace(/[øØ]/g, 'o').replace(/[åÅ]/g, 'a') // Norwegian chars.
			.replace(/--+/g, '-') // Two or more dashes becomes just one.
			.replace(/^[-.]+/, '') // Do not begin with - or .
			.replace(/[-.]+$/, ''); // Do not end in - or .
	};


} // default class Node


export const sanitizeNodeName = Node.sanitizeName;
