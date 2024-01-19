import express from 'express'
import { createPool } from 'mysql2/promise'
import { config } from 'dotenv'
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bcrypt from 'bcrypt';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __prevDirname = path.join(__dirname, '..');
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use('/imagenes', express.static(path.join(__prevDirname, 'imagenes')));
app.use('/archivos', express.static(path.join(__prevDirname, 'archivos')));

const pool = createPool({
    host: process.env.MYSQLDB_HOST,
    user: 'root',
    database: process.env.MYSQLDB_DATABASE,
    password:  process.env.MYSQLDB_ROOT_PASSWORD,
    port:  process.env.MYSQLDB_DOCKER_PORT
})

//----------------------------------------------------

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      let destinationPath;

      if (file.fieldname === "imagen") {
        destinationPath = 'imagenes/';
      } else if (file.fieldname === "archivo") {
        destinationPath = 'archivos/';
      }

      // Crear el directorio si no existe
      if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
      }

      cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  })
});

//----------------------------------------------------

app.use(cors());

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
  });
  

app.get('/', (req, res)=> {
    res.send('API está funcionando')
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar el email en la base de datos
    const results = await pool.query(
      'SELECT id, email, password, rol_id FROM usuarios WHERE email = ?',
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = results[0][0];

    // Comparar la contraseña proporcionada con la contraseña almacenada hasheada en la base de datos
    bcrypt.compare(password, user.password, async (err, result) => {
      if (err || !result) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const { id, rol_id } = user;

      // Crear un token JWT con el rol_id como información adicional
      const token = jwt.sign({ id, rol_id }, 'tu_secreto_secreto', {
        expiresIn: '1h' // Cambia esto según tus necesidades
      });

      res.json({ token });
    });
  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.get('/informacion', async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    try {
      const decoded = jwt.verify(bearerToken, 'tu_secreto_secreto');
      const { rol_id } = decoded;

      let query = 'SELECT * FROM informacion;';

      if (rol_id !== 1) {
        query = `SELECT * FROM informacion WHERE rol_id = ${pool.escape(rol_id)};`;
      }

      const result = await pool.query(query);
      res.json(result[0]);
    } catch (err) {
      next(err);
    }
  } else {
    res.sendStatus(403); // No se proporcionó el token de portador
  }
});

app.get('/roles', async (req, res, next) => {
  try {
    const roles = await pool.query('SELECT * FROM roles');
    res.status(200).json(roles[0]);
  } catch (err) {
    next(err); // Pasar el error al middleware de manejo centralizado
  }
});

app.post('/roles', async (req, res, next) => {
  const { rol } = req.body;
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    try {
      const decoded = jwt.verify(bearerToken, 'tu_secreto_secreto');
      const { rol_id } = decoded;

      if (rol_id !== 1) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      // Si el rol_id es 1, se ejecuta la lógica para insertar el rol en la base de datos
      await pool.query('INSERT INTO roles (rol) VALUES (?)', [rol]);
      
      res.status(201).json({ message: 'Rol creado exitosamente' });
    } catch (err) {
      next(err); // Pasar el error al middleware de manejo centralizado
    }
  } else {
    res.sendStatus(403); // No se proporcionó el token de portador
  }
});

app.delete('/roles/:id', async (req, res, next) => {
    const { id } = req.params;
    const bearerHeader = req.headers['authorization'];
  
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
  
      try {
        const decoded = jwt.verify(bearerToken, 'tu_secreto_secreto');
        const { rol_id } = decoded;
  
        if (rol_id !== 1) {
          return res.status(403).json({ error: 'Acceso denegado' });
        }
  
        // Verificar que el id a eliminar no sea 1
        if (id === '1') {
          return res.status(403).json({ error: 'No se puede eliminar este rol' });
        }
  
        // Si el rol_id es 1 y el id a eliminar no es 1, se procede con la eliminación
        await pool.query('DELETE FROM roles WHERE id = ?', [id]);
        
        res.status(200).json({ message: 'Rol eliminado exitosamente' });
      } catch (err) {
        next(err); // Pasar el error al middleware de manejo centralizado
      }
    } else {
      res.sendStatus(403); // No se proporcionó el token de portador
    }
});

app.put('/roles/:id', async (req, res, next) => {
  const { id } = req.params;
  const { rol } = req.body;
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    try {
      const decoded = jwt.verify(bearerToken, 'tu_secreto_secreto');
      const { rol_id } = decoded;

      if (rol_id !== 1) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      // Solo se permite cambiar el nombre del rol, no el rol_id
      await pool.query('UPDATE roles SET rol = ? WHERE id = ?', [rol, id]);
      
      res.status(200).json({ message: 'Rol actualizado exitosamente' });
    } catch (err) {
      next(err); // Pasar el error al middleware de manejo centralizado
    }
  } else {
    res.sendStatus(403); // No se proporcionó el token de portador
  }
});

