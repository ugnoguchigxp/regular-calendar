/**
 * @feature Facility Schedule Management
 * @description A generic drag-and-drop schedule management component for facilities and resources.
 * Supports Day, Week, and Month views.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { DateDisplay as DateFormat } from '@/components/ui/DateDisplay';
import { Icons } from '@/components/ui/Icons';
import { useMemo, useState } from 'react';
import type {
  FacilityScheduleSettings,
  Resource,
  ResourceGroup,
  ScheduleEvent,
  ViewMode,
} from './FacilitySchedule.schema';

import { type EventFormData } from './components/EventModal/EventForm';
import { EventModal } from './components/EventModal/EventModal';
import { DayView } from './components/DayView/DayView';
import { MonthView } from './components/MonthView/MonthView';
import { ViewSelector } from '@/components/ui/ViewSelector';
import { WeekView } from './components/WeekView/WeekView';

export interface FacilityScheduleProps {
  // Data
  events: ScheduleEvent[];
  resources: Resource[];
  groups: ResourceGroup[];
  settings: FacilityScheduleSettings;

  // State (controlled)
  currentDate?: Date;
  viewMode?: ViewMode;
  selectedGroupId?: string | null;

  // Actions
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: ViewMode) => void;
  onGroupChange?: (groupId: string | null) => void;

  // CRUD Actions
  onEventCreate?: (data: EventFormData) => void;
  onEventUpdate?: (id: string, data: EventFormData) => void;
  onEventDelete?: (eventId: string) => void;

  // Customization
  isLoading?: boolean;
  className?: string;
  hideGroupSelector?: boolean;

  /**
   * Custom components to override default internal components.
   */
  components?: {
    EventModal?: React.ComponentType<any>;
  };

  // Custom header slots
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function FacilitySchedule({
  events,
  resources,
  groups,
  settings,
  currentDate: propCurrentDate,
  viewMode: propViewMode,
  selectedGroupId: propSelectedGroupId,
  onDateChange,
  onViewChange,
  onGroupChange,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  isLoading = false,
  className,
  hideGroupSelector = false,
  components,
  headerLeft,
  headerRight,
}: FacilityScheduleProps) {

  // Internal State
  const [internalDate, setInternalDate] = useState(new Date());
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('day');
  const [internalSelectedGroupId, setInternalSelectedGroupId] = useState<string | null>(null);

  // Derived State
  const currentDate = propCurrentDate ?? internalDate;
  const viewMode = propViewMode ?? internalViewMode;
  const selectedGroupId = propSelectedGroupId !== undefined ? propSelectedGroupId : internalSelectedGroupId;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | undefined>(undefined);
  // Default values for new event
  const [newInfo, setNewInfo] = useState<{ resourceId?: string; startTime?: Date }>({});

  // Helpers
  const handleDateNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }

    if (onDateChange) onDateChange(newDate);
    else setInternalDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    if (onDateChange) onDateChange(today);
    else setInternalDate(today);
  };

  const handleViewChange = (mode: ViewMode) => {
    if (onViewChange) onViewChange(mode);
    else setInternalViewMode(mode);
  };

  const handleGroupChange = (groupId: string | null) => {
    if (onGroupChange) onGroupChange(groupId);
    else setInternalSelectedGroupId(groupId);
  };

  // Event Handlers
  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setNewInfo({});
    setIsModalOpen(true);
  };

  const handleEmptySlotClick = (resourceId: string | null, startTime: Date) => {
    setSelectedEvent(undefined);
    setNewInfo({ resourceId: resourceId || undefined, startTime });
    setIsModalOpen(true);
  };

  const handleDayClick = (date: Date) => {
    // Switch to day view for that day
    if (onDateChange) onDateChange(date);
    else setInternalDate(date);

    if (onViewChange) onViewChange('day');
    else setInternalViewMode('day');
  };

  const handleModalSave = (data: EventFormData) => {
    if (selectedEvent) {
      onEventUpdate?.(selectedEvent.id, data);
    } else {
      onEventCreate?.(data);
    }
    setIsModalOpen(false);
  };

  const handleModalDelete = (eventId: string) => {
    onEventDelete?.(eventId);
    setIsModalOpen(false); // Modal usually closes itself via props but just in case
  };

  // Filter Logic
  const effectiveGroupId = useMemo(
    () => selectedGroupId ?? groups[0]?.id ?? null,
    [selectedGroupId, groups]
  );

  const filteredResources = useMemo(() => {
    return effectiveGroupId
      ? resources.filter((r) => r.groupId === effectiveGroupId)
      : resources;
  }, [resources, effectiveGroupId]);

  const filteredEvents = useMemo(() => {
    return effectiveGroupId
      ? events.filter((e) => e.groupId === effectiveGroupId)
      : events;
  }, [events, effectiveGroupId]);

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleDateNavigate('prev')}>
            <Icons.ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleDateNavigate('next')}>
            <Icons.ChevronRight className="h-4 w-4" />
          </Button>

          <span className="text-lg font-bold ml-2">
            <DateFormat date={currentDate} showSecondary showDayOfWeek />
          </span>
          {headerLeft}
        </div>

        <div className="flex items-center gap-4">
          {!hideGroupSelector && (
            <Select
              value={effectiveGroupId ?? undefined}
              onValueChange={handleGroupChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <ViewSelector
            currentView={viewMode}
            onViewChange={handleViewChange}
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
          />
          {headerRight}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
            Loading...
          </div>
        )}

        {viewMode === 'day' && (
          <DayView
            currentDate={currentDate}
            resources={filteredResources}
            events={filteredEvents}
            settings={settings}
            onEventClick={handleEventClick}
            onEmptySlotClick={handleEmptySlotClick}
          />
        )}

        {viewMode === 'week' && (
          <WeekView
            weekStart={currentDate}
            resources={filteredResources}
            events={filteredEvents}
            settings={settings}
            groups={groups}
            onEventClick={handleEventClick}
            onEmptySlotClick={handleEmptySlotClick}
          />
        )}

        {viewMode === 'month' && (
          <MonthView
            month={currentDate}
            // Passing raw resources and events to let MonthView filter internally based on useMemo optimization
            // or just use what we prepared. But MonthView might calculate density.
            // Let's pass raw for now as MonthView signature expects generic resource list?
            // Actually MonthView expects what we give it.
            // I'll keep the props below and remove the top one.
            events={events} // Pass raw
            resources={resources} // Pass raw
            settings={settings}
            selectedGroupId={effectiveGroupId}
            onDayClick={handleDayClick}
          />
        )}
      </div>

      {/* Modal - Use injected component or default */}
      {components?.EventModal ? (
        <components.EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedEvent}
          resources={resources}
          groups={groups}
          events={events}
          defaultResourceId={newInfo.resourceId}
          defaultStartTime={newInfo.startTime}
          onSave={handleModalSave}
          onDelete={onEventDelete ? handleModalDelete : undefined}
          readOnlyResource={true}
        // Pass any other props that the custom modal might need?
        // Consumers can wrap their modal to inject extra contexts.
        />
      ) : (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedEvent}
          resources={resources}
          groups={groups}
          events={events}
          defaultResourceId={newInfo.resourceId}
          defaultStartTime={newInfo.startTime}
          onSave={handleModalSave}
          onDelete={onEventDelete ? handleModalDelete : undefined}
          readOnlyResource={true}
        />
      )}
    </div>
  );
}
