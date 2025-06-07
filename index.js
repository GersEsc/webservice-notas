const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const port = process.env.PORT || 3000;

const client = new OAuth2Client('218221474227-43emh6el5u2j1vfmf82udjgm1uq6q5v8.apps.googleusercontent.com'); // Tu CLIENT_ID

// Middleware
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: 'clave_secreta_umg',
  resave: false,
  saveUninitialized: true
}));

// Ruta para verificar el token de Google
app.post('/verify-token', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '218221474227-43emh6el5u2j1vfmf82udjgm1uq6q5v8.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    req.session.usuario = payload;

    res.json({ usuario: payload });
  } catch (err) {
    console.error('Error al verificar token:', err);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Ruta protegida (requiere sesión activa)
app.get('/', (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Ruta login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Ruta logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// ------------------- LÓGICA DE ESTUDIANTES -------------------

const archivoJSON = path.join(__dirname, 'public/estudiantes.json');
let estudiantes = [];

if (fs.existsSync(archivoJSON)) {
  estudiantes = JSON.parse(fs.readFileSync(archivoJSON, 'utf8'));
} else {
  estudiantes = [
    { id: 1, nombre: 'Luis', nota: 85, curso: 'Matemática', carrera: 'Ingeniería' },
    { id: 2, nombre: 'Ana', nota: 92, curso: 'Programación', carrera: 'Informática' }
  ];
  fs.writeFileSync(archivoJSON, JSON.stringify(estudiantes, null, 2));
}

app.get('/consulta', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/consulta.html'));
});

app.get('/estudiantes', (req, res) => res.json(estudiantes));

app.get('/estudiantes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const estudiante = estudiantes.find(e => e.id === id);
  estudiante
    ? res.json(estudiante)
    : res.status(404).json({ mensaje: 'Estudiante no encontrado' });
});

app.post('/estudiantes', (req, res) => {
  const { nombre, nota, curso, carrera } = req.body;
  if (!nombre || typeof nombre !== 'string' || isNaN(nota) || !curso || !carrera) {
    return res.status(400).json({ mensaje: 'Faltan o hay datos inválidos del estudiante' });
  }

  const nuevoEstudiante = {
    id: estudiantes.length > 0 ? estudiantes[estudiantes.length - 1].id + 1 : 1,
    nombre,
    nota,
    curso,
    carrera
  };

  estudiantes.push(nuevoEstudiante);
  fs.writeFileSync(archivoJSON, JSON.stringify(estudiantes, null, 2));
  res.status(201).json(nuevoEstudiante);
});

app.put('/estudiantes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = estudiantes.findIndex(e => e.id === id);
  if (index === -1) return res.status(404).json({ mensaje: 'Estudiante no encontrado' });

  const { nombre, nota, curso, carrera } = req.body;
  if (!nombre || isNaN(nota) || !curso || !carrera) {
    return res.status(400).json({ mensaje: 'Datos incompletos o inválidos para modificar' });
  }

  estudiantes[index] = { id, nombre, nota, curso, carrera };
  fs.writeFileSync(archivoJSON, JSON.stringify(estudiantes, null, 2));
  res.json(estudiantes[index]);
});

app.delete('/estudiantes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const existe = estudiantes.some(e => e.id === id);
  if (!existe) return res.status(404).json({ mensaje: 'Estudiante no encontrado' });

  estudiantes = estudiantes.filter(e => e.id !== id);
  fs.writeFileSync(archivoJSON, JSON.stringify(estudiantes, null, 2));
  res.json({ mensaje: 'Estudiante eliminado correctamente' });
});

app.get('/descargar', (req, res) => {
  const ruta = path.join(__dirname, 'estudiantes_temp.json');
  try {
    fs.writeFileSync(ruta, JSON.stringify(estudiantes, null, 2));
    res.download(ruta, 'estudiantes.json', err => {
      if (err) res.status(500).send("Error al descargar archivo.");
      else fs.unlinkSync(ruta);
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al generar archivo' });
  }
});

app.get('/buscar/carrera/:carrera', (req, res) => {
  const carrera = req.params.carrera.toLowerCase();
  const encontrados = estudiantes.filter(e => e.carrera.toLowerCase() === carrera);
  encontrados.length > 0
    ? res.json(encontrados)
    : res.status(404).json({ mensaje: 'No se encontraron estudiantes en esa carrera' });
});

app.get('/buscar/nota/:minima', (req, res) => {
  const notaMinima = parseFloat(req.params.minima);
  if (isNaN(notaMinima)) {
    return res.status(400).json({ mensaje: 'La nota mínima debe ser un número' });
  }

  const filtrados = estudiantes.filter(e => e.nota >= notaMinima);
  filtrados.length > 0
    ? res.json(filtrados)
    : res.status(404).json({ mensaje: 'No se encontraron estudiantes con nota suficiente' });
});

app.get('/estadisticas', (req, res) => {
  if (estudiantes.length === 0) {
    return res.status(404).json({ mensaje: 'No hay estudiantes para calcular estadísticas' });
  }

  const promedio = estudiantes.reduce((acc, e) => acc + e.nota, 0) / estudiantes.length;
  const mayorNota = Math.max(...estudiantes.map(e => e.nota));
  const menorNota = Math.min(...estudiantes.map(e => e.nota));

  res.json({
    total: estudiantes.length,
    promedio: promedio.toFixed(2),
    mayorNota,
    menorNota
  });
});

app.listen(port, () => {
  console.log(`Servicio corriendo en http://localhost:${port}`);
});
