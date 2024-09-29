import React, { useRef } from 'react';
import { quickSelectUser } from 'ming-ui/functions';

export default function () {
  const buttonRef = useRef();
  return (
    <div style={{ margin: 100 }}>
      <br />
      <button
        ref={buttonRef}
        onClick={() => {
          quickSelectUser(buttonRef.current, {
            offset: [0, 4],
            projectId: md.global.Account.projects[0].projectId,
            includeSystemField: true,
            includeUndefinedAndMySelf: true,
            tabType: 3,
            onSelect: console.log,
            selectCb: console.log,
          });
        }}
      >
        open
      </button>
    </div>
  );
}
