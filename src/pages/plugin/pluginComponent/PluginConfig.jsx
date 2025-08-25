import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Input, LoadDiv, ScrollView, SvgIcon, TagTextarea } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import appManagementApi from 'src/api/appManagement';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';
import { getRgbaByColor } from 'src/pages/widgetConfig/util';
import { navigateToView } from 'src/pages/widgetConfig/util/data';
import Search from 'src/pages/workflow/components/Search';
import { API_EXTENDS, PLUGIN_TYPE, pluginApiConfig, pluginConfigType, viewDetailTabList } from '../config';
import { getPluginOperateText } from '../util';
import DebugEnv from './DebugEnv';
import DetailList from './DetailList';
import ImportPlugin from './ImportPlugin';
import PublishVersion from './PublishVersion';

const ConfigWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 800px;
  height: 100%;
  position: fixed;
  z-index: 100;
  right: 0;
  top: 0;
  bottom: 0;
  background: #fff;
  box-shadow: 0px 3px 24px rgba(0, 0, 0, 0.16);

  .tabList {
    width: 100%;
    background: #fff;
    position: sticky;
    top: -1px;

    ul {
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid #ebebeb;
      li {
        display: inline-block;
        font-size: 15px;
        font-weight: 600;
        margin: 0;
        padding: 10px 20px;
        box-sizing: border-box;
        border-bottom: 2px solid rgba(0, 0, 0, 0);
        cursor: pointer;
        &.isCur {
          color: #1677ff;
          border-bottom: 2px solid #1677ff;
        }
      }
    }
    .searchWrapper {
      display: flex;
      justify-content: flex-end;
      padding: 12px 24px;
      .workflowSearchWrap {
        width: 220px;
        input {
          width: 100%;
          border-radius: 3px;
        }
      }
    }
  }

  .closeIcon {
    position: absolute;
    z-index: 10;
    right: 24px;
    top: 22px;
    font-size: 24px;
    cursor: pointer;
    &:hover {
      color: #1677ff;
    }
  }

  .configHeader {
    background: #ffffff;
    padding: 32px 24px 0px 24px;
    width: 100%;
    transition: height 0.2s;
    position: relative;

    .iconWrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 48px;
      height: 48px;
      min-width: 48px;
      margin-right: 20px;
      background: #fff;
      color: #bdbdbd;
      border-radius: 8px;
      cursor: pointer;
    }
    .nameInput {
      width: 100%;
      font-size: 20px;
      font-weight: bold;
      border: none;
      padding: 0;
    }

    .validVersionCard {
      display: flex;
      align-items: center;
      width: 100%;
      background: #ffffff;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 22px 20px;
      margin-top: 24px;

      .versionPublishBtn {
        display: flex;
        align-items: center;
        height: 36px;
        line-height: 36px;
        padding: 0 16px;
        border-radius: 36px;
        background: #e3f2fd;
        color: #1677ff;
        cursor: pointer;
        i {
          margin-right: 6px;
          font-size: 16px;
        }
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }

  .configContent {
    padding: 12px 24px;
    .tagInputareaIuput {
      min-height: 220px;
      .CodeMirror-sizer {
        min-height: 220px !important;
      }
    }
  }

  .configFooter {
    background: #fff;
    padding: 16px 20px;

    .footerBtn {
      display: inline-block;
      height: 36px;
      line-height: 36px;
      border-radius: 3px;
      padding: 0 30px;
      cursor: pointer;

      &.close,
      &.recoverDefault {
        color: #757575;
        border: 1px solid #ebebeb;
        &:hover {
          color: #1677ff;
          border: 1px solid #1677ff;
        }
      }
      &.save {
        color: #fff;
        background: #1677ff;
        border: 1px solid #1677ff;
        &:hover {
          background: #1764c0;
          border: 1px solid #1764c0;
        }
      }
    }
  }
`;

//视图插件详情 侧拉层
function PluginConfig(props) {
  const { belongType, configType, pluginId, projectId, onClose, onUpdateSuccess, hasManagePluginAuth, pluginType } =
    props;
  const [detailData, setDetailData] = useSetState({
    name: '',
    icon: '',
    iconUrl: '',
    iconColor: '',
    debugEnvironments: [],
    currentVersion: {},
    configuration: '',
    recentOperation: {},
  });
  const [defaultEnvList, setDefaultEnvList] = useState([{ isEdit: true }]);
  const [defaultConfiguration, setDefaultConfiguration] = useSetState({ debugConfiguration: {}, configuration: {} });
  const [detailLoading, setDetailLoading] = useState(false);
  const [fetchListState, setFetchListState] = useSetState({
    loading: false,
    pageIndex: 1,
    keywords: '',
    noMore: false,
  });
  const [detailList, setDetailList] = useSetState({
    usageList: [],
    publishHistoryList: [],
    commitList: [],
    exportHistoryList: [],
  });
  const [appList, setAppList] = useState();
  const [editingName, setEditingName] = useState(false);
  const [currentTab, setCurrentTab] = useState(
    configType === pluginConfigType.create ? pluginConfigType.debugEnv : configType,
  );
  const [publishVisible, setPublishVisible] = useState(false);
  const inputRef = useRef();
  const textareaRef = useRef();
  const source = belongType === 'myPlugin' ? 0 : 1;

  const pluginApi = pluginApiConfig[pluginType];

  useEffect(() => {
    pluginId && fetchDetail();
  }, []);

  useEffect(() => {
    fetchList(1);
  }, [currentTab]);

  const fetchDetail = () => {
    setDetailLoading(true);
    pluginApi.getDetail({ id: pluginId, source }, API_EXTENDS).then(res => {
      if (res) {
        setDetailLoading(false);
        setDetailData(!(res.debugEnvironments || []).length ? { ...res, debugEnvironments: [{ isEdit: true }] } : res);
        setDefaultEnvList(!(res.debugEnvironments || []).length ? [{ isEdit: true }] : res.debugEnvironments);
        setDefaultConfiguration({
          debugConfiguration: source === 0 ? res.configuration : res.debugConfiguration,
          configuration: res.configuration,
        });
      }
    });
  };

  const fetchList = (pageIndex, keywords) => {
    if (!_.includes([pluginConfigType.debugEnv, pluginConfigType.paramSetting], currentTab)) {
      setFetchListState({ loading: true, pageIndex, keywords });
    }
    switch (currentTab) {
      case pluginConfigType.commit:
        pluginApi
          .getCommitHistory({ id: pluginId, source, pageSize: 50, pageIndex }, API_EXTENDS)
          .then(res => {
            if (res) {
              setFetchListState({ loading: false, noMore: res.history.length < 50 });
              setDetailList({
                commitList: pageIndex > 1 ? detailList.commitList.concat(res.history) : res.history,
              });
            }
          })
          .catch(() => setFetchListState({ loading: false }));
        break;
      case pluginConfigType.publishHistory:
        pluginApi
          .getReleaseHistory({ id: pluginId, pageSize: 50, pageIndex, source }, API_EXTENDS)
          .then(res => {
            if (res) {
              setFetchListState({ loading: false, noMore: res.history.length < 50 });
              setDetailList({
                publishHistoryList: pageIndex > 1 ? detailList.publishHistoryList.concat(res.history) : res.history,
              });
            }
          })
          .catch(() => setFetchListState({ loading: false }));
        break;
      case pluginConfigType.usageDetail:
        pluginApi
          .getUseDetail({ id: pluginId, pageSize: 50, type: 1, pageIndex, keywords: keywords || '' }, API_EXTENDS)
          .then(res => {
            if (res) {
              setFetchListState({ loading: false, noMore: res.details.length < 50 });
              setDetailList({
                usageList: pageIndex > 1 ? detailList.usageList.concat(res.details) : res.details,
              });
            }
          })
          .catch(() => setFetchListState({ loading: false }));
        break;
      case pluginConfigType.debugEnv:
        setDetailData({ debugEnvironments: defaultEnvList });
        break;
      case pluginConfigType.exportHistory:
        pluginApi
          .getExportHistory({ id: pluginId, pageSize: 50, pageIndex, source }, API_EXTENDS)
          .then(res => {
            if (res) {
              setFetchListState({ loading: false, noMore: res.length < 50 });
              setDetailList({
                exportHistoryList: pageIndex > 1 ? detailList.exportHistoryList.concat(res) : res,
              });
            }
          })
          .catch(() => setFetchListState({ loading: false }));
        break;
      default:
        break;
    }
  };

  const onGetAppList = () => {
    appManagementApi.getAppForManager({ projectId, type: 0 }).then(res => {
      if (res) {
        const list = res.map(item => {
          return {
            text: item.appName,
            value: item.appId,
          };
        });
        setAppList(list);
      }
    });
  };

  const onScrollEnd = () => {
    if (!fetchListState.loading && !fetchListState.noMore) {
      setFetchListState({ pageIndex: fetchListState.pageIndex + 1 });
      fetchList(fetchListState.pageIndex + 1, fetchListState.keywords);
    }
  };

  const onCreate = () => {
    if (!detailData.debugEnvironments[0].appId) {
      alert(_l('请选择应用'), 3);
      return;
    }
    if (!detailData.debugEnvironments[0].worksheetId) {
      alert(_l('请选择工作表'), 3);
      return;
    }
    pluginApi
      .create(
        {
          projectId,
          pluginType: 1,
          ..._.pick(detailData, ['icon', 'iconColor']),
          name: detailData.name || _l('未命名插件'),
          debugEnvironments: detailData.debugEnvironments.map(item => {
            return { ..._.pick(item, ['appId', 'worksheetId']) };
          }),
        },
        API_EXTENDS,
      )
      .then(res => {
        if (res) {
          alert('插件创建成功');
          onClose();
          const { worksheetId, viewId } = res.debugEnvironments[0] || {};
          navigateToView(worksheetId, viewId);
        }
      });
  };

  const onUpdate = (updateObj = {}, cb = () => {}, errorText) => {
    pluginApi.edit({ projectId, id: pluginId, source, ...updateObj }, API_EXTENDS).then(res => {
      if (res) {
        onUpdateSuccess(pluginId, updateObj);
        const newDevEnvs = res.debugEnvironments || [];
        cb && cb(newDevEnvs[newDevEnvs.length - 1] || {});
        setDefaultEnvList(newDevEnvs);
      } else {
        alert(errorText || _l('更新失败'), 2);
      }
    });
  };

  const onFooterClick = () => {
    if (pluginType === PLUGIN_TYPE.WORKFLOW) {
      window.open(`/workflowplugin/${pluginId}`);
    } else {
      if (configType === pluginConfigType.create) {
        onCreate();
      } else {
        if (
          !!detailData.configuration.replace(/\s/g, '') &&
          detailData.configuration.replace(/\s/g, '') !== '{}' &&
          _.isEmpty(safeParse(detailData.configuration))
        ) {
          alert(_l('配置格式不正确,请输入JSON格式'), 3);
          return;
        }
        const updateObj = { configuration: safeParse(detailData.configuration) };
        onUpdate(
          updateObj,
          () => {
            setDefaultConfiguration({ configuration: safeParse(detailData.configuration) });
            alert(_l('更新配置成功'));
          },
          _l('更新配置失败'),
        );
      }
    }
  };

  const getTabList = () => {
    const list = viewDetailTabList[pluginType];
    const tabs =
      belongType === 'myPlugin'
        ? list[belongType].filter(
            item =>
              !(pluginType === PLUGIN_TYPE.VIEW && configType === pluginConfigType.create && item.value !== 'debugEnv'),
          )
        : list[belongType].filter(
            item =>
              hasManagePluginAuth ||
              md.global.Account.accountId === _.get(detailData, 'creator.accountId') ||
              item.value === 'publishHistory',
          );
    return tabs;
  };

  const renderIcon = () => {
    const content = (
      <div
        className="iconWrapper"
        style={{ backgroundColor: detailData.iconColor ? getRgbaByColor(detailData.iconColor, '0.08') : '#fff' }}
      >
        {detailData.iconUrl ? (
          <SvgIcon url={detailData.iconUrl} fill={detailData.iconColor} size={32} />
        ) : (
          <Icon icon="extension" className="Font32" />
        )}
      </div>
    );
    return hasManagePluginAuth ||
      md.global.Account.accountId === _.get(detailData, 'creator.accountId') ||
      belongType === 'myPlugin' ? (
      <Trigger
        action={['click']}
        popup={
          <SelectIcon
            hideInput
            iconColor={detailData.iconColor}
            icon={detailData.icon}
            projectId={projectId}
            onModify={({ iconColor, icon, iconUrl }) => {
              let updateObj = {};
              if (iconColor) {
                updateObj = { iconColor };
              } else {
                updateObj = { icon, iconUrl };
              }
              if (configType !== pluginConfigType.create) {
                onUpdate(iconColor ? { iconColor } : { icon }, () => {
                  setDetailData({ ...detailData, ...updateObj });
                });
              } else {
                setDetailData({ ...detailData, ...updateObj });
              }
            }}
          />
        }
        zIndex={1000}
        popupAlign={{
          points: ['tl', 'bl'],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
      >
        {content}
      </Trigger>
    ) : (
      content
    );
  };

  const renderTabList = () => {
    return (
      <div className="tabList">
        <ul>
          {getTabList().map((item, index) => {
            return (
              <li
                key={index}
                className={cx({ isCur: currentTab === item.value })}
                onClick={() => setCurrentTab(item.value)}
              >
                {item.text}
                {!!detailData.usageTotalCount && item.value === pluginConfigType.usageDetail && (
                  <span className="mLeft4">{detailData.usageTotalCount}</span>
                )}
              </li>
            );
          })}
        </ul>
        {currentTab === pluginConfigType.usageDetail &&
          (!!detailList.usageList.length || !!fetchListState.keywords) && (
            <div className="searchWrapper">
              <Search
                placeholder={pluginType === PLUGIN_TYPE.VIEW ? _l('应用名称') : _l('应用 / 工作流')}
                handleChange={_.debounce(value => {
                  fetchList(1, value);
                }, 500)}
              />
            </div>
          )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case pluginConfigType.debugEnv:
        return (
          <DebugEnv
            {...props}
            appList={appList}
            onGetAppList={onGetAppList}
            debugEnvList={detailData.debugEnvironments}
            onChangeDebugEnvList={debugEnvironments => setDetailData({ ...detailData, debugEnvironments })}
            onUpdate={onUpdate}
          />
        );
      case pluginConfigType.paramSetting:
        return (
          <div className="mTop12">
            <p className="Gray_75 mBottom8">{_l('配置插件运行时所需要的环境参数，采用JSON格式')}</p>
            <TagTextarea
              getRef={ref => (textareaRef.current = ref)}
              defaultValue={
                !_.isEmpty(defaultConfiguration.configuration) ? JSON.stringify(defaultConfiguration.configuration) : ''
              }
              codeMirrorMode="javascript"
              onChange={(_, value) => setDetailData({ ...detailData, configuration: value })}
            />
          </div>
        );
      case pluginConfigType.commit:
        return (
          <DetailList
            {...props}
            configType={currentTab}
            list={detailList.commitList}
            latestVersion={detailData.latestVersion}
            debugConfiguration={defaultConfiguration.debugConfiguration}
            onRefreshList={() => fetchList(1)}
            onRefreshDetail={() => fetchDetail()}
            onDelete={id => setDetailList({ commitList: detailList.commitList.filter(item => id !== item.id) })}
          />
        );
      case pluginConfigType.publishHistory:
        return (
          <DetailList
            {...props}
            configType={currentTab}
            list={detailList.publishHistoryList}
            currentVersion={detailData.currentVersion}
            onRefreshList={() => fetchList(1)}
            onRefreshDetail={() => fetchDetail()}
            hasOperateAuth={
              hasManagePluginAuth || md.global.Account.accountId === _.get(detailData, 'creator.accountId')
            }
            onDelete={id =>
              setDetailList({ publishHistoryList: detailList.publishHistoryList.filter(item => id !== item.id) })
            }
            onExportSuccess={() => setCurrentTab(pluginConfigType.exportHistory)}
            publishType={detailData.source}
          />
        );
      case pluginConfigType.usageDetail:
        return (
          <DetailList
            {...props}
            configType={currentTab}
            list={detailList.usageList}
            onRefreshList={() => fetchList(1)}
            keywords={fetchListState.keywords}
          />
        );
      case pluginConfigType.exportHistory:
        return (
          <DetailList
            {...props}
            configType={currentTab}
            list={detailList.exportHistoryList}
            onRefreshList={() => fetchList(1)}
            onDelete={id =>
              setDetailList({ exportHistoryList: detailList.exportHistoryList.filter(item => id !== item.id) })
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <ConfigWrapper>
      <Icon icon="close" className="closeIcon" onClick={onClose} />

      {detailLoading ? (
        <LoadDiv className="mTop10" />
      ) : (
        <ScrollView className="flex" onScrollEnd={onScrollEnd}>
          <div className={cx('configHeader')}>
            <div className="flexRow alignItemsCenter">
              {renderIcon()}
              <div className="flex">
                {!editingName ? (
                  <div className="flexRow alignItemsCenter">
                    <span className="Font20 bold Block LineHeight36">{detailData.name || _l('未命名插件')}</span>
                    {(hasManagePluginAuth ||
                      md.global.Account.accountId === _.get(detailData, 'creator.accountId') ||
                      belongType === 'myPlugin') && (
                      <Icon
                        icon="edit"
                        className="Font16 mLeft5 Gray_9d Hand Hover_21"
                        onClick={() => {
                          setEditingName(true);
                          setTimeout(() => {
                            inputRef.current && inputRef.current.focus();
                          }, 300);
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <React.Fragment>
                    <Input
                      manualRef={inputRef}
                      className="nameInput"
                      value={detailData.name}
                      placeholder={_l('添加插件名称')}
                      maxLength={20}
                      onChange={name => setDetailData({ ...detailData, name })}
                      onBlur={e => {
                        const updateObj = { name: !e.target.value.trim() ? _l('未命名插件') : e.target.value.trim() };
                        if (configType !== pluginConfigType.create) {
                          onUpdate(updateObj, () => {
                            setDetailData({ ...detailData, ...updateObj });
                            setEditingName(false);
                          });
                        } else {
                          setDetailData({ ...detailData, ...updateObj });
                          setEditingName(false);
                        }
                      }}
                    />
                  </React.Fragment>
                )}
              </div>
            </div>

            {configType !== pluginConfigType.create && (
              <div className="validVersionCard">
                {detailData.currentVersion.versionCode ? (
                  <div className="flex flexRow alignItemsCenter">
                    <span className="Font24 bold">{detailData.currentVersion.versionCode}</span>
                    <span className="Gray_75 mLeft12 flexColumn minWidth0">
                      <div>
                        {source === 0
                          ? `${detailData.creator.fullname} ${_l('发布于')} ${moment(
                              detailData.currentVersion.releaseTime,
                            ).format('YYYY年MM月DD日 HH:mm')}`
                          : getPluginOperateText(detailData.recentOperation)}
                      </div>
                      <div className="ellipsis">{detailData.currentVersion.versionDescription}</div>
                    </span>
                  </div>
                ) : (
                  <div className="flex Font24 bold Gray_9e">{_l('未发布版本')}</div>
                )}

                {(hasManagePluginAuth ||
                  md.global.Account.accountId === _.get(detailData, 'creator.accountId') ||
                  belongType === 'myPlugin') &&
                  (detailData.source !== 3 || md.global.Config.IsLocal) && (
                    <div
                      className="versionPublishBtn"
                      onClick={() =>
                        [2, 3].includes(detailData.source)
                          ? ImportPlugin({
                              projectId,
                              pluginType,
                              pluginId,
                              onImportCreateSuccess: () => {
                                fetchDetail();
                                fetchList(1);
                              },
                            })
                          : setPublishVisible(true)
                      }
                    >
                      <Icon icon="publish" />
                      <span>{[2, 3].includes(detailData.source) ? _l('导入升级') : _l('发布新版本')}</span>
                    </div>
                  )}

                {publishVisible && (
                  <PublishVersion
                    pluginType={pluginType}
                    latestVersion={detailData.latestVersion}
                    pluginId={pluginId}
                    source={source}
                    debugConfiguration={defaultConfiguration.debugConfiguration}
                    onClose={() => setPublishVisible(false)}
                    onRefreshDetail={() => fetchDetail()}
                    onRefreshPublishList={() => currentTab === pluginConfigType.publishHistory && fetchList(1)}
                  />
                )}
              </div>
            )}
          </div>
          {renderTabList()}

          <div className="configContent">
            {fetchListState.loading && fetchListState.pageIndex === 1 ? (
              <LoadDiv className="mTop10" />
            ) : (
              renderTabContent()
            )}
          </div>
        </ScrollView>
      )}

      {(currentTab === pluginConfigType.paramSetting ||
        (currentTab === pluginConfigType.debugEnv && configType === pluginConfigType.create) ||
        (pluginType === PLUGIN_TYPE.WORKFLOW && belongType === 'myPlugin' && !fetchListState.loading)) && (
        <div className="configFooter">
          <div className="flexRow">
            <div className="footerBtn save" onClick={onFooterClick}>
              {pluginType === PLUGIN_TYPE.WORKFLOW
                ? _l('编辑')
                : configType === pluginConfigType.create
                  ? _l('创建插件')
                  : _l('更新配置')}
            </div>
            {currentTab === pluginConfigType.paramSetting && (
              <div
                className="footerBtn recoverDefault mLeft10"
                onClick={() => {
                  textareaRef.current.setValue(
                    !_.isEmpty(defaultConfiguration.configuration)
                      ? JSON.stringify(defaultConfiguration.configuration)
                      : '',
                  );
                  onUpdate(
                    { configuration: defaultConfiguration.configuration },
                    () => alert(_l('恢复默认成功')),
                    _l('恢复默认失败'),
                  );
                }}
              >
                {_l('恢复默认')}
              </div>
            )}
          </div>
        </div>
      )}
    </ConfigWrapper>
  );
}

export default withClickAway(PluginConfig);
