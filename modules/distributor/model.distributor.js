var Distributor = function (properties) {

    let distributorProperties = {
        key:                    { value: properties["key"] },
        name:                   { value: properties["name"] ,    required:true },
        description:            { value: properties["description"] }
    }; 

    let returnDistributor = {
        values: {},
        error: false
    }

// CHECK REQUIRED VALUE AND POPULATE Distributor MODEL
    let unknownProperties = Object.keys(properties).filter((key) => {return !(key in distributorProperties)})
    let missingProperties = [];

	for (let property in distributorProperties) {
        if (distributorProperties[property].value == undefined && distributorProperties[property].required) {
            missingProperties.push(property);
        }
        else if (distributorProperties[property].value != undefined) {
            returnDistributor.values[property] = distributorProperties[property].value
        }
    }    

// GENERATE MISSING PROPERTY ERROR
    if (missingProperties.length > 0) {
        returnDistributor.error = {
            editorKey:		distributorProperties.key.value,
            message:			"sorry, Distributor required properties are missing",
            missingProperties:  missingProperties,
            expectations : Object.keys(distributorProperties)
        }
    }

// GENERATE UNKNOWN PROPERTY ERROR
    if (unknownProperties.length > 0) {
        returnDistributor.error = {
            editorKey:		distributorProperties.key.value,
            message:			"sorry, unknown properties",
            unknownProperties:  unknownProperties,
            allowedProperties : Object.keys(distributorProperties)
        }
    }

    return returnDistributor

}

module.exports = Distributor;