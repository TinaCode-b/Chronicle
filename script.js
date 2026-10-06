/* ============================================================
   CHRONICLE — script.js
   Single source of truth for data + shared functionality.
   Loaded once by every page.
   ============================================================ */

/* ----------------------------------------------------------
   IMAGE SYSTEM
   Civilization cards use representative Wikimedia Commons
   photographs. The generated plates remain as a local fallback
   so a card still has artwork if a remote image is unavailable.
   ---------------------------------------------------------- */

const CHRONICLE_PALETTES = [
  ["#241F19", "#B8873C"],
  ["#2B2420", "#C79A4B"],
  ["#201B16", "#A6813C"],
  ["#2E2419", "#D1AA5E"],
  ["#211C17", "#BF9450"]
];

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function initialsFromName(name) {
  const words = name.replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/* ---- Motif library: silhouette illustrations, drawn around (200,200) ---- */

const CHRONICLE_MOTIFS = {
  pyramid: (c) => `<path d="M200 90 L310 290 L90 290 Z" fill="${c}"/><path d="M200 90 L255 290 L310 290 Z" fill="${c}" opacity="0.6"/><rect x="150" y="260" width="20" height="30" fill="${c}" opacity="0.85"/>`,
  mosque: (c) => `<path d="M140 290 V210 Q140 170 200 170 Q260 170 260 210 V290 Z" fill="${c}"/><circle cx="200" cy="150" r="22" fill="${c}"/><rect x="190" y="90" width="20" height="65" fill="${c}"/><circle cx="200" cy="88" r="9" fill="${c}"/><rect x="118" y="250" width="16" height="40" fill="${c}" opacity="0.75"/><rect x="266" y="250" width="16" height="40" fill="${c}" opacity="0.75"/><rect x="118" y="230" width="16" height="16" fill="${c}" opacity="0.6"/><rect x="266" y="230" width="16" height="16" fill="${c}" opacity="0.6"/>`,
  column: (c) => `<rect x="150" y="120" width="100" height="150" fill="${c}" opacity="0.18"/><rect x="160" y="120" width="14" height="150" fill="${c}"/><rect x="193" y="120" width="14" height="150" fill="${c}"/><rect x="226" y="120" width="14" height="150" fill="${c}"/><rect x="142" y="96" width="116" height="20" fill="${c}"/><rect x="134" y="270" width="132" height="20" fill="${c}"/>`,
  pediment: (c) => `<path d="M140 180 L200 110 L260 180 Z" fill="${c}"/><rect x="150" y="180" width="12" height="90" fill="${c}"/><rect x="178" y="180" width="12" height="90" fill="${c}"/><rect x="210" y="180" width="12" height="90" fill="${c}"/><rect x="238" y="180" width="12" height="90" fill="${c}"/><rect x="130" y="270" width="140" height="18" fill="${c}"/>`,
  pagoda: (c) => `<path d="M200 95 L240 130 L160 130 Z" fill="${c}"/><rect x="185" y="130" width="30" height="16" fill="${c}"/><path d="M200 146 L255 178 L145 178 Z" fill="${c}" opacity="0.9"/><rect x="183" y="178" width="34" height="16" fill="${c}"/><path d="M200 194 L270 230 L130 230 Z" fill="${c}" opacity="0.8"/><rect x="178" y="230" width="44" height="60" fill="${c}"/>`,
  yurt: (c) => `<path d="M130 260 Q130 190 200 185 Q270 190 270 260 Z" fill="${c}"/><rect x="110" y="260" width="180" height="20" fill="${c}"/><path d="M190 185 L200 140 L210 185 Z" fill="${c}"/><rect x="170" y="230" width="60" height="30" fill="${c}" opacity="0.45"/>`,
  "stepped-pyramid": (c) => `<rect x="110" y="258" width="180" height="32" fill="${c}"/><rect x="130" y="224" width="140" height="30" fill="${c}" opacity="0.92"/><rect x="150" y="190" width="100" height="30" fill="${c}" opacity="0.84"/><rect x="170" y="156" width="60" height="30" fill="${c}" opacity="0.76"/><rect x="188" y="128" width="24" height="24" fill="${c}"/>`,
  terraces: (c) => `<path d="M80 290 L150 180 L200 240 L240 150 L320 290 Z" fill="${c}" opacity="0.85"/><rect x="95" y="265" width="230" height="10" fill="${c}"/><rect x="115" y="245" width="190" height="8" fill="${c}" opacity="0.7"/><rect x="140" y="225" width="140" height="8" fill="${c}" opacity="0.6"/>`,
  dome: (c) => `<path d="M140 270 Q140 180 200 180 Q260 180 260 270 Z" fill="${c}"/><rect x="120" y="270" width="160" height="20" fill="${c}"/><rect x="192" y="140" width="16" height="42" fill="${c}"/><circle cx="200" cy="134" r="10" fill="${c}"/>`,
  castle: (c) => `<rect x="120" y="180" width="160" height="110" fill="${c}"/><rect x="120" y="150" width="24" height="30" fill="${c}"/><rect x="168" y="150" width="24" height="30" fill="${c}"/><rect x="216" y="150" width="24" height="30" fill="${c}"/><rect x="256" y="150" width="24" height="30" fill="${c}"/><rect x="178" y="210" width="44" height="80" fill="${c}" opacity="0.5"/>`,
  scroll: (c) => `<rect x="130" y="150" width="140" height="110" rx="4" fill="${c}" opacity="0.18"/><rect x="130" y="150" width="140" height="8" rx="4" fill="${c}"/><rect x="130" y="252" width="140" height="8" rx="4" fill="${c}"/><circle cx="130" cy="154" r="13" fill="${c}"/><circle cx="270" cy="154" r="13" fill="${c}"/><circle cx="130" cy="256" r="13" fill="${c}"/><circle cx="270" cy="256" r="13" fill="${c}"/><line x1="152" y1="178" x2="248" y2="178" stroke="${c}" stroke-width="4" opacity="0.6"/><line x1="152" y1="198" x2="248" y2="198" stroke="${c}" stroke-width="4" opacity="0.6"/><line x1="152" y1="218" x2="220" y2="218" stroke="${c}" stroke-width="4" opacity="0.6"/>`,
  crown: (c) => `<path d="M120 260 L140 160 L180 210 L200 150 L220 210 L260 160 L280 260 Z" fill="${c}"/><rect x="120" y="258" width="160" height="26" fill="${c}"/><circle cx="140" cy="155" r="9" fill="${c}"/><circle cx="200" cy="145" r="10" fill="${c}"/><circle cx="260" cy="155" r="9" fill="${c}"/>`,
  ship: (c) => `<path d="M100 250 L300 250 L270 290 L130 290 Z" fill="${c}"/><rect x="196" y="110" width="8" height="140" fill="${c}"/><path d="M204 125 L270 230 L204 230 Z" fill="${c}" opacity="0.85"/><path d="M196 140 L140 225 L196 225 Z" fill="${c}" opacity="0.65"/>`,
  sword: (c) => `<rect x="192" y="100" width="16" height="130" fill="${c}"/><path d="M200 100 L214 130 L186 130 Z" fill="${c}"/><rect x="160" y="222" width="80" height="14" fill="${c}"/><rect x="188" y="236" width="24" height="54" fill="${c}"/>`,
  shield: (c) => `<path d="M200 100 L270 128 V210 Q270 260 200 292 Q130 260 130 210 V128 Z" fill="${c}"/><path d="M200 130 L240 148 V205 Q240 238 200 262 Q160 238 160 205 V148 Z" fill="${c}" opacity="0.35"/>`,
  star: (c) => `<path d="M200 95 L220 170 L298 170 L234 215 L258 290 L200 243 L142 290 L166 215 L102 170 L180 170 Z" fill="${c}"/>`,
  obelisk: (c) => `<path d="M185 290 L185 140 L200 105 L215 140 L215 290 Z" fill="${c}"/><rect x="170" y="280" width="60" height="14" fill="${c}"/>`
};

const MOTIF_DEFAULT = "scroll";

const CIV_MOTIFS = {
  "mali-empire": "mosque", "songhai-empire": "mosque", "kingdom-of-ghana": "shield",
  "ancient-egypt": "pyramid", "great-zimbabwe": "castle", "kingdom-of-kongo": "shield",
  "roman-empire": "column", "byzantine-empire": "dome", "ancient-greece": "pediment",
  "medieval-england": "castle", "han-dynasty": "pagoda", "tang-dynasty": "pagoda",
  "mongol-empire": "yurt", "mughal-empire": "dome", "ancient-china": "pagoda",
  "maya": "stepped-pyramid", "aztec": "stepped-pyramid", "inca": "terraces", "olmec": "stepped-pyramid"
};

const CIVILIZATION_IMAGES = {
  "mali-empire": "https://upload.wikimedia.org/wikipedia/commons/4/46/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "songhai-empire": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Timbuktu-manuscripts-astronomy-mathematics.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "kingdom-of-ghana": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Kingdom_of_Ghana_%26_Trans-Saharan_Trade_about_11th_century.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "ancient-egypt": "https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "great-zimbabwe": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Great-zim-aerial-looking-West.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "kingdom-of-kongo": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Great_Zimbabwe_Closeup.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "roman-empire": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Colosseum_in_Rome-April_2007-1-_copie_2B.jpg/1280px-Colosseum_in_Rome-April_2007-1-_copie_2B.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  "byzantine-empire": "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "ancient-greece": "https://upload.wikimedia.org/wikipedia/commons/0/0d/Parthenon_from_south_slope.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "medieval-england": "https://upload.wikimedia.org/wikipedia/commons/3/38/Westminster_Abbey_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "han-dynasty": "https://upload.wikimedia.org/wikipedia/commons/2/2d/Great_Wall_of_China_at_Jinshanling-edit.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "tang-dynasty": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Dunhuang Mogao 17.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "mongol-empire": "https://upload.wikimedia.org/wikipedia/commons/3/35/YuanEmperorAlbumGenghisPortrait.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "mughal-empire": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Taj_Mahal_in_March_2004.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "ancient-china": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Great_Wall_of_China%2C_Badaling.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "maya": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Tikal_Temple_II.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "aztec": "https://upload.wikimedia.org/wikipedia/commons/1/11/Templo_Mayor_in_Mexico-Tenochtitlan_16th_century_%28illustration_1900%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "inca": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Machu_Picchu_Peru_100.jpg/1280px-Machu_Picchu_Peru_100.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  "olmec": "https://upload.wikimedia.org/wikipedia/commons/4/49/Olmec_Head.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original"
};

function civilizationImage(id, name) {
  const photoId = CIVILIZATION_IMAGES[id];
  if (!photoId) {
    const index = Math.abs(hashSeed(String(id || name || "chronicle-civilization"))) % AUTHENTIC_FALLBACKS.length;
    return AUTHENTIC_FALLBACKS[index];
  }
  return photoId;
}

function realImageFor(type, id, name) {
  if (type === "civilization") return civilizationImage(id, name);
  const topicImages = {
    "mansa-musa": "https://upload.wikimedia.org/wikipedia/commons/4/46/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "hatshepsut": "https://upload.wikimedia.org/wikipedia/commons/3/35/Hatshepsut_Statue.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "julius-caesar": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Statue_of_Julius_Caesar_in_Turin.jpg/1280px-Statue_of_Julius_Caesar_in_Turin.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "cleopatra": "https://upload.wikimedia.org/wikipedia/commons/0/0d/Cleopatra_VII_of_Egypt%2C_detail.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "genghis-khan": "https://upload.wikimedia.org/wikipedia/commons/3/35/YuanEmperorAlbumGenghisPortrait.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "confucius": "https://upload.wikimedia.org/wikipedia/commons/8/84/Confucius_Tang_Dynasty.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "napoleon-bonaparte": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Napoleon_at_study.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "akbar": "https://upload.wikimedia.org/wikipedia/commons/5/50/Portrait_of_Akbar_by_Manohar.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "leonardo-da-vinci": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Leonardo_self.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "ramses-ii": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Pharaoh_Ramses_II.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "alexander-the-great": "https://upload.wikimedia.org/wikipedia/commons/7/7d/Alexander_the_Great_mosaic.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "mali-empire-founded": "https://upload.wikimedia.org/wikipedia/commons/4/46/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "genghis-khan-unites-mongols": "https://upload.wikimedia.org/wikipedia/commons/3/35/YuanEmperorAlbumGenghisPortrait.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "columbus-voyage": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/Columbus_Taking_Possession.jpg/1280px-Columbus_Taking_Possession.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "french-revolution": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/La_Libert%C3%A9_guidant_le_peuple_-_Eug%C3%A8ne_Delacroix_-_Mus%C3%A9e_du_Louvre_Peintures_RF_129_-_apr%C3%A8s_restauration_2024.jpg/1280px-La_Libert%C3%A9_guidant_le_peuple_-_Eug%C3%A8ne_Delacroix_-_Mus%C3%A9e_du_Louvre_Peintures_RF_129_-_apr%C3%A8s_restauration_2024.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "great-zimbabwe-built": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Great-zim-aerial-looking-West.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "pyramids-giza": "https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "mansa-musa-pilgrimage": "https://upload.wikimedia.org/wikipedia/commons/4/46/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "songhai-rise": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Timbuktu-manuscripts-astronomy-mathematics.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "fall-of-rome": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Colosseum_in_Rome-April_2007-1-_copie_2B.jpg/1280px-Colosseum_in_Rome-April_2007-1-_copie_2B.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail"
  };
  if (topicImages[id]) return topicImages[id];
  const index = Math.abs(hashSeed(String(id || name || "chronicle-topic"))) % AUTHENTIC_FALLBACKS.length;
  return AUTHENTIC_FALLBACKS[index];
}

async function topicImageFor(img, subjectName = "") {
  if (img.src.includes("upload.wikimedia.org")) return;
  const query = [subjectName || img.alt, "portrait"].filter(Boolean).join(" ");
  const cacheKey = `chronicle-image:${query}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      img.src = cached;
      return;
    }
    const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=1000&format=json&origin=*`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`Image search failed with ${response.status}`);
    const data = await response.json();
    const page = data.query && Object.values(data.query.pages || {})[0];
    const url = page && page.imageinfo && page.imageinfo[0] && (page.imageinfo[0].thumburl || page.imageinfo[0].url);
    if (!url) return;
    sessionStorage.setItem(cacheKey, url);
    img.src = url;
  } catch (error) {
    img.dataset.imageSearchError = "true";
  }
}

