# AppRecordatorios

App de recordatorios para iOS construida con React Native (Expo) y TypeScript. Permite crear recordatorios recurrentes con categorías y recibir notificaciones locales periódicas.

## Características

- Crear, editar y eliminar recordatorios
- Recurrencia: diaria, semanal (por días de la semana), mensual y personalizada (cada N días)
- Re-aviso automático si un recordatorio no se marca como completado (a los 15, 30, 60 o 120 minutos)
- Categorías con nombre y color personalizables
- Filtros en la pantalla principal: todos, hoy, esta semana, por categoría, completados
- Notificaciones locales push (sin servidor)
- Al tocar una notificación, navega directamente al recordatorio
- Datos guardados localmente (sin cuenta, sin nube)

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| React Native | 0.81 | Framework base |
| Expo SDK | 54 | Herramientas y APIs nativas |
| TypeScript | 5.9 | Lenguaje |
| expo-notifications | 0.32 | Notificaciones locales |
| @react-navigation/native-stack | 7 | Navegación entre pantallas |
| @react-native-async-storage | 2.2 | Persistencia local |
| date-fns | 4 | Manejo de fechas y recurrencias |
| @react-native-community/datetimepicker | 8.4 | Selector de fecha/hora nativo de iOS |

## Estructura del proyecto

```
AppRecordatorios/
├── App.tsx                          # Punto de entrada, providers
├── app.json                         # Configuración de Expo
└── src/
    ├── types/
    │   └── index.ts                 # Interfaces: Reminder, Category, RecurrenceRule
    ├── constants/
    │   ├── colors.ts                # Paleta de colores de la app
    │   └── recurrence.ts            # Opciones de recurrencia y re-aviso
    ├── storage/
    │   └── storage.ts               # Lectura/escritura en AsyncStorage
    ├── notifications/
    │   └── notificationService.ts   # Programar, cancelar y reponer notificaciones
    ├── context/
    │   ├── RemindersContext.tsx     # Estado global de recordatorios
    │   └── CategoriesContext.tsx    # Estado global de categorías
    ├── hooks/
    │   └── useNotifications.ts      # Permisos y listener de toque en notificación
    ├── navigation/
    │   └── RootNavigator.tsx        # Definición del stack de pantallas
    ├── screens/
    │   ├── HomeScreen.tsx           # Lista principal con filtros
    │   ├── ReminderFormScreen.tsx   # Crear y editar recordatorio
    │   ├── ReminderDetailScreen.tsx # Detalle de un recordatorio
    │   └── CategoriesScreen.tsx     # Gestión de categorías
    ├── components/
    │   ├── ReminderCard.tsx         # Tarjeta de recordatorio en la lista
    │   ├── CategoryBadge.tsx        # Etiqueta de categoría con color
    │   ├── EmptyState.tsx           # Pantalla vacía
    │   └── FAB.tsx                  # Botón flotante de acción
    └── utils/
        └── dateHelpers.ts           # Cálculo de fechas, recurrencias y formato
```

## Modelo de datos

```typescript
interface Reminder {
  id: string;
  title: string;
  notes?: string;
  categoryId: string | null;
  dueDate: string;                    // ISO 8601
  recurrence: RecurrenceRule;
  status: 'pending' | 'completed' | 'snoozed';
  scheduledNotificationIds: string[];
  repeatIfNotCompleted: boolean;
  repeatIntervalMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

interface RecurrenceRule {
  frequency: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  daysOfWeek?: number[];   // 0=Dom ... 6=Sáb
  dayOfMonth?: number;
  intervalDays?: number;
}

interface Category {
  id: string;
  name: string;
  color: string;           // hex
  createdAt: string;
}
```

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior
- Aplicación **Expo Go** instalada en el iPhone (para desarrollo)
- Para build de producción: cuenta de Apple Developer y [EAS CLI](https://docs.expo.dev/build/introduction/)

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd AppRecordatorios

# Instalar dependencias
npm install
```

## Desarrollo

```bash
npm start
```

Escanea el código QR con la cámara del iPhone. Expo Go abrirá la app automáticamente.

> Las notificaciones locales solo funcionan en el dispositivo físico, no en el simulador de iOS.

## Build de producción (iOS)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Iniciar sesión en Expo
eas login

# Configurar el proyecto
eas build:configure

# Build para iOS
eas build --platform ios
```

## Notas sobre notificaciones

- iOS permite un máximo de 64 notificaciones locales programadas por app.
- La app programa hasta 10 ocurrencias futuras por recordatorio recurrente.
- Cada vez que la app pasa a primer plano, repone automáticamente las notificaciones de recordatorios recurrentes con pocas ocurrencias restantes.
- Los re-avisos se programan como notificaciones separadas (máximo 2 por ocurrencia).

## Categorías por defecto

Al iniciar la app por primera vez se crean tres categorías:

| Nombre | Color |
|---|---|
| Personal | Azul |
| Trabajo | Rojo |
| Salud | Verde |
