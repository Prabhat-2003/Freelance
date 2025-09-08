const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key-here';

// Middleware
app.use(cors());
app.use(express.json());

// Mock database (in a real app, use a proper database)
let users = [];
let services = [
  {
    id: '1',
    title: 'I will design your website UI/UX',
    seller: { id: '2', name: 'John Designer' },
    price: 50,
    rating: 4.9,
    reviews: []
  },
  {
    id: '2',
    title: 'I will develop a responsive website',
    seller: { id: '3', name: 'Sarah Developer' },
    price: 100,
    rating: 4.8,
    reviews: []
  },
  {
    id: '3',
    title: 'I will do SEO for your website',
    seller: { id: '4', name: 'Mike Expert' },
    price: 75,
    rating: 4.7,
    reviews: []
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      userType,
      createdAt: new Date().toISOString()
    };

    users.push(user);

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, userType: user.userType }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, userType: user.userType }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get services
app.get('/api/services', (req, res) => {
  res.json(services);
});

// Get service by ID
app.get('/api/services/:id', (req, res) => {
  const service = services.find(s => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }
  res.json(service);
});

// Create service (protected)
app.post('/api/services', authenticateToken, (req, res) => {
  const { title, description, price, category } = req.body;

  const service = {
    id: uuidv4(),
    title,
    description,
    price,
    category,
    seller: { id: req.user.id, name: req.user.name },
    rating: 0,
    reviews: [],
    createdAt: new Date().toISOString()
  };

  services.push(service);
  res.status(201).json(service);
});

// Get user profile (protected)
app.get('/api/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Return user without password
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Update user profile (protected)
app.put('/api/profile', authenticateToken, (req, res) => {
  const { name, bio, skills } = req.body;
  const userIndex = users.findIndex(u => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  users[userIndex] = {
    ...users[userIndex],
    name: name || users[userIndex].name,
    bio: bio || users[userIndex].bio,
    skills: skills || users[userIndex].skills
  };

  // Return user without password
  const { password, ...updatedUser } = users[userIndex];
  res.json(updatedUser);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});