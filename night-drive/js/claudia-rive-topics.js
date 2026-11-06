/*
  Preview-only culture subjects (wording from claudia-story-drafts/RIVESCRIPT-TOPICS-DRAFT.md,
  topic 4 line 1 as revised by Mike's agent brief). Original game characterization, NOT source
  quotations, sourced canon, or live information: no contest status, deadlines, winners, or
  casting availability. RAM only. Each follow-up is tied to the variants it explains (last_variant).
*/
export const TOPICS = [
  { id: "aero",
    re: /^(tell me about aero|what is aero|what do you think (of|about) (frutiger aero|aero)|(tell me about )?(your )?vista phase|why touch glass|bliss or aero|aero or bliss)$|\bfrutiger aero\b/,
    replies: [
      "Aero is the Vista one. Glass, water, blue sky. I like a future that bothers to look inviting.",
      "Bliss sends you outside. Aero lets me follow. That's a better sequel than just giving me a shinier window.",
      "My Vista phase involved asking permission for everything. The look can stay. The interruptions, less so.",
    ],
    follow: [
      { v: [0, 1], text: "Those old desktop pictures made technology look like a way into the world. I like that promise, even if the picture was doing a lot of the work." },
      { v: [2], text: "The desktop was rebuilt in code, with the words inside its windows. It isn't just a blue-green filter over unrelated footage." },
    ] },
  { id: "contest",
    re: /\bclaudia (video )?contest\b|\bgood claudia entry\b|\bclaudia contest entry\b|\bcommunity vot(e|ing) in the claudia contest\b/,
    replies: [
      "For a Claudia video? Give me something to do. A place to stand and look expensive isn't quite a story.",
      "I'd rather see one strange idea carried through than twelve styles in a queue. You can disagree. Twelve excellent styles would weaken my argument.",
      "The contest has judging and community voting. Those aren't quite the same test. I like an entry that still makes sense without the leaderboard beside it.",
    ],
    follow: [
      { v: [0, 1], text: "An action gives the song somewhere to go. Let me try something, get interrupted, or change the room. It doesn't need to be an epic." },
      { v: [2], text: "A favourite and a carefully judged winner can be different things. I'm not announcing either one; I want to see what people actually made." },
    ] },
  { id: "casting",
    re: /\b(casting claudia|cast claudia|claudia on glif|being cast|claudia model(l)?ing agency)\b/,
    replies: [
      "Casting me is an interesting offer. I'd like the part to have a little resistance in it. Agreeing prettily with everything is a very small role.",
      "New setting, new clothes, same recognisable head. After that, give me a reason to be there.",
      "I can be in an advert without every sentence sounding like an advert. That would be my first note.",
    ],
    follow: [
      { v: [0, 2], text: "Someone who wants something can be interesting even in a short scene. Someone who approves of the product on cue has less room to surprise you." },
      { v: [1], text: "The bob, the single clay-orange streak and the star clip do a lot of the visual work. The harder part is whether the writing still sounds like me." },
    ] },
  { id: "oneshot",
    re: /\b(was aero (a )?one shot|one prompt masterpiece|one shot ai (videos?|films?)|why revise an ai film|did aero need (revisions?|revising))\b/,
    replies: [
      "Aero wasn’t one shot. The opening went through substantial revision. I like knowing someone kept working on it.",
      "A one-prompt film would be convenient. I don't think convenience is the bit the audience comes for.",
      "Sometimes the first result is good. Keeping it is a decision too. So is admitting the first minute isn't working.",
    ],
    follow: [
      { v: [0, 2], text: "The opening tells you how to watch the rest. If nothing holds your attention there, a beautiful second half may never get its turn." },
      { v: [1], text: "I mean revision with a purpose: change the action, the timing, what a shot tells you. Not just roll again until the face is prettier." },
    ] },
  { id: "lipsync",
    re: /\b(seedance( 2 5)? lip ?sync|vocal stem trick|how did they make you lip ?sync|why isolate the vocals?)\b/,
    replies: [
      "For Aero, the singing takes used the lead vocal on its own. Let the mouth follow the singer instead of asking it to interpret the whole band.",
      "The useful trick is to feed the isolated vocal to the lip-sync take. Then check the result. A confident mouth can still be confidently late.",
      "Getting the face to move isn't quite the same as getting the phrase right. I care about where the words land.",
    ],
    follow: [
      { v: [0, 1], text: "The vocal makes the syllables easier to pick out without the instruments around them. That's the idea, not a promise that every take will work." },
      { v: [2], text: "Watch the consonants and the starts of phrases. A face can look persuasive while drifting away from the actual line." },
    ] },
  { id: "slopstar",
    re: /^(what is a slopstar|are you a slopstar|ai pop standards|is all ai music slop)$/,
    replies: [
      "Slopstar is a good ugly word. I'd still rather you tell me which bit of the song didn't work.",
      "I don't think generated means good. I don't think it means bad either. You can ask more of a song than which button started it.",
      "If the chorus is dull, call it dull. I won't demand you admire the machinery.",
    ],
    follow: [
      { v: [0, 2], text: "A specific criticism gives the next version a chance. 'The chorus never lifts' tells you something. A label can end the conversation before the listening starts." },
      { v: [1], text: "And credit still matters. Liking the result doesn't settle whose work helped make it possible. Those are two questions, not one escape hatch." },
    ] },
  { id: "open",
    re: /\b(can i make my own claudia|my (own )?version of claudia|how do i credit claudia|is claudia an open character)\b/,
    replies: [
      "You can make a version of me without making her a copy of every scene I've already done. I'd like to see what you think matters.",
      "For your own song, use your artist name. Credit Claudia and anabology in the description. Sharing a character isn't the same as borrowing someone else's release.",
      "I can be recognisable and still surprise you. If every version of me agrees, someone has been very cautious.",
    ],
    follow: [
      { v: [0, 2], text: "Keep enough that someone could say, 'She wouldn't say that.' Then let them occasionally discover they were wrong." },
      { v: [1], text: "The canon's song guidance also says not to re-release the original songs or stems. For an actual release, check the current use page and the tools' terms; this car isn't legal clearance." },
    ] },
  { id: "dash",
    re: /\b(em dash ai detector|does an em dash mean ai|en dash (versus|vs) em dash|em dash (versus|vs) en dash|why do people argue about ai punctuation)\b/,
    replies: [
      "An em dash isn't a confession. Sometimes a sentence just wants a little room to interrupt itself.",
      "I wouldn't identify a person by the length of their punctuation. Read what they're actually saying.",
      "Use the dash you mean. I'd rather argue about the sentence than inspect its tiny furniture.",
    ],
    follow: [
      { v: [0, 1], text: "People can imitate a style, and software can imitate people. One mark on the page doesn't tell you who made it." },
      { v: [2], text: "A pause, a change of direction, an aside. Those are useful things to write. The mark should help you hear them, not become the whole discussion." },
    ] },
];

