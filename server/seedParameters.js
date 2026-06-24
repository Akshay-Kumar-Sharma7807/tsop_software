const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Parameter = require('./models/Parameter');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tsop';

// Helper builders
const yn  = (name, category, hint = '', yesIsGreen = true, order) =>
  ({ name, category, dataType: 'yesno', yesIsGreen, allowInProgress: true, hint, enabled: true, required: false, order });
const txt = (name, category, hint = '', order) =>
  ({ name, category, dataType: 'text', filledIsGreen: true, hint, enabled: true, required: false, order });
const url = (name, category, hint = '', order) =>
  ({ name, category, dataType: 'url', filledIsGreen: true, hint, enabled: true, required: false, order });
const num = (name, category, redMax, yellowMax, hint = '', order) =>
  ({ name, category, dataType: 'number', redMax, yellowMax, hint, enabled: true, required: false, order });

const PARAMETERS = [
  // ── Meeting Setup ──────────────────────────────────────────────────────────
  txt('Team Name', 'Meeting Setup', 'Name of the team', 0),
  txt('Meeting Date', 'Meeting Setup', 'Date of the meeting', 1),
  txt('Meeting Time', 'Meeting Setup', 'Time of the meeting', 2),
  url('Goal sheet link', 'Meeting Setup', 'Link to the team goal sheet', 3),
  txt('TSoP taken by', 'Meeting Setup', 'Name of person who conducted TSoP', 4),
  yn('TM', 'Meeting Setup', 'TM Status', true, 5),
  yn('DM', 'Meeting Setup', 'DM Status', true, 6),
  yn('ADM', 'Meeting Setup', 'ADM Status', true, 7),
  num('Total No. of members in a team', 'Member Management', 2, 7, '1-2=red, 4-7=yellow, 8+=green', 8),
  txt('Names', 'Member Management', 'Names of all members', 9),
  num('Members present for meeting', 'Member Management', null, null, 'Count of members present', 10),
  txt('NAMES OF MEMBERS PRESENT', 'Member Management', 'Names of members present', 11),

  // ── Goals & Performance ────────────────────────────────────────────────────
  num('Total goal for the month (G1)', 'Goals & Performance', null, null, 'Monthly session target (G1)', 10),
  num('G1 count achieved', 'Goals & Performance', 35, 55, 'Sessions done vs G1 target (0-35=red, 35-55=yellow, 55+=green)', 11),
  num('G2 target', 'Goals & Performance', null, null, 'Monthly session target (G2)', 12),
  num('G2 count achieved', 'Goals & Performance', 35, 55, 'Sessions done vs G2 target', 13),
  num('G3 target', 'Goals & Performance', null, null, 'Monthly session target (G3)', 14),
  num('G3 count achieved', 'Goals & Performance', 35, 55, 'Sessions done vs G3 target', 15),
  num('G4 target', 'Goals & Performance', null, null, 'Monthly session target (G4)', 16),
  num('G4 count achieved', 'Goals & Performance', 35, 55, 'Sessions done vs G4 target', 17),

  // ── Member Management ──────────────────────────────────────────────────────
  txt('Shortfall/excess as per trend', 'Member Management', 'Reason for shortfall or excess in sessions', 20),
  txt('Add 4 new members this month (Names)', 'Member Management', '2+2 new members plan with names', 21),
  txt('Own members added', 'Member Management', 'Members onboarded from own network', 22),
  txt('Monthly Presentation — any absent member & reason', 'Member Management', 'Every member expected. If absent, give reason and reschedule.', 23),
  txt('Team WR related issues', 'Member Management', 'Report any WR issues in the team', 24),
  txt('Team DJ related issues', 'Member Management', 'Report any DJ issues in the team', 25),
  txt('Portal issues', 'Member Management', 'Any portal issues faced', 26),
  txt('1 Best Member from Your Team', 'Member Management', 'Nominate the best performing member', 27),
  txt('1 Member not working properly', 'Member Management', 'Name and issue of underperforming member', 28),
  txt('Volunteer appreciation (team/group/social media)', 'Member Management', 'How volunteers were appreciated this period', 29),
  txt('Timely issue of certificates', 'Member Management', 'Status of certificate issuance', 30),

  // ── Planning & Follow-up ───────────────────────────────────────────────────
  txt('ADM / DM planning', 'Planning & Follow-up', 'Plan for ADM/DM promotions or assignments', 40),
  txt('Team sessions growth (10-15 sessions increase/month)', 'Planning & Follow-up', 'Max 120 sessions per team. Create new team after that.', 41),
  txt('Upcoming planned session going smoothly', 'Planning & Follow-up', 'Ensure upcoming sessions are ready', 42),
  txt('Absent member during monthly meeting — reason & reschedule', 'Planning & Follow-up', 'If any member absent, reason must be given and meeting rescheduled', 43),
  yn('Before meeting DinS intro message sent', 'Planning & Follow-up', 'Send intro message before meeting', true, 44),
  yn('Allocating innovative tasks to new members & follow-up', 'Planning & Follow-up', 'New members given tasks and followed up', true, 45),
  yn('Coordinating with the centers', 'Planning & Follow-up', 'Active coordination with assigned centers', true, 46),
  txt('No. of centre feedback meetings done (last 2 months)', 'Planning & Follow-up', 'Count and details of center feedback meetings', 47),
  txt('Direct vols/team members', 'Planning & Follow-up', 'Updates on direct volunteers or team members', 48),
  txt('Spearhead webinar (one per two months)', 'Planning & Follow-up', 'Status of spearhead webinar', 49),
  txt('Utsav — one per two sunshine assets', 'Planning & Follow-up', 'Status of Utsav activity', 50),
  txt('Non-performing volunteer — referred to admin?', 'Planning & Follow-up', 'If volunteer not working, they should meet the admin', 51),
  txt('Internal team meetings & training sessions', 'Planning & Follow-up', 'Are internal training sessions being held?', 52),

  // ── Operations ─────────────────────────────────────────────────────────────
  yn('Monitoring assets at least once a week', 'Operations', 'Check movement of assets weekly', true, 60),
  yn('Session visited by manager/DM/AC', 'Operations', 'At least one session visited this period', true, 61),
  yn('Referred-back session — meeting with Sushmita ma\'am done?', 'Operations', 'If any session referred back, meet Sushmita ma\'am ASAP', true, 62),
  yn('At least 1 DM/TM in admin WhatsApp group', 'Operations', 'One manager-level member must be in admin group', true, 63),
  yn('DM eligibility: onboarded a center/vol', 'Operations', 'DM must have onboarded at least one center or volunteer', true, 64),
  yn('Backup presenter if manager can\'t join TL meet', 'Operations', 'Someone from the team should present if manager absent', true, 65),
  yn('Remove member from platform if no sessions', 'Operations', 'Inactive members should be removed', true, 66),
  yn('Follow up with member not doing team meeting', 'Operations', 'Barge into session or contact directly', true, 67),
  yn('Proper intro of members & welcome poster', 'Operations', 'New members introduced properly with poster', true, 68),
  yn('Congratulatory message for promotion', 'Operations', 'Promotions recognized and announced', true, 69),
  yn('Monthly meeting with Dinesh Sir done', 'Operations', 'Monthly sync with Dinesh Sir completed', true, 70),
  yn('Members not responding — passed to coordinator', 'Operations', 'Non-responsive members handed off to coordinator', true, 71),
  yn('Unsuitable members passed to other team', 'Operations', 'If member doesn\'t fit, transferred after discussion', true, 72),
  yn('Proper hand-holding of new members', 'Operations', 'New members guided and supported', true, 73),
  yn('Starting more sessions (planned 1 month in advance)', 'Operations', 'Sessions planned proactively', true, 74),
  txt('ONBOARD centre from your network', 'Operations', 'New centre onboarded from personal network', 75),
  txt('Need for new members (pursue with coord/network)', 'Operations', 'Plan to recruit new members', 76),
  txt('Odd-time sessions (find vol from other teams)', 'Operations', 'Plan for sessions at off-peak times', 77),
  txt('Few students joining centre — action taken', 'Operations', 'Steps to improve student attendance', 78),
  yn('One admin member in every orientation', 'Operations', 'Admin member present in orientation sessions', true, 79),
  yn('Meeting with Isha ma\'am for SOP issue', 'Operations', 'SOP issues discussed with Isha ma\'am', true, 80),
  txt('Create AC from the team', 'Operations', 'Plan for creating an Area Coordinator from team', 81),
  txt('Admin issue escalation (Spearhead/Tech/Center/Aset)', 'Operations', 'Admin issues routed to the right person', 82),
  txt('Special team for galaxy activities', 'Operations', 'One special team per galaxy for special activities', 83),
  txt('Student benefit ideas', 'Operations', 'What more can be done for students', 84),
  yn('Strictly follow SOP process', 'Operations', 'SOP process being followed rigorously', true, 85),
  yn('Center annual report (1 per month)', 'Operations', 'Monthly center report submitted', true, 86),
  txt('YL progress / school progress', 'Operations', 'Update on Young Leaders or school progress', 87),
  txt('Notes about center and students', 'Operations', 'Key observations about centers and students', 88),
  txt('Promote sessions / Aset / announcements', 'Operations', 'Promotions done for sessions and assets', 89),
  txt('Any requirement for team growth', 'Operations', 'Resources or support needed for growth', 90),
  txt('Any other issues', 'Operations', 'Any additional issues not covered above', 91),
  txt('Every member gets session of their choice', 'Operations', 'Members assigned sessions matching their interest', 92),
  txt('Re-joining members appreciated', 'Operations', 'Members who rejoined were welcomed back', 93),
  txt('New ideas for this period', 'Operations', 'Fresh ideas proposed by team', 94),
  txt('New topic to be added (through Isha)', 'Operations', 'Any new topic needs to go through Isha ma\'am', 95),
  txt('Date of monthly presentation', 'Operations', 'Scheduled date for monthly presentation', 96),
  txt('Centres onboarding — 30 calls per day', 'Operations', 'Centre outreach call targets', 97),
  txt('Planning for 30 centres, start 12', 'Operations', 'Centre scaling plan', 98),
  txt('TSoP meeting 2-3 every day', 'Operations', 'Daily TSoP meeting target', 99),
  txt('Aset closed before reaching 60 sessions', 'Operations', 'Aset lifecycle management', 100),

  // ── Governance & SOP ───────────────────────────────────────────────────────
  yn('Less participation in workshop — outside participants arranged', 'Governance & SOP', 'Get outside participants if internal participation is low', true, 110),
  yn('Sessions not cancelled because of meetings', 'Governance & SOP', 'Meetings should not conflict with sessions', true, 111),
  yn('Internal remarks missed — mail sent to Dinesh Sir', 'Governance & SOP', 'Proper documentation of missed internal remarks', true, 112),
  yn('Interviews by AC or coordinator', 'Governance & SOP', 'Internal member interviews conducted by AC/coordinator', true, 113),
  yn('DM/TM filled form before DS interview', 'Governance & SOP', 'Pre-interview form completed before meeting Dinesh Sir', true, 114),
  yn('Non-responding center given to Isha/Kiran ma\'am', 'Governance & SOP', 'Non-responsive centers escalated', true, 115),
  yn('Member left — Discussed with Dins & Pinnacle informed', 'Governance & SOP', 'Proper exit process followed', true, 116),
  txt('Center related SOPs', 'Governance & SOP', 'SOP compliance for center management', 117),
  txt('Shift center (within team → other galaxy)', 'Governance & SOP', 'Process for shifting centers', 118),
  txt('External emails — draft reconfirmed before sending', 'Governance & SOP', 'External communication review', 119),
  txt('External email rules followed (CC, domain, etc.)', 'Governance & SOP', '1. CC relevant managers 2. CC contact@adoreindia.org 3. Use official domain if allotted', 120),
  txt('New speaker introduced to Devika ma\'am', 'Governance & SOP', 'New speakers must be introduced to Devika ma\'am', 121),
  txt('Colleges routed through Devika ma\'am', 'Governance & SOP', 'College contacts go through Devika ma\'am', 122),
  txt('Schools — calls with Sushmita ma\'am', 'Governance & SOP', 'School outreach coordinated with Sushmita ma\'am', 123),
  txt('Low student count — sessions not approved', 'Governance & SOP', 'Action if session approval denied due to low students', 124),
  yn('Planned Aset — enhancements made', 'Governance & SOP', 'Aset purged automatically if no enhancements made', true, 125),
  txt('Offline centres per team', 'Governance & SOP', 'Count and names of offline centres', 126),
  txt('Soaring Wings per month (all teams)', 'Governance & SOP', 'Soaring Wings activity status', 127),
  txt('Monthly celebration of special days (per galaxy)', 'Governance & SOP', 'Special day celebrations planned and done', 128),
  txt('Building rapport with centres', 'Governance & SOP', 'Relationship-building activities with centres', 129),
  txt('Manager understanding & rapport with team members', 'Governance & SOP', 'No misunderstandings between manager and team', 130),
  txt('Grp14 guest speakers managed by Devika ma\'am', 'Governance & SOP', 'All Grp14 guest speakers (except international) via Devika ma\'am', 131),
  txt('Webinar video YouTube URL uploaded in SOPs', 'Governance & SOP', 'File/folder link connected to completion status', 132),
  txt('More functions to be team-managed (like YIPs)', 'Governance & SOP', 'Identify functions that can be team-managed', 133),
  txt('PCon issues through tickets', 'Governance & SOP', 'Raise tickets and discuss with head', 134),
  txt('Non-yielding process — discussed with higher authority', 'Governance & SOP', 'Escalation of ineffective processes', 135),

  // ── Team Culture ───────────────────────────────────────────────────────────
  txt('Team members accommodated in the group', 'Team Culture', 'All members included in relevant groups', 140),
  txt('Member issue resolved by coordinator', 'Team Culture', 'Coordinator responsible for resolving member issues', 141),
  txt('Appreciation: personal / promotional / initiative', 'Team Culture', '1. Personal achievement 2. Promotional achievement 3. Taking initiatives', 142),
  txt('New member welcome poster (day they join)', 'Team Culture', 'Auto-upload via tech if possible; poster on day of joining', 143),
  txt('Task balance among team members', 'Team Culture', 'Tasks distributed fairly across all members', 144),
  txt('Special task assigned this period', 'Team Culture', 'Any special task given to a member', 145),
  yn('Saturday learning session — new members attended', 'Team Culture', 'New members expected at Saturday learning sessions', true, 146),
  txt('Centres informed about new/closed Aset chapters', 'Team Culture', 'Centers updated when a chapter closes', 147),
  txt('Centres called for YIP', 'Team Culture', 'Centres invited to YIP events', 148),
  txt('Session observers gave feedback in Aset', 'Team Culture', 'Observers share feedback screenshot to coord/AC', 149),
  yn('TM/DM explained session reports to new members', 'Team Culture', 'New members trained on session report filling', true, 150),
  yn('2 DMMs present (if TM & DM both absent)', 'Team Culture', '2 Deputy Meeting Managers when TM and DM unavailable', true, 151),
  txt('Minimum 2 members for team management', 'Team Culture', 'At least 2 members handling team management duties', 152),
  yn('Irresponsible member — action taken', 'Team Culture', 'Do not allow irresponsible behaviour; don\'t let them work if not sincere', true, 153),
  txt('Direct team members — attended Pinnacle ORT', 'Team Culture', 'Members from direct team must attend Pinnacle orientation', 154),

  // ── Session Quality ────────────────────────────────────────────────────────
  txt('Every session has end feedback + 5-10 min fun game', 'Session Quality', 'Sessions must close with feedback and fun activity', 160),
  txt('Referred-back confusion resolved with TAC/Sushmita', 'Session Quality', 'Connect with TAC or Sushmita ma\'am for referred-back clarity', 161),
  txt('Reports elaborated properly (topic/impact/attendance/assignment)', 'Session Quality', 'Session reports must be detailed and complete', 162),
  txt('Proper guidance to Simtrak members', 'Session Quality', 'Simtrak members given proper session guidance', 163),
  txt('Session quality is the priority', 'Session Quality', 'Quality of session is non-negotiable', 164),
  txt('Intro note has syllabus to be followed', 'Session Quality', 'Syllabus must be included in the intro note', 165),
  txt('First session = intro, Last session = closing ceremony', 'Session Quality', 'ASET structure: intro first, ceremony last', 166),
  txt('Certificates given to students attending all sessions', 'Session Quality', 'Certificate issuance for ASET attendees', 167),
  txt('TAC given report feedback of members', 'Session Quality', 'Member report feedback shared with TAC', 168),
  txt('Sessions in comfortable language (volunteer & students)', 'Session Quality', 'Language suitable for both volunteer and student', 169),
  txt('Internal org problems not shared with new members', 'Session Quality', 'Maintain professionalism with new members', 170),
  txt('Non-working member process: accommodate → other team → domain → discontinue', 'Session Quality', 'Step-by-step process for handling non-working members', 171),
  txt('Cancelled session — Pradipta Sir & Sushmita ma\'am informed', 'Session Quality', 'IR cancellation update mandatory', 172),
  txt('Low session participation — session paused', 'Session Quality', 'Pause session when participation drops significantly', 173),
  txt('TM/DM post filled before appointment', 'Session Quality', 'Another member must fill role before new TM/DM appointed', 174),
  txt('No personal work texts — all in team group with tags', 'Session Quality', 'Work communication in group only, with proper tags', 175),
  txt('TAC DJ shifted to Simtrak', 'Session Quality', 'TAC DJ migration to Simtrak', 176),
  txt('TM DJ should be 75', 'Session Quality', 'TM DJ score target: 75', 177),
  txt('New center start — 1st session picture in admin group', 'Session Quality', 'Tag Isha/Kiran/Simran ma\'am and Dinesh Sir compulsorily', 178),
  txt('New center poster (compulsory)', 'Session Quality', 'Poster mandatory for every new center', 179),
  txt('Member conflict — not discussed in group', 'Session Quality', 'Conflicts handled privately, not in group chat', 180),
  txt('Reduce dependency on 2-3 centers for all sessions', 'Session Quality', 'Distribute sessions across more centers for resilience', 181),
  txt('Poster approval within 48 hours', 'Session Quality', 'Escalate to coordinator if approval takes >48 hours', 182),
  txt('Admin meeting — all center details provided', 'Session Quality', 'Full center details shared during admin meetings', 183),
  txt('Attendance mark issue — resolved', 'Session Quality', 'Clear search bar and retry; escalate to Dinesh Sir if needed', 184),
  txt('Expectation mismatch → TAC meeting → DS meeting', 'Session Quality', 'Step-up escalation for expectation mismatches', 185),
  txt('DJs thoroughly checked by TM/TAC', 'Session Quality', 'Daily journals reviewed by TM or TAC', 186),
  txt('Leaving member — Pinnacle informed', 'Session Quality', 'Team Pinnacle notified when member leaves', 187),
  txt('Understand member\'s problem — don\'t assume', 'Session Quality', 'Listen before concluding on member issues', 188),
  txt('Leaving member — responsibilities transferred', 'Session Quality', 'Pass responsibilities to another member before leaving', 189),
  txt('New member appreciated by TAC/TM (once a week)', 'Session Quality', 'Weekly appreciation for new members doing well', 190),
  txt('Follow up with new member tasks', 'Session Quality', 'Regular follow-up on tasks assigned to new members', 191),
  txt('Webinar updates — SOP meeting with Spearhead 3', 'Session Quality', 'Webinar updates shared and SOP meeting done', 192),
  num('Total Points Received', 'Session Quality', null, null, 'Total meeting points scored', 193),

  // ── Center Feedback ────────────────────────────────────────────────────────
  txt('Center Feedback Meeting — TACs, 2+ team members & Aset Manager present', 'Center Feedback', 'All required stakeholders present for center feedback meeting', 200),
  txt('Name of center & center in-charge', 'Center Feedback', 'Full name of the center and responsible person', 201),
  txt('Phone number of center in-charge', 'Center Feedback', 'Contact number of the center in-charge', 202),
  txt('Team name the center belongs to', 'Center Feedback', 'Which team is responsible for this center', 203),
  txt('TAC responsible for support of new members', 'Center Feedback', 'TAC name and how they are supporting new members', 204),
];

async function seedParameters() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await Parameter.countDocuments();
    if (existing > 0) {
      console.log(`⚠️  ${existing} parameters already exist. Use --force to re-seed.`);
      if (!process.argv.includes('--force')) {
        return;
      }
      await Parameter.deleteMany({});
      console.log('🗑️  Cleared existing parameters');
    }

    const inserted = await Parameter.insertMany(PARAMETERS);
    console.log(`✅ Seeded ${inserted.length} parameters`);

    const byCategory = inserted.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    Object.entries(byCategory).forEach(([cat, count]) =>
      console.log(`   → ${cat}: ${count}`)
    );
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
  }
}

seedParameters();
