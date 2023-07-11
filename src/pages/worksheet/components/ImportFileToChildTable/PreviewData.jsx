import React, { Fragment, useState } from 'react';
import styled from 'styled-components';
import { Support, Button, Dropdown, LoadDiv } from 'ming-ui';
import _ from 'lodash';
import { getWithToken, postWithToken } from 'worksheet/util';
import convert from './convertData';
import PreviewTable from './PreviewTable';

const Header = styled.div`
  height: 52px;
  line-height: 52px;
  text-align: center;
  position: relative;
  .title {
    position: absolute;
    font-weight: 500;
    left: 24px;
    font-size: 17px;
    color: #333;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 6px 24px 0;
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
  color: #333;
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

export default function PreviewData(props) {
  const { projectId, worksheetId, controlId, excelUrl, sheets, controls, setStep, onClose, onAddRows } = props;
  const [tableLoading, setTableLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [cellsData, setCellsData] = useState(props.cellsData);
  const [mapConfig, setMapConfig] = useState(
    [{}, ...new Array(20 - 1)]
      .map((a, i) => ({ [i]: _.get(controls, `${i}.controlId`) }))
      .reduce((a, b) => Object.assign({}, a, b)),
  );
  return (
    <Fragment>
      {isConverting && (
        <ConvertingMask>
          <LoadDiv size="big" />
        </ConvertingMask>
      )}
      <Header>
        <span className="title">{_l('设置导入数据')}</span>
      </Header>
      <Content>
        <div className="header Font13 Gray_75 mBottom18">
          {_l('检查即将导入的数据，你可以调整数据导入的对应字段')}
          {!_.isEmpty(sheets) && (
            <Dropdown
              className="sheetsDropDown"
              border
              value={0}
              data={sheets}
              onChange={async sheetIndex => {
                setTableLoading(true);
                const res = await getWithToken(
                  `${md.global.Config.WorksheetDownUrl}/Import/PreviewSubtable`,
                  { worksheetId, tokenType: 7 },
                  {
                    worksheetId,
                    filePath: excelUrl,
                    getSheetIndex: sheetIndex,
                  },
                );
                if (_.get(res, 'data.data.rows')) {
                  setCellsData(res.data.data.rows.map(r => r.cells));
                } else {
                  setCellsData([]);
                }
                setTableLoading(false);
              }}
            />
          )}
        </div>
        <div style={{ height: 417 }}>
          <PreviewTable
            showNumber
            loading={tableLoading}
            mode="mapToControls"
            height={417}
            rowCount={cellsData.length}
            data={cellsData}
            controls={controls}
            mapConfig={mapConfig}
            renderCellContent={({ rowIndex, columnIndex }) => {
              return <CellText className="ellipsis">{_.get(cellsData, `${rowIndex}.${columnIndex}`)}</CellText>;
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
              cellsData.length,
              `<span style="color:#f1a04a">${_l('%0 列', _.values(mapConfig).filter(_.identity).length)}</span>`,
              controls.length,
            ),
          }}
        />
        <div className="operate">
          <Support className="customSubtotalMessage" type={2} href="https://help.mingdao.com" text={_l('帮助')} />
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
            onClick={async () => {
              setIsConverting(true);
              const data = await convert({ projectId, worksheetId, controlId, mapConfig, controls, data: cellsData });
              setIsConverting(false);
              onAddRows(data);
              onClose();
            }}
          >
            {_l('导入')}
          </Button>
        </div>
      </Footer>
    </Fragment>
  );
}
