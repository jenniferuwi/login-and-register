const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const secret = "secret123";

app.use(cors()); // ✅ allow all origins
app.use(express.json());

// DB connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'backend_app'
});

db.connect(err => {
  if (err) console.log("connect to database fail", err);
  else console.log("connect to database successfully");
});

// Register
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  db.query('SELECT * FROM users WHERE email=?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (results.length > 0) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    db.query('INSERT INTO users(name,email,password) VALUES(?,?,?)', [name, email, hashedPassword], (err, results) => {
      if (err) return res.status(500).json({ message: "Error registering user", error: err });

      res.status(201).json({ message: "User registered successfully" });
    });
  });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (results.length === 0) return res.status(400).json({ message: "User not found" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: "1d" });

    res.status(200).json({ message: "Login successful", token });
  });
});

app.listen(8000, () => {
  console.log("server is running on port 8000");
});