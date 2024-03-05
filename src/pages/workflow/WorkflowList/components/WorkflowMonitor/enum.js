export const runDateList = [
  { value: 0, label: _l('直到手动恢复') },
  { value: 1, label: _l('暂停1小时') },
  { value: 2, label: _l('暂停2小时') },
  { value: 3, label: _l('暂停3小时') },
  { value: 4, label: _l('暂停4小时') },
  { value: 5, label: _l('暂停5小时') },
  { value: 6, label: _l('暂停6小时') },
];
export const dateList = [
  { value: 1, label: _l('最近1小时') },
  { value: 3, label: _l('最近3小时') },
  { value: 12, label: _l('最近12小时') },
  { value: 24, label: _l('最近24小时') },
];

export const justifyInfoData = [
  { type: 'producer', name: _l('本月新增'), tableHeaderName: _l('本月新增') },
  { type: 'consumer', name: _l('本月消费'), tableHeaderName: _l('本月消费') },
  { type: 'difference', name: _l('排队'), tableHeaderName: _l('当前排队') },
  { type: 'routerIndex', name: '', tableHeaderName: _l('通道') },
  { type: 'waiting', name: '', tableHeaderName: _l('状态') },
];

export const formatter = v => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
