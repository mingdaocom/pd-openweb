import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import CascaderDropdown from 'src/components/newCustomFields/widgets/Cascader';
import { isKeyBoardInputChar } from 'src/utils/common';
import { checkCellIsEmpty } from 'src/utils/control';
import { renderText } from 'src/utils/control';
import EditableCellCon from '../EditableCellCon';

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

  handleTableKeyDown = e => {
    const { tableId, recordId, cell, isediting, updateCell, updateEditingStatus } = this.props;
    switch (e.key) {
      default:
        (() => {
          if (!e.isInputValue && (isediting || !e.key || !isKeyBoardInputChar(e.key))) {
            return;
          }
          updateEditingStatus(true, () => {});
          e.stopPropagation();
          e.preventDefault();
        })();
    }
  };

  handleChange = value => {
    this.value = value;
    this.setState({
      value,
    });
  };

  handleClear = () => {
    this.handleChange('');
  };

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
      worksheetId,
      recordId,
      rowFormData = () => {},
    } = this.props;
    const { value } = this.state;
    return (
      <EditableCellCon
        conRef={this.con}
        onClick={onClick}
        className={cx(className, 'cellControlCascader', { canedit: editable, focusInput: editable })}
        style={style}
        isediting={isediting}
        hideOutline
        iconName={'arrow-down-border'}
        // onClear={value && this.handleClear}
        onIconClick={() => updateEditingStatus(true)}
      >
        {!isediting && (
          <div
            className="cellread linelimit"
            title={checkCellIsEmpty(value) ? '' : renderText({ ...cell, value }) || _l('未命名')}
          >
            {checkCellIsEmpty(value) ? '' : renderText({ ...cell, value }) || _l('未命名')}
          </div>
        )}
        {isediting && (
          <div onClick={e => e.stopPropagation()}>
            <CascaderDropdown
              value={value}
              from={from}
              {...cell}
              recordId={recordId}
              visible={isediting}
              disabled={!editable}
              onChange={this.handleChange}
              worksheetId={worksheetId}
              formData={_.isFunction(rowFormData) ? rowFormData() : rowFormData}
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
          </div>
        )}
      </EditableCellCon>
    );
  }
}
