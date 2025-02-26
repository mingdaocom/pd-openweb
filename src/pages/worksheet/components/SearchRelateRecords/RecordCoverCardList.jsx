import React from 'react';
import { arrayOf, bool, func, number, string, shape } from 'prop-types';
import styled from 'styled-components';
import RecordCoverCard from '../RelateRecordCards/RecordCoverCard';
import { get, find, identity } from 'lodash';

const Con = styled.div`
  padding: 10px 0;
  display: grid;
  grid-gap: 12px;
`;

export default function RecordCoverCardList(props) {
  const {
    col = 3,
    records,
    controls,
    control,
    viewId,
    disabled,
    allowRemove,
    isCharge,
    getCoverUrl = () => undefined,
    sourceEntityName,
    allowlink,
    onCardClick = () => {},
    onDelete = () => {},
  } = props;
  const showControls = get(props, 'control.showControls') || [];
  return (
    <Con
      style={{
        gridTemplateColumns: `repeat(${col}, minmax(200px, 1fr))`,
      }}
    >
      {records.map((record, i) => (
        <RecordCoverCard
          style={{ margin: 0 }}
          key={i}
          controls={showControls.map(scid => find(controls, c => c.controlId === scid)).filter(identity)}
          parentControl={control}
          data={record}
          viewId={viewId}
          disabled={disabled || !allowRemove}
          isCharge={isCharge}
          cover={getCoverUrl(record)}
          allowlink={allowlink}
          sourceEntityName={sourceEntityName}
          onClick={() => onCardClick(record)}
          onDelete={() => onDelete(record)}
        />
      ))}
    </Con>
  );
}

RecordCoverCardList.propTypes = {
  col: number,
  records: arrayOf(shape({})),
  controls: arrayOf(shape({})),
  control: shape({}),
  viewId: string,
  disabled: bool,
  isCharge: bool,
  coverUrl: string,
  sourceEntityName: string,
  allowlink: string,
  onClick: func,
  onDelete: func,
};
