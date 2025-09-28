from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from werkzeug.security import check_password_hash, generate_password_hash
import datetime

app = Flask(__name__)
CORS(app)

# ------------------ الاتصال بقاعدة البيانات ------------------
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="Roqaia",
        password="RO20qa02ia2025",
        database="hrms"
    )

# ------------------ route رئيسية للاختبار ------------------
@app.route("/")
def home():
    return jsonify({"msg": "HRMS API تعمل بنجاح"})

# ------------------ تسجيل الدخول ------------------
@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"msg": "يرجى إرسال اسم المستخدم وكلمة المرور"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return jsonify({"msg": "المستخدم غير موجود"}), 401

        db_password = user.get("password") or ""

        try:
            if db_password and check_password_hash(db_password, password):
                token = f"{user['id']}-{int(datetime.datetime.utcnow().timestamp())}"
                return jsonify({
                    "access_token": token,
                    "user": {"id": user["id"], "username": user["username"], "role_id": user.get("role_id")}
                }), 200
        except Exception:
            pass

        if db_password == password:
            token = f"{user['id']}-{int(datetime.datetime.utcnow().timestamp())}"
            return jsonify({
                "access_token": token,
                "user": {"id": user["id"], "username": user["username"], "role_id": user.get("role_id")}
            }), 200

        return jsonify({"msg": "اسم المستخدم أو كلمة المرور غير صحيحة"}), 401

    except Exception as e:
        return jsonify({"msg": "حدث خطأ في الخادم عند محاولة تسجيل الدخول", "error": str(e)}), 500

# ------------------ الموظفين ------------------
        database="your_database"
 #-------- عرض جميع الموظفين ------------------
@app.route("/api/employees", methods=["GET"])
def get_employees():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT e.id, e.first_name, e.last_name, e.email, e.phone,
               e.department_id, e.hire_date, e.created_at,
               d.name AS department_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
    """)
    employees = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(employees)
# ------------------ إضافة موظف جديد ------------------
@app.route("/api/employees", methods=["POST"])
def add_employee():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO employees (first_name, last_name, email, phone, department_id, hire_date, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        data.get("first_name"),
        data.get("last_name"),
        data.get("email"),
        data.get("phone"),
        data.get("department_id"),
        datetime.date.today(),       # ← تاريخ التوظيف = اليوم
        datetime.datetime.now()      # ← تاريخ الإنشاء = الآن
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم إضافة الموظف بنجاح"}), 201

# ------------------ تعديل بيانات موظف ------------------

@app.route("/api/employees/<int:id>", methods=["PUT"])
def update_employee(id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE employees
        SET first_name=%s, last_name=%s, email=%s, phone=%s, department_id=%s
        WHERE id=%s
    """, (
        data.get("first_name"),
        data.get("last_name"),
        data.get("email"),
        data.get("phone"),
        data.get("department_id"),
        id
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم تعديل بيانات الموظف بنجاح"})

# ------------------ حذف موظف ------------------
# ✅ حذف موظف حسب رقم التعريف
@app.route("/api/employees/<int:id>", methods=["DELETE"])
def delete_employee(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM employees WHERE id=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"msg": "تم حذف الموظف بنجاح"})
    except Exception as e:
        return jsonify({"msg": "حدث خطأ أثناء الحذف", "error": str(e)}), 500

# ------------------ البحث عن موظف ------------------
@app.route("/api/employees/search", methods=["GET"])
def search_employees():
    query = request.args.get("q", "").strip()
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT e.id, e.first_name, e.last_name, e.email, e.phone,
               e.department_id, e.hire_date, e.created_at,
               d.name AS department_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.first_name LIKE %s OR e.last_name LIKE %s
              OR CAST(e.id AS CHAR) LIKE %s OR d.name LIKE %s
    """, (
        f"%{query}%", f"%{query}%", f"%{query}%", f"%{query}%"
    ))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results)

#  ------------------ المرتبااااات ------------------

# ✅ عرض جميع الرواتب
@app.route("/api/payrolls", methods=["GET"])
def get_all_payrolls():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.*, e.first_name, e.last_name, d.name AS department_name
        FROM payroll p
        JOIN employees e ON p.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        ORDER BY p.pay_month DESC
    """)
    payrolls = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(payrolls)

