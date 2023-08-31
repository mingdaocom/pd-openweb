import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ExplainImg from '../../img/userExtendInfo.png';
import { Support, LoadDiv } from 'ming-ui';
import { getRequest, getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import EditUserExtendInfo from './EditUserExtendInfo.jsx';
import UserExtendInfo from './UserExtendInfo.jsx';
import worksheetAjax from 'src/api/worksheet';

const Con = styled.div`
  margin: 0 41px;
  height: 100%;
  position: relative;
  .userExtendInfo-desc .help {
    vertical-align: unset !important;
  }
`;

const ExplainCon = styled.div`
  text-align: center;
  position: absolute;
  width: 100%;
  transform: translateY(-50%);
  top: 50%;
  .explain-img-con {
    text-align: center;
  }
  .explain-img-con img {
    height: 115px;
    width: auto;
  }
  .explain-desc {
    width: 445px;
    color: #757575;
    margin: 23px auto;
    text-align: left;
  }
  .explain-button {
    padding: 15px 22px;
    background: #2196f3;
    border: none;
    color: #ffffff;
    font-size: 14px;
    border-radius: 3px;
    font-weight: 600;
  }
  .explain-button:hover {
    background: #1565c0;
  }
`;

function OthersCon(props) {
  const { appId, projectId } = props;
  // 0: 说明 1: 创建 2: 编辑 3: 结果回现
  const [step, setStep] = useState(0);
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const currentProjectId =
    projectId || localStorage.getItem('currentProjectId') || md.global.Account.projects[0].projectId;
  const FEATURE_STATUS = getFeatureStatus(currentProjectId, VersionProductType.userExtensionInformation);

  useEffect(() => {
    if (FEATURE_STATUS === '2') return;

    worksheetAjax
      .getAppExtendAttr({ appId: appId })
      .then(res => {
        setLoading(false);
        if (res.appExtendAttr && res.appExtendAttr.status === 1) {
          setData(res);
          setStep(3);
        }
      })
      .fail(err => setLoading(false));
  }, []);

  const changeStep = num => {
    setStep(num);
  };

  const changeData = () => {
    worksheetAjax
      .getAppExtendAttr({ appId: appId })
      .then(res => {
        setLoading(false);
        if (Object.keys(res).length !== 0) {
          setData(res);
        }
      })
      .fail(err => setLoading(false));
  };

  const renderExplain = () => {
    return (
      <ExplainCon>
        <div className="explain-img-con">
          <img src={ExplainImg} />
        </div>
        <div className="explain-title mTop50 center">
          <h5 className="mBottom0 Font16 Normal LineHeight30">{_l('通过工作表管理应用成员额外的扩展信息字段')}</h5>
          <h5 className="mBottom0 Font16 Normal LineHeight30">
            {_l('在角色权限、筛选器中可以使用用户的扩展信息字段来作为动态筛选条件')}
          </h5>
        </div>
        <div className="explain-desc">
          {_l('如在销售管理应用中')}： <br />- {_l('可以通过建立成员表来管理销售人员的团队、地区、关联订单等扩展信息')}{' '}
          <br />- {_l('可以根据订单所关联的团队，来筛选出当前销售人员所在团队的订单')}
        </div>
        <div className="mTop30 center">
          <button
            className="explain-button"
            type="button"
            onClick={() => {
              setStep(1);
            }}
          >
            {_l('建立用户扩展信息表')}
          </button>
        </div>
        <div className="center mTop30">
          <Support type={3} href="https://help.mingdao.com/user4" text={_l('帮助')} />
        </div>
      </ExplainCon>
    );
  };

  const renderCon = () => {
    if (FEATURE_STATUS === '2') {
      return buriedUpgradeVersionDialog(currentProjectId, VersionProductType.userExtensionInformation, 'content');
    }

    if (loading) return <LoadDiv />;

    const params = {
      appId: appId,
      result: data,
      appProjectId: projectId,
    };

    switch (step) {
      case 0:
        return renderExplain();
      case 1:
      case 2:
        return (
          <EditUserExtendInfo
            {...params}
            value={
              data && data.appExtendAttr.status === 1
                ? {
                    worksheetId: data.appExtendAttr.worksheetId,
                    controlId: data.appExtendAttr.userControlId,
                    appId: data.appIdOfWorksheet,
                  }
                : {}
            }
            step={step}
            onChangeStep={changeStep}
            onChangeData={changeData}
          />
        );
      case 3:
        if (!data) return null;
        return <UserExtendInfo {...params} data={data} onChangeStep={changeStep} />;
    }
  };

  return <Con>{renderCon()}</Con>;
}

export default OthersCon;
