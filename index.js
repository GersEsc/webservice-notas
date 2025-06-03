const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

let estudiantes = [
  { id: 1, nombre: 'Luis', nota: 85 },
  { id: 2, nombre: 'Ana', nota: 92 }
];

app.get('/estudiantes', (req, res) => {
  res.json(estudiantes);
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
