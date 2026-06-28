import {useState,useEffect} from "react"
import {useNavigate} from "react-router-dom"
import {useAuth} from "../context/AuthContext"
import api from "../api/axios"

const BASE_URL="http://localhost:3000"

function statusStyle(status){
    if(status==="approved") return {background:"#f0fdf4",color:"#16a34a",border:"1px solid #86efac"}
    if(status==="rejected") return {background:"#fef2f2",color:"#dc2626",border:"1px solid #fca5a5"}
    if(status==="under_review") return {background:"#eff6ff",color:"#2563eb",border:"1px solid #bfdbfe"}
    if(status==="revision_needed") return {background:"#fffbeb",color:"#d97706",border:"1px solid #fcd34d"}
    if(status==="recommend_publish") return {background:"#f0fdf4",color:"#059669",border:"1px solid #6ee7b7"}
    if(status==="published") return {background:"#fdf4ff",color:"#9333ea",border:"1px solid #e9d5ff"}
    return {background:"#f8fafc",color:"#64748b",border:"1px solid #e2e8f0"}
}

export default function StudentDashboard(){
    const {user,logout}=useAuth()
    const navigate=useNavigate()
    const [tab,setTab]=useState("papers")
    const [papers,setPapers]=useState([])
    const [resources,setResources]=useState([])
    const [departments,setDepartments]=useState([])
    const [title,setTitle]=useState("")
    const [abstract,setAbstract]=useState("")
    const [category,setCategory]=useState("")
    const [department,setDepartment]=useState("")
    const [file,setFile]=useState(null)
    const [msg,setMsg]=useState("")
    const [msgType,setMsgType]=useState("ok")
    const [search,setSearch]=useState("")
    const [resourceSearch,setResourceSearch]=useState("")
    const [filterDepartment,setFilterDepartment]=useState("")
    const [filterStatus,setFilterStatus]=useState("")
    const [filterCategory,setFilterCategory]=useState("")

    useEffect(()=>{fetchMyPapers();fetchResources();fetchDepartments()},[])

    const filteredResources = resources.filter(r =>
    r.name?.toLowerCase().includes(resourceSearch.toLowerCase()) ||
    r.field?.toLowerCase().includes(resourceSearch.toLowerCase()) ||
    r.uploader?.name?.toLowerCase().includes(resourceSearch.toLowerCase())
)

//     function filteredResources() {
//     const filtered = resources.filter(r =>
//         r.name?.toLowerCase().includes(resourceSearch.toLowerCase()) ||
//         r.field?.toLowerCase().includes(resourceSearch.toLowerCase()) ||
//         r.uploader?.name?.toLowerCase().includes(resourceSearch.toLowerCase())
//     )
//     setResources(filtered)
// }

    async function fetchMyPapers(){
        try{
            const res=await api.get("/papers/mine",{params:{search,category:filterCategory,department:filterDepartment,status:filterStatus}})
            setPapers(res.data.papers)
        }catch{showMsg("Could not load papers","err")}
    }

    async function fetchResources(){
        try{
            const res=await api.get("/resources")
            setResources(res.data.resources)
        }catch{showMsg("Could not load resources","err")}
    }

    async function fetchDepartments(){
        try{
            const res=await api.get("/departments")
            setDepartments(res.data.departments)
        }catch{showMsg("Could not load departments","err")}
    }

    function showMsg(text,type="ok"){
        setMsg(text);setMsgType(type)
        setTimeout(()=>setMsg(""),3000)
    }

    async function submitPaper(e){
        e.preventDefault()
        try{
            const formData=new FormData()
            formData.append("title",title)
            formData.append("abstract",abstract)
            formData.append("category",category)
            formData.append("departmentId",department)
            if(file) formData.append("file",file)
            await api.post("/papers",formData,{headers:{"Content-Type":"multipart/form-data"}})
            showMsg("Paper submitted successfully")
            setTitle("");setAbstract("");setCategory("");setDepartment("");setFile(null)
            fetchMyPapers()
        }catch(err){showMsg(err.response?.data?.error||"Submission failed","err")}
    }

    async function publishPaper(paperId){
        try{
            await api.patch(`/papers/${paperId}/publish`)
            showMsg("Paper published to Hall of Fame!")
            fetchMyPapers()
        }catch(err){showMsg(err.response?.data?.error||"Publish failed","err")}
    }

function openPdf(filename){window.open(`http://localhost:5000/uploads/${filename}`,"_blank")}


    return(
        <div style={s.page}>
            <nav style={s.navbar}>
                <div style={s.navLeft}>
                    <span style={s.logo}>UB's Research<span style={s.accent}>Portal</span></span>
                    <span style={s.userTag}>{user?.name}</span>
                </div>
                <div style={s.navRight}>
                    <span style={s.rolePill}>Student</span>
                    <button style={s.logoutBtn} onClick={()=>{logout();navigate("/")}}>Sign Out</button>
                </div>
            </nav>

            <div style={s.container}>
                <div style={s.pageHeader}>
                    <h1 style={s.pageTitle}>My Dashboard</h1>
                    <p style={s.pageSubtitle}>Manage your research submissions and access study materials</p>
                </div>

                <div style={s.tabs}>
                    {["papers","submit","resources","hall-of-fame"].map(t=>(
                        <button key={t} onClick={()=>setTab(t)} style={{...s.tab,...(tab===t?s.activeTab:{})}}>
                            {t==="papers"&&"My Papers"}
                            {t==="submit"&&"Submit Paper"}
                            {t==="resources"&&"Resources"}
                            {t==="hall-of-fame"&&"Hall of Fame"}
                        </button>
                    ))}
                </div>

                {msg&&<div style={{...s.msg,background:msgType==="err"?"#fef2f2":"#f0fdf4",borderColor:msgType==="err"?"#fca5a5":"#86efac",color:msgType==="err"?"#dc2626":"#16a34a"}}>{msg}</div>}

                {tab==="papers"&&(
                    <div>
                        <div style={s.filterRow}>
                            <input style={s.filterInput} placeholder="Search by title..." value={search} onChange={e=>setSearch(e.target.value)}/>
                            <input style={s.filterInput} placeholder="Filter by category..." value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}/>
                            <select style={s.filterSelect} value={filterDepartment} onChange={e=>setFilterDepartment(e.target.value)}>
                                <option value="">All Departments</option>
                                {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <select style={s.filterSelect} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                                <option value="">All Statuses</option>
                                <option value="submitted">Submitted</option>
                                <option value="under_review">Under Review</option>
                                <option value="revision_needed">Revision Needed</option>
                                <option value="recommend_publish">Recommended to Publish</option>
                                <option value="published">Published</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <button style={s.searchBtn} onClick={fetchMyPapers}>Search</button>
                        </div>

                        {papers.length===0&&(
                            <div style={s.emptyState}>
                                <p style={s.emptyTitle}>No papers found</p>
                                <p style={s.emptySub}>Submit your first research paper to get started.</p>
                            </div>
                        )}

                        {papers.map(p=>(
                            <div key={p.id} style={s.card}>
                                <div style={s.cardTop}>
                                    <div style={s.cardLeft}>
                                        <h3 style={s.cardTitle}>{p.title}</h3>
                                        <p style={s.cardMeta}>{p.category} · {p.department?.name||"No Department"}</p>
                                    </div>
                                    <span style={{...s.statusBadge,...statusStyle(p.status)}}>{p.status.replace(/_/g," ")}</span>
                                </div>
                                <p style={s.cardAbstract}>{p.abstract?.slice(0,160)}...</p>
                                <div style={{display:"flex",gap:"0.5rem",marginTop:"0.75rem",flexWrap:"wrap"}}>
                                    {p.fileUrl&&(
                                        <button style={{...s.smallBtn,borderColor:"#bfdbfe",color:"#2563eb"}} onClick={()=>openPdf(p.fileUrl)}>
                                            View PDF
                                        </button>
                                    )}
                                    {p.status==="recommend_publish"&&(
                                        <button style={{...s.smallBtn,borderColor:"#6ee7b7",color:"#059669",fontWeight:"600"}} onClick={()=>publishPaper(p.id)}>
                                            Publish to Hall of Fame
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab==="submit"&&(
                    <div style={s.formCard}>
                        <h2 style={s.formTitle}>Submit a Research Paper</h2>
                        <p style={s.formSub}>Your paper will be reviewed by faculty before being published.</p>
                        <form onSubmit={submitPaper} style={s.form}>
                            <div style={s.formGroup}>
                                <label style={s.label}>Paper Title</label>
                                <input style={s.input} placeholder="Enter the full title of your paper" value={title} onChange={e=>setTitle(e.target.value)} required/>
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Category</label>
                                <input style={s.input} placeholder="e.g. Computer Science, Biology, Economics..." value={category} onChange={e=>setCategory(e.target.value)} required/>
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Department</label>
                                <select style={s.input} value={department} onChange={e=>setDepartment(e.target.value)}>
                                    <option value="">Select your department</option>
                                    {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Abstract</label>
                                <textarea style={{...s.input,height:"120px",resize:"vertical"}} placeholder="Write a brief summary of your research..." value={abstract} onChange={e=>setAbstract(e.target.value)} required/>
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Upload PDF</label>
                                <input style={s.fileInput} type="file" accept="application/pdf" onChange={e=>setFile(e.target.files[0])}/>
                            </div>
                            <button style={s.submitBtn} type="submit">Submit Paper</button>
                        </form>
                    </div>
                )}

                {/* {tab==="resources"&&(
                        <div>
                        <div style={s.filterRow}>
                            <input style={s.filterInput} placeholder="Search by name, field or teacher..." value={resourceSearch} onChange={e=>setResourceSearch(e.target.value)}/>
                        </div>
                        </div>
                    <div>
                        {resources.length===0&&(
                            <div style={s.emptyState}>
                                <p style={s.emptyTitle}>No resources yet</p>
                                <p style={s.emptySub}>Your teachers haven't uploaded any study materials yet.</p>
                            </div>
                        )}
                        {filteredResources.map(r=>(
                            <div key={r.id} style={s.card}>
                                <div style={s.cardTop}>
                                    <div style={s.cardLeft}>
                                        <h3 style={s.cardTitle}>{r.name}</h3>
                                        <p style={s.cardMeta}>
                                            Uploaded by {r.uploader?.name}
                                            {r.department?.name&&<span> · {r.department.name}</span>}
                                        </p>
                                    </div>
                                    <span style={{...s.statusBadge,background:"#eff6ff",color:"#2563eb",border:"1px solid #bfdbfe"}}>{r.field}</span>
                                </div>
                                <p style={s.cardAbstract}>{r.description}</p>
                                {r.fileUrl&&(
                                    <button style={{...s.smallBtn,borderColor:"#bfdbfe",color:"#2563eb",marginTop:"0.75rem"}} onClick={()=>openPdf(r.fileUrl)}>
                                        View PDF
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )} */}
                {tab==="resources"&&(
    <div>
        <div style={s.filterRow}>
            <input
                style={s.filterInput}
                placeholder="Search by name, field or teacher..."
                value={resourceSearch}
                onChange={e=>setResourceSearch(e.target.value)}
            />
        </div>
                    {/* <button style={s.searchBtn} onClick={filteredResources}>
    Search
</button> */}
        {filteredResources.length===0 && (
            <div style={s.emptyState}>
                <p style={s.emptyTitle}>No resources found</p>
                <p style={s.emptySub}>Try a different search.</p>
            </div>
        )}

        {filteredResources.map(r=>(
            <div key={r.id} style={s.card}>
                <div style={s.cardTop}>
                    <div style={s.cardLeft}>
                        <h3 style={s.cardTitle}>{r.name}</h3>
                        <p style={s.cardMeta}>
                            Uploaded by {r.uploader?.name}
                            {r.department?.name && <span> · {r.department.name}</span>}
                        </p>
                    </div>
                    <span style={{...s.statusBadge,background:"#eff6ff",color:"#2563eb",border:"1px solid #bfdbfe"}}>
                        {r.field}
                    </span>
                </div>

                <p style={s.cardAbstract}>{r.description}</p>

                {r.fileUrl && (
                    <button
                        style={{...s.smallBtn,borderColor:"#bfdbfe",color:"#2563eb",marginTop:"0.75rem"}}
                        onClick={()=>openPdf(r.fileUrl)}
                    >
                        View PDF
                    </button>
                )}
            </div>
        ))}
    </div>
)}
                {tab==="hall-of-fame"&&<HallOfFameTab/>}
            </div>
        </div>
    )
}

function HallOfFameTab(){
    const [papers,setPapers]=useState([])
    const [search,setSearch]=useState("")
    const [category,setCategory]=useState("")

    useEffect(()=>{fetchPublished()},[])

    async function fetchPublished(){
        try{
            const res=await api.get("/papers/published",{params:{search,category}})
            setPapers(res.data.papers)
        }catch{}
    } 

    function openPdf(fileUrl){
    if(!fileUrl) return

    const filename=fileUrl.split("\\").pop().split("/").pop()
    window.open(`http://localhost:5000/uploads/${filename}`,"_blank")
}


    return(
        <div>
            <div style={{marginBottom:"1.5rem"}}>
                <h2 style={{fontSize:"1.1rem",fontWeight:"700",color:"#0f172a",margin:"0 0 0.25rem"}}>Hall of Fame</h2>
                <p style={{color:"#64748b",fontSize:"0.875rem",margin:"0 0 1rem"}}>Published research from students across all departments.</p>
                <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap"}}>
                    <input style={s.filterInput} placeholder="Search papers..." value={search} onChange={e=>setSearch(e.target.value)}/>
                    <input style={s.filterInput} placeholder="Filter by category..." value={category} onChange={e=>setCategory(e.target.value)}/>
                    <button style={s.searchBtn} onClick={fetchPublished}>Search</button>
                </div>
            </div>
            {papers.length===0&&(
                <div style={s.emptyState}>
                    <p style={s.emptyTitle}>No published papers yet</p>
                    <p style={s.emptySub}>Published research will appear here.</p>
                </div>
            )}
            {papers.map(p=>(
                <div key={p.id} style={s.card}>
                    <div style={s.cardTop}>
                        <div style={s.cardLeft}>
                            <h3 style={s.cardTitle}>{p.title}</h3>
                            <p style={s.cardMeta}>{p.student?.name} · {p.department?.name||"No Department"} · {p.category}</p>
                        </div>
                        <span style={{...s.statusBadge,background:"#fdf4ff",color:"#9333ea",border:"1px solid #e9d5ff"}}>Published</span>
                    </div>
                    <p style={s.cardAbstract}>{p.abstract?.slice(0,200)}...</p>
                    {p.fileUrl&&<button style={{...s.smallBtn,borderColor:"#bfdbfe",color:"#2563eb",marginTop:"0.75rem"}} onClick={()=>openPdf(p.fileUrl)}>View PDF</button>}
                </div>
            ))}
        </div>
    )
}

const s = {
    page: {
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
        color: "#0f172a"
    },

    navbar: {
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 2rem",
        height: "64px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    },

    navLeft: {
        display: "flex",
        alignItems: "center",
        gap: "1.5rem"
    },

    navRight: {
        display: "flex",
        alignItems: "center",
        gap: "1rem"
    },

    logo: {
        fontSize: "1.2rem",
        fontWeight: "700",
        color: "#0f172a",
        letterSpacing: "-0.5px"
    },

    accent: {
        color: "#2563eb"
    },

    userTag: {
        color: "#64748b",
        fontSize: "0.875rem"
    },

    rolePill: {
        background: "#eff6ff",
        color: "#2563eb",
        border: "1px solid #bfdbfe",
        padding: "3px 12px",
        borderRadius: "20px",
        fontSize: "0.75rem",
        fontWeight: "500"
    },

    logoutBtn: {
        background: "transparent",
        border: "1px solid #e2e8f0",
        color: "#64748b",
        padding: "0.4rem 1rem",
        cursor: "pointer",
        borderRadius: "6px",
        fontSize: "0.85rem"
    },

    container: {
        maxWidth: "960px",
        margin: "0 auto",
        padding: "2.5rem 1.5rem"
    },

    pageHeader: {
        marginBottom: "2rem"
    },

    pageTitle: {
        fontSize: "1.75rem",
        fontWeight: "700",
        color: "#0f172a",
        margin: "0 0 0.35rem"
    },

    pageSubtitle: {
        color: "#64748b",
        fontSize: "0.95rem",
        margin: 0
    },

    tabs: {
        display: "flex",
        borderBottom: "1px solid #e2e8f0",
        marginBottom: "2rem",
        gap: "0"
    },

    tab: {
        padding: "0.75rem 1.25rem",
        background: "transparent",
        border: "none",
        borderBottom: "2px solid transparent",
        color: "#64748b",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: "500",
        marginBottom: "-1px"
    },

    activeTab: {
        color: "#2563eb",
        borderBottom: "2px solid #2563eb"
    },

    filterRow: {
        display: "flex",
        gap: "0.75rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap"
    },

    filterInput: {
        padding: "0.55rem 0.85rem",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        color: "#0f172a",
        borderRadius: "8px",
        fontSize: "0.875rem",
        flex: 1,
        minWidth: "140px",
        outline: "none"
    },

    filterSelect: {
        padding: "0.55rem 0.85rem",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        color: "#0f172a",
        borderRadius: "8px",
        fontSize: "0.875rem",
        outline: "none",
        cursor: "pointer"
    },

    searchBtn: {
        padding: "0.55rem 1.25rem",
        background: "#2563eb",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "0.875rem",
        fontWeight: "500"
    },

    card: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "1.25rem 1.5rem",
        marginBottom: "0.875rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
    },

    cardTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "0.6rem",
        gap: "1rem"
    },

    cardLeft: {
        flex: 1
    },

    cardTitle: {
        margin: "0 0 0.25rem",
        fontSize: "0.975rem",
        fontWeight: "600",
        color: "#0f172a"
    },

    cardMeta: {
        margin: 0,
        color: "#94a3b8",
        fontSize: "0.8rem"
    },

    cardAbstract: {
        color: "#475569",
        fontSize: "0.875rem",
        lineHeight: "1.65",
        margin: 0
    },

    statusBadge: {
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "0.72rem",
        fontWeight: "500",
        whiteSpace: "nowrap",
        textTransform: "capitalize"
    },

    emptyState: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "3rem",
        textAlign: "center"
    },

    emptyTitle: {
        fontWeight: "600",
        color: "#0f172a",
        margin: "0 0 0.35rem",
        fontSize: "1rem"
    },

    emptySub: {
        color: "#94a3b8",
        fontSize: "0.875rem",
        margin: 0
    },

    msg: {
        border: "1px solid",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        marginBottom: "1rem",
        fontSize: "0.875rem"
    },

    formCard: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
    },

    formTitle: {
        fontSize: "1.1rem",
        fontWeight: "700",
        color: "#0f172a",
        margin: "0 0 0.35rem"
    },

    formSub: {
        color: "#64748b",
        fontSize: "0.875rem",
        margin: "0 0 1.75rem"
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem"
    },

    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem"
    },

    label: {
        fontSize: "0.825rem",
        fontWeight: "500",
        color: "#374151"
    },

    input: {
        padding: "0.65rem 0.9rem",
        background: "#ffffff",
        border: "1px solid #d1d5db",
        color: "#0f172a",
        borderRadius: "8px",
        fontSize: "0.9rem",
        outline: "none",
        width: "100%",
        boxSizing: "border-box"
    },

    fileInput: {
        padding: "0.65rem 0.9rem",
        background: "#f8fafc",
        border: "1px solid #d1d5db",
        color: "#0f172a",
        borderRadius: "8px",
        fontSize: "0.875rem",
        width: "100%",
        boxSizing: "border-box",
        cursor: "pointer"
    },

    submitBtn: {
        padding: "0.75rem",
        background: "#2563eb",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: "600",
        marginTop: "0.5rem"
    },

    smallBtn: {
        padding: "0.35rem 0.85rem",
        background: "transparent",
        border: "1px solid",
        borderRadius: "6px",
        fontSize: "0.78rem",
        cursor: "pointer",
        fontWeight: "500"
    }
};