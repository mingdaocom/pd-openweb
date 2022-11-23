import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { setCaretPosition } from 'src/util';
import { Tabs, Tab } from '../../common/tabs/tabs';
import postEnum from '../../../constants/postEnum';
import DateFilter from 'src/components/DateFilter';
import { changeFontSize, changeListType, filter, changeSearchKeywords } from '../../../redux/postActions';
import { connect } from 'react-redux';
import './postFilter.css';
import 'src/components/select/select';

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

    const postTypes = [
      { name: _l('全部动态'), id: -1 },
      { name: _l('链接动态'), id: 1 },
      { name: _l('图片动态'), id: 2 },
      { name: _l('文档动态'), id: 3 },
      { name: _l('投票动态'), id: 7 },
      { name: _l('问答动态'), id: 4 },
    ];

    if (!this._isMounted) {
      return;
    }
    const comp = this;
    const $postTypeSelect = $(ReactDom.findDOMNode(this.postTypeSelect));
    $('.postTypeSelectPlaceholder').hide();
    $postTypeSelect.MDSelect({
      zIndex: 1,
      lineHeight: 32,
      width: 180,
      dataArr: postTypes,
      defualtSelectedValue: this.props.options.postType,
      onChange(value, text, activeThis) {
        comp.postType = parseInt(value, 10);
        comp.searchPost();
      },
    });
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

    const typeSelect = (
      <div className={cx('mRight5 InlineBlock', { hide: this.props.options.listType === postEnum.LIST_TYPE.ireply })}>
        <input
          type="hidden"
          ref={postTypeSelect => {
            this.postTypeSelect = postTypeSelect;
          }}
        />
        <span className="postTypeSelectPlaceholder" style={{ fontSize: 12, padding: '0 10px' }}>
          {_l('全部动态')}
        </span>
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
          <div className="mLeft10 InlineBlock searchFilterKeyword" data-titletip={_l('搜索动态')}>
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
            <div
              className={cx('mLeft10 InlineBlock Hand', {
                hide: this.props.options.listType === postEnum.LIST_TYPE.ireply,
              })}
              data-titletip={
                this.props.options.startDate
                  ? this.props.options.startDate + ' 至 ' + this.props.options.endDate
                  : _l('通过时间筛选')
              }
            >
              <i className={'icon-calander Font16 ' + (this.props.options.startDate ? 'ThemeColor3' : 'Gray_9')}/>
            </div>
          </DateFilter>
        </div>
        <div className="selectContainer Right">{!typeSelectAtLeft && typeSelect}</div>
      </div>
    );
  }
}

export default connect(state => state.post)(HomePostFilter);
