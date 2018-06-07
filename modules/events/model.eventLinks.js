var EventLinks = function (links, requirements) {

    if (links == undefined) {
        return {
            error: {
                error: "object syntax error: links were not given",
                expectedStructure: "{ properties: {}, links: {}}"
            }
        }
    }

    const defaultRequirements = [
        'location',
        'games',
        'organiser'
    ]

    requirements = requirements ? requirements : defaultRequirements;

    let model = {
        participants : links['participants'],
        organiser    : links['organiser'],
        requestors   : links['requestors'],
        invitations  : links['invitations'],
        location     : links['location'],
        games        : links['games']
    }

     let returnLinks = {
        values: {},
        error: false
    }

    
// CHECK REQUIRED VALUE AND POPULATE EVENT MODEL
    let unknownLinks = Object.keys(links).filter((key) => { return !(key in model) })
    let missingLinks = [];

    for (let property in model) {
        if ((model[property]== undefined || model[property]== "" || model[property] == [] ) && requirements.includes(property)) {
            missingLinks.push(property);
        }
        else if (model[property]!== undefined || model[property] !== "" || model[property]!== []) {
            returnLinks.values[property] = model[property]
        }
    }

// GENERATE MISSING PROPERTY ERROR
    if (missingLinks.length > 0) {
        returnLinks.error = {
            message:	  "sorry, link required properties are missing",
            missingLinks: missingLinks
        }
    }

// GENERATE UNKNOWN PROPERTY ERROR
    if (unknownLinks.length > 0) {
        returnLinks.error = {
            message:	 "sorry, unknown properties",
            unknownLinks: unknownLinks
        }
    }
    
    return returnLinks

}

module.exports = EventLinks;