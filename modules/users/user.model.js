import Utils from '../utils/utils'

var randomstring = require("randomstring");
var crypto 		 = require('crypto');

var User = function (newValues) {

    this.values = newValues;
    this.error;

    // INPUT SCHEMA
    const userSchema = {
        key:        { type: 'String'},
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

    // Check that input values correspond to schema. Generate error if unknown or invalid input
    this.checkInputValues = (values) => {
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
            this.error = error
        } else if (missingProperties.length) {
            error.message = "required properties are missing"
            error.missingProperties = missingProperties
            this.error = error
        } else {
            this.error = undefined;
        }
        return this.error
    }

    // Filter the info that goes out (password for example)
    this.filterOutputValues = () => {
        let outputObject = {}
        outputSchema.forEach(key => outputObject[`${key}`] = this.values[`${key}`]);
        return outputObject
    }

    // CRYPTOGRAPHY: HASH PASSWORD USING THE USERNAME AND PASSWORD
    this.hashPassword = (password) => {
        if(password){
            var s = 'milcampsSalt:' + password;
            return crypto.createHash('sha256').update(s).digest('hex');
        }
    }   

    // AUTHENTICATE USER
    this.authenticate = (passWord) => {
        return (this.values.passWord === this.hashPassword(passWord))
    }

    // REGISTER NEW USER
    this.register = (cb, ecb) => {
        this.values.passWord = this.hashPassword(this.values.passWord);
        this.values.key = this.values.userName + randomstring.generate({ length: 10, charset: 'hex'})
        this.values.key = Utils.removeWhiteSpace(this.values.key)
        this.values.key = Utils.escapeSpecial(this.values.key)
    
        // ecb(new Error('test error'))
        cb(this.filterOutputValues())
    }

    /**
     * When 'new()' is used
     */
    this.checkInputValues(newValues)

    // RETURN OF FACTORY
	return ({
        error: (() => this.error)(),
        register:           (cb, ecb) => this.register(cb, ecb),
        checkInputValues:   (values) => this.checkInputValues(values),
        filterOutputValues: () => this.filterOutputValues(),
    })
}

module.exports = User;






















/*
var register = function(session, username, password) {
    return session.run('MATCH (user:User {username: {username}}) RETURN user', {
            username: username
        })
        .then(results => {
            if (!_.isEmpty(results.records)) {
                throw {
                    username: 'username already in use',
                    status: 400
                }
            }
            else {

                const createQuery = `
                `

                return session.run('CREATE (user:User {id: {id}, username: {username},
                       password: {password}, api_key: {api_key}}) RETURN user', {
                    id: uuid.v4(),
                    username: username,
                    password: hashPassword(username, password),
                    api_key: randomstring.generate({
                        length: 20,
                        charset: 'hex'
                    })
                }).then(results => {
                    return new User(results.records[0].get('user'));
                })
            }
        });
};*/