import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { func, string } from 'prop-types';
import { Input } from 'ming-ui/antd-components';
import Icon from 'ming-ui/components/Icon';

export default class Search extends Component {
  static propTypes = {
    handleChange: func,
    className: string,
    placeholder: string,
    value: string,
    onFocus: func,
  };
  static defaultProps = {
    handleChange: _.noop,
    onFocus: _.noop,
  };
  state = { value: this.props.value || '' };

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.value !== prevProps.value) {
        this.setState({
          value: this.props.value,
        });
      }
    }
  }
  handleChange = value => {
    this.setState({ value });
    this.props.handleChange(value);
  };
  render() {
    const { className, placeholder = _l('搜索名称'), onFocus } = this.props;
    const { value } = this.state;
    return (
      <div className={cx('workflowSearchWrap', className)}>
        <Input
          onFocus={onFocus}
          value={value}
          placeholder={placeholder}
          onChange={e => this.handleChange(e.target.value)}
          prefix={<Icon icon="search" className="textSecondary Font16" />}
          suffix={
            value ? (
              <Icon
                icon="close"
                onMouseDown={e => e.preventDefault()}
                onClick={() => this.handleChange('')}
                className="pointer textTertiary"
              />
            ) : null
          }
        />
      </div>
    );
  }
}
