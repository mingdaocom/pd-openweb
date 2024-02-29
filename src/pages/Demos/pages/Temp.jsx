import React, { useEffect } from 'react';
import { showFilteredRecords } from 'worksheet/components/SearchRecordResult';

export default function Temp() {
  useEffect(() => {
    showFilteredRecords({
      appId: 'c4f258cb-3c94-4ba8-97ec-48cb69e7e003',
      // viewId: '659dfb5e964008d0d0a176a8',
      worksheetId: '659dfb5e964008d0d0a176a4',
      filterId: '659e312a0314804a514a9861',
      searchId: '659dfb5e964008d0d0a176a6',
      // keyWords: '333',
      keyWords: '000',
    });
  }, []);
  return <div className="pAll10">Temp</div>;
}
