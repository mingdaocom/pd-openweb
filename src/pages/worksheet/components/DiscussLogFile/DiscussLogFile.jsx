import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import ErrorBoundary from 'ming-ui/components/ErrorBoundary';
import discussionAjax from 'src/api/discussion';
import { getRequest } from 'src/utils/platform/browser/device';
import { emitter } from 'src/utils/platform/browser/dom';
import WorksheetRocordLog from '../WorksheetRecordLog/WorksheetRocordLog';
import PayLog from './PayLog';
import {
  formatDiscussTabText,
  getRecordDiscussionsCountArgs,
  hasHiddenTabsChanged,
  shouldLoadRecordDiscussionCount,
  shouldReloadDiscussionCountOnTabClick,
} from './utils';
import WorkSheetComment from './WorkSheetComment';
import './DiscussLogFile.less';

class DiscussLogFile extends Component {
  static propTypes = {
    workflow: PropTypes.element,
    approval: PropTypes.element,
    hiddenTabs: PropTypes.arrayOf(PropTypes.string),
  };

  logRef = React.createRef();

  discussionCountRequestId = 0;

  static defaultProps = {
    addCallback: () => {},
    hiddenTabs: [],
  };

  constructor(props) {
    super(props);
    this.getShowTabs(props);
    this.state = {
      loading: false,
      status: this.getActive(props),
      // 计数可能是初始化或切换记录时的占位值，不能据此跳过讨论列表请求。
      doNotLoadAtDidMount: props.isOpenNewAddedRecord,
      discussCount: props.discussCount,
    };
  }

