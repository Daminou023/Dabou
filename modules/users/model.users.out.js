// extracts just the data from the query results
var randomstring = require("randomstring");

var ReturnUser = function (properties) {

    let userProperties = { 
		key:        properties["key"],
        name:       properties["name"],
        sirName:    properties["sirName"],
        mail:       properties["mail"],
        userName:   properties["userName"],
        role:       properties["role"],
        birthday:   properties["birthday"],
        adress:     properties["adress"]
    }; 

    let returnUser = {
        values: userProperties,
        error: false
    }

// RETURN FINAL USER
	return returnUser
}

module.exports = ReturnUser;