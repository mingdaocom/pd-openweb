import PropTypes from 'prop-types';
import React, { Component, cloneElement } from 'react';
import cx from 'classnames';
import './less/List.less';
import _ from 'lodash';

class List extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    header: PropTypes.element,
    footer: PropTypes.element,
    bodyMaxHeight: PropTypes.number,
  };
  render() {
    let iconAtFront = false;
    let iconAtEnd = false;
    const items = React.Children.map(this.props.children, item => {
      if (!React.isValidElement(item)) {
        return null;
      }
      if (item.props.icon) {
        if (item.props.iconAtEnd && !iconAtEnd) {
          iconAtEnd = true;
        } else if (!iconAtFront) {
          iconAtFront = true;
        }
      }
      return item;
    });

    const isAllEnd = _.every(React.Children.toArray(), item => {
      return item.props.icon && item.props.iconAtEnd;
    });
    const header = this.props.header
      ? cloneElement(this.props.header, { className: cx(this.props.header.props.className, 'List-header') })
      : undefined;
    const footer = this.props.footer
      ? cloneElement(this.props.footer, { className: cx(this.props.footer.props.className, 'List-footer') })
      : undefined;
    return (
      <div
        {...this.props}
        ref={this.props.setRef}
        className={cx(this.props.className, 'ming List', {
          'List--withIconFront': iconAtFront,
          'List--withIconEnd': iconAtEnd,
        })}
      >
        {header}
        <ul className="" style={{ maxHeight: this.props.bodyMaxHeight }}>
          {items}
        </ul>
        {footer}
      </div>
    );
  }
}

export default List;
