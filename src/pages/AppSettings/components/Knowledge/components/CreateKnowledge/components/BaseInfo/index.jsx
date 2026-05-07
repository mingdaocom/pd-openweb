import React, { useRef } from 'react';
import { Icon } from 'ming-ui';
import { useAutoFocus } from '../../../../core/hooks';
import { useCreateKnowledgeStore } from '../../index';
import { setKnowledgeDesc, setKnowledgeName } from '../../store/actions';
import './index.less';

const MAX_LENGTH = 100;

const BaseInfo = () => {
  const { dispatch, state } = useCreateKnowledgeStore();
  const { knowledgeName, knowledgeDesc } = state;

  const inputRef = useRef(null);

  useAutoFocus(inputRef);

  const handleSetKnowledgeName = value => {
    setKnowledgeName(dispatch, { name: value });
  };

  const handleSetKnowledgeDesc = value => {
    setKnowledgeDesc(dispatch, { desc: value });
  };

  return (
    <div className="baseInfoContainer">
      <Icon icon="database" className="databaseIcon" />
      <div className="baseInfoTitle">{_l('开始创建向量知识库')}</div>
      <div className="subTitle">{_l('点击创建后，系统将先计算分块数量和预计 Token 消耗，确认后开始向量化')}</div>
      <div className="formBox">
        <div className="formItem">
          <div className="formItemLabel">{_l('名称')}</div>
          <input
            ref={inputRef}
            className="knowledgeInput formItemInput"
            placeholder={_l('请输入名称')}
            value={knowledgeName}
            maxLength={MAX_LENGTH}
            onChange={e => handleSetKnowledgeName(e.target.value)}
          />
        </div>
        <div className="formItem">
          <div className="formItemLabel">{_l('说明')}</div>
          <textarea
            className="knowledgeTextarea formItemDesc"
            placeholder={_l('请输入说明')}
            value={knowledgeDesc}
            maxLength={MAX_LENGTH}
            onChange={e => handleSetKnowledgeDesc(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default BaseInfo;
