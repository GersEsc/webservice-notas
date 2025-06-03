const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

let estudiantes = [
  { id: 1, nombre: 'Luis', nota: 85 },
  { id: 2, nombre: 'Ana', nota: 92 }
];

// Ver todos los estudiantes
app.get('/estudiantes', (req, res) => {
  res.json(estudiantes);
});

// Ver un estudiante por ID
app.get('/estudiantes/:id', (req, res) => {
  const estudiante = estudiantes.find(e => e.id == req.params.id);
  estudiante
    ? res.json(estudiante)
    : res.status(404).json({ mensaje: 'Estudiante no encontrado' });
});

// Agregar estudiante
app.post('/estudiantes', (req, res) => {
  const nuevo = req.body;
  nuevo.id = estudiantes.length + 1;
  estudiantes.push(nuevo);
  res.status(201).json(nuevo);
});

// Actualizar estudiante
app.put('/estudiantes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = estudiantes.findIndex(e => e.id === id);
  if (index !== -1) {
    estudiantes[index] = { id, ...req.body };
    res.json(estudiantes[index]);
  } else {
    res.status(404).json({ mensaje: 'Estudiante no encontrado' });
  }
});

// Eliminar estudiante
app.delete('/estudiantes/:id', (req, res) => {
  estudiantes = estudiantes.filter(e => e.id != req.params.id);
  res.json({ mensaje: 'Estudiante eliminado' });
});

app.listen(port, () => {
  console.log(`Servicio corriendo en http://localhost:${port}`);
});
