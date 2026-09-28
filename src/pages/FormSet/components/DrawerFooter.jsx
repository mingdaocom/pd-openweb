import React from 'react';
import styled from 'styled-components';
import { Button, Tooltip } from 'ming-ui/antd-components';

const FooterWrap = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 66px;
  padding: 0 24px;
  gap: 16px;
  box-sizing: border-box;
  background-color: var(--color-background-card) !important;
`;

export default function DrawerFooter(props) {
  const {
    disabled,
    saveLoading,
    okText = _l('保存'),
    wide,
    showTooltips,
    tipsTxt,
    handleSave = () => {},
    onCancel = () => {},
  } = props;

  const saveButton = (
    <Button wide={wide} type="primary" loading={saveLoading} disabled={disabled} onClick={handleSave}>
      {saveLoading ? _l('保存中...') : okText}
    </Button>
  );

  return (
    <FooterWrap>
      {showTooltips ? (
        <Tooltip title={tipsTxt} placement="top">
          {saveButton}
        </Tooltip>
      ) : (
        saveButton
      )}
      <Button wide={wide} color="primary" variant="outlined" onClick={onCancel}>
        {_l('取消')}
      </Button>
    </FooterWrap>
  );
}
