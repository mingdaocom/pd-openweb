import React, { Fragment, PureComponent } from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';
import Avatar from '../baseComponent/avatar';
import Star from '../baseComponent/star';
import { formatInboxItem } from '../../util';
import { getRequest } from 'src/util';
import settingGroups from 'src/components/group/settingGroup/settingGroups';
import AddressBookDialog from 'src/pages/chat/lib/addressBook';
import ExecDialog from 'src/pages/workflow/components/ExecDialog';
import linkify from 'linkifyjs/html';
import { navigateTo } from 'src/router/navigateTo';
import { formatMsgDate } from 'src/pages/chat/utils';
import xss from 'xss';
import ErrorDialog from 'src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ErrorDialog';
import TaskCenterController from 'src/api/taskCenter';
import { addBehaviorLog, dateConvertToUserZone } from 'src/util';
import { SvgIcon, Icon, Tooltip } from 'ming-ui';
import { MSGTYPES } from '../../constants';
import processAjax from 'src/pages/workflow/api/process';
import Emotion from 'src/components/emotion/emotion';

const Dot = styled.span`
  width: 4px;
  height: 4px;
  background: rgb(198, 198, 198);
  margin-left: 6px;
  margin-right: 6px;
  display: inline-block;
  vertical-align: middle;
  border-radius: 50%;
  margin-top: -2px;
`;

const Done = styled.span`
  color: #4caf50;
  display: inline-flex;
  align-items: center;
`;

/**
 * 系统消息
 * @export
 * @param {any} props
 * @returns
 */
export default class SystemMessage extends PureComponent {
  state = {
    showAddressBook: false,
    processInfo: null,
  };

  componentDidMount() {
    const that = this;

    if (this.msg) {
      $(this.msg).on('click', 'a', function (evt) {
        const $this = $(this);
        const href = ($(evt.target).attr('href') || '').toLocaleLowerCase();

        if ($(evt.target).attr('t') === 'taskCmd') {
          var opValue = $this.attr('opvalue');
          var taskId = $this.attr('taskid');
          var opUser = $this.attr('opuser');
          var func = opValue === '1' ? 'agreeApplyJoinTask' : 'refuseJoinTask';

          TaskCenterController[func]({
            taskID: taskId,
            accountID: opUser,
          }).then(function (data) {
            if (data.status) {
              alert(_l('操作成功'));
            } else if (data.error) {
              alert(data.error.msg, 3);
            } else {
              alert(_l('操作失败'), 2);
            }
          });

          return;
        }

        // 群组 和 好友
        if (href.indexOf('addresslist') > -1) {
          evt.preventDefault();
          evt.stopPropagation();
          const { type, gid } = getRequest(href.slice(href.indexOf('?')));

          if (type === 'group' && gid) {
            settingGroups({
              groupId: gid,
              viewType: 1,
            });
          } else {
            that.setState({ showAddressBook: true });
          }

          return;
        }

        // 工作流
        if (href.indexOf('workflowinstance') > -1) {
          evt.preventDefault();
          evt.stopPropagation();
          const ids = href.slice(href.indexOf('workflowinstance') + 17).split('/');
          const div = document.createElement('div');

          const root = createRoot(div);

          root.render(
            <ExecDialog
              id={ids[0]}
              workId={ids[1]}
              onClose={() => {
                root.unmount();
              }}
            />,
          );
          return;
        }

        // 工作表导入
        if (href.indexOf('excelerrorpage') > -1) {
          evt.preventDefault();
          evt.stopPropagation();
          const id = href.slice(href.indexOf('excelerrorpage') + 15).split('/');
          new ErrorDialog({ fileKey: id[0] });
          return;
        }
        // 工作表导入
        if (href.indexOf('excelbatcherrorpage') > -1) {
          evt.preventDefault();
          evt.stopPropagation();
          const id = href.slice(href.indexOf('excelbatcherrorpage') + 15).split('/');
          new ErrorDialog({ fileKey: id[1], isBatch: true });
          return;
        }

        // MAP平台
        if (href.indexOf('map/admin') > -1 || href.indexOf('map/packages') > -1) {
          evt.preventDefault();
          window.open(href);
          return;
        }

        const matchedAppPath = (location.pathname.match(/\/app\/([\w-]{36})/) || '')[0];
        // 应用首页
        if (
          matchedAppPath &&
          /\/app\/[\w-]{36}$/.test(href) &&
          matchedAppPath === (href.match(/\/app\/([\w-]{36})/) || '')[0]
        ) {
          evt.preventDefault();
          evt.stopPropagation();
          navigateTo(new URL(href.startsWith('http') ? href : location.origin + href).pathname + '?from=system');
        }

        // 浏览应用埋点
        if (/\/app\/([\w-]{36})$/.test(href)) {
          evt.preventDefault();
          const appId = (href.match(/[\w-]{36}/) || '')[0];
          addBehaviorLog('app', appId);
          return;
        }
      });
    }
  }

