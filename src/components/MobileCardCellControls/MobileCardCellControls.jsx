import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MobileCardCellControl from './MobileCardCellControl';

const MobileCardCellControlsWrap = styled.div`
  ${props => (props.colNuber === 2 ? ' display: grid;grid-template-columns: 1fr 1fr;grid-column-gap: 4px;' : '')}
  overflow: hidden;
  padding: 16px 12px 8px;
`;

export default function MobileCardCellControls(props) {
  const { className, colNuber = 1, controls, row } = props;

  return (
    <MobileCardCellControlsWrap colNuber={colNuber} className={className}>
      {controls.map(c => {
        return (
          <MobileCardCellControl
            {...props}
            cellCellWrapClassName={`pBottom12 ${c.className ? c.className : ''}`}
            key={c.controlId}
            control={c}
            canedit={c.canEdit}
            updateCell={c.updateCell ? data => c.updateCell({ ...data, row }) : undefined}
          />
        );
      })}
    </MobileCardCellControlsWrap>
  );
}

MobileCardCellControls.propTypes = {
  className: PropTypes.string,
  colNuber: PropTypes.number,
  controls: PropTypes.array.isRequired,
  row: PropTypes.object.isRequired,
  showControlName: PropTypes.bool,
  isMain: PropTypes.bool,
  sheetSwitchPermit: PropTypes.array,
  appId: PropTypes.string,
  isMobileTable: PropTypes.bool,
};
