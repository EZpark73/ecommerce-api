const express = require('express');
const router = express.Router();
const db = require('../db');

// GET: ดึงสินค้าทั้งหมด
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: ดึงสินค้าตาม ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: เพิ่มสินค้าใหม่
router.post('/', async (req, res) => {
    try {
        const { name, price, stock } = req.body;
        const [result] = await db.query('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', [name, price, stock]);
        res.status(201).json({ id: result.insertId, name, price, stock });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: ลบสินค้าตาม ID
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;