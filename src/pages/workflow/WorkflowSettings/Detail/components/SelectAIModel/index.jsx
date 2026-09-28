import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Modal, Select } from 'ming-ui/antd-components';
import aIService from 'src/api/aIService';
import { useSelectAIModelDialog } from '../../../../components/selectAIModelDialog';
import SpecificFieldsValue from '../SpecificFieldsValue';

export default ({
  appId,
  projectId,
  data,
  emptyModelText = _l('选择模型'),
  showImageRecognition = false,
  showModelSettings = false,
  updateSource = () => {},
}) => {
  const [modelDetail, setModelDetail] = useState({});
  const [modelParameterDialog, setModelParameterDialog] = useState(false);
  const [modelParameter, setModelParameter] = useState({});
  const { open: openSelectAIModelDialog, holder: selectAIModelDialogHolder } = useSelectAIModelDialog();

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
        <div className={cx('Font13 ellipsis flex', info.type === -1 ? 'textTertiary' : 'mLeft10')}>{info.name}</div>
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

  const list = data.appList.map(o => ({
    label: renderTitle(o),
    value: o.id,
    searchText: o.name,
  }));

  useEffect(() => {
    let cancelled = false;

    if (data.platformConfigModel) {
      if (data.model) {
        aIService.getModelDetail({ name: data.model }).then(res => {
          if (cancelled) return;

          if (res) {
            setModelDetail({
              status: true,
              name: res.alias,
              type: res.developerType,
              icon: res.developerIcon,
              caps: res.caps,
            });
          } else {
            setModelDetail({ status: false });
          }
        });
      } else {
        setModelDetail({
          status: true,
          name: emptyModelText,
          type: -1,
        });
      }
    } else {
      setModelDetail({});
    }

    return () => {
      cancelled = true;
    };
  }, [data.model, data.platformConfigModel, emptyModelText]);

  return (
    <Fragment>
      {selectAIModelDialogHolder}
      <div className="flexRow mTop10">
        {data.platformConfigModel ? (
          <div
            className={cx('flowSelectModel flex flexRow alignItemsCenter', { clearBorderRadius: showModelSettings })}
            onClick={() =>
              openSelectAIModelDialog({
                appId,
                projectId,
                onOk: settings => updateSource({ model: settings?.name || '' }),
              })
            }
          >
            {_.isEmpty(modelDetail) ? null : modelDetail.status ? (
              renderModelInfo(modelDetail)
            ) : (
              <span style={{ color: 'var(--color-error)' }}>{_l('原模型已下架，将使用系统替代模型')}</span>
            )}
          </div>
        ) : (
          <Select
            className={cx('flowDropdown flex flowDropdownModel', { clearBorderRadius: showModelSettings })}
            options={list}
            value={data.model}
            notFoundContent={_l('暂无可用模型')}
            showSearch
            optionFilterProp="searchText"
            labelRender={() =>
              !data.model ? (
                <span className="Font13 textTertiary">{emptyModelText}</span>
              ) : (
                list.find(o => o.value === data.model)?.label || (
                  <span style={{ color: 'var(--color-error)' }}>{_l('模型已删除')}</span>
                )
              )
            }
            onChange={model => {
              updateSource({ model });
            }}
          />
        )}

        {showModelSettings && (
          <div
            className="actionControlMore colorPrimary"
            onClick={() => {
              setModelParameterDialog(true);
              setModelParameter({ temperature: data.temperature, maxTokens: data.maxTokens || '' });
            }}
          >
            <i className="icon-tune" />
          </div>
        )}

        {modelParameterDialog && (
          <Modal
            className="workflowDialogBox"
            open
            width={660}
            title={_l('模型参数')}
            onOk={() => {
              updateSource({ ...modelParameter });
              setModelParameterDialog(false);
            }}
            onCancel={() => setModelParameterDialog(false)}
          >
            <div className="Font13 bold">{_l('温度')}</div>
            <div className="Font12 textSecondary mTop5 mBottom10">
              {_l('控制内容创造力，可填范围0.0～2.0，值越高越有创意')}
            </div>
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
            <div className="Font12 textSecondary mTop5 mBottom10">{_l('限制回复长度，避免内容过长')}</div>
            <SpecificFieldsValue
              type="number"
              allowedEmpty
              hasOtherField={false}
              data={{ fieldValue: modelParameter.maxTokens }}
              updateSource={({ fieldValue }) => setModelParameter({ ...modelParameter, maxTokens: fieldValue })}
            />
          </Modal>
        )}
      </div>

      {showImageRecognition && data.model && modelDetail.caps && !_.includes(modelDetail.caps, 1) && (
        <Checkbox
          className="mTop5"
          checked={!!data.enableImageRecognition}
          onChange={event => updateSource({ enableImageRecognition: event.target.checked })}
        >
          {_l('当前模型不支持图片输入，启用图片识别')}
        </Checkbox>
      )}
    </Fragment>
  );
};
