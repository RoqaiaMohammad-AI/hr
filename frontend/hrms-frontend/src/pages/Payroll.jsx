import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/style.css";

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [departments, setDepartments] = useState([]); // ✅ تخزين الأقسام
  const [formData, setFormData] = useState({
    employee_id: "",
    basic_salary: "",
    bonus: "",
    deductions: "",
    pay_month: ""
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:5000/api/payrolls";

  // ✅ جلب جميع الرواتب
  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setPayrolls(res.data);
    } catch (err) {
      console.error("خطأ في جلب البيانات:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ جلب الأقسام من قاعدة البيانات
  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("خطأ في جلب الأقسام:", err.message);
    }
  };

  // ✅ البحث
  const searchPayrolls = async term => {
    try {
      const res = await axios.get(`${API_BASE}/search?q=${term}`);
      setPayrolls(res.data);
    } catch (err) {
      console.error("خطأ في البحث:", err.message);
    }
  };

  // ✅ الفلترة حسب القسم والشهر
  const filterPayrolls = async () => {
    try {
      const res = await axios.get(`${API_BASE}/filter-by?department_id=${departmentFilter}&pay_month=${monthFilter}`);
      setPayrolls(res.data);
    } catch (err) {
      console.error("خطأ في الفلترة:", err.message);
    }
  };

  // ✅ تحميل البيانات عند فتح الصفحة
  useEffect(() => {
    fetchPayrolls();
    fetchDepartments(); // ← تحميل الأقسام أيضًا
  }, []);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_BASE}/${editId}`, formData);
        alert("تم التحديث بنجاح");
        setEditId(null);
      } else {
        await axios.post(API_BASE, formData);
        alert("تمت الإضافة بنجاح");
      }
      setFormData({
        employee_id: "",
        basic_salary: "",
        bonus: "",
        deductions: "",
        pay_month: ""
      });
      fetchPayrolls();
    } catch (err) {
      console.error("خطأ في الحفظ:", err.response?.data || err.message);
    }
  };

  const handleEdit = item => {
    setEditId(item.id);
    setFormData({
      employee_id: item.employee_id,
      basic_salary: item.basic_salary,
      bonus: item.bonus,
      deductions: item.deductions,
      pay_month: item.pay_month
    });
  };

  const handleDelete = async id => {
    if (window.confirm("هل تريد حذف هذا السجل؟")) {
      try {
        await axios.delete(`${API_BASE}/${id}`);
        fetchPayrolls();
      } catch (err) {
        console.error("خطأ في الحذف:", err.message);
      }
    }
  };

  const handlePaySalary = async id => {
    try {
      await axios.post(`${API_BASE}/${id}/pay`);
      fetchPayrolls();
    } catch (err) {
      console.error("خطأ في صرف الراتب:", err.message);
    }
  };

  const handleDeduct = async id => {
    const amount = prompt("أدخل مبلغ الخصم:");
    if (amount) {
      try {
        await axios.post(`${API_BASE}/${id}/deduct`, { amount: parseFloat(amount) });
        fetchPayrolls();
      } catch (err) {
        console.error("خطأ في تطبيق الخصم:", err.message);
      }
    }
  };

  const handleBonus = async id => {
    const amount = prompt("أدخل مبلغ المكافأة:");
    if (amount) {
      try {
        await axios.post(`${API_BASE}/${id}/bonus`, { amount: parseFloat(amount) });
        fetchPayrolls();
      } catch (err) {
        console.error("خطأ في إضافة المكافأة:", err.message);
      }
    }
  };

  const handleSearchChange = e => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() === "") {
      fetchPayrolls();
    } else {
      searchPayrolls(term);
    }
  };

  const handleDepartmentFilter = e => {
    setDepartmentFilter(e.target.value);
    filterPayrolls();
  };

  const handleMonthFilter = e => {
    setMonthFilter(e.target.value);
    filterPayrolls();
  };

  const handleGenerateMonthlyPayrolls = async () => {
    if (window.confirm("هل تريد توليد رواتب الشهر الحالي للموظفين النشطين؟")) {
      try {
        await axios.post(`${API_BASE}/generate-monthly`);
        fetchPayrolls();
        alert("تم توليد الرواتب بنجاح");
      } catch (err) {
        console.error("خطأ في توليد الرواتب:", err.response?.data || err.message);
      }
    }
  };

  return (
    <div className="section-container">
      <h2 className="section-title">📋 قسم الرواتب</h2>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="🔍 ابحث باسم الموظف أو رقمه"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />

        {/* ✅ اختيار القسم من القائمة الديناميكية */}
        <select value={departmentFilter} onChange={handleDepartmentFilter} className="filter-select">
          <option value="">كل الأقسام</option>
          {departments.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </select>

        <select value={monthFilter} onChange={handleMonthFilter} className="filter-select">
          <option value="">كل الأشهر</option>
          <option value="2025-09">سبتمبر 2025</option>
          <option value="2025-08">أغسطس 2025</option>
        </select>

        <button onClick={handleGenerateMonthlyPayrolls} className="primary-btn">📅 توليد رواتب الشهر</button>
      </div>

      <form onSubmit={handleSubmit} className="form-box">
        <input name="employee_id" placeholder="رقم الموظف" value={formData.employee_id} onChange={handleChange} required />
        <input name="basic_salary" placeholder="الراتب الأساسي" value={formData.basic_salary} onChange={handleChange} required />
        <input name="bonus" placeholder="المكافأة" value={formData.bonus} onChange={handleChange} />
        <input name="deductions" placeholder="الخصمية" value={formData.deductions} onChange={handleChange} />
        <input name="pay_month" type="month" placeholder="شهر الدفع" value={formData.pay_month} onChange={handleChange} required />
        <button type="submit" className="primary-btn">{editId ? "تحديث" : "إضافة"}</button>
      </form>

      {loading ? (
        <p>⏳ جاري تحميل البيانات...</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>الموظف</th>
              <th>القسم</th>
              <th>الراتب الأساسي</th>
              <th>المكافأة</th>
              <th>الخصمية</th>
              <th>الصافي</th>
              <th>الشهر</th>
              <th>تاريخ الصرف</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map(item => (
              <tr key={item.id}>
                <td>{item.first_name} {item.last_name}</td>
                <td>{item.department_name}</td>
                <td>{item.basic_salary}</td>
                <td>{item.bonus}</td>
                <td>{item.deductions}</td>
                <td>{item.net_salary}</td>
                <td>{item.pay_month}</td>
                <td>{item.paid_at ? item.paid_at.split("T")[0] : "غير مصروف"}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(item)} className="edit-btn">✏️</button>
                    <button onClick={() => handleDelete(item.id)} className="delete-btn">🗑️</button>
                    <button onClick={() => handlePaySalary(item.id)} className="pay-btn">💰</button>
                    <button onClick={() => handleDeduct(item.id)} className="deduct-btn">➖</button>
                    <button onClick={() => handleBonus(item.id)} className="bonus-btn">➕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Payroll;

              

