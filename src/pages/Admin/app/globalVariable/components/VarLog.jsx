import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import { Drawer } from 'antd';
import styled from 'styled-components';
import { Icon, ScrollView, LoadDiv, UserHead } from 'ming-ui';
import Trigger from 'rc-trigger';
import moment from 'moment';
import cx from 'classnames';
import { quickSelectUser } from 'ming-ui/functions';
import DatePickSelect from 'worksheet/components/DatePickerSelect';
import filterXSS from 'xss';
import variableApi from 'src/api/variable';

const LogDrawer = styled(Drawer)`
  color: #151515;
  .ant-drawer-mask {
    background-color: transparent;
  }
  .ant-drawer-content-wrapper {
    box-shadow: -3px 3px 6px 1px rgba(0, 0, 0, 0.13);
  }
  .ant-drawer-header {
    border-bottom: 0;
    .ant-drawer-header-title {
      flex-direction: row-reverse;
      .ant-drawer-title {
        font-size: 17px;
        font-weight: 600;
      }
      .ant-drawer-close {
        padding: 0;
        margin-top: -24px;
        margin-right: -12px;
      }
    }
  }
  .ant-drawer-body {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;

    .filterWrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 25px;

      .icon {
        font-size: 16px;
        color: #757575;
      }
      .icon.icon-arrow-down {
        color: #9e9e9e;
        font-size: 8px;
        width: 16px;
        display: inline-block;
        text-align: center;
      }
      .icon-cancel1 {
        display: none;
      }

      .selectUser,
      .selectDate {
        padding: 10px;
        background: #fff;
        display: flex;
        align-items: center;
        width: fit-content;
        cursor: pointer;
        border-radius: 3px;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        border: 1px solid #f5f5f5;
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
      .selectConText {
        margin: 0 4px;
        color: #9e9e9e;
      }
      .selectLight {
        color: #2196f3;
        .icon {
          color: #2196f3;
        }
        .selectConText {
          color: #2196f3;
        }
      }
    }
    .emptyText {
      margin-top: 100px;
      font-size: 13px;
      color: #bdbdbd;
      text-align: center;
    }
  }
`;

const LogItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  margin: 0 10px;
  border-bottom: 1px solid #eaeaea;

  .logContent {
    font-size: 12px;
    color: #9e9e9e;
    a {
      color: #151515;
    }
  }
  .operatorAvatar {
    display: inline-block !important;
    margin-right: 8px;
    img {
      margin-top: -2px;
    }
  }
