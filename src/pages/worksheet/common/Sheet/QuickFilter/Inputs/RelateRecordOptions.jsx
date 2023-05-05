import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { arrayOf, bool, func, shape } from 'prop-types';
import cx from 'classnames';
import worksheetAjax from 'src/api/worksheet';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import { formatValuesOfCondition } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import Option from './StyledOption';
import _ from 'lodash';

const Con = styled.div`
  position: relative;
  min-height: 32px;
`;
export default function RelateRecordOptions(props) {
  const { selected, prefixRecords = [], staticRecords = [], control, multiple, onChange } = props;
  const [records, setRecords] = useState(staticRecords);
  const [loading, setLoading] = useState(true);
  async function load() {
    if (!_.isEmpty(staticRecords)) {
      return;
    }
    setLoading(true);
    const args = {
      worksheetId: control.dataSource,
      viewId: control.viewId,
      filterControls: _.get(control, 'advancedSetting.filters')
        ? JSON.parse(_.get(control, 'advancedSetting.filters')).map(formatValuesOfCondition)
        : [],
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
      {prefixRecords.concat(records).map((record, i) => {
        const title =
          record.rowid === 'isEmpty' ? record.name : getTitleTextFromControls(control.relationControls, record);
        return (
          <Option
            className={cx('ellipsis', { checked: _.find(selected, { rowid: record.rowid }) })}
            title={title}
            key={i}
            onClick={() => {
              if (record.rowid === 'isEmpty') {
                onChange(selected.length === 1 && selected[0].rowid === 'isEmpty' ? [] : [record]);
              } else if (_.find(selected, { rowid: record.rowid })) {
                onChange(selected.filter(r => r.rowid !== record.rowid && r.rowid !== 'isEmpty'));
              } else {
                onChange(multiple ? _.uniqBy(selected.concat(record).filter(r => r.rowid !== 'isEmpty')) : [record]);
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
