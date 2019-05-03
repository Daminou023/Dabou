var Author = function(properties) {
  /**
   * TODO: Refactor the author model and other 'old' models
   * Use the newly implemented pattern as done in the "USERS" model.
   */

  let authorProperties = {
    key: { value: properties["key"] },
    name: { value: properties["name"], required: true },
    sirname: { value: properties["sirname"], required: true },
    description: { value: properties["description"] }
  };

  let returnAuthor = {
    values: {},
    error: false
  };

  // CHECK REQUIRED VALUE AND POPULATE AUTHOR MODEL
  let unknownProperties = Object.keys(properties).filter(key => {
    return !(key in authorProperties);
  });
  let missingProperties = [];

  for (let property in authorProperties) {
    if (
      authorProperties[property].value == undefined &&
      authorProperties[property].required
    ) {
      missingProperties.push(property);
    } else if (authorProperties[property].value != undefined) {
      returnAuthor.values[property] = authorProperties[property].value;
    }
  }

  // GENERATE MISSING PROPERTY ERROR
  if (missingProperties.length > 0) {
    returnAuthor.error = {
      authorKey: authorProperties.key.value,
      message: "sorry, author required properties are missing",
      missingProperties: missingProperties,
      expectations: Object.keys(authorProperties)
    };
  }

  // GENERATE UNKNOWN PROPERTY ERROR
  if (unknownProperties.length > 0) {
    returnAuthor.error = {
      authorKey: authorProperties.key.value,
      message: "sorry, unknown properties",
      unknownProperties: unknownProperties,
      allowedProperties: Object.keys(authorProperties)
    };
  }

  return returnAuthor;
};

module.exports = Author;
