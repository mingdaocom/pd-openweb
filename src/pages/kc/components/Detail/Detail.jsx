import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Checkbox, Switch, UserHead, UserName } from 'ming-ui';
import service from '../../api/service';
import { getClassNameByExt } from 'src/utils/common';
import AttachmentsPreview from '../../common/AttachmentsPreview';
import { LOG_TYPE, NODE_TYPE, NODE_VISIBLE_TYPE } from '../../constant/enum';
import { humanDateTime, humanFileSize, shallowEqual } from '../../utils';
import './Detail.css';

class Detail extends React.Component {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  };
  constructor(props) {
    super(props);
    this.state = {
      isAttribute: true,
      readablePosition: '',
      folderCount: 0,
      fileSize: 0,
      totalFolderCount: 0,
      totalFileSize: null,
      shareUrl: '-',
      previewFile: null,
    };
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this.getNodesTotalFolderCountAndFileSize(this.props);

    service
      .getReadablePosition(this.props.data.position)
      .then(readablePosition => this._isMounted && this.setState({ readablePosition }))
      .catch(err => {
        if (err.errorMessage === '无法获取共享文件夹信息，可能已被删除或没有权限') {
          if (this._isMounted) {
            this.setState({ readablePosition: '位置不可见' });
          }
        }
      });
    this.getShareUrl();
    $('.slideDetail').on('click', '.copyLink', function () {
      $(this).select();
    });

    $('.slideDetail').on(
      {
        mouseover() {
          $(this).removeClass('notHover');
        },
        mouseout() {
          $(this).addClass('notHover');
        },
      },
      '#detailLog li',
    );
  }

  componentWillReceiveProps(nextProps) {
    if (!shallowEqual(this.props, nextProps)) {
      this.getNodesTotalFolderCountAndFileSize(nextProps);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState) ||
      !shallowEqual(this.props.data, nextProps.data)
    );
  }

  componentDidUpdate(prevProps) {
    let newState;
    if (!shallowEqual(this.props.data, prevProps.data)) {
      newState = { isAttribute: true, detailLog: null };
    }
    if (this.props.data && this.props.data.position !== prevProps.data.position) {
      _.assign(newState, { readablePosition: '' });
    }
    if (newState) {
      this.setState(newState);
      if (newState.hasOwnProperty('readablePosition')) {
        service
          .getReadablePosition(this.props.data.position)
          .then(readablePosition => this._isMounted && this.setState({ readablePosition }))
          .catch(err => {
            if (err.errorMessage === '无法获取共享文件夹信息，可能已被删除或没有权限') {
              if (this._isMounted) {
                this.setState({ readablePosition: '位置不可见' });
              }
            }
          });
      }
    }
    if (prevProps.data.id !== this.props.data.id) {
      this.getShareUrl();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getShareUrl = () => {
    if (this.props.data.id) {
      service
        .getNodeById(this.props.data.id)
        .then(node => this._isMounted && this.setState({ shareUrl: node.shareUrl }))
        .catch(err => {
          alert('获取分享链接失败');
        });
    }
  };

  /* 生成文件数*/
  getNodesTotalFolderCountAndFileSize = nextProps => {
    if (nextProps.selectAllSize) {
      const { totalFolderCount, totalFileSize } = this.state;
      let { folderCount, fileSize } = this.state;
      // 全选状态下  有不选中的项处理
      if (typeof totalFileSize === 'number' && nextProps.selectAllUnchecked) {
        folderCount =
          totalFolderCount - nextProps.selectAllUnchecked.filter(item => item.type == NODE_TYPE.FOLDER).size;
        fileSize =
          totalFileSize -
          nextProps.selectAllUnchecked
            .filter(item => item.type == NODE_TYPE.FILE)
            .reduce((sum, n) => {
              return sum + n.size;
            }, 0);
        this.setState({ folderCount, fileSize });
        return;
      }
      service
        .getNodesTotalFolderCountAndFileSize({
          rootType: this.props.rootType,
          keywords: $.trim($('#smartSearchFile').val()),
          parentId: this.props.parentId || this.props.rootId,
          status: this.props.status,
        })
        .then(result => {
          if (this._isMounted) {
            this.setState({
              folderCount: result.totalFolderCount,
              fileSize: result.totalFileSize,
              totalFolderCount: result.totalFolderCount,
              totalFileSize: result.totalFileSize,
            });
          }
        })
        .catch(() => alert(_l('操作失败，请稍后重试！'), 2));
    } else {
      let folderCount = 0;
      let fileSize = 0;

      if (!nextProps.data.id && nextProps.data.size > 1) {
        nextProps.data.map(item => (item.type === NODE_TYPE.FOLDER ? folderCount++ : (fileSize += item.size)));

        this.setState({ folderCount, fileSize });
      }
    }
  };

  /**
   * 是否允许下载
   */
  editDownloadable = evt => {
    const isDownloadable = evt.target.checked;
    let item = this.props.data;
    if (isDownloadable !== item.isDownloadable && !this.editDownloadablePromise) {
      this.editDownloadablePromise = service
        .updateNode({ id: item.id, isDownloadable })
        .then(result => {
          if (!result) {
            return Promise.reject();
          }
          alert(_l('修改成功'));
          item = _.assign({}, item, { isDownloadable });
          this.props.performUpdateItem(item);
          this.editDownloadablePromise = '';
        })
        .catch(() => {
          this.editDownloadablePromise = '';
          alert(_l('修改失败'), 2);
        });
    }
  };

  /**
   * 是否允许编辑
   */
  editEditable = evt => {
    const isEditable = evt.target.checked;
    let item = this.props.data;
    if (isEditable !== item.isEditable && !this.editEditablePromise) {
      this.editEditablePromise = service
        .updateNode({ id: item.id, isEditable })
        .then(result => {
          if (!result) {
            return Promise.reject();
          }
          alert(_l('修改成功'));
          item = _.assign({}, item, { isEditable });
          this.props.performUpdateItem(item);
          this.editEditablePromise = '';
        })
        .catch(() => {
          this.editEditablePromise = '';
          alert(_l('修改失败'), 2);
        });
    }
  };

  editNodeAttribute = attrubuteObj => {
    // attrubuteObj = $.extend({}, { isDownloadable , isEditable , visibleType });
    let item = this.props.data;
    if (!_.some(attrubuteObj, key => attrubuteObj[key] === item[key])) {
      return;
    }
    if (!this.editNodePrimise) {
      this.editNodePrimise = service
        .updateNode(_.assign({ id: item.id }, attrubuteObj))
        .then(result => {
          if (!result) {
            return Promise.reject();
          }
          alert(_l('修改成功'));
          item = _.extend({}, item, attrubuteObj);
          this.props.performUpdateItem(item);
          return service.getNodeById(item.id).then(node => {
            this.editNodePrimise = '';
            this.props.performUpdateItem(node);
          });
        })
        .catch(() => {
          this.editNodePrimise = '';
          alert(_l('修改失败'), 2);
        });
    }
  };

  /**
   * 获取node日志详情
   */
  getNodeLogDetail = () => {
    service.getNodeLogDetail({ id: this.props.data.id }).then(result => {
      const detailLog =
        result.logCount > 0
          ? result.logContent.map((log, i) => (
              <li key={i} className="notHover">
                <i
                  className={cx(
                    'detailLogType',
                    log.type === LOG_TYPE.CREATE || log.type === LOG_TYPE.CHILDADD
                      ? 'icon-plus'
                      : log.type === LOG_TYPE.RECYCLED ||
                          log.type === LOG_TYPE.DELETED ||
                          log.type === LOG_TYPE.CHILDRECYCLED ||
                          log.type === LOG_TYPE.CHILDDELETED
                        ? 'icon-task-new-delete'
                        : 'icon-edit',
                  )}
                />
                <div className="detailLogTitle">
                  <UserName
                    user={{ userName: log.handleUser.fullname, accountId: log.handleUser.accountId }}
                    className="bold"
                  />
                  &nbsp;
                  {this.logDesc(log)}
                </div>
                <div className="detailLogTime">{humanDateTime(log.time)}</div>
              </li>
            ))
          : undefined;
      if (this._isMounted) {
        this.setState({ detailLog });
      }
    });
  };

  /**
   * 分享浏览权限
   * @param  {Boolean} isVisibleType
   */
  editVisibleType = visibleType => {
    let item = this.props.data;
    if (visibleType !== item.visibleType) {
      service
        .updateNode({ id: item.id, visibleType })
        .then(result => {
          if (!result) {
            return Promise.reject();
          }
          alert(_l('修改成功'));
          item = _.assign({}, item, { visibleType });
          this.props.performUpdateItem(item);
        })
        .catch(() => alert(_l('修改失败'), 2));
    }
  };

  /**
   * 日志描述
   * @param  {[object]} log
   */
  logDesc = log => {
    const typeName = this.props.data.type === NODE_TYPE.FILE ? _l('文件') : _l('文件夹');
    const childType = log.content.childType === 2 ? _l('文件') : _l('文件夹');
    const nodeName = log.content.name ? ' ' + log.content.name + ' ' : '';
    const childName = log.content.childName ? ' ' + log.content.childName + ' ' : '';
    const targetName = log.content.targetName
      ? ' ' + log.content.targetName + ' '
      : !log.content.targetRootId && !log.content.targetId
        ? ' ' + _l('我的文件根目录') + ' '
        : '';

    /**
     * 链接浏览限制title
     * @param  {[int]} visibleType
     */
    const shareTitleFun = function (visibleType) {
      switch (visibleType) {
        case NODE_VISIBLE_TYPE.CLOSE:
          return _l('关闭该文件的分享');
        case NODE_VISIBLE_TYPE.PROJECT:
          return _l('允许本网成员查看');
        case NODE_VISIBLE_TYPE.MDUSER:
          return _l('允许有系统账号的用户查看');
        case NODE_VISIBLE_TYPE.PUBLIC:
          return _l('任何人都可以查看');
      }
    };

    switch (log.type) {
      case LOG_TYPE.CREATE:
        return (
          <span>
            {_l('创建了 %0', typeName)}
            {this.props.data.type === NODE_TYPE.FILE
              ? this.genPreviewLink(nodeName, 'oldest', this.props.data.id)
              : nodeName}
            {log.content.des ? ' ' + _l('说明：') + log.content.des : ''}
          </span>
        );
      case LOG_TYPE.RECYCLED:
        return _l('将此%0放入回收站', typeName);
      case LOG_TYPE.DELETED:
        return _l('彻底删除了此%0', typeName);
      case LOG_TYPE.RECOVERY:
        return _l('还原了此%0', typeName);
      case LOG_TYPE.RENAME:
        return _l('重命名了%0为%1', typeName + log.content.oldName, log.content.newName);
      case LOG_TYPE.SHARE:
        return _l('修改了%0的链接浏览限制为：%1', typeName + nodeName, shareTitleFun(log.content.visibleType));
      case LOG_TYPE.MOVE:
        return _l('移动此%0到%1', typeName, targetName);
      case LOG_TYPE.COPY:
        return _l('复制%0到%1', typeName + nodeName, targetName);
      case LOG_TYPE.DOWNLOAD:
        if (log.content.isDownloadable) {
          return _l('修改了%0的下载设置为：可下载', typeName + nodeName);
        } else {
          return _l('修改了%0的下载设置为：不可下载', typeName + nodeName);
        }
      case LOG_TYPE.EDIT:
        if (log.content.isEditable) {
          return _l('修改了%0的编辑设置为：可编辑', typeName + nodeName);
        } else {
          return _l('修改了%0的编辑设置为：不可编辑', typeName + nodeName);
        }
      case LOG_TYPE.CHILDADD:
        return _l('添加了%0', childType + childName);
      case LOG_TYPE.CHILDMOVE:
        if (log.content.isInside) {
          return _l('移动%0到%1', childType + childName, targetName);
        } else {
          return _l('移动%0到其他位置', childType + childName);
        }
      case LOG_TYPE.CHILDRECYCLED:
        return _l('将%0放入回收站', childType + childName);
      case LOG_TYPE.CHILDDELETED:
        return _l('彻底删除了%0', childType + childName);
      case LOG_TYPE.CHILDRESTORE:
        return _l('恢复了%0', childType + childName);
      case LOG_TYPE.EDITLINK:
        return _l('对文件%0重新编辑', nodeName);
      case LOG_TYPE.OFFICEEDIT:
        return _l('编辑了文件%0', nodeName);
      case LOG_TYPE.NEWVERSION:
        return (
          <span>
            {_l('上传了新版本')}
            {this.genPreviewLink(' ' + log.content.newName + ' ', log.content.versionId, this.props.data.id)}
            {log.content.versionDes ? ' ' + _l('版本说明：') + log.content.versionDes : ''}
          </span>
        );
    }
  };

  genPreviewLink = (name, versionId, nodeId) => {
    const comp = this;
    let isOldest;
    if (versionId === 'oldest') {
      isOldest = true;
      versionId = undefined;
    }
    return (
      <a
        className="ThemeColor3"
        onClick={() => {
          service
            .getNodeByVersionId({
              id: nodeId,
              versionId,
              isOldest,
            })
            .then(node => {
              if (node) {
                this.preview(node);
              } else {
                alert(_l('该文件不存在或已删除'), 3);
              }
            });
        }}
      >
        {name}
      </a>
    );
  };

  preview = item => {
    this.setState({
      previewFile: item,
    });
    this.props.updateDetailAttachmentsPreviewState(!!item);
  };

  render() {
    const { previewFile } = this.state;
    const selectedOneItem = !!this.props.data.id;
    const data = selectedOneItem ? this.props.data : '';
    const isFolder = data ? data.type === NODE_TYPE.FOLDER : '';

    return selectedOneItem ? (
      <div style={{ height: '100%' }}>
        <div className="previewFileMain">
          {previewFile && (
            <AttachmentsPreview
              options={{
                attachments: [previewFile],
                callFrom: 'kc',
                hideFunctions: ['showKcVersionPanel', 'saveToKnowlege', 'share', 'rename'],
                fromType: 7,
                index: 0,
              }}
              onClose={() => {
                this.preview(undefined);
              }}
            />
          )}
        </div>
        <div className="slideDetail flexColumn">
          <div className="slideDetailTitle boxSizing">
            <i className={cx('attributeType', getClassNameByExt(data.ext ? data.ext : false))} />
            <span className="attributeName ellipsis">
              {data.name}
              {data.ext ? '.' + data.ext : ''}
            </span>
          </div>
          <div className="detailType">
            <ul>
              <li
                className={cx('transitions', { 'ThemeBorderColor3 ThemeColor3': this.state.isAttribute })}
                onClick={() => this.setState({ isAttribute: true })}
              >
                {_l('属性')}
              </li>
              <li
                className={cx('transitions', { 'ThemeBorderColor3 ThemeColor3': !this.state.isAttribute })}
                onClick={() => this.setState({ isAttribute: false }, this.getNodeLogDetail)}
              >
                {_l('日志')}
              </li>
            </ul>
          </div>
          <div className="detailContent flex">
            <div className={cx('detailAttribute boxSizing', { hide: !this.state.isAttribute })}>
              <ul className={cx('attributeList', { removeBorder: isFolder })}>
                <AttributePair
                  name={_l('创建人')}
                  value={
                    <span>
                      <UserHead
                        className="createHeadImg"
                        user={{
                          userHead: data.owner.avatar,
                          accountId: data.owner.accountId,
                        }}
                        size={24}
                      />
                      <UserName
                        user={{
                          userName: data.owner.fullname,
                          accountId: data.owner.accountId,
                          isDelete: data.owner.isDelete,
                        }}
                      />
                    </span>
                  }
                />
                <AttributePair name={_l('类型')} value={data.ext ? data.ext : '文件夹'} />
                <AttributePair
                  name={_l('存储位置')}
                  value={<span title={this.state.readablePosition}>{this.state.readablePosition}</span>}
                />
                <AttributePair name={_l('创建时间')} value={moment(data.createTime).format('YYYY-MM-DD HH:mm:ss')} />
                <AttributePair name={_l('最近修改')} value={moment(data.updateTime).format('YYYY-MM-DD HH:mm:ss')} />
                <AttributePair name={_l('浏览数')} value={data.viewCount} hide={isFolder} />
                <AttributePair name={_l('下载数')} value={data.downloadCount} hide={isFolder} />
                <AttributePair
                  name={_l('分享链接')}
                  value={
                    <input
                      type="text"
                      readOnly
                      className="copyLink boderRadAll_3 boxSizing"
                      value={this.state.shareUrl}
                    />
                  }
                />
              </ul>
              <div>
                <div className={cx('attributeDownload', { hide: isFolder })}>
                  <span className="greyColor">{_l('允许下载')}</span>
                  {data.canChangeDownloadable ? (
                    <div className="switchCon">
                      <Switch
                        checked={data.isDownloadable}
                        onClick={() => {
                          if (data.canChangeDownloadable) {
                            this.editNodeAttribute({ isDownloadable: !data.isDownloadable });
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <span className="right greyColor">{data.isDownloadable ? _l('允许') : _l('不允许')}</span>
                  )}
                </div>
                <div className="attributeDownload attributeEditBtn">
                  <span className="greyColor">{_l('允许编辑')}</span>
                  {data.canChangeEditable ? (
                    <div className="switchCon">
                      <Switch
                        checked={data.isEditable}
                        onClick={() => {
                          if (data.canChangeEditable) {
                            this.editNodeAttribute({ isEditable: !data.isEditable });
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <span className="right greyColor">{data.isEditable ? _l('允许') : _l('不允许')}</span>
                  )}
                </div>
                <div className="detailAuth">
                  <span className="greyColor">{_l('分享链接浏览权限')}</span>
                  <label className="detailAuthM">
                    <input
                      type="radio"
                      name="shareAuth"
                      disabled={!data.canChangeSharable}
                      className={cx({ checked: data.visibleType === NODE_VISIBLE_TYPE.CLOSE })}
                      checked={data.visibleType == NODE_VISIBLE_TYPE.CLOSE}
                      onChange={() => {
                        this.editNodeAttribute({ visibleType: NODE_VISIBLE_TYPE.CLOSE });
                      }}
                    />
                    {_l('关闭该文件的分享')}
                  </label>
                  <label className={cx('detailAuthM', { hide: isFolder })}>
                    <input
                      type="radio"
                      name="shareAuth"
                      disabled={!data.canChangeSharable}
                      className={cx({ checked: data.visibleType === NODE_VISIBLE_TYPE.PROJECT })}
                      checked={data.visibleType == NODE_VISIBLE_TYPE.PROJECT}
                      onChange={() => {
                        this.editNodeAttribute({ visibleType: NODE_VISIBLE_TYPE.PROJECT });
                      }}
                    />
                    {!this.props.rootProjectId ? _l('允许所有联系人查看') : _l('允许本组织的成员查看')}
                  </label>
                  <label className="detailAuthM">
                    <input
                      type="radio"
                      name="shareAuth"
                      disabled={!data.canChangeSharable}
                      className={cx({
                        checked:
                          data.visibleType === NODE_VISIBLE_TYPE.PUBLIC ||
                          data.visibleType === NODE_VISIBLE_TYPE.MDUSER,
                      })}
                      checked={
                        data.visibleType == NODE_VISIBLE_TYPE.PUBLIC || data.visibleType == NODE_VISIBLE_TYPE.MDUSER
                      }
                      onChange={() => {
                        this.editNodeAttribute({ visibleType: NODE_VISIBLE_TYPE.PUBLIC });
                      }}
                    />
                    {_l('允许任何人查看')}
                  </label>
                </div>
              </div>
            </div>

            {!this.state.isAttribute && (
              <ul className={cx('detailLog')} id="detailLog">
                {this.state.detailLog}
              </ul>
            )}
          </div>
          <span className="pinDetailCon">
            <Checkbox
              text={_l('保持展开')}
              size="middle"
              checked={this.props.isPinned}
              onClick={this.props.togglePinned}
            />
          </span>
        </div>
      </div>
    ) : (
      <div className="slideDetail flexColumn">
        <span className="pinDetailCon abs">
          <Checkbox
            text={_l('保持展开')}
            size="middle"
            checked={this.props.isPinned}
            onClick={this.props.togglePinned}
          />
        </span>
        {!this.props.data.size ? (
          <div className="slideDetailNoItem Font14">
            <div className="slideDetailNoItemPic" />
            {_l('选择一个文件或文件夹')}，<br />
            {_l('可查看其属性和日志')}。
          </div>
        ) : (
          <div className="slideDetailItem Font14">
            <div className="slideDetailItemPic" />
            {_l('当前选中了 %0 个文件夹', this.state.folderCount)}，
            {_l('%0个文件', (this.props.selectAllSize || this.props.data.size) - this.state.folderCount)}
            <br />
            <span>{_l('文件共 %0', humanFileSize(this.state.fileSize))}</span>
          </div>
        )}
      </div>
    );
  }
}

class AttributePair extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.any,
    hide: PropTypes.bool,
  };

  render() {
    return (
      <li className={cx('boxSizing ellipsis', { hide: this.props.hide })}>
        <span className="attributeLeft">
          {this.props.name.split('').map((char, i) => (
            <span key={i}>{char}</span>
          ))}
        </span>
        {this.props.value}
      </li>
    );
  }
}

export default Detail;
