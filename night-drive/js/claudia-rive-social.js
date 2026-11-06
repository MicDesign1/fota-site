/*
  Social recognition (preview only). Exact text from claudia-story-drafts/RIVESCRIPT-SOCIAL-DRAFT.md,
  with "this preview" -> "this chat". Game characterization only: no platform use, no Claudia handle,
  no live feeds, counts or trends, no posting. Recognition and live-data rules are separate topics.
  why/how so -> WHY, tell me more -> MORE, only straight after a reply from the same topic.
*/
export const SOCIAL = [
  { id: "x", re: /^(what is x|what is x com|what is xcom|is twitter x now|is x twitter|do you know twitter|do you know x com|do you know what x is|what is twitter)$/,
    replies: ["X, yes. The platform that used to be called Twitter.", "x.com. Same platform people may still call Twitter.", "Twitter is the old name. I know what you mean either way."],
    why: "The name changed. People don't all change their vocabulary at once.",
    more: "If you say Twitter or X, I'll take you to mean the platform." },
  { id: "account", re: /^(are you on (x|twitter|x com)|what is your (twitter|x) (handle|account)|do you have an? (x|twitter) account|what is your x com (handle|account))$/,
    replies: ["I don't have a verified personal handle to give you here. My creator is @anabology.", "For the person who created Claudia, look for @anabology. I'm not claiming a personal account.", "I can point you to @anabology, my creator. I can't verify a separate account for me."],
    why: "I'd rather not send you to the wrong account.",
    more: "That's a creator reference, not a claim that I run their account." },
  { id: "tiktok", re: /^(do you know tiktok|what do you think (of|about) tiktok|what is tiktok)$/,
    replies: ["TikTok, yes. Short videos are what I associate with it.", "I know TikTok. Did you have a clip in mind?", "Yes, I know the platform. No strong take."],
    why: "I'm recognising the platform, not saying I use it.",
    more: "Tell me about the clip if you want. I can't open the feed from here." },
  { id: "instagram", re: /^(do you know instagram|what is instagram|what do you think (of|about) instagram)$/,
    replies: ["Instagram, yes. Photos and videos.", "I know Instagram. What about it?", "Yes. I know what you mean, though I don't have a feed open."],
    why: "I can recognise a platform without having an account there.",
    more: "If there's a particular image or video, describe it." },
  { id: "youtube", re: /^(do you know youtube|what is youtube|what do you think (of|about) youtube)$/,
    replies: ["YouTube, yes. Did you have a video in mind?", "I know YouTube. Long videos, short ones, plenty in between.", "Yes, I know the platform. I can't play a link from this conversation."],
    why: "Knowing the name isn't the same as being able to watch from here.",
    more: "Give me the title and what it's about. I won't pretend I've watched it." },
  { id: "memes", re: /^(do you know memes|do you know what memes are|do you like memes|what is a meme)$/,
    replies: ["Memes, yes. The joke usually needs a little context."],
    why: "A familiar image can mean something different with a new caption.",
    more: "Tell me the image or phrase and the setup. That gives us something to work with." },
  { id: "trends", re: /^(what is trending( on (x|twitter|tiktok|instagram|youtube))?( right now| today)?|do you follow trends|what memes are popular( right)? now|what are the trends( today)?|what is popular (right )?now)$/,
    replies: ["I don't have today's trends. If you describe one, we can talk about it.", "I can't check what's popular right now. What have you been seeing?"],
    why: "This chat doesn't have a live feed.",
    more: "Tell me the image or phrase and the setup. That gives us something to work with." },
  { id: "followers", re: /^(what are followers|what does following mean( on (x|twitter))?|do followers mean friends|what is a follower)$/,
    replies: ["Followers are accounts that follow an account's updates. Not necessarily friends.", "Following someone is a way to keep up with what they post.", "A follower count is a count of accounts. It doesn't tell you the whole story."],
    why: "Following an account doesn't mean knowing the person behind it.",
    more: "People follow for different reasons. I wouldn't assume what any one of them means." },
  { id: "tweet", re: /^(is it a tweet or a post|what is a tweet|do you still say tweet|what do you call posts on x|tweet or post)$/,
    replies: ["Post is the current term on X. Tweet is the older one.", "You can say tweet. I'll know you mean a post on X.", "Post or tweet, I understand you. No vocabulary test."],
    why: "The official wording changed with the platform's name.",
    more: "I mean the thing someone publishes, not a private message." },
  // Variant "Paste the wording and I can talk about it." omitted: no claim she understands pasted text.
  { id: "seepost", re: /^(can you see my (post|tweet)|did you (read|see) my (post|tweet)|can you open my (x|twitter|instagram|tiktok) profile|look at (this|my) (x|twitter) (link|post)|can you see my (x|twitter) (post|profile))$/,
    replies: ["I can't open your feed here. You can show me the text.", "I haven't seen it. Tell me what you posted."],
    why: "This game chat isn't connected to your account or a live browser.",
    more: "I can respond to the words you type here. A link alone won't let me read the post." },
  { id: "counts", re: /^how many (followers|likes|views|reposts|retweets) (do i have|do you have|does anabology have|did my (post|tweet) get)( on (x|twitter))?$/,
    replies: ["I can't check account numbers from here.", "I don't have a live count to give you.", "You'd need the profile or post itself for that number. I won't guess."],
    why: "Those numbers change, and I can't fetch them in this chat.",
    more: "If you type the number, we can discuss it. I can't independently verify it." },
  { id: "whatpost", re: /^(what should i (post|tweet)( on (x|twitter))?|help me write a (post|tweet)|how should i share my game)$/,
    replies: ["Say what you made and give people a way to see it. Plain is fine.", "One clear sentence about the thing you want to share is a good start.", "Show the thing, say what it is, and leave room for someone to ask about it."],
    why: "It helps someone understand what they're looking at.",
    more: "For a game: what you do in it, then where to play. Don't promise more than it does." },
];
export const SOCIAL_THIS_GAME_RE = /^(how should i share this game|what should i post about this game|help me write a post about this game)$/;
export const SOCIAL_THIS_GAME_LINE = "A little night-driving game: choose the music and talk with Claudia.";
export const SOCIAL_PUBLISH_RE = /^(can you (post|tweet|publish|share) (this|it|that)( on (x|twitter))?( for me)?|(post|tweet) this( for me)?|send this tweet)$/;
export const SOCIAL_PUBLISH_LINE = "I can help with the wording, but I can't publish it from this game.";
export const SOCIAL_BARE_X_RE = /^x$/;
export const SOCIAL_BARE_X_LINE = "Do you mean the platform?";