# ✅ إضافة راتب
@app.route("/api/payrolls", methods=["POST"])
def add_payroll():
    data = request.get_json()
    basic = float(data["basic_salary"])
    bonus = float(data.get("bonus", 0.00))
    deductions = float(data.get("deductions", 0.00))
    net = basic + bonus - deductions
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO payroll (employee_id, basic_salary, bonus, deductions, net_salary, pay_month, is_paid, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, FALSE, NOW())
    """, (
        data["employee_id"], basic, bonus, deductions, net, data["pay_month"]
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تمت الإضافة بنجاح"})

# ✅ تعديل راتب
@app.route("/api/payrolls/<int:id>", methods=["PUT"])
def update_payroll(id):
    data = request.get_json()
    basic = float(data["basic_salary"])
    bonus = float(data.get("bonus", 0.00))
    deductions = float(data.get("deductions", 0.00))
    net = basic + bonus - deductions
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE payroll
        SET employee_id = %s, basic_salary = %s, bonus = %s, deductions = %s,
            net_salary = %s, pay_month = %s
        WHERE id = %s
    """, (
        data["employee_id"], basic, bonus, deductions, net, data["pay_month"], id
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم التحديث بنجاح"})

# ✅ حذف راتب
@app.route("/api/payrolls/<int:id>", methods=["DELETE"])
def delete_payroll(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM payroll WHERE id = %s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم الحذف بنجاح"})

# ✅ صرف الراتب
@app.route("/api/payrolls/<int:id>/pay", methods=["POST"])
def pay_salary(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE payroll SET is_paid = TRUE, paid_at = NOW() WHERE id = %s
    """, (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم صرف الراتب"})

# ✅ إضافة خصم
@app.route("/api/payrolls/<int:id>/deduct", methods=["POST"])
def apply_deduction(id):
    data = request.get_json()
    amount = float(data.get("amount", 0.00))
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE payroll
        SET deductions = deductions + %s,
            net_salary = basic_salary + bonus - (deductions + %s),
            deduction_date = NOW()
        WHERE id = %s
    """, (amount, amount, id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم تطبيق الخصم"})

# ✅ إضافة مكافأة
@app.route("/api/payrolls/<int:id>/bonus", methods=["POST"])
def apply_bonus(id):
    data = request.get_json()
    amount = float(data.get("amount", 0.00))
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE payroll
        SET bonus = bonus + %s,
            net_salary = basic_salary + (bonus + %s) - deductions,
            bonus_date = NOW()
        WHERE id = %s
    """, (amount, amount, id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم إضافة المكافأة"})

# ✅ فلترة حسب القسم والشهر
@app.route("/api/payrolls/filter-by", methods=["GET"])
def filter_by():
    department_id = request.args.get("department_id")
    pay_month = request.args.get("pay_month")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT p.*, e.first_name, e.last_name, d.name AS department_name
        FROM payroll p
        JOIN employees e ON p.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE 1=1
    """
    params = []
    if department_id:
        query += " AND d.id = %s"
        params.append(department_id)
    if pay_month:
        query += " AND p.pay_month = %s"
        params.append(pay_month)
    cursor.execute(query, tuple(params))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results)

# ✅ البحث
@app.route("/api/payrolls/search", methods=["GET"])
def search():
    q = request.args.get("q", "")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.*, e.first_name, e.last_name, d.name AS department_name
        FROM payroll p
        JOIN employees e ON p.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.first_name LIKE %s OR e.last_name LIKE %s OR CAST(p.employee_id AS CHAR) LIKE %s
    """, (f"%{q}%", f"%{q}%", f"%{q}%"))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results)

# ✅ توليد رواتب تلقائيًا للموظفين النشطين
@app.route("/api/payrolls/generate-monthly", methods=["POST"])
def generate_monthly():
    from datetime import datetime
    current_month = datetime.now().strftime("%Y-%m")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # جلب الموظفين النشطين فقط
    cursor.execute("SELECT id FROM employees WHERE is_active = TRUE")
    employees = cursor.fetchall()

    # جلب الموظفين الذين لديهم راتب لهذا الشهر
    # جلب الموظفين الذين لديهم راتب لهذا الشهر
    cursor.execute("SELECT employee_id FROM payroll WHERE pay_month = %s", (current_month,))
    existing = {row["employee_id"] for row in cursor.fetchall()}

    # توليد الرواتب بقيمة ثابتة مؤقتًا (مثلاً 1000 ريال)
    for emp in employees:
        if emp["id"] not in existing:
            salary = 1000.00  # يمكنك تعديلها حسب الحاجة
            cursor.execute("""
                INSERT INTO payroll (
                    employee_id, basic_salary, bonus, deductions, net_salary,
                    pay_month, is_paid, created_at
                )
                VALUES (%s, %s, 0.00, 0.00, %s, %s, FALSE, NOW())
            """, (
                emp["id"], salary, salary, current_month
            ))

    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم توليد الرواتب لهذا الشهر بنجاح"})


# ------------------  الاقسااام  ------------------
@app.route("/api/departments", methods=["GET"])
def get_departments():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name FROM departments")
    departments = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(departments)

#-----------------كشف الحضور والغياااب-------------------

# ------------------ عرض الحضور حسب الفلاتر ------------------
@app.route("/api/attendance", methods=["GET"])
def get_attendance():
    date_param = request.args.get("date")          # YYYY-MM-DD
    week_param = request.args.get("week")          # YYYY-MM-Wn
    month_param = request.args.get("month")        # YYYY-MM
    status = request.args.get("status")            # present | absent
    emp_id = request.args.get("employee_id")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT a.id, a.employee_id, a.date, a.status,
               e.first_name, e.last_name, d.name AS department_name
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE 1=1
    """
    params = []

    if date_param:
        sql += " AND a.date = %s"
        params.append(date_param)

    elif week_param:
        ym, wnum = week_param.split("-W")
        year, month = map(int, ym.split("-"))
        widx = int(wnum) - 1
        first_day = datetime.date(year, month, 1)
        offset = (6 - first_day.weekday()) % 7
        first_sunday = first_day + datetime.timedelta(days=offset)
        week_start = first_sunday + datetime.timedelta(days=7 * widx)
        dates = [(week_start + datetime.timedelta(days=i)).isoformat() for i in range(5)]
        sql += f" AND a.date IN ({','.join(['%s'] * len(dates))})"
        params.extend(dates)

    elif month_param:
        sql += " AND a.date LIKE %s"
        params.append(f"{month_param}-%")

    if status:
        sql += " AND a.status = %s"
        params.append(status)

    if emp_id:
        sql += " AND a.employee_id = %s"
        params.append(emp_id)

    cursor.execute(sql, params)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results)

# ------------------ حفظ الحضور (يومي أو أسبوعي) ------------------
@app.route("/api/attendance", methods=["POST"])
def save_attendance():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()

    for rec in data:
        cursor.execute("""
            INSERT INTO attendance (employee_id, date, status)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE status = VALUES(status)
        """, (rec["employee_id"], rec["date"], rec["status"]))

    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم حفظ الحضور بنجاح"}), 201

# ------------------ حذف سجل حضور ------------------
@app.route("/api/attendance/<int:id>", methods=["DELETE"])
def delete_attendance(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM attendance WHERE id = %s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"msg": "تم حذف السجل بنجاح"})
    except Exception as e:
        return jsonify({"msg": "حدث خطأ أثناء الحذف", "error": str(e)}), 500

# ------------------ جلب الموظفين النشطين فقط ------------------
@app.route("/api/employees/active", methods=["GET"])
def get_active_employees():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT e.id, e.first_name, e.last_name, d.name AS department_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.is_active = 1
    """)
    employees = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(employees)

# ------------------ البحث في الحضور ------------------
@app.route("/api/attendance/search", methods=["GET"])
def search_attendance():
    query = request.args.get("q", "").strip()
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT a.id, a.date, a.status,
               e.first_name, e.last_name, d.name AS department_name
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.first_name LIKE %s OR e.last_name LIKE %s
              OR CAST(e.id AS CHAR) LIKE %s OR d.name LIKE %s
    """, (
        f"%{query}%", f"%{query}%", f"%{query}%", f"%{query}%"
    ))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results)

