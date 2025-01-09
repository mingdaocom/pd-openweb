import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Support, Button, Dropdown, LoadDiv, Checkbox } from 'ming-ui';
import _ from 'lodash';
import { getWithToken, postWithToken } from 'worksheet/util';
import convert from './convertData';
import PreviewTable from './PreviewTable';
import { arrayOf, func, number, shape, string } from 'prop-types';

const Header = styled.div`
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: relative;
  .title {
    font-weight: 500;
    font-size: 17px;
    color: #151515;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 0 24px 0;
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .headNumber {
      width: 180px;
      margin-left: 8px;
    }
    .sheetsDropDown {
      width: 180px;
    }
  }
  .uploadExcel {
    height: 100%;
    > div {
      height: 100%;
    }
  }
`;

const Footer = styled.div`
  padding: 0 24px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CellText = styled.div`
  display: block;
  font-size: 13px;
  color: #151515;
  line-height: 20px;
`;

const ConvertingMask = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  z-index: 20;
  display: flex;
  justify-content: center;
  align-items: center;
`;

function getMapConfigByExcel(controls = [], excelData = []) {
  const result = {};
  if (excelData.length < controls.length) {
    excelData = excelData.concat(new Array(controls.length - excelData.length).fill(''));
  }
  excelData.forEach((t, i) => {
    const valuesOfResult = _.values(result);
    const matchedControl = _.find(
      controls,
      c => _.trim(c.controlName) === t && !_.includes(valuesOfResult, c.controlId),
    );
    result[i] = matchedControl ? matchedControl.controlId : '';
  });
  return result;
}

function getDefaultMap(controls) {
  return [...new Array(controls.length)]
    .map((a, i) => ({ [i]: _.get(controls, `${i}.controlId`) }))
    .reduce((a, b) => Object.assign({}, a, b));
}

