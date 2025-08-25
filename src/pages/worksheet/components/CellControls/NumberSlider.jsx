import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Slider } from 'ming-ui';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { FROM } from './enum';

const ClickAway = createDecoratedComponent(withClickAway);

const Con = styled.div`
  ${({ isCard }) =>
    isCard
      ? `
  height: 100%;
  align-items: center;
  `
      : ''}
  &.canedit:hover {
    .OperateIcon {
      display: inline-block;
    }
  }
`;

const EditingCon = styled.div`
  padding: 7px 6px;
  background: #fff;
  box-shadow: inset 0 0 0 2px #2d7ff9 !important;
`;

const OperateIcon = styled.div`
  display: none;
  margin-top: -2px;
  width: 24px;
  height: 24px;
  border-radius: 3px;
  background: #fff;
  text-align: center;
  color: #9e9e9e;
  font-size: 16px;
  cursor: pointer;
`;

function levelSafeParse(value) {
  let levelValue = parseFloat(value, 10);
  if (!_.isNumber(levelValue) || _.isNaN(levelValue)) {
    levelValue = undefined;
  }
  return levelValue;
}
export default class NumberSlider extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    rowHeight: PropTypes.number,
    isediting: PropTypes.bool,
    cell: PropTypes.shape({}),
    updateCell: PropTypes.func,
    onClick: PropTypes.func,
    updateEditingStatus: PropTypes.func,
    popupContainer: PropTypes.func,
    onFocusCell: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: levelSafeParse(props.cell.value),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      this.setState({ value: levelSafeParse(nextProps.cell.value) });
    }
  }

  get prevValueId() {
    const { rowIndex, cell } = this.props;
    return `numberSlider-${rowIndex}-${cell.controlId}`;
  }

  handleTableKeyDown = e => {
    const { cell, isediting, editable, updateEditingStatus, updateCell } = this.props;
    const { min, max, numinterval } = cell.advancedSetting || {};
    const minNumber = levelSafeParse(min);
    const maxNumber = levelSafeParse(max);
    if (
      isediting &&
      (e.key === 'Escape' || (e.key === 'Enter' && String(this.state.value) !== cell.value && this.state.changed))
    ) {
      updateEditingStatus(false);
      this.handleExit();
    } else if (isediting && _.includes(['ArrowUp', 'ArrowDown'], e.key)) {
      e.stopPropagation();
      e.preventDefault();
      const step = levelSafeParse(numinterval);
      const value = levelSafeParse(this.state.value || min);
      const newValue = value + step * (e.key === 'ArrowUp' ? 1 : -1);
      if (newValue < minNumber || newValue > maxNumber) {
        return;
      }
      if (_.isNumber(newValue) && !_.isNaN(newValue)) {
        this.setState({ value: newValue, changed: true });
      }
    } else if (/^[0-9]$/.test(e.key)) {
      if (!editable) {
        return;
      }
      let inputValue = Number(e.key);
      const { prevValueId } = this;
      if (!_.isNaN(inputValue)) {
        if (window[prevValueId]) {
          inputValue = Number(window[prevValueId] + '' + inputValue);
        }
        if (
          !_.isUndefined(minNumber) &&
          !_.isUndefined(maxNumber) &&
          (inputValue < minNumber || inputValue > maxNumber)
        ) {
          return;
        }
        window[prevValueId] = inputValue;
        setTimeout(() => {
          window[prevValueId] = undefined;
        }, 500);
        updateCell({
          value: inputValue,
        });
      }
    }
  };

  handleChange = value => {
    const { updateCell, updateEditingStatus, onFocusCell = _.noop } = this.props;
    this.setState({ value });
    updateEditingStatus(false);
    updateCell({
      value,
    });
    onFocusCell();
  };

  handleExit = () => {
    const { updateEditingStatus, updateCell } = this.props;
    const { value } = this.state;
    updateEditingStatus(false);
    this.setState({ changed: false });
    if (value !== this.props.cell.value) {
      updateCell({ value: this.state.value });
    }
  };

  render() {
    const {
      from,
      recordId,
      className,
      style,
      cell = {},
      isediting,
      rowHeight = 34,
      rowIndex,
      editable,
      onClick,
      popupContainer,
      updateEditingStatus,
    } = this.props;
    const { numinterval, min, max, itemcolor, itemnames, numshow } = cell.advancedSetting || {};
    const { value } = this.state;
    const sliderComp = (
      <Slider
        style={from === FROM.CARD ? { padding: 0 } : {}}
        disabled={!editable}
        value={value}
        showInput={false}
        showScale={from !== FROM.CARD}
        showScaleText={isediting || rowHeight > 50}
        showDrag={editable}
        showAsPercent={numshow === '1'}
        numStyle={from === FROM.CARD ? { color: '#151515' } : {}}
        tipDirection={rowIndex === 0 ? 'bottom' : undefined}
        min={levelSafeParse(min)}
        max={levelSafeParse(max)}
        step={levelSafeParse(numinterval)}
        itemnames={itemnames ? JSON.parse(itemnames) : ''}
        itemcolor={itemcolor ? JSON.parse(itemcolor) : ''}
        onChange={this.handleChange}
      />
    );
    if (isediting) {
      return (
        <Trigger
          zIndex={99}
          popup={
            <ClickAway onClickAway={this.handleExit}>
              <EditingCon style={{ width: style.width, minHeight: style.height }}>{sliderComp}</EditingCon>
            </ClickAway>
          }
          getPopupContainer={popupContainer}
          popupClassName="filterTrigger"
          popupVisible={isediting}
          destroyPopupOnHide
          popupAlign={{
            points: ['tl', 'tl'],
          }}
        >
          <div className={className} style={style} onClick={onClick} />
        </Trigger>
      );
    }
    return (
      <Con
        isCard={from === FROM.CARD}
        className={cx(className, 'cellControl flexRow', {
          canedit: editable,
        })}
        style={style}
        onClick={onClick}
      >
        <div className="flex">{recordId !== 'empty' && !/^empty/.test(recordId) && sliderComp}</div>
        {editable && (
          <OperateIcon className="OperateIcon editIcon">
            <i
              className="ThemeHoverColor3 icon icon-edit"
              onClick={e => {
                e.stopPropagation();
                updateEditingStatus(true);
              }}
            />
          </OperateIcon>
        )}
      </Con>
    );
  }
}
