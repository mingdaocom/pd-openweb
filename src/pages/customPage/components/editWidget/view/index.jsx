import React, { useCallback, useState } from 'react';
import Dialog from 'rc-dialog';
import styled from 'styled-components';
import { Icon, Button } from 'ming-ui';
import 'rc-dialog/assets/index.css';
import { Header, EditWidgetContent } from '../../../styled';
import Preview from './Preview';
import Setting from './Setting';

const Wrap = styled.div`
  background-color: #eee;
  height: 100%;
  display: flex;
`;

export default function View(props) {
  const { widget, onEdit, onClose } = props;

  const [setting, setSetting] = useState(widget);
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    const { viewId, config = {} } = setting;
    if (_.isEmpty(viewId)) {
      alert(_l('请选择视图'), 3);
      return;
    }
    if (_.isEmpty(config.name)) {
      const { _workSheetName, _viewName } = config;
      config.name = `${config._workSheetName} (${config._viewName})`;
    }
    delete config._workSheetName;
    delete config._viewName;
    onEdit(setting);
  };

  return (
    <Dialog
      maskStyle={{ zIndex: 999 }}
      wrapClassName="customPageViewWrap"
      className="editWidgetDialogWrap"
      visible
      onClose={onClose}
      closeIcon={<Icon icon="close ThemeHoverColor3" />}
    >
      <Header>
        <div className="typeName">{_l('视图')}</div>
        <Button className="saveBtn" onClick={handleSave}>{_l('保存')}</Button>
      </Header>
      <EditWidgetContent>
        <Wrap>
          <Preview
            {...props}
            loading={loading}
            setting={setting}
          />
          <Setting
            {...props}
            setting={setting}
            setSetting={(data) => {
              setSetting({
                ...setting,
                ...data
              });
            }}
            setLoading={setLoading}
          />
        </Wrap>
      </EditWidgetContent>
    </Dialog>
  );
}
