const express = require('express');
const router = express.Router();
const db = require('../db');

// GET: ดึงลูกค้าทั้งหมด
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: ดึงลูกค้าตาม ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: เพิ่มลูกค้าใหม่
router.post('/', async (req, res) => {
    try {
        const { name, email } = req.body;
        const [result] = await db.query('INSERT INTO customers (name, email) VALUES (?, ?)', [name, email]);
        res.status(201).json({ id: result.insertId, name, email });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: ลบลูกค้าตาม ID
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;