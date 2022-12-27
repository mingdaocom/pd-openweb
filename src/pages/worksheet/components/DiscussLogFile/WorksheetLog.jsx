import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { Icon, ScrollView, LoadDiv } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { createLinksForMessage } from 'src/components/common/function';
import { filterXSS } from 'xss';
import _ from 'lodash';

const PAGE_SIZE = 30;

export default class Discuss extends Component {
  static propTypes = {
    worksheetId: PropTypes.string,
    rowId: PropTypes.string,
    disableScroll: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      loadouted: false,
      loading: true,
      discussList: [],
    };
  }

  componentDidMount() {
    const { disableScroll } = this.props;
    this.loadLog(_.pick(this.props, ['worksheetId', 'rowId']));
    if (this.scrollView && disableScroll) {
      this.$scrollCon = $(this.scrollView).closest('.rightContentScroll')[0];
      if (this.$scrollCon) {
        this.$scrollCon.addEventListener('scroll', this.handleScroll);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.worksheetId !== this.props.worksheetId || nextProps.rowId !== this.props.rowId) {
      this.loadLog(_.pick(nextProps, ['worksheetId', 'rowId']));
    }
  }

  componentWillUnmount() {
    if (this.$scrollCon) {
      this.$scrollCon.removeEventListener('scroll', this.handleScroll);
    }
  }

  loadLog(args) {
    const { worksheetId, rowId, pageSize = PAGE_SIZE, pageIndex = 1 } = args;
    let { discussList } = this.state;
    this.setState({
      loading: true,
    });
    if (pageIndex === 1) {
      discussList = [];
    }
    sheetAjax
      .getLogs({
        worksheetId,
        rowId,
        pageSize,
        pageIndex,
      })
      .then(data => {
        const newState = {
          loading: false,
          loadouted: data.length < PAGE_SIZE,
        };
        if (data.length) {
          newState.pageIndex = pageIndex;
          newState.discussList = discussList.concat(data);
        }
        this.setState(newState);
      });
  }

  @autobind
  handleScroll() {
    const { loading, loadouted, pageIndex, discussList } = this.state;
    if (!loading && !loadouted && discussList.length >= PAGE_SIZE) {
      this.loadLog({ pageIndex: pageIndex + 1, ..._.pick(this.props, ['worksheetId', 'rowId']) });
    }
  }

  render() {
    const { disableScroll } = this.props;
    const { loading, discussList } = this.state;
    const children = (
      <div className="logBox">
        {discussList.map((item, index) => {
          const message = createLinksForMessage({
            message: item.message,
            accountId: item.accountId,
            accountName: item.accountName,
          });
          return (
            <div className="logItem" key={index}>
              <Icon icon={[undefined, 'plus', 'edit', 'task-new-delete', 'restart', 'download', 'reply'][item.type]} />
              <span className="logContent" dangerouslySetInnerHTML={{ __html: filterXSS(message) }} />
              <span className="logTime">{createTimeSpan(item.createTime)}</span>
            </div>
          );
        })}
      </div>
    );
    return disableScroll ? (
      <div
        className="logScroll flex"
        ref={scrollView => {
          this.scrollView = scrollView;
        }}
      >
        {children}
        {loading && <LoadDiv className="mBottom20" />}
      </div>
    ) : (
      <ScrollView className="logScroll flex" onScrollEnd={this.handleScroll}>
        {children}
        {loading && <LoadDiv className="mBottom20" />}
      </ScrollView>
    );
  }
}
