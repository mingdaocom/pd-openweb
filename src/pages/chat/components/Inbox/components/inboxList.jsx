import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import ScrollView from 'ming-ui/components/ScrollView';
import { TYPES, LOADTYPES, NAMES } from '../constants';
import { Divider } from 'antd';
import inboxController from 'src/api/inbox';
import 'src/components/mdBusinessCard/mdBusinessCard';
import LoadDiv from 'ming-ui/components/LoadDiv';
import Button from 'ming-ui/components/Button';
import Message from './inboxMessage';

export default class InboxList extends React.Component {
  static propTypes = {
    inboxFavorite: PropTypes.bool,
    type: PropTypes.oneOf(_.values(TYPES)),
  };

  constructor(props) {
    super(props);
    this.state = {
      failed: false,
      pageIndex: 1,
      list: [],
      isLoading: false,
      hasMoreData: true,
    };
  }

  componentWillMount() {
    this.fetchInboxList();
  }

  componentWillReceiveProps(nextProps) {
    // receive new props means needing reload
    this.setState(
      {
        pageIndex: 1,
        isLoading: true,
        list: [],
        hasMoreData: true,
      },
      () => {
        this.fetchInboxList();
      }
    );
  }

  componentDidMount() {
    // `binduid`兼容老的系统消息
    $('.inboxBox').on('mouseover', '[data-accountid],[data-groupid]', function () {
      var $el = $(this);
      if ($el.data('bind') || $el.hasClass('groupItem')) {
        return;
      }
      if ($el.attr('binduid')) {
        $el.attr('data-accountid', $el.attr('binduid'));
      }
      $el.mdBusinessCard();
      $el.data('bind', true);
      $el.mouseenter();
    });
  }

  fetchInboxList() {
    const { pageIndex, list } = this.state;
    const { clearUnread, inboxFavorite, type, filter } = this.props;
    const { user, startTime, endTime } = filter || {};

    this.setState({
      failed: false,
      isLoading: true,
    });

    this.ajaxRequest = inboxController.getInboxMessage({
      pageIndex,
      pageSize: 10,
      inboxFavorite: inboxFavorite ? 1 : 0,
      type,
      clearUnread,
      loadType: LOADTYPES.ALL,
      creatorId: user ? user.accountId : null,
      startTime,
      endTime
    });
    this.ajaxRequest
      .done(({ inboxList }) => {
        if (pageIndex === 1) {
          this.setState({
            hasMoreData: inboxList.length > 0,
            list: inboxList,
            isLoading: false,
          });
        } else {
          this.setState({
            hasMoreData: inboxList.length > 0,
            list: list.concat(inboxList),
            isLoading: false,
          });
        }
      })
      .fail((jqXHR, textStatus) => {
        if (textStatus !== 'abort') {
          alert(_l('加载失败，点击重试'), 2);
          this.setState({
            failed: true,
            isLoading: false,
          });
        }
      });
  }

  scrollEvent(event, values) {
    const { hasMoreData, pageIndex, isLoading } = this.state;
    const { direction, position, maximum } = values;
    if (!hasMoreData || isLoading) return false;
    if (direction === 'down' && maximum - position < 50) {
      this.setState(
        {
          pageIndex: pageIndex + 1,
        },
        () => {
          this.fetchInboxList();
        }
      );
    }
  }

  renderList() {
    const { count } = this.props;
    const { list, pageIndex, isLoading, failed } = this.state;
    if (list.length) {
      return this.state.list.map((inboxItem, index) => (
        <Fragment key={inboxItem.inboxId}>
          <Message {...{ inboxItem }} />
          {
            index === (count - 1) && (
              <Divider className="inboxDivider Font13" plain>{_l('以上为新消息')}</Divider>
            )
          }
        </Fragment>
      ));
    } else if (pageIndex === 1 && !isLoading && !failed) {
      return this.renderNullDiv();
    }
  }

  renderLoading() {
    const { pageIndex, isLoading, failed } = this.state;
    if (failed && !isLoading) {
      return (
        <div className="mTop10 TxtCenter">
          <Button type={'link'} onClick={this.fetchInboxList.bind(this)}>
            {_l('加载失败，点击重新加载')}
          </Button>
        </div>
      );
    } else {
      return isLoading ? pageIndex === 1 ? <LoadDiv className="mTop20" /> : <LoadDiv className="mTop10 mBottom10" /> : null;
    }
  }

  renderNullDiv() {
    const { inboxType, inboxFavorite } = this.props;
    if (inboxFavorite) {
      return (
        <div className="nullTip starMsg">
          <div className="Font18">{_l('在这里查看星标信息')}</div>
          <div className="Font14 Gray_9">{_l('点击信息列表右上角的星号，为重要的信息打上星标')}</div>
        </div>
      );
    } else {
      return (
        <div className="nullTip commMsg">
          <div className="Font18">{_l('还没有消息')}</div>
          <div className="Font14 Gray_9">{_l('在这查看所有和%0相关的消息', NAMES[inboxType])}</div>
        </div>
      );
    }
  }

  render() {
    return (
      <ScrollView className="flex" disableParentScroll={true} scrollContentClassName="inboxBox" updateEvent={this.scrollEvent.bind(this)}>
        {this.renderList()}
        {this.renderLoading()}
      </ScrollView>
    );
  }
}
