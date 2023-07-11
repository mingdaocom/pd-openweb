import React from 'react';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import { Icon } from 'ming-ui';
import _ from 'lodash';
import styled from 'styled-components';
import { getAdvanceSetting } from 'src/util';
import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/util';
export const SwitchStyle = styled.div`
  display: inline-block;
  .switchText {
    margin-right: 6px;
    line-height: 24px;
  }
  .icon {
    vertical-align: middle;
    &-ic_toggle_on {
      color: #00c345;
    }
    &-ic_toggle_off {
      color: #bdbdbd;
    }
  }
`;

// 显示字段
export default class DisplayControl extends React.Component {
  render() {
    const {
      worksheetControls,
      view = {},
      text,
      handleChange,
      handleChangeSort,
      fromRelative,
      maxCount3,
      forMobile,
      isShowWorkflowSys,
    } = this.props;
    let data = !fromRelative ? view : this.props;
    let { displayControls = [], showControlName = true, controlsSorts } = data;
    const controlIds = isShowWorkflowSys
      ? worksheetControls.map(o => o.controlId).concat([...NORMAL_SYSTEM_FIELDS_SORT, ...WORKFLOW_SYSTEM_FIELDS_SORT])
      : worksheetControls.map(o => o.controlId).concat(NORMAL_SYSTEM_FIELDS_SORT);
    displayControls = displayControls.filter(c => controlIds.includes(c)); //排除已删除的控件
    const allCanDisplayControls = worksheetControls.filter(
      c => c.attribute !== 1 && !!c.controlName && !_.includes([22, 10010, 43, 45, 47, 49, 51], c.type),
    );
    const { appshowtype = '0' } = getAdvanceSetting(view);
    return (
      <div className="mTop32">
        <div className="title Font13 bold">
          {_l('显示字段')}
          {/* 移动端只有appshowtype==='1'才能选择是否显示字段名称 */}
          {(!forMobile || (forMobile && !['0', '2'].includes(appshowtype))) && (
            <div className="configSwitch Right">
              <SwitchStyle>
                <div className="switchText InlineBlock Normal Gray_9e">{_l('显示字段名称')}</div>
                <Icon
                  icon={showControlName ? 'ic_toggle_on' : 'ic_toggle_off'}
                  className="Font24 Hand"
                  onClick={() => {
                    handleChange(!showControlName);
                  }}
                />
              </SwitchStyle>
            </div>
          )}
        </div>
        {text && <p className="mTop6 Gray_9e viewSetText">{text}</p>}
        <div className="settingContent mTop8">
          <SortColumns
            //关联表的设置 可拖拽排序
            noempty={false} //不需要至少显示一列
            controlsSorts={controlsSorts}
            showControls={maxCount3 ? displayControls.slice(0, 3) : displayControls}
            columns={allCanDisplayControls}
            viewType={view.viewType}
            onChange={({ newControlSorts, newShowControls }) => {
              let showList = newShowControls.filter(c => allCanDisplayControls.map(o => o.controlId).includes(c));
              if (maxCount3 && showList.length > 3) {
                alert(_l('一行三列布局时，最多只能设置3个显示字段'), 3);
                return;
              } else {
                handleChangeSort({ newControlSorts, newShowControls: showList });
              }
            }}
          />
        </div>
      </div>
    );
  }
}
