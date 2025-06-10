import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Icon, Input, Menu, MenuItem } from 'ming-ui';
import Commenter from 'src/components/comment/commenter';
import CommentList from 'src/components/comment/commentList';
import { emitter } from 'src/utils/common';

const FILTER_OPTIONS = [
  {
    label: _l('我发布的'),
    value: 1,
  },
  {
    label: _l('我回复别人'),
    value: 2,
  },
  {
    label: _l('别人回复我'),
    value: 3,
  },
];

export default class WorkSheetCommentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocus: false,
      containAttachment: false,
      withMeFilterVisible: false,
      searchActive: false,
      keywords: undefined,
      search: undefined,
      focusType: 0,
    };
    this.updatePageIndex = this.updatePageIndex.bind(this);
    this.reload = this.reload.bind(this);
    this.debouncedSetKeywords = _.debounce(this.setKeywords, 500);
  }

  componentDidMount() {
    const { listRef } = this.props;
    if (listRef) {
      listRef(this);
    }
    emitter.addListener('RELOAD_RECORD_INFO_DISCUSS', this.reload);
  }

  componentWillReceiveProps(nextProps) {
    //内部和外部讨论切换
    if (nextProps.entityType !== this.props.entityType) {
      this.setState({ isFocus: false, containAttachment: false, focusType: 0 });
    }
  }

  componentWillUnMount() {
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

  handleChangeFilter = (e, item) => {
    e.stopPropagation();
    this.setState({
      focusType: this.state.focusType === item.value ? undefined : item.value,
      withMeFilterVisible: false,
    });
  };

  renderWithMeFilterBtn() {
    const { isFocus, withMeFilterVisible, focusType } = this.state;

    return (
      <div
        className={cx('commentFilterBtn', { isActive: isFocus })}
        onClick={e => this.setState({ isFocus: !isFocus, focusType: 0 })}
      >
        {isFocus && <Icon icon="done" className="mRight5 Font14" />}
        <span>{focusType ? _.find(FILTER_OPTIONS, l => l.value === focusType).label : _l('与我有关')}</span>
        {isFocus && (
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
              <Menu style={{ left: 'initial', right: 0, width: 180 }} onClick={e => e.stopPropagation()}>
                {FILTER_OPTIONS.map((item, index) => (
                  <MenuItem
                    key={index}
                    className={cx({ selected: item.value === focusType })}
                    onClick={() => this.setState({ focusType: item.value, withMeFilterVisible: false })}
                    style={{ lineHeight: '40px', height: 40 }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            )}
          >
            <Icon icon="settings" className="Font14 mLeft6 Gray_9e Hover_21" onClick={e => e.stopPropagation()} />
          </Trigger>
        )}
      </div>
    );
  }

  renderSearch() {
    const { searchActive, search } = this.state;

    return (
      <Fragment>
        {!searchActive && <div className="flex"></div>}
        <div
          className={cx('commentFilterBtn mLeft6 searchBtn', { flex: searchActive })}
          onClick={() => this.setState({ searchActive: true })}
        >
          <div className="valignWrapper w100" onClick={() => this.setState({ inputActive: true })}>
            <Icon icon="search" className="Font18 Gray_9e" />
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
                    className="Gray_9e Hover_21 Hand"
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
    } = this.props;
    const { isFocus, containAttachment, focusType, keywords } = this.state;
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
      autoFocus: true,
      onSubmit: data => {
        change({ discussions: [data].concat(discussions) });
        addCallback(data);
      },
    };

    return (
      <div className="WorkSheetCommentList">
        {(!!discussions.length || isFocus || !!keywords || containAttachment) && (
          <div className="flexRow alignItemsCenter mBottom16">
            {this.renderWithMeFilterBtn()}
            <div
              className={cx('commentFilterBtn mLeft8', { isActive: containAttachment })}
              onClick={() => this.setState({ containAttachment: !containAttachment })}
            >
              {containAttachment && <Icon icon="done" className="mRight5 Font14" />}
              <span>{_l('含附件')}</span>
            </div>
            {this.renderSearch()}
          </div>
        )}

        <CommentList
          doNotLoadAtDidMount={doNotLoadAtDidMount}
          status={status}
          sourceId={id}
          sourceType={rowId ? Commenter.TYPES.WORKSHEETROW : Commenter.TYPES.WORKSHEET}
          isFocus={isFocus}
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
