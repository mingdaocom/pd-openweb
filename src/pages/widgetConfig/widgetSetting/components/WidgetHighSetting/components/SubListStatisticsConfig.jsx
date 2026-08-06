import React, { Fragment, useState } from 'react';
import { Checkbox } from 'ming-ui';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import SubListSummaryWidget from './SubListSummaryWidget';

export default function SubListStatisticsConfig(props) {
  const { data, controls, onChange } = props;
  const { openstatistics, statisticsseting, layercontrolid } = getAdvanceSetting(data);
  const [visible, setVisible] = useState(false);
  const hasStatisticsSetting = safeParse(statisticsseting || '[]').length > 0;

  if (layercontrolid) return null;

  return (
    <Fragment>
      <div className="labelWrap labelBetween">
        <Checkbox
          className="allowSelectRecords"
          size="small"
          text={_l('显示统计行')}
          checked={openstatistics === '1'}
          onClick={checked => {
            if (!checked) setVisible(true);
            onChange(
              handleAdvancedSettingChange(data, {
                openstatistics: checked ? '0' : '1',
                ...(checked && statisticsseting ? { statisticsseting: '' } : {}),
              }),
            );
          }}
        />
        {openstatistics === '1' && (
          <i
            className={`icon-settings ${hasStatisticsSetting ? 'colorPrimary' : 'textTertiary'} Font16 Hand Right hoverColorPrimary`}
            onClick={() => setVisible(true)}
          ></i>
        )}
      </div>
      {visible && <SubListSummaryWidget {...props} controls={controls} onClose={() => setVisible(false)} />}
    </Fragment>
  );
}
