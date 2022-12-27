import React, { useState } from 'react';
import './index.less';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { Icon, Dialog } from 'ming-ui';
import styled from 'styled-components';
import moment from 'moment';
import delegationApi from '../../api/delegation';
import TodoEntrustModal from './TodoEntrustModal';
import UserHead from 'src/pages/feed/components/userHead';
import UserName from 'src/pages/feed/components/userName';

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
  color: #333333;
  font-size: 15px;
  font-weight: bold;
`;

const FlexRow = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const RowLabelText = styled.div`
  flex: 1;
  color: #9e9e9e;
  font-size: 14px;
`;

const RowValue = styled.div`
  flex: 4;
  color: #333333;
  font-size: 14px;
`;

const EntrustButton = styled.button(
  ({ isAdd }) => `
display: flex;
justify-content: center;
align-items: center;
margin-top: 20px;
line-height: 36px;
border: 0;
border-radius: 4px;
background-color: ${!isAdd ? '#f5f5f5' : '#f7f7f7'};
color: #2196f3;
font-size: 14px;
cursor: pointer;

&:hover {
  color: ${!isAdd && '#fff'}
  background-color: ${!isAdd ? '#2196f3' : '#fff'};
}
`,
);

function TodoEntrustList(props) {
  const { posX, visible, delegationList, onClose, setDelegationList } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const [entrustData, setEntrustData] = useState({});

  const onCardItemClick = item => {
    const data = Object.assign({}, item, {
      startDate: isShowStartDate(item.startDate) ? moment(item.startDate) : null,
      endDate: moment(item.endDate),
    });
    setEntrustData(data);
    setModalVisible(true);
  };

  const onFinishEntrust = (e, item) => {
    e.stopPropagation();

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
            delegationApi.getList().then(result => setDelegationList(result));
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
        <div className="todoEntrustWrapper" style={{ transform: `translate3d(${posX}px,0,0)` }}>
          <div className="todoEntrustHeaderWrapper">
            <span className="bold">{_l('待办委托')}</span>
            <Icon icon="close" className="pointer Font24 Gray_9d ThemeHoverColor3" onClick={onClose} />
          </div>

          <div className="listWrapper">
            {delegationList.map(item => {
              return (
                <CardWrapper key={item.id} className="pointer" onClick={() => onCardItemClick(item)}>
                  <CardTitle>{item.companyName}</CardTitle>
                  <FlexRow>
                    <RowLabelText>{_l('委托给')}</RowLabelText>
                    <RowValue>
                      <div className="flexRow">
                        <div className="trusteeAvatarWrapper valignWrapper mRight10">
                          <UserHead
                            className="circle"
                            user={{
                              userHead: item.trustee.avatar,
                              accountId: item.trustee.accountId,
                            }}
                            lazy={'false'}
                            size={22}
                          />
                          <UserName
                            className="Gray Font13 pLeft5 pRight10 pTop1"
                            user={{
                              userName: item.trustee.fullName,
                              accountId: item.trustee.accountId,
                            }}
                          />
                        </div>
                      </div>
                    </RowValue>
                  </FlexRow>
                  <FlexRow>
                    <RowLabelText>{isShowStartDate(item.startDate) ? _l('委托时间') : _l('截止时间')}</RowLabelText>
                    <RowValue>
                      {isShowStartDate(item.startDate) ? (
                        <React.Fragment>
                          {moment(item.startDate).format('YYYY-MM-DD HH:mm')}
                          <span className="Gray_9e">{` ~ `}</span>
                        </React.Fragment>
                      ) : (
                        ''
                      )}
                      {moment(item.endDate).format('YYYY-MM-DD HH:mm')}
                    </RowValue>
                  </FlexRow>
                  <EntrustButton className="w100" onClick={e => onFinishEntrust(e, item)}>
                    {_l('结束委托')}
                  </EntrustButton>
                </CardWrapper>
              );
            })}

            {delegationList.length < md.global.Account.projects.length && (
              <EntrustButton
                isAdd={true}
                onClick={() => {
                  setEntrustData({});
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
              delegationList={delegationList}
              setDelegationList={setDelegationList}
            />
          )}
        </div>
      ) : null}
    </React.Fragment>
  );
}

export default withClickAway(TodoEntrustList);
