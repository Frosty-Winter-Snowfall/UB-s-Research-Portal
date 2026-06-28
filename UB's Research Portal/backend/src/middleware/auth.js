const jwt = require("jsonwebtoken")
const { Appdata } = require("../config/database")

async function auth(req, res, next) {
    const header = req.headers.authorization
    if (!header) return res.status(401).json({ error: "No token" })
    const token = header.split(" ")[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey")
        const user = await Appdata.getRepository("User").findOne({ where: { id: decoded.id } })
        if (!user) return res.status(401).json({ error: "User not found" })
        if (user.blacklisted) return res.status(403).json({ error: "Your account has been suspended" })
        req.user = decoded
        next()
    } catch {
        res.status(401).json({ error: "Invalid token" })
    }
}

function requireRole(...roles) {
    return function(req, res, next) {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Not allowed" })
        }
        next()
    }
}

module.exports = { auth, requireRole }