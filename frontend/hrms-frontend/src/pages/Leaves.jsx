import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/style.css";

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
    reason: "",
    status: "مدفوعة"
  });
  const [editId, setEditId] = useState(null);
  const [filterMode, setFilterMode] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");

  // ✅ جلب الإجازات
  const fetchLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves");
      setLeaves(res.data);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    }
  };

  // ✅ جلب الموظفين
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // ✅ فلترة حسب الأسبوع أو الشهر
  const filterLeaves = async () => {
    if (!filterMode || !filterEmployee) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/leaves/filter?mode=${filterMode}&employee_id=${filterEmployee}`);
      setLeaves(res.data);
    } catch (err) {
      console.error("Error filtering leaves:", err);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/leaves/${editId}`, formData);
        setEditId(null);
      } else {
        await axios.post("http://localhost:5000/api/leaves", formData);
      }
      setFormData({
        employee_id: "",
        start_date: "",
        end_date: "",
        reason: "",
        status: "مدفوعة"
      });
      fetchLeaves();
    } catch (err) {
      console.error("Error saving leave:", err.response?.data || err.message);
    }
  };

  const handleEdit = leave => {
    setEditId(leave.id);
    setFormData({
      employee_id: leave.employee_id,
      start_date: leave.start_date.split("T")[0],
      end_date: leave.end_date.split("T")[0],
      reason: leave.reason,
      status: leave.status
    });
  };

  const handleDelete = async id => {
    if (!window.confirm("هل تريد حذف هذه الإجازة؟")) return;
    try {
      await axios.delete(`http://localhost:5000/api/leaves/${id}`);
      fetchLeaves();
    } catch (err) {
      console.error("Error deleting leave:", err.response?.data || err.message);
    }
  };

  return (
    <div className="employees-container">
      <h2>إدارة الإجازات</h2>

      {/* ✅ فلترة حسب الموظف */}
      <div className="employee-search">
        <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
          <option value="">اختر الموظف</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.first_name} {emp.last_name}
            </option>
          ))}
        </select>

        <select value={filterMode} onChange={e => setFilterMode(e.target.value)}>
          <option value="">اختر الفترة</option>
          <option value="week">هذا الأسبوع</option>
          <option value="month">هذا الشهر</option>
        </select>

        <button onClick={filterLeaves}>تصفية</button>
      </div>

      {/* ✅ نموذج إضافة / تعديل إجازة */}
      <form onSubmit={handleSubmit} className="employee-form">
        <select name="employee_id" value={formData.employee_id} onChange={handleChange} required>
          <option value="">اختر الموظف</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.first_name} {emp.last_name}
            </option>
          ))}
        </select>

        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
        <input name="reason" placeholder="سبب الإجازة" value={formData.reason} onChange={handleChange} />

        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="مدفوعة">إجازة براتب</option>
          <option value="غير مدفوعة">إجازة بدون راتب</option>
        </select>

              <button type="submit">{editId ? "تحديث" : "إضافة"}</button>
      </form>

      {/* ✅ جدول الإجازات */}
      <table className="employee-table">
        <thead>
          <tr>
            <th>الموظف</th>
            <th>القسم</th>
            <th>من تاريخ</th>
            <th>إلى تاريخ</th>
            <th>السبب</th>
            <th>النوع</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map(leave => (
            <tr key={leave.id}>
              <td>{leave.first_name} {leave.last_name}</td>
              <td>{leave.department_name}</td>
              <td>{leave.start_date ? leave.start_date.split("T")[0] : ""}</td>
              <td>{leave.end_date ? leave.end_date.split("T")[0] : ""}</td>
              <td>{leave.reason}</td>
              <td>{leave.status}</td>
              <td>
                <div className="action-buttons">
                  <button onClick={() => handleEdit(leave)} className="edit-btn">تعديل</button>
                  <button onClick={() => handleDelete(leave.id)} className="delete-btn">حذف</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaves;
