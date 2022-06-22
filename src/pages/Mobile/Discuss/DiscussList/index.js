import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { List, Flex, ListView, ActivityIndicator, WhiteSpace, ActionSheet } from 'antd-mobile';
import * as actions from '../redux/actions';
import { Icon } from 'ming-ui';
import Message from '../Message';
import AttachmentFiles from '../AttachmentFiles';
import withoutDisussion from './assets/withoutDisussion.svg';

const Item = List.Item;
const Brief = Item.Brief;

class DiscussList extends Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource,
      loading: true,
      isMore: true,
      pageIndex: 1,
    };
  }
  componentDidMount() {
    this.getSheetDiscussion(this.state.pageIndex);
  }
  componentWillUnmount() {
    ActionSheet.close();
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
    const { rowId, sheetDiscussions } = this.props;
    const BUTTONS = [
      { name: _l('删除评论'), class: 'Red', icon: 'delete2', iconClass: 'Font18' },
    ];
    ActionSheet.showActionSheetWithOptions({
      message: (
        <div className="flexRow">
          <span className="flex Font13 leftAlign">{_l('讨论')}</span>
          <Icon
            onClick={() => {
              ActionSheet.close();
            }}
            icon="closeelement-bg-circle"
            className="Font22 Gray_9e"
          />
        </div>
      ),
      options: BUTTONS.map(item => (
        <div className={item.class}>
          <Icon className={cx('mRight10', item.iconClass)} icon={item.icon} />
          <span className="Bold">{item.name}</span>
        </div>
      )),
    }, (buttonIndex) => {
      if (buttonIndex === 0) {
        this.props.dispatch(actions.removeSheetDiscussion(discussionId, rowId));
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.sheetDiscussions.length !== this.props.sheetDiscussions.length) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows({...nextProps.sheetDiscussions}),
      });
    }
  }
  handleEndReached() {
    const { loading, isMore } = this.state;
    if (!loading && isMore) {
      this.getSheetDiscussion(this.state.pageIndex + 1);
    }
  }
  renderItem(item) {
    return (
      <Item key={item.discussionId} align="top" thumb={item.createAccount.avatar} multipleLine>
        <Flex>
          <div className="name Font15">{item.createAccount.fullname}</div>
          <div className="time">
            <div>{createTimeSpan(item.createTime)}</div>
            {item.createAccount.accountId === md.global.Account.accountId ? (
              <Icon icon="expand_more" onClick={this.openActionSheet.bind(this, item.discussionId)}/>
            ) : null}
          </div>
        </Flex>
        <Brief>
          <div
            className="content Font14 Gray"
            onClick={() => {
              this.props.onReply(item.discussionId, item.createAccount.fullname);
            }}
          >
            <Message
              showReplyMessage={!!item.replyId}
              replyAccount={item.replyAccount}
              message={item.message}
              rUserList={item.accountsInMessage}
              sourceType={item.sourceType}
            />
            <Icon icon="chat" className="Font20 Gray_9e" />
          </div>
        </Brief>
        {item.attachments.length ? (
          <AttachmentFiles
            attachments={item.attachments}
            width="49%"
          />
        ) : null}
      </Item>
    );
  }
  render() {
    const { dataSource, loading, isMore } = this.state;
    const { sheetDiscussions, height } = this.props;
    return (
      <Fragment>
        {
          _.isEmpty(sheetDiscussions) ? (
            <Flex justify="center" align="center" style={{height}}>
              {
                loading ? (
                  <ActivityIndicator size="large" />
                ) : (
                  <Flex direction="column" className="withoutData">
                    <img src={withoutDisussion}/>
                    <WhiteSpace size="lg"/>
                    <span className="text">{_l('暂无讨论')}</span>
                  </Flex>
                )
              }
            </Flex>
          ) : (
            <List className="sheetDiscussList">
              <ListView
                dataSource={dataSource}
                renderFooter={isMore ? () => (<Flex justify="center">{loading ? <ActivityIndicator animating /> : null}</Flex>) : false}
                pageSize={10}
                scrollRenderAheadDistance={500}
                onEndReached={this.handleEndReached.bind(this)}
                onEndReachedThreshold={10}
                style={{
                  height,
                  overflow: 'auto',
                }}
                renderRow={this.renderItem.bind(this)}
              />
            </List>
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
