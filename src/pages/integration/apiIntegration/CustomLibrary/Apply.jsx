import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Dialog, Icon, LoadDiv } from 'ming-ui';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import dialogSelectApp from 'src/components/dialogSelectApp';

const ApplyBtn = styled.div`
  padding: 0 32px;
  height: 36px;
  border-radius: 18px;
  background: #2196f3;
  color: #fff;
  cursor: pointer;
  &:hover {
    background: #1764c0;
  }
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid rgb(239, 239, 239);
  text-align: center;
  i {
    line-height: 56px;
  }
`;

const Item = styled.div`
  padding: 13px 0;
  border-bottom: 1px solid #e0e0e0;
  &:not(.noBG):hover {
    background: #f5f5f5;
  }
`;

export default function Apply(props) {
  const { companyId, apiDetail = {}, onClose = () => {}, onApplySuccess } = props;
  const [loading, setLoading] = useState(true);
  const [apiList, setApiList] = useState([]);

  useEffect(() => {
    packageVersionAjax
      .getApiList({ companyId, pageIndex: 1, pageSize: 100000, relationId: apiDetail.id }, { isIntegration: true })
      .then(res => {
        if (res) {
          setApiList(res);
          setLoading(false);
        }
      });
  }, []);

  const onApply = selectedApps => {
    packageVersionAjax
      .authorizeApkIds(
        {
          companyId,
          id: apiDetail.id,
          type: 1,
          apkIds: selectedApps.map(app => app.appId),
        },
        {
          isIntegration: true,
        },
      )
      .then(res => {
        if (res) {
          alert(_l('申请成功'));
          onApplySuccess();
          onClose();
        }
      });
  };

  return (
    <Dialog className="dialogAddFriendsBox" width={680} visible title={null} footer={null} onCancel={onClose}>
      <div className="flexRow alignItemsCenter">
        {apiDetail.iconName ? (
          <img src={apiDetail.iconName} alt="" width="60" height="60" />
        ) : (
          <IconWrapper>
            <Icon icon="connect" className="Font32 Gray_9e" />
          </IconWrapper>
        )}

        <div className="flex flexColumn mLeft12 mRight60 minWidth0">
          <div className="Font20 bold ellipsis">{apiDetail.name}</div>
          <div className="Gray_75 ellipsis">{apiDetail.explain}</div>
        </div>

        <ApplyBtn
          className="flexRow alignItemsCenter"
          onClick={() =>
            dialogSelectApp({ title: _l('选择授权应用'), projectId: companyId, isGetManagerApps: true, onOk: onApply })
          }
        >
          {_l('申请使用')}
        </ApplyBtn>
      </div>
      <div className="Font14 bold mTop40">{_l('API 列表（%0）', apiList.length)}</div>
      <Item className="flexRow alignItemsCenter Gray_75 noBG">
        <div className="Width110 ellipsis">{_l('API 名称')}</div>
        <div className="flex mLeft10">{_l('描述')}</div>
      </Item>

      {loading ? (
        <LoadDiv className="mTop10" />
      ) : (
        apiList.map(item => {
          return (
            <Item className="flexRow alignItemsCenter">
              <div className="Width110 ellipsis" title={item.name}>
                {item.name}
              </div>
              <div className="flex mLeft10 ellipsis" title={item.explain}>
                {item.explain}
              </div>
            </Item>
          );
        })
      )}

      <div className="mTop50 Gray_75">
        {_l(
          'API 由企业组织应用管理员开放提供，申请使用后需选择授权使用的应用，管理员审核通过后被授权的应用将可以使用 API',
        )}
      </div>
    </Dialog>
  );
}
