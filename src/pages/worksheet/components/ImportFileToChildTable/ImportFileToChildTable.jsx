import React, { useState } from 'react';
import { Modal } from 'ming-ui';
import styled from 'styled-components';
import _ from 'lodash';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget.js';
import ImportData from './ImportData';
import PreviewData from './PreviewData';

/**
 * 导出问题
 * 复杂字段格式匹配
 * 人员缺少avatar
 * 关联没返回
 * 地区只返回了code
 */

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ALLOW_CONTROL_TYPES = [
  WIDGETS_TO_API_TYPE_ENUM.TEXT,
  WIDGETS_TO_API_TYPE_ENUM.NUMBER,
  WIDGETS_TO_API_TYPE_ENUM.MONEY,
  WIDGETS_TO_API_TYPE_ENUM.EMAIL,
  WIDGETS_TO_API_TYPE_ENUM.DATE,
  WIDGETS_TO_API_TYPE_ENUM.DATE_TIME,
  WIDGETS_TO_API_TYPE_ENUM.TIME,
  WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE,
  WIDGETS_TO_API_TYPE_ENUM.TELEPHONE,
  WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE,
  WIDGETS_TO_API_TYPE_ENUM.AREA_CITY,
  WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY,
  WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN,
  WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU,
  WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT,
  WIDGETS_TO_API_TYPE_ENUM.USER_PICKER,
  WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT,
  WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE,
  WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT,
  WIDGETS_TO_API_TYPE_ENUM.SWITCH,
  WIDGETS_TO_API_TYPE_ENUM.SCORE,
  WIDGETS_TO_API_TYPE_ENUM.AUTO_ID,
  WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT,
  WIDGETS_TO_API_TYPE_ENUM.CRED,
  WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET,
];

export default function ImportFileToChildTable(props) {
  const { projectId, worksheetId, controlId, onClose, onAddRows } = props;
  const controls = props.controls.filter(c => _.includes(ALLOW_CONTROL_TYPES, c.type));
  const [sheets, setSheets] = useState([]);
  const [cellsData, setCellsData] = useState([]);
  const [excelUrl, setExcelUrl] = useState();
  const [step, setStep] = useState('upload');
  return (
    <Modal
      visible
      verticalAlign="bottom"
      width={1000}
      closeSize={50}
      onCancel={onClose}
      bodyStyle={{ padding: 0, position: 'relative', height: 600, flex: 'none' }}
    >
      <Con>
        {step === 'upload' && (
          <ImportData
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
