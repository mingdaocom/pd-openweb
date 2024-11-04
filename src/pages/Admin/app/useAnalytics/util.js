const subTypeNames = {
  1: _l('成员'),
  2: _l('外部门户用户'),
  3: _l('工作流'),
  4: _l('API'),
  5: _l('公开表单'),
  6: _l('其他'),
};

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

export const formatChartData = (type, initData = [], isFilterByDepartment) => {
  let data = [];
  switch (type) {
    case 'attachment':
      if (_.isEmpty(initData)) {
        initData = [{ value: 0, subType: 1 }];
      }
      _.forEach(initData, item => {
        const temp = [];
        _.forEach(isFilterByDepartment ? [1] : [1, 2, 3, 4, 5, 6], (v, index) => {
          const currentTypeValue = _.find(item.value || [], s => s.subType === v);
          if (!currentTypeValue) {
            temp.push({ value: 0, subType: v, date: item.date, category: subTypeNames[v] });
          } else {
            temp.push({
              value: currentTypeValue.size,
              subType: v,
              date: item.date,
              category: subTypeNames[v],
            });
          }
        });
        data = data.concat(temp);
      });

      let maxSize = Math.max(...data.map(item => item.value));
      let maxValue = (maxSize / Math.pow(1024, 2)).toFixed(2) * 1;
      data = data.map(v => ({
        ...v,
        value:
          maxValue > 1024 ? (v.value / Math.pow(1024, 3)).toFixed(2) * 1 : (v.value / Math.pow(1024, 2)).toFixed(2) * 1,
      }));
      break;
    default:
  }

  return data;
};
