import React, { Fragment, useState } from 'react';
import { createPortal } from 'react-dom';
import MyProcess from 'src/pages/workflow/MyProcess';
import MyProcessEntry from 'src/pages/workflow/MyProcess/Entry';

export default props => {
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
      {myProcessVisible &&
        createPortal(
          <MyProcess
            countData={countData}
            onCancel={() => {
              setMyProcessVisible(false);
            }}
            updateCountData={countData => {
              setCountData(countData);
            }}
          />,
          document.querySelector('#containerWrapper'),
        )}
    </Fragment>
  );
};
