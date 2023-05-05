import React, { useEffect, useState } from 'react';
import RecordCoverCardList from 'src/pages/worksheet/components/SearchRelateRecords/RecordCoverCardList';

function getWorksheetInfo() {
  return fetch('http://localhost:30002/api/Worksheet/GetWorksheetInfo', {
    headers: {
      accept: 'application/json, text/javascript, */*; q=0.01',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7,zh-TW;q=0.6,fr;q=0.5,ar;q=0.4',
      accountid: '1f68c5b1-b51c-427d-bd14-a0c8b5af6315',
      authorization: 'md_pss_id 0050890c609202203f0360810ec0ef05e0b806b0ec06a06d',
      'content-type': 'application/json',
    },
    body: '{"worksheetId":"63e353a84017f20daea9d4a0","getViews":true,"getTemplate":true,"getRules":true,"getSwitchPermit":true}',
    method: 'POST',
  }).then(res => res.json());
}

function getRows() {
  return fetch('http://localhost:30002/api/Worksheet/GetRowRelationRows', {
    headers: {
      authorization: 'md_pss_id 0050890c609202203f0360810ec0ef05e0b806b0ec06a06d',
      'content-type': 'application/json',
    },
    body: '{"keyWords":"1","pageIndex":1,"worksheetId":"63e353a84017f20daea9d4a0","rowId":"92ed3a3e-99ee-4709-b0c0-f65e07f821cf","controlId":"63e354cb4017f20daea9d4b5","pageSize":20}',
    method: 'POST',
  }).then(res => res.json());
}

export default function CardList() {
  const [data, setData] = useState({});
  const [col, setCol] = useState(3);
  useEffect(() => {
    Promise.all([getWorksheetInfo(), getRows()]).then(([res1, res2]) => {
      setData({
        control: res1.data.template.controls[1],
        controls: res1.data.template.controls[1].relationControls,
        records: res2.data.data,
      });
    });
  }, []);
  return (
    <div style={{ border: '1px solid #ddd' }}>
      {[...new Array(5)].map((_, i) => (
        <span className="btnBootstrap-middle ThemeHoverBGColor3 Hand" onClick={() => setCol(i + 1)}>
          {i + 1}
        </span>
      ))}
      {!_.isEmpty(data) && (
        <RecordCoverCardList records={data.records} control={data.control} controls={data.controls} col={col} />
      )}
    </div>
  );
}
