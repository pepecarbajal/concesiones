import React, { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────
// LoginPage
// Preparado para módulo de usuarios: cuando lo implementes, cambia
// `verificarCredenciales` para que haga fetch a tu API de autenticación
// y devuelva { ok: true, usuario: { id, nombre, rol } } | { ok: false }
// ─────────────────────────────────────────────────────────────────

const verificarCredenciales = async (password) => {
  // ── Verificación actual: contraseña única desde variable de entorno ──
  const PASSWORD_CORRECTA = import.meta.env.VITE_APP_PASSWORD ?? '';

  if (!PASSWORD_CORRECTA) {
    console.warn('[Login] VITE_APP_PASSWORD no está definida en .env');
  }

  // Simula latencia de red para que la UI tenga sentido
  await new Promise(r => setTimeout(r, 600));

  if (password === PASSWORD_CORRECTA) {
    return { ok: true, usuario: { id: 'guest', nombre: 'Invitado', rol: 'viewer' } };
  }
  return { ok: false };

  // ── FUTURO: reemplaza lo de arriba por algo como: ──────────────────
  // const res = await fetch('/api/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ password }),
  // });
  // const data = await res.json();
  // return data; // { ok: boolean, usuario?: { id, nombre, rol } }
};

export default function LoginPage({ onLoginExitoso }) {
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [estado, setEstado] = useState('idle'); // 'idle' | 'cargando' | 'error'
  const [intentos, setIntentos] = useState(0);
  const inputRef = useRef(null);

  // Focus automático al montar
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  // Sacudir si hay error
  useEffect(() => {
    if (estado === 'error') {
      const t = setTimeout(() => setEstado('idle'), 2000);
      return () => clearTimeout(t);
    }
  }, [estado]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || estado === 'cargando') return;

    setEstado('cargando');
    const resultado = await verificarCredenciales(password);

    if (resultado.ok) {
      setEstado('idle');
      onLoginExitoso(resultado.usuario);
    } else {
      setIntentos(n => n + 1);
      setEstado('error');
      setPassword('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const esError  = estado === 'error';
  const esCargando = estado === 'cargando';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Inter:wght@400;500;600;700&display=swap');

        .lp-login-overlay {
          position: fixed; inset: 0; z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: lpFadeIn 0.5s ease;
        }

        @keyframes lpFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Fondo igual que LandingPage ── */
        .lp-login-bg {
          position: absolute; inset: 0;
          background-image: url('https://tse1.mm.bing.net/th/id/OIP.UJgEYHR6WBDHU--StGGH1wHaEK?rs=1&pid=ImgDetMain&o=7&rm=32');
          background-size: cover; background-position: center;
          filter: brightness(0.28) saturate(0.8);
        }

        .lp-login-bg-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom,
            rgba(8,7,15,0.3) 0%,
            rgba(8,7,15,0.2) 50%,
            rgba(8,7,15,0.55) 100%
          );
        }

        /* ── Card central ── */
        .lp-login-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 420px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 44px 40px 40px;
          backdrop-filter: blur(24px);
          box-shadow:
            0 32px 80px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.06) inset;
          animation: lpSlideUp 0.55s cubic-bezier(0.34,1.2,0.64,1);
        }

        @keyframes lpSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .lp-login-card.shake {
          animation: lpShake 0.45s cubic-bezier(0.36,0.07,0.19,0.97);
        }

        @keyframes lpShake {
          0%,100% { transform: translateX(0); }
          15%      { transform: translateX(-8px); }
          30%      { transform: translateX(8px); }
          45%      { transform: translateX(-6px); }
          60%      { transform: translateX(6px); }
          75%      { transform: translateX(-3px); }
          90%      { transform: translateX(3px); }
        }

        /* Ícono / escudo */
        .lp-login-icon {
          width: 56px; height: 56px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(102,126,234,0.4);
        }

        /* Títulos */
        .lp-login-title {
          font-family: 'Merriweather', serif;
          font-size: 1.35rem; font-weight: 700;
          color: white; text-align: center;
          margin: 0 0 6px; line-height: 1.3;
        }

        .lp-login-sub {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 400;
          color: rgba(255,255,255,0.45);
          text-align: center; margin: 0 0 32px;
          line-height: 1.5;
        }

        /* Label */
        .lp-login-label {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase; letter-spacing: 0.12em;
          margin-bottom: 10px;
        }

        /* Input wrapper */
        .lp-login-input-wrap {
          position: relative; margin-bottom: 20px;
        }

        .lp-login-input {
          width: 100%; padding: 13px 44px 13px 16px;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.14);
          border-radius: 12px;
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 15px; font-weight: 500;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          letter-spacing: 0.05em;
        }

        .lp-login-input::placeholder {
          color: rgba(255,255,255,0.22);
          letter-spacing: 0.05em;
        }

        .lp-login-input:focus {
          border-color: rgba(102,126,234,0.7);
          background: rgba(255,255,255,0.1);
          box-shadow: 0 0 0 3px rgba(102,126,234,0.18);
        }

        .lp-login-input.error-state {
          border-color: rgba(239,68,68,0.7);
          background: rgba(239,68,68,0.07);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
        }

        /* Toggle mostrar contraseña */
        .lp-login-eye {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.35); padding: 2px;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .lp-login-eye:hover { color: rgba(255,255,255,0.7); }

        /* Mensaje de error */
        .lp-login-error {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; margin-bottom: 16px;
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          color: #fca5a5;
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 500;
          animation: lpFadeIn 0.2s ease;
        }

        /* Botón submit */
        .lp-login-btn {
          width: 100%;
          padding: 14px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none; border-radius: 12px;
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer; letter-spacing: 0.02em;
          box-shadow: 0 6px 20px rgba(102,126,234,0.4);
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        .lp-login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(102,126,234,0.5);
        }

        .lp-login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .lp-login-btn:disabled {
          opacity: 0.65; cursor: not-allowed;
        }

        /* Spinner */
        .lp-login-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: lpSpin 0.7s linear infinite;
        }
        @keyframes lpSpin {
          to { transform: rotate(360deg); }
        }

        /* Footer */
        .lp-login-footer {
          margin-top: 28px; text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 11px; color: rgba(255,255,255,0.2);
          letter-spacing: 0.04em;
        }

        /* Intentos fallidos hint */
        .lp-login-hint {
          margin-top: 12px; text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 11px; color: rgba(255,165,0,0.6);
        }

        @media (max-width: 480px) {
          .lp-login-card { padding: 32px 24px 28px; }
          .lp-login-title { font-size: 1.2rem; }
        }
      `}</style>

      <div className="lp-login-overlay">
        <div className="lp-login-bg" />
        <div className="lp-login-bg-overlay" />

        <div className={`lp-login-card ${esError ? 'shake' : ''}`} key={intentos}>
          {/* Ícono */}
          <div className="lp-login-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="lp-login-title">Acceso Restringido</h1>
          <p className="lp-login-sub">
            Información Minera del Estado de Guerrero
          </p>

          <form onSubmit={handleSubmit} autoComplete="off">
            <label className="lp-login-label" htmlFor="lp-pwd">
              Contraseña de acceso
            </label>

            <div className="lp-login-input-wrap">
              <input
                ref={inputRef}
                id="lp-pwd"
                type={mostrarPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                className={`lp-login-input ${esError ? 'error-state' : ''}`}
                disabled={esCargando}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="lp-login-eye"
                onClick={() => setMostrarPassword(v => !v)}
                tabIndex={-1}
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {esError && (
              <div className="lp-login-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Contraseña incorrecta. Verifica e intenta de nuevo.
              </div>
            )}

            <button
              type="submit"
              className="lp-login-btn"
              disabled={esCargando || !password.trim()}
            >
              {esCargando ? (
                <>
                  <div className="lp-login-spinner" />
                  Verificando...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Ingresar
                </>
              )}
            </button>
          </form>
          <div className="lp-login-footer">
            Sistema de Información Geoespacial Minera · Guerrero
          </div>
        </div>
      </div>
    </>
  );
}