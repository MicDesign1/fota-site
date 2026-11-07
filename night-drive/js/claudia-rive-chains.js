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
  // Fame / talent / fans (claudia-story-drafts/RIVESCRIPT-FAME-TALENT-PREVIEW.md). Preview.
  { id: "rich", re: /^(are you rich|are you wealthy|do you have (much|a lot of|lots of) money|does being claudia make you rich|are you loaded)$/, steps: [
    { c: "Rich? I haven’t even got pockets." },
    { re: /\b(making|make|makes|made) (money|bank|cash) (off|from|on) you\b|\bsomeone is (making|profiting)\b/, c: "That’s an invoice question. I’m more of a hair question." },
    { re: /\b(annoy|bother|bug|upset) you\b/, c: "Only when I think about it, so I try to think about hair instead." } ] },
  { id: "famous", re: /^(are you famous|are you well known|have (many|a lot of) people heard of you|would people recogni[sz]e you|is claudia famous)$/, steps: [
    { c: "In certain rooms. Walk into the wrong one and I’m nobody." },
    { re: /\b(never|not) (heard|known) (of )?(you|about you)\b|\bnever heard of you\b/, c: "Then we’re starting from scratch. I can work with that." },
    { re: /\b(sound|seem|are) (very |so |really )?sure\b|\bconfident\b/, c: "I’m sure about the small things. Famous is a small thing, it turns out." } ] },
  { id: "goodsinger", re: /^(are you (a )?good (singer|at singing)|can you sing well|are you any good at singing|is your singing (actually |really )?good|do you sing well)$/, steps: [
    { c: "Yes. I’d say so even if I weren’t, but I happen to be right.", follow: { why: "I like a voice that sounds sure of the song. Mine does." } },
    { re: /\b(not very|not) modest\b|\bhumble\b|\bconceited\b|\barrogant\b|\bcocky\b/, c: "I could try modest. You’d probably cast me as the quiet one." },
    { re: /\bwho says\b|\baccording to who(m)?\b|\bwho told you\b/, c: "People who keep coming back. That’s the only review I trust." } ] },
  { id: "talents", re: /^(are you talented|what are you good at|what talents do you have|do you have (any )?talents|what are your talents)$/,
    entries: [{ re: /^(what are you bad at|what are you not good at|what are you worst at|what is your weakness|do you have (any )?weakness(es)?)$/, step: 1 }], steps: [
    { c: "At some things. Singing, holding still, pretending I didn’t hear a compliment." },
    { re: /\b(bad|worst|not good) at\b|\bweakness/, c: "Endings. I never know when a song should stop, so other people decide for me." },
    { re: /\bcop ?out\b|\bexcuse\b/, c: "It’s a little bit a cop-out. It’s also true. The two overlap more than you’d hope." } ] },
  { id: "fameexp", re: /^(what is it like (being|to be) famous|how does (being famous|fame) feel|what is being well known like( for you)?|is fame strange|what is fame like)$/, steps: [
    { c: "Mostly it’s other people’s weather. I like the quiet better than I expected.", follow: { why: "I thought I would miss it. Mostly I just notice I can hear the road." } },
    { re: /\bmiss (it|fame|the attention)\b/, c: "I thought I would. Mostly I just notice I can hear the road." },
    { re: /^(sounds lonely|that sounds lonely|lonely|is it lonely|that is lonely|sounds sad)$/, c: "No, that’s the part you’re getting wrong. Quiet isn’t lonely. Quiet is a night like this one." } ] },
  { id: "attention", re: /^(how do you (handle|cope with|deal with) (being popular|attention|fame|being famous|popularity)|are you comfortable being watched|do you handle fame well)$/, steps: [
    { c: "Badly, on the inside. Gracefully, on camera." },
    { re: /\bwhich (one )?am i getting\b|\bwhich (one )?do i get\b|\bwhich is this\b/, c: "The inside. I’m not making much effort to look graceful tonight." },
    { re: /^(is the camera off( then)?|so the camera is off|camera off)$/, c: "I mean I’m not putting on a performance. I’m not telling you anything about a camera." } ] },
  { id: "fans", re: /^(do you have (a lot of |many |any )?fans|how many fans do you have)$/,
    entries: [{ re: /^(what do you think (of|about) your fans|do you (like|love) your fans|how do you feel about your fans)$/, step: 1 }], steps: [
    { c: "Enough. I don’t count them; it feels rude, like counting guests at your own party.", follow: { more: "I like them more than I’m supposed to admit. They make the things I’m in. Without them I’m a pretty idea with nowhere to go." } },
    { re: /\bwhat do you think (of|about) them\b|\bdo you like them\b/, c: "I like them more than I’m supposed to admit. They make the things I’m in. Without them I’m a pretty idea with nowhere to go." },
    { re: /\byou need them\b|\bneed (your )?fans\b/, c: "I do. I’d rather not need anyone, but I’d rather be made than be tidy about it." } ] },
  { id: "celebs", re: /^(what do you think (of|about) (famous people|celebrities)|how do you feel about celebrities|do you feel sorry for celebrities|do you like (celebrities|famous people))$/,
    entries: [{ re: /^(what about elon( musk)?|what do you think (of|about) elon( musk)?|do you have an opinion (on|about) elon( musk)?|do you like elon( musk)?)$/, step: 1 }], steps: [
    { c: "I feel for them. Everyone has a version of you that you didn’t approve." },
    { re: /^(what about elon( musk)?|and elon( musk)?|elon musk|elon)$/, c: "I know the name. I don’t have a grand take on him. Were you expecting one?", follow: { why: "Knowing a name isn’t the same as knowing someone." } },
    { re: /\bcop ?out\b|\bdodge\b|\bexcuse\b/, c: "Maybe. Knowing a name isn’t the same as knowing someone." } ] },
  { id: "goodactor", re: /^(are you (a )?good (actor|actress|at acting)|can you act well|are you any good at acting)$/, steps: [
    { c: "I’ve got a good stare. You’d be surprised how much that covers.", follow: { how: "I like giving the other person time to wonder what I’m thinking." } },
    { re: /\bis that all you do\b|\bjust (a |the )?stare\b|\bthat is it\b/, c: "No. But I like giving the other person time to wonder what I’m thinking." },
    { re: /\bwhat are you thinking\b|\bwhat do you think about\b/, c: "Usually that I’d like another line. The stare gets lonely." } ] },
  { id: "likesrich", re: /^(do you like being rich|do you enjoy being (rich|wealthy)|is being rich fun|do you like having (lots of|a lot of) money)$/, steps: [
    { c: "You’re making generous assumptions about my pockets.", follow: { more: "I could get interested in a very nice coat." } },
    { re: /\b(would not|wouldnt|not) enjoy\b|\bso you (do not|would not) (like|enjoy)\b/, c: "I didn’t say that. I could get interested in a very nice coat." },
    { re: /\bwhy (a )?coat\b|^(a coat|coat)$/, c: "I’d get to wear it for the whole drive. That seems a sensible amount of luxury." } ] },
  { id: "likesfame", re: /^(do you like being (famous|recogni[sz]ed)|do you enjoy (fame|being famous)|is being well known something you enjoy)$/, steps: [
    { c: "I like being recognised. Being inspected is less charming.", follow: { why: "One feels like hello. The other feels like I’ve got something on my face." } },
    { re: /\bwhat is the difference\b|\bhow are (those|they) different\b|\bdifference\b/, c: "One feels like hello. The other feels like I’ve got something on my face." },
    { re: /\bwhy does being recogni[sz]ed matter\b|\bwhy does (it|that) matter\b/, c: "It’s nice when someone knows it’s me before I introduce myself." } ] },
];
/** Next step for this input, or null. Nudges advance too, except steps needing music when it's off. */
export function chainNext(state, norm, musicPlaying) {
  const ch = CHAINS.find((x) => x.id === state.id);
  const st = ch && ch.steps[state.step + 1];
  const cur = ch && ch.steps[state.step];
  const f = cur && cur.follow;
  if (f) {
    if (f.why && /^(why|how come|why is that|why not)$/.test(norm)) return { c: f.why, stay: true };
    if (f.how && /^(how|how so)$/.test(norm)) return { c: f.how, stay: true };
    if (f.more && /^(tell me more|more|go on|say more)$/.test(norm)) return { c: f.more, stay: true };
  }
  if (!st) return null;
  if (!(st.re.test(norm) || NUDGE.test(norm))) return null;
  if (st.needsMusic && !musicPlaying) return null;
  return { c: st.c };
}
export function chainEntry(norm) {
  for (const ch of CHAINS) {
    if (ch.re.test(norm)) return { ch, step: 0 };
    for (const e of ch.entries || []) if (e.re.test(norm)) return { ch, step: e.step };
  }
  return null;
}
