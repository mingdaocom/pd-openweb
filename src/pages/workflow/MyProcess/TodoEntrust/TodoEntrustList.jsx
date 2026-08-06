import React, { Fragment, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Dropdown, Menu } from 'antd';
import cx from 'classnames';
import moment from 'moment';
import styled from 'styled-components';
import { Button, Dialog, Icon, LoadDiv, ScrollView, UserHead } from 'ming-ui';
import delegationApi from '../../api/delegation';
import delegationtodoApi from '../../api/delegationtodo';
import Card from '../Card';
import TodoEntrustModal from './TodoEntrustModal';
import './index.less';

const PAGE_SIZE = 10;
const DEFAULT_TODO_PAGE_INFO = {
  pageIndex: 1,
  hasMore: true,
  moreLoading: false,
};

const getDefaultTodoPageInfo = hasMore => ({
  ...DEFAULT_TODO_PAGE_INFO,
  hasMore,
});

const getTodoCount = (data, delegationId) => {
  const todoCount = (Array.isArray(data) ? data : []).find(item => item.id === delegationId);

  return todoCount ? todoCount.count : 0;
};

const CardWrapper = styled.div`
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  box-sizing: border-box;
  background-color: var(--color-background-primary);
  border-radius: 4px;
  border: 1px solid var(--color-border-secondary);

  &.active {
    border-color: var(--color-primary-transparent);
    background-color: var(--color-primary-transparent) !important;
  }
  &:hover:not(.active) {
    border-color: var(--color-primary);
  }

  .title {
    margin-bottom: 6;
    color: var(--color-text-title);
    font-size: 13px;
    font-weight: bold;
  }

  .entrustRow {
    display: flex;
    margin-bottom: 6px;
  }

  .rowLabelText {
    width: 60px;
    margin-right: 10px;
    color: var(--color-text-secondary);
  }

  .rowValue {
    flex: 1;
    color: var(--color-text-primary);
    overflow: hidden;
  }

  .todoCountTag {
    display: inline-flex;
    align-items: center;
    height: 24px;
    padding: 0 10px;
    border-radius: 12px;
    color: var(--color-white);
    background-color: var(--color-primary);
    font-weight: normal;
    line-height: 24px;
    white-space: nowrap;

    &.notStart {
      color: var(--color-text-secondary);
      border-color: var(--color-border-primary);
      background-color: var(--color-background-disabled);
    }
  }
`;
const LoadableExecDialog = lazy(() => import('src/pages/workflow/components/ExecDialog'));

const isShowStartDate = startDate => {
  return startDate && moment(startDate).diff(moment(), 'minutes') > 0;
};