#-----------------المستخدمين------------
# ------------------ المستخدمون ------------------
# تأكد أن لديك جدول users(id, username, password, role_id, created_at)
# وجدول roles(id, name)

# -------- عرض جميع المستخدمين ------------------
@app.route("/api/users", methods=["GET"])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT u.id, u.username, u.password, u.created_at,
               r.name AS role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
    """)
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(users)

# ------------------ إضافة مستخدم جديد ------------------
@app.route("/api/users", methods=["POST"])
def add_user():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (username, password, role_id, created_at)
        VALUES (%s, %s, %s, %s)
    """, (
        data.get("username"),
        data.get("password"),
        data.get("role_id"),
        datetime.datetime.now()
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم إضافة المستخدم بنجاح"}), 201

# ------------------ تعديل بيانات مستخدم ------------------
@app.route("/api/users/<int:id>", methods=["PUT"])
def update_user(id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users
        SET username=%s, password=%s, role_id=%s
        WHERE id=%s
    """, (
        data.get("username"),
        data.get("password"),
        data.get("role_id"),
        id
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم تعديل بيانات المستخدم بنجاح"})

# ------------------ حذف مستخدم ------------------
@app.route("/api/users/<int:id>", methods=["DELETE"])
def delete_user(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"msg": "تم حذف المستخدم بنجاح"})
    except Exception as e:
        return jsonify({"msg": "حدث خطأ أثناء الحذف", "error": str(e)}), 500

# ------------------ البحث عن مستخدم ------------------
@app.route("/api/users/search", methods=["GET"])
def search_users():
    query = request.args.get("q", "").strip()
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT u.id, u.username, u.password, u.created_at,
               r.name AS role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.username LIKE %s OR CAST(u.id AS CHAR) LIKE %s OR r.name LIKE %s
    """, (
        f"%{query}%", f"%{query}%", f"%{query}%"
    ))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results)

