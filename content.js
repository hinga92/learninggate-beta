/* Learning Gate (family edition) — original content bank (Grade 1-centred; more grades in curriculum.js, skills.js, banks.js, lang-banks.js).
   Weights are a neutral starting point; the adaptive engine then gives more questions on whatever
   each child finds hard. The grade chosen in setup sets the starting level and the sight-word lists. */

const SKILLS = {
  // ---------- MATH ----------
  m_add10:     {subject:'math', label:'Adding within 10',            weight:1.2, std:'1.OA.6'},
  m_sub10:     {subject:'math', label:'Taking away within 10',       weight:1.2, std:'1.OA.6'},
  m_add20:     {subject:'math', label:'Adding within 20 (make a ten)',weight:1.2, std:'1.OA.6'},
  m_doubles:   {subject:'math', label:'Doubles and doubles + 1', weight:1.2, std:'1.OA.6'},
  m_sub20:     {subject:'math', label:'Subtracting within 20',       weight:1.2, std:'1.OA.6'},
  m_missing:   {subject:'math', label:'Find the missing number',     weight:1.2, std:'1.OA.8'},
  m_truefalse: {subject:'math', label:'True or false equations',     weight:1.0, std:'1.OA.7'},
  m_turn:      {subject:'math', label:'Turn-around facts (3+5 = 5+3)',weight:1.0, std:'1.OA.3'},
  m_factfam:   {subject:'math', label:'Fact families (+ and −)',     weight:1.0, std:'1.OA.4'},
  m_word:      {subject:'math', label:'Story problems',              weight:1.3, std:'1.OA.1'},
  m_place:     {subject:'math', label:'Tens and ones',               weight:1.1, std:'1.NBT.2'},
  m_compare:   {subject:'math', label:'Compare numbers (> < =)',     weight:1.0, std:'1.NBT.3'},
  m_count:     {subject:'math', label:'Counting to 120',             weight:1.0, std:'1.NBT.1'},
  m_shapes:    {subject:'math', label:'Shapes and their sides', weight:0.8, std:'1.G.1'},
  m_bond:      {subject:'math', label:'Number bonds & ten frames to number sentences', weight:1.1, std:'1.OA.6'},
  m_three:     {subject:'math', label:'Adding three numbers', weight:1.0, std:'1.OA.2'},
  m_rest:      {subject:'math', label:'Story problems: "the rest" and "some go away"', weight:1.0, std:'1.OA.1'},
  m_time:      {subject:'math', label:'Telling time',                weight:0.9, std:'1.MD.3'},
  m_measure:   {subject:'math', label:'Longer and shorter',          weight:0.8, std:'1.MD.1'},
  m_data:      {subject:'math', label:'Reading a picture graph',     weight:0.8, std:'1.MD.4'},
  // ---------- READING ----------
  r_end:       {subject:'reading', label:'Ending sounds',             weight:1.2, std:'RF.1.2'},
  r_begin:     {subject:'reading', label:'Beginning sounds',          weight:1.2, std:'RF.1.2'},
  r_syll:      {subject:'reading', label:'Clapping syllables',        weight:1.1, std:'RF.1.3e'},
  r_rhyme:     {subject:'reading', label:'Rhyming words',             weight:1.1, std:'RF.K.2a'},
  r_cvc:       {subject:'reading', label:'Reading short-vowel words', weight:1.4, std:'RF.1.3b'},
  r_digraph:   {subject:'reading', label:'sh, ch, th, wh',            weight:1.1, std:'RF.1.3a'},
  r_silente:   {subject:'reading', label:'Magic e words',             weight:1.0, std:'RF.1.3c'},
  r_sight:     {subject:'reading', label:'Sight words', weight:1.6, std:'RF.1.3g'},
  r_th:        {subject:'reading', label:'Th- words: they, there, that, this', weight:1.0, std:'RF.1.3g'},
  r_vocab:     {subject:'reading', label:'Word meanings & opposites', weight:1.1, std:'L.1.5'},
  r_comp:      {subject:'reading', label:'Story questions',           weight:1.4, std:'RL.1.1-3'},
  r_aloud:     {subject:'reading', label:'Reading out loud',          weight:1.5, std:'RF.1.4'},
  // ---------- WRITING ----------
  w_order:     {subject:'writing', label:'Build a sentence',          weight:1.3, std:'L.1.1j'},
  w_caps:      {subject:'writing', label:'Capitals and periods',      weight:1.2, std:'L.1.2'},
  w_spell:     {subject:'writing', label:'Spelling words',            weight:1.3, std:'L.1.2d'},
  w_punct:     {subject:'writing', label:'Telling or asking?',        weight:1.0, std:'L.1.2b'},
  // ---------- SCIENCE / ART / SOCIAL ----------
  s_earth:     {subject:'science', label:'Sun, moon, stars & weather',weight:1.3, std:'1-ESS1'},
  s_life:      {subject:'science', label:'Plants and animals',        weight:1.0, std:'1-LS1/LS3'},
  s_phys:      {subject:'science', label:'Light and sound',           weight:1.0, std:'1-PS4'},
  a_color:     {subject:'art',     label:'Colors and mixing',         weight:1.0, std:'VA.1'},
  a_pattern:   {subject:'art',     label:'Patterns',                  weight:1.0, std:'VA.1 / 1.OA'},
  a_art:       {subject:'art',     label:'Lines, shapes & music',     weight:0.8, std:'VA/MU.1'},
  ss_civics:   {subject:'social',  label:'Rules and being a good citizen', weight:0.7, std:'1.1'}
};

