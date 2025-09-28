import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./auth/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";     // ← صفحة الموظفين
import Payroll from "./pages/Payroll";         // ← صفحة الرواتب
import Attendance from "./pages/Attendance";   // ← صفحة الحضور والغياب
import Users from "./pages/Users";             // ← صفحة إدارة المستخدمين
import Roles from "./pages/Roles";             // ← صفحة إدارة الأدوار
import Departments from "./pages/Departments"; // ✅ صفحة إدارة الأقسام
import Leaves from "./pages/Leaves"; // ← صفحة إدارة الإجازات


import "./assets/css/style.css"; // ← استيراد التنسيقات العامة

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />     {/* صفحة الموظفين */}
        <Route path="/payroll" element={<Payroll />} />         {/* صفحة الرواتب */}
        <Route path="/attendance" element={<Attendance />} />   {/* صفحة الحضور والغياب */}
        <Route path="/users" element={<Users />} />             {/* صفحة إدارة المستخدمين */}
        <Route path="/roles" element={<Roles />} />             {/* صفحة إدارة الأدوار */}
        <Route path="/departments" element={<Departments />} /> {/* ✅ صفحة إدارة الأقسام */}
        <Route path="/leaves" element={<Leaves />} /> {/* ✅ صفحة إدارة الإجازات */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
