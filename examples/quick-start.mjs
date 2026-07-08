import { mapTranscript, exportMarkdown, nextProbe } from '../src/index.js';

const transcript = `
COACH: What's underneath the anger?
CLIENT: I don't know. It just shows up.
COACH: When does it usually arrive?
CLIENT: Late afternoon. After the meetings. I feel it in my chest, tightness.
COACH: What are you actually doing about it?
CLIENT: I started walking at lunch. It helps, I think. Some days.
COACH: What's the next call?
CLIENT: I want to leave the job but I'm not sure yet.
COACH: How much has this cost you?
CLIENT: Years. Three years of feeling stuck.
`;

const session = mapTranscript(transcript, { title: 'Sample coaching' });

console.log('Focus speaker:', session.focus);
console.log('Turns analysed:', session.result.turnsAnalysed);
console.log('Axes touched:', session.result.touched + '/9');
console.log('Arc:', session.result.arc);
console.log('Strongest:', session.result.strongest);
console.log('Growth edge:', session.result.weakest);
console.log('\n--- Next probe (targets weakest axis) ---');
console.log(nextProbe(session.result.axisAgg));
console.log('\n--- Markdown export (first 400 chars) ---');
console.log(exportMarkdown(session).slice(0, 400));
