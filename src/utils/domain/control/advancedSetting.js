import update from 'immutability-helper';
import { get, isArray, isObject } from 'lodash';

/**
 * 读取控件高级设置，并按需解析指定配置项的序列化值。
 */
export const getAdvanceSetting = (data, key) => {
  const setting = get(data, ['advancedSetting']) || {};

  if (!key) return setting;

  let value = get(setting, key);

  if (!value) return '';
  if (isArray(value) || isObject(value)) return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    console.log(error);
    return '';
  }
};

/**
 * 在保留控件其他属性的前提下合并更新高级设置。
 */
export const handleAdvancedSettingChange = (data, obj) => {
  return {
    ...data,
    advancedSetting: update(data.advancedSetting || {}, { $apply: item => ({ ...item, ...obj }) }),
  };
};

/** 将分段字段的历史默认文字色转换为可响应明暗主题的语义色。 */
export const getSplitLineTextColor = color => {
  if (!color || (typeof color === 'string' && color.trim().toLowerCase() === '#151515')) {
    return 'var(--color-text-primary)';
  }

  return color;
};

/**
 * 将子表高级设置中的序列化值、数值和开关归一化为运行时配置。
 */
export function parseAdvancedSetting(setting = {}) {
  const {
    allowlink = '1',
    allowimport = '1',
    allowcopy = '1',
    allowbatch = '1',
    showcount,
    titlewrap,
    rctitlestyle,
    freezeids,
    layercontrolid,
    direction = '0',
    columnnum,
    showtitleid,
  } = setting;
  return {
    allowadd: setting.allowadd === '1', // 子表允许新增
    allowcancel: setting.allowcancel === '1', // 子表允许删除
    allowedit: setting.allowedit === '1', // 子表允许编辑
    allowsingle: setting.allowsingle === '1', // 子表允许单条添加
    batchcids: safeParse(setting.batchcids, 'array'), // 子表从指定字段添加记录
    hidenumber: setting.hidenumber === '1', // 隐藏序号
    rowheight: Number(setting.rowheight || 0), // 行高
    blankrow: Number(setting.blankrow || 1),
    enablelimit: setting.enablelimit === '1', // 隐藏序号
    min: setting.enablelimit === '1' ? Number(setting.min || 0) : undefined, // 最小行数
    max: setting.enablelimit === '1' ? Number(setting.max || 1000) : undefined, // 最大行数
    rownum: Number(setting.rownum || 15), // 最大高度行数/每页行数
    showtype: setting.showtype || '1', // 显示方式 1滚动 2翻页
    uniqueControlIds: safeParse(setting.uniquecontrols, 'array'), // 显示方式 1滚动 2翻页
    h5showtype: setting.h5showtype || '1', // 子表移动端web显示样式 1列表 2平铺
    h5abstractids: safeParse(setting.h5abstractids, 'array'), // 子表移动端web摘要字段
    allowOpenRecord: allowlink === '1', // 允许打开子记录 默认勾选
    allowImport: allowimport === '1', // 允许导入（控制导入新增入口）
    allowCopy: allowcopy === '1', //允许复制 默认勾选
    allowBatch: allowbatch === '1', //允许批量操作
    // 子表允许拖拽排序。排序方式配置为 rcsorttype（'1' 拖拽排序 / '2' 按设置的排序）
    allowDrag: setting.rcsorttype === '1',
    frozenIndex: Number(safeParse(freezeids, 'array')[0] || '0'), //冻结列["1","2","3"]
    titleWrap: titlewrap === '1', //
    titleCenter: rctitlestyle === '1', // 垂直居中
    showCount: showcount !== '1', // 显示计数 默认勾选
    treeLayerControlId: layercontrolid, // 子表树形对应控件id
    defaultLayer: Number(setting.defaultlayer || 1), // 子表树形默认展开层级
    direction, // 布局方向
    columnNum: columnnum, // h5 子表平铺显示列数
    showTitleId: showtitleid, // h5 子表平铺显示标题字段id
  };
}
