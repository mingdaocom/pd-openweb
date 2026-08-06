const state = {
  chartScrollLocked: false,
  groupingScrollLocked: false,
  recordDragging: false,
};

export const setChartScrollLock = locked => {
  state.chartScrollLocked = locked;
};

export const setGroupingScrollLock = locked => {
  state.groupingScrollLocked = locked;
};

export const isChartScrollLocked = () => state.chartScrollLocked;

export const isGroupingScrollLocked = () => state.groupingScrollLocked;

export const setRecordDragging = dragging => {
  state.recordDragging = dragging;
};

export const isRecordDragging = () => state.recordDragging;
