import React from 'react';
import _ from 'lodash';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { dialogEditWorksheet } from 'ming-ui/functions';
import { WIDGETS_TO_API_TYPE_ENUM, DEFAULT_CONFIG } from 'src/pages/widgetConfig/config/widget';
import sheetAjax from 'src/api/worksheet';
import { getVisibleControls } from 'src/pages/Print/util';
import { LINE_HEIGHT, NODE_WIDTH, HIDE_FIELDS } from '../../utils';
import { iconSvg } from '../../config';
import { getTranslateInfo } from 'src/util';
import './index.less';

const TIPS = [_l('焦点'), _l('编辑表单')];

export default function CustomErNode(props) {
  const { node } = props;

  const data = _.get(node, 'store.data.data');
  const { item, controls, height, list, updateSource, appId, count, filter, allControls, onFilter } = data;

  const onClose = async () => {
    const newWorksheetInfo = await sheetAjax.getWorksheetInfo({
      getTemplate: true,
      worksheetId: item.worksheetId,
    });
    const newAllControls = _.get(newWorksheetInfo, 'template.controls').filter(l => l.controlId.length === 24);
    const newControls = getVisibleControls(newAllControls)
      .filter((l, i) => !HIDE_FIELDS.includes(l.type))
      .map(l => _.pick(l, ['controlId', 'controlName', 'dataSource', 'enumDefault', 'sourceControlId', 'type']));
    const lastData = _.get(node, 'store.data.data');
    const index = _.findIndex(list, l => l.worksheetId === item.worksheetId);
    lastData.list[index].controls = newControls;
    node.updateData({ controls: newControls.slice(0, 10), list: lastData.list });
    node.size({ width: NODE_WIDTH, height: (newControls.slice(0, 10).length + 1) * LINE_HEIGHT + 59 });

    if (
      allControls.length !== newAllControls.length ||
      _.some(newAllControls, m => !allControls.find(l => l.controlId === m.controlId))
    ) {
      updateSource({
        worksheetId: item.worksheetId,
        list,
        newControls,
        allControls: newAllControls,
      });
    }
  };

  const openEdit = () => {
    dialogEditWorksheet({
      worksheetId: item.worksheetId,
      onClose,
    });
  };

  const getTip = sign => {
    return { [window.isSafari ? 'title' : 'data-tip']: TIPS[sign] };
  };

  return (
    <div
      className={cx('customErNode', { searchCurrent: filter === item.worksheetId })}
      id={`customErNode-${item.worksheetId}`}
    >
      <div className="nodeTitle valignWrapper">
        <span className="Font14 Bold overflow_ellipsis">
          {getTranslateInfo(appId, null, item.worksheetId).name || item.worksheetName}
        </span>
        {(!!item.start || !!item.end) && (
          <span
            className="editIconBox Gray_9e Hover_21 Hand"
            onClick={() => onFilter({ worksheetId: item.worksheetId, list })}
          >
            <span {...getTip(0)}>
              <Icon icon="gps_fixed" className="Font14 editIcon Hover_21" />
            </span>
          </span>
        )}
        <span className="editIconBox Gray_9e Hover_21 Hand" onClick={openEdit}>
          <span {...getTip(1)}>
            <Icon icon="edit" className="Font14 editIcon Hover_21" />
          </span>
        </span>
      </div>
      <div className="splitLint"></div>
      {controls.map(control => {
        const controlName = getTranslateInfo(appId, null, control.controlId).name || control.controlName;
        return (
          <div
            className="nodeControlItem valignWrapper"
            key={`customErNode-control-${item.worksheetId}-
            ${control.controlId}`}
            style={{ height: height || 32, lineHeight: `${height || 32}px` }}
          >
            <svg
              className="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              width="200"
              height="200"
            >
              {
                iconSvg[
                  (
                    _.get(DEFAULT_CONFIG[_.findKey(WIDGETS_TO_API_TYPE_ENUM, l => l === control.type)], 'icon') || ''
                  ).replace('-', '_')
                ]
              }
            </svg>
            <span className="overflow_ellipsis flex Font12">{controlName}</span>
          </div>
        );
      })}
      <div className="count Font12 Gray_9e" style={{ height: height || 32, lineHeight: `${height || 32}px` }}>
        {_l('共%0个字段', count)}
      </div>
    </div>
  );
}
