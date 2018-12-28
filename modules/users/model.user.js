import Utils  from '../utils/utils'
import CError from '../utils/cError'
require('../../config/passport')

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
        name:       { type: 'String', 	required:true },
        sirName:    { type: 'String', 	required:true },
        mail:       { type: 'email', 	required:true },
        userName:   { type: 'String', 	required:true },
        passWord:   { type: 'String', 	required:true },
        adress:     { type: 'String',   required:true },
        birthday:   { type: 'Date',	    required:true },
        provider:   { type: 'String'},
        providerID: { type: 'String'},
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
    var authenticate = function(password) {
        return (this.values.passWord === hashPassword(password))
    }

    // Check that input values correspond to schema. Generate error if unknown or invalid input
    var validateInput = function() {

        // Check unknown values
        let unknownProperties = Object.keys(this.values).filter((key) => {return !(key in userSchema)})
        
        // Check for missing values
        let missingProperties = Object.keys(userSchema)
                                      .filter((key) => userSchema[key].required)
                                      .filter((key) => !this.values[key])                       

        // Generate error
        let error;
        if (unknownProperties.length) {
            error = new CError("invalid properties were given", 400, {unknownProperties: unknownProperties})
        } else if (missingProperties.length) {
            error = new CError("required properties are missing", 400, {missingProperties: missingProperties})
        } else {
            error = undefined;
        }

        this.error = error
        return this
    }

    // REGISTER NEW USER
    var register = function () {

        this.values.passWord = hashPassword(this.values.passWord);
        this.values.key      = this.values.userName + randomstring.generate({ length: 10, charset: 'hex'});
        this.values.key      = Utils.removeWhiteSpace(this.values.key);
        this.values.key      = Utils.escapeSpecial(this.values.key);
        this.values.role     = "user";
        this.values.provider = "local";
        
        const checkUserExistsQuery = `MATCH (user:User{userName:'${this.values.userName}'}) RETURN user`

        const registerUserPromise = new Promise((resolve, reject) => {
            neoSession
            .run(checkUserExistsQuery)
            .then(results => {
                if (results.records.length > 0) {
                    let error  = new CError("test")
                    error.code = 400 
                    reject(error)
                }
                else {
                    neoSession
                    .run(`CREATE (user:User {user}) RETURN user`, {user: this.values})
                    .then(results => {
                            let createdUser = create(results.records[0].get('user').properties);
                            resolve(createdUser)
                        })
                        .catch(err => reject(err))
                }
                })
                .catch(err => reject(err));
        })
        return registerUserPromise;
    }

    // FIND USER BY USERNAME
    var getByUsername = function(userName) {
        const userQuery = `MATCH (user:User{userName:'${userName}'}) return user`
        const userPromise = new Promise((resolve, reject) => {
            neoSession
            .run(userQuery)
            .then(result => {
                const foundUser = create(result.records.map(record => record.get('user').properties)[0])
                resolve(foundUser)
            })
            .catch(err => reject(err));
        })
        return userPromise;
    }

    // GET USER BY KEY1
    var getByUserKey = function(userKey) {
        const userQuery = `MATCH (user:User{key:'${userKey}'}) return user`
        const userPromise = new Promise((resolve, reject) => {
            neoSession
            .run(userQuery)
            .then(result => {
                const foundUser = create(result.records.map(record => record.get('user').properties)[0])
                resolve(foundUser)
            })
            .catch(err => reject(err));
        })
        return userPromise;
    }
    
    // EDIT USER
    var editUser = function(userKey, newValues) {
        const userPromise = new Promise((resolve, reject) => {
            getByUserKey(userKey)
                .then(user => {

                    if(!user) return reject(new CError("no user with this key was found", 404))
                    
                    for (let property in newValues) {
                        if (property == 'passWord') newValues.passWord = hashPassword(newValues.passWord)
                        user.values[`${property}`] = newValues[`${property}`]
                    } 

                    // Check if content is ok before updating
                    user.validateInput()
                    if (user.error) return reject(user.error)

                    getByUsername(newValues.userName)
                        .then(existingUser => {
                            if (existingUser) {
                                reject(new CError("username already exists!", 400))
                            } else {
                                const updateQuery = `MATCH (user:User{key:'${userKey}'}) SET user = $values return user`
                                neoSession
                                    .run(updateQuery, {"values": user.values})
                                    .then(results => {
                                        let editedUser = User.create(results.records[0].get('user').properties);
                                        resolve(editedUser.outputValues)
                                    })
                                    .catch(err => reject(err))
                            }
                        })
                })
                .catch(err => reject(err))
        })
        return userPromise;
    }
    
    // DELETE USER
    var deleteUser = function(userKey) {
        const userPromise = new Promise((resolve, reject) => {
            getByUserKey(userKey)
                .then(user => {
                    if(!user) return resolve(undefined)
                    const deleteUserQuery = `MATCH (user:User{key:'${userKey}'}) DETACH DELETE user RETURN user`
                    neoSession.run(deleteUserQuery)
                              .then(results => {
                                    resolve(user.outputValues)
                              })
                              .catch(err => reject(err))
                })
                .catch(err => reject(err))
        })
        return userPromise
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
        this.values        = values;
        this.outputValues  = filterOutputValues.call(this),
        this.register      = register.bind(this),
        this.authenticate  = authenticate.bind(this),
        this.validateInput = validateInput.bind(this)

        validateInput.call(this);
    }

    // RETURN OF FACTORY
	return ({
        getByUsername:      getByUsername,
        getByUserKey:       getByUserKey,
        editUser:           editUser,
        deleteUser:         deleteUser,
        create :            create
    })

}()

module.exports = User;