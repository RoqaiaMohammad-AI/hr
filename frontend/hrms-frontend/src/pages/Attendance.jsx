import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import "../assets/css/style.css";

const Attendance = () => {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [weeklyAttendance, setWeeklyAttendance] = useState({});
  const [weekGenerated, setWeekGenerated] = useState(false);
  const [weekDates, setWeekDates] = useState([]);

  const monthsList = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      const ym = d.toISOString().slice(0, 7);
      const label = d.toLocaleString("ar-EG", { month: "long", year: "numeric" });
      return { value: ym, label };
    });
  }, []);

  const weeksList = ["1", "2", "3", "4"];

  const daysList = useMemo(() => [
    "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"
  ], []);

  const getWeekDates = useCallback((ym, weekIndex) => {
    const [year, month] = ym.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const offset = (7 - firstDay.getDay()) % 7;
    const firstSunday = new Date(year, month - 1, 1 + offset);
    const weekStart = new Date(firstSunday);
    weekStart.setDate(weekStart.getDate() + (weekIndex - 1) * 7);
    return daysList.map((_, i) =>
      new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i)
        .toISOString()
        .slice(0, 10)
    );
  }, [daysList]);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees/active");
      setEmployees(res.data);
    } catch (err) {
      console.error("خطأ في جلب الموظفين:", err);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedWeek) params.week = `${selectedMonth}-W${selectedWeek}`;
      if (selectedDay) {
        const dates = getWeekDates(selectedMonth, Number(selectedWeek));
        const idx = daysList.indexOf(selectedDay);
        params.date = dates[idx];
      }
      if (statusFilter !== "all") params.status = statusFilter;
      if (selectedEmployeeId) params.employee_id = selectedEmployeeId;

      const res = await axios.get("http://localhost:5000/api/attendance", { params });
      setRecords(res.data);
    } catch (err) {
      console.error("خطأ في جلب الحضور:", err);
    }
  }, [selectedMonth, selectedWeek, selectedDay, statusFilter, selectedEmployeeId, getWeekDates, daysList]);

  const searchAttendance = async term => {
    try {
      const res = await axios.get(`http://localhost:5000/api/attendance/search?q=${term}`);
      setRecords(res.data);
    } catch (err) {
      console.error("خطأ في البحث:", err);
    }
  };

  const handleSearchChange = e => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() === "") {
      fetchAttendance();
    } else {
      searchAttendance(term);
    }
  };

  const generateWeeklyTable = () => {
    if (!selectedMonth || !selectedWeek) {
      alert("يرجى اختيار الشهر والأسبوع أولاً");
      return;
    }

    const dates = getWeekDates(selectedMonth, Number(selectedWeek));
    const initial = {};
    employees.forEach(emp => {
      initial[emp.id] = {};
      daysList.forEach((day, i) => {
        initial[emp.id][day] = "present";
      });
    });
    setWeeklyAttendance(initial);
    setWeekDates(dates);
    setWeekGenerated(true);
  };

  const handleWeeklyChange = (empId, day, value) => {
    setWeeklyAttendance(prev => ({
      ...prev,
      [empId]: { ...prev[empId], [day]: value }
    }));
  };

  const handleSubmitWeekly = async () => {
    const payload = [];

    employees.forEach(emp => {
      daysList.forEach((day, i) => {
        payload.push({
          employee_id: emp.id,
          date: weekDates[i],
          status: weeklyAttendance[emp.id][day]
        });
      });
    });

    try {
      await axios.post("http://localhost:5000/api/attendance", payload);
      alert("✅ تم حفظ التحضير الأسبوعي بنجاح");
      fetchAttendance();
    } catch (err) {
      console.error("خطأ في حفظ التحضير:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, [fetchEmployees, fetchAttendance]);

  return (
    <div className="employees-container">
      <h2>الحضور والغياب</h2>

      <div className="employee-search">
        <input
          type="text"
          placeholder="ابحث بالاسم أو الرقم أو القسم"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="employee-form">
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          <option value="">اختر الشهر</option>
          {monthsList.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <select value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)}>
          <option value="">اختر الأسبوع</option>
          {weeksList.map(w => (
            <option key={w} value={w}>الأسبوع {w}</option>
          ))}
        </select>

        <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
          <option value="">اختر اليوم</option>
          {daysList.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">عرض الكل</option>
          <option value="present">✅ الحضور</option>
          <option value="absent">❌ الغياب</option>
        </select>

        <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)}>
          <option value="">كل الموظفين</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
          ))}
        </select>

        <button onClick={fetchAttendance}>عرض</button>
      </div>

      <table className="employee-table">
        <thead>
          <tr>
            <th>الموظف</th>
            <th>القسم</th>
            <th>التاريخ</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {records.map(rec => (
            <tr key={rec.id}>
              <td>{rec.first_name} {rec.last_name}</td>
              <td>{rec.department_name}</td>
              <td>{rec.date}</td>
              <td>{rec.status === "present" ? "✅ حاضر" : "❌ غائب"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ نافذة التحضير الأسبوعي */}
      <div className="employee-form" style={{ marginTop: "40px" }}>
        <h3>📅 التحضير الأسبوعي</h3>

        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          <option value="">اختر الشهر</option>
          {monthsList.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <select value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)}>
          <option value="">اختر الأسبوع</option>
          {weeksList.map(w => (
            <option key={w} value={w}>الأسبوع {w}</option>
          ))}
        </select>
         <button onClick={generateWeeklyTable} style={{ marginTop: "12px" }}>
          📅 توليد كشف أسبوعي
        </button>
      </div>

      {weekGenerated && (
        <div style={{ marginTop: "20px" }}>
          <table className="employee-table">
            <thead>
              <tr>
                <th>الموظف</th>
                {daysList.map((day, i) => (
                  <th key={day}>
                    {day}
                    <br />
                    <small>{weekDates[i]}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.first_name} {emp.last_name}</td>
                  {daysList.map(day => (
                    <td key={day}>
                      <select
                        value={weeklyAttendance[emp.id][day]}
                        onChange={e => handleWeeklyChange(emp.id, day, e.target.value)}
                      >
                        <option value="present">✅ حاضر</option>
                        <option value="absent">❌ غائب</option>
                      </select>
                    </td>
                  ))}
  </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleSubmitWeekly} style={{ marginTop: "12px" }}>
            💾 حفظ التحضير
          </button>
        </div>
      )}
    </div>
  );
};

export default Attendance;


