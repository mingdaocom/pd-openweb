import React, { Component } from 'react';
import cx from 'classnames';
import FileList from 'src/components/comment/FileList';
import { CalendarCommentList } from '../components';

export default class CalendarComments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'topic',
    };
  }

  componentDidMount() {
    const $tab = $(this.tab);
    const $bottomLine = $tab.find('.bottomLine');
    $tab.find('li').hover(
      function () {
        $bottomLine.css('left', $(this).index() * 90 + 25);
      },
      function () {
        $bottomLine.css('left', $tab.find('li.active').index() * 90 + 25);
      },
    );
  }

  render() {
    const { ...others } = this.props;
    const { id, recurTime } = this.props.calendar;
    const sourceId = recurTime ? `${id}|${recurTime}` : id;
    const sourceType = FileList.TYPES.CALENDAR;
    const fileListProps = {
      sourceId,
      sourceType,
      appId: md.global.APPInfo.calendarAppID,
    };
    return (
      <div className="calendarComments">
        {this.renderTabList()}
        <div className="commentsContainer">
          {this.state.activeTab === 'topic' ? (
            <CalendarCommentList {...others} ref={this.listRef} />
          ) : (
            <FileList {...fileListProps} />
          )}
        </div>
      </div>
    );
  }

  handleTabClick(item) {
    if (item.id === 'topic' && this.state.activeTab === 'topic') {
      this.commentList.updatePageIndex(true);
    }

    this.setState({
      activeTab: item.id,
    });
  }

  listRef = ref => {
    this.props.listRef(ref);
    this.commentList = ref;
  };

  renderTabList() {
    const { activeTab } = this.state;
    const listData = [
      { id: 'topic', value: _l('讨论') },
      { id: 'file', value: _l('文件') },
    ];
    return (
      <ul
        className="calendarTabList clearfix"
        ref={elem => {
          this.tab = elem;
        }}
      >
        {listData.map(item => (
          <li
            key={item.id}
            onClick={this.handleTabClick.bind(this, item)}
            className={cx('calendarTab', { 'ThemeColor3 active': item.id === activeTab })}
          >
            {item.value}
          </li>
        ))}
        <i className="bottomLine ThemeBGColor3" />
      </ul>
    );
  }
}
