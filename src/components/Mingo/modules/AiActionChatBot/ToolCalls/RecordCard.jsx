import React, { useEffect, useState } from 'react';
import { find, get, identity, includes } from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import CardCellControls from 'src/pages/worksheet/components/RelateRecordCards/CardCellControls';
import { getTitleTextFromControls } from 'src/utils/control';

const Con = styled.div`
  padding: 16px;
  .cardCellControls {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
  .label {
    line-height: inherit !important;
  }
`;

function RecordCard({ showAsTitle, config, functionArguments }) {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [data, setData] = useState({});
  const [worksheet, setWorksheet] = useState(null);
  const [hiddenControlIds, setHiddenControlIds] = useState([]);
  useEffect(() => {
    const worksheetId = functionArguments.worksheet_id;
    const rows = [functionArguments.fields];
    sheetAjax.handleAIRequest({ worksheetId, rows }).then(async res => {
      const titleControl = find(get(res.worksheet, 'template.controls', []), c => c.attribute === 1);
      const updatedRow = res.data ? res.data[0] : {};
      setWorksheet(res.worksheet);
      if (functionArguments.row_id && !data[titleControl.controlId]) {
        const rowDetail = await sheetAjax.getRowDetail({ worksheetId, rowId: functionArguments.row_id });
        updatedRow[titleControl.controlId] = safeParse(rowDetail.rowData)[titleControl.controlId];
        setHiddenControlIds(titleControl.controlId);
      }
      Object.keys(updatedRow).forEach(key => {
        const control = get(res.worksheet, 'template.controls', []).find(c => c.controlId === key);
        if (control && includes([9, 10, 11], control.type)) {
          const value = safeParse(updatedRow[key]);
          if (value[0] && value[0].length !== 36) {
            updatedRow[key] = JSON.stringify(
              value
                .map(optionValue => find(control.options, o => o.value === optionValue))
                .filter(identity)
                .map(o => o.key),
            );
          }
        }
      });
      setData(updatedRow);
      if (titleControl) {
        const title = getTitleTextFromControls(get(res.worksheet, 'template.controls', []), updatedRow) || {};
        const worksheetName = get(res.worksheet, 'name');
        setTitle(title ? `${worksheetName}: ${title}` : worksheetName);
      }
      setLoading(false);
    });
  }, [config.name]);
  if (showAsTitle) {
    return title ? <div className="secondary-tool-name ellipsis t-flex-1">{title}</div> : null;
  }
  return (
    <Con>
      {loading ? (
        <LoadDiv size="small" className="mTop20 mBottom20" />
      ) : (
        <CardCellControls
          data={data}
          controls={get(worksheet, 'template.controls', []).filter(
            c => !!data[c.controlId] && !hiddenControlIds.includes(c.controlId),
          )}
        />
      )}
    </Con>
  );
}

export default RecordCard;
