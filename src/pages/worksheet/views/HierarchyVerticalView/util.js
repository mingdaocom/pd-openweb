import _ from 'lodash';

// 获取svg的相关位置数据
export const getPosition = ($parent, $cur, scale = 1, positionStart = false) => {
  if (!$parent || !$cur) return {};
  const { height, width } = $parent.getBoundingClientRect();
  const { left: curLeft, width: curWidth } = $cur.getBoundingClientRect();
  const { left: svgLeft } = $parent.nextSibling.getBoundingClientRect();
  const $recordItemWrap = document.querySelector('.mixNode .sortableVerticalTreeNodeWrap .recordItemWrap');
  const { width: recordItemWrap } = $recordItemWrap ? $recordItemWrap.getBoundingClientRect() : {};
  // svg元素的高度
  const svgHeight = 40;
  // 起点坐标
  const startX = width / 2 / scale;
  const startPoint = [startX, 0];
  // 终点坐标
  const endX = positionStart
    ? (curLeft - svgLeft + recordItemWrap / 2) / scale
    : (curLeft - svgLeft + curWidth / 2) / scale;
  const endPoint = [endX, 40];
  const pointY = Math.ceil(svgHeight / 2 / scale);
  // 拐点1
  const point1 = [startX, pointY];
  // 拐点2
  const point2 = [endX, pointY];
  return {
    height: svgHeight,
    top: '-100%',
    start: startPoint,
    end: endPoint,
    point1: point1,
    point2: point2,
  };
};
