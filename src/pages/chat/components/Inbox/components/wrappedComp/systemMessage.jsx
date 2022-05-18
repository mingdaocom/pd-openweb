import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import 'emotion';
import Avatar from '../baseComponent/avatar';
import Star from '../baseComponent/star';
import { formatInboxItem } from '../../util';
import { getRequest } from 'src/util';
import settingGroups from 'src/components/group/settingGroup/settingGroups';
import AddressBookDialog from 'src/pages/chat/lib/addressBook';
import ExecDialog from 'src/pages/workflow/components/ExecDialog';
import linkify from 'linkifyjs/html';
import xss from 'xss';
import ErrorDialog from 'src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ErrorDialog';

const TaskCenterController = require('src/api/taskCenter');
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
          const { type, gId } = getRequest(href.slice(href.indexOf('?')));

          if (type === 'group' && gId) {
            settingGroups({
              groupId: gId,
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
          const ids = href.slice(href.indexOf('workflowinstance') + 17).split('/');
          const div = document.createElement('div');

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
          const id = href.slice(href.indexOf('excelerrorpage') + 15).split('/');
          new ErrorDialog({ fileKey: id[0] });
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
    let content = (Message.content || '');
    if (md.global.Account.isPortal) {
      content = content.replace(/<a data-accountid=[^>]*/gi, '<a');//外部门户不能点击用户
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
                    xss(linkify((Message.content || '').replace(/[\r\n]/g, '<br />').replace(/，<a href=.*personal\?type=enterprise.*<\/a>/gi, '')), {
                        stripIgnoreTag: true,
                        whiteList: Object.assign({}, xss.whiteList, {
                          a: ['target', 'href', 'title', 'optype', 'opvalue', 'taskid', 'opuser', 't'],
                        }),
                      },
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
