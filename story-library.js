'use strict';
/* Leveled books for Pip's Stories, Grades 2–5 (original texts). Used by leveled.js.
   Book: {id, band: '2'|'3'|'4'|'5', lvl: order within the grade (1 = easiest), series, title, cover (emoji), bg,
          kind: 'fiction'|'informational', vocab: [[word, kid-friendly meaning]],
          pages: [{text, heading?, icon?}],   // Grades 2–3: 2–4 sentences a page; Grades 4–5: one paragraph a page
          questions: [{q, a, wrong: [w1, w2], type, evidence?, mid?}]}
   type: detail | sequence | main idea | character | inference | vocabulary | text feature | author purpose | theme | compare | point of view
   evidence (Grades 4–5): the exact sentence from the text that proves the answer (asked as a second part).
   mid: true → asked as a check-in halfway through the book (Grades 3–5). */
const LEVELED_BOOKS = [
  {id: 'g3-tide-pools', band: '3', lvl: 1, series: 'Pip Explores California', title: 'Pip at the Tide Pools', cover: '🦀', bg: 'sea', kind: 'fiction',
    vocab: [['tide', 'the rise and fall of the ocean twice a day'], ['anemone', 'a soft sea animal that looks like a flower'], ['gently', 'in a soft, careful way']],
    pages: [
      {icon: '🌊', text: 'Early on Saturday, Pip and his friend Marisol walked down to the rocky beach. The tide was low, so the ocean had pulled back and left little pools of water between the rocks.'},
      {icon: '🦀', text: 'Marisol knelt beside the first pool. "Look, a crab!" she whispered. The tiny crab scuttled sideways and hid under a ledge. Pip laughed because it walked like it was in a hurry.'},
      {icon: '🌸', text: 'In the next pool, they saw green anemones with soft arms that waved in the water. When Pip touched one very gently with his feather, the arms closed up like a fist.'},
      {icon: '⭐', text: 'A purple sea star clung to the side of a rock. Marisol wanted to pull it off to show her little brother. "We should leave it," said Pip. "This pool is its home."'},
      {icon: '⏰', text: 'Soon the waves began to splash higher. The tide was coming back in. Pip and Marisol climbed up to the dry sand and watched the water cover the pools again.'},
      {icon: '🏠', text: 'On the way home, Marisol drew the crab, the anemone and the sea star in her notebook. "Now I can show my brother," she said, "and they can stay right where they belong."'}],
    questions: [
      {q: 'Why could Pip and Marisol see the tide pools?', a: 'The tide was low', wrong: ['It was raining', 'The water was very deep'], type: 'detail', mid: true},
      {q: 'What happened when Pip touched the anemone?', a: 'Its arms closed up', wrong: ['It swam away', 'It changed color'], type: 'detail'},
      {q: 'Why did Pip say to leave the sea star?', a: 'The pool was its home', wrong: ['It was too heavy', 'It might bite'], type: 'character'},
      {q: 'What does "gently" mean in the story?', a: 'In a soft, careful way', wrong: ['Very fast', 'Very loud'], type: 'vocabulary'},
      {q: 'How did Marisol solve her problem at the end?', a: 'She drew the animals to show her brother', wrong: ['She took the crab home', 'She stayed at the beach all night'], type: 'inference'}]},
  {id: 'g4-quake-ready', band: '4', lvl: 1, series: 'Pip Explores California', title: 'When the Ground Shakes', cover: '🏠', bg: 'park', kind: 'informational',
    vocab: [['fault', 'a crack deep in the Earth where rocks can slip'], ['tremor', 'a small shaking of the ground'], ['supplies', 'things you need, like water and food']],
    pages: [
      {heading: 'A Shaky State', text: 'California sits on top of many faults, which are long cracks deep inside the Earth. The rocks on each side of a fault are always pushing against each other. Most of the time they stay stuck, but when they suddenly slip, the ground shakes. That shaking is an earthquake.'},
      {heading: 'Big and Small Quakes', text: 'Most earthquakes are tiny tremors that people never even feel. Scientists use machines called seismometers to measure every one of them. A few times each century, a much larger earthquake shakes California hard enough to crack roads and knock things off shelves.'},
      {heading: 'Drop, Cover, Hold On', text: 'Experts agree on three steps to stay safe when the shaking starts. First, drop down onto your hands and knees. Next, cover your head and neck under a sturdy table or desk. Finally, hold on until the shaking stops. Running outside during the shaking is more dangerous than staying put.'},
      {heading: 'Get Ready Before', text: 'Families can prepare long before an earthquake happens. Many keep a kit with water, food that will not spoil, a flashlight, batteries and a first aid kit. They also choose a meeting place outside, so everyone knows where to go after the shaking ends.'},
      {heading: 'Practice Makes Calm', text: 'Every October, millions of people join a statewide drill called the Great ShakeOut. Schools and families practice drop, cover and hold on together. Practicing helps people stay calm, because their bodies already know what to do when a real earthquake comes.'}],
    questions: [
      {q: 'What causes an earthquake?', a: 'Rocks along a fault suddenly slip', wrong: ['Strong winds push the ground', 'Ocean waves hit the beach'], type: 'detail', evidence: 'Most of the time they stay stuck, but when they suddenly slip, the ground shakes.', mid: true},
      {q: 'What is the main idea of this book?', a: 'People in California can prepare for and stay safe in earthquakes', wrong: ['Earthquakes only happen in October', 'Seismometers stop earthquakes'], type: 'main idea'},
      {q: 'Why should you not run outside during the shaking?', a: 'It is more dangerous than staying put', wrong: ['Outside is always closed', 'Running makes the quake longer'], type: 'detail', evidence: 'Running outside during the shaking is more dangerous than staying put.'},
      {q: 'Why does the author describe the Great ShakeOut?', a: 'To show how practice helps people stay calm', wrong: ['To tell a funny story', 'To explain how faults form'], type: 'author purpose', evidence: 'Practicing helps people stay calm, because their bodies already know what to do when a real earthquake comes.'},
      {q: 'How do the headings help the reader?', a: 'They tell what each part is about', wrong: ['They show the answers to the questions', 'They list hard words'], type: 'text feature'},
      {q: 'What does "supplies" mean in this book?', a: 'Things you need, like water and food', wrong: ['A kind of earthquake', 'A safe meeting place'], type: 'vocabulary'}]}
];
