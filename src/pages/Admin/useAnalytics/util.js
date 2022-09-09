export const selectDateList = [
  { value: 0, label: _l('最近7天') },
  { value: 1, label: _l('最近30天') },
  { value: 2, label: _l('最近90天') },
  { value: 3, label: _l('最近半年') },
  { value: 4, label: _l('最近1年') },
];

export const dateDimension = [
  { value: '1d', label: _l('天') },
  { value: '1w', label: _l('周') },
  { value: '1M', label: _l('月') },
];

export const formatter = v => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
