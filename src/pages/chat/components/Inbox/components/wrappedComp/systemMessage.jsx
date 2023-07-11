import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import 'src/components/emotion/emotion';
import Avatar from '../baseComponent/avatar';
import Star from '../baseComponent/star';
import { formatInboxItem } from '../../util';
import { getRequest } from 'src/util';
import settingGroups from 'src/components/group/settingGroup/settingGroups';
import AddressBookDialog from 'src/pages/chat/lib/addressBook';
import ExecDialog from 'src/pages/workflow/components/ExecDialog';
import linkify from 'linkifyjs/html';
import { navigateTo } from 'src/router/navigateTo';
import xss from 'xss';
import ErrorDialog from 'src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ErrorDialog';
import TaskCenterController from 'src/api/taskCenter';
import worksheetAjax from 'src/api/worksheet';
import { addBehaviorLog } from 'src/util';

/**
 * 系统消息
 * @export
 * @param {any} props
 * @returns
 */
export default class SystemMessage extends PureComponent {
  state = {
    showAddressBook: false,
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
          }).done(function (data) {
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
          worksheetAjax
            .getWorkItem({
              instanceId: ids[0],
              workId: ids[1],
            })
            .then(res => {
              addBehaviorLog('worksheetRecord', res.worksheetId, { rowId: res.rowId }); // 埋点
            });
          ReactDOM.render(
            <ExecDialog
              id={ids[0]}
              workId={ids[1]}
              onClose={() => {
                ReactDOM.unmountComponentAtNode(div);
              }}
            />,
            div,
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
        if (matchedAppPath && matchedAppPath === (href.match(/\/app\/([\w-]{36})/) || '')[0]) {
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

  render() {
    const { Message = {}, createTime } = this.props;
    const { showAddressBook } = this.state;
    const { typeName, isFavorite, inboxId } = formatInboxItem(this.props);
    const parse = $.fn.emotion.parse;

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
      content = content.replace(/<a data-accountid=[^>]*/gi, '<a'); //外部门户不能点击用户
    }

    return (
      <div className="messageItem">
        <div className="Left">
          <Avatar {...this.props} />
        </div>
        <div className="itemMain">
          <Star {...starProps} />
          <div className="pRight25">
            <div className="textMsg">
              <span dangerouslySetInnerHTML={{ __html: typeName }} />
              <span className="mRight5 Gray_9">:</span>

              <span
                dangerouslySetInnerHTML={{
                  __html: parse(
                    xss(
                      linkify(
                        xss(
                          content
                            .replace(/<a/g, '_$a_$')
                            .replace(/<span/g, '_$span_$')
                            .replace(/<br/g, '_$br_$')
                            .replace(/<\//g, '_$/_$')
                            .replace(/</g, '')
                            .replace(/_\$a_\$/g, '<a')
                            .replace(/_\$span_\$/g, '<span')
                            .replace(/_\$br_\$/g, '<br')
                            .replace(/_\$\/_\$/g, '</')
                            .replace(/[\r\n]/g, '<br />')
                            .replace(/&/g, '&amp;')
                            .replace(/，<a href=.*personal\?type=enterprise.*<\/a>/gi, ''),
                        ),
                        xssOptions,
                      ),
                      xssOptions,
                    ),
                  ),
                }}
                ref={el => {
                  this.msg = el;
                }}
              />
            </div>
            <div className="Gray_9 mTop10">{createTime}</div>
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
