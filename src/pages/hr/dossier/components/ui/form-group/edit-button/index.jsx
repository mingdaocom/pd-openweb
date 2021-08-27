import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

import Icon from 'ming-ui/components/Icon';

class EditButton extends Component {
  onClick = (event) => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }
  };

  render() {
    return (
      <button
        className="dossier-user-form-editbutton ThemeColor3"
        onClick={(event) => {
          this.onClick(event);
        }}
      >
        <Icon icon="edit" />
        <span>{_l('修改')}</span>
      </button>
    );
  }
}

EditButton.propTypes = {
  /**
   * 【回调】点击
   * @param {Event} event - 点击事件
   */
  onClick: PropTypes.func,
};

EditButton.defaultProps = {
  onClick: (event) => {
    //
  },
};

export default EditButton;
