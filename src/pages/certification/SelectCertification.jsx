import React, { useState } from 'react';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import _ from 'lodash';
import cx from 'classnames';
import certificationApi from '../../api/certification';

const SelectDialog = styled(Dialog)`
  .certItem {
    padding: 16px;
    border-radius: 7px;
    background: #fafafa;
    border: 1px solid #fafafa;
    cursor: pointer;
    margin-top: 10px;
    font-weight: 600;
    .tagText {
      color: #4caf50;
      font-size: 12px;
    }
    .name {
      font-size: 17px;
      margin-top: 8px;
    }
    &:hover {
      background: #f5f5f5;
      border-color: #f5f5f5;
    }
    &.isActive {
      background: rgba(33, 150, 243, 0.05);
      border-color: #2196f3;
    }
  }
  .divider {
    width: 100%;
    height: 1px;
    background: #f5f5f5;
    margin: 16px 0 6px;
  }

  .addCertBtn {
    position: absolute;
    left: 36px;
    bottom: 30px;
  }
`;

function SelectCertification(props) {
  const { onClose, certList = [], projectId, onUpdateCertStatus = () => {} } = props;
  const [current, setCurrent] = useState({});

  const onOk = () => {
    const params =
      current.authType === 1
        ? { certSource: 1, projectId }
        : { certSource: 1, mapProjectId: current.entityId, entityId: projectId };
    (current.authType === 1 ? certificationApi.personalCertification : certificationApi.enterpriseCertification)(
      params,
    ).then(data => {
      if (data === 1) {
        alert(_l('认证添加成功'));
        onUpdateCertStatus(current.authType);
        onClose();
      } else {
        alert(_l('认证添加失败'), 2);
      }
    });
  };

  return (
    <SelectDialog
      visible
      width={640}
      title={_l('发现您有相关认证信息，可直接选择使用')}
      okDisabled={!current.entityId}
      onOk={onOk}
      onCancel={onClose}
    >
      {certList.map((item, index) => (
        <React.Fragment>
          <div
            className={cx('certItem', { isActive: current.entityId === item.entityId })}
            onClick={() => setCurrent(item)}
          >
            <div className="tagText">{item.authType === 1 ? _l('个人认证') : _l('企业认证')}</div>
            <div className="name">{item.name}</div>
          </div>
          {!!certList.filter(item => item.authType === 2).length &&
            _.findLastIndex(certList, c => c.authType === 1) === index && <div className="divider" />}
        </React.Fragment>
      ))}

      <div
        className="addCertBtn Font15 bold ThemeColor Hover_49 pointer"
        onClick={() =>
          window.open(`/certification/project/${projectId}?returnUrl=${encodeURIComponent(location.href)}`)
        }
      >
        {_l('添加全新认证')}
      </div>
    </SelectDialog>
  );
}

export default props => FunctionWrap(SelectCertification, { ...props });
