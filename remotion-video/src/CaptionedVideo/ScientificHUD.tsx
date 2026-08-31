import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export const ScientificHUD: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // 1. Calcular altitud dinámica: sube de 3620m a 3990m a lo largo del video
  const progress = frame / durationInFrames;
  const altitude = Math.floor(3620 + progress * 370);

  // 2. Generar coordenadas UTM dinámicas que oscilan levemente (simulando caminata)
  // Base: 19K 598231 E, 8172943 N
  const utmEastBase = 598231;
  const utmNorthBase = 8172943;
  
  // Pequeño desplazamiento determinista usando seno para simular la marcha
  const driftEast = Math.sin(frame * 0.05) * 12;
  const driftNorth = Math.cos(frame * 0.04) * 8;
  const utmEast = (utmEastBase + driftEast).toFixed(2);
  const utmNorth = (utmNorthBase + driftNorth).toFixed(2);

  // 3. Rotación de la brújula (de 0 a 45 grados según avanza el trayecto)
  const compassRotation = (progress * 45).toFixed(1);

  // 4. Oscilación de precisión GPS (entre 1.8m y 3.4m)
  const gpsPrecision = (2.5 + Math.sin(frame * 0.01) * 0.7).toFixed(1);

  // 5. Satélites conectados (entre 14 y 18 satélites)
  const satellites = 14 + Math.floor((Math.sin(frame * 0.02) + 1) * 2);

  const neonGreen = "#39E508";
  const darkGlass = "rgba(2, 7, 4, 0.82)";
  const greenBorder = "1px solid rgba(57, 229, 8, 0.25)";

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        fontFamily: "'Outfit', 'Inter', sans-serif",
        boxSizing: "border-box",
        padding: "60px 50px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "white",
        zIndex: 5,
      }}
    >
      {/* 1. PANEL SUPERIOR: Título del Trekking */}
      <div
        style={{
          background: darkGlass,
          border: greenBorder,
          borderRadius: "16px",
          padding: "20px 30px",
          backdropFilter: "blur(10px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              color: neonGreen,
              fontWeight: 700,
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            Seram Experience Telemetry
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            VALLE DE LAS AGUJAS (TIÑIPATA)
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px" }}>
            MODO: GNSS MULTI-CONSTELLATION
          </div>
          <div style={{ fontSize: "16px", color: neonGreen, fontWeight: 700, marginTop: "2px" }}>
            REC: ACTIVE [Frame {frame}]
          </div>
        </div>
      </div>

      {/* 2. CAPA INTERMEDIA: Elementos Laterales (Datos de Navegación) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flex: 1,
          marginTop: "40px",
          marginBottom: "40px",
        }}
      >
        {/* Lado Izquierdo: Coordenadas y Satélites */}
        <div
          style={{
            background: darkGlass,
            border: greenBorder,
            borderRadius: "16px",
            padding: "20px",
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            minWidth: "260px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px" }}>
              UTM EASTING
            </div>
            <div style={{ fontSize: "20px", fontFamily: "monospace", fontWeight: 700, color: neonGreen }}>
              {utmEast} mE
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px" }}>
              UTM NORTHING
            </div>
            <div style={{ fontSize: "20px", fontFamily: "monospace", fontWeight: 700, color: neonGreen }}>
              {utmNorth} mN
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>SATS</div>
              <div style={{ fontSize: "16px", fontWeight: 700 }}>{satellites}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>ZONE</div>
              <div style={{ fontSize: "16px", fontWeight: 700 }}>19K (WGS84)</div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Brújula y Telemetría Geológica */}
        <div
          style={{
            background: darkGlass,
            border: greenBorder,
            borderRadius: "16px",
            padding: "20px",
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
            minWidth: "160px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          {/* Brújula SVG */}
          <div style={{ position: "relative", width: "80px", height: "80px" }}>
            <svg
              viewBox="0 0 100 100"
              style={{
                width: "100%",
                height: "100%",
                transform: `rotate(${-compassRotation}deg)`,
              }}
            >
              {/* Círculo brújula */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              <circle cx="50" cy="50" r="45" fill="none" stroke={neonGreen} strokeWidth="1" strokeDasharray="4 8" />
              {/* Aguja de la Brújula */}
              <line x1="50" y1="50" x2="50" y2="15" stroke={neonGreen} strokeWidth="4" strokeLinecap="round" />
              <line x1="50" y1="50" x2="50" y2="85" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
              {/* Marcas de puntos cardinales */}
              <text x="50" y="27" fill="white" fontSize="12" fontWeight="900" textAnchor="middle">N</text>
              <text x="50" y="81" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">S</text>
            </svg>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "12px",
                fontWeight: 700,
                color: neonGreen,
                fontFamily: "monospace",
              }}
            >
              {compassRotation}°
            </div>
          </div>
          
          <div style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>GPS ACCURACY</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: neonGreen }}>±{gpsPrecision}m</div>
          </div>
        </div>
      </div>

      {/* 3. PANEL INFERIOR: Altitud y Barra de Progreso de la Composición */}
      <div
        style={{
          background: darkGlass,
          border: greenBorder,
          borderRadius: "16px",
          padding: "20px 30px",
          backdropFilter: "blur(10px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
          <div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px" }}>ALTITUD ACTUAL</div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: neonGreen, fontFamily: "monospace" }}>
              {altitude} <span style={{ fontSize: "16px", fontWeight: 500, color: "white" }}>m.s.n.m.</span>
            </div>
          </div>
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.15)", paddingLeft: "25px" }}>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>RANGO DE RUTA</div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>3.623m — 4.000m</div>
          </div>
        </div>

        {/* Barra de progreso de elevación */}
        <div style={{ width: "220px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
            <span>PROGRESO DE ELEVACIÓN</span>
            <span>{Math.floor(progress * 100)}%</span>
          </div>
          <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                background: neonGreen,
                borderRadius: "4px",
                boxShadow: `0 0 10px ${neonGreen}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
