# 🧾 نظام إدارة الموارد البشرية والرواتب والحضور

نظام ER متكامل لإدارة الموظفين، الرواتب، والحضور والغياب، مصمم لتلبية احتياجات الشركات والمؤسسات. يتيح تسجيل الموظفين، توليد الرواتب، تتبع الحضور والغياب، مع واجهات سهلة الاستخدام وفلترة ديناميكية حسب التاريخ والقسم.

---

## 🧪 التقنيات المستخدمة

### 💻 الواجهة الأمامية (Frontend)

- ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) لغة البرمجة الأساسية
- ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) لبناء واجهات المستخدم
- ![React Router](https://img.shields.io/badge/React_Router-CA4245?logo=react-router&logoColor=white) للتنقل بين الصفحات
- ![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white) للتعامل مع API
- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) لتنسيق الصفحات

### 🖧 الواجهة الخلفية (Backend)

- ![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white) لغة البرمجة الأساسية
- ![Flask](https://img.shields.io/badge/Flask-000000?logo=flask&logoColor=white) لبناء RESTful API
- ![Flask-CORS](https://img.shields.io/badge/Flask--CORS-000000?logo=flask&logoColor=white) للسماح بالاتصال بين السيرفر والواجهة
- ![mysql-connector-python](https://img.shields.io/badge/MySQL_Connector-4479A1?logo=mysql&logoColor=white) للربط بقاعدة البيانات

### 🗄️ قاعدة البيانات

- ![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white) لتخزين البيانات
- الجداول:
  - `employees`: بيانات الموظفين
  - `departments`: أسماء الأقسام
  - `payrolls`: الرواتب الشهرية
  - `attendance`: الحضور والغياب

---

## 🚀 طريقة التشغيل

### 1. تشغيل الباك اند (Flask)

```bash
cd backend
pip install -r requirements.txt
flask run --port=5000
