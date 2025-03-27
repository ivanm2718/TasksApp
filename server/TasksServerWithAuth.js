require('dotenv').config(); 

const { Pool } = require('pg');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express();
const port = 3000; //app access port, not to be confused with db port

app.use(cors());
app.use(express.json());

// config connection with database with data from dotenv file 
const pool = new Pool({
  user: process.env.DB_USER,  
  host: process.env.DB_HOST,  
  database: process.env.DB_NAME, 
  password: process.env.DB_PASSWORD, 
  port: process.env.DB_PORT,          
});

// test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error(err);
  else console.log('Connected to PostgreSQL', res.rows[0].now);
});

// set up server to listen 
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// JWT secret (in production, use a long, random string in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_here';

// AUTHENTICATION MIDDLEWARE
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user data to request
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// middleware used to check if user is admin
const isAdmin = (req, res, next) => {
   if (!req.user.isAdmin) {
     return res.status(403).json({ error: "Admin access required" });
 }
   next();
};

// AUTH ROUTES
app.post('/register', async (req, res) => {
  const { username, password, is_admin } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (username, password, is_admin) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, is_admin`,
      [username, hashedPassword, is_admin || false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: "Username already exists" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Registration failed" });
    }
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, is_admin: user.is_admin },
      JWT_SECRET,
    );

    res.json({ token, username: user.username, is_admin: user.is_admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});


// Protected route: Get all tasks (admin) or user's tasks (regular user)
app.get('/tasks', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      req.user.is_admin 
        ? 'SELECT * FROM tasks'             // Admin sees all
        : 'SELECT * FROM tasks WHERE user_id = $1', // User sees their own
      req.user.is_admin ? [] : [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const query = 'SELECT * FROM users'
    
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

  // POST - Create a new task (POST /tasks)
  app.post('/tasks', async (req, res) => {
    const { name, completed, user_id } = req.body;
    
    // Validate only the name (required and non-empty string)
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Task name is required' });
    }

    try {
        const { rows } = await pool.query(
            'INSERT INTO tasks (name, completed, user_id) VALUES ($1, $2, $3) RETURNING *',
            [name.trim(), completed, user_id]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PUT - update a task (PUT /tasks/:id)
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { name, completed, user_id } = req.body;
  
  // Validate that name is not empty
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Task name cannot be empty' });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE tasks SET name = $1, completed = $2, user_id = $3 WHERE id = $4 RETURNING *',
      [name, completed, user_id, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE a task by ID (DELETE /tasks/:id)
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send(); // 204 = No Content
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// DELETE a user by ID (DELETE /users/:id)
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send(); // 204 = No Content
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete users' });
  }
});

