import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Dropdown, Input } from 'ming-ui/antd-components';
import Icon from 'ming-ui/components/Icon';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { htmlDecodeReg } from 'src/utils/core/string';
import { Config, getCalendarColor, getUserAllCalCategories } from '../common';

const TITLE_TEXTAREA_AUTO_SIZE = { minRows: 1, maxRows: 3 };

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

  handleChangeTitle(event) {
    const { value } = event.target;

    if (value.trim().length <= 266) {
      this.props.changeTitle(value);
      this.setState({ title: value });
    } else {
      alert(_l('日程标题最大长度266个字符'), 2);
    }
  }

  render() {
    const {
      title,
      auth: { showEdit },
    } = this.props;
    return (
      <div className="calendarTopBar">
        <div className="calendarHeader">
          {this.renderCategory(showEdit)}
          <Input.TextArea
            autoSize={TITLE_TEXTAREA_AUTO_SIZE}
            variant="borderless"
            value={this.state.title}
            onChange={this.handleChangeTitle.bind(this)}
            onBlur={() => {
              this.setState({ title });
            }}
            readOnly={!showEdit}
            className="calendarNameInput"
          />
          {this.renderOperations()}
        </div>
        {this.props.children}
      </div>
    );
  }

  getCategoryMenuItems() {
    const { isCategoryReady, categories } = this.state;

    if (!isCategoryReady) {
      return [{ key: 'loading', disabled: true, label: <LoadDiv /> }];
    }

    return (categories || []).map(category => {
      const catName = htmlDecodeReg(category.catName);
      const colorClassName = getCalendarColor(category.color);

      return {
        key: category.catID,
        label: (
          <span>
            <span className={cx('calendarCatInput', 'mRight5', colorClassName)} />
            {catName}
          </span>
        ),
        onClick: this.handleChangeCategory(category),
      };
    });
  }

  renderCategory(showEdit) {
    if (!this.props.canLook) return null;
    const colorClassName = getCalendarColor(this.props.color);
    const { isShowCategory } = this.state;

    return (
      <span className="categoryContainer Font16 Relative mTop10">
        <span className={cx('calendarCatInput', colorClassName)} />
        {showEdit ? (
          <Dropdown
            trigger={['click']}
            open={isShowCategory}
            onOpenChange={open => this.setState({ isShowCategory: open })}
            getPopupContainer={triggerNode => triggerNode.parentElement}
            menu={{ style: { width: 180 }, items: this.getCategoryMenuItems() }}
          >
            <Icon icon="arrow-down-border" className="categoryArrow pointer" />
          </Dropdown>
        ) : null}
      </span>
    );
  }

  renderOperations() {
    const { auth, openDetailPage, postMessage, deleteCalendar, exitCalendar, createTask, reFetchData } = this.props;
    const { showExit, showDelete, showEdit } = auth;
    const { isShowOpList } = this.state;
    const operationItems = [
      (showExit || showDelete) &&
        !md.global.SysSettings.forbidSuites.includes('2') && {
          key: 'create-task',
          label: _l('创建为新任务'),
          onClick: createTask,
        },
      {
        key: 'join-outlook',
        label: _l('加入Outlook'),
        onClick: () => this.handleJoinOutLook(),
      },
      showEdit && {
        key: 'post-message',
        label: _l('群发消息'),
        onClick: postMessage,
      },
      !Config.isDetailPage && {
        key: 'open-detail-page',
        label: _l('新页面打开'),
        onClick: openDetailPage,
      },
      showExit && {
        key: 'exit-calendar',
        className: 'exitCalendar',
        label: _l('退出日程'),
        onClick: exitCalendar,
      },
      showDelete && {
        key: 'delete-calendar',
        danger: true,
        className: 'deleteCalendar',
        label: _l('删除日程'),
        onClick: deleteCalendar,
      },
    ].filter(Boolean);

    return (
      <div className="calendarOperations pLeft15">
        <span
          className="icon-task-later Font18 hoverColorPrimary pointer"
          title={_l('刷新')}
          onClick={reFetchData}
        ></span>

        <span className="Relative mLeft20 calMoreOp">
          <Dropdown
            trigger={['click']}
            open={isShowOpList}
            onOpenChange={open => this.setState({ isShowOpList: open })}
            placement="bottomRight"
            getPopupContainer={triggerNode => triggerNode.parentElement}
            classNames={{ root: 'calendarOpDrowDown' }}
            menu={{
              style: { width: 180 },
              items: operationItems,
              onClick: () => this.setState({ isShowOpList: false }),
            }}
          >
            <span className="icon-more_horiz Font19 hoverColorPrimary pointer" />
          </Dropdown>
        </span>
        {Config.isDetailPage ? null : (
          <span className="mLeft20 icon-close Font20 hoverColorPrimary pointer" onClick={Config.closeDialog} />
        )}
      </div>
    );
  }
}
