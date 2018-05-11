var ReviewLinks = function (links) {


    if (links == undefined) {
        return {
            error: {
                error: "object syntax error: links were not given",
                expectedStructure: "{ properties: {}, links: {}}"
            }
        }
    }

    let reviewLinks = {
        userKey:   { value: links["userKey"],     required:true },
        gameKey:   { value: links["gameKey"] ,    required:true }
    }; 

    let returnLinks = {
        values:{},
        error: false
    }

// CHECK REQUIRED VALUE AND POPULATE REVIEW MODEL
    let unknownLinks      = Object.keys(links).filter((key) => !(key in reviewLinks))
    let missingLinks      = [];
    
    for (let link in reviewLinks) {
        if (reviewLinks[link].value == undefined && reviewLinks[link].required) {
            missingLinks.push(link);
        }
        else if (reviewLinks[link].value != undefined) {
            returnLinks.values[link] = reviewLinks[link].value
        }
    }

// GENERATE MISSING PROPERTY ERROR
    if (missingLinks.length > 0) {
        returnLinks.error = {
            message:			"sorry, review links are missing",
            missingLinks: missingLinks,
            expectations : Object.keys(reviewLinks)
        }
    }

// GENERATE UNKNOWN PROPERTY ERROR
    if (unknownLinks.length > 0) {
        returnLinks.error = {
            message:			"sorry, unknown links",
            unknownLinks: unknownLinks,
            allowedLinks : Object.keys(reviewLinks)
        }
    }

    return returnLinks

}

module.exports = ReviewLinks;