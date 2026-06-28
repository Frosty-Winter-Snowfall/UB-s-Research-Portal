import {useNavigate} from "react-router-dom"

export default function Landing(){
    const navigate=useNavigate()

    return(
        <div style={s.page}>
            {/* <div style={s.dotsPattern}/> */}

            <nav style={s.nav}>
                <span style={s.logo}>UB's Research<span style={s.accent}>Portal</span></span>
                <div style={s.navBtns}>
                    <button style={s.loginBtn} onClick={()=>navigate("/login")}>Log in</button>
                    <button style={s.signupBtn} onClick={()=>navigate("/signup")}>Get Started</button>
                </div>
            </nav>

            <div style={s.hero}>
                <div style={s.heroPill}>Academic Research Platform</div>
                <h1 style={s.heroTitle}>
                    Where great research<br/>
                    <span style={s.heroAccent}>finds its strength</span>
                </h1>
                <p style={s.heroSub}>
                    A dedicated space for students to submit research, faculty to review and guide,
                    and institutions to showcase academic excellence.
                </p>
                <div style={s.heroBtns}>
                    <button style={s.primaryBtn} onClick={()=>navigate("/signup")}>Start for free</button>
                    <button style={s.secondaryBtn} onClick={()=>navigate("/hall-of-fame")}>Browse Research</button>
                </div>
            </div>
            <div style={s.section}>
                <p style={s.sectionLabel}>THERE IS NO AGE TO LEARNING</p>
                <h2 style={s.sectionTitle}>One platform, many experiences</h2>

                <div style={s.cards}>
                    <div style={s.card}>
                        <div style={{...s.cardTop,background:"linear-gradient(135deg, #eff6ff, #a1d2ff)"}}>
                            <div style={{...s.cardIcon,color:"#54c9ff"}}>S</div>
                        </div>
                        <div style={s.cardBody}>
                            <h3 style={s.cardTitle}>Students</h3>
                            <p style={s.cardText}>Submit research papers, track review status in real time, receive structured faculty feedback, and publish your work to the world.</p>
                            <button style={{...s.cardBtn,color:"#39caff",borderColor:"#bdecff"}} onClick={()=>navigate("/signup")}>Join as Student</button>
                        </div>
                    </div>

                    <div style={{...s.card,transform:"translateY(-12px)"}}>
                        <div style={{...s.cardTop,background:"linear-gradient(135deg, #fff4fb, #ff9bd5)"}}>
                            <div style={{...s.cardIcon,color:"#ea339e"}}>F</div>
                        </div>
                        <div style={s.cardBody}>
                            <h3 style={s.cardTitle}>Faculty</h3>
                            <p style={s.cardText}>Review papers in your department, provide detailed feedback, upload study resources, and recommend exceptional work for publication.</p>
                            <button style={{...s.cardBtn,color:"#ea33b6",borderColor:"#ffd5f6"}} onClick={()=>navigate("/signup")}>Join as Teacher</button>
                        </div>
                    </div>

                    <div style={s.card}>
                        <div style={{...s.cardTop,background:"linear-gradient(135deg, #f3fff5, #d8ffd5)"}}>
                            <div style={{...s.cardIcon,color:"#3aed40"}}>A</div>
                        </div>
                        <div style={s.cardBody}>
                            <h3 style={s.cardTitle}>Admin</h3>
                            <p style={s.cardText}>Manage departments, assign faculty reviewers, oversee all submissions, and maintain the quality and integrity of the research platform.</p>
                            <button style={{...s.cardBtn,color:"#09ac03",borderColor:"#cbffd6"}} onClick={()=>navigate("/login")}>Admin Login</button>
                        </div>
                    </div>
                </div>
            </div>

            <div style={s.statsBar}>
                {[
                    {num:"100%",label:"Transparency"},
                    {num:"3",label:"User roles"},
                    {num:"Real-time",label:"Status tracking"},
                    {num:"Open",label:"Hall of Fame"},
                ].map(stat=>(
                    <div key={stat.label} style={s.stat}>
                        <span style={s.statNum}>{stat.num}</span>
                        <span style={s.statLabel}>{stat.label}</span>
                    </div>
                ))}
            </div>

            <footer style={s.footer}>
                <span style={s.footerLogo}>UB's Research<span style={s.accent}>Portal</span></span>
                <span style={s.footerText}>© to 22f3000877@ds.study.iitm.ac.in</span>
            </footer>
        </div>
    )
}

