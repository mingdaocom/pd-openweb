import service from '../../api/service';
import { PICK_TYPE, ROOT_LOG_TYPE, ROOT_PERMISSION_TYPE, PERMISSION_TYPE_NAME } from '../../constant/enum';
import { humanDateTime } from '../../utils';
import './rootLog.less';
import { htmlEncodeReg } from 'src/util';
import { index as mdDialog } from 'src/components/mdDialog/dialog';
import 'src/components/mdBusinessCard/mdBusinessCard';

/*
 * 获取日志中成员名称显示@
 */
function memberLinkHtml(member, logContent) {
  return member
    ? `<a class="memberName" data-account-id="${member.accountId}" ${
        member.accountId ? 'target="_blank" href="/user_' + member.accountId + '"' : ''
      } >@${htmlEncodeReg(member.fullname)}</a>
                ${
                  logContent.exterUserIds && logContent.exterUserIds.indexOf(member.accountId) !== -1
                    ? '(外部用户)'
                    : ''
                }`
    : '';
}

/**
 * 日志描述
 * @param  {[object]} log
 */
function logDesc(log) {
  const childType = log.content.childType === 2 ? '文件 ' : '文件夹 ';
  switch (log.type) {
    case ROOT_LOG_TYPE.CREATE:
      return '创建了' + htmlEncodeReg(log.content.name);
    case ROOT_LOG_TYPE.RECYCLED:
      return '将此共享文件夹放入了回收站';
    case ROOT_LOG_TYPE.DELETED:
      return '彻底删除了此共享文件夹';
    case ROOT_LOG_TYPE.RECOVERY:
      return '还原了此共享文件夹';
    case ROOT_LOG_TYPE.ADDMEMBER:
      return (
        '添加了成员 ' +
        log.content.memberArr.map(
          member => `<a class="memberName" data-account-id="${member.accountId}" ${
            member.accountId ? 'target="_blank" href="/user_' + member.accountId + '"' : ''
          }>@${htmlEncodeReg(member.fullname)}</a>
                ${
                  log.content.exterUserIds && log.content.exterUserIds.indexOf(member.accountId) !== -1
                    ? '(外部用户)'
                    : ''
                }`,
        )
      );
    case ROOT_LOG_TYPE.INVITEMEMBER:
      return (
        '邀请了成员 ' +
        log.content.memberArr.map(
          member => `<a class="memberName" data-account-id="${member.accountId}" ${
            member.accountId ? 'target="_blank" href="/user_' + member.accountId + '"' : ''
          }>@${htmlEncodeReg(member.fullname)}</a>
                ${member.isExterUser && member.isExterUser === 1 ? '(外部用户)' : ''}`,
        )
      );
    case ROOT_LOG_TYPE.DELETEMEMBER:
      return (
        '删除了成员 ' +
        log.content.memberArr.map(
          member =>
            `<a class="memberName" data-account-id="${member.accountId}" ${
              member.accountId ? 'target="_blank" href="/user_' + member.accountId + '"' : ''
            }>@${htmlEncodeReg(member.fullname)}</a>`,
        )
      );
    case ROOT_LOG_TYPE.SHARE: {
      let msg = '';
      log.content.changeMemberArr.forEach(change => {
        if (change.permission === ROOT_PERMISSION_TYPE.OWNER) {
          msg += '将 ' + change.memberArr.map(member => memberLinkHtml(member, log.content));
          msg += ' 设为共享文件夹 ' + log.content.rootName + ' 的拥有者</br>';
        } else {
          msg += '将 ' + change.memberArr.map(member => memberLinkHtml(member, log.content));
          msg += '的权限';
          if (change.originPermission) {
            msg += '从 ' + PERMISSION_TYPE_NAME[change.originPermission] + ' ';
          }
          msg += '调整为 ' + PERMISSION_TYPE_NAME[change.permission];
        }
      });
      return msg;
    }
    case ROOT_LOG_TYPE.RENAME:
      return '重命名了共享文件夹 ' + htmlEncodeReg(log.content.oldName) + ' 为 ' + htmlEncodeReg(log.content.newName);
    case ROOT_LOG_TYPE.EXITMEMBER:
      return '退出了此共享文件夹';
    case ROOT_LOG_TYPE.CHILDADD:
      return '添加了' + childType + htmlEncodeReg(log.content.childName);
    case ROOT_LOG_TYPE.CHILDMOVE:
      return '移动了' + childType + htmlEncodeReg(log.content.childName);
    case ROOT_LOG_TYPE.CHILDRECYCLED:
      return '将' + childType + htmlEncodeReg(log.content.childName) + '放入回收站';
    case ROOT_LOG_TYPE.CHILDDELETED:
      return '彻底删除了' + childType + htmlEncodeReg(log.content.childName);
    case ROOT_LOG_TYPE.CHILDRESTORE:
      return '恢复了' + childType + htmlEncodeReg(log.content.childName);
    default:
      return '';
  }
}

/**
 * 共享文件夹日志
 * @param  {[string]} rootName
 * @param  {[string]} rootId
 */
export function getRootLog(rootName, rootId) {
  const dialog = mdDialog({
    dialogBoxID: 'rootLogs',
    className: 'kcDialogBox',
    width: 410,
    container: {
      header: _l('%0的日志', htmlEncodeReg(rootName)),
      content: '<div class="rootLogLoading ThemeBorderColor3"></div>',
      noText: '',
      yesText: '',
    },
  });

  const srv = rootId === PICK_TYPE.MY ? service.getMyLogDetail() : service.getRootLogDetail({ id: rootId });

  /* 获取日志列表数据*/
  srv.then(result => {
    const logCount = result.logCount;
    const logs = result.logContent;
    let logList = '';
    if (logCount) {
      $.each(logs, i => {
        let logTypeName;
        if (logs[i].type === ROOT_LOG_TYPE.CREATE || logs[i].type === ROOT_LOG_TYPE.CHILDADD) {
          logTypeName = 'icon-plus';
        } else if (
          logs[i].type === ROOT_LOG_TYPE.RECYCLED ||
          logs[i].type === ROOT_LOG_TYPE.DELETED ||
          logs[i].type === ROOT_LOG_TYPE.CHILDRECYCLED ||
          logs[i].type === ROOT_LOG_TYPE.CHILDDELETED
        ) {
          logTypeName = 'icon-task-new-delete';
        } else {
          logTypeName = 'icon-edit';
        }
        logList += `<li>
              <i class="rootLogType ${logTypeName}"></i>
              <div class="rootLogTitle">
                <span class="ThemeColor3 bold handler" data-account-id = "${logs[i].handleUser.accountId}">
                  ${htmlEncodeReg(logs[i].handleUser.fullname)}
                </span>
                ${logDesc(logs[i])}
              </div>
              <div class="rootLogTime">${humanDateTime(logs[i].time)}</div>
            </li>`;
      });
    } else {
      logList = '<li class="rootNoLog"><div class="rootLogTitle">暂无日志</div></li>';
    }
    dialog.content('<ul class="rootLog">' + logList + '</ul>');
    dialog.dialogCenter();

    $('#rootLogs .rootLog').on(
      {
        mouseover() {
          const $this = $(this);

          if ($this.data('bindCard') || $this.data('accountId') == 'undefined' || !$this.data('accountId')) {
            return;
          }
          $this.mdBusinessCard({
            secretType: 1,
          });
          $this.data('bindCard', true);
          $this.mouseenter();
        },
      },
      '.rootLogTitle a.memberName, .rootLogTitle span.handler',
    );
  });
}
