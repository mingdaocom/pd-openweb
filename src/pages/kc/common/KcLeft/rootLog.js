import React, { Fragment } from 'react';
import service from '../../api/service';
import { PICK_TYPE, ROOT_LOG_TYPE, ROOT_PERMISSION_TYPE, PERMISSION_TYPE_NAME } from '../../constant/enum';
import { humanDateTime } from '../../utils';
import './rootLog.less';
import { htmlEncodeReg } from 'src/util';
import { Dialog, UserCard } from 'ming-ui';

/*
 * 获取日志中成员名称显示@
 */
function memberLinkHtml(member, logContent) {
  return member ? (
    <UserCard sourceId={member.accountId} disabled={!member.accountId}>
      <span>
        <a
          className="memberName"
          href={member.accountId ? `/user_${member.accountId}` : 'javascript:void(0);'}
          target="_blank"
          onClick={e => !member.accountId && e.preventDefault()}
        >
          @{htmlEncodeReg(member.fullname)}
        </a>
        {logContent.exterUserIds && logContent.exterUserIds.indexOf(member.accountId) !== -1 ? '(外部用户)' : ''}
      </span>
    </UserCard>
  ) : (
    ''
  );
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
        <Fragment>
          <span className="mRight5">{_l('添加了成员')}</span>
          {log.content.memberArr.map(member => (
            <UserCard sourceId={member.accountId} disabled={!member.accountId}>
              <span>
                <a
                  className="memberName"
                  href={member.accountId ? `/user_${member.accountId}` : 'javascript:void(0);'}
                  target="_blank"
                  onClick={e => !member.accountId && e.preventDefault()}
                >
                  @{htmlEncodeReg(member.fullname)}
                </a>
                {log.content.exterUserIds && log.content.exterUserIds.indexOf(member.accountId) !== -1
                  ? '(外部用户)'
                  : ''}
              </span>
            </UserCard>
          ))}
        </Fragment>
      );
    case ROOT_LOG_TYPE.INVITEMEMBER:
      return (
        <Fragment>
          <span className="mRight5">{_l('邀请了成员')}</span>
          {log.content.memberArr.map(member => (
            <UserCard sourceId={member.accountId} disabled={!member.accountId}>
              <span>
                <a
                  className="memberName"
                  href={member.accountId ? `/user_${member.accountId}` : 'javascript:void(0);'}
                  target="_blank"
                  onClick={e => !member.accountId && e.preventDefault()}
                >
                  @{htmlEncodeReg(member.fullname)}
                </a>
                {member.isExterUser && member.isExterUser === 1 ? '(外部用户)' : ''}
              </span>
            </UserCard>
          ))}
        </Fragment>
      );
    case ROOT_LOG_TYPE.DELETEMEMBER:
      return (
        <Fragment>
          <span className="mRight5">{_l('删除了成员')}</span>
          {log.content.memberArr.map(member => (
            <UserCard sourceId={member.accountId} disabled={!member.accountId}>
              <a
                className="memberName"
                href={member.accountId ? `/user_${member.accountId}` : 'javascript:void(0);'}
                target="_blank"
                onClick={e => !member.accountId && e.preventDefault()}
              >
                @{htmlEncodeReg(member.fullname)}
              </a>
            </UserCard>
          ))}
        </Fragment>
      );
    case ROOT_LOG_TYPE.SHARE: {
      return (
        <Fragment>
          {log.content.changeMemberArr.map(change => {
            if (change.permission === ROOT_PERMISSION_TYPE.OWNER) {
              return (
                <Fragment>
                  <span className="mRight5">将</span>
                  {change.memberArr.map(member => memberLinkHtml(member, log.content))}
                  <span className="mLeft5">设为共享文件夹</span>
                  <span className="mLeft5 mRight5">{log.content.rootName}</span>的拥有者
                  <br />
                </Fragment>
              );
            } else {
              return (
                <Fragment>
                  <span className="mRight5">将</span>
                  {change.memberArr.map(member => memberLinkHtml(member, log.content))} 的权限
                  {change.originPermission && `从 ${PERMISSION_TYPE_NAME[change.originPermission]} `}
                  {`调整为 ${PERMISSION_TYPE_NAME[change.permission]}`}
                </Fragment>
              );
            }
          })}
        </Fragment>
      );
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
  const srv = rootId === PICK_TYPE.MY ? service.getMyLogDetail() : service.getRootLogDetail({ id: rootId });
  srv.then(result => {
    Dialog.confirm({
      title: _l('%0的日志', htmlEncodeReg(rootName)),
      width: 410,
      noFooter: true,
      dialogBoxID: 'rootLogs',
      className: 'kcDialogBox',
      description: (
        <ul class="rootLog">
          {result.logCount ? (
            <Fragment>
              {result.logContent.map(item => {
                let logTypeName;
                if (item.type === ROOT_LOG_TYPE.CREATE || item.type === ROOT_LOG_TYPE.CHILDADD) {
                  logTypeName = 'icon-plus';
                } else if (
                  item.type === ROOT_LOG_TYPE.RECYCLED ||
                  item.type === ROOT_LOG_TYPE.DELETED ||
                  item.type === ROOT_LOG_TYPE.CHILDRECYCLED ||
                  item.type === ROOT_LOG_TYPE.CHILDDELETED
                ) {
                  logTypeName = 'icon-task-new-delete';
                } else {
                  logTypeName = 'icon-edit';
                }
                return (
                  <li>
                    <i className={`rootLogType ${logTypeName}`}></i>
                    <div className="rootLogTitle">
                      <UserCard sourceId={item.handleUser.accountId}>
                        <span className="ThemeColor3 bold handler">{htmlEncodeReg(item.handleUser.fullname)} </span>
                      </UserCard>
                      {logDesc(item)}
                    </div>
                    <div className="rootLogTime">{humanDateTime(item.time)}</div>
                  </li>
                );
              })}
            </Fragment>
          ) : (
            <Fragment>
              <li className="rootNoLog">
                <div clasName="rootLogTitle">{_l('暂无日志')}</div>
              </li>
            </Fragment>
          )}
        </ul>
      ),
    });
  });
}
