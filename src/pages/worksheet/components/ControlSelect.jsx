import React, { useState } from 'react';
import { arrayOf, string, shape, func, bool, number } from 'prop-types';
import styled from 'styled-components';
import { getIconByType } from 'src/pages/widgetConfig/util';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';
import _ from 'lodash';

const Con = styled.div(
  ({ disabled }) => `
    display: flex;
    border-radius: 3px;
    height: 36px;
    line-height: 34px;
    padding: 0 6px 0 10px;
    border: 1px solid #ddd;
    min-width: 100px;
    cursor: ${disabled ? 'pointer' : ''};
    overflow: hidden;
    ${disabled ? 'background-color: #f5f5f5' : ''}
    .flex {
      flex: 1;
      overflow: hidden;
    }
    .placeholder {
      color: #bdbdbd;
    }
    .downIcon {
      line-height: 34px;
      margin-left: 8px;
    }
`,
);
const ControlIconItemCon = styled.div`
  display: flex;
  align-items: center;
  .controlName {
    flex: 1;
  }
`;

function ControlIconItem(props) {
  const { control = {} } = props;
  const iconName = getIconByType(control.type);
  return (
    <ControlIconItemCon>
      <i className={`icon-${iconName} Gray_9e Font16 mRight8`} />
      <span className="controlName ellipsis" title={control.controlName}>
        {control.controlName}
      </span>
    </ControlIconItemCon>
  );
}

ControlIconItem.propTypes = {
  control: shape({}),
};

export default function ControlSelect(props) {
  const {
    disabled,
    selected,
    style,
    popupStyle,
    offset,
    doNotCloseMenuWhenAdd,
    controls = [],
    hiddenIds = [],
    children,
    isAppendToBody,
    onChange = () => {},
  } = props;
  const control = _.find(controls, { controlId: selected });
  return (
    <AddCondition
      style={popupStyle}
      disabled={disabled}
      renderInParent={!isAppendToBody}
      columns={controls.filter(c => !_.includes(hiddenIds, c.controlId))}
      doNotCloseMenuWhenAdd={doNotCloseMenuWhenAdd}
      onAdd={onChange}
      offset={offset || [0, 0]}
      classNamePopup="addControlDrop"
    >
      {children || (
        <Con disabled={disabled} className="controlSelect" style={style}>
          <div className="flex">
            {!control && <span className="placeholder">{_l('请选择')}</span>}
            {control && <ControlIconItem control={control} />}
          </div>
          <i className="icon-arrow-down-border Font18 Gray_9e downIcon"></i>
        </Con>
      )}
    </AddCondition>
  );
}

ControlSelect.propTypes = {
  disabled: bool,
  selected: string,
  style: shape({}),
  controls: arrayOf(shape({})),
  offset: arrayOf(number),
  hiddenIds: arrayOf(string),
  onChange: func,
};
