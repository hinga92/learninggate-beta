'use strict';
/* Leveled books Grades 2–3 (original). Appended to LEVELED_BOOKS by leveled.js. */
const BOOKS_23 = [
  /* ---------------- Grade 2 ---------------- */
  {id: "g2-bread-day", band: "2", lvl: 1, series: "Pip and Friends", title: "Baking with Grandma Amina", cover: "🍞", bg: "farm", kind: "fiction",
    vocab: [["dough", "a soft mix of flour and water that becomes bread"], ["swept", "cleaned the floor with a broom"], ["golden", "a warm, shiny yellow color like gold"]],
    pages: [
      {icon: "🏠", text: "Juma went to see Grandma Amina on Sunday. Pip the chick came too. Grandma had a big bowl on the table. \"Today we will bake bread,\" she said."},
      {icon: "🥣", text: "Grandma poured flour into the bowl. Juma added water and a little salt. Pip helped mix it with a spoon. The dough felt soft and sticky."},
      {icon: "💨", text: "Then Juma bumped the bag of flour. Puff! White flour flew all over the floor. Pip looked like a little snowman, and Juma felt bad."},
      {icon: "🧹", text: "\"It is okay,\" said Grandma with a smile. \"We can fix it.\" Juma got the broom and swept the floor. Pip shook his feathers clean."},
      {icon: "🍳", text: "Grandma rolled the dough into flat circles. She cooked them in a hot pan until they turned golden brown. The kitchen smelled sweet and warm."},
      {icon: "😋", text: "They ate the warm bread together. \"Next time I will be more careful,\" said Juma. Grandma gave him a hug. \"Next time, you can roll the dough,\" she said."}],
    questions: [
      {q: "Who did Juma visit on Sunday?", a: "Grandma Amina", wrong: ["His teacher", "His friend Ben"], type: "detail"},
      {q: "What happened when Juma bumped the bag?", a: "Flour flew all over the floor", wrong: ["The bread burned", "The bowl broke"], type: "sequence"},
      {q: "What did Juma do after the flour spilled?", a: "He swept the floor with a broom", wrong: ["He went outside to play", "He hid under the table"], type: "character"},
      {q: "What is \"dough\" in this story?", a: "A soft mix of flour and water", wrong: ["A kind of hot pan", "A small broom"], type: "vocabulary"}]},

  {id: "g2-seed-plant", band: "2", lvl: 2, series: "Pip Learns Science", title: "From Seed to Plant", cover: "🌱", bg: "grass", kind: "informational",
    vocab: [["soil", "the dirt where plants grow"], ["sprout", "a young plant that is just starting to grow"], ["cycle", "something that happens again and again in the same order"]],
    pages: [
      {heading: "What Is a Seed?", icon: "🌰", text: "A seed is a tiny package. Inside it is a baby plant and some food. The seed coat keeps the baby plant safe."},
      {heading: "Seeds Need Water", icon: "💧", text: "A seed waits in the soil. When rain makes the soil wet, the seed soaks up water. Then it starts to swell and grow."},
      {heading: "Roots Grow Down", icon: "🥕", text: "First, a little root pokes out of the seed. The root grows down into the soil. It drinks water and holds the plant in place."},
      {heading: "A Sprout Grows Up", icon: "☀️", text: "Next, a green sprout pushes up toward the light. Soon it opens its first leaves. The leaves use sunlight to make food for the plant."},
      {heading: "A New Plant", icon: "🌻", text: "The plant grows taller and stronger each day. One day it may grow flowers. The flowers make new seeds, and the cycle starts again."}],
    questions: [
      {q: "What is this book mostly about?", a: "How a seed grows into a plant", wrong: ["How to cook beans", "Why rain falls from clouds"], type: "main idea"},
      {q: "What comes out of the seed first?", a: "A little root", wrong: ["A flower", "A green leaf"], type: "sequence"},
      {q: "Which heading tells you what roots do?", a: "Roots Grow Down", wrong: ["What Is a Seed?", "A New Plant"], type: "text feature"},
      {q: "What does \"sprout\" mean in this book?", a: "A young plant just starting to grow", wrong: ["The hard coat on a seed", "A big yellow flower"], type: "vocabulary"}]},

  {id: "g2-rainy-day", band: "2", lvl: 3, series: "Pip and Friends", title: "The Rainy Day Fort", cover: "🌧️", bg: "rain", kind: "fiction",
    vocab: [["cozy", "warm and comfy"], ["cheered", "shouted in a happy way"], ["windowsill", "the flat ledge at the bottom of a window"]],
    pages: [
      {icon: "🌧️", text: "Rain tapped on the window all morning. Lucia and her friend Ben could not play outside. Pip sat on the windowsill and watched the gray sky."},
      {icon: "😠", text: "\"Let’s build a fort,\" said Lucia. \"No, let’s play a card game,\" said Ben. They both crossed their arms. Nobody was having any fun."},
      {icon: "🐥", text: "Pip hopped down from the window. \"Why not do both?\" he peeped. Lucia and Ben looked at each other. Maybe Pip had a good idea."},
      {icon: "🏰", text: "They pulled blankets over two chairs to make a fort. Then they took the cards inside. The fort was dark and cozy, so they used a flashlight to see."},
      {icon: "🃏", text: "They played cards in the fort until lunch. Ben won one game, and Lucia won the next. Pip won the last game, and they all cheered."},
      {icon: "🌈", text: "After lunch, the rain stopped and a rainbow came out. \"That was the best rainy day,\" said Ben. Lucia smiled. \"Working together made it fun,\" she said."}],
    questions: [
      {q: "Why could Lucia and Ben not play outside?", a: "It was raining", wrong: ["It was dark", "They were sick"], type: "detail"},
      {q: "What problem did Lucia and Ben have?", a: "They each wanted to play a different game", wrong: ["They lost their cards", "Pip ran away"], type: "character"},
      {q: "How did they solve the problem?", a: "They built a fort and played cards inside it", wrong: ["They went to the park", "They watched the rain all day"], type: "character"},
      {q: "What does \"cozy\" mean in the story?", a: "Warm and comfy", wrong: ["Cold and wet", "Loud and busy"], type: "vocabulary"}]},

  {id: "g2-town-helpers", band: "2", lvl: 4, series: "Pip Learns About People", title: "Helpers in Our Town", cover: "🚒", bg: "park", kind: "informational",
    vocab: [["neighbor", "a person who lives near you"], ["librarian", "a person who helps people find books in a library"], ["aloud", "out loud so others can hear"], ["safely", "without getting hurt"]],
    pages: [
      {heading: "Many Helpers", icon: "🏘️", text: "A town needs many helpers to keep it safe, clean and happy. Some helpers work outside all day. Others work inside buildings. Let’s meet a few of them."},
      {heading: "Mail Carrier", icon: "📬", text: "Tom Kim is a mail carrier. Every day he brings letters and boxes to each home on his street. He walks in the sun, the wind and even the rain."},
      {heading: "Firefighter", icon: "🚒", text: "Rosa is a firefighter. She puts out fires and helps people who are hurt. She also visits schools to teach kids how to stay safe."},
      {heading: "Librarian", icon: "📚", text: "Ayana is a librarian. She helps children find books they will enjoy. On Saturday she reads stories aloud to a big group of kids."},
      {heading: "Crossing Guard", icon: "🚸", text: "Luis is a crossing guard. He stands at a busy corner near the school. He holds up a bright stop sign so kids can cross the street safely."},
      {heading: "You Can Help", icon: "💛", text: "You can be a helper, too. You can pick up trash, share with a friend or help a neighbor. Every helper makes the town a better place."}],
    questions: [
      {q: "What is the main topic of this book?", a: "People who help in a town", wrong: ["How to mail a letter", "How fires start"], type: "main idea"},
      {q: "How does Luis keep kids safe?", a: "He holds up a stop sign so they can cross", wrong: ["He reads them stories", "He brings them letters"], type: "detail"},
      {q: "Which heading tells about the helper who reads stories aloud?", a: "Librarian", wrong: ["Firefighter", "Mail Carrier"], type: "text feature"},
      {q: "What does \"neighbor\" mean in this book?", a: "A person who lives near you", wrong: ["A kind of street sign", "A big fire truck"], type: "vocabulary"}]},

  {id: "g2-ant-dove", band: "2", lvl: 5, series: "Pip’s Fables", title: "The Ant and the Dove", cover: "🕊️", bg: "grass", kind: "fiction",
    vocab: [["shore", "the land at the edge of the water"], ["floated", "stayed on top of the water"], ["crept", "moved slowly and quietly"]],
    pages: [
      {icon: "🐜", text: "One hot day, a little ant walked down to the river for a drink. She leaned too far, and splash! The fast water carried her away."},
      {icon: "🕊️", text: "A dove sat in a tree near the river. She saw the ant trying to swim. Quickly, the dove dropped a leaf into the water right next to her."},
      {icon: "🍃", text: "The ant climbed onto the leaf and floated to the shore. \"Thank you, kind dove,\" she said. \"Someday I will help you, too.\" The dove wondered how a tiny ant could ever help a bird."},
      {icon: "🥅", text: "A few days later, a man came to the river with a big net. He wanted to catch a bird to keep in a cage. He saw the dove resting in the tree, and he crept closer."},
      {icon: "🦶", text: "The ant saw what was happening. She ran up to the man and bit his foot as hard as she could. \"Ouch!\" he cried, and he dropped the net."},
      {icon: "🌳", text: "The noise made the dove fly safely away. Later, she found the ant and thanked her. Now they both knew that even a small friend can be a big help."}],
    questions: [
      {q: "Why did the dove drop a leaf into the water?", a: "To help the ant get out of the river", wrong: ["To make a boat for herself", "To feed the fish"], type: "detail"},
      {q: "What did the ant do to help the dove?", a: "She bit the man’s foot", wrong: ["She built the dove a nest", "She called other birds"], type: "sequence"},
      {q: "What is the lesson of this fable?", a: "Even a small friend can be a big help", wrong: ["Birds are faster than ants", "Never go near a river"], type: "theme"},
      {q: "What does \"crept\" mean in the story?", a: "Moved slowly and quietly", wrong: ["Jumped up high", "Ran away fast"], type: "vocabulary"}]},

  {id: "g2-monarchs", band: "2", lvl: 6, series: "Pip Explores California", title: "Monarchs on the Move", cover: "🦋", bg: "sky", kind: "informational",
    vocab: [["migration", "a long trip some animals take at the same time each year"], ["huddling", "staying very close together"], ["milkweed", "a plant that baby monarchs eat"], ["hatches", "comes out of an egg"]],
    pages: [
      {heading: "Orange and Black", icon: "🦋", text: "Monarch butterflies have bright orange wings with black lines and white dots. Their bright colors tell birds to stay away. Monarchs taste bad to most birds."},
      {heading: "A Long Trip", icon: "🗺️", text: "Each fall, many monarchs fly to the coast of California. Some fly hundreds of miles to get there. This long trip is called a migration."},
      {heading: "Winter in the Trees", icon: "🌲", text: "Along the coast, the monarchs rest in tall trees. Thousands of them hang together in big bunches. Huddling close helps them stay warm on cool nights."},
      {heading: "Spring Flight", icon: "🌼", text: "When spring comes, the monarchs fly away to find milkweed plants. They lay tiny eggs on the leaves. Milkweed is the only food the baby caterpillars eat."},
      {heading: "From Egg to Wing", icon: "🐛", text: "A caterpillar hatches from each egg, and it eats and eats. Then it hangs upside down and makes a hard green case. After about two weeks, a new butterfly comes out."},
      {heading: "Help the Monarchs", icon: "🌱", text: "People can help monarchs by planting milkweed in yards and parks. With more milkweed, more monarchs can grow up and make the long trip each year."}],
    questions: [
      {q: "What is this book mostly about?", a: "Monarch butterflies and their long trip", wrong: ["How birds build nests", "Why trees lose their leaves"], type: "main idea"},
      {q: "Where do many monarchs go in the fall?", a: "To the coast of California", wrong: ["To the top of a mountain", "To a big city"], type: "detail"},
      {q: "What does \"migration\" mean in this book?", a: "A long trip animals take each year", wrong: ["A kind of tall tree", "A baby butterfly"], type: "vocabulary"},
      {q: "Under which heading can you read about what monarchs do in spring?", a: "Spring Flight", wrong: ["Orange and Black", "Winter in the Trees"], type: "text feature"}]},

  /* ---------------- Grade 3 ---------------- */
  {id: "g3-moon-lantern", band: "3", lvl: 2, series: "Pip and Friends", title: "Mei’s Moon Lantern", cover: "🏮", bg: "party", kind: "fiction",
    vocab: [["celebrates", "does something special for a happy day"], ["frame", "the shape that holds something up"], ["parade", "a group of people moving down a street to celebrate"], ["proud", "happy about something you did well"]],
    pages: [
      {icon: "🌕", text: "Every fall, Mei’s family celebrates the Moon Festival. Families gather outside to share sweet mooncakes and look at the full moon. This year, Mei wanted to make her very own paper lantern to carry in the evening parade."},
      {icon: "🏮", text: "Her grandfather sat beside her at the kitchen table. He showed her how to bend thin sticks into a round frame and tie the ends with string. Mei worked slowly and carefully. It took her the whole afternoon to finish the frame."},
      {icon: "🐇", text: "Next, Mei glued red paper around the frame. She painted a white rabbit on one side, because Grandpa had told her an old story about a rabbit who lives on the moon. When she held it up, the lantern looked bright and cheerful."},
      {icon: "🐈", text: "Just then, her little brother Jun ran into the kitchen chasing the cat. He bumped the table, and the lantern rolled onto the floor. A long tear split the red paper right through the rabbit. Mei’s heart sank all the way to her toes."},
      {icon: "🤔", text: "Jun’s eyes filled with tears. \"I’m sorry,\" he said quietly. Mei wanted to shout, but she took a deep breath instead. She remembered that Jun had not meant to do it. \"Let’s fix it together,\" she said."},
      {icon: "✂️", text: "Grandpa brought out some yellow paper. Mei cut it into the shape of a big round moon, and Jun helped glue it over the tear. Now the rabbit looked like it was sitting right on top of the moon. \"It is even better than before,\" Grandpa said."},
      {icon: "🎆", text: "That night, Mei and Jun carried the lantern in the parade together. A small light inside made the yellow moon shine. Mei felt proud, not because her lantern was perfect, but because she had stayed calm and turned a problem into something new."}],
    questions: [
      {q: "How did Grandpa help Mei make the frame?", a: "He showed her how to bend sticks and tie them with string", wrong: ["He folded a paper plate for her", "He bought a frame at the store"], type: "detail", mid: true, evidence: "He showed her how to bend thin sticks into a round frame and tie the ends with string."},
      {q: "What does \"Mei’s heart sank all the way to her toes\" mean?", a: "She felt very sad and disappointed", wrong: ["Her heart fell onto the floor", "She hurt her foot"], type: "vocabulary"},
      {q: "Which words best describe Mei?", a: "Patient and calm", wrong: ["Lazy and careless", "Bossy and loud"], type: "character", evidence: "Mei wanted to shout, but she took a deep breath instead."},
      {q: "Why did Mei decide not to shout at Jun?", a: "She knew he had not meant to tear the lantern", wrong: ["She was too tired to talk", "Grandpa told her to be quiet"], type: "character"},
      {q: "What is the message of this story?", a: "Staying calm can turn a problem into something new", wrong: ["Lanterns should never be painted", "Little brothers should never play inside"], type: "theme"}]},

  {id: "g3-redwoods", band: "3", lvl: 3, series: "Pip Explores California", title: "Giants of the Redwood Forest", cover: "🌲", bg: "park", kind: "informational",
    vocab: [["narrow", "thin, not wide"], ["survive", "to stay alive"], ["damp", "a little bit wet"], ["protected", "kept safe from harm"]],
    pages: [
      {heading: "The Tallest Trees", icon: "🌲", text: "Coast redwoods are the tallest trees on Earth. Some are taller than a building with thirty floors. They grow in a narrow strip of land along the foggy coast of Northern California. Standing next to one, a person looks as small as an ant."},
      {heading: "Drinking the Fog", icon: "🌫️", text: "In summer, it hardly ever rains near the coast. Instead, thick fog rolls in from the ocean almost every morning. The fog collects on the redwood needles and drips down to the roots like rain. Redwoods can even soak up some water right through their needles."},
      {heading: "Thick Bark", icon: "🔥", text: "Redwood bark is soft, red and very thick. It holds lots of water and has very little sap, so it does not burn easily. Because of this bark, many redwoods survive forest fires that would harm other trees."},
      {heading: "Old, Old Trees", icon: "⏳", text: "Redwoods can live for more than two thousand years. Some trees standing today were already tall when the first books were printed. Scientists can count the rings inside a fallen tree to learn its age. Each ring stands for one year of growth."},
      {heading: "Family Circles", icon: "⭕", text: "When an old redwood falls, new sprouts often grow up from its roots. These young trees form a ring around the spot where the parent tree once stood. People call these rings family circles. In this way, one tree can keep growing for a very long time."},
      {heading: "A Home for Many", icon: "🦉", text: "Redwood forests are home to many living things. Banana slugs creep across the damp forest floor. Owls nest high in the branches, and some salamanders hide in moss far above the ground. A few animals spend their whole lives in the treetops and never touch the soil."},
      {heading: "Protecting the Giants", icon: "🏞️", text: "Long ago, people cut down most of the old redwoods for wood. Today, many of the trees that are left are protected in state and national parks. Visitors can walk along quiet trails and look up, up, up at these amazing giants."}],
    questions: [
      {q: "How do redwoods get water in the dry summer?", a: "Fog drips from their needles down to the roots", wrong: ["They grow right next to rivers", "People water them every day"], type: "detail", mid: true, evidence: "The fog collects on the redwood needles and drips down to the roots like rain."},
      {q: "What is the main idea of this book?", a: "Redwoods are giant trees with special ways to survive", wrong: ["Redwoods grow best in the desert", "Owls are the biggest animals in the forest"], type: "main idea"},
      {q: "Why do many redwoods survive forest fires?", a: "Their thick bark holds water and does not burn easily", wrong: ["They grow too tall for fire to reach", "Firefighters guard every tree"], type: "detail", evidence: "It holds lots of water and has very little sap, so it does not burn easily."},
      {q: "Which heading would help you learn how old redwoods can be?", a: "Old, Old Trees", wrong: ["Drinking the Fog", "A Home for Many"], type: "text feature"},
      {q: "What are family circles in this book?", a: "Rings of young trees around the spot where an old tree stood", wrong: ["Groups of people who visit the parks", "The rings inside a tree trunk"], type: "vocabulary"}]},

  {id: "g3-stone-soup", band: "3", lvl: 4, series: "Pip’s Fables", title: "Pip and the Stone Soup", cover: "🍲", bg: "farm", kind: "fiction",
    vocab: [["chilly", "a little bit cold"], ["village", "a small town"], ["curious", "wanting to know or learn about something"], ["announced", "said something out loud for everyone to hear"]],
    pages: [
      {icon: "🛤️", text: "One chilly evening, Pip the chick walked into a small village. He was tired and hungry after a long day of travel. He knocked on doors to ask for a little food, but each family shook their heads. \"We barely have enough for ourselves,\" they said."},
      {icon: "🪨", text: "Pip did not give up. He found a smooth gray stone by the road and carried it to the middle of the village. Then he asked a girl named Amara if he could borrow a big pot. \"I am going to make stone soup,\" he announced."},
      {icon: "🔥", text: "Amara was curious, so she brought the pot and helped fill it with water. Pip built a small fire and dropped the stone inside. Soon a few neighbors came out to see what was going on. \"Soup from a stone?\" an old man laughed. \"That I have to see.\""},
      {icon: "🥕", text: "Pip stirred the pot and took a sip. \"This is good soup,\" he said, \"but a carrot would make it even better.\" A woman ran home and came back with three carrots. She dropped them into the bubbling water."},
      {icon: "🧅", text: "\"Mmm,\" said Pip. \"Now if only we had an onion.\" A boy brought an onion, and another family added potatoes. Someone else brought beans and a pinch of salt. Each person gave just a little, but the pot grew fuller and fuller."},
      {icon: "🍲", text: "At last, the soup was ready. It smelled so wonderful that the whole village gathered around. There was plenty for everyone, with bowls left over. People who had not talked in weeks sat together, laughing and sharing stories."},
      {icon: "🌙", text: "The old man shook Pip’s wing. \"That stone must be magic,\" he said. Pip smiled and handed the stone to Amara. \"The magic was not in the stone,\" he said. \"It was in all of you sharing together.\""}],
    questions: [
      {q: "Why did the families say no to Pip at first?", a: "They said they barely had enough food for themselves", wrong: ["They did not like chicks", "They were all asleep"], type: "detail", mid: true},
      {q: "Which word best describes Pip?", a: "Clever", wrong: ["Lazy", "Greedy"], type: "character", evidence: "Pip did not give up."},
      {q: "Why did Pip say a carrot would make the soup better?", a: "He wanted the villagers to add food to share", wrong: ["He did not like the taste of stones", "He wanted to plant a garden"], type: "inference"},
      {q: "What does \"curious\" mean in the story?", a: "Wanting to know about something", wrong: ["Very angry", "Very sleepy"], type: "vocabulary"},
      {q: "What is the lesson of this folk tale?", a: "When everyone shares a little, there is enough for all", wrong: ["Stones make the best soup", "Never travel at night"], type: "theme"}]},

  {id: "g3-desert", band: "3", lvl: 5, series: "Pip Explores California", title: "Surviving in the Desert", cover: "🌵", bg: "farm", kind: "informational",
    vocab: [["spines", "sharp, pointy parts on a cactus"], ["burrows", "holes or tunnels that animals dig to live in"], ["shelter", "a safe place to stay"], ["sprout", "to start to grow"]],
    pages: [
      {heading: "A Dry Land", icon: "🏜️", text: "The Mojave Desert stretches across the southeast part of California. It gets less than five inches of rain in a whole year. Summer days are scorching hot, but winter nights can be cold enough for frost. Plants and animals that live here need clever ways to survive."},
      {heading: "Plants That Save Water", icon: "🌵", text: "Cactus plants store water inside their thick, fleshy stems. Their sharp spines are really leaves that lose very little water, and they also keep thirsty animals away. A waxy coat on the outside keeps water in, the way a raincoat keeps water out."},
      {heading: "Roots That Spread", icon: "🌿", text: "Desert plants have special roots, too. Some cactus roots spread out wide, just under the ground, so they can catch every drop when it rains. The mesquite tree does the opposite. Its roots grow very deep, sometimes deeper than a ten story building, to reach water far below."},
      {heading: "Joshua Trees", icon: "🌴", text: "The Joshua tree is a famous plant of the Mojave. It is not really a tree at all, but a kind of yucca plant with spiky leaves. Its twisted branches give shade and shelter to birds, lizards and insects. Many people think its arms look like they are waving hello."},
      {heading: "Animals Beat the Heat", icon: "🦎", text: "Many desert animals stay out of the hot sun. Kangaroo rats and desert tortoises dig burrows underground, where it is much cooler. They come out at night or early in the morning. The kangaroo rat gets almost all of the water it needs from the seeds it eats."},
      {heading: "Big Ears, Cool Body", icon: "🦊", text: "The kit fox has very large ears for its small body. Heat leaves its body through its big ears, which helps the fox stay cool. Its hearing is so good that it can hear tiny animals moving under the sand."},
      {heading: "After the Rain", icon: "🌸", text: "In a wet spring, something surprising happens. Seeds that have waited in the dry ground for years suddenly sprout. Within weeks, the desert bursts with yellow, purple and orange wildflowers. This colorful show is called a superbloom."}],
    questions: [
      {q: "How do cactus plants save water?", a: "They store water in their thick stems", wrong: ["They drink from nearby rivers", "They grow big, flat leaves"], type: "detail", mid: true, evidence: "Cactus plants store water inside their thick, fleshy stems."},
      {q: "What is the main idea of this book?", a: "Desert plants and animals have special ways to survive heat and little water", wrong: ["The Mojave Desert is the rainiest place in California", "Kit foxes are the only animals in the desert"], type: "main idea"},
      {q: "Why do kangaroo rats dig burrows?", a: "It is much cooler underground", wrong: ["To find snow", "To store rain water"], type: "detail", evidence: "Kangaroo rats and desert tortoises dig burrows underground, where it is much cooler."},
      {q: "In \"the desert bursts with wildflowers,\" what does \"bursts with\" mean?", a: "Is suddenly full of", wrong: ["Breaks into pieces", "Makes a loud pop"], type: "vocabulary"},
      {q: "Which heading tells you where to read about the kit fox?", a: "Big Ears, Cool Body", wrong: ["Joshua Trees", "After the Rain"], type: "text feature"}]},

  {id: "g3-market-voice", band: "3", lvl: 6, series: "Pip and Friends", title: "Diego’s Big Voice", cover: "🥑", bg: "party", kind: "fiction",
    vocab: [["customers", "people who buy things"], ["shy", "nervous or quiet around other people"], ["croaked", "spoke in a rough, low voice"], ["propped", "set something up so it would stand"]],
    pages: [
      {icon: "🧺", text: "Every Saturday, Diego helped his grandmother, Abuela Rosa, at the farmers market. Her stand sold fresh tortillas, ripe avocados and jars of spicy salsa. Diego loved stacking the avocados into neat green piles. But he never, ever talked to the customers."},
      {icon: "😶", text: "Diego was shy. When people walked up to the table, his voice seemed to hide somewhere deep in his throat. He let Abuela do all the talking while he stared at his shoes. \"Someday you will find your big voice,\" Abuela always said with a wink."},
      {icon: "🍵", text: "One Saturday morning, Abuela woke up with a sore throat. She could only whisper. \"I can still pack the bags,\" she croaked, \"but you will have to talk to the customers today.\" Diego felt butterflies fluttering in his stomach."},
      {icon: "🤔", text: "At the market, the first customer stopped and looked at the jars. Diego opened his mouth, but nothing came out. The woman shrugged and walked away. Diego’s cheeks burned. He had to find another way to help Abuela."},
      {icon: "🖍️", text: "Then Diego had an idea. He grabbed some paper and markers from the truck. On one sign he wrote, Fresh Tortillas Made This Morning. On another he drew a smiling avocado and wrote, Ask Me About Our Salsa. He propped the signs up where everyone could see them."},
      {icon: "🥑", text: "Soon a man pointed at the smiling avocado and laughed. \"Okay, tell me about your salsa,\" he said. Diego took a deep breath and explained that Abuela made it with tomatoes from their own garden. The man tasted a chip and bought two jars."},
      {icon: "😊", text: "After that, talking got a little easier each time. By noon, Diego was greeting every customer with a smile, and the table was almost empty. Abuela squeezed his hand. \"You found your big voice,\" she whispered. Diego grinned and thought that maybe his voice had been there all along, just waiting for a reason to come out."}],
    questions: [
      {q: "Why did Diego have to talk to the customers this time?", a: "Abuela had a sore throat and could only whisper", wrong: ["Abuela went home early", "The market was closed"], type: "detail", mid: true, evidence: "One Saturday morning, Abuela woke up with a sore throat."},
      {q: "What does \"Diego felt butterflies fluttering in his stomach\" mean?", a: "He felt nervous", wrong: ["He ate some butterflies", "He was very hungry"], type: "vocabulary"},
      {q: "Why did Diego make the signs?", a: "He wanted to help Abuela even though talking was hard", wrong: ["He wanted to practice drawing", "Abuela asked him to color"], type: "character", evidence: "He had to find another way to help Abuela."},
      {q: "How does Diego change from the beginning to the end?", a: "He goes from shy to confident", wrong: ["He goes from brave to scared", "He goes from happy to angry"], type: "character"},
      {q: "What is the message of this story?", a: "A challenge can help you find courage you already had", wrong: ["Signs are always better than talking", "Markets are only fun on Saturdays"], type: "theme"}]}
];
