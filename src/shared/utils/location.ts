import type { ICountry, IState, ICity } from "country-state-city";
import { Country, State, City } from "country-state-city";

export interface LocationOption {
  value: string;
  label: string;
  nameEn: string;
  nameAr?: string;
  flag?: string;
}

const DISPLAY_NAMES_AR =
  typeof Intl !== "undefined"
    ? new Intl.DisplayNames(["ar"], { type: "region" })
    : null;

const DISPLAY_NAMES_EN =
  typeof Intl !== "undefined"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

/**
 * Top prioritized MENA / Arab countries to show at the top of the country picker.
 */
const PRIORITY_COUNTRY_CODES = [
  "EG", // Egypt
  "SA", // Saudi Arabia
  "AE", // UAE
  "KW", // Kuwait
  "QA", // Qatar
  "BH", // Bahrain
  "OM", // Oman
  "JO", // Jordan
  "LB", // Lebanon
  "IQ", // Iraq
  "PS", // Palestine
  "MA", // Morocco
  "DZ", // Algeria
  "TN", // Tunisia
  "LY", // Libya
  "SD", // Sudan
  "SY", // Syria
  "YE", // Yemen
  "MR", // Mauritania
  "US", // United States
  "GB", // United Kingdom
  "CA", // Canada
  "DE", // Germany
  "FR", // France
  "TR", // Turkey
];

const LEGACY_COUNTRY_MAP: Record<string, string> = {
  egypt: "EG",
  uae: "AE",
  emirates: "AE",
  saudi: "SA",
  "saudi arabia": "SA",
  jordan: "JO",
  morocco: "MA",
  kuwait: "KW",
  qatar: "QA",
  algeria: "DZ",
  tunisia: "TN",
  lebanon: "LB",
  oman: "OM",
  bahrain: "BH",
  iraq: "IQ",
  palestine: "PS",
  syria: "SY",
  yemen: "YE",
  sudan: "SD",
  libya: "LY",
};

const ARABIC_STATE_NAMES: Record<string, Record<string, string> | undefined> = {
  AE: {
    AZ: "أبو ظبي",
    AJ: "عجمان",
    DU: "دبي",
    FU: "الفجيرة",
    RK: "رأس الخيمة",
    SH: "الشارقة",
    UQ: "أم القيوين",
  },
  EG: {
    C: "القاهرة",
    ALX: "الإسكندرية",
    GZ: "الجيزة",
    AST: "أسيوط",
    DK: "الدقهلية",
    SHR: "الشرقية",
    GH: "الغربية",
    KB: "القليوبية",
    MNF: "المنوفية",
    BH: "البحيرة",
    KFS: "كفر الشيخ",
    DT: "دمياط",
    PTS: "بورسعيد",
    IS: "الإسماعيلية",
    SUZ: "السويس",
    SIN: "شمال سيناء",
    JS: "جنوب سيناء",
    BNS: "بني سويف",
    FYM: "الفيوم",
    MN: "المنيا",
    SHG: "سوهاج",
    KN: "قنا",
    LX: "الأقصر",
    ASN: "أسوان",
    BA: "البحر الأحمر",
    WAD: "الوادي الجديد",
    MT: "مطروح",
  },
  SA: {
    "01": "الرياض",
    "02": "مكة المكرمة",
    "03": "المنطقة الشرقية",
    "04": "المدينة المنورة",
    "05": "القصيم",
    "06": "حائل",
    "07": "تبوك",
    "08": "الحدود الشمالية",
    "09": "جازان",
    "10": "نجران",
    "11": "الباحة",
    "12": "الجوف",
    "14": "عسير",
  },
  JO: {
    AM: "عَمّان",
    AJ: "عجلون",
    AQ: "العقبة",
    BA: "البلقاء",
    IR: "إربد",
    JA: "جرش",
    KA: "الكرك",
    MA: "المفرق",
    MD: "مادبا",
    MN: "معان",
    TA: "الطفيلة",
    AZ: "الزرقاء",
  },
  KW: {
    AH: "الأحمدي",
    FA: "الفروانية",
    JA: "الجهراء",
    KU: "العاصمة (الكويت)",
    HA: "حولي",
    MU: "مبارك الكبير",
  },
  QA: {
    DA: "الدوحة",
    KH: "الخور",
    WA: "الوكرة",
    RA: "الريان",
    MS: "الشمال",
    ZA: "الظعاين",
    US: "أم صلال",
    SH: "الشحانية",
  },
  BH: {
    "13": "العاصمة",
    "14": "الجنوبية",
    "15": "المحرق",
    "17": "الشمالية",
  },
  OM: {
    MA: "مسقط",
    ZU: "ظفار",
    MU: "مسندم",
    BU: "البريمي",
    DA: "الداخلية",
    BS: "شمال الباطنة",
    BA: "الباطنة",
    BJ: "جنوب الباطنة",
    SS: "شمال الشرقية",
    SH: "الشرقية",
    SJ: "جنوب الشرقية",
    ZA: "الظاهرة",
    WU: "الوسطى",
  },
};

