import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { find } from 'lodash';
import styled from 'styled-components';
import { Support } from 'ming-ui';
import { Modal, Select } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import { formatAppsToDropdown } from 'src/utils/domain/control/filters';
import { useGetApps } from '../../../hooks';
import { SettingItem } from '../../../styled';
import EditOptionList from './EditOptionList';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

const AddOptionList = styled.div`
  cursor: pointer;
  color: var(--color-primary);
  &:hover {
    color: var(--color-link-hover);
  }
`;

export default function SelectOptionList(props) {
  const { globalSheetInfo, onOk, onCancel } = props;
  const { projectId, appId } = globalSheetInfo;
  const [apps] = useGetApps({ projectId });
  const [visible, setVisible] = useState(false);
  const [{ app, list, listId, listItem }, setInfo] = useSetState({ app: appId, list: [], listId: '', listItem: {} });

  const getList = useCallback(() => {
    if (!app) return;
    worksheetAjax.getCollectionsByAppId({ appId: app }).then(({ code, data, msg }) => {
      if (code === 1) {
        setInfo({ list: data });
      } else {
        alert(msg);
      }
    });
  }, [app]);

  useEffect(() => {
    getList();
  }, [getList]);

  return (
    <Modal
      open
      mask={{ closable: true }}
      keyboard
      width={560}
      title={<span className="Bold">{_l('使用选项集')}</span>}
      onCancel={onCancel}
      okButtonProps={{ disabled: !listId }}
      onOk={() => onOk({ app, listId, listItem })}
      footerLeftElement={() => (
        <AddOptionList className="flexCenter Bold" onClick={() => setVisible(true)}>
          <i className="icon-add Font18"></i>
          {_l('新建选项集')}
        </AddOptionList>
      )}
    >
      <Fragment>
        <div className="hint textTertiary">
          {_l('选项集可以使一组选项在其他工作表中共用。你可以新建选项集或将一个已有的自定义选项转为选项集后再使用。')}
          <Support href="https://help.mingdao.com/worksheet/option-set" type={3} text={_l('帮助')} />
        </div>
        <SettingItem>
          <div className="settingItemTitle">{_l('应用')}</div>
          <Select
            className="w100"
            showPopupSearch
            optionFilterProp="text"
            value={app}
            options={formatAppsToDropdown(apps, appId)}
            fieldNames={SELECT_FIELD_NAMES}
            onChange={value => setInfo({ app: value })}
          />
        </SettingItem>
        <SettingItem>
          <div className="settingItemTitle">{_l('选项集')}</div>
          <Select
            className="w100"
            value={listId || undefined}
            showPopupSearch
            optionFilterProp="label"
            options={list.map(({ name, collectionId }) => ({ label: name, value: collectionId }))}
            onChange={value => setInfo({ listId: value, listItem: find(list, item => item.collectionId === value) })}
          />
        </SettingItem>
      </Fragment>
      {visible && (
        <EditOptionList
          projectId={projectId}
          appId={appId}
          onOk={() => {
            getList();
            setVisible(false);
          }}
          onCancel={() => setVisible(false)}
        />
      )}
    </Modal>
  );
}
