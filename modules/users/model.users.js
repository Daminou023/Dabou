// extracts just the data from the query results
var randomstring = require("randomstring");

var User = function (properties) {

    let userProperties = { 

		key:        { value: properties["key"] },
        name:       { value: properties["name"] , 		required:true },
        sirName:    { value: properties["sirName"], 	required:true },
        mail:       { value: properties["mail"], 		required:true },
        userName:   { value: properties["userName"], 	required:true },
        passWord:   { value: properties["passWord"], 	required:true },
        role:       { value: properties["role"], 		required:true }

    }; 

    let returnUser = {
        values: {},
        error: false
    }

// CHECK REQUIRED VALUE AND POPULATE USER MODEL
    let unknownProperties = Object.keys(properties).filter((key) => {return !(key in userProperties)})
    let missingProperties = [];

	for (let property in userProperties) {
        if (userProperties[property].value == undefined && userProperties[property].required) {
            missingProperties.push(property);
        }
        else if (userProperties[property].value != undefined) {
            returnUser.values[property] = userProperties[property].value
        }
    }    

// GENERATE MISSING PROPERTY ERROR
    if (missingProperties.length > 0) {
        returnUser.error = {
            userKey: 			userProperties.key.value,
            message:			"sorry, user required properties are missing",
            missingProperties:  missingProperties,
            expectations : Object.keys(userProperties)
        }
    }

// GENERATE UNKNOWN PROPERTY ERROR
    if (unknownProperties.length > 0) {
        returnUser.error = {
            userKey: 			userProperties.key.value,
            message:			"sorry, unknown properties",
            unknownProperties:  unknownProperties,
            allowedProperties : Object.keys(userProperties)
        }
    }

// RETURN FINAL USER
	return returnUser
}

module.exports = User;