export default function PreviewData(props) {
  const {
    maxCount = 1000,
    dialogHeight,
    dataFrom,
    dataCount,
    projectId,
    worksheetId,
    controlId,
    excelUrl,
    sheets = [],
    controls,
    setStep,
    onClose,
    onAddRows,
  } = props;
  const [mapByExcel, setMapByExcel] = useState(dataFrom === 'excel');
  const [tableLoading, setTableLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [cellsData, setCellsData] = useState(props.cellsData || []);
  const [headRowIndex, setHeadRowIndex] = useState(1);
  const [sheetIndex, setSheetIndex] = useState(0);
  const needImportCellData = (dataFrom === 'excel' ? cellsData.slice(headRowIndex) : cellsData).slice(
    0,
    maxCount - dataCount,
  );
  const valuedData = needImportCellData.filter(row => !_.isEmpty(row.filter(_.identity)));
  const dataColCount = _.get(needImportCellData, '0.length');
  const [mapConfig, setMapConfig] = useState(getDefaultMap(controls));
  const showHeader = dataFrom === 'excel' || sheets.length > 1;
  const height = showHeader ? dialogHeight - 177 : dialogHeight - 127;
  useEffect(() => {
    if (mapByExcel) {
      if (headRowIndex >= 0) {
        setMapConfig(getMapConfigByExcel(controls, cellsData[headRowIndex - 1]));
      }
    } else {
      setMapConfig(getDefaultMap(controls));
    }
  }, [mapByExcel, headRowIndex, cellsData]);
  return (
    <Fragment>
      {isConverting && (
        <ConvertingMask>
          <LoadDiv size="big" />
        </ConvertingMask>
      )}
      <Header>
        <span className="title">{_l('设置导入数据')}</span>
        <span className="Font13 Gray_9e mLeft8">{_l('检查即将导入的数据，你可以调整导入数据对应的字段')}</span>
      </Header>
      <Content>
        {showHeader && (
          <div className="header mBottom18">
            {dataFrom === 'excel' && (
              <div className="flexRow">
                <div className="setHead">
                  {_l('表头行')}
                  <Dropdown
                    className="headNumber"
                    border
                    value={headRowIndex}
                    data={new Array(cellsData.length < 10 ? cellsData.length : 10)
                      .fill()
                      .map((e, i) => ({ text: i === 0 ? _l('没有表头行') : _l('第%0行', i), value: i }))}
                    onChange={setHeadRowIndex}
                  />
                  <span data-tip={_l('只有表头下方的数据才会被导入')} className="mLeft8 LineHeight1em">
                    <i className="icon-info_outline Font18 Gray_bd"></i>
                  </span>
                </div>
                <div className="flexRow mLeft30 valignWrapper">
                  <Checkbox text={_l('按名称匹配')} checked={mapByExcel} onClick={() => setMapByExcel(!mapByExcel)} />
                  <span
                    data-tip={_l('勾选时，自动匹配与表头行名称的一致的字段。取消勾选时，默认按照字段顺序依次匹配')}
                    className="mLeft8 LineHeight1em"
                  >
                    <i className="icon-info_outline Font18 Gray_bd"></i>
                  </span>
                </div>
              </div>
            )}
            {sheets.length > 1 && (
              <Dropdown
                className="sheetsDropDown"
                border
                value={sheetIndex}
                data={sheets}
                onChange={async newSheetIndex => {
                  setTableLoading(true);
                  const data = await getWithToken(
                    `${md.global.Config.WorksheetDownUrl}/Import/PreviewSubtable`,
                    { worksheetId, tokenType: 7 },
                    {
                      worksheetId,
                      filePath: excelUrl.replace(/\?.+/, ''),
                      getSheetIndex: newSheetIndex,
                    },
                  );
                  if (_.get(data, 'rows')) {
                    setCellsData(data.rows.map(r => r.cells));
                  } else {
                    setCellsData([]);
                  }
                  setSheetIndex(newSheetIndex);
                  setTableLoading(false);
                }}
              />
            )}
          </div>
        )}
        <div style={{ height }}>
          <PreviewTable
            showNumber
            loading={tableLoading}
            rowStartIndex={dataFrom === 'excel' && !_.isEmpty(valuedData) ? headRowIndex : undefined}
            mode="mapToControls"
            height={height}
            rowCount={needImportCellData.length}
            data={needImportCellData}
            controls={controls}
            mapConfig={mapConfig}
            columnCount={dataFrom === 'excel' && dataColCount}
            renderCellContent={({ rowIndex, columnIndex }) => {
              return (
                <CellText className="ellipsis">{_.get(needImportCellData, `${rowIndex}.${columnIndex}`)}</CellText>
              );
            }}
            onUpdateMapConfig={(index, value) => {
              const newConfig = { ...mapConfig };
              Object.keys(newConfig).forEach(key => {
                if (value && newConfig[key] === value) {
                  newConfig[key] = undefined;
                }
              });
              setMapConfig({ ...newConfig, [index]: value });
            }}
          />
        </div>
      </Content>
      <Footer>
        <div
          className="importInfo"
          dangerouslySetInnerHTML={{
            __html: _l(
              '导入 %0 行数据， %1/共 %2 列',
              needImportCellData.length,
              `<span style="color:#f1a04a">${_.values(mapConfig).filter(_.identity).length}</span>`,
              controls.length,
            ),
          }}
        />
        <div className="operate">
          <Support
            className="customSubtotalMessage Gray_bd"
            type={2}
            href="https://help.mingdao.com"
            text={_l('帮助')}
          />
          <Button
            className="mRight10"
            type="link"
            onClick={() => {
              setStep('upload');
            }}
          >
            {_l('取消')}
          </Button>
          <Button
            type="primary"
            disabled={_.isEmpty(valuedData) || _.isEmpty(_.values(mapConfig).filter(_.identity))}
            onClick={async () => {
              setIsConverting(true);
              const data = await convert({
                projectId,
                worksheetId,
                controlId,
                mapConfig,
                controls,
                data: needImportCellData,
              });
              setIsConverting(false);

              onClose(data);
            }}
          >
            {_l('导入')}
          </Button>
        </div>
      </Footer>
    </Fragment>
  );
}

PreviewData.propTypes = {
  dialogHeight: number,
  maxCount: number,
  dataFrom: number,
  dataCount: number,
  projectId: string,
  worksheetId: string,
  controlId: string,
  excelUrl: string,
  sheets: arrayOf(shape({})),
  controls: arrayOf(shape({})),
  setStep: func,
  onClose: func,
  onAddRows: func,
};
