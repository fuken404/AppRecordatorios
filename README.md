# Recordatorios

App para iOS de recordatorios recurrentes, con categorías y re-aviso si no los completas. Sin cuenta, sin servidor y con los datos en el teléfono.

**Demo web:** [recordatorios.fuken404.dev](https://recordatorios.fuken404.dev). Incluye la app funcionando y una animación de cómo avisa en un iPhone.

> En la demo web los avisos aparecen dentro de la app, porque un navegador no puede enviar notificaciones de iOS. Los datos se quedan en tu navegador.

## Qué hace

- Recurrencia diaria, semanal por días, mensual por día del mes o cada N días.
- Re-aviso a los 15, 30, 60 o 120 minutos si no marcas el recordatorio como hecho.
- Categorías con nombre y color, y filtros por hoy, semana, categoría y completados.
- Notificaciones locales: tocar una abre ese recordatorio, incluso con la app cerrada.
- Avisa si las notificaciones están desactivadas, con acceso directo a Ajustes.

## Decisiones

- **Un plan de avisos que se recalcula entero.** iOS guarda hasta 64 avisos pendientes por app y descarta el resto sin avisar. `planNotifications` calcula todos los avisos, se queda con los 60 más próximos y reemplaza lo programado, así que un recordatorio borrado o editado no conserva avisos viejos.
- **La lógica de fechas y avisos no depende de React Native.** Por eso se prueba sola, sin simulador.
- **Una base de código para iPhone y web.** Lo que cambia entre plataformas va en archivos `.web`: avisos, diálogos y selector de fecha.

## Límite conocido

Los avisos se programan con anticipación y se reponen cuando abres la app. Si tienes muchos recordatorios y no la abres en semanas, se pueden agotar los avisos programados.

## Correr en local

Necesita Node 22.13 o superior.

```bash
npm install
npm run ios      # simulador de iOS
npm run web      # navegador
```

## Pruebas

```bash
npm test
npm run typecheck
```

## Stack

React Native · Expo · TypeScript · expo-notifications · React Navigation · AsyncStorage · date-fns · Vitest · GitHub Actions
