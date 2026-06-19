require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Team = require('./models/Team');
const Constraints = require('./models/Constraints');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tsop';

// Each team gets 3 meetings: early, mid, and latest (matching the spec table).
// Earlier meetings have progressively lower sessionsDone to make charts meaningful.
const teamsData = [
  {
    name: 'Aurora',
    tac: '',
    meetings: [
      { date: '2026-04-20', tm: 'no', dm: 'no', adm: 'no', members: 3, totalGoal: 210, sessionsDone: 6, newMembers: 0, centerFeedbackMeetings: 1 },
      { date: '2026-05-11', tm: 'no', dm: 'no', adm: 'no', members: 4, totalGoal: 210, sessionsDone: 14, newMembers: 1, centerFeedbackMeetings: 2 },
      { date: '2026-06-01', tm: 'no', dm: 'no', adm: 'no', members: 5, totalGoal: 210, sessionsDone: 27, newMembers: 2, centerFeedbackMeetings: 3 },
    ],
  },
  {
    name: 'Jupiter',
    tac: 'Manpreet',
    meetings: [
      { date: '2026-04-20', tm: 'no', dm: 'no', adm: 'no', members: 5, totalGoal: 90, sessionsDone: 3, newMembers: 0, centerFeedbackMeetings: 1 },
      { date: '2026-05-11', tm: 'no', dm: 'in progress', adm: 'yes', members: 6, totalGoal: 90, sessionsDone: 8, newMembers: 0, centerFeedbackMeetings: 2 },
      { date: '2026-06-01', tm: 'no', dm: 'in progress', adm: 'yes', members: 8, totalGoal: 90, sessionsDone: 16, newMembers: 0, centerFeedbackMeetings: 3 },
    ],
  },
  {
    name: 'Rays',
    tac: 'Isha',
    meetings: [
      { date: '2026-04-20', tm: 'no', dm: 'yes', adm: 'yes', members: 7, totalGoal: 320, sessionsDone: 14, newMembers: 0, centerFeedbackMeetings: 1 },
      { date: '2026-05-11', tm: 'no', dm: 'yes', adm: 'yes', members: 9, totalGoal: 320, sessionsDone: 36, newMembers: 1, centerFeedbackMeetings: 2 },
      { date: '2026-06-01', tm: 'no', dm: 'yes', adm: 'yes', members: 10, totalGoal: 320, sessionsDone: 62, newMembers: 1, centerFeedbackMeetings: 3 },
    ],
  },
  {
    name: 'Saturn',
    tac: 'Tapati',
    meetings: [
      { date: '2026-04-20', tm: 'no', dm: 'yes', adm: 'yes', members: 5, totalGoal: 220, sessionsDone: 10, newMembers: 0, centerFeedbackMeetings: 1 },
      { date: '2026-05-11', tm: 'no', dm: 'yes', adm: 'yes', members: 6, totalGoal: 220, sessionsDone: 24, newMembers: 0, centerFeedbackMeetings: 2 },
      { date: '2026-06-01', tm: 'no', dm: 'yes', adm: 'yes', members: 7, totalGoal: 220, sessionsDone: 44, newMembers: 0, centerFeedbackMeetings: 3 },
    ],
  },
  {
    name: 'Venus',
    tac: 'Ananya',
    meetings: [
      { date: '2026-04-20', tm: 'no', dm: 'no', adm: 'no', members: 5, totalGoal: 125, sessionsDone: 6, newMembers: 2, centerFeedbackMeetings: 1 },
      { date: '2026-05-11', tm: 'no', dm: 'no', adm: 'no', members: 6, totalGoal: 125, sessionsDone: 14, newMembers: 3, centerFeedbackMeetings: 2 },
      { date: '2026-06-01', tm: 'no', dm: 'no', adm: 'no', members: 7, totalGoal: 125, sessionsDone: 25, newMembers: 5, centerFeedbackMeetings: 3 },
    ],
  },
  {
    name: 'Minions',
    tac: 'Isha',
    meetings: [
      { date: '2026-04-20', tm: 'no', dm: 'no', adm: 'no', members: 8, totalGoal: 140, sessionsDone: 7, newMembers: 0, centerFeedbackMeetings: 1 },
      { date: '2026-05-11', tm: 'no', dm: 'no', adm: 'in progress', members: 10, totalGoal: 140, sessionsDone: 17, newMembers: 1, centerFeedbackMeetings: 2 },
      { date: '2026-06-01', tm: 'no', dm: 'no', adm: 'in progress', members: 12, totalGoal: 140, sessionsDone: 30, newMembers: 2, centerFeedbackMeetings: 3 },
    ],
  },
  {
    name: 'Zenith',
    tac: 'Isha',
    meetings: [
      { date: '2026-04-20', tm: 'no', dm: 'no', adm: 'yes', members: 8, totalGoal: 250, sessionsDone: 13, newMembers: 1, centerFeedbackMeetings: 1 },
      { date: '2026-05-11', tm: 'no', dm: 'no', adm: 'yes', members: 9, totalGoal: 250, sessionsDone: 31, newMembers: 2, centerFeedbackMeetings: 2 },
      { date: '2026-06-01', tm: 'no', dm: 'no', adm: 'yes', members: 10, totalGoal: 250, sessionsDone: 54, newMembers: 3, centerFeedbackMeetings: 3 },
    ],
  },
  {
    name: 'Pluto',
    tac: 'Kiran',
    meetings: [
      { date: '2026-04-20', tm: 'no', dm: 'no', adm: 'no', members: 4, totalGoal: 180, sessionsDone: 10, newMembers: 1, centerFeedbackMeetings: 1 },
      { date: '2026-05-11', tm: 'no', dm: 'in progress', adm: 'in progress', members: 5, totalGoal: 180, sessionsDone: 24, newMembers: 2, centerFeedbackMeetings: 2 },
      { date: '2026-06-01', tm: 'no', dm: 'in progress', adm: 'in progress', members: 6, totalGoal: 180, sessionsDone: 41, newMembers: 3, centerFeedbackMeetings: 3 },
    ],
  },
  {
    name: 'Doraemon',
    tac: 'Harshita',
    meetings: [
      { date: '2026-04-20', tm: 'no', dm: 'no', adm: 'yes', members: 5, totalGoal: 100, sessionsDone: 7, newMembers: 2, centerFeedbackMeetings: 1 },
      { date: '2026-05-11', tm: 'no', dm: 'no', adm: 'yes', members: 6, totalGoal: 100, sessionsDone: 16, newMembers: 3, centerFeedbackMeetings: 2 },
      { date: '2026-06-01', tm: 'no', dm: 'no', adm: 'yes', members: 8, totalGoal: 100, sessionsDone: 27, newMembers: 5, centerFeedbackMeetings: 3 },
    ],
  },
  {
    name: 'Shinchan',
    tac: 'Lavanya',
    meetings: [
      { date: '2026-04-20', tm: 'no', dm: 'yes', adm: 'yes', members: 9, totalGoal: 220, sessionsDone: 18, newMembers: 0, centerFeedbackMeetings: 1 },
      { date: '2026-05-11', tm: 'no', dm: 'yes', adm: 'yes', members: 10, totalGoal: 220, sessionsDone: 44, newMembers: 1, centerFeedbackMeetings: 2 },
      { date: '2026-06-01', tm: 'no', dm: 'yes', adm: 'yes', members: 11, totalGoal: 220, sessionsDone: 73, newMembers: 1, centerFeedbackMeetings: 3 },
    ],
  },
  {
    name: 'Star',
    tac: 'Tapati',
    meetings: [
      { date: '2026-04-20', tm: 'no', dm: 'no', adm: 'yes', members: 5, totalGoal: 320, sessionsDone: 28, newMembers: 0, centerFeedbackMeetings: 1 },
      { date: '2026-05-11', tm: 'yes', dm: 'no', adm: 'yes', members: 6, totalGoal: 320, sessionsDone: 67, newMembers: 1, centerFeedbackMeetings: 2 },
      { date: '2026-06-01', tm: 'yes', dm: 'no', adm: 'yes', members: 7, totalGoal: 320, sessionsDone: 110, newMembers: 1, centerFeedbackMeetings: 3 },
    ],
  },
  {
    name: 'Zeal',
    tac: 'Isha',
    meetings: [
      { date: '2026-04-20', tm: 'no', dm: 'no', adm: 'no', members: 5, totalGoal: 140, sessionsDone: 13, newMembers: 0, centerFeedbackMeetings: 1 },
      { date: '2026-05-11', tm: 'no', dm: 'no', adm: 'no', members: 6, totalGoal: 140, sessionsDone: 31, newMembers: 1, centerFeedbackMeetings: 2 },
      { date: '2026-06-01', tm: 'no', dm: 'no', adm: 'no', members: 7, totalGoal: 140, sessionsDone: 52, newMembers: 1, centerFeedbackMeetings: 3 },
    ],
  },
  {
    name: 'Everest',
    tac: 'Rajyashree',
    meetings: [
      { date: '2026-04-20', tm: 'no', dm: 'no', adm: 'no', members: 5, totalGoal: 100, sessionsDone: 13, newMembers: 1, centerFeedbackMeetings: 1 },
      { date: '2026-05-11', tm: 'no', dm: 'no', adm: 'no', members: 6, totalGoal: 100, sessionsDone: 29, newMembers: 2, centerFeedbackMeetings: 2 },
      { date: '2026-06-01', tm: 'no', dm: 'no', adm: 'no', members: 7, totalGoal: 100, sessionsDone: 50, newMembers: 3, centerFeedbackMeetings: 3 },
    ],
  },
];

