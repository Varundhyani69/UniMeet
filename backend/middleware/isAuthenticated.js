import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies || {};

    try {
        // console.log("Cookies received:", req.cookies);
        // console.log("Token received:", token);
        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized! Login again" });
        }

        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = tokenDecode.id;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export default isAuthenticated;
