import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
import CellControl from 'worksheet/components/CellControls';
import AntdConfigProvider from 'src/common/providers/theme/AntdConfigProvider';

const MEASURE_ITEM_CLASS = 'columnWidthMeasureItem';

export default function getTableColumnWidth(
  tableDom = document.querySelector('.sheetViewTable'),
  rows,
  control,
  columnStyle,
  worksheetId,
) {
  try {
    let result = 60;

    if (!_.isArray(rows)) {
      return 150;
    }

    if (!rows.length) {
      return Math.ceil(result) + 15;
    }

    // 所有行放在同一个临时 root 里一次性渲染再统一量宽度：
    // 按行逐个 createRoot + flushSync 会在「适合内容（所有列）」这类批量场景下产生
    // 列数 × 行数 次同步渲染和重排，而且这些 root 只移除了 DOM 没有 unmount，
    // 里面的组件副作用一直留着，页面会直接卡住
    const conForRender = document.createElement('div');
    conForRender.style.position = 'absolute';
    conForRender.style.top = '-10000px';
    conForRender.style.left = '-10000px';
    conForRender.style.zIndex = '-1';
    conForRender.style.backgroundColor = '#fff';
    (tableDom || document.body).appendChild(conForRender);
    const itemStyle = _.includes([29], control.type)
      ? { width: 200, display: 'inline-block' }
      : { maxWidth: 600, display: 'inline-block' };
    const root = createRoot(conForRender);

    try {
      flushSync(() => {
        root.render(
          <AntdConfigProvider>
            {rows.map((row, index) => (
              <div key={index} className={MEASURE_ITEM_CLASS} style={itemStyle}>
                <CellControl
                  cell={{ ...control, value: row[control.controlId] }}
                  columnStyle={columnStyle}
                  worksheetId={worksheetId}
                  row={row}
                  isCharge={false}
                />
              </div>
            ))}
          </AntdConfigProvider>,
        );
      });
      conForRender.querySelectorAll(`.${MEASURE_ITEM_CLASS}`).forEach(item => {
        const cell = item.children[0];
        let width = cell ? cell.offsetWidth : 150;

        if (width < 60) {
          width = 60;
        }

        if (width > 600) {
          width = 600;
        }

        if (width > result) {
          result = width;
        }
      });
    } finally {
      root.unmount();
      conForRender.remove();
    }

    return Math.ceil(result) + 15;
  } catch (err) {
    console.log(err);
    return 150;
  }
}

export function getMaxControlNameWidthOfControls(controls) {
  function getControlNameWidth(control) {
    if (!document.body) {
      return 60;
    }

    const conForRender = document.createElement('div');
    conForRender.style.zIndex = '-1';
    conForRender.style.display = 'inline-block';
    conForRender.style.position = 'absolute';
    conForRender.style.top = '-10000px';
    conForRender.style.left = '-10000px';
    conForRender.style.maxWidth = '320px';
    conForRender.style.backgroundColor = '#fff';
    conForRender.style.fontWeight = 'bold';
    conForRender.style.fontSize = 13;
    conForRender.innerText = control.controlName;
    document.body.appendChild(conForRender);
    let width = conForRender.offsetWidth;
    conForRender.remove();
    if (width < 60) {
      width = 60;
    }

    width = width + 12 * 2 + 15;
    if (width > 320) {
      width = 320;
    }

    return width;
  }

  let result = 60;
  controls.forEach(control => {
    const widthOfControl = getControlNameWidth(control);

    if (widthOfControl > result) {
      result = widthOfControl;
    }
  });
  return result;
}
