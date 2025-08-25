import React from 'react';
import { isEmpty } from 'lodash';
import _ from 'lodash';
import { SYSTEM_FIELD_TO_TEXT } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';
import { SYSTEM_CONTROL } from '../../config/widget';
import { CommonDisplay, EditModelWrap } from '../../styled';
import { isSheetDisplay } from '../../util';
import { getAdvanceSetting, getShowControls } from '../../util/setting';

export default function RelateSheet({ data = {}, isTab }) {
  const { enumDefault, hint = '', relationControls = [] } = data;
  const { showtype = String(enumDefault) } = getAdvanceSetting(data);

  const showControls = getShowControls(
    relationControls.concat(
      Object.keys(SYSTEM_FIELD_TO_TEXT).map(item => ({ controlId: item, controlName: SYSTEM_FIELD_TO_TEXT[item] })),
    ),
    data.showControls,
  );

  const getWidths = () => {
    const widths = getAdvanceSetting(data, 'widths') || [];
    if (isEmpty(widths)) return showControls.map(() => 160);
    if (widths.length === showControls.length) return widths;
    return showControls.map((v, i) => widths[i] || 160);
  };

  const widths = getWidths();
  const width = widths.reduce((p, c) => p + c, 0);

  const getDisplay = () => {
    // 卡片显示
    if (showtype === '1') {
      return (
        <CommonDisplay>
          <div className="intro">
            <i className="icon-add"></i>
            <span>{_l('记录')}</span>
          </div>
        </CommonDisplay>
      );
    }
    // 下拉框
    if (showtype === '3') {
      return (
        <CommonDisplay>
          <div>{hint}</div>
          <i className="icon-expand_more"></i>
        </CommonDisplay>
      );
    }
    if (isSheetDisplay(data)) {
      return (
        <EditModelWrap isTab={isTab}>
          {showControls.length > 0 ? (
            <div className="tableWrap" onMouseDown={e => e.stopPropagation()} onMouseMove={e => e.stopPropagation()}>
              <table style={{ width: `${width}px` }}>
                <thead>
                  <tr>
                    {showControls.map((controlId, index) => {
                      const { controlName, required } =
                        _.find((relationControls || []).concat(SYSTEM_CONTROL), item => item.controlId === controlId) ||
                        {};
                      return (
                        <th key={controlId} className="overflow_ellipsis" style={{ width: `${widths[index]}px` }}>
                          {required && <span>*</span>}
                          {controlName || SYSTEM_FIELD_TO_TEXT[controlId]}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {showControls.map((controlId, index) => {
                      return <td key={controlId} style={{ width: `${widths[index]}px` }}></td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="addControl Gray_9e">{_l('请从右侧选择要显示的字段')}</div>
          )}
        </EditModelWrap>
      );
    }
    return null;
  };

  return getDisplay();
}
