import React, { Fragment, useRef } from 'react';
import { useSetState } from 'react-use';
import { ScrollView, Icon } from 'ming-ui';
import moment from 'moment';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import EmptyStatus from '../../EmptyStatus';
import { quickSelectUser } from 'ming-ui/functions';
import DatePickSelect from 'src/pages/worksheet/components/DatePickerSelect';
import appManagementAjax from 'src/api/appManagement';
import cx from 'classnames';
import _ from 'lodash';
import { useEffect } from 'react';

const Header = styled.div`
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 24px;
`;

const Content = styled.div`
  flex: 1;
  height: calc(100% - 50px);
  background-color: #f7f7f7;
  padding: 16px 0;
  overflow-y: auto;
`;

const SelectCon = styled.div`
  font-size: 13px;
  color: #9e9e9e;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 24px;
  .icon {
    font-size: 18px;
    color: #757575;
  }
  .icon.icon-arrow-down {
    color: #9e9e9e;
    font-size: 8px;
    width: 18px;
    display: inline-block;
    text-align: center;
  }
  .icon-cancel1 {
    display: none;
  }
  .selectUser,
  .selectDate {
    padding: 8px 12px;
    background: #fff;
    display: flex;
    align-items: center;
    width: fit-content;
    cursor: pointer;
    border-radius: 3px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    &:hover {
      box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2);
      .icon-cancel1 {
        display: inline-block;
      }
      .icon-arrow-down {
        display: none;
      }
    }
  }
  .selectUser {
    margin-right: 8px;
  }
  .selectConText {
    margin: 0 4px;
  }
  .selectLight {
    color: #2196f3;
    .icon {
      color: #2196f3;
    }
  }
  .left {
    display: flex;
  }
`;

const ActionLogWrap = styled.div`
  border-bottom: 1px solid #eaeaea;
  padding: 16px;
  background-color: #fff;
  margin: 0 24px 16px;
  box-shadow: 0px 1px 2px 1px rgba(0, 0, 0, 0.08);
  .row {
    justify-content: space-between;
    font-size: 13px;
    .avatar {
      width: 20px;
      height: 20px;
      display: inline-block;
      border-radius: 50%;
      vertical-align: middle;
    }
    .name,
    .action,
    .date {
      color: #9e9e9e;
    }
  }
  .actContent {
    color: #333;
    padding-left: 8px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    .changeBefore {
      color: #bdbdbd;
      text-decoration: line-through;
    }
  }
`;

const OPERATION_DATA_LIST = {
  6: _l('用备份还原了新应用'),
  1: _l('将应用备份为'),
  2: _l('将应用还原为'),
  3: _l('删除了备份'),
  4: _l('重命名了备份'),
  5: _l('下载了备份'),
};