function TodoEntrustList(props) {
  const { visible, delegationList, onUpdate } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const [todoState, setTodoState] = useState({
    delegationId: '',
    loading: false,
    list: [],
    pageInfo: getDefaultTodoPageInfo(false),
  });
  const [entrustData, setEntrustData] = useState({});
  const [todoCountList, setTodoCountList] = useState([]);
  const [selectedEntrustId, setSelectedEntrustId] = useState('');
  const [selectCard, setSelectCard] = useState(null);
  const requestIndexRef = useRef(0);

  const selectedEntrust =
    visible && delegationList.length
      ? delegationList.find(item => item.id === selectedEntrustId) || delegationList[0]
      : null;
  const activeEntrustId = selectedEntrust ? selectedEntrust.id : '';

  const getTodoList = useCallback((delegationId, pageIndex = 1) => {
    const isFirstPage = pageIndex === 1;
    const requestIndex = requestIndexRef.current + 1;

    requestIndexRef.current = requestIndex;

    const params = {
      pageIndex,
      pageSize: PAGE_SIZE,
      delegationId,
    };

    Promise.all([delegationtodoApi.getTodoList(params), delegationtodoApi.getCount()])
      .then(([data, countData]) => {
        if (requestIndex !== requestIndexRef.current) return;
        const newList = Array.isArray(data) ? data : [];

        setTodoCountList(Array.isArray(countData) ? countData : []);
        setTodoState(data => {
          const oldList = data.delegationId === delegationId ? data.list : [];

          return {
            delegationId,
            loading: false,
            list: isFirstPage ? newList : oldList.concat(newList),
            pageInfo: {
              ...(isFirstPage ? DEFAULT_TODO_PAGE_INFO : data.pageInfo),
              pageIndex: pageIndex + 1,
              hasMore: newList.length === PAGE_SIZE,
              moreLoading: false,
            },
          };
        });
      })
      .catch(() => {
        if (requestIndex !== requestIndexRef.current) return;

        setTodoState(data => ({
          delegationId,
          loading: false,
          list: isFirstPage ? [] : data.list,
          pageInfo: isFirstPage
            ? getDefaultTodoPageInfo(false)
            : {
                ...data.pageInfo,
                hasMore: false,
                moreLoading: false,
              },
        }));
      });
  }, []);

  useEffect(() => {
    if (!visible || !activeEntrustId) {
      requestIndexRef.current += 1;
      return;
    }

    getTodoList(activeEntrustId);
  }, [visible, activeEntrustId, getTodoList]);

  const refreshTodoList = useCallback(
    delegationId => {
      if (!delegationId) return;

      setTodoState({
        delegationId,
        loading: true,
        list: [],
        pageInfo: getDefaultTodoPageInfo(true),
      });
      getTodoList(delegationId);
    },
    [getTodoList],
  );

  const onSelectEntrust = useCallback(
    item => {
      if (!item) return;

      if (item.id === activeEntrustId) {
        refreshTodoList(item.id);
        return;
      }

      setSelectedEntrustId(item.id);
    },
    [activeEntrustId, refreshTodoList],
  );

  const isCurrentEntrust = todoState.delegationId === activeEntrustId;
  const todoLoadoing = Boolean(activeEntrustId) && (!isCurrentEntrust || todoState.loading);
  const todoList = isCurrentEntrust ? todoState.list : [];
  const todoPageInfo = isCurrentEntrust ? todoState.pageInfo : getDefaultTodoPageInfo(Boolean(activeEntrustId));
  const visibleTodoCountList = delegationList.length ? todoCountList : [];

  const handleTodoScrollEnd = () => {
    const { moreLoading, hasMore, pageIndex } = todoPageInfo;

    if (todoLoadoing || moreLoading || !hasMore || !activeEntrustId) return;

    setTodoState(data => {
      if (data.delegationId !== activeEntrustId) return data;

      return {
        ...data,
        pageInfo: {
          ...data.pageInfo,
          moreLoading: true,
        },
      };
    });
    getTodoList(activeEntrustId, pageIndex);
  };

  const onCardItemClick = item => {
    const data = Object.assign({}, item, {
      startDate: isShowStartDate(item.startDate) ? moment(item.startDate) : null,
      endDate: moment(item.endDate),
    });
    setEntrustData(data);
    setModalVisible(true);
  };

  const onFinishEntrust = item => {
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
            onUpdate();
          }
        });
      },
    });
  };

  const createEntrust = () => {
    setEntrustData({});
    setModalVisible(true);
  };

  return (
    <Fragment>
      {visible && (
        <div className="todoEntrustWrapper flexRow">
          {!!delegationList.length && (
            <ScrollView className="listWrapper">
              <div className="bold Font20">{_l('我的委托')}</div>
              <Button
                type="ghost"
                className="w100 mTop20 mBottom10"
                onClick={event => {
                  event.stopPropagation();
                  createEntrust();
                }}
              >
                <div className="flexRow alignItemsCenter justifyContentCenter">
                  <Icon icon="add" className="Font20" />
                  <span className="mLeft5">{_l('新建委托')}</span>
                </div>
              </Button>
              {delegationList.map(item => {
                const count = getTodoCount(visibleTodoCountList, item.id);
                const isStartDate = isShowStartDate(item.startDate);

                return (
                  <CardWrapper
                    key={item.id}
                    className={cx('pointer', {
                      active: item.id === activeEntrustId,
                      bgTertiary: isStartDate,
                    })}
                    onClick={() => onSelectEntrust(item)}
                  >
                    <div className="title flexRow alignItemsCenter mBottom5">
                      <div className="ellipsis flex">{item.companyName}</div>
                      <div
                        className={cx('todoCountTag Font12 mLeft8 mRight5', {
                          notStart: isStartDate,
                        })}
                      >
                        {isStartDate ? _l('未开始') : _l('生效中')} {count || 0}
                      </div>
                      <Dropdown
                        trigger={['click']}
                        placement="bottomRight"
                        overlay={
                          <Menu
                            expandIcon={<Icon icon="arrow-right-tip" />}
                            style={{
                              width: 180,
                            }}
                          >
                            <Menu.Item
                              data-event="edit"
                              className="pLeft10"
                              style={{
                                padding: '7px 12px',
                              }}
                              onClick={({ domEvent }) => {
                                domEvent.stopPropagation();
                                onCardItemClick(item);
                              }}
                            >
                              <div className="flexRow valignWrapper">
                                <Icon className="textTertiary Font18 mLeft5 mRight5" icon="edit" />
                                <div className="flex">{_l('编辑委托')}</div>
                              </div>
                            </Menu.Item>
                            <Menu.Item
                              data-event="cancel"
                              className="pLeft10"
                              style={{
                                padding: '7px 12px',
                              }}
                              onClick={({ domEvent }) => {
                                domEvent.stopPropagation();
                                onFinishEntrust(item);
                              }}
                            >
                              <div className="flexRow valignWrapper">
                                <Icon
                                  className="textTertiary Font18 mLeft5 mRight5"
                                  icon={isStartDate ? 'back' : 'finish_delegate'}
                                />
                                <div className="flex">{isStartDate ? _l('取消委托') : _l('结束委托')}</div>
                              </div>
                            </Menu.Item>
                          </Menu>
                        }
                      >
                        <Icon
                          icon="more_horiz"
                          className="textSecondary hoverColorPrimary pointer Font20"
                          onClick={event => event.stopPropagation()}
                        />
                      </Dropdown>
                    </div>
                    <div className="entrustRow">
                      <div className="flexRow">
                        <div className="trusteeAvatarWrapper valignWrapper mRight10">
                          <UserHead
                            projectId={item.companyId}
                            className="circle"
                            user={{
                              userHead: item.trustee.avatar,
                              accountId: item.trustee.accountId,
                            }}
                            size={24}
                            chatButton={false}
                          />
                          <span className="mLeft10 bold">{item.trustee.fullName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="entrustRow">
                      <div
                        className="rowLabelText Font13 ellipsis"
                        title={isStartDate ? _l('开始时间') : _l('结束时间')}
                      >
                        {isStartDate ? _l('开始时间') : _l('结束时间')}
                      </div>
                      <div className="rowValue Font13">
                        {isStartDate ? (
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
                    <div className="entrustRow">
                      <div className="rowLabelText Font13 ellipsis" title={_l('委托范围')}>
                        {_l('委托范围')}
                      </div>
                      <div className="rowValue Font13">
                        {!item.apks ? _l('所有工作流') : _l('%0个应用', item.apks.length)}
                      </div>
                    </div>
                  </CardWrapper>
                );
              })}
            </ScrollView>
          )}

          {delegationList.length ? (
            <ScrollView className="contentWrapper pTop10 flex" onScrollEnd={handleTodoScrollEnd}>
              {todoLoadoing ? (
                <div className="h100 flexColumn alignItemsCenter justifyContentCenter">
                  <LoadDiv />
                </div>
              ) : todoList.length ? (
                <Fragment>
                  {todoList.map(item => (
                    <Card
                      key={item.workId}
                      item={item}
                      type={null}
                      stateTab={
                        {
                          3: 1,
                          4: 0,
                        }[item.flowNodeType]
                      }
                      showApproveChecked={false}
                      onClick={() => {
                        setSelectCard(item);
                      }}
                    />
                  ))}
                  {todoPageInfo.moreLoading && (
                    <div className="pTop5 pBottom10">
                      <LoadDiv size="middle" />
                    </div>
                  )}
                </Fragment>
              ) : (
                <div className="withoutData h100 flexColumn alignItemsCenter justifyContentCenter textTertiary">
                  <div className="Font18 mBottom8">{_l('当前暂无待办')}</div>
                  <div className="Font15">{_l('委托开始后，相关待办会显示在这里')}</div>
                </div>
              )}
            </ScrollView>
          ) : (
            <div className="contentWrapper flex pAll20">
              <Fragment>
                <div className="bold Font20">{_l('我的委托')}</div>
                <div
                  className="withoutData flexColumn alignItemsCenter justifyContentCenter textTertiary"
                  style={{
                    height: 500,
                  }}
                >
                  <div className="liftIcon flexRow alignItemsCenter justifyContentCenter">
                    <Icon icon="lift" className="Font50 textTertiary" />
                  </div>
                  <div className="Font18 mTop20 mBottom3">{_l('您还没有发起委托')}</div>
                  <Button type="ghostgray" className="mTop20 mBottom10" onClick={createEntrust}>
                    <div className="flexRow alignItemsCenter justifyContentCenter">
                      <Icon icon="add" className="Font20" />
                      <span className="mLeft5">{_l('新建委托')}</span>
                    </div>
                  </Button>
                </div>
              </Fragment>
            </div>
          )}

          {modalVisible && (
            <TodoEntrustModal
              setTodoEntrustModalVisible={setModalVisible}
              editEntrustData={entrustData}
              onUpdate={onUpdate}
            />
          )}

          {selectCard && (
            <Suspense fallback={null}>
              <LoadableExecDialog
                id={selectCard.id}
                workId={selectCard.workId}
                onClose={() => {
                  setSelectCard(null);
                }}
                onLoad={() => {
                  refreshTodoList(activeEntrustId);
                }}
                onError={() => {
                  setSelectCard(null);
                }}
              />
            </Suspense>
          )}
        </div>
      )}
    </Fragment>
  );
}

export default TodoEntrustList;
