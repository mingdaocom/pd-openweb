import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { LoadDiv, Support } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import ExplainImg from '../../img/userExtendInfo.png';
import EditUserExtendInfo from './EditUserExtendInfo.jsx';
import img1 from './img/img1.png';
import img2 from './img/img2.png';
import UserExtendInfo from './UserExtendInfo.jsx';

const Con = styled.div`
  margin: 0 auto;
  height: 100%;
  position: relative;
  .userExtendInfo-desc .help {
    vertical-align: unset !important;
  }
`;

const Des = styled.div`
  min-width: 640px;
  width: 45%;
  .imgDes {
    max-width: 640px;
    margin: 30px auto;
  }
  padding: 30px 40px;
  background: #f7f7f7;
  min-height: 100%;
  overflow: auto;
  .title {
    font-weight: 600;
  }
  .con {
    font-weight: 400;
  }
  .desCard {
    width: 140px;
    height: 56px;
    text-align: center;
    line-height: 56px;
    border-radius: 6px 6px 6px 6px;
    border: 1px solid #dddddd;
    background: #fff;
    &.c {
      background: #1677ff;
      border: 0;
      color: #fff;
    }
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
    background: #1677ff;
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
      .catch(() => setLoading(false));
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
      .catch(() => setLoading(false));
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
          {_l('如在销售管理应用中')}： <br />- {_l('可以通过建立成员表来管理销售人员的团队、地区、关联订单等扩展信息')}
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
          <Support type={3} href="https://help.mingdao.com/role/extended-info" text={_l('帮助')} />
        </div>
      </ExplainCon>
    );
  };

  const renderDes = () => {
    return (
      <Des className="">
        <div className="title Gray_75">{_l('什么是用户扩展信息表？')}</div>
        <div className="con mTop12 Gray_75">
          {_l(
            '用户扩展信息表非常类似于组织中的用户管理表。在组织中，可以全局管理成员基础信息，如：部门、职位、组织角色等。其中部门、组织角色可用于数据权限范围，在工作表添加部门字段，可以使用户对自己所在部门的记录都拥有权限。同样在具体应用中，往往也需要额外管理用户在本应用中的扩展信息。如：销售管理应用中，需要管理销售人员所在的团队、区域、职能等，同时也希望这些信息可以类似部门一样用于数据权限范围。此时就可以建立一张销售人员表。',
          )}
        </div>
        <div className="title mTop24 Gray_75">{_l('什么是权限标签？')}</div>
        <div className="con mTop12 Gray_75">
          {_l(
            '权限标签指用于控制数据权限范围的扩展信息字段（仅支持关联类型字段）。当用户访问应用时，系统可以从扩展信息表中读取当前用户的权限标签，从而使用户对其他工作表中关联了相同标签的记录拥有权限。',
          )}
        </div>
        <div className="title mTop24 Gray_75">{_l('权限标签如何用于数据权限范围？')}</div>
        <div className="con mTop12 Gray_75">
          {_l('权限标签用于数据权限范围时和部门字段类似，只是没有专门的系统字段，需要通过关联记录字段来灵活实现。')}
        </div>
        <div className="con mTop10 Gray_75">
          {_l(
            '如：还是在销售管理应用中，用户扩展信息表中已设置了团队作为用户权限标签（关联团队表），并且订单表也关联了所属团队时。那么当用户访问应用时，系统就可以根据读取到的用户所在团队，并从订单表中过滤出关联了相同团队的订单，从而实现用户对属于自己团队的订单拥有查看、编辑或删除权限（可以在角色权限中进行设置）。',
          )}
        </div>
        <div className="con mTop10 Gray_75">
          {_l('此过程如下图所示：了解更多前往')}
          <Support type={3} href={'https://help.mingdao.com/role/extended-info'} text={_l('帮助中心')} />
        </div>
        <div className="imgDes flexRow alignItemsCenter">
          <div className="left">
            <div className="desCard">{_l('销售人员')}</div>
          </div>
          <div className="center flex flexRow alignItemsCenter justifyContentCenter">
            <div className="flex"></div>
            <img src={img1} width={56} />
            <div className="flex"></div>
            <div className="desCard c">{_l('团队')}</div>
            <div className="flex"></div>
            <img src={img2} width={56} />
            <div className="flex"></div>
          </div>
          <div className="right flexColumn">
            <div className="desCard">{_l('订单')}</div>
            <div className="desCard mTop10">{_l('订单')}</div>
            <div className="desCard mTop10">{_l('订单')}</div>
          </div>
        </div>
      </Des>
    );
  };

  const renderCon = () => {
    if (FEATURE_STATUS === '2') {
      return buriedUpgradeVersionDialog(currentProjectId, VersionProductType.userExtensionInformation, {
        dialogType: 'content',
      });
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

  return (
    <Con className="flexRow">
      <div className="flex">{renderCon()}</div>
      {step !== 0 && renderDes()}
    </Con>
  );
}

export default OthersCon;
