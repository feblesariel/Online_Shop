CREATE DATABASE online_shop;

USE online_shop;

-- Creación de la tabla users
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
);

-- Creación de la tabla categories
CREATE TABLE categories (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Creación de la tabla products
CREATE TABLE products (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  stock INT NOT NULL,
  sold_count INT NOT NULL DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_offer BOOLEAN NOT NULL DEFAULT FALSE,
  category_id INT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Creación de la tabla product_images
CREATE TABLE product_images (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  url VARCHAR(100) NOT NULL,
  product_id INT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Creación de la tabla carts
CREATE TABLE carts (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Creación de la tabla cart_items
CREATE TABLE cart_items (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Creación de la tabla shipments_cost
CREATE TABLE shipments_cost (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  price DECIMAL(10, 2) NOT NULL
);

-- Creación de la tabla shipments
CREATE TABLE shipments (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  user_id INT NOT NULL,
  address VARCHAR(100) NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'shipped', 'delivered') NOT NULL DEFAULT 'pending',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Creación de la tabla payments
CREATE TABLE payments (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  cart_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('credit_card', 'debit_card', 'paypal', 'cash') NOT NULL,
  transaction_id VARCHAR(100) NOT NULL,
  status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (cart_id) REFERENCES carts(id)
);

-- Población de la tabla categories
INSERT INTO categories (name) VALUES
('Categoria 1'),
('Categoria 2'),
('Categoria 3'),
('Categoria 4'),
('Categoria 5'),
('Categoria 6'),
('Categoria 7'),
('Categoria 8');

-- Población de la tabla products
INSERT INTO products (code, brand ,model, name ,price, description, stock, category_id, is_featured, is_offer) VALUES
('P001', 'Marca 1' ,'Producto 1', 'Nombre 1' ,10.99, 'Descripción del producto 1', 100, 1, 1, 1),
('P002', 'Marca 1' ,'Producto 2', 'Nombre 2' ,19.99, 'Descripción del producto 2', 50, 2, 1, 1),
('P003', 'Marca 1' ,'Producto 3', 'Nombre 3' ,5.99, 'Descripción del producto 3', 200, 3, 1, 1),
('P004', 'Marca 1' ,'Producto 4', 'Nombre 4' ,7.99, 'Descripción del producto 4', 150, 4, 1, 1),
('P005', 'Marca 2' ,'Producto 5', 'Nombre 5' ,10.99, 'Descripción del producto 5', 100, 5, 1, 1),
('P006', 'Marca 2' ,'Producto 6', 'Nombre 6' ,19.99, 'Descripción del producto 6', 50, 6, 1, 1),
('P007', 'Marca 2' ,'Producto 7', 'Nombre 7' ,5.99, 'Descripción del producto 7', 200, 7, 1, 1),
('P008', 'Marca 2' ,'Producto 8', 'Nombre 8' ,7.99, 'Descripción del producto 8', 150, 8, 1, 1);

-- Población de la tabla product_images
INSERT INTO product_images (url, product_id) VALUES
('product-1.jpg', 1),
('product-2.jpg', 2),
('product-3.jpg', 3),
('product-4.jpg', 4),
('product-5.jpg', 5),
('product-6.jpg', 6),
('product-7.jpg', 7),
('product-8.jpg', 8);