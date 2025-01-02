import React, { useEffect, useState } from 'react';
import { Modal, LoadDiv } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import RecordCard from 'src/components/recordCard';
import styled from 'styled-components';
import { useRecords } from './useRecords';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import { includes } from 'lodash';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { getFilterRelateControls } from 'src/pages/widgetConfig/util';

const Title = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #151515;
  line-height: 70px;
  padding: 0 26px;
`;

const RecordsCon = styled.div`
  max-height: 500px;
  padding: 0 16px;
  overflow-y: auto;
`;

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
  onClose = () => {},
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
  }, [records]);
  return (
    <Modal
      visible
      verticalAlign="bottom"
      width={window.innerWidth - 20 > 960 ? 960 : window.innerWidth - 20}
      closeSize={50}
      onCancel={() => {
        onClose();
      }}
      bodyStyle={{ padding: '0 0 26px', position: 'relative' }}
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
            <div className="Gray_9e Font12">{error ? _l('已删除或无权限') : _l('没有找到符合条件的记录')}</div>
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
              showControls={getFilterRelateControls(controls)
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

export function showFilteredRecords(props) {
  functionWrap(SearchRecordResult, props);
}
