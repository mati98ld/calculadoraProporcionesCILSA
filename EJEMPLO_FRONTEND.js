// ============================================
// EJEMPLO DE USO DE LA API EN FRONTEND
// ============================================

// 1. OBTENER LA RUTINA DEL DÍA
// ============================================
async function obtenerRutinaDelDia(usuarioId) {
  const hoy = new Date().toISOString().split('T')[0]; // Formato: YYYY-MM-DD
  
  try {
    const response = await fetch(`/api/rutina/${usuarioId}/${hoy}`);
    const data = await response.json();
    
    if (data.success) {
      console.log("Rutina del día:", data.data);
      console.log("Distribución:", data.distribucion);
      
      // Mostrar la rutina
      mostrarRutina(data.data);
    }
  } catch (error) {
    console.error("Error al obtener rutina:", error);
  }
}

// 2. MOSTRAR LA RUTINA EN LA INTERFAZ
// ============================================
function mostrarRutina(rutina) {
  console.log("=== COMIDAS DEL DÍA ===\n");
  
  console.log("🌅 DESAYUNO:");
  console.log(`   Opción ${rutina.desayuno.opcion}: ${rutina.desayuno.descripcion}`);
  console.log(`   ✓ Consumido: ${rutina.desayuno.consumido ? "SÍ" : "NO"}\n`);
  
  console.log("📍 COLACIÓN 1 (Opcional):");
  console.log(`   ${rutina.colacion1.descripcion}`);
  console.log(`   ✓ Consumido: ${rutina.colacion1.consumido ? "SÍ" : "NO"}\n`);
  
  console.log("🍽️ ALMUERZO:");
  console.log(`   Proteína: ${rutina.almuerzo.grupoAlimentos.proteina.cantidad} de ${rutina.almuerzo.grupoAlimentos.proteina.tipo}`);
  console.log(`   Verdura: ${rutina.almuerzo.grupoAlimentos.verdura}`);
  console.log(`   ✓ Consumido: ${rutina.almuerzo.consumido ? "SÍ" : "NO"}\n`);
  
  console.log("☕ MERIENDA:");
  console.log(`   Opción ${rutina.merienda.opcion}: ${rutina.merienda.descripcion}`);
  console.log(`   ✓ Consumido: ${rutina.merienda.consumido ? "SÍ" : "NO"}\n`);
  
  console.log("📍 COLACIÓN 2 (Opcional):");
  console.log(`   ${rutina.colacion2.descripcion}`);
  console.log(`   ✓ Consumido: ${rutina.colacion2.consumido ? "SÍ" : "NO"}\n`);
  
  console.log("🌙 CENA:");
  console.log(`   Proteína: ${rutina.cena.grupoAlimentos.proteina.cantidad} de ${rutina.cena.grupoAlimentos.proteina.tipo}`);
  console.log(`   Verdura: ${rutina.cena.grupoAlimentos.verdura}`);
  console.log(`   ✓ Consumido: ${rutina.cena.consumido ? "SÍ" : "NO"}\n`);
}