  componentDidMount() {
    emitter.addListener('RELOAD_RECORD_INFO_LOG', this.reloadLog);
    // 刷新记录时评论列表会重拉，这里同步刷新计数，避免展开态数字与列表不一致（Header 在展开态会跳过计数）。
    emitter.addListener('RELOAD_RECORD_INFO_DISCUSS', this.getDiscussionsCount);
    this.getDiscussionsCount();
    setTimeout(() => {
      if (this.state.doNotLoadAtDidMount) {
        this.setState({ doNotLoadAtDidMount: false });
      }
    }, 1000);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const hiddenTabsChanged = hasHiddenTabsChanged(prevProps.hiddenTabs, this.props.hiddenTabs);

      if (this.props.discussCount !== prevProps.discussCount) {
        this.setState({ discussCount: this.props.discussCount });
      }

      const discussionCountSourceChanged =
        this.props.worksheetId !== prevProps.worksheetId ||
        this.props.rowId !== prevProps.rowId ||
        hiddenTabsChanged ||
        this.props.allowExAccountDiscuss !== prevProps.allowExAccountDiscuss ||
        this.props.exAccountDiscussEnum !== prevProps.exAccountDiscussEnum ||
        this.props.configLoading !== prevProps.configLoading ||
        this.props.isHide !== prevProps.isHide;

      if (discussionCountSourceChanged) {
        this.discussionCountRequestId += 1;
      }

      if (hiddenTabsChanged || this.props.workflowStatus !== prevProps.workflowStatus) {
        this.getShowTabs(this.props);

        if (
          (!this.showTabs.find(o => this.state.status === o.id) && this.state.status) ||
          this.props.workflowStatus !== prevProps.workflowStatus
        ) {
          this.setState({
            status: this.getActive(this.props),
          });
        }
      }

      // 记录、权限口径、右栏展开、配置加载完成后刷新计数；无讨论查看权限时不请求。
      if (this.canLoadDiscussionsCount() && discussionCountSourceChanged) {
        this.getDiscussionsCount();
      }
    }
  }

  componentWillUnmount() {
    emitter.removeListener('RELOAD_RECORD_INFO_LOG', this.reloadLog);
    emitter.removeListener('RELOAD_RECORD_INFO_DISCUSS', this.getDiscussionsCount);
  }

  getActive(props = {}) {
    const { sideactive } = getRequest();

    if (sideactive === 'pay' && !!this.showTabs.find(o => o.name === 'pay')) {
      return 5;
    }

    if (_.find(this.showTabs, { name: 'approval' }) && !(props.workflowStatus || '').startsWith('["other')) {
      const activeTab = this.showTabs.filter(tab => tab.name !== 'approval')[0];

      if (activeTab) {
        return activeTab.id;
      }
    }

    return this.showTabs.length && this.showTabs[0].id; // 日志讨论  1 日志  2讨论
  }

  reloadLog = () => {
    if (_.isFunction(_.get(this, 'logRef.current.reload'))) {
      _.get(this, 'logRef.current.reload')();
    }
  };

  // 仅记录详情右栏的讨论 tab 需要取计数，工作表讨论浮层和草稿记录不处理。
  canLoadDiscussionsCount = (props = this.props) => {
    return shouldLoadRecordDiscussionCount({
      isWorksheetDiscuss: props.isWorksheetDiscuss,
      isOpenNewAddedRecord: props.isOpenNewAddedRecord,
      configLoading: props.configLoading,
      isHide: props.isHide,
      worksheetId: props.worksheetId,
      rowId: props.rowId,
      hasDiscussTab: !!_.find(this.showTabs, { name: 'discuss' }),
    });
  };

  // 初始化右栏、切回讨论 tab、记录或门户讨论配置变化时，按当前可见讨论口径刷新计数。
  getDiscussionsCount = () => {
    if (!this.canLoadDiscussionsCount()) {
      return;
    }

    const {
      worksheetId,
      rowId,
      allowExAccountDiscuss = false,
      exAccountDiscussEnum = 0,
      workId,
      instanceId,
    } = this.props;
    const requestId = ++this.discussionCountRequestId;

    discussionAjax
      .getDiscussionsCount(
        getRecordDiscussionsCountArgs({
          worksheetId,
          rowId,
          isPortal: md.global.Account.isPortal,
          allowExAccountDiscuss,
          exAccountDiscussEnum,
          workId,
          instanceId,
        }),
      )
      .then(res => {
        if (requestId === this.discussionCountRequestId) {
          const discussCount = _.get(res, 'data');

          this.setState({ discussCount });
          // 同步给记录详情父级，保证展开/折叠两种入口展示同一份计数。
          if (_.isFunction(this.props.updateDiscussCount)) {
            this.props.updateDiscussCount(discussCount);
          }
        }
      })
      .catch(() => {});
  };

  // 新增讨论后不直接累加，重拉接口结果以兼容外部门户讨论筛选和后端计数规则。
  handleAddDiscussion = discussion => {
    this.getDiscussionsCount();
    this.props.addCallback(discussion);
  };

  getShowTabs = props => {
    this.showTabs = [
      { id: -1, name: 'approval', text: _l('审批') },
      { id: 0, name: 'workflow', text: _l('流程') },
      { id: 1, name: 'discuss', text: _l('讨论') },
      { id: 5, name: 'pay', text: _l('支付') },
      { id: 2, name: 'logs', text: _l('日志') },
    ].filter(tab => !_.find(props.hiddenTabs, tname => tname === tab.name));
  };

  render() {
    const { configLoading, workflow, approval, forReacordDiscussion, isWorksheetDiscuss } = this.props;
    const { status, loading, doNotLoadAtDidMount, discussCount } = this.state;
    const displayDiscussCount = !_.isUndefined(this.props.discussCount) ? this.props.discussCount : discussCount;

    return (
      <div className="discussLogFile flexRow">
        <div className="header">
          {this.showTabs.map(tab => {
            const tabText = tab.name === 'discuss' ? formatDiscussTabText(tab.text, displayDiscussCount) : tab.text;

            return (
              <span
                key={tab.id}
                className={cx('talk Font14 overflowHidden', `tab${tab.id}`, `tabsNum${this.showTabs.length}`, {
                  'colorPrimary borderColorPrimary border2': this.state.status === tab.id && !isWorksheetDiscuss,
                  'hoverColorPrimary hoverBorderColorPrimary': !isWorksheetDiscuss,
                  isWorksheetDiscuss: isWorksheetDiscuss,
                  maxWidthFitContent: this.showTabs.length <= 3,
                })}
                onClick={() => {
                  this.setState({ status: tab.id, loading: tab.id === status });
                  if (shouldReloadDiscussionCountOnTabClick({ tabId: tab.id, currentStatus: status })) {
                    this.getDiscussionsCount();
                  }

                  if (tab.id === status) {
                    setTimeout(() => {
                      this.setState({ loading: false });
                    }, 100);
                  }
                }}
              >
                <span
                  className={cx('txt InlineBlock overflow_ellipsis WordBreak w100', {
                    'colorPrimary borderColorPrimary border2': this.state.status === tab.id && !isWorksheetDiscuss,
                    'textPrimary Font18': isWorksheetDiscuss,
                  })}
                  title={tabText}
                >
                  {tabText}
                </span>
              </span>
            );
          })}
        </div>
        {!loading && (
          <div className="body flex">
            {status === -1 && approval}
            {status === 0 && workflow}
            {status === 5 && !configLoading && <PayLog {...this.props} />}
            {status === 1 && !configLoading && (
              <div className="talkBox">
                <WorkSheetComment
                  status={status}
                  {...this.props}
                  addCallback={this.handleAddDiscussion}
                  reloadDiscussionCount={this.getDiscussionsCount}
                  doNotLoadAtDidMount={doNotLoadAtDidMount}
                />
              </div>
            )}
            {status === 2 && !configLoading && forReacordDiscussion && (
              <WorksheetRocordLog ref={this.logRef} {...this.props} />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default ErrorBoundary.wrap(DiscussLogFile);
