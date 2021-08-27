import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

import Button from '../../../../button';

class Toolbar extends Component {
  deleteOnClick = (event) => {
    // fire deleteOnClick callback
    if (this.props.deleteOnClick) {
      this.props.deleteOnClick(event);
    }
  };

  cancelOnClick = (event) => {
    // fire cancelOnClick callback
    if (this.props.cancelOnClick) {
      this.props.cancelOnClick(event);
    }
  };

  okOnClick = (event) => {
    // fire okOnClick callback
    if (this.props.okOnClick) {
      this.props.okOnClick(event);
    }
  };

  render() {
    let deleteBtn = null;
    if (this.props.deletable) {
      deleteBtn = (
        <div className="dossier-user-form-toolbar-left">
          <Button
            label={_l('删除')}
            color="error"
            type="ghost"
            onClick={(event) => {
              this.deleteOnClick(event);
            }}
          />
        </div>
      );
    }

    return (
      <div className="dossier-user-form-toolbar">
        {deleteBtn}
        <div className="dossier-user-form-toolbar-right">
          <Button
            label={_l('取消')}
            type="ghost"
            onClick={(event) => {
              this.cancelOnClick(event);
            }}
          />
          <Button
            label={_l('保存')}
            onClick={(event) => {
              this.okOnClick(event);
            }}
          />
        </div>
      </div>
    );
  }
}

Toolbar.propTypes = {
  /**
   * 是否支持删除动作
   */
  deletable: PropTypes.bool,
  /**
   * 【回调】删除
   * @param {Event} event - 点击事件
   */
  deleteOnClick: PropTypes.func,
  /**
   * 【回调】取消
   * @param {Event} event - 点击事件
   */
  cancelOnClick: PropTypes.func,
  /**
   * 【回调】确定
   * @param {Event} event - 点击事件
   */
  okOnClick: PropTypes.func,
};

Toolbar.defaultProps = {
  deletable: false,
  deleteOnClick: (event) => {
    //
  },
  cancelOnClick: (event) => {
    //
  },
  okOnClick: (event) => {
    //
  },
};

export default Toolbar;
