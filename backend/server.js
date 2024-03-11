// server.js

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'sqluser',
  password: 'password',
  database: 'Mysql'
});

// Connect to MySQL
connection.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// API endpoints

// Get categories
app.get('/api/categories', (req, res) => {
  connection.query('SELECT * FROM categories', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Add category
app.post('/api/categories', (req, res) => {
  const { categoryName } = req.body;
  connection.query('INSERT INTO categories (CategoryName) VALUES (?)', [categoryName], (err, result) => {
    if (err) throw err;
    res.json({ id: result.insertId });
  });
});

// Get products with pagination
app.get('/api/products', (req, res) => {
  const { page, pageSize } = req.query;
  const offset = (page - 1) * pageSize;
  connection.query('SELECT * FROM products LIMIT ?, ?', [offset, parseInt(pageSize)], (err, results) => {
    if (err) throw err;
    connection.query('SELECT COUNT(*) AS total FROM products', (err, countResult) => {
      if (err) throw err;
      const totalPages = Math.ceil(countResult[0].total / parseInt(pageSize));
      res.json({ products: results, totalPages });
    });
  });
});

// Add product
app.post('/api/products', (req, res) => {
  const { productName, categoryId } = req.body;
  connection.query('INSERT INTO products (ProductName, CategoryId) VALUES (?, ?)', [productName, categoryId], (err, result) => {
    if (err) throw err;
    res.json({ id: result.insertId });
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});