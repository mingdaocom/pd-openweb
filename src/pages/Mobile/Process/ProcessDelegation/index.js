import React, { useEffect, useState } from 'react';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import delegationApi from 'src/pages/workflow/api/delegation';
import TodoEntrustList from 'src/pages/workflow/MyProcess/TodoEntrust/TodoEntrustList';
import DelegationConfigModal from './DelegationConfigModal';
import './index.less';

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
    <div className={cx(`card processDelegation ${className}`, { bottom124: topTab.id === 'waitingApproval' })}>
      <div className="flexRow alignItemsCenter justifyContentCenter" onClick={handleClickDelegation}>
        <Icon className="Font24 Gray_9e" icon="lift" />
        {!_.isEmpty(delegationList) && <div className="redDot"></div>}
      </div>

      {cardListVisible && (
        <Popup
          className="delegationCardList mobileModal minFull topRadius"
          position="bottom"
          visible={cardListVisible}
          onClose={() => setCardListVisible(!cardListVisible)}
        >
          <div className="flexColumn h100">
            <div className="pTop10 pBottom10 pRight16 TxtRight">
              <Icon
                icon="cancel"
                className="Font22 Gray_9e"
                onClick={() => {
                  setCardListVisible(false);
                }}
              />
            </div>
            <div className="flex minHeight0 pBottom20">
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
        </Popup>
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
