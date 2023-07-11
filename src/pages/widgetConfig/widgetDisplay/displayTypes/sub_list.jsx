import React, { Fragment } from 'react';
import { EditModelWrap, EmptySheetPlaceHolder } from '../../styled';
import { getAdvanceSetting, getShowControls } from '../../util/setting';
import { SYSTEM_FIELD_TO_TEXT } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';
import { isEmpty } from 'lodash';

export default function SubList({ data }) {
  const { relationControls = [], desc = '' } = data;
  const showControls = getShowControls(
    relationControls.concat(
      Object.keys(SYSTEM_FIELD_TO_TEXT).map(item => ({ controlId: item, controlName: SYSTEM_FIELD_TO_TEXT[item] })),
    ),
    data.showControls,
  );

  const getWidths = () => {
    const widths = getAdvanceSetting(data, 'widths') || [];
    if (isEmpty(widths)) return showControls.map(item => 160);
    if (widths.length === showControls.length) return widths;
    return showControls.map((v, i) => widths[i] || 160);
  };

  const widths = getWidths();
  const width = widths.reduce((p, c) => p + c, 0);

  if (isEmpty(relationControls)) {
    return <EmptySheetPlaceHolder>{_l('请在右侧配置区添加子表字段')}</EmptySheetPlaceHolder>;
  }

  return (
    <Fragment>
      {
        <EditModelWrap>
          {desc && <div className="desc subList">{desc}</div>}
          {showControls.length > 0 ? (
            <div className="tableWrap" onMouseDown={e => e.stopPropagation()} onMouseMove={e => e.stopPropagation()}>
              <table style={{ width: `${width}px` }}>
                <thead>
                  <tr>
                    {showControls.map((controlId, index) => {
                      const { controlName, required } =
                        _.find(relationControls, item => item.controlId === controlId) || {};
                      return (
                        <th key={controlId} className="overflow_ellipsis" style={{ width: `${widths[index]}px` }}>
                          {required && <span>{_l('*')}</span>}
                          {controlName || SYSTEM_FIELD_TO_TEXT[controlId]}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {showControls.map((controlId, index) => {
                      const {
                        enumDefault,
                        type,
                        advancedSetting = {},
                      } = _.find(relationControls, item => item.controlId === controlId) || {};
                      return (
                        <td key={controlId} style={{ width: `${widths[index]}px` }}>
                          {(type === 34 ||
                            type === 45 ||
                            type === 49 ||
                            type === 51 ||
                            (type === 29 && String(enumDefault) === '2' && advancedSetting.showtype === '2')) && (
                            <span className="Gray_75 unSupport">{_l('不支持此类型字段')}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="addControl Gray_9e">{_l('请在右侧添加字段')}</div>
          )}
        </EditModelWrap>
      }
    </Fragment>
  );
}
