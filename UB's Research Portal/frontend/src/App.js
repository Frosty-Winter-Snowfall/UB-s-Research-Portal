import {BrowserRouter,Routes,Route} from "react-router-dom"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import StudentDashboard from "./pages/StudentDashboard"
import TeacherDashboard from "./pages/TeacherDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import HallOfFame from "./pages/HallOfFame"

function App(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/hall-of-fame" element={<HallOfFame/>}/>
                <Route path="/student" element={<StudentDashboard/>}/>
                <Route path="/teacher" element={<TeacherDashboard/>}/>
                <Route path="/admin" element={<AdminDashboard/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App