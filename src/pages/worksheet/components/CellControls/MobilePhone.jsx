import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import ClickAway from 'ming-ui/components/ClickAway';
import PhoneNumberInput from 'ming-ui/components/PhoneNumberInput';
import { emitter } from 'src/utils/common';
import { isKeyBoardInputChar } from 'src/utils/common';
import { formatNumberFromInput } from 'src/utils/control';
import { renderText } from 'src/utils/control';
import { addBehaviorLog } from 'src/utils/project';
import EditableCellCon from '../EditableCellCon';
import CellErrorTips, { CellErrorTipTrigger } from './comps/CellErrorTip';
import { FROM } from './enum';

const ClickAwayable = ClickAway;
export default class MobilePhone extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    updateCell: PropTypes.func,
    popupContainer: PropTypes.any,
    cell: PropTypes.shape({ value: PropTypes.string }),
    value: PropTypes.string,
    needLineLimit: PropTypes.bool,
    updateEditingStatus: PropTypes.func,
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: props.cell.value,
      tempValue: props.cell.value,
      forceShowFullValue: _.get(props.cell, 'advancedSetting.datamask') !== '1',
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      // 子表场景：失焦后 ChildTable 的 300ms debounce + DataFormat 清洗会让 cell.value 异步回灌；
      // 这段窗口内阻断 props → state 同步，避免清洗后的空值覆盖用户输入；窗口结束后正常同步，
      // 确保外部 row 恢复（如取消保存）能反向覆盖到本地。
      const rowChanged = !_.isEqual(_.get(this.props, 'row.rowid'), _.get(prevProps, 'row.rowid'));
      const isSubList = !!this.props.isSubList;
      const inPostBlurWindow = isSubList && this.postBlurUntil && Date.now() < this.postBlurUntil;
      const errorCleared = !!prevProps.error && !this.props.error;
      const allowValueSync = !inPostBlurWindow || rowChanged || errorCleared;

      if (this.props.cell.value !== prevProps.cell.value && allowValueSync) {
        // 同步重置 tempValue，避免再次进入编辑态时读到上一次的脏输入
        this.postBlurUntil = null;
        this.setState({
          value: this.props.cell.value,
          tempValue: this.props.cell.value,
        });
      }

      if (this.props.isediting && !prevProps.isediting) {
        window.cellTextIsBlurring = true;
      } else if (!this.props.isediting && prevProps.isediting) {
        window.cellTextIsBlurring = false;
      }
    }
  }

  con = React.createRef();

  handleExit = () => {
    const { cell, updateEditingStatus } = this.props;
    updateEditingStatus(false);
    this.setState({
      value: cell.value,
      tempValue: cell.value,
    });
  };

  handleEdit = e => {
    const { updateEditingStatus } = this.props;
    e.stopPropagation();
    updateEditingStatus(true);
    if (this.listened) {
      return;
    }
  };

  handleBlur = nextValue => {
    const { isSubList, error, ignoreErrorMessage, updateCell, updateEditingStatus, onValidate } = this.props;
    const { tempValue, value } = this.state;
    const finalValue = _.isUndefined(nextValue) ? tempValue : nextValue;

    setTimeout(() => {
      window.cellTextIsBlurring = false;
    }, 100);

    if (error && !ignoreErrorMessage) {
      // 子表场景：除唯一性冲突外，保留用户输入并触发 row 更新（让主记录详情表单的 dirty 检测能感知到本次修改）。
      // DataFormat 会把非法手机号清洗为空，但 state.value 已由 CWRP 闸门锁定，视觉上仍保留用户输入。
      const validateResult = isSubList && _.isFunction(onValidate) ? onValidate(finalValue) : null;
      const errorType = validateResult && validateResult.errorType;

      if (isSubList && errorType !== 'UNIQUE') {
        this.postBlurUntil = Date.now() + 500;
        updateCell({ value: finalValue });
        this.setState({ value: finalValue, tempValue: finalValue });
        updateEditingStatus(false);
        this.lastBlurTime = null;
        return;
      }

      this.handleExit();
      return;
    }

    if (finalValue === value) {
      updateEditingStatus(false);
      return;
    }

    if (isSubList) {
      this.postBlurUntil = Date.now() + 500;
    }

    updateCell({
      value: finalValue,
    });
    this.setState({
      value: finalValue,
      tempValue: finalValue,
    });
    updateEditingStatus(false);
    this.lastBlurTime = null;
  };

  get masked() {
    const { cell, isCharge } = this.props;
    return (
      this.state.value &&
      (isCharge || _.get(cell, 'advancedSetting.isdecrypt') === '1') &&
      !(
        _.get(window, 'shareState.isPublicView') ||
        _.get(window, 'shareState.isPublicPage') ||
        _.get(window, 'shareState.isPublicRecord')
      )
    );
  }

  handleChange = async value => {
    const { onValidate } = this.props;
    onValidate(value);
    this.setState({
      tempValue: value,
    });
  };

  handleTableKeyDown = e => {
    const { cell, updateEditingStatus } = this.props;

    const setKeyboardValue = value => {
      updateEditingStatus(true, () => {
        this.handleChange(value);
      });
    };

    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      if (window.tempCopyForSheetView) {
        setKeyboardValue(window.tempCopyForSheetView);
      } else {
        navigator.clipboard?.readText?.().then(setKeyboardValue);
      }

      return;
    }

    switch (e.key) {
      default:
        (() => {
          const value = cell.type === 6 || cell.type === 8 ? formatNumberFromInput(e.key, false) : e.key;

          if (!value || !isKeyBoardInputChar(e.key)) {
            return;
          }

          updateEditingStatus(true, () => {
            this.handleChange(value);
            e.stopPropagation();
            e.preventDefault();
          });
        })();

        break;
    }
  };

  handleKeydown = e => {
    const { tableId, cell, updateEditingStatus } = this.props;

    if (e.keyCode === 27) {
      updateEditingStatus(false);
      this.setState({
        value: cell.value,
      });
      e.preventDefault();
    } else if (e.keyCode === 13) {
      e.preventDefault();
      this.handleBlur();
      setTimeout(
        () =>
          emitter.emit('TRIGGER_TABLE_KEYDOWN_' + tableId, {
            keyCode: 40,
            stopPropagation: () => {},
            preventDefault: () => {},
          }),
        100,
      );
    }
  };

  handleUnMask = e => {
    if (!this.masked) {
      return;
    }

    e.stopPropagation();
    addBehaviorLog('worksheetDecode', this.props.worksheetId, {
      rowId: this.props.recordId,
      controlId: _.get(this.props, 'cell.controlId'),
    });
    this.setState({ forceShowFullValue: true });
  };

  render() {
    const {
      tableType,
      className,
      style,
      error,
      rowIndex,
      from,
      needLineLimit,
      cell,
      popupContainer,
      editable,
      isediting,
      onClick,
      ignoreErrorMessage,
      isSubList,
    } = this.props;
    const { value, tempValue, forceShowFullValue } = this.state;
    // 编辑浮层挂在表格内时，子表第一行的提示朝下展示会落在底部统计行上，需要改挂到表格根容器
    const editPopupInTable = !window.isSafari && cell.enumDefault !== 0;
    const showErrorTipAsPopup = isSubList && rowIndex === 0 && editPopupInTable;
    const errorText = error ? (typeof error === 'string' ? error : _l('不是有效的电话号码')) : '';
    const isCard = from === FROM.CARD;
    const editValue = isediting ? tempValue : value;
    const editProps = {
      value: editValue,
      style: {
        width: style.width,
        height: style.height,
        padding: '2px 3px 3px 2px',
        boxSizing: 'border-box',
      },
      onClick: e => e.stopPropagation(),
    };
    const editcontent = (
      <ClickAwayable
        {...editProps}
        onClickAwayExceptions={[this.editIcon && this.editIcon.current, '.mdPhoneDialCodePanel']}
        onClickAway={() => {
          setTimeout(() => {
            this.handleBlur();
          }, 320);
        }}
      >
        <PhoneNumberInput
          control={{ ...cell, value: editValue, disabled: !editable }}
          isFocused={isediting}
          isCell={true}
          inputClassName="stopPropagation"
          className="phoneNumberEditWrapper"
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onKeyDown={this.handleKeydown}
        />
        {error && !showErrorTipAsPopup && (
          <CellErrorTips
            color={ignoreErrorMessage ? 'var(--color-warning)' : undefined}
            error={errorText}
            pos={rowIndex === 0 ? 'bottom' : 'top'}
          />
        )}
      </ClickAwayable>
    );
    const editTrigger = (
      <Trigger
        destroyPopupOnHide={!window.isSafari} // 不是 Safari
        action={['click']}
        popup={editcontent}
        getPopupContainer={window.isSafari ? undefined : cell.enumDefault === 0 ? () => document.body : popupContainer}
        popupClassName={cx('filterTrigger cellControlMobilePhoneEdit scrollInTable', {
          cellControlEdittingStatus: tableType !== 'classic',
          cellControlErrorStatus: error,
          ignoreErrorMessage,
        })}
        popupVisible={isediting}
        popupAlign={{
          points: ['tl', 'tl'],
          offset: [0, 0],
          overflow: {
            adjustY: true,
          },
        }}
      >
        <EditableCellCon
          hideOutline
          onClick={onClick}
          className={cx(className, {
            canedit: editable,
            masked: this.masked && !isCard,
            maskHoverTheme: this.masked && isCard && !forceShowFullValue,
          })}
          style={style}
          iconName="hr_edit"
          isediting={isediting}
          onIconClick={this.handleEdit}
        >
          {!isediting && !!value && (
            <span className={cx('ellipsis', { linelimit: needLineLimit })} onClick={this.handleUnMask}>
              {renderText({ ...cell, value }, { noMask: forceShowFullValue })}
            </span>
          )}
          {isCard && this.masked && !forceShowFullValue && (
            <i
              className="icon icon-eye_off Hand maskData Font16 textDisabled mLeft4 mTop4 hoverShow"
              style={{ verticalAlign: 'text-top' }}
              onClick={this.handleUnMask}
            ></i>
          )}
          {tableType === 'classic' && !isediting && !value && cell.hint && (
            <span className="guideText textDisabled hide">{cell.hint}</span>
          )}
        </EditableCellCon>
      </Trigger>
    );

    if (!showErrorTipAsPopup) {
      return editTrigger;
    }

    return (
      <CellErrorTipTrigger
        visible={isediting}
        error={errorText}
        color={ignoreErrorMessage ? 'var(--color-warning)' : undefined}
        popupContainer={popupContainer}
      >
        {editTrigger}
      </CellErrorTipTrigger>
    );
  }
}
