import React, { useEffect, useRef, useState } from 'react';
import PropTypes, { bool, func, shape, string } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import { useClickAway } from 'react-use';
import { Textarea } from 'ming-ui';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import { isLightColor } from 'src/util';
import { getSelectedOptions, isKeyBoardInputChar } from 'worksheet/util';
import Dropdown from 'src/components/newCustomFields/widgets/Dropdown';
import Checkbox from 'src/components/newCustomFields/widgets/Checkbox';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils.js';
import CellErrorTips from './comps/CellErrorTip';
import { FROM } from './enum';
import EditableCellCon from '../EditableCellCon';
import _, { isEmpty } from 'lodash';

const OtherOptionCon = styled.div`
  background: #fff;
  height: 100%;
  padding: 7px 8px;
  .icon {
    float: right;
    font-size: 14px;
    color: #9e9e9e;
    line-height: 20px;
  }
`;

const OtherOptionTextInputCon = styled.div`
  width: 280px;
  position: relative;
  background: #fff;
  z-index: 2;
  padding: 8px 12px;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.16);
  border-radius: 3px 3px 3px 3px;
  .header {
    margin-bottom: 8px;
    display: flex;
  }
  .usage {
    color: #9e9e9e;
  }
  .reSelect {
    cursor: pointer;
  }
  textarea {
    padding: 6px 8px 24px !important;
    line-height: 1.5em;
  }
  &.error {
    textarea {
      border-color: #f44336;
    }
  }
`;

function OtherOptionTextInput(props) {
  const { className, value = '', onChange, handleSave, onSave } = props;
  const textRef = useRef();
  useEffect(() => {
    try {
      textRef.current.textarea.focus();
      textRef.current.textarea.selectionStart = textRef.current.textarea.selectionEnd =
        textRef.current.textarea.value.length;
    } catch (err) {}
  }, []);
  return (
    <OtherOptionTextInputCon className={className}>
      <div className="header">
        <span className="usage">{`${value.length}/200`}</span>
        <div className="flex"></div>
        <span className="reSelect ThemeColor3 ThemeHoverColor2" onClick={() => onSave('')}>
          {_l('重新选择')}
        </span>
      </div>
      <Textarea
        ref={textRef}
        value={value}
        minHeight={122}
        maxHeight={122}
        onChange={onChange}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            handleSave();
            e.stopPropagation();
            return;
          }
        }}
      />
    </OtherOptionTextInputCon>
  );
}

OtherOptionTextInput.propTypes = {
  className: string,
  value: string,
  onSave: func,
  onChange: func,
};

function OtherOption(props) {
  const { style, otherRequired, otherValue = '', getPopupContainer, selected = {}, onSave = () => {} } = props;
  const [value, setValue] = useState(otherValue);
  const [error, setError] = useState();
  const conRef = useRef();
  function handleSave() {
    if (otherRequired && !value.trim()) {
      setError(true);
      alert(_l('请填写补充信息'), 3);
      return;
    }
    onSave(value ? 'other:' + value.trim() : 'other');
  }
  useClickAway(conRef, handleSave);
  return (
    <Trigger
      getPopupContainer={getPopupContainer}
      popupVisible
      popup={
        <div ref={conRef}>
          <OtherOptionTextInput
            className={cx({ error })}
            value={value}
            onChange={v => {
              if (v) {
                setError(false);
              }
              setValue(v.slice(0, 200));
            }}
            onSave={onSave}
            handleSave={handleSave}
          />
        </div>
      }
      destroyPopupOnHide
      popupAlign={{
        points: ['tl', 'bl'],
        overflow: { adjustY: true },
      }}
    >
      <OtherOptionCon className="cellControlEdittingStatus" style={style}>
        {selected.value}
        <span className="icon icon-arrow-down-border"></span>
      </OtherOptionCon>
    </Trigger>
  );
}

OtherOption.propTypes = {
  style: shape({}),
  otherRequired: bool,
  otherValue: string,
  onSave: func,
  getPopupContainer: func,
};

function getOptionStyle(option, cell) {
  return (cell.enumDefault2 === 1 && option.color) || cell.controlId === 'wfstatus'
    ? {
        backgroundColor: option.color,
        color:
          (option.color && isLightColor(option.color)) ||
          (cell.controlId === 'wfstatus' && _.includes(['abort', 'other'], option.key))
            ? '#151515'
            : '#fff',
      }
    : {};
}

