import PropTypes from 'prop-types';
import React, { Component } from 'react';
import TransitionGroup from 'react-addons-transition-group';
import cx from 'classnames';
import Textarea from 'ming-ui/components/Textarea';
import Dropdown from 'ming-ui/components/Dropdown';
import Icon from 'ming-ui/components/Icon';
import Input from 'ming-ui/components/Input';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import LoadDiv from 'ming-ui/components/LoadDiv';

import { Config } from '../index';

import { getUserAllCalCategories, getCalendarColor } from '../common';

export default class CalendarHeader extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    auth: PropTypes.object.isRequired,
    color: PropTypes.number.isRequired,

    changeCategory: PropTypes.func.isRequired,
    changeTitle: PropTypes.func.isRequired,
    joinOutLook: PropTypes.func.isRequired,
    openDetailPage: PropTypes.func.isRequired,
    postMessage: PropTypes.func.isRequired,
    shareCalendar: PropTypes.func.isRequired,
    deleteCalendar: PropTypes.func.isRequired,
    exitCalendar: PropTypes.func.isRequired,
    createTask: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    // private for states
    this.state = {
      isCategoryReady: false,
      isShowCategory: false,
      isShowOpList: false,
      categories: null,
      title: props.title,
    };
  }

  componentDidUpdate() {
    const { isShowCategory, isCategoryReady } = this.state;
    // 首次在打开时去加载 日程分类
    if (isShowCategory && !isCategoryReady) {
      getUserAllCalCategories().then(data => {
        this.setState({
          isCategoryReady: true,
          categories: data,
        });
      });
    }
  }

  handleChangeCategory(item) {
    const { changeCategory } = this.props;
    return () => {
      changeCategory(item);
      this.setState({ isShowCategory: false });
    };
  }

  handleJoinOutLook() {
    const { joinOutLook } = this.props;
    joinOutLook();
    this.setState({ isShowOpList: false });
  }

  handleChangeTitle(value) {
    if ($.trim(value).length <= 266) {
      this.props.changeTitle(value);
      this.setState({ title: value });
    } else {
      alert(_l('日程标题最大长度266个字符'), 2);
    }
  }

  render() {
    const { title, auth: { showEdit } } = this.props;
    return (
      <div className="calendarTopBar">
        <div className="calendarHeader">
          {this.renderCategory(showEdit)}
          <Textarea
            resizeAfterBlur={true}
            value={this.state.title}
            minHeight={26}
            maxHeight={100}
            onChange={this.handleChangeTitle.bind(this)}
            onBlur={() => {
              this.setState({ title });
            }}
            readOnly={!showEdit}
            className="calendarNameInput"
          />
          {this.renderOperations()}
        </div>
        <TransitionGroup component="div" transitionAppear={true}>
          {this.props.children && this.props.children}
        </TransitionGroup>
      </div>
    );
  }

  renderCategoryList(showEdit) {
    const { isCategoryReady, isShowCategory, categories } = this.state;
    return showEdit && isShowCategory ? (
      <Menu
        onClickAway={() => {
          this.setState({ isShowCategory: false });
        }}
        onClickAwayExceptions={[this.catBtn]}
        ignoreOnHide={true}
      >
        {(() => {
          if (!isCategoryReady) {
            return (
              <MenuItem>
                <LoadDiv />
              </MenuItem>
            );
          } else if (categories) {
            return categories.map(category => {
              const catName = $('<div>')
                .html(category.catName)
                .text();
              const colorClassName = getCalendarColor(category.color);
              return (
                <MenuItem onClick={this.handleChangeCategory(category)} key={category.catID}>
                  <span className={cx('calendarCatInput', 'mRight5', colorClassName)} />
                  {catName}
                </MenuItem>
              );
            });
          }
        })()}
      </Menu>
    ) : null;
  }

  renderCategory(showEdit) {
    if (!this.props.canLook) return null;
    const colorClassName = getCalendarColor(this.props.color);
    return (
      <span className="categoryContainer Font16 Relative mTop10">
        <span
          className={cx('calendarCatInput', colorClassName)}
          ref={btn => {
            this.catBtn = btn;
          }}
        />
        {showEdit ? (
          <Icon
            icon={'arrow-down-border'}
            className="categoryArrow pointer"
            onClick={() => {
              this.setState({ isShowCategory: true });
            }}
          />
        ) : null}
        {this.renderCategoryList(showEdit)}
      </span>
    );
  }

  renderOperations() {
    const { auth, openDetailPage, postMessage, shareCalendar, deleteCalendar, exitCalendar, createTask } = this.props;
    const { showShare, showExit, showDelete, showEdit } = auth;
    const { isShowOpList } = this.state;
    return (
      <div className="calendarOperations pLeft15">
        <span className="Relative mLeft20 calMoreOp">
          <span
            className="icon-task-point-more Font19 ThemeHoverColor3 pointer"
            ref={btn => {
              this.opBtn = btn;
            }}
            onClick={() => {
              this.setState({ isShowOpList: true });
            }}
          />

          {isShowOpList ? (
            <Menu
              className="calendarOpDrowDown"
              parentMenuItem={this.opBtn}
              onClickAway={() => {
                this.setState({ isShowOpList: false });
              }}
              onClickAwayExceptions={[this.opBtn]}
              ignoreOnHide={true}
              con={'.calendarHeader'}
            >
              {(showExit || showDelete) && !md.global.SysSettings.forbidSuites.includes('2') ? <MenuItem onClick={createTask}>{_l('创建为新任务')}</MenuItem> : null}
              <MenuItem onClick={this.handleJoinOutLook.bind(this)}>{_l('加入Outlook')}</MenuItem>
              {showEdit ? <MenuItem onClick={postMessage}>{_l('群发消息')}</MenuItem> : null}
              {Config.isDetailPage ? null : <MenuItem onClick={openDetailPage}>{_l('新页面打开')}</MenuItem>}
              {showExit ? (
                <MenuItem className="exitCalendar" onClick={exitCalendar}>
                  {_l('退出日程')}
                </MenuItem>
              ) : null}
              {showDelete ? (
                <MenuItem className="deleteCalendar" onClick={deleteCalendar}>
                  {_l('删除日程')}
                </MenuItem>
              ) : null}
            </Menu>
          ) : null}
        </span>
        {Config.isDetailPage ? null : <span className="mLeft20 icon-close Font20 ThemeHoverColor3 pointer" onClick={Config.closeDialog} />}
      </div>
    );
  }
}
