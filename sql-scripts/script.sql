CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol VARCHAR(20) UNIQUE
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    apellido VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    rol_id INT,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE imagenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT,
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    url VARCHAR(200),
    titulo VARCHAR(100),
    descripcion TEXT
);

INSERT INTO roles (rol) VALUES ('niños'), ('adultos'), ('admin');

INSERT INTO usuarios (nombre, apellido, email, password, rol_id) VALUES
('Juan', 'Pérez', 'juan@example.com', 'contraseña', 1), -- 1 para 'niños'
('María', 'González', 'maria@example.com', 'otracontraseña', 2); -- 2 para 'adultos'

INSERT INTO imagenes (rol_id, url, titulo, descripcion) VALUES
(1, 'url1', 'Foto Niños 1', 'Descripción para foto de niños 1'),
(2, 'url2', 'Foto Adultos 1', 'Descripción para foto de adultos 1');