const ARABIC_CITY_NAMES: Record<string, string> = {
  // Egypt
  Cairo: "القاهرة",
  "New Cairo": "القاهرة الجديدة",
  "Nasr City": "مدينة نصر",
  Dokki: "الدقي",
  Ḩalwān: "حلوان",
  Helwan: "حلوان",
  Alexandria: "الإسكندرية",
  "Borg El Arab": "برج العرب",
  Giza: "الجيزة",
  "Madinat Sittah Uktubar": "السادس من أكتوبر",
  "6th of October": "السادس من أكتوبر",
  Asyut: "أسيوط",
  Assiut: "أسيوط",
  Dayrūţ: "ديروط",
  Dairut: "ديروط",
  Manfalūţ: "منفلوط",
  Manfalut: "منفلوط",
  Mansoura: "المنصورة",
  "Al Manşūrah": "المنصورة",
  Tanta: "طنطا",
  "Ţanţā": "طنطا",
  Ismailia: "الإسماعيلية",
  "Al Ismā‘īlīyah": "الإسماعيلية",
  Suez: "السويس",
  "As Suways": "السويس",
  "Port Said": "بورسعيد",
  "Būr Sa‘īd": "بورسعيد",
  Luxor: "الأقصر",
  "Al Uqşur": "الأقصر",
  Aswan: "أسوان",
  "Aswān": "أسوان",
  Hurghada: "الغردقة",
  "Al Ghardaqah": "الغردقة",
  "Sharm El Sheikh": "شرم الشيخ",
  "Sharm ash Shaykh": "شرم الشيخ",
  Banha: "بنها",
  Damanhur: "دمنهور",
  Faiyum: "الفيوم",
  "Beni Suef": "بني سويف",
  Minya: "المنيا",
  Sohag: "سوهاج",
  Qena: "قنا",

  // UAE
  Dubai: "دبي",
  "Abu Dhabi": "أبو ظبي",
  "Abu Dhabi Island and Internal Islands City": "مدينة أبو ظبي",
  "Abu Dhabi Municipality": "بلدية أبو ظبي",
  "Al Ain City": "مدينة العين",
  "Al Ain Municipality": "بلدية العين",
  "Al Dhafra": "الظفرة",
  "Al Shamkhah City": "الشامخة",
  "Ar Ruways": "الرويس",
  "Bani Yas City": "بني ياس",
  "Khalifah A City": "مدينة خليفة",
  Musaffah: "مصفح",
  "Zayed City": "مدينة زايد",
  Sharjah: "الشارقة",
  "Khor Fakkan": "خورفكان",
  "Khawr Fakkān": "خورفكان",
  Kalba: "كلباء",
  Dhaid: "الذيد",
  "Adh Dhayd": "الذيد",
  "Al Madam": "المدام",
  "Al Hamriyah": "الحمرية",
  "Al Batayih": "البطائح",
  "Dibba Al Hesn": "دبا الحصن",
  Ajman: "عجمان",
  "Ajman City": "مدينة عجمان",
  Manama: "المنامة",
  Masfout: "مصفوت",
  "Ras Al Khaimah": "رأس الخيمة",
  "Ras Al Khaimah City": "مدينة رأس الخيمة",
  "Al Fujairah City": "مدينة الفجيرة",
  "Dibba Al-Fujairah": "دبا الفجيرة",
  "Dibba Al-Hisn": "دبا الحصن",
  "Umm AL Quwain": "أم القيوين",
  "Umm Al Quwain City": "مدينة أم القيوين",

  // Saudi Arabia
  Riyadh: "الرياض",
  Jeddah: "جدة",
  Mecca: "مكة المكرمة",
  Medina: "المدينة المنورة",
  Dammam: "الدمام",
  Khobar: "الخبر",
  "Al Khubar": "الخبر",
  Dhahran: "الظهران",
  Tabuk: "تبوك",
  Abha: "أبها",
  "Khamis Mushait": "خميس مشيط",
  Taif: "الطائف",
  Buraidah: "بريدة",
  Hail: "حائل",
  Najran: "نجران",
  Jizan: "جازان",
  Yanbu: "ينبع",
  Jubail: "الجبيل",
  "Al Jubayl": "الجبيل",

  // Jordan
  Amman: "عَمّان",
  Zarqa: "الزرقاء",
  Irbid: "إربد",
  Aqaba: "العقبة",
  Salt: "السلط",
  Madaba: "مادبا",
  Jerash: "جرش",

  // Kuwait
  "Kuwait City": "مدينة الكويت",
  Hawalli: "حولي",
  Salmiya: "السالمية",
  "Al Ahmadi": "الأحمدي",
  "Al Jahra": "الجهراء",
  "Al Farwaniyah": "الفروانية",

  // Qatar
  Doha: "الدوحة",
  "Al Rayyan": "الريان",
  "Al Wakrah": "الوكرة",
  "Al Khor": "الخور",
  Lusail: "لوسيل",
};

