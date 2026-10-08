const jwt = require("jsonwebtoken");


const protect = async (req, res, next) => {

    try {

        const authorization = req.headers.authorization;


        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }


        const tokenValue = authorization.slice(7).trim();

        if (!tokenValue) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }


        const decoded = jwt.verify(
            tokenValue,
            process.env.JWT_SECRET
        );


        req.user = decoded;


        next();


    } catch (error) {

        return res.status(401).json({
            message: "Invalid token"
        });

    }

};


module.exports = {
    protect
};