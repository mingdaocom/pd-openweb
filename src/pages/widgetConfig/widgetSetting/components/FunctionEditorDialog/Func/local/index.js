import lang_af from './af/language';
import lang_am from './am/language';
import lang_be from './be/language';
import lang_bg from './bg/language';
import lang_bn from './bn/language';
import lang_cs from './cs/language';
import lang_da from './da/language';
import lang_de from './de/language';
import lang_el from './el/language';
import lang_en from './en/language';
import lang_es from './es/language';
import lang_et from './et/language';
import lang_fi from './fi/language';
import lang_fr from './fr/language';
import lang_hi from './hi/language';
import lang_hr from './hr/language';
import lang_hu from './hu/language';
import lang_hy from './hy/language';
import lang_in from './in/language';
import lang_is from './is/language';
import lang_it from './it/language';
import lang_ja from './ja/language';
import lang_ka from './ka/language';
import lang_kk from './kk/language';
import lang_km from './km/language';
import lang_ko from './ko/language';
import lang_ky from './ky/language';
import lang_lo from './lo/language';
import lang_lt from './lt/language';
import lang_lv from './lv/language';
import lang_mk from './mk/language';
import lang_mn from './mn/language';
import lang_ms from './ms/language';
import lang_my from './my/language';
import lang_ne from './ne/language';
import lang_nl from './nl/language';
import lang_no from './no/language';
import lang_pl from './pl/language';
import lang_pt from './pt/language';
import lang_ro from './ro/language';
import lang_ru from './ru/language';
import lang_si from './si/language';
import lang_sk from './sk/language';
import lang_sl from './sl/language';
import lang_sq from './sq/language';
import lang_sr from './sr/language';
import lang_sv from './sv/language';
import lang_sw from './sw/language';
import lang_th from './th/language';
import lang_tl_ph from './tl_ph/language';
import lang_tr from './tr/language';
import lang_uk from './uk/language';
import lang_uz from './uz/language';
import lang_vi from './vi/language';
import lang_zh_hans from './zh_hans/language';
import lang_zh_hant from './zh_hant/language';

const languageMap = {
  vi: lang_vi,
  uz: lang_uz,
  uk: lang_uk,
  tr: lang_tr,
  zh_hant: lang_zh_hant,
  th: lang_th,
  sv: lang_sv,
  sw: lang_sw,
  es: lang_es,
  sl: lang_sl,
  sk: lang_sk,
  si: lang_si,
  zh_hans: lang_zh_hans,
  sr: lang_sr,
  ru: lang_ru,
  ro: lang_ro,
  pt: lang_pt,
  pl: lang_pl,
  no: lang_no,
  ne: lang_ne,
  mn: lang_mn,
  ms: lang_ms,
  mk: lang_mk,
  lt: lang_lt,
  lv: lang_lv,
  lo: lang_lo,
  ky: lang_ky,
  ko: lang_ko,
  km: lang_km,
  kk: lang_kk,
  ja: lang_ja,
  it: lang_it,
  in: lang_in,
  is: lang_is,
  hu: lang_hu,
  hi: lang_hi,
  el: lang_el,
  de: lang_de,
  ka: lang_ka,
  fr: lang_fr,
  fi: lang_fi,
  tl_ph: lang_tl_ph,
  et: lang_et,
  en: lang_en,
  nl: lang_nl,
  da: lang_da,
  cs: lang_cs,
  hr: lang_hr,
  my: lang_my,
  bg: lang_bg,
  bn: lang_bn,
  be: lang_be,
  hy: lang_hy,
  am: lang_am,
  sq: lang_sq,
  af: lang_af,
};

let translate = (key, ...args) => {
  if (typeof _l === 'function') {
    return _l(key, ...args);
  }

  return formatLangValue(key, args);
};

function formatLangValue(value, args = []) {
  let content = value;

  if (args.length > 0) {
    for (let i = 0; i < args.length; i++) {
      content = content.replace(new RegExp(`%${i}`, 'g'), args[i]);
    }
  } else if (/.*%\d{5}/.test(content)) {
    content = content.replace(/%\d{5}$/, '');
  }

  return content.replace(/\\/g, '');
}

export function initLang(langCode) {
  const language = languageMap[langCode];

  if (language) {
    translate = (key, ...args) => {
      return formatLangValue(language[key] || key, args);
    };

    return;
  }

  translate = (key, ...args) => {
    if (typeof _l === 'function') {
      return _l(key, ...args);
    }

    return formatLangValue(key, args);
  };
}

export function getLang(key, ...args) {
  return translate(key, ...args);
}
