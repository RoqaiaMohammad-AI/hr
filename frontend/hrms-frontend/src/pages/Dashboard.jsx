import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_employees: 0,
    present_today: 0,
    absent_today: 0,
    leaves_this_month: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/dashboard-stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="dashboard">
        <div className="card">
          <h3>عدد الموظفين</h3>
          <p>{stats.total_employees}</p>
        </div>
        <div className="card">
          <h3>الموظفين الموجودين اليوم</h3>
          <p>{stats.present_today}</p>
        </div>
        <div className="card">
          <h3>الموظفين الغائبين اليوم</h3>
          <p>{stats.absent_today}</p>
        </div>
        <div className="card">
          <h3>الإجازات هذا الشهر</h3>
          <p>{stats.leaves_this_month}</p>
        </div>
      </div>
    </div>
  );
}
