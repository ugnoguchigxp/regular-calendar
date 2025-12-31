import { faker } from '@faker-js/faker/locale/ja';

export const groups = [
    {
        id: 'group1',
        name: '48F Floor',
        displayMode: 'grid',
        dimension: 1,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'group2',
        name: 'Tsuchika Area',
        displayMode: 'grid',
        dimension: 1,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const resources = [
    // 48F Resources (Spade, Heart, Club, Diamond, RoomA-E)
    { id: 'r1', name: 'スペード', groupId: 'group1', order: 1, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'r2', name: 'ハート', groupId: 'group1', order: 2, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'r3', name: 'クラブ', groupId: 'group1', order: 3, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'r4', name: 'ダイヤモンド', groupId: 'group1', order: 4, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'r5', name: 'RoomA', groupId: 'group1', order: 5, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'r6', name: 'RoomB', groupId: 'group1', order: 6, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'r7', name: 'RoomC', groupId: 'group1', order: 7, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'r8', name: 'RoomD', groupId: 'group1', order: 8, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'r9', name: 'RoomE', groupId: 'group1', order: 9, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },

    // Tsuchika Resources (CubeA, CubeB)
    { id: 'r10', name: 'CubeA', groupId: 'group2', order: 1, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'r11', name: 'CubeB', groupId: 'group2', order: 2, isAvailable: true, createdAt: new Date(), updatedAt: new Date() }
];

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const todayStr = `${year}-${month}-${day}`;

export const events = [
    {
        id: 'e1',
        resourceId: 'r1',
        groupId: 'group1',
        title: 'Morning Session',
        attendee: 'John Doe',
        startDate: `${todayStr}T09:00:00`,
        endDate: `${todayStr}T13:00:00`,
        status: 'booked',
        isAllDay: true // Add explicit AllDay event
    },
    {
        id: 'e2',
        resourceId: 'r2',
        groupId: 'group1',
        title: 'Afternoon Checkup',
        attendee: 'Jane Smith',
        startDate: `${todayStr}T14:00:00`,
        endDate: `${todayStr}T15:30:00`,
        status: 'booked',
    }
];

export const settings = {
    defaultDuration: 240, // 4 hours
    startTime: '08:00',
    endTime: '22:00',
    closedDays: [0], // Sunday
    weekStartsOn: 1,
};

// Generate 60 personnel using Faker
const departments = ['営業部', '開発部', '総務部', '経理部', '人事部', '企画部'];

export const personnel = Array.from({ length: 60 }, (_, i) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${lastName} ${firstName}`;
    const department = departments[Math.floor(Math.random() * departments.length)];
    const email = faker.internet.email({ firstName, lastName, provider: 'example.com' }).toLowerCase();

    return {
        id: `p${i + 1}`,
        name,
        department,
        email,
        priority: 0, // Default priority
        createdAt: new Date(),
        updatedAt: new Date(),
    };
});

// Generate personnel events (10 days of events for each personnel)
const eventTitles = [
    '会議', 'ミーティング', '打ち合わせ', '研修', 'レビュー',
    'プレゼン', '面談', '商談', 'セミナー', '定例会',
    '企画会議', '進捗報告', 'ワークショップ', '勉強会', 'ブレスト'
];

const personnelEvents: any[] = [];
let eventId = 100; // Start from 100 to avoid conflicts

personnel.forEach((person) => {
    // Generate 3-8 events per person over 10 days
    const numEvents = Math.floor(Math.random() * 6) + 3;

    for (let e = 0; e < numEvents; e++) {
        // Random day within 10 days (past 5 days to future 5 days)
        const dayOffset = Math.floor(Math.random() * 10) - 5;
        const eventDate = new Date(today);
        eventDate.setDate(eventDate.getDate() + dayOffset);

        // Skip Sundays
        if (eventDate.getDay() === 0) continue;

        const eventYear = eventDate.getFullYear();
        const eventMonth = String(eventDate.getMonth() + 1).padStart(2, '0');
        const eventDay = String(eventDate.getDate()).padStart(2, '0');
        const dateStr = `${eventYear}-${eventMonth}-${eventDay}`;

        // Random start hour between 8-17
        const startHour = Math.floor(Math.random() * 10) + 8;
        // Duration: 30min, 1h, 1.5h, 2h
        const durations = [30, 60, 90, 120];
        const duration = durations[Math.floor(Math.random() * durations.length)];
        const endHour = startHour + Math.floor(duration / 60);
        const endMin = duration % 60;

        const title = eventTitles[Math.floor(Math.random() * eventTitles.length)];

        // 10% chance of all-day event
        const isAllDay = Math.random() < 0.1;

        personnelEvents.push({
            id: `pe${eventId++}`,
            resourceId: null, // Not tied to a resource
            groupId: null,
            title: `${title}`,
            attendee: person.name,
            startDate: isAllDay ? `${dateStr}T00:00:00` : `${dateStr}T${String(startHour).padStart(2, '0')}:00:00`,
            endDate: isAllDay ? `${dateStr}T23:59:59` : `${dateStr}T${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00`,
            status: 'booked',
            isAllDay,
            extendedProps: { personnelId: person.id },
        });
    }
});

// Combine original events with personnel events
export const allEvents = [...events, ...personnelEvents];
