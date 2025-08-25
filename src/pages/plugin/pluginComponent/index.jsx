import React, { useCallback, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Switch, Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import bg from 'staticfiles/images/plugin_bg.png';
import styled from 'styled-components';
import { Dropdown, Icon, LoadDiv, ScrollView, Support, SvgIcon } from 'ming-ui';
import { hasPermission } from 'src/components/checkPermission';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import { getRequest } from 'src/utils/common';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import {
  API_EXTENDS,
  enableOptionList,
  PLUGIN_TYPE,
  pluginApiConfig,
  pluginConfigType,
  pluginConstants,
  tabList,
} from '../config';
import { getPluginOperateText } from '../util';
import ImportPlugin from './ImportPlugin';
import OperateColumn from './OperateColumn';
import PluginConfig from './PluginConfig';

const Wrapper = styled.div`
  background: #fff;
  min-height: 100%;
  .headerWrapper {
    height: 260px;
    background: linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%);
    box-sizing: border-box;

    .headerContent {
      padding: 80px 0 0 50px;
      background: url(${bg}) no-repeat right;
      background-size: auto 100%;
      width: 100%;
      height: 100%;
    }
  }
  .navTab {
    margin-top: -48px;
    ul {
      text-align: center;
      li {
        display: inline-block;
        margin: 0 30px;
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
          border-bottom: 4px solid #1677ff;
          a {
            color: #1677ff;
          }
        }
      }
    }
  }
  .contentWrapper {
    display: flex;
    flex-direction: column;
    padding: 32px;
    .contentHeader {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      .searchInput {
        width: 220px;
        min-width: 220px;
        height: 36px;
        margin-right: 24px;
      }
      .filterDropdown {
        width: 120px;
        .Dropdown--input {
          padding: 4px 8px 4px 12px;
        }
      }
      .headerBtn {
        padding: 8px 24px;
        background: #1677ff;
        border-radius: 18px;
        color: #fff;
        display: inline-block;
        cursor: pointer;

        &:hover {
          background: #1764c0;
        }
      }
    }
  }
`;

const PluginListBox = styled.div`
  .headTr {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 14px 8px;
    border-bottom: 1px solid #e0e0e0;
  }

  .dataItem {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 8px;
    border-bottom: 1px solid #e0e0e0;
    cursor: pointer;
    &.isActive {
      background: rgba(247, 247, 247, 1);
    }
    &:hover {
      background: rgba(247, 247, 247, 1);
      .name {
        color: #1677ff;
      }
      .operateIcon {
        background: rgba(247, 247, 247, 1);
      }
    }

    .ant-switch-checked {
      background-color: rgba(40, 202, 131, 1);
    }
  }

  .name {
    padding-right: 8px;
    width: 0;
    flex: 9;
  }
  .developers,
  .operateTime {
    flex: 5;
  }
  .state,
  .currentVersion,
  .createTime {
    flex: 3;
  }
  .operate {
    flex: 1;
    text-align: right;
    .operateIcon {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: #9e9e9e;
      background: #fff;

      &:hover {
        color: #1677ff;
        background: #fff !important;
      }
    }
  }
`;

const NoDataWrapper = styled.div`
  text-align: center !important;
  .iconCon {
    width: 130px;
    height: 130px;
    line-height: 130px;
    background: #f5f5f5;
    border-radius: 50%;
    margin: 64px auto 0;
    color: #9e9e9e;
  }
`;

let getListRequest = null;

export default function PluginComponent(props) {
  const { currentProjectId, myPermissions = [], pluginType = PLUGIN_TYPE.VIEW } = props;
  const hasManagePluginAuth = hasPermission(myPermissions, PERMISSION_ENUM.MANAGE_PLUGINS);
  const hasDevelopPluginAuth =
    _.get(
      _.find(md.global.Account.projects, item => item.projectId === currentProjectId),
      'allowPlugin',
    ) || hasPermission(myPermissions, PERMISSION_ENUM.DEVELOP_PLUGIN);
  const request = getRequest();

  const [fetchState, setFetchState] = useSetState({
    pageIndex: 1,
    loading: true,
    noMore: false,
    state: 2,
    keyWords: '',
  });
  const [pluginList, setPluginList] = useState([]);
  const [currentTab, setCurrentTab] = useState(
    hasDevelopPluginAuth ? request.tab || localStorage.getItem('viewPluginTab') || 'myPlugin' : 'project',
  );
  const [pluginConfig, setPluginConfig] = useState({ visible: false });

  const pluginApi = pluginApiConfig[pluginType];

  const onFetch = () => {
    if (!fetchState.loading) return;
    if (getListRequest) getListRequest.abort();

    getListRequest = pluginApi.getList(
      {
        projectId: currentProjectId,
        pluginType: 1,
        pageSize: 50,
        pageIndex: fetchState.pageIndex,
        keyWords: fetchState.keyWords,
        state: fetchState.state !== 2 ? fetchState.state : undefined,
        type: currentTab === 'myPlugin' ? 0 : 1,
      },
      API_EXTENDS,
    );
    getListRequest
      .then(res => {
        if (res) {
          setPluginList(fetchState.pageIndex > 1 ? pluginList.concat(res.plugins) : res.plugins);
          setFetchState({ loading: false, noMore: res.plugins.length < 50 });
        }
      })
      .catch(() => {
        setFetchState({ loading: false });
        setPluginList([]);
      });
  };

  const onScrollEnd = () => {
    if (!fetchState.noMore && !fetchState.loading) {
      setFetchState({ loading: true, pageIndex: fetchState.pageIndex + 1 });
    }
  };

  const onSearch = useCallback(
    _.debounce(value => {
      setFetchState({ loading: true, pageIndex: 1, keyWords: value });
    }, 500),
    [],
  );

  useEffect(onFetch, [currentTab, fetchState.loading, fetchState.pageIndex, fetchState.keyWords, fetchState.state]);

  const onCreateOrImport = () => {
    if (pluginType === PLUGIN_TYPE.VIEW) {
      currentTab === 'myPlugin'
        ? setPluginConfig({ visible: true, configType: pluginConfigType.create })
        : ImportPlugin({
            projectId: currentProjectId,
            pluginType,
            onImportCreateSuccess: () => setFetchState({ loading: true, pageIndex: 1 }),
          });
    } else {
      const featureType = getFeatureStatus(currentProjectId, VersionProductType.flowPlugin);

      if (featureType === '2') {
        buriedUpgradeVersionDialog(currentProjectId, VersionProductType.flowPlugin);
        return;
      }

      pluginApi.create({ projectId: currentProjectId, pluginType: 1, name: _l('未命名') }, API_EXTENDS).then(res => {
        if (res) {
          window.open(`/workflowplugin/${res.id}`);
        }
      });
    }
  };

  const getColumns = () => {
    const columns = [
      {
        dataIndex: 'name',
        title: _l('名称'),
        render: item => {
          return (
            <div className="flexRow alignItemsCenter">
              {item.iconUrl ? (
                <SvgIcon url={item.iconUrl} fill={item.iconColor} size={16} className="pTop3" />
              ) : (
                <Icon icon="extension" className="Font16 Gray_bd" />
              )}
              <span title={item.name} className="mLeft8 bold overflow_ellipsis">
                {item.name}
              </span>
              <div className="flex" />
              {item.source === 3 && <Icon icon="merchant" className="Font16 Gray_bd" />}
            </div>
          );
        },
      },
      {
        dataIndex: 'state',
        renderTitle: () => (
          <div className="flexRow alignItemsCenter">
            <span>{_l('状态')}</span>
            <Tooltip
              title={
                pluginType === PLUGIN_TYPE.WORKFLOW
                  ? _l('启用时全组织可用，关闭后不影响已创建工作流')
                  : _l('启用时全组织可用，关闭后不影响已创建视图')
              }
              autoCloseDelay={0}
            >
              <Icon icon="info_outline" className="Gray_bd mLeft4 pointer" />
            </Tooltip>
          </div>
        ),
        render: item => (
          <Switch
            checkedChildren={_l('开启')}
            unCheckedChildren={_l('关闭')}
            disabled={!hasManagePluginAuth}
            checked={!!item.state}
            onChange={(checked, e) => {
              e.stopPropagation();
              const newPluginList = pluginList.map(p => {
                return p.id === item.id ? { ...p, state: checked ? 1 : 0 } : p;
              });
              setPluginList(newPluginList);
              pluginApi
                .edit(
                  {
                    projectId: currentProjectId,
                    id: item.id,
                    source: currentTab === 'myPlugin' ? 0 : 1,
                    state: checked ? 1 : 0,
                  },
                  API_EXTENDS,
                )
                .then(res => {
                  if (res) {
                    const newPluginList = pluginList.map(p => {
                      return p.id === item.id ? { ...p, state: checked ? 1 : 0 } : p;
                    });
                    setPluginList(newPluginList);
                  }
                });
            }}
          />
        ),
      },
      { dataIndex: 'developers', title: _l('开发者'), render: item => <div>{(item.developers || []).join(',')}</div> },
      {
        dataIndex: 'currentVersion',
        title: _l('当前版本'),
        render: item => (
          <span className={!item.currentVersion.versionCode ? 'Gray_9e bold' : 'bold'}>
            {!item.currentVersion.versionCode ? _l('未发布') : item.currentVersion.versionCode}
          </span>
        ),
      },
      {
        dataIndex: currentTab === 'myPlugin' ? 'createTime' : 'operateTime',
        title: currentTab === 'myPlugin' ? _l('创建时间') : _l('最近操作'),
        render: item => {
          return currentTab === 'myPlugin' ? (
            <div>{item.createTime ? createTimeSpan(item.createTime) : ''}</div>
          ) : (
            <div>{getPluginOperateText(item.recentOperation)}</div>
          );
        },
      },
      {
        dataIndex: 'operate',
        renderTitle: () => (
          <div className="operateIcon" onClick={() => setFetchState({ loading: true, pageIndex: 1 })}>
            <Icon icon="refresh1" className="Font18 pointer" />
          </div>
        ),
        render: item =>
          hasManagePluginAuth || currentTab === 'myPlugin' ? (
            <OperateColumn
              pluginType={pluginType}
              projectId={currentProjectId}
              pluginId={item.id}
              license={item.license}
              source={currentTab === 'myPlugin' ? 0 : 1}
              onDeleteSuccess={() => {
                const newPluginList = pluginList.filter(p => p.id !== item.id);
                setPluginList(newPluginList);
              }}
            />
          ) : null,
      },
    ];
    return columns.filter(item => currentTab === 'project' || !_.includes(['state', 'developers'], item.dataIndex));
  };

  return (
    <ScrollView onScrollEnd={onScrollEnd}>
      <Wrapper>
        <div className="headerWrapper">
          <div className="headerContent">
            <h3 className="Bold Font24">{pluginConstants[pluginType].headerTitle}</h3>
            <p className="Font15 flexRow alignItemsCenter">
              {pluginConstants[pluginType].headerDescription}
              {pluginType === PLUGIN_TYPE.VIEW && (
                <Support
                  type={3}
                  href={pluginConstants[pluginType].supportLink}
                  text={_l('开发文档')}
                  className="mLeft4 Font15"
                />
              )}
            </p>
          </div>
        </div>

        {hasDevelopPluginAuth && (
          <div className="navTab">
            <ul>
              {tabList.map((item, index) => {
                return (
                  <li
                    key={index}
                    className={cx({ isCur: item.value === currentTab })}
                    onClick={() => {
                      if (currentTab === item.value) {
                        return;
                      }
                      safeLocalStorageSetItem(`viewPluginTab`, item.value);
                      setCurrentTab(item.value);
                      setFetchState({ loading: true, pageIndex: 1, keyWords: '', state: 2 });
                    }}
                  >
                    <a>{item.value === 'myPlugin' ? pluginConstants[pluginType].myTabText : item.text}</a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="contentWrapper">
          <div className="contentHeader">
            <div className="flexRow ">
              <SearchInput
                className="searchInput"
                placeholder={currentTab === 'myPlugin' ? _l('搜索插件') : _l('搜索插件 / 开发者')}
                value={fetchState.keyWords}
                onChange={onSearch}
              />
              {currentTab === 'project' && (
                <Dropdown
                  className="filterDropdown"
                  border={true}
                  isAppendToBody={true}
                  placeholder={_l('启用状态')}
                  value={fetchState.state}
                  data={enableOptionList}
                  onChange={state => setFetchState({ state, loading: true, pageIndex: 1 })}
                />
              )}
            </div>

            {!(currentTab === 'project' && (!hasManagePluginAuth || pluginType === PLUGIN_TYPE.WORKFLOW)) && (
              <div className="headerBtn" onClick={onCreateOrImport}>
                <span className="bold">{currentTab === 'myPlugin' ? _l('制作插件') : _l('+ 导入')}</span>
              </div>
            )}
          </div>

          <PluginListBox>
            <div className="headTr">
              {getColumns().map((item, index) => {
                return (
                  <div key={index} className={`${item.dataIndex}`}>
                    {item.renderTitle ? item.renderTitle() : item.title}
                  </div>
                );
              })}
            </div>
          </PluginListBox>

          {fetchState.pageIndex === 1 && fetchState.loading ? (
            <LoadDiv className="mTop10" />
          ) : (
            <PluginListBox>
              {pluginList && pluginList.length > 0 ? (
                pluginList.map((pluginItem, i) => {
                  return (
                    <div
                      key={i}
                      className={cx('dataItem', { isActive: pluginConfig.pluginId === pluginItem.id })}
                      onClick={() => {
                        setPluginConfig({
                          visible: true,
                          configType:
                            currentTab === 'myPlugin' && pluginType === PLUGIN_TYPE.VIEW
                              ? pluginConfigType.debugEnv
                              : pluginConfigType.publishHistory,
                          pluginId: pluginItem.id,
                        });
                      }}
                    >
                      {getColumns().map((item, j) => {
                        return (
                          <div key={`${i}-${j}`} className={`${item.dataIndex}`}>
                            {item.render ? item.render(pluginItem) : pluginItem[item.dataIndex]}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <NoDataWrapper>
                  <span className="iconCon InlineBlock TxtCenter ">
                    <i className="icon-extension Font64 TxtMiddle" />
                  </span>
                  <p className="Gray_9e mTop20 mBottom0">{fetchState.keyWords ? _l('暂无搜索结果') : _l('暂无数据')}</p>
                </NoDataWrapper>
              )}
            </PluginListBox>
          )}

          {pluginConfig.visible && (
            <PluginConfig
              {...props}
              pluginType={pluginType}
              hasManagePluginAuth={hasManagePluginAuth}
              projectId={currentProjectId}
              belongType={currentTab}
              pluginId={pluginConfig.pluginId}
              configType={pluginConfig.configType}
              onClose={() => setPluginConfig({ visible: false })}
              onUpdateSuccess={(id, updateObj) => {
                const newPluginList = pluginList.map(item => {
                  return item.id === id ? { ...item, ...updateObj } : item;
                });
                setPluginList(newPluginList);
              }}
              onClickAway={() => setPluginConfig({ visible: false })}
              onClickAwayExceptions={[
                '.mui-dialog-container',
                '.dropdownTrigger',
                '.ant-select-dropdown',
                '.selectIconWrap',
                '.ant-picker-dropdown',
              ]}
            />
          )}
        </div>
      </Wrapper>
    </ScrollView>
  );
}
