import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import EditableCellCon from '../EditableCellCon';
import renderText from './renderText';
import CascaderDropdown from 'src/components/newCustomFields/widgets/Cascader';

export default class Cascader extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    cell: PropTypes.shape({ value: PropTypes.string }),
    updateCell: PropTypes.func,
    updateEditingStatus: PropTypes.func,
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: props.cell.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      this.setState({ value: nextProps.cell.value });
    }
  }

  con = React.createRef();
  cell = React.createRef();

  @autobind
  handleChange(value) {
    this.value = value;
    this.setState({
      value,
    });
  }

  @autobind
  handleClear() {
    this.handleChange('');
  }

  render() {
    const {
      from,
      className,
      style,
      error,
      cell,
      editable,
      isediting,
      updateEditingStatus,
      updateCell,
      onClick,
    } = this.props;
    const { value } = this.state;
    return (
      <EditableCellCon
        onClick={onClick}
        className={cx(className, 'cellControlCascader', { canedit: editable })}
        style={style}
        isediting={isediting}
        hideOutline
        iconName={'arrow-down-border'}
        // onClear={value && this.handleClear}
        onIconClick={() => updateEditingStatus(true)}
      >
        {!isediting && <div className="cellread linelimit">{value && renderText({ ...cell, value })}</div>}
        {isediting && (
          <CascaderDropdown
            value={value}
            from={from}
            visible={isediting}
            disabled={!editable}
            onChange={this.handleChange}
            dataSource={cell.dataSource}
            viewId={cell.viewId}
            advancedSetting={cell.advancedSetting}
            onPopupVisibleChange={visible => {
              if (!visible) {
                if (!_.isUndefined(this.value)) {
                  updateCell({
                    value: this.value,
                  });
                }
                updateEditingStatus(false);
              }
            }}
          />
        )}
      </EditableCellCon>
    );
  }
}
