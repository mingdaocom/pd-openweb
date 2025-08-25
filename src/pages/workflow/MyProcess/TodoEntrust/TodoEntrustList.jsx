import React, { useState } from 'react';
import { Button, Popup } from 'antd-mobile';
import cx from 'classnames';
import moment from 'moment';
import styled from 'styled-components';
import { Dialog, Icon, Tooltip, UserHead, UserName } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import delegationApi from '../../api/delegation';
import DelegationConfigModal from 'mobile/Process/ProcessDelegation/DelegationConfigModal';
import { browserIsMobile } from 'src/utils/common';
import TodoEntrustModal from './TodoEntrustModal';
import './index.less';

const CardWrapper = styled.div`
  width: 100%;
  padding: 20px;
  margin-bottom: 15px;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  &:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  }
`;

const CardTitle = styled.div`
  margin-bottom: 20px;
  color: #151515;
  font-size: 15px;
  font-weight: bold;
`;

const FlexRow = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const RowLabelText = styled.div`
  flex: 1;
  color: #757575;
  font-size: ${props => (props.isMobile ? '13px' : '14px')};
`;

const RowValue = styled.div`
  flex: 4;
  color: #151515;
  font-size: ${props => (props.isMobile ? '13px' : '14px')};
  overflow: hidden;
`;

const EntrustButton = styled.button(
  ({ isAdd, isMobile }) => `
display: flex;
justify-content: center;
align-items: center;
margin-top: 20px;
line-height: 36px;
border: 0;
border-radius: 4px;
background-color: ${isMobile ? (isAdd ? '#fff' : '#1677ff') : isAdd ? '#f5f5f5' : '#f7f7f7'} ;
color: ${isMobile && !isAdd ? '#fff' : '#1677ff'};
font-size: ${isMobile ? '13px' : '14px'};
cursor: pointer;

&:hover {
  color: ${!isAdd && '#fff'}
  background-color: ${!isAdd ? '#1677ff' : '#fff'};
}
&.mobileStyle {
  height: 32px;
  line-height: 32px;
  width: 102px;
  border-radius: 5px;
}
`,
);

const Btn = styled(Button)`
  border: 1px solid #eee !important;
  background-color: #fff !important;
  &.delete {
    background-color: #f44336 !important;
    border: 1px solid #f44336;
    color: #fff;
  }
`;

