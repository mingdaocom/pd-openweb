import React, { useCallback, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import bg from 'staticfiles/images/query.png';
import styled from 'styled-components';
import { Dropdown, Icon, Menu, ScrollView, Support } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import { hasPermission } from 'src/components/checkPermission';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import { MenuItemWrap } from 'src/pages/integration/apiIntegration/style.js';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { PageSize } from '../../config';
import ConnectWrap from '../ConnectWrap';
import ImportDialog from './ImportDialog';
import List from './List';

const TABLIST = [
  { tab: 1, txt: _l('自定义') },
  { tab: 2, txt: _l('安装') },
  { tab: 3, txt: _l('授权') },
];
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
          color: #151515;
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
    tab: 1,
    isCreate: false,
    showMenu: false,
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
      tab,
      showMenu,
      isCreate,
    },
    setState,
  ] = useSetState({ ...initData, listCount: 0 });
  const featureType = getFeatureStatus(props.currentProjectId, VersionProductType.apiIntergration);
  const canCreateAPIConnect =
    _.get(
      _.find(md.global.Account.projects, item => item.projectId === props.currentProjectId),
      'allowAPIIntegration',
    ) || hasPermission(props.myPermissions, [PERMISSION_ENUM.CREATE_API_CONNECT, PERMISSION_ENUM.MANAGE_API_CONNECTS]);
  const hasManageAuth = hasPermission(props.myPermissions, PERMISSION_ENUM.MANAGE_API_CONNECTS);

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
    ajaxPromise =
      tab === 3
        ? packageVersionAjax.getInstallList(
            {
              companyId: props.currentProjectId,
              // types: [2],
              pageIndex: pageIndex,
              pageSize: PageSize,
              keyword: keywords,
              isOwner: searchType !== 0,
              sorter,
              hasAuth: true,
            },
            { isIntegration: true },
          )
        : packageVersionAjax.getList(
            {
              companyId: props.currentProjectId,
              types: [tab],
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

  const handleSearch = _.debounce(v => {
    setState({
      keywords: v,
      pageIndex: 1,
      noMore: false,
    });
  }, 500);

  const onScrollEnd = () => {
    if (loading || noMore) {
      return;
    }
    setState({ pageIndex: cache.current.pgIndex + 1 });
  };

  useEffect(() => {
    fetchData();
  }, [props.currentProjectId, pageIndex, keywords, hasChange, countSort, timeSort, searchType, tab]);

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

  const renderBtn = () => {
    return (
      <span
        className="addConnect Bold Hand"
        onClick={e => {
          const projectId = props.currentProjectId;
          if (featureType === '2') {
            e.stopPropagation();
            setState({ showMenu: false });
            buriedUpgradeVersionDialog(projectId, VersionProductType.apiIntergration);
          }
        }}
      >
        <i className="icon-add" />
        {_l('自定义连接')}
      </span>
    );
  };

  const listConRender = () => {
    return (
      <React.Fragment>
        <WrapListHeader className={cx('headCon flexRow', { pBottom12: !hasManageAuth })}>
          <div className="flex flexRow">
            <SearchInput className="searchCon" placeholder={_l('搜索连接')} value={keywords} onChange={handleSearch} />
            {hasManageAuth && (
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
          {featureType &&
            canCreateAPIConnect &&
            tab === 1 &&
            (featureType === '2' ? (
              renderBtn()
            ) : (
              <Trigger
                action={['click']}
                popupVisible={showMenu}
                popupAlign={{
                  points: ['tr', 'br'],
                  offset: [0, 5],
                  overflow: { adjustX: true, adjustY: true },
                }}
                onPopupVisibleChange={visible => {
                  setState({
                    showMenu: visible,
                  });
                }}
                popup={
                  <Menu>
                    <MenuItemWrap
                      icon={<Icon icon="add" className="Font17 mLeft5" />}
                      onClick={() => {
                        setState({ showConnect: true, connectData: null, showMenu: false });
                      }}
                    >
                      <span>{_l('创建自定义连接')}</span>
                    </MenuItemWrap>
                    <MenuItemWrap
                      icon={<Icon icon="knowledge-upload" className="Font17 mLeft5" />}
                      onClick={() => {
                        setState({ isCreate: true, showMenu: false, connectData: null });
                      }}
                    >
                      <span>{_l('导入连接')}</span>
                    </MenuItemWrap>
                  </Menu>
                }
                popupClassName={cx('dropdownTrigger')}
              >
                {renderBtn()}
              </Trigger>
            ))}
        </WrapListHeader>
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
          tab={tab}
          onCreate={onCreate}
          featureType={featureType}
          updateList={list => {
            setState({
              listData: list,
            });
          }}
          canCreateAPIConnect={canCreateAPIConnect}
          hasManageAuth={hasManageAuth}
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
              <Support
                type={3}
                href="https://help.mingdao.com/integration/api#connection-certification"
                text={_l('使用帮助')}
              />
            </p>
          </div>
        </div>
        <div className="listCon">
          <div className="navTab">
            <ul>
              {TABLIST.map((o, i) => {
                return (
                  <li
                    key={i}
                    className={cx({ isCur: o.tab === tab })}
                    onClick={() => {
                      if (tab === o.tab) {
                        return;
                      }
                      setState({ tab: o.tab, pageIndex: 1 });
                    }}
                  >
                    <a className="pLeft18">{o.txt}</a>
                  </li>
                );
              })}
            </ul>
          </div>
          <React.Fragment>
            <div className={cx('Con mTop40')}>{renderCon()}</div>
          </React.Fragment>
        </div>
        {showConnect && (
          <ConnectWrap
            data={connectData}
            myPermissions={props.myPermissions}
            hasManageAuth={hasManageAuth}
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
        {isCreate && (
          <ImportDialog
            projectId={props.currentProjectId}
            onClose={() => setState({ isCreate: false })}
            onFresh={onFresh}
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
