# regular-calendar 📅

A generic, high-performance facility schedule management component for React.
Designed to be domain-agnostic, customizable, and easy to integrate with any backend.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

## Features 🚀

- **Generic & Domain-Agnostic**: Manage generic "Resources" (beds, rooms, machines) and "Events". No baked-in business logic.
- **Multiple Views**: Seamlessly switch between **Day**, **Week**, and **Month** views.
- **Interactive Scheduling**: 
  - Drag & Drop support (powered by `@dnd-kit`).
  - Resizable events.
  - One-click slot creation.
- **Performance**: Virtualized rendering for handling large numbers of resources.
- **Customizable**: Inject your own Event Modal or use the built-in simplified form.
- **Zero External Styles**: Uses locally scoped generic UI components for maximum portability.

## Installation 📦

```bash
pnpm install regular-calendar
```

### Peer Dependencies
Ensure you have the following installed:

```bash
pnpm install react react-dom date-fns
```

## Quick Start 🏃‍♂️

1. **Import the component and styles**:

```tsx
import { FacilitySchedule } from 'regular-calendar';
import 'regular-calendar/dist/style.css'; 
```

2. **Render the schedule**:

```tsx
import { useState } from 'react';
import { FacilitySchedule } from 'regular-calendar';
import 'regular-calendar/dist/style.css';

function App() {
  const [events, setEvents] = useState([
    {
      id: 'e1',
      resourceId: 'r1',
      title: 'Meeting',
      startDate: new Date('2024-01-01T09:00:00'),
      endDate: new Date('2024-01-01T10:00:00'),
      color: '#3b82f6'
    }
  ]);

  const resources = [
    { id: 'r1', name: 'Room A', groupId: 'g1', order: 1 }
  ];

  const groups = [
    { id: 'g1', name: 'Conference Center' }
  ];

  return (
    <div style={{ height: '100vh' }}>
      <FacilitySchedule
        events={events}
        resources={resources}
        groups={groups}
        settings={{
            weekStartsOn: 1, // Monday
            startTime: '08:00',
            endTime: '18:00',
            defaultDuration: 60,
            closedDays: [0], // Sunday
        }}
        onEventCreate={(data) => console.log('Create:', data)}
        onEventUpdate={(id, data) => console.log('Update:', id, data)}
      />
    </div>
  );
}
```

## API Reference 📚

### `FacilitySchedule` Props

| Prop | Type | Description |
|------|------|-------------|
| `events` | `ScheduleEvent[]` | Array of event objects to display. |
| `resources` | `Resource[]` | Array of resources (rows/columns). |
| `groups` | `ResourceGroup[]` | Optional grouping for resources. |
| `settings` | `FacilityScheduleSettings` | Configuration for time ranges, grid size, etc. |
| `isLoading` | `boolean` | Shows a loading state if true. |
| `components` | `{ EventModal?: React.ComponentType }` | Inject custom components (e.g. your own Event creation modal). |

### Callbacks

| Callback | Signature | Description |
|----------|-----------|-------------|
| `onEventCreate` | `(data: EventFormData) => void` | Called when a new event is saved. |
| `onEventUpdate` | `(id: string, data: EventFormData) => void` | Called when an existing event is edited. |
| `onEventDelete` | `(id: string) => void` | Called when an event is deleted. |
| `onEventClick` | `(event: ScheduleEvent) => void` | Called when an event bar is clicked. |
| `onDateChange` | `(date: Date) => void` | Called when the current view date changes. |

### Data Types

**ScheduleEvent**
```typescript
interface ScheduleEvent {
  id: string;
  resourceId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color?: string;
  // ... other optional fields
}
```

**Resource**
```typescript
interface Resource {
  id: string;
  name: string;
  groupId: string;
  order: number;
}
```

## Full Stack Example 🏗️

Check out the `examples/` directory for a complete Full-Stack implementation using **Bun**, **Hono**, **SQLite**, and **React**.

- **Backend**: `examples/backend` (Bun + Hono + SQLite + Drizzle ORM)
- **Frontend**: `examples/frontend` (React Component with data fetching)

See [Walkthrough](./examples/README.md) (or simply explore the folder) for details on how to run it.

## Customization 🎨

### Custom Modal
You can replace the default event creation modal with your own by passing a component to the `components` prop.

```tsx
<FacilitySchedule
  // ...
  components={{
    EventModal: MyCustomModal
  }}
/>
```

## Development & Contributing 🛠️

```bash
# Install dependencies
pnpm install

# Run development server (Vite)
pnpm run dev

# Run tests (Vitest)
pnpm test

# Type Checking
pnpm run type-check
```

## License

MIT
