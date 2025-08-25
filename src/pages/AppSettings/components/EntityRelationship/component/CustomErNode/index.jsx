import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { getVisibleControls } from 'src/pages/Print/util';
import { dialogEditWorksheet } from 'src/pages/widgetConfig';
import { DEFAULT_CONFIG, WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { renderDialog } from 'src/pages/widgetConfig/widgetSetting/components/WorksheetReference/index';
import { getTranslateInfo } from 'src/utils/app';
import { iconSvg } from '../../config';
import { HIDE_FIELDS, LINE_HEIGHT, NODE_WIDTH } from '../../utils';
import './index.less';

const TIPS = [_l('焦点'), _l('编辑表单')];

const Menu = styled.ul`
  width: 160px;
  background: #ffffff;
  box-shadow: 0px 4px 20px 1px rgba(0, 0, 0, 0.16);
  border-radius: 2px;
  padding: 6px 0;
  li {
    height: 36px;
    line-height: 36px;
    padding: 0 20px;
    &:hover {
      background-color: #1e88e5;
      color: #fff;
    }
  }
`;

export default function CustomErNode(props) {
  const { node } = props;

  const data = _.get(node, 'store.data.data');
  const { item, controls, height, list, updateSource, appId, count, filter, allControls, onFilter } = data;
  const worksheetName = getTranslateInfo(appId, null, item.worksheetId).name || item.worksheetName;

  const [visible, setVisible] = useState(false);

  const onClose = async () => {
    const newWorksheetInfo = await sheetAjax.getWorksheetInfo({
      getTemplate: true,
      worksheetId: item.worksheetId,
    });
    const newAllControls = _.get(newWorksheetInfo, 'template.controls').filter(l => l.controlId.length === 24);
    const newControls = getVisibleControls(newAllControls)
      .filter(l => !HIDE_FIELDS.includes(l.type))
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
    setVisible(false);
    dialogEditWorksheet({
      worksheetId: item.worksheetId,
      onClose,
    });
  };

  const openRelation = () => {
    setVisible(false);
    renderDialog({
      globalSheetInfo: {
        appId,
        worksheetId: item.worksheetId,
        worksheetList: data.list,
        name: worksheetName,
      },
      type: 2,
    });
  };

  const getTip = sign => {
    return { [window.isSafari ? 'title' : 'data-tip']: TIPS[sign] };
  };

  const renderMoreOp = () => {
    return (
      <Trigger
        popupVisible={visible}
        onPopupVisibleChange={value => setVisible(value)}
        action={['click']}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [0, 10],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={() => (
          <Menu>
            <li className="overflow_ellipsis Hand" onClick={openEdit}>
              {_l('编辑表单')}
            </li>
            <li className="overflow_ellipsis Hand" onClick={openRelation}>
              {_l('查看引用')}
            </li>
          </Menu>
        )}
      >
        <span className="Gray_9e Hover_21 Hand">
          <Icon icon="more_horiz" className="Font14 Hover_21" />
        </span>
      </Trigger>
    );
  };

  return (
    <div
      className={cx('customErNode', { searchCurrent: filter === item.worksheetId })}
      id={`customErNode-${item.worksheetId}`}
    >
      <div className="nodeTitle valignWrapper">
        <span className="Font14 Bold overflow_ellipsis">{worksheetName}</span>
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
        {renderMoreOp()}
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