const defaultConstraints = {
  singleton: true,
  minCompletionPct: { value: 30, enabled: true },
  tmRequired: { enabled: true },
  dmRequired: { enabled: true },
  admRequired: { enabled: true },
  minTotalMembers: { value: 5, enabled: false },
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Team.deleteMany({});
    await Constraints.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Process teams to match the updated schema
    const processedTeamsData = teamsData.map((t, idx) => {
      const domains = ['Sunshine', 'HR', 'GM', 'Tech', 'GD', 'SMM'];
      const domain = domains[idx % domains.length];
      
      const meetings = t.meetings.map(m => {
        const hasTac = !!t.tac;
        const { newMembers, ...mRest } = m;
        return {
          ...mRest,
          time: '18:00',
          tac: hasTac ? 'yes' : 'no',
          tacName: t.tac || '',
          tmName: m.tm === 'yes' ? `${t.name} TM` : '',
          dmName: m.dm === 'yes' ? `${t.name} DM` : '',
          admName: m.adm === 'yes' ? `${t.name} ADM` : '',
          totalMembers: m.members,
          memberNames: Array.from({ length: m.members }).map((_, i) => `${t.name} Present ${i + 1}`),
          totalMemberNames: Array.from({ length: m.members }).map((_, i) => `${t.name} Member ${i + 1}`)
        };
      });

      return {
        name: t.name,
        domain,
        meetings
      };
    });

    // Seed teams
    const inserted = await Team.insertMany(processedTeamsData);
    console.log(`✅ Seeded ${inserted.length} teams`);

    // Seed constraints
    await Constraints.create(defaultConstraints);
    console.log('✅ Seeded default constraints');

    console.log('\n🎉 Seed complete! Teams seeded:');
    inserted.forEach((t) => console.log(`  → ${t.name} (${t.meetings.length} meetings)`));
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seed();
