import React from 'react';
import styled from 'styled-components';
import { ScrollView } from 'ming-ui';
import { Button, Modal } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import PrintTemplateIcon from 'src/pages/FormSet/containers/Print/components/PrintTemplateIcon';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';

const LIST_ROW_HEIGHT = 60;
const LIST_MAX_HEIGHT = LIST_ROW_HEIGHT * 6;

const Description = styled.div`
  margin-bottom: 14px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 20px;
`;

const NON_CLOSABLE_MASK = { closable: false };

const TemplateList = styled(ScrollView)`
  max-height: ${LIST_MAX_HEIGHT}px;
  background: var(--color-background-secondary);
`;

const TemplateRow = styled.div`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: ${LIST_ROW_HEIGHT}px;
  margin: 0 16px;
  border-bottom: 1px solid var(--color-border-secondary);

  &:last-child {
    border-bottom: 0;
  }
`;

const TemplateName = styled.span`
  min-width: 0;
  margin-left: 12px;
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PrintCount = styled.span`
  flex-shrink: 0;
  margin-left: auto;
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 700;
`;

const ResetButton = styled(Button)`
  flex-shrink: 0;
  width: 48px;
  height: 28px;
  margin-left: 15px;
  padding: 0;
  font-size: 12px;
`;

function confirmResetPrintCount({ modal, template, projectId, worksheetId, rowId, onReset }) {
  modal.confirm({
    centered: true,
    width: 560,
    className: 'printCountModal',
    mask: NON_CLOSABLE_MASK,
    title: <span className="textError">{_l('确认重置“%0”的打印次数吗？', template.name)}</span>,
    content: _l('仅重置当前模板在本记录下的打印次数，记录总次数和其他模板的打印次数不变。'),
    okText: _l('确认'),
    cancelText: _l('取消'),
    okButtonProps: { danger: true },
    onOk: () =>
      worksheetAjax
        .resetTemplatePrintCount({
          projectId,
          worksheetId,
          printId: template.printId,
          rowId,
        })
        .then(onReset)
        .catch(_requestError => {
          alertIfNotUnauthorized(_requestError, _l('重置失败，请稍后再试'), 2);
        }),
  });
}

export default function ManagePrintCountModal({ templates, projectId, worksheetId, rowId, onReset, onCancel }) {
  const listHeight = Math.min(LIST_MAX_HEIGHT, templates.length * LIST_ROW_HEIGHT);
  const [modal, modalContextHolder] = Modal.useModal();

  return (
    <Modal
      open
      width={680}
      className="printCountModal"
      mask={NON_CLOSABLE_MASK}
      footer={null}
      title={_l('管理模板打印次数')}
      onCancel={onCancel}
    >
      {modalContextHolder}
      <Description>{_l('仅重置当前模板次数，记录总计打印次数不减少')}</Description>
      <TemplateList style={{ height: listHeight }}>
        {templates.map(template => (
          <TemplateRow key={template.printId}>
            <PrintTemplateIcon template={template} size="small" />
            <TemplateName title={template.name}>{template.name}</TemplateName>
            <PrintCount>
              {template.printCount}/{template.printLimitCount}
            </PrintCount>
            <ResetButton
              disabled={Number(template.printCount) === 0}
              onClick={() => confirmResetPrintCount({ modal, template, projectId, worksheetId, rowId, onReset })}
            >
              {_l('重置')}
            </ResetButton>
          </TemplateRow>
        ))}
      </TemplateList>
    </Modal>
  );
}
