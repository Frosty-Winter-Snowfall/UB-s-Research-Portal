import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await api.post("/auth/login", { email, password })
      login(res.data.user, res.data.token)
      if (res.data.user.role === "student") navigate("/student")
      else if (res.data.user.role === "teacher") navigate("/teacher")
      else if (res.data.user.role === "admin") navigate("/admin")

    } catch (err) {
      setError(err.response?.data?.error || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.logo}>ResearchPortal</h2>
        <h3 style={styles.title}>Welcome back!</h3>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label>Email</label>
            <input style={styles.input} type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={styles.field}>
            <label>Password</label>
            <input style={styles.input} type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login →"}
          </button>
        </form>

        <p style={styles.bottom}>No account? <Link to="/signup">Sign up</Link></p>
        <p style={styles.bottom}><Link to="/">← Back to home</Link></p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8f9ff 0%, #fff0f9 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif"
  },

  card: {
    background: "white",
    padding: "2.5rem",
    borderRadius: "16px",
    boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px"
  },

  logo: {
    textAlign: "center",
    color: "#4361ee",
    marginBottom: "0.25rem"
  },

  title: {
    textAlign: "center",
    color: "#333",
    marginBottom: "1.5rem"
  },

  field: {
    marginBottom: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },

  input: {
    padding: "0.7rem",
    borderRadius: "8px",
    border: "1.5px solid #ddd",
    fontSize: "1rem"
  },

  btn: {
    width: "100%",
    padding: "0.8rem",
    background: "#4361ee",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "0.5rem"
  },

  error: {
    color: "red",
    background: "#fff0f0",
    padding: "0.5rem",
    borderRadius: "8px",
    marginBottom: "1rem"
  },

  bottom: {
    textAlign: "center",
    marginTop: "1rem",
    color: "#666",
    fontSize: "0.9rem"
  }
}