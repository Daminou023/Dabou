var ReturnEvent = function (properties) {

    let eventProperties = {
        
        key:                    properties["key"],
        title:                  properties["title"],
        description:            properties["description"],
        minParticipants:        properties["minParticipants"],
        maxParticipants:        properties["maxParticipants"],
        length:                 properties["length"],
        photo:                  properties["photo"],
        type:                   properties["type"],
    }; 

    let returnEvent = {
        values: eventProperties,
        error: false
    }

    return returnEvent

}

module.exports = ReturnEvent;