# ------------------ جلب جميع الأدوار ------------------
@app.route("/api/roles", methods=["GET"])
def get_roles():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM roles")
    roles = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(roles)



# ------------------ إدارة الأدوار ------------------

# ✅ جلب جميع الأدوار
@app.route("/api/roles", methods=["GET"])
def fetch_roles():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM roles")
    roles = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(roles)

# ✅ إضافة دور جديد
@app.route("/api/roles", methods=["POST"])
def add_role():
    data = request.get_json()
    name = data.get("name")
    if not name:
        return jsonify({"msg": "اسم الدور مطلوب"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO roles (name) VALUES (%s)", (name,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم إضافة الدور بنجاح"}), 201

# ✅ تعديل اسم الدور
@app.route("/api/roles/<int:id>", methods=["PUT"])
def update_role(id):
    data = request.get_json()
    name = data.get("name")
    if not name:
        return jsonify({"msg": "اسم الدور مطلوب"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE roles SET name=%s WHERE id=%s", (name, id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم تعديل الدور بنجاح"})

# ✅ حذف دور
@app.route("/api/roles/<int:id>", methods=["DELETE"])
def delete_role(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM roles WHERE id=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"msg": "تم حذف الدور بنجاح"})
    except Exception as e:
        return jsonify({"msg": "حدث خطأ أثناء الحذف", "error": str(e)}), 500

