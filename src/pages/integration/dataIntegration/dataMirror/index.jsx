import React, { useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, Support } from 'ming-ui';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import CreateDialog from './components/CreateDialog.jsx';
import MirrorList from './components/MirrorList.jsx';

const Wrap = styled.div`
  background: #fff;
  padding: 32px 32px 0;

  .filterContent {
    margin-top: 24px;

    .taskListText {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .searchInput {
      width: 360px;
      min-width: 360px;
      height: 36px;
    }
    .filterIcon {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      margin-left: 24px;
      color: #9e9e9e;
      cursor: pointer;

      &:hover {
        color: #2196f3;
        background: #f5f5f5;
      }
      &.isActive {
        color: #2196f3;
        background: rgba(33, 150, 243, 0.07);
      }
    }
  }
  .addTaskButton {
    padding: 0 24px;
    line-height: 36px;
    height: 36px;
    background: #2196f3;
    border-radius: 18px;
    color: #fff;
    display: inline-block;
    cursor: pointer;

    &:hover {
      background: #1764c0;
    }
  }
`;

export default function DataMirror(props) {
  const [{ show, version }, setState] = useSetState({
    show: false,
    version: JSON.stringify(Math.random()),
  });
  const featureType = getFeatureStatus(props.currentProjectId, VersionProductType.dataMirror);
  return (
    <Wrap className="flexColumn h100">
      {featureType === '2' ? (
        <React.Fragment>
          <div className="h100">
            {buriedUpgradeVersionDialog(props.currentProjectId, VersionProductType.dataMirror, {
              dialogType: 'content',
            })}
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="flexRow">
            <div className="flex">
              <h3 className="Bold Font24 mBottom0">{_l('工作表数据镜像')}</h3>
              <p className="Font15 mBottom0 flexRow alignItemsCenter mTop10">
                {_l('在外部数据库中创建工作表数据的镜像，并保持同步')}
                <Support type={3} href="https://help.mingdao.com/integration/data-integration" text={_l('使用帮助')} />
              </p>
            </div>
            <div className="addTaskButton" onClick={() => setState({ show: true })}>
              <Icon icon="add" className="Font13" />
              <span className="mLeft5 bold">{_l('镜像')}</span>
            </div>
          </div>
          <MirrorList className="flex mTop24" flag={version} projectId={props.currentProjectId} />
          {show && (
            <CreateDialog
              visible={show}
              projectId={props.currentProjectId}
              onHide={() => setState({ show: false })}
              onOk={() => {
                setState({ show: false, version: JSON.stringify(Math.random()) });
              }}
            />
          )}
        </React.Fragment>
      )}
    </Wrap>
  );
}
