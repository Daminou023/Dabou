// extracts just the data from the query results
var randomstring = require("randomstring");

var ReturnUser = function (properties) {

    let userProperties = { 

		key:        properties["key"],
        name:       properties["name"],
        sirName:    properties["sirName"]
    }; 

    let returnUser = {
        values: userProperties,
        error: false
    }

// RETURN FINAL USER
	return returnUser
}

module.exports = ReturnUser;