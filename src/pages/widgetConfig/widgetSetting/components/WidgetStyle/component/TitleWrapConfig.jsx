import React, { Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Checkbox, Segmented, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { DISPLAY_RC_TITLE_STYLE } from 'src/utils/domain/control/setting';

export default function TitleWrapConfig(props) {
  const { data, onChange } = props;
  const { titlewrap, rctitlestyle = '0', usecolumnstyle, detailworksheettype } = getAdvanceSetting(data);

  return (
    <Fragment>
      <div className="flexCenter" style={{ justifyContent: 'space-between' }}>
        <div className="labelWrap LineHeight36">
          <Checkbox
            checked={titlewrap === '1'}
            onChange={event =>
              onChange(
                handleAdvancedSettingChange(data, {
                  titlewrap: String(+event.target.checked),
                }),
              )
            }
            size="small"
          >
            {_l('标题行文字换行')}
          </Checkbox>
        </div>
        {titlewrap === '1' && (
          <Segmented
            block
            style={{ width: 112 }}
            value={rctitlestyle}
            options={DISPLAY_RC_TITLE_STYLE.map(({ icon, text, value }) => ({
              value,
              icon: <Icon icon={icon} className="Font18" />,
              tooltip: text,
            }))}
            onChange={value => onChange(handleAdvancedSettingChange(data, { rctitlestyle: value }))}
          />
        )}
      </div>

      {detailworksheettype !== '2' && (
        <div className="labelWrap">
          <Checkbox
            checked={usecolumnstyle === '1'}
            onChange={event =>
              onChange(
                handleAdvancedSettingChange(data, {
                  usecolumnstyle: String(+event.target.checked),
                }),
              )
            }
            size="small"
          >
            <span style={{ marginRight: '4px' }}>{_l('列样式与工作表保持一致')}</span>
            <Tooltip
              placement="bottom"
              title={
                data.type === 34
                  ? _l('继承关联工作表设置的列样式。')
                  : _l('继承关联工作表设置的列样式。如果指定的关联视图是表格视图、则使用该视图设置的列样式。')
              }
            >
              <i className="icon-help textTertiary Font16"></i>
            </Tooltip>
          </Checkbox>
        </div>
      )}
    </Fragment>
  );
}
