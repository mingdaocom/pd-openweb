import PropTypes from 'prop-types';
import React from 'react';
import { autobind } from 'core-decorators';
import ScrollView from 'ming-ui/components/ScrollView';
import { getAppSimpleInfo } from 'src/api/homeApp';
import WorkSheetCommenter from './WorkSheetCommenter';
import WorkSheetCommentList from './WorkSheetCommentList';

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
  }
  componentWillUnmount() {
    if (this.$scrollCon) {
      this.$scrollCon.removeEventListener('scroll', this.handleRecordRightContentScroll);
    }
  }
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
    const { disableScroll, addCallback, projectId } = this.props;
    const { worksheetInfo } = this.state;
    const commenterProps = {
      worksheet: Object.assign({}, this.props, worksheetInfo),
      scrollToListTop: this.scrollToListTop.bind(this),
      change: (payload, discussion) => {
        this.setState(payload);
      },
      addCallback,
      projectId,
    };
    const commentListProps = {
      worksheet: this.props,
      listRef: el => {
        this.commentList = el;
      },
      change: (payload, discussion) => {
        this.setState(payload);
      },
      addCallback,
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
            <WorkSheetCommentList {...commentListProps} discussions={this.state.discussions} />
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
            <WorkSheetCommentList {...commentListProps} discussions={this.state.discussions} />
          </ScrollView>
        )}
        <WorkSheetCommenter {...commenterProps} discussions={this.state.discussions} />
      </div>
    );
  }
}
