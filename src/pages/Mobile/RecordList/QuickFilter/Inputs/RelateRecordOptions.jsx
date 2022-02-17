import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { getFilterRows } from 'src/api/worksheet';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import { arrayOf, bool, func, shape } from 'prop-types';
import { Option } from './Options';

export default function RelateRecordOptions(props) {
  const { selected, control, multiple, onChange, onSetMoreVisible } = props;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const newRecords = records.slice(0, 10);
  const isMore = records.length > newRecords.length;
  async function load() {
    setLoading(true);
    const args = {
      worksheetId: control.dataSource,
      viewId: control.viewId,
      searchType: 1,
      pageSize: 20,
      pageIndex: 1,
      status: 1,
      isGetWorksheet: true,
      getType: 7,
    };
    const res = await getFilterRows(args);
    setLoading(false);
    setRecords(res.data);
  }
  useEffect(() => {
    load();
  }, []);
  return (
    <div>
      {newRecords.map((record, i) => {
        const title = getTitleTextFromControls(control.relationControls, record);
        return (
          <Option
            key={i}
            className={cx('ellipsis', { checked: _.find(selected, { rowid: record.rowid }) })}
            onClick={() => {
              if (_.find(selected, { rowid: record.rowid })) {
                onChange(selected.filter(r => r.rowid !== record.rowid));
              } else {
                onChange(multiple ? _.uniqBy(selected.concat(record)) : [record]);
              }
            }}
          >
            {title}
          </Option>
        );
      })}
      {isMore && <Option className="more" onClick={onSetMoreVisible}>{_l('更多...')}</Option>}
    </div>
  );
}

RelateRecordOptions.propTypes = {
  multiple: bool,
  control: shape({}),
  selected: arrayOf(shape({})),
  onChange: func,
  onSetMoreVisible: func
};
