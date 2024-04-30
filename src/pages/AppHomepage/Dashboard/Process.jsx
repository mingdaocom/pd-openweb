import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import MyProcess, { TABS } from 'src/pages/workflow/MyProcess';
import cx from 'classnames';
import { getStateParam } from 'src/pages/workflow/MyProcess';
import instanceVersionApi from 'src/pages/workflow/api/instanceVersion';
import _ from 'lodash';
import ExecDialog from 'src/pages/workflow/components/ExecDialog';
import todoEmpty from 'staticfiles/images/todolist.png';
import { getTodoCount } from 'src/pages/workflow/MyProcess/Entry';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .finishedCon {
    padding: 8px 10px;
    border-radius: 3px;
    color: #9e9e9e;
    font-size: 14px;
    cursor: pointer;
    &:hover {
      background: #f8f8f8;
    }
  }
  .processItem {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    cursor: pointer;

    .countText {
      font-size: 28px;
      font-weight: bold;
      font-family: Arial;
    }

    &:hover {
      background: #f8f8f8;
    }
  }
  .divider {
    margin: 20px;
    width: 1px;
    background: #d5d5d5;
  }
`;

const TodoTabList = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 8px 0px 20px;
  .tabItem {
    display: flex;
    align-items: center;
    position: relative;
    padding: 8px 12px;
    border-radius: 4px;

    .itemText {
      font-size: 14px;
      font-weight: bold;
    }
    .itemCount {
      width: auto;
      margin-left: 4px;
      height: 20px;
      line-height: 20px;
      padding: 0 6px;
      border-radius: 10px;
      background: rgba(244, 67, 54, 0.16);
      color: #f44336;
      font-size: 12px;
      font-weight: bold;
    }

    &::after {
      content: '';
      position: absolute;
      height: 3px;
      left: 8px;
      right: 8px;
      bottom: 0px;
      display: inline-block;
    }
    &.isCur {
      font-weight: bold;
      color: ${({ themeColor }) => themeColor};
      &::after {
        background-color: ${({ themeColor }) => themeColor};
      }
      &:hover {
        background: #fff !important;
      }
    }
    &:hover {
      background: #f5f5f5;
    }
  }

  .viewAll {
    display: flex;
    align-items: center;
    padding: 6px 4px 6px 10px;
    border-radius: 4px;
    color: #9e9e9e;
    cursor: pointer;
    &:hover {
      background-color: #f8f8f8;
    }
  }
`;

const DataListWrapper = styled.div`
  padding: 0 20px;
  overflow: auto;
  height: 180px;
  &.displayComplete {
    min-height: 36px;
    max-height: 180px;
    height: auto;
  }
  .listItem {
    display: flex;
    align-items: center;
    width: 100%;
    height: 36px;
    padding: 0 6px;
    border-radius: 3px;
    cursor: pointer;
    &:hover {
      background: #f5f5f5;
      .rightText {
        display: none;
      }
      .dateText {
        display: block;
        min-width: 135px;
        text-align: right;
      }
    }
    img {
      width: 20px;
      min-width: 20px;
      height: 20px;
      border-radius: 50%;
    }
    .rightText {
      color: #9f9f9f;
      max-width: 180px;
      text-align: right;
    }
    .dateText {
      display: none;
      span {
        color: #9f9f9f;
      }
      .openIcon {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        margin-left: 12px;
        cursor: pointer;
        &:hover {
          background: #fff;
        }
      }
    }
  }
  .allBtn {
    width: fit-content;
    height: 32px;
    line-height: 32px;
    padding: 0 20px;
    border-radius: 3px;
    margin-top: 16px;
    cursor: pointer;
    color: ${({ themeColor }) => themeColor};
    background: ${({ btnColor }) => btnColor};
    &:hover {
      background: ${({ hoverColor }) => hoverColor};
    }
  }
`;

const ProcessSkeleton = styled.div`
  flex: 1;
  padding: 24px 24px 12px 24px;
  .skeletonBlock {
    width: 100%;
    height: 100%;
    background-color: #f6f6f6;
    border-radius: 11px;
  }
`;

