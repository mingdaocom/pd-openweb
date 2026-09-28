import React from 'react';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import './index.less';

const SORT_TYPE = [
  {
    label: _l('默认'),
    key: 0,
    icon: 'score-down',
  },
  {
    label: _l('更新时间'),
    key: 1,
    icon: 'score-down',
  },
  {
    label: _l('更新时间'),
    key: 2,
    icon: 'score-up',
  },
  {
    label: _l('创建时间'),
    key: 3,
    icon: 'score-down',
  },
  {
    label: _l('创建时间'),
    key: 4,
    icon: 'score-up',
  },
];

const SORT_MENU_ITEMS = [
  {
    key: 'update-time',
    type: 'group',
    label: _l('按更新时间'),
    children: [1, 2].map(key => ({
      key: String(key),
      label: key === 1 ? _l('降序') : _l('升序'),
      icon: <Icon icon={SORT_TYPE[key].icon} className="Font16" />,
    })),
  },
  {
    key: 'create-time',
    type: 'group',
    label: _l('按创建时间'),
    children: [3, 4].map(key => ({
      key: String(key),
      label: key === 3 ? _l('降序') : _l('升序'),
      icon: <Icon icon={SORT_TYPE[key].icon} className="Font16" />,
    })),
  },
];

export default function SelectSort(props) {
  const { value = 0, onChange, className = '' } = props;

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{
        items: SORT_MENU_ITEMS,
        selectable: true,
        selectedKeys: [String(value)],
        onClick: ({ key }) => onChange(Number(key)),
      }}
    >
      <span className={`selectSort textTertiary ${className} ${value === 0 ? '' : 'lighthigh'}`}>
        {value === 0 ? _l('更新时间') : SORT_TYPE[value].label}
        <Icon icon={SORT_TYPE[value].icon} className="textTertiary" />
      </span>
    </Dropdown>
  );
}
