import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import { Dialog, Switch } from 'ming-ui';
import projectSettingAjax from 'src/api/projectSetting';
import monitorAjax from 'src/pages/integration/api/monitor';
import PurchaseExpandPack from 'src/pages/Admin/components/PurchaseExpandPack';

let ajaxPromise = {};

export default ({ projectId }) => {
  const [autoOrder, setAutoOrder] = useState(false);
  const [balance, setBalance] = useState(0);
  const licenseType = md.global.Account.projects.find(o => o.projectId === projectId).licenseType;
  const [{ total, used, percent }, setArithmetic] = useState({
    total: 0,
    used: 0,
    percent: '100.00%',
  });
  const [arithmeticLoading, setArithmeticLoading] = useState(true);
  const [taskNum, setTaskNum] = useState({ currentTaskNum: 0, maxTaskNum: 0, etlTaskNum: 0, maxEtlTaskNum: 0 });

  const getAutoPurchaseDataPipelineExtPack = () => {
    ajaxPromise.getAutoPurchaseDataPipelineExtPack = projectSettingAjax.getAutoPurchaseDataPipelineExtPack({
      projectId,
    });
    ajaxPromise.getAutoPurchaseDataPipelineExtPack.then(res => {
      const { autoPurchaseDataPipelineExtPack = false, balance } = res;
      setAutoOrder(autoPurchaseDataPipelineExtPack);
      setBalance(balance);
    });
  };

  const getArithmetic = () => {
    ajaxPromise.getArithmetic = monitorAjax.getArithmetic({ projectId });
    ajaxPromise.getArithmetic.then(res => {
      if (res) {
        const { arithmetic = {} } = res;
        setArithmetic(arithmetic);
        setArithmeticLoading(false);
      }
    });
  };

  const setAutoPurchaseDataPipelineExtPack = checked => {
    ajaxPromise.setAutoPurchaseDataPipelineExtPack = projectSettingAjax.setAutoPurchaseDataPipelineExtPack({
      projectId: projectId,
      autoPurchaseDataPipelineExtPack: checked,
    });
    ajaxPromise.setAutoPurchaseDataPipelineExtPack.then(res => {
      if (res) {
        setAutoOrder(checked);
        if (checked && balance < 100) {
          alert(_l('当前账户余额不足100元，该功能可能无法正常运行'), 3);
        }
      }
    });
  };

  const handleAutoOrder = checked => {
    if (!checked) {
      Dialog.confirm({
        title: _l('是否开启自动订购？'),
        description: _l('开启后，当月剩余执行额度为2%时，自动购买 100元/10万行 的单月包，从账户余额中扣款。'),
        onOk: () => setAutoPurchaseDataPipelineExtPack(!checked),
      });
      return;
    }
    setAutoPurchaseDataPipelineExtPack(!checked);
  };

  useEffect(() => {
    Object.keys(ajaxPromise).forEach(key => {
      if (ajaxPromise[key]) {
        ajaxPromise[key].abort();
      }
    });

    getAutoPurchaseDataPipelineExtPack();
    getArithmetic();
    md.global.Config.IsLocal && monitorAjax.getTaskCount({ projectId }).then(res => res && setTaskNum(res));
  }, []);

  return (
    <div className="flexRow alignItemsCenter">
      {arithmeticLoading ? (
        _l('加载中...')
      ) : (
        <div>
          <span>
            {md.global.Config.IsLocal && (
              <Fragment>
                <span className="Gray_9e mRight3">{_l('直接同步任务数')}</span>
                <span className="Bold">
                  {taskNum.currentTaskNum} / {taskNum.maxTaskNum} ，
                </span>
                <span className="Gray_9e mRight3">{_l('ETL处理任务数')}</span>
                <span className="Bold">
                  {taskNum.etlTaskNum} / {taskNum.maxEtlTaskNum}
                  {md.global.Config.IsPlatformLocal && <span>，</span>}
                </span>
              </Fragment>
            )}
            {(!md.global.Config.IsLocal || md.global.Config.IsPlatformLocal) && (
              <Fragment>
                <span className="Gray_9e mRight3">{_l('本月算力')}</span>
                <span className="Bold">{_l('%0 万行 / %1 万行', used, total)}</span>
                <span className="Gray_9e mLeft3 mRight3">{_l('剩余')}</span>
                <span className="Bold">{percent}</span>
              </Fragment>
            )}
          </span>
          {!md.global.Config.IsLocal && (
            <PurchaseExpandPack
              className="mLeft10 ThemeHoverColor2"
              text={_l('购买升级包')}
              type="dataSync"
              projectId={projectId}
            />
          )}
        </div>
      )}
      {!md.global.Config.IsLocal && !_.includes([0, 2], licenseType) && (
        <div>
          <Switch className="TxtMiddle mLeft24" checked={autoOrder} size="small" onClick={handleAutoOrder} />
          <span> {_l('自动订购')}</span>
        </div>
      )}
    </div>
  );
};