app.post('/informacion', 
  upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'archivo', maxCount: 1 }
  ]), 
  async (req, res, next) => {
    const { rol_id, titulo, descripcion } = req.body;
    const url_imagen = req.files['imagen'] && req.files['imagen'].length > 0 ? req.files['imagen'][0].path : null;
    const url_archivo = req.files['archivo'] && req.files['archivo'].length > 0 ? req.files['archivo'][0].path : null;


  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];

      try {
          const decoded = jwt.verify(bearerToken, 'tu_secreto_secreto');
          const { rol_id: userRolId } = decoded;

          if (userRolId !== 1) {
              return res.status(403).json({ error: 'Acceso denegado' });
          }

          await pool.query(
              'INSERT INTO informacion (rol_id, url_imagen, url_archivo, titulo, descripcion) VALUES (?, ?, ?, ?, ?)',
              [rol_id, url_imagen, url_archivo, titulo, descripcion]
          );

          res.status(201).json({ message: 'Información creada exitosamente' });
      } catch (err) {
          next(err); // Manejo de errores
      }
  } else {
      res.sendStatus(403); // No se proporcionó el token de portador
  }
});

app.delete('/informacion/:id', async (req, res, next) => {
    const { id } = req.params;
    const bearerHeader = req.headers['authorization'];
  
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
  
      try {
        const decoded = jwt.verify(bearerToken, 'tu_secreto_secreto');
        const { rol_id } = decoded;
  
        if (rol_id !== 1) {
          return res.status(403).json({ error: 'Acceso denegado' });
        }
  
        // Solo el rol_id igual a 1 puede eliminar datos de la tabla informacion
        await pool.query('DELETE FROM informacion WHERE id = ?', [id]);
  
        res.status(200).json({ message: 'Información eliminada exitosamente' });
      } catch (err) {
        next(err); // Pasar el error al middleware de manejo centralizado
      }
    } else {
      res.sendStatus(403); // No se proporcionó el token de portador
    }
});

app.put('/informacion/:id', 
  upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'archivo', maxCount: 1 }
  ]), 
  async (req, res, next) => {
    const { id } = req.params;
    const { rol_id, titulo, descripcion } = req.body;
  
    const url_imagen = req.files['imagen'] && req.files['imagen'].length > 0 ? req.files['imagen'][0].path : null;
    const url_archivo = req.files['archivo'] && req.files['archivo'].length > 0 ? req.files['archivo'][0].path : null;
  
    const bearerHeader = req.headers['authorization'];
  
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
  
      try {
        const decoded = jwt.verify(bearerToken, 'tu_secreto_secreto');
        const { rol_id: userRolId } = decoded;
  
        if (userRolId !== 1) {
          return res.status(403).json({ error: 'Acceso denegado' });
        }
  
        // Obtener los datos actuales de la base de datos
        const oldData = await pool.query('SELECT rol_id, titulo, descripcion, url_imagen, url_archivo FROM informacion WHERE id = ?', [id]);
        if (oldData.length > 0) {
          const data = oldData[0][0];
          const oldUrlImagen = data.url_imagen;
          const oldUrlArchivo = data.url_archivo;
  
          // Comparar y decidir qué valores actualizar
          const newRolId = rol_id !== data.rol_id ? rol_id : data.rol_id;
          const newTitulo = titulo !== data.titulo ? titulo : data.titulo;
          const newDescripcion = descripcion !== data.descripcion ? descripcion : data.descripcion;
          const newUrlImagen = url_imagen && url_imagen !== oldUrlImagen ? url_imagen : oldUrlImagen;
          const newUrlArchivo = url_archivo && url_archivo !== oldUrlArchivo ? url_archivo : oldUrlArchivo;
  
          // Eliminar archivos antiguos si los nuevos son diferentes
          if (url_imagen && url_imagen !== oldUrlImagen && oldUrlImagen) fs.unlinkSync(oldUrlImagen);
          if (url_archivo && url_archivo !== oldUrlArchivo && oldUrlArchivo) fs.unlinkSync(oldUrlArchivo);
  
          // Actualizar la base de datos
          await pool.query(
            'UPDATE informacion SET rol_id = ?, titulo = ?, descripcion = ?, url_imagen = ?, url_archivo = ? WHERE id = ?',
            [newRolId, newTitulo, newDescripcion, newUrlImagen, newUrlArchivo, id]
          );
  
          res.status(200).json({ message: 'Información actualizada exitosamente' });
        } else {
          res.status(404).json({ error: 'Información no encontrada' });
        }
      } catch (err) {
        next(err); // Manejo de errores
      }
    } else {
      res.sendStatus(403); // No se proporcionó el token de portador
    }
});



