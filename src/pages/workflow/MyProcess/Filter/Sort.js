import React from 'react';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import { SORT_LIST } from '../config';

export default props => {
  const { isAsc, handleChange } = props;
  return (
    <Dropdown
      trigger={['click']}
      placement="bottomLeft"
      menu={{
        style: { minWidth: 180 },
        items: SORT_LIST.map(item => ({
          key: item.value,
          'data-event': item.icon,
          className: 'pLeft10',
          style: { padding: '7px 12px' },
          icon: <Icon className="textTertiary Font18" icon={item.icon} />,
          label: (
            <div className="flexRow valignWrapper">
              <div className="flex">{item.name}</div>
              {isAsc === item.value && <Icon icon="done" className="colorPrimary Font18" />}
            </div>
          ),
          onClick: () => {
            handleChange(item.value);
          },
        })),
      }}
    >
      <Icon icon="import_export" className="textSecondary pointer Font20" />
    </Dropdown>
  );
};
