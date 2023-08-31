import React, { useState } from 'react';
import { Modal } from 'ming-ui';
import styled from 'styled-components';
import _ from 'lodash';
import ImportData from './ImportData';
import PreviewData from './PreviewData';
import { CHILD_TABLE_ALLOW_IMPORT_CONTROL_TYPES } from 'worksheet/constants/enum';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export default function ImportFileToChildTable(props) {
  const { dataCount, projectId, worksheetId, controlId, onClose, onAddRows } = props;
  const controls = props.controls.filter(c => _.includes(CHILD_TABLE_ALLOW_IMPORT_CONTROL_TYPES, c.type));
  const [sheets, setSheets] = useState([]);
  const [cellsData, setCellsData] = useState([]);
  const [excelUrl, setExcelUrl] = useState();
  const [importDataActiveType, setImportDataActiveType] = useState(0);
  const [step, setStep] = useState('upload');
  return (
    <Modal
      visible
      maskClosable
      verticalAlign="bottom"
      width={1000}
      closeSize={50}
      onCancel={onClose}
      bodyStyle={{ padding: 0, position: 'relative', height: 600, flex: 'none' }}
    >
      <Con>
        {step === 'upload' && (
          <ImportData
            importDataActiveType={importDataActiveType}
            setImportDataActiveType={setImportDataActiveType}
            worksheetId={worksheetId}
            controls={controls}
            onParseExcel={(data, url) => {
              setCellsData(data.rows.map(r => r.cells));
              setSheets(
                data.sheets.map(sheet => ({
                  value: sheet.index,
                  text: sheet.name,
                })),
              );
              if (url) {
                setExcelUrl(url);
              }
              setStep('preview');
            }}
            onParsePaste={data => {
              setCellsData(data);
              setStep('preview');
            }}
          />
        )}
        {step === 'preview' && (
          <PreviewData
            dataFrom={importDataActiveType === 0 ? 'excel' : 'paste'}
            dataCount={dataCount}
            projectId={projectId}
            controlId={controlId}
            worksheetId={worksheetId}
            excelUrl={excelUrl}
            sheets={sheets}
            cellsData={cellsData}
            controls={controls}
            setStep={setStep}
            onClose={onClose}
            onAddRows={onAddRows}
          />
        )}
      </Con>
    </Modal>
  );
}
