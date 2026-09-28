import React from 'react';
import { Dropdown } from 'ming-ui/antd-components';

export default function CancelIntegration(props) {
  const { clickCancel = () => {} } = props;

  return (
    <Dropdown
      trigger={['hover']}
      menu={{
        items: [{ key: 'cancel', label: _l('取消集成'), danger: true, onClick: clickCancel }],
        style: { minWidth: 180 },
      }}
    >
      <i className="icon-moreop Font18 textTertiary" />
    </Dropdown>
  );
}
