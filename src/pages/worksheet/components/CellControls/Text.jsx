import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Textarea, Linkify } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAwayable = createDecoratedComponent(withClickAway);
import CellErrorTips from './comps/CellErrorTip';
import EditableCellCon from '../EditableCellCon';
import renderText from './renderText';
import { browserIsMobile, accMul } from 'src/util';

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

const Input = React.forwardRef((props, ref) => {
  const { className, onChange, ...rest } = props;
  return (
    <InputCon className={className}>
      <textarea {...rest} ref={ref} onChange={e => onChange(e.target.value.replace(/\r\n|\n/g, ''))} />
    </InputCon>
  );
});
Input.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
};

export default class Text extends React.Component {
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
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      this.setState({ value: nextProps.cell.value });
    }
  }

  componentDidUpdate(prevProps) {
    const { value, oldValue } = this.state;
    if (!prevProps.isediting && this.props.isediting) {
      if (this.isNumberPercent && value) {
        this.setState({ value: accMul(value, 100), oldValue: oldValue ? accMul(oldValue, 100) : oldValue }, this.focus);
      } else {
        this.focus();
      }
    }
  }
  get isNumberPercent() {
    const { cell } = this.props;
    return _.includes([6, 31, 37], cell.type) && cell.advancedSetting && cell.advancedSetting.numshow === '1';
  }

  con = React.createRef();
  input = React.createRef();

  focus(time) {
    setTimeout(() => {
      if (this.input && this.input.current) {
        const valueLength = (this.input.current.value || '').length;
        this.input.current.focus();
        this.input.current.setSelectionRange(valueLength, valueLength);
      }
    }, time || 100);
  }

  @autobind
  handleEdit(e) {
    const { updateEditingStatus } = this.props;
    e.stopPropagation();
    updateEditingStatus(true, this.focus);
  }

  @autobind
  handleBlur(target) {
    const { cell, error, updateCell, updateEditingStatus } = this.props;
    let { oldValue = '' } = this.state;
    let { value = '' } = this.state;
    if (this.isNumberPercent && value) {
      value = accMul(parseFloat(value), 1 / 100);
      oldValue = accMul(parseFloat(oldValue), 1 / 100);
    }
    if ((cell.type === 6 || cell.type === 8) && value === '-') {
      value = '';
      this.setState({ value });
    }

    if (oldValue === value) {
      if (this.isNumberPercent && value) {
        this.setState({ oldValue, value });
      }
      updateEditingStatus(false);
      return;
    } else if ((cell.enumDefault === 0 || cell.enumDefault === 2) && typeof value === 'string') {
      value = value.replace(/\r\n|\n/g, ' ').trim();
    }
    if (error) {
      updateEditingStatus(false);
      this.setState({
        value: this.state.oldValue,
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
    updateEditingStatus(false);
  }
  @autobind
  handleChange(value) {
    const { cell, onValidate } = this.props;
    if (cell.type === 6 || cell.type === 8) {
      value = value
        .replace(/[^-\d.]/g, '')
        .replace(/^\./g, '')
        .replace(/^-/, '$#$')
        .replace(/-/g, '')
        .replace('$#$', '-')
        .replace(/^-\./, '-')
        .replace('.', '$#$')
        .replace(/\./g, '')
        .replace('$#$', '.');
    }
    onValidate(value);
    this.setState({
      value,
    });
  }

  @autobind
  handleKeydown(e) {
    const { cell, updateEditingStatus } = this.props;
    if (e.keyCode === 27) {
      updateEditingStatus(false);
      this.setState({
        value: this.state.oldValue,
      });
      e.preventDefault();
    }
  }

  render() {
    const {
      className,
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
    } = this.props;
    let { value } = this.state;
    const isMobile = browserIsMobile();
    const canedit =
      cell.type === 2 ||
      cell.type === 6 ||
      cell.type === 8 ||
      cell.type === 5 ||
      cell.type === 7 ||
      cell.type === 3 ||
      cell.type === 4;
    const isediting = canedit && this.props.isediting;
    if (cell.type === 7) {
      value = (value || '').toUpperCase();
    }
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
    if (cell.type === 38 && cell.enumDefault === 3 && cell.advancedSetting.hideneg === '1' && parseInt(value, 10) < 0) {
      value = '';
    }
    const isSafari = /^((?!chrome).)*safari.*$/.test(navigator.userAgent.toLowerCase());
    const isMacWxWork =
      /wxwork/.test(navigator.userAgent.toLowerCase()) && /applewebkit/.test(navigator.userAgent.toLowerCase());
    const text = renderText({ ...cell, value });
    const editcontent = (
      <ClickAwayable
        onClickAwayExceptions={[this.editIcon && this.editIcon.current]}
        onClickAway={this.handleBlur}
        style={{ fontSize: 0 }}
      >
        {cell.enumDefault === 0 || cell.enumDefault === 2 ? (
          <div
            className={cx('textControlInput cellControlEdittingStatus', { cellControlErrorStatus: error })}
            style={{
              display: 'block',
              width: style.width,
              height: style.height,
            }}
          >
            {isSafari || isMacWxWork ? ( // 子表行内编辑 input 位置会计算异常 改用textarea模拟
              <Input
                className="Ming"
                {...editProps}
                value={String(editProps.value || '').replace(/\r\n|\n/g, ' ')}
                onChange={this.handleChange}
              />
            ) : (
              <input
                type="text"
                className="Ming"
                {...editProps}
                value={String(editProps.value || '').replace(/\r\n|\n/g, ' ')}
                style={{}}
                onChange={e => this.handleChange(e.target.value)}
              />
            )}
          </div>
        ) : (
          <Textarea
            className={cx('Ming textControlTextArea cellControlEdittingStatus', { cellControlErrorStatus: error })}
            {...editProps}
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
        {error && <CellErrorTips pos={rowIndex === 1 ? 'bottom' : 'top'} error={error} />}
      </ClickAwayable>
    );
    return (
      <Trigger
        action={['click']}
        popup={editcontent}
        getPopupContainer={popupContainer}
        popupClassName="filterTrigger"
        popupVisible={isediting}
        destroyPopupOnHide={!(navigator.userAgent.match(/[Ss]afari/) && !navigator.userAgent.match(/[Cc]hrome/))} // 不是 Safari
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
          className={cx(className, { canedit: editable && canedit })}
          style={style}
          iconName="hr_edit"
          isediting={isediting}
          onIconClick={this.handleEdit}
        >
          {!isediting &&
            (!!value || value == 0) &&
            (() => {
              if ((cell.type === 2 || cell.type === 32) && (cell.advancedSetting || {}).analysislink === '1') {
                return (
                  <span
                    className={
                      cell.type === 32
                        ? cx('worksheetCellPureString', { linelimit: needLineLimit, ellipsis: isMobile })
                        : ''
                    }
                    title={text}
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
                  <a href={`mailto:${value}`} title={text} onClick={e => e.stopPropagation()}>
                    {value}
                  </a>
                );
              } else {
                return (
                  <div
                    className={cx('worksheetCellPureString', { linelimit: needLineLimit, ellipsis: isMobile })}
                    title={text}
                  >
                    {text}
                  </div>
                );
              }
            })()}
        </EditableCellCon>
      </Trigger>
    );
  }
}
