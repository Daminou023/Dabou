// extracts just the data from the query results
var randomstring = require("randomstring");
const neo4j 	 = require('neo4j-driver').v1;
var neoDriver 	 = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	 = neoDriver.session();

var ReturnUser = function (properties) {

    this.mapUserProperties = (properties) => ({
        key:        properties["key"],
        name:       properties["name"],
        sirName:    properties["sirName"],
        mail:       properties["mail"],
        userName:   properties["userName"],
        role:       properties["role"],
        birthday:   properties["birthday"],
        adress:     properties["adress"]
    })

    this.getByUsername = (userName) => {
        return('test')
    }

    let userProperties = this.mapUserProperties(properties)

    let returnUser = {
        getByUsername: (userName) => this.getByUsername(userName),
        values: userProperties,
        error: false
    }



// RETURN FINAL USER
	return returnUser
}

module.exports = ReturnUser;