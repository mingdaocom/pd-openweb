import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import ClickAway from 'ming-ui/components/ClickAway';
import './DropdownWrapper.less';

const ClickAwayable = ClickAway;
export default class DropdownWrapper extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    downElement: PropTypes.element,
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }
  render() {
    const { children, downElement, className, disabled } = this.props;
    const { visible } = this.state;
    return (
      <div className={cx(`dropdownWrapper ${className || ''}`, { active: visible, disabled })}>
        <div
          className="targetEle"
          onClick={() => {
            if (disabled) return;
            this.setState({
              visible: !visible,
            });
          }}
        >
          {children}
        </div>
        {visible && (
          <ClickAwayable
            className="aroundList"
            onClickAway={() => {
              this.setState({
                visible: false,
              });
            }}
          >
            {React.cloneElement(downElement, {
              hide: () => {
                this.setState({
                  visible: false,
                });
              },
            })}
          </ClickAwayable>
        )}
      </div>
    );
  }
}
