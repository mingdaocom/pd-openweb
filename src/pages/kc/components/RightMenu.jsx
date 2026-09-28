/* 右键菜单项*/
import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import { NODE_OPERATOR_TYPE, NODE_STATUS, NODE_TYPE, NODE_VIEW_TYPE } from '../constant/enum';
import UploadNewVersion from './UploadNewVersion';

const getMenuItems = props => {
  const { isMulti, isRecycle, item } = props;

  if (!item) {
    return [];
  }

  const isFolder = item.type === NODE_TYPE.FOLDER;
  const isUrl = item.viewType === NODE_VIEW_TYPE.LINK;
  const isAdmin = item.isAdmin;
  const canEdit = item.canEdit;
  const canDownload = isAdmin || item.canDownload || isMulti;
  const isCreateUser = item.owner.accountId === md.global.Account.accountId;

  return isRecycle
    ? [
        {
          key: 'delete',
          danger: true,
          icon: <Icon icon="trash" />,
          label: _l('彻底删除'),
          onClick: () => props.removeNode(NODE_STATUS.DELETED),
        },
        {
          key: 'restore',
          icon: <Icon icon="rotate" />,
          label: _l('还原'),
          onClick: () => props.restoreNode(),
        },
      ]
    : [
        !isFolder &&
          !isMulti && {
            key: 'preview',
            icon: <Icon icon="zoom_in2" />,
            label: _l('预览'),
            onClick: ({ domEvent }) => props.handlePreview(item, domEvent),
          },
        isFolder &&
          !isMulti && {
            key: 'open',
            icon: <Icon icon="knowledge-open" />,
            label: _l('打开'),
            onClick: ({ domEvent }) => props.changeFolder(item, domEvent),
          },
        !isFolder &&
          !isMulti &&
          isUrl &&
          canEdit && {
            key: 'edit',
            icon: <Icon icon="edit" />,
            label: _l('编辑'),
            onClick: () => props.onAddLinkFile(true, item),
          },
        canDownload && {
          key: 'download',
          icon: <Icon icon="kc-hover-download" />,
          label: _l('下载'),
          onClick: () => props.download(item),
        },
        { type: 'divider' },
        !isFolder &&
          !isMulti && {
            key: 'star',
            icon: <Icon icon="task-star" />,
            label: item.isStared ? _l('取消标星') : _l('标星'),
            onClick: () => props.onStarNode(item),
          },
        !isMulti && {
          key: 'share',
          icon: <Icon icon="calendar-task" />,
          label: _l('分享'),
          onClick: () => props.onShareNode(item),
        },
        !isFolder && !isMulti && { type: 'divider' },
        !isMulti &&
          (isAdmin || canEdit) && {
            key: 'rename',
            icon: <Icon icon="edit" />,
            label: _l('重命名'),
            onClick: () => props.updateNodeName(item),
          },
        !isFolder &&
          !isMulti &&
          !isUrl &&
          (isAdmin || canEdit) && {
            key: 'uploadNewVersion',
            className: 'kcUploadNewVersionMenuItem',
            icon: <Icon icon="attachment" />,
            label: (
              <>
                {_l('上传新版本')}
                <UploadNewVersion item={item} callback={props.performUpdateItem} />
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
        (isAdmin || (isCreateUser && canEdit) || isMulti) && {
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
          onClick: () => props.showDetail(),
        },
      ].filter(Boolean);
};

const RightMenu = props => {
  const { children, hideRightMenu, item } = props;

  return (
    <Dropdown
      trigger={['contextMenu']}
      disabled={!item}
      placement="bottomLeft"
      classNames={{ root: 'rightMenu' }}
      menu={{ items: getMenuItems(props), style: { minWidth: 180 } }}
      onOpenChange={open => !open && hideRightMenu()}
    >
      {children}
    </Dropdown>
  );
};

RightMenu.propTypes = {
  children: PropTypes.element,
  item: PropTypes.object,
  isRecycle: PropTypes.bool,
  isMulti: PropTypes.bool,
  hideRightMenu: PropTypes.func,
  removeNode: PropTypes.func,
  moveOrCopyClick: PropTypes.func,
  restoreNode: PropTypes.func,
  updateNodeName: PropTypes.func,
  performUpdateItem: PropTypes.func,
  onShareNode: PropTypes.func,
  changeFolder: PropTypes.func,
  handlePreview: PropTypes.func,
  download: PropTypes.func,
  onStarNode: PropTypes.func,
  onAddLinkFile: PropTypes.func,
  showDetail: PropTypes.func,
};

export default RightMenu;
