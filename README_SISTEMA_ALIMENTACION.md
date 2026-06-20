# Sistema de Seguimiento de Alimentación - Método Mura

Un sistema completo de API REST para gestionar un plan de alimentación personalizado basado en el **Método Mura**, con capacidad de marcar comidas consumidas y seguimiento de objetivos diarios.

## 🎯 Características

✅ **Rutina diaria automática** - Basada en el plan del Método Mura  
✅ **Distribución inteligente** - Almuerzo y cena distribuidos según el día  
✅ **Seguimiento en tiempo real** - Marca qué comidas consumiste  
✅ **Progreso diario** - Porcentaje de compleción automático  
✅ **Historial** - Último 7, 30 días o más  
✅ **Estadísticas** - Promedio de compleción y días completados  

## 📁 Estructura de Archivos

```
models/
  ├── Rutina.js                 # Modelo de configuración de usuario
  ├── ComidaDiaria.js          # Modelo de comidas para un día
  ├── OpcionComida.js          # Opciones de desayuno/merienda
  └── OpcionAlmuerzoCena.js    # Opciones de almuerzo/cena
  ├── ProgresoDiario.js        # Tracking del progreso

routes/
  └── rutina.js                 # Endpoints de la API

docs/
  ├── API_RUTINA_DOCUMENTACION.md  # Documentación completa
  └── EJEMPLO_FRONTEND.js          # Ejemplos de uso

index.js                         # Servidor Express (actualizado)
```

## 🚀 Instalación

### 1. Actualizar dependencias (ya deberías tenerlas)
```bash
npm install
```

### 2. Las nuevas rutas ya están configuradas en `index.js`

## 📊 Estructura de Datos

### ComidaDiaria
Contiene la rutina de comidas para un día específico:

```javascript
{
  usuarioId: "user123",
  fecha: "2024-06-20",
  diaSemana: "lunes",
  esEntrenamiento: true,
  horaEntrenamiento: "antes17",
  
  desayuno: { opcion: 1, descripcion: "...", consumido: false },
  colacion1: { opcion: 1, descripcion: "...", consumido: false, opcional: true },
  almuerzo: { grupoAlimentos: {...}, consumido: false },
  merienda: { opcion: 1, descripcion: "...", consumido: false },
  colacion2: { opcion: 1, descripcion: "...", consumido: false, opcional: true },
  cena: { grupoAlimentos: {...}, consumido: false }
}
```

### ProgresoDiario
Seguimiento del progreso del día:

```javascript
{
  usuarioId: "user123",
  fecha: "2024-06-20",
  totalComidas: 6,
  comidasConsumidas: 2,
  porcentajeComplecion: 33.33,
  calorias: { planeo: 2000, consumidas: 800 },
  macronutrientes: { proteinas: {...}, carbohidratos: {...}, grasas: {...} }
}
```

## 📡 API Endpoints

### Obtener rutina del día
```bash
GET /api/rutina/:usuarioId/:fecha
```

**Ejemplo:**
```bash
GET /api/rutina/user123/2024-06-20

Response:
{
  "success": true,
  "data": { /* ComidaDiaria */ },
  "opciones": { /* Catálogo completo de opciones */ },
  "colacionesOpcionales": {
    "colacion1": true,
    "colacion2": true
  },
  "distribucion": { "almuerzo": "amarillo", "cena": "rojo" }
}
```

El campo `opciones` incluye todas las alternativas disponibles para desayuno, merienda y las dos colaciones. Las colaciones están marcadas como opcionales, por lo que el usuario puede no incluirlas en su rutina diaria.

---

### Crear/Actualizar rutina
```bash
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
  "meriendaOpcion": 1,
  "incluirColacion1": false,
  "incluirColacion2": false
}
```

---

### Marcar comida como consumida
```bash
PATCH /api/rutina/:id/marcar-comida
```

**Body:**
```json
{
  "tipoComida": "desayuno",
  "consumido": true
}
```

**Valores válidos:** `desayuno`, `colacion1`, `almuerzo`, `merienda`, `colacion2`, `cena`

