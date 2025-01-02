import React, { useEffect, useState } from 'react';
import DynamicDefaultValue from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue';
import _ from 'lodash';
import styled from 'styled-components';
import cx from 'classnames';
import 'src/pages/widgetConfig/index.less';

const Wrap = styled.div`
  &.hideDynamic {
    & > div > div > div {
      width: 100%;
      border-radius: 3px;
    }
    .selectOtherFieldContainer {
      display: none;
    }
  }
`;
export default function Input(props) {
  const { hideDynamic } = props;
  // [1, 2, 5].includes(type); //文本、邮箱
  // [(6, 8, 3, 28)].includes(type); //数值、金额、手机、等级
  // [(15, 16, 17, 18)].includes(type); //日期
  // [9, 11].includes(type); //单选
  // [10].includes(type); //多选
  // [36].includes(type); //检查框
  // [26].includes(type); //成员（常规）
  // [19, 23, 24].includes(type); //地区
  // [27].includes(type); //部门
  // [29].includes(type); //关联单/多（卡片、下拉）
  // [34].includes(type); //子表

  const getAdvancedSetting = () => {
    const { data = {} } = props;
    let { advancedSetting = {} } = data;
    let { defsource = '' } = advancedSetting;
    try {
      defsource = JSON.parse(defsource);
    } catch (error) {
      defsource = defsource;
    }
    if (data.type === 34 && defsource.length <= 0) {
      //子表 默认值清空呈现异化
      return { ...advancedSetting, defaulttype: '' };
    } else {
      return advancedSetting;
    }
  };
  return (
    <Wrap className={cx({ hideDynamic })}>
      <DynamicDefaultValue
        {..._.pick(props, [
          'allControls',
          'globalSheetInfo',
          'onChange',
          'titleControl',
          'withLinkParams',
          'withDY',
          'linkParams',
          'withMaxOrMin',
        ])}
        data={{ ...props.data, advancedSetting: getAdvancedSetting() }}
        from={10}
      />
    </Wrap>
  );
}
