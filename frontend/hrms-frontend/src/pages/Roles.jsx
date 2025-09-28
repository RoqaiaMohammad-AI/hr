import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/style.css";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({ name: "" });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ جلب الأدوار
  const fetchRoles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/roles");
      setRoles(res.data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  // ✅ البحث
  const handleSearchChange = e => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ تغيير النموذج
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ إرسال النموذج
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/roles/${editId}`, formData);
        setEditId(null);
      } else {
        await axios.post("http://localhost:5000/api/roles", formData);
      }
      setFormData({ name: "" });
      fetchRoles();
    } catch (err) {
      console.error("Error saving role:", err.response?.data || err.message);
    }
  };

  // ✅ تعديل
  const handleEdit = role => {
    setEditId(role.id);
    setFormData({ name: role.name });
  };

  // ✅ حذف
  const handleDelete = async id => {
    if (!window.confirm("هل تريد حذف هذا الدور؟")) return;
    try {
      await axios.delete(`http://localhost:5000/api/roles/${id}`);
      fetchRoles();
    } catch (err) {
      console.error("Error deleting role:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="employees-container">
      <h2>إدارة الأدوار</h2>

      <div className="employee-search">
        <input
          type="text"
          placeholder="🔍 ابحث باسم الدور"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
        <input
          name="name"
          placeholder="اسم الدور"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <button type="submit">{editId ? "تحديث" : "إضافة"}</button>
      </form>

      <table className="employee-table">
        <thead>
          <tr>
            <th>اسم الدور</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredRoles.map(role => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td>
                <div className="action-buttons">
                  <button onClick={() => handleEdit(role)} className="edit-btn">تعديل</button>
                  <button onClick={() => handleDelete(role.id)} className="delete-btn">حذف</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Roles;

