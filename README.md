# Employee Management System

A full-stack Employee Management System developed as part of the WeIntern Full Stack Development Internship — Week 2, Task 2.

## Project Overview

This application allows users to manage employee information through a web interface. It supports adding, viewing, updating, deleting, searching and sorting employee records.

Employee data is stored in a PostgreSQL database and accessed through a Flask REST API.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Python
- Flask
- PostgreSQL
- psycopg
- Postman

## Features

- Add new employees
- View employee records
- Edit employee details
- Delete employees with confirmation
- Search employees by name, department or role
- Sort employee records
- Input validation
- PostgreSQL database integration

## Project Structure

```text
employee-management-system/
├── backend/
│   ├── app.py
│   ├── database.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── database/
│   └── schema.sql
├── postman/
├── .env.example
├── .gitignore
└── README.md
```

## How to Run

### 1. Set Up PostgreSQL

Create a database named `employee_management` using pgAdmin.

Run the SQL commands from `database/schema.sql` to create the employees table.

### 2. Set Up Python

Open the backend folder and create a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
python -m pip install -r requirements.txt
```

### 3. Configure Database Connection

Create a `.env` file inside the backend folder using the settings in `.env.example`.

Enter your local PostgreSQL credentials.

### 4. Start the Application

```powershell
cd backend
python app.py
```

Open:

`http://127.0.0.1:5000/`

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees` | Get all employees |
| GET | `/api/employees/<id>` | Get one employee |
| POST | `/api/employees` | Add an employee |
| PUT | `/api/employees/<id>` | Update an employee |
| DELETE | `/api/employees/<id>` | Delete an employee |

## Database

PostgreSQL is used to store employee records.

Each employee has an ID, name, department, role, salary and joining date.

## Limitations

- The application currently runs locally.
- Authentication is not implemented.
- Only fictional employee data should be used for testing.

## Developed By

**Garvit Maheshwari**

Full Stack Development Internship  
WeIntern Pvt Ltd — Week 2, Task 2