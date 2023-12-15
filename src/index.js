import express from 'express'
import { createPool } from 'mysql2/promise'
import { config } from 'dotenv'
import bodyParser from 'body-parser';
config()


const app = express();
app.use(bodyParser.json());


const pool = createPool({
    host: process.env.MYSQLDB_HOST,
    user: 'root',
    database: process.env.MYSQLDB_DATABASE,
    password:  process.env.MYSQLDB_ROOT_PASSWORD,
    port:  process.env.MYSQLDB_DOCKER_PORT
})


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
  });
  

app.get('/', (req, res)=> {
    res.send('API está funcionando')
});

app.get('/usuarios', async (req, res, next)=> {
    try {
        const result = await pool.query('SELECT * FROM usuarios;');
        res.json(result[0]);
    } catch (err) {
        next(err); 
    }
});

app.get('/roles', async (req, res, next)=> {
    try {
        const result = await pool.query('SELECT * FROM roles;');
        res.json(result[0]);
    } catch (err) {
        next(err);
    }
});

app.post('/usuarios', async (req, res, next) => {
    try {
        const { nombre, apellido, email, password, rol_id } = req.body;
        const newUser = { nombre, apellido, email, password, rol_id };
        await pool.query('INSERT INTO usuarios SET ?', newUser);
        res.send('Usuario creado correctamente');
    } catch (err) {
        next(err);
    }
});

app.get('/imagenes', async (req, res, next)=> {
    try {
        const result = await pool.query('SELECT * FROM imagenes;');
        res.json(result[0]);
    } catch (err) {
        next(err);
    }
});



app.listen(3000)
console.log('Server on port', 3000)