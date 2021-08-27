import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import BraftEditor from 'src/components/braftEditor/braftEditor';
import { browserIsMobile } from 'src/util';

export default class Widgets extends Component {
  static propTypes = {
    recordId: PropTypes.string,
    controlId: PropTypes.string,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  state = {
    isEditing: false,
  };

  onChange = value => {
    this.props.onChange(value);
  };

  render() {
    const { recordId, controlId, disabled, value } = this.props;
    const { isEditing } = this.state;

    if (browserIsMobile()) {
      return (
        <BraftEditor
          cacheKey={`${recordId}-${controlId}`}
          isEditing={isEditing}
          auth={!disabled}
          className={cx('customFormControlBox', { controlDisabled: disabled }, { braftEditorFixed: isEditing })}
          summary={value || ''}
          joinEditing={() => !disabled && this.setState({ isEditing: true })}
          onCancel={() => this.setState({ isEditing: false })}
          onSave={value => {
            this.onChange(value);
            this.setState({ isEditing: false });
          }}
        />
      );
    }

    return (
      <BraftEditor
        actualSave={true}
        cacheKey={`${recordId}-${controlId}`}
        isEditing={isEditing}
        auth={!disabled}
        className={cx('customFormControlBox', { controlDisabled: disabled }, { customFormEditor: isEditing })}
        summary={value || ''}
        joinEditing={() => !disabled && this.setState({ isEditing: true })}
        onCancel={() => this.setState({ isEditing: false })}
        onActualSave={this.onChange}
      />
    );
  }
}
