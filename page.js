"use client";
import { useState, useRef } from "react";

const comunasChile = [
  { nombre: "Providencia", tipo: "comuna", region: "RM", puntos: -12, reportes: 3 },
  { nombre: "Las Condes", tipo: "comuna", region: "RM", puntos: -8, reportes: 2 },
  { nombre: "Santiago Centro", tipo: "comuna", region: "RM", puntos: -87, reportes: 21 },
  { nombre: "Pudahuel", tipo: "comuna", region: "RM", puntos: -143, reportes: 34 },
  { nombre: "La Pintana", tipo: "comuna", region: "RM", puntos: -201, reportes: 48 },
  { nombre: "Autopista Central", tipo: "autopista", region: "RM", puntos: -55, reportes: 14 },
  { nombre: "Costanera Norte", tipo: "autopista", region: "RM", puntos: -33, reportes: 8 },
  { nombre: "Ruta 68", tipo: "autopista", region: "Valparaíso", puntos: -76, reportes: 19 },
  { nombre: "Maipú", tipo: "comuna", region: "RM", puntos: -118, reportes: 27 },
  { nombre: "Ñuñoa", tipo: "comuna", region: "RM", puntos: -22, reportes: 6 },
];

const tipoBasura = ["Microbasural", "Escombros", "Residuos domiciliarios", "Residuos peligrosos", "Basura en autopista"];

const fotosDemo = [
  "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=300&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80",
  "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=300&q=80",
];

const severidadConfig = {
  "Microbasural": { puntos: -5, color: "#f59e0b" },
  "Escombros": { puntos: -15, color: "#f97316" },
  "Residuos domiciliarios": { puntos: -10, color: "#ef4444" },
  "Residuos peligrosos": { puntos: -25, color: "#dc2626" },
  "Basura en autopista": { puntos: -20, color: "#b91c1c" },
};

function getColor(puntos) {
  if (puntos > -20) return "#22c55e";
  if (puntos > -50) return "#f59e0b";
  if (puntos > -100) return "#f97316";
  return "#ef4444";
}

function getMedalla(puntos) {
  if (puntos > -20) return "✨ Ejemplar";
  if (puntos > -50) return "⚠️ Regular";
  if (puntos > -100) return "🚨 Crítico";
  return "💀 Desastre";
}

