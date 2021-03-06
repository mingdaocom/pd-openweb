import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Radio from '../radio';

import { FormError } from '../lib';

import './style.less';

class RadioGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * current value
       */
      value: this.props.value || null,
      /**
       * value error
       */
      error: false,
      // dirty
      dirty: false,
      // show error
      showError: false,
    };
  }

  componentDidMount() {
    // check init value
    this.checkValue(this.state.value, false);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      // apply props.value update
      this.setState({
        value: nextProps.value,
      });
    }
    // showError changed
    if (nextProps.showError !== this.props.showError) {
      this.setState({
        showError: this.state.dirty || nextProps.showError,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.value !== prevState.value) {
      this.checkValue(this.state.value, true);
    }
  }

  // item on checked
  itemOnChecked = (event, item) => {
    if (!this.props.disabled) {
      this.checkValue(item.value, true);

      // update state.value
      this.setState({
        value: item.value,
      });

      // fire callback
      if (this.props.onChange) {
        this.props.onChange(event, item.value, {
          item,
          prevValue: this.state.value,
        });
      }
    }
  };

  /**
   * check value
   * @param {any} value - current value
   * @param {bool} dirty - value ever changed
   */
  checkValue = (value, dirty) => {
    const error = {
      type: '',
      message: '',
      dirty,
    };
    // required
    if (this.props.required) {
      // has match item.value
      let match = false;
      this.props.data.map((item, i, list) => {
        if (value === item.value) {
          match = true;
        }
        return null;
      });

      // not match
      if (!match) {
        error.type = FormError.types.REQUIRED;
      }
    }

    if (error.type) {
      // fire onError callback
      if (this.props.onError) {
        this.props.onError(error);
      }
    } else if (this.props.onValid) {
      // fire onValid callback
      this.props.onValid();
    }

    // update state.error
    this.setState({
      error: !!error.type,
      dirty,
      showError: dirty || this.props.showError,
    });
  };

  render() {
    let radios = null;
    if (this.props.data && this.props.data) {
      radios = this.props.data.map((item, i, list) => {
        const checked = item.value === this.state.value;
        if (!item.isDeleted) {
          return (
            <Radio
              key={item.value}
              checked={checked}
              color={this.props.colored && item.color}
              label={item.label}
              disabled={this.props.disabled}
              moduleType={this.props.moduleType}
              onChecked={(event) => {
                this.itemOnChecked(event, item);
              }}
            />
          );
        }
      });
    }

    const classList = ['mui-radiogroup'];
    // display
    if (this.props.display === 'grid') {
      let itemsInSingleRow = this.props.itemsInSingleRow;
      if (itemsInSingleRow < 1) {
        itemsInSingleRow = 1;
      } else if (itemsInSingleRow > 10) {
        itemsInSingleRow = 10;
      }

      classList.push(`mui-radiogroup-grid-${itemsInSingleRow}`);
    }

    const classNames = classList.join(' ');

    return <div className={classNames}>{radios}</div>;
  }
}

RadioGroup.propTypes = {
  /**
   * ????????????
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      /**
       * ??????????????????
       */
      label: PropTypes.string,
      /**
       * ?????????
       */
      value: PropTypes.any,
    })
  ),
  /**
   * ??????????????????
   */
  value: PropTypes.any,
  /**
   * ????????????
   */
  required: PropTypes.bool,
  /**
   * ????????????
   */
  disabled: PropTypes.bool,
  /**
   * ????????????
   */
  display: PropTypes.oneOf([
    /**
     * ???????????????
     */
    'auto',
    /**
     * ????????????????????????????????????
     */
    'grid',
  ]),
  /**
   * ???????????????????????????????????????1~10???
   */
  itemsInSingleRow: PropTypes.number,
  /**
   * ????????????????????? error.dirty???
   */
  showError: PropTypes.bool,
  /**
   * ??????????????????
   * @param {Event} event - ????????????
   * @param {any} value - ????????????
   * @param {object} data - ????????????
   * data.item - ???????????????
   * data.prevValue - ????????????
   */
  onChange: PropTypes.func,
  /**
   * ????????????????????????
   * @param {Error} error - ??????
   * error.type - ????????????
   * error.dirty - ????????????????????????
   */
  onError: PropTypes.func,
  /**
   * ??????????????????????????? onError ?????????
   */
  onValid: PropTypes.func,
  moduleType: PropTypes.string,
};

RadioGroup.defaultProps = {
  data: [],
  moduleType: '',
  value: null,
  required: false,
  disabled: false,
  display: 'auto',
  itemsInSingleRow: 1,
  showError: false,
  onChange: (event, value, data) => {
    //
  },
  onError: (error) => {
    //
  },
  onValid: () => {
    //
  },
};

export default RadioGroup;
