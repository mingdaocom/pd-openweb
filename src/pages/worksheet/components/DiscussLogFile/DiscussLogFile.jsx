import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { getRequest } from 'src/utils/common';
import { emitter } from 'src/utils/common';
import WorksheetRocordLog from '../WorksheetRecordLog/WorksheetRocordLog';
import PayLog from './PayLog';
import WorkSheetComment from './WorkSheetComment';
import './DiscussLogFile.less';

@errorBoundary
class DiscussLogFile extends Component {
  static propTypes = {
    workflow: PropTypes.element,
    approval: PropTypes.element,
    hiddenTabs: PropTypes.arrayOf(PropTypes.string),
  };

  logRef = React.createRef();

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
      doNotLoadAtDidMount: props.isOpenNewAddedRecord || props.discussCount === 0,
    };
  }

  componentDidMount() {
    emitter.addListener('RELOAD_RECORD_INFO_LOG', this.reloadLog);
    setTimeout(() => {
      if (this.state.doNotLoadAtDidMount) {
        this.setState({ doNotLoadAtDidMount: false });
      }
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.hiddenTabs !== this.props.hiddenTabs) {
      this.getShowTabs(nextProps);
      if (!this.showTabs.find(o => this.state.status === o.id) && this.state.status) {
        this.setState({
          status: this.getActive(nextProps),
        });
      }
    }
  }

  componentWillUnmount() {
    emitter.removeListener('RELOAD_RECORD_INFO_LOG', this.reloadLog);
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
    const { status, loading, doNotLoadAtDidMount } = this.state;

    return (
      <div className="discussLogFile flexRow">
        <div className="header">
          {this.showTabs.map(tab => (
            <span
              key={tab.id}
              className={cx('talk Font14 overflowHidden', `tab${tab.id}`, `tabsNum${this.showTabs.length}`, {
                'ThemeColor3 ThemeBorderColor3 border2': this.state.status === tab.id && !isWorksheetDiscuss,
                'ThemeHoverColor3 ThemeHoverBorderColor3': !isWorksheetDiscuss,
                isWorksheetDiscuss: isWorksheetDiscuss,
                maxWidthFitContent: this.showTabs.length <= 3,
              })}
              onClick={() => {
                this.setState({ status: tab.id, loading: tab.id === status });
                if (tab.id === status) {
                  setTimeout(() => {
                    this.setState({ loading: false });
                  }, 100);
                }
              }}
            >
              <span
                className={cx('txt InlineBlock overflow_ellipsis WordBreak w100', {
                  'ThemeColor3 ThemeBorderColor3 border2': this.state.status === tab.id && !isWorksheetDiscuss,
                  'Gray Font18': isWorksheetDiscuss,
                })}
                title={tab.text}
              >
                {tab.text}
              </span>
            </span>
          ))}
        </div>
        {!loading && (
          <div className="body flex">
            {status === -1 && approval}
            {status === 0 && workflow}
            {status === 5 && !configLoading && <PayLog {...this.props} />}
            {status === 1 && !configLoading && (
              <div className="talkBox">
                <WorkSheetComment status={status} {...this.props} doNotLoadAtDidMount={doNotLoadAtDidMount} />
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

export default DiscussLogFile;