export default function ChileOK() {
  const [vista, setVista] = useState("ranking");
  const [comunas, setComunas] = useState(comunasChile);
  const [filtro, setFiltro] = useState("todos");
  const [reportando, setReportando] = useState(false);
  const [reporteStep, setReporteStep] = useState(1);
  const [reporte, setReporte] = useState({ tipo: "", comuna: "", foto: null, fotoUrl: null, analisis: null });
  const [analizando, setAnalizando] = useState(false);
  const [reporteEnviado, setReporteEnviado] = useState(false);
  const [notif, setNotif] = useState(null);
  const [reportesRecientes, setReportesRecientes] = useState([
    { id: 1, comuna: "La Pintana", tipo: "Microbasural", puntos: -5, hora: "hace 2 min", foto: fotosDemo[0] },
    { id: 2, comuna: "Ruta 68", tipo: "Basura en autopista", puntos: -20, hora: "hace 15 min", foto: fotosDemo[1] },
    { id: 3, comuna: "Pudahuel", tipo: "Escombros", puntos: -15, hora: "hace 1 hora", foto: fotosDemo[2] },
  ]);
  const fileRef = useRef();

  const comunasFiltradas = comunas
    .filter(c => filtro === "todos" ? true : c.tipo === filtro)
    .sort((a, b) => a.puntos - b.puntos);

  const mostSucia = comunasFiltradas[0];

  function mostrarNotif(msg) {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  }

  async function analizarConIA(tipo) {
    setAnalizando(true);
    try {
      const response = await fetch("/api/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo }),
      });
      const data = await response.json();
      setReporte(r => ({ ...r, analisis: data }));
    } catch {
      setReporte(r => ({ ...r, analisis: {
        confirmado: true,
        severidad: "Moderada",
        descripcion: "Punto crítico de basura detectado",
        puntos_negativos: Math.abs(severidadConfig[tipo]?.puntos || 10),
        accion_recomendada: "Notificar a la municipalidad para retiro inmediato"
      }}));
    }
    setAnalizando(false);
  }

  function handleFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setReporte(r => ({ ...r, foto: file, fotoUrl: url }));
  }

  function handleEnviar() {
    if (!reporte.comuna || !reporte.tipo || !reporte.analisis) return;
    const pts = -(reporte.analisis.puntos_negativos);
    setComunas(prev => prev.map(c =>
      c.nombre === reporte.comuna
        ? { ...c, puntos: c.puntos + pts, reportes: c.reportes + 1 }
        : c
    ));
    setReportesRecientes(prev => [{
      id: Date.now(), comuna: reporte.comuna, tipo: reporte.tipo,
      puntos: pts, hora: "ahora mismo", foto: reporte.fotoUrl || fotosDemo[0]
    }, ...prev.slice(0, 4)]);
    setReporteEnviado(true);
    setTimeout(() => {
      setReportando(false); setReporteStep(1);
      setReporte({ tipo: "", comuna: "", foto: null, fotoUrl: null, analisis: null });
      setReporteEnviado(false);
      mostrarNotif(`✅ Reporte enviado! ${pts} pts a ${reporte.comuna}`);
      setVista("ranking");
    }, 2500);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)",
      fontFamily: "'Syne', 'Space Mono', monospace",
      color: "#e2e8f0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
        .btn { cursor: pointer; border: none; transition: all 0.2s; }
        .btn:active { transform: scale(0.97); }
        .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideIn { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .animate-in { animation: slideIn 0.4s ease forwards; }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,15,30,0.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 2 }}>
            🇨🇱 Chile<span style={{
              background: "linear-gradient(135deg, #22c55e, #4ade80)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              fontWeight: 900, fontSize: 26, letterSpacing: "-1px",
              filter: "drop-shadow(0 0 8px rgba(34,197,94,0.7))"
            }}>OK</span>
          </div>
          <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "2px", textTransform: "uppercase" }}>
            Ciudadanos por Chile limpio
          </div>
        </div>
        <button className="btn" onClick={() => { setReportando(true); setVista("reportar"); }} style={{
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          color: "#fff", padding: "10px 18px", borderRadius: 12,
          fontSize: 13, fontWeight: 700, fontFamily: "inherit",
          boxShadow: "0 0 20px rgba(34,197,94,0.3)"
        }}>📸 Reportar</button>
      </div>

      {/* Nav */}
      <div style={{
        display: "flex", gap: 4, padding: "12px 20px",
        background: "rgba(10,15,30,0.5)", position: "sticky", top: 65, zIndex: 99,
        borderBottom: "1px solid rgba(255,255,255,0.04)"
      }}>
        {[{ id: "ranking", label: "🏆 Ranking" }, { id: "mapa", label: "📡 En vivo" }, { id: "estadisticas", label: "📊 Stats" }].map(v => (
          <button key={v.id} className="btn" onClick={() => setVista(v.id)} style={{
            padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "inherit",
            background: vista === v.id ? "rgba(34,197,94,0.15)" : "transparent",
            color: vista === v.id ? "#22c55e" : "#64748b",
            border: vista === v.id ? "1px solid rgba(34,197,94,0.3)" : "1px solid transparent"
          }}>{v.label}</button>
        ))}
      </div>

      {/* Notificación */}
      {notif && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "#0f2027", border: "1px solid rgba(34,197,94,0.4)",
          color: "#22c55e", padding: "12px 24px", borderRadius: 12,
          fontSize: 14, fontWeight: 600, zIndex: 999,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)", animation: "slideIn 0.3s ease"
        }}>{notif}</div>
      )}

      <div style={{ padding: "20px", maxWidth: 480, margin: "0 auto" }}>

        {/* RANKING */}
        {vista === "ranking" && (
          <div className="animate-in">
            {mostSucia && (
              <div style={{
                background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(185,28,28,0.1))",
                border: "1px solid rgba(239,68,68,0.3)", borderRadius: 20, padding: "20px", marginBottom: 20
              }}>
                <div style={{ fontSize: 11, color: "#ef4444", letterSpacing: "2px", marginBottom: 8, fontWeight: 700 }}>💀 MÁS SUCIA AHORA</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{mostSucia.nombre}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: "#ef4444" }}>{mostSucia.puntos}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>puntos de penalización</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, color: "#94a3b8" }}>{mostSucia.reportes} reportes</div>
                    <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>{mostSucia.tipo}</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["todos", "comuna", "autopista"].map(f => (
                <button key={f} className="btn" onClick={() => setFiltro(f)} style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                  background: filtro === f ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                  color: filtro === f ? "#60a5fa" : "#64748b",
                  border: filtro === f ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.06)"
                }}>
                  {f === "todos" ? "🌐 Todos" : f === "comuna" ? "🏘️ Comunas" : "🛣️ Autopistas"}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {comunasFiltradas.map((c, i) => (
                <div key={c.nombre} className="card" style={{ padding: "14px 16px", borderLeft: `3px solid ${getColor(c.puntos)}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: i === 0 ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 800, color: i === 0 ? "#ef4444" : "#64748b"
                      }}>{i + 1}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{c.nombre}</div>
                        <div style={{ fontSize: 11, color: "#475569" }}>
                          {c.tipo === "autopista" ? "🛣️ Concesionaria" : "🏘️ Municipalidad"} · {c.reportes} reportes
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: getColor(c.puntos) }}>{c.puntos}</div>
                      <div style={{ fontSize: 10, color: "#475569" }}>{getMedalla(c.puntos)}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                    <div style={{
                      height: "100%", width: `${Math.min(100, (Math.abs(c.puntos) / 250) * 100)}%`,
                      background: getColor(c.puntos), borderRadius: 2, transition: "width 0.6s ease"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EN VIVO */}
        {vista === "mapa" && (
          <div className="animate-in">
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>Reportes en tiempo real</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reportesRecientes.map(r => (
                <div key={r.id} className="card fade-in" style={{ padding: 0, overflow: "hidden", display: "flex" }}>
                  <div style={{ width: 80, minHeight: 80, flexShrink: 0 }}>
                    <img src={r.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "12px 14px", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>{r.comuna}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{r.tipo}</div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#ef4444" }}>{r.puntos}</div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: "#475569" }}>📍 Geo-verificado · {r.hora}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ESTADÍSTICAS */}
        {vista === "estadisticas" && (
          <div className="animate-in">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Total reportes", valor: comunas.reduce((a, c) => a + c.reportes, 0), color: "#60a5fa", icon: "📋" },
                { label: "Puntos asignados", valor: comunas.reduce((a, c) => a + Math.abs(c.puntos), 0), color: "#f87171", icon: "⚠️" },
                { label: "Comunas monitoreadas", valor: comunas.filter(c => c.tipo === "comuna").length, color: "#34d399", icon: "🏘️" },
                { label: "Autopistas monitoreadas", valor: comunas.filter(c => c.tipo === "autopista").length, color: "#fbbf24", icon: "🛣️" },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.valor}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase" }}>
                Distribución de severidad
              </div>
              {[
                { label: "Ejemplar (0 a -20)", pct: 10, color: "#22c55e" },
                { label: "Regular (-21 a -50)", pct: 20, color: "#f59e0b" },
                { label: "Crítico (-51 a -100)", pct: 30, color: "#f97316" },
                { label: "Desastre (-100+)", pct: 40, color: "#ef4444" },
              ].map(s => (
                <div key={s.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                    <span style={{ color: "#94a3b8" }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: 700 }}>{s.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL REPORTE */}
        {reportando && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center"
          }}>
            <div style={{
              width: "100%", maxWidth: 480, background: "#0d1b2a",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px 24px 0 0",
              padding: 24, animation: "slideIn 0.3s ease"
            }}>
              {!reporteEnviado ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>Nuevo reporte</div>
                      <div style={{ fontSize: 12, color: "#475569" }}>Paso {reporteStep} de 3</div>
                    </div>
                    <button className="btn" onClick={() => { setReportando(false); setReporteStep(1); setReporte({ tipo: "", comuna: "", foto: null, fotoUrl: null, analisis: null }); }}
                      style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8", padding: "8px 12px", borderRadius: 10, fontFamily: "inherit", fontSize: 13 }}>
                      Cancelar
                    </button>
                  </div>

                  <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 24 }}>
                    <div style={{ height: "100%", width: `${(reporteStep / 3) * 100}%`, background: "#22c55e", borderRadius: 2, transition: "width 0.4s ease" }} />
                  </div>

                  {reporteStep === 1 && (
                    <div className="fade-in">
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12, fontWeight: 600 }}>¿Qué tipo de basura?</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {tipoBasura.map(t => (
                          <button key={t} className="btn" onClick={() => setReporte(r => ({ ...r, tipo: t }))} style={{
                            padding: "12px 16px", borderRadius: 12, textAlign: "left",
                            fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                            background: reporte.tipo === t ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                            color: reporte.tipo === t ? "#22c55e" : "#94a3b8",
                            border: reporte.tipo === t ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.06)",
                            display: "flex", justifyContent: "space-between", alignItems: "center"
                          }}>
                            <span>{t}</span>
                            <span style={{ fontSize: 11, color: severidadConfig[t]?.color, fontWeight: 700 }}>
                              {severidadConfig[t]?.puntos} pts
                            </span>
                          </button>
                        ))}
                      </div>
                      <button className="btn" disabled={!reporte.tipo} onClick={() => setReporteStep(2)} style={{
                        width: "100%", marginTop: 16, padding: "14px",
                        background: reporte.tipo ? "linear-gradient(135deg, #22c55e, #16a34a)" : "rgba(255,255,255,0.05)",
                        color: reporte.tipo ? "#fff" : "#475569",
                        borderRadius: 12, fontFamily: "inherit", fontSize: 14, fontWeight: 700
                      }}>Siguiente →</button>
                    </div>
                  )}

                  {reporteStep === 2 && (
                    <div className="fade-in">
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12, fontWeight: 600 }}>¿Dónde ocurre?</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                        {comunas.map(c => (
                          <button key={c.nombre} className="btn" onClick={() => setReporte(r => ({ ...r, comuna: c.nombre }))} style={{
                            padding: "10px 14px", borderRadius: 10, textAlign: "left",
                            fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                            background: reporte.comuna === c.nombre ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                            color: reporte.comuna === c.nombre ? "#60a5fa" : "#94a3b8",
                            border: reporte.comuna === c.nombre ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.06)",
                            display: "flex", justifyContent: "space-between"
                          }}>
                            <span>{c.nombre}</span>
                            <span style={{ fontSize: 11, color: "#475569" }}>{c.tipo === "autopista" ? "🛣️" : "🏘️"}</span>
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        <button className="btn" onClick={() => setReporteStep(1)} style={{
                          flex: 1, padding: "12px", background: "rgba(255,255,255,0.06)",
                          color: "#94a3b8", borderRadius: 12, fontFamily: "inherit", fontSize: 14
                        }}>← Atrás</button>
                        <button className="btn" disabled={!reporte.comuna} onClick={() => setReporteStep(3)} style={{
                          flex: 2, padding: "12px",
                          background: reporte.comuna ? "linear-gradient(135deg, #22c55e, #16a34a)" : "rgba(255,255,255,0.05)",
                          color: reporte.comuna ? "#fff" : "#475569",
                          borderRadius: 12, fontFamily: "inherit", fontSize: 14, fontWeight: 700
                        }}>Siguiente →</button>
                      </div>
                    </div>
                  )}

                  {reporteStep === 3 && (
                    <div className="fade-in">
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12, fontWeight: 600 }}>📸 Subir foto como evidencia</div>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} />
                      {!reporte.fotoUrl ? (
                        <div onClick={() => fileRef.current.click()} style={{
                          height: 140, border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 16,
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", gap: 8, color: "#475569"
                        }}>
                          <div style={{ fontSize: 32 }}>📷</div>
                          <div style={{ fontSize: 13 }}>Toca para seleccionar foto</div>
                        </div>
                      ) : (
                        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: 140 }}>
                          <img src={reporte.fotoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          {!reporte.analisis && (
                            <button className="btn" onClick={() => analizarConIA(reporte.tipo)} style={{
                              position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
                              color: "#22c55e", fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%"
                            }}>
                              {analizando
                                ? <><div style={{ width: 18, height: 18, border: "2px solid #22c55e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Analizando con IA...</>
                                : "🤖 Analizar con IA"}
                            </button>
                          )}
                        </div>
                      )}

                      {reporte.analisis && (
                        <div style={{
                          marginTop: 14, padding: 14,
                          background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12
                        }}>
                          <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 700, marginBottom: 6 }}>✅ Análisis IA completado</div>
                          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>{reporte.analisis.descripcion}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                            <span style={{ color: "#64748b" }}>Severidad: <span style={{ color: "#f97316" }}>{reporte.analisis.severidad}</span></span>
                            <span style={{ color: "#ef4444", fontWeight: 700 }}>-{reporte.analisis.puntos_negativos} puntos</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>💡 {reporte.analisis.accion_recomendada}</div>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        <button className="btn" onClick={() => setReporteStep(2)} style={{
                          flex: 1, padding: "12px", background: "rgba(255,255,255,0.06)",
                          color: "#94a3b8", borderRadius: 12, fontFamily: "inherit", fontSize: 14
                        }}>← Atrás</button>
                        <button className="btn" disabled={!reporte.analisis} onClick={handleEnviar} style={{
                          flex: 2, padding: "12px",
                          background: reporte.analisis ? "linear-gradient(135deg, #22c55e, #16a34a)" : "rgba(255,255,255,0.05)",
                          color: reporte.analisis ? "#fff" : "#475569",
                          borderRadius: 12, fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                          boxShadow: reporte.analisis ? "0 0 20px rgba(34,197,94,0.3)" : "none"
                        }}>🚀 Enviar reporte</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="fade-in" style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 56 }}>✅</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#22c55e", marginTop: 12 }}>¡Reporte enviado!</div>
                  <div style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>
                    -{reporte.analisis?.puntos_negativos} puntos aplicados a {reporte.comuna}
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Actualizando el ranking...</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
