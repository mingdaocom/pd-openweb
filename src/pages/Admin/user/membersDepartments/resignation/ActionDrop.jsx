import React, { useState } from 'react';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { hasPermission } from 'src/utils/services/security/permission';

export default function ActionDrop(props) {
  const { record, authority, recovery = () => {}, updateData = () => {} } = props;
  const { accountId, fullname } = record;
  const [visible, setVisible] = useState(false);

  return (
    <div className="actionWrap">
      <Dropdown
        open={visible}
        onOpenChange={setVisible}
        trigger={['click']}
        menu={{
          items: [
            {
              key: 'recovery',
              label: _l('恢复'),
              onClick: () => {
                setVisible(false);
                recovery(accountId, fullname);
              },
            },
            ...(hasPermission(authority, PERMISSION_ENUM.DEPUTE_HANDOVER_MANAGE)
              ? [
                  {
                    key: 'transfer',
                    label: _l('交接工作'),
                    onClick: () => {
                      setVisible(false);
                      updateData({ showWorkHandover: true, transferor: record });
                    },
                  },
                ]
              : []),
          ],
          style: { minWidth: 130 },
        }}
      >
        <Icon icon="moreop" className="textTertiary Font16 Hand" />
      </Dropdown>
    </div>
  );
}
