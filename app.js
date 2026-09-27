const express = require("express");
const app = express();
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override");
const mysql = require("mysql2");
require("dotenv").config();

const PORT = process.env.PORT || 8000;

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// MySQL Connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Check MySQL Connection
connection.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
    return;
  }

  console.log("Database connected successfully");
});

// ================= GET ALL EMPLOYEES =================

app.get("/employees", (req, res) => {
  const q = "SELECT * FROM employees";

  connection.query(q, (err, result) => {
    if (err) {
      console.log(err);
      return res.send("ERROR");
    }

    const employees = result;

    res.render("index.ejs", { employees });
  });
});

// ================= SHOW NEW EMPLOYEE FORM =================

app.get("/employees/new", (req, res) => {
  res.render("new.ejs");
});

// ================= CREATE EMPLOYEE =================

app.post("/employees", (req, res) => {
  const { name, email, department, salary } = req.body;

  const id = uuidv4();

  const q = `
    INSERT INTO employees
    (id, name, email, department, salary)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [id, name, email, department, salary];

  connection.query(q, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.send("ERROR");
    }

    res.redirect("/employees");
  });
});

// ================= SHOW ONE EMPLOYEE =================

app.get("/employees/:id", (req, res) => {
  const { id } = req.params;

  const q = "SELECT * FROM employees WHERE id = ?";

  connection.query(q, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.send("ERROR");
    }

    if (result.length === 0) {
      return res.status(404).send("Employee not found");
    }

    const employee = result[0];

    res.render("show.ejs", { employee });
  });
});

// ================= SHOW EDIT FORM =================

app.get("/employees/:id/edit", (req, res) => {
  const { id } = req.params;

  const q = "SELECT * FROM employees WHERE id = ?";

  connection.query(q, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.send("ERROR");
    }

    if (result.length === 0) {
      return res.status(404).send("Employee not found");
    }

    const employee = result[0];

    res.render("edit.ejs", { employee });
  });
});

// ================= UPDATE EMPLOYEE =================

app.patch("/employees/:id", (req, res) => {
  const { id } = req.params;

  const { name, email, department, salary } = req.body;

  const q = `
    UPDATE employees
    SET name = ?,
        email = ?,
        department = ?,
        salary = ?
    WHERE id = ?
  `;

  const values = [name, email, department, salary, id];

  connection.query(q, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.send("ERROR");
    }

    res.redirect("/employees");
  });
});

// ================= DELETE EMPLOYEE =================

app.delete("/employees/:id", (req, res) => {
  const { id } = req.params;

  const q = "DELETE FROM employees WHERE id = ?";

  connection.query(q, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.send("ERROR");
    }

    res.redirect("/employees");
  });
});

// ================= START SERVER =================

app.listen(PORT, () => {
  console.log(`App is listening on PORT: ${PORT}`);
});
