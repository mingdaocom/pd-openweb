import React from 'react';
import { bool, func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import BarCode from 'src/components/newCustomFields/widgets/BarCode';
import cx from 'classnames';
import _ from 'lodash';

const Con = styled.div`
  padding: 4px 6px !important;
  img {
    height: ${({ imgHeight }) => imgHeight}px !important;
    width: auto !important;
  }
  &:hover {
    padding-right: 34px;
    .OperateIcon {
      display: inline-block;
    }
  }
`;

export default function OptionsSteps(props) {
  const { className, recordId = '', style, rowFormData, cell = {}, rowHeight = 34, onClick } = props;
  return (
    <Con className={cx(className, 'cellControl flexRow')} style={style} imgHeight={rowHeight - 9} onClick={onClick}>
      {!recordId.startsWith('empty') && (
        <BarCode
          isCell
          {...{
            ...cell,
            advancedSetting: { ...cell.advancedSetting, width: 200 },
            ..._.pick(props, ['recordId', 'appId', 'worksheetId', 'viewId']),
          }}
          formData={!rowFormData ? null : _.isFunction(rowFormData) ? rowFormData() : rowFormData}
        />
      )}
    </Con>
  );
}

OptionsSteps.propTypes = {
  className: string,
  style: shape({}),
  rowHeight: number,
  cell: shape({}),
  onClick: func,
};
