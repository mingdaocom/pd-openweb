import { sum } from 'lodash';
import { useCallback, useMemo, useState } from 'react';

const defaultWidth = 200;

export default function useTableWidth(props) {
  const { width, visibleControls = [], sheetColumnWidths = {} } = props;
  const sumControlWidth = useCallback(
    controls =>
      sum(
        controls.map(
          control => (sheetColumnWidths[control.controlId] || control.width || 0) + (control.appendWidth || 0),
        ),
      ),
    [sheetColumnWidths],
  );
  const summedWidth = useMemo(
    () => sumControlWidth(visibleControls.map(c => ({ ...c, width: c.width || defaultWidth }))),
    [visibleControls],
  );
  const averageWidth = useMemo(
    () =>
      summedWidth < width &&
      (width - sumControlWidth(visibleControls)) /
        visibleControls.filter(c => !(sheetColumnWidths[c.controlId] || c.width)).length,
    [width, summedWidth],
  );
  const getWidth = useCallback(
    index => {
      const control = visibleControls[index] || {};
      return (
        (control.width || sheetColumnWidths[control.controlId] || averageWidth || 200) + (control.appendWidth || 0)
      );
    },
    [visibleControls, sheetColumnWidths, averageWidth],
  );
  return getWidth;
}
