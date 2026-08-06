import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Slider } from 'ming-ui';
import ClickAway from 'ming-ui/components/ClickAway';
import { FROM } from './enum';

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
  background: var(--color-background-primary);
  box-shadow: inset 0 0 0 2px var(--color-primary-focus) !important;
`;

const OperateIcon = styled.div`
  display: none;
  margin-top: -2px;
  width: 24px;
  height: 24px;
  border-radius: 3px;
  background: var(--color-background-primary);
  text-align: center;
  color: var(--color-text-tertiary);
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
    onValidate: PropTypes.func,
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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.cell.value !== prevProps.cell.value) {
        this.setState({
          value: levelSafeParse(this.props.cell.value),
        });
      }
    }
  }

  get prevValueId() {
    const { rowIndex, cell } = this.props;
    return `numberSlider-${rowIndex}-${cell.controlId}`;
  }

  handleTableKeyDown = e => {
    const { cell, isediting, editable, updateEditingStatus, updateCell, onValidate } = this.props;
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

        if (_.isFunction(onValidate)) {
          onValidate(inputValue);
        }
      }
    }
  };

  handleChange = value => {
    const { updateCell, updateEditingStatus, onValidate, onFocusCell = _.noop } = this.props;
    this.setState({ value });
    updateEditingStatus(false);
    updateCell({
      value,
    });
    // 滑块通过拖动即时提交，不走输入/失焦校验流程；必填报错后重新拖动需主动重新校验，
    // 以清掉持久化在 cellErrors 中的旧错误，否则错误状态不会重置。
    if (_.isFunction(onValidate)) {
      onValidate(value);
    }

    onFocusCell();
  };

  handleExit = () => {
    const { updateEditingStatus, updateCell, onValidate } = this.props;
    const { value } = this.state;
    updateEditingStatus(false);
    this.setState({ changed: false });
    if (value !== this.props.cell.value) {
      updateCell({ value: this.state.value });

      if (_.isFunction(onValidate)) {
        onValidate(this.state.value);
      }
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
      onFocusCell = _.noop,
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
        numStyle={from === FROM.CARD ? { color: 'var(--color-text-primary)' } : {}}
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
              className="hoverColorPrimary icon icon-edit"
              onClick={e => {
                e.stopPropagation();
                // 编辑图标点击阻止了冒泡，不会走 clickHandle 的 onFocusCell，
                // simple 表格下 enterEditing 又不会调 focusCell，导致上一个拖拽聚焦的单元格 focus 不清除。
                // 这里先把焦点切到当前单元格（与普通点击一致），保证上一格正常失焦。
                onFocusCell();
                updateEditingStatus(true);
              }}
            />
          </OperateIcon>
        )}
      </Con>
    );
  }
}
