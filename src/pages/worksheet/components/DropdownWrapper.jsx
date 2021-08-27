import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAwayable = createDecoratedComponent(withClickAway);
import cx from 'classnames';
import './DropdownWrapper.less';

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
    const { children, downElement, className } = this.props;
    const { visible } = this.state;
    return (
      <div className={cx(`dropdownWrapper ${className || ''}`, { active: visible })}>
        <div
          className="targetEle"
          onClick={() => {
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
