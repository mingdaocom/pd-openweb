import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Dropdown, Modal } from 'ming-ui/antd-components';
import { pathCompletion } from 'src/utils/platform/navigation/path';

const Wrapper = styled.div`
  .optionIcon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--color-text-tertiary);
    background-color: var(--color-background-primary);

    &:hover {
      color: var(--color-primary);
      background-color: var(--color-background-hover);
    }
  }
`;

export default function OptionColumn(props) {
  const { id, onDel } = props;
  const [visible, setVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  return (
    <Wrapper>
      <Dropdown
        trigger={['click']}
        open={visible}
        onOpenChange={setVisible}
        placement="bottomRight"
        menu={{
          style: { width: 220 },
          items: [
            {
              key: 'preview',
              label: _l('预览数据'),
              onClick: () => window.open(pathCompletion(`/dataMirrorPreview/${id}`)),
            },
            {
              key: 'delete',
              danger: true,
              label: _l('删除'),
              onClick: () => setDialogVisible(true),
            },
          ],
        }}
      >
        <div className="optionIcon">
          <Icon icon="more_horiz" className="Font18 pointer" />
        </div>
      </Dropdown>

      {dialogVisible && (
        <Modal
          title={_l('删除')}
          open={dialogVisible}
          mask={{ closable: true }}
          keyboard
          okButtonProps={{ danger: true }}
          okText={_l('删除')}
          onOk={() => {
            onDel(() => setDialogVisible(false));
          }}
          onCancel={() => setDialogVisible(false)}
        >
          <div className="textSecondary">{_l('不会删除目的地数据库表。')}</div>
        </Modal>
      )}
    </Wrapper>
  );
}
