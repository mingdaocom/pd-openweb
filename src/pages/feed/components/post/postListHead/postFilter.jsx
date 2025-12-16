import React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Dropdown } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import DateFilter from 'src/components/DateFilter';
import { setCaretPosition } from 'src/utils/common';
import postEnum from '../../../constants/postEnum';
import { changeFontSize, changeListType, changeSearchKeywords, filter } from '../../../redux/postActions';
import { Tab, Tabs } from '../../common/tabs/tabs';
import './postFilter.css';

/**
 * 首页动态列表的头部筛选器
 */
class HomePostFilter extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    fontSize: PropTypes.number,
    searchKeywords: PropTypes.string,
    title: PropTypes.string,
    options: PropTypes.shape({
      postType: PropTypes.number,
      listType: PropTypes.string,
      projectId: PropTypes.string,
      groupId: PropTypes.string,
      accountId: PropTypes.string,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
    }),
  };

  state = {
    isSearchInputExpand: !_.isNull(this.props.searchKeywords),
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.postType = this.props.options.postType;
    if (this.state.isSearchInputExpand) {
      const searchInput = ReactDom.findDOMNode(this.searchInput);
      setCaretPosition(searchInput, searchInput.value.length);
    }
  }

  componentDidUpdate() {
    if (this.props.searchKeywords !== this.searchInput.value) {
      ReactDom.findDOMNode(this.searchInput).value = this.props.searchKeywords;
    }
  }

  setFontSize = step => {
    const fontSize = this.props.fontSize + step;
    this.props.dispatch(changeFontSize(fontSize));
  };

  handleGroupMenuChange = state => {
    if (_.isBoolean(state.groupMenuVisibility)) {
      this.setState({ groupMenuVisibility: state.groupMenuVisibility });
    }
  };

  postType = undefined;

  handleSelectMy = () => {
    this.props.dispatch(changeListType({ listType: postEnum.LIST_TYPE.user, accountId: md.global.Account.accountId }));
  };

  handleSelectIReply = () => {
    this.props.dispatch(
      changeListType({ listType: postEnum.LIST_TYPE.ireply, accountId: md.global.Account.accountId }),
    );
  };

  focusSearchInput = () => {
    this.setState({ isSearchInputExpand: true });
    ReactDom.findDOMNode(this.searchInput).focus();
  };

  blurSearchInput = evt => {
    if (!evt.target.value) {
      this.setState({ isSearchInputExpand: false });
    }
  };

  keyupSearchInput = evt => {
    if (evt.which === 13) {
      this.searchPost();
    }
  };

  changeSearchKeywords = e => {
    this.props.dispatch(changeSearchKeywords(e.target.value));
  };

  searchPost = () => {
    const searchInput = ReactDom.findDOMNode(this.searchInput);
    if (!searchInput) {
      return;
    }
    const keywords = searchInput.value;
    this.props.dispatch(
      filter({
        keywords: keywords || null,
        postType: this.postType,
        startDate: this.startDate,
        endDate: this.endDate,
      }),
    );
  };

  render() {
    const allowDecreaseFontSize = (md.cheat && md.cheat.unlimitFontSize) || this.props.fontSize > 12;
    const allowIncreaseFontSize = (md.cheat && md.cheat.unlimitFontSize) || this.props.fontSize < 14;
    const postTypes = [
      { text: _l('全部动态'), value: -1 },
      { text: _l('链接动态'), value: 1 },
      { text: _l('图片动态'), value: 2 },
      { text: _l('文档动态'), value: 3 },
      { text: _l('投票动态'), value: 7 },
      { text: _l('问答动态'), value: 4 },
    ];

    const typeSelect = (
      <div className={cx('mRight5 InlineBlock', { hide: this.props.options.listType === postEnum.LIST_TYPE.ireply })}>
        <Dropdown
          className="Font12"
          menuStyle={{ minWidth: 180 }}
          data={postTypes}
          value={this.props.options.postType}
          isAppendToBody
          onChange={value => {
            this.postType = parseInt(value, 10);
            this.searchPost();
          }}
        />
      </div>
    );

    let left, typeSelectAtLeft;
    if (this.props.options.accountId !== md.global.Account.accountId) {
      // 群组或个人首页
      left = <div className="left postListTitle">{this.props.title || _l('动态墙')}</div>;
    } else if (this.props.options.accountId) {
      // 我的主页
      left = (
        <div className="left listTypeFilter">
          <Tabs>
            <Tab focused={this.props.options.listType === postEnum.LIST_TYPE.user} onClick={this.handleSelectMy}>
              <span className="tabItemContent">{_l('我发布的')}</span>
            </Tab>
            <Tab focused={this.props.options.listType === postEnum.LIST_TYPE.ireply} onClick={this.handleSelectIReply}>
              <span className="tabItemContent">{_l('我回复的')}</span>
            </Tab>
          </Tabs>
        </div>
      );
    } else {
      typeSelectAtLeft = true;
      left = (
        <div className="left postListTitle">
          {this.props.options.listType === postEnum.LIST_TYPE.ireply ? _l('我回复的') : typeSelect}
        </div>
      );
    }
    return (
      <div className="postHeader homePostFilter clearfix">
        {left}
        <div className="searchFilter Right mRight15">
          <div className="InlineBlock">
            <a
              className={cx('fontAdd', { DisabledColor: !allowDecreaseFontSize })}
              onClick={allowDecreaseFontSize ? () => this.setFontSize(-1) : undefined}
            >
              A-
            </a>
            <a
              className={cx('fontAdd', { DisabledColor: !allowIncreaseFontSize })}
              onClick={allowIncreaseFontSize ? () => this.setFontSize(1) : undefined}
            >
              A+
            </a>
          </div>
          <Tooltip title={_l('搜索动态')}>
            <div className="mLeft10 InlineBlock searchFilterKeyword">
              <input
                ref={searchInput => {
                  this.searchInput = searchInput;
                }}
                placeholder={_l('回车搜索')}
                defaultValue={this.props.searchKeywords}
                className={cx({ expand: this.state.isSearchInputExpand })}
                onBlur={this.blurSearchInput}
                onKeyUp={this.keyupSearchInput}
                onChange={this.changeSearchKeywords}
              />
              <i className="icon-search Font16 Gray_9" onClick={this.focusSearchInput} />
            </div>
          </Tooltip>
          <DateFilter
            popupContainer={document.querySelector('.feedAppScrollContent')}
            onChange={(startDate, endDate) => {
              _.assign(this, {
                startDate: startDate ? startDate.format('YYYY-MM-DD') : null,
                endDate: endDate ? endDate.format('YYYY-MM-DD') : null,
              });
              this.searchPost();
            }}
          >
            <Tooltip
              title={
                this.props.options.startDate
                  ? this.props.options.startDate + ' 至 ' + this.props.options.endDate
                  : _l('通过时间筛选')
              }
            >
              <div
                className={cx('mLeft10 InlineBlock Hand', {
                  hide: this.props.options.listType === postEnum.LIST_TYPE.ireply,
                })}
              >
                <i className={'icon-calander Font16 ' + (this.props.options.startDate ? 'ThemeColor3' : 'Gray_9')} />
              </div>
            </Tooltip>
          </DateFilter>
        </div>
        <div className="selectContainer Right">{!typeSelectAtLeft && typeSelect}</div>
      </div>
    );
  }
}

export default connect(state => state.post)(HomePostFilter);