**Response incluye progreso actualizado:**
```json
{
  "success": true,
  "progreso": {
    "totalComidas": 6,
    "comidasConsumidas": 1,
    "porcentajeComplecion": "16.67%"
  }
}
```

---

### Obtener progreso del día
```bash
GET /api/rutina/progreso/:usuarioId/:fecha
```

---

### Obtener historial
```bash
GET /api/rutina/historial/:usuarioId?dias=7
```

**Query Parameters:**
- `dias`: 7, 30, o cualquier número (default: 7)

**Response:**
```json
{
  "success": true,
  "data": {
    "historial": [ /* Array de ProgresoDiario */ ],
    "estadisticas": {
      "diasRegistrados": 7,
      "porcentajePromedio": "75.50",
      "diasCompletos": 5
    }
  }
}
```

## 💻 Ejemplo de Uso Frontend

### React Component
```javascript
import React, { useState, useEffect } from 'react';

export function RutinaApp() {
  const [rutina, setRutina] = useState(null);
  const usuarioId = "user123";

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    fetch(`/api/rutina/${usuarioId}/${hoy}`)
      .then(res => res.json())
      .then(data => setRutina(data.data));
  }, []);

  const marcar = async (comida) => {
    const res = await fetch(`/api/rutina/${rutina._id}/marcar-comida`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipoComida: comida,
        consumido: !rutina[comida]?.consumido
      })
    });
    const data = await res.json();
    setRutina(data.data);
  };

  return (
    <div>
      <h1>🍽️ Mi Rutina de Hoy</h1>
      
      {rutina && (
        <>
          <div onClick={() => marcar('desayuno')}>
            <h3>Desayuno</h3>
            <p>{rutina.desayuno.descripcion}</p>
            <p>{rutina.desayuno.consumido ? '✓ Consumido' : 'Pendiente'}</p>
          </div>
          
          <div onClick={() => marcar('almuerzo')}>
            <h3>Almuerzo</h3>
            <p>{rutina.almuerzo.consumido ? '✓ Consumido' : 'Pendiente'}</p>
          </div>
          
          {/* Más comidas... */}
        </>
      )}
    </div>
  );
}
```

## 🌍 Distribución Automática por Día

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
- 🟡 Amarillo = Huevo (hasta 3 claras)
- 🔴 Rojo = Carne (160-180gr)
- 🟢 Mixto = Flexible

## 🎯 Próximas Funcionalidades

- [ ] Autenticación de usuarios
- [ ] Cálculo de macronutrientes reales
- [ ] Recordatorios automáticos
- [ ] Integración con Apple Health / Google Fit
- [ ] Reportes PDF
- [ ] Recomendaciones personalizadas
- [ ] Sincronización multidispositivo

## 📝 Notas Importantes

1. **Formato de fecha**: Siempre usar `YYYY-MM-DD`
2. **usuarioId**: Identificador único del usuario
3. **Colaciones**: Son opcionales por defecto
4. **Progreso**: Se calcula automáticamente al marcar comidas
5. **Persistencia**: Todo se guarda en MongoDB

## 🔧 Troubleshooting

### Error: "Rutina no encontrada"
- Verifica que el ID es correcto
- Asegúrate de que exista la rutina para esa fecha

### Error: "usuarioId es requerido"
- Incluye `usuarioId` en todas las peticiones

### Error: "Fecha no válida"
- Usa formato `YYYY-MM-DD`
- Ejemplo: `2024-06-20`

## 📚 Documentación Adicional

Ver `API_RUTINA_DOCUMENTACION.md` para:
- Especificación completa de endpoints
- Ejemplos detallados de request/response
- Casos de uso
- Modelos de datos

Ver `EJEMPLO_FRONTEND.js` para:
- Ejemplos de uso en JavaScript
- Componente React
- Flujos completos

## 👨‍💻 Contacto / Soporte

Para preguntas o problemas:
1. Revisa la documentación
2. Verifica los ejemplos
3. Consulta el código de `routes/rutina.js`

---

**Versión**: 1.0.0  
**Última actualización**: Junio 2024  
**Basado en**: Plan de Alimentación del Método Mura
