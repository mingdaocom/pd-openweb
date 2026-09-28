import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import { Dropdown } from 'ming-ui/antd-components';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ajaxRequest from 'src/api/taskCenter';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { getClassNameByExt } from 'src/utils/domain/file/classification';
import RegExpValidator from 'src/utils/domain/validation/expression';
import { downloadFile } from 'src/utils/platform/browser/download';
import config from '../../config/config';
import { attachmentSwitch } from '../../redux/actions';
import { errorMessage, setStateToStorage } from '../../utils/utils';
import TaskDetail from '../taskDetail/taskDetail';
import './attachment.less';

const attachmentSettings = {
  ajaxPost: false,
};

class Attachment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      isMore: true,
      isFirstPostComplete: true,
      dataSource: [],
      openTaskDetail: false,
      taskId: '',
      openOperationId: '',
    };
  }

  componentDidMount() {
    this.getFolderFiles();
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      // 切换项目
      if (this.props.taskConfig.folderId && this.props.taskConfig.folderId !== prevProps.taskConfig.folderId) {
        this.setState(
          {
            pageIndex: 1,
            isFirstPostComplete: true,
            dataSource: [],
          },
          () => {
            this.getFolderFiles();
          },
        );
      }
    }

    const that = this;
    const domHeight = $('#taskAttachmentList .taskAttachmentListBox').height();
    const elementHeight = $('#taskAttachmentList .taskAttachmentListBox ul').height();
    let mRight = 0;
    /* 存在滚动条*/

    if (domHeight < elementHeight) {
      mRight = window.isChrome ? 10 : 17;
    }

    $('#taskAttachmentList .attachmentheader').css('marginRight', mRight); // 滚动加载更多

    $('#taskList')
      .find('.taskAttachmentScroll')
      .off('scroll.attachment')
      .on('scroll.attachment', function () {
        // 项目文件滚动
        if (!attachmentSettings.ajaxPost && that.state.isMore) {
          const $this = $(this);
          const nDivHight = $this.height();
          const nScrollTop = $this.scrollTop();
          const nScrollHight = $this.children()[0].scrollHeight;

          if (nScrollTop + nDivHight + 30 >= nScrollHight) {
            $('#attachmentLoading').removeClass('Hidden');
            const pageIndex = that.state.pageIndex + 1;
            that.setState(
              {
                pageIndex,
              },
              () => {
                that.getFolderFiles();
              },
            );
          }
        }
      });
  }

  componentWillUnmount() {
    $('#taskList').find('.taskAttachmentScroll').off('scroll.attachment');
  }

  /**
   * 获取文件数据
   */
  getFolderFiles() {
    if (attachmentSettings.ajaxPost) {
      return;
    }

    attachmentSettings.ajaxPost = true;
    const { folderId, viewType } = this.props.taskConfig;

    ajaxRequest
      .getFolderFiles({
        folderID: folderId,
        pageIndex: this.state.pageIndex,
        pageSize: config.pageSize,
      })
      .then(source => {
        if (source.status) {
          attachmentSettings.ajaxPost = false;

          if (viewType !== config.folderViewType.attachment) {
            return;
          }

          this.setState({
            dataSource: _.merge(this.state.dataSource, source.data || []),
            isFirstPostComplete: false,
            isMore: source.data ? source.data.length >= config.pageSize : false,
          });

          $('#attachmentLoading').addClass('Hidden');
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 打开任务详情
   */
  openDetail(item, event) {
    if (!item.isFolder) {
      this.setState({ openTaskDetail: true, taskId: item.sourceID });
      event.stopPropagation();
    }
  }

  /**
   * 空状态
   */
  renderNoData() {
    const { isFirstPostComplete } = this.state;

    if (isFirstPostComplete) {
      return <LoadDiv />;
    }

    return (
      <div className="listCreateNew boderRadAll_3 boxShadow5 relative">
        <div className="attachmentNoData Font14">
          <div className="attachmentNoDataBG" />
          <span className="Font17">{_l('暂无项目文件')}</span>
          <br />
          {_l('当前项目及其任务下的所有文件都将汇聚在这里')}
        </div>
        <div className="bgTertiary taskGroundGlass" />
      </div>
    );
  }

  getAttachmentOperationId(item) {
    return item.refId || item.fileID || item.downloadUrl || item.originalFilename;
  }

  handleAttachmentOperation(item, key) {
    this.setState({ openOperationId: '' });

    if (key === 'download') {
      if (item.allowDown === 'ok' && item.downloadUrl) {
        window.open(downloadFile(item.downloadUrl));
      } else {
        alert(_l('您权限不足，无法下载，请联系管理员或文件上传者'), 3);
      }

      return;
    }

    import('src/components/shareAttachment/shareAttachment').then(share => {
      share.default({
        attachmentType: item.refId ? 2 : 1,
        id: item.refId || item.fileID,
        name: item.originalFilename,
        ext: item.ext.replace('.', ''),
        size: item.filesize,
        imgSrc: item.attachmentType === 1 ? item.middlePath + item.middleName.split('?')[0] : '',
      });
    });
  }

  renderAttachmentOperation(item, className) {
    const operationId = this.getAttachmentOperationId(item);

    return (
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        open={this.state.openOperationId === operationId}
        onOpenChange={open => this.setState({ openOperationId: open ? operationId : '' })}
        menu={{
          items: [
            { key: 'share', label: _l('分享') },
            { key: 'download', label: _l('下载') },
          ],
          onClick: ({ key, domEvent }) => {
            domEvent.stopPropagation();
            this.handleAttachmentOperation(item, key);
          },
        }}
      >
        <span
          className={cx(className, { operationActive: this.state.openOperationId === operationId })}
          onClick={event => event.stopPropagation()}
        />
      </Dropdown>
    );
  }

  /**
   * 列表视图
   */
  renderList() {
    const { dataSource } = this.state;

    const renderItem = item => {
      const extClass = getClassNameByExt(item.ext);
      const itemKey = this.getAttachmentOperationId(item);

      return (
        <li className="flexRow" key={itemKey} onClick={this.showDetail.bind(this, item)}>
          <span className="attachmentName flex relative">
            <div className="attachmentNameBox flexRow">
              <span className="attachmentImg">
                {extClass.indexOf('img') >= 0 && !(item.refId && !item.shareUrl) ? (
                  <img src={item.previewUrl.replace('imageView2/1/w/200/h/140', 'imageView2/1/w/32/h/32')} />
                ) : (
                  <span className={cx('attachmentType', item.attachmentType === 5 ? 'fileIcon-folder' : extClass)} />
                )}
              </span>
              <span className="overflow_ellipsis">{item.originalFilename}</span>
              <span className="flex attachmentExt overflow_ellipsis">{item.ext}</span>
            </div>
          </span>
          <span
            className={cx('attachmentTask colorPrimary overflow_ellipsis attachmentTaskName', {
              pointer: !item.isFolder,
            })}
            onClick={this.openDetail.bind(this, item)}
          >
            {item.isFolder ? '-' : item.taskName}
          </span>
          <span className="attachmentDate">{createTimeSpan(item.createTime)}</span>
          <span className="attachmentPerson">
            <img src={item.createUserAvatar} className="taskFolderAvatar pointer" data-accountid={item.accountId} />
            {this.renderAttachmentOperation(item, 'icon-more_horiz attachmentListOperation Font16 colorPrimary')}
          </span>
        </li>
      );
    };

    return (
      <div id="taskAttachmentList" className="taskAttachmentList boderRadAll_3">
        <div className="attachmentheader flexRow">
          <span className="attachmentName flex">{_l('名称')}</span>
          <span className="attachmentTask">{_l('所属任务')}</span>
          <span className="attachmentDate">{_l('上传日期')}</span>
          <span className="attachmentPerson">{_l('上传者')}</span>
        </div>
        <div className="taskAttachmentListBox boxSizing taskAttachmentScroll">
          <ul>{dataSource.map((item, i) => renderItem(item, i))}</ul>
          <div id="attachmentLoading" className="Hidden">
            <LoadDiv />
          </div>
        </div>
      </div>
    );
  }

  /**
   * 缩略图视图
   */
  renderThumbnail() {
    const { dataSource } = this.state;

    const renderItem = item => {
      const extClass = getClassNameByExt(item.ext);
      const itemKey = this.getAttachmentOperationId(item);

      return (
        <li className="boxSizing" onClick={this.showDetail.bind(this, item)} key={itemKey}>
          <div className="taskThumbnailBox boxSizing boderRadAll_3 animatedFast">
            <div className="taskThumbnailImg">
              {(extClass.indexOf('img') >= 0 && !(item.refId && !item.shareUrl)) ||
              (RegExpValidator.isVideo(item.ext) && item.previewUrl) ? (
                <img src={item.previewUrl} />
              ) : (
                <span
                  className={cx('attachmentType antiIcon', item.attachmentType === 5 ? 'fileIcon-folder' : extClass)}
                />
              )}
            </div>
            <div className="taskThumbnailContent boxSizing">
              <img src={item.createUserAvatar} className="taskFolderAvatar pointer" data-accountid={item.accountId} />
              <div className="taskThumbnailTitle">
                <span className="overflow_ellipsis">{item.originalFilename}</span>
                <span className="taskSuffix overflow_ellipsis">{item.ext}</span>
              </div>
              <div
                className={cx('taskThumbnailName overflow_ellipsis colorPrimary attachmentTaskName', {
                  pointer: !item.isFolder,
                })}
                onClick={this.openDetail.bind(this, item)}
              >
                {item.isFolder ? '-' : item.taskName}
              </div>
              {this.renderAttachmentOperation(item, 'icon-more_horiz taskThumbnailOperation Font16 colorPrimary')}
            </div>
          </div>
        </li>
      );
    };

    return (
      <ul id="taskThumbnail" className="taskThumbnail taskAttachmentScroll">
        {dataSource.map((item, i) => renderItem(item, i))}
        <div id="attachmentLoading" className="Hidden">
          <LoadDiv />
        </div>
      </ul>
    );
  }

  /**
   * 切换视图
   */
  switch = () => {
    const { attachmentViewType } = this.props.taskConfig;
    const type = attachmentViewType === 1 ? 2 : 1;
    const taskConfig = Object.assign({}, this.props.taskConfig, { attachmentViewType: type });

    setStateToStorage('', taskConfig);
    this.props.dispatch(attachmentSwitch(type));
  };

  /**
   * 呈现附件详情
   */
  showDetail(item) {
    if (item.attachmentType === 5) {
      window.open(item.shareUrl);
    } else {
      // 知识附件无权限
      if (item.refId && !item.shareUrl) {
        alert(_l('已经删除或无权查看'), 2);
      } else {
        previewAttachments(
          {
            attachments: [item],
            callFrom: 'player',
            sourceID: item.sourceID,
            commentID: item.commentID,
            fromType: item.fromType,
            fileID: item.fileID,
            hideFunctions: ['editFileName'],
          },
          {
            postDetails: null,
            openCallback() {
              $('.btnAttNameEdit,.ctrlHistory,.ctrlNewVersion,.ctrlDelete').remove();
            },
          },
        );
      }
    }
  }

  render() {
    const { attachmentViewType } = this.props.taskConfig;
    const { dataSource, openTaskDetail, taskId } = this.state;

    return (
      <div id="taskList" className="flexColumn attachmentBox">
        <div className="attachmentBar boxSizing">
          <span className="switchView colorPrimary">
            <i
              className={cx('switchViewBtn pointer', attachmentViewType === 1 ? 'icon-home-navigation' : 'icon-list')}
              onClick={this.switch}
            />
          </span>
        </div>
        <div className="flex attachmentMain">
          {dataSource.length
            ? attachmentViewType === 1
              ? this.renderList()
              : this.renderThumbnail()
            : this.renderNoData()}
        </div>
        <TaskDetail
          visible={openTaskDetail}
          taskId={taskId}
          openType={3}
          closeCallback={() => this.setState({ openTaskDetail: false })}
        />
      </div>
    );
  }
}

export default connect(state => state.task)(Attachment);
