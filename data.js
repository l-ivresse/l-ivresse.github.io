const P = (x, y, r, w) => ({ x, y, r, w });

const MOVIES = [
  { file: 'aftersun', title: 'aftersun', by: 'charlotte wells',
    note: 'total tearjerker but really heartwarming', pfp: 1,
    link: 'https://www.youtube.com/watch?v=vXKcWRu8K_U',
    desktop: P(46, 66, -2, 23), mobile: P(52, 36, -4, 32) },

  { file: 'call-me-by-your-name', title: 'call me by your name', by: 'luca guadagnino',
    note: 'favorite movie of all time', pfp: 3,
    link: 'https://www.youtube.com/watch?v=Z9AYPxH5NTM',
    desktop: P(13, 57, -5, 22), mobile: P(22, 38, 5, 32) },

  { file: 'her', title: 'her', by: 'spike jonze',
    note: 'love the atmosphere and soundtrack', pfp: 4,
    link: 'https://www.youtube.com/watch?v=dJTU48_yghs',
    desktop: P(22, 29, -7, 23), mobile: P(24, 17, -6, 32) },

  { file: 'happyend', title: 'happyend', by: 'neo sora',
    note: 'favorite movie with leo!', pfp: 2,
    link: 'https://www.youtube.com/watch?v=T6fiR5ckFqc',
    desktop: P(29, 72, 3, 19), mobile: P(33, 79, 4, 29) },

  { file: 'le-rayon-vert', title: 'le rayon vert', by: 'éric rohmer',
    note: 'lovely film to watch if you enjoy something calm and quiet', pfp: 2,
    link: 'https://www.youtube.com/watch?v=xpVyRnI0n9Y',
    desktop: P(72, 24, 6, 18), mobile: P(79, 40, 6, 29) },

  { file: 'malcom-and-marie', title: 'malcolm & marie', by: 'sam levinson',
    note: 'really interesting, enjoyed!', pfp: 1,
    link: 'https://www.youtube.com/watch?v=CGZmwsK58M8',
    desktop: P(37, 47, -6, 17), mobile: P(50, 57, 5, 29) },

  { file: 'notting-hill', title: 'notting hill', by: 'roger michell',
    note: 'new year watch', pfp: 4,
    link: 'https://www.youtube.com/watch?v=4RI0QvaGoiI',
    desktop: P(77, 68, -4, 23), mobile: P(68, 79, -4, 31) },

  { file: 'sentimental-value', title: 'sentimental value', by: 'joachim trier',
    note: 'immersive enough to watch until the morning', pfp: 3,
    link: 'https://www.youtube.com/watch?v=lKbcKQN5Yrw',
    desktop: P(55, 29, -3, 22), mobile: P(80, 19, -3, 30) },

  { file: 'twilight', title: 'twilight', by: 'catherine hardwicke',
    note: 'would like to experience life as one of the characters', pfp: 4,
    link: 'https://www.youtube.com/watch?v=uxjNDE2fMjI',
    desktop: P(87, 42, 8, 23), mobile: P(79, 60, -6, 32) },

  { file: 'vertigo', title: 'vertigo', by: 'alfred hitchcock',
    note: 'insta rec!', pfp: 3,
    link: 'https://www.youtube.com/watch?v=Z5jvQwwHQNY',
    desktop: P(62, 62, 7, 20), mobile: P(24, 58, -5, 30) },

  { file: 'train-dreams', title: 'train dreams', by: 'clint bentley',
    note: 'twitter rec!', pfp: 1,
    link: 'https://www.youtube.com/watch?v=_Nk8TrBHOrA',
    desktop: P(39, 22, 4, 19), mobile: P(52, 14, 4, 29) },
];

