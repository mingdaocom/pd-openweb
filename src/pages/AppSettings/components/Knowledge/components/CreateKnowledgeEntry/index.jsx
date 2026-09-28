import React, { Fragment, useState } from 'react';
import { Icon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import { isDisabledKnowledge } from '../../core/utils';
import CreateKnowledge from '../CreateKnowledge';

const CreateRagEntry = props => {
  const { projectId, overLimit } = props;
  const [visible, setVisible] = useState(false);

  const handleCreateKnowledge = () => {
    if (isDisabledKnowledge(projectId)) return;

    setVisible(true);
  };

  return (
    <Fragment>
      <Button
        type="primary"
        shape="round"
        disabled={overLimit}
        icon={<Icon icon="plus" />}
        onClick={handleCreateKnowledge}
      >
        {_l('向量知识库')}
      </Button>
      {visible && <CreateKnowledge {...props} onClose={() => setVisible(false)} />}
    </Fragment>
  );
};

export default CreateRagEntry;
