import React, { Fragment, useEffect, useState } from 'react';
import MyProcessEntry from 'src/pages/workflow/MyProcess/Entry';
import MyProcess from 'src/pages/workflow/MyProcess';

export default (props) => {
  const { type, renderContent } = props;
  const [countData, setCountData] = useState({});
  const [myProcessVisible, setMyProcessVisible] = useState(false);

  return (
    <Fragment>
      <MyProcessEntry
        type={type}
        renderContent={renderContent}
        countData={countData}
        onClick={() => {
          setMyProcessVisible(true);
        }}
        updateCountData={countData => {
          setCountData(countData);
        }}
      />
      {myProcessVisible && (
        <MyProcess
          countData={countData}
          onCancel={() => {
            setMyProcessVisible(false);
          }}
          updateCountData={countData => {
            setCountData(countData);
          }}
        />
      )}
    </Fragment>
  );
};