  getWorkflowDetail = () => {
    const { processId = null } = this.props;
    if (!processId || this.state.processInfo) return;

    processAjax
      .getProcessById({ id: processId })
      .then(res => {
        this.setState({
          processInfo: {
            name: res.name,
            deleted: res.deleted,
            id: res.id,
          },
        });
      })
      .catch(error => {
        this.setState({
          processInfo: {
            name: '',
            deleted: true,
            id: '',
          },
        });
      });
  };

  render() {
    const { Message = {}, createTime, inboxType, app = null, processId = null, status, readTime } = this.props;
    const { showAddressBook, processInfo } = this.state;
    const { typeName, isFavorite, inboxId } = formatInboxItem(this.props);
    const parse = Emotion.parse;

    const starProps = {
      isFavorite,
      inboxId,
    };

    delete xss.whiteList.video;
    let content = Message.content || '';
    const xssOptions = {
      whiteList: Object.assign({}, xss.whiteList, {
        a: ['target', 'href', 'title', 'optype', 'opvalue', 'taskid', 'opuser', 't'],
      }),
    };

    if (md.global.Account.isPortal) {
      content = content
        .replace(/<a data-accountid=[^>]*/gi, '<a') //不能点击用户
        .replace(/<a href=\"\/app\/[^>]*/gi, '<a'); //不能点击应用
    }

    // 直接进到外部门户审批列表
    if (content.indexOf('/admin/expansionservice') === -1) {
      content = content.replace(/\/portaluser.*?>/g, `/role/external/pending" >`);
    }

    const hasApp =
      [
        MSGTYPES.WorkSheetMessage,
        MSGTYPES.WorkFlowMessage,
        MSGTYPES.WorkFlowTaskMessage,
        MSGTYPES.WorkFlowUserTaskMessage,
        MSGTYPES.WorkFlowSendTaskMessage,
      ].includes(inboxType) && app;
    const done =
      [MSGTYPES.WorkFlowTaskMessage, MSGTYPES.WorkFlowUserTaskMessage, MSGTYPES.WorkFlowSendTaskMessage].includes(
        inboxType,
      ) && !!status;

    return (
      <div className="messageItem">
        <div className="Left">
          {hasApp && app.status === 1 ? (
            <span
              className="msgIcon"
              style={{
                background: app.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SvgIcon url={app.iconUrl} fill="#fff" size={20} />
            </span>
          ) : (
            <Avatar {...this.props} />
          )}
        </div>
        <div className="itemMain">
          <Star {...starProps} />
          <div className="pRight25">
            <div className="textMsg">
              <span dangerouslySetInnerHTML={{ __html: typeName }} />
              {typeName && <span className="mRight5 Gray_9">:</span>}

              <span
                dangerouslySetInnerHTML={{
                  __html: parse(
                    xss(
                      linkify(
                        xss(
                          content
                            .replace(/[\r\n]/g, '<br />')
                            .replace(/，<a href=.*personal\?type=enterprise.*<\/a>/gi, ''),
                          xssOptions,
                        ),
                      ),
                      xssOptions,
                    ),
                  ).replace(/&/g, '&#38;'),
                }}
                ref={el => {
                  this.msg = el;
                }}
              />
            </div>
            <div className="Gray_9 mTop8">
              {done && (
                <Tooltip text={`${formatMsgDate(dateConvertToUserZone(readTime))} ${_l('完成')}`}>
                  <Done className="Hover_21 Hand">
                    <Icon icon="done" className="mRight6" />
                    <span className="text">{_l('已处理')}</span>
                    <span className="mRight12 mLeft12 Gray_bd">|</span>
                  </Done>
                </Tooltip>
              )}
              {formatMsgDate(dateConvertToUserZone(createTime))}
              {hasApp && (
                <Fragment>
                  <Dot></Dot>
                  {app.status === 2 ? (
                    <span>{app.name || _l('应用已删除')}</span>
                  ) : (
                    <span className="bottomAppNameWrap">
                      <a
                        className="Gray_9 Hover_21 inboxAppName"
                        target="_blank"
                        href={`/app/${app.id}`}
                        onMouseEnter={this.getWorkflowDetail}
                      >
                        {app.name}
                      </a>
                      {processId && processInfo && (
                        <Fragment>
                          <span className="mLeft15 fromProcessId">
                            {_l('来自流程')}：
                            {processInfo.deleted ? (
                              _l('已删除')
                            ) : (
                              <a target="_blank" className="Gray_9 Hover_21" href={`/workflowedit/${processInfo.id}`}>
                                {processInfo.name}
                              </a>
                            )}
                          </span>
                        </Fragment>
                      )}
                    </span>
                  )}
                </Fragment>
              )}
            </div>
          </div>
        </div>

        <AddressBookDialog
          showNewFriends={true}
          showAddressBook={showAddressBook}
          closeDialog={() => this.setState({ showAddressBook: false })}
        />
      </div>
    );
  }
}
