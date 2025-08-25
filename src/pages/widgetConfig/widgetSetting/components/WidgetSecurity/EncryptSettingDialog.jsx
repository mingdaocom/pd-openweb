import React from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Dialog, Dropdown, Support } from 'ming-ui';
import { SettingItem } from 'src/pages/widgetConfig/styled';

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
    <span className="Gray_75">
      {_l('无可用加密规则，请')}
      <Support
        type={3}
        text={_l('前往组织后台')}
        href={`${location.origin}/admin/settings/${projectId}/isShowEncryptRules`}
      />
      {_l('进行配置')}
    </span>
  );

  return (
    <Dialog
      width={560}
      visible={true}
      title={<span className="Bold">{_l('设置加密规则')}</span>}
      onCancel={onCancel}
      overlayClosable={false}
      okDisabled={!(newRule || oldRule)}
      onOk={() => {
        onChange({ encryId: newRule || oldRule });
        onCancel();
      }}
    >
      <div>
        {_l(
          '注意：设置后，新保存的字段值将按按照新规则加密，历史值不会自动刷新。之后您需要手动刷新历史数据，未刷新时历史数据可查看，但无法被筛选。',
        )}
        <Support type={3} text={_l('如何刷新数据？')} href="https://help.mingdao.com/worksheet/batch-refresh" />
      </div>
      <SettingItem>
        <div className="settingItemTitle labelBetween">{encryId ? _l('当前规则') : _l('规则')}</div>
        <Dropdown
          border
          isAppendToBody
          disabled={encryId}
          value={isDeleteRule ? undefined : oldRule || undefined}
          placeholder={isDeleteRule ? <span className="Red">{_l('规则已删除')}</span> : _l('请选择')}
          noData={EmptyContent}
          data={encryId ? encryData : encryData.filter(i => i.state === 1)}
          onChange={value => {
            setRule({ oldRule: value });
          }}
        />
      </SettingItem>
      {encryId && (
        <SettingItem>
          <div className="settingItemTitle labelBetween">{_l('新规则')}</div>
          <Dropdown
            border
            isAppendToBody
            value={newRule || undefined}
            noData={EmptyContent}
            data={encryData.filter(i => i.state === 1 && i.value !== encryId)}
            onChange={value => {
              setRule({ newRule: value });
            }}
          />
        </SettingItem>
      )}
    </Dialog>
  );
}
