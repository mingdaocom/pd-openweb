import React, { useState, useEffect, Fragment } from 'react';
import { isEmpty } from 'lodash';
import { CommonDisplay, EditModelWrap } from '../../styled';
import { getAdvanceSetting, getShowControls } from '../../util/setting';
import { isSheetDisplay } from '../../util';
import worksheetAjax from 'src/api/worksheet';
import { SYSTEM_FIELD_TO_TEXT } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';

const SYSTEM_CONTROL = Object.keys(SYSTEM_FIELD_TO_TEXT).map(item => ({
  controlId: item,
  controlName: SYSTEM_FIELD_TO_TEXT[item],
}));

export default function RelationSearch({ data = {}, fromType, isTab }) {
  const { enumDefault, hint = '', dataSource, controlId } = data;
  const { showtype = String(enumDefault) } = getAdvanceSetting(data);
  const [controls, setControls] = useState([]);

  useEffect(() => {
    // 公开表单relationControls需要掉接口
    if (fromType === 'public') {
      if (!dataSource) return;
      worksheetAjax.getWorksheetInfo({ worksheetId: dataSource, getTemplate: true, getViews: true }).then(res => {
        const { template } = res;
        setControls(_.get(template, 'controls') || []);
      });
    }
  }, [controlId]);

  const relationControls = fromType === 'public' ? controls : data.relationControls || [];
  const showControls = getShowControls(relationControls.concat(SYSTEM_CONTROL), data.showControls);

  const getWidths = () => {
    const widths = getAdvanceSetting(data, 'widths') || [];
    if (isEmpty(widths)) return showControls.map(item => 160);
    if (widths.length === showControls.length) return widths;
    return showControls.map((v, i) => widths[i] || 160);
  };

  const widths = getWidths();
  const width = widths.reduce((p, c) => p + c, 0);

  const getDisplay = () => {
    // 卡片显示
    if (showtype === '1' || showtype === '3' || enumDefault === 1) {
      return <CommonDisplay></CommonDisplay>;
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
                          {controlName}
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
