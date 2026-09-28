import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Dropdown, Input, Modal } from 'ming-ui/antd-components';
import syncTaskApi from '../../../../api/syncTask';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { TASK_STATUS_TYPE } from '../../../constant';

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

export default function OptionColumn({ projectId, record, setTaskList, onRefreshComponents }) {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [saving, setSaving] = useState(false);
  const savePendingRef = useRef(false);
  const deletePendingRef = useRef(false);

  const onEditTaskName = () => {
    setTaskName(record.name || '');
    setEditModalVisible(true);
  };

  const onSaveTaskName = () => {
    const nextTaskName = taskName.trim();

    if (!nextTaskName) {
      alert(_l('请输入任务名称'), 3);
      return;
    }

    if (nextTaskName === (record.name || '')) return;

    if (savePendingRef.current) return;

    savePendingRef.current = true;
    setSaving(true);
    return syncTaskApi
      .updateSyncTask({ projectId, taskId: record.id, name: nextTaskName })
      .then(res => {
        if (res) {
          alert(_l('名称修改成功'));
          setTaskList(currentList =>
            currentList.map(item => (item.id === record.id ? { ...item, name: nextTaskName } : item)),
          );
          setEditModalVisible(false);
        } else {
          alert(_l('名称修改失败'), 2);
        }
      })
      .catch(_requestError => alertIfNotUnauthorized(_requestError, _l('名称修改失败'), 2))
      .finally(() => {
        savePendingRef.current = false;
        setSaving(false);
      });
  };

  const onDelete = () => {
    Modal.confirm({
      title: <span className="textError">{_l('删除同步任务')}</span>,
      okButtonProps: {
        danger: true,
      },
      content: (
        <div>
          <span>{_l('删除后，目的地为工作表的会转换成普通工作表，已同步的数据会保留')}</span>
        </div>
      ),
      okText: _l('删除'),
      onOk: () => {
        if (record.taskStatus === TASK_STATUS_TYPE.RUNNING) {
          alert(_l('不能删除运行中的任务'), 2);
          return false;
        }

        if (deletePendingRef.current) return false;

        deletePendingRef.current = true;
        return syncTaskApi
          .deleteTask({
            projectId,
            taskId: record.id,
          })
          .then(res => {
            if (res && !res.errorMsg && !res.errorMsgList) {
              alert(_l('同步任务删除成功'));
              setTaskList(currentList => currentList.filter(item => item.id !== record.id));
              onRefreshComponents(Date.now());
            } else {
              alert(res.errorMsg || (res.errorMsgList || [])[0] || _l('同步任务删除失败'), 2);
            }
          })
          .finally(() => {
            deletePendingRef.current = false;
          });
      },
    });
  };

  return (
    <Wrapper>
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        menu={{
          style: { minWidth: 220 },
          items: [
            {
              key: 'editTaskName',
              label: _l('修改任务名称'),
              onClick: onEditTaskName,
            },
            {
              key: 'monitor',
              label: _l('查看监控'),
              onClick: () => navigateTo(`/integration/taskCon/${record.flowId}/monitor`),
            },
            {
              key: 'delete',
              danger: true,
              label: _l('删除'),
              onClick: onDelete,
            },
          ],
        }}
      >
        <div className="optionIcon">
          <Icon icon="moreop" className="Font18 pointer" />
        </div>
      </Dropdown>

      {editModalVisible && (
        <Modal
          open
          title={_l('修改任务名称')}
          mask={{ closable: !saving }}
          keyboard
          closable={!saving}
          okText={_l('保存')}
          okDisabled={!taskName.trim() || taskName.trim() === (record.name || '')}
          confirmLoading={saving}
          cancelButtonProps={{ disabled: saving }}
          onOk={onSaveTaskName}
          onCancel={() => {
            if (!saving) {
              setEditModalVisible(false);
            }
          }}
        >
          <div className="mBottom8">{_l('任务名称')}</div>
          <Input
            className="w100"
            autoFocus
            value={taskName}
            onFocus={event => event.target.select()}
            onChange={event => setTaskName(event.target.value)}
            onPressEnter={onSaveTaskName}
          />
        </Modal>
      )}
    </Wrapper>
  );
}
