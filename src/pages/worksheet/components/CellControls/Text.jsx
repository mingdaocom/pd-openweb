import React from 'react';
import { flushSync } from 'react-dom';
import cx from 'classnames';
import _, { get, includes, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Linkify, Textarea } from 'ming-ui';
import ClickAway from 'ming-ui/components/ClickAway';
import { accMul, browserIsMobile, emitter, isKeyBoardInputChar } from 'src/utils/common';
import { formatNumberFromInput, formatStrZero, renderText, toFixed } from 'src/utils/control';
import { addBehaviorLog } from 'src/utils/project';
import ChildTableContext from '../ChildTable/ChildTableContext';
import EditableCellCon from '../EditableCellCon';
import CellErrorTips, { CellErrorTipTrigger } from './comps/CellErrorTip';
import { FROM } from './enum';

const ClickAwayable = ClickAway;
const InputCon = styled.div`
  box-sizing: border-box;
  padding: 0 6px;
  height: 34px;
  textarea {
    box-sizing: border-box;
    background: transparent;
    font-size: 13px;
    width: 100% !important;
    line-height: 34px;
    height: 34px;
    resize: none;
    white-space: pre;
    overflow: hidden;
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
  }
`;

const MultipleLineTip = styled.div`
  position: absolute;
  padding: 2px 4px;
  bottom: 2px;
  left: 2px;
  right: 2px;
  font-size: 12px;
  color: var(--color-text-disabled);
  background: var(--color-background-primary);
`;

const Input = React.forwardRef((props, ref) => {
  const { className, onChange, ...rest } = props;
  return (
    <InputCon className={className}>
      <textarea
        {...rest}
        className="stopPropagation"
        ref={ref}
        onChange={e => onChange(e.target.value.replace(/\r\n|\n/g, ''))}
      />
    </InputCon>
  );
});
Input.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
};

function getPopupContainer(popupContainer, rows, isMultipleLine) {
  // 表格 main-center 设置了 overflow:hidden，多行文本编辑弹层超出单元格高度时会被裁剪，
  // 也会被底部统计行/footer 遮挡。逃逸到外层 .customFieldsContainer 可绕开裁剪。
  if (isMultipleLine) {
    const escape = popupContainer().closest('.customFieldsContainer');

    if (escape) {
      return () => escape;
    }
  }

  if (_.get(rows, 'length') && _.get(rows, 'length') <= 5 && popupContainer().closest('.customFieldsContainer')) {
    return () =>
      _.get(rows, 'length') && _.get(rows, 'length') <= 5 && popupContainer().closest('.customFieldsContainer');
  }

  return popupContainer;
}

