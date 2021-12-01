import PropTypes from 'prop-types';
import React from 'react';
import { autobind } from 'core-decorators';
import ScrollView from 'ming-ui/components/ScrollView';
import { getAppSimpleInfo } from 'src/api/homeApp';
import WorkSheetCommenter from './WorkSheetCommenter';
import WorkSheetCommentList from './WorkSheetCommentList';
import _ from 'lodash';

export default class WorkSheetComment extends React.Component {
  static propTypes = {
    appId: PropTypes.string,
    worksheetId: PropTypes.string,
    appSectionId: PropTypes.string,
    disableScroll: PropTypes.bool,
    addCallback: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      discussions: [],
      worksheetInfo: {},
      atData: [],
    };
  }
  componentDidMount() {
    const { appId, worksheetId, appSectionId, disableScroll } = this.props;
    if (this.scrollView && disableScroll) {
      this.$scrollCon = $(this.scrollView).closest('.rightContentScroll')[0];
      if (this.$scrollCon) {
        this.$scrollCon.addEventListener('scroll', this.handleRecordRightContentScroll);
      }
    }
    if (worksheetId && (!appId || !appSectionId)) {
      getAppSimpleInfo({ worksheetId }).then(data => {
        this.setState({ worksheetInfo: data });
      });
    }
    this.getAtData();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.formFlag !== this.props.formFlag) {
      this.getAtData(nextProps);
    }
  }
  componentWillUnmount() {
    if (this.$scrollCon) {
      this.$scrollCon.removeEventListener('scroll', this.handleRecordRightContentScroll);
    }
  }
  getAtData = nextProps => {
    const { formdata = [] } = nextProps || this.props;
    const { discussions = [] } = this.state;
    let data = [];
    formdata
      .filter(o => o.type === 26)
      .map(o => {
        let d;
        try {
          d = JSON.parse(o.value).map(item => {
            return Object.assign({}, item, { job: o.controlName });
          });
        } catch (err) {
          d = [];
        }
        data = data.concat(d);
      });
    let accountsInMessage = [];
    let dis = discussions.map(o => {
      accountsInMessage = accountsInMessage.concat(o.accountsInMessage);
      return o.createAccount;
    });
    data = data
      //参与讨论的
      .concat(dis.map(item => Object.assign({}, item, { job: _l('讨论') })))
      //@到的
      .concat(accountsInMessage.map(item => Object.assign({}, item, { job: _l('讨论') })))
      //排除自己以及未指定等
      .filter(
        d =>
          !(
            ['user-undefined', 'user-publicform', md.global.Account.accountId].includes(d.accountId) ||
            d.accountId.indexOf('user-') >= 0
          ),
      );
    let hash = {};
    const data2 = data.reduce((preVal, curVal) => {
      hash[curVal.accountId] ? '' : (hash[curVal.accountId] = true && preVal.push(curVal));
      return preVal;
    }, []);
    this.setState({
      atData: data2,
    });
  };
  @autobind
  handleRecordRightContentScroll(e) {
    if (
      this.$scrollCon &&
      this.$scrollCon.scrollHeight - this.$scrollCon.clientHeight - this.$scrollCon.scrollTop < 20
    ) {
      const { updatePageIndex } = this.commentList;
      updatePageIndex();
    }
  }
  scrollToListTop() {
    if (this.scrollView && this.scrollView.nanoScroller && this.commentList) {
      const $nano = $(this.scrollView.nanoScroller);
      require(['nanoScroller'], () => {
        $(this.scrollView.nanoScroller).nanoScroller({ scrollTop: 0 });
      });
    }
  }
  @autobind
  handleScroll(event, values) {
    const { direction, maximum, position } = values;
    // filelist ignore event
    if (direction === 'down' && maximum - position < 20 && this.commentList) {
      // method of child component
      const { updatePageIndex } = this.commentList;
      updatePageIndex();
    }
  }
  render() {
    const { disableScroll, addCallback, projectId, forReacordDiscussion } = this.props;
    const { worksheetInfo } = this.state;
    const commenterProps = {
      worksheet: Object.assign({}, this.props, worksheetInfo),
      scrollToListTop: this.scrollToListTop.bind(this),
      change: (payload, discussion) => {
        this.setState(payload);
        this.getAtData();
      },
      addCallback,
      projectId,
      forReacordDiscussion,
    };
    const commentListProps = {
      worksheet: this.props,
      listRef: el => {
        this.commentList = el;
      },
      change: (payload, discussion) => {
        this.setState(payload);
        this.getAtData();
      },
      addCallback,
      forReacordDiscussion,
    };

    return (
      <div className="workSheetCommentBox flex flexRow">
        {disableScroll ? (
          <div
            className="commentListBox flex"
            ref={scrollView => {
              this.scrollView = scrollView;
            }}
          >
            <WorkSheetCommentList
              {...commentListProps}
              discussions={this.state.discussions}
              atData={this.state.atData}
            />
          </div>
        ) : (
          <ScrollView
            className="commentListBox flex"
            ref={scrollView => {
              this.scrollView = scrollView;
            }}
            updateEvent={this.handleScroll}
            preserveScrollTop
          >
            <WorkSheetCommentList
              {...commentListProps}
              discussions={this.state.discussions}
              atData={this.state.atData}
            />
          </ScrollView>
        )}
        <WorkSheetCommenter {...commenterProps} discussions={this.state.discussions} atData={this.state.atData} />
      </div>
    );
  }
}