export default function Process(props) {
  const {
    displayComplete,
    countData,
    updateCountData,
    dashboardColor,
    todoDisplay,
    loading,
    flag,
    setFlag,
    currentTheme,
  } = props;
  const [myProcess, setMyProcess] = useState({ visible: false });
  const [currentTab, setCurrentTab] = useState(0);
  const [todoLoading, setTodoLoading] = useState(true);
  const [todoList, setTodoList] = useState([]);
  const [selectProcess, setSelectProcess] = useState(null);
  const [showViewAll, setShowViewAll] = useState(false);

  const processList = [
    {
      key: 'waitingApproval',
      icon: 'stamp',
      shallowIcon: 'stamp_shallow',
      text: _l('审批'),
      tab: TABS.WAITING_APPROVE,
    },
    { key: 'waitingWrite', icon: 'fill', shallowIcon: 'fill_shallow', text: _l('填写'), tab: TABS.WAITING_FILL },
    {
      key: 'waitingExamine',
      icon: 'sending',
      shallowIcon: 'sending_shallow',
      text: _l('抄送'),
      tab: TABS.WAITING_EXAMINE,
    },
    { key: 'mySponsor', icon: 'adds', shallowIcon: 'adds_shallow', text: _l('发起'), tab: TABS.MY_SPONSOR },
    { key: 'finished', icon: 'Finish', text: _l('已完成'), tab: TABS.COMPLETE },
  ];

  useEffect(() => {
    todoDisplay === 1 && fetchTodoList();
    if (flag) {
      getTodoCount().then(data => updateCountData(data));
    }
  }, [todoDisplay, flag]);

  const fetchTodoList = () => {
    setTodoLoading(true);
    const params = {
      pageIndex: 1,
      pageSize: 30,
      ...getStateParam(currentTab),
    };
    instanceVersionApi.getTodoList(params).then(res => {
      if (res) {
        setTodoList(res);
        setTodoLoading(false);
        setShowViewAll(res.length >= 20);
      }
    });
  };

  const handleRead = item => {
    const { waitingExamine, myProcessCount } = countData;
    const newList = todoList.filter(n => n.workId !== item.workId);
    setTodoList(newList);
    updateCountData({
      ...countData,
      waitingExamine: waitingExamine - 1,
      myProcessCount: myProcessCount - 1,
    });
  };

  const handleSave = item => {
    const { waitingWrite, waitingApproval, waitingDispose, myProcessCount } = countData;
    const newList = todoList.filter(n => n.workId !== item.workId);
    setTodoList(newList);

    let param = null;

    if (item.flowNodeType === 3) {
      param = {
        waitingWrite: waitingWrite - 1,
      };
    }
    if (item.flowNodeType === 4) {
      param = {
        waitingApproval: waitingApproval - 1,
      };
    }

    updateCountData({
      ...countData,
      ...param,
      waitingDispose: waitingDispose - 1,
      myProcessCount: myProcessCount - 1,
    });
  };

  const renderTodoList = () => {
    return (
      <React.Fragment>
        <TodoTabList themeColor={dashboardColor.themeColor}>
          {processList
            .filter(item => item.key !== 'finished')
            .map((item, index) => {
              return (
                <div
                  className="flexRow alignItemsCenter pointer"
                  onClick={() => {
                    setCurrentTab(item.tab);
                    setFlag(+new Date());
                  }}
                >
                  <div key={index} className={cx('tabItem', { isCur: currentTab === item.tab })}>
                    <span className="itemText">{item.text}</span>
                    {!!countData[item.key] && (
                      <div className={item.key !== 'mySponsor' ? 'itemCount' : 'mLeft4 bold Gray_9e'}>
                        {countData[item.key] > 99 ? '99+' : countData[item.key]}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          <div className="flex"></div>
          <div className="viewAll" onClick={() => setMyProcess({ visible: true, activeTab: currentTab })}>
            <span>{_l('全部')}</span>
            <Icon icon="arrow-right-border" className="mLeft5 Font16" />
          </div>
        </TodoTabList>

        {todoLoading && <LoadDiv className="mTop10" />}

        {!todoLoading && !todoList.length && (
          <div className="flex flexColumn alignItemsCenter justifyContentCenter mTop32 mBottom32">
            <img src={todoEmpty} width={80} />
            <div className="Font14">
              <span className="Gray_75">{currentTab === TABS.MY_SPONSOR ? _l('暂无流程') : _l('没有待办')}</span>
            </div>
          </div>
        )}

        {!todoLoading && !!todoList.length && (
          <DataListWrapper
            themeColor={dashboardColor.themeColor}
            btnColor={dashboardColor.activeColor}
            hoverColor={dashboardColor.hoverColor}
            className={cx({ displayComplete })}
          >
            {todoList.map((item, index) => {
              return (
                <div key={index} className="listItem" onClick={() => setSelectProcess(item)}>
                  <img src={_.get(item, 'createAccount.avatar')} />
                  <div className="bold mLeft8 overflow_ellipsis" title={item.title || _l('未命名')}>
                    {item.title || _l('未命名')}
                  </div>
                  <div className="flex"></div>
                  <div
                    className="rightText overflow_ellipsis"
                    title={`${_.get(item, 'app.name')} · ${_.get(item, 'process.name')}`}
                  >
                    {`${_.get(item, 'app.name')} · ${_.get(item, 'process.name')}`}
                  </div>
                  <div className="dateText">
                    <span>{createTimeSpan(item.createDate)}</span>
                  </div>
                </div>
              );
            })}
            {showViewAll && (
              <div className="allBtn" onClick={() => setMyProcess({ visible: true, activeTab: currentTab })}>
                {_l('查看全部')}
              </div>
            )}
          </DataListWrapper>
        )}

        {selectProcess ? (
          <ExecDialog
            id={selectProcess.id}
            workId={selectProcess.workId}
            onClose={() => setSelectProcess(null)}
            onRead={() => {
              if (currentTab === TABS.WAITING_EXAMINE) {
                handleRead(selectProcess);
              }
            }}
            onSave={() => {
              if ([TABS.WAITING_APPROVE, TABS.WAITING_FILL].includes(currentTab)) {
                handleSave(selectProcess);
              }
            }}
            onError={() => {
              if ([TABS.WAITING_APPROVE, TABS.WAITING_FILL].includes(currentTab)) {
                handleSave(selectProcess);
              }
              if (currentTab === TABS.MY_SPONSOR || currentTab === TABS.COMPLETE) {
                const newList = todoList.filter(n => n.workId !== selectProcess.workId);
                setTodoList(newList);
                if (currentTab === TABS.MY_SPONSOR) {
                  const { mySponsor } = countData;
                  updateCountData({ ...countData, mySponsor: mySponsor - 1 });
                }
              }
              setSelectProcess(null);
            }}
          />
        ) : null}
      </React.Fragment>
    );
  };

  if (loading) {
    return (
      <ProcessSkeleton>
        <div className="skeletonBlock" style={{ height: todoDisplay === 1 ? 192 : 152 }}></div>
      </ProcessSkeleton>
    );
  }

  return (
    <Wrapper>
      {todoDisplay === 1 && renderTodoList()}

      {todoDisplay !== 1 && (
        <React.Fragment>
          <div className="cardTitle">
            <div className="titleText">
              {currentTheme.processIcon && <img src={currentTheme.processIcon} />}
              {_l('流程待办')}
            </div>
            <div className="flex"></div>
            {!displayComplete && (
              <div
                className="finishedCon"
                onClick={e => {
                  e.stopPropagation();
                  setMyProcess({ visible: true, activeTab: TABS.COMPLETE });
                }}
              >
                {_l('已完成')}
              </div>
            )}
          </div>
          <div className="flex flexRow pLeft20 pRight20">
            {processList
              .filter(item => displayComplete || item.key !== 'finished')
              .map(item => (
                <React.Fragment>
                  {item.key === 'finished' && <div className="divider"></div>}
                  <div className="processItem" onClick={() => setMyProcess({ visible: true, activeTab: item.tab })}>
                    <div className="countText">{countData[item.key] || 0}</div>
                    <div className="Font15 mBottom16">{item.text}</div>
                  </div>
                </React.Fragment>
              ))}
          </div>
        </React.Fragment>
      )}

      {myProcess.visible && (
        <MyProcess
          countData={countData}
          activeTab={myProcess.activeTab}
          onCancel={() => {
            setMyProcess({ visible: false });
            todoDisplay === 1 && fetchTodoList();
          }}
          updateCountData={updateCountData}
        />
      )}
    </Wrapper>
  );
}
