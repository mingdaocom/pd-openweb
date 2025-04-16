import React, { Component, Fragment } from 'react';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import { QuickFilter } from 'mobile/RecordList/QuickFilter';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';

function formatSearchFilters(filters = [], controls = []) {
  return filters.map(f => {
    const control = _.find(controls, { controlId: f.controlId });
    f.control = control;
    f.dataType = _.get(control, 'type');
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

export default function MobileFilter(props) {
  const {
    controls = [],
    worksheetInfo = {},
    searchFilters,
    filtersVisible,
    onChangeFiltersVisible,
    onChangeQuickFilter,
  } = props;
  return (
    <Popup
      bodyStyle={{
        borderRadius: '14px 0 0 14px',
        overflow: 'hidden',
      }}
      position="right"
      visible={filtersVisible}
      onMaskClick={() => onChangeFiltersVisible(!filtersVisible)}
      onClose={() => onChangeFiltersVisible(!filtersVisible)}
    >
      {!!controls.length && (
        <QuickFilter
          filterText={false}
          projectId={worksheetInfo.projectId}
          appId={worksheetInfo.appId}
          worksheetId={worksheetInfo.worksheetId}
          view={{ advancedSetting: { enablebtn: '1' } }}
          filters={formatSearchFilters(
            searchFilters.map(f => {
              return {
                ...f,
                advancedSetting: { direction: '2', allowitem: '1' },
              };
            }),
            controls,
          )}
          controls={controls}
          onHideSidebar={() => onChangeFiltersVisible(false)}
          updateQuickFilter={onChangeQuickFilter}
        />
      )}
    </Popup>
  );
}
