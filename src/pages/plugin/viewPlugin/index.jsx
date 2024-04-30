import React, { useEffect, useState, useCallback } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import cx from 'classnames';
import styled from 'styled-components';
import { Support, ScrollView, Dropdown, LoadDiv, Icon, SvgIcon } from 'ming-ui';
import { Switch, Tooltip } from 'antd';
import bg from 'staticfiles/images/plugin_bg.png';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import { enableOptionList, tabList, pluginConfigType } from '../config';
import OperateColumn from './OperateColumn';
import ViewPluginConfig from './ViewPluginConfig';
import pluginApi from 'src/api/plugin';
import ImportPlugin from './ImportPlugin';
import { getPluginOperateText } from '../util';

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
        background: #2196f3;
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
        color: #2196f3;
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
        color: #2196f3;
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

export default function ViewPlugin(props) {
  const { currentProjectId, isAdmin } = props;
  const [fetchState, setFetchState] = useSetState({
    pageIndex: 1,
    loading: true,
    noMore: false,
    state: 2,
    keyWords: '',
  });
  const [pluginList, setPluginList] = useState([]);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('viewPluginTab') || 'myPlugin');
  const [pluginConfig, setPluginConfig] = useState({ visible: false });

  const onFetch = () => {
    if (!fetchState.loading) return;
    pluginApi
      .getList({
        projectId: currentProjectId,
        pluginType: 1,
        pageSize: 50,
        pageIndex: fetchState.pageIndex,
        keyWords: fetchState.keyWords,
        state: fetchState.state !== 2 ? fetchState.state : undefined,
        type: currentTab === 'myPlugin' ? 0 : 1,
      })
      .then(res => {
        if (res) {
          setPluginList(fetchState.pageIndex > 1 ? pluginList.concat(res.plugins) : res.plugins);
          setFetchState({ loading: false, noMore: res.plugins.length < 50 });
        }
      })
      .catch(error => {
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
            </div>
          );
        },
      },
      {
        dataIndex: 'state',
        renderTitle: () => (
          <div className="flexRow alignItemsCenter">
            <span>{_l('状态')}</span>
            <Tooltip title={_l('启用时全组织可用，关闭后不影响已创建视图')}>
              <Icon icon="info_outline" className="Gray_bd mLeft4 pointer" />
            </Tooltip>
          </div>
        ),
        render: item => (
          <Switch
            checkedChildren={_l('开启')}
            unCheckedChildren={_l('关闭')}
            disabled={!isAdmin}
            checked={!!item.state}
            onChange={(checked, e) => {
              e.stopPropagation();
              const newPluginList = pluginList.map(p => {
                return p.id === item.id ? { ...p, state: checked ? 1 : 0 } : p;
              });
              setPluginList(newPluginList);
              pluginApi
                .edit({
                  projectId: currentProjectId,
                  id: item.id,
                  source: currentTab === 'myPlugin' ? 0 : 1,
                  state: checked ? 1 : 0,
                })
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
          isAdmin || currentTab === 'myPlugin' ? (
            <OperateColumn
              projectId={currentProjectId}
              pluginId={item.id}
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
            <h3 className="Bold Font24">{_l('插件中心')}</h3>
            <p className="Font15 flexRow alignItemsCenter">
              {_l('制作和管理插件，自由扩展系统功能')}
              <Support
                type={3}
                href="https://help.mingdao.com/extensions/developer/view"
                text={_l('插件开发文档')}
                className="mLeft4 Font15"
              />
            </p>
          </div>
        </div>

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
                    setFetchState({ loading: true });
                  }}
                >
                  <a>{item.text}</a>
                </li>
              );
            })}
          </ul>
        </div>

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
                  onChange={state => setFetchState({ state, loading: true })}
                />
              )}
            </div>

            {!(currentTab === 'project' && !isAdmin) && (
              <div
                className="headerBtn"
                onClick={() =>
                  currentTab === 'myPlugin'
                    ? setPluginConfig({ visible: true, configType: pluginConfigType.create })
                    : ImportPlugin({
                        projectId: currentProjectId,
                        onImportCreateSuccess: () => setFetchState({ loading: true, pageIndex: 1 }),
                      })
                }
              >
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
                            currentTab === 'myPlugin' ? pluginConfigType.debugEnv : pluginConfigType.publishHistory,
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
            <ViewPluginConfig
              {...props}
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
