/* 右键菜单项*/
import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Icon from 'ming-ui/components/Icon';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { NODE_OPERATOR_TYPE, NODE_STATUS, NODE_TYPE, NODE_VIEW_TYPE } from '../constant/enum';
import UploadNewVersion from './UploadNewVersion';

@withClickAway
export default class RightMenu extends React.Component {
  static propTypes = {
    item: PropTypes.object,
    kcApp: PropTypes.object,
    permission: PropTypes.number,
    isRecycle: PropTypes.bool,
    isMulti: PropTypes.bool,
    hideRightMenu: PropTypes.func,
    removeNode: PropTypes.func,
    moveOrCopyClick: PropTypes.func,
    restoreNode: PropTypes.func,
    updateNodeName: PropTypes.func,
    onShareNode: PropTypes.func,
    changeFolder: PropTypes.func,
    handlePreview: PropTypes.func,
    download: PropTypes.func,
    onStarNode: PropTypes.func,
    handleAddLinkFile: PropTypes.func,
    onAddLinkFile: PropTypes.func,
  };
  state = {
    clientX: 0,
    clientY: 0,
  };
  componentDidMount() {
    this.resetPosition();
  }
  componentDidUpdate() {
    this.resetPosition();
  }
  resetPosition() {
    const { left, top } = this.props.kcApp.getBoundingClientRect();
    const oldX = this.props.clientX;
    const oldY = this.props.clientY;
    const $rightMenu = $(ReactDOM.findDOMNode(this.rightMenu));
    const winW = $(window).width();
    const winH = $(window).height();
    const menuW = $rightMenu.width();
    const menuH = $rightMenu.height();
    const newX = menuW + oldX > winW ? oldX - menuW : oldX;
    const newY = menuH + oldY > winH ? (oldY - menuH < 55 ? 55 : oldY - menuH) : oldY;
    const newState = { clientX: newX - left + 1, clientY: newY - top };

    if (!_.isEqual(_.pick(newState, ['clientX', 'clientY']), _.pick(this.state, ['clientX', 'clientY']))) {
      this.setState(newState);
    }
  }
  addHideMenu(oldProps) {
    const props = { ...oldProps };
    Object.keys(props).forEach(key => {
      if (typeof props[key] === 'function') {
        const fn = props[key];
        props[key] = (...args) => {
          this.props.hideRightMenu();
          fn(...args);
        };
      }
    });
    return props;
  }
  render() {
    const props = this.addHideMenu(this.props);
    const item = props.item;
    const isRecycle = props.isRecycle;
    const isMulti = props.isMulti;
    const isFolder = item.type === NODE_TYPE.FOLDER;
    const isUrl = item.viewType === NODE_VIEW_TYPE.LINK;
    const isStared = item.isStared;
    const isAdmin = item.isAdmin;
    const canEdit = item.canEdit;
    const isCreateUser = item.owner.accountId === md.global.Account.accountId;
    /* 回收站*/
    if (isRecycle) {
      return (
        <Menu
          className="rightMenu"
          ref={rightMenu => (this.rightMenu = rightMenu)}
          style={{ left: this.state.clientX, top: this.state.clientY }}
          onClick={props.onClickAway}
        >
          <MenuItem icon={<Icon icon="trash" />} onClick={() => props.removeNode(NODE_STATUS.DELETED)}>
            {_l('彻底删除')}
          </MenuItem>
          <MenuItem icon={<Icon icon="rotate" />} onClick={props.restoreNode}>
            {_l('还原')}
          </MenuItem>
        </Menu>
      );
    } else {
      return (
        <Menu
          className="rightMenu"
          ref={rightMenu => (this.rightMenu = rightMenu)}
          style={{ left: this.state.clientX, top: this.state.clientY }}
          onClick={props.onClickAway}
        >
          <MenuItem
            icon={<Icon icon="zoom_in2" />}
            className={cx({ hide: isFolder || isMulti })}
            onClick={evt => props.handlePreview(item, evt)}
          >
            {_l('预览')}
          </MenuItem>
          <MenuItem
            icon={<Icon icon="knowledge-open" />}
            className={cx({ hide: !isFolder || isMulti })}
            onClick={evt => props.changeFolder(item, evt)}
          >
            打开
          </MenuItem>
          {!isFolder && !isMulti && isUrl && canEdit && (
            <MenuItem icon={<Icon icon="edit" />} onClick={() => props.onAddLinkFile(true, item)}>
              编辑
            </MenuItem>
          )}
          {(isAdmin || (canEdit && item.canDownload) || item.canDownload || isMulti) && (
            <MenuItem icon={<Icon icon="kc-hover-download" />} onClick={() => props.download(item)}>
              {_l('下载')}
            </MenuItem>
          )}
          <MenuItem className="menuLine" />
          <MenuItem
            icon={<Icon icon="task-star" />}
            className={cx({ hide: isFolder || isMulti })}
            onClick={() => props.onStarNode(item)}
          >
            {isStared ? _l('取消标星') : _l('标星')}
          </MenuItem>
          <MenuItem
            icon={<Icon icon="calendar-task" />}
            className={cx({ hide: isMulti })}
            onClick={() => props.onShareNode(item)}
          >
            {_l('分享')}
          </MenuItem>
          <MenuItem className={cx('menuLine', { hide: isFolder || isMulti })} />
          {(isAdmin || canEdit) && (
            <MenuItem
              icon={<Icon icon="edit" />}
              className={cx({ hide: isMulti })}
              onClick={() => props.updateNodeName(item)}
            >
              {_l('重命名')}
            </MenuItem>
          )}
          {!isUrl && (isAdmin || canEdit) && (
            <MenuItem icon={<Icon icon="attachment" />} className={cx({ hide: isFolder || isMulti })}>
              <span>
                {_l('上传新版本')}
                <UploadNewVersion item={props.item} callback={props.performUpdateItem} />
              </span>
            </MenuItem>
          )}
          {canEdit && (
            <MenuItem
              icon={<Icon icon="task-replace" />}
              onClick={() => props.moveOrCopyClick(NODE_OPERATOR_TYPE.MOVE, isAdmin ? null : item.rootId)}
            >
              {_l('移动到…')}
            </MenuItem>
          )}
          {(isAdmin || (canEdit && item.canDownload) || item.canDownload || isMulti) && (
            <MenuItem
              icon={<Icon icon="knowledge-more-folder" />}
              onClick={() => props.moveOrCopyClick(NODE_OPERATOR_TYPE.COPY)}
            >
              {_l('复制到…')}
            </MenuItem>
          )}
          {(isAdmin || (isCreateUser && canEdit) || isMulti) && (
            <MenuItem icon={<Icon icon="trash" />} onClick={() => props.removeNode(NODE_STATUS.RECYCLED)}>
              {_l('删除')}
            </MenuItem>
          )}
          <MenuItem icon={<Icon icon="info" />} onClick={props.showDetail}>
            {_l('属性')}
          </MenuItem>
        </Menu>
      );
    }
  }
}
