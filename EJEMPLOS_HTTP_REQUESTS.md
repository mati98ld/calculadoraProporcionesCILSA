# Ejemplos de Prueba de API - HTTP Requests

# Estos ejemplos pueden probarse con:
# - cURL desde terminal
# - Postman
# - Thunder Client (VS Code)
# - REST Client (VS Code)

## 1. OBTENER RUTINA DEL DÍA
### GET - Obtener comidas para hoy
```http
GET http://localhost:3000/api/rutina/user123/2024-06-20
```

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "_id": "665f7a1c9e2a4c5d3b1f8a92",
    "usuarioId": "user123",
    "fecha": "2024-06-20T00:00:00.000Z",
    "diaSemana": "miercoles",
    "esEntrenamiento": false,
    "horaEntrenamiento": "ninguno",
    "desayuno": {
      "opcion": 1,
      "descripcion": "Yogur descremado + 14 almendras o 7 nueces + 1 cda semillas",
      "consumido": false
    },
    "colacion1": {
      "opcion": 1,
      "descripcion": "Café, té o mate (amargo o endulzado)",
      "consumido": false,
      "opcional": true
    },
    "almuerzo": {
      "grupoAlimentos": {
        "proteina": {
          "tipo": "carne",
          "cantidad": "160-180gr"
        },
        "verdura": "Hoja fresca libre"
      },
      "consumido": false
    },
    "merienda": {
      "opcion": 1,
      "descripcion": "Yogur descremado + ¾ taza copos de maíz + 12 almendras",
      "consumido": false
    },
    "colacion2": {
      "opcion": 1,
      "descripcion": "Fruta fresca (2-3/día)",
      "consumido": false,
      "opcional": true
    },
    "cena": {
      "grupoAlimentos": {
        "proteina": {
          "tipo": "huevo",
          "cantidad": "Hasta 3 claras"
        },
        "verdura": "Hoja fresca libre"
      },
      "consumido": false
    }
  },
  "distribucion": {
    "almuerzo": "amarillo",
    "cena": "rojo"
  }
}
```

---

## 2. CREAR O ACTUALIZAR RUTINA
### POST - Crear rutina personalizada para un día
```http
POST http://localhost:3000/api/rutina
Content-Type: application/json

{
  "usuarioId": "user123",
  "fecha": "2024-06-21",
  "esEntrenamiento": true,
  "horaEntrenamiento": "antes17",
  "desayunoOpcion": 3,
  "meriendaOpcion": 2,
  "colacion1": {
    "opcion": 5,
    "descripcion": "Caldos caseros",
    "opcional": true
  },
  "colacion2": {
    "opcion": 2,
    "descripcion": "Yogur (1 vaso o pote)",
    "opcional": true
  }
}
```

**Response esperado:**
```json
{
  "success": true,
  "message": "Rutina actualizada correctamente",
  "data": {
    "_id": "665f7a1c9e2a4c5d3b1f8a93",
    "usuarioId": "user123",
    "fecha": "2024-06-21T00:00:00.000Z",
    "diaSemana": "jueves",
    "esEntrenamiento": true,
    "horaEntrenamiento": "antes17",
    "desayuno": {
      "opcion": 3,
      "descripcion": "Café o mate + Omelet (1 huevo + queso port salut)"
    },
    "merienda": {
      "opcion": 2,
      "descripcion": "Yogur descremado + 2 rodajas pan integral"
    }
  }
}
```

---

## 3. MARCAR COMIDA COMO CONSUMIDA
### PATCH - Marcar desayuno como consumido
```http
PATCH http://localhost:3000/api/rutina/665f7a1c9e2a4c5d3b1f8a92/marcar-comida
Content-Type: application/json

{
  "tipoComida": "desayuno",
  "consumido": true
}
```

**Response esperado:**
```json
{
  "success": true,
  "message": "desayuno marcada como consumida",
  "data": {
    "_id": "665f7a1c9e2a4c5d3b1f8a92",
    "desayuno": {
      "opcion": 1,
      "descripcion": "...",
      "consumido": true
    }
  },
  "progreso": {
    "totalComidas": 6,
    "comidasConsumidas": 1,
    "porcentajeComplecion": "16.67%"
  }
}
```

---

## 4. MARCAR ALMUERZO COMO CONSUMIDO
### PATCH - Marcar almuerzo como consumido
```http
PATCH http://localhost:3000/api/rutina/665f7a1c9e2a4c5d3b1f8a92/marcar-comida
Content-Type: application/json

{
  "tipoComida": "almuerzo",
  "consumido": true
}
```

---

## 5. MARCAR MERIENDA COMO CONSUMIDA
### PATCH - Marcar merienda como consumida
```http
PATCH http://localhost:3000/api/rutina/665f7a1c9e2a4c5d3b1f8a92/marcar-comida
Content-Type: application/json

