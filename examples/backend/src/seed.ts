import { faker } from '@faker-js/faker/locale/ja';
import { db } from './db';
import { groups, resources, events, personnel } from './db/schema';

// Static Data Definitions
const seedGroups = [
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

const seedResources = [
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

const initialEvents = [
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
        isAllDay: false
    }
];

const JOHN_DOE_ID = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
const departments = ['営業部', '開発部', '総務部', '経理部', '人事部', '企画部'];

export async function seed() {
    console.log('Seeding database...');

    // 1. Insert Groups
    await db.insert(groups).values(seedGroups);

    // 2. Insert Resources
    await db.insert(resources).values(seedResources);

    // 3. Generate & Insert Personnel
    const seedPersonnel = [
        {
            id: JOHN_DOE_ID,
            name: 'John Doe',
            department: '開発部',
            email: 'john.d@example.com',
            priority: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        ...Array.from({ length: 59 }, (_, i) => {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const name = `${lastName} ${firstName}`;
            const department = departments[Math.floor(Math.random() * departments.length)];
            const email = faker.internet.email({ firstName, lastName, provider: 'example.com' }).toLowerCase();

            return {
                id: crypto.randomUUID(),
                name,
                department,
                email,
                priority: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        })
    ];
    await db.insert(personnel).values(seedPersonnel);

    // 4. Generate & Insert Events
    const eventTitles = [
        '会議', 'ミーティング', '打ち合わせ', '研修', 'レビュー',
        'プレゼン', '面談', '商談', 'セミナー', '定例会',
        '企画会議', '進捗報告', 'ワークショップ', '勉強会', 'ブレスト'
    ];

    const allEvents: any[] = [];
    const resourceUsage = new Map<string, Set<string>>(); // resourceId -> Set("YYYY-MM-DD-HH")

    // Helper to check availability
    const isAvailable = (resourceId: string, start: Date, end: Date) => {
        if (!resourceUsage.has(resourceId)) return true;
        const set = resourceUsage.get(resourceId)!;
        // Check every hour slot
        const current = new Date(start);
        current.setMinutes(0, 0, 0); // floor to hour
        while (current < end) {
            const key = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}-${current.getHours()}`;
            if (set.has(key)) return false;
            current.setHours(current.getHours() + 1);
        }
        return true;
    };

    const bookResource = (resourceId: string, start: Date, end: Date) => {
        if (!resourceUsage.has(resourceId)) resourceUsage.set(resourceId, new Set());
        const set = resourceUsage.get(resourceId)!;
        const current = new Date(start);
        current.setMinutes(0, 0, 0);
        while (current < end) {
            const key = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}-${current.getHours()}`;
            set.add(key);
            current.setHours(current.getHours() + 1);
        }
    };

    let eventId = 100;

    // A. Create Shared Meetings (One event, One Resource, Multiple Attendees)
    // Create 15 shared meetings
    for (let i = 0; i < 15; i++) {
        // Pick Random Resource
        const resource = seedResources[Math.floor(Math.random() * seedResources.length)];

        // Pick Random Time (next 10 days, 9-17)
        let attempts = 0;
        let mappedData = null;

        while (attempts < 10) {
            const dayOffset = Math.floor(Math.random() * 10) - 2; // -2 to +8 days
            const date = new Date(today);
            date.setDate(date.getDate() + dayOffset);
            if (date.getDay() === 0) { attempts++; continue; } // Skip Sunday

            const startHour = Math.floor(Math.random() * 8) + 9; // 9-16
            const durationHours = [1, 1.5, 2][Math.floor(Math.random() * 3)];

            const startDate = new Date(date);
            startDate.setHours(startHour, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + durationHours * 60);

            if (isAvailable(resource.id, startDate, endDate)) {
                bookResource(resource.id, startDate, endDate);
                mappedData = { startDate, endDate };
                break;
            }
            attempts++;
        }

        if (mappedData) {
            // Pick 2-5 attendees
            const attendeesCount = Math.floor(Math.random() * 4) + 2;
            const shuffled = [...seedPersonnel].sort(() => 0.5 - Math.random());
            const selectedAttendees = shuffled.slice(0, attendeesCount);

            const title = `Project ${String.fromCharCode(65 + i)} Meeting`;

            allEvents.push({
                id: `shared${i}`,
                resourceId: resource.id,
                groupId: resource.groupId,
                title: `${title}`,
                startDate: mappedData.startDate.toISOString(),
                endDate: mappedData.endDate.toISOString(),
                status: 'booked',
                isAllDay: false,
                attendee: JSON.stringify(selectedAttendees.map(p => ({ name: p.name, personnelId: p.id }))),
                extendedProps: {
                    usage: 'Meeting',
                    ownerId: selectedAttendees[0].id // First person is owner
                }
            });
        }
    }


    // B. Personal Events
    seedPersonnel.forEach((person) => {
        const numEvents = Math.floor(Math.random() * 5) + 2;

        for (let e = 0; e < numEvents; e++) {
            const dayOffset = Math.floor(Math.random() * 10) - 2;
            const eventDate = new Date(today);
            eventDate.setDate(eventDate.getDate() + dayOffset);
            if (eventDate.getDay() === 0) continue;

            const startHour = Math.floor(Math.random() * 9) + 9; // 9-17
            let duration = 60; // 1 hour default
            if (Math.random() > 0.7) duration = 30;
            if (Math.random() > 0.9) duration = 120;

            const startDate = new Date(eventDate);
            startDate.setHours(startHour, 0, 0, 0);
            if (Math.random() > 0.5) startDate.setMinutes(30);

            const endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + duration);

            // 40% chance to use resource
            let resourceId = null;
            let groupId = null;

            if (Math.random() < 0.4) {
                // Try to book a resource
                const resource = seedResources[Math.floor(Math.random() * seedResources.length)];
                if (isAvailable(resource.id, startDate, endDate)) {
                    bookResource(resource.id, startDate, endDate);
                    resourceId = resource.id;
                    groupId = resource.groupId;
                }
                // If busy, just fallback to no resource (desk work)
            }

            const title = eventTitles[Math.floor(Math.random() * eventTitles.length)];

            allEvents.push({
                id: `pe${eventId++}`,
                resourceId: resourceId,
                groupId: groupId,
                title: title,
                attendee: JSON.stringify([{ name: person.name, personnelId: person.id }]),
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                status: 'booked',
                isAllDay: false,
                extendedProps: {
                    usage: resourceId ? 'Meeting' : 'Event',
                    ownerId: person.id
                }
            });
        }
    });

    await db.insert(events).values(allEvents);

    console.log('Seeding complete.');
}
