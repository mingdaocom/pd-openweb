import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { LoadDiv, Icon } from 'ming-ui';
import { useSetState } from 'react-use';
import Oauth2Ajax from 'src/pages/workflow/api/oauth2';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import moment from 'moment';
import ChangeName from 'src/pages/integration/components/ChangeName';
import { socketInit } from 'src/socket';

const Wrap = styled.div`
  .noData {
    .iconCon {
      width: 130px;
      height: 130px;
      line-height: 130px;
      background: #ffffff;
      border-radius: 50%;
      margin: 120px auto 0;
      color: #9e9e9e;
    }
  }
  .addAccount {
    padding: 8px 24px;
    background: #2196f3;
    border-radius: 21px;
    color: #fff;
    display: inline-block;
    &:hover {
      background: #1764c0;
    }
  }
  .listCon {
    width: 1000px;
    background: #ffffff;
    margin: 30px auto;
    padding: 20px;
    border-radius: 8px 8px 8px 8px;
    .flex2 {
      flex: 2;
    }
    .searchCon {
      width: 200px;
      .search {
        background-color: #fff;
        border: 1px solid #e0e0e0;
      }
    }
    .acc {
      min-width: 200px;
    }
    .option {
      max-width: 120px;
      min-width: 120px;
      opacity: 0;

      .del {
        color: #9e9e9e;
        &:hover {
          color: red;
        }
      }
    }

    .headT {
      border-bottom: 1px solid #eaeaea;
      padding-bottom: 20px;
      .option {
        opacity: 1;
      }
    }
    .tableTr {
      padding: 20px 0;
      border-bottom: 1px solid #eaeaea;
      &:hover {
        background: #fcfcfc;
      }
      &:hover .option {
        opacity: 1;
      }
    }
  }
`;

