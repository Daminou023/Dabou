function roleAuth(authRoles) {

    const checkUserRights = (req, res, next) => {
        if (authRoles.includes(req.user.values.role)) next()
        else return res.status(401).send({ success : false, message : 'User is not allowed' });
    }

    return checkUserRights
}

module.exports = roleAuth