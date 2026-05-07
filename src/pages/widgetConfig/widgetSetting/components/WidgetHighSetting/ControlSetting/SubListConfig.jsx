import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange, updateConfig } from '../../../../util/setting';
import SetHiddenControls from '../components/SetHiddenControls';
import SubListSummaryWidget from '../components/SubListSummaryWidget';

export default function SubListConfig(props) {
  const { data, onChange } = props;
  const { controlId = [], strDefault } = data;
  const { showcount = '0', layercontrolid, openstatistics, statisticsseting } = getAdvanceSetting(data);
  const { mode, sheetInfo = {} } = window.subListSheetConfig[controlId] || {};
  const [isHiddenOtherViewRecord] = (strDefault || '000').split('');
  const [visible, setVisible] = useState(false);
  const controls = _.get(sheetInfo, 'template.controls') || _.get(sheetInfo, 'relationControls');

  return (
    <Fragment>
      {!layercontrolid && (
        <Fragment>
          <div className="labelWrap">
            <Checkbox
              className="allowSelectRecords"
              size="small"
              text={_l('显示计数')}
              checked={showcount !== '1'}
              onClick={checked =>
                onChange(
                  handleAdvancedSettingChange(data, {
                    showcount: checked ? '1' : '0',
                  }),
                )
              }
            >
              <Tooltip placement="bottom" title={_l('在表单中显示子表的数量')}>
                <i className="icon icon-help textDisabled Font15 mLeft5 pointer" />
              </Tooltip>
            </Checkbox>
          </div>
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
                className="icon-settings textTertiary Font16 Hand Right ThemeHoverColor3"
                onClick={() => setVisible(true)}
              ></i>
            )}
          </div>
        </Fragment>
      )}
      {mode === 'relate' && (
        <Fragment>
          {!layercontrolid && (
            <div className="labelWrap">
              <Checkbox
                size="small"
                text={_l('按用户权限访问')}
                checked={!!+isHiddenOtherViewRecord}
                onClick={checked => {
                  onChange({
                    strDefault: updateConfig({
                      config: strDefault,
                      value: +!checked,
                      index: 0,
                    }),
                  });
                }}
              >
                <Tooltip
                  placement="bottom"
                  title={
                    <span>
                      {_l(
                        '未勾选时，用户可查看、编辑所有明细。勾选后，按照用户在实体工作表中配置的权限生效，包含对明细的新增、查看，编辑，删除；以及对字段的可见、编辑权限',
                      )}
                    </span>
                  }
                >
                  <i className="icon icon-help textDisabled Font15 mLeft5 pointer" />
                </Tooltip>
              </Checkbox>
            </div>
          )}

          <SetHiddenControls {...props} controls={controls} />
        </Fragment>
      )}

      {visible && <SubListSummaryWidget {...props} controls={controls} onClose={() => setVisible(false)} />}
    </Fragment>
  );
}
