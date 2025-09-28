import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/style.css";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ جلب الأقسام
  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  // ✅ تحميل الأقسام عند فتح الصفحة
  useEffect(() => {
    fetchDepartments();
  }, []);

  // ✅ تحديث النموذج
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ إرسال النموذج
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/departments/${editId}`, formData);
        setEditId(null);
      } else {
        await axios.post("http://localhost:5000/api/departments", formData);
      }
      setFormData({ name: "", description: "" });
      fetchDepartments();
    } catch (err) {
      console.error("Error saving department:", err.response?.data || err.message);
    }
  };

  // ✅ تعديل قسم
  const handleEdit = dep => {
    setEditId(dep.id);
    setFormData({ name: dep.name, description: dep.description || "" });
  };

  // ✅ حذف قسم
  const handleDelete = async id => {
    if (!window.confirm("هل تريد حذف هذا القسم؟")) return;
    try {
      await axios.delete(`http://localhost:5000/api/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      console.error("Error deleting department:", err.response?.data || err.message);
    }
  };

  // ✅ البحث
  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  const filteredDepartments = departments.filter(dep =>
    dep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dep.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="employees-container">
      <h2>إدارة الأقسام</h2>

      <div className="employee-search">
        <input
          type="text"
          placeholder="🔍 ابحث باسم القسم أو الوصف"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
        <input
          name="name"
          placeholder="اسم القسم"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          name="description"
          placeholder="وصف القسم"
          value={formData.description}
          onChange={handleChange}
        />
        <button type="submit">{editId ? "تحديث" : "إضافة"}</button>
      </form>

      <table className="employee-table">
        <thead>
          <tr>
            <th>اسم القسم</th>
            <th>الوصف</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredDepartments.map(dep => (
            <tr key={dep.id}>
              <td>{dep.name}</td>
              <td>{dep.description}</td>
              <td>
                <div className="action-buttons">
                  <button onClick={() => handleEdit(dep)} className="edit-btn">تعديل</button>
                  <button onClick={() => handleDelete(dep.id)} className="delete-btn">حذف</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Departments;
