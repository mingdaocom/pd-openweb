import React from 'react';
import { Dropdown, Menu } from 'antd';
import { Icon } from 'ming-ui';
import { SORT_LIST } from '../config';

export default props => {
  const { isAsc, handleChange } = props;
  return (
    <Dropdown
      trigger={['click']}
      placement="bottomLeft"
      overlay={
        <Menu className="" expandIcon={<Icon icon="arrow-right-tip" />} style={{ width: 180 }}>
          {SORT_LIST.map(item => (
            <Menu.Item
              item={item.value}
              data-event={item.icon}
              className="pLeft10"
              style={{ padding: '7px 12px' }}
              onClick={() => {
                handleChange(item.value);
              }}
            >
              <div className="flexRow valignWrapper">
                <Icon className="textTertiary Font18 mLeft5 mRight5" icon={item.icon} />
                <div className="flex">{item.name}</div>
                {isAsc === item.value && <Icon icon="done" className="colorPrimary Font18" />}
              </div>
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <Icon icon="import_export" className="textSecondary pointer Font20" />
    </Dropdown>
  );
};
