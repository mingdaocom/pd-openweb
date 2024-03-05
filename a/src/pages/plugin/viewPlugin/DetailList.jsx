import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon, Dialog } from 'ming-ui';
import { pluginConfigType } from '../config';
import PublishVersion from './PublishVersion';
import pluginApi from 'src/api/plugin';
import moment from 'moment';
import { navigateToView } from 'src/pages/widgetConfig/util/data';

const ListWrapper = styled.div`
  .headTr,
  .dataItem {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 12px 16px;
    border-bottom: 1px solid #ddd;
    .operate {
      text-align: right;
    }
  }
  .headTr {
    color: #757575;
    font-weight: 500;
  }
  .dataItem {
    &:hover {
      background: #f5f5f5;
      .operateCon {
        display: block;
      }
    }
    .currentTag {
      height: 24px;
      line-height: 24px;
      padding: 0px 8px;
      background: rgba(76, 175, 80, 0.12);
      border-radius: 36px;
      color: #4caf50;
      font-weight: 600;
      font-size: 12px;
      margin: 0px 6px;
      white-space: nowrap;
    }
    img {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin-right: 4px;
    }
    .operateCon {
      display: none;
      .publishBtn {
        color: #2196f3;
      }
      .redBtn {
        color: #f44336;
        margin-left: 12px;
      }
      span {
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }

  .commitList {
    .version,
    .message {
      width: 0;
      padding-right: 8px;
    }
    .message {
      flex: 6;
    }
    .version,
    .commitUser {
      flex: 4;
    }
    .commitTime {
      flex: 3;
    }
    .operate {
      flex: 2;
    }
  }

  .publishHistoryList {
    .version,
    .operate {
      flex: 3;
      width: 0;
    }
    .publisher,
    .pubTime {
      flex: 4;
    }
    .description {
      flex: 6;
      width: 0;
      padding-right: 8px;
    }
  }

  .usageDetailList {
    .appName,
    .worksheetName,
    .viewName,
    .createUser {
      flex: 4;
      width: 0;
      padding-right: 8px;
    }
    .createTime {
      flex: 3;
    }
    .viewCon {
      display: flex;
      align-items: center;
      cursor: pointer;
      &:hover {
        color: #2196f3;
        i {
          color: #2196f3 !important;
        }
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

export default function DetailList(props) {
  const {
    belongType,
    configType,
    list = [],
    currentVersion,
    latestVersion,
    debugConfiguration,
    pluginId,
    onRefreshList,
    onRefreshDetail,
    keywords,
    hasOperateAuth,
    onDelete,
    isAdmin,
  } = props;
  const source = belongType === 'myPlugin' ? 0 : 1;
  const [publishDialog, setPublishDialog] = useState({ visible: false });

  const onDel = (type, id) => {
    Dialog.confirm({
      title: type === pluginConfigType.commit ? _l('删除提交') : _l('删除历史版本'),
      buttonType: 'danger',
      description:
        type === pluginConfigType.commit ? _l('彻底删除提交的代码，不可恢复') : _l('彻底删除历史版本，不可恢复'),
      onOk: () => {
        (type === pluginConfigType.commit
          ? pluginApi.removeCommit({ id })
          : pluginApi.removeRelease({ id, source, pluginId })
        ).then(res => {
          if (res) {
            alert(_l('删除成功'));
            onDelete(id);
          }
        });
      },
    });
  };

  const columns = {
    [pluginConfigType.commit]: [
      {
        dataIndex: 'message',
        title: _l('说明'),
        render: item => (
          <div className="overflow_ellipsis bold" title={item.message}>
            {item.message}
          </div>
        ),
      },
      {
        dataIndex: 'version',
        title: _l('版本'),
        render: item =>
          item.versionTags ? (
            <div className="bold overflow_ellipsis" title={item.versionTags.join(',')}>
              {item.versionTags.join(', ')}
            </div>
          ) : (
            _l('未发布')
          ),
      },
      {
        dataIndex: 'commitUser',
        title: _l('提交人'),
        render: item => (
          <div className="flexRow alignItemsCenter">
            <img src={item.author.avatar} />
            <span>{item.author.fullname}</span>
          </div>
        ),
      },
      {
        dataIndex: 'commitTime',
        title: _l('提交时间'),
        render: item => moment(item.commitTime).format('YYYY-MM-DD HH:mm'),
      },
      {
        dataIndex: 'operate',
        renderTitle: () => (
          <Icon icon="refresh1" className="Font18 pointer Gray_9e Hover_21" onClick={() => onRefreshList()} />
        ),
        render: item => (
          <div className="operateCon">
            <span className="publishBtn" onClick={() => setPublishDialog({ visible: true, commitId: item.id })}>
              {_l('发布')}
            </span>
            <span className="redBtn" onClick={() => onDel(pluginConfigType.commit, item.id)}>
              {_l('删除')}
            </span>
          </div>
        ),
      },
    ],
    [pluginConfigType.publishHistory]: [
      {
        dataIndex: 'version',
        title: _l('版本'),
        render: item => (
          <div className="flexRow alignItemsCenter">
            <span className="bold overflow_ellipsis" title={item.versionCode}>
              {item.versionCode}
            </span>
            {item.versionCode === currentVersion.versionCode && <div className="currentTag">{_l('当前')}</div>}
          </div>
        ),
      },
      {
        dataIndex: 'publisher',
        title: _l('发布人'),
        render: item => (
          <div className="flexRow alignItemsCenter">
            <img src={item.publisher.avatar} />
            <span>{item.publisher.fullname}</span>
          </div>
        ),
      },

      {
        dataIndex: 'pubTime',
        title: _l('发布时间'),
        render: item => <div>{item.pubTime ? createTimeSpan(item.pubTime) : ''}</div>,
      },
      {
        dataIndex: 'description',
        title: _l('说明'),
        render: item => (
          <div className="overflow_ellipsis" title={item.description}>
            {item.description}
          </div>
        ),
      },
      {
        dataIndex: 'operate',
        renderTitle: () => (
          <Icon icon="refresh1" className="Font18 pointer Gray_9e Hover_21" onClick={() => onRefreshList()} />
        ),
        render: item => (
          <div className="operateCon">
            {item.versionCode !== currentVersion.versionCode && (
              <React.Fragment>
                <span
                  className="redBtn"
                  onClick={() => {
                    Dialog.confirm({
                      title: _l(`切换到当前版本 （${item.versionCode}）`),
                      onOk: () => {
                        pluginApi.rollback({ pluginId, releaseId: item.id, source }).then(res => {
                          if (res) {
                            alert(_l('切换版本成功'));
                            onRefreshList();
                            onRefreshDetail();
                          }
                        });
                      },
                    });
                  }}
                >
                  {_l('切换版本')}
                </span>
                {isAdmin && (
                  <span className="redBtn" onClick={() => onDel(pluginConfigType.publishHistory, item.id)}>
                    {_l('删除')}
                  </span>
                )}
              </React.Fragment>
            )}
          </div>
        ),
      },
    ],
    [pluginConfigType.usageDetail]: [
      {
        dataIndex: 'appName',
        title: _l('应用'),
        render: item => (
          <div className="overflow_ellipsis" title={(item.app || {}).appName}>
            {(item.app || {}).appName}
          </div>
        ),
      },
      {
        dataIndex: 'worksheetName',
        title: _l('工作表'),
        render: item => (
          <div className="overflow_ellipsis" title={(item.worksheet || {}).name}>
            {(item.worksheet || {}).name}
          </div>
        ),
      },
      {
        dataIndex: 'viewName',
        title: _l('视图'),
        render: item => {
          return (
            <div className="viewCon" onClick={() => navigateToView(item.worksheet.id, item.view.id)}>
              <div className="overflow_ellipsis" title={(item.view || {}).name}>
                {(item.view || {}).name || '-'}
              </div>
              {(item.view || {}).name && <Icon icon="launch" className="mLeft4 Gray_9e" />}
            </div>
          );
        },
      },
      { dataIndex: 'createUser', title: _l('创建者'), render: item => <div>{(item.creator || {}).fullname}</div> },
      {
        dataIndex: 'createTime',
        title: _l('创建时间'),
        render: item => moment(item.createTime).format('YYYY-MM-DD HH:mm'),
      },
    ],
  };

  const emptyInfo = {
    [pluginConfigType.commit]: { icon: 'code', text: _l('暂无提交的代码') },
    [pluginConfigType.publishHistory]: { icon: 'extension', text: _l('暂无发布历史') },
    [pluginConfigType.usageDetail]: { icon: 'extension', text: _l('暂无使用') },
  };

  return (
    <ListWrapper>
      {list.length ? (
        <div className={`${configType}List`}>
          <div className="headTr">
            {(columns[configType] || [])
              .filter(
                item =>
                  //组织插件下的发布历史列表--普通人或者非插件创建者没有操作项
                  configType !== pluginConfigType.publishHistory ||
                  belongType === 'myPlugin' ||
                  hasOperateAuth ||
                  item.dataIndex !== 'operate',
              )
              .map((item, i) => {
                return (
                  <div key={i} className={`${item.dataIndex}`}>
                    {item.renderTitle ? item.renderTitle() : item.title}
                  </div>
                );
              })}
          </div>
          {list.map((versionItem, i) => {
            return (
              <div key={i} className="dataItem">
                {(columns[configType] || [])
                  .filter(
                    item =>
                      //组织插件下的发布历史列表--普通人或者非插件创建者没有操作项
                      configType !== pluginConfigType.publishHistory ||
                      belongType === 'myPlugin' ||
                      hasOperateAuth ||
                      item.dataIndex !== 'operate',
                  )
                  .map((item, j) => {
                    return (
                      <div key={`${i}-${j}`} className={`${item.dataIndex}`}>
                        {item.render ? item.render(versionItem, i) : versionItem[item.dataIndex]}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      ) : (
        <NoDataWrapper>
          <span className="iconCon InlineBlock TxtCenter ">
            <Icon icon={emptyInfo[configType].icon} className="Font64 TxtMiddle" />
          </span>
          <p className="Gray_9e mTop20 mBottom0">{keywords ? _l('暂无搜索结果') : emptyInfo[configType].text}</p>
        </NoDataWrapper>
      )}

      {publishDialog.visible && (
        <PublishVersion
          latestVersion={latestVersion}
          pluginId={pluginId}
          source={source}
          commitId={publishDialog.commitId}
          debugConfiguration={debugConfiguration}
          onClose={() => setPublishDialog({ visible: false })}
          onRefreshDetail={onRefreshDetail}
        />
      )}
    </ListWrapper>
  );
}
