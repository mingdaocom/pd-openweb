import React, { Fragment, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import cx from 'classnames';
import { Icon, SvgIcon } from 'ming-ui';
import ChooseControls from './ChooseControls';

const Wrap = styled.div`
  width: 240px;
  .title {
    padding: 0 16px;
    margin-top: 10px;
  }
  .itemControl {
    padding: 10px 16px;
    &:hover {
      background: #f5f5f5;
    }
    &.hs {
      background: #f5f5f5;
      color: #2196f3;
    }
    svg {
      margin-top: 2px;
    }
  }
`;
const WrapCon = styled.div`
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  padding: 5px 0;
  border-radius: 3px;
  background: white;
  height: 320px;
  .lineLeft {
    width: 0;
    border-left: 1px solid #dddddd;
  }
`;

function ChooseWorksheet(props) {
  const { worksheets, onChange, worksheetId } = props;
  const renderDrop = () => {
    return (
      <React.Fragment>
        <div className="title Bold Gray_75 Font13">{_l('工作表')}</div>
        <div className="mTop6">
          {worksheets
            .filter(o => !o.isDelete)
            .map(o => {
              const hs = worksheetId === o.workSheetId;
              return (
                <div
                  className={cx('itemControl flexRow alignItemsCenter', { hs })}
                  onClick={event => {
                    onChange(o.workSheetId);
                  }}
                >
                  <div className={cx('flex flexRow alignItemsCenter Hand')}>
                    <SvgIcon
                      url={o.iconUrl ? o.iconUrl : `${md.global.FileStoreConfig.pubHost}/customIcon/${o.icon}.svg`}
                      fill={hs ? '#2196f3' : '#757575'}
                      size={16}
                    />
                    <div className={cx('flex mLeft5 overflow_ellipsis WordBreak Bold', hs ? 'ThemeColor3' : 'Gray')}>
                      {o.tableName}
                    </div>
                  </div>

                  <Icon icon={'arrow-right-tip'} className={cx('Hand mLeft10 Gray_9e')} />
                </div>
              );
            })}
        </div>
      </React.Fragment>
    );
  };
  return <Wrap className="">{renderDrop(props)}</Wrap>;
}

export default function ChooseControlsForAggregation(props) {
  const { worksheets } = props;
  const [{ worksheetId }, setState] = useSetState({ worksheetId: props.worksheetId });
  useEffect(() => {
    setState({
      worksheetId: props.worksheetId,
    });
  }, [props.worksheetId]);
  return (
    <WrapCon className="flexRow">
      {worksheets.length > 1 && (
        <ChooseWorksheet
          worksheets={worksheets}
          worksheetId={worksheetId}
          onChange={worksheetId => {
            setState({
              worksheetId,
            });
          }}
        />
      )}
      {worksheetId && (
        <React.Fragment>
          {worksheets.length > 1 && <div className="lineLeft"></div>}
          <ChooseControls
            addRowsCount={true}
            forAggregation
            title={(worksheets.find(o => o.workSheetId === worksheetId) || {}).tableName}
            onChange={data => {
              props.onChange(data, worksheetId);
              setState({
                worksheetId: '',
              });
            }}
            key={worksheetId}
            worksheetId={worksheetId}
            flowData={props.flowData}
            sourceInfos={props.sourceInfos}
          />
        </React.Fragment>
      )}
    </WrapCon>
  );
}
