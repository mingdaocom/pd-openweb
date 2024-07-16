import React from 'react';
import { CommonDisplay } from '../../styled';
import { Slider } from 'ming-ui';
import { getAdvanceSetting, levelSafeParse } from '../../util';
import { get, head } from 'lodash';
import styled from 'styled-components';

const NumberControlWrap = styled.div`
  display: flex;
  align-items: center;
  .numberContent {
    flex: 1;
    ${props => (props.isStep ? 'border-radius: 3px 0 0 3px;' : '')}
  }
  .numberControl {
    display: flex;
    flex-direction: column;
    .iconWrap {
      padding: 0 6px;
      border: 1px solid #e0e0e0;
      border-left: none;
      height: 17px;
      &:first-child {
        border-bottom: none;
      }
      i {
        color: #9e9e9e;
      }
    }
  }
`;

export default function FormulaNumber({ data }) {
  const { hint } = data;
  const { showtype, min, max, numinterval, showinput } = getAdvanceSetting(data);
  const defaultValue = getAdvanceSetting(data, 'defsource');
  const defValue = get(head(defaultValue), 'staticValue');
  const isStep = showtype === '3';

  if (showtype === '2') {
    const itemnames = getAdvanceSetting(data, 'itemnames');
    const itemcolor = getAdvanceSetting(data, 'itemcolor');
    return (
      <Slider
        disabled={true}
        showTip={false}
        itemnames={itemnames}
        itemcolor={itemcolor}
        showInput={showinput === '1'}
        min={parseFloat(min)}
        max={parseFloat(max)}
        step={parseFloat(numinterval)}
        value={levelSafeParse(defValue)}
      />
    );
  }

  return (
    <NumberControlWrap isStep={isStep}>
      <CommonDisplay className="numberContent">
        <div className="hint overflow_ellipsis">{defValue || hint}</div>
      </CommonDisplay>
      {isStep && (
        <div className="numberControl">
          <div className="iconWrap ">
            <i className="icon-arrow-up-border pointer" />
          </div>
          <div className="iconWrap">
            <i className="icon-arrow-down-border pointer" />
          </div>
        </div>
      )}
    </NumberControlWrap>
  );
}
