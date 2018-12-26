const RegexFactory = function () {

    const escapeWhiteSpace = (key) => key.replace(/\s+/g, '');   // remove white space
    const escapeSpecial    = (key) => key.replace(/[^\w\s]/gi, '');  // remove special characters

    return {
        escapeSpecial,
        escapeWhiteSpace
    }
}

module.exports = RegexFactory;

