import React, { useState, useEffect, Fragment } from 'react';
import { Flex, Modal, Drawer, Button, WingBlank, ActionSheet } from 'antd-mobile';
import { Icon, Input } from 'ming-ui';
import delegationApi from 'src/pages/workflow/api/delegation';
import TodoEntrustList from 'src/pages/workflow/MyProcess/TodoEntrust/TodoEntrustList';
import DelegationConfigModal from './DelegationConfigModal';
import styled from 'styled-components';
import cx from 'classnames';
import './index.less';

const DrawerWrap = styled(Drawer)`
  z-index: 100 !important;
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .am-drawer-sidebar {
    width: 100%;
    background-color: #f5f5f5;
  }
  .ant-drawer-body {
    padding: 10px 0 0 0;
  }
`;

export default function ProcessDelegation(props) {
  const { topTab = {}, className } = props;
  const [cardListVisible, setCardListVisible] = useState(false);
  const [delegationList, setDelegationList] = useState([]);
  const [configVisible, setConfigVisible] = useState(false);

  useEffect(() => {
    getList();
  }, []);

  const getList = () => {
    delegationApi.getList().then(res => res && setDelegationList(res));
  };

  const handleClickDelegation = () => {
    !_.isEmpty(delegationList) ? setCardListVisible(true) : setConfigVisible(true);
  };

  const finishDelegation = item => {
    const params = {
      id: item.id,
      status: 0,
      companyId: item.companyId,
      startDate: item.startDate,
      endDate: item.endDate,
      trustee: item.trustee.accountId,
    };
    delegationApi.update(params).then(res => {
      if (res) {
        let temp = delegationList.filter(it => it.id !== res.id);
        setDelegationList(temp);
        alert(_l('结束委托成功'));
      }
    });
  };

  return (
    <div className={cx(`card processDelegation ${className}`, { bottom180: topTab.id === 'waitingApproval' })}>
      <Flex justify="center" align="center" onClick={handleClickDelegation}>
        <Icon className="Font24 Gray_9e" icon="lift" />
        {!_.isEmpty(delegationList) && <div className="redDot"></div>}
      </Flex>

      {cardListVisible && (
        <DrawerWrap
          className="delegationCardList"
          position="right"
          open={cardListVisible}
          sidebar={
            <div className="flexColumn">
              <div className="pTop16 pRight16 TxtRight">
                <Icon
                  icon="closeelement-bg-circle"
                  className="Font22 Gray_9e"
                  onClick={() => {
                    setCardListVisible(false);
                  }}
                />
              </div>
              <div className="flex">
                <TodoEntrustList
                  visible={cardListVisible}
                  delegationList={delegationList}
                  setDelegationList={setDelegationList}
                  onClose={() => setCardListVisible(false)}
                  getList={getList}
                  finishDelegation={finishDelegation}
                />
              </div>
            </div>
          }
          onOpenChange={() => setCardListVisible(!cardListVisible)}
        ></DrawerWrap>
      )}

      <DelegationConfigModal
        configVisible={configVisible}
        onCancel={() => setConfigVisible(false)}
        getList={getList}
        delegationList={delegationList}
      />
    </div>
  );
}
