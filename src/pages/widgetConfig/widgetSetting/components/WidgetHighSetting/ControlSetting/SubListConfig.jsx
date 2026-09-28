import React, { Fragment } from 'react';
import _ from 'lodash';
import { Checkbox, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { updateConfig } from 'src/utils/domain/control/editorSetting';
import SetHiddenControls from '../components/SetHiddenControls';
import SubListStatisticsConfig from '../components/SubListStatisticsConfig';

export default function SubListConfig(props) {
  const { data, onChange } = props;
  const { controlId = [], strDefault } = data;
  const { showcount = '0', layercontrolid, rcsorttype = '2' } = getAdvanceSetting(data);
  const { mode, sheetInfo = {} } = window.subListSheetConfig[controlId] || {};
  const [isHiddenOtherViewRecord] = (strDefault || '000').split('');
  const controls = _.get(sheetInfo, 'template.controls') || _.get(sheetInfo, 'relationControls');

  return (
    <Fragment>
      {!layercontrolid && (
        <Fragment>
          <div className="labelWrap">
            <Checkbox
              className="allowSelectRecords"
              checked={showcount !== '1'}
              onChange={event =>
                onChange(
                  handleAdvancedSettingChange(data, {
                    showcount: !event.target.checked ? '1' : '0',
                  }),
                )
              }
              size="small"
            >
              {_l('显示计数')}
              <Tooltip placement="bottom" title={_l('在表单中显示子表的数量')}>
                <i className="icon icon-help textDisabled Font15 mLeft5 pointer" />
              </Tooltip>
            </Checkbox>
          </div>
          <SubListStatisticsConfig {...props} controls={controls} />
        </Fragment>
      )}
      {mode === 'relate' && (
        <Fragment>
          {!layercontrolid && (
            <div className="labelWrap">
              <Checkbox
                checked={!!+isHiddenOtherViewRecord}
                onChange={event => {
                  const checked = +event.target.checked;
                  const nextData = {
                    ...data,
                    strDefault: updateConfig({
                      config: strDefault,
                      value: checked,
                      index: 0,
                    }),
                  };

                  onChange(
                    checked && rcsorttype === '1'
                      ? handleAdvancedSettingChange(nextData, {
                          rcsorttype: '2',
                        })
                      : nextData,
                  );
                }}
                size="small"
              >
                {_l('按用户权限访问')}
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
    </Fragment>
  );
}
