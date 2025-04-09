import React, { Component } from 'react';
import _ from 'lodash';
import cx from 'classnames';
import './index.less';
import ChatController from 'src/api/chat';
import * as utils from '../../../utils/';
import { htmlDecodeReg } from 'src/util';
import createLinksForMessage from 'src/util/createLinksForMessage';
import TaskDetail from 'src/pages/task/containers/taskDetail/taskDetail';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper.jsx';
import postAjax from 'src/api/post';
import PostDetails from 'src/pages/feed/components/post/postDetails/postDetails';
import moment from 'moment';
import { Dialog } from 'ming-ui';
import filterXss from 'xss';

const vertical = {
  WebkitBoxOrient: 'vertical',
};

export default class CardMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardDetails: {},
      openTaskDetail: false,
      openRecorDetail: false,
      taskId: '',
    };
  }
  componentDidMount() {
    const { message } = this.props;
    const { card } = message;
    const id = Number(message.id);
    if (id) {
      const result = utils.cardDisposeName(card);
      if (!result.param) {
        return;
      }
      ChatController.getCardDetails(result.param).then(result => {
        if (card.md === 'task') {
          this.setCardDetails(result.tasks[0]);
        } else if (card.md === 'calendar') {
          const calendar = result.calendars[0];
          if (calendar) {
            let _startTime = '';
            let _endTime = ' ';
            let start = moment(calendar.start).format('YYYY-MM-DD HH:mm');
            let end = moment(calendar.end).format('YYYY-MM-DD HH:mm');
            let startYear = moment(start).format('YYYY-MM-DD');
            let endYear = moment(end).format('YYYY-MM-DD');
            let allDay = moment(startYear).isSame(endYear);
            if (allDay) {
              _startTime = utils.formatMsgDate(start, true).substr(5) + start.substr(11);
              _endTime += end.substr(11);
            } else {
              _startTime = utils.formatMsgDate(start, true).substr(5) + start.substr(11);
              _endTime += utils.formatMsgDate(end, true).substr(5) + end.substr(11);
            }
            calendar._startTime = _startTime;
            calendar._endTime = _endTime;
          }
          this.setCardDetails(calendar);
        } else if (card.md === 'post' || card.md === 'vote') {
          const post = result.posts[0];
          if (post) {
            post.message = createLinksForMessage({
              message: post.message,
              rUserList: post.rUserList,
              rGroupList: post.rGroupList,
              categories: post.categories,
              noLink: true,
              filterFace: true,
            });
            this.setCardDetails(post);
          } else {
            this.setCardDetails({});
          }
        } else if (card.md === 'worksheetrow') {
          const worksheetRows = result.worksheetRows[0];
          this.setCardDetails(worksheetRows);
        }
      });
    }
  }
  setCardDetails(res = {}) {
    const { session } = this.props;
    this.setState({
      cardDetails: res,
    });
    utils.scrollEnd(session.id);
  }
  handleOpenCardMessage(card) {
    const { md, url } = card;
    if (md == '' || md == 'url' || md == 'kcfolder' || md === 'worksheet') {
      window.open(url);
    } else {
      this.showCardMessageDialog(card);
    }
  }
  showCardMessageDialog(card) {
    const { entityid, md } = card;
    switch (md) {
      case 'post':
      case 'vote':
        const removeFn = () => {
          $('.chatFeedDialog').parent().remove();
        };

        postAjax
          .getPostDetail({
            postId: entityid,
          })
          .then(postItem => {
            if (postItem.ban === '1') {
              alert(_l('暂无权限查看该动态或者该动态已经被删除'), 2);
              return;
            }
            if (postItem.success !== '1') {
              postItem = undefined;
            }
            // 格式化返回的数据
            if (!postItem) return postItem;
            const properties = {};
            if (typeof postItem.commentCount !== 'number') {
              properties.commentCount = parseInt(postItem.commentCount, 10);
            }
            if (typeof postItem.likeCount !== 'number') {
              properties.likeCount = parseInt(postItem.likeCount, 10);
            }
            if (!postItem.categories) {
              properties.categories = [];
            }
            if (!postItem.tags) {
              properties.tags = [];
            }
            if (Object.keys(properties).length) {
              postItem = Object.assign({}, postItem, properties);
            }
            Dialog.confirm({
              width: 800,
              dialogClasses: 'chatFeedDialog',
              title: _l('动态详情'),
              noFooter: true,
              children: (
                <PostDetails onRemove={removeFn} postItem={postItem} />
              ),
            })
          });
        break;
      case 'task':
        this.setState({ openTaskDetail: true, taskId: entityid });
        break;
      case 'calendar':
        import('src/pages/calendar/modules/calendarDetail').then(m => {
          const [cardid, time] = entityid.split('_');
          const { cardDetails } = this.state;
          const { recurTime } = cardDetails;
          m.default({
            calendarId: cardid,
            recurTime: time ? moment(recurTime).toISOString() : '',
          });
        });
        break;
      case 'worksheetrow':
        this.setState({
          openRecorDetail: true,
        });
        break;
      default:
        break;
    }
  }
  renderMember(members, textInfo) {
    return (
      <div className="Message-cardItem Message-cardItem-membersItem">
        <span>{`${textInfo}/${_l('成员')}：`}</span>
        <div className="Message-cardItem-members">
          {members.slice(0, 6).map(item => (
            <div key={item.accountId} className="Message-cardItem-charger">
              <img src={item.avatar} />
            </div>
          ))}
          <div className="Message-cardItem-charger Message-cardItem-membersCount">
            <span className="Message-cardItem-membersCountText">{members.length}</span>
          </div>
        </div>
      </div>
    );
  }
  renderDate(deadline, textInfo) {
    return (
      <div className="Message-cardItem">
        <span>{`${textInfo}：`}</span>
        <div>{deadline || _l('未设置到期时间')}</div>
      </div>
    );
  }
  renderTask() {
    const { cardDetails } = this.state;
    return (
      <div>
        {this.renderDate(cardDetails.deadline, _l('到期时间'))}
        {this.renderMember(cardDetails.members, _l('负责人'))}
        {cardDetails.summary ? (
          <div
            style={vertical}
            className="Message-cardSummary Message-cardItem-task"
            dangerouslySetInnerHTML={{ __html: filterXss(htmlDecodeReg(cardDetails.summary)) }}
          />
        ) : (
          undefined
        )}
      </div>
    );
  }
  renderCalendar() {
    const { cardDetails } = this.state;
    return (
      <div>
        {this.renderDate(cardDetails._startTime + cardDetails._endTime, _l('时间'))}
        {this.renderMember(cardDetails.members, _l('发起人'))}
      </div>
    );
  }
  renderPost() {
    const { cardDetails } = this.state;
    return (
      <div style={vertical} className="Message-cardItem Message-cardItem-post">
        {cardDetails.message}
      </div>
    );
  }
  renderCardContent(title) {
    return <div className="Message-cardItem">{title}</div>;
  }
  renderVote() {
    const { cardDetails } = this.state;
    const { Options, Deadline, Num_User, message } = cardDetails;
    const isOverdue = moment(Deadline).valueOf() > moment().valueOf();
    const isMore = Options.length > 3;
    return (
      <div>
        <div className="Message-cardItem-voteTitle">{message}</div>
        <div>
          {Options.slice(0, 3).map((item, index) => (
            <div key={index} className="Message-cardItem-voteOptions-item">
              <span className="Message-cardItem-voteOptions-itemInput" title={item.name}>
                {item.name}
              </span>
            </div>
          ))}
          {isMore ? <div>...</div> : undefined}
          {
            <div className="Message-cardItem">
              <div className={cx('Message-cardItem-voteState', isOverdue ? 'proceed' : 'end')}>
                {isOverdue ? _l('投票进行中') : _l('投票已关闭')}
              </div>
              <div>{_l('%0人参加投票', Num_User)}</div>
            </div>
          }
        </div>
      </div>
    );
  }
  renderWorksheetRow() {
    const { cardDetails } = this.state;
    const { owner } = cardDetails;
    return (
      <div>
        <div className="Message-cardItem Message-cardItem-membersItem">
          <span>{_l('拥有者')}：</span>
          <div className="Message-cardItem-members">
            <div key={owner.accountId} className="Message-cardItem-charger">
              <img src={`${window.config.AttrPath}${owner.avatar}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  renderCardHeader(card) {
    const { md } = card;
    const { cardDetails } = this.state;
    const { commentCount, attachments, entityName } = cardDetails;
    const disposeName = utils.cardDisposeName(card);
    let name = '';
    if (md === 'task' || md === 'calendar' || md === 'worksheet') {
      name = `${disposeName.name}: ${card.title}`;
    } else if (md === 'url' || md === '') {
      name = `[${disposeName.name}] ${card.title}`;
    } else if (md === 'worksheetrow') {
      name = entityName ? `${entityName}: ${card.title}` : card.title;
    } else {
      name = disposeName.name;
    }
    return (
      <div className="Message-cardHeader">
        <div className="Message-cardHeader-title">
          <span>{name}</span>
          {attachments && attachments.length ? <i className="icon-attachment" /> : undefined}
        </div>
        {commentCount ? (
          <div className="Message-cardHeader-icon">
            <i className="icon-ic_textsms_black" />
            <span>{commentCount}</span>
          </div>
        ) : (
          undefined
        )}
      </div>
    );
  }
  renderCardBody(card) {
    const { md, title } = card;
    const { cardDetails } = this.state;
    if (md === 'kcfolder' || md === 'kcfile' || md === 'link') {
      return <div className="Message-cardBody">{this.renderCardContent(title)}</div>;
    }
    if (_.isEmpty(cardDetails)) {
      return undefined;
    } else {
      return (
        <div className="Message-cardBody">
          {md === 'task' && this.renderTask()}
          {md === 'calendar' && this.renderCalendar()}
          {md === 'post' && this.renderPost()}
          {md === 'vote' && this.renderVote()}
          {md === 'worksheetrow' && this.renderWorksheetRow()}
        </div>
      );
    }
  }
  render() {
    const { openTaskDetail, taskId, openRecorDetail } = this.state;
    const { message } = this.props;
    const { card } = message;
    const { extra = {}, entityid } = card;
    return (
      <div className="Message-card" onClick={this.handleOpenCardMessage.bind(this, card)}>
        {this.renderCardHeader(card)}
        {this.renderCardBody(card)}
        <TaskDetail
          visible={openTaskDetail}
          taskId={taskId}
          openType={3}
          closeCallback={() => this.setState({ openTaskDetail: false })}
        />
        {openRecorDetail && (
          <RecordInfoWrapper
            visible={openRecorDetail}
            from={3}
            hideRecordInfo={() => {
              this.setState({ openRecorDetail: false });
            }}
            appId={extra.appId}
            viewId={extra.viewId}
            recordId={extra.rowId}
            worksheetId={entityid}
          />
        )}
      </div>
    );
  }
}
