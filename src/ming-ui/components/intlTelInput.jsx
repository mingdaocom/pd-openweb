import intlTelInput from 'intl-tel-input';
import utils from 'intl-tel-input/build/js/utils';
import 'intl-tel-input/build/css/intlTelInput.min.css';

const countries = {
  ac: _l('阿森松岛'),
  xk: _l('科索沃'),
  ad: _l('安道尔'),
  ae: _l('阿拉伯联合酋长国'),
  af: _l('阿富汗'),
  ag: _l('安提瓜和巴布达'),
  ai: _l('安圭拉'),
  al: _l('阿尔巴尼亚'),
  am: _l('亚美尼亚'),
  ao: _l('安哥拉'),
  ar: _l('阿根廷'),
  as: _l('美属萨摩亚'),
  at: _l('奥地利'),
  au: _l('澳大利亚'),
  aw: _l('阿鲁巴'),
  ax: _l('奥兰群岛'),
  az: _l('阿塞拜疆'),
  ba: _l('波斯尼亚和黑塞哥维那'),
  bb: _l('巴巴多斯'),
  bd: _l('孟加拉国'),
  be: _l('比利时'),
  bf: _l('布基纳法索'),
  bg: _l('保加利亚'),
  bh: _l('巴林'),
  bi: _l('布隆迪'),
  bj: _l('贝宁'),
  bl: _l('圣巴泰勒米'),
  bm: _l('百慕大'),
  bn: _l('文莱'),
  bo: _l('玻利维亚'),
  bq: _l('荷属加勒比区'),
  br: _l('巴西'),
  bs: _l('巴哈马'),
  bt: _l('不丹'),
  bw: _l('博茨瓦纳'),
  by: _l('白俄罗斯'),
  bz: _l('伯利兹'),
  ca: _l('加拿大'),
  cc: _l('科科斯（基林）群岛'),
  cd: _l('刚果（金）'),
  cf: _l('中非共和国'),
  cg: _l('刚果（布）'),
  ch: _l('瑞士'),
  ci: _l('科特迪瓦'),
  ck: _l('库克群岛'),
  cl: _l('智利'),
  cm: _l('喀麦隆'),
  cn: _l('中国大陆'),
  co: _l('哥伦比亚'),
  cr: _l('哥斯达黎加'),
  cu: _l('古巴'),
  cv: _l('佛得角'),
  cw: _l('库拉索'),
  cx: _l('圣诞岛'),
  cy: _l('塞浦路斯'),
  cz: _l('捷克'),
  de: _l('德国'),
  dj: _l('吉布提'),
  dk: _l('丹麦'),
  dm: _l('多米尼克'),
  do: _l('多米尼加共和国'),
  dz: _l('阿尔及利亚'),
  ec: _l('厄瓜多尔'),
  ee: _l('爱沙尼亚'),
  eg: _l('埃及'),
  eh: _l('西撒哈拉'),
  er: _l('厄立特里亚'),
  es: _l('西班牙'),
  et: _l('埃塞俄比亚'),
  fi: _l('芬兰'),
  fj: _l('斐济'),
  fk: _l('福克兰群岛'),
  fm: _l('密克罗尼西亚'),
  fo: _l('法罗群岛'),
  fr: _l('法国'),
  ga: _l('加蓬'),
  gb: _l('英国'),
  gd: _l('格林纳达'),
  ge: _l('格鲁吉亚'),
  gf: _l('法属圭亚那'),
  gg: _l('根西岛'),
  gh: _l('加纳'),
  gi: _l('直布罗陀'),
  gl: _l('格陵兰'),
  gm: _l('冈比亚'),
  gn: _l('几内亚'),
  gp: _l('瓜德罗普'),
  gq: _l('赤道几内亚'),
  gr: _l('希腊'),
  gt: _l('危地马拉'),
  gu: _l('关岛'),
  gw: _l('几内亚比绍'),
  gy: _l('圭亚那'),
  hk: _l('中国香港'),
  hn: _l('洪都拉斯'),
  hr: _l('克罗地亚'),
  ht: _l('海地'),
  hu: _l('匈牙利'),
  id: _l('印度尼西亚'),
  ie: _l('爱尔兰'),
  il: _l('以色列'),
  im: _l('马恩岛'),
  in: _l('印度'),
  io: _l('英属印度洋领地'),
  iq: _l('伊拉克'),
  ir: _l('伊朗'),
  is: _l('冰岛'),
  it: _l('意大利'),
  je: _l('泽西岛'),
  jm: _l('牙买加'),
  jo: _l('约旦'),
  jp: _l('日本'),
  ke: _l('肯尼亚'),
  kg: _l('吉尔吉斯斯坦'),
  kh: _l('柬埔寨'),
  ki: _l('基里巴斯'),
  km: _l('科摩罗'),
  kn: _l('圣基茨和尼维斯'),
  kp: _l('朝鲜'),
  kr: _l('韩国'),
  kw: _l('科威特'),
  ky: _l('开曼群岛'),
  kz: _l('哈萨克斯坦'),
  la: _l('老挝'),
  lb: _l('黎巴嫩'),
  lc: _l('圣卢西亚'),
  li: _l('列支敦士登'),
  lk: _l('斯里兰卡'),
  lr: _l('利比里亚'),
  ls: _l('莱索托'),
  lt: _l('立陶宛'),
  lu: _l('卢森堡'),
  lv: _l('拉脱维亚'),
  ly: _l('利比亚'),
  ma: _l('摩洛哥'),
  mc: _l('摩纳哥'),
  md: _l('摩尔多瓦'),
  me: _l('黑山'),
  mf: _l('法属圣马丁'),
  mg: _l('马达加斯加'),
  mh: _l('马绍尔群岛'),
  mk: _l('北马其顿'),
  ml: _l('马里'),
  mm: _l('缅甸'),
  mn: _l('蒙古'),
  mo: _l('中国澳门'),
  mp: _l('北马里亚纳群岛'),
  mq: _l('马提尼克'),
  mr: _l('毛里塔尼亚'),
  ms: _l('蒙特塞拉特'),
  mt: _l('马耳他'),
  mu: _l('毛里求斯'),
  mv: _l('马尔代夫'),
  mw: _l('马拉维'),
  mx: _l('墨西哥'),
  my: _l('马来西亚'),
  mz: _l('莫桑比克'),
  na: _l('纳米比亚'),
  nc: _l('新喀里多尼亚'),
  ne: _l('尼日尔'),
  nf: _l('诺福克岛'),
  ng: _l('尼日利亚'),
  ni: _l('尼加拉瓜'),
  nl: _l('荷兰'),
  no: _l('挪威'),
  np: _l('尼泊尔'),
  nr: _l('瑙鲁'),
  nu: _l('纽埃'),
  nz: _l('新西兰'),
  om: _l('阿曼'),
  pa: _l('巴拿马'),
  pe: _l('秘鲁'),
  pf: _l('法属波利尼西亚'),
  pg: _l('巴布亚新几内亚'),
  ph: _l('菲律宾'),
  pk: _l('巴基斯坦'),
  pl: _l('波兰'),
  pm: _l('圣皮埃尔和密克隆群岛'),
  pr: _l('波多黎各'),
  ps: _l('巴勒斯坦领土'),
  pt: _l('葡萄牙'),
  pw: _l('帕劳'),
  py: _l('巴拉圭'),
  qa: _l('卡塔尔'),
  re: _l('留尼汪'),
  ro: _l('罗马尼亚'),
  rs: _l('塞尔维亚'),
  ru: _l('俄罗斯'),
  rw: _l('卢旺达'),
  sa: _l('沙特阿拉伯'),
  sb: _l('所罗门群岛'),
  sc: _l('塞舌尔'),
  sd: _l('苏丹'),
  se: _l('瑞典'),
  sg: _l('新加坡'),
  sh: _l('圣赫勒拿'),
  si: _l('斯洛文尼亚'),
  sj: _l('斯瓦尔巴和扬马延'),
  sk: _l('斯洛伐克'),
  sl: _l('塞拉利昂'),
  sm: _l('圣马力诺'),
  sn: _l('塞内加尔'),
  so: _l('索马里'),
  sr: _l('苏里南'),
  ss: _l('南苏丹'),
  st: _l('圣多美和普林西比'),
  sv: _l('萨尔瓦多'),
  sx: _l('荷属圣马丁'),
  sy: _l('叙利亚'),
  sz: _l('斯威士兰'),
  tc: _l('特克斯和凯科斯群岛'),
  td: _l('乍得'),
  tg: _l('多哥'),
  th: _l('泰国'),
  tj: _l('塔吉克斯坦'),
  tk: _l('托克劳'),
  tl: _l('东帝汶'),
  tm: _l('土库曼斯坦'),
  tn: _l('突尼斯'),
  to: _l('汤加'),
  tr: _l('土耳其'),
  tt: _l('特立尼达和多巴哥'),
  tv: _l('图瓦卢'),
  tw: _l('中国台湾'),
  tz: _l('坦桑尼亚'),
  ua: _l('乌克兰'),
  ug: _l('乌干达'),
  us: _l('美国'),
  uy: _l('乌拉圭'),
  uz: _l('乌兹别克斯坦'),
  va: _l('梵蒂冈'),
  vc: _l('圣文森特和格林纳丁斯'),
  ve: _l('委内瑞拉'),
  vg: _l('英属维尔京群岛'),
  vi: _l('美属维尔京群岛'),
  vn: _l('越南'),
  vu: _l('瓦努阿图'),
  wf: _l('瓦利斯和富图纳'),
  ws: _l('萨摩亚'),
  ye: _l('也门'),
  yt: _l('马约特'),
  za: _l('南非'),
  zm: _l('赞比亚'),
  zw: _l('津巴布韦'),
};

