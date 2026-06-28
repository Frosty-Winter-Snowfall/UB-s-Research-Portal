import {useState,useEffect} from "react"
import {useNavigate} from "react-router-dom"
import {useAuth} from "../context/AuthContext"
import api from "../api/axios"

const BASE_URL="http://localhost:3000"

// function statusStyle(status){
//     if(status==="approved") return {background:"#f0fdf4",color:"#16a34a",border:"1px solid #86efac"}
//     if(status==="rejected") return {background:"#fef2f2",color:"#dc2626",border:"1px solid #fca5a5"}
//     if(status==="under_review") return {background:"#eff6ff",color:"#2563eb",border:"1px solid #bfdbfe"}
//     if(status==="revision_needed") return {background:"#fffbeb",color:"#d97706",border:"1px solid #fcd34d"}
//     if(status==="recommend_publish") return {background:"#f0fdf4",color:"#059669",border:"1px solid #6ee7b7"}
//     if(status==="published") return {background:"#fdf4ff",color:"#9333ea",border:"1px solid #e9d5ff"}
//     return {background:"#f8fafc",color:"#64748b",border:"1px solid #e2e8f0"}
// }

export default function TeacherDashboard(){
    const {user,logout}=useAuth()
    const navigate=useNavigate()
    const [tab,setTab]=useState("papers")
    const [papers,setPapers]=useState([])
    const [resources,setResources]=useState([])
    const [resName,setResName]=useState("")
    const [resDesc,setResDesc]=useState("")
    const [resField,setResField]=useState("")
    const [resFile,setResFile]=useState(null)
    const [msg,setMsg]=useState("")
    const [msgType,setMsgType]=useState("ok")
    const [search,setSearch]=useState("")
    const [filterCategory,setFilterCategory]=useState("")
    const [filterStatus,setFilterStatus]=useState("")
    const [page,setPage]=useState(1)
    const [totalPages,setTotalPages]=useState(1)

    useEffect(()=>{fetchPapers();fetchResources()},[])
    useEffect(()=>{fetchPapers()},[page])

    async function fetchPapers(){
        try{
            const res=await api.get("/papers/all",{params:{search,category:filterCategory,status:filterStatus,page}})
            setPapers(res.data.papers)
            setTotalPages(res.data.totalPages||1)
        }catch{showMsg("Could not load papers","err")}
    }

    async function fetchResources(){
        try{
            const res=await api.get("/resources")
            setResources(res.data.resources)
        }catch{showMsg("Could not load resources","err")}
    }

    function showMsg(text,type="ok"){
        setMsg(text);setMsgType(type)
        setTimeout(()=>setMsg(""),3000)
    }

    async function updateStatus(paperId,status){
        try{
            await api.patch(`/papers/${paperId}/status`,{status})
            showMsg("Status updated successfully")
            fetchPapers()
        }catch(err){showMsg(err.response?.data?.error||"Failed","err")}
    }

    async function uploadResource(e){
        e.preventDefault()
        try{
            const formData=new FormData()
            formData.append("name",resName)
            formData.append("description",resDesc)
            formData.append("field",resField)
            if(resFile) formData.append("file",resFile)
            await api.post("/resources",formData,{headers:{"Content-Type":"multipart/form-data"}})
            showMsg("Resource uploaded successfully")
            setResName("");setResDesc("");setResField("");setResFile(null)
            fetchResources()
        }catch(err){showMsg(err.response?.data?.error||"Failed","err")}
    }

    function openPdf(fileUrl){
            if(!fileUrl) return

            const filename=fileUrl.split("\\").pop().split("/").pop()
            window.open(`http://localhost:5000/uploads/${filename}`,"_blank")
        }
    return(
        <div style={s.page}>
            <nav style={s.navbar}>
                <div style={s.navLeft}>
                    <span style={s.logo}>UB's Research<span style={s.accent}>Portal</span></span>
                    <span style={s.userTag}>{user?.name}</span>
                </div>
                <div style={s.navRight}>
                    <span style={{...s.rolePill,background:"#fdf4ff",color:"#9333ea",border:"1px solid #e9d5ff"}}>Faculty</span>
                    <button style={s.logoutBtn} onClick={()=>{logout();navigate("/")}}>Sign Out</button>
                </div>
            </nav>

            <div style={s.container}>
                <div style={s.pageHeader}>
                    <h1 style={s.pageTitle}>Faculty Dashboard</h1>
                    <p style={s.pageSubtitle}>Review student submissions and manage your study resources</p>
                </div>

                <div style={s.tabs}>
                    {["papers","resources","upload","hall-of-fame"].map(t=>(
                        <button key={t} onClick={()=>setTab(t)} style={{...s.tab,...(tab===t?s.activeTab:{})}}>
                            {t==="papers"&&"Review Papers"}
                            {t==="resources"&&"Resources"}
                            {t==="upload"&&"Upload Resource"}
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
                            <select style={s.filterSelect} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                                <option value="">All Statuses</option>
                                <option value="submitted">Submitted</option>
                                <option value="under_review">Under Review</option>
                                <option value="revision_needed">Revision Needed</option>
                                <option value="recommend_publish">Recommended to Publish</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <button style={s.searchBtn} onClick={()=>{setPage(1);fetchPapers()}}>Search</button>
                        </div>

                        {papers.length===0&&(
                            <div style={s.emptyState}>
                                <p style={s.emptyTitle}>No papers found</p>
                                <p style={s.emptySub}>No student submissions match your current filters.</p>
                            </div>
                        )}

                        {papers.map(p=>(
                            <div key={p.id} style={s.card}>
                                <div style={s.cardTop}>
                                    <div style={s.cardLeft}>
                                        <h3 style={s.cardTitle}>{p.title}</h3>
                                        <p style={s.cardMeta}>By {p.student?.name} · {p.category} · {p.department?.name||"No Dept"}</p>
                                    </div>
                                    <span style={{...s.statusBadge,...statusStyle(p.status)}}>{p.status.replace(/_/g," ")}</span>
                                </div>
                                <p style={s.cardAbstract}>{p.abstract?.slice(0,160)}...</p>
                                <div style={s.actionRow}>
                                    {p.fileUrl&&(
                                        <button style={{...s.actionBtn,...s.btnGray}} onClick={()=>openPdf(p.fileUrl)}>View PDF</button>
                                    )}
                                    <button style={{...s.actionBtn,...s.btnBlue}} onClick={()=>updateStatus(p.id,"under_review")}>Mark Under Review</button>
                                    <button style={{...s.actionBtn,...s.btnYellow}} onClick={()=>updateStatus(p.id,"revision_needed")}>Request Revision</button>
                                    <button style={{...s.actionBtn,...s.btnGreen}} onClick={()=>updateStatus(p.id,"recommend_publish")}>Recommend Publish</button>
                                    <button style={{...s.actionBtn,...s.btnRed}} onClick={()=>updateStatus(p.id,"rejected")}>Reject</button>
                                </div>
                            </div>
                        ))}

                        <div style={s.pagination}>
                            <button style={s.pageBtn} disabled={page===1} onClick={()=>setPage(page-1)}>Previous</button>
                            <span style={s.pageInfo}>Page {page} of {totalPages}</span>
                            <button style={s.pageBtn} disabled={page===totalPages} onClick={()=>setPage(page+1)}>Next</button>
                        </div>
                    </div>
                )}

                {tab==="resources"&&(
                    <div>
                        {resources.length===0&&(
                            <div style={s.emptyState}>
                                <p style={s.emptyTitle}>No resources uploaded</p>
                                <p style={s.emptySub}>Upload your first study resource for students.</p>
                            </div>
                        )}
                        {resources.map(r=>(
                            <div key={r.id} style={s.card}>
                                <div style={s.cardTop}>
                                    <div style={s.cardLeft}>
                                        <h3 style={s.cardTitle}>{r.name}</h3>
                                        <p style={s.cardMeta}>
                                            Uploaded by {r.uploader?.name}
                                            {r.department?.name&&<span> · {r.department.name}</span>}
                                        </p>
                                    </div>
                                    <span style={{...s.statusBadge,background:"#fdf4ff",color:"#9333ea",border:"1px solid #e9d5ff"}}>{r.field}</span>
                                </div>
                                <p style={s.cardAbstract}>{r.description}</p>
                                {r.fileUrl&&(
                                    <button style={{...s.actionBtn,...s.btnBlue,marginTop:"0.75rem"}} onClick={()=>openPdf(r.fileUrl)}>View PDF</button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {tab==="upload"&&(
                    <div style={s.formCard}>
                        <h2 style={s.formTitle}>Upload Study Resource</h2>
                        <p style={s.formSub}>Share lecture notes, slides, or reference materials with your students. It will be tagged to your department automatically.</p>
                        <form onSubmit={uploadResource} style={s.form}>
                            <div style={s.formGroup}>
                                <label style={s.label}>Resource Name</label>
                                <input style={s.input} placeholder="e.g. Introduction to Neural Networks" value={resName} onChange={e=>setResName(e.target.value)} required/>
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Field / Subject</label>
                                <input style={s.input} placeholder="e.g. Machine Learning, Quantum Physics" value={resField} onChange={e=>setResField(e.target.value)} required/>
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Description</label>
                                <textarea style={{...s.input,height:"100px",resize:"vertical"}} placeholder="Briefly describe what this resource covers..." value={resDesc} onChange={e=>setResDesc(e.target.value)} required/>
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Upload PDF (optional)</label>
                                <input style={s.fileInput} type="file" accept="application/pdf" onChange={e=>setResFile(e.target.files[0])}/>
                            </div>
                            <button style={s.submitBtn} type="submit">Upload Resource</button>
                        </form>
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
                <h2 style={{fontSize:"1.1rem",fontWeight:"700",color:"#0f172a",margin:"0 0 0.25rem"}}> Hall of Fame</h2>
                <p style={{color:"#64748b",fontSize:"0.875rem",margin:"0 0 1rem"}}>All published student research.</p>
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
                    {p.fileUrl&&<button style={{...s.actionBtn,...s.btnBlue,marginTop:"0.75rem"}} onClick={()=>openPdf(p.fileUrl)}>View PDF</button>}
                </div>
            ))}
        </div>
    )
}

function statusStyle(status) {
    if (status==="approved") return { 
        background: "#f0fdf4", 
        color: "#16a34a", 
        border: "1px solid #86efac" 
    }
    if (status==="rejected") return { 
        background: "#fef2f2", 
        color: "#dc2626", 
        border: "1px solid #fca5a5" 
    }
    if (status==="under_review") return { 
        background: "#eff6ff", 
        color: "#2563eb", 
        border: "1px solid #bfdbfe" 
    }
    if (status==="revision_needed") return { 
        background: "#fffbeb", 
        color: "#d97706", 
        border: "1px solid #fcd34d" 
    }
    if(status==="recommend_publish") return {
        background:"#f0fdf4",
        color:"#059669",
        border:"1px solid #6ee7b7"
    }

    if(status==="published") return {
        background:"#fdf4ff",
        color:"#9333ea",
        border:"1px solid #e9d5ff"
    }
    return { 
        background: "#f8fafc", 
        color: "#64748b", 
        border: "1px solid #e2e8f0" 
    }
}

const s = {
    page:  { 
        minHeight: "100vh", 
        background: "#f8fafc", 
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", 
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
        color: "#9333ea"
     },

    userTag: { 
        color: "#64748b", 
        fontSize: "0.875rem" 
    },

    rolePill: { 
        background: "#fdf4ff", 
        color: "#9333ea", 
        border: "1px solid #e9d5ff", 
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
        marginBottom: "2rem" 
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
         color: "#9333ea", 
         borderBottom: "2px solid #9333ea"
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
         borderRadius: "8px", fontSize: "0.875rem", 
         flex: 1, minWidth: "140px", 
         outline: "none" 
        },
    filterSelect: {
         padding: "0.55rem 0.85rem", 
         background: "#ffffff", 
         border: "1px solid #e2e8f0", 
         color: "#0f172a", borderRadius: "8px", 
         fontSize: "0.875rem", 
         outline: "none", cursor: "pointer" 
        },
    searchBtn: {
         padding: "0.55rem 1.25rem", 
         background: "#9333ea", 
         color: "#ffffff", border: "none", 
         borderRadius: "8px", 
         cursor: "pointer", 
         fontSize: "0.875rem", fontWeight: "500" 
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
           marginBottom: "0.6rem", gap: "1rem"
         },
    cardLeft: {
         flex: 1 
        },
    cardTitle: {
         margin: "0 0 0.25rem", 
         fontSize: "0.975rem", 
         fontWeight: "600", color: "#0f172a" },
    cardMeta: {
         margin: 0, color: "#94a3b8", 
         fontSize: "0.8rem" 
        },
    cardAbstract: {
         color: "#475569", 
         fontSize: "0.875rem", 
         lineHeight: "1.65", 
         margin: "0 0 1rem" 
        },
    statusBadge: {
         padding: "3px 10px", 
         borderRadius: "20px", 
         fontSize: "0.72rem", 
         fontWeight: "500", 
         whiteSpace: "nowrap", 
         textTransform: "capitalize" 
        },
    actionRow: {
         display: "flex", 
         gap: "0.5rem", 
         flexWrap: "wrap" },
    actionBtn: {
         padding: "0.35rem 0.9rem", 
         border: "1px solid", 
         borderRadius: "6px", 
         cursor: "pointer", 
         fontSize: "0.78rem", 
         fontWeight: "500", 
         background: "transparent" 
        },
    btnBlue: { 
        borderColor: "#bfdbfe", 
        color: "#2563eb" },
    btnGreen: { 
        borderColor: "#86efac", 
        color: "#16a34a" 

    },
    btnYellow: { 
        borderColor: "#fcd34d", 
        color: "#d97706" 

    },
    btnRed: { 
        borderColor: "#fca5a5", color: "#dc2626" 

    },
    pagination: { 
        display: "flex", gap: "1rem", 
        alignItems: "center", 
        justifyContent: "center", 
        marginTop: "1.5rem" 
    },
    pageBtn: {
         padding: "0.45rem 1.1rem", 
         background: "#ffffff",
          border: "1px solid #e2e8f0", 
         color: "#374151", 
         borderRadius: "6px",
          cursor: "pointer", 
         fontSize: "0.85rem" 
        },
    pageInfo: { 
        color: "#64748b", 
        fontSize: "0.875rem"
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
        color: "#374151" },
    input: { 
        
        padding: "0.65rem 0.9rem", 
        background: "#ffffff", 
        border: "1px solid #d1d5db", 
        color: "#0f172a", 
        borderRadius: "8px",
         fontSize: "0.9rem", 
         outline: "none", 
         width: "100%",
         
         boxSizing: "border-box" },
    submitBtn: { 
        padding: "0.75rem", 
        background: "#9333ea", 
        color: "#ffffff", border: "none", 
        borderRadius: "8px", cursor: "pointer", 
        fontSize: "0.9rem", fontWeight: "600",
         marginTop: "0.5rem" 
        },
}



// const s={
//     page:{minHeight:"100vh",background:"#f8fafc",fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",color:"#0f172a"},
//     navbar:{background:"#ffffff",borderBottom:"1px solid #e2e8f0",padding:"0 2rem",height:"64px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"},
//     navLeft:{display:"flex",alignItems:"center",gap:"1.5rem"},
//     navRight:{display:"flex",alignItems:"center",gap:"1rem"},
//     logo:{fontSize:"1.2rem",fontWeight:"700",color:"#0f172a",letterSpacing:"-0.5px"},
//     accent:{color:"#2563eb"},
//     userTag:{color:"#64748b",fontSize:"0.875rem"},
//     rolePill:{background:"#eff6ff",color:"#2563eb",border:"1px solid #bfdbfe",padding:"3px 12px",borderRadius:"20px",fontSize:"0.75rem",fontWeight:"500"},
//     logoutBtn:{background:"transparent",border:"1px solid #e2e8f0",color:"#64748b",padding:"0.4rem 1rem",cursor:"pointer",borderRadius:"6px",fontSize:"0.85rem"},
//     container:{maxWidth:"960px",margin:"0 auto",padding:"2.5rem 1.5rem"},
//     pageHeader:{marginBottom:"2rem"},
//     pageTitle:{fontSize:"1.75rem",fontWeight:"700",color:"#0f172a",margin:"0 0 0.35rem"},
//     pageSubtitle:{color:"#64748b",fontSize:"0.95rem",margin:0},
//     tabs:{display:"flex",borderBottom:"1px solid #e2e8f0",marginBottom:"2rem",gap:"0"},
//     tab:{padding:"0.75rem 1.25rem",background:"transparent",border:"none",borderBottom:"2px solid transparent",color:"#64748b",cursor:"pointer",fontSize:"0.9rem",fontWeight:"500",marginBottom:"-1px"},
//     activeTab:{color:"#2563eb",borderBottom:"2px solid #2563eb"},
//     filterRow:{display:"flex",gap:"0.75rem",marginBottom:"1.5rem",flexWrap:"wrap"},
//     filterInput:{padding:"0.55rem 0.85rem",background:"#ffffff",border:"1px solid #e2e8f0",color:"#0f172a",borderRadius:"8px",fontSize:"0.875rem",flex:1,minWidth:"140px",outline:"none"},
//     filterSelect:{padding:"0.55rem 0.85rem",background:"#ffffff",border:"1px solid #e2e8f0",color:"#0f172a",borderRadius:"8px",fontSize:"0.875rem",outline:"none",cursor:"pointer"},
//     searchBtn:{padding:"0.55rem 1.25rem",background:"#2563eb",color:"#ffffff",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:"0.875rem",fontWeight:"500"},
//     card:{background:"#ffffff",border:"1px solid #e2e8f0",borderRadius:"12px",padding:"1.25rem 1.5rem",marginBottom:"0.875rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"},
//     cardTop:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.6rem",gap:"1rem"},
//     cardLeft:{flex:1},
//     cardTitle:{margin:"0 0 0.25rem",fontSize:"0.975rem",fontWeight:"600",color:"#0f172a"},
//     cardMeta:{margin:0,color:"#94a3b8",fontSize:"0.8rem"},
//     cardAbstract:{color:"#475569",fontSize:"0.875rem",lineHeight:"1.65",margin:0},
//     statusBadge:{padding:"3px 10px",borderRadius:"20px",fontSize:"0.72rem",fontWeight:"500",whiteSpace:"nowrap",textTransform:"capitalize"},
//     emptyState:{background:"#ffffff",border:"1px solid #e2e8f0",borderRadius:"12px",padding:"3rem",textAlign:"center"},
//     emptyTitle:{fontWeight:"600",color:"#0f172a",margin:"0 0 0.35rem",fontSize:"1rem"},
//     emptySub:{color:"#94a3b8",fontSize:"0.875rem",margin:0},
//     msg:{border:"1px solid",padding:"0.75rem 1rem",borderRadius:"8px",marginBottom:"1rem",fontSize:"0.875rem"},
//     formCard:{background:"#ffffff",border:"1px solid #e2e8f0",borderRadius:"12px",padding:"2rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"},
//     formTitle:{fontSize:"1.1rem",fontWeight:"700",color:"#0f172a",margin:"0 0 0.35rem"},
//     formSub:{color:"#64748b",fontSize:"0.875rem",margin:"0 0 1.75rem"},
//     form:{display:"flex",flexDirection:"column",gap:"1.25rem"},
//     formGroup:{display:"flex",flexDirection:"column",gap:"0.4rem"},
//     label:{fontSize:"0.825rem",fontWeight:"500",color:"#374151"},
//     input:{padding:"0.65rem 0.9rem",background:"#ffffff",border:"1px solid #d1d5db",color:"#0f172a",borderRadius:"8px",fontSize:"0.9rem",outline:"none",width:"100%",boxSizing:"border-box"},
//     fileInput:{padding:"0.65rem 0.9rem",background:"#f8fafc",border:"1px solid #d1d5db",color:"#0f172a",borderRadius:"8px",fontSize:"0.875rem",width:"100%",boxSizing:"border-box",cursor:"pointer"},
//     submitBtn:{padding:"0.75rem",background:"#2563eb",color:"#ffffff",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:"0.9rem",fontWeight:"600",marginTop:"0.5rem"},
//     actionRow:{display:"flex",gap:"0.5rem",marginTop:"0.875rem",flexWrap:"wrap"},
//     actionBtn:{padding:"0.35rem 0.85rem",background:"transparent",border:"1px solid",borderRadius:"6px",fontSize:"0.78rem",cursor:"pointer",fontWeight:"500"},
//     btnBlue:{borderColor:"#bfdbfe",color:"#2563eb"},
//     btnGreen:{borderColor:"#86efac",color:"#16a34a"},
//     btnYellow:{borderColor:"#fcd34d",color:"#d97706"},
//     btnRed:{borderColor:"#fca5a5",color:"#dc2626"},
//     btnGray:{borderColor:"#e2e8f0",color:"#64748b"},
//     pagination:{display:"flex",alignItems:"center",justifyContent:"center",gap:"1rem",marginTop:"1.5rem"},
//     pageBtn:{padding:"0.45rem 1rem",background:"#ffffff",border:"1px solid #e2e8f0",color:"#374151",borderRadius:"6px",cursor:"pointer",fontSize:"0.85rem"},
//     pageInfo:{color:"#64748b",fontSize:"0.875rem"},
// }