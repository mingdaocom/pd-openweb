import React, { useState } from 'react';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dropdown, Icon } from 'ming-ui';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import { getSummaryInfo } from 'src/utils/record';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import SelectControl from '../../SelectControl';

const TotalConfigWrap = styled.div`
  .addTotalControl {
    margin-top: 12px;
    line-height: 32px;
    color: #757575;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
    &:hover {
      color: #2196f3;
    }
    &.disabled {
      color: #9e9e9e;
      cursor: not-allowed;
    }
  }
  .totalItem {
    display: flex;
    align-items: center;
    margin-top: 12px;
    .controlName {
      flex: 1;
      padding: 0 12px;
      margin-right: 12px;
      height: 36px;
      line-height: 36px;
      border-radius: 3px;
      border: 1px solid #dddddd;
    }
    .ming.Dropdown {
      .Menu.List {
        width: 100%;
      }
    }
    .deleteBtn {
      color: #9d9d9d;
      font-size: 16px;
      cursor: pointer;
      margin-left: 12px;
      &:hover {
        color: #f44336;
      }
    }
  }
`;

export default function ReportConfig(props) {
  const { data, controls = [], handleChange } = props;
  const [visible, setVisible] = useState(false);
  const { chooseshow = '0' } = getAdvanceSetting(data);
  const chooseshowids = getAdvanceSetting(data, 'chooseshowids') || [];
  const reportsetting = getAdvanceSetting(data, 'reportsetting') || [];
  const isDisabled = reportsetting.length >= 10;

  const getTypeList = controlId => {
    const control = _.find(controls, c => c.controlId === controlId);
    if (!control) return [];
    let type = control.sourceControlType || control.type;
    const summaryInfo = getSummaryInfo(type, control);
    // 过滤【不显示】
    return (summaryInfo.list || []).filter(_.identity).filter(item => !(item.type === 'COMMON' && !item.value));
  };

  const renderItem = item => {
    const currentControl = _.find(controls, c => c.controlId === item.controlId) || {};
    const dropData = getTypeList(item.controlId)
      .filter(_.identity)
      .map(i => ({ text: i.label, value: i.value }));
    const isDelete = !currentControl.controlName;
    return (
      <div className="totalItem">
        <div className={cx('controlName overflow_ellipsis', { Red: isDelete })}>
          {currentControl.controlName || _l('已删除')}
        </div>
        <Dropdown
          className="flex"
          border
          value={isDelete ? undefined : item.type}
          placeholder={isDelete ? <span className="Red">{_l('已删除')}</span> : _l('请选择')}
          data={dropData}
          onChange={value => {
            const newSettings = reportsetting.map(i => (i.controlId === item.controlId ? { ...i, type: value } : i));
            handleChange(handleAdvancedSettingChange(data, { reportsetting: JSON.stringify(newSettings) }));
          }}
        />
        <Icon
          className="deleteBtn"
          icon="delete1"
          onClick={() => {
            const newSettings = reportsetting.filter(i => i.controlId !== item.controlId);
            handleChange(handleAdvancedSettingChange(data, { reportsetting: JSON.stringify(newSettings) }));
          }}
        />
      </div>
    );
  };

  return (
    <TotalConfigWrap>
      {reportsetting.length > 0 && reportsetting.map(r => renderItem(r))}
      <Trigger
        action={['click']}
        popupVisible={visible}
        onPopupVisibleChange={visible => {
          if (isDisabled) return;
          setVisible(visible);
        }}
        popupStyle={{ width: 350 }}
        popup={
          <SelectControl
            list={filterOnlyShowField(controls).filter(({ controlId, type, sourceControlType, strDefault }) => {
              let currentType = type === 30 ? sourceControlType : type;
              const showIds = chooseshow === '0' ? data.showControls : chooseshowids;
              if (!_.includes(showIds, controlId)) return false;
              if (
                _.includes([22, 25, 33, 34, 43, 45, 47, 49, 51, 52, 54, 10010], currentType) ||
                (type === 30 && strDefault === '10')
              )
                return false;
              if (_.find(reportsetting, r => r.controlId === controlId)) return false;
              return true;
            })}
            onClick={item => {
              if (isDisabled) {
                alert('最多添加10个', 3);
                return;
              }
              const newSettings = reportsetting.concat([
                { controlId: item.controlId, type: _.get(getTypeList(item.controlId), '0.value') },
              ]);
              handleChange(handleAdvancedSettingChange(data, { reportsetting: JSON.stringify(newSettings) }));
              if (newSettings.length >= 10) setVisible(false);
            }}
          />
        }
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 3],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
      >
        <div className={cx('addTotalControl pointer', { disabled: isDisabled })}>
          <span className="icon-add Font18" />
          {_l('添加字段')}
        </div>
      </Trigger>
    </TotalConfigWrap>
  );
}
