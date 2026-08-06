import React, { Fragment, useState } from 'react';
import { Button, Popup } from 'antd-mobile';
import cx from 'classnames';
import moment from 'moment';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import DelegationConfigModal from './DelegationConfigModal';
import TodoList from './TodoList';

const TodoEntrustWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding-bottom: 20px;
  background-color: var(--color-background-secondary);
  overflow: auto;

  .trusteeAvatarWrapper {
    border-radius: 24px;
    background-color: var(--color-background-secondary);
    overflow: hidden;
  }
`;

const CardWrapper = styled.div`
  width: 100%;
  padding: 20px;
  margin-bottom: 15px;
  box-sizing: border-box;
  background-color: var(--color-background-primary);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  &:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  }

  .cardTitle {
    margin-bottom: 20px;
    color: var(--color-text-title);
    font-size: 15px;
    font-weight: bold;
  }

  .cardRow {
    display: flex;
    margin-bottom: 15px;
  }

  .cardLabel {
    flex: 1;
    color: var(--color-text-secondary);
  }

  .cardValue {
    flex: 4;
    color: var(--color-text-title);
    overflow: hidden;
  }
`;

const EntrustButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 0;
  font-size: 13px;
  height: 32px;
  line-height: 32px;
  border-radius: 5px;
  color: var(--color-white);
  background-color: var(--color-primary);
  &.overEntrust {
    color: var(--color-error);
    background-color: var(--color-background-tertiary);
  }
  &.isAdd {
    color: var(--color-primary);
    background-color: var(--color-background-primary);
  }
`;

const Btn = styled(Button)`
  border: 1px solid var(--color-border-secondary) !important;
  background-color: var(--color-background-primary) !important;
  &.delete {
    background-color: var(--color-error) !important;
    border: 1px solid var(--color-error);
    color: var(--color-white);
  }
`;

const isShowStartDate = startDate => {
  return startDate && moment(startDate).diff(moment(), 'minutes') > 0;
};