export default class Text extends React.Component {
  static contextType = ChildTableContext;
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    updateCell: PropTypes.func,
    onValidate: PropTypes.func,
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
      oldValue: props.cell.value,
      forceShowFullValue: _.get(props.cell, 'advancedSetting.datamask') !== '1',
    };
    const _handleKeydown = this.handleKeydown.bind(this);

    this.handleKeydown = (...args) => {
      flushSync(() => {
        _handleKeydown(...args);
      });
    };
  }

  tempKey = [];

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const valueChanged = this.props.cell.value !== prevProps.cell.value;
      const rowChanged = !isEqual(get(this.props, 'row.rowid'), get(prevProps, 'row.rowid'));
      const nextState = {}; // 子表场景：失焦后 ChildTable 的 300ms debounce + DataFormat 清洗会让 cell.value 异步回灌；
      // 这段窗口内阻断 props → state 同步，避免脏值/清洗后空值覆盖用户输入。
      // 窗口结束后恢复正常同步，确保外部 row 恢复（如取消保存）能反向覆盖到本地。
      // 子表场景：失焦后 ChildTable 的 300ms debounce + DataFormat 清洗会让 cell.value 异步回灌；
      // 这段窗口内阻断 props → state 同步，避免脏值/清洗后空值覆盖用户输入。
      // 窗口结束后恢复正常同步，确保外部 row 恢复（如取消保存）能反向覆盖到本地。
      const isSubList = !!this.props.isSubList;
      const inPostBlurWindow = isSubList && this.postBlurUntil && Date.now() < this.postBlurUntil;
      const errorCleared = !!prevProps.error && !this.props.error;
      const allowValueSync = !inPostBlurWindow || rowChanged || errorCleared;

      if ((valueChanged || rowChanged) && allowValueSync) {
        this.postBlurUntil = null;
        nextState.value = this.props.cell.value;
      }

      if ((valueChanged && !this.props.isediting && allowValueSync) || rowChanged) {
        nextState.oldValue = this.props.cell.value;
      }

      if (!_.isEmpty(nextState)) {
        this.setState(nextState);
      } // 数值类小数点自动配置，聚焦时去零

      // 数值类小数点自动配置，聚焦时去零
      if (
        this.props.isediting !== prevProps.isediting &&
        this.props.isediting &&
        _.get(this.props, 'cell.advancedSetting.dotformat') === '1'
      ) {
        this.setState({
          value: formatStrZero(this.props.cell.value),
        });
      }
    }

    const { value } = this.state;

    if (!prevProps.isediting && this.props.isediting) {
      // 新的一次编辑会话开始，复位失焦标记，供 handleBlur 重入守卫使用
      this.hadBlur = false;
      if (this.isNumberPercent && value) {
        this.setState(
          {
            value: accMul(value, 100),
          },
          this.focus,
        );
      } else {
        this.focus();
      }
    }
  }

  componentWillUnmount() {
    const { isSubList, isediting } = this.props;

    if (isSubList && isediting && !this.hadBlur) {
      this.handleBlur();
    }
  }

  get isNumberPercent() {
    const { cell } = this.props;
    return _.includes([6, 31, 37], cell.type) && cell.advancedSetting && cell.advancedSetting.numshow === '1';
  }

  get controlCanMask() {
    const { cell } = this.props;
    return (
      ((cell.type === 2 && cell.enumDefault === 2) || _.includes([6, 8, 3, 4, 5, 7], cell.type)) &&
      _.get(cell, 'advancedSetting.datamask') === '1'
    );
  }

  get masked() {
    const { cell, isCharge } = this.props;
    return (
      this.controlCanMask &&
      this.state.value &&
      (isCharge || _.get(cell, 'advancedSetting.isdecrypt') === '1') &&
      !(
        _.get(window, 'shareState.isPublicView') ||
        _.get(window, 'shareState.isPublicPage') ||
        _.get(window, 'shareState.isPublicRecord')
      )
    );
  }

  get isMultipleLine() {
    const { cell } = this.props;
    return cell.type === 2 && cell.enumDefault === 1;
  }

  get step() {
    const stepStr = get(this.props.cell, 'advancedSetting.numinterval') || 1;
    const NumberStep = Number(stepStr);
    return _.isNumber(NumberStep) && !_.isNaN(NumberStep) ? NumberStep : 1;
  }

  con = React.createRef();
  input = React.createRef();

  focus = time => {
    setTimeout(() => {
      if (this.input && this.input.current) {
        const valueLength = (this.input.current.value || '').length;
        this.input.current.focus();
        this.input.current.setSelectionRange(valueLength, valueLength);
      }
    }, time || 100);
  };

  handleEdit = e => {
    const { updateEditingStatus } = this.props;
    e.stopPropagation();
    updateEditingStatus(true, this.focus);
  };

  handleBlur = () => {
    // 重入守卫：同一次编辑会话只处理一次失焦。
    // Safari 下一次失焦可能触发多次（onClickAway + input blur 等），而百分比换算非幂等，
    // 二次进入会把已转好的真实值(如 0.88)再除以 100 → 0.0088 → toFixed 成 0.01，造成多一次错误更新。
    if (this.hadBlur) return;
    this.hadBlur = true;
    const { isSubList, cell, error, ignoreErrorMessage, updateCell, updateEditingStatus, onValidate } = this.props;
    this.tempKey = [];
    let { oldValue = '' } = this.state;
    let { value = '' } = this.state;

    if (this.isNumberPercent && value) {
      value = toFixed(accMul(parseFloat(value), 1 / 100), this.isNumberPercent ? cell.dot + 2 : cell.dot);
    }

    if ((cell.type === 6 || cell.type === 8) && value === '-') {
      value = '';
      this.setState({ value });
    }

    if (
      !isSubList &&
      ([6, 8].includes(cell.type)
        ? _.isEqual(Number(oldValue === '' ? undefined : oldValue), Number(value === '' ? undefined : value))
        : oldValue === value)
    ) {
      if (this.isNumberPercent && value) {
        this.setState({ oldValue, value });
      }

      updateEditingStatus(false);
      return;
    } else if ((cell.enumDefault === 0 || cell.enumDefault === 2) && typeof value === 'string') {
      value = value.replace(/\r\n|\n/g, ' ').trim();
    }

    const blurValidateResult = onValidate(this.state.value);
    const blurError =
      error || (blurValidateResult && (blurValidateResult.errorText || blurValidateResult.errorMessage));
    const blurIgnoreError = (blurValidateResult && blurValidateResult.ignoreErrorMessage) || ignoreErrorMessage;

    if (blurError && !blurIgnoreError) {
      updateEditingStatus(false);
      // 子表场景：除唯一性冲突外，保留用户输入并触发 row 更新（让主记录详情表单的 dirty 检测能感知到本次修改）。
      // DataFormat 可能会把非法值清洗为空，但 state.value 已由 CWRP 闸门锁定，视觉上仍保留用户输入；
      // 校验兜底由 CellControls 失焦写入的 cellErrors + getSubListErrorOfStore 合并完成。
      const blurErrorType = blurValidateResult && blurValidateResult.errorType;

      if (isSubList && blurErrorType !== 'UNIQUE') {
        this.postBlurUntil = Date.now() + 500;
        updateCell({ value });
        this.setState({ oldValue: value, value });
        return;
      }

      this.setState({
        value: oldValue,
      });
      return;
    }

    updateCell({
      value: value,
    });
    this.setState({
      oldValue: value,
      value,
    });
    updateEditingStatus(false, undefined, { value });
    clearTimeout(window.cellTextIsBlurTimer);
    window.cellTextIsBlurring = true;
    window.cellTextIsBlurringTimer = setTimeout(() => {
      window.cellTextIsBlurring = false;
    }, 100);
  };

  handleChange = value => {
    const { cell, onValidate } = this.props;

    if (cell.type === 6 || cell.type === 8) {
      value = formatNumberFromInput(String(value), false);
    }

    flushSync(() => {
      onValidate(value);
      this.setState({
        value,
      });
    });
  };

  handleTableKeyDown = e => {
    const { cell, updateEditingStatus } = this.props;

    const setKeyboardValue = value => {
      updateEditingStatus(true, () => {
        setTimeout(() => {
          const inputDom = this.input.current;

          if (inputDom) {
            inputDom.value = value;
            this.handleChange(value);
          }
        }, 10);
      });
    };

    function handleCopyFromWindow() {
      if (window.tempCopyForSheetView) {
        const data = safeParse(window.tempCopyForSheetView);

        if (data.type === 'text') {
          setKeyboardValue(data.value);
        } else {
          setKeyboardValue(data.textValue);
        }
      }
    }

    if (e.key && e.key.toLowerCase() === 'v' && (e.ctrlKey || e.metaKey)) {
      if (_.isFunction(_.get(navigator, 'clipboard.readText'))) {
        navigator.clipboard
          .readText()
          .then(setKeyboardValue)
          .catch(() => {
            if (window.tempCopyForSheetView) {
              handleCopyFromWindow();
            } else {
              alert(_l('请开启浏览器针对此页面的剪贴板读取权限'), 3);
            }
          });
      } else {
        handleCopyFromWindow();
      }

      return;
    }

    switch (e.key) {
      default:
        (() => {
          let value = e.key;

          if (isKeyBoardInputChar(e.key)) {
            this.tempKey.push(e.key);
          }

          if (!e.isInputValue && (!value || !isKeyBoardInputChar(e.key))) {
            return;
          }

          if (cell.type === 6 || cell.type === 8) {
            value = formatNumberFromInput(e.key, false);
          }

          updateEditingStatus(true, () => {
            setTimeout(() => {
              if (e.keyCode === 229) {
                this.handleChange('');
                return;
              }

              const inputDom = this.input.current;

              if (inputDom) {
                inputDom.value = e.isInputValue ? value : this.tempKey.join('');
                this.handleChange(e.isInputValue ? value : this.tempKey.join(''));
                if (window.cellLastKey === 'Enter') {
                  this.handleKeydown({
                    keyCode: 13,
                    stopPropagation: () => {},
                    preventDefault: () => {},
                  });
                  window.cellLastKey = undefined;
                }
              }
            }, 10);
            e.stopPropagation();
            e.preventDefault();
          });
        })();

        break;
    }
  };

  handleKeydown(e) {
    const { tableId, cell, updateEditingStatus } = this.props;

    if (e.keyCode === 27) {
      this.tempKey = [];
      updateEditingStatus(false);
      this.setState({
        value: this.state.oldValue,
      });
      e.preventDefault();
    } else if (e.keyCode === 13) {
      if (this.isMultipleLine && !(e.ctrlKey || e.metaKey)) {
        return;
      }

      e.preventDefault();
      this.handleBlur();
      if (!window.handFocusCell) {
        setTimeout(
          () =>
            emitter.emit('TRIGGER_TABLE_KEYDOWN_' + tableId, {
              keyCode: 40,
              action: 'text_enter_to_next',
              stopPropagation: () => {},
              preventDefault: () => {},
            }),
          100,
        );
      }
    } else if (_.includes(['ArrowUp', 'ArrowDown'], e.key) && _.includes([6, 8], cell.type)) {
      const num = Number(this.state.value);

      if (_.isNumber(num) && !_.isNaN(num)) {
        this.handleChange(num + (e.key === 'ArrowUp' ? 1 * this.step : -1 * this.step));
      }

      e.preventDefault();
    } else if (e.keyCode === 9) {
      this.handleBlur();
    }
  }

  handleUnMask = e => {
    if (!this.masked || window.shareState.shareId) {
      return;
    }

    e.stopPropagation();
    addBehaviorLog('worksheetDecode', this.props.worksheetId, {
      rowId: this.props.recordId,
      controlId: _.get(this.props, 'cell.controlId'),
    });
    if (!this.state.forceShowFullValue) {
      e.preventDefault();
    }

    this.setState({ forceShowFullValue: true });
  };
  render() {
    const {
      columnIndex,
      className,
      tableType,
      style,
      rowIndex,
      from,
      rowHeight,
      needLineLimit,
      cell,
      error,
      popupContainer,
      editable,
      onClick,
      ignoreErrorMessage,
      appId,
      isSubList,
    } = this.props;
    const { rows } = this.context || {};
    // 子表第一行的提示朝下展示，会落在底部统计行上，需要改挂到表格根容器；
    // 多行文本编辑框会向下撑开，提示仍跟随编辑框底部展示（编辑弹层本身已逃逸出表格）
    const showErrorTipAsPopup = isSubList && rowIndex === 0 && !this.isMultipleLine;
    let { value, forceShowFullValue } = this.state;
    const isMobile = browserIsMobile();
    const disabledInput = cell.advancedSetting.dismanual === '1';
    let canedit =
      cell.type === 2 ||
      cell.type === 6 ||
      cell.type === 8 ||
      cell.type === 5 ||
      cell.type === 7 ||
      cell.type === 3 ||
      cell.type === 4;
    canedit = !disabledInput && canedit;
    const isediting = canedit && this.props.isediting;

    if (cell.type === 7) {
      value = (value || '').toUpperCase();
    }

    if (cell.controlId === 'rowid' && (value || '').startsWith('empty-')) {
      value = '';
    }

    const isCard = from === FROM.CARD;
    const editProps = {
      ref: this.input,
      value: value,
      style: {
        width: style.width,
        height: style.height,
      },
      onClick: e => e.stopPropagation(),
      onKeyDown: this.handleKeydown,
    };

    if (cell.type === 6 || cell.type === 8) {
      editProps.maxLength = 16;
    }

    if (cell.type === 38 && cell.enumDefault === 3 && cell.advancedSetting.hideneg === '1' && parseInt(value, 10) < 0) {
      value = '';
    }

    const isMacWxWork = window.isWxWork && /applewebkit/.test(navigator.userAgent.toLowerCase());
    let text = renderText({ ...cell, value }, { noMask: forceShowFullValue, appId });

    if (text.length > 3000) {
      text = text.slice(0, 3000);
    }

    const editcontent = (
      <ClickAwayable
        onClickAwayExceptions={[this.editIcon && this.editIcon.current]}
        onClickAway={this.handleBlur}
        style={{ fontSize: 0 }}
      >
        {cell.enumDefault === 0 || cell.enumDefault === 2 ? (
          <div
            className={cx('textControlInput cellControlEdittingStatus ', `cellForOperate col-${columnIndex}`, {
              cellControlErrorStatus: error,
            })}
            style={{
              display: 'block',
              width: style.width,
              height: style.height,
            }}
          >
            {window.isSafari || isMacWxWork ? ( // 子表行内编辑 input 位置会计算异常 改用textarea模拟
              <Input
                className="Ming stopPropagation"
                {...editProps}
                value={String(_.isUndefined(editProps.value) ? '' : editProps.value).replace(/\r\n|\n/g, ' ')}
                onChange={this.handleChange}
              />
            ) : (
              <input
                type="text"
                className="Ming stopPropagation"
                {...editProps}
                value={String(_.isUndefined(editProps.value) ? '' : editProps.value).replace(/\r\n|\n/g, ' ')}
                onChange={e => this.handleChange(e.target.value)}
              />
            )}
          </div>
        ) : (
          <Textarea
            className={cx('Ming textControlTextArea cellControlEdittingStatus stopPropagation bgPrimary', {
              isMultipleLine: this.isMultipleLine,
              cellControlErrorStatus: error,
              ignoreErrorMessage,
            })}
            {...editProps}
            value={String(_.isUndefined(editProps.value) ? '' : editProps.value)}
            manualRef={ref => (this.input = { current: ref })}
            style={{
              width: style.width,
              minHeight: rowHeight,
              maxHeight: 154,
              borderRadius: 0,
            }}
            onChange={this.handleChange}
          />
        )}
        {error && !showErrorTipAsPopup && (
          <CellErrorTips
            color={ignoreErrorMessage ? 'var(--color-warning)' : undefined}
            pos={rowIndex === 0 ? 'bottom' : 'top'}
            error={error}
          />
        )}
        {this.isMultipleLine && (
          <MultipleLineTip className="ellipsis">
            {window.isMacOs ? _l('⌘+Enter结束编辑') : _l('Ctrl+Enter结束编辑')}
          </MultipleLineTip>
        )}
      </ClickAwayable>
    );
    const editTrigger = (
      <Trigger
        action={['click']}
        popup={editcontent}
        getPopupContainer={
          this.isMultipleLine || includes(className, 'lastFixedColumn')
            ? getPopupContainer(popupContainer, rows, this.isMultipleLine)
            : popupContainer
        }
        popupClassName="filterTrigger"
        popupVisible={isediting}
        destroyPopupOnHide={!window.isSafari} // 不是 Safari
        popupAlign={{
          points: ['tl', 'tl'],
          overflow: {
            adjustY: true,
          },
        }}
      >
        <EditableCellCon
          hideOutline
          onClick={onClick}
          className={cx(className, 'workSheetTextCell', {
            canedit: editable && canedit,
            masked: this.masked && !isCard,
            empty: value === '' || value === null || value === undefined,
            maskHoverTheme: this.masked && isCard && !forceShowFullValue,
            focusInput: cell.type === 2 && editable && canedit,
          })}
          style={style}
          iconName="hr_edit"
          isediting={isediting}
          editable={editable}
          onIconClick={this.handleEdit}
        >
          {!isediting &&
            (!!value || value == 0) &&
            (() => {
              if ((cell.advancedSetting || {}).analysislink === '1') {
                return (
                  <span
                    className={
                      rowHeight > 34 && (cell.type === 32 || (cell.type === 2 && cell.enumDefault === 1))
                        ? cx('worksheetCellPureString nowrap', {
                            linelimit: needLineLimit,
                            ellipsis: isMobile,
                          })
                        : cx({
                            ellipsis: isCard,
                            'w100 InlineBlock': isCard && !this.masked,
                            abstractContent: isCard && isMobile,
                          })
                    }
                    title={text}
                    onClick={this.handleUnMask}
                  >
                    <Linkify
                      properties={{
                        target: '_blank',
                        onClick: e => {
                          e.stopPropagation();
                        },
                      }}
                    >
                      {text}
                    </Linkify>
                  </span>
                );
              } else if (cell.type === 5 && !isMobile) {
                return (
                  <a
                    href={`mailto:${value}`}
                    title={text}
                    onClick={e => {
                      e.stopPropagation();
                      this.handleUnMask(e);
                    }}
                  >
                    {text}
                  </a>
                );
              } else {
                return (
                  <span
                    className={cx({
                      linelimit: needLineLimit,
                      ellipsis: isMobile,
                      'worksheetCellPureString nowrap': cell.type === 2 && cell.enumDefault === 1,
                    })}
                    title={text}
                    onClick={this.handleUnMask}
                  >
                    {text}
                  </span>
                );
              }
            })()}
          {tableType === 'classic' && !text && !isediting && cell.hint && (
            <span className="guideText textDisabled hide">{cell.hint}</span>
          )}
          {isCard && this.masked && !forceShowFullValue && (
            <i
              className="icon icon-eye_off Hand maskData Font16 textDisabled mLeft4 mTop4 hoverShow"
              style={{ verticalAlign: 'text-top' }}
              onClick={this.handleUnMask}
            ></i>
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
        error={error}
        color={ignoreErrorMessage ? 'var(--color-warning)' : undefined}
        popupContainer={popupContainer}
      >
        {editTrigger}
      </CellErrorTipTrigger>
    );
  }
}
