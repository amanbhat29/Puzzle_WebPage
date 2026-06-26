/**
 * @file wordDetectiveGenerator.js
 * @description Dynamic word detective challenge generator for Mystery Word Detective.
 */

const WORD_POOL = [
  // ─── 1. Animals ──────────────────────────────────────────────────────────
  {
    word: "DOG",
    category: "Animals",
    difficulty: "Easy",
    clues: [
      "I am a common four-legged domestic animal.",
      "I am known for guarding houses and barking at strangers.",
      "I am often called humanity's best friend.",
      "I love to play fetch, wag my tail, and chew on bones.",
      "I have breeds like Golden Retriever, Pug, and German Shepherd."
    ],
    explanation: "Dogs are domestic animals known for their loyalty, companionship, and keen sense of smell."
  },
  {
    word: "CAT",
    category: "Animals",
    difficulty: "Easy",
    clues: [
      "I am a small domestic animal kept as a pet.",
      "I am famous for catching mice and sleeping all day.",
      "I make a soft purring sound when I am happy.",
      "I have whiskers, sharp claws, and excellent night vision.",
      "I love to drink milk and chase lasers, and I say 'meow'."
    ],
    explanation: "Cats are popular domestic pets known for their agility, independence, and purring."
  },
  {
    word: "LION",
    category: "Animals",
    difficulty: "Easy",
    clues: [
      "I am a large wild cat that lives in groups.",
      "I live in grasslands and savannas, mostly in Africa.",
      "The male of my kind has a large, beautiful mane of hair around its head.",
      "I am famously known as the 'King of the Jungle'.",
      "I have a powerful roar that can be heard miles away."
    ],
    explanation: "Lions are powerful social cats known as the King of the Jungle."
  },
  {
    word: "KANGAROO",
    category: "Animals",
    difficulty: "Medium",
    clues: [
      "I am a mammal native to Australia.",
      "I am a marsupial, which means I carry my babies in a pouch.",
      "I have large, powerful hind legs made for hopping.",
      "I use my long, muscular tail to balance myself.",
      "A baby of my kind is called a joey."
    ],
    explanation: "Kangaroos are Australian marsupials famous for hopping and carrying their young in a pouch."
  },
  {
    word: "PENGUIN",
    category: "Animals",
    difficulty: "Medium",
    clues: [
      "I am a bird, but I cannot fly.",
      "I spend most of my life swimming in the cold ocean waters.",
      "I walk on land with a funny waddle.",
      "I wear a natural 'tuxedo' of black and white feathers.",
      "I live in large colonies, mostly in the freezing Antarctic."
    ],
    explanation: "Penguins are flightless aquatic birds adapted to cold climates like Antarctica."
  },
  {
    word: "OCTOPUS",
    category: "Animals",
    difficulty: "Medium",
    clues: [
      "I am a sea creature with no bones or shell.",
      "I have three hearts and my blood is blue.",
      "I can change my color and texture to hide from predators.",
      "I spray a cloud of black ink to escape from danger.",
      "I have eight long tentacles lined with suction cups."
    ],
    explanation: "Octopuses are highly intelligent, soft-bodied marine creatures with eight arms."
  },
  {
    word: "CHAMELEON",
    category: "Animals",
    difficulty: "Hard",
    clues: [
      "I am a specialized lizard known for my adaptations.",
      "I can move my eyes independently to look in two directions at once.",
      "I have a long, sticky tongue that I shoot out to catch insects.",
      "I have prehensile feet and a tail to grasp branches tightly.",
      "I change the color of my skin to regulate temperature and communicate."
    ],
    explanation: "Chameleons are lizards famous for changing skin color and moving their eyes independently."
  },
  {
    word: "PLATYPUS",
    category: "Animals",
    difficulty: "Hard",
    clues: [
      "I am a semi-aquatic mammal native to eastern Australia.",
      "I am a monotreme, meaning I am a mammal that lays eggs instead of giving birth.",
      "I have a duck-like bill, webbed feet, and a beaver-like tail.",
      "The male of my species has venomous spurs on its hind legs.",
      "I use electrolocation to hunt for food underwater with my eyes closed."
    ],
    explanation: "The platypus is a unique egg-laying mammal with a duck bill and webbed feet."
  },
  {
    word: "AXOLOTL",
    category: "Animals",
    difficulty: "Hard",
    clues: [
      "I am an aquatic salamander native to Mexico.",
      "I am famous for my ability to regenerate lost limbs, tail, and even parts of my brain.",
      "I exhibit neoteny, meaning I keep my larval features like feathery gills into adulthood.",
      "I am sometimes called the 'Mexican walking fish'.",
      "I have a permanent smiling expression and external pink gills."
    ],
    explanation: "Axolotls are unique Mexican salamanders capable of regenerating limbs and organs."
  },

  // ─── 2. Professions ───────────────────────────────────────────────────────
  {
    word: "DOCTOR",
    category: "Professions",
    difficulty: "Easy",
    clues: [
      "I am a professional who works in healthcare.",
      "I help people when they feel sick or get injured.",
      "I wear a white coat and work in hospitals or clinics.",
      "I listen to heartbeats using a stethoscope.",
      "I diagnose illnesses and prescribe medicines to cure patients."
    ],
    explanation: "Doctors diagnose and treat medical conditions to keep people healthy."
  },
  {
    word: "TEACHER",
    category: "Professions",
    difficulty: "Easy",
    clues: [
      "I work in an educational environment.",
      "I help students learn new skills and knowledge.",
      "I grade homework, create lesson plans, and explain concepts.",
      "I use whiteboards, markers, books, and computers every day.",
      "I lead classrooms in schools or colleges."
    ],
    explanation: "Teachers educate and guide students in academic subjects and life skills."
  },
  {
    word: "CHEF",
    category: "Professions",
    difficulty: "Easy",
    clues: [
      "I work in the food service industry.",
      "I design menus and oversee kitchen operations.",
      "I wear a tall white hat called a toque and a clean apron.",
      "I use knives, pans, ovens, and fresh ingredients.",
      "I cook delicious meals in restaurants or hotels."
    ],
    explanation: "Chefs are professional cooks who prepare and present meals in restaurants."
  },
  {
    word: "ASTRONAUT",
    category: "Professions",
    difficulty: "Medium",
    clues: [
      "I undergo intense physical and scientific training.",
      "I travel beyond Earth's atmosphere for research.",
      "I eat freeze-dried food and work in microgravity.",
      "I wear a heavy pressurized space suit with a helmet.",
      "I fly spacecraft and work on the International Space Station."
    ],
    explanation: "Astronauts are trained professionals who travel and work in outer space."
  },
  {
    word: "ARCHITECT",
    category: "Professions",
    difficulty: "Medium",
    clues: [
      "I design physical structures and environments.",
      "I blend creative art with engineering principles.",
      "I draw detailed blueprints and scale models of buildings.",
      "I ensure structures are safe, beautiful, and functional.",
      "I plan the construction of houses, offices, and skyscrapers."
    ],
    explanation: "Architects design buildings and structural spaces while overseeing their construction."
  },
  {
    word: "DETECTIVE",
    category: "Professions",
    difficulty: "Medium",
    clues: [
      "I work in law enforcement or private investigation.",
      "My main job is to solve puzzles and mysteries.",
      "I look for clues, interview witnesses, and analyze facts.",
      "I wear magnifying glasses in cartoons and inspect crime scenes.",
      "I investigate crimes and catch culprits."
    ],
    explanation: "Detectives gather information and evidence to solve crimes and mysteries."
  },
  {
    word: "ARCHAEOLOGIST",
    category: "Professions",
    difficulty: "Hard",
    clues: [
      "I am a scientist who studies human history.",
      "I spend weeks working outdoors on excavation sites.",
      "I use brushes, trowels, and cameras to document findings.",
      "I analyze ancient pottery, bones, and ruined structures.",
      "I dig up artifacts to learn how people lived thousands of years ago."
    ],
    explanation: "Archaeologists study ancient civilizations by excavating and analyzing artifacts."
  },
  {
    word: "CARTOGRAPHER",
    category: "Professions",
    difficulty: "Hard",
    clues: [
      "I am a specialist who works with geographical data.",
      "I compile data from surveys, satellites, and aerial photos.",
      "I help travelers, geologists, and navigators find their way.",
      "My work has shifted from hand-drawing to advanced GIS software.",
      "My main profession is the science and art of mapmaking."
    ],
    explanation: "Cartographers analyze geographical information to design and produce maps."
  },
  {
    word: "ACTUARY",
    category: "Professions",
    difficulty: "Hard",
    clues: [
      "I am a business professional who analyzes financial risks.",
      "I use advanced mathematics, statistics, and probability theories.",
      "I help companies minimize the cost of future uncertain events.",
      "I design insurance policies and pension plans.",
      "I calculate premiums and assess risk tables."
    ],
    explanation: "Actuaries use math and statistics to assess financial risks for insurance and finance."
  },

  // ─── 3. Fruits ────────────────────────────────────────────────────────────
  {
    word: "APPLE",
    category: "Fruits",
    difficulty: "Easy",
    clues: [
      "I grow on trees and have a crisp texture.",
      "I have skin that can be red, green, or yellow.",
      "My seeds contain a tiny amount of cyanide and are in my core.",
      "I am the subject of the saying 'an apple a day keeps the doctor away'.",
      "I am the fruit that supposedly fell on Isaac Newton's head."
    ],
    explanation: "Apples are crisp, round pomaceous fruits that come in red, green, and yellow varieties."
  },
  {
    word: "BANANA",
    category: "Fruits",
    difficulty: "Easy",
    clues: [
      "I grow in large hanging clusters in tropical regions.",
      "I am an excellent source of potassium and quick energy.",
      "I have a thick, protective peel that you throw away.",
      "I start green and turn bright yellow when I am ripe.",
      "I am curved, soft on the inside, and popular in milkshakes."
    ],
    explanation: "Bananas are long, yellow tropical fruits rich in potassium."
  },
  {
    word: "ORANGE",
    category: "Fruits",
    difficulty: "Easy",
    clues: [
      "I am a round citrus fruit.",
      "I grow in warm climates and am rich in Vitamin C.",
      "I have a thick, dimpled skin that must be peeled.",
      "I am divided into juicy segments inside.",
      "I share my name with a primary color."
    ],
    explanation: "Oranges are juicy, vitamin C-rich citrus fruits named after their color."
  },
  {
    word: "PINEAPPLE",
    category: "Fruits",
    difficulty: "Medium",
    clues: [
      "I am a tropical fruit native to South America.",
      "I have a tough, spiky exterior that looks like a pinecone.",
      "I contain bromelain, an enzyme that tenderizes meat.",
      "I have a sweet, yellow, fibrous flesh inside.",
      "I wear a green, leafy crown on top of my head."
    ],
    explanation: "Pineapples are tropical fruits characterized by their spiky skin and leafy crown."
  },
  {
    word: "MANGO",
    category: "Fruits",
    difficulty: "Medium",
    clues: [
      "I am a stone fruit with a sweet, orange-yellow pulp.",
      "I have a large, single flat seed in the center.",
      "I grow abundantly during the hot summer season.",
      "I am widely celebrated as the 'King of Fruits'.",
      "I am the national fruit of India, Pakistan, and the Philippines."
    ],
    explanation: "Mangoes are delicious tropical stone fruits celebrated as the King of Fruits."
  },
  {
    word: "PEACH",
    category: "Fruits",
    difficulty: "Medium",
    clues: [
      "I am a deciduous stone fruit native to Northwest China.",
      "I have a velvety, fuzzy skin that feels soft.",
      "My flesh is sweet and juicy, colored yellow or white.",
      "My seed is a large, hard pit in the center.",
      "I am closely related to plums, cherries, and apricots."
    ],
    explanation: "Peaches are fuzzy-skinned stone fruits known for their sweet, juicy flesh."
  },
  {
    word: "POMEGRANATE",
    category: "Fruits",
    difficulty: "Hard",
    clues: [
      "I am a round, reddish fruit with a thick, leathery rind.",
      "My name translates to 'seeded apple' in Latin.",
      "I am filled with hundreds of edible, juicy seeds called arils.",
      "I am packed with powerful antioxidants and deep red juice.",
      "You must tap my shell or submerge me in water to release my seeds."
    ],
    explanation: "Pomegranates are leathery fruits filled with hundreds of juicy red arils (seeds)."
  },
  {
    word: "DURIAN",
    category: "Fruits",
    difficulty: "Hard",
    clues: [
      "I am a large tropical fruit native to Southeast Asia.",
      "I am covered in a formidable, sharp, spiky husk.",
      "I have a rich, custard-like texture that tastes sweet and savory.",
      "I am banned in public transport and hotels due to my extremely strong smell.",
      "I am known in Southeast Asia as the 'King of Fruits'."
    ],
    explanation: "Durian is a Southeast Asian fruit famous for its spiky husk and pungent, controversial odor."
  },
  {
    word: "FIG",
    category: "Fruits",
    difficulty: "Hard",
    clues: [
      "I am a small teardrop-shaped fruit with a chewy texture.",
      "I have a sweet flavor and are filled with hundreds of tiny, crunchy seeds.",
      "I am not technically a fruit, but an inverted flower called a syconium.",
      "I am pollinated by a specialized microscopic wasp.",
      "I am commonly eaten dried and my leaves are famous in ancient art."
    ],
    explanation: "Figs are sweet, seed-filled inverted flowers pollinated by specialized wasps."
  },

  // ─── 4. Countries ─────────────────────────────────────────────────────────
  {
    word: "INDIA",
    category: "Countries",
    difficulty: "Easy",
    clues: [
      "I am a large country located in South Asia.",
      "I have the highest population of any country in the world.",
      "My national flag has three horizontal bands of saffron, white, and green.",
      "I am the birthplace of major religions like Hinduism and Buddhism.",
      "My capital is New Delhi, and my most famous monument is the Taj Mahal."
    ],
    explanation: "India is a highly populous South Asian nation rich in cultural history and diversity."
  },
  {
    word: "JAPAN",
    category: "Countries",
    difficulty: "Easy",
    clues: [
      "I am an island nation located in East Asia.",
      "My flag is simple: a red circle on a white background.",
      "I am famous for cherry blossoms, sushi, and anime.",
      "My capital city, Tokyo, is the most populous metropolitan area in the world.",
      "I am widely known as the 'Land of the Rising Sun'."
    ],
    explanation: "Japan is an East Asian island nation known as the Land of the Rising Sun."
  },
  {
    word: "FRANCE",
    category: "Countries",
    difficulty: "Easy",
    clues: [
      "I am a country located in Western Europe.",
      "I am famous for art, fashion, cheese, and baguette bread.",
      "My national flag is a blue, white, and red vertical tricolor.",
      "I host the famous Tour de France bicycle race every year.",
      "My capital city is Paris, home to the Eiffel Tower."
    ],
    explanation: "France is a Western European nation renowned for its landmarks, food, and culture."
  },
  {
    word: "EGYPT",
    category: "Countries",
    difficulty: "Medium",
    clues: [
      "I link northeast Africa with the Middle East.",
      "I am home to the longest river in the world, the Nile.",
      "My history dates back to ancient pharaohs and dynasties.",
      "I am famous for mummies, hieroglyphics, and sphinxes.",
      "My most famous landmarks are the ancient Pyramids of Giza."
    ],
    explanation: "Egypt is a historic transcontinental nation famous for the Nile and ancient pyramids."
  },
  {
    word: "AUSTRALIA",
    category: "Countries",
    difficulty: "Medium",
    clues: [
      "I am both a country and a continent.",
      "I am located entirely in the Southern Hemisphere.",
      "I am surrounded by the Indian and Pacific Oceans.",
      "I am home to unique wildlife like koalas and kangaroos.",
      "My famous landmarks include the Great Barrier Reef and the Sydney Opera House."
    ],
    explanation: "Australia is an island continent and country known for its unique ecosystem."
  },
  {
    word: "ITALY",
    category: "Countries",
    difficulty: "Medium",
    clues: [
      "I am a peninsula country in Southern Europe.",
      "My shape on a world map looks like a boot.",
      "I am the birthplace of the Roman Empire and the Renaissance.",
      "I am famous for food like pizza, pasta, and gelato.",
      "My capital is Rome, which houses the Colosseum."
    ],
    explanation: "Italy is a boot-shaped European country famous for Rome, art, and gastronomy."
  },
  {
    word: "MADAGASCAR",
    category: "Countries",
    difficulty: "Hard",
    clues: [
      "I am a large island nation off the southeast coast of Africa.",
      "I am the fourth largest island in the world.",
      "Over 90% of my native wildlife is found nowhere else on Earth.",
      "I am famous for lemurs, baobab trees, and vanilla beans.",
      "My capital city is Antananarivo."
    ],
    explanation: "Madagascar is an African island nation famous for its highly endemic biodiversity."
  },
  {
    word: "ICELAND",
    category: "Countries",
    difficulty: "Hard",
    clues: [
      "I am a Nordic island nation in the North Atlantic Ocean.",
      "I have a highly active volcanic landscape with glaciers and hot springs.",
      "I run almost entirely on geothermal and hydroelectric energy.",
      "I am often called the 'Land of Fire and Ice'.",
      "My capital city is Reykjavik."
    ],
    explanation: "Iceland is a volcanic Nordic island nation famous for its extreme geology."
  },
  {
    word: "SWITZERLAND",
    category: "Countries",
    difficulty: "Hard",
    clues: [
      "I am a landlocked mountainous country in Central Europe.",
      "I have maintained a policy of military neutrality for centuries.",
      "I am famous for high-end watches, delicious chocolates, and private banking.",
      "My terrain is dominated by the majestic Alps.",
      "My capital city is Bern, and I have four national languages."
    ],
    explanation: "Switzerland is a neutral Alpine European country famous for banking, watches, and chocolate."
  },

  // ─── 5. Sports ────────────────────────────────────────────────────────────
  {
    word: "FOOTBALL",
    category: "Sports",
    difficulty: "Easy",
    clues: [
      "I am a team sport played on a green rectangular field.",
      "I am played between two teams of 11 players each.",
      "I am the most popular sport in the world, also called soccer.",
      "Players are not allowed to touch the ball with their hands during play.",
      "The main objective is to kick a round ball into the opponent's goal."
    ],
    explanation: "Football (soccer) is a global sport centered around kicking a ball into a goal."
  },
  {
    word: "CRICKET",
    category: "Sports",
    difficulty: "Easy",
    clues: [
      "I am a bat-and-ball game played between two teams of 11.",
      "I am played on a field with a 22-yard rectangular strip in the center.",
      "My matches can last for 3 hours, a full day, or even 5 days.",
      "Players try to score runs by hitting a leather ball and running between wickets.",
      "I am extremely popular in India, Australia, and England."
    ],
    explanation: "Cricket is a popular bat-and-ball game played on a pitch with wickets."
  },
  {
    word: "SWIMMING",
    category: "Sports",
    difficulty: "Easy",
    clues: [
      "I am an individual or team sport that requires a body of water.",
      "I use styles like freestyle, backstroke, breaststroke, and butterfly.",
      "I am a great exercise that works all muscles without any joint impact.",
      "Athletes compete in lanes in a 50-meter Olympic pool.",
      "The goal is to swim a set distance faster than everyone else."
    ],
    explanation: "Swimming is a water sport involving racing using standard strokes."
  },
  {
    word: "BADMINTON",
    category: "Sports",
    difficulty: "Medium",
    clues: [
      "I am a racquet sport played on a rectangular indoor court.",
      "I can be played as singles (one-on-one) or doubles (two-on-two).",
      "I require players to hit a projectile back and forth over a net.",
      "Unlike tennis, the projectile must not touch the ground during play.",
      "The projectile we hit is called a shuttlecock or birdie."
    ],
    explanation: "Badminton is a fast racquet sport where players hit a feathered shuttlecock over a net."
  },
  {
    word: "VOLLEYBALL",
    category: "Sports",
    difficulty: "Medium",
    clues: [
      "I am a sport played by two teams on a court divided by a high net.",
      "Players use their hands or arms to strike a ball back and forth.",
      "Each team is allowed only three hits to return the ball.",
      "I can be played on hard courts or on sandy beaches.",
      "Teams score points by grounding the ball on the opponent's court."
    ],
    explanation: "Volleyball is a team sport of hitting a ball over a high net without letting it land."
  },
  {
    word: "GOLF",
    category: "Sports",
    difficulty: "Medium",
    clues: [
      "I am a club-and-ball sport played outdoors on a large green course.",
      "I do not have a standardized playing area; every course is unique.",
      "Players hit a small hard ball across hazards like sand and water.",
      "The game is played over a series of 9 or 18 holes.",
      "The winner is the player who takes the fewest strokes to sink the ball."
    ],
    explanation: "Golf is a sport where players use clubs to hit a ball into holes with minimal strokes."
  },
  {
    word: "ARCHERY",
    category: "Sports",
    difficulty: "Hard",
    clues: [
      "I am a sport of precision, focus, and upper body strength.",
      "I began historically as a tool for hunting and warfare.",
      "Athletes stand at a fixed distance and shoot projectiles.",
      "I require a stringed elastic device and pointed shafts.",
      "The goal is to hit the center yellow ring of a target board."
    ],
    explanation: "Archery is the sport of shooting arrows at a target using a bow."
  },
  {
    word: "FENCING",
    category: "Sports",
    difficulty: "Hard",
    clues: [
      "I am a combat sport based on sword fighting.",
      "I am one of the few sports featured in every modern Olympic Games.",
      "Athletes wear protective white suits, wire masks, and use electric scoring.",
      "The three weapons used in this sport are the foil, épée, and sabre.",
      "Points are scored by making contact with the opponent's target area."
    ],
    explanation: "Fencing is a tactical sword-fighting sport using foils, épées, or sabres."
  },
  {
    word: "CURLING",
    category: "Sports",
    difficulty: "Hard",
    clues: [
      "I am a team sport played on a flat sheet of ice.",
      "I am nicknamed 'The Roaring Game' due to the sound the stones make.",
      "Players slide heavy, polished granite stones toward a target area.",
      "Teammates use specialized brooms to sweep the ice in front of the stone.",
      "Sweeping alters the friction to adjust the stone's speed and path."
    ],
    explanation: "Curling is an ice sport of sliding heavy stones and sweeping the ice to target them."
  },

  // ─── 6. Science ───────────────────────────────────────────────────────────
  {
    word: "WATER",
    category: "Science",
    difficulty: "Easy",
    clues: [
      "I am a chemical substance essential for all known life.",
      "I cover about 71% of the Earth's surface.",
      "I am tasteless, odorless, and transparent in small quantities.",
      "I can exist in three states: solid (ice), liquid, and gas (steam).",
      "My chemical formula is H2O, meaning two hydrogen atoms and one oxygen."
    ],
    explanation: "Water is the chemical compound H2O, essential for life on Earth."
  },
  {
    word: "MAGNET",
    category: "Science",
    difficulty: "Easy",
    clues: [
      "I am an object that produces an invisible magnetic field.",
      "I pull on certain metals like iron, nickel, and cobalt.",
      "I have two poles: a North pole and a South pole.",
      "Opposite poles of my kind attract, while similar poles repel.",
      "I am used to stick notes on refrigerators and build compasses."
    ],
    explanation: "Magnets are objects that produce magnetic fields and attract ferromagnetic metals."
  },
  {
    word: "GRAVITY",
    category: "Science",
    difficulty: "Easy",
    clues: [
      "I am an invisible force that pulls objects toward each other.",
      "I keep the planets orbiting around the Sun.",
      "My strength depends on the mass of the objects and distance.",
      "I am the reason why things fall to the ground when dropped.",
      "I am the force that keeps your feet planted on the Earth."
    ],
    explanation: "Gravity is the fundamental force of attraction between masses."
  },
  {
    word: "ATOM",
    category: "Science",
    difficulty: "Medium",
    clues: [
      "I am the basic building block of all ordinary matter.",
      "My name comes from a Greek word meaning 'indivisible'.",
      "I am extremely small, visible only with special electron microscopes.",
      "I consist of a central nucleus surrounded by a cloud of electrons.",
      "My nucleus contains protons and neutrons."
    ],
    explanation: "Atoms are the smallest units of matter, consisting of protons, neutrons, and electrons."
  },
  {
    word: "CELL",
    category: "Science",
    difficulty: "Medium",
    clues: [
      "I am the smallest unit of life that can replicate independently.",
      "I am often referred to as the 'building block of life'.",
      "I contain genetic material (DNA) and organelles inside a membrane.",
      "I can form single-celled organisms like bacteria or multicellular ones.",
      "I am studied in biology, and my parts include the nucleus and cytoplasm."
    ],
    explanation: "Cells are the fundamental structural and functional units of all living organisms."
  },
  {
    word: "TELESCOPE",
    category: "Science",
    difficulty: "Medium",
    clues: [
      "I am an optical instrument that gathers and focuses light.",
      "I was first invented in the early 17th century using glass lenses.",
      "Galileo Galilei famously improved me to look at the night sky.",
      "I am used by astronomers to study planets, stars, and galaxies.",
      "Famous examples of my kind include the Hubble and James Webb."
    ],
    explanation: "Telescopes are instruments that collect light to magnify distant objects in space."
  },
  {
    word: "MOLECULE",
    category: "Science",
    difficulty: "Hard",
    clues: [
      "I am a group of two or more atoms held together by chemical bonds.",
      "I represent the smallest particle of a compound that retains its properties.",
      "I can be made of atoms of a single element or different elements.",
      "My bonds can be covalent, sharing electrons, or ionic, transferring them.",
      "Common examples of my kind include carbon dioxide (CO2) and oxygen gas (O2)."
    ],
    explanation: "Molecules are chemical structures made of two or more chemically bonded atoms."
  },
  {
    word: "PHOTOSYNTHESIS",
    category: "Science",
    difficulty: "Hard",
    clues: [
      "I am a chemical process that takes place in plants, algae, and some bacteria.",
      "I convert solar energy into chemical energy stored in sugars.",
      "I require carbon dioxide, water, and sunlight as my inputs.",
      "I release oxygen as a byproduct into the atmosphere.",
      "I occur inside specialized plant organelles called chloroplasts."
    ],
    explanation: "Photosynthesis is the process plants use to make food (glucose) from sunlight and water."
  },
  {
    word: "CATALYST",
    category: "Science",
    difficulty: "Hard",
    clues: [
      "I am a substance that speeds up a chemical reaction.",
      "I work by lowering the activation energy needed for a reaction.",
      "I participate in reactions but am not consumed by them.",
      "I remain unchanged at the end of the reaction.",
      "Biological examples of my kind are called enzymes."
    ],
    explanation: "Catalysts speed up chemical reactions without being consumed in the process."
  },

  // ─── 7. Nature ────────────────────────────────────────────────────────────
  {
    word: "TREE",
    category: "Nature",
    difficulty: "Easy",
    clues: [
      "I am a tall perennial plant with a woody structure.",
      "I absorb carbon dioxide and release oxygen to the air.",
      "I have roots below the ground and branches high above.",
      "My stem is protected by a tough outer layer called bark.",
      "I have leaves that gather sunlight, and my main stem is a trunk."
    ],
    explanation: "Trees are woody perennial plants with roots, a trunk, branches, and leaves."
  },
  {
    word: "RIVER",
    category: "Nature",
    difficulty: "Easy",
    clues: [
      "I am a natural flowing stream of fresh water.",
      "I flow downhill due to gravity toward a larger body of water.",
      "My journey starts at a high source and ends at a mouth.",
      "My banks are home to rich ecosystems and human settlements.",
      "I empty into lakes, other rivers, or the sea."
    ],
    explanation: "Rivers are natural freshwater streams flowing down to oceans, seas, or lakes."
  },
  {
    word: "RAIN",
    category: "Nature",
    difficulty: "Easy",
    clues: [
      "I am liquid precipitation that falls from the sky.",
      "I am a vital part of Earth's water cycle, replenishing fresh water.",
      "I am formed when water vapor condenses in clouds and gets heavy.",
      "I am accompanied by dark clouds and sometimes thunder.",
      "I fall as water droplets that help crops and forests grow."
    ],
    explanation: "Rain is condensed atmospheric water vapor falling to Earth in droplets."
  },
  {
    word: "VOLCANO",
    category: "Nature",
    difficulty: "Medium",
    clues: [
      "I am a rupture in the crust of a planetary-mass object.",
      "I allow hot lava, volcanic ash, and gases to escape.",
      "I can be active, dormant (sleeping), or extinct.",
      "I often form a conical mountain shape over time.",
      "When I erupt, I spew molten rock (magma) from deep inside the Earth."
    ],
    explanation: "Volcanoes are vents in Earth's crust that erupt lava, ash, and gases."
  },
  {
    word: "FOREST",
    category: "Nature",
    difficulty: "Medium",
    clues: [
      "I am a large area dominated by trees and vegetation.",
      "I cover approximately one-third of the world's land area.",
      "I act as a massive carbon sink, absorbing greenhouse gases.",
      "I am home to the majority of Earth's terrestrial biodiversity.",
      "I can be tropical, temperate, or boreal (like the Taiga)."
    ],
    explanation: "Forests are large ecosystems dominated by trees and diverse wildlife."
  },
  {
    word: "DESERT",
    category: "Nature",
    difficulty: "Medium",
    clues: [
      "I am a barren area of land with extremely low precipitation.",
      "I cover about one-fifth of Earth's total land surface.",
      "My temperatures can be extremely hot by day and freezing at night.",
      "Plants like cacti thrive here by storing water in their stems.",
      "I am covered in sand dunes, rocks, and dried gravel plains."
    ],
    explanation: "Deserts are arid regions characterized by minimal rainfall and extreme temperatures."
  },
  {
    word: "TUNDRA",
    category: "Nature",
    difficulty: "Hard",
    clues: [
      "I am a vast, treeless biome found in cold northern regions.",
      "My name comes from a Finnish word meaning 'barren land'.",
      "My subsoil is permanently frozen, a layer called permafrost.",
      "Only low-growing vegetation like moss, lichens, and shrubs can survive.",
      "My summers are very short, and my winters are long and dark."
    ],
    explanation: "Tundra is a cold, treeless biome characterized by permafrost and low vegetation."
  },
  {
    word: "OASIS",
    category: "Nature",
    difficulty: "Hard",
    clues: [
      "I am an isolated area of vegetation surrounding a water source.",
      "I am located in the middle of a dry desert environment.",
      "My water comes from underground aquifers or springs.",
      "I serve as a vital stop for caravans and wildlife seeking water.",
      "Date palms and crops can grow around my water pools."
    ],
    explanation: "An oasis is a fertile spot in a desert where water comes to the surface."
  },
  {
    word: "GEYSER",
    category: "Nature",
    difficulty: "Hard",
    clues: [
      "I am a rare hot spring under high pressure.",
      "I require special hydrogeological conditions found in volcanic zones.",
      "I periodically erupt, shooting columns of water and steam.",
      "My eruptions are caused by groundwater getting superheated by magma.",
      "Famous examples of my kind include 'Old Faithful' in Yellowstone."
    ],
    explanation: "Geysers are geothermal hot springs that periodically eject boiling water and steam."
  },

  // ─── 8. Transportation ────────────────────────────────────────────────────
  {
    word: "CAR",
    category: "Transportation",
    difficulty: "Easy",
    clues: [
      "I am a road vehicle with four wheels.",
      "I am designed to carry a small group of passengers (usually 4-5).",
      "I am powered by an engine running on petrol, diesel, or electricity.",
      "I require a steering wheel, brakes, and seatbelts for safety.",
      "I am parked in garages and driven on streets and highways."
    ],
    explanation: "Cars are four-wheeled motor vehicles designed for road passenger transport."
  },
  {
    word: "BICYCLE",
    category: "Transportation",
    difficulty: "Easy",
    clues: [
      "I am a simple two-wheeled vehicle.",
      "I do not have an engine or require fuel.",
      "I am propelled by the rider pushing down on pedals.",
      "I use a metal chain to transfer power to the rear wheel.",
      "I am steered using handlebars and stopped with hand brakes."
    ],
    explanation: "Bicycles are two-wheeled human-powered vehicles steered by handlebars."
  },
  {
    word: "AIRPLANE",
    category: "Transportation",
    difficulty: "Easy",
    clues: [
      "I am a fixed-wing aircraft.",
      "I travel long distances at very high speeds.",
      "I am kept aloft by the aerodynamic lift created by my wings.",
      "I take off and land at airports and am flown by pilots.",
      "I fly high in the sky, carrying passengers and cargo across oceans."
    ],
    explanation: "Airplanes are winged aircraft that fly passengers and cargo long distances."
  },
  {
    word: "SUBMARINE",
    category: "Transportation",
    difficulty: "Medium",
    clues: [
      "I am a specialized watercraft.",
      "I can operate independently both on and below the water surface.",
      "I use ballast tanks filled with water to sink or rise.",
      "I am heavily used by navies for defense and scientists for deep-sea research.",
      "I travel completely submerged underwater for months at a time."
    ],
    explanation: "Submarines are vessels capable of underwater navigation and operations."
  },
  {
    word: "HELICOPTER",
    category: "Transportation",
    difficulty: "Medium",
    clues: [
      "I am a type of rotorcraft.",
      "I have large spinning blades on top called rotors.",
      "I can fly forward, backward, sideways, and hover in one spot.",
      "I do not need a runway; I take off and land vertically.",
      "I am used for medical rescues, firefighting, and police patrols."
    ],
    explanation: "Helicopters are aircraft with overhead rotors that allow vertical flight and hovering."
  },
  {
    word: "TRACTOR",
    category: "Transportation",
    difficulty: "Medium",
    clues: [
      "I am a heavy duty engineering vehicle.",
      "I move slowly and have very large, treaded rear wheels.",
      "I am designed to provide high traction at low speeds.",
      "I am used to pull heavy farm machinery like plows and harvesters.",
      "I am an essential vehicle for farming and agriculture."
    ],
    explanation: "Tractors are high-traction utility vehicles used primarily in farming."
  },
  {
    word: "HOVERCRAFT",
    category: "Transportation",
    difficulty: "Hard",
    clues: [
      "I am an amphibious vehicle that travels over land and water.",
      "I glide smoothly over mud, ice, sand, and waves.",
      "I am supported by a cushion of high-pressure air trapped below me.",
      "I use a flexible rubber skirt around my base to contain the air cushion.",
      "I use massive rear propellers to steer and push myself forward."
    ],
    explanation: "Hovercrafts are amphibious craft supported by a cushion of high-pressure air."
  },
  {
    word: "MONORAIL",
    category: "Transportation",
    difficulty: "Hard",
    clues: [
      "I am a railway system used in crowded urban transit.",
      "I occupy minimal ground space because I am usually elevated.",
      "My trains straddle or hang from a single guide beam.",
      "My name combines the words for 'single' and 'track'.",
      "I run quietly on rubber tires along a concrete rail."
    ],
    explanation: "Monorails are elevated urban transit systems operating on a single rail."
  },
  {
    word: "GLIDER",
    category: "Transportation",
    difficulty: "Hard",
    clues: [
      "I am an unpowered aircraft designed for flight.",
      "I have very long, narrow wings to maximize aerodynamic efficiency.",
      "I must be launched or towed into the air by a powered plane.",
      "I stay aloft by riding rising columns of warm air called thermals.",
      "I fly silently, relying entirely on gravity and wind currents."
    ],
    explanation: "Gliders are engine-less airplanes that soar using rising air currents."
  },

  // ─── 9. Food ──────────────────────────────────────────────────────────────
  {
    word: "PIZZA",
    category: "Food",
    difficulty: "Easy",
    clues: [
      "I am a highly popular Italian dish.",
      "I start as a flat, round base of leavened wheat dough.",
      "I am baked in a very hot stone or wood-fired oven.",
      "I am topped with tomato sauce and melted cheese.",
      "I am typically sliced into triangles and served in a square box."
    ],
    explanation: "Pizza is a flatbread dish topped with tomatoes, cheese, and baked in an oven."
  },
  {
    word: "BREAD",
    category: "Food",
    difficulty: "Easy",
    clues: [
      "I am a staple food prepared from a dough of flour and water.",
      "I am usually baked, but I can be steamed or fried.",
      "I can be leavened (using yeast to rise) or unleavened.",
      "I am sliced to make sandwiches and toast.",
      "Common varieties of my kind include white, wheat, and baguettes."
    ],
    explanation: "Bread is a basic staple food made by baking flour and water dough."
  },
  {
    word: "CHEESE",
    category: "Food",
    difficulty: "Easy",
    clues: [
      "I am a dairy product made in a wide range of flavors and textures.",
      "I am produced by coagulating the milk protein casein.",
      "I am aged for weeks, months, or years in caves or warehouses.",
      "I melt beautifully on sandwiches, pizzas, and pasta.",
      "Popular types of my kind are Cheddar, Mozzarella, and Swiss."
    ],
    explanation: "Cheese is a dairy product made from pressed milk curds."
  },
  {
    word: "HONEY",
    category: "Food",
    difficulty: "Medium",
    clues: [
      "I am a sweet, thick liquid food.",
      "I have a golden color and can last for thousands of years without spoiling.",
      "I am made from the nectar of flowers.",
      "I am produced and stored inside honeycombs.",
      "I am created by industrious insects called honeybees."
    ],
    explanation: "Honey is a natural sweet syrup produced by bees from floral nectar."
  },
  {
    word: "CHOCOLATE",
    category: "Food",
    difficulty: "Medium",
    clues: [
      "I am a food preparation made from cacao seeds.",
      "I was historically consumed as a bitter drink by the Mayans.",
      "I am roasted, ground, and mixed with sugar and milk.",
      "I come in dark, milk, and white varieties.",
      "I am molded into bars and eaten as a sweet treat."
    ],
    explanation: "Chocolate is a sweet confection made from processed cacao beans."
  },
  {
    word: "BUTTER",
    category: "Food",
    difficulty: "Medium",
    clues: [
      "I am a solid dairy product.",
      "I am made by churning fresh or fermented cream or milk.",
      "I consist of milk fat, water, and milk proteins.",
      "I am spread on toast and used as a cooking fat for baking.",
      "I melt into a yellow liquid when heated in a pan."
    ],
    explanation: "Butter is a dairy spread made by churning cream."
  },
  {
    word: "SUSHI",
    category: "Food",
    difficulty: "Hard",
    clues: [
      "I am a traditional Japanese dish.",
      "My core ingredient is medium-grain rice seasoned with vinegar, sugar, and salt.",
      "I am often wrapped in sheets of dried seaweed called nori.",
      "I am prepared with raw fish, vegetables, or seafood.",
      "I am eaten with chopsticks and dipped in soy sauce and wasabi."
    ],
    explanation: "Sushi is a Japanese dish of vinegared rice combined with raw seafood and seaweed."
  },
  {
    word: "TOFU",
    category: "Food",
    difficulty: "Hard",
    clues: [
      "I am a soy-based food product native to China.",
      "I am made by coagulating soy milk and pressing the curds.",
      "I am sold in soft, firm, and extra-firm blocks.",
      "I have very little flavor of my own but absorb spices and sauces well.",
      "I am a highly popular vegetarian source of protein."
    ],
    explanation: "Tofu is a protein-rich food made from coagulated soy milk."
  },
  {
    word: "CROISSANT",
    category: "Food",
    difficulty: "Hard",
    clues: [
      "I am a buttery, flaky, laminated pastry.",
      "I am named for my distinctive crescent shape.",
      "I am made by layering yeast dough with butter, rolling, and folding.",
      "I am a classic breakfast pastry associated with France.",
      "I turn golden brown and airy when baked."
    ],
    explanation: "A croissant is a crescent-shaped, layered French pastry known for its flaky texture."
  },

  // ─── 10. Technology ───────────────────────────────────────────────────────
  {
    word: "PHONE",
    category: "Technology",
    difficulty: "Easy",
    clues: [
      "I am a handheld electronic communication device.",
      "I was originally connected to walls by copper wires.",
      "I allow people to talk to each other across long distances.",
      "My modern version has a touchscreen and connects to the internet.",
      "I am used to make calls, send texts, and run apps."
    ],
    explanation: "Phones are communication devices that have evolved into portable smartphones."
  },
  {
    word: "COMPUTER",
    category: "Technology",
    difficulty: "Easy",
    clues: [
      "I am an electronic machine that processes data.",
      "I perform complex calculations at high speeds.",
      "I use components like a CPU, RAM, and a hard drive.",
      "I run operating systems like Windows, macOS, or Linux.",
      "I have a monitor, keyboard, and mouse for user interaction."
    ],
    explanation: "Computers are programmable electronic devices that process and store information."
  },
  {
    word: "ROBOT",
    category: "Technology",
    difficulty: "Easy",
    clues: [
      "I am a machine capable of carrying out complex actions automatically.",
      "I am programmed by computers and guided by sensors.",
      "I am used in factories to assemble cars and pack products.",
      "I can look like a human (android) or a mechanical arm.",
      "My name comes from a Czech word meaning 'forced labor'."
    ],
    explanation: "Robots are programmable machines designed to perform tasks automatically."
  },
  {
    word: "LAPTOP",
    category: "Technology",
    difficulty: "Medium",
    clues: [
      "I am a personal computer designed for portability.",
      "I have an integrated screen, keyboard, and trackpad.",
      "I run on a rechargeable battery, so I don't need to be plugged in constantly.",
      "I fold shut like a clamshell for easy transport in a backpack.",
      "I am named because I can be operated on a user's lap."
    ],
    explanation: "Laptops are portable, folding personal computers with built-in screens and keyboards."
  },
  {
    word: "CAMERA",
    category: "Technology",
    difficulty: "Medium",
    clues: [
      "I am an optical instrument used to record visual images.",
      "I work by focusing light through a lens onto a sensor or film.",
      "I have a shutter that opens and closes to capture light.",
      "I can capture still photographs or moving videos.",
      "I am built into smartphones and used by professional photographers."
    ],
    explanation: "Cameras are devices that capture images and videos by focusing light."
  },
  {
    word: "PRINTER",
    category: "Technology",
    difficulty: "Medium",
    clues: [
      "I am an external hardware output device.",
      "I take electronic data from a computer and generate a hard copy.",
      "I use cartridges filled with liquid ink or dry toner powder.",
      "I feed sheets of paper through rollers to apply text and images.",
      "I can print documents in black-and-white or full color."
    ],
    explanation: "Printers transfer digital text and images onto physical paper using ink or toner."
  },
  {
    word: "ROUTER",
    category: "Technology",
    difficulty: "Hard",
    clues: [
      "I am a networking device that forwards data packets between networks.",
      "I connect your home devices to the wider Internet.",
      "I read IP addresses to direct web traffic to the correct destination.",
      "I usually broadcast a wireless signal called Wi-Fi.",
      "I have blinking lights and Ethernet ports on my back."
    ],
    explanation: "Routers are networking hardware that direct internet traffic to local devices."
  },
  {
    word: "DATABASE",
    category: "Technology",
    difficulty: "Hard",
    clues: [
      "I am an organized collection of structured information or data.",
      "I am stored electronically in a computer system.",
      "I am managed by a DBMS (Database Management System).",
      "I use languages like SQL to write, query, and edit records.",
      "I store user profiles, inventories, and transaction histories."
    ],
    explanation: "Databases are structured digital filing cabinets used to store and query large datasets."
  },
  {
    word: "ALGORITHM",
    category: "Technology",
    difficulty: "Hard",
    clues: [
      "I am a step-by-step set of instructions for solving a problem.",
      "I am the logical foundation of all computer software.",
      "I take inputs, process them, and produce a consistent output.",
      "I can be written in flowcharts, pseudocode, or programming languages.",
      "I am used by search engines to rank pages and apps to recommend videos."
    ],
    explanation: "Algorithms are precise sequences of instructions used by computers to solve problems."
  },

  // ─── 11. Space ────────────────────────────────────────────────────────────
  {
    word: "MOON",
    category: "Space",
    difficulty: "Easy",
    clues: [
      "I am a natural satellite that orbits a planet.",
      "I reflect light from the Sun rather than making my own.",
      "I cause the ocean tides on Earth through my gravitational pull.",
      "I change my apparent shape in phases, from crescent to full.",
      "Neil Armstrong was the first human to walk on my dusty surface."
    ],
    explanation: "The Moon is Earth's only natural satellite, orbiting it every 27.3 days."
  },
  {
    word: "STAR",
    category: "Space",
    difficulty: "Easy",
    clues: [
      "I am a luminous sphere of plasma held together by my own gravity.",
      "I produce energy through nuclear fusion in my core.",
      "I look like a tiny twinkling point of light in the night sky.",
      "The closest example of my kind to Earth is the Sun.",
      "I am grouped into patterns called constellations."
    ],
    explanation: "Stars are massive glowing spheres of hot gas fueled by nuclear fusion."
  },
  {
    word: "EARTH",
    category: "Space",
    difficulty: "Easy",
    clues: [
      "I am the third planet from the Sun.",
      "I am the only astronomical object known to harbor life.",
      "My surface is covered by liquid water (about 70%).",
      "I have a protective atmosphere rich in nitrogen and oxygen.",
      "I am often called the 'Blue Planet'."
    ],
    explanation: "Earth is our home planet, unique for its liquid water and life."
  },
  {
    word: "GALAXY",
    category: "Space",
    difficulty: "Medium",
    clues: [
      "I am a massive system bound together by gravity.",
      "I contain billions of stars, stellar remnants, gas, dust, and dark matter.",
      "I can be spiral, elliptical, or irregular in shape.",
      "I have a supermassive black hole at my center.",
      "The solar system resides in a spiral galaxy called the Milky Way."
    ],
    explanation: "Galaxies are gargantuan star systems held together by gravity."
  },
  {
    word: "COMET",
    category: "Space",
    difficulty: "Medium",
    clues: [
      "I am a small, icy celestial body that orbits the Sun.",
      "I am made of frozen gases, rock, and cosmic dust.",
      "As I get closer to the Sun, my ice warms up and vaporizes.",
      "This vaporization creates a glowing coma and a long tail of gas and dust.",
      "My tail always points directly away from the Sun."
    ],
    explanation: "Comets are cosmic snowballs that develop glowing tails when close to the Sun."
  },
  {
    word: "METEOR",
    category: "Space",
    difficulty: "Medium",
    clues: [
      "I am a streak of light in the sky.",
      "I am caused by a space rock entering Earth's atmosphere.",
      "I travel at extreme speeds, heating up due to air friction.",
      "I burn up completely in the mesosphere, creating a flash.",
      "I am commonly called a 'shooting star' or 'falling star'."
    ],
    explanation: "Meteors are streaks of light caused by meteoroids burning up in Earth's atmosphere."
  },
  {
    word: "SUPERNOVA",
    category: "Space",
    difficulty: "Hard",
    clues: [
      "I am a colossal astronomical event.",
      "I represent the final, dramatic stage of a massive star's life.",
      "I am a powerful explosion that outshines entire galaxies.",
      "I blast heavy elements and dust out into deep space.",
      "I leave behind a dense neutron star or a black hole."
    ],
    explanation: "A supernova is a catastrophic stellar explosion marking the death of a massive star."
  },
  {
    word: "ASTEROID",
    category: "Space",
    difficulty: "Hard",
    clues: [
      "I am a rocky, airless remnant left over from the early solar system.",
      "I am much smaller than a planet and lack an atmosphere.",
      "I orbit the Sun, mostly in a dense belt between Mars and Jupiter.",
      "I am made of minerals, metals, and silicate rocks.",
      "An impact by one of my kind famously wiped out the dinosaurs."
    ],
    explanation: "Asteroids are rocky, metallic bodies orbiting the Sun, mostly in the asteroid belt."
  },
  {
    word: "NEBULA",
    category: "Space",
    difficulty: "Hard",
    clues: [
      "I am an enormous cloud of dust and gas in interstellar space.",
      "I am made mostly of hydrogen and helium gases.",
      "I can be a nursery where new stars are born from collapsing dust.",
      "I can also be formed by the debris of dying stars.",
      "I appear in beautiful, colorful shapes like the Eagle or Orion."
    ],
    explanation: "Nebulae are massive clouds of cosmic dust and gas where stars are born or die."
  },

  // ─── 12. School Objects ───────────────────────────────────────────────────
  {
    word: "BOOK",
    category: "School Objects",
    difficulty: "Easy",
    clues: [
      "I am a physical or digital medium containing written information.",
      "I consist of many sheets of paper bound together.",
      "I have a front cover and a back cover.",
      "I am read to gather knowledge, learn stories, or study.",
      "I am kept on shelves in a library."
    ],
    explanation: "Books are bound pages of text and images used for reading and studying."
  },
  {
    word: "PENCIL",
    category: "School Objects",
    difficulty: "Easy",
    clues: [
      "I am a common writing tool.",
      "I have a thin protective outer shaft, usually made of wood.",
      "My core is made of a mixture of clay and graphite.",
      "I must be sharpened to expose my writing tip.",
      "My marks can be rubbed away with an eraser."
    ],
    explanation: "Pencils are graphite-core writing tools housed in wooden shafts."
  },
  {
    word: "RULER",
    category: "School Objects",
    difficulty: "Easy",
    clues: [
      "I am a straight strip of wood, plastic, or metal.",
      "I am marked with regular intervals called inches or centimeters.",
      "I am used to draw straight lines on paper.",
      "I am used to measure the length of objects.",
      "I am a standard item in a student's pencil box."
    ],
    explanation: "Rulers are marked straightedges used for drawing lines and measuring length."
  },
  {
    word: "NOTEBOOK",
    category: "School Objects",
    difficulty: "Medium",
    clues: [
      "I am a collection of blank or ruled sheets of paper.",
      "I am bound with staples, glue, or spiral wire.",
      "I am used by students to write class notes and solve equations.",
      "I am filled with writing rather than printed text.",
      "My pages can be torn out along perforated lines."
    ],
    explanation: "Notebooks are booklets of blank or lined paper used for writing notes."
  },
  {
    word: "GLOBE",
    category: "School Objects",
    difficulty: "Medium",
    clues: [
      "I am a three-dimensional spherical model.",
      "I represent a miniature version of the Earth.",
      "I show map features like continents, oceans, and borders.",
      "I am mounted on a stand so you can spin me on my axis.",
      "I am used in geography classes to show earth's tilt and rotation."
    ],
    explanation: "Globes are spherical scale models of the Earth."
  },
  {
    word: "CALCULATOR",
    category: "School Objects",
    difficulty: "Medium",
    clues: [
      "I am a small electronic device with a screen and buttons.",
      "I am used to perform mathematical computations.",
      "I perform addition, subtraction, multiplication, and division.",
      "My advanced version can compute complex trigonometry and algebra.",
      "I help students check their math answers quickly."
    ],
    explanation: "Calculators are electronic devices used to perform mathematical calculations."
  },
  {
    word: "MICROSCOPE",
    category: "School Objects",
    difficulty: "Hard",
    clues: [
      "I am a scientific laboratory instrument.",
      "I use glass lenses to magnify extremely small specimens.",
      "I help you see objects that are invisible to the naked eye.",
      "Students use me to view plant cells, blood cells, and bacteria.",
      "Specimens are placed on glass slides under my objective lens."
    ],
    explanation: "Microscopes are instruments used to view highly magnified micro-objects."
  },
  {
    word: "PROTRACTOR",
    category: "School Objects",
    difficulty: "Hard",
    clues: [
      "I am a flat, semi-circular geometry tool.",
      "I am typically made of transparent plastic.",
      "I am marked with degrees from 0 to 180.",
      "I am used to measure the size of angles in geometry.",
      "I am used to draw precise angles on paper."
    ],
    explanation: "Protractors are semi-circular tools marked with degrees to measure and draw angles."
  },
  {
    word: "COMPASS",
    category: "School Objects",
    difficulty: "Hard",
    clues: [
      "I am a drawing instrument used in geometry and technical drawing.",
      "I am a V-shaped tool with two legs joined at a hinge.",
      "One of my legs ends in a sharp metal needle point.",
      "My other leg holds a pencil lead or drawing pen.",
      "I am rotated on a page to draw perfect circles and arcs."
    ],
    explanation: "In geometry, a compass is a hinged V-shaped tool used to draw circles."
  },

  // ─── 13. Daily Life Objects ───────────────────────────────────────────────
  {
    word: "CLOCK",
    category: "Daily Life Objects",
    difficulty: "Easy",
    clues: [
      "I am a device found in almost every home and office.",
      "I am used to measure and display time.",
      "I have a face with numbers from 1 to 12.",
      "I use rotating indicators called the hour hand and minute hand.",
      "I make a ticking sound and ring alarms to wake you up."
    ],
    explanation: "Clocks are devices that display the hours and minutes of the day."
  },
  {
    word: "KEY",
    category: "Daily Life Objects",
    difficulty: "Easy",
    clues: [
      "I am a small piece of metal with teeth or grooves.",
      "I am carried on a ring in pockets or purses.",
      "I am inserted into a slot and turned.",
      "I work in tandem with a lock.",
      "I am used to unlock doors, safes, and start cars."
    ],
    explanation: "Keys are metal tools designed to open and secure locks."
  },
  {
    word: "CHAIR",
    category: "Daily Life Objects",
    difficulty: "Easy",
    clues: [
      "I am a standard piece of furniture.",
      "I am designed to support one person.",
      "I usually have four legs, a flat seat, and a vertical backrest.",
      "I am placed at desks, dining tables, and in classrooms.",
      "My primary purpose is to be sat upon."
    ],
    explanation: "Chairs are basic raised seats with backs, designed for one person."
  },
  {
    word: "UMBRELLA",
    category: "Daily Life Objects",
    difficulty: "Medium",
    clues: [
      "I am a portable folding canopy supported by metal ribs.",
      "I am mounted on a central metal pole with a curved handle.",
      "I am made of waterproof fabric to shield you.",
      "I am popped open when it starts raining.",
      "I protect you from rain and harsh sunlight."
    ],
    explanation: "Umbrellas are collapsible canopies used for protection against rain and sun."
  },
  {
    word: "MIRROR",
    category: "Daily Life Objects",
    difficulty: "Medium",
    clues: [
      "I am a smooth glass surface coated with reflective metal.",
      "I reflect light waves without absorbing them.",
      "I show a reversed, identical image of whatever is in front of me.",
      "I am hung in bathrooms and built into dressing tables.",
      "People look at me to style their hair and check their reflection."
    ],
    explanation: "Mirrors are reflective glass panes that show visual reflections."
  },
  {
    word: "WALLET",
    category: "Daily Life Objects",
    difficulty: "Medium",
    clues: [
      "I am a small, flat folding pocket-sized case.",
      "I am made of leather, fabric, or plastic.",
      "I am used to carry paper currency, coins, and keys.",
      "I have slots for identity cards and credit cards.",
      "I am kept in trouser pockets or handbags."
    ],
    explanation: "Wallets are small folding cases used to organize money and cards."
  },
  {
    word: "FLASHLIGHT",
    category: "Daily Life Objects",
    difficulty: "Hard",
    clues: [
      "I am a portable hand-held electric light source.",
      "I was historically powered by dry cells, now often rechargeable.",
      "I use a reflector and lens to project a beam of light.",
      "I am essential during power outages or camping in the dark.",
      "I am also called a torch in British English."
    ],
    explanation: "Flashlights (torches) are portable battery-operated lights."
  },
  {
    word: "THERMOSTAT",
    category: "Daily Life Objects",
    difficulty: "Hard",
    clues: [
      "I am a temperature-sensitive control device.",
      "I monitor and regulate the temperature of a room or appliance.",
      "I turn heating or cooling systems on and off to maintain a target level.",
      "I am mounted on walls or built into refrigerators and ovens.",
      "My modern versions are digital and connected to smart home networks."
    ],
    explanation: "Thermostats are devices that automatically regulate temperature in systems."
  },
  {
    word: "BACKPACK",
    category: "Daily Life Objects",
    difficulty: "Hard",
    clues: [
      "I am a fabric sack carried on a person's back.",
      "I am secured with two straps that go over the shoulders.",
      "I am used to carry heavy loads while keeping hands free.",
      "Students use me to carry textbooks, notebooks, and lunchboxes.",
      "Hikers use me to carry gear, water, and supplies."
    ],
    explanation: "Backpacks are shoulder-strapped bags used for carrying books or supplies."
  }
];