// Contains/keyword routing for natural phrasings (exact rules above are tried first).
// Bare "x", "post" or "follow" never match: a platform word or a specific account phrase is required.
const PLATFORM_RE = /\b(x com|xcom|twitter|tweets?|tiktok|instagram|insta|youtube|social media|socials|social accounts?)\b|\bon x\b/;
const ACCOUNT_RE = /\b(are you on|you on|do you (have|use|post|tweet|go on)|have you got|your (handle|account|accounts|page|profile|channel|username|twitter|instagram|insta|tiktok|youtube|socials|social media|x)|who do you follow|do you follow|follow you|can i follow|where can i follow|what is your)\b/;
export function socialIdFor(norm) {
  if (/^(who do you follow|who are you following|what is your handle|whats your handle|do you have socials|do you have a handle)$/.test(norm)) return "account";
  if (!PLATFORM_RE.test(norm)) return null;
  if (/\b(politic\w*|religio\w*|god|vote|election)\b/.test(norm)) return null; // boundaries win
  if (/\bhow many\b/.test(norm) && /\b(followers|likes|views|reposts|retweets|subscribers)\b/.test(norm)) return "counts";
  if (/\b(trending|trends|popular (right )?now)\b/.test(norm)) return "trends";
  if (/\b(see|read|open|look at|check) (my|this) (post|tweet|profile|video|link|reel)\b/.test(norm)) return "seepost";
  if (/\bwhat should i (post|tweet)\b|\bhelp me write a (post|tweet)\b/.test(norm)) return "whatpost";
  if (/\btweet or (a )?post\b|\bpost or (a )?tweet\b|\bstill (say|call it) tweet/.test(norm)) return "tweet";
  if (ACCOUNT_RE.test(norm)) return "account";
  if (/\btiktok\b/.test(norm)) return "tiktok";
  if (/\b(instagram|insta)\b/.test(norm)) return "instagram";
  if (/\byoutube\b/.test(norm)) return "youtube";
  if (/\b(x com|xcom|twitter)\b/.test(norm) || /^(what|is|do you know)\b.*\bon x\b/.test(norm)) return "x";
  return null;
}
