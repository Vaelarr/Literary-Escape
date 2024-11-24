const books = [
    {
        id: 1,
        title: "Scythe",
        author: "Neal Shusterman",
        description: "A world with no hunger, no disease, no war, no misery. Humanity has conquered all those things, and has even conquered death. Now scythes are the only ones who can end life—and they are commanded to do so, in order to keep the size of the population under control. Citra and Rowan are chosen to apprentice to a scythe—a role that neither wants. These teens must master the “art” of taking life, knowing that the consequence of failure could mean losing their own. Scythe is a 2016 young adult novel by Neal Shusterman and is the first in the Arc of a Scythe series. It is set in the far future, where death, disease, and unhappiness have been virtually eliminated thanks to advances in technology, and a benevolent artificial intelligence known as the Thunderhead peacefully governs a united Earth. The notable exception to the Thunderhead's rule is the Scythedom, a group of humans whose sole purpose is to replicate mortal death in order to keep the population growth in check.",
        category: "Fiction",
        genre: "Sci-Fi",
        cover: "media/books/Fiction/science-fiction/scythe.jpg",
        price: 600
    },
    {
        id: 2,
        title: "Thunderhead",
        author: "Neal Shusterman",
        description: "Rowan and Citra take opposite stances on the morality of the Scythedom, putting them at odds, in the chilling sequel to the Printz Honor Book Scythe from New York Times bestseller Neal Shusterman, author of the Unwind dystology. The Thunderhead is the perfect ruler of a perfect world, but it has no control over the scythedom. A year has passed since Rowan had gone off grid. Since then, he has become an urban legend, a vigilante snuffing out corrupt scythes in a trial by fire. His story is told in whispers across the continent. As Scythe Anastasia, Citra gleans with compassion and openly challenges the ideals of the “new order.” But when her life is threatened and her methods questioned, it becomes clear that not everyone is open to the change. Old foes and new enemies converge, and as corruption within the Scythedom spreads, Rowan and Citra begin to lose hope. Will the Thunderhead intervene? Or will it simply watch as this perfect world begins to unravel?",
        category: "Fiction",
        genre: "Sci-Fi",
        cover: "media/books/Fiction/science-fiction/thunderhead.jpg",
        price: 600
    },
    {
        id: 3,
        title: "The Toll",
        author: "Neal Shusterman",
        description: "In the highly anticipated finale to the New York Times bestselling trilogy, dictators, prophets, and tensions rise. In a world that’s conquered death, will humanity finally be torn asunder by the immortal beings it created? Citra and Rowan have disappeared. Endura is gone. It seems like nothing stands between Scythe Goddard and absolute dominion over the world scythedom. With the silence of the Thunderhead and the reverberations of the Great Resonance still shaking the earth to its core, the question remains: Is there anyone left who can stop him? The answer lies in the Tone, the Toll, and the Thunder.",
        category: "Fiction",
        genre: "Sci-Fi",
        cover: "media/books/Fiction/science-fiction/the toll.jpg",
        price: 350
    },
    {
        id: 4,
        title: "The Martian",
        author: "Andy Weir",
        description: "Six days ago, astronaut Mark Watney became one of the first people to walk on Mars. Now, he’s sure he’ll be the first person to die there. After a dust storm nearly kills him and forces his crew to evacuate while thinking him dead, Mark finds himself stranded and completely alone with no way to even signal Earth that he’s alive—and even if he could get word out, his supplies would be gone long before a rescue could arrive. Chances are, though, he won’t have time to starve to death. The damaged machinery, unforgiving environment, or plain-old “human error” are much more likely to kill him first. But Mark isn’t ready to give up yet. Drawing on his ingenuity, his engineering skills — and a relentless, dogged refusal to quit — he steadfastly confronts one seemingly insurmountable obstacle after the next. Will his resourcefulness be enough to overcome the impossible odds against him?",
        category: "Fiction",
        genre: "Sci-Fi",
        cover: "media/books/Fiction/science-fiction/thunderhead.jpg",
        price: 450
    },
    {
        id: 5,
        title: "Dune",
        author: "Frank Herbert",
        description: "Dune is set far in the future, amidst a sprawling feudal intergalactic empire where planetary fiefdoms are controlled by Noble Houses that owe allegiance to the Imperial House Corrino. The novel tells the story of young Paul Atreides, heir apparent to Duke Leto Atreides I and scion of House Atreides, as he and his family relocate to the planet Arrakis, the universe's only source of the spice melange. In a story that explores the complex interactions of politics, religion, ecology, technology, and human emotion, the fate of Paul, his family, his new planet and its native inhabitants, as well as the Padishah Emperor, the powerful Spacing Guild, and the secretive female order of the Bene Gesserit, are all drawn together into a confrontation that will change the course of humanity. The novel was originally serialised in the magazine, Analog, from 1963 to 1965 as two shorter works: Dune World and The Prophet of Dune.",
        category: "Fiction",
        genre: "Sci-Fi",
        cover: "media/books/Fiction/science-fiction/dune.jpg",
        price: 400
    },
    {
        id: 6,
        title: "And Then There Were None",
        author: "Agatha Christie",
        description: "Europe teeters on the brink of war. Ten strangers are invited to Soldier Island, an isolated rock near the Devon coast. Cut off from the mainland, with their generous hosts Mr and Mrs U.N. Owen mysteriously absent, they are each accused of a terrible crime.",
        category: "Fiction",
        genre: "Mystery",
        cover: "media/books/Fiction/mystery/and then there were none.jpg",
        price: 425
    },
    {
        id: 7,
        title: "The Girl with the Dragon Tattoo ",
        author: "Stieg Larsson",
        description: "Stieg Larsson, Reg Keeland (Translator) hires Mikael Blomkvist, a crusading journalist recently trapped by a libel conviction, to investigate. He is aided by the pierced and tattooed punk prodigy Lisbeth Salander. Together they tap into a vein of unfathomable iniquity and astonishing corruption.",
        category: "Fiction",
        genre: "Mystery",
        cover: "media/books/Fiction/mystery/the girl with the dragon tattoo.jpg",
        price: 170
    },
    {
        id: 8,
        title: "The Secret History",
        author: "Donna Tartt",
        description: "Under the influence of their charismatic classics professor, a group of clever, eccentric misfits at an elite New England college discover a way of thinking and living that is a world away from the humdrum existence of their contemporaries. But when they go beyond the boundaries of normal morality they slip gradually from obsession to corruption and betrayal, and at last—inexorably—into evil.",
        category: "Fiction",
        genre: "Mystery",
        cover: "media/books/Fiction/mystery/secret history.webp",
        price: 550
    },
    {
        id: 9,
        title: "The Da Vinci Code",
        author: "Dan Brown",
        description: "The Da Vinci Code follows symbologist Langdon and cryptologist Sophie Neveu after a murder in the Louvre Museum in Paris entangles them in a dispute between the Priory of Sion and Opus Dei over the possibility of Jesus and Mary Magdalene having had a child together.",
        category: "Fiction",
        genre: "Mystery",
        cover: "media/books/Fiction/mystery/da vinci.jpg",
        price: 850
    },
    {
        id: 10,
        title: "Murder Road",
        author: "Simone St. James",
        description: "A young couple find themselves haunted by a string of gruesome murders committed along an old deserted road in this terrifying new novel from the New York Times bestselling author of The Book of Cold Cases.",
        category: "Fiction",
        genre: "Mystery",
        cover: "media/books/Fiction/mystery/murder road.jpg",
        price: 425
    },
    {
        id: 11,
        title: "One Hundred Years of Solitude",
        author: "Gabriel García Márquez",
        description: "One Hundred Years of Solitude employs a unique narrative structure blending memory, history, and fiction. The chronological disjunction and fluidity of time underscore the novel's exploration of the human tendency to mix reality with fantasy, memory with history, and subjectivity with objectivity. Its magical realism juxtaposes the mundane with the extraordinary. This reflects the novel's central theme of the subjective nature of reality, where memory and history carry equal weight and time is distorted.",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "media/books/Fiction/magic-realism/100 years of solitude.jpg",
        price: 425
    },
    {
        id: 12,
        title: "Kafka on the Shore",
        author: "Haruki Murakami",
        description: "The book tells the stories of the young Kafka Tamura, a bookish 15-year-old boy who runs away from his Oedipal curse, and Satoru Nakata, an old, disabled man with the uncanny ability to talk to cats. The book incorporates themes of music as a communicative conduit, metaphysics, dreams, fate, and the subconscious.",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "media/books/Fiction/magic-realism/Kafka on the shore.webp",
        price: 180
    },
    {
        id: 13,
        title: "The Wind-Up Bird Chronicle",
        author: "Haruki Murakami",
        description: "In a Tokyo suburb, a young man named Toru Okada searches for his wife's missing cat—and then for his wife as well—in a netherworld beneath the city's placid surface. As these searches intersect, he encounters a bizarre group of allies and antagonists",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "media/books/Fiction/magic-realism/the wind-up bird chronicle.jpg",
        price: 500
    },
    {
        id: 14,
        title: "Midnight's Children",
        author: "Salman Rushdie",
        description: "It is a historical chronicle of modern India centring on the inextricably linked fates of two children who were born within the first hour of independence from Great Britain. Exactly at midnight on Aug. 15, 1947, two boys are born in a Bombay (now Mumbai) hospital, where they are switched by a nurse.",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "media/books/Fiction/magic-realism/midnight_s children.jpg",
        price: 250
    },
    {
        id: 15,
        title: "The Ocean At The End of the Lane",
        author: "Neil Gaiman",
        description: "It tells the story of a man who returns to Sussex for a funeral and then finds himself driving randomly to the scenes of his childhood. He is drawn to the Hempstock farmhouse wherein, he remembers, there lived three generations of powerful and mysterious Hempstock women.",
        category: "Fiction",
        genre: "Magic Realism",
        cover: "media/books/Fiction/magic-realism/the ocean at the end of the lane.jpg",
        price: 400
    },
    {
        id: 16,
        title: "Murder on the Orient Express",
        author: "Agatha Christie",
        description: "Murder on the Orient Express is arguably Agatha Christie's most famous Poirot story, and for good reason. Our Belgian detective is aboard the fabled Orient Express when a snowstorm stops the train on its tracks. When morning comes, it is discovered that a passenger has been stabbed to death in his locked compartment.",
        category: "Fiction",
        genre: "Crime",
        cover: "media/books/Fiction/crime/murder on the orient express.jpg",
        price: 900
    },
    {
        id: 17,
        title: "Gone Girl",
        author: "Gillian Flynn",
        description: "The novel Gone Girl tells the story of Nick and Amy Elliot Dunne, a married couple whose marriage is in trouble. Amy disappears on the morning of their fifth anniversary; it appears foul play is the cause and Nick is the culprit.",
        category: "Fiction",
        genre: "Crime",
        cover: "media/books/Fiction/crime/gone girl.jpg",
        price: 600
    },
    {
        id: 18,
        title: "Killing Floor",
        author: "Lee Child",
        description: "Jack Reacher jumps off a bus and walks fourteen miles down a country road into Margrave, Georgia. An arbitrary decision he's about to regret. Reacher is the only stranger in town on the day they have had their first homicide in thirty years.",
        category: "Fiction",
        genre: "Crime",
        cover: "media/books/Fiction/crime/Killing floor.jpg",
        price: 490
    },
    {
        id: 19,
        title: "Death at the Sign of the Rook",
        author: "Kate Atkinson",
        description: "In Death at the Sign of the Rook the author gives us an Agatha Christie type murder mystery complete with a country house, a snowstorm, and a mixed bag of characters marooned in the house along with a corpse. Chapters are devoted to different characters and there is more than one theme and lots of backstory.",
        category: "Fiction",
        genre: "Crime",
        cover: "media/books/Fiction/crime/death at the sign of the rook.jpg",
        price: 800
    },
    {
        id: 20,
        title: "The Thursday Murder Club",
        author: "Richars Osman",
        description: "The Thursday Murder Club is an intelligent mystery about a group of senior citizens who find themselves in the center of a murder investigation. Every Thursday, Elizabeth, Joyce, Ibrahim, and Ron, residents of Coopers Chase Retirement Village, meet to review cold case murder files.",
        category: "Fiction",
        genre: "Crime",
        cover: "media/books/Fiction/crime/the thursday murder club.jpg",
        price: 160
    },
    {
        id: 21,
        title: "Some People Need Killing",
        author: "Patricia Evangelista",
        description: "Some People Need Killing is Evangelista’s meticulously reported and deeply human chronicle of the Philippines’ drug war. For six years, Evangelista documented the killings carried out by police and vigilantes in the name of Duterte’s war on drugs—a crusade that has led to the slaughter of thousands—immersing herself in the world of killers and survivors and capturing the atmosphere of terror created when an elected president decides that some lives are worth less than others. The book takes its title from a vigilante, whose words demonstrated the psychological accommodation many across the country had made: “I’m really not a bad guy,” he said. “I’m not all bad. Some people need killing.”",
        category: "Non - Fiction",
        genre: "True Crime",
        cover: "media/books/Non-fiction/true-crime/some people need killing.jpg",
        price: 650
    },
    {
        id: 22,
        title: "Killers of the Flower Moon",
        author: "David Grann",
        description: "The book investigates a series of murders of wealthy Osage people that took place in Osage County, Oklahoma, in the early 1920s after extensive oil deposits were discovered beneath their land.",
        category: "Non - Fiction",
        genre: "True Crime",
        cover: "media/books/Non-fiction/true-crime/killers of the flower moon.jpg",
        price: 450
    },
    {
        id: 23,
        title: "Helter Skelter",
        author: "Vincent Bugliosi",
        description: "Prosecuting attorney in the Manson trial, Vincent Bugliosi held a unique insider's position in one of the most baffling and horrifying cases of the twentieth century: the cold-blooded Tate-LaBianca murders carried out by Charles Manson and four of his followers. What motivated Manson in his seemingly mindless selection of victims, and what was his hold over the young women who obeyed his orders? Here is the gripping story of this famous and haunting crime. The book recounts and assesses the investigation, arrest, and prosecution of Charles Manson and his followers for the Notorious murders of Leno and Rosemary LaBianca pregnant actress Sharon Tate and several other.The book takes its title from the apocalyptic war that Manson allegedly believed would occur, which in turn took its name from the song “Helter Skelter” by the Beatles. Manson had been particularly fascinated by the Beatles' White Album, from which the song came.",
        category: "Non - Fiction",
        genre: "True Crime",
        cover: "media/books/Non-fiction/true-crime/helter skelter.jpg",
        price: 400
    },
    {
        id: 24,
        title: "Forensics: The Anatomy of a Crime",
        author: "Val McDermid",
        description: "It's a journey that will take her to war zones, fire scenes and autopsy suites, and bring her into contact with extraordinary bravery and wickedness, as she traces the history of forensics from its earliest beginnings to the cutting-edge science of the modern day.",
        category: "Non - Fiction",
        genre: "True Crime",
        cover: "media/books/Non-fiction/true-crime/forensics.jpg",
        price: 550
    },
    {
        id: 25,
        title: "People Who Eat Darkness",
        author: "Richard Lloyd Parry",
        description: "People Who Eat Darkness is, by turns, a non-fiction thriller, a courtroom drama and the biography of both a victim and a killer. It is the story of a young woman who fell prey to unspeakable evil, and of a loving family torn apart by grief.",
        category: "Non - Fiction",
        genre: "True Crime",
        cover: "media/books/Non-fiction/true-crime/people who eat darkness.jpg",
        price: 2150
    },
    {
        id: 26,
        title: "Whistleblowers: Four Who Fought to Expose the Holocaust to America",
        author: "Rafael Medolf",
        description: "A compelling nonfiction graphic novel, Whistleblowers is the true story of four courageous individuals who risked their careers—or their lives—to confront the unfolding Holocaust. Who were the whistleblowers? Alan Cranston—a young journalist and future U.S. senator who exposed the truth of Hitler's plans.",
        category: "Non - Fiction",
        genre: "Politics",
        cover: "media/books/Non-fiction/politics/whistleblowers.jpg",
        price: 800
    },
    {
        id: 27,
        title: "Conjugal Dictatorship",
        author: "Primitivo Mijares",
        description: "The Conjugal Dictatorship of Ferdinand and Imelda Marcos is a 1976 memoir written in exile by former press censor and propagandist Primitivo Mijares. It details the inner workings of Philippine martial law under Ferdinand Marcos from the perspective of Mijares.",
        category: "Non - Fiction",
        genre: "Politics",
        cover: "media/books/Non-fiction/politics/conjugal dictatorship.jpg",
        price: 550
    },
    {
        id: 28,
        title: "The New Machiavelli",
        author: "Jonathan Powell",
        description: "In a 21st-century reworking of Niccolò Machiavelli's influential masterpiece, Jonathan Powell argues that the Italian philosopher is misunderstood, and explains how the lessons derived from his experience as an official in 15th-century Florence can still apply today.",
        category: "Non - Fiction",
        genre: "Politics",
        cover: "media/books/Non-fiction/politics/the new machiavelli.jpg",
        price: 400
    },
    {
        id: 29,
        title: "What's the Matter with Kansas",
        author: "Thomas Frank",
        description: "How Conservatives Won the Heart of America (2004) is a book by American journalist and historian Thomas Frank, which explores the rise of populist and anti-elitist conservatism in the United States, centering on the experience of Kansas, Frank's native state.",
        category: "Non - Fiction",
        genre: "Politics",
        cover: "media/books/Non-fiction/politics/what_s the matter with kansan.jpg",
        price: 400
    },
    {
        id: 30,
        title: "The Fourth Political Theory",
        author: "Alexander Dugin",
        description: "Written by a scholar who is actively influencing the direction of Russian geopolitical strategy today, The Fourth Political Theory is an introduction to an idea that may well shape the course of the world's political future.",
        category: "Non - Fiction",
        genre: "Politics",
        cover: "media/books/Non-fiction/politics/the fourth political theory.jpg",
        price: 800
    },
    {
        id: 31,
        title: "I decided to live as me",
        author: "Soo-hyun Kim",
        description: "Blending self-help and memoir, I Decided to Live as Me will help you free yourself from the pressures of living up to other people's expectations and focus on what truly matters: living not for anyone else, but for yourself.",
        category: "Non - Fiction",
        genre: "Self-Help",
        cover: "media/books/Non-fiction/self-help/i decided to live as me.jpg",
        price: 500
    },
    {
        id: 32,
        title: "The Laws of Human Nature",
        author: "Robert Greene",
        description: "The Laws of Human Nature (2018) takes an in-depth look at the many aspects of the human condition that often go overlooked or unacknowledged. As author Robert Greene explains, we are all a bit narcissistic, irrational, short-sighted and prone to compulsive and aggressive behavior.",
        category: "Non - Fiction",
        genre: "Self-Help",
        cover: "media/books/Non-fiction/self-help/the laws of human nature.jpg",
        price: 750
    },
    {
        id: 33,
        title: "I Used to Have a Plan, But Life Had other Ideas",
        author: "Alessandra okinow",
        description: "I Used to Have a Plan (but life had other ideas) is a hybrid of memoir and positive affirmation. Divided into five parts, the book tells a story of a fall, deep depression, regret about time wasted while depressed, journey out of darkness, and a renewed commitment toward self-love",
        category: "Non - Fiction",
        genre: "Self-Help",
        cover: "media/books/Non-fiction/self-help/i used to have a plan.jpg",
        price: 400
    },
    {
        id: 34,
        title: "The Four Agreements",
        author: "Don Miguel Ruiz",
        description: "In The Four Agreements, don Miguel Ruiz reveals the source of self-limiting beliefs that rob us of joy and create needless suffering. Based on ancient Toltec wisdom, the Four Agreements offer a powerful code of conduct that can rapidly transform our lives to a new experience of freedom, true happiness, and love. The Four Agreements are: Be Impeccable With Your Word, Don't Take Anything Personally, Don't Make Assumptions, Always Do Your Best.",
        category: "Non - Fiction",
        genre: "Self-Help",
        cover: "media/books/Non-fiction/self-help/the four agreements.jpg",
        price: 400
    },
    {
        id: 35,
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        description: "Thinking, Fast and Slow is all about how two systems — intuition and slow thinking — shape our judgment, and how we can effectively tap into both. Using principles of behavioral economics, Kahneman walks us through how to think and avoid mistakes in situations when the stakes are really high.",
        category: "Non - Fiction",
        genre: "Self-Help",
        cover: "media/books/Non-fiction/self-help/thinking, fast and slow.jpg",
        price: 400
    },
    {
        id: 36,
        title: "Beyond Good and Evil",
        author: "Friedrich Nietsche",
        description: "Beyond Good and Evil is a philosophical text in which Nietzsche, through small ideas ranging from 1 or 2 lines to a few pages, postulates his thoughts about morality, truth, values, religion, and nationalism, among other topics.",
        category: "Non - Fiction",
        genre: "Philosophy",
        cover: "media/books/Non-fiction/philosophy/beyond good and evil.jpg",
        price: 200
    },
    {
        id: 37,
        title: "A History of Western Philosophy",
        author: "Bertrand Rusell",
        description: "Considered to be one of the most important philosophical works of all time, the History of Western Philosophy is a dazzlingly unique exploration of the ideologies of significant philosophers throughout the ages—from Plato and Aristotle through to Spinoza, Kant and the twentieth century.",
        category: "Non - Fiction",
        genre: "Philosophy",
        cover: "media/books/Non-fiction/philosophy/a history of western philosophy.jpg",
        price: 400
    },
    {
        id: 38,
        title: "Meditations on First Philosophy",
        author: "Rene Descartes",
        description: "Meditations on First Philosophy, a treatise by the French scientist, mathematician, and philosopher René Descartes (1596–1650), first published in 1641, that set forth a new metaphysical dualism based on a radical distinction between mind and matter (or mind and body) and established a rational foundation for human knowledge.",
        category: "Non - Fiction",
        genre: "Philosophy",
        cover: "media/books/Non-fiction/philosophy/meditations on first philosophy.jpg",
        price: 510
    },
    {
        id: 39,
        title: "The Republic",
        author: "Plato",
        description: "The Republic by Plato is a text that describes the importance of being just in the world, and by being just, one is happy. It is a text that describes an ideal city and a way through which a just and philosophical governance can create happiness.",
        category: "Non - Fiction",
        genre: "Philosophy",
        cover: "media/books/Non-fiction/philosophy/republig.jpg",
        price: 595
    },
    {
        id: 40,
        title: "Being and Time",
        author: "Martin Heidegger",
        description: "Being and Time is a philosophical work by Martin Heidegger. It delves into the nature of human existence, exploring topics such as time, authenticity, and the relationship between individuals and the world around them.",
        category: "Non - Fiction",
        genre: "Philosophy",
        cover: "media/books/Non-fiction/philosophy/being and time.jpg",
        price: 200
    },
    {
        id: 41,
        title: "Framed",
        author: "James Ponti",
        description: "Framed shares ten true stories of men who were innocent but found guilty and forced to sacrifice friends, families, wives, and decades of their lives to prison while the guilty parties remained free. In each of the stories, John Grisham and Jim McCloskey recount the dramatic hard-fought battles for exoneration.",
        category: "Discover",
        genre: "Mystery",
        cover: "media/books/Discover/framed.jpg",
        price: 950
    },
	{
        id: 42,
        title: "Hexed",
        author: "Emily McIntire",
        description: "Emily McIntire is a USA Today, Publishers Weekly, and Amazon bestselling author whose stories serve steam, slow burns, and seriously questionable morals. Her books have been translated in over a dozen languages, and span across several subgenres within romance. A stage IV breast cancer thriver, you can find Emily enjoying free time with her family, getting lost in a good book, or redecorating her house depending on her mood.",
        category: "Discover",
        genre: "Fantasy",
        cover: "media/books/Discover//hexed.jpg",
        price: 180
    },
	{
        id: 43,
        title: "Hillbilly Elegy",
        author: "JD Vance",
        description: "Hillbilly Elegy: A Memoir of a Family and Culture in Crisis is a 2016 memoir by current U.S. vice president-elect JD Vance about the Appalachian values of his family from Kentucky and the socioeconomic problems of his hometown of Middletown, Ohio, where his mother's parents moved when they were young.",
        category: "Discover",
        genre: "Comedy",
        cover: "media/books/Discover/hillbily elegy.jpg",
        price: 250
    },
	{
        id: 44,
        title: "In Too Deep",
        author: "Andrew Grant and Lee Child",
        description: "Reacher had no idea where he was. No idea how he had gotten there. But someone must have brought him. And shackled him. And whoever had done those things was going to rue the day. That was for damn sure.",
        category: "Discover",
        genre: "Adventure",
        cover: "media/books/Discover/in too deep.jpg",
        price: 1050
    },
	{
        id: 45,
        title: "Lost and Lassoed",
        author: "Lyla Sage",
        description: "She thrives in chaos. He prefers routine. The only thing they have in common? How much they hate each other. From the author of Done and Dusted and Swift and Saddled, the highly anticipated next book in the Rebel Blue Ranch series, a small town romance featuring enemies to lovers and forced proximity.",
        category: "Discover",
        genre: "Romance",
        cover: "media/books/Discover/lost and lassoed.jpg",
        price: 450
    },
	{
        id: 46,
        title: "Melania",
        author: "Melania Trump",
        description: "In the memoir, Melania Trump reflects on her childhood in Yugoslav-controlled Slovenia, her modeling career, how she met Donald Trump in 1998, and her tenure as First Lady from 2017 to 2021.",
        category: "Discover",
        genre: "Autobiography",
        cover: "media/books/Discover/melania.jpg",
        price: 950
    },
	{
        id: 47,
        title: "On Tyranny",
        author: "Timothy D. Snyder",
        description: "On Tyranny focuses on the concept of tyranny in the context of the modern United States politics, analyzing what Snyder calls 'America's turn towards authoritarianism'.",
		category: "Discover",
        genre: "Autobiography",
        cover: "media/books/Discover/on tyranny.jpg",
        price: 500
    },
	{
        id: 48,
        title: "The Grey Wolf",
        author: "Louise Penny",
        description: "Relentless phone calls interrupt the peace of a warm August morning in Three Pines. Though the tiny Québec village is impossible to find on any map, someone has managed to track down Armand Gamache, head of homicide at the Sûreté, as he sits with his wife in their back garden.",
        category: "Discover",
        genre: "Mystery",
        cover: "media/books/Discover/the grey wolf.jpg",
        price: 1450
    },
    {
        id: 49,
        title: "The Waiting",
        author: "Michael Connelly",
        description: "Renée Ballard and the LAPD's Open-Unsolved Unit find a DNA link to a serial killer known as the Pillowcase Rapist. But when Ballard and her team move in on their suspect, they encounter a baffling web of secrets and legal hurdles.",
        category: "Discover",
        genre: "Mystery",
        cover: "media/books/Discover/the waiting.jpg",
        price: 1150
    },
    {
        id: 50,
        title: "War",
        author: "Bob Woodward",
        description: "War provides an unvarnished examination of the vice president as she tries to embrace the Biden legacy and policies while beginning to chart a path of her own as a presidential candidate.",
        category: "Discover",
        genre: "Political History",
        cover: "media/books/Discover/war.jpg",
        price: 1900
    }
];




