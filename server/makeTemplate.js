const XLSX = require('xlsx');

const rows = [
  // BOOKS
  { id:'lotr',         title:'The Lord of the Rings',         short:'LOTR',            type:'book', meta:'J.R.R. Tolkien · 1954',      genre:'Epic Fantasy',          tags:'Epic Fantasy,Found Family,Dark & Gritty,Magic & Sorcery',              blurb:'A fellowship of unlikely allies marches into a war that will decide the fate of their world.' },
  { id:'hobbit',       title:'The Hobbit',                    short:'The Hobbit',       type:'book', meta:'J.R.R. Tolkien · 1937',      genre:'Fantasy Adventure',     tags:'Found Family,Action & Adventure,Coming of Age,Cozy & Wholesome',       blurb:'A reluctant homebody is swept into a journey across mountains, forests, and dragon-guarded gold.' },
  { id:'eragon',       title:'Eragon',                        short:'Eragon',           type:'book', meta:'Christopher Paolini · 2002', genre:'Young Adult Fantasy',   tags:'Coming of Age,Magic & Sorcery,Action & Adventure,Epic Fantasy',        blurb:'A farm boy bonds with a dragon and is pulled into a centuries-old struggle against tyranny.' },
  { id:'mistborn',     title:'Mistborn: The Final Empire',    short:'Mistborn',         type:'book', meta:'Brandon Sanderson · 2006',   genre:'Epic Fantasy',          tags:'Dark & Gritty,Found Family,Magic & Sorcery,Heist',                    blurb:'A street thief with a rare power joins a crew plotting to overthrow an immortal tyrant.' },
  { id:'stormlight',   title:'The Way of Kings',              short:'Way of Kings',     type:'book', meta:'Brandon Sanderson · 2010',   genre:'Epic Fantasy',          tags:'Epic Fantasy,Dark & Gritty,Philosophical,Found Family',                blurb:'Three people are pulled toward each other across a war-ravaged world.' },
  { id:'namewind',     title:'The Name of the Wind',          short:'Name of the Wind', type:'book', meta:'Patrick Rothfuss · 2007',    genre:'Fantasy',               tags:'Magic & Sorcery,Coming of Age,Action & Adventure,Mystery & Suspense',  blurb:'A legend tells the story of his own life from orphan musician to most feared wizard.' },
  { id:'dune',         title:'Dune',                          short:'Dune',             type:'book', meta:'Frank Herbert · 1965',       genre:'Science Fiction',       tags:'Sci-Fi & Futuristic,Political Intrigue,Philosophical,Epic Fantasy',    blurb:'A young nobleman navigates treacherous desert politics to fulfil a prophecy that could reshape the universe.' },
  { id:'hyperion',     title:'Hyperion',                      short:'Hyperion',         type:'book', meta:'Dan Simmons · 1989',         genre:'Science Fiction',       tags:'Sci-Fi & Futuristic,Philosophical,Mystery & Suspense,Horror',          blurb:'Seven pilgrims on a doomed journey share stories that reveal the terrifying fate of humanity.' },
  { id:'nightcircus',  title:'The Night Circus',              short:'Night Circus',     type:'book', meta:'Erin Morgenstern · 2011',    genre:'Magical Realism',       tags:'Magic & Sorcery,Romance,Cozy & Wholesome,Philosophical',              blurb:'Two young magicians compete inside a mysterious nocturnal circus.' },
  // FILMS
  { id:'inception',    title:'Inception',                     short:'Inception',        type:'film', meta:'Film · 2010',                genre:'Sci-Fi Thriller',       tags:'Sci-Fi & Futuristic,Psychological,Action & Adventure,Mystery & Suspense', blurb:'A thief who steals secrets from dreams is given an impossible task: plant an idea in someone\'s mind.' },
  { id:'interstellar', title:'Interstellar',                  short:'Interstellar',     type:'film', meta:'Film · 2014',                genre:'Sci-Fi Drama',          tags:'Sci-Fi & Futuristic,Philosophical,Action & Adventure,Found Family',    blurb:'A dying Earth sends a father across the galaxy where time itself becomes the greatest threat.' },
  { id:'parasite',     title:'Parasite',                      short:'Parasite',         type:'film', meta:'Film · 2019',                genre:'Thriller Drama',        tags:'Psychological,Dark & Gritty,Political Intrigue,Mystery & Suspense',    blurb:'Two families from opposite ends of society become fatally entangled in secrets.' },
  { id:'spiritedaway', title:'Spirited Away',                 short:'Spirited Away',    type:'film', meta:'Film · 2001',                genre:'Animated Fantasy',      tags:'Magic & Sorcery,Coming of Age,Cozy & Wholesome,Mythology',            blurb:'A girl trapped in a spirit world must work and outwit her way back to her parents.' },
  { id:'panslab',      title:'Pans Labyrinth',                short:'Pans Labyrinth',   type:'film', meta:'Film · 2006',                genre:'Dark Fantasy',          tags:'Dark & Gritty,Magic & Sorcery,Psychological,Historical',              blurb:'A girl escapes a grim wartime reality into a haunting fairy-tale world with brutal rules.' },
  { id:'gladiator',    title:'Gladiator',                     short:'Gladiator',        type:'film', meta:'Film · 2000',                genre:'Historical Action',     tags:'Historical,Dark & Gritty,Action & Adventure,Political Intrigue',      blurb:'A betrayed Roman general fights his way from slavery back toward vengeance and justice.' },
  { id:'mononoke',     title:'Princess Mononoke',             short:'P. Mononoke',      type:'film', meta:'Film · 1997',                genre:'Animated Fantasy',      tags:'Dark & Gritty,Magic & Sorcery,Action & Adventure,Mythology',          blurb:'A young warrior is caught between a forest\'s ancient spirits and a town determined to destroy them.' },
  { id:'shutter',      title:'Shutter Island',                short:'Shutter Island',   type:'film', meta:'Film · 2010',                genre:'Psychological Thriller',tags:'Psychological,Mystery & Suspense,Horror,Dark & Gritty',               blurb:'A U.S. Marshal investigates a disappearance from an asylum and slowly loses grip on reality.' },
  // GAMES
  { id:'eldenring',    title:'Elden Ring',                    short:'Elden Ring',       type:'game', meta:'Game · 2022',                genre:'Action RPG',            tags:'Dark & Gritty,Epic Fantasy,Mythology,Action & Adventure',             blurb:'A tarnished warrior explores a shattered realm piecing together an ancient tragedy.' },
  { id:'hades',        title:'Hades',                         short:'Hades',            type:'game', meta:'Game · 2020',                genre:'Roguelike',             tags:'Mythology,Action & Adventure,Found Family,Dark & Gritty',             blurb:'The son of Hades fights his way out of the underworld learning something new each time.' },
  { id:'hollowknight', title:'Hollow Knight',                 short:'Hollow Knight',    type:'game', meta:'Game · 2017',                genre:'Action Platformer',     tags:'Dark & Gritty,Mystery & Suspense,Action & Adventure,Philosophical',   blurb:'A lone warrior explores the ruins of a fallen insect kingdom piecing together what destroyed it.' },
  { id:'disco',        title:'Disco Elysium',                 short:'Disco Elysium',    type:'game', meta:'Game · 2019',                genre:'RPG',                   tags:'Mystery & Suspense,Philosophical,Dark & Gritty,Political Intrigue',   blurb:'A wrecked detective with no memory reconstructs himself while solving an impossible murder.' },
  { id:'nier',         title:'NieR Automata',                 short:'NieR Automata',    type:'game', meta:'Game · 2017',                genre:'Action RPG',            tags:'Sci-Fi & Futuristic,Philosophical,Dark & Gritty,Action & Adventure',  blurb:'Androids fight a proxy war for humanity in a world that has forgotten why it is fighting.' },
  { id:'lastofus',     title:'The Last of Us',                short:'Last of Us',       type:'game', meta:'Game · 2013',                genre:'Action-Adventure',      tags:'Dark & Gritty,Found Family,Post-Apocalyptic,Psychological',           blurb:'A hardened survivor and a young girl make a brutal journey across a collapsed United States.' },
  { id:'undertale',    title:'Undertale',                     short:'Undertale',        type:'game', meta:'Game · 2015',                genre:'RPG',                   tags:'Cozy & Wholesome,Found Family,Psychological,Coming of Age',           blurb:'A child falls into a world of monsters and discovers that not fighting might be the bravest act.' },
  { id:'fe3h',         title:'Fire Emblem Three Houses',      short:'Three Houses',     type:'game', meta:'Game · 2019',                genre:'Tactical RPG',          tags:'Dark & Gritty,Found Family,Political Intrigue,Coming of Age',         blurb:'Students at a war college become commanders in a conflict that tests old loyalties.' },
];

