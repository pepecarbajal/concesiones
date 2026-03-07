import React, { useState, useEffect } from 'react';

const GOLD_URL   = 'https://api.gold-api.com/price/XAU';
const SILVER_URL = 'https://api.gold-api.com/price/XAG';

function useLiveMetals() {
  const [prices, setPrices] = useState({ gold: null, silver: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [goldRes, silverRes] = await Promise.all([
          fetch(GOLD_URL),
          fetch(SILVER_URL),
        ]);
        const goldData   = await goldRes.json();
        const silverData = await silverRes.json();
        setPrices({
          gold:   goldData?.price   ?? null,
          silver: silverData?.price ?? null,
        });
      } catch (e) {
        console.error('Error fetching prices:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    const id = setInterval(fetchAll, 5_000);
    return () => clearInterval(id);
  }, []);

  return { prices, loading };
}

function fmt(val) {
  if (!val) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(val);
}

export default function LandingPage({ onEnterMap }) {
  const { prices, loading } = useLiveMetals();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Inter:wght@400;500;600&display=swap');

        .lp { position:relative; width:100vw; height:100vh; overflow:hidden; font-family:'Inter',sans-serif; }

        .lp-bg {
          position:absolute; inset:0;
          background-image: url('https://tse1.mm.bing.net/th/id/OIP.UJgEYHR6WBDHU--StGGH1wHaEK?rs=1&pid=ImgDetMain&o=7&rm=32');
          background-size:cover; background-position:center;
          filter:brightness(0.35);
        }

        .lp-overlay {
          position:absolute; inset:0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%);
        }

        .lp-header {
          position:absolute; top:0; left:0; right:0; z-index:10;
          display:flex; align-items:center; justify-content:flex-end;
          gap:10px;
          padding:20px 32px;
        }

        .lp-btn {
          display:flex; align-items:center; gap:8px;
          padding:10px 20px;
          background:rgba(255,255,255,0.12);
          border:1.5px solid rgba(255,255,255,0.4);
          border-radius:8px;
          color:white; font-family:'Inter',sans-serif;
          font-size:13px; font-weight:600;
          cursor:pointer; backdrop-filter:blur(8px);
          transition:background 0.2s, border-color 0.2s, transform 0.15s;
          white-space:nowrap;
        }
        .lp-btn:hover { transform:translateY(-2px); }

        .lp-btn-concesiones { border-color:rgba(239,68,68,0.5); }
        .lp-btn-concesiones:hover { background:rgba(239,68,68,0.2); border-color:#ef4444; }

        .lp-btn-ordenes { border-color:rgba(255,165,0,0.5); }
        .lp-btn-ordenes:hover { background:rgba(255,165,0,0.2); border-color:#FFA500; }

        .lp-btn-anp { border-color:rgba(74,222,128,0.5); }
        .lp-btn-anp:hover { background:rgba(74,222,128,0.2); border-color:#4ade80; }

        .lp-center {
          position:absolute; inset:0; z-index:5;
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          text-align:center; padding:0 24px; gap:12px;
          color:white;
        }

        .lp-title {
          font-family:'Merriweather',serif; font-weight:600;
          font-size:clamp(2rem,5vw,3.8rem); line-height:1.2;
          color:white; max-width:800px; margin:0;
        }

        .lp-title strong { font-weight:700; color:#f0c060; }

        .lp-divider {
          width:48px; height:2px;
          background:rgba(255,255,255,0.3); margin:8px 0;
        }

        .lp-metals {
          position:absolute; bottom:36px; left:50%; z-index:10;
          transform:translateX(-50%);
          display:flex; gap:12px;
          white-space:nowrap;
        }

        .lp-metal {
          background:rgba(0,0,0,0.25);
          border:1px solid rgba(255,255,255,0.15);
          border-radius:10px; backdrop-filter:blur(12px);
          padding:14px 22px; min-width:200px; text-align:center;
          color:white;
        }

        .lp-metal-name {
          font-size:11px; font-weight:500; letter-spacing:0.15em;
          text-transform:uppercase; color:rgba(255,255,255,0.5);
          margin-bottom:6px;
        }

        .lp-metal-price {
          font-family:'Merriweather',serif; font-size:1.6rem;
          font-weight:300; line-height:1;
        }

        .lp-metal-sub {
          font-size:10px; color:rgba(255,255,255,0.35);
          margin-top:4px; letter-spacing:0.06em;
        }

        .lp-skeleton {
          display:inline-block; width:120px; height:1.4rem;
          background:rgba(255,255,255,0.12); border-radius:4px;
          animation:pulse 1.4s ease infinite;
        }

        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }

        .lp-live {
          position:absolute; top:28px; left:32px; z-index:10;
          display:flex; align-items:center; gap:6px;
          font-size:11px; color:rgba(255,255,255,0.4);
          font-weight:500; letter-spacing:0.08em;
        }
        .lp-live-dot {
          width:6px; height:6px; border-radius:50%; background:#4ade80;
          animation:blink 2s ease infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

        @media(max-width:768px) {
          .lp-metals { flex-direction:column; width:calc(100% - 48px); bottom:24px; white-space:normal; }
          .lp-metal { min-width:unset; }
          .lp-header { padding:14px 16px; gap:6px; flex-wrap:wrap; justify-content:center; }
          .lp-btn { font-size:11px; padding:8px 12px; }
          .lp-live { left:20px; top:18px; }
        }
      `}</style>

      <div className="lp">
        <div className="lp-bg" />
        <div className="lp-overlay" />

        <div className="lp-live">
          <div className="lp-live-dot" />
          EN VIVO
        </div>

        <header className="lp-header">
          <button className="lp-btn lp-btn-concesiones" onClick={() => onEnterMap('concesiones')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>
            Concesiones Mineras
          </button>

          <button className="lp-btn lp-btn-ordenes" onClick={() => onEnterMap('ordenes')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
            Órdenes de Exploración
          </button>

          <button className="lp-btn lp-btn-anp" onClick={() => onEnterMap('areas_naturales')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22V12"/>
              <path d="M12 12C12 12 7 9 7 5a5 5 0 0 1 10 0c0 4-5 7-5 7z"/>
              <path d="M12 12c-1 1-4 3-6 6"/><path d="M12 12c1 1 4 3 6 6"/>
            </svg>
            Áreas Naturales Protegidas
          </button>
        </header>

        <main className="lp-center">
          <h1 className="lp-title">
            Información Minera del<br />
            <strong>Estado de Guerrero</strong>
          </h1>
          <div className="lp-divider" />
        </main>

        <div className="lp-metals">
          <div className="lp-metal">
            <div className="lp-metal-name">Oro · USD / oz</div>
            <div className="lp-metal-price">
              {loading ? <span className="lp-skeleton" /> : fmt(prices.gold)}
            </div>
            <div className="lp-metal-sub"></div>
          </div>
          <div className="lp-metal">
            <div className="lp-metal-name">Plata · USD / oz</div>
            <div className="lp-metal-price">
              {loading ? <span className="lp-skeleton" /> : fmt(prices.silver)}
            </div>
            <div className="lp-metal-sub"></div>
          </div>
        </div>
      </div>
    </>
  );
}