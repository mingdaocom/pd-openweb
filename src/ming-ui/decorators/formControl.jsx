import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

function formControl(exceptionList, Component = exceptionList) {
  class formControlComponent extends React.Component {
    static propTypes = {
      name: PropTypes.string,
      onFormDataChange: PropTypes.func,
      className: PropTypes.string,
      isFormControl: PropTypes.bool,
    };

    formDataChange(value) {
      if (this.props.onFormDataChange) {
        this.props.onFormDataChange(this.props.name, value);
      }
    }

    render() {
      if (this.props.isFormControl) {
        return (
          <div className={cx(this.props.className, 'FormControl')}>
            <Component {...this.props} $formDataChange={value => this.formDataChange(value)} />
          </div>
        );
      }
      return <Component {...this.props} $formDataChange={value => this.formDataChange(value)} />;
    }
  }

  return formControlComponent;
}
module.exports = formControl;
