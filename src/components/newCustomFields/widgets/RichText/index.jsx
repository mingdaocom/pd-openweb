import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { RichText } from 'ming-ui';
import { browserIsMobile } from 'src/util';
import autoSize from 'ming-ui/decorators/autoSize';
@autoSize
export default class Widgets extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      width: props.width,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.width !== this.props.width) {
      this.setState({
        width: nextProps.width,
      });
    }
  }

  onChange = _.debounce(value => {
    this.props.onChange(value);
  }, 500);

  render() {
    const { disabled, value, type, flag, richTextControlCount = 0 } = this.props;

    return (
      <RichText
        clickInit={richTextControlCount >= 3}
        maxWidth={this.state.width}
        id={flag}
        data={value || ''}
        isRemark={type === 10010}
        className={cx('customFormItemControl', {
          richTextForM: browserIsMobile(),
          richTextDisabledControl: disabled,
        })}
        disabled={disabled}
        onActualSave={this.onChange}
        maxHeight={browserIsMobile() ? 500 : undefined}
      />
    );
  }
}
