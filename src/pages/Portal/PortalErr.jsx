import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { LoadDiv } from 'ming-ui';
import { toApp, getCurrentId } from 'src/pages/PortalAccount/util';

function ContainerCon() {
  useEffect(() => {
    getCurrentId(currentAppId => {
      if (currentAppId && currentAppId !== 'NotExist') {
        toApp(currentAppId);
      } else {
        location.href = '/404';
      }
    });
  }, []);

  return <LoadDiv className="" style={{ margin: '120px auto' }} />;
}

ReactDOM.render(<ContainerCon />, document.querySelector('#app'));