// 3. MARCAR UNA COMIDA COMO CONSUMIDA
// ============================================
async function marcarComidaConsumida(rutinaId, tipoComida, consumido = true) {
  try {
    const response = await fetch(`/api/rutina/${rutinaId}/marcar-comida`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipoComida: tipoComida, // "desayuno", "merienda", "almuerzo", etc.
        consumido: consumido,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✓ ${tipoComida} marcada como ${consumido ? "consumida" : "no consumida"}`);
      console.log(`Progreso: ${data.progreso.porcentajeComplecion}`);
      
      // Actualizar UI
      mostrarProgreso(data.progreso);
    }
  } catch (error) {
    console.error("Error al marcar comida:", error);
  }
}

// 4. MOSTRAR PROGRESO DEL DÍA
// ============================================
function mostrarProgreso(progreso) {
  console.log("\n📊 PROGRESO DEL DÍA:");
  console.log(`   Comidas consumidas: ${progreso.comidasConsumidas}/${progreso.totalComidas}`);
  console.log(`   Porcentaje: ${progreso.porcentajeComplecion}`);
  console.log(`   ${"█".repeat(Math.floor(parseFloat(progreso.porcentajeComplecion) / 10))}${"░".repeat(10 - Math.floor(parseFloat(progreso.porcentajeComplecion) / 10))}\n`);
}

// 5. OBTENER PROGRESO HISTÓRICO
// ============================================
async function obtenerHistorial(usuarioId, dias = 7) {
  try {
    const response = await fetch(`/api/rutina/historial/${usuarioId}?dias=${dias}`);
    const data = await response.json();
    
    if (data.success) {
      console.log("\n📈 HISTORIAL ÚLTIMOS " + dias + " DÍAS:");
      
      data.data.historial.forEach((dia) => {
        const fecha = new Date(dia.fecha).toLocaleDateString("es-ES", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        
        console.log(`${fecha}: ${dia.porcentajeComplecion}% completado`);
      });
      
      console.log("\n📊 ESTADÍSTICAS:");
      console.log(`   Días registrados: ${data.data.estadisticas.diasRegistrados}`);
      console.log(`   Promedio: ${data.data.estadisticas.porcentajePromedio}%`);
      console.log(`   Días completos: ${data.data.estadisticas.diasCompletos}`);
    }
  } catch (error) {
    console.error("Error al obtener historial:", error);
  }
}

// ============================================
// FLUJO COMPLETO DE USO
// ============================================

async function flujoCompleto(usuarioId) {
  console.log("🚀 INICIANDO APLICACIÓN DE SEGUIMIENTO DE COMIDAS\n");
  
  // Paso 1: Obtener la rutina del día
  console.log("📥 Obteniendo rutina del día...");
  const rutina = await obtenerRutinaDelDia(usuarioId);
  
  // Esperar un poco para que se cargue
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Simular que el usuario consumió desayuno y almuerzo
  console.log("\n✅ Marcando desayuno como consumido...");
  // await marcarComidaConsumida(rutina._id, "desayuno", true);
  
  // await new Promise((resolve) => setTimeout(resolve, 500));
  
  // console.log("✅ Marcando almuerzo como consumido...");
  // await marcarComidaConsumida(rutina._id, "almuerzo", true);
  
  // Paso 2: Obtener historial
  console.log("\n📊 Obteniendo historial...");
  // await obtenerHistorial(usuarioId, 7);
  
  console.log("\n✨ Proceso completado");
}

// EJECUTAR EL EJEMPLO
// Descomenta la siguiente línea para ejecutar el ejemplo
// flujoCompleto("user123");

// ============================================
// EJEMPLO DE COMPONENTE REACT
// ============================================

/*
import React, { useState, useEffect } from 'react';

export function RutinaComidas({ usuarioId }) {
  const [rutina, setRutina] = useState(null);
  const [progreso, setProgreso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarRutina();
  }, []);

  const cargarRutina = async () => {
    const hoy = new Date().toISOString().split('T')[0];
    const res = await fetch(`/api/rutina/${usuarioId}/${hoy}`);
    const data = await res.json();
    setRutina(data.data);
    setLoading(false);
  };

  const marcarComida = async (tipoComida) => {
    const res = await fetch(`/api/rutina/${rutina._id}/marcar-comida`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipoComida,
        consumido: !rutina[tipoComida]?.consumido
      })
    });
    
    const data = await res.json();
    setRutina(data.data);
    setProgreso(data.progreso);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="rutina-container">
      <h1>📋 Rutina de Hoy</h1>
      
      <div className="comidas-grid">
        {['desayuno', 'colacion1', 'almuerzo', 'merienda', 'colacion2', 'cena'].map(comida => (
          <div key={comida} className="comida-card">
            <h3>{comida.toUpperCase()}</h3>
            <p>{rutina?.[comida]?.descripcion}</p>
            <button 
              onClick={() => marcarComida(comida)}
              className={rutina?.[comida]?.consumido ? 'consumida' : ''}
            >
              {rutina?.[comida]?.consumido ? '✓ Consumida' : 'Marcar consumida'}
            </button>
          </div>
        ))}
      </div>

      {progreso && (
        <div className="progreso">
          <h2>Progreso: {progreso.porcentajeComplecion}</h2>
          <div className="barra-progreso">
            <div 
              className="barra-rellena"
              style={{width: progreso.porcentajeComplecion}}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
*/

// ============================================
// LLAMADAS DIRECTAS ÚTILES
// ============================================

// Obtener rutina de hoy
// obtenerRutinaDelDia("user123");

// Obtener progreso histórico
// obtenerHistorial("user123", 30);

// Crear una rutina personalizada
async function crearRutina(usuarioId, fecha) {
  const response = await fetch(`/api/rutina`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      usuarioId,
      fecha,
      esEntrenamiento: true,
      horaEntrenamiento: "antes17",
      desayunoOpcion: 2,
      meriendaOpcion: 1,
    }),
  });

  const data = await response.json();
  console.log("Rutina creada:", data);
  return data;
}

// Export para usar en otros archivos
export {
  obtenerRutinaDelDia,
  marcarComidaConsumida,
  obtenerHistorial,
  crearRutina,
  mostrarProgreso,
};
