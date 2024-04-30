import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import ControlsDataTable from 'src/pages/worksheet/components/ControlsDataTable';

export default function Temp(props) {
  const [{ loading, data, controls }, setState] = useSetState({ loading: true });
  useEffect(() => {
    mdyAPI(
      'worksheet',
      'GetFilterRows',
      {
        worksheetId: '65d86fcb495ae75cd55071a9',
        appId: '21db7238-3dff-4881-9744-a80e0c0c6d62',
        viewId: '65d86fcb495ae75cd55071ad',
        isGetWorksheet: true,
      },
      {},
    ).then(res => {
      setState({
        loading: false,
        controls: res.template.controls,
        data: res.data,
      });
    });
  }, []);
  return (
    <div className="pAll10" style={{ height: 500 }}>
      {
        <ControlsDataTable
          loading={loading}
          controls={controls}
          data={data}
          onCellClick={(control, row) => {
            alert(control.controlName);
          }}
        />
      }
    </div>
  );
}