/**
 * Get localized name of a country by ISO code.
 */
export function getCountryDisplayName(isoCode: string): { ar: string; en: string } {
  const country = Country.getCountryByCode(isoCode);
  const en = country?.name || (DISPLAY_NAMES_EN ? DISPLAY_NAMES_EN.of(isoCode) || isoCode : isoCode);

  let ar = isoCode;
  try {
    if (DISPLAY_NAMES_AR) {
      ar = DISPLAY_NAMES_AR.of(isoCode) || en;
    }
  } catch {
    ar = en;
  }

  // Handle specific known names for clearer display in Arabic
  if (isoCode === "AE") ar = "الإمارات (UAE)";
  else if (isoCode === "EG") ar = "مصر (Egypt)";
  else if (isoCode === "SA") ar = "السعودية (Saudi Arabia)";
  else if (isoCode === "KW") ar = "الكويت (Kuwait)";
  else if (isoCode === "QA") ar = "قطر (Qatar)";
  else if (isoCode === "BH") ar = "البحرين (Bahrain)";
  else if (isoCode === "OM") ar = "عمان (Oman)";
  else if (isoCode === "JO") ar = "الأردن (Jordan)";
  else if (isoCode === "MA") ar = "المغرب (Morocco)";
  else if (isoCode === "DZ") ar = "الجزائر (Algeria)";
  else if (isoCode === "TN") ar = "تونس (Tunisia)";
  else if (isoCode === "LB") ar = "لبنان (Lebanon)";
  else if (isoCode === "IQ") ar = "العراق (Iraq)";
  else if (isoCode === "PS") ar = "فلسطين (Palestine)";
  else if (isoCode === "SY") ar = "سوريا (Syria)";
  else if (isoCode === "YE") ar = "اليمن (Yemen)";
  else if (isoCode === "SD") ar = "السودان (Sudan)";
  else if (isoCode === "LY") ar = "ليبيا (Libya)";

  return { ar, en };
}

/**
 * Returns a list of formatted country options for selects.
 */
export function getCountryOptions(isArabic = false): LocationOption[] {
  const allCountries = Country.getAllCountries();
  const countryMap = new Map<string, ICountry>(allCountries.map((c) => [c.isoCode, c]));

  const priorityList: ICountry[] = [];
  const remainingList: ICountry[] = [];

  for (const code of PRIORITY_COUNTRY_CODES) {
    const c = countryMap.get(code);
    if (c) priorityList.push(c);
  }

  for (const c of allCountries) {
    if (!PRIORITY_COUNTRY_CODES.includes(c.isoCode)) {
      remainingList.push(c);
    }
  }

  remainingList.sort((a, b) => a.name.localeCompare(b.name));

  const buildOption = (c: ICountry): LocationOption => {
    const { ar, en } = getCountryDisplayName(c.isoCode);
    const flag = c.flag || "";
    const label = isArabic
      ? `${flag} ${ar}`
      : `${flag} ${en}`;

    return {
      value: c.isoCode,
      label: label.trim(),
      nameEn: en,
      nameAr: ar,
      flag,
    };
  };

  return [...priorityList.map(buildOption), ...remainingList.map(buildOption)];
}

/**
 * Returns states / emirates / governorates for a country.
 */
