/* Home library: shelves of the family's own paper books (titles and our own questions only, never text from the books).
   A new family starts with one sample shelf of classic folk tales (public domain, any edition works).
   Each family adds their own books in Grown-ups → 🏠 Home library → ＋ Add a book.
   To ship extra shelves with a build, add entries like the sample below. */
'use strict';
const HOME_LIBRARY = [
  {series: 'Classic tales (sample shelf)', author: 'Folk tale', mode: 'together', icon: '📙', note: 'Old stories every library has, to read together and talk about',
    books: [
      {id: 'tale-hen', title: 'The Little Red Hen', qs: ['Who helped the Little Red Hen?', 'Why did the hen eat the bread by herself?', 'When do you help at home?']},
      {id: 'tale-pigs', title: 'The Three Little Pigs', qs: ['What did each pig build a house with?', 'Which house was the strongest? Why?', 'What would you build your house with?']},
      {id: 'tale-goldi', title: 'Goldilocks and the Three Bears', qs: ['What did Goldilocks try first?', 'How did the bears feel when they came home?', 'What should Goldilocks have done?']},
      {id: 'tale-gbman', title: 'The Gingerbread Man', qs: ['Who chased the Gingerbread Man?', 'What did he shout as he ran?', 'How did the story end?']},
      {id: 'tale-hare', title: 'The Tortoise and the Hare', qs: ['Who won the race?', 'Why did the hare lose?', 'What does "slow and steady" mean?']}]}
];
// Books a child had already read on their own when the app was set up (book ids from the shelves above).
const LIB_ALREADY_READ = [];
