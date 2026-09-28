import React, { useCallback, useEffect, useState } from 'react';
import { includes } from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import { useRecordInfo } from 'worksheet/common/recordInfo';
import RecordCard from 'src/components/recordCard';
import { getFilterRelateControls } from 'src/utils/domain/control/filters';
import { controlState } from 'src/utils/domain/control/state';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { useRecords } from './useRecords';

const Title = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-title);
  line-height: 70px;
  padding: 0 26px;
`;

const RecordsCon = styled.div`
  max-height: 500px;
  padding: 0 16px;
  overflow-y: auto;
`;

const noop = () => {};

function getFilterControls(searchId, keyWords) {
  return searchId && keyWords
    ? [
        {
          spliceType: 1,
          isGroup: true,
          groupFilters: [
            {
              controlId: searchId,
              dataType: 2,
              spliceType: 1,
              filterType: 2,
              dynamicSource: [],
              values: [keyWords],
            },
          ],
        },
      ]
    : [];
}

export default function SearchRecordResult({
  appId,
  worksheetId,
  viewId,
  filterId,
  searchId,
  keyWords,
  onClose = noop,
  openRecordInfo,
} = {}) {
  const [error, setError] = useState(false);
  const { loading, records, controls } = useRecords({
    appId,
    worksheetId,
    viewId,
    isGetWorksheet: true,
    filterId,
    keyWords: searchId ? undefined : keyWords,
    filterControls: getFilterControls(searchId, keyWords),
    onError: () => {
      setError(true);
    },
  });
  useEffect(() => {
    if (records.length === 1) {
      openRecordInfo({
        appId,
        worksheetId,
        recordId: records[0].rowid,
        viewId,
      });
      onClose();
    }
  }, [appId, onClose, openRecordInfo, records, viewId, worksheetId]);
  return (
    <Modal
      open
      verticalAlign="bottom"
      width={window.innerWidth - 20 > 960 ? 960 : window.innerWidth - 20}
      onCancel={() => {
        onClose();
      }}
      styles={{ body: { padding: '0 0 26px', position: 'relative' } }}
    >
      <Title>{_l('扫码结果')}</Title>
      <RecordsCon>
        {loading && (
          <div className="pAll35">
            <LoadDiv />
          </div>
        )}
        {!loading && !records.length && (
          <div className="pAll35 TxtCenter">
            <div className="textTertiary Font12">{error ? _l('已删除或无权限') : _l('没有找到符合条件的记录')}</div>
          </div>
        )}
        {!loading &&
          !!records.length &&
          records.map((record, i) => (
            <RecordCard
              key={i}
              data={record}
              appId={appId}
              controls={controls}
              showControls={getFilterRelateControls({ controls })
                .filter(c => !includes([WIDGETS_TO_API_TYPE_ENUM.BAR_CODE], c.type) && controlState(c).visible)
                .slice(0, 5)
                .map(c => c.controlId)}
              disabled
              onClick={() =>
                openRecordInfo({
                  appId,
                  worksheetId,
                  recordId: record.rowid,
                  viewId,
                })
              }
            />
          ))}
      </RecordsCon>
    </Modal>
  );
}

export function useSearchRecordResult() {
  const { open: openRecordInfo, holder: recordInfoHolder } = useRecordInfo();
  const { open: openSearchRecordResult, holder: searchRecordResultHolder } =
    useFunctionWrapComponent(SearchRecordResult);
  const open = useCallback(
    props => openSearchRecordResult({ ...props, openRecordInfo }),
    [openRecordInfo, openSearchRecordResult],
  );

  return {
    open,
    holder: (
      <React.Fragment>
        {searchRecordResultHolder}
        {recordInfoHolder}
      </React.Fragment>
    ),
  };
}
