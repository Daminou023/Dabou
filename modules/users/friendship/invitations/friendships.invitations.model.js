var FriendshipInvite = function (properties) {


    let friendshipProperties = {
        requestingUserKey:    { value: properties["requestingUserKey"],  required:true },
        choice:               { value: properties["choice"] ,            required:true },
    }; 

    let returnFriendship = {
        values: {},
        error: false
    }

// CHECK REQUIRED VALUE AND POPULATE EVENT MODEL
    let unknownProperties = Object.keys(properties).filter((key) => {return !(key in friendshipProperties)})
    let missingProperties = [];

	for (let property in friendshipProperties) {
        if (friendshipProperties[property].value == undefined && friendshipProperties[property].required) {
            missingProperties.push(property);
        }
        else if (friendshipProperties[property].value != undefined) {
            returnFriendship.values[property] = friendshipProperties[property].value
        }
    }    

// GENERATE MISSING PROPERTY ERROR
    if (missingProperties.length > 0) {
        returnFriendship.error = {
            message:			"sorry, event required properties are missing",
            missingProperties:  missingProperties,
            expectations : Object.keys(friendshipProperties)
        }
    }

// GENERATE UNKNOWN PROPERTY ERROR
    if (unknownProperties.length > 0) {
        returnFriendship.error = {
            message:			"sorry, unknown properties",
            unknownProperties:  unknownProperties,
            allowedProperties : Object.keys(friendshipProperties)
        }
    }

// CHOICE CAN ONLY BE TRUE OR FALSE
    console.log('choice', friendshipProperties.choice)
    if (![true, false].includes(friendshipProperties.choice.value)) {
        returnFriendship.error = {
            message:			"sorry, choice must be either true or false!",
        }
    }

    return returnFriendship

}

module.exports = FriendshipInvite;