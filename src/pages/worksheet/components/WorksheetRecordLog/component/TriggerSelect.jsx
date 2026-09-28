import React from 'react';
import { Dropdown } from 'ming-ui/antd-components';

function TriggerSelect(props) {
  const { text, onSelect, children } = props;

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: [{ key: 'select', label: text }],
        onClick: () => {
          onSelect();
        },
      }}
    >
      {children}
    </Dropdown>
  );
}

export default TriggerSelect;