const BOOKS = [
  { file: 'siddhartha', title: 'siddhartha', by: 'hermann hesse',
    tags: ['classics', 'fiction', 'philosophy'],
    link: 'https://www.goodreads.com/book/show/52036.Siddhartha',
    desktop: P(18.1, 35.7, -4, 30), mobile: P(33.6, 17, -6, 43) },

  { file: 'i-like-it-because-its-good', title: 'i like it because it\u2019s good', by: 'na taejoo',
    tags: ['essay', 'inspiring', 'touching'],
    link: 'https://www.goodreads.com/book/show/104555390-i-like-it-because-its-good?ref=nav_sb_ss_1_30',
    desktop: P(32.6, 32.7, 5, 29), mobile: P(58.9, 24, 6, 42) },

  { file: 'the-art-of-worldly-wisdom', title: 'the art of worldly wisdom', by: 'baltasar gracián',
    tags: ['philosophy', 'nonfiction', 'classics'],
    link: 'https://www.goodreads.com/book/show/133067502-the-art-of-worldly-wisdom-by-baltasar-graci-n?ref=nav_sb_ss_1_44',
    desktop: P(48.1, 37.7, -1, 29.5), mobile: P(41.3, 44.2, -4, 42) },

  { file: 'petite-philosophie', title: 'petite philosophie de la mer', by: 'laurence devillairs',
    tags: ['philosophy', 'essay', 'nature writing'],
    link: 'https://www.goodreads.com/book/show/61337774-petite-philosophie-de-la-mer?ref=nav_sb_ss_1_51',
    desktop: P(57.1, 32.2, 0, 29), mobile: P(74.3, 58.4, 5, 41.5) },

  { file: 'kidnapping-shiro', title: 'kidnapping shiro', by: 'ryu shiva',
    tags: ['poetry', 'introspective', 'heartfelt'],
    link: 'https://www.goodreads.com/book/show/40184779?ref=nav_sb_ss_1_7',
    desktop: P(63.1, 41.2, 1.5, 29), mobile: P(35.8, 71.5, -5, 42) },

  { file: 'status-anxiety', title: 'status anxiety', by: 'alain de botton',
    tags: ['philosophy', 'nonfiction', 'psychology'],
    link: 'https://www.goodreads.com/book/show/124984184-status-anxiety-by-alain-de-botton?ref=nav_sb_ss_3_33',
    desktop: P(84.0, 39.7, -4, 30), mobile: P(79.3, 19, -4, 43) },

  { file: 'i-love-you', title: 'i love you', by: 'saeko inui',
    tags: ['childrens', 'heartwarming'],
    link: 'https://www.goodreads.com/book/show/102899462-i-love-you?ref=nav_sb_ss_1_24',
    desktop: P(24.1, 56.7, 2, 38), mobile: P(60.6, 39, 3, 47) },

  { file: 'pata', title: 'pata', by: 'moon gayoung',
    tags: ['essay', 'intimate', 'introspective'],
    link: 'https://www.goodreads.com/book/show/209819016-pata-by-mun-ka-young',
    desktop: P(41.6, 67.7, -10, 43), mobile: P(53.4, 60, -9, 53) },

  { file: 'i-decided-to-live-as-me', title: 'i decided to live as me', by: 'kim suhyun',
    tags: ['nonfiction', 'mental health', 'psychology'],
    link: 'https://www.goodreads.com/book/show/208894879-i-decided-to-live-as-me?ref=nav_sb_ss_1_23',
    desktop: P(59.1, 71.7, -3, 33.5), mobile: P(44.6, 84.5, 5, 44.5) },

  { file: 'letters-to-yves', title: 'letters to yves', by: 'pierre bergé',
    tags: ['nonfiction', 'memoir', 'queer'],
    link: 'https://www.goodreads.com/book/show/33164893-letters-to-yves?ref=nav_sb_ss_1_31',
    desktop: P(76.6, 62.2, 3, 36.5), mobile: P(71, 82.5, 4, 48) },
];

const SONGS = [
  { file: 'time-polish', title: 'time polish', by: 'lovefear, ljm',
    link: 'https://open.spotify.com/track/4SBbBKxypeNmDPs1xnpAbU?si=090255d2f7cc455e' },
  { file: 'soft-air', title: 'soft air', by: 'nueen',
    link: 'https://open.spotify.com/track/6jXBzO6c78812s7xtV8SBv?si=c277dbd3f5c44359' },
  { file: 'all-i-ask', title: 'all i ask', by: 'nina simone',
    link: 'https://open.spotify.com/track/5uI8omnLtzW4xTqJ5AoQtT?si=bf793571751e47c6' },
  { file: 'grey-mirror', title: 'grey mirror', by: 's. fidelity, raelle',
    link: 'https://open.spotify.com/track/3IGrLBgGhI2jD6TKaxLW4Z?si=c1c502b4e2d84b86' },
  { file: 'homesick', title: 'homesick', by: 'wave to earth',
    link: 'https://open.spotify.com/track/2FZIabCRMEWAYfN69Ijn1U?si=690e466cc29b4cba' },
  { file: 'i-waited-for-her-in-the-dark', title: 'i waited for her in the dark', by: 'yeek, nathanial young',
    link: 'https://open.spotify.com/track/3G5i97HE5tkIv3zqZEQke9?si=8d42a09c4c2e40ce' },
  { file: 'on-you', title: 'on you', by: 'the hics',
    link: 'https://open.spotify.com/track/5HSRm7dVfDirModWzZBdMk?si=d1c9014097d64653' },
  { file: 'winnie', title: 'winnie', by: 'fred again',
    link: 'https://open.spotify.com/track/4qhrMsB4w2pHYB3BhX5WPr?si=731696bd076b4f2a' },
];
