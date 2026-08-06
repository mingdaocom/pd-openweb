import React from 'react';
import _ from 'lodash';
import { func, string } from 'prop-types';
import styled from 'styled-components';
import { hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import AddAppItem from './AddAppItem';

const FullCon = styled.div`
  flex: 1;
  padding: 56px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  background: var(--color-background-primary);
  .welcomeTitle {
    font-size: 32px;
    font-weight: 600;
    color: var(--color-text-title);
    text-align: center;
  }
  .welcomeDesc {
    margin-top: 12px;
    font-size: 15px;
    color: var(--color-text-secondary);
    text-align: center;
  }
  .entryWrap {
    width: 100%;
    max-width: 800px;
    margin-top: 40px;
  }
`;

// 新用户 /app/my 无应用时的引导页：欢迎文案 + 复用「创建应用」入口内容（AI 创建 + 更多创建方式）。
export default function CreateFirstApp(props) {
  const { projectId, myPermissions, createAppFromEmpty } = props;
  const project = _.find(md.global.Account.projects, { projectId });
  const canCreate = !_.get(project, 'cannotCreateApp') || hasPermission(myPermissions, PERMISSION_ENUM.CREATE_APP);

  return (
    <FullCon>
      <div className="welcomeTitle">{_l('欢迎使用')}</div>
      <div className="welcomeDesc">{_l('现在，从创建一个应用开始吧')}</div>
      {canCreate && (
        <div className="entryWrap">
          <AddAppItem
            inline
            projectId={projectId}
            myPermissions={myPermissions}
            createAppFromEmpty={createAppFromEmpty}
          />
        </div>
      )}
    </FullCon>
  );
}

CreateFirstApp.propTypes = {
  projectId: string,
  createAppFromEmpty: func,
};
