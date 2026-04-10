import { POKEMON_NAMES } from "./pokemon-names.js";
import { BDSP_OBTAIN_RAW } from "./bdsp-obtain-raw.js";
import { POKEDEX } from "./pokedex.js";
import { TEAM_METADATA } from "./team-metadata.js";
import { TRANSLATIONS } from "./translations.js";

const buildForm = document.querySelector("#build-form");
const matchupForm = document.querySelector("#matchup-form");
const buildInput = document.querySelector("#build-input");
const matchupInput = document.querySelector("#matchup-input");
const teamModeInput = document.querySelector("#team-mode");
const buildSuggestions = document.querySelector("#build-suggestions");
const matchupSuggestions = document.querySelector("#matchup-suggestions");
const buildOutput = document.querySelector("#build-output");
const matchupOutput = document.querySelector("#matchup-output");
const loadingTemplate = document.querySelector("#loading-template");

const BDSP_VERSION_GROUPS = new Set([
  "brilliant-diamond-and-shining-pearl",
  "diamond-pearl",
]);

const ALLOWED_LEARN_METHODS = new Set([
  "level-up",
  "machine",
  "tutor",
  "egg",
]);

const LEARN_METHOD_PRIORITY = {
  "level-up": 4,
  machine: 3,
  tutor: 2,
  egg: 1,
};

const VERSION_PRIORITY = {
  "brilliant-diamond-and-shining-pearl": 2,
  "diamond-pearl": 1,
};

const TYPE_LABELS = {
  normal: "一般",
  fire: "火",
  water: "水",
  electric: "電",
  grass: "草",
  ice: "冰",
  fighting: "格鬥",
  poison: "毒",
  ground: "地面",
  flying: "飛行",
  psychic: "超能力",
  bug: "蟲",
  rock: "岩石",
  ghost: "幽靈",
  dragon: "龍",
  dark: "惡",
  steel: "鋼",
  fairy: "妖精",
};

const STAT_ORDER = [
  { key: "hp", label: "HP" },
  { key: "attack", label: "攻" },
  { key: "defense", label: "防" },
  { key: "special-attack", label: "特攻" },
  { key: "special-defense", label: "特防" },
  { key: "speed", label: "速" },
];

const TYPE_COLORS = {
  normal: "#8d8d76",
  fire: "#dd6b32",
  water: "#3d87d9",
  electric: "#d9a612",
  grass: "#4d9d4b",
  ice: "#6da8b7",
  fighting: "#9f3a3a",
  poison: "#8d4ca7",
  ground: "#ad8a40",
  flying: "#6789d5",
  psychic: "#d74d7f",
  bug: "#889b1f",
  rock: "#9d8245",
  ghost: "#655993",
  dragon: "#4d67d4",
  dark: "#5c4a3d",
  steel: "#7a8da2",
  fairy: "#d58aba",
};

const TYPE_CHART = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ground: 2, flying: 2, dragon: 2, steel: 0.5, ice: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

const STATUS_MOVE_TAGS = {
  swordsdance: { label: "物攻強化", group: "setup" },
  dragondance: { label: "攻速強化", group: "setup" },
  nastyplot: { label: "特攻強化", group: "setup" },
  calmmind: { label: "特攻特防強化", group: "setup" },
  bulkup: { label: "攻防強化", group: "setup" },
  shellsmash: { label: "爆發強化", group: "setup" },
  quiverdance: { label: "全能強化", group: "setup" },
  agility: { label: "速度強化", group: "setup" },
  rockpolish: { label: "速度強化", group: "setup" },
  curse: { label: "耐久/攻擊強化", group: "setup" },
  recover: { label: "穩定回復", group: "recovery" },
  roost: { label: "穩定回復", group: "recovery" },
  softboiled: { label: "穩定回復", group: "recovery" },
  slackoff: { label: "穩定回復", group: "recovery" },
  milkdrink: { label: "穩定回復", group: "recovery" },
  synthesis: { label: "穩定回復", group: "recovery" },
  moonlight: { label: "穩定回復", group: "recovery" },
  morningsun: { label: "穩定回復", group: "recovery" },
  wish: { label: "續航支援", group: "recovery" },
  rest: { label: "完全回復", group: "recovery" },
  stealthrock: { label: "撒岩", group: "utility" },
  spikes: { label: "撒菱", group: "utility" },
  toxicspikes: { label: "毒菱", group: "utility" },
  defog: { label: "清場", group: "utility" },
  rapidspin: { label: "清場", group: "utility" },
  thunderwave: { label: "麻痺控速", group: "utility" },
  willowisp: { label: "灼傷干擾", group: "utility" },
  toxic: { label: "劇毒消耗", group: "utility" },
  leechseed: { label: "寄生續航", group: "utility" },
  taunt: { label: "封鎖變化招", group: "utility" },
};

const BAD_MOVE_SLUGS = new Set([
  "assist",
  "attract",
  "bide",
  "copycat",
  "counter",
  "doubleteam",
  "frustration",
  "hiddenpower",
  "mimic",
  "mirrorcoat",
  "metronome",
  "naturalgift",
  "return",
  "selfdestruct",
  "sketch",
  "sleeptalk",
  "snore",
  "transform",
]);

const NATURE_NOTES = {
  Adamant: "加攻擊、降特攻，適合物攻主力。",
  Jolly: "加速度、降特攻，適合需要搶速的物攻手。",
  Modest: "加特攻、降攻擊，適合特攻主力。",
  Timid: "加速度、降攻擊，適合搶速型特攻手。",
  Impish: "加防禦、降特攻，適合物理耐久。",
  Careful: "加特防、降特攻，適合特耐干擾。",
  Bold: "加防禦、降攻擊，適合特攻耐久型。",
  Calm: "加特防、降攻擊，適合特耐輔助型。",
  Mild: "加特攻、降防禦，適合偏特攻混攻。",
  Naive: "加速度、降特防，適合混攻或需要速度。",
};

const TEAM_MODE_LABELS = {
  "non-legendary": "非神獸",
  legendary: "神獸",
  story: "通關向",
  competitive: "對戰向",
};

const SPECIAL_NFE_EXCEPTIONS = new Set([
  113, // Chansey
  123, // Scyther
  233, // Porygon2
  356, // Dusclops
]);

const LOCATION_TRANSLATIONS = {
  "Acuity Lakefront": "睿智湖畔",
  "Big Bluff Cavern": "大岩壁洞窟",
  "Bogsunk Cavern": "沼澤洞窟",
  "Canalave City": "水脈市",
  "Celestic Town": "神和鎮",
  "Dazzling Cave": "耀光洞窟",
  "Eterna City": "百代市",
  "Eterna Forest": "百代森林",
  "Fountainspring Cave": "泉水洞窟",
  "Fuego Ironworks": "火力發電廠",
  "Glacial Cavern": "冰河洞窟",
  "Grassland Cave": "草原洞窟",
  "Great Marsh": "大濕原",
  "Icy Cave": "冰凍洞窟",
  "Iron Island": "鋼鐵島",
  "Lake Acuity": "睿智湖",
  "Lake Valor": "立志湖",
  "Lake Verity": "心齊湖",
  "Lost Tower": "迷失塔",
  "Mt. Coronet": "天冠山",
  "Old Chateau": "森之洋館",
  "Oreburgh Gate": "黑金門",
  "Oreburgh Mine": "黑金礦坑",
  "Pastoria City": "濕原市",
  "Pokémon League": "寶可夢聯盟",
  "Ravaged Path": "荒蕪小道",
  "Resort Area": "度假區",
  "Riverbank Cave": "河岸洞窟",
  "Rocky Cave": "岩石洞窟",
  "Ruin Maniac Tunnel": "遺跡狂隧道",
  "Sandsear Cave": "熱砂洞窟",
  "Sendoff Spring": "送泉",
  "Snowpoint Temple": "雪峰神殿",
  "Solaceon Ruins": "隨意遺跡",
  "Spacious Cave": "寬敞洞窟",
  "Stargleam Cavern": "星光洞窟",
  "Stark Mountain": "嚴酷山",
  "Still-Water Cavern": "靜水洞窟",
  "Sunlit Cavern": "向陽洞窟",
  "Sunyshore City": "濱海市",
  "Swampy Cave": "沼澤洞窟",
  "Trophy Garden": "獎章庭園",
  "Turnback Cave": "回轉洞窟",
  "Twinleaf Town": "雙葉鎮",
  "Typhlo Cavern": "爆炎洞窟",
  "Valley Windworks": "谷間發電廠",
  "Valor Lakefront": "立志湖畔",
  "Victory Road": "冠軍之路",
  "Volcanic Cave": "火山洞窟",
  "Wayward Cave": "迷幻洞窟",
  "Whiteout Cave": "暴雪洞窟",
};

