import React from 'react';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import { Icon } from 'ming-ui';
import _ from 'lodash';
import styled from 'styled-components';
import { getAdvanceSetting } from 'src/util';
import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/util';
import NumInput from './NumInput';
import { getCanDisplayControls } from 'src/pages/worksheet/common/ViewConfig/util.js';

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
const Wrap = styled.div`
  padding-left: 28px;
  .showCount {
    .text {
      right: 10px;
      top: 0px;
      line-height: 36px;
    }
  }
`;

// 显示字段
export default class DisplayControl extends React.Component {
  render() {
    const {
      appId,
      worksheetControls,
      view = {},
      text,
      handleChange,
      handleChangeSort,
      fromRelative,
      maxCount3,
      hideShowControlName,
      isShowWorkflowSys,
      canShowCount,
    } = this.props;
    let data = !fromRelative ? view : this.props;
    let { displayControls = [], showControlName = true, controlsSorts } = data;
    const controlIds = isShowWorkflowSys
      ? worksheetControls.map(o => o.controlId).concat([...NORMAL_SYSTEM_FIELDS_SORT, ...WORKFLOW_SYSTEM_FIELDS_SORT])
      : worksheetControls.map(o => o.controlId).concat(NORMAL_SYSTEM_FIELDS_SORT);
    displayControls = displayControls.filter(c => controlIds.includes(c)); //排除已删除的控件
    const allCanDisplayControls = getCanDisplayControls(worksheetControls);
    const { appshowtype = '0' } = getAdvanceSetting(view);
    const showControls = maxCount3 ? displayControls.slice(0, 3) : displayControls;
    //有效的配置字段
    const effectiveControls = showControls.filter(o => allCanDisplayControls.find(it => it.controlId === o));
    return (
      <div className="mTop32">
        <div className="title Font13 bold">{_l('显示字段')}</div>
        {text && <p className="mTop6 Gray_9e viewSetText">{text}</p>}
        <div className="settingContent mTop8">
          <SortColumns
            //关联表的设置 可拖拽排序
            noempty={false} //不需要至少显示一列
            controlsSorts={controlsSorts}
            downElement={this.props.downElement}
            showControls={showControls}
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
        {/* 移动端只有appshowtype==='1'才能选择是否显示字段名称 */}
        {(!hideShowControlName || (hideShowControlName && !['0', '2'].includes(appshowtype))) && (
          <div className="configSwitch mTop10">
            <SwitchStyle className="flexRow alignItemsCenter">
              <Icon
                icon={showControlName ? 'ic_toggle_on' : 'ic_toggle_off'}
                className="Font28 Hand"
                onClick={() => {
                  handleChange({ showControlName: !showControlName, editAttrs: ['showControlName'] });
                }}
              />
              <div className="switchText InlineBlock Normal mLeft10">{_l('显示字段名称')}</div>
            </SwitchStyle>
          </div>
        )}
        {canShowCount && (
          <div className="configSwitch mTop4">
            <SwitchStyle className="flexRow alignItemsCenter">
              <Icon
                icon={
                  !!_.get(view, 'advancedSetting.showcount') && effectiveControls.length > 0
                    ? 'ic_toggle_on'
                    : 'ic_toggle_off'
                }
                className="Font28 Hand"
                onClick={() => {
                  if (effectiveControls.length <= 0) {
                    return;
                  }
                  const showcount = !!_.get(view, 'advancedSetting.showcount')
                    ? undefined
                    : effectiveControls.length > 3
                    ? 3
                    : effectiveControls.length;
                  this.props.updateCurrentView({
                    ...view,
                    appId,
                    advancedSetting: {
                      showcount,
                    },
                    editAttrs: ['advancedSetting'],
                    editAdKeys: ['showcount'],
                  });
                  !!this.props.updateViewShowcount && this.props.updateViewShowcount(showcount);
                }}
              />
              <div className="switchText InlineBlock Normal mLeft10">{_l('允许用户调整字段数量')}</div>
            </SwitchStyle>
            {!!_.get(view, 'advancedSetting.showcount') && effectiveControls.length > 0 && (
              <Wrap className="flexRow alignItemsCenter mTop10">
                <span className="mLeft10">{_l('默认显示前')}</span>
                <div className="flex mLeft12 showCount flexRow alignItemsCenter">
                  <NumInput
                    className="flex"
                    minNum={0}
                    maxNum={effectiveControls.length}
                    value={
                      Number(_.get(view, 'advancedSetting.showcount')) > effectiveControls.length
                        ? effectiveControls.length
                        : Number(_.get(view, 'advancedSetting.showcount'))
                    }
                    onChange={value => {
                      let count = JSON.stringify(effectiveControls.length >= value ? value : effectiveControls.length);
                      if (count === _.get(view, 'advancedSetting.showcount')) {
                        return;
                      }
                      this.props.updateCurrentView({
                        ...view,
                        appId,
                        advancedSetting: {
                          showcount: count,
                        },
                        editAttrs: ['advancedSetting'],
                        editAdKeys: ['showcount'],
                      });
                      !!this.props.updateViewShowcount && this.props.updateViewShowcount(count);
                    }}
                  />
                  <span className="pLeft10">{_l('个')}</span>
                </div>
              </Wrap>
            )}
          </div>
        )}
      </div>
    );
  }
}
