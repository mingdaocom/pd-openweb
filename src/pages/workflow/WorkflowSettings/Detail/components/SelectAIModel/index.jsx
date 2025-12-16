import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, Dropdown } from 'ming-ui';
import aIService from 'src/api/aIService';
import selectAIModelDialog from '../../../../components/selectAIModelDialog';
import SpecificFieldsValue from '../SpecificFieldsValue';

export default ({
  data,
  showAutoModel = false,
  showModelSettings = false,
  updateSource = () => {},
  updatePerformance = () => {},
}) => {
  const [modelDetail, setModelDetail] = useState({});
  const [modelParameterDialog, setModelParameterDialog] = useState(false);
  const [modelParameter, setModelParameter] = useState({});
  const renderModelInfo = info => {
    const ICONS = {
      0: { icon: 'icon-AI_Agent', color: '#2196f3' },
      1: { icon: 'icon-chatgpt', color: '#000' },
      2: { icon: 'icon-Qwen', color: '#615ced' },
      3: { icon: 'icon-deepseek', color: '#4d6bfe' },
      100: { icon: 'icon-construction', color: '#2196f3' },
    };

    return (
      <div className="flexRow alignItemsCenter">
        {info.type === 100 && info.icon ? (
          <img className="circle" src={info.icon} width={20} height={20} />
        ) : info.type === -1 ? null : (
          <i className={cx('Font20', ICONS[info.type].icon)} style={{ color: ICONS[info.type].color }} />
        )}
        <div className={cx('Font13 ellipsis flex', info.type === -1 ? 'Gray_9e' : 'mLeft10')}>{info.name}</div>
      </div>
    );
  };
  const renderTitle = item => {
    return (
      <div className="flexRow alignCenter alignItemsCenter">
        <i
          className={cx(
            'Font16',
            { 'icon-AI_Agent': !item.id },
            { 'icon-deepseek': _.includes(item.id?.toLocaleLowerCase(), 'deepseek') },
            { 'icon-chatgpt': _.includes(item.id, 'GPT') || _.includes(['O3', 'O4-mini'], item.id) },
            { 'icon-Qwen': _.includes(item.id, 'QWen') },
          )}
        />
        <span className="Font13 mLeft10">
          {_.includes(['O3', 'O4-mini'], item.id) ? _.lowerFirst(item.name) : item.name}
        </span>
      </div>
    );
  };
  const list = (showAutoModel ? [{ text: renderTitle({ name: _l('自动选择模型') }), value: '' }] : []).concat(
    data.appList.map(o => ({
      text: renderTitle(o),
      value: o.id,
    })),
  );

  useEffect(() => {
    if (data.platformConfigModel) {
      if (data.model) {
        aIService.getModelDetail({ name: data.model }).then(res => {
          if (res) {
            setModelDetail({ status: true, name: res.alias, type: res.developerType, icon: res.developerIcon });
            updatePerformance(res.caps);
          } else {
            setModelDetail({ status: false });
          }
        });
      } else {
        setModelDetail({
          status: true,
          name: showAutoModel ? _l('自动选择模型') : _l('选择模型'),
          type: showAutoModel ? 0 : -1,
        });
      }
    }
  }, [data.model]);

  return (
    <div className="flexRow mTop10">
      {data.platformConfigModel ? (
        <div
          className={cx('flowSelectModel flex flexRow alignItemsCenter', { clearBorderRadius: showModelSettings })}
          onClick={() =>
            selectAIModelDialog({ showAutoModel, onOk: settings => updateSource({ model: settings?.name || '' }) })
          }
        >
          {_.isEmpty(modelDetail) ? null : modelDetail.status ? (
            renderModelInfo(modelDetail)
          ) : (
            <span style={{ color: '#f44336' }}>{_l('模型未开启或已删除')}</span>
          )}
        </div>
      ) : (
        <Dropdown
          className={cx('flowDropdown flex flowDropdownModel', { clearBorderRadius: showModelSettings })}
          data={list}
          value={data.model}
          noData={_l('暂无可用模型')}
          border
          openSearch
          renderTitle={() =>
            list.find(o => o.value === data.model)?.text || <span style={{ color: '#f44336' }}>{_l('模型已删除')}</span>
          }
          onChange={model => {
            updateSource({ model });
          }}
        />
      )}

      {showModelSettings && (
        <div
          className="actionControlMore ThemeColor3"
          onClick={() => {
            setModelParameterDialog(true);
            setModelParameter({ temperature: data.temperature, maxTokens: data.maxTokens || '' });
          }}
        >
          <i className="icon-tune" />
        </div>
      )}

      {modelParameterDialog && (
        <Dialog
          className="workflowDialogBox"
          visible
          width={660}
          title={_l('模型参数')}
          onOk={() => {
            updateSource({ ...modelParameter });
            setModelDetail({});
            setModelParameterDialog(false);
          }}
          onCancel={() => setModelParameterDialog(false)}
        >
          <div className="Font13 bold">{_l('温度')}</div>
          <div className="Font12 Gray_75 mTop5 mBottom10">{_l('控制内容创造力，可填范围0.0～2.0，值越高越有创意')}</div>
          <SpecificFieldsValue
            type="number"
            min={0}
            max={2}
            allowedEmpty
            hasOtherField={false}
            isDecimal
            data={{ fieldValue: modelParameter.temperature }}
            updateSource={({ fieldValue }) => setModelParameter({ ...modelParameter, temperature: fieldValue })}
          />

          <div className="Font13 bold mTop20">{_l('最大Token数')}</div>
          <div className="Font12 Gray_75 mTop5 mBottom10">{_l('限制回复长度，避免内容过长')}</div>
          <SpecificFieldsValue
            type="number"
            allowedEmpty
            hasOtherField={false}
            data={{ fieldValue: modelParameter.maxTokens }}
            updateSource={({ fieldValue }) => setModelParameter({ ...modelParameter, maxTokens: fieldValue })}
          />
        </Dialog>
      )}
    </div>
  );
};