{
  "tipoComida": "merienda",
  "consumido": true
}
```

---

## 6. OBTENER PROGRESO DEL DÍA
### GET - Ver progreso actual
```http
GET http://localhost:3000/api/rutina/progreso/user123/2024-06-20
```

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "_id": "665f7a2a9e2a4c5d3b1f8a94",
    "usuarioId": "user123",
    "fecha": "2024-06-20T00:00:00.000Z",
    "totalComidas": 6,
    "comidasConsumidas": 3,
    "porcentajeComplecion": 50,
    "calorias": {
      "planeo": 2000,
      "consumidas": 1000
    },
    "accionesRealizadas": [
      {
        "comida": "desayuno",
        "timestamp": "2024-06-20T08:30:00.000Z",
        "marcadaConsumida": true
      },
      {
        "comida": "almuerzo",
        "timestamp": "2024-06-20T13:00:00.000Z",
        "marcadaConsumida": true
      },
      {
        "comida": "merienda",
        "timestamp": "2024-06-20T16:30:00.000Z",
        "marcadaConsumida": true
      }
    ]
  }
}
```

---

## 7. OBTENER HISTORIAL DE 7 DÍAS
### GET - Ver progreso de la última semana
```http
GET http://localhost:3000/api/rutina/historial/user123?dias=7
```

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "historial": [
      {
        "_id": "665f7a2a9e2a4c5d3b1f8a94",
        "usuarioId": "user123",
        "fecha": "2024-06-20T00:00:00.000Z",
        "totalComidas": 6,
        "comidasConsumidas": 6,
        "porcentajeComplecion": 100
      },
      {
        "_id": "665f6a2a9e2a4c5d3b1f8a95",
        "usuarioId": "user123",
        "fecha": "2024-06-19T00:00:00.000Z",
        "totalComidas": 6,
        "comidasConsumidas": 5,
        "porcentajeComplecion": 83.33
      },
      {
        "_id": "665f5a2a9e2a4c5d3b1f8a96",
        "usuarioId": "user123",
        "fecha": "2024-06-18T00:00:00.000Z",
        "totalComidas": 6,
        "comidasConsumidas": 4,
        "porcentajeComplecion": 66.67
      }
    ],
    "estadisticas": {
      "diasRegistrados": 7,
      "porcentajePromedio": "79.43",
      "diasCompletos": 3
    }
  }
}
```

---

## EJEMPLOS CON CURL

### 1. Obtener rutina
```bash
curl -X GET "http://localhost:3000/api/rutina/user123/2024-06-20"
```

### 2. Crear rutina
```bash
curl -X POST "http://localhost:3000/api/rutina" \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "user123",
    "fecha": "2024-06-21",
    "esEntrenamiento": true,
    "horaEntrenamiento": "antes17",
    "desayunoOpcion": 2,
    "meriendaOpcion": 1
  }'
```

### 3. Marcar desayuno como consumido
```bash
curl -X PATCH "http://localhost:3000/api/rutina/665f7a1c9e2a4c5d3b1f8a92/marcar-comida" \
  -H "Content-Type: application/json" \
  -d '{
    "tipoComida": "desayuno",
    "consumido": true
  }'
```

### 4. Obtener progreso
```bash
curl -X GET "http://localhost:3000/api/rutina/progreso/user123/2024-06-20"
```

### 5. Obtener historial (7 días)
```bash
curl -X GET "http://localhost:3000/api/rutina/historial/user123?dias=7"
```

---

## VALORES VÁLIDOS PARA COMIDAS

Al marcar comidas, usar estos valores exactos:
- `desayuno`
- `colacion1`
- `almuerzo`
- `merienda`
- `colacion2`
- `cena`

---

## DISTRIBUCIÓN SEMANAL POR DEFECTO

```
Lunes    → Almuerzo: HUEVO, Cena: CARNE
Martes   → Almuerzo: CARNE, Cena: HUEVO
Miércoles → Almuerzo: HUEVO, Cena: CARNE
Jueves   → Almuerzo: CARNE, Cena: HUEVO
Viernes  → Almuerzo: HUEVO, Cena: CARNE
Sábado   → Almuerzo: MIXTO, Cena: CARNE
Domingo  → Almuerzo: CARNE, Cena: CARNE
```

---

## OPCIONES DE DESAYUNO (1-6)

1. Yogur con semillas y frutas secas
2. Leche/yogur con mix de frutas
3. Café con omelet
4. Yogur con omelet (dulce)
5. Café negro con pan nube
6. Opción Libre

---

## OPCIONES DE MERIENDA (1-5)

1. Yogur con cereales y frutas secas
2. Yogur con pan integral
3. Café cortado con budín integral
4. Café con leche con tostadas untadas
5. Café cortado con pan nube

---

## TIPS DE PRUEBA

✓ Siempre usa formato de fecha: `YYYY-MM-DD`  
✓ El `usuarioId` puede ser cualquier string único  
✓ Al marcar una comida, se recalcula automáticamente el progreso  
✓ Las colaciones son opcionales por defecto  
✓ El porcentaje se actualiza en cada marca/desmarca  
✓ El historial muestra los últimos N días solicitados  

---

**Última actualización**: Junio 2024
