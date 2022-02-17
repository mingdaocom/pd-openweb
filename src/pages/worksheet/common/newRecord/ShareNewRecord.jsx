import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Modal, Switch } from 'ming-ui';
import { updatePublicWorksheetState } from 'src/api/publicWorksheet';
import { Tip75, Hr } from 'src/pages/publicWorksheetConfig/components/Basics';
import ShareUrl from 'src/pages/publicWorksheetConfig/components/ShareUrl';
import { VISIBLE_TYPE } from 'src/pages/publicWorksheetConfig/enum';

const Midddle = styled.span`
  vertical-align: middle;
`;

export default function ShareNewRecord(props) {
  const { isCharge, appId, viewId, worksheetId, publicShareUrl, onClose } = props;
  const [visibleType, setVisibleType] = useState(props.visibleType);
  const newRecordUrl = `${md.global.Config.WebUrl}app/${appId}/newrecord/${worksheetId}/${viewId}/`;
  return (
    <Modal visible width={560} footer={null} title={_l('新建记录链接')} className="newRecordLink" onCancel={onClose}>
      <div className="Font15">{_l('内部成员访问')}</div>
      <Tip75 className="mTop13">{_l('仅限应用内成员登录系统后根据权限访问')}</Tip75>
      <ShareUrl className="mTop13" showPreview={false} url={newRecordUrl} />
      {isCharge && (
        <React.Fragment>
          <Hr style={{ margin: '25px 0 22px' }} />
          <Midddle className="Font15">{_l('对外公开分享')}</Midddle>
          <Midddle className="mLeft10">
            <Switch
              className="publishSwitch"
              checked={visibleType === VISIBLE_TYPE.PUBLIC}
              onClick={async () => {
                const newVisibleType = visibleType === VISIBLE_TYPE.PUBLIC ? VISIBLE_TYPE.CLOSE : VISIBLE_TYPE.PUBLIC;
                try {
                  await updatePublicWorksheetState({ worksheetId, newVisibleType });
                  setVisibleType(newVisibleType);
                } catch (err) {
                  alert(_l('更新公开表单状态失败'), 2);
                }
              }}
            />
          </Midddle>
          <Tip75 className="mTop13">
            {_l('将表单公开发布给应用外的用户填写，为你的工作表收集数据（仅应用管理员可见）')}
          </Tip75>
          {visibleType === VISIBLE_TYPE.PUBLIC && (
            <React.Fragment>
              <ShareUrl
                className="mTop13"
                showPreview={false}
                customBtns={[
                  {
                    tip: _l('直接打开'),
                    iconStyle: { fontSize: 15 },
                    icon: 'task-new-detail',
                    onClick: () => window.open(publicShareUrl),
                  },
                ]}
                url={publicShareUrl}
              />
              <a href={`/worksheet/form/edit/${worksheetId}?#detail`} target="_blank" className="mTop13 InlineBlock">
                {_l('编辑公开表单')}
              </a>
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </Modal>
  );
}

ShareNewRecord.propTypes = {
  appId: PropTypes.string,
  viewId: PropTypes.string,
  worksheetId: PropTypes.string,
  isCharge: PropTypes.bool,
  publicShareUrl: PropTypes.string,
  visibleType: PropTypes.number,
  onClose: PropTypes.func,
};
