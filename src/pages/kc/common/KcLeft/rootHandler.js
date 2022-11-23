import DeleteConfirm from 'ming-ui/components/DeleteReconfirm';
import service from '../../api/service';
import createRoot from 'src/components/kc/createRoot/createRoot';

/**
 *创建左侧文件夹
 **/
export function addNewRoot(args, cb) {
  if (typeof args === 'function') {
    cb = args;
  }
  let params = {
    members: [
      {
        fullname: md.global.Account.fullname,
        avatar: md.global.Account.avatar,
        accountId: md.global.Account.accountId,
        permission: 1,
      },
    ],
  };
  if (typeof args === 'object') {
    params = Object.assign({}, params, args);
  }
  createRoot(params)
    .then(root => {
      if (typeof cb === 'function') {
        cb(root);
      }
    })
    .then(() => alert('创建成功'))
    .fail(() => alert('创建失败，请稍后再试', 3));
}

/**
 * 编辑文件夹
 * @param  {[object]} data
 */
export function editRoot(rootId, successCb, progressCb) {
  createRoot({
    isEdit: true,
    id: rootId,
  })
    .then(successCb, () => alert(_l('操作失败, 请稍后重试'), 3), progressCb)
    .fail(() => alert(_l('操作失败, 请稍后重试'), 3));
}

/**
 * 移除共享文件夹
 * @param  {[Object]} item
 * @param  {[Boolean]} isCreator
 * @param  {[Boolean]} isPermanent
 */
export function removeRoot(item, isCreator, isPermanent, cb) {
  isPermanent = true;
  const rootId = item.id;
  let messageTitle;
  if (isCreator) {
    messageTitle = isPermanent ? _l('确认') : '删除';
  } else {
    messageTitle = _l('退出');
  }
  DeleteConfirm({
    title: isCreator ? _l('彻底删除共享文件夹"%0"', item.name) : _l('退出共享文件夹"%0"', item.name),
    description: isCreator
      ? _l(
          '共享文件夹将彻底删除，同时删除共享文件夹下所有文件夹和文件，且无法恢复。请确认您和文件夹中的成员都不再需要共享文件夹中的数据再执行此操作',
        )
      : '',
    data: [{ text: isCreator ? _l('我确定删除此共享文件夹') : _l('我确定退出此共享文件夹'), value: 1 }],
    onOk: () => {
      if (!isCreator) {
        service
          .removeRootMember({ id: rootId, memberID: md.global.Account.accountId })
          .then(data => {
            if (data && data.result) {
              alert(messageTitle + '成功');
              if (typeof cb === 'function') {
                cb(rootId);
              }
            } else {
              return $.Deferred().reject(data.message);
            }
          })
          .fail(err => alert(err || _l('%0失败，请稍后重试', messageTitle), 3));
      } else {
        service
          .removeRoot({ isPermanent, id: rootId })
          .then(data => {
            if (data && data.result) {
              alert(_l('删除成功'));
              if (typeof cb === 'function') {
                cb(rootId);
              }
            } else {
              return $.Deferred().reject(data.message);
            }
          })
          .fail(err => alert(err || _l('删除失败，请稍后重试'), 3));
      }
    },
  });
}
