
const API_URL = "/api/employees";

const table = document.getElementById("employeeTable");
const tableMessage = document.getElementById("tableMessage");
const formSection = document.getElementById("formSection");
const form = document.getElementById("employeeForm");
const formMessage = document.getElementById("formMessage");

let employees = [];
let sortColumn = "id";
let sortAscending = true;

// Load employees from Flask
async function loadEmployees() {
    tableMessage.textContent = "Loading employees...";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load employees");
        }

        employees = await response.json();
        displayEmployees();
    } catch (error) {
        table.replaceChildren();
        tableMessage.textContent = error.message;
    }
}

// Display employee records
function displayEmployees() {
    const search = document.getElementById("searchInput")
        .value.toLowerCase();

    let filtered = employees.filter(emp =>
        emp.name.toLowerCase().includes(search) ||
        emp.department.toLowerCase().includes(search) ||
        emp.role.toLowerCase().includes(search)
    );

    filtered.sort((a, b) => {
        let first = a[sortColumn];
        let second = b[sortColumn];

        if (sortColumn === "id" || sortColumn === "salary") {
            first = Number(first);
            second = Number(second);
        }

        let result;

        if (typeof first === "number") {
            result = first - second;
        } else {
            result = String(first).localeCompare(String(second));
        }

        return sortAscending ? result : -result;
    });

    table.replaceChildren();

    filtered.forEach(emp => {
        const row = document.createElement("tr");

        const values = [
            emp.id,
            emp.name,
            emp.department,
            emp.role,
            emp.salary,
            emp.join_date
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actions = document.createElement("td");

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "action-btn";
        editBtn.addEventListener("click", () => editEmployee(emp.id));

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "action-btn delete-btn";
        deleteBtn.addEventListener("click", () => deleteEmployee(emp.id));

        actions.append(editBtn, deleteBtn);
        row.appendChild(actions);
        table.appendChild(row);
    });

    tableMessage.textContent = filtered.length
        ? `${filtered.length} employee(s) found`
        : "No employees found";
}

// Open form for adding employee
document.getElementById("addBtn").addEventListener("click", () => {
    form.reset();
    document.getElementById("employeeId").value = "";
    document.getElementById("formTitle").textContent = "Add Employee";
    formMessage.textContent = "";
    formSection.hidden = false;
});

// Open form for editing employee
function editEmployee(id) {
    const emp = employees.find(item => item.id === id);

    if (!emp) return;

    document.getElementById("employeeId").value = emp.id;
    document.getElementById("name").value = emp.name;
    document.getElementById("department").value = emp.department;
    document.getElementById("role").value = emp.role;
    document.getElementById("salary").value = emp.salary;
    document.getElementById("joinDate").value = emp.join_date;

    document.getElementById("formTitle").textContent = "Edit Employee";
    formMessage.textContent = "";
    formSection.hidden = false;
    formSection.scrollIntoView({ behavior: "smooth" });
}

// Save employee
form.addEventListener("submit", async event => {
    event.preventDefault();
    const saveBtn = document.getElementById("saveBtn");

if (saveBtn.disabled) return;

saveBtn.disabled = true;
saveBtn.textContent = "Saving...";

    const id = document.getElementById("employeeId").value;

    const data = {
        name: document.getElementById("name").value.trim(),
        department: document.getElementById("department").value.trim(),
        role: document.getElementById("role").value.trim(),
        salary: document.getElementById("salary").value,
        join_date: document.getElementById("joinDate").value
    };

    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to save employee");
        }

        formSection.hidden = true;
        await loadEmployees();
        tableMessage.textContent = id
            ? "Employee updated successfully"
            : "Employee added successfully";

   } catch (error) {
    formMessage.textContent = error.message;
} finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Employee";
}
});

// Delete employee
async function deleteEmployee(id) {
    const confirmed = confirm("Are you sure you want to delete this employee?");

    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to delete employee");
        }

        await loadEmployees();
        tableMessage.textContent = "Employee deleted successfully";

    } catch (error) {
        tableMessage.textContent = error.message;
    }
}

// Cancel form
document.getElementById("cancelBtn").addEventListener("click", () => {
    formSection.hidden = true;
});

// Search employees
document.getElementById("searchInput").addEventListener("input", displayEmployees);

// Sort employees
document.querySelectorAll("th[data-sort]").forEach(heading => {
    heading.addEventListener("click", () => {
        const column = heading.dataset.sort;

        if (sortColumn === column) {
            sortAscending = !sortAscending;
        } else {
            sortColumn = column;
            sortAscending = true;
        }

        displayEmployees();
    });
});

// Load data when page opens
loadEmployees();
