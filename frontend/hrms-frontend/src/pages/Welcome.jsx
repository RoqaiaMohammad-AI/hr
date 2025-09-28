import React from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="welcome-container">
      <h1>مرحبا بك في HRMS</h1>
      <p>قم بإدارة الموظفين، الرواتب، الحضور والغياب بكل سهولة.</p>
      <button onClick={() => navigate("/login")}>تسجيل الدخول</button>
    </div>
  );
}