function TodoEntrustList(props) {
  const { posX, visible, delegationList, onClose, setDelegationList, finishDelegation = () => {} } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const [entrustData, setEntrustData] = useState({});
  const [mobileConfigVisible, setMobileConfigVisble] = useState(false);
  const [mobileFinishInfo, setMobileFinishInfo] = useState({ mobileModalVisible: false, finishItem: {} });
  const isMobile = browserIsMobile();

  const getList = () => delegationApi.getList().then(result => setDelegationList(result));

  const onCardItemClick = item => {
    const data = Object.assign({}, item, {
      startDate: isShowStartDate(item.startDate) ? moment(item.startDate) : null,
      endDate: moment(item.endDate),
    });
    setEntrustData(data);
    if (isMobile) {
      setMobileConfigVisble(true);
      return;
    }
    setModalVisible(true);
  };

  const onFinishEntrust = (e, item) => {
    e.stopPropagation();
    if (isMobile) {
      setMobileFinishInfo({ mobileModalVisible: true, finishItem: item });
      return;
    }

    Dialog.confirm({
      title: _l('结束委托'),
      description: _l('确定结束该委托吗?'),
      buttonType: 'danger',
      onOk: () => {
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
            alert(_l('结束委托成功'));
            getList();
          }
        });
      },
    });
  };

  const isShowStartDate = startDate => {
    return startDate && moment(startDate).diff(moment(), 'minutes') > 0;
  };

  return (
    <React.Fragment>
      {visible ? (
        <div
          className={cx('todoEntrustWrapper', { mobileCarListWrapper: isMobile })}
          style={{ transform: `translate3d(${posX}px,0,0)` }}
        >
          {!isMobile && (
            <div className="todoEntrustHeaderWrapper">
              <div className="flexRow alignItemsCenter">
                <span className="bold">{_l('待办委托')}</span>
                <Tooltip
                  autoCloseDelay={0}
                  text={_l('待办事项如果匹配到多条待办委托，将分配给委托开始时间最早的待办委托')}
                  popupPlacement="bottom"
                >
                  <Icon icon="info_outline" className="pointer Font16 Gray_bd mLeft5" />
                </Tooltip>
              </div>
              <Icon icon="close" className="pointer Font24 Gray_9d ThemeHoverColor3" onClick={onClose} />
            </div>
          )}

          <div className="listWrapper">
            {delegationList.map(item => {
              return (
                <CardWrapper key={item.id} className="pointer" onClick={() => onCardItemClick(item)}>
                  <CardTitle>{item.companyName}</CardTitle>
                  <FlexRow>
                    <RowLabelText isMobile={isMobile}>{_l('委托给')}</RowLabelText>
                    <RowValue isMobile={isMobile}>
                      <div className="flexRow">
                        {isMobile ? (
                          <div className="trusteeAvatarWrapper valignWrapper mRight10">
                            <div className="pointer circle">
                              <img
                                style={{
                                  backgroundColor: '#f5f5f5',
                                  borderRadius: '50%',
                                  width: '22px',
                                  height: '22px',
                                }}
                                placeholder={`${md.global.FileStoreConfig.pictureHost.replace(
                                  /\/$/,
                                  '',
                                )}/UserAvatar/default.gif`}
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
                            <div className="Gray Font13 pLeft5 pRight10 pTop1 ellipsis">{item.trustee.fullName}</div>
                          </div>
                        ) : (
                          <div className="trusteeAvatarWrapper valignWrapper mRight10">
                            <UserHead
                              projectId={item.companyId}
                              className="circle"
                              user={{ userHead: item.trustee.avatar, accountId: item.trustee.accountId }}
                              size={22}
                              chatButton={false}
                            />
                            <UserName
                              projectId={item.companyId}
                              className="Gray Font13 pLeft5 pRight10 pTop1"
                              user={{ userName: item.trustee.fullName, accountId: item.trustee.accountId }}
                              chatButton={false}
                            />
                          </div>
                        )}
                      </div>
                    </RowValue>
                  </FlexRow>
                  <FlexRow>
                    <RowLabelText isMobile={isMobile}>
                      {isShowStartDate(item.startDate) ? _l('委托时间') : _l('截止时间')}
                    </RowLabelText>
                    <RowValue isMobile={isMobile}>
                      {isShowStartDate(item.startDate) ? (
                        <React.Fragment>
                          {moment(item.startDate).format('YYYY-MM-DD HH:mm')}
                          <span className="Gray_75">{` ~ `}</span>
                        </React.Fragment>
                      ) : (
                        ''
                      )}
                      {moment(item.endDate).format('YYYY-MM-DD HH:mm')}
                    </RowValue>
                  </FlexRow>
                  <FlexRow>
                    <RowLabelText isMobile={isMobile}>{_l('委托范围')}</RowLabelText>
                    <RowValue isMobile={isMobile}>
                      {!item.apks ? _l('所有工作流') : _l('%0个应用', item.apks.length)}
                    </RowValue>
                  </FlexRow>
                  <EntrustButton isMobile={isMobile} className="w100" onClick={e => onFinishEntrust(e, item)}>
                    {_l('结束委托')}
                  </EntrustButton>
                </CardWrapper>
              );
            })}

            {delegationList.length < md.global.Account.projects.length && (
              <EntrustButton
                isMobile={isMobile}
                className="mobileStyle"
                isAdd={true}
                onClick={() => {
                  setEntrustData({});
                  if (isMobile) {
                    setMobileConfigVisble(true);
                    return;
                  }
                  setModalVisible(true);
                }}
              >
                <Icon icon="add" className="Font24" />
                {_l('发起委托')}
              </EntrustButton>
            )}
          </div>

          {modalVisible && (
            <TodoEntrustModal
              setTodoEntrustModalVisible={setModalVisible}
              editEntrustData={entrustData}
              onUpdate={getList}
            />
          )}

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

          {mobileFinishInfo.mobileModalVisible && (
            <Popup
              closeOnMaskClick
              visible={mobileFinishInfo.mobileModalVisible}
              position="bottom"
              className="mobileModal topRadius"
              bodyClassName="pTop10 pBottom10 pLeft15 pRight15"
              bodyStyle={{
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
              }}
            >
              <div className="Font16 bold mBottom10">{_l('确认结束委托?')}</div>
              <div className="flexRow mBottom10">
                <Btn
                  radius
                  className="flex mRight6 bold Gray_75 Font13"
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
        </div>
      ) : null}
    </React.Fragment>
  );
}

export default withClickAway(TodoEntrustList);
