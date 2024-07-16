import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { RichText } from 'ming-ui';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

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

  componentDidMount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
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

  handleBlur = () => {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.CHANGE);
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.BLUR);
    }
  };

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

  render() {
    const { disabled, value, type, flag, richTextControlCount = 0, widgetStyle = {}, triggerCustomEvent } = this.props;
    const { projectId, appId, worksheetId } = this.props;
    const { titlelayout_pc = '1', titlelayout_app = '1' } = widgetStyle;
    const displayRow = browserIsMobile() ? titlelayout_app === '2' : titlelayout_pc === '2';
    return (
      <RichText
        projectId={projectId}
        appId={appId}
        worksheetId={worksheetId}
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
        onSave={() => {
          this.handleBlur();
        }}
        maxHeight={browserIsMobile() ? 500 : undefined}
        autoSize={{ height: displayRow ? 'auto' : '100%' }}
        handleFocus={() => triggerCustomEvent(ADD_EVENT_ENUM.FOCUS)}
      />
    );
  }
}
