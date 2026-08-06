import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CityPicker, Input } from 'ming-ui';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import { browserIsMobile } from 'src/utils/common';
import { isKeyBoardInputChar } from 'src/utils/common';
import { renderText } from 'src/utils/control';
import EditableCellCon from '../EditableCellCon';

const InputWrap = styled(Input)`
  border: none !important;
  height: 100% !important;
`;

export default class Date extends React.Component {
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
    const value = _.isObject(props.cell.value) ? props.cell.value.text : props.cell.value;
    this.state = {
      value,
      tempValue: value,
      search: undefined,
      keywords: '',
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.cell.value !== prevProps.cell.value) {
        const value = _.isObject(this.props.cell.value) ? this.props.cell.value.text : this.props.cell.value;
        this.setState({
          value,
          ...(value === '{"code":"","name":""}'
            ? {
                tempValue: undefined,
              }
            : {
                tempValue: value,
              }),
        });
        this.tempValue = value === '{"code":"","name":""}' ? undefined : value;
      }
    }
  }

  con = React.createRef();
  editIcon = React.createRef();

  handleTableKeyDown = e => {
    const { isediting, updateEditingStatus } = this.props;

    switch (e.key) {
      case 'Tab':
      case 'Escape':
        this.handleExit();
        break;
      case 'Enter':
        updateEditingStatus(true);
        setTimeout(() => {
          const input = document.querySelector('.CityPicker-input-textCon');

          if (input) {
            input.focus();
          }
        }, 100);
        break;
      default:
        (() => {
          if (!e.isInputValue && (isediting || !e.key || !isKeyBoardInputChar(e.key))) {
            return;
          }

          updateEditingStatus(true);
          setTimeout(() => {
            const input = document.querySelector('.worksheetCellPureString .CityPicker-input-textCon');
            this.setState({ search: e.key }, () => {
              if (input) {
                input.focus();
              }

              this.onFetchData(e.key);
            });
          }, 100);
          e.stopPropagation();
          e.preventDefault();
        })();
    }
  };

  handleChange = (array, panelIndex, autoClose = true) => {
    const { tableFromModule, cell, updateCell, updateEditingStatus, onValidate } = this.props;
    const last = _.last(array);
    const anylevel = _.get(cell, 'advancedSetting.anylevel');
    const index = last.path.split('/').length;

    this.state.search && this.setState({ search: '', keywords: '' });

    // 必须选择最后一级
    if (anylevel === '1' && !last.last && index < cell.enumDefault2) {
      return;
    }

    const newValue = JSON.stringify({ code: last.id, name: last.path });

    if (!last || (last.path.split('/').length < cell.enumDefault2 && !last.last)) {
      this.setState({ tempValue: newValue });
      this.tempValue = newValue;
      return;
    }

    const valueToUpdate = tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ? newValue : last.id;
    updateCell({
      value: valueToUpdate,
    });
    this.setState({
      value: newValue,
      tempValue: newValue,
    });
    this.tempValue = newValue;
    // 地区通过浮层选择即时提交，不走输入/失焦校验流程；必填报错后重新选择需主动重新校验，
    // 以清掉持久化在 cellErrors 中的旧错误，否则错误状态不会重置。
    if (_.isFunction(onValidate)) {
      onValidate(valueToUpdate);
    }

    autoClose && updateEditingStatus(false);
  };

  handleExit = () => {
    const { tableFromModule, updateCell, updateEditingStatus, onValidate } = this.props;
    const { value } = this.state;
    const tempValue = this.tempValue;

    if (value !== tempValue) {
      const valueToUpdate =
        tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ? tempValue : safeParse(tempValue).code;
      updateCell({
        value: valueToUpdate,
      });
      this.setState({
        value: tempValue,
      });
      if (_.isFunction(onValidate)) {
        onValidate(valueToUpdate);
      }
    }

    this.setState({
      search: '',
      keywords: '',
    });
    updateEditingStatus(false);
  };

  onFetchData = _.debounce(keywords => {
    this.setState({ keywords });
  }, 500);

  render() {
    const {
      className,
      style,
      needLineLimit,
      cell,
      editable,
      isediting,
      updateEditingStatus,
      updateCell,
      onClick,
      projectId,
    } = this.props;
    const { tempValue, search, keywords } = this.state;
    const isMobile = browserIsMobile();
    const anylevel = _.get(cell, 'advancedSetting.anylevel');
    const chooserange = _.get(cell, 'advancedSetting.chooserange');
    const commcountries = _.get(cell, 'advancedSetting.commcountries');

    return (
      <CityPicker
        search={keywords}
        popupVisible={isediting}
        selectCode={tempValue ? safeParse(tempValue).code : ''}
        chooserange={chooserange}
        commcountries={commcountries}
        hasContentContainer={false}
        popupClassName="filterTrigger cellControlAreaPopup cellNeedFocus"
        defaultValue={[]}
        level={cell.enumDefault2}
        projectId={projectId}
        manual={true}
        mustLast={anylevel === '1'}
        popupAlign={{
          points: ['bl', 'tl'],
          offset: [-1, -2],
          overflow: {
            adjustY: true,
            adjustX: true,
          },
        }}
        callback={this.handleChange}
        handleClose={(array = []) => {
          const last = _.last(array);
          const valueParse = safeParse(this.tempValue);

          if (
            _.isEmpty(valueParse) ||
            !last ||
            (anylevel === '1' && (!last.last || last.path.split('/').length < cell.enumDefault2))
          ) {
            updateEditingStatus(false);
            return;
          }

          if (last.id !== valueParse.code) {
            this.setState(
              {
                tempValue: JSON.stringify({ code: last.id, name: last.path }),
              },
              () => {
                this.handleExit();
              },
            );
          } else {
            this.handleExit();
          }
        }}
        destroyPopupOnHide={!window.isSafari} // 不是 Safari
        disabled={!isediting}
      >
        <EditableCellCon
          conRef={this.con}
          onClick={onClick}
          className={cx(className, 'cellControlArea', { canedit: editable, focusInput: editable })}
          style={style}
          iconRef={this.editIcon}
          iconName="map"
          iconClassName="dateEditIcon"
          isediting={isediting}
          onIconClick={() => updateEditingStatus(true)}
        >
          <div className={cx('worksheetCellPureString', { linelimit: needLineLimit, ellipsis: isMobile })}>
            {isediting ? (
              <InputWrap
                className="CityPicker-input-textCon"
                placeholder={tempValue ? renderText({ ...cell, value: tempValue }) : ''}
                value={isediting ? search || '' : tempValue ? renderText({ ...cell, value: tempValue }) : ''}
                onChange={value => {
                  this.setState({ search: value });
                  this.onFetchData(value);
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : tempValue ? (
              renderText({ ...cell, value: tempValue })
            ) : null}
            {isediting && !cell.required && (
              <i
                className="clearBtn icon icon-cancel"
                onClick={e => {
                  e.stopPropagation();
                  updateCell({
                    value: '',
                  });
                  this.setState({
                    value: '',
                    tempValue: '',
                    search: '',
                    keywords: '',
                  });
                  this.tempValue = '';
                }}
              />
            )}
          </div>
        </EditableCellCon>
      </CityPicker>
    );
  }
}
