const express=require("express")
const router=express.Router()
const {Appdata}=require("../config/database")
const {auth,requireRole}=require("../middleware/auth")
const multer=require("multer")
const path=require("path")
const fs=require("fs")

const uploadDir=path.join(__dirname,"../../uploads")
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

const storage=multer.diskStorage({
    destination:(req,file,cb)=>cb(null,uploadDir),
    filename:(req,file,cb)=>cb(null,Date.now()+"-"+file.originalname)
})
const upload=multer({storage,fileFilter:(req,file,cb)=>{
    if(file.mimetype==="application/pdf") cb(null,true)
    else cb(new Error("only PDFs allowed"))
}})

function getPaperRepo(){return Appdata.getRepository("Paper")}

router.get("/mine",auth,async(req,res)=>{
    try{
        const {search,category,department,status}=req.query
        const query=Appdata.getRepository("Paper")
            .createQueryBuilder("paper")
            .leftJoinAndSelect("paper.student","student")
            .leftJoinAndSelect("paper.department","department")
            .where("paper.studentId = :id",{id:req.user.id})
        if(search) query.andWhere("(LOWER(paper.title) LIKE :search OR LOWER(paper.abstract) LIKE :search)",{search:`%${search.toLowerCase()}%`})
        if(category) query.andWhere("LOWER(paper.category) LIKE :category",{category:`%${category.toLowerCase()}%`})
        if(department) query.andWhere("paper.departmentId = :department",{department:parseInt(department)})
        if(status) query.andWhere("paper.status = :status",{status})
        query.orderBy("paper.createdAt","DESC")
        const papers=await query.getMany()
        res.json({papers})
    }catch(e){
        console.error(e)
        res.status(500).json({error:"something went wrong"})
    }
})

router.get("/published",async(req,res)=>{
    try{
        const {search,category,department}=req.query
        const query=Appdata.getRepository("Paper")
            .createQueryBuilder("paper")
            .leftJoinAndSelect("paper.student","student")
            .leftJoinAndSelect("paper.department","department")
            .where("paper.status = :status",{status:"published"})
        if(search) query.andWhere("(LOWER(paper.title) LIKE :search OR LOWER(paper.abstract) LIKE :search)",{search:`%${search.toLowerCase()}%`})
        if(category) query.andWhere("LOWER(paper.category) LIKE :category",{category:`%${category.toLowerCase()}%`})
        if(department) query.andWhere("paper.departmentId = :department",{department:parseInt(department)})
        query.orderBy("paper.publishedAt","DESC")
        const papers=await query.getMany()
        res.json({papers})
    }catch(e){
        console.error(e)
        res.status(500).json({error:"something went wrong"})
    }
})

router.get("/all",auth,requireRole("admin","teacher"),async(req,res)=>{
    try{
        const {search,status,category,page=1}=req.query
        const limit=6
        const skip=(page-1)*limit
        const query=Appdata.getRepository("Paper")
            .createQueryBuilder("paper")
            .leftJoinAndSelect("paper.student","student")
            .leftJoinAndSelect("paper.department","department")

        if(req.user.role==="teacher"){
            const teacher=await Appdata.getRepository("User").findOne({
                where:{id:req.user.id},
                relations:["department"]
            })
            if(teacher?.department?.id){
                query.andWhere("paper.departmentId = :deptId",{deptId:teacher.department.id})
            }
        }
        if(search) query.andWhere("(LOWER(paper.title) LIKE :search OR LOWER(paper.abstract) LIKE :search)",{search:`%${search.toLowerCase()}%`})
        if(status) query.andWhere("paper.status = :status",{status})
        if(category) query.andWhere("LOWER(paper.category) LIKE :category",{category:`%${category.toLowerCase()}%`})
        query.orderBy("paper.createdAt","DESC").skip(skip).take(limit)
        const [papers,total]=await query.getManyAndCount()
        res.json({papers,total,page:parseInt(page),totalPages:Math.ceil(total/limit)})
    }catch(e){
        console.error(e)
        res.status(500).json({error:"something went wrong"})
    }
})

router.post("/",auth,requireRole("student"),upload.single("file"),async(req,res)=>{
    try{
        const {title,abstract,category,departmentId}=req.body
        if(!title||!abstract||!category){
            return res.status(400).json({error:"title, abstract and category are required"})
        }
        const repo=getPaperRepo()
        const paper=repo.create({
            title,abstract,category,
            department:departmentId?{id:parseInt(departmentId)}:null,
            fileUrl:req.file?req.file.filename:null,
            status:"submitted",
            student:{id:req.user.id}
        })
        await repo.save(paper)
        res.status(201).json({message:"paper submitted!",paper})
    }catch(e){
        console.error(e)
        res.status(500).json({error:"something went wrong"})
    }
})

// teacher updates status — allowed: under_review, revision_needed, recommend_publish, rejected
router.patch("/:id/status",auth,requireRole("admin","teacher"),async(req,res)=>{
    try{
        const {status}=req.body
        const allowed=["under_review","revision_needed","recommend_publish","rejected","approved"]
        if(!allowed.includes(status)) return res.status(400).json({error:"invalid status"})
        const repo=getPaperRepo()
        const paper=await repo.findOne({where:{id:parseInt(req.params.id)}})
        if(!paper) return res.status(404).json({error:"paper not found"})
        paper.status=status
        await repo.save(paper)
        res.json({message:"status updated",paper})
    }catch{
        res.status(500).json({error:"something went wrong"})
    }
})

// student publishes their own paper only after recommend_publish
router.patch("/:id/publish",auth,requireRole("student"),async(req,res)=>{
    try{
        const repo=getPaperRepo()
        const paper=await repo.findOne({
            where:{id:parseInt(req.params.id)},
            relations:["student"]
        })
        if(!paper) return res.status(404).json({error:"paper not found"})
        if(paper.student.id!==req.user.id) return res.status(403).json({error:"not your paper"})
        if(paper.status!=="recommend_publish") return res.status(400).json({error:"paper must be recommended for publish first"})
        paper.status="published"
        paper.publishedAt=new Date()
        await repo.save(paper)
        res.json({message:"paper published!",paper})
    }catch{
        res.status(500).json({error:"something went wrong"})
    }
})

router.patch("/:id/assign-dept",auth,requireRole("admin"),async(req,res)=>{
    try{
        const {departmentId}=req.body
        const repo=getPaperRepo()
        const paper=await repo.findOne({where:{id:parseInt(req.params.id)}})
        if(!paper) return res.status(404).json({error:"paper not found"})
        paper.department={id:parseInt(departmentId)}
        await repo.save(paper)
        res.json({message:"paper assigned to department",paper})
    }catch{
        res.status(500).json({error:"something went wrong"})
    }
})

router.delete("/:id",auth,requireRole("admin"),async(req,res)=>{
    try{
        const repo=getPaperRepo()
        const paper=await repo.findOne({where:{id:parseInt(req.params.id)}})
        if(!paper) return res.status(404).json({error:"paper not found"})
        if(paper.fileUrl){
            const filePath=path.join(uploadDir,paper.fileUrl)
            if(fs.existsSync(filePath)) fs.unlinkSync(filePath)
        }
        await repo.remove(paper)
        res.json({message:"paper deleted"})
    }catch{
        res.status(500).json({error:"something went wrong"})
    }
})

module.exports=router