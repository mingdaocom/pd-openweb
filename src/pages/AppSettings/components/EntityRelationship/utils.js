import { WIDGETS_TO_API_TYPE_ENUM, DEFAULT_CONFIG } from 'src/pages/widgetConfig/config/widget';
import _ from 'lodash';

export function getControlTypeInfo(type) {
  const key = _.findKey(WIDGETS_TO_API_TYPE_ENUM, o => o === type);
  return DEFAULT_CONFIG[key] || {};
}

export function isBothWayRelate(control, sourceWorksheet) {
  const sourceControls = sourceWorksheet.controls || [];
  if (
    !control.dataSource ||
    !control.sourceControlId ||
    !sourceControls.find(l => l.controlId === control.sourceControlId) ||
    control.type !== 29
  ) {
    return false;
  }
  return true;
}

export function createLabelOption(control, sourceWorksheet) {
  const texts = ['', '1'];

  texts[1] = control.enumDefault === 1 ? '1' : 'N';
  if (isBothWayRelate(control, sourceWorksheet)) {
    const sourceControls = sourceWorksheet.controls || [];
    const sourceControl = sourceControls.find(l => l.controlId === control.sourceControlId);
    texts[0] = sourceControl.enumDefault === 1 ? '1' : 'N';
  }

  return [
    {
      markup: [
        {
          tagName: 'text',
          selector: 'txt',
        },
      ],
      attrs: {
        txt: {
          fill: '#333',
          fontSize: 13,
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          pointerEvents: 'none',
          text: texts[0],
        },
      },
      position: {
        distance: 15,
        offset: -10,
      },
    },
    {
      markup: [
        {
          tagName: 'text',
          selector: 'txt',
        },
      ],
      attrs: {
        txt: {
          fill: '#333',
          fontSize: 13,
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          pointerEvents: 'none',
          text: texts[1],
        },
      },
      position: {
        distance: -15,
        offset: -10,
      },
    },
  ];
}

export const LINE_HEIGHT = 24;
export const NODE_WIDTH = 180;

export const HIDE_FIELDS = [43, 10010, 22, 52, 45, 49];
