import React from 'react';
import { Dropdown } from 'antd';
import { isEmptyValue } from 'src/utils/control';
import { DropdownPlaceholder } from '../styled';
import OtherField from '../widgetSetting/components/DynamicDefaultValue/components/OtherField';
import SelectFields from '../widgetSetting/components/DynamicDefaultValue/components/SelectFields';

export default function DropdownSelectFields(props) {
  const { value, placeholder, onChange, dynamicValue = [] } = props;
  const renderPlaceholder = () => {
    if (isEmptyValue(value)) return <div className="placeholder">{placeholder || _l('请选择')}</div>;
    return (
      <div className="text">
        <OtherField className="mTop0" {...props} item={dynamicValue[0]} />
      </div>
    );
  };
  return (
    <Dropdown
      trigger={['click']}
      placement={window.innerHeight < 700 ? 'top' : 'bottom'}
      overlay={<SelectFields from={13} {...props} onClick={obj => onChange(obj)} />}
    >
      <DropdownPlaceholder>
        {renderPlaceholder()}
        <i className="icon-arrow-down-border Font14 Gray_9e"></i>
      </DropdownPlaceholder>
    </Dropdown>
  );
}