const SUBJECT_INFO = {
  math:    {name:'Math',    icon:'🔢', color:'#4C7BF3'},
  reading: {name:'Reading', icon:'📖', color:'#F2994A'},
  writing: {name:'Writing', icon:'✏️', color:'#9B51E0'},
  science: {name:'Science', icon:'🔬', color:'#27AE60'},
  art:     {name:'Art',     icon:'🎨', color:'#EB5757'},
  social:  {name:'Our World',icon:'🌎', color:'#2D9CDB'}
};

// Short-vowel (CVC) words with pictures
const CVC = [
  ['cat','🐱'],['dog','🐶'],['sun','☀️'],['bus','🚌'],['pig','🐷'],['hat','🎩'],['bed','🛏️'],
  ['fox','🦊'],['box','📦'],['bat','🦇'],['map','🗺️'],['pen','🖊️'],['web','🕸️'],['bug','🐛'],
  ['jet','✈️'],['van','🚐'],['hen','🐔'],['ten','🔟'],['six','6️⃣'],['nut','🥜'],['mug','☕'],
  ['log','🪵'],['bag','👜'],['cap','🧢'],['can','🥫'],['pan','🍳'],['pin','📌'],['tub','🛁'],
  ['run','🏃'],['hug','🤗'],['net','🥅'],['cup','🥤'],['lip','👄'],['zip','🤐'],['rat','🐀'],
  ['ham','🍖'],['fan','🪭'],['bun','🍔'],['kid','🧒'],['wig','💇'],['mop','🧽'],['pot','🍲']
];

const DIGRAPH = [
  ['ship','🚢','sh'],['shell','🐚','sh'],['fish','🐟','sh'],['shoe','👟','sh'],['brush','🪥','sh'],
  ['chick','🐥','ch'],['cheese','🧀','ch'],['chair','🪑','ch'],['lunch','🥪','ch'],['peach','🍑','ch'],
  ['thumb','👍','th'],['three','3️⃣','th'],['bath','🛁','th'],['teeth','🦷','th'],['moth','🦋','th'],
  ['whale','🐋','wh'],['wheel','🛞','wh'],['whisk','🥄','wh'],['whistle','📯','wh']
];

const SILENT_E = [
  ['cake','🎂','cak'],['bike','🚲','bik'],['kite','🪁','kit'],['rose','🌹','ros'],['cone','🍦','con'],
  ['cube','🧊','cub'],['gate','🚪','gat'],['home','🏠','hom'],['lake','🏞️','lak'],['plane','✈️','plan'],
  ['bone','🦴','bon'],['five','5️⃣','fiv'],['nine','9️⃣','nin'],['tape','📼','tap'],['mule','🫏','mul']
];

