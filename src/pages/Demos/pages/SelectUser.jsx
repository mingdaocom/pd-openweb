import React, { useRef } from 'react';

import { UserSelector, SelectWrapper } from 'ming-ui/functions/quickSelectUser';
import quickSelectUser from 'ming-ui/functions/quickSelectUser';

export default function () {
  const buttonRef = useRef();
  return (
    <div style={{ margin: 100 }}>
      {/* <UserSelector
        projectId={md.global.Account.projects[0].projectId}
        includeSystemField
        includeUndefinedAndMySelf
        tabType={2}
        onSelect={console.log}
        selectCb={console.log}
      /> */}
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
      <SelectWrapper
        {...{
          offset: [0, 4],
          projectId: md.global.Account.projects[0].projectId,
          includeSystemField: true,
          includeUndefinedAndMySelf: true,
          tabType: 3,
          onSelect: console.log,
          selectCb: console.log,
        }}
      >
        <button>wrapper</button>
      </SelectWrapper>
    </div>
  );
}