app.get('/usuarios', async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
  
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
  
      try {
        const decoded = jwt.verify(bearerToken, 'tu_secreto_secreto');
        const { rol_id, id } = decoded;
  
        if (rol_id !== 1) {
          return res.status(403).json({ error: 'Acceso denegado' });
        }
  
        const result = await pool.query('SELECT id, nombre, apellido, email, password, rol_id FROM usuarios');
        res.status(200).json(result[0]);
      } catch (err) {
        next(err); // Pasar el error al middleware de manejo centralizado
      }
    } else {
      res.sendStatus(403); // No se proporcionó el token de portador
    }
});

app.get('/usuarios/:id', async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];

      try {
          const decoded = jwt.verify(bearerToken, 'tu_secreto_secreto');

          // Capturando el id del parámetro de ruta
          const userId = req.params.id;

          // Consulta para obtener los datos del usuario específico
          const result = await pool.query('SELECT id, nombre, apellido, email, rol_id FROM usuarios WHERE id = ?', [userId]);

          // Verificar si se encontró el usuario
          if (result[0].length === 0) {
              return res.status(404).json({ error: 'Usuario no encontrado' });
          }

          res.status(200).json(result[0][0]);
      } catch (err) {
          next(err); // Pasar el error al middleware de manejo centralizado
      }
  } else {
      res.sendStatus(403); // No se proporcionó el token de portador
  }
});

app.delete('/usuarios/:id', async (req, res, next) => {
  const { id } = req.params;
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    try {
      const decoded = jwt.verify(bearerToken, 'tu_secreto_secreto');
      const { rol_id } = decoded;

      if (rol_id !== 1) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      // Verificar que el usuario a eliminar no tenga rol_id igual a 1
      //const user = await pool.query('SELECT rol_id FROM usuarios WHERE id = ?', [id]);

      if (id == "1") {
        return res.status(403).json({ error: 'No se puede eliminar este usuario' });
      }

      // Si el usuario tiene un rol_id distinto a 1, se procede con la eliminación
      await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);

      res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (err) {
      next(err); // Pasar el error al middleware de manejo centralizado
    }
  } else {
    res.sendStatus(403); // No se proporcionó el token de portador
  }
});


app.put('/usuarios/:id', async (req, res, next) => {
  const { id } = req.params;
  const { nombre, apellido, email, password, rol_id } = req.body;
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    try {
      const decoded = jwt.verify(bearerToken, 'tu_secreto_secreto');
      const { rol_id: userRolId, id: userId } = decoded;

      if (userRolId !== 1 && id !== userId) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      if (id == "1" && rol_id != 1) {
        return res.status(403).json({ error: 'No se puede modificar el rol de ese usuario' });
      }

      // Obtener la contraseña actual del usuario desde la base de datos
      const [userData] = await pool.query('SELECT password FROM usuarios WHERE id = ?', [id]);
      const currentPassword = userData[0].password;

      // Crear un arreglo para los valores y una cadena para la consulta SQL
      let query = 'UPDATE usuarios SET ';
      let queryParams = [];
      let queryFields = [];

      if (nombre) {
        queryFields.push('nombre = ?');
        queryParams.push(nombre);
      }
      if (apellido) {
        queryFields.push('apellido = ?');
        queryParams.push(apellido);
      }
      if (email) {
        queryFields.push('email = ?');
        queryParams.push(email);
      }
      if (password && password !== currentPassword) {
        const hashedPassword = await bcrypt.hash(password, 10); // Encriptar la nueva contraseña
        queryFields.push('password = ?');
        queryParams.push(hashedPassword);
      }
      if (rol_id) {
        queryFields.push('rol_id = ?');
        queryParams.push(rol_id);
      }

      if (queryFields.length === 0) {
        return res.status(400).json({ error: 'No hay datos para actualizar' });
      }

      query += queryFields.join(', ');
      query += ' WHERE id = ?';
      queryParams.push(id);

      await pool.query(query, queryParams);
      res.status(200).json({ message: 'Usuario actualizado exitosamente' });
    } catch (err) {
      next(err); // Pasar el error al middleware de manejo centralizado
    }
  } else {
    res.sendStatus(403); // No se proporcionó el token de portador
  }
});

app.post('/usuarios', async (req, res, next) => {
  const { nombre, apellido, email, password, rol_id: nuevoRolId } = req.body; // Usar rol_id como nuevoRolId

    try {  
      // Verificar si el correo ya existe en algún usuario
      const existingUser = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

      if (existingUser[0].length > 0) {
        return res.status(400).json({ error: 'El correo ya está en uso' });
      }

      // Encriptar la contraseña antes de almacenarla
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar el usuario con la contraseña encriptada y el rol_id proporcionado
      await pool.query(
        'INSERT INTO usuarios (nombre, apellido, email, password, rol_id) VALUES (?, ?, ?, ?, ?)',
        [nombre, apellido, email, hashedPassword, nuevoRolId] // Usar nuevoRolId aquí
      );

      res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (err) {
      next(err); // Pasar el error al middleware de manejo centralizado
    }
});

app.listen(3000)
console.log('Server on port', 3000)
