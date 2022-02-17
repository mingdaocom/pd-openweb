import React from 'react';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import { Icon } from 'ming-ui';
import styled from 'styled-components';
import { getAdvanceSetting } from 'src/util';
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
      currentSheetInfo,
      updateCurrentView,
      view,
      appId,
      text,
      handleChange,
      handleChangeSort,
      // min1msg,
      fromRelative,
      maxCount3,
      forMobile,
    } = this.props;
    let data = !fromRelative ? view : this.props;
    let { displayControls = [], showControlName = true, controlsSorts } = data;
    const controlIds = worksheetControls.map(o => o.controlId);
    displayControls = displayControls.filter(c => controlIds.includes(c)); //排除已删除的控件
    const allCanDisplayControls = worksheetControls.filter(
      c =>
        c.attribute !== 1 &&
        !!c.controlName &&
        !_.includes([22, 10010, 43, 45], c.type) &&
        //除了关联表多条下拉和列表
        !(
          (
            _.includes([29], c.type) &&
            c.enumDefault === 2 && // enumDefault: 1, // 数量1-一条， 2-多条
            ['3', '2'].includes(_.get(c.advancedSetting || {}, 'showtype'))
          )
          // 1: _l('卡片'),2: _l('列表'),3: _l('下拉框'),
        ),
    );
    const { appshowtype } = getAdvanceSetting(view);
    return (
      <div className="mTop32">
        <div className="title Font13 bold">
          {_l('显示字段')}
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
            // dragable={!fromRelative}
            // min1msg={min1msg ? min1msg : null}
            noempty={false} //不需要至少显示一列
            controlsSorts={controlsSorts}
            showControls={maxCount3 ? displayControls.slice(0, 3) : displayControls}
            columns={allCanDisplayControls}
            onChange={({ newControlSorts, newShowControls }) => {
              if (maxCount3 && newShowControls.length > 3) {
                alert(_l('一行三列布局时，最多只能设置3个显示字段'));
                return;
              } else {
                handleChangeSort({ newControlSorts, newShowControls });
              }
            }}
          />
        </div>
      </div>
    );
  }
}
