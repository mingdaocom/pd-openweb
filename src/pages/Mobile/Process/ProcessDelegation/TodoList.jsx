import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import delegationtodoApi from 'src/pages/workflow/api/delegationtodo';
import ProcessRecordInfo from 'mobile/ProcessRecord';
import Card from 'src/pages/Mobile/Process/Card';

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

function TodoList(props) {
  const { data = {}, onClose } = props;
  const delegationId = data.id;
  const [todoState, setTodoState] = useState(() => ({
    delegationId,
    loading: Boolean(delegationId),
    list: [],
    pageInfo: getDefaultTodoPageInfo(Boolean(delegationId)),
  }));
  const [selectCard, setSelectCard] = useState(null);
  const requestIndexRef = useRef(0);

  const getTodoList = useCallback((nextDelegationId, pageIndex = 1) => {
    const isFirstPage = pageIndex === 1;
    const requestIndex = requestIndexRef.current + 1;

    requestIndexRef.current = requestIndex;

    delegationtodoApi
      .getTodoList({
        pageIndex,
        pageSize: PAGE_SIZE,
        delegationId: nextDelegationId,
      })
      .then(data => {
        if (requestIndex !== requestIndexRef.current) return;

        const newList = Array.isArray(data) ? data : [];
        setTodoState(data => {
          const oldList = data.delegationId === nextDelegationId ? data.list : [];

          return {
            delegationId: nextDelegationId,
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
          delegationId: nextDelegationId,
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
    if (!delegationId) {
      requestIndexRef.current += 1;
      return;
    }

    getTodoList(delegationId);
  }, [delegationId, getTodoList]);

  const refreshTodoList = useCallback(() => {
    if (!delegationId) return;

    setTodoState({
      delegationId,
      loading: true,
      list: [],
      pageInfo: getDefaultTodoPageInfo(true),
    });
    getTodoList(delegationId);
  }, [delegationId, getTodoList]);

  const isCurrentDelegation = todoState.delegationId === delegationId;
  const todoLoadoing = Boolean(delegationId) && (!isCurrentDelegation || todoState.loading);
  const todoList = isCurrentDelegation ? todoState.list : [];
  const todoPageInfo = isCurrentDelegation ? todoState.pageInfo : getDefaultTodoPageInfo(Boolean(delegationId));

  const handleTodoScrollEnd = () => {
    const { moreLoading, hasMore, pageIndex } = todoPageInfo;

    if (todoLoadoing || moreLoading || !hasMore || !delegationId) return;

    setTodoState(data => ({
      ...data,
      pageInfo: {
        ...data.pageInfo,
        moreLoading: true,
      },
    }));
    getTodoList(delegationId, pageIndex);
  };

  return (
    <div className="flexColumn h100 bgSecondary">
      <div className="pTop10 pBottom10 pLeft15 pRight15 TxtRight">
        <Icon icon="cancel" className="Font22 textTertiary" onClick={onClose} />
      </div>
      <ScrollView className="flex minHeight0 pLeft15 pRight15" onScrollEnd={handleTodoScrollEnd}>
        {todoLoadoing ? (
          <div className="h100 flexColumn alignItemsCenter justifyContentCenter">
            <LoadDiv />
          </div>
        ) : todoList.length ? (
          <React.Fragment>
            {todoList.map(item => (
              <Card
                key={item.workId}
                item={item}
                type={null}
                stateTab={{ 3: 'waitingWrite', 4: 'waitingApproval' }[item.flowNodeType]}
                showApproveChecked={false}
                renderBodyTitle={() => {
                  return item.entityName ? `${item.entityName}: ${item.title}` : item.title;
                }}
                onClick={() => setSelectCard(item)}
              />
            ))}
            {todoPageInfo.moreLoading && (
              <div className="pTop5 pBottom10">
                <LoadDiv size="middle" />
              </div>
            )}
          </React.Fragment>
        ) : (
          <div className="h100 flexColumn alignItemsCenter justifyContentCenter textTertiary">
            <div className="Font18 mBottom3">{_l('当前暂无待办')}</div>
            <div className="Font15">{_l('委托开始后，相关待办会显示在这里')}</div>
          </div>
        )}
      </ScrollView>
      {selectCard && (
        <ProcessRecordInfo
          visible
          isModal
          instanceId={selectCard.id}
          workId={selectCard.workId}
          onClose={() => setSelectCard(null)}
          onSave={refreshTodoList}
        />
      )}
    </div>
  );
}

export default TodoList;