function initTopicImages() {
  document.querySelectorAll("img[data-topic-image]").forEach(topicImageFor);
}

function detailUrl(type, id) {
  return `article.html?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;
}

function getChronicleItem(type, id) {
  const sources = {
    civilization: getCivilizations(),
    figure: getHistoricalFigures(),
    story: getExploreArticles(),
    event: getTimelineEvents()
  };
  return (sources[type] || []).find(item => item.id === id) || null;
}

function initDetailLinks() {
  document.addEventListener("click", event => {
    const card = event.target.closest("[data-detail-type][data-detail-id]");
    if (!card || event.target.closest("button, a, input")) return;
    window.location.href = detailUrl(card.dataset.detailType, card.dataset.detailId);
  });
  document.addEventListener("keydown", event => {
    const card = event.target.closest("[data-detail-type][data-detail-id]");
    if (card && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      window.location.href = detailUrl(card.dataset.detailType, card.dataset.detailId);
    }
  });
}

document.addEventListener("DOMContentLoaded", initDetailLinks);
document.addEventListener("DOMContentLoaded", initTopicImages);

const FIGURE_MOTIFS = {
  "mansa-musa": "crown", "sundiata-keita": "shield", "askia-muhammad": "mosque",
  "shaka-zulu": "shield", "queen-nzinga": "shield", "hatshepsut": "pyramid",
  "ramses-ii": "pyramid", "hannibal": "sword", "cleopatra": "obelisk",
  "julius-caesar": "column", "alexander-the-great": "sword", "charlemagne": "castle",
  "leonardo-da-vinci": "scroll", "napoleon-bonaparte": "sword", "joan-of-arc": "sword",
  "elizabeth-i": "crown", "galileo-galilei": "scroll", "genghis-khan": "yurt",
  "kublai-khan": "pagoda", "confucius": "scroll", "ashoka": "crown",
  "qin-shi-huang": "pagoda", "akbar": "dome", "sun-tzu": "sword",
  "saladin": "mosque", "ibn-sina": "scroll", "ibn-khaldun": "scroll",
  "simon-bolivar": "sword", "george-washington": "column", "harriet-tubman": "star",
  "tecumseh": "shield", "suleiman-the-magnificent": "dome", "marco-polo": "ship"
};

const EXPLORE_MOTIFS = {
  "gold-of-mali": "crown", "rise-of-rome": "column", "egypt-nile": "pyramid",
  "mongol-conquest": "yurt", "renaissance-rebirth": "scroll", "songhai-scholars": "mosque",
  "silk-road-exchange": "pagoda", "inca-roads": "terraces", "byzantine-survival": "dome",
  "aztec-capital": "stepped-pyramid", "zulu-military": "shield", "age-of-independence": "sword"
};

const TIMELINE_MOTIFS = {
  "pyramids-giza": "pyramid", "olmec-rise": "stepped-pyramid", "confucius-teaching": "scroll",
  "founding-of-rome-republic": "column", "alexander-conquests": "sword", "qin-unification": "pagoda",
  "punic-wars": "sword", "silk-road-opens": "pagoda", "fall-of-rome": "column",
  "kingdom-of-ghana-rise": "shield", "charlemagne-crowned": "castle", "great-zimbabwe-built": "castle",
  "mali-empire-founded": "mosque", "genghis-khan-unites-mongols": "yurt", "magna-carta": "castle",
  "mansa-musa-pilgrimage": "crown", "saladin-retakes-jerusalem": "mosque", "byzantine-hagia-sophia": "dome",
  "songhai-rise": "mosque", "columbus-voyage": "ship", "inca-empire-height": "terraces",
  "renaissance-florence": "scroll", "mughal-empire-founded": "dome", "spanish-armada": "ship",
  "shaka-zulu-kingdom": "shield", "american-independence": "star", "french-revolution": "sword",
  "bolivar-independence": "sword", "harriet-tubman-railroad": "star", "world-war-two-ends": "star",
  "african-independence-wave": "shield", "fall-of-berlin-wall": "castle"
};

function motifKeyFor(id, fallbackKey) {
  return CIV_MOTIFS[id] || FIGURE_MOTIFS[id] || EXPLORE_MOTIFS[id] || TIMELINE_MOTIFS[id] || fallbackKey || MOTIF_DEFAULT;
}

function makePlateImage(name, seedKey, motifKey) {
  const key = seedKey || name;
  const seed = hashSeed(key);
  const [bg, accent] = CHRONICLE_PALETTES[seed % CHRONICLE_PALETTES.length];
  const motif = CHRONICLE_MOTIFS[motifKeyFor(key, motifKey)] || CHRONICLE_MOTIFS[MOTIF_DEFAULT];
  const initials = escapeHtml(initialsFromName(name));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <radialGradient id="g${seed}" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.22"/>
        <stop offset="60%" stop-color="${bg}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="400" height="400" fill="${bg}"/>
    <rect width="400" height="400" fill="url(#g${seed})"/>
    <circle cx="200" cy="200" r="172" fill="none" stroke="${accent}" stroke-width="1" opacity="0.35"/>
    <g opacity="0.92">${motif(accent)}</g>
    <text x="200" y="352" font-family="Inter, sans-serif" font-size="15" letter-spacing="2" fill="${accent}" text-anchor="middle" font-weight="600" opacity="0.85">${initials}</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

/* A wider illustrated "skyline" composition for the homepage hero —
   silhouettes of several civilizations' architecture sharing one
   horizon line, rendered the same zero-dependency way as the plates. */
function makeHeroSkyline() {
  const accent = "#B8873C";
  const accentDim = "#8C6A33";
  const bg = "#201B16";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" preserveAspectRatio="xMidYMax slice">
    <defs>
      <radialGradient id="heroGlow" cx="38%" cy="22%" r="75%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.28"/>
        <stop offset="65%" stop-color="${bg}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="600" height="500" fill="${bg}"/>
    <rect width="600" height="500" fill="url(#heroGlow)"/>
    <circle cx="430" cy="110" r="58" fill="${accent}" opacity="0.18"/>
    <circle cx="430" cy="110" r="36" fill="${accent}" opacity="0.5"/>
    <!-- pagoda -->
    <g opacity="0.9" fill="${accentDim}">
      <path d="M90 300 L120 325 L60 325 Z"/><rect x="80" y="325" width="20" height="10"/>
      <path d="M90 335 L135 360 L45 360 Z"/><rect x="77" y="360" width="26" height="10"/>
      <path d="M90 370 L145 400 L35 400 Z"/><rect x="70" y="400" width="40" height="60"/>
    </g>
    <!-- column temple -->
    <g opacity="0.95" fill="${accent}">
      <path d="M160 330 L205 290 L250 330 Z"/>
      <rect x="168" y="330" width="10" height="100"/>
      <rect x="190" y="330" width="10" height="100"/>
      <rect x="212" y="330" width="10" height="100"/>
      <rect x="232" y="330" width="10" height="100"/>
      <rect x="156" y="330" width="100" height="12"/>
      <rect x="156" y="428" width="100" height="14"/>
    </g>
    <!-- pyramid -->
    <g opacity="0.85" fill="${accentDim}">
      <path d="M320 460 L380 320 L440 460 Z"/>
      <path d="M380 320 L410 460 L440 460 Z" opacity="0.6"/>
    </g>
    <!-- dome -->
    <g opacity="1" fill="${accent}">
      <path d="M440 440 Q440 370 490 370 Q540 370 540 440 Z"/>
      <rect x="415" y="440" width="150" height="16"/>
      <rect x="480" y="330" width="10" height="40"/>
      <circle cx="485" cy="324" r="7"/>
    </g>
    <!-- ground line -->
    <rect x="0" y="456" width="600" height="2" fill="${accent}" opacity="0.4"/>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

const fallbackImage = "https://commons.wikimedia.org/wiki/Special:FilePath/Great_Zimbabwe_Closeup.jpg?width=1280";

const AUTHENTIC_FALLBACKS = [
  "https://upload.wikimedia.org/wikipedia/commons/3/3a/Great_Zimbabwe_Closeup.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "https://upload.wikimedia.org/wikipedia/commons/a/a0/Great_Pyramid_of_Giza.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "https://upload.wikimedia.org/wikipedia/commons/5/50/Colosseum_in_Rome.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "https://upload.wikimedia.org/wikipedia/commons/7/7d/Tikal.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "https://upload.wikimedia.org/wikipedia/commons/3/3a/Great_Zimbabwe_Closeup.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/YuanEmperorAlbumGenghisPortrait.jpg/1280px-YuanEmperorAlbumGenghisPortrait.jpg"
];

function imageOnErrorHandler(imgEl, name) {
  imgEl.onerror = null;
  imgEl.dataset.imageSourceFailed = "true";
  imgEl.removeAttribute("src");
  topicImageFor(imgEl, name);
}

const CHRONICLE_STORAGE_KEY = "chronicle-preferences";

function readChroniclePreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHRONICLE_STORAGE_KEY)) || {};
    return {
      favorites: Array.isArray(saved.favorites) ? saved.favorites : [],
      quiz: { attempts: 0, best: 0, last: 0, ...(saved.quiz || {}) }
    };
  } catch (error) {
    return { favorites: [], quiz: { attempts: 0, best: 0, last: 0 } };
  }
}

function writeChroniclePreferences(preferences) {
  localStorage.setItem(CHRONICLE_STORAGE_KEY, JSON.stringify(preferences));
}

function favoriteKey(type, id) {
  return `${type}:${id}`;
}

function isFavorite(type, id) {
  return readChroniclePreferences().favorites.includes(favoriteKey(type, id));
}

function favoriteButton(type, id, label) {
  const active = isFavorite(type, id);
  return `<button class="favorite-btn${active ? " is-favorite" : ""}" data-favorite-type="${escapeHtml(type)}" data-favorite-id="${escapeHtml(id)}" aria-label="${active ? "Remove" : "Save"} ${escapeHtml(label)} ${active ? "from" : "to"} favorites" aria-pressed="${active}">&#9733;</button>`;
}