# ------------------ الأقسام ------------------

# ✅ جلب جميع الأقسام
@app.route("/api/departments", methods=["GET"])
def fetch_departments():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM departments")
    departments = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(departments)

# ✅ إضافة قسم جديد
@app.route("/api/departments", methods=["POST"])
def add_department():
    data = request.get_json()
    name = data.get("name")
    description = data.get("description")

    if not name:
        return jsonify({"msg": "اسم القسم مطلوب"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO departments (name, description) VALUES (%s, %s)", (name, description))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم إضافة القسم بنجاح"}), 201

# ✅ تعديل قسم
@app.route("/api/departments/<int:id>", methods=["PUT"])
def update_department(id):
    data = request.get_json()
    name = data.get("name")
    description = data.get("description")

    if not name:
        return jsonify({"msg": "اسم القسم مطلوب"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE departments SET name=%s, description=%s WHERE id=%s", (name, description, id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم تعديل القسم بنجاح"})

# ✅ حذف قسم
@app.route("/api/departments/<int:id>", methods=["DELETE"])
def delete_department(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM departments WHERE id=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"msg": "تم حذف القسم بنجاح"})
    except Exception as e:
        return jsonify({"msg": "حدث خطأ أثناء الحذف", "error": str(e)}), 500


# ------------------ الإجازات ------------------

# ✅ جلب جميع الإجازات
@app.route("/api/leaves", methods=["GET"])
def get_leaves():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT l.id, l.employee_id, l.start_date, l.end_date, l.reason, l.status,
               e.first_name, e.last_name, d.name AS department_name
        FROM leaves l
        JOIN employees e ON l.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
    """)
    leaves = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(leaves)

# ✅ إضافة إجازة جديدة
@app.route("/api/leaves", methods=["POST"])
def add_leave():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO leaves (employee_id, start_date, end_date, reason, status)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        data.get("employee_id"),
        data.get("start_date"),
        data.get("end_date"),
        data.get("reason"),
        data.get("status")
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم تسجيل الإجازة بنجاح"}), 201

# ✅ تعديل إجازة
@app.route("/api/leaves/<int:id>", methods=["PUT"])
def update_leave(id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE leaves
        SET employee_id=%s, start_date=%s, end_date=%s, reason=%s, status=%s
        WHERE id=%s
    """, (
        data.get("employee_id"),
        data.get("start_date"),
        data.get("end_date"),
        data.get("reason"),
        data.get("status"),
        id
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "تم تعديل الإجازة بنجاح"})

# ✅ حذف إجازة
@app.route("/api/leaves/<int:id>", methods=["DELETE"])
def delete_leave(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM leaves WHERE id=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"msg": "تم حذف الإجازة بنجاح"})
    except Exception as e:
        return jsonify({"msg": "حدث خطأ أثناء الحذف", "error": str(e)}), 500

# ✅ جلب إجازات حسب الأسبوع أو الشهر
@app.route("/api/leaves/filter", methods=["GET"])
def filter_leaves():
    mode = request.args.get("mode")  # "week" أو "month"
    employee_id = request.args.get("employee_id")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if mode == "week":
        cursor.execute("""
            SELECT * FROM leaves
            WHERE employee_id = %s AND YEARWEEK(start_date) = YEARWEEK(CURDATE())
        """, (employee_id,))
    elif mode == "month":
        cursor.execute("""
            SELECT * FROM leaves
            WHERE employee_id = %s AND MONTH(start_date) = MONTH(CURDATE()) AND YEAR(start_date) = YEAR(CURDATE())
        """, (employee_id,))
    else:
        cursor.close()
        conn.close()
        return jsonify([])

    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results)



# ------------------ تشغيل السيرفر ------------------
if __name__ == "__main__":
    app.run(debug=True)
 