// Syllables (ISIP flagged: segmenting 2–3 syllable words)
const SYLL = [
  ['cat',1,'🐱'],['dog',1,'🐶'],['sun',1,'☀️'],['fish',1,'🐟'],['tree',1,'🌳'],['frog',1,'🐸'],
  ['apple',2,'🍎','ap-ple'],['rabbit',2,'🐰','rab-bit'],['monkey',2,'🐒','mon-key'],['pencil',2,'✏️','pen-cil'],
  ['rocket',2,'🚀','rock-et'],['tiger',2,'🐯','ti-ger'],['pizza',2,'🍕','piz-za'],['turtle',2,'🐢','tur-tle'],
  ['banana',3,'🍌','ba-na-na'],['butterfly',3,'🦋','but-ter-fly'],['dinosaur',3,'🦕','di-no-saur'],
  ['elephant',3,'🐘','el-e-phant'],['computer',3,'💻','com-pu-ter'],['umbrella',3,'☂️','um-brel-la'],
  ['tomato',3,'🍅','to-ma-to'],['octopus',3,'🐙','oc-to-pus'],['kangaroo',3,'🦘','kan-ga-roo'],['strawberry',3,'🍓','straw-ber-ry']
];

const RHYMES = [
  ['cat',['hat','bat','mat']],['dog',['log','frog','jog']],['sun',['run','fun','bun']],['bug',['rug','hug','mug']],
  ['pig',['big','wig','dig']],['hen',['ten','pen','men']],['cake',['lake','bake','snake']],['bee',['tree','three','see']],
  ['ball',['tall','wall','fall']],['star',['car','jar','far']],['king',['ring','sing','wing']],['boat',['goat','coat','float']]
];

// Sight words: the public-domain Dolch lists (pre-primer, primer, 1st, 2nd and 3rd grade).
// The three practice levels depend on the grade chosen in setup. A teacher's class word list
// (optional, Grown-ups → Grade and sight words) becomes level 1, and the Dolch words follow as stretch.
const _DOLCH = [
  ['a','and','away','big','blue','can','come','down','find','for','funny','go','help','here','I','in','is','it','jump','little','look','make','me','my','not','one','play','red','run','said','see','the','three','to','two','up','we','where','yellow','you'],
  ['all','am','are','at','ate','be','black','brown','but','came','did','do','eat','four','get','good','have','he','into','like','must','new','no','now','on','our','out','please','pretty','ran','ride','saw','say','she','so','soon','that','there','they','this','too','under','want','was','well','went','what','white','who','will','with','yes'],
  ['after','again','an','any','as','ask','by','could','every','fly','from','give','going','had','has','her','him','his','how','just','know','let','live','may','of','old','once','open','over','put','round','some','stop','take','thank','them','then','think','walk','were','when'],
  ['always','around','because','been','before','best','both','buy','call','cold','does',"don't",'fast','first','five','found','gave','goes','green','its','made','many','off','or','pull','read','right','sing','sit','sleep','tell','their','these','those','upon','us','use','very','wash','which','why','wish','work','would','write','your'],
  ['about','better','bring','carry','clean','cut','done','draw','drink','eight','fall','far','full','got','grow','hold','hot','hurt','if','keep','kind','laugh','light','long','much','myself','never','only','own','pick','seven','shall','show','six','small','start','ten','today','together','try','warm']];