const PAGESIZE = 10;
export default function ActionLogs(props) {
  const { appId, projectId, onClose = () => {} } = props;
  const selectUserRef = useRef();
  const [{ selectUser, selectDate, isLoading, pageIndex, actLogList, startTime, endTime, total }, setPara] =
    useSetState({
      selectUser: undefined,
      selectDate: {
        visible: false,
        range: undefined,
      },
      pageIndexs: {
        newLogIndex: 1,
        oldLogIndex: 0,
      },
      isLoading: false,
      pageIndex: 1,
      actLogList: [],
    });

  useEffect(() => {
    getList();
  }, []);

  const getList = ({ pageIndex = 1, ...rest } = {}) => {
    if (isLoading) return;
    setPara({ isLoading: true });
    appManagementAjax
      .pageGetBackupRestoreOperationLog({
        pageIndex: pageIndex || 1,
        pageSize: PAGESIZE,
        projectId,
        appId,
        isBackup: false,
        startTime,
        endTime,
        accountId: selectUser && !_.isEmpty(selectUser) && selectUser[0].accountId,
        ...rest,
      })
      .then(({ list = [], total }) => {
        let temp = pageIndex === 1 ? list : actLogList.concat(list);
        setPara({
          isLoading: false,
          actLogList: temp,
          pageIndex,
          total,
        });
      });
  };

  const selectUserCallback = value => {
    setPara({
      selectUser: value,
      pageIndex: 1,
    });
    getList({ accountId: value[0].accountId });
  };

  const pickUser = () => {
    const filterIds = ['user-sub', 'user-undefined'];
    quickSelectUser(selectUserRef.current, {
      hidePortalCurrentUser: true,
      selectRangeOptions: false,
      includeSystemField: true,
      prefixOnlySystemField: true,
      rect: selectUserRef.current.getBoundingClientRect(),

      tabType: 3,
      appId: appId,
      showMoreInvite: false,
      isTask: false,
      filterAccountIds: selectUser ? selectUser.map(item => item.accountId).concat(filterIds) : [].concat(filterIds),
      offset: {
        top: 2,
      },
      zIndex: 10001,
      SelectUserSettings: {
        unique: true,
        projectId: projectId,
        filterAccountIds: selectUser ? selectUser.map(item => item.accountId).concat(filterIds) : [].concat(filterIds),
        callback: selectUserCallback,
      },
      selectCb: selectUserCallback,
    });
  };

  const clearSelectUser = e => {
    e.stopPropagation();
    setPara({
      selectUser: undefined,
      pageIndex: 1,
    });
    getList({ accountId: undefined, pageIndex: 1 });
  };

  const onScrollEnd = () => {
    if (!isLoading && actLogList.length < total) {
      getList({ pageIndex: pageIndex + 1 });
    }
  };

  const clearSelectDate = e => {
    e.stopPropagation();
    setPara({
      selectDate: {
        visible: selectDate.visible,
        range: undefined,
      },
      pageIndex: 1,
      startTime: undefined,
      endTime: undefined,
    });
    getList({ pageIndex: 1, startTime: undefined, endTime: undefined });
  };

  return (
    <Fragment>
      <Header>
        <div className="Font17 bold flex">{_l('操作日志')}</div>
        <Icon icon="close" className="Hand Font18" onClick={onClose} />
      </Header>
      <Content>
        <ScrollView onScrollEnd={onScrollEnd}>
          <SelectCon>
            <div className="left">
              <span className={cx({ selectLight: selectUser }, 'selectUser')} onClick={pickUser} ref={selectUserRef}>
                <Icon icon="person" />
                <span className="selectConText">{selectUser ? selectUser[0].fullname : _l('操作者')}</span>
                <Icon icon="arrow-down" style={selectUser ? {} : { display: 'inline-block' }} />
                {selectUser && <Icon onClick={clearSelectUser} icon="cancel1" />}
              </span>
            </div>
            <Trigger
              popupVisible={selectDate.visible}
              onPopupVisibleChange={visible =>
                setPara({
                  selectDate: {
                    ...selectDate,
                    visible: visible,
                  },
                })
              }
              action={['click']}
              popupAlign={{ points: ['tr', 'br'] }}
              popup={
                <DatePickSelect
                  onChange={data => {
                    setPara({
                      selectDate: {
                        visible: false,
                        range: !data.value
                          ? undefined
                          : {
                              ...data,
                              value: [data.value[0], data.value[1]],
                            },
                      },
                      startTime: !data.value ? undefined : data.value[0],
                      endTime: !data.value ? undefined : data.value[1],
                      pageIndex: 1,
                    });
                    getList({
                      startTime: !data.value ? undefined : moment(data.value[0]).format('YYYY-MM-DD HH:mm:ss'),
                      endTime: !data.value ? undefined : moment(data.value[1]).format('YYYY-MM-DD HH:mm:ss'),
                      pageIndex: 1,
                    });
                  }}
                />
              }
            >
              <span className={`${selectDate.range ? 'selectLight' : ''} selectDate`}>
                <Icon icon="event" />
                {selectDate.range && <span className="selectConText">{selectDate.range.label}</span>}
                {selectDate.range && <Icon icon="arrow-down" />}
                {selectDate.range && <Icon icon="cancel1" onClick={clearSelectDate} />}
              </span>
            </Trigger>
          </SelectCon>

          {_.isEmpty(actLogList) ? (
            <EmptyStatus
              icon="sp_assignment_white"
              radiusSize={100}
              iconClassName="Font36"
              emptyTxt={_l('暂无日志信息')}
              emptyTxtClassName="Font15 mTop12"
            />
          ) : (
            actLogList.map(item => {
              const {
                id,
                operator,
                operationType,
                backupFileName,
                oldBackupFileName,
                operationDateTime,
                rowTotal,
                appItemTotal,
              } = item;
              return (
                <ActionLogWrap key={id}>
                  <div className="flexRow row mBottom10">
                    <img src={operator.avatar} className="avatar mRight8" />
                    <span className="Font12 mRight5">{operator.fullname}</span>
                    <span className="action flex">
                      {(operationType || operationType === 0) && OPERATION_DATA_LIST[item.operationType]}
                    </span>
                    <div className="date">{moment(operationDateTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                  </div>
                  <div className="actContent">
                    <span className={cx('mRight6', { changeBefore: operationType === 4 })}>
                      {operationType === 4 ? oldBackupFileName : backupFileName}
                    </span>
                    {operationType === 4 && <span className="renameContent">{backupFileName}</span>}
                  </div>
                  {appItemTotal || rowTotal ? (
                    <div className="Gray_9e">
                      <span className="mRight16"> {appItemTotal ? _l('%0个应用项', appItemTotal) : ''}</span>
                      <span>{rowTotal ? _l('%0行记录', rowTotal) : ''}</span>
                    </div>
                  ) : (
                    ''
                  )}
                </ActionLogWrap>
              );
            })
          )}
        </ScrollView>
      </Content>
    </Fragment>
  );
}
