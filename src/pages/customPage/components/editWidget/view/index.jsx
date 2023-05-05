import React, { useCallback, useState } from 'react';
import Dialog from 'rc-dialog';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { ConfigProvider, Button, Tooltip } from 'antd';
import 'rc-dialog/assets/index.css';
import { Header, EditWidgetContent } from '../../../styled';
import Preview from './Preview';
import Setting from './Setting';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

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
    if (_.isEmpty(config.objectId)) {
      config.objectId = uuidv4();
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
    >
      <Header>
        <div className="typeName">{_l('视图')}</div>
        <div className="flexRow valignWrapper">
          <ConfigProvider autoInsertSpaceInButton={false}>
            <Button block className="save" shape="round" type="primary" onClick={handleSave}>
              {_l('保存')}
            </Button>
          </ConfigProvider>
          <Tooltip title={_l('关闭')} placement="bottom">
            <Icon icon="close" className="Font24 pointer mLeft16 Gray_9e" onClick={onClose} />
          </Tooltip>
        </div>
      </Header>
      <EditWidgetContent>
        <Wrap>
          <Preview {...props} loading={loading} setting={setting} />
          <Setting
            {...props}
            setting={setting}
            setSetting={data => {
              setSetting({
                ...setting,
                ...data,
              });
            }}
            setLoading={setLoading}
          />
        </Wrap>
      </EditWidgetContent>
    </Dialog>
  );
}
