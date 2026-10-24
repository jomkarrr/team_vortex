// Voice training data — EVERY navigation button, in one place.
// The old assistant used a chain of if/else keyword checks in a fixed order,
// so one word ("where") could hijack a whole sentence ("where to get help"
// went to Track Status). That is why orders were mis-identified.
//
// This file fixes it with a scored matcher:
//   1. Exact / phrase match wins, LONGEST phrase first — so "where to get
//      help" beats "help", and "why did my pension stop" beats "pension".
//   2. Only if no phrase matches, fall back to specific keyword tokens.
//   3. A bare generic word ("pension" alone) matches nothing — the assistant
//      asks for clarification instead of guessing wrong.
// Adding a navigation button = adding one intent here. No other file changes
// its matching logic, so the assistant always knows every button by name.

export const NAV_INTENTS = [
  {
    page: 'home', action: null,
    labelEn: 'Home', labelHi: 'होम',
    sayEn: 'Going back to the home page.',
    sayHi: 'होम पेज पर वापस जा रहे हैं।',
    aliases: ['home page', 'homepage', 'home', 'ghar', 'main page', 'back to home', 'होम', 'मुख्य पृष्ठ'],
    keywords: ['home', 'ghar'],
  },
  {
    page: 'profile', action: null,
    labelEn: 'My Profile', labelHi: 'मेरी प्रोफ़ाइल',
    sayEn: 'Opening My Profile. Fill your details once, by voice or by hand, and you will never need to fill them again.',
    sayHi: 'मेरी प्रोफ़ाइल खुल रही है। अपनी जानकारी एक बार भर दें, दोबारा भरने की ज़रूरत नहीं पड़ेगी।',
    aliases: ['my profile', 'profile', 'meri profile', 'my details', 'fill my details', 'apni jaankari', 'meri jaankari', 'प्रोफ़ाइल', 'मेरी प्रोफ़ाइल', 'मेरी जानकारी'],
    keywords: ['profile', 'jaankari', 'details'],
  },
  {
    page: 'eligibility', action: null,
    labelEn: 'Find My Pension', labelHi: 'मेरी पेंशन ढूंढें',
    sayEn: 'Opening the Pension Finder. Answer six simple questions to see which pensions you qualify for, and why.',
    sayHi: 'पेंशन खोज खुल रही है। कुछ सरल सवालों के जवाब दें, और देखें आप किस पेंशन के लिए योग्य हैं, और क्यों।',
    aliases: ['find my pension', 'find pension', 'pension finder', 'which pension', 'which pension do i get', 'meri pension dhoondo', 'pension dhoondo', 'pension khojo', 'kaunsi pension', 'kaun si pension', 'am i eligible', 'kya main yogya hun', 'पेंशन खोज', 'कौन सी पेंशन', 'मेरी पेंशन ढूंढें'],
    keywords: ['eligible', 'qualify', 'dhoondo', 'khojo', 'finder'],
  },
  {
    page: 'status', action: null,
    labelEn: 'Track Status', labelHi: 'मेरी पेंशन का स्टेटस',
    sayEn: 'Opening the Status Tracker. You will see only your own application timeline — no other user\'s details are shown.',
    sayHi: 'स्टेटस ट्रैकर खुल रहा है। यहाँ सिर्फ़ आपकी अपनी आवेदन की जानकारी दिखेगी, किसी और की नहीं।',
    aliases: ['track my pension status', 'track pension status', 'track status', 'my pension status', 'pension status', 'meri pension ka status', 'pension kahan tak pahunchi', 'pension kahan tak', 'meri pension ki sthiti', 'status', 'स्थिति', 'स्टेटस', 'मेरी पेंशन का स्टेटस'],
    keywords: ['status', 'sthiti', 'track'],
  },
  {
    page: 'help', action: null,
    labelEn: 'Why Did My Pension Stop?', labelHi: 'मेरी पेंशन रुक गई',
    sayEn: 'Opening Why Did My Pension Stop. First check your Life Certificate, then your bank NPCI mapping. I will walk you through each step.',
    sayHi: 'पेंशन रुकने का कारण देख रहे हैं। पहले लाइफ़ सर्टिफ़िकेट देखें, फिर बैंक का एनपीसीआई मैपिंग। हर कदम समझाया जाएगा।',
    aliases: ['why did my pension stop', 'why did it stop', 'why pension stopped', 'my pension stopped', 'pension stopped', 'pension band', 'pension ruk gayi', 'pension ruk gai', 'meri pension ruk gayi', 'meri pension ruk gai', 'pension nahi mili', 'pension nahi aayi', 'pension nahi aa rahi', 'पेंशन रुक गई', 'पेंशन बंद', 'मेरी पेंशन रुक गई'],
    keywords: ['stopped', 'ruk', 'band'],
  },
  {
    page: 'schemes', action: null,
    labelEn: 'All Schemes', labelHi: 'सभी योजनाएं',
    sayEn: 'Opening the Schemes Library. It lists every pension scheme with its real amount and documents.',
    sayHi: 'सभी पेंशन योजनाएं खुल रही हैं, असली राशि और काग़ज़ों के साथ।',
    aliases: ['show all schemes', 'all schemes', 'schemes', 'sabhi yojanayen', 'sabhi yojana', 'yojanayen', 'yojana', 'सभी योजनाएं', 'योजना', 'योजनाएं'],
    keywords: ['scheme', 'schemes', 'yojana', 'yojanayen'],
  },
  {
    page: 'calculator', action: null,
    labelEn: 'Calculator', labelHi: 'पेंशन कैलकुलेटर',
    sayEn: 'Opening the Pension Calculator. Enter your age to see how much you would pay and receive under Atal Pension Yojana and PM-SYM.',
    sayHi: 'पेंशन कैलकुलेटर खुल रहा है। अपनी उम्र डालें और देखें अटल पेंशन योजना और पीएम-एसवाईएम में कितना देना और कितना मिलेगा।',
    aliases: ['pension calculator', 'calculator', 'kitna paisa milega', 'how much pension', 'kitna dena padega', 'कैलकुलेटर', 'पेंशन कैलकुलेटर'],
    keywords: ['calculator'],
  },
  {
    page: 'reminders', action: null,
    labelEn: 'Reminders', labelHi: 'लाइफ़ सर्टिफ़िकेट रिमाइंडर',
    sayEn: 'Opening Reminders. Enter the date you last submitted your Life Certificate to see your next due date.',
    sayHi: 'रिमाइंडर खुल रहा है। पिछली लाइफ़ सर्टिफ़िकेट की तारीख़ डालें, अगली तारीख़ मिल जाएगी।',
    aliases: ['life certificate reminder', 'life certificate reminders', 'life certificate', 'jeevan pramaan', 'jeevan praman', 'reminders', 'reminder', 'जीवन प्रमाण', 'लाइफ़ सर्टिफ़िकेट रिमाइंडर'],
    keywords: ['reminder', 'reminders', 'jeevan'],
  },
  {
    page: 'helpcentres', action: null,
    labelEn: 'Help & Grievance', labelHi: 'मदद कहाँ मिलेगी',
    sayEn: 'Opening Help Centres. It lists Sachivalayam, MeeSeva, bank and post office help, and what to carry.',
    sayHi: 'मदद केंद्र खुल रहे हैं — सचिवालय, मीसेवा, बैंक और डाकघर, और क्या लेकर जाना है।',
    aliases: ['help and grievance', 'help & grievance', 'help centres', 'help centers', 'where to get help', 'madad kahan milegi', 'madad kendra', 'grievance', 'shikayat', 'sachivalayam', 'help centre', 'help', 'मदद कहाँ मिलेगी', 'मदद केंद्र', 'शिकायत'],
    keywords: ['grievance', 'shikayat', 'madad', 'kendra', 'centre', 'center', 'help'],
  },
  {
    page: null, action: 'more',
    labelEn: 'More Services', labelHi: 'अन्य सेवाएं',
    sayEn: 'More services are: All Schemes, Calculator, Reminders, and Help and Grievance. Say any one of those names and I will open it.',
    sayHi: 'अन्य सेवाएं हैं: सभी योजनाएं, कैलकुलेटर, रिमाइंडर, और मदद व शिकायत। इनमें से कोई भी नाम कहें, मैं उसे खोल दूंगा।',
    aliases: ['more services', 'other services', 'baaki services', 'aur services', 'अन्य सेवाएं', 'और सेवाएं'],
    keywords: ['more'],
  },
  {
    page: null, action: 'font',
    labelEn: 'Bigger Text', labelHi: 'बड़ा टेक्स्ट',
    sayEn: 'Making the text bigger for easier reading.',
    sayHi: 'पढ़ने में आसानी के लिए टेक्स्ट बड़ा कर रहे हैं।',
    aliases: ['increase text size', 'text size', 'bigger text', 'font size', 'make text bigger', 'akshar bada karo', 'text bada karo', 'बड़ा टेक्स्ट', 'टेक्स्ट बड़ा करें'],
    keywords: ['font'],
  },
]

