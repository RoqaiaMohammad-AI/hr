import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>HRMS</h2>
      <Link to="/dashboard">لوحة التحكم</Link>
      <Link to="/employees" className="hover:bg-gray-700 p-2 rounded">الموظفين</Link>
      <Link to="/payroll">الرواتب</Link>
      
      <Link to="/attendance">الحضور والغياب</Link>
      <Link to="/users">المستخدمين</Link>
      <Link to="/roles">الأدوار</Link>
      <Link to="/departments">الأقسام</Link>
      <Link to="/leaves">الإجازات</Link>
    </div>
  );
}
