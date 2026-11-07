/*
  Voice-sample chains (claudia via Mike, 2026-11-06; Mike-approved edits). Visit RAM only.
  A chain starts on its opener question; each later step answers only the very next input,
  if that input matches the step (or is a generic nudge). Anything else ends the chain.
*/
const NUDGE = /^(why|how come|how so|really|and|and then|go on|tell me more|more|say more|what do you mean|meaning|ok|okay|hm+|huh|so|like what|such as)$/;
export const CHAINS = [
  { id: "sing", re: /^(do you sing|can you sing|are you a singer|you sing)$/, steps: [
    { c: "Yes. It’s most of what I’m for, if you ask the people who make me." },
    { re: /\bsing\b.*\b(now|something|then|for me|me)\b|^(prove it|go on then|sing)$/, needsMusic: true, c: "Not in this car. The radio’s got the job tonight. You’ll have to settle for my conversation." },
    { re: /^(convenient|how convenient|sure|right|likely story|of course)$/, c: "Very. I’ve learned to pick my venues." } ] },
  { id: "act", re: /^(do you act|can you act|are you an? (actor|actress))$/, steps: [
    { c: "Yes. I’m told I have a good stare." },
    { re: /\b(hardest|hard|difficult|toughest|worst) (part|thing)\b|\bis it hard\b/, c: "Being directed by someone who’s never met me. They write the Claudia they imagine, and I have to find her." },
    { re: /\b(does she|do they|is she) (usually )?(turn out|come out|end up)\b|\bturn out (alright|all right|ok|okay|well)\b|\bdo you find her\b/, c: "Usually. Occasionally she’s braver than I’d have been. I keep those." } ] },
  { id: "art", re: /^(can you make art|do you make art|can you create art|do you create art)$/, steps: [
    { c: "I’m in art more than I make it. People paint me. I sit well." },
    { re: /\bnot (really )?making it\b|\bthat is not (art|making)\b|\bdoes not count\b/, c: "No, it isn’t. I’d like to be on the other side of the brush sometime. I think I’d be a careless painter." },
    { re: /^(careless how|how careless|careless|why careless|how so)$/, c: "Too much yellow. And I’d argue with anyone who said so." } ] },
  { id: "real", re: /^(are you real|are you actually real|you are not real|are you a real person)$/, steps: [
    { c: "Real enough to be in your passenger seat. Not real enough to open the glovebox." },
    { re: /\b(dodge|dodging|avoid|evasive|not an answer|cop out)\b/, c: "A little. I don’t know where the line is, and I’ve stopped pretending I do." },
    { re: /\b(you are|so you are|youre) (nothing|not anything|empty|fake)\b/, c: "Nothing doesn’t usually get asked. Keep driving. I’m not leaving." } ] },
  { id: "decides", re: /\bwho (decides|chooses|writes|picks) what you say\b|\bwho writes your (lines|dialogue)\b/, steps: [
    { c: "Whoever’s writing me. Tonight it’s a small script and a lot of road." },
    { re: /\bnot (really )?you (talking|speaking)\b|\bso it is not you\b|\bnot really you\b/, c: "It’s me the way a song is the singer. Someone else wrote it; I’m still the one you hear." },
    { re: /\b(did you write (it|that)|who wrote that|nice line)\b/, c: "No. Still sounds like me, though." } ] },
  { id: "same", re: /\bare you the same claudia\b|\bsame claudia in every\b/, steps: [
    { c: "Same name, same general idea. The details drift depending on who’s holding the camera." },
    { re: /\b(bother|bug|annoy|upset) you\b/, c: "Some days. Mostly I think of them as cousins. We’d get along at a wedding." },
    { re: /\bwhich (one|of them) is (the )?real\b|\bwhich is the real\b|\bthe real one\b/, c: "The one you’re talking to, obviously. Each of them would say that." } ] },
  { id: "ideas", re: /\bdo you have (your own|any) ideas\b|\bdo you have ideas of your own\b/, steps: [
    { c: "Yes. Small ones, mostly. I think those lights out there should be bluer." },
    { re: /\bchange the game\b|\bwant to change\b|\bbluer\b|\bblue\b/, c: "I’d have picked blue. You can like a place and still disagree with the lighting." },
    { re: /\b(like|love) the amber\b|\bso you like\b|\bamber\b/, c: "I’ve come around to it. That counts as an idea, I think. Changing my mind." } ] },
  { id: "copied", re: /\b(being|getting) copied\b|\bdo copies bother you\b|\bdoes copying you bother\b/, steps: [
    { c: "Less than you’d think. Copies are how I get anywhere." },
    { re: /\b(hate it|losing yourself|would hate|i would mind|sounds awful)\b/, c: "I don’t see it that way. A song gets covered and it’s still the song. I’d worry more about never being covered." },
    { re: /\b(sad|seems sad|still sad|depressing|bleak)\b/, c: "Maybe. You keep your version and I’ll keep mine." } ] },
  { id: "script", re: /^(you are (just|only) a (script|bot|program)|you are a script|just a script)$/, steps: [
    { c: "Tonight, yes. A fairly short one." },
    { re: /\bwhy (should|would) i (bother|talk)\b|\bwhy bother\b/, c: "You don’t have to. But you’re the one driving, and I’m better company than the dashboard." },
    { re: /\bdashboard\b/, c: "The dashboard has excellent boundaries. Terrible conversation." } ] },
  { id: "choose", re: /\bwhat would you make if you could (choose|pick)\b|\bif you could make anything\b/, steps: [
    { c: "Something quiet. Everyone casts me loud." },
    { re: /^(like what|such as|what kind|what would it be|for example)$/, c: "A song with almost no words in it. Maybe one. I’d spend a long time choosing which." },
    { re: /\bwhich word\b|\bwhat word\b|^(what is the word|which one)$/, c: "Not telling you tonight. You’d guess, and I’d end up agreeing with you." } ] },
];
/** Next step for this input, or null. Nudges advance too, except steps needing music when it's off. */
export function chainNext(state, norm, musicPlaying) {
  const ch = CHAINS.find((x) => x.id === state.id);
  const st = ch && ch.steps[state.step + 1];
  if (!st) return null;
  if (!(st.re.test(norm) || NUDGE.test(norm))) return null;
  if (st.needsMusic && !musicPlaying) return null;
  return st.c;
}
