function CError(message, errorCode, otherProperties) {
    this.code = errorCode;
    this.message = message;

    if (otherProperties && (typeof otherProperties == 'object')) {
        
        Object.keys(otherProperties).forEach((key,index) => {
            this[key] = otherProperties[key]
        });
    }

    this.stack = (new Error()).stack;
}

CError.prototype = new Error;

module.exports = CError