import React, { Component } from 'react';
import cx from 'classnames';
import moment from 'moment';
import { ScrollView } from 'ming-ui';
import LoadDiv from 'ming-ui/components/LoadDiv';
import * as ajax from '../../utils/ajax';
import { FeesItem, formatFeeds } from './index';

const splitFeeds = list => {
  const ranges = {};
  ranges[_l('今天')] = [moment().startOf('day'), moment().endOf('day')];
  ranges[_l('最近七天')] = [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')];
  ranges[_l('本月')] = [moment().startOf('month'), moment().endOf('day')];
  const oSplit = {};
  list.forEach(feed => {
    const feedTime = moment(feed.createTime);
    let i;
    let sTime;
    const keys = Object.keys(ranges);
    for (i = 0; i < keys.length; i++) {
      if (feedTime.isAfter(ranges[keys[i]][0]) && feedTime.isBefore(ranges[keys[i]][1])) {
        if (!oSplit[keys[i]]) {
          feed.splitTime = keys[i];
          oSplit[keys[i]] = true;
        }
        return;
      }
    }
    if (feedTime.isAfter(moment().startOf('year'))) {
      sTime = feedTime.format('M月');
    } else {
      sTime = feedTime.format('YYYY年M月');
    }
    if (!oSplit[sTime]) {
      feed.splitTime = sTime;
      oSplit[sTime] = true;
    }
  });
  return list;
};

export default class FeedsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      loading: false,
      feeds: [],
    };
  }
  componentDidMount() {
    this.getFeed();
  }
  handleScrollEnd() {
    this.getFeed();
  }
  getFeed() {
    const { feeds, loading, pageIndex } = this.state;
    const { session } = this.props;
    if (loading || !pageIndex) {
      return;
    }
    this.setState({
      loading: true,
    });
    ajax
      .getFeed({
        gID: session.id,
        pIndex: pageIndex,
        lastPostAutoID: feeds.length ? feeds[feeds.length - 1].autoID : null,
      })
      .then(result => {
        const { postList } = result;
        this.setState({
          pageIndex: postList && postList.length >= 10 ? pageIndex + 1 : 0,
          loading: false,
          feeds: splitFeeds(feeds.concat(formatFeeds(postList || []))),
        });
      });
  }
  render() {
    const { feeds, loading } = this.state;
    return (
      <div className="ChatPanel-FeedsPanel">
        <div className="header">
          <span className="slideInfoBar ThemeColor3" onClick={this.props.onSetPanelVisible.bind(this, false)}>
            <i className="icon-arrow-left-border" />
            {_l('返回')}
          </span>
          <span className="title">{_l('动态')}</span>
        </div>
        <div className="content">
          <ScrollView onScrollEnd={this.handleScrollEnd.bind(this)} className="flex">
            {feeds.map(item => (
              <FeesItem item={item} key={item.autoID} />
            ))}
            <LoadDiv className={cx({ Hidden: !loading })} size="small" />
          </ScrollView>
        </div>
      </div>
    );
  }
}
