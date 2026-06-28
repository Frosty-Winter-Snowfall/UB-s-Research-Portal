const express = require("express")
const router = express.Router()
const { Appdata } = require("../config/database")
const { auth, requireRole } = require("../middleware/auth")

function getUserRepo() { return Appdata.getRepository("User") }

router.get("/", auth, requireRole("admin"), async (req, res) => {
    try {
        const users = await getUserRepo().find({
            select: ["id", "name", "email", "role", "blacklisted", "createdAt"]
        })
        res.json({ users })
    } catch {
        res.status(500).json({ error: "something went wrong" })
    }
})

router.patch("/:id/blacklist", auth, requireRole("admin"), async (req, res) => {
    try {
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ error: "You cannot blacklist yourself" })
        }
        const userRepo = getUserRepo()
        const user = await userRepo.findOne({ where: { id: parseInt(req.params.id) } })
        if (!user) return res.status(404).json({ error: "user not found" })
        user.blacklisted = !user.blacklisted
        await userRepo.save(user)
        res.json({ message: user.blacklisted ? "User blacklisted" : "User reinstated", user })
    } catch {
        res.status(500).json({ error: "something went wrong" })
    }
})

module.exports = router