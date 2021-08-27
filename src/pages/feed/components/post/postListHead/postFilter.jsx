import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { setCaretPosition } from 'src/util';
import { Tabs, Tab } from '../../common/tabs';
import postEnum from '../../../constants/postEnum';
import { changeFontSize, changeListType, filter, changeSearchKeywords } from '../../../redux/postActions';
import { connect } from 'react-redux';

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

    const postTypes = [
      { name: _l('全部动态'), id: -1 },
      { name: _l('链接动态'), id: 1 },
      { name: _l('图片动态'), id: 2 },
      { name: _l('文档动态'), id: 3 },
      { name: _l('投票动态'), id: 7 },
      { name: _l('问答动态'), id: 4 },
    ];

    require(['md.select'], () => {
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
    });
    this.bindDatePicker();
  }

  componentDidUpdate() {
    if (this.props.searchKeywords !== this.searchInput.value) {
      ReactDom.findDOMNode(this.searchInput).value = this.props.searchKeywords;
    }
  }

  componentWillUnmount() {
    if (this.unbindDatePicker) {
      this.unbindDatePicker();
    }
    this._isMounted = false;
  }

  setFontSize = (step) => {
    const fontSize = this.props.fontSize + step;
    this.props.dispatch(changeFontSize(fontSize));
  };

  handleGroupMenuChange = (state) => {
    if (_.isBoolean(state.groupMenuVisibility)) {
      this.setState({ groupMenuVisibility: state.groupMenuVisibility });
    }
  };

  postType = undefined;

  handleSelectMy = () => {
    this.props.dispatch(changeListType({ listType: postEnum.LIST_TYPE.user, accountId: md.global.Account.accountId }));
  };

  handleSelectIReply = () => {
    this.props.dispatch(changeListType({ listType: postEnum.LIST_TYPE.ireply, accountId: md.global.Account.accountId }));
  };

  bindDatePicker = () => {
    const comp = this;
    const el = ReactDom.findDOMNode(this.daterangePicker);
    require(['bootstrap-daterangepicker', 'bootstrap-daterangepicker/daterangepicker.css', '@mdfe/date-picker-tpl/datePickerTpl.css'], () => {
      const rangesObj = {};
      rangesObj[_l('今天')] = [moment(), moment()];
      rangesObj[_l('本月')] = [moment().startOf('month'), moment().endOf('month')];
      rangesObj[_l('上月')] = [
        moment()
          .subtract(1, 'month')
          .startOf('month'),
        moment()
          .subtract(1, 'month')
          .endOf('month'),
      ];
      rangesObj[_l('最近七天')] = [moment().subtract(6, 'days'), moment()];
      const optionSet = {
        template: require('@mdfe/date-picker-tpl').double,
        linkedCalendars: false,
        minDate: '2010-01-01',
        maxDate: moment().format('YYYY-MM-DD'),
        showDropdowns: true,
        ranges: rangesObj,
        opens: 'left',
        locale: {
          separator: ' to ',
          format: 'YYYY-MM-DD', // 定义显示格式
          applyLabel: _l('确定'),
          cancelLabel: _l('清除'),
          fromLabel: _l('开始时间'),
          toLabel: _l('结束时间'),
          customRangeLabel: _l('自定义日期'),
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6].map((item) => {
            return moment()
              .day(item)
              .format('dd');
          }),
          monthNames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((item) => {
            return moment()
              .month(item)
              .format('MMM');
          }),
          firstDay: 1,
        },
      };
      if (comp.props.options.startDate || comp.props.options.endDate) {
        optionSet.startDate = comp.props.options.startDate;
        optionSet.endDate = comp.props.options.endDate;
      }
      const cb = function (startDate, endDate) {
        _.assign(comp, {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
        });
        comp.searchPost();
      };
      const $el = $(el).daterangepicker(optionSet, cb);
      $el.on('apply.daterangepicker', (ev, picker) => {
        cb(picker.startDate, picker.endDate);
      });
      $el.on('cancel.daterangepicker', () => {
        comp.startDate = null;
        comp.endDate = null;
        comp.searchPost();
      });
      comp.unbindDatePicker = function () {
        const picker = $el.data('daterangepicker');
        if (picker) {
          picker.remove();
        }
      };
    });
  };

  focusSearchInput = () => {
    this.setState({ isSearchInputExpand: true });
    ReactDom.findDOMNode(this.searchInput).focus();
  };

  blurSearchInput = (evt) => {
    if (!evt.target.value) {
      this.setState({ isSearchInputExpand: false });
    }
  };

  keyupSearchInput = (evt) => {
    if (evt.which === 13) {
      this.searchPost();
    }
  };

  changeSearchKeywords = (e) => {
    this.props.dispatch(changeSearchKeywords(e.target.value));
  }

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
      })
    );
  };

  render() {
    const allowDecreaseFontSize = (md.cheat && md.cheat.unlimitFontSize) || this.props.fontSize > 12;
    const allowIncreaseFontSize = (md.cheat && md.cheat.unlimitFontSize) || this.props.fontSize < 14;

    const typeSelect = (
      <div className={cx('mRight5 InlineBlock', { hide: this.props.options.listType === postEnum.LIST_TYPE.ireply })}>
        <input
          type="hidden"
          ref={(postTypeSelect) => {
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
      left = <div className="left postListTitle">{this.props.options.listType === postEnum.LIST_TYPE.ireply ? _l('我回复的') : typeSelect}</div>;
    }
    return (
      <div className="postHeader homePostFilter clearfix">
        {left}
        <div className="searchFilter Right mRight15">
          <div className="InlineBlock">
            <a className={cx('fontAdd', { DisabledColor: !allowDecreaseFontSize })} onClick={allowDecreaseFontSize ? () => this.setFontSize(-1) : undefined}>
              A-
            </a>
            <a className={cx('fontAdd', { DisabledColor: !allowIncreaseFontSize })} onClick={allowIncreaseFontSize ? () => this.setFontSize(1) : undefined}>
              A+
            </a>
          </div>
          <div className="mLeft10 InlineBlock searchFilterKeyword" data-titletip={_l('搜索动态')}>
            <input
              ref={(searchInput) => {
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
          <div
            className={cx('mLeft10 InlineBlock Hand', { hide: this.props.options.listType === postEnum.LIST_TYPE.ireply })}
            data-titletip={this.props.options.startDate ? this.props.options.startDate + ' 至 ' + this.props.options.endDate : _l('通过时间筛选')}
          >
            <i
              className={'icon-calander Font16 ' + (this.props.options.startDate ? 'ThemeColor3' : 'Gray_9')}
              ref={(daterangePicker) => {
                this.daterangePicker = daterangePicker;
              }}
            />
          </div>
        </div>
        <div className="selectContainer Right">{!typeSelectAtLeft && typeSelect}</div>
      </div>
    );
  }
}

module.exports = connect(state => state.post)(HomePostFilter);
