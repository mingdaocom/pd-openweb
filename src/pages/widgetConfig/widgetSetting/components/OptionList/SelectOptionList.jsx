import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { Support, Button, Dropdown, Dialog } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import { find } from 'lodash';
import { useGetApps } from '../../../hooks';
import { formatAppsToDropdown } from '../../../util';
import { SettingItem } from '../../../styled';
import EditOptionList from './EditOptionList';

const DialogFooter = styled.div`
  margin-top: 24px;
  justify-content: space-between;
  .addOptionList {
    cursor: pointer;
    color: #2196f3;
    &:hover {
      color: #2b65c4;
    }
  }
  .btns {
    .text {
      margin-right: 24px;
    }
  }
`;

export default function SelectOptionList(props) {
  const { globalSheetInfo, onOk, onCancel, ...rest } = props;
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
    <Dialog
      visible
      width={560}
      title={<span className="Bold">{_l('使用选项集')}</span>}
      footer={null}
      onCancel={onCancel}
    >
      <Fragment>
        <div className="hint Gray_9e">
          {_l('选项集可以使一组选项在其他工作表中共用。你可以新建选项集或将一个已有的自定义选项转为选项集后再使用。')}
          <Support href="https://help.mingdao.com/sheet30" type={3} text={_l('帮助')} />
        </div>
        <SettingItem>
          <div className="settingItemTitle">{_l('应用')}</div>
          <Dropdown
            isAppendToBody
            border
            openSearch
            value={app}
            data={formatAppsToDropdown(apps, appId)}
            onChange={value => setInfo({ app: value })}
          />
        </SettingItem>
        <SettingItem>
          <div className="settingItemTitle">{_l('选项集')}</div>
          <Dropdown
            value={listId || undefined}
            isAppendToBody
            border
            openSearch
            data={list.map(({ name, collectionId }) => ({ text: name, value: collectionId }))}
            onChange={value => setInfo({ listId: value, listItem: find(list, item => item.collectionId === value) })}
          />
        </SettingItem>
      </Fragment>
      <DialogFooter className="flexCenter">
        <div className="flexCenter addOptionList Bold" onClick={() => setVisible(true)}>
          <i className="icon-add Font18"></i>
          {_l(' 新建选项集')}
        </div>
        <div className="btns flexCenter">
          <div className="text hoverText Gray_9e pointer" onClick={onCancel}>
            {_l('取消')}
          </div>
          <Button disabled={!listId} onClick={() => onOk({ app, listId, listItem })}>
            {_l('确定')}
          </Button>
        </div>
      </DialogFooter>
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
    </Dialog>
  );
}
