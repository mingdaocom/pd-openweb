import React, { Fragment, lazy, Suspense, useState } from 'react';
import { createPortal } from 'react-dom';
import MyProcessEntry from 'src/pages/workflow/MyProcess/Entry';

const LoadableMyProcess = lazy(() => import('src/pages/workflow/MyProcess'));

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
          <Suspense fallback={null}>
            <LoadableMyProcess
              countData={countData}
              onCancel={() => {
                setMyProcessVisible(false);
              }}
              updateCountData={countData => {
                setCountData(countData);
              }}
            />
          </Suspense>,
          document.querySelector('#containerWrapper'),
        )}
    </Fragment>
  );
};
