import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { arrayOf, bool, func, shape } from 'prop-types';
import worksheetAjax from 'src/api/worksheet';
import { getFilter } from 'worksheet/common/WorkSheetFilter/util';
import { getTitleTextFromControls } from 'src/components/Form/core/utils';
import { Option } from './Options';

const useCompare = value => {
  const ref = useRef(null);
  if (!_.isEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
};

const MAX_COUNT = 20;

export default function RelateRecordOptions(props) {
  const {
    selected,
    control = {},
    multiple,
    onChange,
    onSetMoreVisible,
    advancedSetting,
    prefixRecords = [],
    staticRecords = [],
    formData,
    parentWorksheetId,
  } = props;
  const { navshow } = advancedSetting;
  const [records, setRecords] = useState(staticRecords);
  const newRecords = records.slice(0, 10);
  const isMore = records.length > newRecords.length;

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
      searchType: 1,
      pageSize: 20,
      pageIndex: 1,
      status: 1,
      isGetWorksheet: true,
      getType: 32,
      langType: window.shareState.shareId ? getCurrentLangCode() : undefined,
    };
    if (navshow === '3') {
      args.filterControls = filterControls || [];
    }
    if (parentWorksheetId && control.controlId && _.get(parentWorksheetId, 'length') === 24) {
      args.relationWorksheetId = parentWorksheetId;
      args.controlId = control.controlId;
    }
    const res = await worksheetAjax.getFilterRows(args);

    setRecords(res.data);
  }
  useEffect(() => {
    load();
  }, [useCompare(formData)]);
  return (
    <div>
      {prefixRecords
        .concat(newRecords)
        .slice(0, MAX_COUNT)
        .map((record, i) => {
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
