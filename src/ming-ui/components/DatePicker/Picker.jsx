import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import PositionContainer from 'ming-ui/components/PositionContainer';

function createChainedFunction(...argsOuter) {
  if (argsOuter.length === 1) {
    return argsOuter[0];
  }

  return function chainedFunction(...argsInner) {
    for (let i = 0; i < argsOuter.length; i++) {
      if (argsOuter[i] && argsOuter[i].apply) {
        argsOuter[i].apply(this, argsInner);
      }
    }
  };
}

class Picker extends Component {
  static propTypes = {
    panelCls: PropTypes.string,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    visible: PropTypes.bool,
    children: PropTypes.func,
    calendar: PropTypes.node,
    timePicker: PropTypes.bool,
    defaultVisible: PropTypes.bool,
    popupParentNode: PropTypes.func,
    offsetLeft: PropTypes.number,
    offsetTop: PropTypes.number,
    defaultValue: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),
  };

  static defaultProps = {
    disabled: false,
    visible: false,
    offsetLeft: 0,
    offsetTop: 0,
    popupParentNode: () => document.body,
  };

  constructor(props) {
    super(props);

    const value = props.defaultValue;
    this.state = {
      value,
      visible: false,
      bounding: null,
    };
  }

  componentDidMount() {
    if (this.props.defaultVisible) {
      this.onClick();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.defaultValue });
  }

  onClick = () => {
    this.setState({ visible: true, bounding: this._picker.getBoundingClientRect() });
  };

  onClose = () => {
    this.setState({ visible: false });
  };

  onCalendarOk = () => {
    this.setState({ visible: false });
  };

  onCalendarClear = () => {
    this.setState({ visible: false });
  };

  onCalendarSelect = (value, cause = {}) => {
    const visible = true;
    // if (this.props.timePicker) {
    //   visible = true;
    // }
    this.setState({ value, visible });
  };

  getCalendarElement = () => {
    const props = this.props;
    const state = this.state;
    const calendarProps = props.calendar.props;
    const { value } = state;
    const defaultValue = value;
    const extraProps = {
      className: props.panelCls,
      defaultValue: defaultValue || calendarProps.defaultValue,
      selectedValue: value,
      popupParentNode: props.popupParentNode,
      onOk: createChainedFunction(calendarProps.onOk, this.onCalendarOk),
      onSelect: createChainedFunction(calendarProps.onSelect, this.onCalendarSelect),
      onClear: createChainedFunction(calendarProps.onClear, this.onCalendarClear),
    };

    return React.cloneElement(props.calendar, extraProps);
  };

  getChildrenElement = () => {
    const props = this.props;
    const state = this.state;
    return React.cloneElement(props.children(state, props), {
      onClick: !props.disabled ? this.onClick : null,
      ref: picker => (this._picker = picker),
    });
  };

  render() {
    const props = this.props;
    const state = this.state;
    const { className, disabled } = this.props;
    return (
      <span className={classNames('ming DatePicker', { 'DatePicker--disabled': disabled }, className)}>
        <PositionContainer
          placement="bottom"
          onHide={this.onClose}
          visible={state.visible}
          bounding={state.bounding}
          popupParentNode={props.popupParentNode}
          offset={{ left: props.offsetLeft, top: props.offsetTop }}
        >
          {this.getCalendarElement()}
        </PositionContainer>
        {this.getChildrenElement()}
      </span>
    );
  }
}

export default Picker;
