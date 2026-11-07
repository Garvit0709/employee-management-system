
-- Employee Management System
-- PostgreSQL Database Schema

CREATE TABLE IF NOT EXISTS employees (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    role VARCHAR(100) NOT NULL,
    salary NUMERIC(10, 2) NOT NULL CHECK (salary >= 0),
    join_date DATE NOT NULL
);
