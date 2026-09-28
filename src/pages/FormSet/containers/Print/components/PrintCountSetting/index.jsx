import React, { useRef, useState } from 'react';
import { UpgradeIcon } from 'ming-ui';
import { InputNumber, Modal, Switch } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import './style.less';

export function PrintCountSettingCard({ worksheetInfo, disabled, onChange }) {
  const { worksheetId, appId, projectId, advancedSetting = {} } = worksheetInfo;
  const [printCountEnabled, setPrintCountEnabled] = useState(advancedSetting.print_count_enabled === '1');
  const [saving, setSaving] = useState(false);

  const updatePrintCountEnabled = checked => {
    if (saving) return;

    const setting = {
      print_count_enabled: checked ? '1' : '0',
    };

    setPrintCountEnabled(checked);
    setSaving(true);

    worksheetAjax
      .editWorksheetSetting({
        workSheetId: worksheetId,
        appId,
        projectId,
        advancedSetting: setting,
        editAdKeys: ['print_count_enabled'],
      })
      .then(res => {
        if (res) {
          onChange({
            ...worksheetInfo,
            advancedSetting: { ...advancedSetting, ...setting },
          });
        }
      })
      .catch(_requestError => {
        setPrintCountEnabled(!checked);
        alertIfNotUnauthorized(_requestError, _l('修改失败，请稍后再试'), 2);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <div className="printCountSettingCard">
      <div className="flex">
        <div className="printCountSettingTitle Font13 Bold textPrimary">{_l('统计打印次数')}</div>
        <div className="printCountSettingDescription Font13 textTertiary mTop4">
          {_l('开启后，在记录打印菜单中显示当前记录下各模板的已打印次数。')}
        </div>
      </div>
      <div className="printCountSettingAction flexRow alignItemsCenter">
        <div className="printCountSettingSwitchWrap">
          <Switch
            className="printCountSettingSwitch"
            size="small"
            checked={printCountEnabled}
            disabled={disabled}
            onChange={(checked, event) => {
              event?.currentTarget?.blur();
              updatePrintCountEnabled(checked);
            }}
          />

          {disabled && (
            <span
              className="printCountSettingSwitchTrigger"
              onClick={() => buriedUpgradeVersionDialog(projectId, VersionProductType.printCountLimit)}
            />
          )}
        </div>
        {disabled && (
          <UpgradeIcon
            onClick={event => {
              event.stopPropagation();
              buriedUpgradeVersionDialog(projectId, VersionProductType.printCountLimit);
            }}
          />
        )}
      </div>
    </div>
  );
}

export function confirmDisableTemplatePrintLimit(onOk) {
  Modal.confirm({
    centered: true,
    width: 560,
    title: <span className="textError">{_l('确认关闭打印次数限制？')}</span>,
    content: _l('关闭后，该模板将不再限制打印次数。已累计的打印次数会保留，重新开启限制后继续生效。'),
    okText: _l('确认'),
    cancelText: _l('取消'),
    okButtonProps: { danger: true },
    onOk,
  });
}

export function PrintCountLimitModal({ value, defaultValue, onSave, onCancel }) {
  const initiallyEnabled = value !== undefined && value !== null;
  const initialCount = Number(defaultValue ?? value);
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [count, setCount] = useState(initialCount > 0 ? initialCount : 1);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const handleSave = async (nextValue, previousCount) => {
    if (savingRef.current) return;

    savingRef.current = true;
    setSaving(true);

    try {
      await onSave(nextValue, previousCount);
      savingRef.current = false;
      onCancel();
    } catch (error) {
      savingRef.current = false;
      setSaving(false);
      alertIfNotUnauthorized(error, _l('修改失败，请稍后再试'), 2);
      throw error;
    }
  };

  const handleEnabledChange = checked => {
    if (!checked && initiallyEnabled) {
      confirmDisableTemplatePrintLimit(() => handleSave(null, count));
      return;
    }

    setEnabled(checked);
  };

  return (
    <Modal
      open
      width={560}
      className="printCountLimitModal"
      title={_l('打印次数限制')}
      okText={_l('保存')}
      cancelText={_l('取消')}
      okDisabled={enabled && !count}
      confirmLoading={saving}
      onCancel={onCancel}
      onOk={() => handleSave(enabled ? count : null).catch(() => {})}
    >
      <div className="printCountLimitDescription Font13 textSecondary">
        {_l('开启后，将限制当前模板对同一条记录的打印次数。达到限制次数后，该记录将无法继续使用此模板打印。')}
      </div>
      <div className="printCountLimitEnableRow flexRow alignItemsCenter">
        <span className="printCountLimitLabel Font13 textPrimary">{_l('启用限制')}</span>
        <Switch size="small" checked={enabled} disabled={saving} onChange={handleEnabledChange} />
      </div>
      {enabled && (
        <div className="printCountLimitInputRow flexRow alignItemsCenter">
          <span className="printCountLimitLabel Font13 textPrimary">{_l('限制次数')}</span>
          <InputNumber
            className="printCountLimitInput flex"
            min={1}
            max={10000}
            precision={0}
            controls={false}
            suffix={_l('次')}
            value={count}
            onChange={setCount}
          />
        </div>
      )}
    </Modal>
  );
}
