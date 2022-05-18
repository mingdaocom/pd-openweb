import React from 'react';
import Share from 'src/pages/worksheet/components/Share';

export default function D(props) {
  return (
    <div>
      <Share
        from="recordInfo"
        isPublic={false}
        params={{
          appId: 'd4191da9-631b-4140-9eb2-7c1f8cf107bf',
          rowId: 'ada49f3f-44f4-4264-88f6-aa14b94e1c59',
          viewId: '622182807103856d87b15edc',
          worksheetId: '622182807103856d87b15ed8',
        }}
      />
    </div>
  );
}
