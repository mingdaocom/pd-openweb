import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Dropdown, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { ShowFormatDialog } from 'src/pages/widgetConfig/widgetSetting/components/WidgetHighSetting/ControlSetting/DateConfig';
import { POSITION_OPTION } from '../../config';

const AdditionSettingConfig = [
  {
    text: _l('公司名称'),
    key: 'companyNameChecked',
  },
  {
    text: (
      <span>
        {_l('企业Logo')}
        <Tooltip placement="top" title={_l('在企业管理后台中设置')}>
          <Icon icon="help" className="Font13 mLeft8 Gray_bd" />
        </Tooltip>
      </span>
    ),
    key: 'logoChecked',
  },
  {
    text: _l('二维码'),
    key: 'qrCode',
  },
  {
    text: _l('记录标题'),
    key: 'titleChecked',
  },
  {
    text: _l('打印时间'),
    key: 'printTime',
  },
  {
    text: _l('打印人'),
    key: 'printAccount',
  },
];

const QrCodeOption = [
  { text: _l('对外公开分享链接'), value: 0 },
  { text: _l('内部成员访问链接'), value: 1 },
];

export default function AdditionSetting(props) {
  const { hide, formNameSite, shareType, printData, handChange, changeAdvanceSettings } = props;

  const [formatDialogVisible, setFormatDialogVisible] = useState(false);

  const changeTimeFormat = value => {
    changeAdvanceSettings({
      key: 'printTime',
      value: value,
    });
    setFormatDialogVisible(false);
  };

  const renderFormatDialog = () => {
    if (!formatDialogVisible) return null;

    return (
      <ShowFormatDialog
        showformat={
          _.get(
            (printData.advanceSettings || []).find(l => l.key === 'printTime'),
            'value',
          ) || 'YYYY-MM-DD HH:mm:ss'
        }
        type={16}
        onClose={() => setFormatDialogVisible(false)}
        onOk={changeTimeFormat}
      />
    );
  };
  if (hide) return null;

  return (
    <React.Fragment>
      <div className="mTop12 valignWrapper">
        <Checkbox
          checked={printData.formNameChecked}
          className="flex"
          onClick={() =>
            handChange({
              formNameChecked: !printData.formNameChecked,
            })
          }
          text={_l('表单标题')}
        />
        <span className="Gray_9">{_l('位置')}</span>
        <div className="forSizeBox mLeft12 namePositionBox">
          {POSITION_OPTION.map(item => (
            <span
              key={`print-namePositionOption-${item.value}`}
              className={cx({ current: formNameSite === item.value })}
              onClick={() => changeAdvanceSettings({ key: 'formNameSite', value: item.value })}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
      {printData.formNameChecked && (
        <textarea
          className=""
          onChange={e =>
            handChange({
              formName: e.target.value,
            })
          }
        >
          {printData.formName}
        </textarea>
      )}
      {AdditionSettingConfig.map(l => {
        const isSysTime = _.endsWith(l.key, 'Time');

        return (
          <div className={cx('mTop12', { valignWrapper: isSysTime })} key={`AdditionSettingConfig-${l.key}`}>
            <Checkbox
              checked={printData[l.key]}
              className={cx({ flex: isSysTime })}
              onClick={() =>
                handChange({
                  [l.key]: !printData[l.key],
                })
              }
              text={l.text}
            />
            {l.key === 'qrCode' && printData.qrCode && (
              <Dropdown
                className="forSizeText forQrCode"
                value={shareType}
                onChange={value =>
                  handChange({
                    shareType: value,
                  })
                }
                data={QrCodeOption.filter(
                  o => !md.global.Account.isPortal || (md.global.Account.isPortal && o.value !== 1),
                )} //外部门户没有内部成员访问链接
              />
            )}
            {isSysTime && (
              <Icon
                icon="settings"
                className="Font18 Gray_9d Hand TxtCenter TxtBottom"
                onClick={() => setFormatDialogVisible(true)}
              />
            )}
          </div>
        );
      })}
      {renderFormatDialog()}
    </React.Fragment>
  );
}
