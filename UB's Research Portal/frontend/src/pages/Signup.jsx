import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"

export default function Signup() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("student")
    const [departmentId, setDepartmentId] = useState("")
    const [departments, setDepartments] = useState([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        api.get("/departments").then(res => setDepartments(res.data.departments)).catch(() => {})
    }, [])

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const payload = { name, email, password, role }
            if (role === "teacher" && departmentId) payload.departmentId = departmentId
            const res = await api.post("/auth/signup", payload)
            login(res.data.user, res.data.token)
            if (res.data.user.role === "student") navigate("/student")
            else if (res.data.user.role === "teacher") navigate("/teacher")
        } catch (err) {
            setError(err.response?.data?.error || "Signup failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={s.page}>
            <div style={s.card}>
                <span style={{ ...s.accent, fontStyle: "italic", color: "#f472b6", marginRight: "4px", fontSize:"1.5rem", fontWeight:"700" }}>
                    UB's 
                  </span>
                  <span style={s.logo}>
                    Research<span style={s.accent}>Portal</span>
                  </span>
                <h3 style={s.title}>Create your account</h3>

                <div style={s.rolePicker}>
                    {["student", "teacher"].map(r => (
                        <button key={r} type="button" onClick={() => setRole(r)}
                            style={{ ...s.roleBtn, ...(role === r ? (r === "student" ? s.roleActiveBlue : s.roleActivePurple) : {}) }}>
                            {r === "student" ? "Student" : "Teacher"}
                        </button>
                    ))}
                </div>

                {error && <p style={s.error}>{error}</p>}

                <form onSubmit={handleSubmit} style={s.form}>
                    <div style={s.formGroup}>
                        <label style={s.label}>Full Name</label>
                        <input style={s.input} type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div style={s.formGroup}>
                        <label style={s.label}>Email</label>
                        <input style={s.input} type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div style={s.formGroup}>
                        <label style={s.label}>Password</label>
                        <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>

                    {role === "teacher" && (
                        <div style={s.formGroup}>
                            <label style={s.label}>Department</label>
                            <select style={s.input} value={departmentId} onChange={e => setDepartmentId(e.target.value)} required>
                                <option value="">Select your department...</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                            {departments.length === 0 && <p style={s.hint}>No departments yet. Ask your admin to create one first.</p>}
                        </div>
                    )}

                    <button style={{ ...s.btn, background: role === "student" ? "#2563eb" : "#9333ea" }} type="submit" disabled={loading}>
                        {loading ? "Creating account..." : `Sign up as ${role}`}
                    </button>
                </form>

                <p style={s.bottom}>Already have an account? <Link to="/login">Log in</Link></p>
                <p style={s.bottom}><Link to="/">Back to home</Link></p>
            </div>
        </div>
    )
}

const s = {
    page: {
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Segoe UI', sans-serif"
    },

    card: {
        background: "#ffffff",
        padding: "2.5rem",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        width: "100%",
        maxWidth: "440px",
        border: "1px solid #e2e8f0"
    },

    logo:{
        fontSize:"1.5rem",
        fontWeight:"700",
        color:"#1c001b",
        letterSpacing:"-0.5px"
    },

    accent:{
        color:"#6366f1"
    },

    title: {
        textAlign: "center",
        color: "#64748b",
        fontWeight: "400",
        fontSize: "0.95rem",
        margin: "0 0 1.75rem"
    },

    rolePicker: {
        display: "flex",
        gap: "0.75rem",
        marginBottom: "1.5rem"
    },

    roleBtn: {
        flex: 1,
        padding: "0.6rem",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "0.9rem",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        color: "#64748b"
    },

    roleActiveBlue: {
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        color: "#2563eb"
    },

    roleActivePurple: {
        background: "#fdf4ff",
        border: "1px solid #e9d5ff",
        color: "#9333ea"
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
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

    hint: {
        fontSize: "0.75rem",
        color: "#f59e0b",
        margin: "0.25rem 0 0"
    },

    btn: {
        padding: "0.75rem",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.9rem",
        fontWeight: "600",
        cursor: "pointer",
        marginTop: "0.5rem"
    },

    error: {
        color: "#dc2626",
        background: "#fef2f2",
        border: "1px solid #fca5a5",
        padding: "0.6rem 0.9rem",
        borderRadius: "8px",
        fontSize: "0.875rem",
        marginBottom: "0.5rem"
    },

    bottom: {
        textAlign: "center",
        marginTop: "1rem",
        color: "#64748b",
        fontSize: "0.875rem"
    }
}