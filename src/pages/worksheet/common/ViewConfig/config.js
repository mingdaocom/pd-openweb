export const viewTypeConfig = [
  { type: 'Setting', name: _l('设置'), icon: '' }, // 设置
  { type: 'Show', name: _l('显示列'), icon: 'tune_new' }, // 显示列
  { type: 'Filter', name: _l('数据过滤'), icon: 'worksheet_filter' }, // 筛选
  { type: 'Sort', name: _l('排序%05028'), icon: 'folder-sort' }, // 排序
  { type: 'Controls', name: _l('字段'), icon: 'visibility' }, // 字段
  { type: 'Color', name: _l('颜色'), icon: 'task-color' }, // 颜色
  { type: 'FastFilter', name: _l('快速筛选'), icon: 'smart_button_black_24dp' }, // 快速筛选
  { type: 'NavGroup', name: _l('筛选列表'), icon: 'list' }, // 快速筛选
  { type: 'CustomAction', name: _l('自定义动作'), icon: 'custom_actions' }, // 自定义动作
  { type: 'MobileSet', name: _l('移动端显示'), icon: 'phone' }, // 移动端设置
];
export const viewTypeGroup = [
  { name: 'base', list: ['Setting', 'Show'] },
  { name: 'set', list: ['Filter', 'Sort', 'Controls'] },
  { name: 'action', list: ['FastFilter', 'NavGroup', 'CustomAction'] },
  { name: 'mobile', list: ['MobileSet'] },
];
export const setList = [
  { key: 'showno', txt: _l('显示序号') },
  {
    key: 'showquick',
    txt: _l('显示记录快捷方式'),
    tips: _l('在记录前显示“更多”图标，点击后可以在下拉菜单中进行记录操作。'),
  },
  { key: 'showsummary', txt: _l('显示汇总行') },
  { key: 'showvertical', txt: _l('显示垂直表格线') },
  { key: 'alternatecolor', txt: _l('显示交替行颜色') },
  { key: 'titlewrap', txt: _l('标题行文字换行') },
];
