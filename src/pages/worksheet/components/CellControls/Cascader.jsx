import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import CascaderDropdown from 'src/components/Form/DesktopForm/widgets/Cascader';
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
    popupContainer: PropTypes.any,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: props.cell.value,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.cell.value !== prevProps.cell.value) {
        this.setState({
          value: this.props.cell.value,
        });
      }
    }
  }

  con = React.createRef();
  cell = React.createRef();

  handleTableKeyDown = e => {
    const { isediting, updateEditingStatus } = this.props;

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
      cell,
      editable,
      isediting,
      updateEditingStatus,
      updateCell,
      onValidate,
      onClick,
      worksheetId,
      recordId,
      rowFormData = () => {},
      popupContainer,
    } = this.props;
    const { value } = this.state;
    const editcontent = (
      <div
        className="cellControlCascaderPopup cellControlEdittingStatus bgPrimary"
        onClick={e => e.stopPropagation()}
        style={{ width: style.width }}
      >
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
                // 级联通过浮层选择即时提交，不走输入/失焦校验流程；必填报错后重新选择需主动重新校验，
                // 以清掉持久化在 cellErrors 中的旧错误，否则错误状态不会重置。
                if (_.isFunction(onValidate)) {
                  onValidate(this.value);
                }
              }

              updateEditingStatus(false);
            }
          }}
        />
      </div>
    );
    return (
      <Trigger
        action={['click']}
        popup={editcontent}
        getPopupContainer={popupContainer}
        popupClassName="filterTrigger"
        popupVisible={isediting}
        destroyPopupOnHide={!window.isSafari}
        popupAlign={{
          points: ['tl', 'tl'],
          overflow: {
            adjustY: true,
          },
        }}
      >
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
        </EditableCellCon>
      </Trigger>
    );
  }
}
