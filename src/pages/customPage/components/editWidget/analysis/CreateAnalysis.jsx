import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SelectWorksheet from 'src/pages/worksheet/components/SelectWorksheet';
import { ScrollView } from 'ming-ui';
import SideWrap from '../../SideWrap';
import imgs from '../imgs';

const chartTypes = [
  { type: 'column', icon: '', text: _l('柱形图'), reportType: 1, img: imgs.Column },
  { type: 'line', icon: '', text: _l('折线图'), reportType: 2, img: imgs.Line },
  { type: 'barLine', icon: '', text: _l('双轴图'), reportType: 7, img: imgs.Barline },
  { type: 'radar', icon: '', text: _l('雷达图'), reportType: 5, img: imgs.Radar },
  { type: 'pie', icon: '', text: _l('饼图'), reportType: 3, img: imgs.Pie },
  { type: 'funnel', icon: '', text: _l('漏斗图'), reportType: 6, img: imgs.Funnel },
  { type: 'pivotTable', icon: '', text: _l('透视表'), reportType: 8, img: imgs.Pivot_table },
  { type: 'number', icon: '', text: _l('数值图'), reportType: 4, img: imgs.Number },
  { type: 'division', icon: '', text: _l('行政区划'), reportType: 9, img: imgs.Division },
];

const SheetAndViews = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 24px;
  .title {
    margin-bottom: 10px;
  }
  .ming.Dropdown {
    width: 100%;
    background: #fff;
  }
  .sheets {
    width: 100%;
    .Dropdown--input {
      border: 2px solid #d0d0d0;
    }

    .ming.Dropdown .Dropdown--placeholder {
      width: 90%;
    }
    .ming.Menu {
      width: 100%;
    }
    .analysisViews {
      .Dropdown--input {
        span {
          width: 90%;
        }
      }
    }
  }
`;

const ChartsWrap = styled.div`
  flex: 1;
  padding-top: 12px;
  .title {
    padding: 10px 24px 0 24px;
  }
  ul {
    padding: 0 24px;
    padding-bottom: 80px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    li {
      box-sizing: border-box;
      width: 32%;
      margin-top: 12px;
      height: 154px;
      background-color: #fff;
      border-radius: 2px;
      text-align: center;
      padding: 16px 20px;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
      &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.16);
      }
      .imgWrap {
        height: 88px;
        margin: 6px 0 4px 0;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center center;
      }
      &:hover {
        background-color: rgba(255, 255, 255, 0.9);
      }
      p {
        margin: 0;
        text-align: center;
      }
    }
  }
`;

function CreateAnalysis(props) {
  const {
    ids = {},
    projectId,
    dataSource,
    setDataSource,
    onClose = _.noop,
    onClick = _.noop,
    onCreate = _.noop,
  } = props;
  const { appId } = ids;
  const { worksheetId, views } = dataSource;
  const formateViews = () =>
    [{ text: _l('无 ( 所有记录 )'), value: '' }].concat(
      views.map(({ name, viewId }) => ({ text: name, value: viewId })),
    );
  return (
    <SideWrap headerText={_l('创建统计图')} onClick={onClick} onClose={onClose}>
      <SheetAndViews>
        <div className="sheets">
          <div className="title">{_l('工作表')}</div>
          <SelectWorksheet
            worksheetType={0}
            from="customPage"
            projectId={projectId}
            appId={appId}
            value={worksheetId}
            currentWorksheetId={worksheetId}
            onChange={(appId, worksheetId, { workSheetName: worksheetName }) => {
              setDataSource({ worksheetId, worksheetName });
            }}
          />
        </div>
      </SheetAndViews>
      <ChartsWrap className="charts">
        <div className="title">{_l('选择图形')}</div>
        <ScrollView>
          <ul>
            {chartTypes.map(({ type, text, reportType, img }) => {
              return (
                <li key={type} onClick={() => onCreate(reportType)}>
                  <div className="imgWrap" style={{ backgroundImage: `url(${img})` }}></div>
                  <p>{text}</p>
                </li>
              );
            })}
          </ul>
        </ScrollView>
      </ChartsWrap>
    </SideWrap>
  );
}

export default CreateAnalysis;
