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

function roleStyle(role) {
    if (role==="admin") return { background: "#f8fef2", color: "#6ac00d", border: "1px solid #bcfca5" }
    if (role==="teacher") return { background: "#fdf4ff", color: "#9333ea", border: "1px solid #e9d5ff" }
    return { background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }
}

export default function AdminDashboard(){
    const {user,logout}=useAuth()
    const navigate=useNavigate()
    const [tab,setTab]=useState("departments")
    const [departments,setDepartments]=useState([])
    const [papers,setPapers]=useState([])
    const [users,setUsers]=useState([])
    const [resources,setResources]=useState([])
    const [deptName,setDeptName]=useState("")
    const [deptDesc,setDeptDesc]=useState("")
    const [msg,setMsg]=useState("")
    const [msgType,setMsgType]=useState("ok")
    const [paperSearch,setPaperSearch]=useState("")
    const [paperStatus,setPaperStatus]=useState("")
    const [resourceSearch,setResourceSearch]=useState("")
    const [userSearch,setUserSearch]=useState("")
    const [userRole,setUserRole]=useState("")
    const [page,setPage]=useState(1)
    const [totalPages,setTotalPages]=useState(1)

    useEffect(()=>{fetchDepartments();fetchPapers();fetchUsers();fetchResources()},[])
    useEffect(()=>{fetchPapers()},[page])

    async function fetchDepartments(){
        try{
            const res=await api.get("/departments")
            setDepartments(res.data.departments)
        }catch{showMsg("Could not load departments","err")}
    }

    async function fetchPapers(){
        try{
            const res=await api.get("/papers/all",{params:{search:paperSearch,status:paperStatus,page}})
            setPapers(res.data.papers)
            setTotalPages(res.data.totalPages||1)
        }catch{showMsg("Could not load papers","err")}
    }

    async function fetchUsers(){
        try{
            const res=await api.get("/users")
            setUsers(res.data.users)
        }catch{showMsg("Could not load users","err")}
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

    async function createDepartment(e){
        e.preventDefault()
        try{
            await api.post("/departments",{name:deptName,description:deptDesc})
            showMsg("Department created successfully")
            setDeptName("");setDeptDesc("")
            fetchDepartments()
        }catch(err){showMsg(err.response?.data?.error||"Failed","err")}
    }

    async function assignTeacher(deptId,teacherId){
        try{
            await api.post(`/departments/${deptId}/assign-teacher`,{teacherId:parseInt(teacherId)})
            showMsg("Teacher assigned to department")
            fetchUsers()
        }catch(err){showMsg(err.response?.data?.error||"Failed","err")}
    }

    async function assignDept(paperId,deptId){
        try{
            await api.patch(`/papers/${paperId}/assign-dept`,{departmentId:parseInt(deptId)})
            showMsg("Paper assigned to department")
            fetchPapers()
        }catch(err){showMsg(err.response?.data?.error||"Failed","err")}
    }

    async function updatePaperStatus(paperId,status){
        try{
            await api.patch(`/papers/${paperId}/status`,{status})
            showMsg("Status updated")
            fetchPapers()
        }catch(err){showMsg(err.response?.data?.error||"Failed","err")}
    }

    async function deletePaper(id){
        if(!window.confirm("Delete this paper permanently?")) return
        try{
            await api.delete(`/papers/${id}`)
            showMsg("Paper deleted")
            fetchPapers()
        }catch{showMsg("Failed to delete","err")}
    }

    async function deleteResource(id){
        if(!window.confirm("Delete this resource permanently?")) return
        try{
            await api.delete(`/resources/${id}`)
            showMsg("Resource deleted")
            fetchResources()
        }catch{showMsg("Failed to delete","err")}
    }

    async function toggleBlacklist(userId,currentlyBlacklisted){
        if(userId===user.id) return showMsg("You cannot blacklist yourself","err")
        const confirmMsg=currentlyBlacklisted?"Reinstate this user?":"Blacklist this user? They will lose access immediately."
        if(!window.confirm(confirmMsg)) return
        try{
            await api.patch(`/users/${userId}/blacklist`)
            showMsg(currentlyBlacklisted?"User reinstated":"User blacklisted")
            fetchUsers()
        }catch(err){showMsg(err.response?.data?.error||"Failed","err")}
    }

    async function deleteDepartment(id) {
    if (!window.confirm("Delete this department permanently?")) return

    try {
        await api.delete(`/departments/${id}`)
        showMsg("Department deleted successfully")
        fetchDepartments()
    } catch (err) {
        showMsg(err.response?.data?.error || "Failed to delete", "err")
    }
}

    function openPdf(filename){window.open(`http://localhost:5000/uploads/${filename}`,"_blank")}


    const teachers=users.filter(u=>u.role==="teacher")

    const filteredUsers=users.filter(u=>{
        const matchName=u.name.toLowerCase().includes(userSearch.toLowerCase())||u.email.toLowerCase().includes(userSearch.toLowerCase())
        const matchRole=userRole?u.role===userRole:true
        return matchName&&matchRole
    })

    const filteredResources=resources.filter(r=>
        r.name?.toLowerCase().includes(resourceSearch.toLowerCase())||
        r.field?.toLowerCase().includes(resourceSearch.toLowerCase())||
        r.uploader?.name?.toLowerCase().includes(resourceSearch.toLowerCase())
    )

    const approved=papers.filter(p=>p.status==="approved").length
    const pending=papers.filter(p=>p.status==="submitted").length
    const rejected=papers.filter(p=>p.status==="rejected").length
    const published=papers.filter(p=>p.status==="published").length

    return(
        <div style={s.page}>
            
            <nav style={s.navbar}>
                <div style={s.navLeft}>
                    <span style={s.logo}>UB's Research<span style={s.accent}>Portal</span></span>
                    <span style={s.userTag}>{user?.name}</span>
                </div>
                <div style={s.navRight}>
                    <span style={{...s.rolePill,background: "#f8fef2", color: "#6ac00d", border: "1px solid #bcfca5"}}>Admin</span>
                    <button style={s.logoutBtn} onClick={()=>{logout();navigate("/")}}>Sign Out</button>
                </div>
            </nav>

            <div style={s.container}>
                <div style={s.pageHeader}>
                    <h1 style={s.pageTitle}>Admin Dashboard</h1>
                    <p style={s.pageSubtitle}>Manage departments, review submissions, and oversee platform activity</p>
                </div>

                <div style={s.statsRow}>
                    {[
                        {label:"Total Papers",value:papers.length,color:"#0f172a"},
                        {label:"Pending",value:pending,color:"#d97706"},
                        {label:"Approved",value:approved,color:"#16a34a"},
                        {label:"Published",value:published,color:"#9333ea"},
                        {label:"Rejected",value:rejected,color:"#dc2626"},
                        {label:"Departments",value:departments.length,color:"#2563eb"},
                        {label:"Total Users",value:users.length,color:"#7c3aed"},
                    ].map(stat=>(
                        <div key={stat.label} style={s.statCard}>
                            <span style={{...s.statNum,color:stat.color}}>{stat.value}</span>
                            <span style={s.statLabel}>{stat.label}</span>
                        </div>
                    ))}
                </div>

                <div style={s.tabs}>
                    {["departments","papers","resources","users","hall-of-fame"].map(t=>(
                        <button key={t} onClick={()=>setTab(t)} style={{...s.tab,...(tab===t?s.activeTab:{})}}>
                            {t==="departments"&&"Departments"}
                            {t==="papers"&&"Papers"}
                            {t==="resources"&&"Resources"}
                            {t==="users"&&"Users"}
                            {t==="hall-of-fame"&&"Hall of Fame"}
                        </button>
                    ))}
                </div>

                {msg&&<div style={{...s.msg,background:msgType==="err"?"#fef2f2":"#f0fdf4",borderColor:msgType==="err"?"#fca5a5":"#86efac",color:msgType==="err"?"#dc2626":"#16a34a"}}>{msg}</div>}

                {tab==="departments"&&(
                    <div>
                        <form onSubmit={createDepartment} style={s.inlineForm}>
                            <input style={s.filterInput} placeholder="Department name" value={deptName} onChange={e=>setDeptName(e.target.value)} required/>
                            <input style={s.filterInput} placeholder="Description (optional)" value={deptDesc} onChange={e=>setDeptDesc(e.target.value)}/>
                            <button style={s.createBtn} type="submit">Create Department</button>
                        </form>
                        {departments.length===0&&(
                            <div style={s.emptyState}>
                                <p style={s.emptyTitle}>No departments yet</p>
                                <p style={s.emptySub}>Create your first department to start organising research.</p>
                            </div>
                        )}
                        {departments.map(d=>(
                            <div key={d.id} style={s.card}>
                                <div style={s.cardTop}>
                                    <div style={s.cardLeft}>
                                        <h3 style={s.cardTitle}>{d.name}</h3>
                                        {d.description&&<p style={s.cardMeta}>{d.description}</p>}
                                    </div>
                                    <span style={{...s.statusBadge,background:"#eff6ff",color:"#2563eb",border:"1px solid #bfdbfe"}}>Dept #{d.id}</span>
                                </div>
                                <div style={s.assignRow}>
                                    <label style={s.assignLabel}>Assign teacher</label>
                                    <select style={s.select} defaultValue="" onChange={e=>assignTeacher(d.id,e.target.value)}>
                                        <option value="" disabled>Select a teacher...</option>
                                        {teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                {/* <div style={{ display: "flex", gap: "0.5rem" }}> */}
    {/* <span style={{...s.statusBadge,background:"#eff6ff",color:"#2563eb",border:"1px solid #bfdbfe"}}>
        Dept #{d.id}
    </span> */}

    {/* <button
        style={{...s.actionBtn, borderColor:"#fecaca", color:"#dc2626"}}
        onClick={() => deleteDepartment(d.id)}
    >
        Delete
    </button> */}
{/* </div> */}
                            </div>
                        ))}
                    </div>
                )}

                {tab==="papers"&&(
                    <div>
                        <div style={s.filterRow}>
                            <input style={s.filterInput} placeholder="Search by title..." value={paperSearch} onChange={e=>setPaperSearch(e.target.value)}/>
                            <select style={s.select} value={paperStatus} onChange={e=>setPaperStatus(e.target.value)}>
                                <option value="">All statuses</option>
                                <option value="submitted">Submitted</option>
                                <option value="under_review">Under Review</option>
                                <option value="revision_needed">Revision Needed</option>
                                <option value="recommend_publish">Recommended to Publish</option>
                                <option value="approved">Approved</option>
                                <option value="published">Published</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <button style={s.createBtn} onClick={()=>{setPage(1);fetchPapers()}}>Search</button>
                        </div>
                        {papers.length===0&&(
                            <div style={s.emptyState}>
                                <p style={s.emptyTitle}>No papers found</p>
                                <p style={s.emptySub}>No submissions match your current filters.</p>
                            </div>
                        )}
                        {papers.map(p=>(
                            <div key={p.id} style={s.card}>
                                <div style={s.cardTop}>
                                    <div style={s.cardLeft}>
                                        <h3 style={s.cardTitle}>{p.title}</h3>
                                        <p style={s.cardMeta}>{p.student?.name} · {p.category||p.department?.name||"No category"}</p>
                                    </div>
                                    <span style={{...s.statusBadge,...statusStyle(p.status)}}>{p.status.replace(/_/g," ")}</span>
                                </div>
                                <p style={s.cardAbstract}>{p.abstract?.slice(0,140)}...</p>
                                <div style={s.cardFooter}>
                                    <div style={s.assignRow}>
                                        <label style={s.assignLabel}>Assign to dept</label>
                                        <select style={s.select} defaultValue="" onChange={e=>assignDept(p.id,e.target.value)}>
                                            <option value="" disabled>Select department...</option>
                                            {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={s.btnGroup}>
                                        {p.fileUrl&&(
                                            <button style={{...s.actionBtn,borderColor:"#5c6cff",color:"#0307ff"}} onClick={()=>openPdf(p.fileUrl)}>PDF</button>
                                        )}
                                        <button style={{...s.actionBtn,borderColor:"#86efac",color:"#16a34a"}} onClick={()=>updatePaperStatus(p.id,"approved")}>Approve</button>
                                        <button style={{...s.actionBtn,borderColor:"#fca5e2",color:"#ff027c"}} onClick={()=>updatePaperStatus(p.id,"rejected")}>Reject</button>
                                        <button style={{...s.actionBtn,borderColor:"#fecaca",color:"#dc2626"}} onClick={()=>deletePaper(p.id)}>Delete</button>
                                    </div>
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
                        <div style={s.filterRow}>
                            <input style={s.filterInput} placeholder="Search by name, field or teacher..." value={resourceSearch} onChange={e=>setResourceSearch(e.target.value)}/>
                        </div>
                        {filteredResources.length===0&&(
                            <div style={s.emptyState}>
                                <p style={s.emptyTitle}>No resources found</p>
                                <p style={s.emptySub}>No resources match your search.</p>
                            </div>
                        )}
                        {filteredResources.map(r=>(
                            <div key={r.id} style={s.card}>
                                <div style={s.cardTop}>
                                    <div style={s.cardLeft}>
                                        <h3 style={s.cardTitle}>{r.name}</h3>
                                        <p style={s.cardMeta}>
                                            Uploaded by {r.uploader?.name} · {r.field}
                                            {r.department?.name&&<span> · {r.department.name}</span>}
                                        </p>
                                    </div>
                                    <span style={{...s.statusBadge,background:"#f1ffde",color:"#0ba405",border:"1px solid #5eff01"}}>Resource</span>
                                </div>
                                <p style={s.cardAbstract}>{r.description?.slice(0,140)}</p>
                                <div style={s.cardFooter}>
                                    <div/>
                                    <div style={s.btnGroup}>
                                        {r.fileUrl&&(
                                            <button style={{...s.actionBtn,borderColor:"#bfdbfe",color:"#2563eb"}} onClick={()=>openPdf(r.fileUrl)}>View PDF</button>
                                        )}
                                        <button style={{...s.actionBtn,borderColor:"#fecaca",color:"#dc2626"}} onClick={()=>deleteResource(r.id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab==="users"&&(
                    <div>
                        <div style={s.filterRow}>
                            <input style={s.filterInput} placeholder="Search by name or email..." value={userSearch} onChange={e=>setUserSearch(e.target.value)}/>
                            <select style={s.select} value={userRole} onChange={e=>setUserRole(e.target.value)}>
                                <option value="">All roles</option>
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        {filteredUsers.length===0&&(
                            <div style={s.emptyState}>
                                <p style={s.emptyTitle}>No users found</p>
                                <p style={s.emptySub}>No users match your search.</p>
                            </div>
                        )}
                        {filteredUsers.map(u=>(
                            <div key={u.id} style={{...s.card,opacity:u.blacklisted?0.6:1}}>
                                <div style={s.cardTop}>
                                    <div style={s.cardLeft}>
                                        <h3 style={s.cardTitle}>
                                            {u.name}
                                            {u.blacklisted&&<span style={s.blacklistedTag}>Suspended</span>}
                                        </h3>
                                        <p style={s.cardMeta}>{u.email}{u.department?.name&&` · ${u.department.name}`}</p>
                                    </div>
                                    <div style={s.btnGroup}>
                                        <span style={{...s.statusBadge,...roleStyle(u.role)}}>{u.role}</span>
                                        {u.id!==user.id&&(
                                            <button
                                                style={{...s.actionBtn,borderColor:u.blacklisted?"#86efac":"#fca5a5",color:u.blacklisted?"#16a34a":"#dc2626"}}
                                                onClick={()=>toggleBlacklist(u.id,u.blacklisted)}>
                                                {u.blacklisted?"Reinstate":"Blacklist"}
                                            </button>
                                        )}
                                    </div>
                                </div>
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

    // function openPdf(filename){window.open(`http://localhost:5000/backend/uploads/${filename}`,"_blank")}
    function openPdf(fileUrl){
    if(!fileUrl) return

    const filename=fileUrl.split("\\").pop().split("/").pop()
    window.open(`http://localhost:5000/uploads/${filename}`,"_blank")
}
    return(
        <div>
            <div style={{marginBottom:"1.5rem"}}>
                <h2 style={{fontSize:"1.1rem",fontWeight:"700",color:"#0f172a",margin:"0 0 0.25rem"}}>Hall of Fame</h2>
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
                    {p.fileUrl&&<button style={{...s.actionBtn,borderColor:"#bfdbfe",color:"#2563eb",marginTop:"0.75rem"}} onClick={()=>openPdf(p.fileUrl)}>View PDF</button>}
                </div>
            ))}
        </div>
    )
}

const s = {
page:{
        minHeight:"100vh",
        background:"#ffffff",
        fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",
        color:"#0f172a",
        position:"relative",
        overflow:"hidden"
    },

    dotsPattern:{
        position:"fixed",
        top:0,
        left:0,
        right:0,
        bottom:0,
        backgroundImage:[
            "radial-gradient(circle, #a5b4fc 1.5px,transparent 1.5px)",
            "radial-gradient(circle, #f9a8d4 1.5px,transparent 1.5px)",
            "radial-gradient(circle, #6ee7b7 1.5px,transparent 1.5px)",
            "radial-gradient(circle, #fc4dd0 1.5px,transparent 1.5px)",
            "radial-gradient(circle, #4df0fc 1.5px,transparent 1.5px)",
            "radial-gradient(circle, #67fc4d 1.5px,transparent 1.5px)",
            "radial-gradient(circle, #fcbc4d 1.5px,transparent 1.5px)"
        ].join(","),
        backgroundSize:
    "32px 32px,32px 32px,32px 32px,32px 32px,32px 32px,32px 32px,32px 32px",
        backgroundPosition:"0 0,16px 16px,8px 8px,24px 24px,4px 20px,20px 4px,12px 28px",
        opacity:0.55,
        pointerEvents:"none",
        zIndex:0
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
        color: "#5bc907" 
    },

    userTag: { 
        color: "#64748b", 
        fontSize: "0.875rem" 
    },

    rolePill: { 
        background: "#f5f3ff", 
        color: "#7c3aed", 
        border: "1px solid #ddd6fe", 
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
        maxWidth: "1000px", 
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

    statsRow: { 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", 
        gap: "1rem", 
        marginBottom: "2.5rem" 
    },

    statCard: { 
        background: "#ffffff", 
        border: "1px solid #e2e8f0", 
        borderRadius: "12px", 
        padding: "1.25rem 1rem", 
        display: "flex", 
        flexDirection: "column", 
        gap: "0.35rem", 
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)" 
    },

    statNum: { 
        fontSize: "2rem", 
        fontWeight: "700", 
        lineHeight: 1 
    },

    statLabel: { 
        fontSize: "0.75rem", 
        color: "#94a3b8", 
        fontWeight: "500" 
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
        color: "#61ce0e", 
        borderBottom: "2px solid #5bc907" 
    },

    filterRow: { 
        display: "flex", 
        gap: "0.75rem", 
        marginBottom: "1.5rem", 
        flexWrap: "wrap" 
    },

    inlineForm: { 
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

    select: { 
        padding: "0.55rem 0.85rem", 
        background: "#ffffff", 
        border: "1px solid #e2e8f0", 
        color: "#0f172a", 
        borderRadius: "8px", 
        fontSize: "0.875rem", 
        outline: "none", 
        cursor: "pointer" 
    },

    createBtn: { 
        padding: "0.55rem 1.25rem", 
        background: "#5bc907", 
        color: "#ffffff", 
        border: "none", 
        borderRadius: "8px", 
        cursor: "pointer", 
        fontSize: "0.875rem", 
        fontWeight: "500", 
        whiteSpace: "nowrap" 
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
        marginBottom: "0.5rem", 
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
        margin: "0 0 0.875rem" 
    },

    cardFooter: { 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        flexWrap: "wrap", 
        gap: "0.75rem" 
    },

    statusBadge: { 
        padding: "3px 10px", 
        borderRadius: "20px", 
        fontSize: "0.72rem", 
        fontWeight: "500", 
        whiteSpace: "nowrap", 
        textTransform: "capitalize" 
    },

    assignRow: { 
        display: "flex", 
        alignItems: "center", 
        gap: "0.6rem" 
    },

    assignLabel: { 
        fontSize: "0.8rem", 
        color: "#94a3b8", 
        fontWeight: "500" 
    },

    btnGroup: { 
        display: "flex", 
        gap: "0.5rem" 
    },

    actionBtn: { 
        padding: "0.35rem 0.9rem", 
        background: "transparent", 
        border: "1px solid", 
        borderRadius: "6px", 
        cursor: "pointer", 
        fontSize: "0.78rem", 
        fontWeight: "500" 
    },

    pagination: { 
        display: "flex", 
        gap: "1rem", 
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
    }
}