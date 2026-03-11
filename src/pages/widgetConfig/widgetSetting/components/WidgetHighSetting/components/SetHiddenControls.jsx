import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import { Checkbox } from 'ming-ui';
import { isSheetDisplay } from '../../../../util';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import SelectFields from '../../CustomEvent/CustomAction/SelectFields';

export default function SetHiddenControls(props) {
  const { data, controls = [], onChange } = props;
  const additionalids = getAdvanceSetting(data, 'additionalids') || [];

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const isChecked = additionalids.length > 0;
    if (isChecked !== checked) {
      setChecked(isChecked);
    }
  }, []);

  const { showControls = [] } = data;
  const filterControls = controls
    .filter(
      i =>
        !_.includes([22, 34, 49, 50, 51, 10010], i.type) &&
        !isSheetDisplay(i) &&
        !_.includes(showControls, i.controlId),
    )
    .map(i => ({ ...i, ...(_.isUndefined(i.relateControls) ? {} : { relateControls: [] }) }));
  const actionItems = additionalids.map(i => ({ controlId: i, childControlIds: [] }));
  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          size="small"
          text={_l('返回隐藏的字段')}
          checked={checked}
          onClick={checked => {
            if (checked) {
              setChecked(false);
              onChange(handleAdvancedSettingChange(data, { additionalids: '' }));
              return;
            }
            setChecked(true);
          }}
        />
      </div>
      {checked && (
        <SelectFields
          className="mTop10"
          hiddenTitle={true}
          allControls={filterControls}
          actionType={6}
          actionItems={actionItems}
          onSelectField={value => {
            const newAdditionalids = value
              .map(i => i.controlId)
              .filter(i => {
                const currentControl = filterControls.find(j => j.controlId === i);
                return _.get(currentControl, 'type') !== 52;
              });
            onChange(handleAdvancedSettingChange(data, { additionalids: JSON.stringify(newAdditionalids) }));
          }}
        />
      )}
    </Fragment>
  );
}
