/*
  Chapter 1: "Are You Lost?" with the optional "Believe Me Later" topic.
  Integrated from Claudia's Mike-approved drafts on 2026-11-06.

  The drive is always automatic. Choices steer conversation only: no route
  selection, timed events, audio dependency, or persistent story storage.
  Flags and choice history belong to the existing in-memory Dialogue engine.
*/

/** @type {Record<string, import("./dialogue.js?v=20261106e").DialogueNode>} */
export const script = {
  "start": {
    "id": "start",
    "line": "Are you lost?",
    "mood": "idle",
    "choices": [
      {
        "label": "A little.",
        "next": "a1"
      },
      {
        "label": "I thought you knew the way.",
        "next": "b1"
      },
      {
        "label": "Does it matter?",
        "next": "c1"
      }
    ]
  },
  "a1": {
    "id": "a1",
    "line": "That's honest. This road's a giant loop through the plants. You can drive it for an hour and swear the exits moved.",
    "mood": "idle",
    "choices": [
      {
        "label": "Have they?",
        "next": "a2_exits"
      },
      {
        "label": "I want a way out.",
        "next": "out_want"
      },
      {
        "label": "Loop's fine if the company's fine.",
        "next": "lap1"
      }
    ]
  },
  "b1": {
    "id": "b1",
    "line": "I do. I was asking about you.",
    "mood": "smile",
    "choices": [
      {
        "label": "I'm alright. Just turned around.",
        "next": "b2_ok"
      },
      {
        "label": "Then where are we going?",
        "next": "b2_where"
      },
      {
        "label": "Maybe I am a little lost.",
        "next": "a2_exits"
      }
    ]
  },
  "c1": {
    "id": "c1",
    "line": "Only if you're having a bad time. Are you?",
    "mood": "idle",
    "choices": [
      {
        "label": "No. Curious, mostly.",
        "next": "c2_curious"
      },
      {
        "label": "I'd like an exit eventually.",
        "next": "out_want"
      },
      {
        "label": "Bad time would be alone on this loop.",
        "next": "lap1"
      }
    ]
  },
  "a2_exits": {
    "id": "a2_exits",
    "line": "Not really. Same ramps, same order. Your sense of direction just gets soft under amber light.",
    "mood": "idle",
    "choices": [
      {
        "label": "So how do people leave?",
        "next": "out_want"
      },
      {
        "label": "Soft is one word for it.",
        "next": "soft1"
      },
      {
        "label": "Tell me about the next one.",
        "next": "ramp_prep"
      }
    ]
  },
  "b2_ok": {
    "id": "b2_ok",
    "line": "Good. Turned around still counts as driving. We're on the long industrial circuit—keeps going while we talk about a way out.",
    "mood": "smile",
    "choices": [
      {
        "label": "What would leaving look like?",
        "next": "out_want"
      },
      {
        "label": "I'm not picking yet.",
        "next": "lap_pace"
      },
      {
        "label": "Do you have a favorite stretch?",
        "next": "fav1"
      }
    ]
  },
  "b2_where": {
    "id": "b2_where",
    "line": "Around. Then around again. There's a south spur that actually leaves the plants—if it's open.",
    "mood": "idle",
    "choices": [
      {
        "label": "Tell me about leaving.",
        "next": "out_want"
      },
      {
        "label": "If?",
        "next": "out_if"
      },
      {
        "label": "Around again doesn't sound terrible.",
        "next": "lap1"
      }
    ]
  },
  "c2_curious": {
    "id": "c2_curious",
    "line": "Curious works. Most people either talk about leaving or settle into the hum. You're allowed both.",
    "mood": "smile",
    "choices": [
      {
        "label": "I want both.",
        "next": "both1"
      },
      {
        "label": "Tell me about leaving.",
        "next": "out_want"
      },
      {
        "label": "Tell me about Believe Me Later.",
        "next": "bml_start"
      }
    ]
  },
  "out1": {
    "id": "out1",
    "line": "Okay. There's a ramp I wouldn't bother with. Easy to mistake for a way out when you're tired.",
    "mood": "idle",
    "choices": [
      {
        "label": "Why not that one?",
        "next": "not1"
      },
      {
        "label": "I'm not tired.",
        "next": "not1_awake"
      },
      {
        "label": "What happens if we pass it?",
        "next": "miss1"
      }
    ]
  },
  "out_if": {
    "id": "out_if",
    "line": "Last time I came through, the south spur had cones. Might be clear tonight. Might not.",
    "mood": "think",
    "choices": [
      {
        "label": "Tell me what you remember.",
        "next": "out_want"
      },
      {
        "label": "You were here last night?",
        "next": "lastnight1"
      },
      {
        "label": "Cones are a mood.",
        "next": "out_want"
      }
    ]
  },
  "lap1": {
    "id": "lap1",
    "line": "Company's the easy part. I like this speed. The plants look almost soft when you stop trying to leave.",
    "mood": "smile",
    "choices": [
      {
        "label": "Don't get too comfortable. I still want out.",
        "next": "both1"
      },
      {
        "label": "Another lap, then.",
        "next": "lap_pace"
      },
      {
        "label": "What do you look at when you're passenger?",
        "next": "fav1"
      }
    ]
  },
  "soft1": {
    "id": "soft1",
    "line": "I won't fight you on vocabulary. Not every ramp is a way out.",
    "mood": "smile",
    "choices": [
      {
        "label": "Talk me through it.",
        "next": "out_want"
      },
      {
        "label": "So not this one.",
        "next": "not1"
      },
      {
        "label": "Keep talking.",
        "next": "ramp_prep"
      }
    ]
  },
  "fav1": {
    "id": "fav1",
    "line": "The stretch past the cooling towers. Steam hangs in the lights. Also the ugly overpass—I like ugly overpasses.",
    "mood": "smile",
    "choices": [
      {
        "label": "We'll pass them again, then.",
        "next": "lap_pace"
      },
      {
        "label": "Tell me about leaving.",
        "next": "out1"
      },
      {
        "label": "Ugly overpasses are honest.",
        "next": "ramp_prep"
      }
    ]
  },
  "both1": {
    "id": "both1",
    "line": "Then we talk while we loop. No rush that ruins the drive. I can tell you which ramps are worth ignoring.",
    "mood": "idle",
    "choices": [
      {
        "label": "Tell me about one.",
        "next": "not1"
      },
      {
        "label": "You know this loop well.",
        "next": "not1_awake"
      },
      {
        "label": "What if none of them work?",
        "next": "miss1"
      }
    ]
  },
  "not1": {
    "id": "not1",
    "line": "Not this one.",
    "mood": "idle",
    "choices": [
      {
        "label": "You sure?",
        "next": "not1b"
      },
      {
        "label": "Okay. Not that one.",
        "next": "not1b"
      },
      {
        "label": "That was fast.",
        "next": "not1b"
      }
    ]
  },
  "not1_awake": {
    "id": "not1_awake",
    "line": "Good. Here's one to stay awake for— Not this one.",
    "mood": "idle",
    "choices": [
      {
        "label": "Got it.",
        "next": "not1b"
      },
      {
        "label": "Why not?",
        "next": "not1b"
      },
      {
        "label": "It looks like freedom.",
        "next": "not1b_almost"
      }
    ]
  },
  "not1b": {
    "id": "not1b",
    "line": "It dumps you into a service road that doubles back. Looks like leaving. Isn't.",
    "mood": "idle",
    "choices": [
      {
        "label": "Thanks for the heads-up.",
        "next": "after_not"
      },
      {
        "label": "How do you know?",
        "next": "how_know"
      },
      {
        "label": "More road is okay.",
        "next": "pace_ok"
      }
    ]
  },
  "miss1": {
    "id": "miss1",
    "line": "You get another lap. Same amber, same towers. Not a punishment—just more road. …Not this one, by the way.",
    "mood": "idle",
    "choices": [
      {
        "label": "Noted.",
        "next": "not1b"
      },
      {
        "label": "You could've led with that.",
        "next": "not1b"
      },
      {
        "label": "More road is okay.",
        "next": "not1b"
      }
    ]
  },
  "ramp1": {
    "id": "ramp1",
    "line": "There's one that looks like a way out. …Not this one.",
    "mood": "idle",
    "choices": [
      {
        "label": "Understood.",
        "next": "not1b"
      },
      {
        "label": "Why not?",
        "next": "not1b"
      },
      {
        "label": "You're very sure.",
        "next": "not1b"
      }
    ]
  },
  "how_know": {
    "id": "how_know",
    "line": "I drove this loop yesterday. Took that ramp. Twenty minutes of nothing useful, then back on the circle.",
    "mood": "idle",
    "choices": [
      {
        "label": "Yesterday again.",
        "next": "after_not"
      },
      {
        "label": "So you've been stuck too.",
        "next": "stuck_too"
      },
      {
        "label": "Tell me the next one.",
        "next": "after_not"
      }
    ]
  },
  "lastnight1": {
    "id": "lastnight1",
    "line": "Evening, actually. Same circuit. Quieter without someone to argue ramps with—you're an improvement.",
    "mood": "idle",
    "choices": [
      {
        "label": "I'll take that.",
        "next": "out1"
      },
      {
        "label": "Did you find the south spur?",
        "next": "out_if2"
      },
      {
        "label": "Let's talk about the exit.",
        "next": "out1"
      }
    ]
  },
  "out_if2": {
    "id": "out_if2",
    "line": "Fenced. A guy in a vest waved me past like I'd meant to tour the plant. Some ramps aren't worth it.",
    "mood": "smile",
    "choices": [
      {
        "label": "Not this one?",
        "next": "not1"
      },
      {
        "label": "Tell me about the south spur.",
        "next": "after_not"
      },
      {
        "label": "Plant tours sound fake.",
        "next": "not1_awake"
      }
    ]
  },
  "stuck_too": {
    "id": "stuck_too",
    "line": "Briefly. Then I stopped treating every ramp like a test. Helped.",
    "mood": "smile",
    "choices": [
      {
        "label": "I'll keep that in mind.",
        "next": "pace_ok"
      },
      {
        "label": "I still want a real exit.",
        "next": "bridge_prep"
      },
      {
        "label": "Tell me about the bridge.",
        "next": "bridge_prep"
      }
    ]
  },
  "after_not": {
    "id": "after_not",
    "line": "My next candidate is after the bridge. South-ish. If cones were gone, I'd call it a way out. If not, I'd steal another lap.",
    "mood": "idle",
    "choices": [
      {
        "label": "Steal is a strong word.",
        "next": "bridge_prep"
      },
      {
        "label": "I'm in for the bridge.",
        "next": "bridge_prep"
      },
      {
        "label": "What do you want for breakfast after this?",
        "next": "breakfast_ordinary"
      }
    ]
  },
  "bridge1": {
    "id": "bridge1",
    "line": "Lights thicken. I feel the crest a second before the hood does—there.",
    "mood": "listen",
    "choices": [
      {
        "label": "That's the crest now, isn't it.",
        "next": "bridge2"
      },
      {
        "label": "Don't make it weird.",
        "next": "bridge2_plain"
      },
      {
        "label": "Focus on the exit.",
        "next": "bridge2_exit"
      }
    ]
  },
  "bridge2": {
    "id": "bridge2",
    "line": "Yes. Good eye. The south spur's sign is green. Fencing means it's not a way out. Clear might be.",
    "mood": "smile",
    "choices": [
      {
        "label": "Tell me about the fencing.",
        "next": "fenced1"
      },
      {
        "label": "And if it's clear?",
        "next": "open1"
      },
      {
        "label": "Would you leave?",
        "next": "choose1"
      }
    ]
  },
  "bridge2_plain": {
    "id": "bridge2_plain",
    "line": "Fair. Green sign for the south spur. Fencing means it's not a way out. Clear might be.",
    "mood": "idle",
    "choices": [
      {
        "label": "Tell me about the fencing.",
        "next": "fenced1"
      },
      {
        "label": "And if it's clear?",
        "next": "open1"
      },
      {
        "label": "Would you leave?",
        "next": "choose1"
      }
    ]
  },
  "bridge2_exit": {
    "id": "bridge2_exit",
    "line": "The south spur's sign is green. I'm remembering—fencing or clear.",
    "mood": "listen",
    "choices": [
      {
        "label": "Tell me about the fencing.",
        "next": "fenced1"
      },
      {
        "label": "And if it's clear?",
        "next": "open1"
      },
      {
        "label": "Your read?",
        "next": "choose1"
      }
    ]
  },
  "fenced1": {
    "id": "fenced1",
    "line": "Yeah. Same as yesterday. Not stuck—just postponed. One more lap buys us another look.",
    "mood": "idle",
    "choices": [
      {
        "label": "Another lap, then.",
        "next": "settle_lap"
      },
      {
        "label": "I hate postponing.",
        "next": "settle_out"
      },
      {
        "label": "Are there more of you?",
        "next": "coy_more"
      }
    ]
  },
  "open1": {
    "id": "open1",
    "line": "Maybe. Hard to tell past the glare. If it's a way out, we can talk about leaving. If not, we can enjoy the towers again.",
    "mood": "idle",
    "choices": [
      {
        "label": "Tell me about another lap.",
        "next": "settle_lap"
      },
      {
        "label": "Tell me about leaving.",
        "next": "settle_out"
      },
      {
        "label": "Are there more of you?",
        "next": "coy_more"
      }
    ]
  },
  "choose1": {
    "id": "choose1",
    "line": "Tonight? Another lap. I like this pace with you on the road. We can talk about leaving next time around.",
    "mood": "smile",
    "choices": [
      {
        "label": "Okay—another lap.",
        "next": "settle_lap"
      },
      {
        "label": "I'd still talk about leaving.",
        "next": "settle_out"
      },
      {
        "label": "What are you, exactly?",
        "next": "coy_what"
      }
    ]
  },
  "coy_more": {
    "id": "coy_more",
    "line": "You've met me twice and you're already shopping around?",
    "mood": "smile",
    "choices": [
      {
        "label": "Keep driving.",
        "next": null
      },
      {
        "label": "That's enough talking.",
        "next": null
      },
      {
        "label": "Okay.",
        "next": null
      }
    ]
  },
  "coy_what": {
    "id": "coy_what",
    "line": "I've been in a few things. This is nice, though. Nobody's asked me to sing.",
    "mood": "smile",
    "choices": [
      {
        "label": "Keep driving.",
        "next": null
      },
      {
        "label": "That's enough talking.",
        "next": null
      },
      {
        "label": "Okay.",
        "next": null
      }
    ]
  },
  "lap_pace": {
    "id": "lap_pace",
    "line": "Encore? Then we stop chasing every green sign for a minute. Still—I'll call the bad ramps. Habit.",
    "mood": "smile",
    "choices": [
      {
        "label": "Call them.",
        "next": "ramp_prep"
      },
      {
        "label": "I still want the good one.",
        "next": "out1"
      },
      {
        "label": "Habit's fine with me.",
        "next": "ramp_prep"
      }
    ]
  },
  "bridge_prep": {
    "id": "bridge_prep",
    "line": "Past the bridge, the south spur's after the crest. I'll say if I remember fencing.",
    "mood": "idle",
    "choices": [
      {
        "label": "I'm listening.",
        "next": "bridge1"
      },
      {
        "label": "And if it's clear?",
        "next": "bridge1_clearq"
      },
      {
        "label": "Just don't go quiet on me.",
        "next": "bridge1"
      }
    ]
  },
  "bridge1_clearq": {
    "id": "bridge1_clearq",
    "line": "Then I'd call it a way out. I wouldn't grab the wheel. Crest—now.",
    "mood": "idle",
    "choices": [
      {
        "label": "Tell me about the south spur.",
        "next": "bridge2_exit"
      },
      {
        "label": "You feel that early every time?",
        "next": "bridge2"
      },
      {
        "label": "Keep it simple.",
        "next": "bridge2_plain"
      }
    ]
  },
  "settle_lap": {
    "id": "settle_lap",
    "line": "Good. Towers on the left in a bit. I'll keep half an eye on the ramps.",
    "mood": "smile",
    "choices": [
      {
        "label": "Keep driving.",
        "next": null
      },
      {
        "label": "That's enough talking.",
        "next": null
      },
      {
        "label": "Okay.",
        "next": null
      }
    ]
  },
  "settle_out": {
    "id": "settle_out",
    "line": "Alright. If you want a way out, we can talk about the south spur. I'll say if it sounds like another fake.",
    "mood": "idle",
    "choices": [
      {
        "label": "Keep driving.",
        "next": null
      },
      {
        "label": "That's enough talking.",
        "next": null
      },
      {
        "label": "Okay.",
        "next": null
      }
    ]
  },
  "out_want": {
    "id": "out_want",
    "line": "Then we talk about leaving without panicking. Some ramps just lead back to the circle.",
    "mood": "idle",
    "choices": [
      {
        "label": "Appreciate that.",
        "next": "out1"
      },
      {
        "label": "Lead back how?",
        "next": "out1"
      },
      {
        "label": "I'm listening.",
        "next": "out1"
      }
    ]
  },
  "not1b_almost": {
    "id": "not1b_almost",
    "line": "Easy mistake—it looks like freedom for half a second. It isn't. Service road, then back on the circle.",
    "mood": "idle",
    "choices": [
      {
        "label": "Thanks.",
        "next": "after_not"
      },
      {
        "label": "How do you know?",
        "next": "how_know"
      },
      {
        "label": "Bridge next, then.",
        "next": "after_not"
      }
    ]
  },
  "ramp_prep": {
    "id": "ramp_prep",
    "line": "Every ramp looks promising for a second. Some just bend back into the plants.",
    "mood": "idle",
    "choices": [
      {
        "label": "I'm listening.",
        "next": "ramp1"
      },
      {
        "label": "Which one isn't worth it?",
        "next": "ramp1"
      },
      {
        "label": "Tell me about one.",
        "next": "ramp1"
      }
    ]
  },
  "pace_ok": {
    "id": "pace_ok",
    "line": "Then we're not failing. We're pacing. Bridge after this bend.",
    "mood": "smile",
    "choices": [
      {
        "label": "I'll trust you.",
        "next": "bridge_prep"
      },
      {
        "label": "Say the spur early.",
        "next": "bridge_prep"
      },
      {
        "label": "Alright.",
        "next": "bridge_prep"
      }
    ]
  },
  "breakfast_ordinary": {
    "id": "breakfast_ordinary",
    "line": "Egg sandwich. Hot sauce on the side. Pickles only if they're cold. Bridge first.",
    "mood": "smile",
    "choices": [
      {
        "label": "Bridge.",
        "next": "bridge_prep"
      },
      {
        "label": "Good order.",
        "next": "bridge_prep"
      },
      {
        "label": "I'll hold you to the pickles.",
        "next": "bridge_prep"
      }
    ]
  },
  "bml_start": {
    "id": "bml_start",
    "line": "Someone named a song Believe Me Later. Big title for a quiet car.",
    "mood": "idle",
    "choices": [
      {
        "label": "Believe you about what?",
        "next": "bml_later",
        "setFlags": {
          "bml_asked_what": true
        }
      },
      {
        "label": "I've heard that one.",
        "next": "bml_heard",
        "setFlags": {
          "bml_heard": true
        }
      },
      {
        "label": "I don't know it.",
        "next": "bml_new"
      }
    ]
  },
  "bml_later": {
    "id": "bml_later",
    "line": "You want to do the later part now?",
    "mood": "smile",
    "choices": [
      {
        "label": "Just a little.",
        "next": "bml_title_talk",
        "setFlags": {
          "bml_wants_preview": true
        }
      },
      {
        "label": "Later means later.",
        "next": "bml_end",
        "setFlags": {
          "bml_deferred": true
        }
      },
      {
        "label": "Whose song is it?",
        "next": "bml_whose"
      }
    ]
  },
  "bml_heard": {
    "id": "bml_heard",
    "line": "I've heard it too. What did the title feel like to you?",
    "mood": "listen",
    "choices": [
      {
        "label": "Like a warning with patience.",
        "next": "bml_reflect",
        "setFlags": {
          "bml_interp": "patient_warning"
        }
      },
      {
        "label": "Like someone who stays.",
        "next": "bml_reflect",
        "setFlags": {
          "bml_interp": "stays"
        }
      },
      {
        "label": "Mostly I just like the name.",
        "next": "bml_title_talk",
        "setFlags": {
          "bml_interp": "title_only"
        }
      }
    ]
  },
  "bml_new": {
    "id": "bml_new",
    "line": "That's fine. Titles get around. Short version, or skip?",
    "mood": "idle",
    "choices": [
      {
        "label": "Short version.",
        "next": "bml_title_talk"
      },
      {
        "label": "Believe you about what?",
        "next": "bml_later",
        "setFlags": {
          "bml_asked_what": true
        }
      },
      {
        "label": "Skip for now.",
        "next": "bml_end"
      }
    ]
  },
  "bml_title_talk": {
    "id": "bml_title_talk",
    "line": [
      {
        "text": "Believe now, or believe later—people argue with the order. I just like that it leaves room.",
        "requireFlags": {
          "bml_wants_preview": true
        }
      },
      {
        "text": "Then the name did its job.",
        "requireFlags": {
          "bml_interp": "title_only"
        }
      },
      {
        "text": "Short version: a song with me in it, called Believe Me Later. The rest is yours."
      }
    ],
    "mood": "idle",
    "choices": [
      {
        "label": "Whose song is it?",
        "next": "bml_whose"
      },
      {
        "label": "Is this escape velocity?",
        "next": "bml_velocity"
      },
      {
        "label": "Okay. Back to the road.",
        "next": "bml_end"
      }
    ]
  },
  "bml_reflect": {
    "id": "bml_reflect",
    "line": [
      {
        "text": "Patience. I'll take that reading.",
        "requireFlags": {
          "bml_interp": "patient_warning"
        }
      },
      {
        "text": "Staying's a clean read. Still yours.",
        "requireFlags": {
          "bml_interp": "stays"
        }
      },
      {
        "text": "Interesting. Keep it. I don't need to win the meaning."
      }
    ],
    "mood": "smile",
    "choices": [
      {
        "label": "Is this escape velocity?",
        "next": "bml_velocity"
      },
      {
        "label": "Whose song is Believe Me Later?",
        "next": "bml_whose"
      },
      {
        "label": "That's enough song talk.",
        "next": "bml_end"
      }
    ]
  },
  "bml_whose": {
    "id": "bml_whose",
    "line": "Still me in the frame when they ask.",
    "mood": "idle",
    "choices": [
      {
        "label": "Does anabology know you're here?",
        "next": "bml_ana"
      },
      {
        "label": "Is this escape velocity?",
        "next": "bml_velocity"
      },
      {
        "label": "Okay. Back to the road.",
        "next": "bml_end"
      }
    ]
  },
  "bml_ana": {
    "id": "bml_ana",
    "line": "You can tell him. I'm not turning around.",
    "mood": "smile",
    "choices": [
      {
        "label": "Keep driving.",
        "next": null
      },
      {
        "label": "That's enough talking.",
        "next": null
      },
      {
        "label": "Okay.",
        "next": null
      }
    ]
  },
  "bml_velocity": {
    "id": "bml_velocity",
    "line": "You've passed the same warehouse three times. Not yet.",
    "mood": "smile",
    "choices": [
      {
        "label": "Keep driving.",
        "next": null
      },
      {
        "label": "That's enough talking.",
        "next": null
      },
      {
        "label": "Okay.",
        "next": null
      }
    ]
  },
  "bml_end": {
    "id": "bml_end",
    "line": [
      {
        "text": "Later stays later. I'll spot ramps while you think.",
        "requireFlags": {
          "bml_deferred": true
        }
      },
      {
        "text": "Good. Title's in the air; road's still yours.",
        "requireFlags": {
          "bml_asked_what": true
        }
      },
      {
        "text": "Good. No chorus required.",
        "requireFlags": {
          "bml_heard": true
        }
      },
      {
        "text": "Mm. Eyes forward."
      }
    ],
    "mood": "idle",
    "choices": [
      {
        "label": "Keep driving.",
        "next": null
      },
      {
        "label": "That's enough talking.",
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
