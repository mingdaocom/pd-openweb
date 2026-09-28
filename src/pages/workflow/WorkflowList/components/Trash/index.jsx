import React, { useCallback, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView, UserHead } from 'ming-ui';
import { DeleteReconfirm, Input, Modal, Tooltip } from 'ming-ui/antd-components';
import processAjax from 'src/pages/workflow/api/processVersion';
import { START_APP_TYPE, TYPES } from 'src/pages/workflow/WorkflowList/utils/index.js';

const WrapHeader = styled.div`
  height: 53px;
  padding: 0 68px 0 26px;
  .trashSearch {
    width: 184px;
    height: 30px;
  }
`;
const Wrap = styled.div`
  height: 600px;
  .table {
    border-top: 1px solid rgba(0, 0, 0, 0.16);
    .nameWrapTr {
      min-width: 260px !important;
      max-width: 260px;
    }
    .iconWrap {
      width: 36px;
      min-width: 36px;
      height: 36px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      .icon {
        font-size: 24px;
        color: var(--color-white);
      }
    }
    .optionWrapTr {
      max-width: 100px;
      text-align: right;
      padding-right: 10px;
    }
    .nullData {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      height: calc(100% - 60px) !important;
      .emptyIcon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 130px;
        height: 130px;
        border-radius: 130px;
        background: var(--color-background-secondary);
        .icon {
          color: var(--color-text-disabled);
          font-size: 66px;
        }
      }
    }
    font-weight: 400;
    .trashHeader {
      padding: 10px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.16);
    }
    .trashLi {
      padding: 15px 10px;
      border-bottom: 1px solid var(--color-border-secondary);
      background: var(--color-background-primary);
      .icon-reply1,
      .icon-trash {
        color: var(--color-text-tertiary);
        cursor: pointer;
        opacity: 0;
        font-size: 20px;
      }
      &:hover {
        background: var(--color-background-secondary);
        .icon-reply1,
        .icon-trash {
          opacity: 1;
        }
        .icon-reply1 {
          &:hover {
            color: var(--color-primary);
          }
        }
        .icon-trash {
          &:hover {
            color: var(--color-error);
          }
        }
      }
    }
  }
`;