const STOPWORDS = new Set([
  'go', 'to', 'open', 'show', 'please', 'take', 'me', 'the', 'a', 'an', 'my', 'meri',
  'karo', 'kar', 'do', 'dikhao', 'dikhayen', 'kholo', 'khol', 'le', 'chalo', 'jao',
  'mujhe', 'zara', 'please', 'kripya', 'aur', 'and', 'is', 'ka', 'ki', 'ke',
])

export function normalizeTranscript(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[?.!,;:()"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(text) {
  return normalizeTranscript(text).split(' ').filter((w) => w && !STOPWORDS.has(w))
}

/**
 * Returns the best intent for a spoken order, or null if nothing specific
 * was said (e.g. just "pension"). `matched` names what actually matched,
 * so the UI can show the user what the assistant understood, instantly.
 */
export function matchVoiceCommand(text) {
  const t = normalizeTranscript(text)
  if (!t) return null

  // 1. Phrase match — longest phrase across ALL intents first.
  let best = null
  for (const intent of NAV_INTENTS) {
    for (const alias of [intent.labelEn, intent.labelHi, ...intent.aliases]) {
      const a = normalizeTranscript(alias)
      if (a && t.includes(a)) {
        const score = 100 + a.length
        if (!best || score > best.score) best = { intent, score, matched: alias }
      }
    }
  }
  if (best) return best

  // 2. Specific-keyword fallback (single distinctive word, not "pension").
  const words = tokens(t)
  let tokenBest = null
  for (const intent of NAV_INTENTS) {
    const hits = intent.keywords.filter((k) => words.some((w) => w === k || w.includes(k) || k.includes(w)))
    if (hits.length > 0 && (!tokenBest || hits.length > tokenBest.hits)) {
      tokenBest = { intent, score: 10 + hits.length, matched: hits[0], hits: hits.length }
    }
  }
  return tokenBest
}

export function navButtonNames(lang) {
  return NAV_INTENTS.map((i) => (lang === 'hi' ? i.labelHi : i.labelEn)).join(', ')
}
