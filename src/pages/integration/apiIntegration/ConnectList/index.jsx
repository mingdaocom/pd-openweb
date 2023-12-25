import React, { useCallback, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import autoSize from 'ming-ui/decorators/autoSize';
import { Support, ScrollView } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import List from './List';
import { PageSize } from '../../config';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import ConnectWrap from '../ConnectWrap';
import bg from 'staticfiles/images/query.png';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import _ from 'lodash';
import loadScript from 'load-script';
import moment from 'moment';
import { Dropdown } from 'ming-ui';
const Wrap = styled.div`
  .mLeft18 {
    margin-left: 18px;
  }
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
let ajaxPromise = null;

function Con(props) {
  let str = 'https://alifile.mingdaocloud.com/open/js/apilibrary.js' + '?' + moment().format('YYYYMMDD');
  const cache = useRef({ pgIndex: 1 });
  const initData = {
    loading: false,
    pageIndex: 1,
    noMore: false,
    listData: [],
    keywords: '',
    showConnect: false,
    connectData: null,
    countSort: 0,
    timeSort: 0,
    searchType: 0,
  };
  const [
    {
      loading,
      noMore,
      pageIndex,
      listData,
      keywords,
      showConnect,
      connectData,
      hasChange,
      listCount,
      countSort,
      timeSort,
      searchType,
    },
    setState,
  ] = useSetState({ ...initData, listCount: 0 });
  const featureType = getFeatureStatus(props.currentProjectId, VersionProductType.apiIntergration);
  const fetchData = () => {
    if (!props.currentProjectId) {
      return;
    }
    if (ajaxPromise) {
      ajaxPromise.abort();
    }
    setState({ loading: true });
    let sorter = {
      lastModifiedDate: timeSort === 1 ? 'ascend' : timeSort === 2 ? 'descend' : undefined,
      apiCount: countSort === 1 ? 'ascend' : countSort === 2 ? 'descend' : undefined,
    };
    if (!sorter.lastModifiedDate && !sorter.apiCount) {
      sorter = undefined;
    }
    ajaxPromise = packageVersionAjax.getList(
      {
        companyId: props.currentProjectId,
        types: [1, 2],
        pageIndex: pageIndex,
        pageSize: PageSize,
        keyword: keywords,
        isOwner: searchType !== 0,
        sorter,
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
      countSort: 0,
      timeSort: 0,
      searchType: 0,
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
  }, [props.currentProjectId, pageIndex, keywords, hasChange, countSort, timeSort, searchType]);

  useEffect(() => {
    packageVersionAjax
      .count(
        {
          companyId: props.currentProjectId,
          types: [1, 2],
          pageIndex: 1,
          pageSize: 10000000,
          isOwner: searchType !== 0,
        },
        { isIntegration: true },
      )
      .then(res => {
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
            <div className="flex flexRow">
              <SearchInput
                className="searchCon"
                placeholder={_l('搜索连接')}
                value={keywords}
                onChange={handleSearch}
              />
              {/* ① 组织管理员，可以选择查看所有连接和我的连接
              1、我的连接即拥有者包含我的连接
              2、仅对组织应用管理员展示
              3、筛选后，「我的连接」后的数量也需变化 */}
              {props.isSuperAdmin && (
                <Dropdown
                  value={searchType}
                  className="dropSearchType mLeft18"
                  onChange={value => {
                    if (searchType === value) {
                      return;
                    }
                    setState({
                      searchType: value,
                      pageIndex: 1,
                      hasChange: hasChange + 1,
                    });
                  }}
                  border
                  isAppendToBody
                  data={[
                    {
                      text: _l('所有连接'),
                      value: 0,
                    },
                    {
                      text: _l('我的连接'),
                      value: 1,
                    },
                  ]}
                />
              )}
            </div>
            {featureType && (
              <span
                className="addConnect Bold Hand"
                onClick={() => {
                  const projectId = props.currentProjectId;
                  if (featureType === '2') {
                    buriedUpgradeVersionDialog(projectId, VersionProductType.apiIntergration);
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

  const renderLibCon = () => {
    window.MDAPILibrary &&
      window.MDAPILibrary({
        DomId: 'containerApiLib',
        featureType: featureType,
        installCallBack: id => {
          setState({ showConnect: true, connectData: { id }, hasChange: hasChange + 1 });
        },
        buriedUpgradeVersionDialog: () => {
          buriedUpgradeVersionDialog(props.currentProjectId, VersionProductType.apiIntergration);
        },
        currentProjectId: props.currentProjectId,
        getUrl: 'https://api.mingdao.com/integration',
        installUrl: __api_server__.integration || md.global.Config.IntegrationAPIUrl,
      });
  };
  const loadLib = () => {
    loadScript(str, err => {
      if (!err && window.MDAPILibrary) {
        renderLibCon();
      }
    });
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
      countSort,
      timeSort,
      onChange: res => {
        setState({ ...res });
      },
      onFresh: () => {
        onFresh();
      },
    };
    const onCreate = () => {
      const projectId = props.currentProjectId;
      if (!projectId) {
        return alert(_l('请创建或申请加入一个组织'), 3);
      }
      if (featureType === '2') {
        buriedUpgradeVersionDialog(projectId, VersionProductType.apiIntergration);
      } else {
        setState({ showConnect: true, connectData: null });
      }
    };
    return (
      <React.Fragment>
        {listConRender()}
        <List
          {...param}
          onCreate={onCreate}
          featureType={featureType}
          updateList={list => {
            setState({
              listData: list,
            });
          }}
        />
      </React.Fragment>
    );
  };
  return (
    <ScrollView onScrollEnd={onScrollEnd}>
      <Wrap>
        <div className="desCon">
          <div className="conBox">
            <h3 className="Bold Font24">{_l('我的连接')}</h3>
            <p className="Font15">
              {_l('连接第三方 API 并保存鉴权认证，在工作表或工作流中调用')}
              <Support type={3} href="https://help.mingdao.com/integration#第一步、连接与认证" text={_l('使用帮助')} />
            </p>
          </div>
        </div>
        <div className="listCon">
          <React.Fragment>
            <div className={cx('Con mTop40')}>{renderCon()}</div>
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

function ConnectList(props) {
  const AutoSizeLib = autoSize(Con);
  return <AutoSizeLib {...props} />;
}

export default ConnectList;
