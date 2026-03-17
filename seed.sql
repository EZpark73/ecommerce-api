USE ecommerce;

-- เพิ่มข้อมูลจำลองลูกค้า
INSERT INTO customers (name, email) VALUES
('สมชาย ใจดี', 'somchai@example.com'),
('สมหญิง รักเรียน', 'somying@example.com'),
('จอห์น โด', 'john.doe@example.com');

-- เพิ่มข้อมูลจำลองสินค้า
INSERT INTO products (name, price, stock) VALUES
('เสื้อยืดคอกลม สีขาว', 199.00, 50),
('กางเกงยีนส์ ทรงกระบอก', 590.00, 30),
('รองเท้าผ้าใบ สีดำ', 1200.00, 20),
('กระเป๋าเป้ แคนวาส', 450.00, 15);