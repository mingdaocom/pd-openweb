import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import Icon from 'ming-ui/components/Icon';
import OpList from './opList';
import User from './user';

export default class Item extends Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    add: PropTypes.func,
    remove: PropTypes.func,
    replace: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      isDisabled: props.status !== 1,
      showOpList: false,
    };
    this.timer = null;
  }

  renderOpList() {
    const toggleList = flag => {
      if (flag === undefined) {
        this.setState({
          showOpList: !this.state.showOpList,
        });
      } else {
        this.setState({ showOpList: false });
      }
    };
    const { add, replace, remove, status } = this.props;
    const listProps = {
      toggleList: () => {
        toggleList(false);
      },
      showAddBtn: !this.state.isDisabled,
      add,
      replace,
      remove,
    };
    return (
      <div className="opList">
        <Icon
          icon="more_horiz"
          className="itemOperator"
          onClick={() => {
            toggleList();
          }}
        />
        {this.state.showOpList ? <OpList {...listProps} /> : null}
      </div>
    );
  }

  render() {
    const { status, isHighLight, auth } = this.props;
    const { isDisabled } = this.state;
    const itemClassName = cx('node', {
      disabled: isDisabled,
      ThemeHoverBorderColor3: !isDisabled,
      'ThemeBGColor6 ThemeBorderColor3': isHighLight,
    });
    return (
      <div
        className="InlineBlock Relative pRight40 nodeWrapper"
        onMouseLeave={() => {
          this.setState({ showOpList: false });
        }}
      >
        <div className={itemClassName}>
          <User {...this.props} />
        </div>
        {auth ? this.renderOpList() : null}
      </div>
    );
  }
}