//回收站
export default function TrashDialog(props) {
  const [{ loading, pageSize, pageIndex, list, searchValue }, setState] = useSetState({
    loading: true,
    pageSize: 30,
    pageIndex: 1,
    list: [],
    searchValue: '',
  });
  const cache = useRef({ isMore: true, keyWords: '' });

  const loadList = useCallback(
    ({ currentPageIndex, keyWords }) => {
      processAjax
        .list({
          processListType: 100,
          keyWords,
          pageIndex: currentPageIndex,
          pageSize,
          relationId: props.appId,
        })
        .then(res => {
          const processList = (res[0] || {}).processList || [];
          setState(state => ({
            list: currentPageIndex > 1 ? state.list.concat(processList) : processList,
            data: res[0],
            loading: false,
          }));
          cache.current.isMore = processList.length >= pageSize;
        });
    },
    [pageSize, props.appId, setState],
  );

  const fetchList = useCallback(() => {
    clearTimeout(cache.current.searchTimer);
    cache.current.isMore = true;
    cache.current.keyWords = '';
    setState({ loading: true, pageIndex: 1, searchValue: '' });
    loadList({ currentPageIndex: 1, keyWords: '' });
  }, [loadList, setState]);

  useEffect(() => {
    const cacheValue = cache.current;
    cacheValue.isMore = true;
    cacheValue.keyWords = '';
    loadList({ currentPageIndex: 1, keyWords: '' });
    return () => clearTimeout(cacheValue.searchTimer);
  }, [loadList]);

  const reply = (processId, processListType) => {
    processAjax
      .restoreProcess({
        processId,
      })
      .then(res => {
        if (res) {
          alert(_l('恢复成功'));
          fetchList();
          props.onChange(processListType);
        } else {
          alert(_l('恢复失败'), 2);
        }
      });
  };

  const removeProcess = processId => {
    processAjax.removeProcess({ processId }).then(res => {
      if (res) {
        alert(_l('彻底删除成功'));
        fetchList();
      } else {
        alert(_l('彻底删除失败'), 2);
      }
    });
  };

  const columns = [
    {
      id: 'name',
      className: 'nameWrapTr',
      name: _l('流程名称'),
      render: data => {
        return (
          <div className="flexRow flex alignItemsCenter overflowHidden">
            <div
              className={cx('iconWrap')}
              style={{
                backgroundColor: (START_APP_TYPE[data.child ? 'subprocess' : data.startAppType] || {}).iconColor,
              }}
            >
              <Icon icon={(START_APP_TYPE[data.child ? 'subprocess' : data.startAppType] || {}).iconName} />
            </div>
            <div className="flex name mLeft10 mRight24 overflowHidden">
              <div className="ellipsis Font14" title={data.name}>
                {data.name}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: 'type',
      name: _l('类型'),
      sorter: true,
      render: data => {
        return (
          <div className="ellipsis Font14">
            {(TYPES.find(o => o.value === String(data.processListType)) || {}).text}
          </div>
        );
      },
    },
    {
      id: 'dataFrom',
      name: _l('数据源'),
      render: data => {
        return data.appName;
      },
    },
    {
      id: 'ownerAccount',
      name: _l('删除者'),
      render: data => {
        return (
          <div className="flexRow alignItemsCenter">
            <UserHead
              projectId={props.projectId}
              size={28}
              user={{ userHead: _.get(data, 'ownerAccount.avatar'), accountId: _.get(data, 'ownerAccount.accountId') }}
            />
            <div className="mLeft12 ellipsis flex mRight20">{_.get(data, 'ownerAccount.fullName')}</div>
          </div>
        );
      },
    },
    {
      id: 'operateTime',
      name: _l('删除时间'),
      sorter: true,
      render: data => {
        return data.lastModifiedDate;
      },
    },
    {
      id: 'option',
      className: 'optionWrapTr',
      name: '',
      render: data => {
        return (
          <div className="flex">
            <Tooltip title={_l('恢复')} placement="bottom">
              <i
                className="icon icon-reply1"
                onClick={() => {
                  reply(data.id, data.processListType);
                }}
              ></i>
            </Tooltip>
            <Tooltip title={_l('彻底删除')} placement="bottom">
              <i
                className="icon icon-trash mLeft25"
                onClick={() => {
                  DeleteReconfirm({
                    title: _l('将彻底删除工作流“%0”', data.name),
                    description: _l('彻底删除该数据后，将无法恢复。'),
                    data: [{ text: _l('我确定执行此操作'), value: true }],
                    okText: _l('彻底删除'),
                    buttonType: 'danger',
                    onOk: () => {
                      removeProcess(data.id);
                    },
                  });
                }}
              ></i>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const renderList = item => {
    return (
      <div className="flexRow trashLi alignItemsCenter">
        {columns.map(o => {
          return <div className={cx('flex minWidth0', o.className)}>{o.render(item)}</div>;
        })}
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div className="flexRow trashHeader alignItemsCenter">
        {columns.map(o => {
          return <div className={cx('flex', o.className)}>{o.id !== 'option' ? o.name : ''}</div>;
        })}
      </div>
    );
  };

  const handleSearch = keyWords => {
    cache.current.isMore = true;
    cache.current.keyWords = keyWords;
    setState({ loading: true, pageIndex: 1 });
    loadList({ currentPageIndex: 1, keyWords });
  };

  const onSearch = event => {
    const keywords = event.target.value;
    setState({ searchValue: keywords });
    clearTimeout(cache.current.searchTimer);
    cache.current.searchTimer = setTimeout(() => handleSearch(keywords), 500);
  };

  const handleScrollEnd = () => {
    if (loading || !cache.current.isMore) return;

    const nextPageIndex = pageIndex + 1;
    setState({ loading: true, pageIndex: nextPageIndex });
    loadList({ currentPageIndex: nextPageIndex, keyWords: cache.current.keyWords });
  };

  const renderCon = () => {
    return (
      <React.Fragment>
        {renderHeader()}
        <ScrollView className="flex" onScrollEnd={handleScrollEnd}>
          {list.map(item => renderList(item))}
          {loading && pageIndex > 1 && <LoadDiv />}
        </ScrollView>
      </React.Fragment>
    );
  };

  return (
    <Modal
      width={1000}
      open={true}
      title={null}
      footer={null}
      styles={{ body: { padding: 0 }, container: { padding: 0 } }}
      onCancel={props.onCancel}
    >
      <Wrap className="flexColumn">
        <WrapHeader className="flexRow alignItemsCenter">
          <div className="Font17 flex">
            {_l('回收站')}（ {_l('工作流')}）
            <span className="textSecondary Font13 mLeft10">{_l('可恢复60天内删除的工作流')}</span>
          </div>
          <Input
            allowClear
            className="trashSearch"
            placeholder={_l('工作流名称')}
            prefix={<Icon icon="search" className="textSecondary Font16" />}
            value={searchValue}
            radius
            variant="filled"
            onChange={onSearch}
          />
        </WrapHeader>
        <div className="table flex flexColumn pLeft20 pRight20 pTop10 pBottom10 overflowHidden">
          {loading && pageIndex <= 1 ? (
            <LoadDiv />
          ) : list.length <= 0 ? (
            <div className="nullData TxtCenter flex">
              <div className="emptyIcon">
                <i className="icon icon-recycle"></i>
              </div>
              <p className="TxtCenter textSecondary Font17 mTop10">
                {searchValue ? _l('没有找到符合条件的结果') : _l('回收站暂无内容')}
              </p>
            </div>
          ) : (
            renderCon()
          )}
        </div>
      </Wrap>
    </Modal>
  );
}
