import React, { useCallback, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import autoSize from 'ming-ui/decorators/autoSize';
import { Support, ScrollView } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import ConnectLib from './ConnectLib';
import ConnectList from './ConnectList';
import { PageSize } from '../config';
import { getList, count } from 'src/pages/workflow/api/packageVersion';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import ConnectWrap from './ConnectWrap';
import bg from 'staticfiles/images/query.png';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';

const Wrap = styled.div`
  background: #fff;
  min-height: 100%;
  .tips {
    padding: 0 32px 0 32px;
  }
  .desCon {
    height: 260px;
    background: linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%);
    box-sizing: border-box;
    .conBox {
      padding: 80px 0 0 50px;
      background: url(${bg}) no-repeat 85% bottom;
      background-size: auto 90%;
      width: 100%;
      height: 100%;
    }
  }
  .navTab {
    ul {
      text-align: center;
      li {
        display: inline-block;
        margin: 0 18px;
        box-sizing: border-box;
        border-bottom: 4px solid rgba(0, 0, 0, 0);
        a {
          height: 44px;
          color: #333;
          padding: 10px;
          font-weight: 600;
          display: inline-block;
          font-size: 16px;
        }
        &.isCur {
          border-bottom: 4px solid #2196f3;
          a {
            color: #2196f3;
          }
        }
      }
    }
  }
  .listCon {
    margin-top: -48px;
  }
`;
const WrapListHeader = styled.div`
  padding: 32px 32px 0 32px;
  .addConnect {
    padding: 8px 24px;
    background: #2196f3;
    border-radius: 21px;
    color: #fff;
    display: inline-block;
    &:hover {
      background: #1764c0;
    }
  }
  .searchCon {
    height: 36px;
  }
`;
const WrapLib = styled.div`
  padding: 32px 50px;
  max-width: 1600px;
  margin: 0 auto;
  .searchCon {
    height: 36px;
  }
`;
let ajaxPromise = null;
const list = [
  {
    type: 'connectLib',
    name: _l('添加连接'),
  },
  {
    type: 'connectList',
    name: _l('我的连接'),
  },
];

function ConnectAndAuthCon(props) {
  const cache = useRef({ pgIndex: 1 });
  const { match = { params: {} } } = props;
  const { listType = '' } = match.params;
  const initData = {
    tab: md.global.Config.IsLocal
      ? 'connectList'
      : listType ||
        window.localStorage.getItem('integrationTab') ||
        (!md.global.Config.IsLocal ? 'connectLib' : 'connectList'),
    loading: false,
    pageIndex: 1,
    noMore: false,
    listData: [],
    keywords: '',
    showConnect: false,
    connectData: null,
  };
  const [
    { tab, loading, noMore, pageIndex, listData, keywords, showConnect, connectData, hasChange, listCount },
    setState,
  ] = useSetState({ ...initData, listCount: 0 });
  const featureType = getFeatureStatus(props.currentProjectId, 3);
  const fetchData = () => {
    if (tab === 'connectList' && !props.currentProjectId) {
      return;
    }
    if (ajaxPromise) {
      ajaxPromise.abort();
    }
    setState({ loading: true });
    ajaxPromise = getList(
      {
        companyId: tab !== 'connectList' ? '' : props.currentProjectId,
        types: tab !== 'connectList' && !md.global.Config.IsLocal ? [3] : [1, 2],
        pageIndex: pageIndex,
        pageSize: PageSize,
        keyword: keywords,
      },
      { isIntegration: true },
    );
    ajaxPromise.then(res => {
      ajaxPromise = null;
      setState({
        loading: false,
        listData: pageIndex <= 1 ? res : listData.concat(res),
        noMore: res.length <= 0,
      });
      cache.current.pgIndex = pageIndex;
    });
  };
  // 刷新当前数据
  const onFresh = () => {
    setState({
      loading: false,
      pageIndex: 1,
      noMore: false,
      keywords: '',
      showConnect: false,
      connectData: null,
      hasChange: hasChange + 1,
    });
  };

  const handleSearch = useCallback(
    _.throttle(v => {
      setState({
        keywords: v,
        pageIndex: 1,
        noMore: false,
      });
    }, 500),
    [],
  );

  const onScrollEnd = () => {
    if (loading || noMore) {
      return;
    }
    setState({ pageIndex: cache.current.pgIndex + 1 });
  };

  useEffect(() => {
    fetchData();
  }, [props.currentProjectId, pageIndex, keywords, tab, hasChange]);

  useEffect(() => {
    count(
      {
        companyId: props.currentProjectId,
        types: [1, 2],
        pageIndex: 1,
        pageSize: 10000000,
        // keyword: keywords,
      },
      { isIntegration: true },
    ).then(res => {
      setState({
        listCount: res['1'] + res['2'],
      });
    });
  }, [hasChange]);

  const listConRender = () => {
    if (!(listData.length <= 0 && !keywords))
      return (
        <React.Fragment>
          <WrapListHeader className={cx('headCon flexRow', { pBottom12: !props.isSuperAdmin })}>
            <div className="flex">
              <SearchInput
                className="searchCon"
                placeholder={_l('搜索连接')}
                value={keywords}
                onChange={handleSearch}
              />
            </div>
            {featureType && (
              <span
                className="addConnect Bold Hand"
                onClick={() => {
                  const projectId = props.currentProjectId;
                  if (featureType === '2') {
                    buriedUpgradeVersionDialog(projectId, 3);
                  } else {
                    setState({ showConnect: true, connectData: null });
                  }
                }}
              >
                <i className="icon-add" />
                {_l('自定义连接')}
              </span>
            )}
          </WrapListHeader>
          {props.isSuperAdmin && (
            <div className="Font13 Gray_75 mTop24 tips">{_l('组织应用管理员可管理组织下所有API连接')}</div>
          )}
        </React.Fragment>
      );
  };

  const renderCon = () => {
    const param = {
      ...props,
      loading,
      pageIndex,
      keywords,
      list: listData,
      showConnect,
      connectData,
      onChange: res => {
        setState({ ...res });
      },
    };
    const onCreate = () => {
      const projectId = props.currentProjectId;
      if (!projectId) {
        return alert(_l('请创建或申请加入一个组织', 3));
      }
      if (featureType === '2') {
        buriedUpgradeVersionDialog(projectId, 3);
      } else {
        setState({ showConnect: true, connectData: null });
      }
    };
    if (md.global.Config.IsLocal) {
      return (
        <React.Fragment>
          {listConRender()}
          <ConnectList {...param} onCreate={onCreate} featureType={featureType} />
        </React.Fragment>
      );
    }
    switch (tab) {
      case 'connectLib':
        return (
          <WrapLib>
            <div className="flexRow alignItemsCenter ">
              <h5 className="Bold Font17 flex mBottom0">{_l('API 库')}</h5>
              <SearchInput
                className="searchCon"
                placeholder={_l('搜索连接/API/厂商')}
                value={keywords}
                onChange={handleSearch}
              />
            </div>
            <ConnectLib
              {...param}
              onShowConnect={id => {
                setState({ showConnect: true, connectData: { id }, hasChange: hasChange + 1 });
              }}
            />
          </WrapLib>
        );
      default:
        return (
          <React.Fragment>
            {listConRender()}
            <ConnectList {...param} onCreate={onCreate} featureType={featureType} />
          </React.Fragment>
        );
    }
  };
  return (
    <ScrollView onScrollEnd={onScrollEnd}>
      <Wrap>
        <div className="desCon">
          <div className="conBox">
            <h3 className="Bold Font24">{_l('连接与认证')}</h3>
            <p className="Font15">
              {_l('连接第三方 API 并保存鉴权认证，在工作表或工作流中调用')}{' '}
              <Support
                type={3}
                href="https://help.mingdao.com/integration.html#第一步、连接与认证"
                text={_l('使用帮助')}
              />
            </p>
          </div>
        </div>
        <div className="listCon">
          <React.Fragment>
            {!md.global.Config.IsLocal && (
              <div className="navTab">
                <ul>
                  {list.map((o, i) => {
                    return (
                      <li
                        className={cx({ isCur: o.type === tab })}
                        onClick={() => {
                          if (tab === o.type) {
                            return;
                          }
                          safeLocalStorageSetItem(`integrationTab`, o.type);
                          setState({ ...initData, tab: o.type });
                        }}
                      >
                        <a className="pLeft18">
                          {o.name}
                          {o.type === 'connectList' && `(${listCount})`}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <div className={cx('Con', { mTop40: md.global.Config.IsLocal })}>{renderCon()}</div>
          </React.Fragment>
        </div>
        {showConnect && (
          <ConnectWrap
            data={connectData}
            isSuperAdmin={props.isSuperAdmin}
            onClose={isChange => {
              if (isChange) {
                onFresh();
              } else {
                setState({
                  showConnect: false,
                  connectData: null,
                });
              }
            }}
          />
        )}
      </Wrap>
    </ScrollView>
  );
}

function ConnectAndAuth(props) {
  const AutoSizeLib = autoSize(ConnectAndAuthCon);
  return <AutoSizeLib {...props} />;
}

export default ConnectAndAuth;
