const express = require('express');
const router = express.Router();
const db = require('../db');

// GET: ดึงคำสั่งซื้อทั้งหมด
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: ดึงคำสั่งซื้อตาม ID พร้อมรายการสินค้า
router.get('/:id', async (req, res) => {
    try {
        const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

        const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
        res.status(200).json({ ...orders[0], items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: สร้างคำสั่งซื้อ (ใช้ Transaction)
router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { customer_id, items } = req.body; // รูปแบบ items: [{ product_id: 1, quantity: 2 }]
        
        // เริ่ม Transaction
        await connection.beginTransaction();

        let total = 0;
        const orderItemsData = [];

        // 1. ตรวจสอบสต็อกและคำนวณราคารวม
        for (let item of items) {
            // FOR UPDATE เพื่อล็อคแถวข้อมูลชั่วคราวขณะทำรายการ
            const [products] = await connection.query('SELECT price, stock FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
            
            if (products.length === 0) throw new Error(`Product ID ${item.product_id} not found`);
            
            const product = products[0];
            if (product.stock < item.quantity) throw new Error(`Insufficient stock for Product ID ${item.product_id}`);

            total += product.price * item.quantity;
            orderItemsData.push({ product_id: item.product_id, quantity: item.quantity, price: product.price });

            // 2. หักสต็อกสินค้า
            await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        // 3. สร้างคำสั่งซื้อในตาราง orders
        const [orderResult] = await connection.query('INSERT INTO orders (customer_id, total, status) VALUES (?, ?, ?)', [customer_id, total, 'completed']);
        const orderId = orderResult.insertId;

        // 4. บันทึกรายการสินค้าในตาราง order_items
        for (let item of orderItemsData) {
            await connection.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, item.product_id, item.quantity, item.price]);
        }

        // หากทุกขั้นตอนสำเร็จ ทำการยืนยัน Transaction
        await connection.commit();
        res.status(201).json({ message: 'Order created successfully', orderId, total });

    } catch (error) {
        // หากมี Error ให้ Rollback ยกเลิกการเปลี่ยนแปลงทั้งหมด
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// DELETE: ยกเลิกคำสั่งซื้อ
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found' });
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;