const NAME_INDEX = buildNameIndex(POKEMON_NAMES);
const SEARCH_ENTRIES = buildSearchEntries(POKEMON_NAMES);
const MOVE_TRANSLATIONS = buildTranslationIndex(TRANSLATIONS.moves);
const ITEM_TRANSLATIONS = buildTranslationIndex(TRANSLATIONS.items);
const ABILITY_TRANSLATIONS = buildTranslationIndex(TRANSLATIONS.abilities);
const MOVE_CACHE = new Map();
const JSON_CACHE = new Map();
let smogonPromise;

buildForm.addEventListener("submit", handleBuildSubmit);
matchupForm.addEventListener("submit", handleMatchupSubmit);
buildOutput.addEventListener("click", handleTeamCardClick);
attachAutocomplete(buildInput, buildSuggestions);
attachAutocomplete(matchupInput, matchupSuggestions);

async function handleBuildSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const rawValue = formData.get("pokemon");
  const teamMode = String(formData.get("teamMode") || teamModeInput?.value || "non-legendary");
  const entry = resolvePokemon(rawValue);

  if (!entry) {
    renderError(buildOutput, "找不到這隻寶可夢，請試試英文、繁中、簡中名稱，或全國圖鑑編號。", "例如：烈咬陸鯊 / Garchomp / #445");
    return;
  }

  renderLoading(buildOutput, "正在整理推薦配招...");

  try {
    await loadBuildForEntry(entry, teamMode);
  } catch (error) {
    console.error(error);
    renderError(buildOutput, "資料讀取失敗，請確認網路是否正常。", error.message);
  }
}

async function handleMatchupSubmit(event) {
  event.preventDefault();

  const rawValue = new FormData(event.currentTarget).get("opponent");
  const entry = resolvePokemon(rawValue);

  if (!entry) {
    renderError(matchupOutput, "找不到這隻寶可夢，請試試英文、繁中、簡中名稱，或全國圖鑑編號。", "例如：波克基斯 / Togekiss / #468");
    return;
  }

  renderLoading(matchupOutput, "正在計算屬性倍率...");

  try {
    const bundle = await fetchPokemonBundle(entry.id);
    renderMatchupResult(entry, bundle.pokemon);
  } catch (error) {
    console.error(error);
    renderError(matchupOutput, "倍率資料讀取失敗，請確認網路是否正常。", error.message);
  }
}

async function handleTeamCardClick(event) {
  const card = event.target.closest("[data-team-id]");
  if (!card) {
    return;
  }

  const entry = POKEMON_NAMES.find((item) => item.id === Number(card.dataset.teamId));
  if (!entry) {
    return;
  }

  const teamMode = teamModeInput?.value || "non-legendary";
  buildInput.value = entry.zhHant;
  renderLoading(buildOutput, `正在切換到 ${entry.zhHant} 的詳細資訊...`);

  try {
    await loadBuildForEntry(entry, teamMode);
    buildForm.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error(error);
    renderError(buildOutput, "切換詳細資訊失敗，請稍後再試。", error.message);
  }
}

async function loadBuildForEntry(entry, teamMode) {
  const bundle = await fetchPokemonBundle(entry.id);
  const recommendation = await getRecommendation(entry, bundle.pokemon);
  const evolution = buildEvolutionSummary(entry.id, bundle.evolutionChain);
  renderBuildResult(entry, bundle.pokemon, recommendation, evolution, teamMode);
}

