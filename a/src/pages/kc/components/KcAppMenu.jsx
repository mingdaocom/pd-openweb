/* 更多操作下拉项*/
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import Icon from 'ming-ui/components/Icon';
import withClickAway from 'ming-ui/decorators/withClickAway';
import {
  NODE_TYPE,
  NODE_STATUS,
  NODE_OPERATOR_TYPE,
  NODE_VIEW_TYPE,
} from '../constant/enum';

import UploadNewVersion from './UploadNewVersion';

@withClickAway
export default class KcAppMenu extends React.Component {
  static propTypes = {
    item: PropTypes.object,
    removeNode: PropTypes.func,
    moveOrCopyClick: PropTypes.func,
    updateNodeName: PropTypes.func,
    updateNodeItem: PropTypes.func,
    onShareNode: PropTypes.func,
    onStarNode: PropTypes.func,
    download: PropTypes.func,
    permission: PropTypes.number,
    onAddLinkFile: PropTypes.func,
  };
  render() {
    const item = this.props.item;
    const isFolder = item.type === NODE_TYPE.FOLDER;
    const isUrl = item.viewType === NODE_VIEW_TYPE.LINK;
    const isStared = item.isStared;
    const canDownload = item.canDownload;
    const canEdit = item.canEdit;
    const isAdmin = item.isAdmin;
    const isCreateUser = this.props.isCreateUser;
    const isList = this.props.isList || false;
    const isMulti = false;

    return (
      <Menu onClick={this.props.onClickAway} con={this.props.con}>
        {!isFolder &&
          !isMulti &&
          isUrl &&
          canEdit && (
            <MenuItem icon={<Icon icon="edit" />} onClick={evt => this.props.onAddLinkFile(true, item)}>
              编辑
            </MenuItem>
          )}
        {!isList &&
          (isAdmin || (canEdit && item.canDownload) || item.canDownload || isMulti) && (
            <MenuItem icon={<Icon icon="kc-hover-download" />} onClick={() => this.props.download(item)}>
              {_l('下载')}
            </MenuItem>
          )}
        <MenuItem className={cx('menuLine', { hide: isList })} />
        <MenuItem icon={<Icon icon="task-star" />} className={cx({ hide: isFolder || isMulti })} onClick={() => this.props.onStarNode(item)}>
          {isStared ? _l('取消标星') : _l('标星')}
        </MenuItem>
        <MenuItem icon={<Icon icon="calendar-task" />} className={cx({ hide: isMulti || isList })} onClick={() => this.props.onShareNode(item)}>
          {_l('分享')}
        </MenuItem>
        <MenuItem className={cx('menuLine', { hide: isFolder || isMulti })} />
        {(isAdmin || canEdit) && (
          <MenuItem icon={<Icon icon="edit" />} className={cx({ hide: isMulti })} onClick={() => this.props.updateNodeName(item)}>
            {_l('重命名')}
          </MenuItem>
        )}
        {!isUrl &&
          (isAdmin || canEdit) && (
            <MenuItem icon={<Icon icon="attachment" />} className={cx({ hide: isFolder || isMulti })}>
              <span>
                {_l('上传新版本')}
                <UploadNewVersion item={this.props.item} callback={this.props.updateNodeItem} />
              </span>
            </MenuItem>
          )}
        {canEdit && (
          <MenuItem icon={<Icon icon="task-replace" />} onClick={() => this.props.moveOrCopyClick(NODE_OPERATOR_TYPE.MOVE, isAdmin ? null : item.rootId)}>
            {_l('移动到…')}
          </MenuItem>
        )}
        {(isAdmin || (canEdit && item.canDownload) || item.canDownload || isMulti) && (
          <MenuItem icon={<Icon icon="knowledge-more-folder" />} onClick={() => this.props.moveOrCopyClick(NODE_OPERATOR_TYPE.COPY)}>
            {_l('复制到…')}
          </MenuItem>
        )}
        {(isAdmin || (isCreateUser && canEdit) || isMulti) && (
          <MenuItem icon={<Icon icon="task-new-delete" />} onClick={() => this.props.removeNode(NODE_STATUS.RECYCLED)}>
            {_l('删除')}
          </MenuItem>
        )}
        <MenuItem icon={<Icon icon="knowledge-message" />} onClick={this.props.showDetail}>
          {_l('属性')}
        </MenuItem>
      </Menu>
    );
  }
}
