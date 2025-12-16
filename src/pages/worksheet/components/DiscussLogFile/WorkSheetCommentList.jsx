import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Input, LoadDiv, Menu, MenuItem, UserHead } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import Commenter from 'src/components/comment/commenter';
import CommentList from 'src/components/comment/commentList';
import { emitter } from 'src/utils/common';
import { FILTER_OPTIONS } from './config';

const Wrap = styled.div`
  .isCheckedIcon {
    right: 10px;
    left: auto !important;
  }
`;

const WrapFocusCon = styled.div`
  width: 340px;
  padding: 5px 0;
  border-radius: 3px;
  background: white;
  z-index: 11;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.13),
    0 2px 6px rgba(0, 0, 0, 0.1);
  .focusUserCon {
    border-top: 1px solid #f5f5f5;
    margin-top: 3px;
  }
`;

export default class WorkSheetCommentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containAttachment: false,
      withMeFilterVisible: false,
      searchActive: false,
      keywords: undefined,
      search: undefined,
      focusType: 0,
      hasFilter: false,
      focusUsers: [],
      focusLoading: false,
    };
    this.updatePageIndex = this.updatePageIndex.bind(this);
    this.reload = this.reload.bind(this);
    this.debouncedSetKeywords = _.debounce(this.setKeywords, 500);
  }

  setFollow = (isFocus = false) => {
    const { worksheet } = this.props;
    const { worksheetId, rowId, viewId } = worksheet;
    this.setState({ focusLoading: true });
    worksheetAjax.setFollow({ worksheetId, rowId, viewId, checkView: true, setFollow: isFocus }).then(res => {
      this.setState({ focusLoading: false });
      if (res) {
        if (res.resultCode === 7) {
          alert(_l('您没有权限关注此记录'), 3);
        } else {
          this.setState({ focusUsers: res?.users || [] });
        }
      }
    });
  };

  getFollower = nextProps => {
    const { worksheet, hiddenTabs = [], entityType } = nextProps || this.props;

    if (hiddenTabs.includes('discuss') || entityType === 2) return;
    const { worksheetId, rowId, viewId } = worksheet;
    if (!rowId) return;
    worksheetAjax.getFollower({ worksheetId, rowId, viewId, checkView: true }).then(res => {
      if (res) {
        this.setState({ focusUsers: res?.users || [] });
      }
    });
  };

  componentDidMount() {
    const { listRef } = this.props;
    if (listRef) {
      listRef(this);
    }
    emitter.addListener('RELOAD_RECORD_INFO_DISCUSS', this.reload);

    // 获取关注者信息
    this.getFollower();
  }

  componentWillReceiveProps(nextProps) {
    //内部和外部讨论切换
    if (nextProps.entityType !== this.props.entityType) {
      this.setState({ containAttachment: false, focusType: 0, hasFilter: false });
    }
    if (
      !_.isEqual(
        _.pick(nextProps.worksheet, ['worksheetId', 'rowId', 'viewId']),
        _.pick(this.props.worksheet, ['worksheetId', 'rowId', 'viewId']),
      ) ||
      nextProps.formFlag !== this.props.formFlag ||
      nextProps.entityType !== this.props.entityType
    ) {
      this.getFollower(nextProps);
    }
  }

  componentWillUnmount() {
    emitter.removeListener('RELOAD_RECORD_INFO_DISCUSS', this.reload);
  }

  setKeywords = (value = '') => {
    this.setState({ keywords: value.trim() });
  };

  reload() {
    this.updatePageIndex({ isReset: true });
  }

  // export method for parent component, bind context
  updatePageIndex(...args) {
    if (this.commentList) {
      this.commentList.updatePageIndex(...args);
    }
  }

  renderWithMeFilterBtn() {
    const { containAttachment, withMeFilterVisible, focusType, searchActive } = this.state;
    const hasFilter = focusType !== 0 || containAttachment;
    const filterText = hasFilter
      ? focusType === 0
        ? _l('包含附件')
        : FILTER_OPTIONS.find(o => o.value === focusType).label + (containAttachment ? _l('且包含附件') : '')
      : '';
    return (
      <Trigger
        popupVisible={withMeFilterVisible}
        popupClassName="discussionFilterCon"
        onPopupVisibleChange={visible => this.setState({ withMeFilterVisible: visible })}
        action={['click']}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [0, 10],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={() => (
          <Wrap>
            <Menu style={{ left: 'initial', right: 0, width: 180 }} onClick={e => e.stopPropagation()}>
              {FILTER_OPTIONS.map((item, index) => {
                const isSelected = item.value === focusType;
                return (
                  <MenuItem
                    key={index}
                    className={cx('Relative', { selected: isSelected })}
                    onClick={() =>
                      this.setState({
                        focusType: !isSelected ? item.value : 0,
                        hasFilter: true,
                      })
                    }
                    style={{ lineHeight: '40px', height: 40 }}
                  >
                    {item.label}
                    {isSelected && <Icon icon="done" className="Font14 ThemeColor3 isCheckedIcon" />}
                  </MenuItem>
                );
              })}
              <MenuItem
                className={cx('Relative', { selected: containAttachment })}
                onClick={() => this.setState({ containAttachment: !containAttachment, hasFilter: true })}
                style={{ lineHeight: '40px', height: 40, borderTop: '1px solid #eaeaea' }}
              >
                {_l('包含附件的讨论')}
                {containAttachment && <Icon icon="done" className="Font14 ThemeColor3 isCheckedIcon" />}
              </MenuItem>
            </Menu>
          </Wrap>
        )}
      >
        <span className="icon_Hover_21 flexRow alignItemsCenter Hand" onClick={e => e.stopPropagation()}>
          <Tooltip title={_l('筛选')}>
            <Icon
              icon="filter_list"
              className={cx('Font20 Gray_75 Hover_21 Hand', {
                ThemeColor3: focusType !== 0 || containAttachment,
              })}
            />
          </Tooltip>
          {filterText && !searchActive && (
            <span className="flexRow alignItemsCenter mLeft3">
              <span className="Font13 ThemeColor3">{filterText}</span>
              <Icon
                icon="close"
                className="Font14 ThemeColor3 isCheckedIcon mLeft3"
                onClick={e => {
                  e.stopPropagation();
                  this.setState({
                    focusType: 0,
                    containAttachment: false,
                    hasFilter: false,
                    withMeFilterVisible: false,
                  });
                }}
              />
            </span>
          )}
        </span>
      </Trigger>
    );
  }

  renderSearch() {
    const { searchActive, search } = this.state;

    return (
      <Fragment>
        {!searchActive && <div className="flex"></div>}
        <div
          className={cx('commentFilterBtn mLeft6 searchBtn mLeft8 icon_Hover_21', {
            flex: searchActive,
            searchActive,
          })}
          onClick={() => this.setState({ searchActive: true })}
        >
          <div className="valignWrapper w100" onClick={() => this.setState({ inputActive: true })}>
            <span className="flexRow alignItemsCenter">
              <Tooltip title={_l('搜索')}>
                <Icon icon="search" className="Font20 Gray_75 Hand" />
              </Tooltip>
            </span>
            {searchActive && (
              <Fragment>
                <Input
                  autoFocus
                  value={search}
                  className="searchInput placeholderColor"
                  placeholder={_l('搜索')}
                  onChange={value => {
                    this.setState({ search: value });
                    this.debouncedSetKeywords(value);
                  }}
                  onBlur={e => !e.target.value && this.setState({ searchActive: false })}
                />
                {!!search && (
                  <Icon
                    icon="cancel"
                    className="Gray_75 Hover_21 Hand Font20"
                    onClick={e => {
                      e.stopPropagation();
                      this.setState({ search: undefined, searchActive: false });
                      this.debouncedSetKeywords('');
                    }}
                  />
                )}
              </Fragment>
            )}
          </div>
        </div>
      </Fragment>
    );
  }

  renderSet = () => {
    const { focusUsers, focusLoading } = this.state;
    const { worksheet } = this.props;
    const { appId, projectId } = worksheet;
    const isFocus = focusUsers.map(o => o.accountId).includes(md.global.Account.accountId);

    const renderIcon = () => {
      return (
        <Tooltip title={focusUsers.length <= 0 ? _l('关注讨论') : ''}>
          <span
            className={cx('mLeft8 Font20 Gray_75 Hover_21 Hand flexRow alignItemsCenter icon_Hover_21 pLeft5 pRight5', {
              ThemeColor3: isFocus,
            })}
            onClick={e => {
              e.stopPropagation();
              this.setFollow(!isFocus);
            }}
          >
            {focusLoading ? (
              <LoadDiv size="small" className="ThemeColor3" />
            ) : (
              <Icon icon={isFocus ? 'notification_turn_on' : 'Silent'} className="Font20" />
            )}
            {focusUsers.length > 0 && <span className="mLeft3 Font13">{focusUsers.length}</span>}
          </span>
        </Tooltip>
      );
    };

    if (!isFocus && focusUsers.length <= 0) {
      return renderIcon();
    }

    return (
      <Trigger
        action={['hover']}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [0, 10],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={() => {
          return (
            <WrapFocusCon>
              {isFocus && (
                <div className="flexRow alignItemsCenter pAll10">
                  {
                    <Icon
                      icon={'notification_turn_on'}
                      className={cx('Font20 Gray_9e Hover_21 Hand', { ThemeColor3: isFocus })}
                    />
                  }
                  <div className="flex flexColumn mLeft10">
                    <div className={cx('Bold Gray ThemeColor3')}>{_l('关注中')}</div>
                    <div className={cx('Gray_9e')}>{_l('通知所有讨论；取消关注仅@你或回复时通知。')}</div>
                  </div>
                </div>
              )}
              {focusUsers.length > 0 && (
                <div className={cx('pLeft10 pRight10 pBottom10', { focusUserCon: isFocus })}>
                  <div className="Gray_9e mTop10">{_l('已关注 %0', focusUsers.length)}</div>
                  {focusUsers.map((o, index) => {
                    return (
                      <div key={o.accountId || index} className="flexRow alignItemsCenter mTop12">
                        <UserHead
                          className="createHeadImg circle userAvarar pointer userMessage"
                          user={{
                            userHead: o.avatar,
                            accountId: o.accountId,
                          }}
                          size={28}
                          appId={appId}
                          projectId={projectId}
                        />
                        <span className="mLeft10 Gray flex WordBreak">{o.fullname}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </WrapFocusCon>
          );
        }}
      >
        {renderIcon()}
      </Trigger>
    );
  };

  render() {
    const {
      worksheet: { projectId, worksheetId, rowId, appId, appName, appSectionId, viewId, title, doNotLoadAtDidMount },
      change,
      discussions,
      addCallback,
      forReacordDiscussion,
      atData,
      status,
      entityType,
      instanceId,
      workId,
      autoFocus,
    } = this.props;
    const { containAttachment, focusType, keywords } = this.state;
    const id = rowId ? worksheetId + '|' + rowId : worksheetId;
    const props = {
      forReacordDiscussion,
      entityType,
      atData,
      placeholder: window.isPublicApp ? _l('预览模式下，不能参与讨论') : _l('暂无讨论'),
      activePlaceholder: _l('输入@成员，按Ctrl+Enter快速发布'),
      sourceId: id,
      sourceType: rowId ? Commenter.TYPES.WORKSHEETROW : Commenter.TYPES.WORKSHEET,
      appId: rowId ? md.global.APPInfo.worksheetRowAppID : md.global.APPInfo.worksheetAppID,
      fromAppId: appId,
      projectId,
      remark: JSON.stringify({
        type: 'worksheet',
        appId,
        appName,
        appSectionId,
        worksheetId: worksheetId,
        viewId,
        rowId,
        title: typeof title === 'string' ? title : '',
      }),
      offset: 45,
      instanceId,
      workId,
      popupContainer: document.body,
      extendsId: `${appId || ''}|${viewId || ''}`,
      mentionsOptions: { isAtAll: !!rowId },
      autoFocus,
      onSubmit: data => {
        change({ discussions: [data].concat(discussions) });
        addCallback(data);
      },
    };

    return (
      <div className="WorkSheetCommentList">
        <div className="flexRow alignItemsCenter mBottom16 filterCon">
          {this.renderWithMeFilterBtn()}
          {this.renderSearch()}
          {!md.global.Account.isPortal && entityType !== 2 && rowId && this.renderSet()}
        </div>

        <CommentList
          doNotLoadAtDidMount={doNotLoadAtDidMount}
          status={status}
          sourceId={id}
          workId={workId}
          instanceId={instanceId}
          sourceType={rowId ? Commenter.TYPES.WORKSHEETROW : Commenter.TYPES.WORKSHEET}
          focusType={focusType}
          keywords={keywords}
          containAttachment={containAttachment}
          commentList={discussions}
          updateCommentList={data => {
            change({ discussions: data });
          }}
          removeComment={_id => {
            change({
              discussions: _.filter(discussions, ({ discussionId }) => discussionId !== _id),
            });
          }}
          manualRef={comp => {
            this.commentList = comp;
          }}
          entityType={entityType}
        >
          <Commenter {...props} />
        </CommentList>
      </div>
    );
  }
}
