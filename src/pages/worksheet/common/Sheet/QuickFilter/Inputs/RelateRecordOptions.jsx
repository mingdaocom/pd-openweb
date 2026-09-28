import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { arrayOf, bool, func, shape } from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import { getTitleTextFromRelateControl } from 'src/utils/domain/control/display';
import { getFilter } from 'src/utils/domain/worksheet/filterDynamic';

const Con = styled.div`
  position: relative;
`;

const MAX_COUNT = 20;
const OPTION_BUTTON_STYLE = {
  maxWidth: 200,
  '--hap-control-height-sm': '28px',
  '--hap-button-padding-inline-sm': '12px',
};
const SELECTED_MULTIPLE_OPTION_BUTTON_STYLE = {
  ...OPTION_BUTTON_STYLE,
  borderColor: 'var(--hap-color-primary-border)',
};

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
    appId,
  } = props;
  const [records, setRecords] = useState(staticRecords || []);

  async function load() {
    if (!_.isEmpty(staticRecords)) {
      return;
    }

    let filterControls;

    if (control && control.advancedSetting.filters) {
      filterControls = getFilter({ control, formData, appId });
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
            <Button
              className="mTop2 mRight6 mBottom2 Normal"
              color={checked ? 'primary' : 'default'}
              variant={checked ? (multiple ? 'filled' : 'solid') : 'outlined'}
              shape="round"
              size="small"
              ellipsis
              style={checked && multiple ? SELECTED_MULTIPLE_OPTION_BUTTON_STYLE : OPTION_BUTTON_STYLE}
              title={title}
              key={i}
              aria-pressed={!!checked}
              icon={multiple && checked ? <Icon icon="hr_ok" className="Font13" /> : undefined}
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
            </Button>
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
