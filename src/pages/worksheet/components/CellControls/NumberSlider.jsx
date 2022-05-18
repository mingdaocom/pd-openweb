import React from 'react';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import styled from 'styled-components';
import { Slider } from 'ming-ui';
import cx from 'classnames';
import { FROM } from './enum';
import { autobind } from 'core-decorators';

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
  margin: -7px -6px 0 2px;
  width: 34px;
  height: 34px;
  text-align: center;
  line-height: 34px;
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

  @autobind
  handleChange(value) {
    const { updateCell, updateEditingStatus } = this.props;
    this.setState({ value });
    updateEditingStatus(false);
    updateCell({
      value,
    });
  }

  render() {
    const {
      from,
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
        readonly={!isediting}
        disabled={!editable}
        value={value}
        showInput={false}
        showTip={isediting}
        showScale={from !== FROM.CARD}
        showScaleText={isediting || rowHeight > 50}
        showAsPercent={numshow === '1'}
        numStyle={from === FROM.CARD ? { color: '#333' } : {}}
        tipDirection={rowIndex === 1 ? 'bottom' : undefined}
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
            <ClickAway
              onClickAway={() => {
                updateEditingStatus(false);
              }}
            >
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
        <div className="flex">{sliderComp}</div>
        {editable && (
          <OperateIcon className="OperateIcon">
            <i className="ThemeHoverColor3 icon icon-edit" onClick={() => updateEditingStatus(true)} />
          </OperateIcon>
        )}
      </Con>
    );
  }
}