function resolvePokemon(rawValue) {
  const value = String(rawValue || "").trim();

  if (!value) {
    return null;
  }

  const numeric = value.replace(/^#/, "");
  if (/^\d+$/.test(numeric)) {
    const id = Number(numeric);
    return POKEMON_NAMES.find((entry) => entry.id === id) || null;
  }

  const normalized = normalizeName(value);
  return NAME_INDEX.get(normalized) || null;
}

function buildNameIndex(entries) {
  const index = new Map();

  for (const entry of entries) {
    const aliases = new Set([
      entry.english,
      entry.zhHans,
      entry.zhHant,
      String(entry.id),
      `#${entry.id}`,
    ]);

    if (entry.english === "Nidoran♀") {
      aliases.add("nidoran-f");
      aliases.add("nidoran female");
      aliases.add("尼多蘭");
    }

    if (entry.english === "Nidoran♂") {
      aliases.add("nidoran-m");
      aliases.add("nidoran male");
      aliases.add("尼多朗");
    }

    for (const alias of aliases) {
      index.set(normalizeName(alias), entry);
    }
  }

  return index;
}

function buildSearchEntries(entries) {
  return entries.map((entry) => {
    const aliases = [entry.zhHant, entry.zhHans, entry.english, String(entry.id), `#${entry.id}`];
    return {
      entry,
      aliases,
      normalizedAliases: aliases.map((alias) => normalizeName(alias)),
    };
  });
}

function getPokemonNameByEnglish(englishName) {
  return POKEMON_NAMES.find((entry) => entry.english === englishName)?.zhHant || englishName;
}

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/♀/g, "f")
    .replace(/♂/g, "m")
    .replace(/[\.\-\s'’:]/g, "")
    .replace(/é/g, "e");
}

function attachAutocomplete(input, container) {
  let activeIndex = -1;
  let currentMatches = [];

  const render = (matches, nextActiveIndex = matches.length ? 0 : -1) => {
    currentMatches = matches;
    activeIndex = nextActiveIndex;
    container.innerHTML = matches
      .map(
        (match, index) => `
          <button type="button" class="suggestion-item${index === activeIndex ? " is-active" : ""}" data-id="${match.id}">
            <img class="suggestion-artwork" src="${getArtworkUrl(match.id)}" alt="${match.zhHant}" loading="lazy" />
            <span class="suggestion-body">
              <span class="suggestion-name">${match.zhHant}</span>
              <span class="suggestion-meta">#${match.id} / ${match.english}</span>
            </span>
          </button>
        `
      )
      .join("");
  };

  const update = () => {
    const value = input.value.trim();
    if (!value) {
      container.innerHTML = "";
      currentMatches = [];
      activeIndex = -1;
      return;
    }

    render(getAutocompleteMatches(value));
  };

  input.addEventListener("input", update);
  input.addEventListener("focus", update);
  input.addEventListener("keydown", (event) => {
    if (!currentMatches.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % currentMatches.length;
      render(currentMatches, activeIndex);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = (activeIndex - 1 + currentMatches.length) % currentMatches.length;
      render(currentMatches, activeIndex);
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && !resolvePokemon(input.value)) {
      event.preventDefault();
      applySuggestion(input, container, currentMatches[activeIndex]);
    }

    if (event.key === "Escape") {
      container.innerHTML = "";
      currentMatches = [];
      activeIndex = -1;
    }
  });

  container.addEventListener("mousedown", (event) => {
    const button = event.target.closest(".suggestion-item");
    if (!button) {
      return;
    }

    const match = currentMatches.find((entry) => entry.id === Number(button.dataset.id));
    if (match) {
      event.preventDefault();
      applySuggestion(input, container, match);
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target === input || container.contains(event.target)) {
      return;
    }
    container.innerHTML = "";
    currentMatches = [];
    activeIndex = -1;
  });
}

function applySuggestion(input, container, match) {
  input.value = match.zhHant;
  container.innerHTML = "";
  input.dispatchEvent(new Event("change"));
}

function getAutocompleteMatches(query, limit = 6) {
  const normalized = normalizeName(query);
  if (!normalized) {
    return [];
  }

  return SEARCH_ENTRIES
    .map(({ entry, normalizedAliases, aliases }) => {
      let score = -1;

      normalizedAliases.forEach((alias, index) => {
        if (alias === normalized) {
          score = Math.max(score, 120 - index);
        } else if (alias.startsWith(normalized)) {
          score = Math.max(score, 95 - index);
        } else if (alias.includes(normalized)) {
          score = Math.max(score, 70 - index);
        }
      });

      const rawStartsWith =
        entry.zhHant.startsWith(query) ||
        entry.zhHans.startsWith(query) ||
        entry.english.toLowerCase().startsWith(query.toLowerCase());
      if (rawStartsWith) {
        score += 6;
      }

      return score > 0 ? { ...entry, score, aliases } : null;
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || left.id - right.id)
    .slice(0, limit);
}

function buildTranslationIndex(table) {
  return new Map(
    Object.entries(table).map(([english, chinese]) => [normalizeName(english), chinese])
  );
}

function getEnglishResourceName(resource) {
  return resource.names?.find((name) => name.language.name === "en")?.name || toTitleCase(resource.name);
}

function translateWithIndex(index, value, fallback = value) {
  if (!value) {
    return fallback;
  }

  return index.get(normalizeName(value)) || fallback;
}

function translateMoveLabel(value) {
  return translateWithIndex(MOVE_TRANSLATIONS, value, value);
}

function translateItemLabel(value) {
  return translateWithIndex(ITEM_TRANSLATIONS, value, value);
}

function translateAbilityLabel(value) {
  return translateWithIndex(ABILITY_TRANSLATIONS, value, value);
}

function translateNatureLabel(value) {
  return TRANSLATIONS.natures[value] || value;
}

function normalizeTypeLabel(value) {
  return String(value || "").trim().toLowerCase();
}

function getDefendingMultiplier(attackType, defendingTypes) {
  return defendingTypes.reduce(
    (total, defendingType) => total * (TYPE_CHART[attackType]?.[defendingType] || 1),
    1
  );
}

function getArtworkUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function getBaseStatTotal(baseStats = {}) {
  return Object.values(baseStats).reduce((sum, value) => sum + Number(value || 0), 0);
}

function getBdspObtainRows(id) {
  return BDSP_OBTAIN_RAW[String(id)] || [];
}

function isUnavailableObtainText(text) {
  if (!text) {
    return true;
  }

  return text.toLowerCase().includes("trade/migrate from another game");
}

function getVersionHintFromRows(rows) {
  const hasBd = rows.some((row) => row.head.includes("Brilliant Diamond"));
  const hasSp = rows.some((row) => row.head.includes("Shining Pearl"));

  if (hasBd && hasSp) {
    const bdOnly = rows.some((row) => row.head.includes("Brilliant Diamond") && !row.head.includes("Shining Pearl"));
    const spOnly = rows.some((row) => row.head.includes("Shining Pearl") && !row.head.includes("Brilliant Diamond"));
    if (bdOnly || spOnly) {
      return "兩版皆有相關取得方式，但部分方式有版本差異。";
    }
    return "《晶燦鑽石》與《明亮珍珠》都能取得。";
  }

  if (hasBd) {
    return "只在《晶燦鑽石》能取得。";
  }

  if (hasSp) {
    return "只在《明亮珍珠》能取得。";
  }

  return null;
}

function getObtainCategory(body) {
  if (!body) {
    return "未知";
  }
  if (body.startsWith("Evolve ")) {
    return "進化取得";
  }
  if (body.startsWith("Breed ")) {
    return "育蛋取得";
  }
  if (/receive|gift|choose/i.test(body)) {
    return "劇情贈送";
  }
  const hasUnderground = /(Cavern|Cave)/.test(body);
  const hasWild = /(Route|City|Town|Forest|Marsh|Garden|Road|Island|Lake|Temple|Tower|Gate|Mine|Mountain|Ruins|Spring|Area|Chateau|Works)/.test(body);
  if (hasUnderground && hasWild) {
    return "野外捕捉 / 大地下洞窟";
  }
  if (hasUnderground) {
    return "大地下洞窟";
  }
  if (isUnavailableObtainText(body)) {
    return "版本外取得";
  }
  return "野外捕捉";
}

function translateLocationToken(token, context = {}) {
  if (/^Route \d+$/.test(token)) {
    return token.replace(/^Route (\d+)$/, "$1號道路");
  }
  if (/^\d+$/.test(token) && context.lastPrefix === "Route") {
    return `${token}號道路`;
  }
  if (LOCATION_TRANSLATIONS[token]) {
    return LOCATION_TRANSLATIONS[token];
  }
  return token;
}

function translateSpeciesList(text) {
  return text
    .split("/")
    .map((name) => getPokemonNameByEnglish(name.trim()))
    .join(" / ");
}

function translateObtainBody(body) {
  if (!body) {
    return body;
  }
  if (body === "Trade/migrate from another game") {
    return "需透過與其他作品交換／移入，本作無法直接取得。";
  }
  if (body.startsWith("Evolve ")) {
    return `進化 ${translateSpeciesList(body.replace(/^Evolve /, ""))}`;
  }
  if (body.startsWith("Breed ")) {
    return `育蛋取得（親代：${translateSpeciesList(body.replace(/^Breed /, ""))}）`;
  }

  const parts = body.split(",").map((part) => part.trim()).filter(Boolean);
  let lastPrefix = null;
  const translated = parts.map((part) => {
    if (part.startsWith("Route ")) {
      lastPrefix = "Route";
    } else if (!/^\d+$/.test(part)) {
      lastPrefix = null;
    }
    return translateLocationToken(part, { lastPrefix });
  });
  return translated.join("、");
}

function formatObtainRows(rows) {
  return rows
    .map((row) => {
      const versions = row.head.includes("Brilliant Diamond") && row.head.includes("Shining Pearl")
        ? "晶鑽 / 明珠"
        : row.head.includes("Brilliant Diamond")
          ? "晶鑽限定"
          : row.head.includes("Shining Pearl")
            ? "明珠限定"
            : "版本未明";
      return {
        versions,
        category: getObtainCategory(row.body),
        body: translateObtainBody(row.body),
        rawBody: row.body,
      };
    });
}

function buildBdspObtainInfo(entry, evolution) {
  const directRows = getBdspObtainRows(entry.id);
  const directAvailableRows = directRows.filter((row) => !isUnavailableObtainText(row.body));
  const versionHint = getVersionHintFromRows(directRows);

  if (directAvailableRows.length) {
    return {
      title: "晶燦鑽石取得方式",
      rows: formatObtainRows(directAvailableRows),
      versionHint,
      source: "self",
    };
  }

  if (evolution.previous?.id) {
    const previousRows = getBdspObtainRows(evolution.previous.id).filter((row) => !isUnavailableObtainText(row.body));
    if (previousRows.length) {
      return {
        title: "晶燦鑽石取得方式",
        rows: formatObtainRows(previousRows),
        versionHint: `${getVersionHintFromRows(previousRows) || ""} 可先取得 ${evolution.previous.name} 再進化成 ${entry.zhHant}。`.trim(),
        source: "previous",
        previousName: evolution.previous.name,
      };
    }
  }

  return {
    title: "晶燦鑽石取得方式",
    rows: [],
    versionHint: versionHint || "目前沒有找到可在《晶燦鑽石》中直接取得的資料。",
    source: "missing",
  };
}

function getStatSeries(baseStats) {
  return STAT_ORDER.map((stat) => ({
    ...stat,
    value: Number(baseStats[stat.key] || 0),
  }));
}

function polarToPoint(centerX, centerY, radius, angleDegrees) {
  const angle = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

function renderStatChart(baseStats) {
  const stats = getStatSeries(baseStats);
  const maxValue = 180;
  const size = 260;
  const center = size / 2;
  const radius = 84;
  const layers = [0.25, 0.5, 0.75, 1];

  const grid = layers
    .map((ratio) => {
      const points = stats
        .map((_, index) => {
          const point = polarToPoint(center, center, radius * ratio, (360 / stats.length) * index);
          return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
        })
        .join(" ");
      return `<polygon points="${points}" class="stat-grid-polygon" />`;
    })
    .join("");

  const axes = stats
    .map((_, index) => {
      const point = polarToPoint(center, center, radius, (360 / stats.length) * index);
      return `<line x1="${center}" y1="${center}" x2="${point.x.toFixed(1)}" y2="${point.y.toFixed(1)}" class="stat-axis-line" />`;
    })
    .join("");

  const shapePoints = stats
    .map((stat, index) => {
      const point = polarToPoint(
        center,
        center,
        radius * Math.min(stat.value / maxValue, 1),
        (360 / stats.length) * index
      );
      return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    })
    .join(" ");

  const labels = stats
    .map((stat, index) => {
      const point = polarToPoint(center, center, radius + 28, (360 / stats.length) * index);
      return `
        <text x="${point.x.toFixed(1)}" y="${point.y.toFixed(1)}" class="stat-chart-label" text-anchor="middle">
          ${stat.label} ${stat.value}
        </text>
      `;
    })
    .join("");

  const bars = stats
    .map(
      (stat) => `
        <div class="stat-bar-row">
          <span class="stat-bar-label">${stat.label}</span>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" style="width:${Math.min((stat.value / maxValue) * 100, 100)}%"></div>
          </div>
          <span class="stat-bar-value">${stat.value}</span>
        </div>
      `
    )
    .join("");

  return `
    <div class="stat-visual">
      <div class="stat-radar-card">
        <svg class="stat-radar" viewBox="0 0 ${size} ${size}" role="img" aria-label="六圍能力分布圖">
          ${grid}
          ${axes}
          <polygon points="${shapePoints}" class="stat-data-fill" />
          <polyline points="${shapePoints}" class="stat-data-line" />
          ${labels}
        </svg>
      </div>
      <div class="stat-bars">${bars}</div>
    </div>
  `;
}

function isLegendaryId(id) {
  return Boolean(TEAM_METADATA[String(id)]?.isLegendary || TEAM_METADATA[String(id)]?.isMythical);
}

function isFinalEvolutionId(id) {
  return Boolean(TEAM_METADATA[String(id)]?.isFinal);
}

function isSpecialNfeExceptionId(id) {
  return SPECIAL_NFE_EXCEPTIONS.has(id);
}

function buildCompleteTeam(entry, pokemon, mode) {
  const anchor = hydrateTeamCandidate(entry.id, {
    label: "核心",
    locked: true,
  });
  const team = [anchor];

  while (team.length < 6) {
    const weaknessProfile = buildTeamWeaknessProfile(team);
    const nextMember = pickBestTeamMember(team, weaknessProfile, mode);
    if (!nextMember) {
      break;
    }
    team.push(nextMember);
  }

  return {
    members: team,
    weaknessProfile: buildTeamWeaknessProfile(team).filter((item) => item.pressure > 0).slice(0, 4),
  };
}

function hydrateTeamCandidate(id, overrides = {}) {
  const baseEntry = POKEDEX.find((candidate) => candidate.id === id);
  if (!baseEntry) {
    return null;
  }

  const types = baseEntry.types.map(normalizeTypeLabel);
  return {
    ...baseEntry,
    types,
    baseTotal: getBaseStatTotal(baseEntry.base),
    role: inferBaseRole(baseEntry.base),
    isFinal: isFinalEvolutionId(baseEntry.id),
    isSpecialException: isSpecialNfeExceptionId(baseEntry.id),
    label: overrides.label || "隊友",
    locked: Boolean(overrides.locked),
    reasons: overrides.reasons || [],
  };
}

function inferBaseRole(base) {
  const stats = {
    hp: base.HP || 0,
    attack: base.Attack || 0,
    defense: base.Defense || 0,
    "special-attack": base["Sp. Attack"] || 0,
    "special-defense": base["Sp. Defense"] || 0,
    speed: base.Speed || 0,
  };
  return inferRole(stats);
}

function buildTeamWeaknessProfile(team) {
  return Object.keys(TYPE_LABELS)
    .map((attackType) => {
      const multipliers = team.map((member) => getDefendingMultiplier(attackType, member.types));
      const weakCount = multipliers.filter((multiplier) => multiplier > 1).length;
      const resistCount = multipliers.filter((multiplier) => multiplier < 1).length;
      const immunityCount = multipliers.filter((multiplier) => multiplier === 0).length;
      const pressure = multipliers.reduce((sum, multiplier) => {
        if (multiplier > 1) {
          return sum + (multiplier - 1);
        }
        if (multiplier === 0) {
          return sum - 1.2;
        }
        if (multiplier < 1) {
          return sum - (1 - multiplier) * 0.7;
        }
        return sum;
      }, 0);
      return {
        type: attackType,
        multipliers,
        weakCount,
        resistCount,
        immunityCount,
        pressure,
      };
    })
    .sort((left, right) => right.pressure - left.pressure);
}

function pickBestTeamMember(team, weaknessProfile, mode) {
  const selectedIds = new Set(team.map((member) => member.id));
  const roleCounts = team.reduce((counts, member) => {
    const key = `${member.role.offense}-${member.role.style}`;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const existingTypes = team.flatMap((member) => member.types);
  const candidates = POKEDEX
    .filter((candidate) => !selectedIds.has(candidate.id))
    .filter((candidate) => isFinalEvolutionId(candidate.id) || isSpecialNfeExceptionId(candidate.id))
    .filter((candidate) => isCandidateAllowedInMode(candidate, mode))
    .map((candidate) => scoreTeamMember(candidate, weaknessProfile, existingTypes, roleCounts, mode));

  return candidates.sort((left, right) => right.score - left.score || right.baseTotal - left.baseTotal)[0];
}

function isCandidateAllowedInMode(candidate, mode) {
  const candidateLegendary = isLegendaryId(candidate.id);

  if (mode === "legendary") {
    return candidateLegendary;
  }

  if (mode === "non-legendary" || mode === "story" || mode === "competitive") {
    if (candidateLegendary) {
      return false;
    }
  }

  return true;
}

function scoreTeamMember(candidate, weaknessProfile, existingTypes, roleCounts, mode) {
  const hydrated = hydrateTeamCandidate(candidate.id);
  const resistances = [];
  const punishOptions = [];
  let score = 0;

  weaknessProfile.slice(0, 6).forEach((weakness) => {
    const multiplier = getDefendingMultiplier(weakness.type, hydrated.types);
    const weight = Math.max(1, weakness.pressure + weakness.weakCount * 0.6);

    if (multiplier === 0) {
      score += 9 * weight;
      resistances.push(`${TYPE_LABELS[weakness.type]}免疫`);
    } else if (multiplier === 0.25) {
      score += 7 * weight;
      resistances.push(`${TYPE_LABELS[weakness.type]} 0.25x`);
    } else if (multiplier === 0.5) {
      score += 5.5 * weight;
      resistances.push(`${TYPE_LABELS[weakness.type]} 0.5x`);
    } else if (multiplier === 2) {
      score -= 3.5 * weight;
    } else if (multiplier === 4) {
      score -= 6 * weight;
    }

    const pressureType = hydrated.types.find(
      (candidateType) => (TYPE_CHART[candidateType]?.[weakness.type] || 1) > 1
    );
    if (pressureType) {
      score += 1.8;
      punishOptions.push(`${TYPE_LABELS[pressureType]}打點可壓制${TYPE_LABELS[weakness.type]}`);
    }
  });

  const uniqueTypes = hydrated.types.filter((type) => !existingTypes.includes(type)).length;
  const sharedTypes = hydrated.types.filter((type) => existingTypes.includes(type)).length;
  score += uniqueTypes * 2.2;
  score -= sharedTypes * 0.7;

  const roleKey = `${hydrated.role.offense}-${hydrated.role.style}`;
  if (!roleCounts[roleKey]) {
    score += 3.5;
  } else {
    score -= roleCounts[roleKey] * 0.6;
  }

  if (mode === "story") {
    score += Math.max(0, (hydrated.baseTotal - 330) / 52);
    score += hydrated.isFinal ? 5.5 : -3.5;
    score += hydrated.isSpecialException ? 2.5 : 0;
    if (hydrated.role.style === "bulky" || hydrated.role.style === "balanced") {
      score += 2.4;
    }
    if (hydrated.base.Speed >= 110 || hydrated.base["Sp. Attack"] >= 135 || hydrated.base.Attack >= 135) {
      score -= 1.3;
    }
  } else if (mode === "competitive") {
    score += Math.max(0, (hydrated.baseTotal - 350) / 34);
    score += hydrated.isFinal ? 6 : -8;
    score += hydrated.isSpecialException ? 5.5 : 0;
    if (hydrated.role.style === "sweeper") {
      score += 2;
    }
    if (hydrated.role.offense !== "mixed") {
      score += 1;
    }
  } else if (mode === "legendary") {
    score += Math.max(0, (hydrated.baseTotal - 420) / 26);
    score += hydrated.isFinal ? 4 : -5;
    score += hydrated.isSpecialException ? 1 : 0;
  } else {
    score += Math.max(0, (hydrated.baseTotal - 360) / 42);
    score += hydrated.isFinal ? 6 : -6;
    score += hydrated.isSpecialException ? 4 : 0;
  }

  hydrated.score = score;
  hydrated.reasons = [
    hydrated.isFinal
      ? "最終進化型態，面板與實戰穩定度更好"
      : hydrated.isSpecialException
        ? "特例保留：雖非最終進化，但屬於少數值得考慮的特殊補位"
        : "非最終進化，僅因補位條件特別合適才入選",
    resistances.length ? `可補 ${resistances.slice(0, 2).join("、")}` : null,
    punishOptions.length ? punishOptions.slice(0, 2).join("、") : null,
    `${hydrated.role.label} / 種族值總和 ${hydrated.baseTotal}`,
  ].filter(Boolean);
  return hydrated;
}

async function fetchPokemonBundle(id) {
  const pokemon = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const evolutionChain = pokemon.species?.url
    ? await fetchEvolutionChain(id)
    : null;

  return { pokemon, evolutionChain };
}

async function fetchEvolutionChain(id) {
  const species = await fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  if (!species.evolution_chain?.url) {
    return null;
  }

  return fetchJson(species.evolution_chain.url);
}

async function fetchJson(url) {
  if (JSON_CACHE.has(url)) {
    return JSON_CACHE.get(url);
  }

  const promise = fetch(url).then(async (response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    return response.json();
  });

  JSON_CACHE.set(url, promise);
  return promise;
}

async function getRecommendation(entry, pokemon) {
  const smogonSet = await getSmogonRecommendation(entry.english);
  if (smogonSet) {
    return smogonSet;
  }

  return getHeuristicRecommendation(pokemon);
}

async function getSmogonRecommendation(englishName) {
  if (!smogonPromise) {
    smogonPromise = fetchJson("https://pkmn.github.io/smogon/data/sets/gen8bdspou.json");
  }

  const sets = await smogonPromise;
  const candidate = sets[englishName];
  if (!candidate) {
    return null;
  }

  const [setName, setData] = Object.entries(candidate)[0];
  const rawNature = Array.isArray(setData.nature) ? setData.nature[0] : setData.nature || "未提供";
  return {
    source: "smogon",
    title: setName,
    nature: translateNatureLabel(rawNature),
    natureKey: rawNature,
    note: "使用 Smogon 的 BDSP OU 現成推薦，適合當作快速配招起點。",
    extra: {
      ability: formatMaybeList(setData.ability, translateAbilityLabel),
      item: formatMaybeList(setData.item, translateItemLabel),
      evs: formatEvs(setData.evs),
    },
    moves: (setData.moves || []).map((slot, index) => ({
      name: formatMoveSlot(slot),
      reason: `第 ${index + 1} 招式格`,
      type: null,
      learnMethod: "Smogon 建議",
    })),
  };
}

function formatMaybeList(value, formatter = (entry) => entry) {
  if (!value) {
    return "未提供";
  }

  return Array.isArray(value) ? value.map((entry) => formatter(entry)).join(" / ") : formatter(value);
}

function formatMoveSlot(slot) {
  if (Array.isArray(slot)) {
    return slot.map((entry) => translateMoveLabel(entry)).join(" / ");
  }

  return translateMoveLabel(slot);
}

function formatEvs(evs) {
  if (!evs) {
    return "未提供";
  }

  const list = Array.isArray(evs) ? evs : [evs];
  return list
    .map((spread) =>
      Object.entries(spread)
        .map(([stat, value]) => `${value} ${stat.toUpperCase()}`)
        .join(" / ")
    )
    .join(" 或 ");
}

async function getHeuristicRecommendation(pokemon) {
  const stats = getStatMap(pokemon.stats);
  const role = inferRole(stats);
  const movePool = await getBdspMovePool(pokemon);
  const pickedMoves = pickMoves(movePool, pokemon.types.map((type) => type.type.name), role, stats);
  const nature = chooseNature(role, stats);

  return {
    source: "heuristic",
    title: role.label,
    nature: translateNatureLabel(nature),
    natureKey: nature,
    note: "這份推薦來自 BDSP 可學招式與種族值判斷，適合單機推圖或臨時組隊時快速參考。",
    extra: {
      ability: pokemon.abilities.find((ability) => !ability.is_hidden)?.ability?.name
        ? translateAbilityLabel(toTitleCase(pokemon.abilities.find((ability) => !ability.is_hidden).ability.name))
        : "依你的特性配置",
      item: "可依隊伍需求補上屬性強化道具、剩飯或命玉",
      evs: role.evs,
    },
    moves: pickedMoves,
  };
}

async function getBdspMovePool(pokemon) {
  const deduped = new Map();

  for (const moveEntry of pokemon.moves) {
    const details = moveEntry.version_group_details
      .filter((detail) => BDSP_VERSION_GROUPS.has(detail.version_group.name))
      .filter((detail) => ALLOWED_LEARN_METHODS.has(detail.move_learn_method.name));

    if (!details.length) {
      continue;
    }

    const best = [...details].sort(compareMoveDetail)[0];
    const key = moveEntry.move.name;

    if (!deduped.has(key) || compareMoveDetail(best, deduped.get(key).detail) < 0) {
      deduped.set(key, { url: moveEntry.move.url, detail: best });
    }
  }

  const entries = await Promise.all(
    [...deduped.entries()].map(async ([name, payload]) => {
      const move = await fetchMove(payload.url);
      return {
        name,
        move,
        detail: payload.detail,
      };
    })
  );

  return entries.filter(({ move }) => !BAD_MOVE_SLUGS.has(normalizeName(move.name)));
}

function compareMoveDetail(a, b) {
  const versionDelta = (VERSION_PRIORITY[b.version_group.name] || 0) - (VERSION_PRIORITY[a.version_group.name] || 0);
  if (versionDelta !== 0) {
    return versionDelta;
  }

  const methodDelta = (LEARN_METHOD_PRIORITY[b.move_learn_method.name] || 0) - (LEARN_METHOD_PRIORITY[a.move_learn_method.name] || 0);
  if (methodDelta !== 0) {
    return methodDelta;
  }

  return (b.level_learned_at || 0) - (a.level_learned_at || 0);
}

async function fetchMove(url) {
  if (MOVE_CACHE.has(url)) {
    return MOVE_CACHE.get(url);
  }

  const move = await fetchJson(url);
  MOVE_CACHE.set(url, move);
  return move;
}

function getStatMap(stats) {
  const output = {};
  for (const stat of stats) {
    output[stat.stat.name] = stat.base_stat;
  }
  return output;
}

function inferRole(stats) {
  const attack = stats.attack || 0;
  const specialAttack = stats["special-attack"] || 0;
  const defense = stats.defense || 0;
  const specialDefense = stats["special-defense"] || 0;
  const speed = stats.speed || 0;
  const hp = stats.hp || 0;
  const bestOffense = Math.max(attack, specialAttack);
  const bulk = hp + defense + specialDefense;

  let offense = "mixed";
  if (attack >= specialAttack + 18) {
    offense = "physical";
  } else if (specialAttack >= attack + 18) {
    offense = "special";
  }

  let style = "balanced";
  if (bestOffense >= 110 || (bestOffense >= 95 && speed >= 95)) {
    style = "sweeper";
  } else if (bulk >= 255 && speed <= 85) {
    style = "bulky";
  } else if (bulk >= 270 && bestOffense < 100) {
    style = "support";
  }

  const labelMap = {
    physical: {
      sweeper: "物攻高速輸出",
      bulky: "物攻耐久型",
      support: "物攻干擾型",
      balanced: "物攻平衡型",
    },
    special: {
      sweeper: "特攻高速輸出",
      bulky: "特攻耐久型",
      support: "特攻輔助型",
      balanced: "特攻平衡型",
    },
    mixed: {
      sweeper: "混攻壓制型",
      bulky: "混攻耐久型",
      support: "混攻工具型",
      balanced: "混攻平衡型",
    },
  };

  const evLabel =
    style === "bulky" || style === "support"
      ? defense >= specialDefense
        ? "252 HP / 252 Def / 4 Spe"
        : "252 HP / 252 SpD / 4 Spe"
      : offense === "physical"
        ? "252 Atk / 252 Spe / 4 HP"
        : offense === "special"
          ? "252 SpA / 252 Spe / 4 HP"
          : "252 Spe / 128 Atk / 128 SpA";

  return {
    offense,
    style,
    label: labelMap[offense][style],
    evs: evLabel,
  };
}

function chooseNature(role, stats) {
  const speed = stats.speed || 0;
  const defense = stats.defense || 0;
  const specialDefense = stats["special-defense"] || 0;

  if (role.style === "bulky" || role.style === "support") {
    if (role.offense === "physical") {
      return defense >= specialDefense ? "Impish" : "Careful";
    }

    if (role.offense === "special") {
      return defense >= specialDefense ? "Bold" : "Calm";
    }

    return defense >= specialDefense ? "Bold" : "Calm";
  }

  if (role.offense === "physical") {
    return speed >= 85 ? "Jolly" : "Adamant";
  }

  if (role.offense === "special") {
    return speed >= 85 ? "Timid" : "Modest";
  }

  return speed >= 90 ? "Naive" : "Mild";
}

function pickMoves(movePool, ownTypes, role, stats) {
  const typeNames = new Set(ownTypes);
  const damagingMoves = movePool
    .filter(({ move }) => move.damage_class.name !== "status")
    .map((entry) => ({
      ...entry,
      score: scoreDamagingMove(entry.move, typeNames, role),
    }))
    .sort((left, right) => right.score - left.score);

  const statusMoves = movePool.filter(({ move }) => move.damage_class.name === "status");
  const setupMoves = statusMoves
    .filter(({ move }) => getTaggedStatusMove(move.name, "setup"))
    .sort((left, right) => scoreStatusMove(right.move.name, role) - scoreStatusMove(left.move.name, role));
  const recoveryMoves = statusMoves
    .filter(({ move }) => getTaggedStatusMove(move.name, "recovery"))
    .sort((left, right) => scoreStatusMove(right.move.name, role) - scoreStatusMove(left.move.name, role));
  const utilityMoves = statusMoves
    .filter(({ move }) => getTaggedStatusMove(move.name, "utility"))
    .sort((left, right) => scoreStatusMove(right.move.name, role) - scoreStatusMove(left.move.name, role));

  const selected = [];
  const seen = new Set();

  const addMove = (entry, reason) => {
    if (!entry || seen.has(entry.move.name)) {
      return;
    }

    selected.push({
      name: translateMoveLabel(getEnglishResourceName(entry.move)),
      type: entry.move.type.name,
      reason,
      learnMethod: describeLearnMethod(entry.detail),
    });
    seen.add(entry.move.name);
  };

  const bestStab = damagingMoves.filter((entry) => typeNames.has(entry.move.type.name));
  const bestCoverage = damagingMoves.filter((entry) => !typeNames.has(entry.move.type.name));

  addMove(bestStab[0], "主力 STAB 輸出");

  if (role.style !== "bulky" && role.style !== "support") {
    const bestSetup = setupMoves[0];
    if (bestSetup && Math.max(stats.attack || 0, stats["special-attack"] || 0) >= 85) {
      addMove(bestSetup, STATUS_MOVE_TAGS[normalizeName(bestSetup.move.name)].label);
    }
    addMove(bestStab[1], "第二主攻招式");
    addMove(bestCoverage[0], "補盲打點");
    addMove(bestCoverage[1] || damagingMoves[0], "擴充打點");
  } else {
    addMove(recoveryMoves[0], recoveryMoves[0] ? STATUS_MOVE_TAGS[normalizeName(recoveryMoves[0].move.name)].label : "續航");
    addMove(utilityMoves[0], utilityMoves[0] ? STATUS_MOVE_TAGS[normalizeName(utilityMoves[0].move.name)].label : "功能招式");
    addMove(bestCoverage[0], "補盲打點");
    addMove(setupMoves[0], setupMoves[0] ? STATUS_MOVE_TAGS[normalizeName(setupMoves[0].move.name)].label : "功能招式");
  }

  for (const entry of damagingMoves) {
    if (selected.length >= 4) {
      break;
    }
    addMove(entry, typeNames.has(entry.move.type.name) ? "穩定輸出" : "補盲打點");
  }

  return selected.slice(0, 4);
}

function getTaggedStatusMove(moveName, group) {
  const info = STATUS_MOVE_TAGS[normalizeName(moveName)];
  return info && info.group === group;
}

function scoreStatusMove(moveName, role) {
  const normalized = normalizeName(moveName);
  const info = STATUS_MOVE_TAGS[normalized];

  if (!info) {
    return 0;
  }

  if (info.group === "setup") {
    return role.style === "sweeper" || role.style === "balanced" ? 10 : 4;
  }

  if (info.group === "recovery") {
    return role.style === "bulky" || role.style === "support" ? 12 : 6;
  }

  return role.style === "bulky" || role.style === "support" ? 11 : 5;
}

function scoreDamagingMove(move, ownTypes, role) {
  const accuracy = move.accuracy ?? 100;
  const power = move.power ?? 0;
  let score = power * (accuracy / 100);

  if (ownTypes.has(move.type.name)) {
    score *= 1.4;
  }

  if (move.priority > 0) {
    score += 18;
  }

  if (move.damage_class.name === role.offense) {
    score *= 1.18;
  }

  if (role.offense === "mixed") {
    score *= 1.05;
  }

  if (power < 55 && move.priority <= 0) {
    score *= 0.72;
  }

  return score;
}

function buildEvolutionSummary(id, chain) {
  if (!chain?.chain) {
    return {
      previous: null,
      next: [],
      note: "沒有找到進化鍊資料。",
    };
  }

  const match = findEvolutionNode(chain.chain, id, null, []);
  if (!match) {
    return {
      previous: null,
      next: [],
      note: "沒有找到這隻寶可夢在進化鍊中的位置。",
    };
  }

  return {
    previous: match.parent
      ? {
          id: match.parent.id,
          name: getLocalizedSpeciesName(match.parent.id),
          details: formatEvolutionDetails(match.detailsFromParent),
        }
      : null,
    next: match.node.evolves_to.map((nextNode) => ({
      name: getLocalizedSpeciesName(extractId(nextNode.species.url)),
      details: formatEvolutionDetails(nextNode.evolution_details),
    })),
    note:
      !match.parent && match.node.evolves_to.length === 0
        ? "這隻寶可夢沒有前後進化。"
        : null,
  };
}

function findEvolutionNode(node, targetId, parent, detailsFromParent) {
  const currentId = extractId(node.species.url);
  if (currentId === targetId) {
    return {
      node,
      parent,
      detailsFromParent,
    };
  }

  for (const child of node.evolves_to) {
    const found = findEvolutionNode(child, targetId, { id: currentId }, child.evolution_details);
    if (found) {
      return found;
    }
  }

  return null;
}

function extractId(url) {
  return Number(String(url).split("/").filter(Boolean).pop());
}

function formatEvolutionDetails(detailsList) {
  if (!detailsList || !detailsList.length) {
    return "特殊條件或無額外限制";
  }

  return detailsList.map(formatEvolutionDetail).join(" 或 ");
}

function formatEvolutionDetail(detail) {
  const parts = [];

  if (detail.trigger?.name === "level-up") {
    parts.push("升級");
  } else if (detail.trigger?.name === "use-item") {
    parts.push("使用道具");
  } else if (detail.trigger?.name === "trade") {
    parts.push("交換");
  }

  if (detail.min_level) {
    parts.push(`達到 Lv.${detail.min_level}`);
  }
  if (detail.item?.name) {
    parts.push(`使用 ${translateItemLabel(toTitleCase(detail.item.name))}`);
  }
  if (detail.held_item?.name) {
    parts.push(`攜帶 ${translateItemLabel(toTitleCase(detail.held_item.name))}`);
  }
  if (detail.time_of_day) {
    parts.push(detail.time_of_day === "day" ? "白天" : detail.time_of_day === "night" ? "夜晚" : detail.time_of_day);
  }
  if (detail.known_move?.name) {
    parts.push(`學會 ${translateMoveLabel(toTitleCase(detail.known_move.name))}`);
  }
  if (detail.known_move_type?.name) {
    parts.push(`學會 ${TYPE_LABELS[detail.known_move_type.name] || detail.known_move_type.name} 屬性招式`);
  }
  if (detail.location?.name) {
    parts.push(`地點：${toTitleCase(detail.location.name)}`);
  }
  if (detail.min_happiness) {
    parts.push(`親密度至少 ${detail.min_happiness}`);
  }
  if (detail.min_affection) {
    parts.push(`友好度至少 ${detail.min_affection}`);
  }
  if (detail.min_beauty) {
    parts.push(`美麗度至少 ${detail.min_beauty}`);
  }
  if (detail.gender === 1) {
    parts.push("雌性限定");
  }
  if (detail.gender === 2) {
    parts.push("雄性限定");
  }
  if (detail.party_species?.name) {
    parts.push(`同行隊伍需有 ${getEvolutionSpeciesLabel(detail.party_species)}`);
  }
  if (detail.party_type?.name) {
    parts.push(`同行隊伍需有 ${TYPE_LABELS[detail.party_type.name] || detail.party_type.name} 屬性寶可夢`);
  }
  if (detail.trade_species?.name) {
    parts.push(`與 ${getEvolutionSpeciesLabel(detail.trade_species)} 交換`);
  }
  if (detail.relative_physical_stats === 1) {
    parts.push("攻擊高於防禦");
  }
  if (detail.relative_physical_stats === 0) {
    parts.push("攻擊等於防禦");
  }
  if (detail.relative_physical_stats === -1) {
    parts.push("攻擊低於防禦");
  }
  if (detail.needs_overworld_rain) {
    parts.push("地圖下雨中");
  }
  if (detail.turn_upside_down) {
    parts.push("主機倒置");
  }

  return parts.length ? parts.join(" / ") : "特殊條件進化";
}

function renderBuildResult(entry, pokemon, recommendation, evolution, teamMode) {
  const artworkUrl = getArtworkUrl(entry.id);
  const completeTeam = buildCompleteTeam(entry, pokemon, teamMode);
  const selectedModeLabel = TEAM_MODE_LABELS[teamMode] || TEAM_MODE_LABELS["non-legendary"];
  const baseStats = getStatMap(pokemon.stats);
  const baseStatTotal = getBaseStatTotal(baseStats);
  const statChart = renderStatChart(baseStats);
  const obtainInfo = buildBdspObtainInfo(entry, evolution);
  const modeNotice =
    teamMode === "non-legendary" && isLegendaryId(entry.id)
      ? "你目前核心是神獸，系統已改用非神獸隊友幫你補滿其餘位置。"
      : teamMode === "legendary" && !isLegendaryId(entry.id)
        ? "你目前核心不是神獸，系統已改用神獸隊友補滿其餘位置。"
        : teamMode === "story"
          ? "通關向會偏向耐打、容錯高、泛用性好的配置。"
          : teamMode === "competitive"
            ? "對戰向會偏向高種族值、屬性補位與角色分工。"
            : null;
  const evolutionPolicyNotice = "隊友預設只會選最終進化；少數特例僅保留像吉利蛋、飛天螳螂、保護家、夜巨人這類常見特殊補位。";
  const typeBadges = pokemon.types
    .sort((left, right) => left.slot - right.slot)
    .map((slot) => renderTypeBadge(slot.type.name))
    .join("");

  const infoCards = [
    { title: "推薦性格", copy: `${recommendation.nature} - ${NATURE_NOTES[recommendation.natureKey] || "依這隻寶可夢的能力配置推薦。"}` },
    { title: "推薦來源", copy: recommendation.source === "smogon" ? `Smogon BDSP OU / ${recommendation.title}` : `啟發式推薦 / ${recommendation.title}` },
    { title: "能力或道具", copy: `特性：${recommendation.extra.ability}<br>道具：${recommendation.extra.item}` },
    { title: "努力值參考", copy: recommendation.extra.evs },
    { title: "總族值", copy: `${baseStatTotal}（HP ${baseStats.hp} / 攻 ${baseStats.attack} / 防 ${baseStats.defense} / 特攻 ${baseStats["special-attack"]} / 特防 ${baseStats["special-defense"]} / 速 ${baseStats.speed}）` },
  ]
    .map(
      (card) => `
        <div class="info-card">
          <span class="info-title">${card.title}</span>
          <div class="info-copy">${card.copy}</div>
        </div>
      `
    )
    .join("");

  const moveCards = recommendation.moves.length
    ? recommendation.moves
        .map(
          (move) => `
            <div class="move-card">
              <div class="type-badges">
                ${move.type ? renderTypeBadge(move.type) : '<span class="chip">建議招式</span>'}
              </div>
              <span class="move-title">${move.name}</span>
              <div class="move-sub">${move.reason}<br>${move.learnMethod}</div>
            </div>
          `
        )
        .join("")
    : `<div class="info-card"><span class="info-title">暫時沒有抓到合適招式</span><div class="info-copy">這隻寶可夢在 BDSP 的可學招式資料不足，建議手動補上同屬性主攻招。</div></div>`;

  const evolutionCards = [
    evolution.previous
      ? `
        <div class="info-card">
          <span class="info-title">前一階</span>
          <div class="info-copy">${evolution.previous.name}<br>${evolution.previous.details}</div>
        </div>
      `
      : `
        <div class="info-card">
          <span class="info-title">前一階</span>
          <div class="info-copy">這隻寶可夢已經是進化鍊起點。</div>
        </div>
      `,
    evolution.next.length
      ? evolution.next
          .map(
            (next) => `
              <div class="info-card">
                <span class="info-title">下一階 -> ${next.name}</span>
                <div class="info-copy">${next.details}</div>
              </div>
            `
          )
          .join("")
      : `
        <div class="info-card">
          <span class="info-title">下一階</span>
          <div class="info-copy">${evolution.note || "這隻寶可夢沒有後續進化。"}</div>
        </div>
      `,
  ].join("");

  const obtainRows = obtainInfo.rows.length
    ? obtainInfo.rows
        .map(
          (row) => `
            <div class="info-card">
              <span class="info-title">${row.category} <span class="small-note">(${row.versions})</span></span>
              <div class="info-copy">${row.body}</div>
            </div>
          `
        )
        .join("")
    : `
      <div class="info-card">
        <span class="info-title">${obtainInfo.title}</span>
        <div class="info-copy">${obtainInfo.versionHint}</div>
      </div>
    `;

  const weaknessSummary = completeTeam.weaknessProfile.length
    ? completeTeam.weaknessProfile
        .map((weakness) => `<span class="chip">${TYPE_LABELS[weakness.type]}壓力 ${weakness.pressure.toFixed(1)}</span>`)
        .join("")
    : '<span class="chip">隊伍屬性分布穩定</span>';

  const teamCards = completeTeam.members
    .map(
      (candidate, index) => `
        <button type="button" class="team-card team-card-button${candidate.locked ? " team-card-current" : ""}" data-team-id="${candidate.id}">
          <img class="team-card-artwork" src="${getArtworkUrl(candidate.id)}" alt="${candidate.zhHant}" loading="lazy" />
          <div class="team-card-body">
            <div class="team-card-head">
              <strong>${index + 1}. ${candidate.zhHant}</strong>
              <span class="small-note">#${candidate.id} / ${candidate.english}</span>
            </div>
            <div class="type-badges">${candidate.types.map(renderTypeBadge).join("")}</div>
            <p class="move-sub">${[candidate.label, ...candidate.reasons].join("<br>")}</p>
          </div>
        </button>
      `
    )
    .join("");

  buildOutput.className = "result-card";
  buildOutput.innerHTML = `
    <div class="result-head">
      <div>
        <p class="section-label">Build Result</p>
        <h3>${entry.zhHant} <span class="small-note">/ ${entry.english}</span></h3>
        <p class="meta-line">${recommendation.note}</p>
      </div>
      <div class="result-side">
        <img class="pokemon-artwork" src="${artworkUrl}" alt="${entry.zhHant}" loading="lazy" />
        <div class="dex-id">National Dex #${entry.id}</div>
        <div class="type-badges">${typeBadges}</div>
      </div>
    </div>

    <section class="section">
      <p class="section-label">Nature & Core Info</p>
      <div class="evo-grid">${infoCards}</div>
    </section>

    <section class="section">
      <p class="section-label">Base Stats Chart</p>
      ${statChart}
    </section>

    <section class="section">
      <p class="section-label">Recommended Moves</p>
      <div class="moves-grid">${moveCards}</div>
    </section>

    <section class="section">
      <p class="section-label">Evolution</p>
      <div class="evo-grid">${evolutionCards}</div>
    </section>

    <section class="section">
      <p class="section-label">Obtain In Brilliant Diamond</p>
      ${obtainInfo.versionHint ? `<p class="meta-line">${obtainInfo.versionHint}</p>` : ""}
      <div class="evo-grid">${obtainRows}</div>
    </section>

    <section class="section">
      <p class="section-label">Complete Team (6)</p>
      <div class="multiplier-groups"><span class="chip">模式：${selectedModeLabel}</span></div>
      ${modeNotice ? `<p class="meta-line">${modeNotice}</p>` : ""}
      <p class="meta-line">${evolutionPolicyNotice}</p>
      <div class="multiplier-groups">${weaknessSummary}</div>
      <div class="team-grid">${teamCards}</div>
    </section>
  `;
}

function renderMatchupResult(entry, pokemon) {
  const artworkUrl = getArtworkUrl(entry.id);
  const baseStats = getStatMap(pokemon.stats);
  const baseStatTotal = getBaseStatTotal(baseStats);
  const statChart = renderStatChart(baseStats);
  const defendingTypes = pokemon.types.sort((left, right) => left.slot - right.slot).map((slot) => slot.type.name);
  const multipliers = Object.keys(TYPE_LABELS)
    .map((attackType) => ({
      type: attackType,
      multiplier: defendingTypes.reduce((total, defendingType) => total * (TYPE_CHART[attackType][defendingType] || 1), 1),
    }))
    .sort((left, right) => right.multiplier - left.multiplier || left.type.localeCompare(right.type));

  const groups = [4, 2, 1, 0.5, 0.25, 0].filter((value) => multipliers.some((entryItem) => entryItem.multiplier === value));
  const summary = groups
    .map((value) => {
      const labels = multipliers
        .filter((entryItem) => entryItem.multiplier === value)
        .map((entryItem) => TYPE_LABELS[entryItem.type])
        .join("、");
      return `<span class="chip">${value}x：${labels}</span>`;
    })
    .join("");

  const table = multipliers
    .map(
      (row) => `
        <div class="multiplier-row">
          <div class="type-badges">${renderTypeBadge(row.type)}<strong>${TYPE_LABELS[row.type]} 屬性招式</strong></div>
          <span class="multiplier-value">${row.multiplier}x</span>
        </div>
      `
    )
    .join("");

  matchupOutput.className = "result-card";
  matchupOutput.innerHTML = `
    <div class="result-head">
      <div>
        <p class="section-label">Matchup Result</p>
        <h3>${entry.zhHant} <span class="small-note">/ ${entry.english}</span></h3>
        <p class="meta-line">對手屬性：${defendingTypes.map((type) => TYPE_LABELS[type]).join(" / ")}</p>
        <p class="meta-line">總族值：${baseStatTotal}</p>
      </div>
      <div class="result-side">
        <img class="pokemon-artwork" src="${artworkUrl}" alt="${entry.zhHant}" loading="lazy" />
        <div class="dex-id">National Dex #${entry.id}</div>
        <div class="type-badges">${defendingTypes.map(renderTypeBadge).join("")}</div>
      </div>
    </div>

    <section class="section">
      <p class="section-label">Base Stats Chart</p>
      ${statChart}
    </section>

    <section class="section">
      <p class="section-label">Quick Summary</p>
      <div class="multiplier-groups">${summary}</div>
    </section>

    <section class="section">
      <p class="section-label">All Attack Types</p>
      <div class="multiplier-table">${table}</div>
    </section>
  `;
}

function renderTypeBadge(typeName) {
  return `<span class="type-badge" style="background:${TYPE_COLORS[typeName]}">${TYPE_LABELS[typeName]}</span>`;
}

function renderLoading(target, message) {
  target.className = "result-card empty-state";
  target.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.append(loadingTemplate.content.cloneNode(true));
  const text = document.createElement("p");
  text.className = "meta-line";
  text.textContent = message;
  wrapper.append(text);
  target.append(wrapper);
}

function renderError(target, title, detail) {
  target.className = "result-card error-state";
  target.innerHTML = `
    <div>
      <p><strong>${title}</strong></p>
      <p class="meta-line">${detail}</p>
    </div>
  `;
}

function describeLearnMethod(detail) {
  const method = detail.move_learn_method.name;
  if (method === "level-up") {
    return detail.level_learned_at
      ? `BDSP 等級招式 / Lv.${detail.level_learned_at}`
      : "BDSP 等級招式";
  }
  if (method === "machine") {
    return "BDSP 招式機";
  }
  if (method === "tutor") {
    return "BDSP 教學招式";
  }
  if (method === "egg") {
    return "BDSP 遺傳招式";
  }
  return "BDSP 可學招式";
}

function getLocalizedSpeciesName(id) {
  return POKEMON_NAMES.find((entry) => entry.id === id)?.zhHant || `#${id}`;
}

function getEvolutionSpeciesLabel(species) {
  if (species?.url) {
    return getLocalizedSpeciesName(extractId(species.url));
  }

  return toTitleCase(species?.name || "");
}

function toTitleCase(value) {
  const overrides = {
    hp: "HP",
    spa: "SpA",
    spd: "SpD",
    spe: "Spe",
  };

  return String(value || "")
    .split("-")
    .map((part) => overrides[part] || part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
