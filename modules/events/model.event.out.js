var ReturnEvent = function (properties) {

    let eventProperties = {
        
        key:                    properties["key"],
        title:                  properties["title"],
        description:            properties["description"],
        minParticipants:        properties["minParticipants"],
        maxParticipants:        properties["maxParticipants"],
        startTime:              properties["startTime"],
        endTime:                properties["endTime"],
        length:                 properties["length"],
        photo:                  properties["photo"],
        type:                   properties["type"],
        adress:                 properties["adress"]

    }; 

    let returnEvent = {
        values: eventProperties,
        error: false
    }

    return returnEvent

}

module.exports = ReturnEvent;