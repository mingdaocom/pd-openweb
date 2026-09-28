import React, { Fragment, useState } from 'react';
import { Checkbox } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
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
          checked={openstatistics === '1'}
          onChange={event => {
            const checked = !event.target.checked;
            if (!checked) setVisible(true);
            onChange(
              handleAdvancedSettingChange(data, {
                openstatistics: checked ? '0' : '1',
                ...(checked && statisticsseting
                  ? {
                      statisticsseting: '',
                    }
                  : {}),
              }),
            );
          }}
          size="small"
        >
          {_l('显示统计行')}
        </Checkbox>
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