function updateFavoriteButtons() {
  document.querySelectorAll("[data-favorite-type][data-favorite-id]").forEach(button => {
    const active = isFavorite(button.dataset.favoriteType, button.dataset.favoriteId);
    button.classList.toggle("is-favorite", active);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", `${active ? "Remove" : "Save"} ${button.dataset.favoriteId} ${active ? "from" : "to"} favorites`);
  });
  const count = readChroniclePreferences().favorites.length;
  document.querySelectorAll("[data-favorites-count]").forEach(el => { el.textContent = count; });
  const list = document.querySelector("[data-favorites-list]");
  const empty = document.querySelector("[data-favorites-empty]");
  if (list) {
    const items = [...new Map([...document.querySelectorAll("[data-favorite-type][data-favorite-id]")]
      .filter(button => isFavorite(button.dataset.favoriteType, button.dataset.favoriteId))
      .map(button => [favoriteKey(button.dataset.favoriteType, button.dataset.favoriteId), button.dataset.favoriteId.replace(/-/g, " ")])).values()];
    list.innerHTML = items.map(item => `<p class="favorite-item">${escapeHtml(item)}</p>`).join("");
    if (empty) empty.hidden = items.length > 0;
  }
}

function initChroniclePersonalization() {
  const actions = document.querySelector(".header-actions");
  if (actions && !actions.querySelector("[data-favorites-toggle]")) {
    const button = document.createElement("button");
    button.className = "favorites-toggle";
    button.type = "button";
    button.setAttribute("data-favorites-toggle", "");
    button.setAttribute("aria-label", "View favorites");
    button.innerHTML = "&#9733;<span data-favorites-count>0</span>";
    actions.insertBefore(button, actions.firstChild);
  }

  document.addEventListener("click", event => {
    const favorite = event.target.closest("[data-favorite-type][data-favorite-id]");
    if (favorite) {
      const preferences = readChroniclePreferences();
      const key = favoriteKey(favorite.dataset.favoriteType, favorite.dataset.favoriteId);
      preferences.favorites = preferences.favorites.includes(key)
        ? preferences.favorites.filter(item => item !== key)
        : [...preferences.favorites, key];
      writeChroniclePreferences(preferences);
      updateFavoriteButtons();
      event.preventDefault();
      return;
    }
    const toggle = event.target.closest("[data-favorites-toggle]");
    if (toggle) {
      const panel = document.querySelector("[data-favorites-panel]");
      if (panel) panel.toggleAttribute("hidden");
    }
  });

  const panel = document.createElement("aside");
  panel.className = "favorites-panel";
  panel.setAttribute("data-favorites-panel", "");
  panel.hidden = true;
  panel.innerHTML = `<div class="favorites-panel-head"><h2>Saved items</h2><button type="button" class="favorites-close" aria-label="Close favorites">&times;</button></div><p class="muted" data-favorites-empty>Your saved items appear here.</p><div data-favorites-list></div>`;
  document.body.appendChild(panel);
  panel.addEventListener("click", event => {
    if (event.target.closest(".favorites-close")) panel.hidden = true;
  });
  updateFavoriteButtons();
}

document.addEventListener("DOMContentLoaded", initChroniclePersonalization);

