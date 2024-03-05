import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

export default class SiderTabList extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    children: PropTypes.node,
  }

  constructor(props) {
    super();

    this.state = {
      isOpen: props.isOpen,
    };

    this.toggleList = this.toggleList.bind(this);
  }

  toggleList() {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen,
    }));
  }

  render() {
    const { name, children } = this.props;
    const { isOpen } = this.state;
    const cls = cx('list-arrow', 'Gray_9e', 'TxtMiddle', {
      'icon-arrow-right-tip': !isOpen,
      'icon-arrow-down': isOpen,
    });
    return (
      <div>
        <div className="list-header Gray_75 Font12" onClick={this.toggleList}>
          <i className={cls} />
          <span className="TxtMiddle">{name}</span>
        </div>
        {isOpen ? <div className="list-content">{children}</div> : null}
      </div>
    );
  }
}
