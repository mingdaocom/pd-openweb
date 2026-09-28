import React, { useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Icon } from 'ming-ui';
import { Button, Modal, Tooltip } from 'ming-ui/antd-components';
import { EditWidgetContent, Header } from '../../../styled';
import Preview from './Preview';
import Setting from './Setting';

const Wrap = styled.div`
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

    const defaultName =
      config._workSheetName && config._viewName
        ? `${config._workSheetName} (${config._viewName})`
        : config._workSheetName || config._viewName || _l('视图');
    const nextConfig = {
      ...config,
      name: _.isEmpty(config.name) ? defaultName : config.name,
      objectId: _.isEmpty(config.objectId) ? uuidv4() : config.objectId,
    };

    delete nextConfig._workSheetName;
    delete nextConfig._viewName;
    onEdit({ ...setting, config: nextConfig });
  };

  return (
    <Modal
      className="editWidgetDialogWrap"
      classNames={{ container: 'pAll0', body: 'pAll0' }}
      styles={{ body: { padding: 0, position: 'relative' } }}
      verticalAlign="bottom"
      open
      width="100%"
      type="fixed"
      footer={null}
      closable={false}
      centered={true}
      onCancel={onClose}
    >
      <Header>
        <div className="typeName">{_l('视图')}</div>
        <div className="flexRow valignWrapper">
          <Button block className="save" shape="round" type="primary" onClick={handleSave}>
            {_l('保存')}
          </Button>
          <Tooltip title={_l('关闭')} placement="bottom">
            <Icon icon="close" className="Font24 pointer mLeft16 textTertiary" onClick={onClose} />
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
    </Modal>
  );
}