/* ----------------------------------------------------------
   TEXT / SEARCH UTILITIES
   ---------------------------------------------------------- */

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeSearchText(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function searchableFieldsOf(item) {
  const fields = [
    item.name,
    item.title,
    item.description,
    item.region,
    item.period,
    item.era,
    item.date,
    item.civilization,
    item.category
  ];
  if (Array.isArray(item.keywords)) fields.push(item.keywords.join(" "));
  if (Array.isArray(item.achievements)) fields.push(item.achievements.join(" "));
  return fields.filter(Boolean).map(normalizeSearchText).join(" | ");
}

function itemMatchesSearch(item, query) {
  const q = normalizeSearchText(query);
  if (!q) return true;
  const haystack = searchableFieldsOf(item);
  return q.split(" ").filter(Boolean).every(term => haystack.includes(term));
}

function getSearchScore(item, query) {
  const q = normalizeSearchText(query);
  if (!q) return 0;
  const name = normalizeSearchText(item.name || item.title || "");
  let score = 0;
  if (name === q) score += 100;
  else if (name.startsWith(q)) score += 60;
  else if (name.includes(q)) score += 35;
  if (Array.isArray(item.keywords)) {
    item.keywords.forEach(k => {
      const nk = normalizeSearchText(k);
      if (nk === q) score += 25;
      else if (nk.includes(q)) score += 12;
    });
  }
  const desc = normalizeSearchText(item.description || "");
  if (desc.includes(q)) score += 8;
  const region = normalizeSearchText(item.region || "");
  if (region.includes(q)) score += 5;
  const period = normalizeSearchText(item.period || item.era || "");
  if (period.includes(q)) score += 5;
  return score;
}

function filterAndSort(items, query) {
  const q = normalizeSearchText(query);
  const matched = items.filter(item => itemMatchesSearch(item, q));
  if (!q) return matched;
  return matched.sort((a, b) => getSearchScore(b, q) - getSearchScore(a, q));
}

/* ----------------------------------------------------------
   DATA: HISTORICAL FIGURES  (single source of truth)
   ---------------------------------------------------------- */

const historicalFigures = [
  { id: "mansa-musa", name: "Mansa Musa", region: "Africa", period: "Medieval", date: "c. 1280 – c. 1337", description: "Ruler of the Mali Empire whose 1324 pilgrimage to Mecca, laden with gold, made West Africa's wealth famous across the Islamic world and Europe.", keywords: ["Mali", "gold", "West Africa", "Mali Empire", "Mecca", "Timbuktu", "pilgrimage"] },
  { id: "sundiata-keita", name: "Sundiata Keita", region: "Africa", period: "Medieval", date: "c. 1217 – c. 1255", description: "Founder of the Mali Empire, celebrated in West African oral tradition as the 'Lion King' who united the Mandinka clans after years of exile.", keywords: ["Mali", "Mali Empire", "West Africa", "Mandinka", "Epic of Sundiata"] },
  { id: "askia-muhammad", name: "Askia Muhammad", region: "Africa", period: "Medieval", date: "c. 1443 – 1538", description: "Emperor of the Songhai Empire who expanded its borders and turned Timbuktu and Gao into centers of Islamic scholarship and trade.", keywords: ["Songhai", "Songhai Empire", "Timbuktu", "West Africa", "Gao", "trade"] },
  { id: "shaka-zulu", name: "Shaka Zulu", region: "Africa", period: "Early Modern", date: "c. 1787 – 1828", description: "Zulu king whose military reforms, including the short stabbing spear and new regimental tactics, built the Zulu Kingdom into a dominant regional power.", keywords: ["Zulu", "Zulu Kingdom", "Southern Africa", "military reform"] },
  { id: "queen-nzinga", name: "Queen Nzinga", region: "Africa", period: "Early Modern", date: "c. 1583 – 1663", description: "Ruler of the Ndongo and Matamba kingdoms who resisted Portuguese colonization for decades through shrewd diplomacy and military strategy.", keywords: ["Ndongo", "Matamba", "Angola", "Portuguese", "resistance", "Central Africa"] },
  { id: "hatshepsut", name: "Hatshepsut", region: "Africa", period: "Ancient", date: "c. 1507 – 1458 BCE", description: "One of the most successful pharaohs of Egypt, she expanded trade networks, notably to the Land of Punt, and commissioned major building projects.", keywords: ["Egypt", "Ancient Egypt", "pharaoh", "Punt", "Deir el-Bahari"] },
  { id: "ramses-ii", name: "Ramses II", region: "Africa", period: "Ancient", date: "c. 1303 – 1213 BCE", description: "Pharaoh of Egypt's Nineteenth Dynasty, remembered for the Battle of Kadesh, the temples at Abu Simbel, and one of the longest reigns in Egyptian history.", keywords: ["Egypt", "Ancient Egypt", "pharaoh", "Abu Simbel", "Kadesh"] },
  { id: "hannibal", name: "Hannibal Barca", region: "Africa", period: "Classical", date: "247 – c. 183/181 BCE", description: "Carthaginian general famed for leading an army, with war elephants, across the Alps to challenge Rome during the Second Punic War.", keywords: ["Carthage", "Rome", "Punic War", "Alps", "North Africa"] },
  { id: "julius-caesar", name: "Julius Caesar", region: "Europe", period: "Classical", date: "100 – 44 BCE", description: "Roman general and statesman whose conquest of Gaul and rise to dictator reshaped the Roman Republic and paved the way for the Roman Empire.", keywords: ["Rome", "Roman Empire", "Gaul", "Republic", "dictator"] },
  { id: "alexander-the-great", name: "Alexander the Great", region: "Europe", period: "Classical", date: "356 – 323 BCE", description: "King of Macedon who built one of the largest empires of the ancient world, spreading Greek culture from Egypt to the edges of India.", keywords: ["Macedon", "Greece", "empire", "Persia", "Hellenistic"] },
  { id: "charlemagne", name: "Charlemagne", region: "Europe", period: "Medieval", date: "c. 747 – 814", description: "King of the Franks crowned Holy Roman Emperor in 800, whose reign united much of Western Europe and sparked a revival of learning and culture.", keywords: ["Franks", "Holy Roman Empire", "Europe", "Carolingian"] },
  { id: "leonardo-da-vinci", name: "Leonardo da Vinci", region: "Europe", period: "Early Modern", date: "1452 – 1519", description: "Renaissance polymath whose paintings, anatomical studies, and engineering sketches embody the era's fusion of art and scientific inquiry.", keywords: ["Renaissance", "Italy", "art", "science", "Florence"] },
  { id: "napoleon-bonaparte", name: "Napoleon Bonaparte", region: "Europe", period: "Modern", date: "1769 – 1821", description: "French military leader who rose from the Revolution to become Emperor, reshaping European borders and legal systems through years of war and reform.", keywords: ["France", "French Revolution", "Napoleonic Wars", "Empire"] },
  { id: "joan-of-arc", name: "Joan of Arc", region: "Europe", period: "Medieval", date: "c. 1412 – 1431", description: "French peasant girl who claimed divine guidance and led French forces during the Hundred Years' War before being captured and executed.", keywords: ["France", "Hundred Years War", "England", "Orleans"] },
  { id: "elizabeth-i", name: "Queen Elizabeth I", region: "Europe", period: "Early Modern", date: "1533 – 1603", description: "Queen of England whose long reign saw the defeat of the Spanish Armada and a flourishing of English drama, exploration, and national identity.", keywords: ["England", "Tudor", "Spanish Armada", "Renaissance"] },
  { id: "galileo-galilei", name: "Galileo Galilei", region: "Europe", period: "Early Modern", date: "1564 – 1642", description: "Italian astronomer and physicist whose telescopic observations supported a sun-centered solar system, challenging established church doctrine.", keywords: ["Italy", "astronomy", "science", "Renaissance", "telescope"] },
  { id: "genghis-khan", name: "Genghis Khan", region: "Asia", period: "Medieval", date: "c. 1162 – 1227", description: "Founder of the Mongol Empire, uniting the Mongol tribes and launching campaigns that created the largest contiguous land empire in history.", keywords: ["Mongol", "Mongol Empire", "Central Asia", "conquest"] },
  { id: "kublai-khan", name: "Kublai Khan", region: "Asia", period: "Medieval", date: "1215 – 1294", description: "Grandson of Genghis Khan who completed the conquest of China and founded the Yuan Dynasty, hosting travelers such as Marco Polo at his court.", keywords: ["Mongol", "Mongol Empire", "China", "Yuan Dynasty"] },
  { id: "confucius", name: "Confucius", region: "Asia", period: "Ancient", date: "551 – 479 BCE", description: "Chinese philosopher whose teachings on ethics, family, and governance formed Confucianism, a system that shaped East Asian society for centuries.", keywords: ["China", "philosophy", "Confucianism", "ethics"] },
  { id: "ashoka", name: "Ashoka the Great", region: "Asia", period: "Ancient", date: "c. 304 – 232 BCE", description: "Emperor of the Maurya Empire who, after a brutal conquest of Kalinga, embraced Buddhism and promoted nonviolence and public welfare across India.", keywords: ["India", "Maurya Empire", "Buddhism", "Kalinga"] },
  { id: "qin-shi-huang", name: "Qin Shi Huang", region: "Asia", period: "Ancient", date: "259 – 210 BCE", description: "First emperor to unify China, standardizing writing, currency, and measurement while beginning construction linked to the early Great Wall.", keywords: ["China", "Qin Dynasty", "unification", "Great Wall", "Terracotta Army"] },
  { id: "akbar", name: "Akbar the Great", region: "Asia", period: "Early Modern", date: "1542 – 1605", description: "Mughal emperor known for expanding the empire across the Indian subcontinent while promoting religious tolerance and administrative reform.", keywords: ["Mughal Empire", "India", "religious tolerance"] },
  { id: "sun-tzu", name: "Sun Tzu", region: "Asia", period: "Classical", date: "c. 544 – 496 BCE", description: "Chinese military strategist and philosopher credited with 'The Art of War', a treatise on strategy still studied around the world today.", keywords: ["China", "military strategy", "The Art of War"] },
  { id: "saladin", name: "Saladin", region: "Middle East", period: "Medieval", date: "c. 1137 – 1193", description: "Founder of the Ayyubid dynasty who unified Muslim territories and recaptured Jerusalem from Crusader forces in 1187.", keywords: ["Ayyubid", "Crusades", "Jerusalem", "Egypt", "Syria"] },
  { id: "ibn-sina", name: "Ibn Sina (Avicenna)", region: "Middle East", period: "Medieval", date: "c. 980 – 1037", description: "Persian polymath whose 'Canon of Medicine' became a standard medical reference in both the Islamic world and medieval Europe for centuries.", keywords: ["Persia", "medicine", "philosophy", "Canon of Medicine"] },
  { id: "ibn-khaldun", name: "Ibn Khaldun", region: "Middle East", period: "Medieval", date: "1332 – 1406", description: "North African historian and scholar often regarded as a founder of sociology and historiography for his analysis of civilizations' rise and fall.", keywords: ["North Africa", "historiography", "sociology", "Muqaddimah"] },
  { id: "simon-bolivar", name: "Simón Bolívar", region: "Americas", period: "Modern", date: "1783 – 1830", description: "Venezuelan revolutionary leader known as 'El Libertador' for leading much of South America to independence from Spanish rule.", keywords: ["South America", "independence", "Venezuela", "Gran Colombia"] },
  { id: "george-washington", name: "George Washington", region: "Americas", period: "Modern", date: "1732 – 1799", description: "Commander of the Continental Army and first President of the United States, central to the country's founding and early government.", keywords: ["United States", "American Revolution", "independence"] },
  { id: "harriet-tubman", name: "Harriet Tubman", region: "Americas", period: "Modern", date: "c. 1822 – 1913", description: "Escaped slavery and became a leading conductor on the Underground Railroad, later serving as a scout and spy for Union forces.", keywords: ["United States", "Underground Railroad", "abolition", "slavery"] },
  { id: "tecumseh", name: "Tecumseh", region: "Americas", period: "Modern", date: "1768 – 1813", description: "Shawnee leader who organized a confederacy of Native American nations to resist United States expansion into the Ohio Valley.", keywords: ["Shawnee", "Native American", "United States", "Ohio Valley"] },
  { id: "cleopatra", name: "Cleopatra VII", region: "Africa", period: "Classical", date: "69 – 30 BCE", description: "Last active ruler of the Ptolemaic Kingdom of Egypt, remembered for her alliances with Julius Caesar and Mark Antony and her political acumen.", keywords: ["Egypt", "Ptolemaic", "Rome", "Alexandria"] },
  { id: "suleiman-the-magnificent", name: "Suleiman the Magnificent", region: "Middle East", period: "Early Modern", date: "1494 – 1566", description: "Ottoman sultan whose reign marked the empire's peak in territory, legal reform, and cultural achievement across three continents.", keywords: ["Ottoman Empire", "Turkey", "law", "Constantinople"] },
  { id: "marco-polo", name: "Marco Polo", region: "Europe", period: "Medieval", date: "1254 – 1324", description: "Venetian merchant and explorer whose account of his travels along the Silk Road to the court of Kublai Khan introduced Asia to European readers.", keywords: ["Venice", "Silk Road", "China", "trade", "exploration"] }
];

const HISTORICAL_FIGURE_IMAGES = {
  "mansa-musa": "https://upload.wikimedia.org/wikipedia/commons/4/46/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "sundiata-keita": "https://upload.wikimedia.org/wikipedia/commons/4/46/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "askia-muhammad": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Timbuktu-manuscripts-astronomy-mathematics.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "shaka-zulu": "https://upload.wikimedia.org/wikipedia/commons/8/83/Shaka_Zulu.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "queen-nzinga": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Nzinga_mbande.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "hatshepsut": "https://upload.wikimedia.org/wikipedia/commons/3/35/Hatshepsut_Statue.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "ramses-ii": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Pharaoh_Ramses_II.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "hannibal": "https://upload.wikimedia.org/wikipedia/commons/0/0a/Hannibal.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "julius-caesar": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Statue_of_Julius_Caesar_in_Turin.jpg/1280px-Statue_of_Julius_Caesar_in_Turin.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  "alexander-the-great": "https://upload.wikimedia.org/wikipedia/commons/7/7d/Alexander_the_Great_mosaic.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "charlemagne": "https://upload.wikimedia.org/wikipedia/commons/9/95/Charlemagne.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "leonardo-da-vinci": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Leonardo_self.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "napoleon-bonaparte": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/La_Libert%C3%A9_guidant_le_peuple_-_Eug%C3%A8ne_Delacroix_-_Mus%C3%A9e_du_Louvre_Peintures_RF_129_-_apr%C3%A8s_restauration_2024.jpg/1280px-La_Libert%C3%A9_guidant_le_peuple_-_Eug%C3%A8ne_Delacroix_-_Mus%C3%A9e_du_Louvre_Peintures_RF_129_-_apr%C3%A8s_restauration_2024.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  "joan-of-arc": "https://upload.wikimedia.org/wikipedia/commons/8/8f/Joan_of_Arc.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "elizabeth-i": "https://upload.wikimedia.org/wikipedia/commons/5/52/Elizabeth_I_Red_Portrait.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "galileo-galilei": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Galileo_Galilei_1640.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "genghis-khan": "https://upload.wikimedia.org/wikipedia/commons/3/35/YuanEmperorAlbumGenghisPortrait.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "kublai-khan": "https://upload.wikimedia.org/wikipedia/commons/3/35/YuanEmperorAlbumGenghisPortrait.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "confucius": "https://upload.wikimedia.org/wikipedia/commons/8/84/Confucius_Tang_Dynasty.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "ashoka": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Ashoka_Column.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "qin-shi-huang": "https://upload.wikimedia.org/wikipedia/commons/6/6b/QinShiHuang.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "akbar": "https://upload.wikimedia.org/wikipedia/commons/5/50/Portrait_of_Akbar_by_Manohar.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "sun-tzu": "https://upload.wikimedia.org/wikipedia/commons/8/86/Sun_Tzu.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "saladin": "https://upload.wikimedia.org/wikipedia/commons/1/13/Saladin.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "ibn-sina": "https://upload.wikimedia.org/wikipedia/commons/0/0b/Avicenna.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "ibn-khaldun": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Ibn_Khaldun.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "simon-bolivar": "https://upload.wikimedia.org/wikipedia/commons/2/25/Simon_Bolivar.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "george-washington": "https://upload.wikimedia.org/wikipedia/commons/3/31/George_Washington_by_Gilbert_Stuart.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "harriet-tubman": "https://upload.wikimedia.org/wikipedia/commons/1/13/Harriet_Tubman.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "tecumseh": "https://upload.wikimedia.org/wikipedia/commons/0/0a/Tecumseh.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "cleopatra": "https://upload.wikimedia.org/wikipedia/commons/0/0d/Cleopatra_VII_of_Egypt%2C_detail.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "suleiman-the-magnificent": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Suleiman_the_Magnificent.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "marco-polo": "https://upload.wikimedia.org/wikipedia/commons/4/48/Marco_Polo.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original"
};

const HISTORICAL_FIGURE_ALT = Object.fromEntries(Object.entries(HISTORICAL_FIGURE_IMAGES).map(([key, value]) => [key, `Historical depiction associated with ${key.replace(/-/g, " ")}`]));

historicalFigures.forEach(item => {
  item.image = HISTORICAL_FIGURE_IMAGES[item.id] || "https://upload.wikimedia.org/wikipedia/commons/4/46/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original";
  item.imageAlt = HISTORICAL_FIGURE_ALT[item.id] || `Historical image of ${item.name}`;
});

function getHistoricalFigures() {
  return historicalFigures;
}

function itemImage(item, fallback = fallbackImage) {
  return item && item.image ? item.image : fallback;
}

function itemImageAlt(item, fallback = "Historical image") {
  return item && item.imageAlt ? item.imageAlt : fallback;
}

/* ----------------------------------------------------------
   DATA: CIVILIZATIONS
   ---------------------------------------------------------- */

const civilizations = [
  { id: "mali-empire", name: "Mali Empire", region: "Africa", period: "c. 1235 – 1670", description: "A West African trading empire whose control of gold and salt routes made it one of the wealthiest realms of the medieval world.", achievements: ["Vast trans-Saharan gold and salt trade", "Timbuktu as a center of Islamic scholarship", "Mansa Musa's famous pilgrimage to Mecca"] },
  { id: "songhai-empire", name: "Songhai Empire", region: "Africa", period: "c. 1464 – 1591", description: "Successor to Mali as the dominant power in West Africa, built on river trade along the Niger and renowned centers of learning.", achievements: ["Sankore University in Timbuktu", "Control of Niger River trade routes", "Strong centralized administration"] },
  { id: "kingdom-of-ghana", name: "Kingdom of Ghana", region: "Africa", period: "c. 300 – 1200", description: "An early West African state that grew wealthy by taxing trade in gold and salt between North and West Africa.", achievements: ["Pioneered trans-Saharan gold trade", "Sophisticated tax and tribute system", "Regional military strength"] },
  { id: "ancient-egypt", name: "Ancient Egypt", region: "Africa", period: "c. 3100 – 30 BCE", description: "A civilization along the Nile known for monumental architecture, a written language, and a highly organized state that lasted three millennia.", achievements: ["The pyramids and Great Sphinx of Giza", "Hieroglyphic writing system", "Advances in medicine and engineering"] },
  { id: "great-zimbabwe", name: "Great Zimbabwe", region: "Africa", period: "c. 1100 – 1450", description: "A Southern African kingdom famed for its dry-stone city walls and its role as a hub of regional and Indian Ocean trade.", achievements: ["Massive dry-stone architecture without mortar", "Extensive cattle and gold trade networks", "Trade links reaching the Indian Ocean coast"] },
  { id: "kingdom-of-kongo", name: "Kingdom of Kongo", region: "Africa", period: "c. 1390 – 1914", description: "A Central African kingdom with a sophisticated political structure that engaged in early diplomacy with Portugal.", achievements: ["Organized provincial governance system", "Early diplomatic ties with European kingdoms", "Skilled textile and metalwork traditions"] },
  { id: "roman-empire", name: "Roman Empire", region: "Europe", period: "27 BCE – 476 CE", description: "One of history's largest empires, spanning the Mediterranean world and leaving a lasting legacy in law, engineering, and language.", achievements: ["Extensive road and aqueduct networks", "Codified legal systems still referenced today", "Widespread urban infrastructure"] },
  { id: "byzantine-empire", name: "Byzantine Empire", region: "Europe", period: "330 – 1453", description: "The continuation of the Roman Empire in the east, centered on Constantinople, preserving classical learning through the Middle Ages.", achievements: ["Preservation of Greco-Roman texts", "Justinian's legal code", "Monumental architecture like the Hagia Sophia"] },
  { id: "ancient-greece", name: "Ancient Greece", region: "Europe", period: "c. 1200 – 146 BCE", description: "A collection of city-states whose philosophy, democracy, and art laid foundations for later Western civilization.", achievements: ["Birthplace of Western philosophy", "Early democratic governance in Athens", "Foundational works of drama and epic poetry"] },
  { id: "medieval-england", name: "Medieval England", region: "Europe", period: "c. 1066 – 1485", description: "A period following the Norman Conquest marked by feudal structures, the growth of common law, and formative constitutional milestones.", achievements: ["Magna Carta and early constitutional limits", "Development of English common law", "Gothic cathedral architecture"] },
  { id: "han-dynasty", name: "Han Dynasty", region: "Asia", period: "206 BCE – 220 CE", description: "A Chinese dynasty regarded as a golden age that expanded trade along the Silk Road and standardized much of Chinese culture.", achievements: ["Establishment of the Silk Road trade network", "Advances in papermaking and metallurgy", "Confucianism as state ideology"] },
  { id: "tang-dynasty", name: "Tang Dynasty", region: "Asia", period: "618 – 907", description: "Often considered a high point of Chinese civilization, marked by cosmopolitan trade, poetry, and technological innovation.", achievements: ["Flourishing of Chinese poetry and art", "Expanded international trade routes", "Early developments in printing"] },
  { id: "mongol-empire", name: "Mongol Empire", region: "Asia", period: "1206 – 1368", description: "The largest contiguous land empire in history, connecting East and West and enabling unprecedented exchange along the Silk Road.", achievements: ["Vast Silk Road trade integration", "Efficient postal and communication systems", "Religious tolerance across conquered lands"] },
  { id: "mughal-empire", name: "Mughal Empire", region: "Asia", period: "1526 – 1857", description: "A powerful Islamic dynasty in South Asia known for its architectural achievements and administrative sophistication.", achievements: ["Construction of the Taj Mahal", "Blending of Persian, Indian, and Islamic art", "Efficient land revenue administration"] },
  { id: "ancient-china", name: "Ancient China", region: "Asia", period: "c. 2070 BCE – 220 CE", description: "One of the world's oldest continuous civilizations, home to early writing systems, philosophy, and major dynastic states.", achievements: ["Invention of paper and early printing", "Development of Confucian and Taoist thought", "The early Great Wall fortifications"] },
  { id: "maya", name: "Maya Civilization", region: "Americas", period: "c. 2000 BCE – 1500s CE", description: "A Mesoamerican civilization known for its writing system, mathematics, and precise astronomical calendars.", achievements: ["A fully developed hieroglyphic writing system", "Advanced astronomical and calendar systems", "Monumental pyramid-temples such as Tikal"] },
  { id: "aztec", name: "Aztec Empire", region: "Americas", period: "1428 – 1521", description: "A Mesoamerican empire centered on the island capital of Tenochtitlan, known for engineering, trade, and religious ceremony.", achievements: ["Chinampa floating-garden agriculture", "The engineered capital of Tenochtitlan", "Extensive tribute and trade networks"] },
  { id: "inca", name: "Inca Empire", region: "Americas", period: "1438 – 1533", description: "The largest empire in pre-Columbian America, linked by an extraordinary road system through the Andes mountains.", achievements: ["Over 24,000 miles of mountain road network", "Advanced terrace farming techniques", "Precision stonework at sites like Machu Picchu"] },
  { id: "olmec", name: "Olmec Civilization", region: "Americas", period: "c. 1200 – 400 BCE", description: "Considered Mesoamerica's earliest major civilization, laying cultural groundwork later built upon by the Maya and Aztec.", achievements: ["Colossal carved stone heads", "Early Mesoamerican calendar concepts", "Long-distance trade in jade and obsidian"] }
];

const CIVILIZATION_IMAGES_MAP = {
  "mali-empire": "https://upload.wikimedia.org/wikipedia/commons/4/46/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "songhai-empire": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Timbuktu-manuscripts-astronomy-mathematics.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "kingdom-of-ghana": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Kingdom_of_Ghana_%26_Trans-Saharan_Trade_about_11th_century.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "ancient-egypt": "https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "great-zimbabwe": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Great-zim-aerial-looking-West.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "kingdom-of-kongo": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Great_Zimbabwe_Closeup.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "roman-empire": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Colosseum_in_Rome-April_2007-1-_copie_2B.jpg/1280px-Colosseum_in_Rome-April_2007-1-_copie_2B.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  "byzantine-empire": "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "ancient-greece": "https://upload.wikimedia.org/wikipedia/commons/0/0d/Parthenon_from_south_slope.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "medieval-england": "https://upload.wikimedia.org/wikipedia/commons/3/38/Westminster_Abbey_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "han-dynasty": "https://upload.wikimedia.org/wikipedia/commons/2/2d/Great_Wall_of_China_at_Jinshanling-edit.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "tang-dynasty": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Dunhuang Mogao 17.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "mongol-empire": "https://upload.wikimedia.org/wikipedia/commons/3/35/YuanEmperorAlbumGenghisPortrait.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "mughal-empire": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Taj_Mahal_in_March_2004.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "ancient-china": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Great_Wall_of_China%2C_Badaling.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "maya": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Tikal_Temple_II.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "aztec": "https://upload.wikimedia.org/wikipedia/commons/1/11/Templo_Mayor_in_Mexico-Tenochtitlan_16th_century_%28illustration_1900%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "inca": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Machu_Picchu_Peru_100.jpg/1280px-Machu_Picchu_Peru_100.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  "olmec": "https://upload.wikimedia.org/wikipedia/commons/4/49/Olmec_Head.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original"
};

civilizations.forEach(item => {
  item.image = CIVILIZATION_IMAGES_MAP[item.id] || "https://upload.wikimedia.org/wikipedia/commons/4/46/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original";
  item.imageAlt = `Historical image of ${item.name}`;
});

function getCivilizations() {
  return civilizations;
}

/* ----------------------------------------------------------
   DATA: TIMELINE EVENTS
   ---------------------------------------------------------- */

const timelineEvents = [
  { id: "pyramids-giza", title: "The Great Pyramids of Giza built", date: "c. 2560 BCE", era: "Ancient", civilization: "Ancient Egypt", region: "Africa", description: "Egyptian pharaohs of the Fourth Dynasty complete the Great Pyramid complex at Giza as royal tombs and monuments to state power." },
  { id: "olmec-rise", title: "Olmec civilization emerges", date: "c. 1200 BCE", era: "Ancient", civilization: "Olmec", region: "Americas", description: "Mesoamerica's earliest major civilization rises along the Gulf Coast, producing colossal stone heads and early ceremonial centers." },
  { id: "confucius-teaching", title: "Confucius begins teaching", date: "c. 500 BCE", era: "Ancient", civilization: "Ancient China", region: "Asia", description: "Confucius travels through Chinese states sharing his philosophy of ethics and governance, later compiled by his followers." },
  { id: "founding-of-rome-republic", title: "Roman Republic established", date: "509 BCE", era: "Ancient", civilization: "Roman Empire", region: "Europe", description: "Rome overthrows its monarchy and establishes a republic governed by elected officials and the Senate." },
  { id: "alexander-conquests", title: "Alexander the Great's conquests", date: "336 – 323 BCE", era: "Classical", civilization: "Ancient Greece", region: "Europe", description: "Alexander of Macedon builds an empire stretching from Greece to India, spreading Hellenistic culture across the region." },
  { id: "qin-unification", title: "Qin Shi Huang unifies China", date: "221 BCE", era: "Classical", civilization: "Ancient China", region: "Asia", description: "The Qin state conquers its rivals, and Qin Shi Huang becomes China's first emperor, standardizing script, currency, and law." },
  { id: "punic-wars", title: "Hannibal crosses the Alps", date: "218 BCE", era: "Classical", civilization: "Roman Empire", region: "Europe", description: "Carthaginian general Hannibal leads his army over the Alps to invade Italy during the Second Punic War against Rome." },
  { id: "silk-road-opens", title: "Silk Road trade routes open", date: "c. 130 BCE", era: "Classical", civilization: "Han Dynasty", region: "Asia", description: "Trade networks connect Han China with Central Asia, the Middle East, and eventually Rome, exchanging silk, goods, and ideas." },
  { id: "fall-of-rome", title: "Fall of the Western Roman Empire", date: "476 CE", era: "Classical", civilization: "Roman Empire", region: "Europe", description: "The last Western Roman emperor is deposed, traditionally marking the end of the Western Roman Empire." },
  { id: "kingdom-of-ghana-rise", title: "Kingdom of Ghana grows powerful", date: "c. 700", era: "Medieval", civilization: "Kingdom of Ghana", region: "Africa", description: "The Kingdom of Ghana rises to prominence by taxing the trans-Saharan gold and salt trade." },
  { id: "charlemagne-crowned", title: "Charlemagne crowned emperor", date: "800", era: "Medieval", civilization: "Medieval England", region: "Europe", description: "Pope Leo III crowns Charlemagne Holy Roman Emperor, uniting much of Western Europe under Frankish rule." },
  { id: "great-zimbabwe-built", title: "Great Zimbabwe's stone city rises", date: "c. 1100", era: "Medieval", civilization: "Great Zimbabwe", region: "Africa", description: "Builders in Southern Africa construct the dry-stone walls of Great Zimbabwe, a hub of regional trade." },
  { id: "mali-empire-founded", title: "Sundiata Keita founds the Mali Empire", date: "c. 1235", era: "Medieval", civilization: "Mali Empire", region: "Africa", description: "Sundiata Keita unites the Mandinka clans and establishes the Mali Empire, which will dominate West African trade." },
  { id: "genghis-khan-unites-mongols", title: "Genghis Khan unites the Mongols", date: "1206", era: "Medieval", civilization: "Mongol Empire", region: "Asia", description: "Genghis Khan unites the Mongol tribes and begins campaigns that will create history's largest contiguous land empire." },
  { id: "magna-carta", title: "Magna Carta is sealed", date: "1215", era: "Medieval", civilization: "Medieval England", region: "Europe", description: "English barons force King John to accept the Magna Carta, limiting royal power and influencing constitutional law." },
  { id: "mansa-musa-pilgrimage", title: "Mansa Musa's pilgrimage to Mecca", date: "1324", era: "Medieval", civilization: "Mali Empire", region: "Africa", description: "Mansa Musa travels to Mecca with enormous quantities of gold, spreading Mali's fame across Africa, the Middle East, and Europe." },
  { id: "saladin-retakes-jerusalem", title: "Saladin recaptures Jerusalem", date: "1187", era: "Medieval", civilization: "Ancient Egypt", region: "Middle East", description: "Saladin's forces retake Jerusalem from Crusader control, a turning point in the Crusades." },
  { id: "byzantine-hagia-sophia", title: "Hagia Sophia completed", date: "537", era: "Medieval", civilization: "Byzantine Empire", region: "Europe", description: "Emperor Justinian I completes the Hagia Sophia in Constantinople, a landmark of Byzantine architecture." },
  { id: "songhai-rise", title: "Songhai Empire reaches its height", date: "c. 1493", era: "Early Modern", civilization: "Songhai Empire", region: "Africa", description: "Under Askia Muhammad, the Songhai Empire expands and Timbuktu flourishes as a center of Islamic scholarship." },
  { id: "columbus-voyage", title: "Columbus reaches the Americas", date: "1492", era: "Early Modern", civilization: "Aztec Empire", region: "Americas", description: "Christopher Columbus's voyage begins sustained contact between Europe and the Americas, reshaping both continents." },
  { id: "inca-empire-height", title: "Inca Empire reaches its height", date: "c. 1493", era: "Early Modern", civilization: "Inca Empire", region: "Americas", description: "Under Huayna Capac, the Inca Empire spans much of the Andes, linked by an extensive road network." },
  { id: "renaissance-florence", title: "The Renaissance flourishes in Florence", date: "c. 1450", era: "Early Modern", civilization: "Roman Empire", region: "Europe", description: "Artists and thinkers including Leonardo da Vinci drive a cultural rebirth centered on classical learning and art in Italy." },
  { id: "mughal-empire-founded", title: "Babur founds the Mughal Empire", date: "1526", era: "Early Modern", civilization: "Mughal Empire", region: "Asia", description: "Babur defeats the Delhi Sultanate at Panipat, founding the Mughal Empire in South Asia." },
  { id: "spanish-armada", title: "Defeat of the Spanish Armada", date: "1588", era: "Early Modern", civilization: "Medieval England", region: "Europe", description: "England repels the Spanish Armada under Elizabeth I, shifting the balance of naval power in Europe." },
  { id: "shaka-zulu-kingdom", title: "Shaka builds the Zulu Kingdom", date: "c. 1816", era: "Modern", civilization: "Great Zimbabwe", region: "Africa", description: "Shaka Zulu's military reforms transform a small chiefdom into the powerful Zulu Kingdom in southern Africa." },
  { id: "american-independence", title: "United States declares independence", date: "1776", era: "Modern", civilization: "Medieval England", region: "Americas", description: "Thirteen American colonies declare independence from Britain, beginning the American Revolutionary War." },
  { id: "french-revolution", title: "French Revolution begins", date: "1789", era: "Modern", civilization: "Roman Empire", region: "Europe", description: "Widespread unrest topples the French monarchy, ushering in years of political upheaval across Europe." },
  { id: "bolivar-independence", title: "Bolívar leads South American independence", date: "1819 – 1825", era: "Modern", civilization: "Inca Empire", region: "Americas", description: "Simón Bolívar leads campaigns that free much of South America from Spanish colonial rule." },
  { id: "harriet-tubman-railroad", title: "Harriet Tubman leads the Underground Railroad", date: "1850s", era: "Modern", civilization: "Medieval England", region: "Americas", description: "Harriet Tubman makes repeated journeys south to guide enslaved people to freedom via the Underground Railroad." },
  { id: "world-war-two-ends", title: "End of the Second World War", date: "1945", era: "Contemporary", civilization: "Roman Empire", region: "Europe", description: "The Second World War ends, reshaping global politics and leading to the founding of the United Nations." },
  { id: "african-independence-wave", title: "Wave of African independence", date: "1950s – 1960s", era: "Contemporary", civilization: "Mali Empire", region: "Africa", description: "Dozens of African nations gain independence from European colonial rule across two transformative decades." },
  { id: "fall-of-berlin-wall", title: "Fall of the Berlin Wall", date: "1989", era: "Contemporary", civilization: "Roman Empire", region: "Europe", description: "The Berlin Wall falls, symbolizing the end of the Cold War division between Eastern and Western Europe." }
];

const TIMELINE_EVENT_IMAGES = {
  "pyramids-giza": "https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "olmec-rise": "https://upload.wikimedia.org/wikipedia/commons/4/49/Olmec_Head.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "confucius-teaching": "https://upload.wikimedia.org/wikipedia/commons/8/84/Confucius_Tang_Dynasty.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "founding-of-rome-republic": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Colosseum_in_Rome-April_2007-1-_copie_2B.jpg/1280px-Colosseum_in_Rome-April_2007-1-_copie_2B.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  "alexander-conquests": "https://upload.wikimedia.org/wikipedia/commons/7/7d/Alexander_the_Great_mosaic.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "qin-unification": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Great_Wall_of_China%2C_Badaling.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "punic-wars": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Statue_of_Julius_Caesar_in_Turin.jpg/1280px-Statue_of_Julius_Caesar_in_Turin.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  "silk-road-opens": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Dunhuang Mogao 17.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "fall-of-rome": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Colosseum_in_Rome-April_2007-1-_copie_2B.jpg/1280px-Colosseum_in_Rome-April_2007-1-_copie_2B.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  "kingdom-of-ghana-rise": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Kingdom_of_Ghana_%26_Trans-Saharan_Trade_about_11th_century.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "charlemagne-crowned": "https://upload.wikimedia.org/wikipedia/commons/9/95/Charlemagne.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "great-zimbabwe-built": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Great-zim-aerial-looking-West.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "mali-empire-founded": "https://upload.wikimedia.org/wikipedia/commons/4/46/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "genghis-khan-unites-mongols": "https://upload.wikimedia.org/wikipedia/commons/3/35/YuanEmperorAlbumGenghisPortrait.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "magna-carta": "https://upload.wikimedia.org/wikipedia/commons/3/38/Westminster_Abbey_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "mansa-musa-pilgrimage": "https://upload.wikimedia.org/wikipedia/commons/4/46/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "saladin-retakes-jerusalem": "https://upload.wikimedia.org/wikipedia/commons/1/13/Saladin.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "byzantine-hagia-sophia": "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "songhai-rise": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Timbuktu-manuscripts-astronomy-mathematics.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "columbus-voyage": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/Columbus_Taking_Possession.jpg/1280px-Columbus_Taking_Possession.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  "inca-empire-height": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Machu_Picchu_Peru_100.jpg/1280px-Machu_Picchu_Peru_100.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  "renaissance-florence": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Leonardo_self.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "mughal-empire-founded": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Taj_Mahal_in_March_2004.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "spanish-armada": "https://upload.wikimedia.org/wikipedia/commons/5/52/Elizabeth_I_Red_Portrait.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "shaka-zulu-kingdom": "https://upload.wikimedia.org/wikipedia/commons/8/83/Shaka_Zulu.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "american-independence": "https://upload.wikimedia.org/wikipedia/commons/3/31/George_Washington_by_Gilbert_Stuart.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "french-revolution": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/La_Libert%C3%A9_guidant_le_peuple_-_Eug%C3%A8ne_Delacroix_-_Mus%C3%A9e_du_Louvre_Peintures_RF_129_-_apr%C3%A8s_restauration_2024.jpg/1280px-La_Libert%C3%A9_guidant_le_peuple_-_Eug%C3%A8ne_Delacroix_-_Mus%C3%A9e_du_Louvre_Peintures_RF_129_-_apr%C3%A8s_restauration_2024.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  "bolivar-independence": "https://upload.wikimedia.org/wikipedia/commons/2/25/Simon_Bolivar.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "harriet-tubman-railroad": "https://upload.wikimedia.org/wikipedia/commons/1/13/Harriet_Tubman.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "world-war-two-ends": "https://upload.wikimedia.org/wikipedia/commons/6/6d/World_War_II_1945.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "african-independence-wave": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Great_Zimbabwe_Closeup.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "fall-of-berlin-wall": "https://upload.wikimedia.org/wikipedia/commons/8/80/Berlin_Wall.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original"
};

timelineEvents.forEach(item => {
  item.image = TIMELINE_EVENT_IMAGES[item.id] || "https://upload.wikimedia.org/wikipedia/commons/4/46/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original";
  item.imageAlt = `Historical image related to ${item.title}`;
});

function getTimelineEvents() {
  return timelineEvents;
}

/* ----------------------------------------------------------
   DATA: EXPLORE ARTICLES
   ---------------------------------------------------------- */

const exploreArticles = [
  { id: "gold-of-mali", title: "The Gold Roads of Mali", category: "Trade & Economy", era: "Medieval", region: "Africa", description: "How the Mali Empire's control of gold and salt trade routes made it one of the richest realms on Earth.", keywords: ["Mali", "gold", "trade", "Mansa Musa", "West Africa"] },
  { id: "rise-of-rome", title: "From Village to Empire: The Rise of Rome", category: "Empires", era: "Classical", region: "Europe", description: "Tracing Rome's transformation from a small city-state into a Mediterranean-spanning empire.", keywords: ["Rome", "Roman Empire", "Republic", "expansion"] },
  { id: "egypt-nile", title: "Egypt and the Gift of the Nile", category: "Civilizations", era: "Ancient", region: "Africa", description: "How the Nile's floods shaped agriculture, religion, and statecraft in Ancient Egypt for three thousand years.", keywords: ["Egypt", "Nile", "pharaoh", "pyramids"] },
  { id: "mongol-conquest", title: "The Mongol Storm: Empire Without Borders", category: "Empires", era: "Medieval", region: "Asia", description: "How Genghis Khan and his successors built the largest contiguous land empire in history.", keywords: ["Mongol", "Genghis Khan", "conquest", "Silk Road"] },
  { id: "renaissance-rebirth", title: "The Renaissance: A Continent Reawakens", category: "Culture & Ideas", era: "Early Modern", region: "Europe", description: "How art, science, and classical learning converged in Italy to reshape European thought.", keywords: ["Renaissance", "Italy", "art", "Leonardo da Vinci", "Florence"] },
  { id: "songhai-scholars", title: "Timbuktu: A City of Scholars", category: "Culture & Ideas", era: "Medieval", region: "Africa", description: "Inside the Songhai Empire's Sankore University and the manuscripts that made Timbuktu legendary.", keywords: ["Songhai", "Timbuktu", "scholarship", "West Africa"] },
  { id: "silk-road-exchange", title: "The Silk Road: Threads Across Continents", category: "Trade & Economy", era: "Classical", region: "Asia", description: "How goods, religions, and ideas traveled between China, Central Asia, and the Mediterranean world.", keywords: ["Silk Road", "trade", "China", "exchange"] },
  { id: "inca-roads", title: "Roads Through the Clouds: The Inca Network", category: "Engineering", era: "Early Modern", region: "Americas", description: "The extraordinary road system that bound the Inca Empire together across the Andes mountains.", keywords: ["Inca", "Andes", "engineering", "roads"] },
  { id: "byzantine-survival", title: "Byzantium: Rome That Never Fell", category: "Empires", era: "Medieval", region: "Europe", description: "How Constantinople preserved and transformed Roman legacy for a thousand years after Rome's fall.", keywords: ["Byzantine Empire", "Constantinople", "Rome"] },
  { id: "aztec-capital", title: "Tenochtitlan: A City on Water", category: "Engineering", era: "Early Modern", region: "Americas", description: "Inside the engineering marvel of the Aztec capital, built on an island in Lake Texcoco.", keywords: ["Aztec", "Tenochtitlan", "engineering", "Mexico"] },
  { id: "zulu-military", title: "The Making of the Zulu Kingdom", category: "Empires", era: "Modern", region: "Africa", description: "How Shaka Zulu's military innovations forged one of Africa's most formidable kingdoms.", keywords: ["Zulu", "Shaka", "Southern Africa", "military"] },
  { id: "age-of-independence", title: "Breaking Empire: Latin America's Independence Era", category: "Revolutions", era: "Modern", region: "Americas", description: "How Bolívar and a generation of revolutionaries freed much of South America from colonial rule.", keywords: ["Bolivar", "independence", "South America", "revolution"] }
];

const EXPLORE_ARTICLE_IMAGES = {
  "gold-of-mali": "https://upload.wikimedia.org/wikipedia/commons/4/46/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "rise-of-rome": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Colosseum_in_Rome-April_2007-1-_copie_2B.jpg/1280px-Colosseum_in_Rome-April_2007-1-_copie_2B.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  "egypt-nile": "https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "mongol-conquest": "https://upload.wikimedia.org/wikipedia/commons/3/35/YuanEmperorAlbumGenghisPortrait.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "renaissance-rebirth": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Leonardo_self.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "songhai-scholars": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Timbuktu-manuscripts-astronomy-mathematics.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "silk-road-exchange": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Dunhuang Mogao 17.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "inca-roads": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Machu_Picchu_Peru_100.jpg/1280px-Machu_Picchu_Peru_100.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  "byzantine-survival": "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "aztec-capital": "https://upload.wikimedia.org/wikipedia/commons/1/11/Templo_Mayor_in_Mexico-Tenochtitlan_16th_century_%28illustration_1900%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "zulu-military": "https://upload.wikimedia.org/wikipedia/commons/8/83/Shaka_Zulu.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
  "age-of-independence": "https://upload.wikimedia.org/wikipedia/commons/2/25/Simon_Bolivar.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original"
};

exploreArticles.forEach(item => {
  item.image = EXPLORE_ARTICLE_IMAGES[item.id] || "https://upload.wikimedia.org/wikipedia/commons/4/46/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original";
  item.imageAlt = `Historical image related to ${item.title}`;
});

function getExploreArticles() {
  return exploreArticles;
}

function getUnifiedSearchIndex() {
  return [
    ...getExploreArticles().map(item => ({ ...item, type: "story", imageKey: item.id, label: "Article" })),
    ...getHistoricalFigures().map(item => ({ ...item, type: "figure", imageKey: item.id, label: "Figure" })),
    ...getCivilizations().map(item => ({ ...item, type: "civilization", imageKey: item.id, label: "Civilization" })),
    ...getTimelineEvents().map(item => ({ ...item, type: "event", imageKey: item.id, label: "Event" }))
  ];
}

/* ----------------------------------------------------------
   DATA: QUIZ QUESTIONS
   ---------------------------------------------------------- */

const quizQuestions = [
  { id: "q1", question: "Which West African ruler's 1324 pilgrimage to Mecca made his empire's wealth famous across the world?", options: ["Sundiata Keita", "Mansa Musa", "Askia Muhammad", "Shaka Zulu"], answer: 1 },
  { id: "q2", question: "The Great Pyramids of Giza were built during which civilization's height?", options: ["Roman Empire", "Byzantine Empire", "Ancient Egypt", "Mughal Empire"], answer: 2 },
  { id: "q3", question: "Who united the Mongol tribes and founded the Mongol Empire?", options: ["Kublai Khan", "Genghis Khan", "Akbar the Great", "Sun Tzu"], answer: 1 },
  { id: "q4", question: "Which document, sealed in 1215, limited the power of the English monarchy?", options: ["Magna Carta", "Code of Justinian", "Treaty of Tordesillas", "Twelve Tables"], answer: 0 },
  { id: "q5", question: "The Inca Empire was centered in which mountain range?", options: ["Alps", "Himalayas", "Andes", "Atlas"], answer: 2 },
  { id: "q6", question: "Which empire's capital, Timbuktu, became a renowned center of Islamic scholarship?", options: ["Aztec Empire", "Songhai Empire", "Ottoman Empire", "Han Dynasty"], answer: 1 },
  { id: "q7", question: "Who led the Continental Army and became the first President of the United States?", options: ["Simón Bolívar", "Napoleon Bonaparte", "George Washington", "Tecumseh"], answer: 2 },
  { id: "q8", question: "Which philosopher's teachings on ethics and governance shaped East Asian society for centuries?", options: ["Sun Tzu", "Confucius", "Ibn Khaldun", "Ashoka"], answer: 1 },
  { id: "q9", question: "The Renaissance polymath Leonardo da Vinci was based primarily in which country?", options: ["France", "Spain", "Italy", "England"], answer: 2 },
  { id: "q10", question: "Which queen resisted Portuguese colonization of Ndongo and Matamba for decades?", options: ["Cleopatra VII", "Queen Nzinga", "Hatshepsut", "Elizabeth I"], answer: 1 },
  { id: "q11", question: "The Silk Road primarily connected which two regions?", options: ["Europe and the Americas", "China and the Mediterranean world", "Africa and Australia", "India and Scandinavia"], answer: 1 },
  { id: "q12", question: "Which general led an army, including war elephants, across the Alps to challenge Rome?", options: ["Julius Caesar", "Alexander the Great", "Hannibal Barca", "Saladin"], answer: 2 }
];

function getQuizQuestions() {
  return quizQuestions;
}

/* ----------------------------------------------------------
   THEME (dark / light mode)
   ---------------------------------------------------------- */

const THEME_KEY = "chronicle-theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const toggles = document.querySelectorAll("[data-theme-toggle]");
  toggles.forEach(btn => {
    btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  });
}

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (e) {
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    /* localStorage unavailable — theme just won't persist */
  }
}

