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


INSERT INTO roles (rol) VALUES ('admin'), ('maestro'), ('padres'), ('alumnos') ;

INSERT INTO usuarios (nombre, apellido, email, password, rol_id) 
VALUES 
    ('admin', 'admin', 'admin@admin.com', '$2b$10$52RwzQdEB5/Sq7L5OehfGeDKmw44M67khJ7Zve89g2hNH.yF4OyuG', 1),
    ('Maria', 'Garcia', 'maria@example.com', '$2b$10$NdrZ5urFaiE0q3JsLp.KD.uA/3p.wqnINTmgOLtHxxID7G/aJLvZ2', 2),
    ('Pedro', 'Martinez', 'pedro@example.com', '$2b$10$NdrZ5urFaiE0q3JsLp.KD.uA/3p.wqnINTmgOLtHxxID7G/aJLvZ2', 3);  



INSERT INTO informacion (rol_id, url_imagen, url_archivo, titulo, descripcion) 
VALUES 
    (1, 'url_imagen_1.jpg', 'url_archivo_1.pdf', 'Título 1', 'Descripción 1'),
    (2, 'url_imagen_2.jpg', 'url_archivo_2.pdf', 'Título 2', 'Descripción 2'),
    (3, 'url_imagen_3.jpg', 'url_archivo_3.pdf', 'Título 3', 'Descripción 3');


