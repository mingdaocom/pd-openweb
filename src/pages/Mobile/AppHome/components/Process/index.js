import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import instanceVersionApi from 'src/pages/workflow/api/instanceVersion';
import ProcessRecordInfo from 'mobile/ProcessRecord';
import { getTodoCount } from 'src/pages/workflow/MyProcess/Entry';
import { handlePushState, handleReplaceState } from 'src/utils/project';
import EmptyStatus from '../EmptyStatus';

const processList = [
  { key: 'waitingApproval', icon: 'stamp', text: _l('审批'), tab: 'waitingApproval' },
  { key: 'waitingWrite', icon: 'fill', text: _l('填写'), tab: 'waitingWrite' },
  { key: 'waitingExamine', icon: 'sending', text: _l('抄送'), tab: 'unread' },
  { key: 'mySponsor', icon: 'adds', text: _l('我发起'), tab: 'mySponsor' },
];

const Wrap = styled.div`
  padding: 16px 0;
  .processItem {
    justify-content: center;
    position: relative;
    img {
      width: 40px;
    }
  }
  .bold500 {
    font-weight: 500;
  }
`;

const ListWrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 340px;
  padding: 16px 16px 0;
  .tabWrap {
    height: 51px;
    background: #f8f8f8;
    border-radius: 8px;
    align-items: center;
    padding: 2px;
    .processItem {
      height: 100%;
      border-radius: 6px;
      text-align: center;
      &.active {
        color: #1677ff;
        background: #ffffff;
        box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.16);
      }
    }
  }
  .list {
    overflow: hidden;
    margin-top: 4px;
    .listItem {
      margin-top: 14px;
      img {
        width: 28px;
        border-radius: 50%;
      }
    }
  }
  .bold500 {
    font-weight: 500;
  }
`;

let request = null;

const getStateParam = tab => {
  let param = {};
  if (tab === 'waitingApproval') {
    param = { type: 4 };
  }
  if (tab === 'waitingWrite') {
    param = { type: 3 };
  }
  if (tab === 'unread') {
    param = {
      type: 5,
      complete: false,
    };
  }
  if (tab === 'mySponsor') {
    param = { type: 0 };
  }

  return param;
};

export default function Process(props) {
  const { todoDisplay, projectId } = props;

  const [data, setData] = useSetState({});
  const { currentTab = 'waitingApproval', todoList = [], loading = false, previewRecord = {}, countData = {} } = data;

  useEffect(() => {
    getTodoCountData();
  }, [projectId]);

  useEffect(() => {
    getList();
  }, [currentTab]);

  useEffect(() => {
    window.addEventListener('popstate', onQueryChange);
    return () => {
      window.removeEventListener('popstate', onQueryChange);
    };
  }, []);

  const onQueryChange = () => {
    if (_.isEmpty(previewRecord)) return;
    handleReplaceState('page', 'processRecord', () => setData({ previewRecord: {} }));
  };

  const getTodoCountData = () => {
    getTodoCount().then(countData => {
      setData({ countData });
    });
  };

  const getList = () => {
    if (request) {
      request.abort();
    }

    setData({ loading: true });

    const params = getStateParam(currentTab);

    request = instanceVersionApi.getTodoList(params);
    request.then(res => {
      if (res) {
        setData({ todoList: res, loading: false });
      }
    });
  };

  const handleApproveDone = ({ workId }) => {
    const countDataState = { ...countData };

    if (currentTab === 'waitingApproval') {
      countDataState.waitingApproval = countData.waitingApproval - 1;
    }
    if (currentTab === 'waitingWrite') {
      countDataState.waitingWrite = countData.waitingWrite - 1;
    }
    if (currentTab === 'mySponsor') {
      countDataState.waitingExamine = countData.waitingExamine - 1;
    }

    setData({
      countData: countDataState,
      todoList: todoList.filter(item => item.workId !== workId),
    });
  };

  if (todoDisplay === 1) {
    // 列表
    return (
      <ListWrap>
        <div className="flexRow alignItemsCenter mBottom18">
          <div className="Font17 bold flex">{_l('流程待办')}</div>
          <div
            className="flexRow alignItemsCenter"
            onClick={() => {
              if (currentTab === 'unread') {
                window.mobileNavigateTo(`/mobile/processInform/${currentTab}`);
                return;
              }
              window.mobileNavigateTo(`/mobile/processMatters/${currentTab}`);
            }}
          >
            <span className="Gray_75 mRight2 Font15 bold500">{_l('全部')}</span>
            <i className="icon icon-navigate_next Gray_bd Font18" />
          </div>
        </div>
        <div className="tabWrap flexRow">
          {processList.map(item => {
            return (
              <div
                className={cx('processItem flex LineHeight15 pTop8', {
                  active: item.tab === currentTab,
                })}
                onClick={() => setData({ currentTab: item.tab })}
              >
                <div className="Font18 bold">
                  {countData[item.key] ? (countData[item.key] > 99 ? '99+' : countData[item.key]) : 0}
                </div>
                <div className="bold Font12 mTop4">{item.text}</div>
              </div>
            );
          })}
        </div>
        <div className="list flex">
          {loading ? (
            <LoadDiv />
          ) : _.isEmpty(todoList) ? (
            <EmptyStatus emptyType="process" emptyTxt={_l('没有待办')} />
          ) : (
            todoList.slice(0, 5).map(item => {
              return (
                <div
                  className="listItem flexRow alignItemsCenter"
                  onClick={() => {
                    handlePushState('page', 'processRecord');
                    setData({ previewRecord: { instanceId: item.id, workId: item.workId } });
                  }}
                >
                  <img src={_.get(item, 'createAccount.avatar')} className="mRight10" />
                  <div className="flex ellipsis Font15">{item.title || _l('未命名')}</div>
                </div>
              );
            })
          )}
        </div>

        <ProcessRecordInfo
          isModal
          className="full"
          visible={!_.isEmpty(previewRecord)}
          instanceId={previewRecord.instanceId}
          workId={previewRecord.workId}
          onClose={data => {
            if (data.id) {
              handleApproveDone(data);
            }
            setData({ previewRecord: {} });
          }}
        />
      </ListWrap>
    );
  }

  return (
    <Wrap>
      <div className="flexRow alignItemsCenter pLeft16 pRight16 mBottom8">
        <div className="Font17 bold flex">{_l('流程待办')}</div>
        <div
          className="flexRow alignItemsCenter"
          onClick={() => {
            window.mobileNavigateTo('/mobile/processMatters/processed');
          }}
        >
          <span className="Gray_75 Font15 bold500">{_l('已完成')}</span>
          <i className="icon icon-navigate_next Gray_bd Font18" />
        </div>
      </div>
      <div className="flexRow">
        {processList.map(item => {
          return (
            <div
              className="processItem flexColumn flex alignItemsCenter mTop10"
              onClick={() => {
                if (item.key === 'waitingExamine') {
                  window.mobileNavigateTo(`/mobile/processInform/${item.tab}`);
                  return;
                }
                window.mobileNavigateTo(`/mobile/processMatters/${item.tab}`);
              }}
            >
              <div className="bold Font24 mBottom4">
                {countData[item.key] ? (countData[item.key] > 99 ? '99+' : countData[item.key]) : 0}
              </div>
              <div className="bold500 Font13">{item.text}</div>
            </div>
          );
        })}
      </div>
    </Wrap>
  );
}
