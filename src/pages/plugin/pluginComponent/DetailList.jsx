import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon, Dialog } from 'ming-ui';
import { Tooltip } from 'antd';
import { pluginConfigType, pluginApiConfig, API_EXTENDS, PLUGIN_TYPE, pluginConstants } from '../config';
import PublishVersion from './PublishVersion';
import moment from 'moment';
import { navigateToView } from 'src/pages/widgetConfig/util/data';
import _ from 'lodash';
import ExportPlugin from './ExportPlugin';
import ClipboardButton from 'react-clipboard.js';
import { downloadFile } from 'src/util';

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
      width: 116px;
    }

    .publisher,
    .pubTime {
      flex: 4;
    }
    .description {
      flex: 6;
    }
    .publisher,
    .description {
      width: 0;
      padding-right: 5px;
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
    .linkWrapper {
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

  .exportHistoryList {
    .versionCode,
    .operator,
    .secretKey,
    .exportFile {
      flex: 2;
    }
    .createTime {
      flex: 3;
    }
    .operate {
      flex: 1;
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

const SecretDetailItem = styled.div`
  display: flex;
  margin-bottom: 16px;
  .labelText {
    width: 140px;
    color: #757575;
  }
  .passwordBox {
    width: 180px;
    height: 36px;
    line-height: 36px;
    padding: 0 12px;
    border-radius: 3px;
    background: #f5f5f5;
  }
  .expired {
    color: #f44336;
  }
`;

function SecretKeyDialog(props) {
  const { data, onClose } = props;
  const { password, projects, servers, validityPeriod } = data;
  const nowDate = moment().format('YYYY-MM-DD');
  const expireDays = validityPeriod && moment(validityPeriod).diff(moment(nowDate), 'days');

  return (
    <Dialog visible title={_l('授权密钥')} width={480} onCancel={onClose} showFooter={false}>
      <SecretDetailItem className="alignItemsCenter">
        <div className="labelText">{_l('密码')}</div>
        <div className="flex flexRow alignItemsCenter">
          <div className="passwordBox">{password}</div>
          <ClipboardButton
            className="pointer Gray_9e ThemeHoverColor3 mLeft16"
            component="span"
            data-clipboard-text={password}
            onSuccess={() => alert(_l('复制成功'))}
          >
            <Tooltip title={_l('复制')} placement="bottom">
              <Icon icon="content-copy" />
            </Tooltip>
          </ClipboardButton>
        </div>
      </SecretDetailItem>

      {validityPeriod && (
        <SecretDetailItem>
          <div className="labelText">{_l('授权到期时间')}</div>
          <div className="flex">
            <span>{moment(validityPeriod).format('YYYY-MM-DD 00:00')}</span>
            <span className={`mLeft8 ${expireDays > 0 ? 'Gray_75' : 'expired'}`}>
              {expireDays > 0 ? _l('(剩余') + expireDays + _l('天)') : _l('(已过期)')}
            </span>
          </div>
        </SecretDetailItem>
      )}

      {!!projects.length && (
        <SecretDetailItem>
          <div className="labelText">{_l('授权给指定组织')}</div>
          <div className="flex">
            {projects.map(item => (
              <div>{item}</div>
            ))}
          </div>
        </SecretDetailItem>
      )}

      {!!servers.length && (
        <SecretDetailItem>
          <div className="labelText">{_l('授权给指定服务器')}</div>
          <div className="flex">{servers[0]}</div>
        </SecretDetailItem>
      )}
    </Dialog>
  );
}

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
    projectId,
    onExportSuccess,
    publishType,
    pluginType,
  } = props;
  const source = belongType === 'myPlugin' ? 0 : 1;
  const [publishDialog, setPublishDialog] = useState({ visible: false });
  const [secretKeyDetail, setSecretKeyDetail] = useState({ visible: false });

  const pluginApi = pluginApiConfig[pluginType];
  const isWorkflowPlugin = pluginType === PLUGIN_TYPE.WORKFLOW;

  const onDel = (type, id) => {
    Dialog.confirm({
      title: type === pluginConfigType.commit ? _l('删除提交') : _l('删除历史版本'),
      buttonType: 'danger',
      description:
        type === pluginConfigType.commit ? _l('彻底删除提交的代码，不可恢复') : _l('彻底删除历史版本，不可恢复'),
      onOk: () => {
        (type === pluginConfigType.commit
          ? pluginApi.removeCommit({ id }, API_EXTENDS)
          : pluginApi.removeRelease({ id, source, pluginId }, API_EXTENDS)
        ).then(res => {
          if (res) {
            alert(_l('删除成功'));
            onDelete(id);
          }
        });
      },
    });
  };

  const renderCommonColumn = ({ content, withLink, onClick = () => {} }) => {
    return withLink ? (
      <div className="linkWrapper" onClick={onClick}>
        <div className="overflow_ellipsis" title={content}>
          {content || '-'}
        </div>
        {content && <Icon icon="launch" className="mLeft4 Gray_9e" />}
      </div>
    ) : (
      <div className="overflow_ellipsis" title={content}>
        {content}
      </div>
    );
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
            <span className="ThemeColor" onClick={() => setPublishDialog({ visible: true, commitId: item.id })}>
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
        title: source === 0 ? _l('发布人') : _l('操作人'),
        render: item => (
          <div className="flexRow alignItemsCenter">
            <img src={item.publisher.avatar} />
            <span title={item.publisher.fullname} className="overflow_ellipsis">
              {item.publisher.fullname}
            </span>
            {source === 1 && (
              <span className="mLeft4 mRight5 nowrap">
                {publishType === 3 ? _l('(安装)') : publishType === 2 ? _l('(导入)') : _l('(发布)')}
              </span>
            )}
          </div>
        ),
      },

      {
        dataIndex: 'pubTime',
        title: source === 0 ? _l('发布时间') : _l('操作时间'),
        render: item => <div>{item.pubTime ? createTimeSpan(item.pubTime) : ''}</div>,
      },
      {
        dataIndex: 'description',
        title: _l('版本说明'),
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
            {pluginType === PLUGIN_TYPE.VIEW && (
              <React.Fragment>
                {source === 0 && (
                  <span
                    className="mRight12 ThemeColor"
                    onClick={() => ExportPlugin({ pluginId, releaseId: item.id, source, onExportSuccess, pluginType })}
                  >
                    {_l('导出')}
                  </span>
                )}

                {item.versionCode === currentVersion.versionCode &&
                  item.expireDays >= 0 &&
                  (item.expireDays === 0 ? (
                    <span className="redBtn">{_l('(已过期)')}</span>
                  ) : (
                    <span className="Gray_75">{_l('(剩余') + item.expireDays + _l('天)')}</span>
                  ))}
              </React.Fragment>
            )}

            {item.versionCode !== currentVersion.versionCode &&
              (pluginType === PLUGIN_TYPE.VIEW && item.expireDays === 0 ? (
                <span className="redBtn">{_l('(已过期)')}</span>
              ) : (
                publishType !== 3 && (
                  <span
                    className="ThemeColor"
                    onClick={() => {
                      Dialog.confirm({
                        title: _l(`切换到当前版本 （${item.versionCode}）`),
                        onOk: () => {
                          pluginApi.rollback({ pluginId, releaseId: item.id, source }, API_EXTENDS).then(res => {
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
                    {_l('设为当前版本')}
                  </span>
                )
              ))}
          </div>
        ),
      },
    ],
    [pluginConfigType.usageDetail]: [
      {
        dataIndex: 'appName',
        title: _l('应用'),
        render: item => renderCommonColumn({ content: (item.app || {}).appName }),
      },
      {
        dataIndex: 'worksheetName',
        title: pluginConstants[pluginType].usageColumn2,
        render: item =>
          renderCommonColumn({
            content: (item.worksheet || {}).name,
            withLink: isWorkflowPlugin,
            onClick: () => {
              isWorkflowPlugin && window.open(`/workflowedit/${(item.worksheet || {}).id}`);
            },
          }),
      },
      {
        dataIndex: 'viewName',
        title: pluginConstants[pluginType].usageColumn3,
        render: item =>
          renderCommonColumn({
            content: (item.view || {}).name,
            withLink: !isWorkflowPlugin,
            onClick: () => {
              !isWorkflowPlugin && navigateToView(item.worksheet.id, item.view.id);
            },
          }),
      },
      ,
      { dataIndex: 'createUser', title: _l('创建者'), render: item => <div>{(item.creator || {}).fullname}</div> },
      {
        dataIndex: 'createTime',
        title: _l('创建时间'),
        render: item => moment(item.createTime).format('YYYY-MM-DD HH:mm'),
      },
    ],
    [pluginConfigType.exportHistory]: [
      { dataIndex: 'versionCode', title: _l('版本') },
      {
        dataIndex: 'operator',
        title: _l('导出人'),
        render: item => (
          <div className="flexRow alignItemsCenter">
            <img src={item.operator.avatar} />
            <span>{item.operator.fullname}</span>
          </div>
        ),
      },
      {
        dataIndex: 'createTime',
        title: _l('导出时间'),
        render: item => moment(item.createTime).format('YYYY-MM-DD HH:mm'),
      },
      {
        dataIndex: 'exportFile',
        title: _l('导出文件'),
        render: item =>
          item.url ? (
            <span
              className="ThemeColor pointer ThemeHoverColor2"
              onClick={() =>
                window.open(
                  downloadFile(`${md.global.Config.AjaxApiUrl}Download/Plugin?projectId=${projectId}&id=${item.id}`),
                )
              }
            >
              {_l('下载')}
            </span>
          ) : (
            <span className="Gray_9e">{_l('下载')}</span>
          ),
      },
      {
        dataIndex: 'secretKey',
        title: _l('授权密钥'),
        render: item =>
          item.profile ? (
            <span
              className="ThemeColor pointer ThemeHoverColor2"
              onClick={() => setSecretKeyDetail({ visible: true, data: item.profile })}
            >
              {_l('查看')}
            </span>
          ) : (
            <span className="Gray_9e">{_l('无')}</span>
          ),
      },
      {
        dataIndex: 'operate',
        renderTitle: () => (
          <Icon icon="refresh1" className="Font18 pointer Gray_9e Hover_21" onClick={() => onRefreshList()} />
        ),
      },
    ],
  };

  const emptyInfo = {
    [pluginConfigType.commit]: { icon: 'code', text: _l('暂无提交的代码') },
    [pluginConfigType.publishHistory]: { icon: 'extension', text: _l('暂无发布历史') },
    [pluginConfigType.usageDetail]: { icon: 'extension', text: _l('暂无使用') },
    [pluginConfigType.exportHistory]: { icon: 'extension', text: _l('暂无导出历史') },
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
          pluginType={pluginType}
          latestVersion={latestVersion}
          pluginId={pluginId}
          source={source}
          commitId={publishDialog.commitId}
          debugConfiguration={debugConfiguration}
          onClose={() => setPublishDialog({ visible: false })}
          onRefreshDetail={onRefreshDetail}
        />
      )}

      {secretKeyDetail.visible && (
        <SecretKeyDialog data={secretKeyDetail.data} onClose={() => setSecretKeyDetail({ visible: false })} />
      )}
    </ListWrapper>
  );
}
