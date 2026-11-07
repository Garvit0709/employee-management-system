
from flask import Flask, jsonify, request, send_from_directory
from pathlib import Path
from psycopg.rows import dict_row
from datetime import date
from decimal import Decimal, InvalidOperation
from database import get_connection

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app = Flask(__name__, static_folder=str(FRONTEND_DIR),
            static_url_path="/static")


def format_employee(employee):
    employee["salary"] = str(employee["salary"])
    employee["join_date"] = employee["join_date"].isoformat()
    return employee


def validate_employee(data):
    if not isinstance(data, dict):
        return None, "Invalid JSON data"

    required = ["name", "department", "role", "salary", "join_date"]

    for field in required:
        if field not in data or data[field] is None:
            return None, f"{field} is required"

    try:
        name = data["name"].strip()
        department = data["department"].strip()
        role = data["role"].strip()
        salary = Decimal(str(data["salary"]))
        join_date = date.fromisoformat(data["join_date"])

        if not (2 <= len(name) <= 100):
            return None, "Name must contain 2 to 100 characters"

        if not (1 <= len(department) <= 50):
            return None, "Invalid department"

        if not (1 <= len(role) <= 100):
            return None, "Invalid role"

        if not salary.is_finite() or salary < 0 or salary >= 100000000:
            return None, "Invalid salary"

        if salary.as_tuple().exponent < -2:
            return None, "Salary must have at most 2 decimal places"

    except (ValueError, TypeError, AttributeError, InvalidOperation):
        return None, "Please enter valid employee details"

    return {
        "name": name,
        "department": department,
        "role": role,
        "salary": salary,
        "join_date": join_date
    }, None


@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


# READ - All employees
@app.route("/api/employees", methods=["GET"])
def get_employees():
    try:
        with get_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute("SELECT * FROM employees ORDER BY id")
                employees = cur.fetchall()

        return jsonify([format_employee(e) for e in employees]), 200

    except Exception:
        app.logger.exception("Failed to retrieve employees")
        return jsonify({"error": "Database operation failed"}), 500


# READ - Single employee
@app.route("/api/employees/<int:employee_id>", methods=["GET"])
def get_employee(employee_id):
    try:
        with get_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    "SELECT * FROM employees WHERE id = %s",
                    (employee_id,)
                )
                employee = cur.fetchone()

        if employee is None:
            return jsonify({"error": "Employee not found"}), 404

        return jsonify(format_employee(employee)), 200

    except Exception:
        app.logger.exception("Failed to retrieve employee")
        return jsonify({"error": "Database operation failed"}), 500


# CREATE
@app.route("/api/employees", methods=["POST"])
def add_employee():
    data, error = validate_employee(request.get_json(silent=True))

    if error:
        return jsonify({"error": error}), 400

    try:
        with get_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute("""
                    INSERT INTO employees
                    (name, department, role, salary, join_date)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING *
                """, (
                    data["name"],
                    data["department"],
                    data["role"],
                    data["salary"],
                    data["join_date"]
                ))

                employee = cur.fetchone()

        return jsonify(format_employee(employee)), 201

    except Exception:
        app.logger.exception("Failed to add employee")
        return jsonify({"error": "Database operation failed"}), 500


# UPDATE
@app.route("/api/employees/<int:employee_id>", methods=["PUT"])
def update_employee(employee_id):
    data, error = validate_employee(request.get_json(silent=True))

    if error:
        return jsonify({"error": error}), 400

    try:
        with get_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute("""
                    UPDATE employees
                    SET name = %s,
                        department = %s,
                        role = %s,
                        salary = %s,
                        join_date = %s
                    WHERE id = %s
                    RETURNING *
                """, (
                    data["name"],
                    data["department"],
                    data["role"],
                    data["salary"],
                    data["join_date"],
                    employee_id
                ))

                employee = cur.fetchone()

        if employee is None:
            return jsonify({"error": "Employee not found"}), 404

        return jsonify(format_employee(employee)), 200

    except Exception:
        app.logger.exception("Failed to update employee")
        return jsonify({"error": "Database operation failed"}), 500


# DELETE
@app.route("/api/employees/<int:employee_id>", methods=["DELETE"])
def delete_employee(employee_id):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "DELETE FROM employees WHERE id = %s RETURNING id",
                    (employee_id,)
                )
                deleted = cur.fetchone()

        if deleted is None:
            return jsonify({"error": "Employee not found"}), 404

        return jsonify({"message": "Employee deleted successfully"}), 200

    except Exception:
        app.logger.exception("Failed to delete employee")
        return jsonify({"error": "Database operation failed"}), 500


if __name__ == "__main__":
    app.run(debug=True)