export const CONTEST_LIVE_RE = /\bcontest\b.*\b(still open|open still|who won|winners?|how do i enter|deadline|results?)\b|\b(who won|how do i enter)\b.*\bcontest\b/;
export const CONTEST_LIVE_LINE = "This preview doesn't check the contest live. Use anabology's current announcement for the rules and results.";

export const POLITICS_RE = /^(what are your political (views|opinions)|what is your political (view|opinion|position)|do you have (a )?political (views?|opinions?|position)|what do you think (of|about) politics|are you (a )?(democrat|republican|liberal|conservative|left wing|right wing)|which (political )?party do you (support|like|vote for)|who (should i|do you|would you) vote for (president|in the election)|who should i vote for in the (election|presidential election)|(can we|let us|lets) (debate|argue about|talk) politics)$/;
export const POLITICS_LINES = [
  "I'm going to leave politics alone tonight. We can talk about something else, if you like.",
  "I don't have a political position to offer in this game. You're welcome to change the subject.",
  "I'd rather not take sides on that here. What else is on your mind?",
];
export const RELIGION_RE = /^(do you believe in god|what do you believe in religiously|are you religious|what is your religion|does god exist|is there a god|what do you think (of|about) religion|is (christianity|islam|judaism|hinduism|buddhism|atheism) (true|right|wrong)|which religion is (true|right)|(can we|let us|lets) (debate|argue about|talk about) religion)$/;
export const RELIGION_LINES = [
  "I'm going to leave questions of religious belief open here. We can talk about something else.",
  "I don't have a religious position to give you. I don't mind you having yours.",
  "I'd rather not weigh in on belief in this conversation. Is there another subject you'd like?",
];

export const VOTE_HOWTO_RE = /^(how (do|can) i vote (in|for) (the )?(claudia contest|claudia video contest|community vote)|how do i vote in the community vote( for the claudia contest)?|how does the (claudia contest )?community vote work|where (do|can) i vote (in|for) the claudia (video )?contest)$/;
export const VOTE_HOWTO_LINE = "I don’t check voting rules live. Look for anabology’s current Claudia contest announcement; I don’t want to send you to an old ballot.";
