import Utils from '../utils/utils'

// CONFIGURE NEO4J DRIVER
const randomstring 	= require("randomstring");
const neo4j 	 	= require('neo4j-driver').v1;
const neoDriver 	= neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
const neoSession 	= neoDriver.session();
const crypto 		= require('crypto');
const jwt           = require('jsonwebtoken');

var User = function () {

    // INPUT SCHEMA
    const userSchema = {
        key:        { type: 'String'},
        role:       { type: 'String'},
        name:       { type: 'String' , 	required:true },
        sirName:    { type: 'String', 	required:true },
        mail:       { type: 'email', 	required:true },
        userName:   { type: 'String', 	required:true },
        passWord:   { type: 'String', 	required:true },
        adress:     { type: 'String',   required:true },
        birthday:   { type: 'Date',	    required:true }        
    }

    // OUTPUT SCHEMA TO CONTROL WHAT GOES OUT OF DB
    const outputSchema = [
        'key',
        'name',
        'sirName',
        'mail',
        'userName',
        'role',
        'birthday',
        'adress'
    ]

    // AUTHENTICATE USER
    var authenticate = function(passWord) {
        return (this.values.passWord === hashPassword(passWord))
    }

    // Check that input values correspond to schema. Generate error if unknown or invalid input
    var validateInput = (values) => {

        // Check unknown values
        let unknownProperties = Object.keys(values).filter((key) => {return !(key in userSchema)})
        
        // Check for missing values
        let missingProperties = Object.keys(userSchema)
                                      .filter((key) => userSchema[key].required)
                                      .filter((key) => !values[key])

        // Generate error
        let error = {};
        if (unknownProperties.length) {
            error.message = "invalid properties were given"
            error.unknownProperties = unknownProperties
        } else if (missingProperties.length) {
            error.message = "required properties are missing"
            error.missingProperties = missingProperties
        } else {
            error = undefined;
        }

        return error
    }

    // REGISTER NEW USER
    var register = function (res, cb, ecb) {

        this.values.passWord = hashPassword(this.values.passWord);
        this.values.key  = this.values.userName + randomstring.generate({ length: 10, charset: 'hex'})
        this.values.key  = Utils.removeWhiteSpace(this.values.key)
        this.values.key  = Utils.escapeSpecial(this.values.key)
        this.values.role = "user"
        
        const checkUserExistsQuery = `MATCH (user:User{userName:'${this.values.userName}'}) RETURN user`

        neoSession
            .run(checkUserExistsQuery)
            .then(results => {
                if (results.records.length > 0) {
                    res.status(400).send({
                        message: "sorry, userName is already taken!"
                    }); 
                }
                else {
                    neoSession
                    .run(`CREATE (user:User {user}) RETURN user`, {user: this.values})
                    .then(results => {
                            let createdUser = results.records[0].get('user').properties;
                            cb(create(createdUser))
                        })
                    .catch(err => ecb(err))
                }
                })
            .catch(err =>ecb(err));
    }

    // FIND USER BY USERNAME
    var getByUsername = function(userName) {
        const userQuery = `MATCH (user:User{userName:'${userName}'}) return user`
        const userPromise = new Promise((resolve, reject) => {
            neoSession
            .run(userQuery)
            .then(result => {
                const foundUser = this.create(result.records.map(record => record.get('user').properties)[0])
                resolve(foundUser)
            })
            .catch(function(err) {
                reject(err)
            });
        })
        return userPromise;
    }
    
    // Filter the info that goes out (password for example)
    var filterOutputValues = function() {
        let outputObject = {}
        outputSchema.forEach(key => outputObject[`${key}`] = this.values[`${key}`]);
        return outputObject
    }

    // CRYPTOGRAPHY: HASH PASSWORD USING THE USERNAME AND PASSWORD
    var hashPassword = function(password) {
        if(password){
            var s = 'milcampsSalt:' + password;
            return crypto.createHash('sha256').update(s).digest('hex');
        }
    }   

    // GENERATE A JSON WEB TOKEN
    var generateJWT = () => {
        const today = new Date();
        const expirationDate = new Date(today);
        expirationDate.setDate(today.getDate() + 60);

        return jwt.sign({
            userName: this.values.userName,
            id: this.values.key,
            exp: parseInt(expirationDate.getTime() / 1000, 10),
        }, 'secret');
    }

    // TO AUTH JSON
    var toAuthJSON = () => {
        return {
          userName: this.values.userName,
          id: this.values.key,
          token: this.generateJWT(),
        };
    };

    // VALIDATE PASSWORD (TODO: USE REGEX)
    var validatePassword = (password) => {
        return (password && password.length > 5)
    }

    var create = (values) => {
        if (!values) return;
        return new UserInstance(values)
    }

    // CREATE AN INSTANCE CONTAINING DATA
    var UserInstance = function(values) {
        this.values = values;
        this.error  = validateInput(values);

        return ({
            values       : this.values,
            error        : this.error,
            outputValues : filterOutputValues.call(this),
            register     : register.bind(this),
            authenticate : authenticate.bind(this)
        })   
    }

    // RETURN OF FACTORY
	return ({
        getByUsername:      getByUsername,
        validateInput:      validateInput,
        create :            create
    })

}()

module.exports = User;