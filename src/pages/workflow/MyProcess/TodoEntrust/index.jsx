import React, { useState, useEffect } from 'react';
import { Motion, spring } from 'react-motion';
import { Icon } from 'ming-ui';
import styled from 'styled-components';
import delegationApi from '../../api/delegation';
import TodoEntrustList from './TodoEntrustList';
import TodoEntrustModal from './TodoEntrustModal';

const RedDot = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 6px;
  border-radius: 100%;
  background-color: red;
`;

const IconWrapper = styled.div`
  display: inline-flex;
  margin-right: 24px;
  cursor: pointer;

  .iconText {
    margin-left: 8px;
    font-size: 14px;
    color: #9e9e9e;
  }

  &:hover {
    .iconText {
      color: #2196f3 !important;
    }
    i {
      color: #2196f3 !important;
    }
  }
`;

export default function TodoEntrust() {
  const [entrustListVisible, setEntrustListVisible] = useState(false);
  const [todoEntrustModalVisible, setTodoEntrustModalVisible] = useState(false);
  const [delegationList, setDelegationList] = useState([]);
  const entrustCount = delegationList.length;

  useEffect(() => {
    delegationApi.getList().then(res => res && setDelegationList(res));
  }, []);

  const onEntrustIconClick = () => {
    entrustCount === 0 ? setTodoEntrustModalVisible(true) : setEntrustListVisible(true);
  };

  return (
    <React.Fragment>
      <IconWrapper data-tip={_l('待办委托')} onClick={onEntrustIconClick}>
        <div className="relative">
          <Icon icon="lift" className="Font22 Gray_9e" />
          {entrustCount > 0 && <RedDot />}
        </div>
        <div className="iconText">{_l('委托')}</div>
      </IconWrapper>

      <Motion
        style={{
          x: spring(entrustListVisible ? 0 : 460, {
            stiffness: 300,
            damping: 30,
            precision: 0.01,
          }),
        }}
      >
        {({ x }) => (
          <TodoEntrustList
            posX={x}
            visible={entrustListVisible}
            delegationList={delegationList}
            setDelegationList={setDelegationList}
            onClose={() => setEntrustListVisible(false)}
            onClickAway={() => {
              entrustListVisible && setEntrustListVisible(false);
            }}
            onClickAwayExceptions={[
              '.mdModalWrap',
              '.dropdownTrigger',
              '.mui-dialog-container',
              '.ant-picker-dropdown',
            ]}
          />
        )}
      </Motion>
      {todoEntrustModalVisible && (
        <TodoEntrustModal
          setTodoEntrustModalVisible={setTodoEntrustModalVisible}
          setDelegationList={setDelegationList}
        />
      )}
    </React.Fragment>
  );
}