// Helper to shuffle array in place
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate 5 Word Detective challenges for a game session.
 * @param {"Easy"|"Medium"|"Hard"} difficulty
 */
export function generateWordDetective(difficulty = "Medium") {
  // Filter words by difficulty
  const targetPool = WORD_POOL.filter((w) => w.difficulty === difficulty);
  
  // Get all unique categories available for this difficulty
  const categories = [...new Set(targetPool.map((w) => w.category))];
  
  // Shuffle categories and select 5 of them
  const selectedCategories = shuffleArray(categories).slice(0, 5);
  
  const challenges = selectedCategories.map((cat, idx) => {
    // Pick a target word from this category and difficulty
    const catWords = targetPool.filter((w) => w.category === cat);
    const targetItem = shuffleArray(catWords)[0];
    
    // Pick 3 distractors from the SAME category but different words (across all difficulties of the same category to guarantee variety)
    const allCatWords = WORD_POOL.filter((w) => w.category === cat && w.word !== targetItem.word);
    
    // Pick 3 unique distractors
    const distractorItems = shuffleArray(allCatWords).slice(0, 3);
    
    // Fallback if we don't have enough distractors in the same category (should not happen with our pool)
    while (distractorItems.length < 3) {
      const fallbackWord = WORD_POOL.find((w) => w.word !== targetItem.word && !distractorItems.some((d) => d.word === w.word));
      distractorItems.push(fallbackWord);
    }
    
    // Prepare options
    const options = [
      { id: "opt-correct", text: targetItem.word },
      ...distractorItems.map((d, dIdx) => ({ id: `opt-dist-${dIdx}`, text: d.word }))
    ];
    
    // Shuffle options
    const shuffledOptions = shuffleArray(options).map((opt, oIdx) => ({
      ...opt,
      id: `opt-${oIdx + 1}` // reassing tidy IDs
    }));
    
    // Determine the clues to show based on difficulty
    // Easy: 3 clues, Medium: 4 clues, Hard: 5 clues
    let maxClues = 4;
    if (difficulty === "Easy") maxClues = 3;
    if (difficulty === "Hard") maxClues = 5;
    
    // Extract actual clues to use (up to maxClues)
    const clueList = targetItem.clues.slice(0, maxClues);
    
    return {
      round: idx + 1,
      word: targetItem.word,
      category: targetItem.category,
      difficulty: targetItem.difficulty,
      clueList: clueList,
      options: shuffledOptions,
      answer: targetItem.word,
      explanation: targetItem.explanation
    };
  });
  
  return challenges;
}
