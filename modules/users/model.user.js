import Utils from "../utils/utils";
import CError from "../utils/cError";

// CONFIGURE NEO4J DRIVER AND UTILS
const randomstring = require("randomstring");
const neo4j = require("neo4j-driver").v1;
const neoDriver = neo4j.driver(
  "bolt://localhost:7687",
  neo4j.auth.basic("neo4j", "123456789")
);
const neoSession = neoDriver.session();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

var User = (function() {
  // INPUT SCHEMA
  const userSchema = {
    key: { type: "String" },
    role: { type: "String" },
    name: { type: "String", required: true },
    sirname: { type: "String", required: true },
    email: { type: "email", required: true },
    username: { type: "String", required: true },
    password: { type: "String", required: true },
    adress: { type: "String", required: true },
    birthday: { type: "Date", required: true },
    provider: { type: "String" },
    providerID: { type: "String" }
  };

  // OUTPUT SCHEMA TO CONTROL WHAT GOES OUT OF DB
  const outputSchema = [
    "key",
    "name",
    "sirname",
    "email",
    "username",
    "role",
    "birthday",
    "adress"
  ];

  // AUTHENTICATE USER
  var authenticate = function(password) {
    return this.values.password === hashPassword(password);
  };

  // Check that input values correspond to schema. Generate error if unknown or invalid input
  var validateInput = function() {
    // Check unknown values
    let unknownProperties = Object.keys(this.values).filter(key => {
      return !(key in userSchema);
    });

    // Check for missing values
    let missingProperties = Object.keys(userSchema)
      .filter(key => userSchema[key].required)
      .filter(key => !this.values[key]);

    // Generate error
    let error;
    if (unknownProperties.length) {
      error = new CError("invalid properties were given", 400, {
        unknownProperties: unknownProperties
      });
    } else if (missingProperties.length) {
      error = new CError("required properties are missing", 400, {
        missingProperties: missingProperties
      });
    } else {
      error = undefined;
    }

    this.error = error;
    return this;
  };

  // REGISTER NEW USER
  var register = function() {
    this.values.password = hashPassword(this.values.password);
    this.values.key =
      this.values.username +
      randomstring.generate({ length: 10, charset: "hex" });
    this.values.key = Utils.removeWhiteSpace(this.values.key);
    this.values.key = Utils.escapeSpecial(this.values.key);
    this.values.role = "user";
    this.values.provider = "local";

    const registerUserPromise = new Promise((resolve, reject) => {
      getByUsername(this.values.username)
        .then(existingUser => {
          if (existingUser)
            reject(new CError("username is already taken", 400));
          else {
            getByUserMail(this.values.email)
              .then(existingUser => {
                if (existingUser)
                  reject(new CError("Email is already taken", 400));
                else {
                  neoSession
                    .run(`CREATE (user:User {user}) RETURN user`, {
                      user: this.values
                    })
                    .then(results => {
                      let createdUser = create(
                        results.records[0].get("user").properties
                      );
                      resolve(createdUser);
                    })
                    .catch(err => reject(err));
                }
              })
              .catch(err => reject(err));
          }
        })
        .catch(err => reject(err))
        .catch(err => reject(err));
    });
    return registerUserPromise;
  };

  // FIND USER BY username
  var getByUsername = function(username) {
    console.log("get by username");
    const userQuery = `MATCH (user:User{username:'${username}'}) return user`;
    const userPromise = new Promise((resolve, reject) => {
      neoSession
        .run(userQuery)
        .then(result => {
          const foundUser = create(
            result.records.map(record => record.get("user").properties)[0]
          );
          resolve(foundUser);
        })
        .catch(err => reject(err));
    });
    return userPromise;
  };

  // GET USER BY KEY
  var getByUserKey = function(userKey) {
    const userQuery = `MATCH (user:User{key:'${userKey}'}) return user`;
    const userPromise = new Promise((resolve, reject) => {
      neoSession
        .run(userQuery)
        .then(result => {
          const foundUser = create(
            result.records.map(record => record.get("user").properties)[0]
          );
          resolve(foundUser);
        })
        .catch(err => reject(err));
    });
    return userPromise;
  };

  // GET USER BY EMAIL
  var getByUserMail = function(email) {
    const userQuery = `MATCH (user:User{email:'${email}'}) return user`;
    const userPromise = new Promise((resolve, reject) => {
      neoSession
        .run(userQuery)
        .then(result => {
          const foundUser = create(
            result.records.map(record => record.get("user").properties)[0]
          );
          resolve(foundUser);
        })
        .catch(err => reject(err));
    });
    return userPromise;
  };

  // EDIT USER
  var editUser = function(userKey, newValues) {
    const userPromise = new Promise((resolve, reject) => {
      getByUserKey(userKey)
        .then(user => {
          if (!user)
            return reject(new CError("no user with this key was found", 404));

          for (let property in newValues) {
            if (property == "password")
              newValues.password = hashPassword(newValues.password);
            user.values[`${property}`] = newValues[`${property}`];
          }

          // Check if content is ok before updating
          user.validateInput();
          if (user.error) return reject(user.error);

          getByUsername(newValues.username).then(existingUser => {
            if (existingUser) {
              reject(new CError("username already exists!", 400));
            } else {
              const updateQuery = `MATCH (user:User{key:'${userKey}'}) SET user = $values return user`;
              neoSession
                .run(updateQuery, { values: user.values })
                .then(results => {
                  let editedUser = User.create(
                    results.records[0].get("user").properties
                  );
                  resolve(editedUser.outputValues);
                })
                .catch(err => reject(err));
            }
          });
        })
        .catch(err => reject(err));
    });
    return userPromise;
  };

  // DELETE USER
  var deleteUser = function(userKey) {
    const userPromise = new Promise((resolve, reject) => {
      getByUserKey(userKey)
        .then(user => {
          if (!user)
            return reject(new CError("no user with this key was found", 404));

          const deleteUserQuery = `MATCH (user:User{key:'${userKey}'}) DETACH DELETE user RETURN user`;
          neoSession
            .run(deleteUserQuery)
            .then(results => {
              resolve(user.outputValues);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
    return userPromise;
  };

  // Filter the info that goes out (password for example)
  var filterOutputValues = function() {
    let outputObject = {};
    outputSchema.forEach(
      key => (outputObject[`${key}`] = this.values[`${key}`])
    );
    return outputObject;
  };

  // CRYPTOGRAPHY: HASH password USING THE username AND password
  var hashPassword = function(password) {
    if (password) {
      var s = "milcampsSalt:" + password;
      return crypto
        .createHash("sha256")
        .update(s)
        .digest("hex");
    }
  };

  // GENERATE A JSON WEB TOKEN
  var generateJWT = () => {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign(
      {
        username: this.values.username,
        id: this.values.key,
        exp: parseInt(expirationDate.getTime() / 1000, 10)
      },
      "secret"
    );
  };

  // TO AUTH JSON
  var toAuthJSON = () => {
    return {
      username: this.values.username,
      id: this.values.key,
      token: this.generateJWT()
    };
  };

  // VALIDATE password (TODO: USE REGEX)
  var validatePassword = password => {
    return password && password.length > 5;
  };

  var create = values => {
    if (!values) return;
    return new UserInstance(values);
  };

  // CREATE AN INSTANCE CONTAINING DATA
  var UserInstance = function(values) {
    this.values = values;
    (this.outputValues = filterOutputValues.call(this)),
      (this.register = register.bind(this)),
      (this.authenticate = authenticate.bind(this)),
      (this.validateInput = validateInput.bind(this));

    validateInput.call(this);
  };

  // RETURN OF FACTORY
  return {
    getByUsername: getByUsername,
    getByUserKey: getByUserKey,
    editUser: editUser,
    deleteUser: deleteUser,
    create: create
  };
})();

module.exports = User;
