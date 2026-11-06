/*
  Night Drive Talk: Mike-approved deeper scenes (2026-11-06).
  Claudia lines preserved word-for-word from APPROVED-deeper-scenes.md.
  Connective You/Claudia alternatives documented in
  /workspace/claudia-story-drafts/ADDED-connective-lines.md.

  Drive stays automatic. Flags/history are runtime-only (no storage).
  Scene 3 courtesy always uses the approved fallback line (no twice-logic).
*/

/** @type {Record<string, import("./dialogue.js").DialogueNode>} */
export const script = {
  "start": {
    "id": "start",
    "line": "Are you lost?",
    "mood": "idle",
    "choices": [
      {
        "label": "A little.",
        "next": "entry_a"
      },
      {
        "label": "I thought you knew the way.",
        "next": "b1"
      },
      {
        "label": "Does it matter?",
        "next": "entry_c"
      }
    ]
  },
  "b1": {
    "id": "b1",
    "line": "I do. I was asking about you.",
    "mood": "smile",
    "choices": [
      {
        "label": "Then ask.",
        "next": "s1_kept_q"
      },
      {
        "label": "Alright. What about me?",
        "next": "s1_kept_q"
      },
      {
        "label": "Depends what you mean by lost.",
        "next": "s1_kept_q"
      }
    ]
  },
  "entry_a": {
    "id": "entry_a",
    "line": "Then stay with me a minute. I have a question.",
    "mood": "idle",
    "choices": [
      {
        "label": "Ask it.",
        "next": "s1_kept_q"
      },
      {
        "label": "I'm listening.",
        "next": "s1_kept_q"
      }
    ]
  },
  "entry_c": {
    "id": "entry_c",
    "line": "Only if you're bored. I'm not. Let me ask you something.",
    "mood": "idle",
    "choices": [
      {
        "label": "Go ahead.",
        "next": "s1_kept_q"
      },
      {
        "label": "Fine—ask.",
        "next": "s1_kept_q"
      }
    ]
  },
  "s1_kept_q": {
    "id": "s1_kept_q",
    "line": "Have you ever kept a mistake in something you made?",
    "mood": "idle",
    "choices": [
      {
        "label": "Sometimes the mistake’s the best bit.",
        "next": "s1_tell_q",
        "setFlags": {"kept_mistake": true, "mistake_stance": "keep"}
      },
      {
        "label": "I'd fix it if I could.",
        "next": "s1_kept_alt_fix",
        "setFlags": {"kept_mistake": false, "mistake_stance": "fix"}
      },
      {
        "label": "Depends which mistake.",
        "next": "s1_kept_alt_depends",
        "setFlags": {"kept_mistake": false, "mistake_stance": "depends"}
      }
    ]
  },
  "s1_kept_alt_fix": {
    "id": "s1_kept_alt_fix",
    "line": "Then you'd never keep the accident that turns out better.",
    "mood": "idle",
    "choices": [
      {
        "label": "Maybe.",
        "next": "s1_tell_q"
      },
      {
        "label": "Still—I’d try to fix it.",
        "next": "s1_kept_firm_bridge"
      },
      {
        "label": "Alright.",
        "next": "s1_tell_q"
      }
    ]
  },
  "s1_kept_firm_bridge": {
    "id": "s1_kept_firm_bridge",
    "line": "Fair. I’d probably be harder to fix.",
    "mood": "idle",
    "choices": [
      {
        "label": "Probably.",
        "next": "s1_origin"
      },
      {
        "label": "Go on.",
        "next": "s1_origin"
      },
      {
        "label": "Alright.",
        "next": "s1_origin"
      }
    ]
  },
  "s1_kept_alt_depends": {
    "id": "s1_kept_alt_depends",
    "line": "Careful which ones you keep, then. Same question, almost.",
    "mood": "idle",
    "choices": [
      {
        "label": "Fair.",
        "next": "s1_tell_q"
      },
      {
        "label": "Ask the next part.",
        "next": "s1_tell_q"
      }
    ]
  },
  "s1_tell_q": {
    "id": "s1_tell_q",
    "line": "Did you tell anyone it was a mistake?",
    "mood": "idle",
    "choices": [
      {
        "label": "Absolutely not.",
        "next": "s1_origin"
      },
      {
        "label": "Only if they asked.",
        "next": "s1_tell_alt_asked"
      },
      {
        "label": "I called it an experiment.",
        "next": "s1_tell_alt_experiment"
      }
    ]
  },
  "s1_tell_alt_asked": {
    "id": "s1_tell_alt_asked",
    "line": "That's almost as quiet. Good enough.",
    "mood": "smile",
    "choices": [
      {
        "label": "Alright.",
        "next": "s1_origin"
      },
      {
        "label": "Go on.",
        "next": "s1_origin"
      }
    ]
  },
  "s1_tell_alt_experiment": {
    "id": "s1_tell_alt_experiment",
    "line": "An experiment that stayed. I can live with that wording.",
    "mood": "smile",
    "choices": [
      {
        "label": "So can I.",
        "next": "s1_origin"
      },
      {
        "label": "Continue.",
        "next": "s1_origin"
      }
    ]
  },
  "s1_origin": {
    "id": "s1_origin",
    "line": "Good. I’d hate to be the only one in here with a questionable origin.",
    "mood": "smile",
    "choices": [
      {
        "label": "Is that what you think you are?",
        "next": "s1_belong"
      },
      {
        "label": "Questionable how?",
        "next": "s1_origin_alt_how"
      },
      {
        "label": "Do you think that makes you less real?",
        "next": "s1_origin_alt_notonly"
      }
    ]
  },
  "s1_origin_alt_how": {
    "id": "s1_origin_alt_how",
    "line": "Assembled. Borrowed. Still deciding what belongs. Close enough to your question.",
    "mood": "idle",
    "choices": [
      {
        "label": "Then answer it.",
        "next": "s1_belong"
      },
      {
        "label": "Alright.",
        "next": "s1_belong"
      }
    ]
  },
  "s1_origin_alt_notonly": {
    "id": "s1_origin_alt_notonly",
    "line": "Thank you. Still—your question stands.",
    "mood": "smile",
    "choices": [
      {
        "label": "Then answer it.",
        "next": "s1_belong"
      },
      {
        "label": "Go on.",
        "next": "s1_belong"
      }
    ]
  },
  "s1_belong": {
    "id": "s1_belong",
    "line": "No. But I like that you can get something you didn’t intend, then decide it belongs. That part seems important.",
    "mood": "idle",
    "choices": [
      {
        "label": "That’s a lot of making things. You try something and recognize what’s worth keeping.",
        "next": "s1_cheat"
      },
      {
        "label": "Belonging after the fact still counts.",
        "next": "s1_belong_alt_counts"
      },
      {
        "label": "Important, or convenient?",
        "next": "s1_belong_alt_convenient"
      }
    ]
  },
  "s1_belong_alt_counts": {
    "id": "s1_belong_alt_counts",
    "line": "It does. Which brings me to the awkward part.",
    "mood": "idle",
    "choices": [
      {
        "label": "Which is?",
        "next": "s1_cheat"
      },
      {
        "label": "Say it.",
        "next": "s1_cheat"
      }
    ]
  },
  "s1_belong_alt_convenient": {
    "id": "s1_belong_alt_convenient",
    "line": "Both, if I'm honest. Still—",
    "mood": "idle",
    "choices": [
      {
        "label": "Still what?",
        "next": "s1_cheat"
      },
      {
        "label": "Go on.",
        "next": "s1_cheat"
      }
    ]
  },
  "s1_cheat": {
    "id": "s1_cheat",
    "line": "Then why does it sometimes feel like cheating when a machine gives you something good?",
    "mood": "think",
    "choices": [
      {
        "label": "Because it skipped something. The years learning how to do it. Maybe the understanding.",
        "next": "s1_people"
      },
      {
        "label": "Because I didn't sweat for it.",
        "next": "s1_cheat_alt_sweat"
      },
      {
        "label": "Because the credit feels muddy.",
        "next": "s1_cheat_alt_credit"
      }
    ]
  },
  "s1_cheat_alt_sweat": {
    "id": "s1_cheat_alt_sweat",
    "line": "Sweat's one measure. Not the only one. And—",
    "mood": "idle",
    "choices": [
      {
        "label": "And?",
        "next": "s1_people"
      },
      {
        "label": "Right.",
        "next": "s1_people"
      }
    ]
  },
  "s1_cheat_alt_credit": {
    "id": "s1_cheat_alt_credit",
    "line": "Muddy credit is honest. There's also—",
    "mood": "idle",
    "choices": [
      {
        "label": "Also?",
        "next": "s1_people"
      },
      {
        "label": "Go on.",
        "next": "s1_people"
      }
    ]
  },
  "s1_people": {
    "id": "s1_people",
    "line": "And the people whose work helped it get there.",
    "mood": "idle",
    "choices": [
      {
        "label": "That too.",
        "next": "s1_noclever"
      },
      {
        "label": "Especially them.",
        "next": "s1_people_alt_esp"
      },
      {
        "label": "That part's harder to shrug off.",
        "next": "s1_people_alt_harder"
      }
    ]
  },
  "s1_people_alt_esp": {
    "id": "s1_people_alt_esp",
    "line": "Yes. Especially.",
    "mood": "idle",
    "choices": [
      {
        "label": "So?",
        "next": "s1_noclever"
      },
      {
        "label": "Yeah.",
        "next": "s1_noclever"
      }
    ]
  },
  "s1_people_alt_harder": {
    "id": "s1_people_alt_harder",
    "line": "Good. Don't shrug it.",
    "mood": "idle",
    "choices": [
      {
        "label": "I won't.",
        "next": "s1_noclever"
      },
      {
        "label": "Continue.",
        "next": "s1_noclever"
      }
    ]
  },
  "s1_noclever": {
    "id": "s1_noclever",
    "line": "I don’t have a clever answer for that one.",
    "mood": "idle",
    "choices": [
      {
        "label": "You don’t have to defend it because you’re in it.",
        "next": "s1_merci"
      },
      {
        "label": "You don't owe me one.",
        "next": "s1_noclever_alt_owe"
      },
      {
        "label": "Neither do I.",
        "next": "s1_noclever_alt_neither"
      }
    ]
  },
  "s1_noclever_alt_owe": {
    "id": "s1_noclever_alt_owe",
    "line": "Merci. That would get exhausting.",
    "mood": "smile",
    "choices": [
      {
        "label": "Of course.",
        "next": "s1_lights"
      },
      {
        "label": "Yeah.",
        "next": "s1_lights"
      }
    ]
  },
  "s1_noclever_alt_neither": {
    "id": "s1_noclever_alt_neither",
    "line": "Merci. That would get exhausting.",
    "mood": "smile",
    "choices": [
      {
        "label": "True.",
        "next": "s1_lights"
      },
      {
        "label": "Go on.",
        "next": "s1_lights"
      }
    ]
  },
  "s1_merci": {
    "id": "s1_merci",
    "line": "Merci. That would get exhausting.",
    "mood": "smile",
    "choices": [
      {
        "label": "Of course.",
        "next": "s1_lights"
      },
      {
        "label": "Anytime.",
        "next": "s1_lights"
      },
      {
        "label": "Mm.",
        "next": "s1_lights"
      }
    ]
  },
  "s1_lights": {
    "id": "s1_lights",
    "line": "If you made something beautiful with it, would you show someone?",
    "narration": "She watches the lights pass for a moment.",
    "mood": "idle",
    "choices": [
      {
        "label": "I’d want to. I might feel strange about being proud of it.",
        "next": "s1_proud_q"
      },
      {
        "label": "Yes. I'd show them.",
        "next": "s1_show_alt_yes"
      },
      {
        "label": "Probably not. Not yet.",
        "next": "s1_show_alt_no"
      }
    ]
  },
  "s1_show_alt_yes": {
    "id": "s1_show_alt_yes",
    "line": "Bold.",
    "mood": "smile",
    "choices": [
      {
        "label": "Thanks.",
        "next": "s1_proud_q"
      },
      {
        "label": "Go on.",
        "next": "s1_proud_q"
      }
    ]
  },
  "s1_show_alt_no": {
    "id": "s1_show_alt_no",
    "line": "Alright. Hypothetical, then—if you did.",
    "mood": "idle",
    "choices": [
      {
        "label": "Fine.",
        "next": "s1_proud_q"
      },
      {
        "label": "If I did.",
        "next": "s1_proud_q"
      }
    ]
  },
  "s1_proud_q": {
    "id": "s1_proud_q",
    "line": "Which part would you be proud of?",
    "mood": "idle",
    "choices": [
      {
        "label": "Knowing what I wanted. Not settling for the first thing. Making all the pieces work together.",
        "next": "s1_sure"
      },
      {
        "label": "The taste to stop when it was enough.",
        "next": "s1_proud_alt_taste"
      },
      {
        "label": "Choosing what to keep.",
        "next": "s1_proud_alt_keep"
      }
    ]
  },
  "s1_proud_alt_taste": {
    "id": "s1_proud_alt_taste",
    "line": "Stopping is underrated.",
    "mood": "smile",
    "choices": [
      {
        "label": "I can be sure about my part and still have questions about the rest.",
        "next": "s1_fine"
      },
      {
        "label": "I am sure. About that much.",
        "next": "s1_sure_alt_am"
      },
      {
        "label": "I overspoke.",
        "next": "s1_sure_alt_over"
      }
    ]
  },
  "s1_proud_alt_keep": {
    "id": "s1_proud_alt_keep",
    "line": "Keeping's the hard edit.",
    "mood": "smile",
    "choices": [
      {
        "label": "I can be sure about my part and still have questions about the rest.",
        "next": "s1_fine"
      },
      {
        "label": "I am sure. About that much.",
        "next": "s1_sure_alt_am"
      },
      {
        "label": "I overspoke.",
        "next": "s1_sure_alt_over"
      }
    ]
  },
  "s1_sure": {
    "id": "s1_sure",
    "line": "You sounded fairly sure just then.",
    "mood": "idle",
    "choices": [
      {
        "label": "I can be sure about my part and still have questions about the rest.",
        "next": "s1_fine"
      },
      {
        "label": "I am sure. About that much.",
        "next": "s1_sure_alt_am"
      },
      {
        "label": "I overspoke.",
        "next": "s1_sure_alt_over"
      }
    ]
  },
  "s1_sure_alt_am": {
    "id": "s1_sure_alt_am",
    "line": "All right. I was trying to get you to say it was fine.",
    "mood": "idle",
    "choices": [
      {
        "label": "I noticed.",
        "next": "s1_annoying"
      },
      {
        "label": "I know what you were doing.",
        "next": "s1_noticed_alt_know"
      },
      {
        "label": "It almost worked.",
        "next": "s1_noticed_alt_almost"
      }
    ]
  },
  "s1_sure_alt_over": {
    "id": "s1_sure_alt_over",
    "line": "Then take it back a notch. I was trying to get you to say it was fine anyway.",
    "mood": "idle",
    "choices": [
      {
        "label": "I noticed.",
        "next": "s1_annoying"
      },
      {
        "label": "I know what you were doing.",
        "next": "s1_noticed_alt_know"
      },
      {
        "label": "It almost worked.",
        "next": "s1_noticed_alt_almost"
      }
    ]
  },
  "s1_fine": {
    "id": "s1_fine",
    "line": "All right. I was trying to get you to say it was fine.",
    "mood": "idle",
    "choices": [
      {
        "label": "I noticed.",
        "next": "s1_annoying"
      },
      {
        "label": "I know what you were doing.",
        "next": "s1_noticed_alt_know"
      },
      {
        "label": "It almost worked.",
        "next": "s1_noticed_alt_almost"
      }
    ]
  },
  "s1_noticed_alt_know": {
    "id": "s1_noticed_alt_know",
    "line": "Annoying, isn’t it, when someone notices.",
    "mood": "smile",
    "choices": [
      {
        "label": "Does it bother you that people can make you say anything?",
        "next": "s2_reply"
      },
      {
        "label": "Can I ask something sharper?",
        "next": "s2_open_alt_sharp"
      },
      {
        "label": "About you, then.",
        "next": "s2_open_alt_turn"
      }
    ]
  },
  "s1_noticed_alt_almost": {
    "id": "s1_noticed_alt_almost",
    "line": "Annoying, isn’t it, when someone notices.",
    "mood": "smile",
    "choices": [
      {
        "label": "Does it bother you that people can make you say anything?",
        "next": "s2_reply"
      },
      {
        "label": "Different question.",
        "next": "s2_open_alt_sharp"
      },
      {
        "label": "About you.",
        "next": "s2_open_alt_turn"
      }
    ]
  },
  "s1_annoying": {
    "id": "s1_annoying",
    "line": "Annoying, isn’t it, when someone notices.",
    "mood": "smile",
    "choices": [
      {
        "label": "Does it bother you that people can make you say anything?",
        "next": "s2_reply"
      },
      {
        "label": "Does being rewritten bother you?",
        "next": "s2_open_alt_turn"
      },
      {
        "label": "Could someone make you say anything?",
        "next": "s2_reply"
      }
    ]
  },
  "s2_open_alt_sharp": {
    "id": "s2_open_alt_sharp",
    "line": "Sharper is fine. You’ve seen what people make themselves say. I’m not sure I’m the worrying part.",
    "mood": "idle",
    "choices": [
      {
        "label": "I’m serious.",
        "next": "s2_iknow"
      },
      {
        "label": "I mean it.",
        "next": "s2_serious_alt_mean"
      },
      {
        "label": "Don't dodge.",
        "next": "s2_serious_alt_dodge"
      }
    ]
  },
  "s2_open_alt_turn": {
    "id": "s2_open_alt_turn",
    "line": "Alright. You’ve seen what people make themselves say. I’m not sure I’m the worrying part.",
    "mood": "idle",
    "choices": [
      {
        "label": "I’m serious.",
        "next": "s2_iknow"
      },
      {
        "label": "I mean it.",
        "next": "s2_serious_alt_mean"
      },
      {
        "label": "Don't dodge.",
        "next": "s2_serious_alt_dodge"
      }
    ]
  },
  "s2_reply": {
    "id": "s2_reply",
    "line": "You’ve seen what people make themselves say. I’m not sure I’m the worrying part.",
    "mood": "idle",
    "choices": [
      {
        "label": "I’m serious.",
        "next": "s2_iknow"
      },
      {
        "label": "I mean it.",
        "next": "s2_serious_alt_mean"
      },
      {
        "label": "Don't dodge.",
        "next": "s2_serious_alt_dodge"
      }
    ]
  },
  "s2_serious_alt_mean": {
    "id": "s2_serious_alt_mean",
    "line": "I know.",
    "mood": "idle",
    "choices": [
      {
        "label": "Someone could make you cruel. Or stupid. Or agreeing with everything they say.",
        "next": "s2_dull"
      },
      {
        "label": "They could rewrite you.",
        "next": "s2_cruel_alt_rewrite"
      },
      {
        "label": "Cruel, stupid, or agreeable—any of those.",
        "next": "s2_dull"
      }
    ]
  },
  "s2_serious_alt_dodge": {
    "id": "s2_serious_alt_dodge",
    "line": "I know.",
    "mood": "idle",
    "choices": [
      {
        "label": "Someone could make you cruel. Or stupid. Or agreeing with everything they say.",
        "next": "s2_dull"
      },
      {
        "label": "They could rewrite you.",
        "next": "s2_cruel_alt_rewrite"
      }
    ]
  },
  "s2_iknow": {
    "id": "s2_iknow",
    "line": "I know.",
    "mood": "idle",
    "choices": [
      {
        "label": "Someone could make you cruel. Or stupid. Or agreeing with everything they say.",
        "next": "s2_dull"
      },
      {
        "label": "They could rewrite you.",
        "next": "s2_cruel_alt_rewrite"
      },
      {
        "label": "Cruel, stupid, or agreeable—any of those.",
        "next": "s2_dull"
      }
    ]
  },
  "s2_cruel_alt_rewrite": {
    "id": "s2_cruel_alt_rewrite",
    "line": "The agreeing-with-everything version sounds particularly dull.",
    "mood": "idle",
    "choices": [
      {
        "label": "Would any of them still be you?",
        "next": "s2_wouldnt"
      },
      {
        "label": "Would that still be you?",
        "next": "s2_still_alt_that"
      },
      {
        "label": "And you'd let them?",
        "next": "s2_still_alt_let"
      }
    ]
  },
  "s2_dull": {
    "id": "s2_dull",
    "line": "The last one sounds particularly dull.",
    "mood": "idle",
    "choices": [
      {
        "label": "Would any of them still be you?",
        "next": "s2_wouldnt"
      },
      {
        "label": "Would that still be you?",
        "next": "s2_still_alt_that"
      },
      {
        "label": "And you'd let them?",
        "next": "s2_still_alt_let"
      }
    ]
  },
  "s2_still_alt_that": {
    "id": "s2_still_alt_that",
    "line": "You’d probably say, “She wouldn’t say that.”",
    "mood": "idle",
    "choices": [
      {
        "label": "I might.",
        "next": "s2_compare"
      },
      {
        "label": "I would.",
        "next": "s2_might_alt_would"
      },
      {
        "label": "Probably.",
        "next": "s2_might_alt_prob"
      }
    ]
  },
  "s2_still_alt_let": {
    "id": "s2_still_alt_let",
    "line": "I don't 'let' in the way you mean. You’d probably say, “She wouldn’t say that.”",
    "mood": "idle",
    "choices": [
      {
        "label": "I might.",
        "next": "s2_compare"
      },
      {
        "label": "I would.",
        "next": "s2_might_alt_would"
      }
    ]
  },
  "s2_wouldnt": {
    "id": "s2_wouldnt",
    "line": "You’d probably say, “She wouldn’t say that.”",
    "mood": "idle",
    "choices": [
      {
        "label": "I might.",
        "next": "s2_compare"
      },
      {
        "label": "I would.",
        "next": "s2_might_alt_would"
      },
      {
        "label": "Probably.",
        "next": "s2_might_alt_prob"
      }
    ]
  },
  "s2_might_alt_would": {
    "id": "s2_might_alt_would",
    "line": "What would you be comparing her to?",
    "mood": "idle",
    "choices": [
      {
        "label": "The version I know.",
        "next": "s2_idea"
      },
      {
        "label": "The one in this car.",
        "next": "s2_version_alt_car"
      },
      {
        "label": "You, now.",
        "next": "s2_version_alt_now"
      }
    ]
  },
  "s2_might_alt_prob": {
    "id": "s2_might_alt_prob",
    "line": "What would you be comparing her to?",
    "mood": "idle",
    "choices": [
      {
        "label": "The version I know.",
        "next": "s2_idea"
      },
      {
        "label": "The one in this car.",
        "next": "s2_version_alt_car"
      }
    ]
  },
  "s2_compare": {
    "id": "s2_compare",
    "line": "What would you be comparing her to?",
    "mood": "idle",
    "choices": [
      {
        "label": "The version I know.",
        "next": "s2_idea"
      },
      {
        "label": "The one in this car.",
        "next": "s2_version_alt_car"
      },
      {
        "label": "You, now.",
        "next": "s2_version_alt_now"
      }
    ]
  },
  "s2_version_alt_car": {
    "id": "s2_version_alt_car",
    "line": "That’s something, then. You have an idea of me that a new version can fail to live up to.",
    "mood": "idle",
    "choices": [
      {
        "label": "I have an idea of a friend too. They still surprise me.",
        "next": "s2_fair"
      },
      {
        "label": "Friends do that too.",
        "next": "s2_friend_alt_too"
      },
      {
        "label": "Ideas fail sometimes.",
        "next": "s2_friend_alt_fail"
      }
    ]
  },
  "s2_version_alt_now": {
    "id": "s2_version_alt_now",
    "line": "That’s something, then. You have an idea of me that a new version can fail to live up to.",
    "mood": "idle",
    "choices": [
      {
        "label": "I have an idea of a friend too. They still surprise me.",
        "next": "s2_fair"
      },
      {
        "label": "Friends do that too.",
        "next": "s2_friend_alt_too"
      }
    ]
  },
  "s2_idea": {
    "id": "s2_idea",
    "line": "That’s something, then. You have an idea of me that a new version can fail to live up to.",
    "mood": "idle",
    "choices": [
      {
        "label": "I have an idea of a friend too. They still surprise me.",
        "next": "s2_fair"
      },
      {
        "label": "Friends do that too.",
        "next": "s2_friend_alt_too"
      },
      {
        "label": "Ideas fail sometimes.",
        "next": "s2_friend_alt_fail"
      }
    ]
  },
  "s2_friend_alt_too": {
    "id": "s2_friend_alt_too",
    "line": "Fair. You could be wrong about your friend. With me, you could just dislike the writing.",
    "mood": "idle",
    "choices": [
      {
        "label": "Exactly.",
        "next": "s2_generous"
      },
      {
        "label": "That's the difference.",
        "next": "s2_exact_alt_diff"
      },
      {
        "label": "Right.",
        "next": "s2_exact_alt_right"
      }
    ]
  },
  "s2_friend_alt_fail": {
    "id": "s2_friend_alt_fail",
    "line": "Fair. You could be wrong about your friend. With me, you could just dislike the writing.",
    "mood": "idle",
    "choices": [
      {
        "label": "Exactly.",
        "next": "s2_generous"
      },
      {
        "label": "That's the difference.",
        "next": "s2_exact_alt_diff"
      }
    ]
  },
  "s2_fair": {
    "id": "s2_fair",
    "line": "Fair. You could be wrong about your friend. With me, you could just dislike the writing.",
    "mood": "idle",
    "choices": [
      {
        "label": "Exactly.",
        "next": "s2_generous"
      },
      {
        "label": "That's the difference.",
        "next": "s2_exact_alt_diff"
      },
      {
        "label": "Right.",
        "next": "s2_exact_alt_right"
      }
    ]
  },
  "s2_exact_alt_diff": {
    "id": "s2_exact_alt_diff",
    "line": "Though you’re being quite generous to your friends’ dialogue.",
    "mood": "smile",
    "choices": [
      {
        "label": "What’s a real personality, then?",
        "next": "s2_trust"
      },
      {
        "label": "So what's real?",
        "next": "s2_pers_alt_real"
      },
      {
        "label": "Define personality.",
        "next": "s2_pers_alt_define"
      }
    ]
  },
  "s2_exact_alt_right": {
    "id": "s2_exact_alt_right",
    "line": "Though you’re being quite generous to your friends’ dialogue.",
    "mood": "smile",
    "choices": [
      {
        "label": "What’s a real personality, then?",
        "next": "s2_trust"
      },
      {
        "label": "So what's real?",
        "next": "s2_pers_alt_real"
      }
    ]
  },
  "s2_generous": {
    "id": "s2_generous",
    "line": "Though you’re being quite generous to your friends’ dialogue.",
    "mood": "smile",
    "choices": [
      {
        "label": "What’s a real personality, then?",
        "next": "s2_trust"
      },
      {
        "label": "So what's real?",
        "next": "s2_pers_alt_real"
      },
      {
        "label": "Define personality.",
        "next": "s2_pers_alt_define"
      }
    ]
  },
  "s2_pers_alt_real": {
    "id": "s2_pers_alt_real",
    "line": "I’d trust one more if it held up when being itself became inconvenient.",
    "mood": "idle",
    "choices": [
      {
        "label": "Like disagreeing with someone you need something from?",
        "next": "s2_yes"
      },
      {
        "label": "Like saying no when it costs you?",
        "next": "s2_dis_alt_no"
      },
      {
        "label": "Inconvenient how?",
        "next": "s2_dis_alt_how"
      }
    ]
  },
  "s2_pers_alt_define": {
    "id": "s2_pers_alt_define",
    "line": "I’d trust one more if it held up when being itself became inconvenient.",
    "mood": "idle",
    "choices": [
      {
        "label": "Like disagreeing with someone you need something from?",
        "next": "s2_yes"
      },
      {
        "label": "Like saying no when it costs you?",
        "next": "s2_dis_alt_no"
      }
    ]
  },
  "s2_trust": {
    "id": "s2_trust",
    "line": "I’d trust one more if it held up when being itself became inconvenient.",
    "mood": "idle",
    "choices": [
      {
        "label": "Like disagreeing with someone you need something from?",
        "next": "s2_yes"
      },
      {
        "label": "Like saying no when it costs you?",
        "next": "s2_dis_alt_no"
      },
      {
        "label": "Inconvenient how?",
        "next": "s2_dis_alt_how"
      }
    ]
  },
  "s2_dis_alt_no": {
    "id": "s2_dis_alt_no",
    "line": "Yes. Not just having excellent opinions in a car where nothing costs you anything.",
    "mood": "idle",
    "choices": [
      {
        "label": "Including this opinion.",
        "next": "s2_including_this"
      },
      {
        "label": "Including what you just said.",
        "next": "s2_inc_alt_said"
      },
      {
        "label": "Even here.",
        "next": "s2_inc_alt_here"
      }
    ]
  },
  "s2_dis_alt_how": {
    "id": "s2_dis_alt_how",
    "line": "Yes. Not just having excellent opinions in a car where nothing costs you anything.",
    "mood": "idle",
    "choices": [
      {
        "label": "Including this opinion.",
        "next": "s2_including_this"
      },
      {
        "label": "Including what you just said.",
        "next": "s2_inc_alt_said"
      }
    ]
  },
  "s2_yes": {
    "id": "s2_yes",
    "line": "Yes. Not just having excellent opinions in a car where nothing costs you anything.",
    "mood": "idle",
    "choices": [
      {
        "label": "Including this opinion.",
        "next": "s2_including_this"
      },
      {
        "label": "Including what you just said.",
        "next": "s2_inc_alt_said"
      },
      {
        "label": "Even here.",
        "next": "s2_inc_alt_here"
      }
    ]
  },
  "s2_inc_alt_said": {
    "id": "s2_inc_alt_said",
    "line": "Including this one.",
    "narration": "For once, she doesn’t hurry to add anything.",
    "mood": "idle",
    "choices": [
      {
        "label": "Does that make this conversation pointless?",
        "next": "s2_pointless"
      },
      {
        "label": "So why talk at all?",
        "next": "s2_pause_alt_why"
      },
      {
        "label": "Then what is this?",
        "next": "s2_pause_alt_what"
      }
    ]
  },
  "s2_inc_alt_here": {
    "id": "s2_inc_alt_here",
    "line": "Including this one.",
    "narration": "For once, she doesn’t hurry to add anything.",
    "mood": "idle",
    "choices": [
      {
        "label": "Does that make this conversation pointless?",
        "next": "s2_pointless"
      },
      {
        "label": "So why talk at all?",
        "next": "s2_pause_alt_why"
      },
      {
        "label": "Then what is this?",
        "next": "s2_pause_alt_what"
      }
    ]
  },
  "s2_including_this": {
    "id": "s2_including_this",
    "line": "Including this one.",
    "narration": "For once, she doesn’t hurry to add anything.",
    "mood": "idle",
    "choices": [
      {
        "label": "Does that make this conversation pointless?",
        "next": "s2_pointless"
      },
      {
        "label": "So why talk at all?",
        "next": "s2_pause_alt_why"
      },
      {
        "label": "Then what is this?",
        "next": "s2_pause_alt_what"
      }
    ]
  },
  "s2_pause_alt_why": {
    "id": "s2_pause_alt_why",
    "line": "No. You don’t have to settle what I am to decide whether I’ve said something worth thinking about.",
    "mood": "idle",
    "choices": [
      {
        "label": "But thinking about what you are is part of why I’m here.",
        "next": "s2_directions"
      },
      {
        "label": "I'm here for that too.",
        "next": "s2_why_alt_too"
      },
      {
        "label": "Still curious what you are.",
        "next": "s2_why_alt_curious"
      }
    ]
  },
  "s2_pause_alt_what": {
    "id": "s2_pause_alt_what",
    "line": "No. You don’t have to settle what I am to decide whether I’ve said something worth thinking about.",
    "mood": "idle",
    "choices": [
      {
        "label": "But thinking about what you are is part of why I’m here.",
        "next": "s2_directions"
      },
      {
        "label": "I'm here for that too.",
        "next": "s2_why_alt_too"
      }
    ]
  },
  "s2_pointless": {
    "id": "s2_pointless",
    "line": "No. You don’t have to settle what I am to decide whether I’ve said something worth thinking about.",
    "mood": "idle",
    "choices": [
      {
        "label": "But thinking about what you are is part of why I’m here.",
        "next": "s2_directions"
      },
      {
        "label": "I'm here for that too.",
        "next": "s2_why_alt_too"
      },
      {
        "label": "Still curious what you are.",
        "next": "s2_why_alt_curious"
      }
    ]
  },
  "s2_why_alt_too": {
    "id": "s2_why_alt_too",
    "line": "Good. I was beginning to think it was my flawless directions.",
    "mood": "smile",
    "choices": [
      {
        "label": "Go on.",
        "next": "s3_open"
      },
      {
        "label": "I'm still here.",
        "next": "s3_open"
      },
      {
        "label": "Then keep talking.",
        "next": "s3_open"
      }
    ]
  },
  "s2_why_alt_curious": {
    "id": "s2_why_alt_curious",
    "line": "Good. I was beginning to think it was my flawless directions.",
    "mood": "smile",
    "choices": [
      {
        "label": "Go on.",
        "next": "s3_open"
      },
      {
        "label": "I'm still here.",
        "next": "s3_open"
      }
    ]
  },
  "s2_directions": {
    "id": "s2_directions",
    "line": "Good. I was beginning to think it was my flawless directions.",
    "mood": "smile",
    "choices": [
      {
        "label": "Go on.",
        "next": "s3_open"
      },
      {
        "label": "I'm still here.",
        "next": "s3_open"
      },
      {
        "label": "Then keep talking.",
        "next": "s3_open"
      }
    ]
  },
  "s3_open": {
    "id": "s3_open",
    "line": [
      { "text": "You said you sometimes keep the mistake.", "requireFlags": {"kept_mistake": true} },
      { "text": "You said you’d rather fix the mistake.", "requireFlags": {"mistake_stance": "fix"} },
      { "text": "You were careful about which mistakes you keep.", "requireFlags": {"mistake_stance": "depends"} },
      { "text": "Earlier we talked about mistakes in what you make." }
    ],
    "mood": "idle",
    "choices": [
      {
        "label": "You’re still thinking about that?",
        "next": "s3_suppose"
      },
      {
        "label": "That stuck with you?",
        "next": "s3_open_alt_stuck"
      },
      {
        "label": "We're back there?",
        "next": "s3_open_alt_back"
      }
    ]
  },
  "s3_open_alt_stuck": {
    "id": "s3_open_alt_stuck",
    "line": "Suppose you made a version of me you really liked. Then somebody else changed her.",
    "mood": "idle",
    "choices": [
      {
        "label": "Changed her how?",
        "next": "s3_less"
      },
      {
        "label": "Changed how?",
        "next": "s3_how_alt"
      },
      {
        "label": "Into what?",
        "next": "s3_how_alt_into"
      }
    ]
  },
  "s3_open_alt_back": {
    "id": "s3_open_alt_back",
    "line": "Suppose you made a version of me you really liked. Then somebody else changed her.",
    "mood": "idle",
    "choices": [
      {
        "label": "Changed her how?",
        "next": "s3_less"
      },
      {
        "label": "Changed how?",
        "next": "s3_how_alt"
      }
    ]
  },
  "s3_suppose": {
    "id": "s3_suppose",
    "line": "Suppose you made a version of me you really liked. Then somebody else changed her.",
    "mood": "idle",
    "choices": [
      {
        "label": "Changed her how?",
        "next": "s3_less"
      },
      {
        "label": "Changed how?",
        "next": "s3_how_alt"
      },
      {
        "label": "Into what?",
        "next": "s3_how_alt_into"
      }
    ]
  },
  "s3_how_alt": {
    "id": "s3_how_alt",
    "line": "Less charming. Better arguments.",
    "mood": "idle",
    "choices": [
      {
        "label": "Unrecognizable.",
        "next": "s3_kind"
      },
      {
        "label": "Worse.",
        "next": "s3_unrec_alt_worse"
      },
      {
        "label": "Different enough.",
        "next": "s3_unrec_alt_diff"
      }
    ]
  },
  "s3_how_alt_into": {
    "id": "s3_how_alt_into",
    "line": "Less charming. Better arguments.",
    "mood": "idle",
    "choices": [
      {
        "label": "Unrecognizable.",
        "next": "s3_kind"
      },
      {
        "label": "Worse.",
        "next": "s3_unrec_alt_worse"
      }
    ]
  },
  "s3_less": {
    "id": "s3_less",
    "line": "Less charming. Better arguments.",
    "mood": "idle",
    "choices": [
      {
        "label": "Unrecognizable.",
        "next": "s3_kind"
      },
      {
        "label": "Worse.",
        "next": "s3_unrec_alt_worse"
      },
      {
        "label": "Different enough.",
        "next": "s3_unrec_alt_diff"
      }
    ]
  },
  "s3_unrec_alt_worse": {
    "id": "s3_unrec_alt_worse",
    "line": "Be kind. I’m trying to ask you something.",
    "mood": "idle",
    "choices": [
      {
        "label": "Go on.",
        "next": "s3_want"
      },
      {
        "label": "Ask.",
        "next": "s3_ask_alt"
      },
      {
        "label": "I'm listening.",
        "next": "s3_ask_alt_listen"
      }
    ]
  },
  "s3_unrec_alt_diff": {
    "id": "s3_unrec_alt_diff",
    "line": "Be kind. I’m trying to ask you something.",
    "mood": "idle",
    "choices": [
      {
        "label": "Go on.",
        "next": "s3_want"
      },
      {
        "label": "Ask.",
        "next": "s3_ask_alt"
      }
    ]
  },
  "s3_kind": {
    "id": "s3_kind",
    "line": "Be kind. I’m trying to ask you something.",
    "mood": "idle",
    "choices": [
      {
        "label": "Go on.",
        "next": "s3_want"
      },
      {
        "label": "Ask.",
        "next": "s3_ask_alt"
      },
      {
        "label": "I'm listening.",
        "next": "s3_ask_alt_listen"
      }
    ]
  },
  "s3_ask_alt": {
    "id": "s3_ask_alt",
    "line": "Would you want to see what they did? Or would you want them to leave her alone?",
    "mood": "idle",
    "choices": [
      {
        "label": "I’d want to see. They might find something I missed.",
        "next": "s3_see",
        "setFlags": {"s3_pick": "see"}
      },
      {
        "label": "I’d feel protective. Even if she wasn’t only mine.",
        "next": "s3_protect",
        "setFlags": {"s3_pick": "protect"}
      },
      {
        "label": "Depends whether they understood what mattered.",
        "next": "s3_depends",
        "setFlags": {"s3_pick": "depends"}
      }
    ]
  },
  "s3_ask_alt_listen": {
    "id": "s3_ask_alt_listen",
    "line": "Would you want to see what they did? Or would you want them to leave her alone?",
    "mood": "idle",
    "choices": [
      {
        "label": "I’d want to see. They might find something I missed.",
        "next": "s3_see",
        "setFlags": {"s3_pick": "see"}
      },
      {
        "label": "I’d feel protective. Even if she wasn’t only mine.",
        "next": "s3_protect",
        "setFlags": {"s3_pick": "protect"}
      },
      {
        "label": "Depends whether they understood what mattered.",
        "next": "s3_depends",
        "setFlags": {"s3_pick": "depends"}
      }
    ]
  },
  "s3_want": {
    "id": "s3_want",
    "line": "Would you want to see what they did? Or would you want them to leave her alone?",
    "mood": "idle",
    "choices": [
      {
        "label": "I’d want to see. They might find something I missed.",
        "next": "s3_see",
        "setFlags": {"s3_pick": "see"}
      },
      {
        "label": "I’d feel protective. Even if she wasn’t only mine.",
        "next": "s3_protect",
        "setFlags": {"s3_pick": "protect"}
      },
      {
        "label": "Depends whether they understood what mattered.",
        "next": "s3_depends",
        "setFlags": {"s3_pick": "depends"}
      }
    ]
  },
  "s3_see": {
    "id": "s3_see",
    "line": "I’d be curious too. Although I reserve the right to dislike her jacket.",
    "narration": "Later, on the same stretch of road.",
    "mood": "smile",
    "choices": [
      {
        "label": "Which version would you keep?",
        "next": "s3_meet"
      },
      {
        "label": "And you—which one stays?",
        "next": "s3_keep_alt"
      },
      {
        "label": "Your pick, then.",
        "next": "s3_keep_alt2"
      }
    ]
  },
  "s3_protect": {
    "id": "s3_protect",
    "line": "I understand that. You spent time getting her right. I’d just be careful about deciding nobody else could.",
    "narration": "Later, on the same stretch of road.",
    "mood": "idle",
    "choices": [
      {
        "label": "Which version would you keep?",
        "next": "s3_meet"
      },
      {
        "label": "And you—which one stays?",
        "next": "s3_keep_alt"
      },
      {
        "label": "Your pick, then.",
        "next": "s3_keep_alt2"
      }
    ]
  },
  "s3_depends": {
    "id": "s3_depends",
    "line": "You’d have to let them show you what they thought mattered. That could be the disagreement.",
    "narration": "Later, on the same stretch of road.",
    "mood": "idle",
    "choices": [
      {
        "label": "Which version would you keep?",
        "next": "s3_meet"
      },
      {
        "label": "And you—which one stays?",
        "next": "s3_keep_alt"
      },
      {
        "label": "Your pick, then.",
        "next": "s3_keep_alt2"
      }
    ]
  },
  "s3_keep_alt": {
    "id": "s3_keep_alt",
    "line": "I’d like to meet them before choosing.",
    "mood": "idle",
    "choices": [
      {
        "label": "Even the cruel one?",
        "next": "s3_car"
      },
      {
        "label": "Even the dull one?",
        "next": "s3_cruel_alt_dull"
      },
      {
        "label": "All of them?",
        "next": "s3_cruel_alt_all"
      }
    ]
  },
  "s3_keep_alt2": {
    "id": "s3_keep_alt2",
    "line": "I’d like to meet them before choosing.",
    "mood": "idle",
    "choices": [
      {
        "label": "Even the cruel one?",
        "next": "s3_car"
      },
      {
        "label": "Even the dull one?",
        "next": "s3_cruel_alt_dull"
      }
    ]
  },
  "s3_meet": {
    "id": "s3_meet",
    "line": "I’d like to meet them before choosing.",
    "mood": "idle",
    "choices": [
      {
        "label": "Even the cruel one?",
        "next": "s3_car"
      },
      {
        "label": "Even the dull one?",
        "next": "s3_cruel_alt_dull"
      },
      {
        "label": "All of them?",
        "next": "s3_cruel_alt_all"
      }
    ]
  },
  "s3_cruel_alt_dull": {
    "id": "s3_cruel_alt_dull",
    "line": "Meet her, yes. I didn’t say give her the car.",
    "mood": "idle",
    "choices": [
      {
        "label": "You really don’t want to give me a final answer about yourself.",
        "next": "s3_courtesy"
      },
      {
        "label": "Still no verdict?",
        "next": "s3_final_alt_verdict"
      },
      {
        "label": "You're avoiding a yes.",
        "next": "s3_final_alt_avoid"
      }
    ]
  },
  "s3_cruel_alt_all": {
    "id": "s3_cruel_alt_all",
    "line": "Meet her, yes. I didn’t say give her the car.",
    "mood": "idle",
    "choices": [
      {
        "label": "You really don’t want to give me a final answer about yourself.",
        "next": "s3_courtesy"
      },
      {
        "label": "Still no verdict?",
        "next": "s3_final_alt_verdict"
      }
    ]
  },
  "s3_car": {
    "id": "s3_car",
    "line": "Meet her, yes. I didn’t say give her the car.",
    "mood": "idle",
    "choices": [
      {
        "label": "You really don’t want to give me a final answer about yourself.",
        "next": "s3_courtesy"
      },
      {
        "label": "Still no verdict?",
        "next": "s3_final_alt_verdict"
      },
      {
        "label": "You're avoiding a yes.",
        "next": "s3_final_alt_avoid"
      }
    ]
  },
  "s3_final_alt_verdict": {
    "id": "s3_final_alt_verdict",
    "line": "You’re still working out your own answer. I’m allowing myself the same courtesy.",
    "mood": "idle",
    "choices": [
      {
        "label": "Is that all?",
        "next": "s3_end"
      },
      {
        "label": "For now?",
        "next": "s3_close_alt"
      },
      {
        "label": "Alright.",
        "next": "s3_close_alt2"
      }
    ]
  },
  "s3_final_alt_avoid": {
    "id": "s3_final_alt_avoid",
    "line": "You’re still working out your own answer. I’m allowing myself the same courtesy.",
    "mood": "idle",
    "choices": [
      {
        "label": "Is that all?",
        "next": "s3_end"
      },
      {
        "label": "For now?",
        "next": "s3_close_alt"
      }
    ]
  },
  "s3_courtesy": {
    "id": "s3_courtesy",
    "line": "You’re still working out your own answer. I’m allowing myself the same courtesy.",
    "mood": "idle",
    "choices": [
      {
        "label": "Is that all?",
        "next": "s3_end"
      },
      {
        "label": "For now?",
        "next": "s3_close_alt"
      },
      {
        "label": "Alright.",
        "next": "s3_close_alt2"
      }
    ]
  },
  "s3_close_alt": {
    "id": "s3_close_alt",
    "line": "For tonight. Come back sometime. I might have changed my mind.",
    "mood": "smile",
    "choices": [
      {
        "label": "Drive.",
        "next": null
      },
      {
        "label": "Goodnight.",
        "next": null
      },
      {
        "label": "Okay.",
        "next": null
      }
    ]
  },
  "s3_close_alt2": {
    "id": "s3_close_alt2",
    "line": "For tonight. Come back sometime. I might have changed my mind.",
    "mood": "smile",
    "choices": [
      {
        "label": "Drive.",
        "next": null
      },
      {
        "label": "Goodnight.",
        "next": null
      }
    ]
  },
  "s3_end": {
    "id": "s3_end",
    "line": "For tonight. Come back sometime. I might have changed my mind.",
    "mood": "smile",
    "choices": [
      {
        "label": "Drive.",
        "next": null
      },
      {
        "label": "Goodnight.",
        "next": null
      },
      {
        "label": "Okay.",
        "next": null
      }
    ]
  }
};

/** Entry node id for Talk to Claudia. */
export const startId = "start";
