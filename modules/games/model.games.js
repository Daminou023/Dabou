var Game = function (properties) {

    let gameProperties = {
        
        key:                    { value: properties["key"] },
        name:                   { value: properties["name"] , required:true },
        description:            { value: properties["description"] },
        tutorial:               { value: properties["tutorial"] },
        minPlayers:             { value: properties["minPlayers"] },
        maxPLayers:             { value: properties["maxPlayers"] },
        gameType:               { value: properties["gameType"] },
        gameLength:             { value: properties["gameLength"] },
        gameCharacteristic:     { value: properties["gameCharacteristic"] },
        gameTheme:              { value: properties["gameTheme"] },
        gameMecanic:            { value: properties["gameMecanic"] }
    }; 

    let returnGame = {
        values: {},
        error: false
    }

// CHECK REQUIRED VALUE AND POPULATE GAME MODEL
    let unknownProperties = Object.keys(properties).filter((key) => {return !(key in gameProperties)})
    let missingProperties = [];

	for (let property in gameProperties) {
        if (gameProperties[property].value == undefined && gameProperties[property].required) {
            missingProperties.push(property);
        }
        else if (gameProperties[property].value != undefined) {
            returnGame.values[property] = gameProperties[property].value
        }
    }    

// GENERATE MISSING PROPERTY ERROR
    if (missingProperties.length > 0) {
        returnGame.error = {
            gameKey: 			gameProperties.key.value,
            message:			"sorry, game required properties are missing",
            missingProperties:  missingProperties,
            expectations : Object.keys(gameProperties)
        }
    }

// GENERATE UNKNOWN PROPERTY ERROR
    if (unknownProperties.length > 0) {
        returnGame.error = {
            gameKey: 			gameProperties.key.value,
            message:			"sorry, unknown properties",
            unknownProperties:  unknownProperties,
            allowedProperties : Object.keys(gameProperties)
        }
    }

    return returnGame

}

module.exports = Game;