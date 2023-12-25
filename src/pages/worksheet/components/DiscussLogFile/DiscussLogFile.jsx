import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { autobind } from 'core-decorators';
import { emitter } from 'worksheet/util';
import WorkSheetComment from './WorkSheetComment';
import WorksheetLog from './WorksheetLog';
import WorksheetRocordLog from '../WorksheetRecordLog/WorksheetRocordLog';
import './DiscussLogFile.less';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import _ from 'lodash';

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
      status: this.showTabs.length && this.showTabs[0].id, // 日志讨论  1 日志  2讨论
      doNotLoadAtDidMount: props.isOpenNewAddedRecord,
    };
  }

  componentDidMount() {
    emitter.addListener('RELOAD_RECORD_INFO_LOG', this.reloadLog);
    if (this.state.doNotLoadAtDidMount) {
      this.setState({ doNotLoadAtDidMount: false });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.hiddenTabs !== this.props.hiddenTabs) {
      this.getShowTabs(nextProps);
    }
  }

  componentWillUnmount() {
    emitter.removeListener('RELOAD_RECORD_INFO_LOG', this.reloadLog);
  }

  @autobind
  reloadLog() {
    if (_.isFunction(_.get(this, 'logRef.current.reload'))) {
      _.get(this, 'logRef.current.reload')();
    }
  }

  getShowTabs = props => {
    this.showTabs = [
      { id: -1, name: 'approval', text: _l('审批') },
      { id: 0, name: 'workflow', text: _l('流程') },
      { id: 1, name: 'discuss', text: _l('讨论') },
      { id: 4, name: 'discussPortal', text: md.global.Account.isPortal ? _l('讨论') : _l('讨论(外部)') },
      { id: 2, name: 'logs', text: _l('日志') },
    ].filter(tab => !_.find(props.hiddenTabs, tname => tname === tab.name));
  };

  render() {
    const { configLoading, workflow, approval, forReacordDiscussion } = this.props;
    const { status, loading, doNotLoadAtDidMount } = this.state;
    return (
      <div className="discussLogFile flexRow">
        <div className="header">
          {this.showTabs.map(tab => (
            <span
              key={tab.id}
              className={cx(
                'talk ThemeHoverColor3 ThemeHoverBorderColor3 Font14',
                `tab${tab.id}`,
                `tabsNum${this.showTabs.length}`,
                this.state.status === tab.id && 'ThemeColor3 ThemeBorderColor3 border2',
              )}
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
                className={cx(
                  'txt InlineBlock overflow_ellipsis WordBreak',
                  this.state.status === tab.id && 'ThemeColor3 ThemeBorderColor3 border2',
                )}
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
            {(status === 1 || status === 4) && !configLoading && (
              <div className="talkBox">
                <WorkSheetComment status={status} {...this.props} doNotLoadAtDidMount={doNotLoadAtDidMount} />
              </div>
            )}
            {status === 2 &&
              (forReacordDiscussion ? (
                <WorksheetRocordLog ref={this.logRef} {...this.props} />
              ) : (
                <WorksheetLog {...this.props} />
              ))}
          </div>
        )}
      </div>
    );
  }
}

export default DiscussLogFile;
