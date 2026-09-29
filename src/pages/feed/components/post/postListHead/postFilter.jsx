import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Button, Dropdown, Input, Popover, Tooltip } from 'ming-ui/antd-components';
import DateFilter from 'src/components/DateFilter';
import postEnum from '../../../constants/postEnum';
import { changeFontSize, changeListType, filter } from '../../../redux/postActions';
import { Tab, Tabs } from '../../common/tabs/tabs';
import './postFilter.css';

const POST_TYPE_MENU_STYLE = { minWidth: 180 };

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

  state = { searchPopoverOpen: false };

  setFontSize = step => {
    const fontSize = this.props.fontSize + step;
    this.props.dispatch(changeFontSize(fontSize));
  };

  handleSelectMy = () => {
    this.props.dispatch(changeListType({ listType: postEnum.LIST_TYPE.user, accountId: md.global.Account.accountId }));
  };

  handleSelectIReply = () => {
    this.props.dispatch(
      changeListType({ listType: postEnum.LIST_TYPE.ireply, accountId: md.global.Account.accountId }),
    );
  };

  searchPost = (nextOptions = {}) => {
    const { options, searchKeywords } = this.props;
    const {
      keywords = searchKeywords,
      postType = options.postType,
      startDate = options.startDate,
      endDate = options.endDate,
    } = nextOptions;

    this.props.dispatch(
      filter({
        keywords: keywords || null,
        postType,
        startDate,
        endDate,
      }),
    );
  };

  handlePostTypeChange = ({ key }) => {
    const postType = Number(key);

    if (postType !== this.props.options.postType) {
      this.searchPost({ postType });
    }
  };

  handleSearch = event => {
    this.searchPost({ keywords: event.currentTarget.value });
    this.setState({ searchPopoverOpen: false });
  };

  handleClearSearch = () => {
    this.searchPost({ keywords: null });
  };

  handleSearchPopoverOpenChange = searchPopoverOpen => {
    this.setState({ searchPopoverOpen });
  };

  render() {
    const allowDecreaseFontSize = (md.cheat && md.cheat.unlimitFontSize) || this.props.fontSize > 12;
    const allowIncreaseFontSize = (md.cheat && md.cheat.unlimitFontSize) || this.props.fontSize < 14;
    const postTypes = [
      { label: _l('全部动态'), value: -1 },
      { label: _l('链接动态'), value: 1 },
      { label: _l('图片动态'), value: 2 },
      { label: _l('文档动态'), value: 3 },
      { label: _l('投票动态'), value: 7 },
      { label: _l('问答动态'), value: 4 },
    ];
    const selectedPostType = postTypes.find(item => item.value === this.props.options.postType) || postTypes[0];

    const typeSelect = (
      <div className={cx('InlineBlock', { hide: this.props.options.listType === postEnum.LIST_TYPE.ireply })}>
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{
            items: postTypes.map(item => ({ key: String(item.value), label: item.label })),
            onClick: this.handlePostTypeChange,
            selectable: true,
            selectedKeys: [String(selectedPostType.value)],
            style: POST_TYPE_MENU_STYLE,
          }}
        >
          <span className="Font12 Hand">
            {selectedPostType.label}
            <i className="icon-arrow-down-border Font10 mLeft5" />
          </span>
        </Dropdown>
      </div>
    );

    let left, typeSelectAtLeft;

    if (this.props.options.accountId !== md.global.Account.accountId) {
      // 群组或个人首页
      left = <div className="left flex postListTitle">{this.props.title || _l('动态墙')}</div>;
    } else if (this.props.options.accountId) {
      // 我的主页
      left = (
        <div className="left flex listTypeFilter">
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
        <div className="left flex postListTitle">
          {this.props.options.listType === postEnum.LIST_TYPE.ireply ? _l('我回复的') : typeSelect}
        </div>
      );
    }

    return (
      <div className="postHeader homePostFilter flexRow alignItemsCenter w100 clearfix">
        {left}
        <div className="searchFilter Right flexRow alignItemsCenter pRight10">
          {!typeSelectAtLeft && <div className="selectContainer Right mRight10">{typeSelect}</div>}
          <div className="InlineBlock">
            <Button
              className="Normal"
              type="text"
              size="small"
              disabled={!allowDecreaseFontSize}
              onClick={() => this.setFontSize(-1)}
            >
              A-
            </Button>
            <Button
              className="Normal"
              type="text"
              size="small"
              disabled={!allowIncreaseFontSize}
              onClick={() => this.setFontSize(1)}
            >
              A+
            </Button>
          </div>
          <Tooltip title={_l('搜索动态')}>
            <Popover
              placement="bottomRight"
              trigger="click"
              open={this.state.searchPopoverOpen}
              onOpenChange={this.handleSearchPopoverOpenChange}
              content={
                <Input
                  allowClear
                  autoFocus
                  defaultValue={this.props.searchKeywords || ''}
                  placeholder={_l('回车搜索')}
                  style={{ width: 220 }}
                  onClear={this.handleClearSearch}
                  onPressEnter={this.handleSearch}
                />
              }
            >
              <Button
                type="text"
                size="small"
                aria-label={_l('搜索动态')}
                icon={
                  <i
                    className={cx('icon-search Font16', this.props.searchKeywords ? 'colorPrimary' : 'textTertiary')}
                  />
                }
              />
            </Popover>
          </Tooltip>
          <Tooltip
            title={
              this.props.options.startDate
                ? _l('%0 至 %1', this.props.options.startDate, this.props.options.endDate)
                : _l('通过时间筛选')
            }
          >
            <DateFilter
              onChange={(startDate, endDate) => {
                this.searchPost({
                  startDate: startDate ? startDate.format('YYYY-MM-DD') : null,
                  endDate: endDate ? endDate.format('YYYY-MM-DD') : null,
                });
              }}
            >
              <div
                className={cx('mLeft10 InlineBlock Hand', {
                  hide: this.props.options.listType === postEnum.LIST_TYPE.ireply,
                })}
              >
                <i
                  className={'icon-calander Font14 ' + (this.props.options.startDate ? 'colorPrimary' : 'textTertiary')}
                />
              </div>
            </DateFilter>
          </Tooltip>
        </div>
      </div>
    );
  }
}

export default connect(state => state.post)(HomePostFilter);
