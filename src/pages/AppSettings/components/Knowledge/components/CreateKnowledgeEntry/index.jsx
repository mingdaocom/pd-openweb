import React, { Fragment, useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { isDisabledKnowledge } from '../../core/utils';
import CreateKnowledge from '../CreateKnowledge';

const CreateKnowledgeBtnContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  height: 36px;
  border-radius: 36px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  cursor: pointer;
  ${props =>
    props.disabled &&
    `pointer-events: none;
    background: var(--color-background-disabled);
    color: var(--color-text-disabled);
    cursor: not-allowed;
    `}
  &:hover {
    background: var(--color-primary-dark);
  }
  .icon {
    margin-right: 8px;
  }
`;

const CreateRagEntry = props => {
  const { projectId, overLimit } = props;
  const [visible, setVisible] = useState(false);

  const handleCreateKnowledge = () => {
    if (isDisabledKnowledge(projectId)) return;

    setVisible(true);
  };

  return (
    <Fragment>
      <CreateKnowledgeBtnContainer disabled={overLimit} onClick={handleCreateKnowledge}>
        <Icon icon="plus" />
        {_l('向量知识库')}
      </CreateKnowledgeBtnContainer>
      {visible && <CreateKnowledge {...props} onClose={() => setVisible(false)} />}
    </Fragment>
  );
};

export default CreateRagEntry;
