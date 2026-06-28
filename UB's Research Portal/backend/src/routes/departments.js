const express = require("express")
const router = express.Router()
const { Appdata } = require("../config/database")
const { auth, requireRole } = require("../middleware/auth")

function getDeptRepo() { return Appdata.getRepository("Department") }
function getUserRepo() { return Appdata.getRepository("User") }

router.get("/", async (req, res) => {
    try {
        const depts = await getDeptRepo().find()
        res.json({ departments: depts })
    } catch {
        res.status(500).json({ error: "something went wrong" })
    }
})

router.post("/", auth, requireRole("admin"), async (req, res) => {
    try {
        const { name, description } = req.body
        if (!name) return res.status(400).json({ error: "name is required" })
        const repo = getDeptRepo()
        const dept = repo.create({ name, description })
        await repo.save(dept)
        res.status(201).json({ department: dept })
    } catch {
        res.status(500).json({ error: "something went wrong" })
    }
})

router.post("/:id/assign-teacher", auth, requireRole("admin"), async (req, res) => {
    try {
        const { teacherId } = req.body
        const userRepo = getUserRepo()
        const teacher = await userRepo.findOne({ where: { id: teacherId } })
        if (!teacher) return res.status(404).json({ error: "teacher not found" })
        if (teacher.role !== "teacher") return res.status(400).json({ error: "user is not a teacher" })
        teacher.department = { id: parseInt(req.params.id) }
        await userRepo.save(teacher)
        res.json({ message: "teacher assigned to department!" })
    } catch {
        res.status(500).json({ error: "something went wrong" })
    }
})

// router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
//     try {
//         const repo = getDeptRepo()

//         const dept = await repo.findOne({
//             where: { id: parseInt(req.params.id) }
//         })

//         if (!dept) {
//             return res.status(404).json({ error: "Department not found" })
//         }

//         await repo.remove(dept)

//         res.json({ message: "Department deleted successfully" })
//     } catch (err) {
//         console.error(err)
//         res.status(500).json({ error: "something went wrong" })
//     }
// })

module.exports = router