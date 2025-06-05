Proyecto: Web Service de Estudiantes UMG
Tecnologías: Node.js, Express, HTML, JavaScript

Rutas del Web Service:
- GET /estudiantes → Devuelve todos los estudiantes
- GET /estudiantes/:id → Devuelve un estudiante específico
- POST /estudiantes → Crea un nuevo estudiante
- PUT /estudiantes/:id → Modifica un estudiante
- DELETE /estudiantes/:id → Elimina un estudiante
- GET /buscar/carrera/:carrera → Filtra por carrera
- GET /buscar/nota/:minima → Filtra por nota mínima
- GET /estadisticas → Muestra resumen estadístico
- GET /descargar → Descarga la lista como JSON

Frontend:
- index.html → permite agregar, editar, buscar y eliminar estudiantes.
- consulta.html → segunda página que muestra todos los estudiantes.

Instrucciones:
1. Ejecutar: node index.js
2. Ir a: http://localhost:3000
