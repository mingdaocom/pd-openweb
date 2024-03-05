import React, { useRef, useState } from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Dialog, Input } from 'ming-ui';
import syncTaskApi from '../../../../api/syncTask';
import { TASK_STATUS_TYPE } from '../../../constant';
import { navigateTo } from 'src/router/navigateTo';

const Wrapper = styled.div`
  .optionIcon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: #9e9e9e;
    background-color: #fff;

    &:hover {
      color: #2196f3;
      background-color: #f5f5f5;
    }
  }
`;
const OptionMenu = styled.div`
  position: relative !important;
  width: 220px !important;
  padding: 6px 0 !important;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  background: #fff;
`;
const MenuItem = styled.div`
  padding: 0 20px;
  line-height: 36px;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
`;
const RedMenuItem = styled(MenuItem)`
  color: #f44336;
`;
const EditTaskNameWrapper = styled.div`
  position: relative !important;
  width: 310px;
  padding: 20px 24px;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  background: #fff;
`;

export default function OptionColumn({ projectId, record, taskList, setTaskList, onRefreshComponents }) {
  const [visible, setVisible] = useState(false);
  const [editPopupVisible, setEditPopupVisible] = useState(false);
  const inputRef = useRef();
  const onEditTaskName = () => {
    setEditPopupVisible(true);
    setTimeout(() => {
      inputRef.current.select();
    }, 0);
  };

  const onSaveTaskName = () => {
    const taskName = inputRef.current.value.trim();

    if (!taskName || taskName === record.name) {
      return;
    }

    setVisible(false);
    setEditPopupVisible(false);

    syncTaskApi.updateSyncTask({ projectId, taskId: record.id, name: taskName }).then(res => {
      if (res) {
        alert(_l('名称修改成功'));
        setTaskList(
          taskList.map(item => {
            return item.id === record.id ? { ...item, name: taskName } : item;
          }),
        );
      } else {
        alert(_l('名称修改失败'), 2);
      }
    });
  };

  const onDelete = () => {
    setVisible(false);

    Dialog.confirm({
      title: _l('删除同步任务'),
      buttonType: 'danger',
      description: (
        <div>
          <span>{_l('删除后，目的地为工作表的会转换成普通工作表，已同步的数据会保留')}</span>
        </div>
      ),
      okText: _l('删除'),
      onOk: () => {
        if (record.taskStatus === TASK_STATUS_TYPE.RUNNING) {
          alert(_l('不能删除运行中的任务'), 2);
          return;
        }

        syncTaskApi.deleteTask({ projectId, taskId: record.id }).then(res => {
          if (res) {
            alert(_l('同步任务删除成功'));
            setTaskList(taskList.filter(item => item.id !== record.id));
            onRefreshComponents(+new Date());
          } else {
            alert(_l('同步任务删除失败'), 2);
          }
        });
      },
    });
  };

  return (
    <Wrapper>
      <Trigger
        action={['click']}
        popupClassName="moreOption"
        getPopupContainer={() => document.body}
        popupVisible={visible}
        onPopupVisibleChange={visible => {
          if (editPopupVisible && !visible) {
            onSaveTaskName();
          }

          setVisible(visible);
          setEditPopupVisible(false);
        }}
        popupAlign={{
          points: ['tr', 'bl'],
          offset: [25, 5],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={
          editPopupVisible ? (
            <EditTaskNameWrapper>
              <p>{_l('任务名称')}</p>
              <Input
                className="w100"
                defaultValue={record.name}
                manualRef={inputRef}
                onBlur={onSaveTaskName}
                onKeyDown={e => {
                  e.key === 'Enter' && onSaveTaskName();
                }}
              />
            </EditTaskNameWrapper>
          ) : (
            <OptionMenu>
              <MenuItem onClick={onEditTaskName}>{_l('修改任务名称')}</MenuItem>
              <MenuItem onClick={() => navigateTo(`/integration/taskCon/${record.flowId}/monitor`)}>
                {_l('查看监控')}
              </MenuItem>
              <RedMenuItem onClick={onDelete}>{_l('删除')}</RedMenuItem>
            </OptionMenu>
          )
        }
      >
        <div className="optionIcon">
          <Icon icon="moreop" className="Font18 pointer" />
        </div>
      </Trigger>
    </Wrapper>
  );
}
