import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import Link from 'src/router/Link';
import createReactClass from 'create-react-class';
import cx from 'classnames';
import lazyRenderMixin from 'react-lazyrender/mixin';
import { convertImageView, getClassNameByExt } from 'src/util';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withHoverState from 'ming-ui/decorators/withHoverState';
import KcAppMenu from './KcAppMenu';

import { shallowEqual, getUrlBase64Encode, isIE, humanFileSize, humanDateTime } from '../utils';
import { NODE_TYPE, NODE_STATUS, NODE_VIEW_TYPE } from '../constant/enum';
import { getIconNameByExt } from 'src/util';

const HoverState = createDecoratedComponent(withHoverState);

const ONE_PX_IMG =
  'https://dn-mdmedia.qbox.me/fe288386-3d26-4eab-b5d2-51eeab82a7f9/2016/0/28/a5083931-2675-9402-2f70-2ad885ddfebf.png';

export default createReactClass({
  displayName: 'KcAppItem',

  propTypes: {
    path: PropTypes.string,
    baseUrl: PropTypes.string,
    item: PropTypes.object,
    isList: PropTypes.bool,
    isRecycle: PropTypes.bool,
    selected: PropTypes.bool,
    handlePreview: PropTypes.func,
    updateNodeName: PropTypes.func,
    updateNodeItem: PropTypes.func,
    onShareNode: PropTypes.func,
    removeNode: PropTypes.func,
    moveOrCopyClick: PropTypes.func,
    restoreNode: PropTypes.func,
    showDetail: PropTypes.func,
    download: PropTypes.func,
    handleAddLinkFile: PropTypes.func,
    loadListById: PropTypes.func,
    onAddLinkFile: PropTypes.func,
  },

  mixins: [
    lazyRenderMixin({
      distance: 1000,
      shouldComponentUpdate(nextProps, nextState) {
        return (
          !shallowEqual(this.props, nextProps) ||
          !shallowEqual(this.state, nextState) ||
          !shallowEqual(this.props.item, nextProps.item)
        );
      },
      shouldForceUpdate(nextProps, nextState) {
        return this.props.isList !== nextProps.isList;
      },
    }),
  ],

  getInitialState() {
    return {
      clickMoreActionsBtn: false,
      hoverMoreActionsBtn: false,
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedItems.size > 1) {
      this.setState({ clickMoreActionsBtn: false });
    }
  },

  watermarkUrl(extName, isListView = false) {
    extName = extName ? (extName.length > 5 ? extName.substr(0, 4) + '.' : extName.substr(0, 4)) : '';
    // var isListView = isList || isRecycle;
    const markUrl =
      (isListView
        ? `${md.global.FileStoreConfig.pictureHost.replace(/\/$/, '')}/pic/201604/13/gAMpmGuALOIPRIU_944663612.png`
        : `${md.global.FileStoreConfig.pictureHost.replace(/\/$/, '')}/pic/201604/15/XHreFwHIeKNLMOV_114900102.png`) +
      '?watermark/2/text/' +
      getUrlBase64Encode(extName) +
      '/font/5b6u6L2v6ZuF6buR' +
      (isListView ? '/fontsize/600/fill/d2hpdGU=' : '/fontsize/300/fill/I2FjYWNhYw==') +
      '/gravity/Center/dx/0/dy/0%7CimageView2/1' +
      (isListView ? '/w/21/h/24' : '/w/160/h/100') +
      '/q/90';
    return isListView ? markUrl : convertImageView(markUrl, 1, 160, 100);
  },

  render() {
    const {
      className,
      path,
      baseUrl,
      item,
      selected,
      isList,
      isRecycle,
      animation,
      permission,
      removeNode,
      restoreNode,
      onStarNode,
      updateNodeName,
      updateNodeItem,
      showDetail,
      handlePreview,
      handleAddLinkFile,
      onShareNode,
      moveOrCopyClick,
      download,
      loadListById,
      onAddLinkFile,
    } = this.props;
    const isCreateUser = item.owner.accountId === md.global.Account.accountId;
    const isUrl = item.viewType === NODE_VIEW_TYPE.LINK;

    const menu = this.state.clickMoreActionsBtn && (
      <KcAppMenu
        item={item}
        permission={permission}
        onClickAway={() => this.setState({ clickMoreActionsBtn: false })}
        onClickAwayExceptions={[this.moreActions]}
        removeNode={removeNode}
        moveOrCopyClick={moveOrCopyClick}
        updateNodeName={updateNodeName}
        updateNodeItem={updateNodeItem}
        handleAddLinkFile={handleAddLinkFile}
        onShareNode={onShareNode}
        onStarNode={onStarNode}
        download={download}
        isList={isList}
        showDetail={showDetail}
        isCreateUser={isCreateUser}
        onAddLinkFile={onAddLinkFile}
        con="#kclistContainer"
      />
    );

    /* 列表视图*/
    let itemType = getClassNameByExt(item.type !== NODE_TYPE.FOLDER && item.ext);
    const isFolderShared = item.type === NODE_TYPE.FOLDER && item.isOpenShare;
    if (isFolderShared) {
      itemType = 'fileIcon-folderShared';
    }
    if (isList || isRecycle) {
      return (
        <li
          data-id={item.id}
          className={cx('nodeItem noSelect flexRow', { willnotrender: isIE() }, animation, className, {
            active: selected,
          })}
        >
          <span className="noSelectPoint" />
          <span className="selectBox">
            <span className="select boderRadAll_3">
              <i className={cx('icon-ok', { hide: !selected })} />
            </span>
          </span>
          {item.viewType === NODE_VIEW_TYPE.PICTURE && item.previewUrl ? (
            <img
              alt=""
              className={cx('listViewImg', itemType)}
              src={convertImageView(item.previewUrl, 1, 21, 24)}
              onDragStart={event => event.preventDefault()}
              onLoad={event => {
                if (event.target.src != ONE_PX_IMG) {
                  $(event.target).removeClass(itemType);
                }
              }}
              onError={event => $(event.target).attr('src', ONE_PX_IMG)}
            />
          ) : item.type !== NODE_TYPE.FOLDER && getIconNameByExt(item.ext) === 'doc' ? (
            <img
              alt=""
              className={cx('listViewImg', itemType)}
              src={this.watermarkUrl(item.ext, true)}
              onDragStart={event => event.preventDefault()}
              onLoad={event => {
                if (event.target.src != ONE_PX_IMG) {
                  $(event.target).removeClass(itemType);
                }
              }}
              onError={event => {
                $(event.target).attr('src', ONE_PX_IMG);
              }}
            />
          ) : isFolderShared ? (
            <span className="folderSharedItem" data-tip={_l('已开启文件分享')}>
              <span className={cx('type', itemType)} />
            </span>
          ) : (
            <span className={cx('type', itemType)} />
          )}
          {!isUrl ? (
            item.type === NODE_TYPE.FOLDER ? (
              !isRecycle ? (
                <Link
                  className="listName ellipsis"
                  title={item.name}
                  to={encodeURI(`${baseUrl}/${path}/${item.name}`.replace(/#/g, '%23'))}
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  className="listName ellipsis"
                  title={item.name}
                  onClick={() => {
                    loadListById(item.id);
                  }}
                >
                  {item.name}
                </span>
              )
            ) : (
              <span className="listName ellipsis" title={item.name} onClick={evt => handlePreview(item, evt)}>
                {item.name}
              </span>
            )
          ) : (
            <a
              rel="noopener noreferrer"
              href={item.shortLinkUrl}
              target="_blank"
              className="linkFileName listName ellipsis"
            >
              {item.name}
            </a>
          )}
          <span className="itemExt ellipsis" title={item.ext + ' 文件'}>
            {item.ext ? '.' + item.ext : ''}
          </span>
          <input type="text" className="listNameEdit" defaultValue={item.name} />
          <span className="flex" />
          <span className={cx('nodeActionIcons Relative', { hide: !this.state.clickMoreActionsBtn })}>
            <span className={cx('mLeft15', { hide: isRecycle })} data-tip={_l('分享')}>
              <i className={cx('preview icon-share pointer ThemeColor3')} onClick={() => onShareNode(item)} />
            </span>
            {(item.isAdmin || (item.canEdit && item.canDownload) || item.canDownload) && (
              <span data-tip={_l('下载')}>
                <i
                  className={cx('download icon-kc-hover-download pointer ThemeColor3', { hide: isRecycle })}
                  onClick={download}
                />
              </span>
            )}
            <span data-tip={_l('更多操作')}>
              <HoverState
                component="span"
                ref={moreActions => (this.moreActions = moreActions)}
                className={cx(
                  'actions pointer',
                  { ThemeColor3: this.state.hoverMoreActionsBtn || this.state.clickMoreActionsBtn },
                  isRecycle ? 'hide' : 'icon-task-point-more',
                )}
                thisArg={this}
                hoverStateName="hoverMoreActionsBtn"
                onClick={() => this.setState({ clickMoreActionsBtn: true })}
              />
            </span>
            {menu}
            {(item.isAdmin || isCreateUser) && (
              <span data-tip={_l('彻底删除')}>
                <i
                  className={cx('download icon-task-new-delete pointer ThemeColor3', { hide: !isRecycle })}
                  onClick={() => removeNode(NODE_STATUS.DELETED)}
                />
              </span>
            )}
            {(item.isAdmin || isCreateUser) && (
              <span data-tip={_l('还原')}>
                <i className={cx('icon-rotate pointer ThemeColor3', { hide: !isRecycle })} onClick={restoreNode} />
              </span>
            )}
          </span>
          <span className={cx('createName ellipsis cursorDefault', { hide: isRecycle })} title={item.owner.fullname}>
            {item.owner.fullname}
          </span>
          <span
            className="createTime ellipsis cursorDefault"
            title={moment(item.updateTime || item.createTime).format('llll')}
          >
            {humanDateTime(item.updateTime || item.createTime)}&nbsp;
            <span className="grey">
              {item.updater
                ? item.updater.accountId === md.global.Account.accountId
                  ? _l('我')
                  : item.updater.fullname
                : '无修改'}
            </span>
          </span>
          <span className="size" title={item.size ? humanFileSize(item.size, 2) : undefined}>
            {item.size ? humanFileSize(item.size) : '-'}
          </span>
        </li>
      );
    } else {
      /* 缩略视图*/

      return (
        <li
          data-id={item.id}
          className={cx('nodeItem noSelect thumbnailItem Relative', { willnotrender: isIE() }, { active: selected })}
        >
          <div className="thumbnailImg">
            {item.previewUrl || (item.type !== NODE_TYPE.FOLDER && getIconNameByExt(item.ext) === 'doc') ? (
              <img
                alt=""
                className={cx('type antiIcon', itemType)}
                src={
                  item.previewUrl
                    ? convertImageView(item.previewUrl, 1, 160, 100)
                    : false || this.watermarkUrl(item.ext, false)
                }
                onDragStart={event => event.preventDefault()}
                onLoad={event => {
                  if (event.target.src != ONE_PX_IMG) {
                    $(event.target).removeClass(cx('type antiIcon', itemType));
                  }
                }}
                onError={event => $(event.target).attr('src', ONE_PX_IMG)}
              />
            ) : (
              <span className={cx('type antiIcon', itemType)} />
            )}
          </div>
          <div className="thumbnailName ellipsis">
            {!isUrl ? (
              item.type === NODE_TYPE.FOLDER ? (
                !isRecycle ? (
                  <Link
                    className="listName ellipsis"
                    title={item.name}
                    to={encodeURI(`${baseUrl}/${path}/${item.name}`)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span
                    className="listName ellipsis"
                    title={item.name}
                    onClick={() => {
                      loadListById(item.id);
                    }}
                  >
                    {item.name}
                  </span>
                )
              ) : (
                <span className="listName ellipsis" title={item.name} onClick={evt => handlePreview(item, evt)}>
                  {item.name}
                </span>
              )
            ) : (
              <a
                rel="noopener noreferrer"
                href={item.shortLinkUrl}
                target="_blank"
                className="linkFileName listName ellipsis"
              >
                {item.name}
              </a>
            )}
            {item.ext ? '.' + item.ext : ''}
          </div>
          <input type="text" className="listNameEdit" defaultValue={item.name} />
          <span className={cx('nodeActionIcons', { hide: !this.state.clickMoreActionsBtn })}>
            <span data-tip={_l('更多操作')}>
              <HoverState
                ref={moreActions => (this.moreActions = moreActions)}
                component="span"
                className={cx('actions pointer icon-task-point-more', {
                  ThemeColor3: this.state.hoverMoreActionsBtn || this.state.clickMoreActionsBtn,
                })}
                thisArg={this}
                hoverStateName="hoverMoreActionsBtn"
                onClick={() => this.setState({ clickMoreActionsBtn: true })}
              />
            </span>
            {menu}
          </span>
          <div className="selectBox">
            <span className="select hide">
              <i className={cx('icon-ok', { hide: !selected })} />
            </span>
          </div>
        </li>
      );
    }
  },
});
