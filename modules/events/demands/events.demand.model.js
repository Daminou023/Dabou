var Demand = function (properties) {

    if (properties == undefined) {
        return {
            error: {
                error: "object syntax error: demand properties were not given",
                expectedStructure: "[{userKey, status}]"
            }
        }
    }

    let demandProperties = {
        userKey:                  { value: properties["userKey"]},
        inviteStatus:             { value: properties["inviteStatus"], possibleValues:['accepted', 'rejected', 'pending']}
    }; 

    let returnDemand = {
        values: {},
        error: false
    }

// CHECK REQUIRED VALUE AND POPULATE DEMAND MODEL
    let unknownProperties = Object.keys(properties).filter((key) => {return !(key in demandProperties)})
    let missingProperties = [];
    let unauthorizedValues = [];

	for (let property in demandProperties) {
        if (demandProperties[property].value == undefined && demandProperties[property].required) {
            missingProperties.push(property);
        }   
        else if (demandProperties[property].possibleValues && !demandProperties[property].possibleValues.includes(demandProperties[property].value)) {
            unauthorizedValues.push(property)
        }
        else if (demandProperties[property].value != undefined) {
            returnDemand.values[property] = demandProperties[property].value
        }
    }    

// GENERATE MISSING PROPERTY ERROR
    if (missingProperties.length > 0) {
        returnDemand.error = {
            userKey: 			demandProperties.userKey.value,
            message:			"sorry, demand required properties are missing",
            missingProperties:  missingProperties,
            expectations : Object.keys(demandProperties)
        }
    }

// GENERATE UNAUTHORZED PROPERTY ERROR
if (unauthorizedValues.length > 0) {
    returnDemand.error = {
        userKey: 			demandProperties.userKey.value,
        message:			"sorry, demand contains unauthorized values",
        unauthorizedValues:  unauthorizedValues,
        expectations : Object.keys(demandProperties)
    }
}    

// GENERATE UNKNOWN PROPERTY ERROR
    if (unknownProperties.length > 0) {
        returnDemand.error = {
            userKey: 			demandProperties.userKey.value,
            message:			"sorry, unknown properties",
            unknownProperties:  unknownProperties,
            allowedProperties : Object.keys(demandProperties)
        }
    }

    return returnDemand

}

module.exports = Demand;