import React, { useEffect, useRef, useState } from 'react';
import { DemoNotification, onDemoNotification, openDemoNotification } from './demoBus';

const NOTIFICATION_MS = 7000;

const CAPTIONS = [
  'Llega el aviso, con la app cerrada y el teléfono bloqueado.',
  '¿No lo marcaste? Te avisa otra vez, en el intervalo que elegiste.',
  'Al tocar el aviso se abre ese recordatorio.',
  'Lo marcas como hecho y se programa el siguiente.',
];

function IphoneAnimation() {
  return (
    <figure className="sim" aria-label="Animación ilustrativa de los avisos en un iPhone">
      <div className="sim-phone" aria-hidden="true">
        <div className="sim-island" />
        <div className="sim-lock">
          <p className="sim-date">martes 3 de noviembre</p>
          <p className="sim-time">9:41</p>
          <div className="sim-note sim-note--first">
            <span className="sim-icon" />
            <span className="sim-copy">
              <b>Pagar el arriendo</b>
              <small>Toca para ver el recordatorio</small>
            </span>
            <em>ahora</em>
          </div>
          <div className="sim-note sim-note--nag">
            <span className="sim-icon" />
            <span className="sim-copy">
              <b>⏰ Pendiente: Pagar el arriendo</b>
              <small>Toca para ver el recordatorio</small>
            </span>
            <em>ahora</em>
          </div>
          <span className="sim-tap sim-tap--note" />
        </div>
        <div className="sim-app">
          <p className="sim-app-bar">Detalle</p>
          <div className="sim-card">
            <span className="sim-pill">↻ Mensual</span>
            <b>Pagar el arriendo</b>
            <small>3 nov 2026, 09:41</small>
          </div>
          <div className="sim-button">
            <span className="sim-button-idle">✓ Marcar como hecho</span>
            <span className="sim-button-done">¡Hecho! Próximo: 3 dic</span>
          </div>
          <span className="sim-tap sim-tap--done" />
        </div>
      </div>
      <figcaption>
        <ol className="sim-captions">
          {CAPTIONS.map((caption, index) => (
            <li key={caption} className={`sim-caption sim-caption--${index + 1}`}>{caption}</li>
          ))}
        </ol>
        <p className="sim-label">Animación ilustrativa, no es una grabación.</p>
      </figcaption>
    </figure>
  );
}

function Toast() {
  const [notification, setNotification] = useState<DemoNotification | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onDemoNotification((next) => {
      setNotification(next);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setNotification(null), NOTIFICATION_MS);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer.current);
    };
  }, []);

  if (!notification) return null;
  return (
    <button
      type="button"
      className="toast"
      role="status"
      onClick={() => {
        openDemoNotification(notification.reminderId);
        setNotification(null);
      }}
    >
      <span className="sim-icon" aria-hidden="true" />
      <span className="sim-copy">
        <b>{notification.title}</b>
        <small>{notification.body ?? 'Toca para ver el recordatorio'}</small>
      </span>
    </button>
  );
}

