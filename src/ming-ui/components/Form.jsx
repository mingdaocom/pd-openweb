/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
import PropTypes from 'prop-types';

import React, { Component, cloneElement } from 'react';
import cx from 'classnames';
import { Switch, Input, Checkbox, Dropdown, RadioGroup, CheckboxGroup } from 'ming-ui';
import './less/Form.less';

const FORM_ELEMS = [Switch, Input, Checkbox, Dropdown, RadioGroup, CheckboxGroup];

class Form extends Component {
  static propTypes = {
    onSubmit: PropTypes.func,
    className: PropTypes.string,
    children: PropTypes.any,
  };

  formValue = {};

  submit() {
    this.props.onSubmit(this.formValue);
  }

  refreshData(name, value) {
    Object.assign(this.formValue, {
      [name]: value,
    });
  }

  render() {
    return (
      <div className={cx(this.props.className, 'ming Form')}>
        {React.Children.map(this.props.children, child => {
          if (!child) {
            return null;
          }
          return (
            <div className={cx('Form-item', { half: !!child.props.half })}>
              {child.props.formItemTitle ? <div className="Form-item-title overflow-ellipsis">{child.props.formItemTitle}</div> : null}
              <div className="Form-item-control">
                {React.cloneElement(child, {
                  onFormDataChange: (name, value) => this.refreshData(name, value),
                  isFormControl: true,
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default Form;
