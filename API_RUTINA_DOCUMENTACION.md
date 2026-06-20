# API de Rutina de Alimentación - Método Mura

Esta API permite gestionar un plan de alimentación diario basado en el **Método Mura**, con seguimiento de comidas consumidas y progreso diario.

## Modelos de Datos

### 1. **ComidaDiaria** - Rutina de comidas para un día específico
```javascript
{
  usuarioId: String,
  fecha: Date,
  diaSemana: String, // "lunes", "martes", etc.
  esEntrenamiento: Boolean,
  horaEntrenamiento: String, // "antes17", "despues18", "ninguno"
  
  desayuno: {
    opcion: Number, // 1-6
    descripcion: String,
    consumido: Boolean
  },
  
  colacion1: {
    opcion: Number,
    descripcion: String,
    consumido: Boolean,
    opcional: Boolean
  },
  
  almuerzo: {
    grupoAlimentos: {
      proteina: { tipo: String, cantidad: String },
      verdura: String,
      adicional: String
    },
    consumido: Boolean
  },
  
  merienda: {
    opcion: Number,
    descripcion: String,
    consumido: Boolean
  },
  
  colacion2: { /* similar a colacion1 */ },
  cena: { /* similar a almuerzo */ }
}
```

### 2. **ProgresoDiario** - Seguimiento del progreso diario
```javascript
{
  usuarioId: String,
  fecha: Date,
  totalComidas: Number,
  comidasConsumidas: Number,
  porcentajeComplecion: Number, // 0-100
  calorias: { planeo: Number, consumidas: Number },
  macronutrientes: {
    proteinas: { planeo: Number, consumidas: Number },
    carbohidratos: { planeo: Number, consumidas: Number },
    grasas: { planeo: Number, consumidas: Number }
  }
}
```

## Endpoints

### 1. **Obtener rutina del día**
```
GET /api/rutina/:usuarioId/:fecha
```

**Parámetros:**
- `usuarioId`: ID del usuario (string)
- `fecha`: Fecha en formato YYYY-MM-DD

**Respuesta:**
```json
{
  "success": true,
  "data": { /* ComidaDiaria object */ },
  "distribucion": {
    "almuerzo": "amarillo",
    "cena": "rojo"
  }
}
```

**Ejemplo:**
```bash
GET /api/rutina/user123/2024-06-20
```

---

### 2. **Crear o actualizar rutina**
```
POST /api/rutina
```

**Body:**
```json
{
  "usuarioId": "user123",
  "fecha": "2024-06-20",
  "esEntrenamiento": true,
  "horaEntrenamiento": "antes17",
  "desayunoOpcion": 2,
  "meriendaOpcion": 3,
  "colacion1": {
    "opcion": 1,
    "descripcion": "Café, té o mate",
    "opcional": true
  },
  "colacion2": {
    "opcion": 3,
    "descripcion": "Bastoncitos de zanahoria",
    "opcional": true
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Rutina actualizada correctamente",
  "data": { /* ComidaDiaria actualizado */ }
}
```

---

### 3. **Marcar comida como consumida**
```
PATCH /api/rutina/:id/marcar-comida
```

**Body:**
```json
{
  "tipoComida": "desayuno",
  "consumido": true
}
```

**Valores válidos para tipoComida:**
- `desayuno`
- `colacion1`
- `almuerzo`
- `merienda`
- `colacion2`
- `cena`

**Respuesta:**
```json
{
  "success": true,
  "message": "desayuno marcada como consumida",
  "data": { /* ComidaDiaria actualizado */ },
  "progreso": {
    "totalComidas": 7,
    "comidasConsumidas": 2,
    "porcentajeComplecion": "28.57%"
  }
}
```

---

### 4. **Obtener progreso del día**
```
GET /api/rutina/progreso/:usuarioId/:fecha
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalComidas": 7,
    "comidasConsumidas": 3,
    "porcentajeComplecion": 42.86,
    "accionesRealizadas": [
      {
        "comida": "desayuno",
        "timestamp": "2024-06-20T10:30:00Z",
        "marcadaConsumida": true
      }
    ]
  }
}
```

---

### 5. **Obtener historial de progreso**
```
GET /api/rutina/historial/:usuarioId?dias=7
```

