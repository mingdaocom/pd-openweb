import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ModifyPlanChip, ModifyPlanDialog } from './embed/ModifyPlan';

const Wrap = styled.div`
  margin: 10px 12px 0;
`;

// 输入框上方的「修改搭建计划」聚合挂件：≥1 条待提交修改时由 ChatPanel 渲染。
// 点击 chip 打开可编辑弹窗（逐条删除 + 提交修改）。
export default function ModifyPlanComposer({ edits = [], onDelete = () => {}, onSubmit = () => {} }) {
  const [open, setOpen] = useState(false);

  return (
    <Wrap>
      <ModifyPlanChip count={edits.length} onClick={() => setOpen(true)} />
      {open && (
        <ModifyPlanDialog
          editable
          items={edits}
          onDelete={onDelete}
          onSubmit={() => {
            onSubmit();
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </Wrap>
  );
}

ModifyPlanComposer.propTypes = {
  edits: PropTypes.array,
  onDelete: PropTypes.func,
  onSubmit: PropTypes.func,
};
