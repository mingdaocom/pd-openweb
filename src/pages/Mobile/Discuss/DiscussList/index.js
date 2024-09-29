import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { SpinLoading, ActionSheet, List } from 'antd-mobile';
import * as actions from '../redux/actions';
import { Icon } from 'ming-ui';
import Message from '../Message';
import AttachmentFiles from 'mobile/components/AttachmentFiles';
import withoutDisussion from './assets/withoutDisussion.svg';
import { dateConvertToUserZone } from 'src/util';
import _ from 'lodash';

class DiscussList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isMore: true,
      pageIndex: 1,
    };
  }
  componentDidMount() {
    this.getSheetDiscussion(this.state.pageIndex);
  }
  componentWillUnmount() {
    this.actionSheetHandler && this.actionSheetHandler.close();
    this.props.dispatch(actions.emptySheetDiscussion());
  }
  getSheetDiscussion(pageIndex) {
    const { worksheetId, rowId, entityType } = this.props;
    this.setState({ loading: true });
    this.props.dispatch(actions.getSheetDiscussion({
      pageIndex,
      worksheetId,
      rowId,
      entityType,
    }, isMore => {
      this.setState({
        pageIndex,
        loading: false,
        isMore,
      });
    }));
  }
  openActionSheet(discussionId) {
    const { rowId } = this.props;
    const BUTTONS = [
      { name: _l('删除评论'), class: 'Red', icon: 'delete2', iconClass: 'Font18' },
    ];
    this.actionSheetHandler = ActionSheet.show({
      actions: BUTTONS.map(item => {
        return {
          key: item.icon,
          text: (
            <div className={item.class}>
              <Icon className={cx('mRight10', item.iconClass)} icon={item.icon} />
              <span className="Bold">{item.name}</span>
            </div>
          )
        }
      }),
      extra: (
        <div className="flexRow header">
          <span className="Font13">{_l('讨论')}</span>
          <div className="closeIcon" onClick={() => this.actionSheetHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: (action, index) => {
        if (index === 0) {
          this.props.dispatch(actions.removeSheetDiscussion(discussionId, rowId));
        }
        this.actionSheetHandler.close();
      }
    });
  }
  handleEndReached = (event) => {
    const { target } = event;
    const { loading, isMore } = this.state;
    const isEnd = target.scrollHeight - target.scrollTop <= target.clientHeight;
    if (isEnd && !loading && isMore) {
      this.getSheetDiscussion(this.state.pageIndex + 1);
    }
  }
  renderItem(item) {
    return (
      <List.Item
        key={item.discussionId}
        prefix={(
          <img src={item.createAccount.avatar} />
        )}
      >
        <div className="flexRow alignItemsCenter">
          <div className="name Font15 Gray">{item.createAccount.fullname}</div>
          <div className="flexRow valignWrapper Font14 Gray_9e">
            <div>{createTimeSpan(dateConvertToUserZone(item.createTime))}</div>
            {item.createAccount.accountId === md.global.Account.accountId && (
              <Icon className="mLeft5 Font22" icon="more_horiz" onClick={this.openActionSheet.bind(this, item.discussionId)}/>
            )}
          </div>
        </div>
        <div
          className="content Font14 Gray mTop6"
          onClick={() => {
            this.props.onReply(item.discussionId, item.createAccount.fullname);
          }}
        >
          <Message
            item={item}
            showReplyMessage={!!item.replyId}
            replyAccount={item.replyAccount}
          />
        </div>
        {!!item.attachments.length && (
          <AttachmentFiles
            attachments={item.attachments}
            width="49%"
          />
        )}
      </List.Item>
    );
  }
  render() {
    const { loading, isMore } = this.state;
    const { sheetDiscussions, height } = this.props;
    return (
      <Fragment>
        {
          _.isEmpty(sheetDiscussions) ? (
            <div className="flexRow alignItemsCenter justifyContentCenter" style={{height}}>
              {
                loading ? (
                  <SpinLoading color='primary' />
                ) : (
                  <div className="withoutData flexColumn alignItemsCenter">
                    <img src={withoutDisussion} className="mBottom15" />
                    <span className="text">{_l('暂无讨论')}</span>
                  </div>
                )
              }
            </div>
          ) : (
            <div className="sheetDiscussList h100" onScroll={this.handleEndReached}>
              <List>
                {sheetDiscussions.map(item => (
                  this.renderItem(item)
                ))}
              </List>
              {isMore && (
                <div className="flexRow justifyContentCenter">{loading ? <SpinLoading color='primary' /> : null}</div>
              )}
            </div>
          )
        }
      </Fragment>
    );
  }
}

export default connect((state) => {
  const { sheetDiscussions } = state.mobile;
  return {
    sheetDiscussions,
  };
})(DiscussList);
