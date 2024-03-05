import React, { Component } from 'react';
import LoadDiv from 'ming-ui/components/LoadDiv';
import './index.less';

export default class MessageRetry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: false, // 'loading' & 'error'
    };
  }
  componentDidMount() {
    this.setStatus();
  }
  componentWillUnmount() {
    this.loadingTime && clearTimeout(this.loadingTime);
    this.errorTime && clearTimeout(this.errorTime);
  }
  setStatus() {
    const { message } = this.props;
    if (message.waitingId) {
      this.loadingTime = setTimeout(() => {
        const { status } = this.state;
        this.setState({
          status: 'loading',
        });
      }, 200);
      this.errorTime = setTimeout(() => {
        const { status } = this.state;
        if (status === 'loading') {
          this.setState({
            status: 'error',
          });
        }
      }, 1000 * 10);
    }
  }
  handleRetry() {
    this.setStatus();
    this.props.onRetry();
  }
  render() {
    const { status } = this.state;
    return (
      <div
        className="Message-retry-wrapper"
        ref={(retry) => {
          this.retry = retry;
        }}
      >
        {status === 'error' ? (
          <div onClick={this.handleRetry.bind(this)} className="Message-retry-btn">
            !
          </div>
        ) : (
          undefined
        )}
        {status === 'loading' ? (
          <div className="Message-retry-loading">
            <LoadDiv size="small" />
          </div>
        ) : (
          undefined
        )}
      </div>
    );
  }
}
