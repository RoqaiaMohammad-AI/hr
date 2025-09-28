import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/style.css"; // ← تأكد من وجود الملف في هذا المسار

const Users = () => {
  // ✅ حالات التخزين
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); // ← تخزين الأدوار
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role_id: ""
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ جلب جميع المستخدمين
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // ✅ جلب الأدوار من قاعدة البيانات
  const fetchRoles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/roles");
      setRoles(res.data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  // ✅ البحث عن مستخدم
  const searchUsers = async term => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/search?q=${term}`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  // ✅ تحميل البيانات عند فتح الصفحة
  useEffect(() => {
    fetchUsers();
    fetchRoles(); // ← تحميل الأدوار أيضًا
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
        // تعديل مستخدم
        await axios.put(`http://localhost:5000/api/users/${editId}`, formData);
        setEditId(null);
      } else {
        // إضافة مستخدم جديد
        await axios.post("http://localhost:5000/api/users", formData);
      }
      // إعادة تعيين النموذج
      setFormData({
        username: "",
        password: "",
        role_id: ""
      });
      fetchUsers();
    } catch (err) {
      console.error("Error saving user:", err.response?.data || err.message);
    }
  };

  // ✅ تعبئة النموذج عند الضغط على "تعديل"
  const handleEdit = user => {
    setEditId(user.id);
    setFormData({
      username: user.username,
      password: "", // ← لا نعرض كلمة المرور
      role_id: roles.find(r => r.name === user.role_name)?.id || ""
    });
  };

  // ✅ حذف مستخدم
  const handleDelete = async id => {
    if (!window.confirm("هل تريد حذف هذا المستخدم؟")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err.response?.data || err.message);
    }
  };

  // ✅ تحديث البحث عند الكتابة
  const handleSearchChange = e => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() === "") {
      fetchUsers();
    } else {
      searchUsers(term);
    }
  };

  // ✅ واجهة العرض
  return (
    <div className="employees-container">
      <h2>المستخدمين</h2>

      <div className="employee-search">
        <input
          type="text"
          placeholder="ابحث باسم المستخدم أو الدور"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
        <input
          name="username"
          placeholder="اسم المستخدم"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="كلمة المرور"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {/* ✅ اختيار الدور من القائمة الديناميكية */}
        <select name="role_id" value={formData.role_id} onChange={handleChange} required>
          <option value="">اختر الدور</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>

        <button type="submit">{editId ? "تحديث" : "إضافة"}</button>
      </form>

      <table className="employee-table">
        <thead>
          <tr>
            <th>اسم المستخدم</th>
            <th>الدور</th>
            <th>تاريخ الإنشاء</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.role_name}</td>
              <td>{user.created_at ? user.created_at.split("T")[0] : ""}</td>
              <td>
                <div className="action-buttons">
                  <button onClick={() => handleEdit(user)} className="edit-btn">تعديل</button>
                  <button onClick={() => handleDelete(user.id)} className="delete-btn">حذف</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
