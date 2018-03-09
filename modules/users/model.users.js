// extracts just the data from the query results
var randomstring = require("randomstring");

var User = function (properties) {

	this.key 		= properties.key;
	this.name 		= properties.name;
	this.sirName 	= properties.sirName;
	this.mail 		= properties.mail;
	this.userName 	= properties.userName;
	this.passWord 	= properties.passWord;
	this.role 		= properties.role;


	for (var property in this) {
		if (this[property] === undefined) {
			
			// if we forget theare creating a new user
			if(this.key === undefined) {			
				this.incomplete = true;
			}
			// if we are not creating a new user
			else {
				delete this[property];
			}
		}
	}

}

module.exports = User;