export default function MDIntlTelInput(element, options) {
  // 获取当前语言环境
  const currentValue = getCookie('i18n_langtag') || md.global.Config.DefaultLang;
  const isChinese = ['zh-Hans', 'zh-Hant'].includes(currentValue);

  // 合并默认选项和传入选项
  const finalOptions = {
    utilsScript: utils,
    i18n: {
      ...countries,
      searchPlaceholder: _l('搜索'),
    },
    loadUtils: '',
    autoPlaceholder: 'off',
    initialCountry: _.get(md, 'global.Config.DefaultConfig.initialCountry') || 'cn',
    ..._.omit(options, 'preferredCountries'),
  };

  const preferredCountries = options.preferredCountries ||
    _.get(md, 'global.Config.DefaultConfig.preferredCountries') || ['cn', 'hk', 'mo', 'tw'];
  const intlTelInputInstance = intlTelInput(element, finalOptions);
  const sortCountryList = d => {
    const countryContainer = d.closest('.iti').querySelector('.iti__country-container');
    if (!countryContainer) return;
    const countryList = countryContainer.querySelector('.iti__country-list');
    if (!countryList) return;
    const allCountries = Array.from(countryList.querySelectorAll('.iti__country'));
    const countryElementMap = {};
    allCountries.forEach(element => {
      const countryCode = element.getAttribute('data-country-code');
      countryElementMap[countryCode] = element;
    });
    countryList.innerHTML = '';
    preferredCountries.forEach(countryCode => {
      if (countryElementMap[countryCode]) {
        countryList.appendChild(countryElementMap[countryCode]);
      }
    });
    const remainingElements = allCountries.filter(element => {
      const countryCode = element.getAttribute('data-country-code');
      return !preferredCountries.includes(countryCode);
    });
    if (isChinese) {
      remainingElements.sort((a, b) => {
        const aName = a.querySelector('.iti__country-name').textContent;
        const bName = b.querySelector('.iti__country-name').textContent;
        return aName.localeCompare(bName, 'zh');
      });
    }
    remainingElements.forEach(element => {
      countryList.appendChild(element);
    });
  };
  // 监听下拉框展开事件
  let debounceTimer;
  $(element).on('open:countrydropdown', e => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      sortCountryList(e.target);
      // 动态绑定搜索框的输入事件，搜索后恢复排序
      const searchInput = e.target.closest('.iti').querySelector('.iti__search-input');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          if (searchInput.value === '') {
            setTimeout(() => sortCountryList(e.target), 100);
          }
        });
      }
    }, 10);
  });

  return intlTelInputInstance;
}

