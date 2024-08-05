// index.js
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('@prisma/client').PrismaClient;
const prismaClient = new prisma();

const app = express();
app.use(bodyParser.json());

const JWT_SECRET = 'your_jwt_secret'; // Use a more secure way to store secrets in production

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// User Registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prismaClient.user.create({
      data: { username, password: hashedPassword }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prismaClient.user.findUnique({ where: { username } });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Add item to cart
app.post('/cart', authenticateJWT, async (req, res) => {
  const { items } = req.body;
  try {
    const cart = await prismaClient.cart.upsert({
      where: { userId: req.user.id },
      update: { items },
      create: { userId: req.user.id, items }
    });
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// View cart
app.get('/cart', authenticateJWT, async (req, res) => {
  try {
    const cart = await prismaClient.cart.findUnique({
      where: { userId: req.user.id }
    });
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove item from cart
app.delete('/cart', authenticateJWT, async (req, res) => {
  try {
    await prismaClient.cart.delete({ where: { userId: req.user.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create order from cart
app.post('/orders', authenticateJWT, async (req, res) => {
  try {
    const cart = await prismaClient.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) return res.status(400).json({ error: 'Cart not found' });

    const order = await prismaClient.order.create({
      data: {
        userId: req.user.id,
        items: cart.items,
        status: 'pending'
      }
    });

    // Optionally, clear the cart after creating an order
    await prismaClient.cart.delete({ where: { userId: req.user.id } });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update order status
app.put('/orders/:id', authenticateJWT, async (req, res) => {
  const { status } = req.body;
  try {
    const order = await prismaClient.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
