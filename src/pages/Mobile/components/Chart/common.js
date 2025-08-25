import _ from 'lodash';
import moment from 'moment';

/**
 * 图表类型
 */
export const reportTypes = {
  BarChart: 1,
  LineChart: 2,
  PieChart: 3,
  NumberChart: 4,
  RadarChart: 5,
  FunnelChart: 6,
  BarLineChart: 7,
  PivotTable: 8,
};

/**
 * 图表颜色
 */
export const colors = [
  '#64B5F6',
  '#4DB6AC',
  '#FFB74D',
  '#E57373',
  '#9575CD',
  '#A1887F',
  '#90A4AE',
  '#4DD0E1',
  '#81C784',
  '#FFD54F',
  '#7986CB',
  '#FF8A65',
];

/**
 * 获取图例位置信息
 */
export const getLegendType = displaySetup => {
  if (displaySetup.showLegend) {
    if (displaySetup.legendType === 1) {
      return {
        position: 'top',
      };
    }
    if (displaySetup.legendType === 2) {
      return {
        position: 'left',
      };
    }
    if (displaySetup.legendType === 3) {
      return {
        position: 'bottom',
        align: 'center',
      };
    }
    if (displaySetup.legendType === 4) {
      return {
        position: 'right',
      };
    }
  } else {
    return false;
  }
};

/**
 * 计算百分比图表的y轴位置
 */
const calculatePerPilePosition = data => {
  data.map((item, index) => {
    const last = data[index - 1];
    const next = data[index + 1];
    if (last) {
      item.percentOffsetY = next ? (item.y || item.percent) + last.percent : 1;
      return item;
    } else {
      item.percentOffsetY = item.percent;
      return item;
    }
  });
  return data;
};

/**
 * 换算百分比
 */
export const formatPerPileChartData = result => {
  const groupResult = _.groupBy(result, 'name');
  const perPileResult = [];

  for (let key in groupResult) {
    const current = groupResult[key];
    const count = current.reduce((count, item) => {
      return count + item.value;
    }, 0);
    current.map(item => {
      item.percent = ((item.value || 0) / count) * 1;
      return item;
    });
    perPileResult.push(...calculatePerPilePosition(current));
  }
  return perPileResult;
};

/**
 * 截取N条数据
 */
const sliceXAxisCount = (data, showXAxisCount) => {
  const { length } = data;
  return data.slice(0, showXAxisCount || length);
};

/**
 * 将时间字符串转成时间戳
 */
export const formDate = time => {
  // 周
  if (time.includes('W')) {
    const [year, week] = time.split('W');
    time = moment(year).isoWeek(week).format('YYYY-MM-DD');
  }
  // 季度
  if (time.includes('Q')) {
    const [year, quarter] = time.split('Q');
    time = moment(year).quarter(quarter).format('YYYY-MM-DD');
  }
  // 兼容时
  let hour = moment(time).get('hour');
  if (isNaN(hour)) {
    time = `${time}:00`;
  }
  let nowTime = new Date(time);
  nowTime = nowTime.getTime();
  return nowTime;
};

/**
 * 排序图表数据
 */
export const sortChartData = (data, xaxisSortType, yaxisList, showXAxisCount = 0, isBar = false) => {
  if (xaxisSortType === 1) {
    return sliceXAxisCount(
      data.sort((a, b) => {
        const aDate = formDate(a.name);
        const bDate = formDate(b.name);
        return aDate > bDate || aDate === bDate ? 1 : -1;
      }),
      showXAxisCount * yaxisList.length,
    );
  } else if (xaxisSortType === 2) {
    return sliceXAxisCount(
      data.sort((a, b) => (formDate(b.name) > formDate(a.name) ? 1 : -1)),
      showXAxisCount * yaxisList.length,
    );
  } else {
    const yaxisSort = yaxisList.filter(item => item.sortType !== 0)[0];
    if (yaxisSort && yaxisSort.sortType) {
      const sortList = data.filter(item => {
        const id = item.groupName.split(/-md-\w+-chart-/g)[1];
        return id ? id === yaxisSort.controlId : item.groupName === yaxisSort.controlName;
      });
      const sourceList = data.filter(item => {
        const id = item.groupName.split(/-md-\w+-chart-/g)[1];
        return id ? id !== yaxisSort.controlId : item.groupName !== yaxisSort.controlName;
      });

      if (isBar) {
        // 条形图排序的维度放到最后
        const sortData = sliceXAxisCount(
          yaxisSort.sortType === 1
            ? sortList.sort((a, b) => a.value - b.value)
            : sortList.sort((a, b) => b.value - a.value),
          showXAxisCount,
        );
        const names = sortData.map(item => item.name);
        return (showXAxisCount ? sourceList.filter(item => names.includes(item.name)) : sourceList).concat(sortData);
      } else {
        const sortData = sliceXAxisCount(
          yaxisSort.sortType === 1
            ? sortList.sort((a, b) => a.value - b.value)
            : sortList.sort((a, b) => b.value - a.value),
          showXAxisCount,
        );
        const names = sortData.map(item => item.name);
        return sortData.concat(showXAxisCount ? sourceList.filter(item => names.includes(item.name)) : sourceList);
      }
    } else {
      // console.log('恢复默认数据', data);
      return sliceXAxisCount(data, showXAxisCount * yaxisList.length);
    }
  }
};
