var Review = function (properties) {

    if (properties == undefined ) {
        return {
            error: {
                error: "object syntax error: properties were not given",
                expectedStructure: "{ properties: {}, links: {}}"
            }
        }
    }

    let reviewProperties = {
        key:        { value: properties["key"] },
        title:      { value: properties["title"],       required:true },
        text:       { value: properties["text"] ,       required:true },
        stars:      { value: properties["stars"],       required:true }
    }; 

    let returnReview = {
        values: {},
        error: false
    }

// CHECK REQUIRED VALUE AND POPULATE REVIEW MODEL
    let unknownProperties = Object.keys(properties).filter((key) => !(key in reviewProperties))
    let missingProperties = [];

	for (let property in reviewProperties) {
        if (reviewProperties[property].value == undefined && reviewProperties[property].required) {
            missingProperties.push(property);
        }
        else if (reviewProperties[property].value != undefined) {
            returnReview.values[property] = reviewProperties[property].value
        }
    }
    

// GENERATE MISSING PROPERTY ERROR
    if (missingProperties.length > 0) {
        returnReview.error = {
            reviewKey: 			reviewProperties.key.value,
            message:			"sorry, review required properties",
            missingProperties:  missingProperties,
            expectations : Object.keys(reviewProperties)
        }
    }

// GENERATE UNKNOWN PROPERTY ERROR
    if (unknownProperties.length > 0) {
        returnReview.error = {
            reviewKey: 			reviewProperties.key.value,
            message:			"sorry, unknown properties",
            unknownProperties:  unknownProperties,
            allowedProperties : Object.keys(reviewProperties),
        }
    }

    return returnReview

}

module.exports = Review;