// Dolch levels per grade: K = pre-primer / primer / 1st, Grade 1 = pre-primer+primer / 1st / 2nd, Grade 2 = 1st / 2nd / 3rd,
// Grade 3 = 2nd / 3rd / 3rd (sight-word practice ends in Grade 3; older grades work on vocabulary instead).
const DOLCH_BY_GRADE = {K: [[0], [1], [2]], '1': [[0, 1], [2], [3]], '2': [[2], [3], [4]], '3': [[3], [4], [3, 4]], '4': [[3], [4], [3, 4]], '5': [[3], [4], [3, 4]]};
const SIGHT = [[], [], []];   // filled by buildSight() once the settings are loaded, and again when they change
function buildSight(grade, classWords) {
  const lv = (DOLCH_BY_GRADE[grade] || DOLCH_BY_GRADE['1']).map(ix => [].concat(...ix.map(i => _DOLCH[i])));
  const cls = uniqWords(classWords || []);
  const levels = cls.length ? [cls, lv[0].concat(lv[1]).filter(w => !cls.includes(w)), lv[2].filter(w => !cls.includes(w))] : lv;
  levels.forEach((l, i) => { SIGHT[i] = l.length ? l : lv[i]; });
  return SIGHT;
}
// A teacher's list pasted by a grown-up: words separated by commas, spaces or new lines.
function uniqWords(list) {
  const text = (Array.isArray(list) ? list.join(' ') : String(list || '')).replace(/<[^>]*>/g, ' ');
  const words = text.split(/[^A-Za-z']+/).map(w => w.replace(/^'+|'+$/g, '')).filter(w => w.length && w.length <= 15);
  return [...new Set(words.map(w => w === 'I' ? w : w.toLowerCase()))].slice(0, 150);
}
buildSight('1', []);
const TH_WORDS = ['they','there','that','this','the','then','them','three','with'];
const TH_SENT = [['___ are my friends.','They'],['___ is my cat.','This'],['Look over ___!','there'],['I like ___ hat.','that'],['___ went to the park.','They'],['Is ___ your dog?','that'],['___ is my book.','This'],['Put it over ___.','there'],['Can ___ come and play?','they'],['I want ___ one.','this']];

const OPPOSITES = [
  ['hot','cold','🔥','🧊'],['big','small','🐘','🐭'],['up','down','⬆️','⬇️'],['happy','sad','😀','😢'],
  ['day','night','🌞','🌙'],['fast','slow','🐆','🐢'],['wet','dry','💧','🏜️'],['full','empty','🍯','🫙'],
  ['open','closed','📖','📕'],['in','out','📥','📤'],['loud','quiet','📢','🤫'],['tall','short','🦒','🐁'],
  ['many','few','🐝🐝🐝🐝🐝','🐝'],['young','old','👶','👵'],['awake','asleep','😃','😴'],['first','last','🥇','🏁']
];
const CATEGORIES = [
  ['fruit',['apple','banana','grape'],['chair','sock','bus','dog']],
  ['animals',['lion','frog','bird'],['spoon','hat','car','cake']],
  ['colors',['red','blue','green'],['run','cup','tree','fish']],
  ['things you wear',['shirt','shoe','hat'],['milk','ball','bird','rock']],
  ['things that go',['car','train','bike'],['bed','apple','book','lamp']],
  ['weather',['rain','snow','wind'],['fork','cat','door','pen']]
];

// Short stories for comprehension (original). q: [question, answer, wrong1, wrong2]
const STORIES = [
  {t:'Sam has a red kite. He runs up the hill. The wind lifts the kite up high. Sam is happy.',
   q:[['Who has a kite?','Sam','Mom','A dog'],['What color is the kite?','red','blue','green'],['Where does Sam run?','up the hill','to the shop','into the pond'],['How does Sam feel?','happy','sad','mad']]},
  {t:'Mia plants a seed in a pot. She gives it water and sun. Soon a little green sprout pops up.',
   q:[['What does Mia plant?','a seed','a rock','a toy'],['What does the seed need?','water and sun','milk and bread','snow and ice'],['What happens at the end?','a sprout pops up','the pot breaks','Mia goes to bed']]},
  {t:'It is raining. Ben puts on his boots and his coat. He jumps in a big puddle. Splash!',
   q:[['What is the weather?','rainy','sunny','snowy'],['What does Ben put on first?','his boots','his hat','his socks'],['What does Ben jump in?','a puddle','a box','a bed']]},
  {t:'The cat sat on the mat. A bug came by. The cat ran after the bug. The bug flew away.',
   q:[['Where did the cat sit?','on the mat','in a box','on a bed'],['What did the cat chase?','a bug','a ball','a dog'],['What did the bug do at the end?','flew away','went to sleep','ate the mat']]},
  {t:'Pip and Dad went to the park. They fed the ducks. Then they ate lunch under a big tree.',
   q:[['Who went to the park?','Pip and Dad','Pip and a cat','Mom and Ben'],['What did they feed?','the ducks','the fish','the dog'],['What did they do last?','ate lunch','fed the ducks','went home']]},
  {t:'Ted the turtle is slow. Fox is fast. They have a race. Ted keeps going and does not stop. Ted wins!',
   q:[['Who is slow?','Ted the turtle','Fox','the frog'],['What do they have?','a race','a party','a nap'],['Who wins the race?','Ted','Fox','no one'],['What is the lesson?','keep going','go to sleep','run away']]},
  {t:'Lily lost her red mitten. She looked under her bed. She looked in her bag. It was in her coat pocket!',
   q:[['What did Lily lose?','a mitten','a shoe','a book'],['Where did she look first?','under her bed','in the car','at school'],['Where was the mitten?','in her coat pocket','in her bag','under the bed']]},
  {t:'The sun went down. The sky got dark. Stars came out one by one. The moon was big and round.',
   q:[['What time of day is it?','night','morning','lunch time'],['What came out one by one?','stars','birds','cars'],['What shape was the moon?','round','square','flat']]},
  {t:'A big brown bear woke up in spring. He was very hungry. He went to the river and caught a fish.',
   q:[['When did the bear wake up?','in spring','at lunch','in winter'],['How did the bear feel?','hungry','sleepy','cold'],['What did the bear catch?','a fish','a ball','a bird']]},
  {t:'Nia made a card for her grandma. She drew a pink heart and wrote "I love you." Grandma smiled.',
   q:[['Who made the card?','Nia','Grandma','Dad'],['What did Nia draw?','a heart','a cat','a tree'],['How did Grandma feel?','happy','angry','tired']]},
  {t:'Jack has a pet fish named Bubbles. Every day he feeds Bubbles. He cleans the tank on Saturday.',
   q:[['What kind of pet does Jack have?','a fish','a dog','a bird'],['What is the pet\'s name?','Bubbles','Spot','Sunny'],['When does Jack clean the tank?','on Saturday','every day','never']]},
  {t:'The class went on a trip to the farm. They saw cows, pigs, and hens. A goat ate Zoe\'s hat!',
   q:[['Where did the class go?','to a farm','to a zoo','to the beach'],['What ate Zoe\'s hat?','a goat','a cow','a hen'],['Which animal did they see?','pigs','lions','sharks']]},
  {t:'Max wanted to build a tall tower. He stacked ten blocks. The tower fell down. Max tried again and made it stronger.',
   q:[['What did Max build?','a tower','a car','a boat'],['How many blocks did he stack?','ten','two','five'],['What did Max do when it fell?','tried again','cried all day','went to bed']]},
  {t:'In fall the leaves turn red, orange, and yellow. They fall off the trees. Kids jump in the leaf piles.',
   q:[['What season is it?','fall','summer','spring'],['What happens to the leaves?','they fall off','they turn blue','they grow bigger'],['What do the kids jump in?','leaf piles','the pool','the snow']]}
];

// Read-aloud sentences, level 1 (decodable CVC + sight words) → level 3
const ALOUD = [
  ['I see a cat.','The dog can run.','Look at the big sun.','I like my red hat.','The pig is in the mud.','We can go up.',
   'My mom has a bag.','The bug is on the rug.','I can see a fox.','A hen sat on a nest.','The cat and the dog play.','I can jump and run.'],
  ['The fish swims in the pond.','She has a pink ship.','We went to the park to play.','The frog can hop on a log.',
   'My dad and I like to read.','The duck is in the pond.','I want to ride my bike.','Look at the stars at night.',
   'The cake is on the plate.','We had fun at the lake.','Can you help me find my shoe?','The chick says peep peep.'],
  ['After lunch we went for a walk.','The little bird sang a song in the tree.','I put on my coat because it was cold.',
   'My friend and I made a tall tower.','The kite went up high in the blue sky.','When it rains, I jump in puddles.',
   'Every night I read a book with Dad.','The brown bear was very hungry.','Please give the puppy some water.','We saw three whales in the sea.']
];

// Sentences to build (writing: order words) — answer is the array order
const BUILD = [
  'I like to read.','The cat is big.','We can play.','My dog can run.','I see the moon.','She has a red ball.',
  'The sun is hot.','We go to school.','I love my dad.','The frog can jump.','Mom made a cake.','He is my friend.',
  'Look at the bird.','I can help you.','The bus is yellow.'
];

const SCIENCE = {
  s_earth: [
    ['What gives us light in the day?','the sun','the moon','a lamp','☀️'],
    ['When can we see the stars?','at night','at lunch','in the morning','⭐'],
    ['Which season is the coldest?','winter','summer','spring','❄️'],
    ['What do we need on a rainy day?','an umbrella','sunglasses','a sled','☔'],
    ['The sun rises in the…','morning','night','middle of the night','🌅'],
    ['What shape is a full moon?','a circle','a square','a triangle','🌕'],
    ['Leaves fall off trees in…','fall','summer','spring','🍂'],
    ['What is snow made of?','frozen water','sugar','cotton','❄️'],
    ['Why is it dark at night?','our side of Earth faces away from the sun','the sun turns off','clouds eat the light','🌍'],
    ['Which season is the hottest?','summer','winter','fall','🏖️']
  ],
  s_life: [
    ['What does a plant need to grow?','water and sunlight','candy','toys','🌱'],
    ['A baby frog is called a…','tadpole','puppy','kitten','🐸'],
    ['A baby dog is called a…','puppy','calf','chick','🐶'],
    ['What part of a plant is under the ground?','roots','flower','leaf','🌿'],
    ['Which animal has feathers?','bird','fish','dog','🐦'],
    ['A fish uses its gills to…','breathe','see','eat','🐟'],
    ['A cactus can live in the…','desert','ocean','freezer','🌵'],
    ['A baby cat is called a…','kitten','cub','lamb','🐱'],
    ['Which animal lives in water?','whale','camel','horse','🐋'],
    ['A caterpillar turns into a…','butterfly','bird','snake','🦋'],
    ['How do baby animals look compared to their parents?','a lot like them','nothing like them','like a rock','🐣']
  ],
  s_phys: [
    ['What makes a sound when you hit it?','a drum','a pillow','a cloud','🥁'],
    ['Sound is made when something…','vibrates (shakes)','sleeps','melts','🔔'],
    ['What do we need to see in a dark room?','light','sound','water','💡'],
    ['A shadow happens when something blocks…','light','sound','wind','🌳'],
    ['Light can go through…','glass','a wall','a book','🪟'],
    ['Which one is loud?','a fire truck siren','a whisper','a feather','🚒'],
    ['A mirror can…','reflect light','eat food','make rain','🪞'],
    ['Pushing a toy car makes it…','move','melt','sing','🚗']
  ]
};

const ART = {
  a_color: [
    ['red + yellow makes…','orange','green','purple','🟥🟨'],
    ['blue + yellow makes…','green','orange','pink','🟦🟨'],
    ['red + blue makes…','purple','green','brown','🟥🟦'],
    ['red + white makes…','pink','black','blue','🟥⬜'],
    ['Which is a primary color?','blue','green','orange','🎨'],
    ['Which is a primary color?','yellow','purple','pink','🎨'],
    ['What color is the sky on a sunny day?','blue','green','red','🌤️'],
    ['What color do you get if you mix ALL the paints?','brown','white','yellow','🖌️']
  ],
  a_art: [
    ['A line that goes up and down like this ~~~ is…','wavy','straight','dotted','〰️'],
    ['An artist who paints pictures is a…','painter','baker','driver','👩‍🎨'],
    ['Which tool do you use to paint?','a brush','a spoon','a shoe','🖌️'],
    ['A song can be loud or…','soft','tall','green','🎵'],
    ['Which one is an instrument?','a guitar','a carrot','a sock','🎸'],
    ['A picture of a person\'s face is a…','portrait','map','list','🖼️'],
    ['When you dance you move your…','body','house','car','💃'],
    ['How many sides does a triangle in your drawing have?','3','4','5','🔺']
  ]
};

const CIVICS = [
  ['What should you do if you want to talk in class?','raise your hand','shout','run around','✋'],
  ['A good friend…','shares','grabs toys','pushes','🤝'],
  ['Who helps put out fires?','firefighters','bakers','pilots','🚒'],
  ['Why do we have rules?','to keep us safe','to make us sad','for no reason','📋'],
  ['What do you do with trash?','put it in the bin','throw it on the ground','hide it','🗑️'],
  ['If you borrow a crayon, you should…','give it back','keep it','break it','🖍️'],
  ['Who helps us when we are sick?','a doctor','a mail carrier','a farmer','🩺'],
  ['What does a red light mean?','stop','go','dance','🚦'],
  ['Long ago, people wrote letters. Today we can also…','send a text or video call','fly on a dragon','talk to fish','📱']
];

const NAMES = ['Ava','Sam','Mia','Ben','Lily','Max','Zoe','Leo','Nia','Jack','Amani','Kofi'];
const THINGS = [['apples','🍎'],['stars','⭐'],['ducks','🦆'],['cookies','🍪'],['balls','⚽'],['fish','🐟'],['flowers','🌸'],['cars','🚗'],['books','📚'],['birds','🐦']];
const PRAISE = ['Great job!','You got it!','Super!','Way to go!','Awesome!','Fantastic!','You are a star!','Brilliant!','Yes!','Nice thinking!'];
const TRYAGAIN = ['Almost! Try again.','Good try! Look again.','Hmm, try one more time.','Not quite. You can do it!'];
