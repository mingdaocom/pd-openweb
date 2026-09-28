import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import certificationApi from 'src/api/certification';
import { pathCompletion } from 'src/utils/platform/navigation/path';

const SelectModal = styled(Modal)`
  .certItem {
    padding: 16px;
    border-radius: 7px;
    background: var(--color-background-secondary);
    border: 1px solid var(--color-background-secondary);
    cursor: pointer;
    margin-top: 10px;
    font-weight: 600;
    .tagText {
      color: var(--color-success);
      font-size: 12px;
    }
    .name {
      font-size: 17px;
      margin-top: 8px;
    }
    &:hover {
      background: var(--color-background-secondary);
      border-color: var(--color-background-secondary);
    }
    &.isActive {
      background: rgba(33, 150, 243, 0.05);
      border-color: var(--color-primary);
    }
  }
  .divider {
    width: 100%;
    height: 1px;
    background: var(--color-background-secondary);
    margin: 16px 0 6px;
  }
`;

function SelectCertification(props) {
  const { onClose, certList = [], projectId, onUpdateCertStatus = () => {}, isUpgrade } = props;
  const [current, setCurrent] = useState({});

  const onOk = () => {
    const params =
      current.authType === 1
        ? { certSource: 1, projectId }
        : { certSource: 1, mapProjectId: current.entityId, entityId: projectId, isUpgrade };
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
    <SelectModal
      open
      mask={{ closable: true }}
      keyboard
      width={640}
      title={_l('发现您有相关认证信息，可直接选择使用')}
      okDisabled={!current.entityId}
      onOk={onOk}
      onCancel={onClose}
      footerLeftElement={
        <div
          className="Font15 bold colorPrimary hoverColorPrimaryLight pointer"
          onClick={() =>
            window.open(
              pathCompletion(`/certification/project/${projectId}?returnUrl=${encodeURIComponent(location.href)}`),
            )
          }
        >
          {_l('添加全新认证')}
        </div>
      }
    >
      {certList.map((item, index) => (
        <React.Fragment>
          <div
            className={cx('certItem', {
              isActive: current.entityId === item.entityId && current.authType === item.authType,
            })}
            onClick={() => setCurrent(item)}
          >
            <div className="tagText">{item.authType === 1 ? _l('个人认证') : _l('企业认证')}</div>
            <div className="name">{item.name}</div>
          </div>
          {!!certList.filter(item => item.authType === 2).length &&
            _.findLastIndex(certList, c => c.authType === 1) === index && <div className="divider" />}
        </React.Fragment>
      ))}
    </SelectModal>
  );
}

export function useSelectCertification() {
  return useFunctionWrapComponent(SelectCertification);
}
