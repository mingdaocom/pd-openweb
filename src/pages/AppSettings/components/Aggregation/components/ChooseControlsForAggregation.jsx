import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import ChooseControls from './ChooseControls';

const Wrap = styled.div`
  width: 240px;
  overflow-y: auto;
  .title {
    padding: 0 16px;
    margin-top: 10px;
  }
  .itemControl {
    padding: 10px 16px;
    line-height: 16px;
    &:hover {
      background: var(--color-background-hover);
    }
    &.hs {
      background: var(--color-background-secondary);
      color: var(--color-primary);
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
  background: var(--color-background-primary);
  height: 320px;
  overflow-y: auto;
  .lineLeft {
    width: 0;
    border-left: 1px solid var(--color-border-primary);
  }
`;

function ChooseWorksheet(props) {
  const { worksheets, onChange, worksheetId } = props;
  const renderDrop = () => {
    return (
      <React.Fragment>
        <div className="title Bold textSecondary Font13">{_l('工作表')}</div>
        <div className="mTop6">
          {worksheets
            .filter(o => !o.isDelete)
            .map(o => {
              const hs = worksheetId === o.workSheetId;
              return (
                <div
                  className={cx('itemControl flexRow alignItemsCenter', { hs })}
                  onClick={() => {
                    onChange(o.workSheetId);
                  }}
                >
                  <div className={cx('flex flexRow alignItemsCenter Hand')}>
                    <SvgIcon
                      url={o.iconUrl ? o.iconUrl : `${md.global.FileStoreConfig.pubHost}/customIcon/${o.icon}.svg`}
                      fill={hs ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                      size={16}
                    />
                    <div
                      className={cx('flex mLeft5 overflow_ellipsis WordBreak Bold', hs ? 'ThemeColor3' : 'textPrimary')}
                    >
                      {o.tableName}
                    </div>
                  </div>

                  <Icon icon={'arrow-right-tip'} className={cx('Hand mLeft10 textTertiary')} />
                </div>
              );
            })}
        </div>
      </React.Fragment>
    );
  };
  return <Wrap className="">{renderDrop()}</Wrap>;
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
