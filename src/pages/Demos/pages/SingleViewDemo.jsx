import React, { useRef, useState } from 'react';
import SingleView from 'worksheet/common/SingleView';
import styled from 'styled-components';
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
  const appId = '3b974c5f-10fe-43ee-af35-682185a9219c';
  const worksheetId = '62317270b27b665e7c015c86';
  const viewId = '62317270b27b665e7c015c8a';
  const singleViewRef = useRef();
  const [loading, setLoading] = useState(false);
  return (
    <Con>
      <Header>
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
        {!loading && appId && worksheetId && viewId && (
          <SingleView
            showAsSheetView
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