export function DemoShell({ children }: { children: React.ReactNode }) {
  const [animationOpen, setAnimationOpen] = useState(false);

  return (
    <div className="demo">
      <style>{CSS}</style>

      <aside className="demo-intro">
        <p className="demo-kicker">Demo web · App para iOS</p>
        <h1>Recordatorios que insisten hasta que los haces.</h1>
        <p className="demo-lead">
          Recurrentes, con categorías y re-aviso si no los completas. Sin cuenta y sin servidor.
        </p>
        <p className="demo-note">
          En esta demo los avisos aparecen dentro de la app y los datos se quedan en tu navegador. En el
          iPhone son notificaciones reales de iOS.
        </p>
        <button type="button" className="demo-open" onClick={() => setAnimationOpen(true)}>
          Ver cómo avisa en iPhone
        </button>
        <p className="demo-links">
          <a href="https://github.com/fuken404/AppRecordatorios">Código fuente</a>
          <span>Hecho por <a href="https://fuken404.dev">Maycol Fuquene</a></span>
        </p>
      </aside>

      <section className="demo-animation" aria-label="Cómo avisa en un iPhone">
        <IphoneAnimation />
      </section>

      <main className="demo-stage">
        <div className="demo-bar">
          <p>Demo web: los avisos se ven dentro de la app.</p>
          <button type="button" onClick={() => setAnimationOpen(true)}>Ver en iPhone</button>
        </div>
        <div className="demo-frame">
          <Toast />
          <div className="demo-app">{children}</div>
        </div>
      </main>

      {animationOpen && (
        <div className="demo-dialog" role="dialog" aria-modal="true" aria-label="Cómo avisa en un iPhone">
          <button type="button" className="demo-close" autoFocus onClick={() => setAnimationOpen(false)}>Cerrar</button>
          <IphoneAnimation />
        </div>
      )}
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Fraunces:opsz,wght@9..144,500;9..144,700&display=swap');
html, body, #root { height: 100%; margin: 0; background: #0a4246; }
body { overflow: hidden; }
.demo, .demo * { box-sizing: border-box; }

/* Computador: texto y app, con la animación disponible en un botón. */
.demo {
  --app-h: min(calc(100dvh - 40px), 844px);
  display: grid;
  grid-template-columns: minmax(280px, 460px) minmax(360px, 400px);
  grid-template-areas: 'intro stage';
  justify-content: center;
  align-items: center;
  gap: clamp(32px, 6vw, 88px);
  height: 100dvh;
  padding: 20px clamp(24px, 4vw, 56px);
  color: #faf6ee;
  font-family: 'Atkinson Hyperlegible', system-ui, sans-serif;
}
.demo-intro { grid-area: intro; max-height: var(--app-h); overflow-y: auto; }
.demo-kicker { margin: 0 0 10px; color: #f2a900; font-size: .82rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.demo-intro h1 { margin: 0 0 14px; font: 700 clamp(1.9rem, 3vw, 3rem)/1.06 Fraunces, Georgia, serif; }
.demo-lead { margin: 0 0 10px; font-size: 1.05rem; line-height: 1.4; }
.demo-note { margin: 0 0 20px; color: #c9dcdb; font-size: .9rem; line-height: 1.4; }
.demo-open { min-height: 46px; padding: 0 18px; border: 2px solid #f2a900; border-radius: 10px; background: none; color: #faf6ee; font: 700 .95rem 'Atkinson Hyperlegible', system-ui, sans-serif; cursor: pointer; }
.demo-open:hover { background: rgb(242 169 0 / .15); }
.demo-links { display: flex; flex-wrap: wrap; gap: 6px 22px; margin: 20px 0 0; font-size: .88rem; }
.demo-links a { color: inherit; }
.demo-animation { display: none; grid-area: animation; }
.demo-stage { grid-area: stage; display: flex; flex-direction: column; height: var(--app-h); }
.demo-bar { display: none; }
.demo-frame { position: relative; flex: 1; min-height: 0; overflow: hidden; border: 8px solid #06272a; border-radius: 40px; background: #faf6ee; }
.demo-app { position: absolute; z-index: 0; inset: 0; display: flex; } /* su propio contexto, para que el aviso quede encima */
.demo-app > * { flex: 1; }

/* Pantalla amplia: texto, animación y app, uno al lado del otro. */
@media (min-width: 1240px) and (min-height: 640px) {
  .demo {
    grid-template-columns: minmax(280px, 420px) auto minmax(370px, 400px);
    grid-template-areas: 'intro animation stage';
    gap: clamp(32px, 4vw, 72px);
  }
  .demo-open { display: none; }
  .demo-animation { display: block; }
}

.demo-dialog { position: fixed; z-index: 50; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: calc(12px + env(safe-area-inset-top, 0px)) 16px 16px; overflow-y: auto; background: #0a4246; }
.demo-close { position: absolute; top: calc(12px + env(safe-area-inset-top, 0px)); right: 16px; z-index: 1; min-height: 44px; padding: 0 14px; border: 2px solid #faf6ee; border-radius: 10px; background: none; color: #faf6ee; font: 700 .95rem 'Atkinson Hyperlegible', system-ui, sans-serif; cursor: pointer; }

.toast { position: absolute; z-index: 20; top: 10px; left: 10px; right: 10px; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 0; border-radius: 16px; background: rgb(255 253 248 / .97); color: #1d2528; box-shadow: 0 8px 24px rgb(10 66 70 / .35); font: inherit; text-align: left; cursor: pointer; animation: toast-in .3s ease both; }
.toast .sim-icon { width: 34px; height: 34px; border-radius: 8px; }
.toast .sim-copy b { display: block; font-size: 14px; line-height: 1.25; }
.toast .sim-copy small { display: block; color: #5c686b; font-size: 12px; line-height: 1.3; }
@keyframes toast-in { from { opacity: 0; transform: translateY(-24px); } }

/* El iPhone animado: todas sus medidas parten de --u, así escala completo sin desbordarse. */
.sim { --phone-h: min(calc(100dvh - 170px), 600px); --u: calc(var(--phone-h) / 390); display: flex; flex-direction: column; align-items: center; gap: 14px; width: calc(var(--u) * 250); max-width: 100%; margin: 0; }
.sim-phone { position: relative; flex: none; width: calc(var(--u) * 190); height: var(--phone-h); overflow: hidden; border: calc(var(--u) * 7) solid #06272a; border-radius: calc(var(--u) * 34); background: #0e5a5f; color: #fff; --cycle: 16s; }
.sim-island { position: absolute; z-index: 5; top: calc(var(--u) * 7); left: 50%; width: calc(var(--u) * 60); height: calc(var(--u) * 16); margin-left: calc(var(--u) * -30); border-radius: calc(var(--u) * 10); background: #06272a; }
.sim-lock { position: absolute; inset: 0; padding: calc(var(--u) * 40) calc(var(--u) * 8) calc(var(--u) * 8); text-align: center; background: linear-gradient(170deg, #17767c, #0a4246); animation: sim-lock var(--cycle) infinite; }
.sim-date { margin: 0; font-size: calc(var(--u) * 11); }
.sim-time { margin: 0 0 calc(var(--u) * 14); font: 700 calc(var(--u) * 46)/1.05 Fraunces, Georgia, serif; }
.sim-note { position: absolute; left: calc(var(--u) * 8); right: calc(var(--u) * 8); display: flex; align-items: center; gap: calc(var(--u) * 6); padding: calc(var(--u) * 7); border-radius: calc(var(--u) * 12); background: rgb(255 253 248 / .95); color: #1d2528; text-align: left; opacity: 0; }
.sim-note em { align-self: flex-start; color: #5c686b; font-size: calc(var(--u) * 8); font-style: normal; }
.sim-note--first { top: calc(var(--u) * 118); animation: sim-first var(--cycle) infinite; }
.sim-note--nag { top: calc(var(--u) * 118); animation: sim-nag var(--cycle) infinite; }
.sim-icon { flex: none; width: calc(var(--u) * 24); height: calc(var(--u) * 24); border-radius: calc(var(--u) * 6); background: #f2a900; }
.sim-copy { flex: 1; min-width: 0; }
.sim-copy b { display: block; font-size: calc(var(--u) * 10.5); line-height: 1.2; }
.sim-copy small { display: block; color: #5c686b; font-size: calc(var(--u) * 9); line-height: 1.25; }
.sim-tap { position: absolute; width: calc(var(--u) * 26); height: calc(var(--u) * 26); border: calc(var(--u) * 2.5) solid #fff; border-radius: 50%; background: rgb(242 169 0 / .6); opacity: 0; }
.sim-tap--note { top: calc(var(--u) * 134); right: calc(var(--u) * 16); animation: sim-tap-note var(--cycle) infinite; }
.sim-app { position: absolute; inset: 0; padding: calc(var(--u) * 34) calc(var(--u) * 10) calc(var(--u) * 10); background: #faf6ee; color: #1d2528; opacity: 0; animation: sim-app var(--cycle) infinite; }
.sim-app-bar { margin: 0 0 calc(var(--u) * 10); color: #0e5a5f; font-size: calc(var(--u) * 12); font-weight: 700; text-align: center; }
.sim-card { display: grid; gap: calc(var(--u) * 3); padding: calc(var(--u) * 11); border: 1px solid #e3dccd; border-radius: calc(var(--u) * 12); background: #fffdf8; }
.sim-card b { font-size: calc(var(--u) * 13); }
.sim-card small { color: #5c686b; font-size: calc(var(--u) * 10); }
.sim-pill { justify-self: start; padding: calc(var(--u) * 1) calc(var(--u) * 7); border-radius: calc(var(--u) * 9); background: #e5eeed; color: #0e5a5f; font-size: calc(var(--u) * 9); }
.sim-button { position: relative; height: calc(var(--u) * 38); margin-top: calc(var(--u) * 12); overflow: hidden; border-radius: calc(var(--u) * 11); background: #0e5a5f; color: #fff; font-size: calc(var(--u) * 11); font-weight: 700; animation: sim-button var(--cycle) infinite; }
.sim-button span { position: absolute; inset: 0; display: grid; place-items: center; }
.sim-button-done { opacity: 0; animation: sim-done var(--cycle) infinite; }
.sim-button-idle { animation: sim-idle var(--cycle) infinite; }
.sim-tap--done { top: calc(var(--u) * 150); left: calc(var(--u) * 74); animation: sim-tap-done var(--cycle) infinite; }
.sim figcaption { width: 100%; min-width: 0; text-align: center; }
.sim-captions { position: relative; height: 4.1em; margin: 0; padding: 0; font-size: 1rem; list-style: none; }
.sim-caption { position: absolute; inset: 0; font: 500 1rem/1.3 Fraunces, Georgia, serif; opacity: 0; animation: 16s infinite; }
.sim-caption--1 { animation-name: cap1; }
.sim-caption--2 { animation-name: cap2; }
.sim-caption--3 { animation-name: cap3; }
.sim-caption--4 { animation-name: cap4; }
.sim-label { margin: 4px 0 0; color: #c9dcdb; font-size: .76rem; }

@keyframes sim-lock { 0%, 54% { opacity: 1; } 58%, 97% { opacity: 0; } 100% { opacity: 1; } }
@keyframes sim-first { 0%, 7% { opacity: 0; transform: translateY(-16%); } 10%, 28% { opacity: 1; transform: none; } 34%, 100% { opacity: 1; transform: translateY(calc(var(--u) * 80)) scale(.96); } }
@keyframes sim-nag { 0%, 30% { opacity: 0; transform: translateY(-16%); } 34%, 54% { opacity: 1; transform: none; } 58%, 100% { opacity: 0; } }
@keyframes sim-tap-note { 0%, 45% { opacity: 0; transform: scale(1.3); } 49%, 52% { opacity: 1; transform: scale(.85); } 55%, 100% { opacity: 0; } }
@keyframes sim-app { 0%, 54% { opacity: 0; } 58%, 96% { opacity: 1; } 100% { opacity: 0; } }
@keyframes sim-tap-done { 0%, 69% { opacity: 0; transform: scale(1.3); } 72%, 75% { opacity: 1; transform: scale(.85); } 78%, 100% { opacity: 0; } }
@keyframes sim-button { 0%, 74% { background: #0e5a5f; } 77%, 100% { background: #2b7a4b; } }
@keyframes sim-idle { 0%, 74% { opacity: 1; } 77%, 100% { opacity: 0; } }
@keyframes sim-done { 0%, 74% { opacity: 0; } 77%, 100% { opacity: 1; } }
@keyframes cap1 { 0%, 7% { opacity: 0; } 10%, 28% { opacity: 1; } 31%, 100% { opacity: 0; } }
@keyframes cap2 { 0%, 30% { opacity: 0; } 33%, 45% { opacity: 1; } 47%, 100% { opacity: 0; } }
@keyframes cap3 { 0%, 46% { opacity: 0; } 49%, 66% { opacity: 1; } 69%, 100% { opacity: 0; } }
@keyframes cap4 { 0%, 68% { opacity: 0; } 72%, 95% { opacity: 1; } 98%, 100% { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .sim-phone *, .sim-caption, .toast { animation: none !important; }
  .sim-note--nag, .sim-tap, .sim-app { display: none; }
  .sim-note--first { opacity: 1; }
  .sim-captions { height: auto; }
  .sim-caption { position: static; margin-bottom: 6px; opacity: 1; }
}

/* Celular: la app ocupa toda la pantalla. */
@media (max-width: 899px) {
  .demo { display: block; height: 100dvh; padding: 0; }
  .demo-intro, .demo-animation { display: none; }
  .demo-stage { height: 100dvh; }
  .demo-bar { display: flex; flex: none; align-items: center; justify-content: space-between; gap: 10px; padding: calc(8px + env(safe-area-inset-top, 0px)) 14px 8px; }
  .demo-bar p { margin: 0; font-size: .86rem; line-height: 1.2; }
  .demo-bar button { flex: none; min-height: 44px; padding: 0 12px; border: 2px solid #f2a900; border-radius: 10px; background: none; color: #faf6ee; font: 700 .9rem 'Atkinson Hyperlegible', system-ui, sans-serif; cursor: pointer; }
  .demo-frame { border: 0; border-radius: 0; }
  .demo-dialog { justify-content: flex-start; padding-top: calc(64px + env(safe-area-inset-top, 0px)); }
  .demo-dialog .sim { --phone-h: min(calc(100dvh - 230px), 560px); }
}
`;
