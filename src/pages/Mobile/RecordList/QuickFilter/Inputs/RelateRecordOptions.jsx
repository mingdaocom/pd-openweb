import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import worksheetAjax from 'src/api/worksheet';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import { getFilter } from 'worksheet/common/WorkSheetFilter/util';
import { arrayOf, bool, func, shape } from 'prop-types';
import { Option } from './Options';
import _ from 'lodash';

export default function RelateRecordOptions(props) {
  const {
    selected,
    control,
    multiple,
    onChange,
    onSetMoreVisible,
    advancedSetting,
    prefixRecords = [],
    staticRecords = [],
  } = props;
  const { navshow } = advancedSetting;
  const [records, setRecords] = useState(staticRecords);
  const [loading, setLoading] = useState(true);
  const newRecords = records.slice(0, 10);
  const isMore = records.length > newRecords.length;

  async function load() {
    if (!_.isEmpty(staticRecords)) {
      return;
    }
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
    if (navshow === '3') {
      args.filterControls = getFilter({ control });
    }
    const res = await worksheetAjax.getFilterRows(args);
    setLoading(false);
    setRecords(res.data);
  }
  useEffect(() => {
    load();
  }, []);
  return (
    <div>
      {prefixRecords.concat(newRecords).map((record, i) => {
        const title =
          record.rowid === 'isEmpty' || navshow === '2'
            ? record.name
            : getTitleTextFromControls(control.relationControls, record);
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
      {isMore && (
        <Option className="more" onClick={onSetMoreVisible}>
          {_l('更多...')}
        </Option>
      )}
    </div>
  );
}

RelateRecordOptions.propTypes = {
  multiple: bool,
  control: shape({}),
  selected: arrayOf(shape({})),
  onChange: func,
  onSetMoreVisible: func,
};
