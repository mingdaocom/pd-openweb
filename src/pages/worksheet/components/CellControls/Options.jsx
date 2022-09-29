import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import { isLightColor } from 'src/util';
import { getSelectedOptions } from 'worksheet/util';
import Dropdown from 'src/components/newCustomFields/widgets/Dropdown';
import Checkbox from 'src/components/newCustomFields/widgets/Checkbox';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils.js';
import CellErrorTips from './comps/CellErrorTip';
import { FROM } from './enum';
import EditableCellCon from '../EditableCellCon';

function getOptionStyle(option, cell) {
  return cell.enumDefault2 === 1 && option.color
    ? {
        backgroundColor: option.color,
        color: option.color && isLightColor(option.color) ? '#333' : '#fff',
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
      verticallPlace: 'top',
      value: props.cell.value,
      oldValue: props.cell.value,
    };
    this.popupSpecialFilterClassName = `specialFilter${Math.random()}`.replace(/\./g, '');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value && !nextProps.isediting) {
      this.setState({ value: nextProps.cell.value });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.isediting !== this.props.isediting ||
      (nextProps.cell.value !== this.props.cell.value && !nextProps.isediting) ||
      nextState.value !== this.state.value ||
      nextProps.className !== this.props.className ||
      nextState.verticallPlace !== this.state.verticallPlace
    );
  }

  con = React.createRef();
  cell = React.createRef();

  @autobind
  handleChange(value, forceUpdate) {
    const { cell, updateCell, onValidate } = this.props;
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
    if (error) {
      return;
    }
    updateCell({
      value: formatControlToServer(Object.assign({}, cell, { value })).value,
    });
    if (!value || !isMultiple) {
      this.handleExit();
    }
  }

  @autobind
  handleExit(target) {
    const { cell, error, updateEditingStatus } = this.props;
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
  }

  render() {
    const {
      isSubList,
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
    } = this.props;
    const { value, verticallPlace } = this.state;
    const selectedOptions = value ? getSelectedOptions(cell.options, value) : [];
    const isMultiple = cell.type === 10;
    const getPopupContainer =
      tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ||
      tableFromModule === WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD
        ? () => $(this.cell.current).parents('.recordInfoForm')[0] || document.body
        : popupContainer;
    const showErrorAsPopup =
      (tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ||
        tableFromModule === WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD) &&
      rowIndex === 1;
    const editcontent = (
      <div
        className={cx(
          'cellControlOptionsPopup',
          {
            error: error,
          },
          verticallPlace,
        )}
        ref={this.con}
        style={style}
      >
        {isMultiple ? (
          <Checkbox
            {...{ ...cell, advancedSetting: { ...cell.advancedSetting, checktype: '1' } }}
            isFocus
            dropdownClassName="scrollInTable"
            value={value}
            selectProps={{
              open: true,
              autoFocus: true,
              defaultOpen: true,
              getPopupContainer,
              onDropdownVisibleChange: visible => {
                if (!visible && !this.isChanging) {
                  this.handleExit();
                }
                this.isChanging = false;
              },
            }}
            onChange={value => this.handleChange(value, true)}
          />
        ) : (
          <Dropdown
            {...cell}
            dropdownClassName="scrollInTable"
            value={value}
            selectProps={{
              open: true,
              noPushAdd_: true,
              autoFocus: true,
              defaultOpen: true,
              getPopupContainer,
              onDropdownVisibleChange: visible => {
                if (!error && !visible && !this.isChanging) {
                  this.handleExit();
                }
                this.isChanging = false;
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
        {error && !showErrorAsPopup && <CellErrorTips error={error} pos={rowIndex === 1 ? 'bottom' : 'top'} />}
      </div>
    );
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
          {!!value && (
            <div className={cx('cellOptions cellControl', { singleLine })}>
              {selectedOptions.map((option, index) => (
                <span
                  className="cellOption ellipsis"
                  key={index}
                  style={Object.assign(
                    {},
                    { ...getOptionStyle(option, cell), maxWidth: style.width - 14 },
                    from === FROM.CARD ? { margin: '0px 4px 0px 0px' } : {},
                  )}
                >
                  {option.value}
                </span>
              ))}
            </div>
          )}
        </EditableCellCon>
        {showErrorAsPopup && isediting && (
          <Trigger
            getPopupContainer={getPopupContainer}
            popupVisible={!!error}
            popup={<CellErrorTips error={error} pos={rowIndex === 1 ? 'bottom' : 'top'} />}
            destroyPopupOnHide
            popupAlign={{
              points: ['tl', 'bl'],
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
