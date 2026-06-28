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

function getResourceRepo(){return Appdata.getRepository("Resource")}
function getUserRepo(){return Appdata.getRepository("User")}

router.get("/",auth,async(req,res)=>{
    try{
        const resources=await getResourceRepo().find({relations:["uploader","department"]})
        res.json({resources})
    }catch{
        res.status(500).json({error:"something went wrong"})
    }
})

router.post("/",auth,requireRole("teacher"),upload.single("file"),async(req,res)=>{
    try{
        const {name,description,field}=req.body
        if(!name||!description||!field){
            return res.status(400).json({error:"name, description and field required"})
        }
        const teacher=await getUserRepo().findOne({
            where:{id:req.user.id},
            relations:["department"]
        })
        const repo=getResourceRepo()
        const newResource=repo.create({
            name,description,field,
            fileUrl:req.file?req.file.filename:null,
            uploader:{id:req.user.id},
            ...(teacher?.department?{department:{id:teacher.department.id}}:{})
        })
        await repo.save(newResource)
        res.status(201).json({resource:newResource})
    }catch(e){
        console.error(e)
        res.status(500).json({error:"something went wrong"})
    }
})

router.delete("/:id",auth,requireRole("admin"),async(req,res)=>{
    const repo=getResourceRepo()
    const item=await repo.findOne({where:{id:parseInt(req.params.id)}})
    if(!item) return res.status(404).json({error:"not found"})
    if(item.fileUrl){
        const filePath=path.join(uploadDir,item.fileUrl)
        if(fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
    await repo.remove(item)
    res.json({message:"deleted"})
})

module.exports=router