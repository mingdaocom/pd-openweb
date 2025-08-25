import React, { useRef, useState } from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Menu, MenuItem } from 'ming-ui';
import { hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

const MenuWrap = styled(Menu)`
  width: 130px !important;
  position: relative !important;
  min-width: 130px;
`;

export default function ActionDrop(props) {
  const { record, authority, recovery = () => {}, updateData = () => {} } = props;
  const { accountId, fullname } = record;
  const [visible, setVisible] = useState(false);
  const node = useRef(null);

  return (
    <div className="actionWrap">
      <Trigger
        getPopupContainer={node.current}
        popupVisible={visible}
        onPopupVisibleChange={dropdownVisible => setVisible(dropdownVisible)}
        action={['click']}
        popupAlign={{ points: ['tc', 'bc'], offset: [-60, 30], overflow: { adjustX: true, adjustY: true } }}
        popup={
          <MenuWrap>
            <MenuItem
              onClick={() => {
                setVisible(false);
                recovery(accountId, fullname);
              }}
            >
              {_l('恢复')}
            </MenuItem>
            {hasPermission(authority, PERMISSION_ENUM.DEPUTE_HANDOVER_MANAGE) && (
              <MenuItem
                onClick={() => {
                  setVisible(false);
                  updateData({ showWorkHandover: true, transferor: record });
                }}
              >
                {_l('交接工作')}
              </MenuItem>
            )}
          </MenuWrap>
        }
      >
        <Icon icon="moreop" className="Gray_9e Font16 Hand" />
      </Trigger>
    </div>
  );
}
