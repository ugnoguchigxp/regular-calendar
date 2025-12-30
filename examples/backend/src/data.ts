export const groups = [
    {
        id: 'group1',
        name: '48F',
        displayMode: 'grid',
        dimension: 1,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'group2',
        name: 'ツーチカ',
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
const todayStr = today.toISOString().split('T')[0];

export const events = [
    {
        id: 'e1',
        resourceId: 'r1',
        groupId: 'group1',
        title: 'Morning Session',
        startDate: `${todayStr}T09:00:00`,
        endDate: `${todayStr}T13:00:00`,
        status: 'booked',
    },
    {
        id: 'e2',
        resourceId: 'r2',
        groupId: 'group1',
        title: 'Afternoon Checkup',
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
