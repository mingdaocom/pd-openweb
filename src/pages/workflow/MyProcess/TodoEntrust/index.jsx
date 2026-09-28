import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Modal, Tooltip } from 'ming-ui/antd-components';
import delegationApi from '../../api/delegation';
import TodoEntrustList from './TodoEntrustList';

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

      {entrustListVisible && (
        <Modal
          open
          width={1280}
          type="fixed"
          footer={null}
          keyboard
          mask={{ closable: true }}
          styles={{ body: { padding: 0, overflow: 'hidden' }, container: { padding: 0 } }}
          onCancel={() => setEntrustListVisible(false)}
        >
          <TodoEntrustList
            visible
            delegationList={delegationList}
            onUpdate={getData}
            onClose={() => setEntrustListVisible(false)}
          />
        </Modal>
      )}
    </React.Fragment>
  );
}
