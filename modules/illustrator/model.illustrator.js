var Illustrator = function (properties) {

    let illustratorProperties = {
        key:                    { value: properties["key"] },
        name:                   { value: properties["name"] , required:true },
        sirName:                { value: properties["sirName"] , required:true },
        description:            { value: properties["description"] }
    }; 

    let returnIllustrator = {
        values: {},
        error: false
    }

// CHECK REQUIRED VALUE AND POPULATE ILLUSTRATOR MODEL
    let unknownProperties = Object.keys(properties).filter((key) => {return !(key in illustratorProperties)})
    let missingProperties = [];

	for (let property in illustratorProperties) {
        if (illustratorProperties[property].value == undefined && illustratorProperties[property].required) {
            missingProperties.push(property);
        }
        else if (illustratorProperties[property].value != undefined) {
            returnIllustrator.values[property] = illustratorProperties[property].value
        }
    }    

// GENERATE MISSING PROPERTY ERROR
    if (missingProperties.length > 0) {
        returnIllustrator.error = {
            illustratorKey:		illustratorProperties.key.value,
            message:			"sorry, illustrator required properties are missing",
            missingProperties:  missingProperties,
            expectations : Object.keys(illustratorProperties)
        }
    }

// GENERATE UNKNOWN PROPERTY ERROR
    if (unknownProperties.length > 0) {
        returnIllustrator.error = {
            illustratorKey:		illustratorProperties.key.value,
            message:			"sorry, unknown properties",
            unknownProperties:  unknownProperties,
            allowedProperties : Object.keys(illustratorProperties)
        }
    }

    return returnIllustrator

}

module.exports = Illustrator;