export function getStateOptions(countryCode: string, isArabic = false): LocationOption[] {
  if (!countryCode) return [];
  const normalizedCountry = normalizeCountry(countryCode);
  const states = State.getStatesOfCountry(normalizedCountry);

  return states.map((state: IState) => {
    const countryArabicStates = ARABIC_STATE_NAMES[normalizedCountry] || {};
    const stateAr = countryArabicStates[state.isoCode];

    let label = state.name;
    if (isArabic) {
      if (stateAr) {
        label = `${stateAr} (${state.name.replace(/\s*(Governorate|Emirate|Region|Province)\s*/gi, "")})`;
      } else {
        label = state.name;
      }
    }

    return {
      value: state.isoCode,
      label,
      nameEn: state.name,
      nameAr: stateAr,
    };
  });
}

/**
 * Returns cities for a given country & state.
 */
export function getCityOptions(countryCode: string, stateCode?: string, isArabic = false): LocationOption[] {
  if (!countryCode) return [];
  const normalizedCountry = normalizeCountry(countryCode);

  let rawCities: ICity[] = [];
  if (stateCode) {
    rawCities = City.getCitiesOfState(normalizedCountry, stateCode);
  }

  if (rawCities.length === 0) {
    rawCities = City.getCitiesOfCountry(normalizedCountry) || [];
  }

  // Deduplicate by city name
  const seen = new Set<string>();
  const uniqueCities: ICity[] = [];
  for (const city of rawCities) {
    if (!seen.has(city.name)) {
      seen.add(city.name);
      uniqueCities.push(city);
    }
  }

  return uniqueCities.map((city: ICity) => {
    const cityAr = ARABIC_CITY_NAMES[city.name];
    const label = isArabic && cityAr ? `${cityAr} (${city.name})` : city.name;

    return {
      value: city.name,
      label,
      nameEn: city.name,
      nameAr: cityAr,
    };
  });
}

/**
 * Normalizes any country input (ISO code, legacy slug, English/Arabic name) to ISO 2-letter code.
 */
export function normalizeCountry(country?: string | null): string {
  if (!country) return "EG";
  const trimmed = country.trim();
  const upper = trimmed.toUpperCase();
  if (Country.getCountryByCode(upper)) return upper;

  const lower = trimmed.toLowerCase();
  if (LEGACY_COUNTRY_MAP[lower]) return LEGACY_COUNTRY_MAP[lower];

  const matched = Country.getAllCountries().find(
    (c) =>
      c.name.toLowerCase() === lower ||
      c.isoCode.toLowerCase() === lower ||
      c.name.toLowerCase().includes(lower),
  );

  return matched ? matched.isoCode : "EG";
}

/**
 * Normalizes state code for a given country.
 */
export function normalizeState(countryCode: string, region?: string | null): string {
  const normalizedCountry = normalizeCountry(countryCode);
  const states = State.getStatesOfCountry(normalizedCountry);
  if (states.length === 0) return "";
  if (!region) return states[0]?.isoCode ?? "";

  const trimmed = region.trim();
  const directMatch = states.find((s) => s.isoCode.toLowerCase() === trimmed.toLowerCase());
  if (directMatch) return directMatch.isoCode;

  const nameMatch = states.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
  if (nameMatch) return nameMatch.isoCode;

  const partialMatch = states.find(
    (s) =>
      s.name.toLowerCase().includes(trimmed.toLowerCase()) ||
      trimmed.toLowerCase().includes(s.name.toLowerCase()),
  );
  if (partialMatch) return partialMatch.isoCode;

  return states[0]?.isoCode ?? "";
}

/**
 * Normalizes city value for a given country and state.
 */
export function normalizeCity(countryCode: string, stateCode: string, city?: string | null): string {
  const cities = getCityOptions(countryCode, stateCode);
  if (cities.length === 0) return city?.trim() || "";
  if (!city) return cities[0]?.value ?? "";

  const trimmed = city.trim();
  const direct = cities.find((c) => c.value.toLowerCase() === trimmed.toLowerCase());
  if (direct) return direct.value;

  const partial = cities.find(
    (c) =>
      c.nameEn.toLowerCase().includes(trimmed.toLowerCase()) ||
      (c.nameAr && c.nameAr.toLowerCase().includes(trimmed.toLowerCase())),
  );
  if (partial) return partial.value;

  return cities[0]?.value ?? "";
}
