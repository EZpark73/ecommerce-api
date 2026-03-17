const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Routes
const customerRoutes = require('./routes/customers');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ใช้งาน Routes
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// หน้าแรกเช็คสถานะ API
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to E-Commerce API', status: 'Running' });
});

// สำหรับรันบนเครื่องตัวเอง (Local)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3333;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export ตัวแอปสำหรับให้ Vercel ใช้งาน (Serverless Function)
module.exports = app;