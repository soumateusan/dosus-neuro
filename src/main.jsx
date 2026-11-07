import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./tailwind.css";
import DosusApp from "./DosusApp.jsx";
import { Login, Configurar, Carregando } from "./Login.jsx";
import { configurado, observarLogin } from "./nuvem.js";
import { usarConta } from "./db.js";
import { registrarSW } from "./registrarSW.js";

registrarSW();

/* sem login não abre nada; cada conta Google tem os próprios dados */
function Raiz() {
  const [usuario, setUsuario] = useState(undefined); // undefined = verificando
  useEffect(() => observarLogin((u) => { if (u) usarConta(u.uid); setUsuario(u || null); }), []);
  if (!configurado) return <Configurar />;
  if (usuario === undefined) return <Carregando />;
  if (!usuario) return <Login />;
  return <DosusApp key={usuario.uid} usuario={usuario} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Raiz />
  </StrictMode>,
);