//连接设置
function AccountList(props) {
  const [{ listSearch, list, loading, refreshLoading, keywords, data }, setState] = useSetState({
    listSearch: [],
    list: [],
    loading: true,
    refreshLoading: false,
    keywords: '',
    data: {},
  });
  useEffect(() => {
    socketInit();
    IM.socket.on('channel workflow_integration', (data = {}) => {
      setState({
        keywords: '',
        refreshLoading: true,
      });
      getList(data.id);
    });
    () => {
      IM.socket.off('channel workflow_integration');
    };
  }, []);
  useEffect(() => {
    getList();
  }, [props.connectId]);

  const getList = id => {
    Oauth2Ajax.getAllTokenList(
      {
        id: id || props.connectId,
      },
      { isIntegration: true },
    ).then(res => {
      setState({
        list: res,
        listSearch: res,
        loading: false,
        refreshLoading: false,
      });
    });
  };

  if (loading) {
    return <LoadDiv />;
  }
  const onCreate = () => {
    getOpenUrl();
  };
  //添加授权账户
  const getOpenUrl = () => {
    Oauth2Ajax.authorize(
      {
        id: props.connectId,
      },
      { isIntegration: true },
    ).then(res => {
      window.open(res.oauth2Url, '_blank', 'width=800,height=600');
    });
  };
  // 编辑名称｜删除
  const onEdit = (data, isDel) => {
    Oauth2Ajax.updateAccessToken(
      {
        id: data.id,
        name: data.name,
        status: isDel ? -1 : data.status,
      },
      { isIntegration: true },
    ).then(res => {
      if (res) {
        const newList = isDel ? list.filter(o => o.id !== data.id) : list.map(o => (o.id === data.id ? data : o));
        setState({
          list: newList,
          listSearch: newList.filter(o => o.name.toLocaleLowerCase().indexOf(keywords.toLocaleLowerCase()) >= 0),
        });
        if (isDel) {
          alert(_l('删除成功'));
        }
      } else {
        alert(_l('修改失败'), 2);
      }
    });
  };
  //重新授权
  const refreshAuth = id => {
    Oauth2Ajax.refreshAuthorize(
      {
        id: id,
      },
      { isIntegration: true },
    ).then(res => {
      window.open(res.oauth2Url, '_blank', 'width=800,height=600');
    });
  };
  //刷新授权
  const refreshToken = id => {
    Oauth2Ajax.refreshToken(
      {
        id: id,
      },
      { isIntegration: true },
    ).then(res => {
      if (res) {
        alert(_l('刷新token成功'));
      } else {
        alert(_l('刷新token失败'), 2);
      }
    });
  };
  const noDataRender = () => {
    return (
      <div className="noData TxtCenter">
        <span className="iconCon InlineBlock TxtCenter ">
          <i className="icon-account_box Font64 TxtMiddle" />
        </span>
        <p className="Gray_9e mTop20 mBottom0">{_l('暂无可用账户，请先完成授权')}</p>
        {!keywords && (
          <span className="addAccount Bold Hand mTop24" onClick={onCreate}>
            <Icon type="add" /> {_l('添加账户')}
          </span>
        )}
      </div>
    );
  };
  const renderCon = () => {
    return (
      <div className="listCon flexColumn">
        <div className="headCon flexRow alignItemsCenter">
          <span className="flex Gray Font16 Bold">{_l('已授权账户')}</span>
          <div className="searchCon">
            <SearchInput
              placeholder={_l('搜索')}
              value={keywords}
              className="search"
              onChange={v => {
                setState({
                  keywords: v,
                  listSearch: list.filter(o => o.name.toLocaleLowerCase().indexOf(v.toLocaleLowerCase()) >= 0),
                });
              }}
            />
          </div>
          <span className="addAccount Bold Hand mLeft25" onClick={onCreate}>
            <Icon type="add" /> {_l('添加账户')}
          </span>
        </div>
        <div className="flex mTop40">
          <div className="headT flexRow alignItemsCenter">
            <div className="flex2 acc pLeft10">{_l('账户名称')}</div>
            <div className="flex pLeft10">{_l('更新时间')}</div>
            <div className="flex pLeft10">{_l('添加者')}</div>
            <div className="option pLeft10">
              <Icon
                className="Font18 Hand InlineBlock Gray_9e ThemeHoverColor3"
                icon="refresh"
                onClick={() => {
                  setState({
                    keywords: '',
                    refreshLoading: true,
                  });
                  getList();
                }}
              />
            </div>
          </div>
          {refreshLoading ? (
            <LoadDiv className="mTop20 mBottom20" />
          ) : listSearch.length <= 0 ? (
            <p className="Gray_9e mTop20 pBottom20 TxtCenter">{_l('无匹配的结果，换一个关键词试试吧')}</p>
          ) : (
            listSearch.map(o => {
              return (
                <div className="tableTr flexRow alignItemsCenter">
                  <div className="flex2 acc flexRow pLeft10">
                    <span className="flex WordBreak">{o.name}</span>
                    {o.status === 0 && (
                      <span className="Red">
                        <Icon icon="info_outline" className="" /> {_l('授权失败')}
                      </span>
                    )}
                    {_.get(o, 'createdBy.accountId') === md.global.Account.accountId && (
                      <span
                        className="ThemeColor3 Hand mLeft25"
                        onClick={() => {
                          refreshAuth(o.id);
                        }}
                      >
                        {_l('重新授权')}
                      </span>
                    )}
                  </div>
                  <div className="flex pLeft10">
                    {moment(o.lastModifiedDate || o.createdDate).format('YYYY-MM-DD HH:mm:ss')}
                  </div>
                  <div className="flex pLeft10">{_.get(o, 'createdBy.fullName')}</div>
                  <div className="option pLeft10">
                    <span data-tip={_l('刷新 token')}>
                      <Icon
                        className="Font18 Hand InlineBlock Gray_9e ThemeHoverColor3"
                        icon="refresh"
                        onClick={() => {
                          refreshToken(o.id);
                        }}
                      />
                    </span>
                    <span data-tip={_l('重命名')} className="mLeft25">
                      <Icon
                        className="Font18 Hand InlineBlock Gray_9e ThemeHoverColor3"
                        icon="edit"
                        onClick={() => {
                          setState({ data: o });
                        }}
                      />
                    </span>
                    <span data-tip={_l('删除')} className="mLeft25">
                      <Icon
                        className={cx('Font18 InlineBlock del Hand')}
                        icon="delete1"
                        onClick={() => {
                          onEdit(o, true);
                        }}
                      />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };
  return (
    <Wrap className="flexColumn">
      {list.length <= 0 ? noDataRender() : renderCon()}
      {data.id && (
        <ChangeName
          name={data.name}
          onCancel={() => {
            setState({
              data: {},
            });
          }}
          onChange={name => {
            onEdit({ ...data, name });
          }}
        />
      )}
    </Wrap>
  );
}

export default AccountList;
