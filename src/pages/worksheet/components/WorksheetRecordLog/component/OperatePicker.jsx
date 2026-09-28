import React, { useState } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';

const OPTIONS = [
  {
    label: _l('直接更新'),
    value: 1,
  },
  {
    label: _l('执行按钮'),
    value: 3,
  },
  {
    label: _l('触发工作流'),
    value: 2,
  },
  {
    label: _l('审批时填写'),
    value: 7,
  },
  {
    label: _l('其他'),
    value: 8,
  },
];

function OperatePicker(props) {
  const { value = 0, onChange } = props;
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(OPTIONS.find(l => l.value === value));

  const onSelect = l => {
    setSelected(l);
    setVisible(false);
    onChange(l ? l.value : 0);
  };

  const onClear = e => {
    e.stopPropagation();
    onSelect(undefined);
  };

  return (
    <Dropdown
      open={visible}
      onOpenChange={setVisible}
      trigger={['click']}
      placement="bottomLeft"
      menu={{
        style: { width: 220 },
        selectable: true,
        selectedKeys: selected ? [String(selected.value)] : [],
        items: OPTIONS.map(item => ({
          key: String(item.value),
          label: item.label,
          onClick: () => onSelect(item),
        })),
      }}
    >
      <div className={cx('selectOperate', { selectLight: !!selected })}>
        <Icon icon="ads_click" />
        <span className="selectConText">{selected ? selected.label : _l('操作')}</span>
        <Icon icon="arrow-down" style={selected ? {} : { display: 'inline-block' }} />
        {selected && <Icon icon="cancel" onClick={onClear} />}
      </div>
    </Dropdown>
  );
}

export default OperatePicker;
