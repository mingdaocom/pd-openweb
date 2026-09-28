import _, { head, isEmpty } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { SYSTEM_CONTROLS } from 'src/utils/domain/worksheet/constants';
import { getAdvanceSetting } from './advancedSetting';
import { DEFAULT_TEXT } from './setting';

/** 检查选项字段中是否存在未删除的重复选项。 */
export const checkOptionsRepeat = (controls = [], checkCollections = true) => {
  for (const c of controls) {
    if (_.includes([9, 10, 11], c.type) && c.dataSource ? checkCollections : true) {
      const noDelOptions = (c.options || []).filter(o => o && !o.isDeleted);
      const uniqOptions = _.uniqBy(noDelOptions, 'value');

      if (noDelOptions.length !== uniqOptions.length) {
        return true;
      }
    }
  }
};

/**
 * 将控件值中的临时自定义选项补充到选项配置。
 */
function updateOptionsOfControl(control, value, realValue) {
  let parsedValue = safeParse(value);
  let newOption;

  if (parsedValue.length > 1) {
    const parsedRealValue = safeParse(realValue);
    newOption = parsedValue
      .map((v, i) => ({
        index: control.options.length + i + 1,
        isDeleted: false,
        key: parsedRealValue[i],
        color: '#1677ff',
        value: v && (v.match(/add_(.*)/) || '')[1],
      }))
      .filter(v => v.value);
  } else {
    newOption = {
      index: control.options.length + 1,
      isDeleted: false,
      key: _.last(safeParse(realValue, 'array')),
      color: '#1677ff',
      value: value && (value.match(/"add_(.*)"]/) || '')[1],
    };
  }

  return {
    ...control,
    options: control.options.concat(newOption),
  };
}

/**
 * 收集并更新记录数据中新增了自定义选项的控件。
 */
export function updateOptionsOfControls(controls, data) {
  let newOptionControls = [];

  try {
    newOptionControls = _.filter(controls, item => _.includes([10, 11], item.type) && /"add_/.test(item.value)).map(c =>
      updateOptionsOfControl(c, c.value, data[c.controlId]),
    );
  } catch (err) {
    console.error(err);
  }

  return newOptionControls;
}

/**
 * 根据检查项展示类型返回自定义或默认的选中与未选中文案。
 */
export const getSwitchItemNames = (data, { needDefault, isShow } = {}) => {
  const itemnames = getAdvanceSetting(data, 'itemnames') || [];
  const showtype = getAdvanceSetting(data, 'showtype');
  const defaultData = DEFAULT_TEXT[showtype];

  // 筛选按默认来
  if (isShow) {
    return (
      DEFAULT_TEXT[showtype] || [
        { key: '1', value: _l('选中') },
        { key: '0', value: _l('未选中') },
      ]
    );
  }

  // 需要兜底显示
  if (needDefault && defaultData) {
    return defaultData.map(i => {
      const cur = _.find(itemnames, it => it.key === i.key);
      return _.get(cur, 'value') ? cur : i;
    });
  }

  // radio框必须要文案
  if (showtype === 2) {
    return itemnames.every(i => !!i.value) ? itemnames : defaultData;
  }

  return itemnames;
};

/** 过滤字段中已经删除的选项。 */
export const getOptions = data => (data.options || []).filter(item => !item.isDeleted);

/** 清除展示字段配置中已经删除或失效的字段标识。 */
export const getShowControls = (controls = [], showControls = []) => {
  // 删除掉showControls 中已经被删掉的控件
  const allControlId = controls
    .filter(i => !_.includes([51], i.type))
    .concat(SYSTEM_CONTROLS)
    .map(item => item.controlId);
  return showControls
    .map(id => {
      if (!allControlId.includes(id)) return '';
      return id;
    })
    .filter(item => !isEmpty(item));
};

/** 生成新选项字段的默认选项列表。 */
export const getDefaultOptions = () => {
  return [
    { key: uuidv4(), value: _l('选项1'), isDeleted: false, index: 1, checked: true, color: '#C9E6FC' },
    { key: uuidv4(), value: _l('选项2'), isDeleted: false, index: 2, checked: false, color: '#C3F2F2' },
    { key: uuidv4(), value: _l('选项3'), isDeleted: false, index: 3, checked: false, color: '#00C345' },
  ];
};

/** 将首个有效选项序列化为默认选中值。 */
export const getDefaultCheckedOption = options => {
  if (isEmpty(options)) return '';
  return JSON.stringify([head(options).key]);
};
