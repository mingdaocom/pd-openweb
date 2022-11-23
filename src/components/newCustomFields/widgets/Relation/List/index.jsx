import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import { FROM } from '../../../tools/config';
import './style.less';
import { getClassNameByExt } from 'src/util';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import task from './taskEntry';
import calendar from 'src/pages/calendar/modules/calendarDetail';

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

export default class List extends Component {
  handleLinkClick = (item, e) => {
    const { from } = this.props;
    const { type } = item;

    // 分享禁止点击
    if (from === FROM.SHARE || from === FROM.WORKFLOW) {
      e.preventDefault();
      return;
    }

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
        task(moduleId);
      }
      // 日程
      if ([3, 7].includes(type)) {
        item.calendarId = moduleId;
        item.recurTime = item.sidext || '';
        calendar({ calendarId: moduleId, recurTime: item.sidext || '' });
      }

      // 附件
      if (type === 4) {
        const attachmentId = _.last((_.get(item, 'link') || '').split('/')) || '';

        previewAttachments({
          index: 0,
          attachments: [{ previewAttachmentType: 'KC_ID', refId: attachmentId }],
          showThumbnail: true,
          hideFunctions: ['editFileName'],
        });
      }
    }
  };

  renderItem = (item, i) => {
    const { disabled, onDelete } = this.props;

    if (item.name === '') {
      item.name = relationDelArr[item.type];
    }

    const iconName = item.type === 4 ? getClassNameByExt(item.ext1) : Icons[item.type];
    const linkName = item.type === 4 ? `${item.name}${item.ext1}` : item.name;

    let textA = null;
    let textB = null;

    if (item.type === 3 || item.type === 5 || item.type === 7) {
      const contentA =
        (item.type === 3 || item.type === 7) && item.ext1 ? moment(item.ext1).format('YYYY-MM-DD HH:mm') : item.ext1;
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

        {!disabled && <Icon icon="minus-square" onClick={() => onDelete(item, i)} />}
      </li>
    );
  };

  render() {
    const { data } = this.props;

    return (
      <Fragment>
        <ul className="customFormRelationList">{data.map((item, i) => this.renderItem(item, i))}</ul>
      </Fragment>
    );
  }
}
