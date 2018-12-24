var Editor = function (properties) {

    let editorProperties = {
        key:                    { value: properties["key"] },
        name:                   { value: properties["name"] ,    required:true },
        description:            { value: properties["description"] }
    }; 

    let returnEditor = {
        values: {},
        error: false
    }

// CHECK REQUIRED VALUE AND POPULATE EDITOR MODEL
    let unknownProperties = Object.keys(properties).filter((key) => {return !(key in editorProperties)})
    let missingProperties = [];

	for (let property in editorProperties) {
        if (editorProperties[property].value == undefined && editorProperties[property].required) {
            missingProperties.push(property);
        }
        else if (editorProperties[property].value != undefined) {
            returnEditor.values[property] = editorProperties[property].value
        }
    }    

// GENERATE MISSING PROPERTY ERROR
    if (missingProperties.length > 0) {
        returnEditor.error = {
            editorKey:		editorProperties.key.value,
            message:			"sorry, editor required properties are missing",
            missingProperties:  missingProperties,
            expectations : Object.keys(editorProperties)
        }
    }

// GENERATE UNKNOWN PROPERTY ERROR
    if (unknownProperties.length > 0) {
        returnEditor.error = {
            editorKey:		editorProperties.key.value,
            message:			"sorry, unknown properties",
            unknownProperties:  unknownProperties,
            allowedProperties : Object.keys(editorProperties)
        }
    }

    return returnEditor

}

module.exports = Editor;