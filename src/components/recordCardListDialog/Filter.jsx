import React, { useState } from 'react';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import Conditions from 'src/pages/worksheet/common/Sheet/QuickFilter/Conditions';
import _ from 'lodash';
const ClickAwayable = createDecoratedComponent(withClickAway);

const Popup = styled.div`
  background: #fff;
  width: 400px;
  padding: 20px 0;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.16);
  .selectRecordConditions {
    .conditionItem {
      margin-bottom: 16px;
    }
    .label {
      text-align: left;
    }
    .buttons {
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: row-reverse;
      margin: 4px 10px 0 0 !important;
      .Button {
        height: 36px;
        margin: 0 0 0 15px !important;
      }
    }
  }
`;

const Icon = styled.div`
  font-size: 18px;
  color: ${({ active }) => (active ? '#2196f3' : '#9e9e9e')};
  cursor: pointer;
  &:hover {
    color: #2196f3;
  }
`;

function formatSearchFilters(filters = [], controls = []) {
  return filters.map(f => {
    const control = _.find(controls, { controlId: f.controlId });
    if (control && _.includes([6, 8], control.type)) {
      f.filterType = 11;
    }
    if (
      control &&
      _.includes(
        [
          WIDGETS_TO_API_TYPE_ENUM.TEXT, // 文本
          WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 电话号码
          WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机号码
          WIDGETS_TO_API_TYPE_ENUM.EMAIL, // 邮件地址
          WIDGETS_TO_API_TYPE_ENUM.CRED, // 证件
          WIDGETS_TO_API_TYPE_ENUM.CONCATENATE, // 文本组合
          WIDGETS_TO_API_TYPE_ENUM.AUTO_ID, // 自动编号
        ],
        control.type,
      )
    ) {
      f.filterType = 1;
    }
    if (control && _.includes([10], control.type)) {
      f.advancedSetting.allowitem = '2';
    }
    return f;
  });
}

export default function Header(props) {
  const { projectId, searchFilters, controls, quickFilters, onFilter, control = {} } = props;
  const [popupVisible, setPopupVisible] = useState(false);
  return (
    <Trigger
      action={['click']}
      popupVisible={popupVisible}
      popup={
        <ClickAwayable
          specialFilter={target => {
            const $targetTarget = $(target).closest(
              [
                '.dropdownTrigger',
                '.addFilterPopup',
                '.filterControlOptionsList',
                '.mui-datetimepicker',
                '.mui-datetimerangepicker',
                '.selectUserBox',
                '.CityPicker',
                '.worksheetFilterOperateList',
                '.ant-select-dropdown',
                '.ant-picker-dropdown',
                '.rc-trigger-popup',
                '#dialogSelectDept_container',
              ].join(','),
            )[0];
            return $targetTarget;
          }}
          onClickAwayExceptions={['.ant-cascader-menus', '.ant-tree-select-dropdown']}
          onClickAway={() => setPopupVisible(false)}
        >
          <Popup>
            <Conditions
              from="selectRecordDialog"
              className="selectRecordConditions"
              showQueryBtn
              colNum={1}
              controls={controls}
              appId={control.appId}
              projectId={projectId}
              filters={formatSearchFilters(searchFilters, controls)}
              queryText={_l('筛选')}
              updateQuickFilter={filters => {
                onFilter(filters);
                setPopupVisible(false);
              }}
              resetQuickFilter={(...args) => {
                onFilter([]);
              }}
            />
          </Popup>
        </ClickAwayable>
      }
      getPopupContainer={() => document.body}
      popupClassName="filterTrigger"
      zIndex={1000}
      popupAlign={{
        points: ['tr', 'br'],
        overflow: {
          adjustX: true,
          adjustY: true,
        },
      }}
    >
      <Icon active={!!quickFilters.length} onClick={() => setPopupVisible(true)}>
        <i className="icon icon-worksheet_filter" />
      </Icon>
    </Trigger>
  );
}
