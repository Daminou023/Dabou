var Review = function (body) {

    let properties  = body.properties;
    let links       = body.links;

    if (properties == undefined || links == undefined) {
        return {
            error: {
                error: "object syntax error: properties or links were not given",
                expectedStructure: "{ properties: {}, links: {}}"
            }
        }
    }

    let reviewProperties = {
        
        key:        { value: properties["key"] },
        title:      { value: properties["title"],       required:true },
        text:       { value: properties["text"] ,       required:true },
        stars:      { value: properties["stars"],       required:true },
        userKey:    { value: properties["userKey"],     required:true },
        gameKey:    { value: properties["gameKey"],     required:true }
    }; 

    let reviewLinks = {
        userKey:      { value: links["userKey"],     required:true },
        gameKey:      { value: links["gameKey"] ,    required:true }
    }; 

    let returnReview = {
        values: {},
        links:{},
        error: false
    }

// CHECK REQUIRED VALUE AND POPULATE REVIEW MODEL
    let unknownProperties = Object.keys(properties).filter((key) => {return !(key in reviewProperties)})
    let unknownLinks      = Object.keys(links).filter((key) => {return !(key in reviewLinks)})

    let missingProperties = [];
    let missingLinks      = [];

	for (let property in reviewProperties) {
        if (reviewProperties[property].value == undefined && reviewProperties[property].required) {
            missingProperties.push(property);
        }
        else if (reviewProperties[property].value != undefined) {
            returnReview.values[property] = reviewProperties[property].value
        }
    }
    
    for (let link in reviewLinks) {
        if (reviewLinks[link].value == undefined && reviewLinks[link].required) {
            missingLinks.push(link);
        }
        else if (reviewLinks[link].value != undefined) {
            returnReview.links[link] = reviewLinks[link].value
        }
    }

// GENERATE MISSING PROPERTY ERROR
    if (missingProperties.length > 0 || missingLinks.length >0) {
        returnReview.error = {
            reviewKey: 			reviewProperties.key.value,
            message:			"sorry, review required properties or links are missing",
            missingProperties:  missingProperties,
            missingLinks: missingLinks,
            expectations : Object.keys(reviewProperties)
        }
    }

// GENERATE UNKNOWN PROPERTY ERROR
    if (unknownProperties.length > 0 || unknownLinks.length > 0) {
        returnReview.error = {
            reviewKey: 			reviewProperties.key.value,
            message:			"sorry, unknown properties or links",
            unknownProperties:  unknownProperties,
            unknownLinks: unknownLinks,
            allowedProperties : Object.keys(reviewProperties),
            allowedLinks : Object.keys(reviewLinks)
        }
    }

    return returnReview

}

module.exports = Review;