// 特殊手机号验证是否合法
export const specialTelVerify = value => {
  return /\+61\d{9,10}$|\+861[3-9]\d{9}$/.test(value || '');
};

export const getDefaultCountry = () => {
  return (
    window.localStorage.getItem('DefaultCountry') || _.get(md, 'global.Config.DefaultConfig.initialCountry') || 'cn'
  );
};

export const initIntlTelInput = () => {
  if (window.initIntlTelInput) {
    return window.initIntlTelInput;
  }
  const $con = document.createElement('div');
  const $input = document.createElement('input');
  $con.style.display = 'none';
  $con.appendChild($input);
  document.body.appendChild($con);
  window.initIntlTelInput = MDIntlTelInput($input, {
    initialCountry: getDefaultCountry(),
    preferredCountries: _.get(md, 'global.Config.DefaultConfig.preferredCountries') || [getDefaultCountry()],
  });
  return window.initIntlTelInput;
};

export const telIsValidNumber = value => {
  const iti = initIntlTelInput();
  iti.setNumber(value);
  return iti.isValidNumber() && _.get(iti.getSelectedCountryData(), 'dialCode') === '86'
    ? specialTelVerify(_.startsWith(value, '+86') ? value : '+86' + value)
    : iti.isValidNumber() || specialTelVerify(value);
};
