/* 更多操作下拉项*/
import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import { NODE_OPERATOR_TYPE, NODE_STATUS, NODE_TYPE, NODE_VIEW_TYPE } from '../constant/enum';
import UploadNewVersion from './UploadNewVersion';

const KcAppMenu = props => {
  const { children, item, isCreateUser, isList = false, onOpenChange, open } = props;
  const isFolder = item.type === NODE_TYPE.FOLDER;
  const isUrl = item.viewType === NODE_VIEW_TYPE.LINK;
  const canEdit = item.canEdit;
  const isAdmin = item.isAdmin;
  const canDownload = isAdmin || item.canDownload;
  const items = [
    !isFolder &&
      isUrl &&
      canEdit && {
        key: 'edit',
        icon: <Icon icon="edit" />,
        label: _l('编辑'),
        onClick: () => props.onAddLinkFile(true, item),
      },
    !isList &&
      canDownload && {
        key: 'download',
        icon: <Icon icon="kc-hover-download" />,
        label: _l('下载'),
        onClick: () => props.download(item),
      },
    !isList && { type: 'divider' },
    !isFolder && {
      key: 'star',
      icon: <Icon icon="task-star" />,
      label: item.isStared ? _l('取消标星') : _l('标星'),
      onClick: () => props.onStarNode(item),
    },
    !isList && {
      key: 'share',
      icon: <Icon icon="calendar-task" />,
      label: _l('分享'),
      onClick: () => props.onShareNode(item),
    },
    !isFolder && { type: 'divider' },
    (isAdmin || canEdit) && {
      key: 'rename',
      icon: <Icon icon="edit" />,
      label: _l('重命名'),
      onClick: () => props.updateNodeName(item),
    },
    !isFolder &&
      !isUrl &&
      (isAdmin || canEdit) && {
        key: 'uploadNewVersion',
        className: 'kcUploadNewVersionMenuItem',
        icon: <Icon icon="attachment" />,
        label: (
          <>
            {_l('上传新版本')}
            <UploadNewVersion item={item} callback={props.updateNodeItem} />
          </>
        ),
      },
    canEdit && {
      key: 'move',
      icon: <Icon icon="task-replace" />,
      label: _l('移动到…'),
      onClick: () => props.moveOrCopyClick(NODE_OPERATOR_TYPE.MOVE, isAdmin ? null : item.rootId),
    },
    canDownload && {
      key: 'copy',
      icon: <Icon icon="knowledge-more-folder" />,
      label: _l('复制到…'),
      onClick: () => props.moveOrCopyClick(NODE_OPERATOR_TYPE.COPY),
    },
    (isAdmin || (isCreateUser && canEdit)) && {
      key: 'delete',
      danger: true,
      icon: <Icon icon="trash" />,
      label: _l('删除'),
      onClick: () => props.removeNode(NODE_STATUS.RECYCLED),
    },
    {
      key: 'detail',
      icon: <Icon icon="info" />,
      label: _l('属性'),
      onClick: props.showDetail,
    },
  ].filter(Boolean);

  return (
    <Dropdown
      trigger={['click']}
      open={open}
      placement="bottomRight"
      menu={{ items, style: { minWidth: 180 }, onClick: () => onOpenChange(false) }}
      onOpenChange={onOpenChange}
    >
      <span>{children}</span>
    </Dropdown>
  );
};

KcAppMenu.propTypes = {
  children: PropTypes.node,
  item: PropTypes.object,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  removeNode: PropTypes.func,
  moveOrCopyClick: PropTypes.func,
  updateNodeName: PropTypes.func,
  updateNodeItem: PropTypes.func,
  onShareNode: PropTypes.func,
  onStarNode: PropTypes.func,
  download: PropTypes.func,
  onAddLinkFile: PropTypes.func,
  showDetail: PropTypes.func,
  isCreateUser: PropTypes.bool,
  isList: PropTypes.bool,
};

export default KcAppMenu;
