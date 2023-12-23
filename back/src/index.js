import express from 'express'
import { createPool } from 'mysql2/promise'
import { config } from 'dotenv'
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bcrypt from 'bcrypt';

config()

const app = express();
app.use(bodyParser.json());

app.use(cors());

const pool = createPool({
    host: process.env.MYSQLDB_HOST,
    user: 'root',
    database: process.env.MYSQLDB_DATABASE,
    password:  process.env.MYSQLDB_ROOT_PASSWORD,
    port:  process.env.MYSQLDB_DOCKER_PORT
})

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

      const roles = await pool.query('SELECT * FROM roles');
      res.status(200).json(roles[0]);
    } catch (err) {
      next(err); // Pasar el error al middleware de manejo centralizado
    }
  } else {
    res.sendStatus(403); // No se proporcionó el token de portador
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

app.post('/informacion', async (req, res, next) => {
    const { rol_id, url_imagen, url_archivo, titulo, descripcion } = req.body;
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
  
        // Solo el rol_id igual a 1 puede agregar datos a la tabla informacion
        await pool.query(
          'INSERT INTO informacion (rol_id, url_imagen, url_archivo, titulo, descripcion) VALUES (?, ?, ?, ?, ?)',
          [rol_id, url_imagen, url_archivo, titulo, descripcion]
        );
  
        res.status(201).json({ message: 'Información creada exitosamente' });
      } catch (err) {
        next(err); // Pasar el error al middleware de manejo centralizado
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

app.put('/informacion/:id', async (req, res, next) => {
    const { id } = req.params;
    const { rol_id, url_imagen, url_archivo, titulo, descripcion } = req.body;
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
  
        // Solo el rol_id igual a 1 puede actualizar datos en la tabla informacion
        await pool.query(
          'UPDATE informacion SET rol_id = ?, url_imagen = ?, url_archivo = ?, titulo = ?, descripcion = ? WHERE id = ?',
          [rol_id, url_imagen, url_archivo, titulo, descripcion, id]
        );
  
        res.status(200).json({ message: 'Información actualizada exitosamente' });
      } catch (err) {
        next(err); // Pasar el error al middleware de manejo centralizado
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
  
        const result = await pool.query('SELECT id, nombre, apellido, email, rol_id FROM usuarios');
        res.status(200).json(result[0]);
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
  
        // Verificar que el usuario a modificar no tenga rol_id igual a 1 y sea usuario id 1
        //const user = await pool.query('SELECT rol_id FROM usuarios WHERE id = ?', [id]);
  
        if (id == "1"){
            if (rol_id != 1){
              return res.status(403).json({ error: 'No se puede modificar el rol de ese usuario' });
            }
          
        }
  
        // Si el usuario tiene un id distinto a 1, se procede con la modificación
        await pool.query(
          'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, password = ?, rol_id = ? WHERE id = ?',
          [nombre, apellido, email, password, rol_id, id]
        );
  
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
    const bearerHeader = req.headers['authorization'];
  
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
  
      try {
        const decoded = jwt.verify(bearerToken, 'tu_secreto_secreto');
        const { rol_id: rolToken } = decoded; // Renombrar rol_id del token a rolToken
  
        if (rolToken !== 1) {
          return res.status(403).json({ error: 'Acceso denegado' });
        }
  
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
    } else {
      res.sendStatus(403); // No se proporcionó el token de portador
    }
  });
  

app.listen(3000)
console.log('Server on port', 3000)