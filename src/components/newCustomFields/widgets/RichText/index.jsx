import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { RichText } from 'ming-ui';
import { browserIsMobile } from 'src/util';
import autoSize from 'ming-ui/decorators/autoSize';
import _ from 'lodash';

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
    const { disabled, value, type, flag, richTextControlCount = 0, widgetStyle = {} } = this.props;
    const { titlelayout_pc = '1', titlelayout_app = '1' } = widgetStyle;
    const displayRow = browserIsMobile() ? titlelayout_app === '2' : titlelayout_pc === '2';

    return (
      <RichText
        clickInit={richTextControlCount >= 3}
        maxWidth={this.state.width}
        id={flag}
        data={value || ''}
        isRemark={type === 10010}
        className={cx({
          richTextForM: browserIsMobile(),
          richTextDisabledControl: disabled,
        })}
        disabled={disabled}
        onActualSave={this.onChange}
        maxHeight={browserIsMobile() ? 500 : undefined}
        autoSize={{ height: displayRow ? 'auto' : '100%' }}
      />
    );
  }
}
