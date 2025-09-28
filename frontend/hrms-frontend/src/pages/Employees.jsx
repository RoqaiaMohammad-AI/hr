import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/style.css"; // ← تأكد من وجود الملف في هذا المسار

const Employees = () => {
  // ✅ حالات التخزين
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]); // ← تخزين الأقسام
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department_id: ""
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ جلب جميع الموظفين
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // ✅ جلب الأقسام من قاعدة البيانات
  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  // ✅ البحث عن موظف
  const searchEmployees = async term => {
    try {
      const res = await axios.get(`http://localhost:5000/api/employees/search?q=${term}`);
      setEmployees(res.data);
    } catch (err) {
      console.error("Error searching employees:", err);
    }
  };

  // ✅ تحميل البيانات عند فتح الصفحة
  useEffect(() => {
    fetchEmployees();
    fetchDepartments(); // ← تحميل الأقسام أيضًا
  }, []);

  // ✅ تحديث النموذج عند تغيير أي حقل
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ إرسال النموذج (إضافة أو تعديل)
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editId) {
        // تعديل موظف
        await axios.put(`http://localhost:5000/api/employees/${editId}`, formData);
        setEditId(null);
      } else {
        // إضافة موظف جديد
        await axios.post("http://localhost:5000/api/employees", formData);
      }
      // إعادة تعيين النموذج
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        department_id: ""
      });
      fetchEmployees();
    } catch (err) {
      console.error("Error saving employee:", err.response?.data || err.message);
    }
  };

  // ✅ تعبئة النموذج عند الضغط على "تعديل"
  const handleEdit = emp => {
    setEditId(emp.id);
    setFormData({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone,
      department_id: emp.department_id || ""
    });
  };

  // ✅ حذف موظف
  const handleDelete = async id => {
    if (!window.confirm("هل تريد حذف هذا الموظف؟")) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      console.error("Error deleting employee:", err.response?.data || err.message);
    }
  };

  // ✅ تحديث البحث عند الكتابة
  const handleSearchChange = e => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() === "") {
      fetchEmployees();
    } else {
      searchEmployees(term);
    }
  };

  // ✅ واجهة العرض
  return (
    <div className="employees-container">
      <h2>الموظفين</h2>

      <div className="employee-search">
        <input
          type="text"
          placeholder="ابحث بالاسم أو الرقم أو القسم"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
        <input name="first_name" placeholder="الاسم الأول" value={formData.first_name} onChange={handleChange} required />
        <input name="last_name" placeholder="الاسم الأخير" value={formData.last_name} onChange={handleChange} required />
        <input name="email" placeholder="البريد الإلكتروني" value={formData.email} onChange={handleChange} />
        <input name="phone" placeholder="الهاتف" value={formData.phone} onChange={handleChange} />

        {/* ✅ اختيار القسم من القائمة الديناميكية */}
        <select name="department_id" value={formData.department_id} onChange={handleChange} required>
          <option value="">اختر القسم</option>
          {departments.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </select>

        <button type="submit">{editId ? "تحديث" : "إضافة"}</button>
      </form>

      <table className="employee-table">
        <thead>
          <tr>
            <th>الاسم الأول</th>
            <th>الاسم الأخير</th>
            <th>البريد الإلكتروني</th>
            <th>الهاتف</th>
            <th>القسم</th>
            <th>تاريخ التوظيف</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.first_name}</td>
              <td>{emp.last_name}</td>
              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td>{emp.department_name}</td>
              <td>{emp.hire_date ? emp.hire_date.split("T")[0] : ""}</td>
              <td>
                <div className="action-buttons">
                  <button onClick={() => handleEdit(emp)} className="edit-btn">تعديل</button>
                  <button onClick={() => handleDelete(emp.id)} className="delete-btn">حذف</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Employees;



