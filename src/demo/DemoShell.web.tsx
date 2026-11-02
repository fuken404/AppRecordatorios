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
        <div className="demo-animation"><IphoneAnimation /></div>
        <p className="demo-links">
          <a href="https://github.com/fuken404/AppRecordatorios">Código fuente</a>
          <span>Hecho por <a href="https://fuken404.dev">Maycol Fuquene</a></span>
        </p>
      </aside>

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
.demo { display: grid; grid-template-columns: minmax(0, 1fr) minmax(390px, 440px); gap: 40px; height: 100dvh; padding: 28px clamp(24px, 4vw, 64px); color: #faf6ee; font-family: 'Atkinson Hyperlegible', system-ui, sans-serif; }
.demo-intro { display: flex; flex-direction: column; min-height: 0; overflow-y: auto; }
.demo-kicker { margin: 0 0 8px; color: #f2a900; font-size: .85rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.demo-intro h1 { margin: 0 0 10px; max-width: 18ch; font: 700 clamp(2rem, 3.4vw, 3.1rem)/1.05 Fraunces, Georgia, serif; }
.demo-lead { margin: 0 0 8px; max-width: 46ch; font-size: 1.08rem; line-height: 1.4; }
.demo-note { margin: 0 0 18px; max-width: 52ch; color: #c9dcdb; font-size: .92rem; line-height: 1.4; }
.demo-animation { flex: 1; min-height: 340px; }
.demo-links { display: flex; flex-wrap: wrap; gap: 6px 22px; margin: 14px 0 0; font-size: .9rem; }
.demo-links a { color: inherit; }
.demo-stage { display: flex; flex-direction: column; min-height: 0; }
.demo-bar { display: none; }
.demo-frame { position: relative; flex: 1; min-height: 0; overflow: hidden; border: 8px solid #06272a; border-radius: 42px; background: #faf6ee; }
.demo-app { position: absolute; z-index: 0; inset: 0; display: flex; } /* su propio contexto, para que el aviso quede encima */
.demo-app > * { flex: 1; }

.toast { position: absolute; z-index: 20; top: 10px; left: 10px; right: 10px; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 0; border-radius: 16px; background: rgb(255 253 248 / .97); color: #1d2528; box-shadow: 0 8px 24px rgb(10 66 70 / .35); font: inherit; text-align: left; cursor: pointer; animation: toast-in .3s ease both; }
@keyframes toast-in { from { opacity: 0; transform: translateY(-24px); } }

.sim { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 28px; height: 100%; margin: 0; }
.sim-phone { position: relative; flex: none; width: 190px; height: 390px; overflow: hidden; border: 7px solid #06272a; border-radius: 34px; background: #0e5a5f; color: #fff; --cycle: 16s; }
.sim-island { position: absolute; z-index: 5; top: 7px; left: 50%; width: 60px; height: 16px; margin-left: -30px; border-radius: 10px; background: #06272a; }
.sim-lock { position: absolute; inset: 0; padding: 40px 8px 8px; text-align: center; background: linear-gradient(170deg, #17767c, #0a4246); animation: sim-lock var(--cycle) infinite; }
.sim-date { margin: 0; font-size: 11px; }
.sim-time { margin: 0 0 14px; font: 700 46px/1.05 Fraunces, Georgia, serif; }
.sim-note { position: absolute; left: 8px; right: 8px; display: flex; align-items: center; gap: 6px; padding: 7px; border-radius: 12px; background: rgb(255 253 248 / .95); color: #1d2528; text-align: left; opacity: 0; }
.sim-note em { align-self: flex-start; color: #5c686b; font-size: 8px; font-style: normal; }
.sim-note--first { top: 118px; animation: sim-first var(--cycle) infinite; }
.sim-note--nag { top: 118px; animation: sim-nag var(--cycle) infinite; }
.sim-icon { flex: none; width: 24px; height: 24px; border-radius: 6px; background: #f2a900; }
.sim-copy { flex: 1; min-width: 0; }
.sim-copy b { display: block; font-size: 10.5px; line-height: 1.2; }
.toast .sim-copy b { font-size: 14px; }
.sim-copy small { display: block; color: #5c686b; font-size: 9px; line-height: 1.25; }
.toast .sim-copy small { font-size: 12px; }
.sim-tap { position: absolute; width: 30px; height: 30px; border: 3px solid #fff; border-radius: 50%; background: rgb(242 169 0 / .75); opacity: 0; }
.sim-tap--note { top: 130px; left: 78px; animation: sim-tap-note var(--cycle) infinite; }
.sim-app { position: absolute; inset: 0; padding: 34px 10px 10px; background: #faf6ee; color: #1d2528; opacity: 0; animation: sim-app var(--cycle) infinite; }
.sim-app-bar { margin: 0 0 10px; color: #0e5a5f; font-size: 12px; font-weight: 700; text-align: center; }
.sim-card { display: grid; gap: 3px; padding: 11px; border: 1px solid #e3dccd; border-radius: 12px; background: #fffdf8; }
.sim-card b { font-size: 13px; }
.sim-card small { color: #5c686b; font-size: 10px; }
.sim-pill { justify-self: start; padding: 1px 7px; border-radius: 9px; background: #e5eeed; color: #0e5a5f; font-size: 9px; }
.sim-button { position: relative; height: 38px; margin-top: 12px; overflow: hidden; border-radius: 11px; background: #0e5a5f; color: #fff; font-size: 11px; font-weight: 700; animation: sim-button var(--cycle) infinite; }
.sim-button span { position: absolute; inset: 0; display: grid; place-items: center; }
.sim-button-done { opacity: 0; animation: sim-done var(--cycle) infinite; }
.sim-button-idle { animation: sim-idle var(--cycle) infinite; }
.sim-tap--done { top: 150px; left: 74px; animation: sim-tap-done var(--cycle) infinite; }
figcaption { min-width: 0; }
.sim-captions { position: relative; min-height: 5.4em; margin: 0; padding: 0; list-style: none; }
.sim-caption { position: absolute; inset: 0; font: 500 clamp(1.05rem, 1.7vw, 1.4rem)/1.25 Fraunces, Georgia, serif; opacity: 0; animation: var(--cycle, 16s) infinite; }
.sim-caption--1 { animation-name: cap1; }
.sim-caption--2 { animation-name: cap2; }
.sim-caption--3 { animation-name: cap3; }
.sim-caption--4 { animation-name: cap4; }
.sim-label { margin: 8px 0 0; color: #c9dcdb; font-size: .82rem; }

@keyframes sim-lock { 0%, 54% { opacity: 1; } 58%, 97% { opacity: 0; } 100% { opacity: 1; } }
@keyframes sim-first { 0%, 7% { opacity: 0; transform: translateY(-16px); } 10%, 28% { opacity: 1; transform: none; } 34%, 100% { opacity: 1; transform: translateY(66px) scale(.96); } }
@keyframes sim-nag { 0%, 30% { opacity: 0; transform: translateY(-16px); } 34%, 54% { opacity: 1; transform: none; } 58%, 100% { opacity: 0; } }
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
  .sim-captions { min-height: 0; }
  .sim-caption { position: static; margin-bottom: 8px; opacity: 1; font-size: 1rem; }
}

@media (max-width: 899px) {
  .demo { display: block; height: 100dvh; padding: 0; }
  .demo-intro { display: none; }
  .demo-stage { height: 100dvh; }
  .demo-bar { display: flex; flex: none; align-items: center; justify-content: space-between; gap: 10px; padding: calc(8px + env(safe-area-inset-top, 0px)) 14px 8px; }
  .demo-bar p { margin: 0; font-size: .86rem; line-height: 1.2; }
  .demo-bar button { flex: none; min-height: 44px; padding: 0 12px; border: 2px solid #f2a900; border-radius: 10px; background: none; color: #faf6ee; font: 700 .9rem 'Atkinson Hyperlegible', system-ui, sans-serif; cursor: pointer; }
  .demo-frame { border: 0; border-radius: 0; }
  .demo-dialog { position: fixed; z-index: 50; inset: 0; display: flex; flex-direction: column; align-items: center; gap: 12px; padding: calc(12px + env(safe-area-inset-top, 0px)) 16px 16px; overflow-y: auto; background: #0a4246; }
  .demo-close { align-self: flex-end; min-height: 44px; padding: 0 14px; border: 2px solid #faf6ee; border-radius: 10px; background: none; color: #faf6ee; font: 700 .95rem 'Atkinson Hyperlegible', system-ui, sans-serif; }
  .demo-dialog .sim { grid-template-columns: minmax(0, 1fr); justify-items: center; height: auto; gap: 14px; text-align: center; }
  .demo-dialog .sim-captions { min-height: 4.2em; width: min(320px, 100%); }
}
`;
