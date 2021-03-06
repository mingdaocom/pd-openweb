import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'ming-ui/components/Icon';
import CityPicker from 'ming-ui/components/CityPicker';
import './style.less';
import { FormError } from '../lib';

class AreaPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * current value[Date]
       */
      value: this.props.value || '',
      /**
       * button label
       */
      label: this.props.label || null,
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
    // apply label update
    if (nextProps.label !== this.props.label) {
      const label = nextProps.label && nextProps.label.length ? nextProps.label.toString() : '';

      this.setState({
        label,
      });
    }
    // apply value update
    if (nextProps.value !== this.props.value) {
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
    if (this.props.required && (!value || !value.length)) {
      error.type = FormError.types.REQUIRED;
    }

    if (error.type) {
      // fire onError callback
      if (this.props.onError) {
        this.props.onError(error);
      }
    } else {
      // fire onValid callback
      if (this.props.onValid) {
        this.props.onValid();
      }
    }

    // update state.error
    this.setState({
      error: !!error.type,
      dirty,
      showError: dirty || this.props.showError,
    });
  };

  /**
   * ?????????????????????
   * @param {array} value - ????????????????????????
   */
  valueUpdate = (value) => {
    // update state.value
    if (value !== this.state.value) {
      this.checkValue(value, true);

      this.setState({
        value,
      });

      if (this.props.onChange) {
        this.props.onChange(null, value, {
          prevValue: this.state.value,
        });

        // picker level
        let level = 3; // ??????
        if (this.props.type === 'province') {
          level = 1; // ???
        } else if (this.props.type === 'city') {
          level = 2; // ???
        }

        if (value.length === level) {
          this.props.onSave(value);
        }
      }
    }
  };

  render() {
    const buttonClassList = ['mui-forminput', 'ThemeFocusBorderColor3'];
    if (this.state.error && this.state.showError) {
      buttonClassList.push('mui-forminput-error');
    }
    const buttonClassNames = buttonClassList.join(' ');

    // picker level
    let level = 3; // ??????
    if (this.props.type === 'province') {
      level = 1; // ???
    } else if (this.props.type === 'city') {
      level = 2; // ???
    }

    return (
      <div className="mui-areapicker">
        <CityPicker
          defaultValue={this.state.value}
          level={level}
          disabled={this.props.disabled}
          callback={(data) => {
            this.valueUpdate(data);
          }}
          handleClose={() => this.props.onSave(this.state.value)}
        >
          <button type="button" className={buttonClassNames} disabled={this.props.disabled}>
            {this.state.label ? <span className="mui-forminput-label">{this.state.label}</span> :
            <span className="mui-forminput-label placeholder">{this.props.hint}</span>}
            <Icon icon="sp_pin_drop_white" />
          </button>
        </CityPicker>
      </div>
    );
  }
}

AreaPicker.propTypes = {
  /**
   * ??????????????????
   */
  value: PropTypes.any,
  /**
   * Button ????????????
   */
  label: PropTypes.string,
  /**
   * ????????????
   */
  type: PropTypes.oneOf([
    /**
     * ??????
     */
    'district',
    /**
     * ???
     */
    'city',
    /**
     * ???
     */
    'province',
  ]),
  /**
   * ????????????
   */
  required: PropTypes.bool,
  /**
   * ????????????
   */
  disabled: PropTypes.bool,
  /**
   * ????????????????????? error.dirty???
   */
  showError: PropTypes.bool,
  /**
   * ??????????????????
   * @param {Event} event - ????????????
   * @param {any} value - ????????????
   * @param {object} data - ????????????
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
  hint: PropTypes.string,
};

AreaPicker.defaultProps = {
  value: null,
  label: '',
  required: false,
  disabled: false,
  showError: false,
  onChange: (event, value, item) => {
    //
  },
  onError: (error) => {
    //
  },
  onValid: () => {
    //
  },
};

export default AreaPicker;
