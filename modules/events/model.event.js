var Event = function (properties) {

    if (properties == undefined) {
        return {
            error: {
                error: "object syntax error: event properties were not given",
                expectedStructure: "{ properties: {}, links: {}}"
            }
        }
    }

    let eventProperties = {
        
        key:                    { value: properties["key"] },
        title:                  { value: properties["title"] ,              required:true },
        description:            { value: properties["description"],         required:true },
        minParticipants:        { value: properties["minParticipants"],     required:true },
        maxParticipants:        { value: properties["maxParticipants"],     required:true },
        length:                 { value: properties["length"],              required:true }, 
        photo:                  { value: properties["photo"] }, 
        type:                   { value: properties["type"],                required:true }
    }; 

    let returnEvent = {
        values: {},
        error: false
    }

// CHECK REQUIRED VALUE AND POPULATE EVENT MODEL
    let unknownProperties = Object.keys(properties).filter((key) => {return !(key in eventProperties)})
    let missingProperties = [];

	for (let property in eventProperties) {
        if (eventProperties[property].value == undefined && eventProperties[property].required) {
            missingProperties.push(property);
        }
        else if (eventProperties[property].value != undefined) {
            returnEvent.values[property] = eventProperties[property].value
        }
    }    

// GENERATE MISSING PROPERTY ERROR
    if (missingProperties.length > 0) {
        returnEvent.error = {
            eventKey: 			eventProperties.key.value,
            message:			"sorry, event required properties are missing",
            missingProperties:  missingProperties,
            expectations : Object.keys(eventProperties)
        }
    }

// GENERATE UNKNOWN PROPERTY ERROR
    if (unknownProperties.length > 0) {
        returnEvent.error = {
            eventKey: 			eventProperties.key.value,
            message:			"sorry, unknown properties",
            unknownProperties:  unknownProperties,
            allowedProperties : Object.keys(eventProperties)
        }
    }

    return returnEvent

}

module.exports = Event;