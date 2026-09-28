export const GUNTER_ROW_HEIGHT = 32;
export const GUNTER_SCROLL_BOTTOM_MARGIN = 80;
export const GUNTER_OVERSCAN_ROWS = 3;

export const getGunterRowCount = (grouping = []) => {
  return grouping.length ? grouping[grouping.length - 1].openCount || 0 : 0;
};

export const getGunterScrollerHeight = (grouping = [], wrapperHeight = 0) => {
  const contentHeight = getGunterRowCount(grouping) * GUNTER_ROW_HEIGHT;

  return contentHeight >= wrapperHeight ? contentHeight + GUNTER_SCROLL_BOTTOM_MARGIN : wrapperHeight;
};

export const getGunterVisibleRange = (scroll, grouping = [], overscan = GUNTER_OVERSCAN_ROWS) => {
  const totalRows = getGunterRowCount(grouping);

  if (!totalRows || !scroll || !scroll.wrapperHeight) {
    return {
      startIndex: 0,
      endIndex: -1,
    };
  }

  const wrapperHeight = scroll && scroll.wrapperHeight ? scroll.wrapperHeight : 0;
  const scrollTop = Math.abs((scroll && scroll.y) || 0);
  const startIndex = Math.max(0, Math.floor(scrollTop / GUNTER_ROW_HEIGHT) - overscan);
  const endIndex = Math.min(totalRows - 1, Math.floor((scrollTop + wrapperHeight - 1) / GUNTER_ROW_HEIGHT) + overscan);

  return {
    startIndex,
    endIndex,
  };
};

export const isSameGunterVisibleRange = (prev = {}, next = {}) => {
  return prev.startIndex === next.startIndex && prev.endIndex === next.endIndex;
};

const getVisibleRows = (rows = [], withoutArrangementVisible) => {
  return withoutArrangementVisible ? rows : rows.filter(row => row.diff > 0);
};

export const getVisibleGunterGroups = (grouping = [], visibleRange = {}, withoutArrangementVisible) => {
  const startIndex = Math.max(0, visibleRange.startIndex || 0);
  const endIndex = Number.isFinite(visibleRange.endIndex) ? visibleRange.endIndex : getGunterRowCount(grouping) - 1;

  if (endIndex < startIndex) {
    return [];
  }

  return grouping.reduce((result, group) => {
    const groupIndex = Number.isFinite(group.groupingIndex) ? group.groupingIndex : 0;
    const firstIndex = group.hide ? groupIndex + 1 : groupIndex;
    const lastIndex = (group.openCount || 0) - 1;

    if (lastIndex < startIndex || firstIndex > endIndex) {
      return result;
    }

    const groupVisible = !group.hide && groupIndex >= startIndex && groupIndex <= endIndex;
    const rows = [];

    if (group.subVisible) {
      const groupRows = getVisibleRows(group.rows, withoutArrangementVisible);
      const firstRowIndex = groupIndex + 1;
      const start = Math.max(0, startIndex - firstRowIndex);
      const end = Math.min(groupRows.length - 1, endIndex - firstRowIndex);

      for (let index = start; index <= end; index++) {
        rows.push({
          row: groupRows[index],
          index,
          rowIndex: firstRowIndex + index,
        });
      }
    }

    if (groupVisible || rows.length) {
      result.push({
        group,
        groupVisible,
        rows,
      });
    }

    return result;
  }, []);
};
