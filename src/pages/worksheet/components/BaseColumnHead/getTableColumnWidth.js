import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
import CellControl from 'worksheet/components/CellControls';

export default function getTableColumnWidth(
  tableDom = document.querySelector('.sheetViewTable'),
  rows,
  control,
  columnStyle,
  worksheetId,
) {
  try {
    let result = 60;
    function getValueWidthOfRow(row) {
      const conForRender = document.createElement('div');
      conForRender.style.zIndex = '-1';
      conForRender.style.display = 'inline-block';
      conForRender.style.position = 'absolute';
      conForRender.style.top = '-10000px';
      conForRender.style.left = '-10000px';
      if (_.includes([29], control.type)) {
        conForRender.style.width = '200px';
      } else {
        conForRender.style.maxWidth = '600px';
        conForRender.style.display = 'inline-block';
      }
      conForRender.style.position = 'relative';
      conForRender.style.zIndex = 999;
      conForRender.style.backgroundColor = '#fff';
      conForRender.style.top = '0px';
      conForRender.style.left = '0px';
      flushSync(() => {
        createRoot(conForRender).render(
          <CellControl
            cell={{ ...control, value: row[control.controlId] }}
            columnStyle={columnStyle}
            worksheetId={worksheetId}
            row={row}
            isCharge={false}
          />,
        );
      });
      tableDom.appendChild(conForRender);
      if (!conForRender.children[0]) {
        conForRender.remove();
        return 150;
      }
      let width = conForRender.children[0].offsetWidth;
      conForRender.remove();
      if (width < 60) {
        width = 60;
      }
      if (width > 600) {
        width = 600;
      }
      return width;
    }
    rows.forEach(row => {
      const width = getValueWidthOfRow(row);
      if (width > result) {
        result = width;
      }
    });
    return Math.ceil(result) + 15;
  } catch (err) {
    console.log(err);
    return 150;
  }
}

export function getMaxControlNameWidthOfControls(controls) {
  function getControlNameWidth(control) {
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
