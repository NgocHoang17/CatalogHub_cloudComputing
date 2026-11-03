-- Illustrative product data, not live prices. Run explicitly with setup credentials.
SET NAMES utf8mb4;
SET time_zone = '+00:00';
START TRANSACTION;
INSERT INTO categories (slug, name) VALUES
('laptops', 'Laptops'),
('smartphones', 'Smartphones'),
('monitors', 'Monitors'),
('keyboards', 'Keyboards'),
('mice', 'Mice'),
('headphones', 'Headphones'),
('storage', 'Storage'),
('accessories', 'Accessories')
ON DUPLICATE KEY UPDATE name = VALUES(name);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'LAP-001', 'ASUS Zenbook 14 OLED', id, '24990000.00', 'Lightweight laptop with a vivid OLED display for focused work.', NULL FROM categories WHERE slug = 'laptops'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'LAP-002', 'Apple MacBook Air M3', id, '27990000.00', 'Quiet performance in a portable aluminum design.', NULL FROM categories WHERE slug = 'laptops'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'LAP-003', 'Lenovo ThinkPad E14', id, '18990000.00', 'A dependable everyday laptop with a comfortable keyboard.', NULL FROM categories WHERE slug = 'laptops'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'PHN-001', 'Samsung Galaxy S24', id, '19990000.00', 'A bright pocket companion for photos, work and daily life.', NULL FROM categories WHERE slug = 'smartphones'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'PHN-002', 'Apple iPhone 15', id, '18990000.00', 'Smooth everyday performance and a versatile camera system.', NULL FROM categories WHERE slug = 'smartphones'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'PHN-003', 'Google Pixel 8', id, '13990000.00', 'Clean software and thoughtful photography tools.', NULL FROM categories WHERE slug = 'smartphones'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'MON-001', 'Dell UltraSharp U2723QE', id, '12990000.00', 'A 27-inch 4K screen with generous connectivity.', NULL FROM categories WHERE slug = 'monitors'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'MON-002', 'LG UltraFine 27UP850', id, '8490000.00', 'Sharp 4K detail and USB-C for a tidy desk.', NULL FROM categories WHERE slug = 'monitors'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'MON-003', 'ASUS ProArt PA248QV', id, '4790000.00', 'Color-focused display for creative everyday work.', NULL FROM categories WHERE slug = 'monitors'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'KEY-001', 'Keychron K2 Wireless', id, '2190000.00', 'Compact mechanical keyboard with wireless flexibility.', NULL FROM categories WHERE slug = 'keyboards'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'KEY-002', 'Logitech MX Keys S', id, '2690000.00', 'Quiet, low-profile typing with smart illumination.', NULL FROM categories WHERE slug = 'keyboards'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'KEY-003', 'Akko 3068B Plus', id, '1690000.00', 'A compact layout with satisfying mechanical switches.', NULL FROM categories WHERE slug = 'keyboards'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'MSE-001', 'Logitech MX Master 3S', id, '2290000.00', 'Precise tracking, quiet clicks and a comfortable sculpted shape.', NULL FROM categories WHERE slug = 'mice'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'MSE-002', 'Razer DeathAdder V3', id, '1490000.00', 'Lightweight ergonomic mouse for responsive control.', NULL FROM categories WHERE slug = 'mice'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'MSE-003', 'Microsoft Bluetooth Mouse', id, '490000.00', 'A simple wireless mouse for your everyday bag.', NULL FROM categories WHERE slug = 'mice'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'AUD-001', 'Sony WH-1000XM5', id, '7490000.00', 'Wireless noise cancellation for a more focused day.', NULL FROM categories WHERE slug = 'headphones'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'AUD-002', 'Sennheiser HD 450BT', id, '2990000.00', 'Comfortable over-ear sound with Bluetooth convenience.', NULL FROM categories WHERE slug = 'headphones'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'AUD-003', 'Audio-Technica ATH-M50x', id, '3790000.00', 'Detailed wired listening for your home studio and desk.', NULL FROM categories WHERE slug = 'headphones'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'SSD-001', 'Samsung T7 Portable SSD 1TB', id, '2490000.00', 'Fast portable storage in a pocket-sized metal enclosure.', NULL FROM categories WHERE slug = 'storage'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'SSD-002', 'SanDisk Extreme Portable 1TB', id, '2690000.00', 'Compact external storage for creative files on the move.', NULL FROM categories WHERE slug = 'storage'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'SSD-003', 'Kingston XS1000 1TB', id, '1990000.00', 'A small USB SSD for everyday backups.', NULL FROM categories WHERE slug = 'storage'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'ACC-001', 'Anker 555 USB-C Hub', id, '1490000.00', 'Expand your laptop with HDMI, USB and card-reader ports.', NULL FROM categories WHERE slug = 'accessories'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'ACC-002', 'UGREEN Nexode 65W Charger', id, '890000.00', 'Compact multi-port charging for your daily devices.', NULL FROM categories WHERE slug = 'accessories'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
INSERT INTO products (sku, name, category_id, price, description, image_url)
SELECT 'ACC-003', 'Belkin Connect USB-C Dock', id, '3290000.00', 'Bring your monitor and desk accessories together.', NULL FROM categories WHERE slug = 'accessories'
ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), description = VALUES(description), image_url = VALUES(image_url);
COMMIT;