**Query Parameters:**
- `dias`: Número de días a recuperar (default: 7)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "historial": [
      { /* ProgresoDiario objects */ }
    ],
    "estadisticas": {
      "diasRegistrados": 7,
      "porcentajePromedio": "75.50",
      "diasCompletos": 5
    }
  }
}
```

---

## Flujo de Uso desde Frontend

### 1. **Cargar la rutina del día**
```javascript
const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const response = await fetch(`/api/rutina/user123/${fecha}`);
const rutina = await response.json();
```

### 2. **Mostrar opciones de comidas**
```javascript
// El backend devuelve las opciones junto con la rutina
console.log(rutina.data.desayuno.opcion); // Número de opción
console.log(rutina.data.desayuno.descripcion); // Descripción legible
```

### 3. **Marcar comida como consumida**
```javascript
const response = await fetch(`/api/rutina/${rutinaId}/marcar-comida`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tipoComida: 'desayuno',
    consumido: true
  })
});

const resultado = await response.json();
console.log(resultado.progreso.porcentajeComplecion); // "14.29%"
```

### 4. **Mostrar progreso en tiempo real**
```javascript
const progreso = await fetch(`/api/rutina/progreso/user123/${fecha}`);
const datos = await progreso.json();

console.log(`${datos.data.comidasConsumidas}/${datos.data.totalComidas} comidas`);
console.log(`Completado: ${datos.data.porcentajeComplecion}%`);
```

---

## Distribución de Almuerzo/Cena por Día

La API distribuye automáticamente las proteínas según el día:

| Día | Almuerzo | Cena |
|-----|----------|------|
| Lunes | 🟡 Huevo | 🔴 Carne |
| Martes | 🔴 Carne | 🟡 Huevo |
| Miércoles | 🟡 Huevo | 🔴 Carne |
| Jueves | 🔴 Carne | 🟡 Huevo |
| Viernes | 🟡 Huevo | 🔴 Carne |
| Sábado | 🟢 Mixto | 🔴 Carne |
| Domingo | 🔴 Carne | 🔴 Carne |

**Leyenda:**
- 🟡 Amarillo = Huevo o proteína ligera
- 🔴 Rojo = Carne (vacuna, pollo, pescado)

---

## Ejemplo Completo de Uso

### Backend setup
```javascript
import ComidaDiariaRouter from './routes/rutina.js';
app.use('/api/rutina', ComidaDiariaRouter);
```

### Frontend - React
```javascript
// Cargar rutina
const [rutina, setRutina] = useState(null);

useEffect(() => {
  const hoy = new Date().toISOString().split('T')[0];
  fetch(`/api/rutina/user123/${hoy}`)
    .then(res => res.json())
    .then(data => setRutina(data.data));
}, []);

// Marcar comida
const marcarComida = async (comidaId, tipoComida) => {
  const res = await fetch(`/api/rutina/${comidaId}/marcar-comida`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipoComida,
      consumido: true
    })
  });
  
  const actualizado = await res.json();
  setProgreso(actualizado.progreso);
};

// Mostrar progreso
return (
  <div>
    <h2>{rutina?.desayuno?.descripcion}</h2>
    <button onClick={() => marcarComida(rutina._id, 'desayuno')}>
      ✓ Consumido
    </button>
    <p>Progreso: {progreso?.porcentajeComplecion}%</p>
  </div>
);
```

---

## Notas Importantes

1. **Las fechas deben estar en formato YYYY-MM-DD**
2. **El usuarioId es un identificador único del usuario**
3. **Las colaciones son opcionales por defecto (opcional: true)**
4. **El porcentaje de compleción se calcula automáticamente**
5. **El backend almacena toda la información en MongoDB**
6. **Se pueden agregar notas adicionales en `notasUsuario`**

---

## Errores Comunes

### Error: "Rutina no encontrada"
- Asegúrate de que el ID de la rutina es correcto
- Verifica que la rutina existe para esa fecha

### Error: "usuarioId es requerido"
- Siempre incluye el `usuarioId` en las peticiones

### Error: "Fecha no válida"
- Usa el formato YYYY-MM-DD
- Ejemplo correcto: `2024-06-20`

---

## Próximas Mejoras Sugeridas

1. ✅ Agregar autenticación de usuarios
2. ✅ Integrar cálculo de macronutrientes real
3. ✅ Agregar recordatorios de comidas
4. ✅ Historial de cambios en la rutina
5. ✅ Reportes semanales/mensuales
6. ✅ Integración con aplicaciones de fitness
