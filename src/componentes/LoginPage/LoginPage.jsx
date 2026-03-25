import React, { useState, useEffect, useRef } from 'react';

export default function LoginPage({ onLoginExitoso }) {
  const [password, setPassword]           = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [estado, setEstado]               = useState('idle');
  const [mensajeError, setMensajeError]   = useState('');
  const [intentosRestantes, setIntentosRestantes] = useState(null);
  const [tiempoBloqueo, setTiempoBloqueo] = useState(0);
  const inputRef  = useRef(null);
  const timerRef  = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (estado === 'error') {
      const t = setTimeout(() => setEstado('idle'), 3000);
      return () => clearTimeout(t);
    }
  }, [estado]);

  useEffect(() => {
    if (estado === 'bloqueado' && tiempoBloqueo > 0) {
      timerRef.current = setInterval(() => {
        setTiempoBloqueo(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setEstado('idle');
            setMensajeError('');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [estado, tiempoBloqueo]);

  const formatearTiempo = (segundos) => {
    const m = Math.floor(segundos / 60).toString().padStart(2, '0');
    const s = (segundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || estado === 'cargando' || estado === 'bloqueado') return;

    setEstado('cargando');
    setMensajeError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'same-origin',
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setEstado('idle');
        onLoginExitoso({ id: 'user', rol: 'viewer' });
        return;
      }

      if (res.status === 429 || data.bloqueado) {
        setEstado('bloqueado');
        setTiempoBloqueo(15 * 60);
        setMensajeError('Demasiados intentos fallidos.');
        setPassword('');
        return;
      }

      setIntentosRestantes(data.intentosRestantes ?? null);
      setMensajeError(data.error || 'Contraseña incorrecta');
      setEstado('error');
      setPassword('');
      setTimeout(() => inputRef.current?.focus(), 50);

    } catch {
      setMensajeError('Error de conexión. Intenta de nuevo.');
      setEstado('error');
    }
  };

  const esError     = estado === 'error';
  const esCargando  = estado === 'cargando';
  const esBloqueado = estado === 'bloqueado';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Inter:wght@400;500;600;700&display=swap');
        .lp-login-overlay { position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;animation:lpFadeIn 0.5s ease; }
        @keyframes lpFadeIn{from{opacity:0}to{opacity:1}}
        .lp-login-bg { position:absolute;inset:0;background-image:url('./ComplejoMineroMorelosMML.webp');background-size:cover;background-position:center; saturate(0.8); }
        .lp-login-bg-overlay { position:absolute;inset:0;background:linear-gradient(to bottom,rgba(8,7,15,0.3) 0%,rgba(8,7,15,0.2) 50%,rgba(8,7,15,0.55) 100%); }
        .lp-login-card { position:relative;z-index:1;width:100%;max-width:420px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:44px 40px 40px;backdrop-filter:blur(24px);box-shadow:0 32px 80px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.06) inset;animation:lpSlideUp 0.55s cubic-bezier(0.34,1.2,0.64,1); }
        @keyframes lpSlideUp{from{opacity:0;transform:translateY(28px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .lp-login-card.shake{animation:lpShake 0.45s cubic-bezier(0.36,0.07,0.19,0.97)}
        @keyframes lpShake{0%,100%{transform:translateX(0)}15%{transform:translateX(-8px)}30%{transform:translateX(8px)}45%{transform:translateX(-6px)}60%{transform:translateX(6px)}75%{transform:translateX(-3px)}90%{transform:translateX(3px)}}
        .lp-login-icon { width:56px;height:56px;margin:0 auto 20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(102,126,234,0.4); }
        .lp-login-icon.bloqueado { background:linear-gradient(135deg,#dc2626 0%,#991b1b 100%);box-shadow:0 8px 24px rgba(220,38,38,0.4); }
        .lp-login-title { font-family:'Merriweather',serif;font-size:1.35rem;font-weight:700;color:white;text-align:center;margin:0 0 6px;line-height:1.3; }
        .lp-login-sub { font-family:'Inter',sans-serif;font-size:13px;font-weight:400;color:rgba(255,255,255,0.45);text-align:center;margin:0 0 32px;line-height:1.5; }
        .lp-login-label { display:block;font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px; }
        .lp-login-input-wrap { position:relative;margin-bottom:20px; }
        .lp-login-input { width:100%;padding:13px 44px 13px 16px;background:rgba(255,255,255,0.07);border:1.5px solid rgba(255,255,255,0.14);border-radius:12px;color:white;font-family:'Inter',sans-serif;font-size:15px;font-weight:500;outline:none;transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;letter-spacing:0.05em; }
        .lp-login-input::placeholder{color:rgba(255,255,255,0.22);}
        .lp-login-input:focus{border-color:rgba(102,126,234,0.7);background:rgba(255,255,255,0.1);box-shadow:0 0 0 3px rgba(102,126,234,0.18);}
        .lp-login-input.error-state{border-color:rgba(239,68,68,0.7);background:rgba(239,68,68,0.07);box-shadow:0 0 0 3px rgba(239,68,68,0.15);}
        .lp-login-eye{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.35);padding:2px;display:flex;align-items:center;transition:color 0.2s;}
        .lp-login-eye:hover{color:rgba(255,255,255,0.7);}
        .lp-login-error{display:flex;align-items:flex-start;gap:8px;padding:10px 14px;margin-bottom:16px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:10px;color:#fca5a5;font-family:'Inter',sans-serif;font-size:12px;font-weight:500;animation:lpFadeIn 0.2s ease;}
        .lp-login-bloqueado{display:flex;flex-direction:column;align-items:center;gap:12px;padding:20px;background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.3);border-radius:12px;margin-bottom:16px;text-align:center;}
        .lp-login-bloqueado-tiempo{font-family:'Merriweather',serif;font-size:2rem;font-weight:700;color:#fca5a5;letter-spacing:0.05em;}
        .lp-login-bloqueado-texto{font-family:'Inter',sans-serif;font-size:12px;color:rgba(252,165,165,0.75);line-height:1.5;}
        .lp-login-btn{width:100%;padding:14px 20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:none;border-radius:12px;color:white;font-family:'Inter',sans-serif;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:0.02em;box-shadow:0 6px 20px rgba(102,126,234,0.4);transition:transform 0.2s,box-shadow 0.2s,opacity 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;}
        .lp-login-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 28px rgba(102,126,234,0.5);}
        .lp-login-btn:disabled{opacity:0.5;cursor:not-allowed;}
        .lp-login-spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:lpSpin 0.7s linear infinite;}
        @keyframes lpSpin{to{transform:rotate(360deg)}}
        .lp-login-footer{margin-top:28px;text-align:center;font-family:'Inter',sans-serif;font-size:11px;color:rgba(255,255,255,0.2);letter-spacing:0.04em;}
        @media(max-width:480px){.lp-login-card{padding:32px 24px 28px;}.lp-login-title{font-size:1.2rem;}}
      `}</style>

      <div className="lp-login-overlay">
        <div className="lp-login-bg" />
        <div className="lp-login-bg-overlay" />

        <div className={`lp-login-card ${esError ? 'shake' : ''}`}>
          <div className={`lp-login-icon ${esBloqueado ? 'bloqueado' : ''}`}>
            {esBloqueado ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            )}
          </div>

          <h1 className="lp-login-title">{esBloqueado ? 'Acceso bloqueado' : 'Acceso Restringido'}</h1>
          <p className="lp-login-sub">Información Minera del Estado de Guerrero</p>

          {esBloqueado ? (
            <div className="lp-login-bloqueado">
              <div className="lp-login-bloqueado-tiempo">{formatearTiempo(tiempoBloqueo)}</div>
              <div className="lp-login-bloqueado-texto">
                Se detectaron demasiados intentos fallidos.<br/>Espera antes de intentar de nuevo.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} autoComplete="off">
              <label className="lp-login-label" htmlFor="lp-pwd">Contraseña de acceso</label>
              <div className="lp-login-input-wrap">
                <input
                  ref={inputRef} id="lp-pwd"
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ingresa la contraseña"
                  className={`lp-login-input ${esError ? 'error-state' : ''}`}
                  disabled={esCargando}
                  autoComplete="current-password"
                />
                <button type="button" className="lp-login-eye" onClick={() => setMostrarPassword(v => !v)} tabIndex={-1}>
                  {mostrarPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              {esError && (
                <div className="lp-login-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <div>
                    {mensajeError}
                    {intentosRestantes !== null && intentosRestantes <= 3 && (
                      <div style={{marginTop:4,color:'rgba(252,165,165,0.75)'}}>
                        {intentosRestantes === 0
                          ? 'Próximo intento bloqueará el acceso.'
                          : `${intentosRestantes} intento${intentosRestantes !== 1 ? 's' : ''} restante${intentosRestantes !== 1 ? 's' : ''} antes del bloqueo.`}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button type="submit" className="lp-login-btn" disabled={esCargando || !password.trim()}>
                {esCargando ? (
                  <><div className="lp-login-spinner"/> Verificando...</>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    Ingresar
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </>
  );
}