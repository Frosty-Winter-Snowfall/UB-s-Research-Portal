const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { Appdata } = require("../config/database")

function getUser() { return Appdata.getRepository("User") }

router.post("/signup", async (req, res) => {
    const { name, email, password, role, departmentId } = req.body

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" })
    }

    const userRepo = getUser()
    const existing = await userRepo.findOne({ where: { email } })
    if (existing) return res.status(400).json({ error: "Email already in use" })

    const hashed = await bcrypt.hash(password, 10)

    const userData = { name, email, password: hashed, role }

    if (role === "teacher" && departmentId) {
        userData.department = { id: parseInt(departmentId) }
    }

    const user = userRepo.create(userData)
    await userRepo.save(user)

    const token = jwt.sign(
        { id: user.id, name: user.name, role: user.role },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "7d" }
    )

    res.status(201).json({
        message: "Account created!",
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
})

router.post("/login", async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: "Email and password required" })

    const userRepo = getUser()
    const user = await userRepo.findOne({ where: { email } })
    if (!user) return res.status(400).json({ error: "Invalid email or password" })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ error: "Invalid email or password" })

    const token = jwt.sign(
        { id: user.id, name: user.name, role: user.role },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "7d" }
    )

    res.json({
        message: "Logged in!",
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
})

module.exports = router