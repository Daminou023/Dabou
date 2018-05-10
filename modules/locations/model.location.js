var Location = function (properties) {

    let locationProperties = {
        key:        { value: properties["key"] },
        country:    { value: properties["country"],     required:true },
        city:       { value: properties["city"],        required:true },
        zipCode:    { value: properties["zipCode"],     required:true },
        street:     { value: properties["street"],      required:true },
        number:     { value: properties["number"],      required:true },
        box:        { value: properties["box"] }
    }; 


    let returnLocation = {
        values: {},
        error: false
    }

// CHECK REQUIRED VALUE AND POPULATE LOCATION MODEL
    let unknownProperties = Object.keys(properties).filter((key) => {return !(key in locationProperties)})
    let missingProperties = [];

	for (let property in locationProperties) {
        if (locationProperties[property].value == undefined && locationProperties[property].required) {
            missingProperties.push(property);
        }
        else if (locationProperties[property].value != undefined) {
            returnLocation.values[property] = locationProperties[property].value
        }
    }    

// GENERATE MISSING PROPERTY ERROR
    if (missingProperties.length > 0) {
        returnLocation.error = {
            locationKey: 			locationProperties.key.value,
            message:			"sorry, location required properties are missing",
            missingProperties:  missingProperties,
            expectations : Object.keys(locationProperties)
        }
    }

// GENERATE UNKNOWN PROPERTY ERROR
    if (unknownProperties.length > 0) {
        returnLocation.error = {
            locationKey: 		locationProperties.key.value,
            message:			"sorry, unknown properties",
            unknownProperties:  unknownProperties,
            allowedProperties : Object.keys(locationProperties)
        }
    }

    return returnLocation

}

module.exports = Location;