import React, { forwardRef, useImperativeHandle } from 'react';
import { bool, func, number, shape, string } from 'prop-types';
import Trigger from 'rc-trigger';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import styled from 'styled-components';
import { Steps } from 'ming-ui';
import cx from 'classnames';
import { FROM } from './enum';
import { isLightColor } from 'src/util';
import _ from 'lodash';

function getOptionStyle(option, cell) {
  return cell.enumDefault2 === 1 && option.color
    ? {
        backgroundColor: option.color,
        color: option.color && isLightColor(option.color) ? '#151515' : '#fff',
      }
    : {};
}

const ClickAway = createDecoratedComponent(withClickAway);

const Con = styled.div`
  padding: 7px 6px !important;
  &:hover {
    ${({ tableType }) => (tableType !== 'classic' ? 'padding-right: 34px;' : '')}
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

function OptionsSteps(props, ref) {
  const {
    tableType,
    recordId,
    className,
    style,
    from,
    rowIndex,
    mode,
    cell = {},
    rowHeight = 34,
    isediting,
    editable,
    onClick,
    popupContainer,
    updateEditingStatus,
    updateCell,
  } = props;
  const { options, enumDefault2, value } = cell;

  useImperativeHandle(ref, () => ({
    handleTableKeyDown(e) {
      const selectedIndex = _.findIndex(options, { key: safeParse(value)[0] });
      if (e.key === 'Escape') {
        updateEditingStatus(false);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.stopPropagation();
        e.preventDefault();

        // 过滤删除和隐藏的
        const filterOptions = options.filter(i => !i.isDeleted && (i.key === safeParse(value)[0] || !i.hide));
        if (!filterOptions.length) return;

        let nextIndex = selectedIndex + (e.key === 'ArrowUp' ? -1 : 1);
        if (nextIndex < 0) {
          nextIndex = 0;
        }
        if (nextIndex > options.length - 1) {
          nextIndex = options.length - 1;
        }
        if (options[nextIndex]) {
          updateCell({ value: JSON.stringify([options[nextIndex].key]) });
        }
      }
    },
  }));

  if (from === FROM.CARD || mode === 'mobileSub') {
    const option = _.find(options, op => op.key === JSON.parse(value || '[]')[0]) || {};
    return (
      <div className="cellOptions cellControl w100">
        <span
          className="cellOption ellipsis"
          style={Object.assign({}, { ...getOptionStyle(option, cell), margin: '0px 4px 0px 0px', maxWidth: '100%' })}
        >
          {option.value}
        </span>
      </div>
    );
  }

  const sliderComp = (
    <Steps
      tipDirection={rowIndex === 0 ? 'bottom' : undefined}
      disabled={!editable}
      showSelected={!isediting && rowHeight < 50}
      showTip={editable}
      showScaleText={isediting || rowHeight > 50}
      value={JSON.parse(value || '[]')[0]}
      data={{ options, enumDefault2 }}
      onChange={v => {
        updateCell({ value: JSON.stringify(v ? [v] : []) });
      }}
    />
  );
  if (isediting) {
    return (
      <Trigger
        popup={
          <ClickAway
            onClickAway={() => {
              updateEditingStatus(false);
            }}
          >
            <EditingCon style={{ width: style.width, minHeight: style.height }}>{sliderComp}</EditingCon>
          </ClickAway>
        }
        getPopupContainer={() => document.body}
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
      className={cx(className, 'cellControl flexRow', {
        canedit: editable,
      })}
      tableType={tableType}
      style={style}
      onClick={onClick}
    >
      <div className="flex">{recordId !== 'empty' && !/^empty/.test(recordId) && sliderComp}</div>
      {editable && (
        <OperateIcon className="editIcon OperateIcon">
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

OptionsSteps.propTypes = {
  className: string,
  style: shape({}),
  rowIndex: number,
  cell: shape({}),
  isediting: bool,
  editable: bool,
  onClick: func,
  popupContainer: func,
  updateEditingStatus: func,
  updateCell: func,
};

export default forwardRef(OptionsSteps);
