import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { arrayOf, bool, func, shape } from 'prop-types';
import styled from 'styled-components';
import worksheetAjax from 'src/api/worksheet';
import { getFilter } from 'worksheet/common/WorkSheetFilter/util';
import { getTitleTextFromRelateControl } from 'src/components/newCustomFields/tools/utils';
import Option from './StyledOption';

const Con = styled.div`
  position: relative;
  min-height: 32px;
`;

const MAX_COUNT = 20;
export default function RelateRecordOptions(props) {
  const {
    selected,
    parentWorksheetId,
    formData = [],
    prefixRecords = [],
    staticRecords,
    control,
    multiple,
    onChange,
    advancedSetting,
  } = props;
  const [records, setRecords] = useState(staticRecords || []);
  async function load() {
    if (!_.isEmpty(staticRecords)) {
      return;
    }
    let filterControls;
    if (control && control.advancedSetting.filters) {
      filterControls = getFilter({ control, formData });
    }
    const args = {
      worksheetId: control.dataSource,
      viewId: control.viewId,
      filterControls: filterControls || [],
      searchType: 1,
      pageSize: 20,
      pageIndex: 1,
      status: 1,
      isGetWorksheet: true,
      getType: 32,
    };
    if (parentWorksheetId && control && _.get(parentWorksheetId, 'length') === 24) {
      args.relationWorksheetId = parentWorksheetId;
      args.controlId = control.controlId;
    }
    const res = await worksheetAjax.getFilterRows(args);
    setRecords(res.data);
  }
  useEffect(() => {
    load();
  }, [JSON.stringify(formData.map(c => c.value))]);
  useEffect(() => {
    setRecords(staticRecords || []);
  }, [JSON.stringify(staticRecords)]);
  useEffect(() => {
    load();
  }, [advancedSetting]);
  return (
    <Con>
      {prefixRecords
        .concat(records)
        .slice(0, MAX_COUNT)
        .map((record, i) => {
          const title = record.rowid === 'isEmpty' ? record.name : getTitleTextFromRelateControl(control, record);
          const checked = _.find(selected, { rowid: record.rowid });
          return (
            <Option
              className={cx('relateRecordOption ellipsis', { multiple, checked })}
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
              {multiple && checked && <span className="icon-hr_ok selectedIcon"></span>}
              <div className="ellipsis">{title}</div>
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
