import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { arrayOf, bool, func, shape } from 'prop-types';
import cx from 'classnames';
import worksheetAjax from 'src/api/worksheet';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import Option from './StyledOption';
import _ from 'lodash';

const Con = styled.div`
  position: relative;
  min-height: 32px;
`;
export default function RelateRecordOptions(props) {
  const { selected, control, multiple, onChange } = props;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const res = await worksheetAjax.getFilterRows(args);
    setLoading(false);
    setRecords(res.data);
  }
  useEffect(() => {
    load();
  }, []);
  return (
    <Con>
      {records.map((record, i) => {
        const title = getTitleTextFromControls(control.relationControls, record);
        return (
          <Option
            className={cx('ellipsis', { checked: _.find(selected, { rowid: record.rowid }) })}
            title={title}
            key={i}
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
    </Con>
  );
}

RelateRecordOptions.propTypes = {
  multiple: bool,
  control: shape({}),
  selected: arrayOf(shape({})),
  onChange: func,
};