export default class Options extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    singleLine: PropTypes.bool,
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    popupContainer: PropTypes.any,
    cell: PropTypes.shape({ value: PropTypes.string }),
    updateCell: PropTypes.func,
    updateEditingStatus: PropTypes.func,
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      verticalPlace: 'top',
      value: props.cell.value,
      oldValue: props.cell.value,
    };
    this.popupSpecialFilterClassName = `specialFilter${Math.random()}`.replace(/\./g, '');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value && !nextProps.isediting) {
      this.setState({ value: nextProps.cell.value });
    } else if (this.props.isediting && !nextProps.isediting && this.state.value !== nextProps.cell.value) {
      this.setState({ value: nextProps.cell.value });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.style !== this.props.style ||
      nextProps.isediting !== this.props.isediting ||
      (nextProps.cell.value !== this.props.cell.value && !nextProps.isediting) ||
      nextState.value !== this.state.value ||
      nextProps.className !== this.props.className ||
      nextState.verticalPlace !== this.state.verticalPlace
    );
  }

  get isSubList() {
    return this.props.tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST;
  }
  get isRelateRecord() {
    return this.props.tableFromModule === WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD;
  }

  con = React.createRef();
  cell = React.createRef();

  handleChange = (value, { forceUpdate, needUpdateCell, noUpdateCell } = {}) => {
    const { cell, updateCell, onValidate } = this.props;
    const isOther =
      (typeof value === 'string' && value.startsWith('other')) || (value && value[0] && value[0].startsWith('other'));
    const isMultiple = cell.type === 10;
    this.isChanging = true;
    if (!forceUpdate) {
      if (value === '0' || value === 0) {
        value = '';
      }
      if (typeof value === 'string') {
        value = [value];
      }
      value = JSON.stringify((value || []).sort().reverse());
    }
    const error = !onValidate(value);
    this.setState({
      value,
      ...(error ? {} : { oldValue: value }),
    });
    if (!isMultiple && isOther && !needUpdateCell) {
      return;
    }
    if (!isMultiple && noUpdateCell) {
      return;
    }
    if (error) {
      return;
    }
    if (isMultiple && this.isSubList) {
      this.setState({
        value,
      });
      return;
    }
    updateCell({
      value: formatControlToServer(Object.assign({}, cell, { value })).value,
    });
    if (!value || !isMultiple) {
      this.handleExit();
    }
  };

  handleTableKeyDown = e => {
    const { updateEditingStatus } = this.props;
    switch (e.key) {
      case 'Tab':
      case 'Escape':
        this.handleExit();
        break;
      default:
        if (!isKeyBoardInputChar(e.key)) {
          return;
        }
        updateEditingStatus(true);
        break;
    }
  };

  handleExit = target => {
    const { cell, error, updateEditingStatus, updateCell } = this.props;
    const { value } = this.state;
    const isMultiple = cell.type === 10;
    if (!isMultiple || !error) {
      updateEditingStatus(false);
    } else if (error) {
      updateEditingStatus(false);
      this.setState({
        value: this.state.oldValue,
      });
      return;
    }
    if (isMultiple && this.isSubList && value !== this.props.cell.value) {
      updateCell({
        value: formatControlToServer(Object.assign({}, cell, { value })).value,
      });
    }
  };

  getShowValue(option, { defaultEmpty = false } = {}) {
    const { value } = this.state;
    if (option.key === 'other') {
      const otherValue = _.find(JSON.parse(value || '[]'), i => i.includes(option.key));
      if (defaultEmpty && otherValue === 'other') {
        return;
      }
      return otherValue === 'other' ? option.value : _.replace(otherValue, 'other:', '') || option.value;
    }
    return option.value;
  }

  render() {
    const {
      tableType,
      from,
      className,
      rowIndex,
      style,
      error,
      tableFromModule,
      popupContainer,
      singleLine,
      cell,
      editable,
      isediting,
      updateEditingStatus,
      onClick,
      fromEmbed,
    } = this.props;
    const { value, verticalPlace } = this.state;
    const selectedOptions = value ? getSelectedOptions(cell.options, value, cell) : [];
    const isMultiple = cell.type === 10;
    const isOther = selectedOptions[0] && selectedOptions[0].key === 'other';
    let getPopupContainer =
      this.isSubList || this.isRelateRecord
        ? () => $(this.cell.current).parents('.recordInfoForm')[0] || document.body
        : popupContainer;
    if ((this.isSubList && isOther) || fromEmbed) {
      getPopupContainer = () => document.body;
    }
    const showErrorAsPopup = (this.isSubList || this.isRelateRecord) && rowIndex === 0;
    let editcontent;
    if (!isMultiple && isOther) {
      editcontent = (
        <OtherOption
          style={style}
          otherRequired={_.get(cell, 'advancedSetting.otherrequired') === '1'}
          otherValue={this.getShowValue(selectedOptions[0], { defaultEmpty: true })}
          selected={selectedOptions[0]}
          getPopupContainer={getPopupContainer}
          onSave={newValue => {
            this.handleChange(newValue, newValue === '' ? { noUpdateCell: true } : { needUpdateCell: true });
          }}
        />
      );
    } else {
      editcontent = (
        <div
          className={cx(
            'cellControlOptionsPopup',
            {
              error: error,
            },
            verticalPlace,
          )}
          ref={this.con}
          style={style}
        >
          {isMultiple ? (
            <Checkbox
              {...{ ...cell, advancedSetting: { ...cell.advancedSetting, checktype: '1' } }}
              isSubList={this.isSubList}
              isSheet
              isFocus
              dropdownClassName="scrollInTable"
              value={value}
              selectProps={{
                open: true,
                autoFocus: true,
                defaultOpen: true,
                getPopupContainer,
                onInputKeyDown: e => {
                  if (e.key === 'Escape') {
                    this.handleExit();
                  } else if (e.key === 'Tab') {
                    setTimeout(() => {
                      document.activeElement.blur();
                    }, 100);
                  }
                },
                onDropdownVisibleChange: visible => {
                  if (!visible && !this.isChanging) {
                    this.handleExit();
                  }
                  this.isChanging = false;
                },
              }}
              onChange={value => this.handleChange(value, { forceUpdate: true })}
            />
          ) : (
            <Dropdown
              {...cell}
              isSubList={this.isSubList}
              dropdownClassName="scrollInTable"
              value={value}
              selectProps={{
                open: true,
                noPushAdd_: true,
                autoFocus: true,
                defaultOpen: true,
                getPopupContainer,
                onDropdownVisibleChange: visible => {
                  if ((!error || this.isSubList) && !visible && !this.isChanging) {
                    this.handleExit();
                  }
                  this.isChanging = false;
                },
                onInputKeyDown: e => {
                  if (e.key === 'Escape') {
                    this.handleExit();
                  } else if (e.key === 'Tab') {
                    setTimeout(() => {
                      document.activeElement.blur();
                    }, 100);
                  }
                },
                onChange: value => {
                  if (_.isObject(value)) {
                    value = value.value;
                  }
                  this.handleChange(value);
                },
              }}
            />
          )}
          {error && !showErrorAsPopup && <CellErrorTips error={error} pos={rowIndex === 0 ? 'bottom' : 'top'} />}
        </div>
      );
    }

    return (
      <React.Fragment>
        <EditableCellCon
          hideOutline
          conRef={this.cell}
          onClick={onClick}
          className={cx(className, { canedit: editable })}
          style={Object.assign({}, style, from !== FROM.CARD ? { padding: '5px 6px' } : {})}
          iconName={'arrow-down-border'}
          isediting={isediting}
          onIconClick={() => updateEditingStatus(true)}
        >
          {!!value && !isEmpty(selectedOptions) && (
            <div className={cx('cellOptions cellControl', { singleLine })}>
              {selectedOptions.map((option, index) => {
                return (
                  <span
                    className="cellOption ellipsis"
                    key={index}
                    style={Object.assign({}, { ...getOptionStyle(option, cell), maxWidth: style.width - 14 })}
                  >
                    {this.getShowValue(option)}
                  </span>
                );
              })}
            </div>
          )}
          {tableType === 'classic' && !isediting && (!value || value === '[]') && cell.hint && (
            <span className="guideText Gray_bd hide mTop2">{cell.hint}</span>
          )}
        </EditableCellCon>
        {showErrorAsPopup && isediting && (
          <Trigger
            getPopupContainer={getPopupContainer}
            popupVisible={!!error}
            popup={<CellErrorTips error={error} pos={rowIndex === 0 ? 'bottom' : 'top'} />}
            destroyPopupOnHide
            popupAlign={{
              points: ['tl', 'bl'],
              overflow: { adjustX: true, adjustY: true },
            }}
          >
            {editcontent}
          </Trigger>
        )}
        {!showErrorAsPopup && isediting && editcontent}
      </React.Fragment>
    );
  }
}
