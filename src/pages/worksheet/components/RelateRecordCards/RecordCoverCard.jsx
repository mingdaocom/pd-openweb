import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CellControl from 'worksheet/components/CellControls';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import { checkCellIsEmpty } from 'worksheet/util';
import { browserIsMobile } from 'src/util';

const Con = styled.div`
  display: inline-flex;
  flex-direction: row;
  margin: 0 10px 14px 0;
  position: relative;
  border-radius: 3px;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 4px 0px, rgba(0, 0, 0, 0.12) 0px 0px 2px 0px;
  &:hover {
    box-shadow: rgba(0, 0, 0, 0.12) 0px 4px 12px 0px, rgba(0, 0, 0, 0.12) 0px 0px 2px 0px;
  }
  &:hover .icon-minus-square {
    display: inline-block;
  }
  &:last-child {
    margin-bottom: 0px;
  }
`;

const Title = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #333;
`;

const DeleteButton = styled.span`
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 20px;
  color: #757575;
  line-height: 1em;
  overflow: hidden;
  .icon-minus-square {
    display: none;
    cursor: pointer;
    position: relative;
  }
  &::before {
    content: ' ';
    position: absolute;
    width: 10px;
    height: 10px;
    background: #fff;
    left: 5px;
    top: 5px;
  }
`;

const ControlCon = styled.div`
  flex: 1;
  padding: 12px 16px;
  overflow: hidden;
`;

const Control = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 12px;
  line-height: 28px;
  .label {
    width: 40%;
    max-width: 160px;
    color: #9e9e9e;
  }
  .content {
    flex: 1;
    height: 28px;
    overflow: hidden;
    white-space: nowrap;
    .cellOptions,
    .cellDepartments,
    .cellUsers,
    .RelateRecordDropdown {
      overflow: hidden;
      width: 100%;
    }
    * {
      font-size: 12px !important;
    }
  }
`;

const Empty = styled.span`
  display: inline-block;
  width: 22px;
  height: 6px;
  background: #eaeaea;
  border-radius: 3px;
`;

function click(func) {
  return e => {
    e.stopPropagation();
    func();
  };
}

export default function RecordCoverCard(props) {
  const { disabled, width, title, controls, data, cover, onClick, onDelete, viewId } = props;
  const coverSize = 47 + 28 * controls.slice(0, 3).length;
  const isMobile = browserIsMobile();
  return (
    <Con onClick={onClick} style={width ? { width } : {}} className={!disabled && 'Hand'}>
      {!disabled && (
        <DeleteButton onClick={click(onDelete)}>
          <i className="icon icon-minus-square" style={isMobile ? { display: 'inline-block' } : {}}></i>
        </DeleteButton>
      )}
      <ControlCon
        style={{
          ...(controls.length ? { paddingBottom: 10 } : {}),
        }}
      >
        <Title key="title" className="ellipsis" title={title} style={{ marginBottom: controls.length ? 8 : 0 }}>
          {title}
        </Title>
        {controls.slice(0, 3).map((control, i) => (
          <Control key={i}>
            <div className="label ellipsis">{control.controlName}</div>
            <div className={`content control${control.type}`}>
              {!checkCellIsEmpty(data[control.controlId]) ? (
                <CellControl
                  cell={Object.assign({}, control, { value: data[control.controlId] })}
                  from={4}
                  viewId={viewId}
                />
              ) : (
                <Empty />
              )}
            </div>
          </Control>
        ))}
      </ControlCon>
      {cover && !!controls.length && (
        <img
          src={cover}
          style={{
            width: coverSize,
            height: coverSize,
            boxSizing: 'content-box',
            borderTopRightRadius: '3px',
            borderBottomRightRadius: '3px',
            borderLeft: '1px solid rgb(0, 0, 0, .04)',
            objectFit: 'contain',
          }}
          onClick={e => {
            e.stopPropagation();
            previewQiniuUrl(cover.replace(/\?(.*)/, ''));
          }}
        />
      )}
    </Con>
  );
}

RecordCoverCard.propTypes = {
  disabled: PropTypes.bool,
  title: PropTypes.string,
  width: PropTypes.number,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  data: PropTypes.shape({}),
  cover: PropTypes.string,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
};
