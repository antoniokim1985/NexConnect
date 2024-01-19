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
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE informacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    url_imagen VARCHAR(200),
    url_archivo VARCHAR(200),
    titulo VARCHAR(100),
    descripcion TEXT
);

INSERT INTO roles (rol) VALUES ('admin');

INSERT INTO usuarios (nombre, apellido, email, password, rol_id) 
VALUES 
    ('admin', 'admin', 'admin@admin.com', '$2b$10$52RwzQdEB5/Sq7L5OehfGeDKmw44M67khJ7Zve89g2hNH.yF4OyuG', 1);

INSERT INTO informacion (rol_id, url_imagen, url_archivo, titulo, descripcion) 
VALUES 
    (1, 'imagenes/imagen_1.jpg', 'archivos/archivo_1.pdf', 'Tema 1', 'Nota 1');


