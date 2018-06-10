var Invitation = function (properties) {

    if (properties == undefined) {
        return {
            error: {
                error: "object syntax error: invitation properties were not given",
                expectedStructure: "[{userKey, status}]"
            }
        }
    }

    let invitationProperties = {
        userKey:                  { value: properties["userKey"]},
        inviteStatus:             { value: properties["inviteStatus"], possibleValues:['accepted', 'rejected', 'pending']}
    }; 

    let returnInvitation = {
        values: {},
        error: false
    }

// CHECK REQUIRED VALUE AND POPULATE INVITATION MODEL
    let unknownProperties = Object.keys(properties).filter((key) => {return !(key in invitationProperties)})
    let missingProperties = [];
    let unauthorizedValues = [];

	for (let property in invitationProperties) {
        if (invitationProperties[property].value == undefined && invitationProperties[property].required) {
            missingProperties.push(property);
        }   
        else if (invitationProperties[property].possibleValues && !invitationProperties[property].possibleValues.includes(invitationProperties[property].value)) {
            unauthorizedValues.push(property)
        }
        else if (invitationProperties[property].value != undefined) {
            returnInvitation.values[property] = invitationProperties[property].value
        }
    }    

// GENERATE MISSING PROPERTY ERROR
    if (missingProperties.length > 0) {
        returnInvitation.error = {
            userKey: 			invitationProperties.userKey.value,
            message:			"sorry, invitation required properties are missing",
            missingProperties:  missingProperties,
            expectations : Object.keys(invitationProperties)
        }
    }

// GENERATE UNAUTHORZED PROPERTY ERROR
if (unauthorizedValues.length > 0) {
    returnInvitation.error = {
        userKey: 			invitationProperties.userKey.value,
        message:			"sorry, invitation contains unauthorized values",
        unauthorizedValues:  unauthorizedValues,
        expectations : Object.keys(invitationProperties)
    }
}    

// GENERATE UNKNOWN PROPERTY ERROR
    if (unknownProperties.length > 0) {
        returnInvitation.error = {
            userKey: 			invitationProperties.userKey.value,
            message:			"sorry, unknown properties",
            unknownProperties:  unknownProperties,
            allowedProperties : Object.keys(invitationProperties)
        }
    }

    return returnInvitation

}

module.exports = Invitation;