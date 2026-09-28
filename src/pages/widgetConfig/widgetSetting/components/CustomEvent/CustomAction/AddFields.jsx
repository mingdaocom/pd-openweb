import React, { useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import { DEFAULT_CONFIG, SYS, SYS_CONTROLS } from 'src/utils/domain/control/widget';
import { enumWidgetType } from 'src/utils/domain/control/widgetTypes';
import { DynamicBtn } from '../style';

const filterControlOption = (value, item) => item.control.controlName.includes(value);

function AddFieldsContent(props) {
  const { handleClick, selectControls, text, disabled, showSys = false } = props;
  const filterControls = showSys
    ? selectControls
    : selectControls.filter(i => !_.includes(SYS_CONTROLS.concat(SYS), i.controlId));
  const [visible, setVisible] = useState(false);
  const [searchValue, setValue] = useState('');
  const [dropdownVersion, setDropdownVersion] = useState(0);
  const $ref = useRef(null);

  const onItemClick = item => {
    handleClick(item);
    // Dropdown 不提供 forceAlign，列表布局稳定后重建以重新计算浮层位置
    requestAnimationFrame(() => {
      $ref.current?.scrollIntoView({ block: 'nearest', behavior: 'auto' });

      requestAnimationFrame(() => {
        if ($ref.current) {
          setDropdownVersion(version => version + 1);
        }
      });
    });
  };

  const menuItems = filterControls.map(item => {
    const enumType = enumWidgetType[item.type];
    const { icon } = DEFAULT_CONFIG[enumType];

    return {
      key: item.controlId,
      control: item,
      icon: <Icon icon={icon} className="Font16 textTertiary" />,
      label: (
        <span className="overflow_ellipsis" title={item.controlName}>
          {item.controlName}
        </span>
      ),
      onClick: () => onItemClick(item),
    };
  });

  return (
    <Dropdown
      key={dropdownVersion}
      showPopupSearch
      searchValue={searchValue}
      onSearch={setValue}
      filterOption={filterControlOption}
      notFoundContent={_l(searchValue ? '暂无搜索结果' : '无内容')}
      menu={{
        selectable: false,
        items: menuItems,
        style: { maxHeight: 320, overflowY: 'auto' },
      }}
      open={visible}
      onOpenChange={(visible, { source } = {}) => {
        if (disabled) return;
        if (!visible && source === 'menu') return;

        setVisible(visible);
        if (!visible) {
          setValue('');
        }
      }}
      trigger={['click']}
      placement="bottomLeft"
      disabled={disabled}
    >
      <DynamicBtn className={cx(props.className, { disabled })} ref={$ref}>
        <Icon icon="add" className="Bold" />
        {text || _l('字段')}
      </DynamicBtn>
    </Dropdown>
  );
}

export default function AddFields(props) {
  return <AddFieldsContent key={props.disabled ? 'disabled' : 'enabled'} {...props} />;
}
