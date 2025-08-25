import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Dropdown } from 'ming-ui';
import groupAjax from 'src/api/group';
import { expireDialogAsync } from 'src/components/upgradeVersion';

const Box = styled.div`
  padding: 12px;
  background: #fffae6;
  font-size: 13px;
  .pointer {
    margin: 6px 0 2px;
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default ({ session, onChangeIsPost }) => {
  const { groupId } = session;
  const [visible, setVisible] = useState(false);
  const [orgId, setOrgId] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const checkProject = id => {
    expireDialogAsync(id)
      .then(() => {
        setIsDisabled(false);
      })
      .catch(() => {
        setIsDisabled(true);
      });
  };
  const updateGroup = () => {
    groupAjax
      .updateGroupToPost({
        groupId,
        projectId: orgId,
      })
      .then(res => {
        if (res) {
          alert(_l('操作成功'));
          setVisible(false);
          onChangeIsPost(orgId);
          location.href.includes('chat_window') && window.close();
        } else {
          alert(_l('操作失败'), 2);
        }
      });
  };

  return (
    <Fragment>
      <Box>
        <div>
          <span className="bold">{_l('当前为个人创建的临时聊天。')}</span>
          {_l('如果您需要长期使用请及时转为群组，可以管理群成员、聊天内容和文件，信息沟通更安全')}
        </div>
        <div className="ThemeColor3 pointer bold" onClick={() => setVisible(true)}>
          {_l('转为长期群组 >')}
        </div>
      </Box>

      {visible && (
        <Dialog
          visible
          title={_l('转换为长期群组')}
          okDisabled={isDisabled}
          onOk={updateGroup}
          onCancel={() => setVisible(false)}
        >
          <div className="mTop15 Gray_6 flexRow alignItemsCenter">
            <div>{_l('所属组织')}</div>
            <div className="mLeft15 flex">
              <Dropdown
                border
                isAppendToBody
                className="w100"
                value={orgId}
                data={_.get(md, 'global.Account.projects', []).map(l => ({ value: l.projectId, text: l.companyName }))}
                onChange={id => {
                  checkProject(id);
                  setOrgId(id);
                }}
              />
            </div>
          </div>
          <p className="mTop15 Gray_6">{_l('点选转换后，该长期群组将永久隶属于此组织，不可更改')}</p>
        </Dialog>
      )}
    </Fragment>
  );
};