function TodoEntrustList(props) {
  const { delegationList, onClose, finishDelegation = () => {} } = props;
  const [entrustData, setEntrustData] = useState({});
  const [mobileConfigVisible, setMobileConfigVisble] = useState(false);
  const [mobileFinishInfo, setMobileFinishInfo] = useState({
    cancelModalVisible: false,
    todoModalVisible: false,
    finishItem: {},
  });

  const onCardItemClick = item => {
    const data = Object.assign({}, item, {
      startDate: isShowStartDate(item.startDate) ? moment(item.startDate) : null,
      endDate: moment(item.endDate),
    });
    setEntrustData(data);
    setMobileConfigVisble(true);
    return;
  };

  const onFinishEntrust = (e, item) => {
    e.stopPropagation();
    setMobileFinishInfo({ cancelModalVisible: true, finishItem: item });
  };

  const onViewEntrust = (e, item) => {
    e.stopPropagation();
    setMobileFinishInfo({ todoModalVisible: true, finishItem: item });
  };

  const renderCardWrapper = item => {
    return (
      <CardWrapper key={item.id} className="pointer" onClick={() => onCardItemClick(item)}>
        <div className="cardTitle">{item.companyName}</div>
        <div className="cardRow">
          <div className="cardLabel Font13">{_l('委托给')}</div>
          <div className="cardValue Font13">
            <div className="flexRow">
              <div className="trusteeAvatarWrapper valignWrapper mRight10">
                <div className="pointer circle">
                  <img
                    style={{
                      backgroundColor: 'var(--color-background-secondary)',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                    }}
                    placeholder={`${md.global.FileStoreConfig.pictureHost}/UserAvatar/default.gif`}
                    className="circle"
                    src={
                      item.trustee.avatar
                        ? item.trustee.avatar.indexOf('?') > 0
                          ? item.trustee.avatar.replace(
                              /imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/,
                              'imageView2/2/w/100/h/100/q/90',
                            )
                          : `${item.trustee.avatar}?imageView2/2/w/100/h/100/q/90`
                        : ''
                    }
                  />
                </div>
                <div className="textPrimary Font13 pLeft5 pRight10 pTop1 ellipsis">{item.trustee.fullName}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="cardRow">
          <div className="cardLabel Font13">{isShowStartDate(item.startDate) ? _l('委托时间') : _l('截止时间')}</div>
          <div className="cardValue Font13">
            {isShowStartDate(item.startDate) ? (
              <React.Fragment>
                {moment(item.startDate).format('YYYY-MM-DD HH:mm')}
                <span className="textSecondary">{` ~ `}</span>
              </React.Fragment>
            ) : (
              ''
            )}
            {moment(item.endDate).format('YYYY-MM-DD HH:mm')}
          </div>
        </div>
        <div className="cardRow">
          <div className="cardLabel Font13">{_l('委托范围')}</div>
          <div className="cardValue Font13">{!item.apks ? _l('所有工作流') : _l('%0个应用', item.apks.length)}</div>
        </div>
        <div className="cardRow mBottom0">
          <EntrustButton className="flex minWidth0 mRight10 overEntrust" onClick={e => onFinishEntrust(e, item)}>
            <span className="ellipsis">{_l('结束委托')}</span>
          </EntrustButton>
          <EntrustButton className="flex minWidth0" onClick={e => onViewEntrust(e, item)}>
            <span className="ellipsis">{_l('查看委托明细')}</span>
          </EntrustButton>
        </div>
      </CardWrapper>
    );
  };

  return (
    <Fragment>
      <TodoEntrustWrapper className="mobileCarListWrapper">
        <div className="listWrapper">
          {delegationList.map(item => {
            return renderCardWrapper(item);
          })}

          <EntrustButton
            className={cx({ isAdd: true })}
            onClick={() => {
              setEntrustData({});
              setMobileConfigVisble(true);
            }}
          >
            <Icon icon="add" className="Font24" />
            {_l('发起委托')}
          </EntrustButton>
        </div>

        {mobileConfigVisible && (
          <DelegationConfigModal
            configVisible={mobileConfigVisible}
            onCancel={() => setMobileConfigVisble(false)}
            getList={props.getList}
            entrustData={entrustData}
            setEntrustData={setEntrustData}
            delegationList={delegationList}
          />
        )}

        {mobileFinishInfo.cancelModalVisible && (
          <Popup
            closeOnMaskClick
            visible={mobileFinishInfo.cancelModalVisible}
            position="bottom"
            className="mobileModal topRadius"
            bodyClassName="pTop10 pBottom10 pLeft15 pRight15"
          >
            <div className="Font16 bold mBottom10">{_l('确认结束委托?')}</div>
            <div className="flexRow mBottom10">
              <Btn
                radius
                className="flex mRight6 bold textSecondary Font13"
                onClick={() => setMobileFinishInfo({ mobileConfigVisible: false, finishItem: undefined })}
              >
                {_l('取消')}
              </Btn>
              <Btn
                radius
                className="flex mLeft6 bold Font13 delete"
                onClick={() => {
                  finishDelegation(mobileFinishInfo.finishItem);
                  setMobileFinishInfo({ mobileConfigVisible: false, finishItem: undefined });
                  onClose();
                }}
              >
                {_l('确定')}
              </Btn>
            </div>
          </Popup>
        )}

        {mobileFinishInfo.todoModalVisible && (
          <Popup
            closeOnMaskClick
            visible={mobileFinishInfo.todoModalVisible}
            position="bottom"
            className="mobileModal minFull topRadius"
          >
            <TodoList
              data={mobileFinishInfo.finishItem}
              onClose={() => {
                setMobileFinishInfo({ todoModalVisible: false, finishItem: undefined });
              }}
            />
          </Popup>
        )}
      </TodoEntrustWrapper>
    </Fragment>
  );
}

export default TodoEntrustList;
