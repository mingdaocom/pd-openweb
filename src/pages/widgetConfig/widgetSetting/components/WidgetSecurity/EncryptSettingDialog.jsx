import React from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Support } from 'ming-ui';
import { Modal, Select } from 'ming-ui/antd-components';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import { pathCompletion } from 'src/utils/platform/navigation/path';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

export default function EncryptSettingDialog(props) {
  const { data = {}, encryData = [], isDeleteRule, globalSheetInfo: { projectId } = {}, onCancel, onChange } = props;
  const { encryId = '' } = data;
  const [{ oldRule, newRule }, setRule] = useSetState({
    oldRule:
      encryId ||
      _.get(
        _.find(encryData, i => i.state === 1 && i.isDefault),
        'value',
      ) ||
      '',
    newRule: '',
  });

  const EmptyContent = (
    <span className="textSecondary">
      {_l('无可用加密规则，请')}
      <Support
        type={3}
        text={_l('前往组织后台')}
        href={pathCompletion(`/admin/data/${projectId}/isShowEncryptRules`)}
      />
      {_l('进行配置')}
    </span>
  );

  return (
    <Modal
      width={560}
      open={true}
      keyboard
      title={<span className="Bold">{_l('设置加密规则')}</span>}
      styles={{ header: { marginBottom: 8 } }}
      onCancel={onCancel}
      mask={{ closable: false }}
      okDisabled={!(newRule || oldRule)}
      onOk={() => {
        onChange({ encryId: newRule || oldRule });
        onCancel();
      }}
    >
      <div>
        {_l(
          '注意：设置后，新保存的字段值将按照新规则加密，历史值不会自动刷新。之后您需要手动刷新历史数据，未刷新时历史数据可查看，但无法被筛选。',
        )}
        <Support type={3} text={_l('如何刷新数据？')} href="https://help.mingdao.com/worksheet/batch-refresh" />
      </div>
      <SettingItem>
        <div className="settingItemTitle labelBetween">{encryId ? _l('当前规则') : _l('规则')}</div>
        <Select
          className="w100"
          disabled={encryId}
          value={isDeleteRule ? undefined : oldRule || undefined}
          placeholder={isDeleteRule ? <span className="Red">{_l('规则已删除')}</span> : _l('请选择')}
          notFoundContent={EmptyContent}
          options={encryId ? encryData : encryData.filter(i => i.state === 1)}
          fieldNames={SELECT_FIELD_NAMES}
          onChange={value => {
            setRule({ oldRule: value });
          }}
        />
      </SettingItem>
      {encryId && (
        <SettingItem>
          <div className="settingItemTitle labelBetween">{_l('新规则')}</div>
          <Select
            className="w100"
            value={newRule || undefined}
            notFoundContent={EmptyContent}
            options={encryData.filter(i => i.state === 1 && i.value !== encryId)}
            fieldNames={SELECT_FIELD_NAMES}
            onChange={value => {
              setRule({ newRule: value });
            }}
          />
        </SettingItem>
      )}
    </Modal>
  );
}