`;

export default function VarLog(props) {
  const { onClose, variableId, projectId = '' } = props;
  const selectUserRef = useRef();
  const [{ selectUser, selectDate }, setFilter] = useSetState({
    selectUser: undefined,
    selectDate: {
      visible: false,
      range: undefined,
    },
  });
  const [fetchState, setFetchState] = useSetState({ loading: true, pageIndex: 1, noMore: false });
  const [logList, setLogList] = useState([]);

  const onFetch = () => {
    const operator = ((selectUser || [])[0] || {}).accountId;
    const startDateTime = ((selectDate.range || {}).value || {})[0];
    const endDateTime = ((selectDate.range || {}).value || {})[1];
    const start = startDateTime ? moment(startDateTime).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const end = endDateTime ? moment(endDateTime).format('YYYY-MM-DD HH:mm:ss') : undefined;

    setFetchState({ loading: true });
    variableApi
      .getLogs({
        variableId,
        pageIndex: fetchState.pageIndex,
        pageSize: 50,
        start,
        end,
        operator,
      })
      .then(({ logs }) => {
        setLogList(fetchState.pageIndex > 1 ? logList.concat(logs) : logs);
        setFetchState({ loading: false, noMore: logs.length < 50 });
      });
  };

  useEffect(onFetch, [fetchState.pageIndex, selectUser, selectDate]);

  const onScrollEnd = () => {
    if (!fetchState.noMore) {
      setFetchState({ pageIndex: fetchState.pageIndex + 1 });
    }
  };

  const selectUserCallback = value => {
    setFetchState({ operator: value });
    setFilter({ selectUser: value });
  };

  const pickUser = () => {
    const filterIds = ['user-sub', 'user-undefined'];
    quickSelectUser(selectUserRef.current, {
      hidePortalCurrentUser: true,
      selectRangeOptions: false,
      includeSystemField: true,
      prefixOnlySystemField: true,
      rect: selectUserRef.current.getBoundingClientRect(),
      tabType: 1,
      showMoreInvite: false,
      isTask: false,
      filterAccountIds: filterIds,
      selectedAccountIds: (selectUser || []).map(item => item.accountId),
      offset: {
        top: 2,
      },
      zIndex: 10001,
      SelectUserSettings: {
        unique: true,
        projectId,
        filterAccountIds: filterIds,
        selectedAccountIds: (selectUser || []).map(item => item.accountId),
        callback: selectUserCallback,
      },
      selectCb: selectUserCallback,
    });
  };

  return (
    <LogDrawer
      visible
      width={470}
      placement="right"
      title={_l('日志')}
      closeIcon={<i className="icon-close Font18" />}
      onClose={onClose}
    >
      <div className="filterWrapper">
        <span className={cx({ selectLight: selectUser }, 'selectUser')} onClick={pickUser} ref={selectUserRef}>
          <Icon icon="task_custom_personnel" />
          <span className="selectConText">{selectUser ? selectUser[0].fullname : _l('操作者')}</span>
          <Icon icon="arrow-down" style={selectUser ? {} : { display: 'inline-block' }} />
          {selectUser && (
            <Icon
              onClick={e => {
                e.stopPropagation();
                setFilter({ selectUser: undefined });
              }}
              icon="cancel1"
            />
          )}
        </span>
        <Trigger
          popupVisible={selectDate.visible}
          onPopupVisibleChange={visible =>
            setFilter({
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
                if (!data.value) {
                  return;
                }
                setFilter({
                  selectDate: {
                    visible: false,
                    range: {
                      ...data,
                      value: [data.value[0], data.value[1]],
                    },
                  },
                });
              }}
            />
          }
        >
          <span className={`${selectDate.range ? 'selectLight' : ''} selectDate`}>
            <Icon icon="event" />
            {selectDate.range && <span className="selectConText">{selectDate.range.label}</span>}
            {selectDate.range && <Icon icon="arrow-down" />}
            {selectDate.range && (
              <Icon
                icon="cancel1"
                onClick={e => {
                  e.stopPropagation();
                  setFilter({
                    selectDate: {
                      visible: selectDate.visible,
                      range: undefined,
                    },
                  });
                }}
              />
            )}
          </span>
        </Trigger>
      </div>
      {fetchState.loading && fetchState.pageIndex === 1 ? (
        <LoadDiv className="mTop10" />
      ) : !logList.length ? (
        <div className="emptyText">{_l('暂无数据')}</div>
      ) : (
        <ScrollView onScrollEnd={onScrollEnd}>
          {logList.map(item => {
            return (
              <LogItem key={item.id}>
                <div>
                  <UserHead
                    className="circle operatorAvatar"
                    user={{
                      userHead: item.operator.avatar,
                      accountId: item.operator.accountId,
                    }}
                    size={20}
                    projectId={projectId}
                  />
                  <span className="Font12 mRight8">{item.operator.fullname}</span>
                  <span
                    className="logContent"
                    dangerouslySetInnerHTML={{ __html: filterXSS(item.opeartContent) }}
                  ></span>
                </div>
                <div className="Font12 Gray_9e nowrap pTop2">{item.operationDatetime}</div>
              </LogItem>
            );
          })}
        </ScrollView>
      )}
    </LogDrawer>
  );
}
