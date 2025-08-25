import React from 'react';
import _ from 'lodash';
import DynamicDefaultValue from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue';
import './style.less';

export default function Input(props) {
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
      defsource = !defsource ? '' : JSON.parse(defsource);
    } catch (error) {
      console.log(error);
    }
    if (data.type === 34 && defsource.length <= 0) {
      //子表 默认值清空呈现异化
      return { ...advancedSetting, defaulttype: '' };
    } else {
      return advancedSetting;
    }
  };
  return (
    <DynamicDefaultValue
      {..._.pick(props, ['allControls', 'globalSheetInfo', 'onChange', 'titleControl'])}
      data={{ ...props.data, advancedSetting: getAdvancedSetting() }}
      from={1}
      writeObject={props.writeObject}
      showEmpty={true}
    />
  );
}
