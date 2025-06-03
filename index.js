const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

let estudiantes = [
  { id: 1, nombre: 'Luis', nota: 85, curso: 'Matemática', carrera: 'Ingeniería' },
  { id: 2, nombre: 'Ana', nota: 92, curso: 'Programación', carrera: 'Informática' }
];

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Obtener todos los estudiantes
app.get('/estudiantes', (req, res) => {
  res.json(estudiantes);
});

// Obtener estudiante por ID
app.get('/estudiantes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const estudiante = estudiantes.find(e => e.id === id);

  if (!estudiante) {
    return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
  }

  res.json(estudiante);
});

// Agregar estudiante nuevo
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
  res.status(201).json(nuevoEstudiante);
});

// Actualizar un estudiante existente
app.put('/estudiantes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = estudiantes.findIndex(e => e.id === id);

  if (index === -1) {
    return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
  }

  const { nombre, nota, curso, carrera } = req.body;

  if (!nombre || isNaN(nota) || !curso || !carrera) {
    return res.status(400).json({ mensaje: 'Datos incompletos o inválidos para modificar' });
  }

  estudiantes[index] = { id, nombre, nota, curso, carrera };
  res.json(estudiantes[index]);
});

// Eliminar estudiante
app.delete('/estudiantes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const existe = estudiantes.some(e => e.id === id);

  if (!existe) {
    return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
  }

  estudiantes = estudiantes.filter(e => e.id !== id);
  res.json({ mensaje: 'Estudiante eliminado correctamente' });
});

// Descargar estudiantes como archivo JSON
app.get('/descargar', (req, res) => {
  const ruta = path.join(__dirname, 'public/estudiantes.json');
  try {
    fs.writeFileSync(ruta, JSON.stringify(estudiantes, null, 2));
    res.download(ruta);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al generar archivo' });
  }
});

// Ruta para buscar estudiantes por carrera
app.get('/buscar/carrera/:carrera', (req, res) => {
  const carrera = req.params.carrera.toLowerCase();
  const encontrados = estudiantes.filter(e => e.carrera.toLowerCase() === carrera);

  encontrados.length > 0
    ? res.json(encontrados)
    : res.status(404).json({ mensaje: 'No se encontraron estudiantes en esa carrera' });
});

// Ruta para buscar por nota mínima
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

// Ruta para obtener estadísticas simples
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
