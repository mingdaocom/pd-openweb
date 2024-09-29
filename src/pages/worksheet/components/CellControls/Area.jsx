import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import EditableCellCon from '../EditableCellCon';
import renderText from './renderText';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import { CityPicker, Input } from 'ming-ui';
import styled from 'styled-components';
import { isKeyBoardInputChar } from 'worksheet/util';

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

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      const value = _.isObject(nextProps.cell.value) ? nextProps.cell.value.text : nextProps.cell.value;
      this.setState({
        value,
        ...(value === '{"code":"","name":""}' ? { tempValue: undefined } : { tempValue: value }),
      });
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

  handleChange = (array, panelIndex) => {
    const { tableFromModule, cell, updateCell, updateEditingStatus } = this.props;
    let level = this.getAreaLevel(cell.type);
    const last = _.last(array);
    const anylevel = _.get(cell, 'advancedSetting.anylevel');
    const index = last.path.split('/').length;

    this.state.search && this.setState({ search: '', keywords: '' });

    // 必须选择最后一级
    if (anylevel === '1' && !last.last && level > index) {
      return;
    }

    const newValue = JSON.stringify({ code: last.id, name: last.path });
    if (!last || (last.path.split('/').length < level && !last.last)) {
      this.setState({ tempValue: newValue });
      return;
    }

    updateCell({
      value: tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ? newValue : last.id,
    });
    this.setState({
      value: newValue,
      tempValue: newValue,
    });
    updateEditingStatus(false);
  };

  handleExit = () => {
    const { tableFromModule, updateCell, updateEditingStatus } = this.props;
    const { value, tempValue } = this.state;

    if (value !== tempValue) {
      updateCell({
        value: tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ? tempValue : safeParse(tempValue).code,
      });
      this.setState({
        value: tempValue,
      });
    }
    this.setState({
      search: '',
      keywords: '',
    });
    updateEditingStatus(false);
  };

  getAreaLevel(type) {
    if (type === 19) {
      return 1; // 省
    }
    if (type === 23) {
      return 2; // 省-市
    }
    if (type === 24) {
      return 3; // 省-市-县
    }
    return 3;
  }

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
      tableFromModule,
      updateEditingStatus,
      updateCell,
      onClick,
    } = this.props;
    const { tempValue, value, search, keywords } = this.state;
    const isMobile = browserIsMobile();
    const level = this.getAreaLevel(cell.type);
    const anylevel = _.get(cell, 'advancedSetting.anylevel');

    return (
      <CityPicker
        search={keywords}
        popupVisible={isediting}
        hasContentContainer={false}
        popupClassName="filterTrigger cellControlAreaPopup cellNeedFocus"
        defaultValue={[]}
        level={level}
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
          const anylevel = _.get(cell, 'advancedSetting.anylevel');
          const last = _.last(array);
          const valueParse = safeParse(tempValue);

          if (!last || (anylevel === '1' && (!last.last || last.path.split('/').length < level))) {
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
          iconName="text_map"
          iconClassName="dateEditIcon"
          isediting={isediting}
          onIconClick={() => updateEditingStatus(true)}
        >
          <div className={cx('worksheetCellPureString', { linelimit: needLineLimit, ellipsis: isMobile })}>
            {isediting ? (
              <InputWrap
                className="CityPicker-input-textCon"
                placeholder={!!tempValue ? renderText({ ...cell, value: tempValue }) : ''}
                value={isediting ? search || '' : !!tempValue ? renderText({ ...cell, value: tempValue }) : ''}
                onChange={value => {
                  this.setState({ search: value });
                  this.onFetchData(value);
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : !!tempValue ? (
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
                }}
              />
            )}
          </div>
        </EditableCellCon>
      </CityPicker>
    );
  }
}
