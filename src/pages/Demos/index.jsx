import React, { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'ming-ui';
import SingleView from 'worksheet/common/SingleView';
import styled from 'styled-components';
import worksheet from 'src/api/worksheet';
import appManagement from 'src/api/appManagement';
import { updateFilters } from 'worksheet/redux/actions';
import { refresh } from 'worksheet/redux/actions/sheetview';

const Con = styled.div`
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
const Header = styled.div`
  height: 50px;
`;
const ViewCon = styled.div`
  flex: 1;
  margin: 200px;
`;

function Demos(props) {
  // const appId = '3b974c5f-10fe-43ee-af35-682185a9219c';
  // const worksheetId = '618b25271c2854dd35392799';
  // const viewId = '61921aaa0629db5f30a5d367';
  const singleViewRef = useRef();
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState([]);
  const [appId, setAppId] = useState();
  const [worksheets, setWorksheets] = useState([]);
  const [worksheetId, setWorksheetId] = useState();
  const [views, setViews] = useState([]);
  const [viewId, setViewId] = useState();
  const view = _.find(views, { viewId });
  useEffect(() => {
    appManagement.getAppForManager().then(data => {
      setApps(data);
      setAppId(data[0].appId);
      setWorksheets(data[0].workSheetInfo);
      setWorksheetId(data[0].workSheetInfo[0].workSheetId);
    });
  }, []);
  useEffect(() => {
    if (worksheetId) {
      setViewId(undefined);
      worksheet.getWorksheetInfo({ worksheetId, getViews: true }).then(({ views }) => {
        setViews(views);
        setViewId(views[0].viewId);
      });
    }
  }, [worksheetId]);
  return (
    <Con>
      <Header>
        <Dropdown
          value={appId}
          data={apps.map(app => ({ text: app.appName, value: app.appId }))}
          onChange={value => {
            setAppId(value);
            setWorksheetId(_.find(apps, { appId: value }).workSheetInfo[0].workSheetId);
          }}
        />
        <Dropdown
          value={worksheetId}
          data={worksheets.map(worksheet => ({ text: worksheet.workSheetName, value: worksheet.workSheetId }))}
          onChange={value => {
            setWorksheetId(value);
          }}
        />
        <Dropdown
          value={viewId}
          data={views.map(view => ({ text: view.name, value: view.viewId }))}
          onChange={value => {
            setViewId(value);
            setLoading(true);
            setTimeout(() => setLoading(false));
          }}
        />
        <button
          onClick={() => {
            singleViewRef.current.dispatch(refresh());
          }}
        >
          刷新
        </button>
        <button
          onClick={() => {
            console.log(singleViewRef.current.getState());
          }}
        >
          打印 state
        </button>
        <button
          onClick={() => {
            singleViewRef.current.dispatch(updateFilters({ keyWords: '1' }, view));
          }}
        >
          搜索 1
        </button>
        <button
          onClick={() => {
            singleViewRef.current.dispatch(updateFilters({ keyWords: '' }, view));
          }}
        >
          搜索重置
        </button>
      </Header>
      <ViewCon>
        {!loading && appId && worksheetId && view && (
          <SingleView
            showHeader
            ref={singleViewRef}
            appId={appId}
            worksheetId={worksheetId}
            viewId={viewId}
            headerLeft={<i>left</i>}
            headerRight={<i>right</i>}
          />
        )}
      </ViewCon>
    </Con>
  );
}

export default Demos;