const ws = XLSX.utils.json_to_sheet(rows, {
  header: ['id','title','short','type','meta','genre','tags','blurb']
});

ws['!cols'] = [
  { wch: 18 },
  { wch: 36 },
  { wch: 22 },
  { wch: 8  },
  { wch: 26 },
  { wch: 24 },
  { wch: 56 },
  { wch: 80 },
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Titles');

const instructions = [
  { Column: 'id',                   Rules: 'Unique ID. Lowercase, no spaces. Use hyphens. Must be unique per row.',    Example: 'my-book' },
  { Column: 'title',                Rules: 'Full display title of the book, film or game.',                            Example: 'The Great Gatsby' },
  { Column: 'short',                Rules: 'Short name for small UI labels. Optional - will use title if blank.',      Example: 'Gatsby' },
  { Column: 'type',                 Rules: 'Must be exactly one of:  book   film   game',                              Example: 'book' },
  { Column: 'meta',                 Rules: 'Author/Director and year. Shown as subtitle.',                             Example: 'F. Scott Fitzgerald · 1925' },
  { Column: 'genre',                Rules: 'Primary genre label. Free text.',                                          Example: 'Literary Fiction' },
  { Column: 'tags',                 Rules: 'Comma-separated. Use ONLY tags from the approved list below. No spaces after commas.', Example: 'Romance,Dark & Gritty,Philosophical' },
  { Column: 'blurb',                Rules: 'One compelling sentence about the title.',                                 Example: 'A man obsessively pursues a lost love across the glittering hollow world of 1920s New York.' },
  { Column: '',                     Rules: '',                                                                         Example: '' },
  { Column: '--- APPROVED TAGS ---',Rules: 'Copy these exactly into the tags column. Capitalisation matters.',        Example: '' },
  { Column: 'Epic Fantasy',         Rules: '',  Example: '' },
  { Column: 'Dark & Gritty',        Rules: '',  Example: '' },
  { Column: 'Found Family',         Rules: '',  Example: '' },
  { Column: 'Magic & Sorcery',      Rules: '',  Example: '' },
  { Column: 'Coming of Age',        Rules: '',  Example: '' },
  { Column: 'Cozy & Wholesome',     Rules: '',  Example: '' },
  { Column: 'Mystery & Suspense',   Rules: '',  Example: '' },
  { Column: 'Sci-Fi & Futuristic',  Rules: '',  Example: '' },
  { Column: 'Romance',              Rules: '',  Example: '' },
  { Column: 'Horror',               Rules: '',  Example: '' },
  { Column: 'Action & Adventure',   Rules: '',  Example: '' },
  { Column: 'Philosophical',        Rules: '',  Example: '' },
  { Column: 'Historical',           Rules: '',  Example: '' },
  { Column: 'Psychological',        Rules: '',  Example: '' },
  { Column: 'Mythology',            Rules: '',  Example: '' },
  { Column: 'Post-Apocalyptic',     Rules: '',  Example: '' },
  { Column: 'Political Intrigue',   Rules: '',  Example: '' },
  { Column: 'Heist',                Rules: '',  Example: '' },
];

const ws2 = XLSX.utils.json_to_sheet(instructions, { header: ['Column','Rules','Example'] });
ws2['!cols'] = [{ wch: 24 }, { wch: 72 }, { wch: 52 }];
XLSX.utils.book_append_sheet(wb, ws2, 'Instructions & Tag List');

XLSX.writeFile(wb, 'titles.xlsx');
console.log('done');
