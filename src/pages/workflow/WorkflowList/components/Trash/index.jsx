import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { LoadDiv, Dialog, Icon, ScrollView, Tooltip, DeleteReconfirm } from 'ming-ui';
import { useSetState } from 'react-use';
import cx from 'classnames';
import processAjax from 'src/pages/workflow/api/processVersion';
import Search from 'src/pages/workflow/components/Search';
import './index.less';
import UserHead from 'src/pages/feed/components/userHead/userHead';
import { TYPES, START_APP_TYPE } from 'src/pages/workflow/WorkflowList/utils/index.js';

const WrapHeader = styled.div`
  height: 53px;
  padding: 0 68px 0 26px;
  .trashSearch {
    .icon {
      top: 8px;
    }
    input {
      width: 184px;
      height: 30px;
      background: #f5f5f5;
      border-radius: 16px 16px 16px 16px;
    }
  }
`;
const Wrap = styled.div`
  .table {
    height: 600px;
    min-height: 600px;
    border-top: 1px solid rgba(0, 0, 0, 0.16);
    .nameWrapTr {
      min-width: 260px;
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
        color: #fff;
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
        background: #f5f5f5;
        .icon {
          color: #bdbdbd;
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
      border-bottom: 1px solid #e0e0e0;
      background: #fff;
      .icon-reply1,
      .icon-delete1 {
        color: #9d9d9d;
        cursor: pointer;
        opacity: 0;
        font-size: 20px;
      }
      &:hover {
        background: #f5f5f5;
        .icon-reply1,
        .icon-delete1 {
          opacity: 1;
        }
        .icon-reply1 {
          &:hover {
            color: #2196f3;
          }
        }
        .icon-delete1 {
          &:hover {
            color: #f32121;
          }
        }
      }
    }
  }
`;
//回收站
export default function TrashDialog(props) {
  const [{ loading, pageSize, list }, setState] = useSetState({
    loading: true,
    pageSize: 30,
    list: [],
  });
  const cache = useRef({ pgIndex: 1 });
  useEffect(() => {
    fetchList();
  }, []);
  const fetchList = () => {
    cache.current.pgIndex = 1;
    cache.current.keyWords = '';
    cache.current.isMore = true;
    getList();
  };
  const getList = () => {
    if (
      (cache.current.pgIndex > 1 && ((loading && cache.current.isMore) || !cache.current.isMore)) ||
      !cache.current.isMore
    ) {
      return;
    }
    setState({ loading: true });
    processAjax
      .list({
        processListType: 100,
        keyWords: cache.current.keyWords,
        pageIndex: cache.current.pgIndex,
        pageSize,
        relationId: props.appId,
      })
      .then(res => {
        const processList = (res[0] || {}).processList || [];
        setState({
          list: cache.current.pgIndex > 1 ? list.concat(processList) : processList,
          data: res[0],
          loading: false,
        });
        cache.current.isMore = (processList || []).length >= pageSize;
      });
  };

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
      render: (data, index) => {
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
      render: (data, index) => {
        return (
          <div className="ellipsis Font14">{(TYPES.find(o => o.value === data.processListType + '') || {}).text}</div>
        );
      },
    },
    {
      id: 'dataFrom',
      name: _l('数据源'),
      render: (data, index) => {
        return data.appName;
      },
    },
    {
      id: 'ownerAccount',
      name: _l('删除者'),
      render: (data, index) => {
        return (
          <div className="flexRow alignItemsCenter">
            <UserHead
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
      render: (data, index) => {
        return data.lastModifiedDate;
      },
    },
    {
      id: 'option',
      className: 'optionWrapTr',
      name: '',
      render: (data, index) => {
        return (
          <div className="flex">
            <Tooltip text={<span>{_l('恢复')}</span>} popupPlacement="bottom">
              <i
                className="icon icon-reply1"
                onClick={() => {
                  reply(data.id, data.processListType);
                }}
              ></i>
            </Tooltip>
            <Tooltip text={<span>{_l('彻底删除')}</span>} popupPlacement="bottom">
              <i
                className="icon icon-delete1 mLeft25"
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
          return <div className={cx('flex', o.className)}>{o.render(item)}</div>;
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
  const renderCon = () => {
    return (
      <React.Fragment>
        {renderHeader()}
        <ScrollView
          className="flex"
          onScrollEnd={() => {
            if (loading) {
              return;
            }
            cache.current.pgIndex = cache.current.pgIndex + 1;
            getList();
          }}
        >
          {list.map(item => renderList(item))}
          {loading && cache.current.pgIndex > 1 && <LoadDiv />}
        </ScrollView>
      </React.Fragment>
    );
  };

  const handleSearch = keyWords => {
    cache.current.pgIndex = 1;
    cache.current.keyWords = keyWords;
    cache.current.isMore = true;
    getList();
  };
  const onSearch = _.debounce(keywords => handleSearch(keywords), 500);

  return (
    <Dialog
      className="workflowTrashDialog"
      width="1000"
      headerClass="pAll0"
      style={{}}
      visible={true}
      title={null}
      footer={null}
      onCancel={props.onCancel}
    >
      <Wrap className="flexColumn">
        <WrapHeader className="flexRow alignItemsCenter">
          <div className="Font17 flex">
            {_l('回收站')}（ {_l('工作流')}）
            <span className="Gray_9e Font13 mLeft10">{_l('可恢复60天内删除的工作流')}</span>
          </div>
          <Search
            className="trashSearch"
            placeholder={_l('工作流名称')}
            value={cache.current.keyWords}
            handleChange={onSearch}
          />
        </WrapHeader>
        <div className="table flex flexColumn pLeft20 pRight20 pTop10 pBottom10">
          {loading && cache.current.pgIndex <= 1 ? (
            <LoadDiv />
          ) : list.length <= 0 ? (
            <div className="nullData TxtCenter flex">
              <div className="emptyIcon">
                <i className="icon icon-custom_-page_delete"></i>
              </div>
              <p className="TxtCenter Gray_9e Font17 mTop10">
                {cache.current.keyWords ? _l('没有找到符合条件的结果') : _l('回收站暂无内容')}
              </p>
            </div>
          ) : (
            renderCon()
          )}
        </div>
      </Wrap>
    </Dialog>
  );
}
