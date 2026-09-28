import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Dropdown, Modal } from 'ming-ui/antd-components';
import dataSourceApi from '../../../../api/datasource';
import { navigateTo } from 'src/router/navigation/navigateTo';

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
  const { sourceId, setSourceList } = props;
  const [visible, setVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const requestPending = useRef(false);

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
              key: 'detail',
              label: _l('使用详情'),
              onClick: () => navigateTo(`/integration/sourceDetail/${sourceId}/useDetail`),
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
          title={_l('删除数据源')}
          open={dialogVisible}
          mask={{ closable: true }}
          keyboard
          okButtonProps={{ danger: true }}
          okText={_l('删除')}
          confirmLoading={deleting}
          onOk={() => {
            if (requestPending.current) return;

            requestPending.current = true;
            setDeleting(true);
            return dataSourceApi
              .deleteDatasource({ projectId: props.currentProjectId, datasourceId: sourceId })
              .then(res => {
                if (res.isSucceeded) {
                  alert(_l('数据源删除成功'));
                  setSourceList(currentList => currentList.filter(item => item.id !== sourceId));
                } else {
                  alert(res.errorMsg || (res.errorMsgList || [])[0], 2);
                }

                setDialogVisible(false);
              })
              .finally(() => {
                requestPending.current = false;
                setDeleting(false);
              });
          }}
          onCancel={() => setDialogVisible(false)}
        >
          <div className="textSecondary">
            <span>{_l('删除后，相关的同步任务会立即终止')}</span>
            <a className="mLeft10" onClick={() => navigateTo(`/integration/sourceDetail/${sourceId}/useDetail`)}>
              {_l('查看同步任务')}
            </a>
          </div>
        </Modal>
      )}
    </Wrapper>
  );
}
