import {useState,useEffect} from "react"
import {useNavigate} from "react-router-dom"
import api from "../api/axios"

const BASE_URL="http://localhost:3000"

export default function HallOfFame(){
    const navigate=useNavigate()
    const [papers,setPapers]=useState([])
    const [search,setSearch]=useState("")
    const [category,setCategory]=useState("")
    const [department,setDepartment]=useState("")
    const [departments,setDepartments]=useState([])
    const [loading,setLoading]=useState(true)

    useEffect(()=>{fetchPublished();fetchDepartments()},[])

    async function fetchPublished(){
        setLoading(true)
        try{
            const res=await api.get("/papers/published",{params:{search,category,department}})
            setPapers(res.data.papers)
        }catch{}
        setLoading(false)
    }

    async function fetchDepartments(){
        try{
            const res=await api.get("/departments")
            setDepartments(res.data.departments)
        }catch{}
    }

    // function openPdf(filename){window.open(`${BASE_URL}/uploads/${filename}`,"_blank")}
// function openPdf(filename){window.open(`http://localhost:5000/uploads/${filename}`,"_blank")}
//     function openPdf(url){
//     window.open(url, "_blank")
// }
function openPdf(path){
    const fileName = path.split("\\").pop().split("/").pop()
    window.open(`http://localhost:5000/uploads/${fileName}`, "_blank")
}
    return(
        <div style={s.page}>
            {/* colourful polka dots */}
            <div style={s.dotsPattern}/>

            <nav style={s.nav}>
                <span style={s.logo} onClick={()=>navigate("/")}>UB's Research<span style={s.accent}>Portal</span></span>
                <div style={s.navBtns}>
                    <button style={s.outlineBtn} onClick={()=>navigate("/login")}>Log in</button>
                    <button style={s.fillBtn} onClick={()=>navigate("/signup")}>Get Started</button>
                </div>
            </nav>

            <div style={s.hero}>
                <div style={s.heroPill}>Hall of Fame</div>
                <h1 style={s.heroTitle}>Published Research</h1>
                <p style={s.heroSub}>Exceptional student research, reviewed by faculty and published for the world to read.</p>
            </div>

            <div style={s.container}>
                <div style={s.filterRow}>
                    <input style={s.filterInput} placeholder="Search by title or abstract..." value={search} onChange={e=>setSearch(e.target.value)}/>
                    <input style={s.filterInput} placeholder="Filter by category..." value={category} onChange={e=>setCategory(e.target.value)}/>
                    <select style={s.filterSelect} value={department} onChange={e=>setDepartment(e.target.value)}>
                        <option value="">All Departments</option>
                        {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <button style={s.searchBtn} onClick={fetchPublished}>Search</button>
                </div>

                {loading&&(
                    <div style={s.emptyState}>
                        <p style={s.emptyTitle}>Loading...</p>
                    </div>
                )}

                {!loading&&papers.length===0&&(
                    <div style={s.emptyState}>
                        <p style={s.emptyTitle}>No published papers yet</p>
                        <p style={s.emptySub}>Published research will appear here once students submit and faculty approve their work.</p>
                    </div>
                )}

                <div style={s.grid}>
                    {papers.map((p,i)=>(
                        <div key={p.id} style={{...s.card,...(i===0?s.featuredCard:{})}}>
                            <div style={s.cardHeader}>
                                <div style={s.dotRow}>
                                    <div style={{...s.dot,background:dotColors[i%dotColors.length]}}/>
                                    <span style={s.cardField}>{p.category||"Research"}</span>
                                </div>
                                <span style={s.deptBadge}>{p.department?.name||"General"}</span>
                            </div>
                            <h3 style={s.cardTitle}>{p.title}</h3>
                            <p style={s.cardAbstract}>{p.abstract?.slice(0,180)}...</p>
                            <div style={s.cardFooter}>
                                <div>
                                    <p style={s.authorName}>{p.student?.name}</p>
                                    {p.publishedAt&&<p style={s.publishDate}>{new Date(p.publishedAt).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}</p>}
                                </div>
                                {p.fileUrl&&(
                                    <button style={s.pdfBtn} onClick={()=>openPdf(p.fileUrl)}>
                                        Read Paper
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <footer style={s.footer}>
                <span style={s.footerLogo}>UB's Research<span style={s.accent}>Portal</span></span>
                <span style={s.footerText}>© to 22f3000877@ds.study.iitm.ac.in</span>
            </footer>
        </div>
    )
}

const dotColors=["#6366f1","#ec4899","#10b981","#f59e0b","#3b82f6","#8b5cf6","#ef4444","#14b8a6"]

const s={
    page:{
        minHeight:"100vh",
        background:"#ffffff",
        fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",
        color:"#0f172a",
        position:"relative"},
    dotsPattern:{
        position:"fixed",top:0,left:0,right:0,bottom:0,
        backgroundImage:[
            "radial-gradient(circle,#6366f1 2.5px,transparent 1.5px)",
            "radial-gradient(circle,#ec4899 2.5px,transparent 1.5px)",
            "radial-gradient(circle,#10b981 2.5px,transparent 1.5px)",
            "radial-gradient(circle,#f59e0b 2.5px,transparent 1.5px)",
        ].join(","),
        backgroundSize:"60px 60px,60px 60px,60px 60px,60px 60px",
        backgroundPosition:"0 0,30px 30px,15px 15px,45px 45px",
        opacity:0.18,
        pointerEvents:"none",
        zIndex:0,
    },
    nav:{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        padding:"1.25rem 3rem",
        // background:"rgba(255,255,255,0.88)",
        background:"linear-gradient(135deg, #7ef9ff, #88e7ff, #73dcff, #9cedff)",
        backdropFilter:"blur(14px)",
        borderBottom:"1px solid rgba(226,232,240,0.7)",
        position:"sticky",
        top:0,
        zIndex:100
    },
    logo:{
        fontSize:"1.5rem",
        fontWeight:"700",
        color:"#fcffff",
        letterSpacing:"-0.5px"
    },
    accent:{color:"#6366f1"},
    navBtns:{display:"flex",gap:"0.75rem"},
    outlineBtn:{
        padding:"0.45rem 1.1rem",
        background:"#ff33c5",
        border:"1px solid #ffa5de",
        color:"#fffdfe",
        borderRadius:"8px",
        cursor:"pointer",
        fontSize:"0.875rem"
    },
    fillBtn:{
        padding:"0.45rem 1.1rem",
        background:"#2ACAEA",
        border:"none",
        color:"#ffffff",
        borderRadius:"8px",
        cursor:"pointer",
        fontSize:"0.875rem",
        fontWeight:"500"
    },
    hero:{
        textAlign:"center",
        padding:"6rem 2rem 4rem",
        maxWidth:"720px",
        margin:"0 auto",
        position:"relative",
        zIndex:1
    },

    heroPill:{
        display:"inline-block",
        background:"rgba(255, 228, 247, 0.85)",
        color:"#fc4dd0",
        border:"1px solid #fec7f1",
        padding:"4px 14px",
        borderRadius:"20px",
        fontSize:"1rem",
        fontWeight:"500",
        marginBottom:"1.5rem",
        backdropFilter:"blur(8px)"
    },
     heroTitle:{
        fontSize:"4.0rem",
        fontWeight:"800",
        // color:"#abffa3",
        color:"#02670e",
        lineHeight:"1.15",
        margin:"0 0 1.25rem",
        letterSpacing:"-1px"
    },

    heroAccent:{
        // color:"#6366f1"
        // color: "#fc4dd0"
        // color:"rgb(253 156 223)"
        color:"#16ac09"
    },
    heroSub:{
        fontSize:"1.05rem",
        color:"#3a0140",
        lineHeight:"1.7",
        margin:"0 0 2.5rem"
    },

    container: {
    maxWidth: "1040px",
    margin: "0 auto",
    padding: "2rem 1.5rem 4rem",
    position: "relative",
    zIndex: 1
},

filterRow: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "2rem",
    flexWrap: "wrap"
},

filterInput: {
    padding: "0.55rem 0.85rem",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid #e2e8f0",
    color: "#0f172a",
    borderRadius: "8px",
    fontSize: "0.875rem",
    flex: 1,
    minWidth: "160px",
    outline: "none"
},

filterSelect: {
    padding: "0.55rem 0.85rem",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid #e2e8f0",
    color: "#0f172a",
    borderRadius: "8px",
    fontSize: "0.875rem",
    outline: "none",
    cursor: "pointer"
},

searchBtn: {
    padding: "0.55rem 1.25rem",
    background: "#6366f1",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "500"
},

emptyState: {
    background: "rgba(255,255,255,0.85)",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "3rem",
    textAlign: "center",
    backdropFilter: "blur(8px)"
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

grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
    gap: "1.25rem"
},

card: {
    background: "rgba(255,255,255,0.88)",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "1.5rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    backdropFilter: "blur(8px)",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
},

featuredCard: {
    border: "2px solid #6366f1",
    boxShadow: "0 4px 20px rgba(99,102,241,0.15)"
},

cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
},

dotRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
},

dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%"
},

cardField: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
},

deptBadge: {
    fontSize: "0.7rem",
    padding: "2px 8px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    color: "#64748b"
},

cardTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    lineHeight: "1.4"
},

cardAbstract: {
    fontSize: "0.85rem",
    color: "#475569",
    lineHeight: "1.65",
    margin: 0,
    flex: 1
},

cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "auto"
},

authorName: {
    margin: "0 0 0.15rem",
    fontSize: "0.82rem",
    fontWeight: "600",
    color: "#374151"
},

publishDate: {
    margin: 0,
    fontSize: "0.75rem",
    color: "#94a3b8"
},

pdfBtn: {
    padding: "0.4rem 0.9rem",
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontWeight: "500"
},
    footer:{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        padding:"1.5rem 3rem",
        borderTop:"1px solid #f1f5f9",
        position:"relative",
        zIndex:1
    },

    footerLogo:{
        fontSize:"1.2rem",
        fontWeight:"700",
        color:"#rgb(126 249 255)"
    },

    footerText:{
        color:"#023e3f",
        fontSize:"0.95rem"
    }
}