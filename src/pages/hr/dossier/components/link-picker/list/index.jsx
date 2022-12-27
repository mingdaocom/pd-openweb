import PropTypes from 'prop-types';
import cx from 'classnames';
import React, { Component, Fragment } from 'react';
import moment from 'moment';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import TaskDetail from 'src/pages/task/containers/taskDetail/taskDetail';
import calendar from 'src/pages/calendar/modules/calendarDetail';
import { getClassNameByExt } from 'src/util';
import Icon from 'ming-ui/components/Icon';
import './style.less';
import _ from 'lodash';

const Icons = {
  0: '',
  1: 'icon-task-responsible',
  2: 'icon-knowledge_file',
  3: 'icon-task_custom_today',
  7: 'icon-task_custom_today',
  4: 'icon-file',
  5: 'icon-content_paste2',
};

const relationDelArr = [
  '',
  _l('任务已被删除'),
  _l('项目已被删除'),
  _l('日程已被删除'),
  _l('文件已被删除'),
  _l('申请单已被删除'),
  '',
  _l('日程已被删除'),
];

class List extends Component {
  iconOnClick = (event, item, i) => {
    if (this.props.onDelete && item.sid && !this.props.disabled) {
      this.props.onDelete(event, item, i);
    }
  };

  state = {
    linkDialogVisible: false,
    previewItem: {},
  };

  handleLinkClick = (item, e) => {
    const { type } = item;
    /**
     * 只有任务、日程、文件 、他表字段才做弹层预览处理
     */
    if (![1, 3, 4, 7].includes(type)) return;

    // 拦截鼠标左键点击事件
    if (!e.button) {
      e.preventDefault();

      const moduleId = (_.get(item, 'link') || '').split('_')[1] || '';
      // 任务
      if (type === 1) {
        item.taskId = moduleId;
      }
      // 日程
      if ([3, 7].includes(type)) {
        item.calendarId = moduleId;
        item.recurTime = item.sidext || '';
      }
      // 附件
      if (type === 4) {
        const attachmentId = _.last((_.get(item, 'link') || '').split('/')) || '';
        item.attachmentId = attachmentId;
      }

      this.setState({ linkDialogVisible: true, previewItem: item });
    }
  };

  previewAttachment(attachments, index) {
    previewAttachments({
      index: index || 0,
      closeCallback: this.clearPreviewItem,
      attachments: attachments.map(attachment =>
        Object.assign({}, attachment, {
          previewAttachmentType: attachment.refId ? 'KC_ID' : 'COMMON_ID',
        }),
      ),
      showThumbnail: true,
      hideFunctions: ['editFileName'],
    });
  }
  renderLinkLayer = () => {
    const { linkDialogVisible, previewItem } = this.state;
    const { type, recurTime, taskId, attachmentId, calendarId } = previewItem;
    if (linkDialogVisible) {
      if (type === 1) {
        return <TaskDetail visible openType={3} taskId={taskId} closeCallback={this.clearPreviewItem} />;
      }
      if ([3, 7].includes(type)) {
        return calendar({
          calendarId,
          recurTime,
          handleClose: this.clearPreviewItem,
          exitCallback: this.clearPreviewItem,
        });
      }
      if (type === 4) {
        this.previewAttachment([{ previewAttachmentType: 'KC_ID', refId: attachmentId }]);
      }
    }
  };
  clearPreviewItem = () => {
    this.setState({ linkDialogVisible: false, previewItem: {} });
  };
  render() {
    let list = [];
    if (this.props.data && this.props.data.map) {
      list = this.props.data.map((item, i) => {
        let icon = null;
        if (item.name === '') {
          item.name = relationDelArr[item.type];
        }
        if (!this.props.disabled) {
          icon = (
            <Icon
              className="ThemeHoverColor3"
              icon="cancel"
              onClick={event => {
                this.iconOnClick(event, item, i);
              }}
            />
          );
        }

        const iconName = item.type === 4 ? getClassNameByExt(item.ext1) : Icons[item.type];

        const linkName = item.type === 4 ? `${item.name}${item.ext1}` : item.name;

        let textA = null;
        let textB = null;
        if (item.type === 3 || item.type === 5 || item.type === 7) {
          const contentA =
            (item.type === 3 || item.type === 7) && item.ext1
              ? moment(item.ext1).format('YYYY-MM-DD HH:mm')
              : item.ext1;
          textA = (
            <span className="text-a" title={contentA}>
              {contentA}
            </span>
          );

          const contentB = item.ext2 ? moment(item.ext2).format('YYYY-MM-DD HH:mm') : '';
          textB = (
            <span className="text-b" title={contentB}>
              {contentB}
            </span>
          );
        }
        return (
          <li key={i}>
            <div className="type-icon">
              <i className={iconName} style={{ color: item.type === 1 && item.ext1 === '1' ? '#43bd36' : '#9e9e9e' }} />
            </div>
            <a
              className="ThemeHoverColor3"
              onClick={e => this.handleLinkClick(item, e)}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="link-name" title={linkName}>
                {linkName}
              </span>
              {textA}
              {textB}
            </a>
            <div className="user-img">
              <img data-id={item.accountId} src={item.avatar} alt="" />
            </div>
            {icon}
          </li>
        );
      });
    }

    return (
      <Fragment>
        <ul className={cx('mui-linkpicker-list', this.props.className)}>{list}</ul>
        {this.renderLinkLayer()}
      </Fragment>
    );
  }
}

List.propTypes = {
  /**
   * 链接列表
   */
  data: PropTypes.any,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 删除回调
   * @param {event} event - 触发事件
   * @param {string} id - 目标 ID
   */
  onDelete: PropTypes.func,
};

List.defaultProps = {
  data: [],
  disabled: false,
  onDelete: (event, id) => {
    //
  },
};

export default List;
