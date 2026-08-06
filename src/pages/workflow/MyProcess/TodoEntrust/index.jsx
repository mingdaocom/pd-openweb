import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Dialog, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import delegationApi from '../../api/delegation';
import TodoEntrustList from './TodoEntrustList';
import TodoEntrustModal from './TodoEntrustModal';

const IconWrapper = styled.div`
  display: inline-flex;
  margin-right: 15px;
  cursor: pointer;

  .iconText {
    margin-left: 8px;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &:hover {
    .iconText {
      color: var(--color-primary) !important;
    }
    i {
      color: var(--color-primary) !important;
    }
  }
`;

export default function TodoEntrust() {
  const [entrustListVisible, setEntrustListVisible] = useState(false);
  const [todoEntrustModalVisible, setTodoEntrustModalVisible] = useState(false);
  const [delegationList, setDelegationList] = useState([]);
  const entrustCount = delegationList.length;

  const getData = useCallback(() => {
    delegationApi.getList().then(res => res && setDelegationList(res));
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const onEntrustIconClick = () => {
    setEntrustListVisible(true);
  };

  return (
    <React.Fragment>
      <Tooltip title={_l('待办委托')} popupPlacement="bottom">
        <IconWrapper onClick={onEntrustIconClick}>
          <Icon icon="lift" className="Font22 textSecondary" />
          <div className="iconText nowrap">{_l('委托')}</div>
          {entrustCount > 0 && <span className="iconText">{entrustCount}</span>}
        </IconWrapper>
      </Tooltip>

      <Dialog
        className="todoEntrustDialog"
        visible={entrustListVisible}
        width={1280}
        type="fixed"
        footer={null}
        onOk={() => {}}
        onCancel={() => setEntrustListVisible(false)}
      >
        <TodoEntrustList
          visible={entrustListVisible}
          delegationList={delegationList}
          onUpdate={getData}
          onClose={() => setEntrustListVisible(false)}
        />
      </Dialog>

      {todoEntrustModalVisible && (
        <TodoEntrustModal setTodoEntrustModalVisible={setTodoEntrustModalVisible} onUpdate={getData} />
      )}
    </React.Fragment>
  );
}