const s={
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

    accent:{
        color:"#6366f1"
    },

    navBtns:{
        display:"flex",
        gap:"0.75rem"
    },

    loginBtn:{
        padding:"0.45rem 1.1rem",
        background:"#ff33c5",
        border:"1px solid #ffa5de",
        color:"#fffdfe",
        borderRadius:"8px",
        cursor:"pointer",
        fontSize:"0.875rem"
    },

    signupBtn:{
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
        fontSize:"4.2rem",
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

    heroBtns:{
        display:"flex",
        gap:"1rem",
        justifyContent:"center",
        flexWrap:"wrap"
    },

    primaryBtn:{
        padding:"0.8rem 2rem",
        background:"#2ACAEA",
        color:"white",
        border:"none",
        borderRadius:"10px",
        fontSize:"0.95rem",
        fontWeight:"600",
        cursor:"pointer",
        boxShadow:"0 4px 14px rgba(99,102,241,0.35)"
    },

    secondaryBtn:{
        padding:"0.8rem 2rem",
        background:"#fc4dd0",
        color:"#ffe7fd",
        border:"1px solid #f0e2ec",
        borderRadius:"10px",
        fontSize:"0.95rem",
        fontWeight:"600",
        cursor:"pointer",
        backdropFilter:"blur(8px)"
    },

    section:{
        padding:"4rem 2rem",
        maxWidth:"1100px",
        margin:"0 auto",
        position:"relative",
        zIndex:1
    },

    sectionLabel:{
        textAlign:"center",
        color:"#009f20",
        fontSize:"2rem",
        letterSpacing:"3px",
        fontWeight:"600",
        margin:"0 0 0.75rem"
    },

    sectionTitle:{
        textAlign:"center",
        fontSize:"2rem",
        fontWeight:"700",
        color:"#127205",
        margin:"0 0 3rem",
        letterSpacing:"-0.5px"
    },

    cards:{
        display:"flex",
        gap:"1.5rem",
        justifyContent:"center",
        flexWrap:"wrap"
    },

    card:{
        background:"rgba(255,255,255,0.9)",
        borderRadius:"16px",
        width:"300px",
        boxShadow:"0 4px 24px rgba(0,0,0,0.07)",
        border:"1px solid rgba(241,245,249,0.9)",
        overflow:"hidden",
        backdropFilter:"blur(8px)"
    },

    cardTop:{
        padding:"2rem",
        display:"flex",
        justifyContent:"center",
        alignItems:"center"
    },

    cardIcon:{
        width:"48px",
        height:"48px",
        background:"white",
        borderRadius:"12px",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        fontSize:"1.3rem",
        fontWeight:"800",
        boxShadow:"0 2px 8px rgba(0,0,0,0.08)"
    },

    cardBody:{
        padding:"0 1.5rem 1.75rem"
    },

    cardTitle:{
        fontSize:"1.05rem",
        fontWeight:"700",
        color:"#0f172a",
        margin:"0 0 0.6rem"
    },

    cardText:{
        fontSize:"0.875rem",
        color:"#64748b",
        lineHeight:"1.65",
        margin:"0 0 1.25rem"
    },

    cardBtn:{
        padding:"0.5rem 1.1rem",
        background:"transparent",
        border:"1px solid",
        borderRadius:"8px",
        cursor:"pointer",
        fontSize:"0.82rem",
        fontWeight:"500"
    },

    statsBar:{
        // background:"#7ef9ff",
        // background:"linear-gradient(135deg,#7ef9ff,#38bdf8,#0ea5e9)",
        background:"linear-gradient(135deg, #7ef9ff, #88e7ff, #73dcff, #9cedff)",
        padding:"2.5rem",
        display:"flex",
        justifyContent:"center",
        gap:"4rem",
        flexWrap:"wrap",
        position:"relative",
        zIndex:1
    },

    stat:{
        textAlign:"center"
    },

    statNum:{
        display:"block",
        fontSize:"1.5rem",
        fontWeight:"700",
        color:"white",
        marginBottom:"0.25rem"
    },

    statLabel:{
        fontSize:"0.8rem",
        color:"#035e5a"
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