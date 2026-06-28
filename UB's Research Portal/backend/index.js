require("reflect-metadata")
require("dotenv").config()

const express=require("express")
const cors=require("cors")
const path=require("path")
const bcrypt=require("bcryptjs")
const {Appdata}=require("./src/config/database")

const authro=require("./src/routes/auth")
const rero=require("./src/routes/resource")
const userro=require("./src/routes/users")
const deptro=require("./src/routes/departments")
const papro=require("./src/routes/papers")

const app=express()
app.use(cors())
app.use(express.json())

app.use("/uploads",express.static(path.join(__dirname,"uploads")))

app.use("/api/auth",authro)
app.use("/api/resources",rero)
app.use("/api/users",userro)
app.use("/api/departments",deptro)
app.use("/api/papers",papro)

app.get("/",(req,res)=>res.json({message:"server is alive!"}))

async function createAdmin(){
    const userRepo=Appdata.getRepository("User")
    const existing=await userRepo.findOne({where:{email:"admin@research.com"}})
    if(!existing){
        const hashed=await bcrypt.hash("admin123",10)
        const admin=userRepo.create({
            name:"Admin",
            email:"admin@research.com",
            password:hashed,
            role:"admin"
        })
        await userRepo.save(admin)
        console.log("Admin created! email: admin@research.com | password: admin123")
    }else{
        console.log("Admin already exists")
    }
}

const PORT=5000

Appdata.initialize()
    .then(async()=>{
        console.log("Connected to DB yay!")
        await createAdmin()
        app.listen(PORT,()=>console.log(`Server running on http://localhost:${PORT}`))
    })
    .catch((err)=>console.error("Nay :(",err))