function initTheme() {
  const stored = getStoredTheme();
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  applyTheme(theme);

  document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      setStoredTheme(next);
    });
  });
}

/* ----------------------------------------------------------
   NAVIGATION (mobile menu + active link)
   ---------------------------------------------------------- */

function initNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.classList.toggle("nav-open", isOpen);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
        toggle.focus();
      }
    });
    document.addEventListener("click", event => {
      if (document.body.classList.contains("nav-open") &&
          !menu.contains(event.target) && !toggle.contains(event.target)) {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      }
    });

    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      });
    });
  }

  const currentPage = (document.body.getAttribute("data-page") || "").toLowerCase();
  document.querySelectorAll("[data-nav-menu] a[data-page]").forEach(link => {
    if (link.getAttribute("data-page").toLowerCase() === currentPage) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });
}

/* ----------------------------------------------------------
   FOOTER YEAR (kept static per spec, function retained for
   any page wanting a live year in the future)
   ---------------------------------------------------------- */

function initFooter() {
  const yearEl = document.querySelector("[data-current-year]");
  if (yearEl) {
    yearEl.textContent = "2026";
  }
}

/* ----------------------------------------------------------
   BOOT — runs on every page
   ---------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
  initFooter();

  const searchButton = document.querySelector("[data-header-search]");
  if (searchButton) {
    searchButton.addEventListener("click", () => {
      window.location.href = "explore.html";
    });
  }
});
