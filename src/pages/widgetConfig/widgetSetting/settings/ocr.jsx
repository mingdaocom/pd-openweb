import React, { Fragment, useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import _ from 'lodash';
import { RadioGroup } from 'ming-ui';
import WidgetDropdown from '../../components/Dropdown';
import { TEMPLATE_TYPE } from '../../config/ocr';
import { ALL_SYS } from '../../config/widget';
import { Button, SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import ApiSearchConfig from '../components/ApiSearchConfig';
import OcrMap from '../components/OcrMap';

const API_DISPLAY = [
  {
    text: _l('系统预设'),
    value: '0',
  },
  {
    text: _l('集成中心'),
    value: '1',
  },
];

const MAP_DISPLAY = [
  {
    text: _l('映射到当前记录'),
    value: '0',
  },
  {
    text: _l('映射到子表明细'),
    value: '2',
  },
];

function OcrMapType({ data, allControls = [], onChange }) {
  const { ocrmaptype = '0', ocrcid = '' } = getAdvanceSetting(data);
  const FILED_LIST = allControls.filter(i => i.type === 34).map(i => ({ text: i.controlName, value: i.controlId }));
  return (
    <Fragment>
      <SettingItem className="withSplitLine">
        <div className="settingItemTitle">{_l('将当前模版映射到')}</div>
        <WidgetDropdown
          value={ocrmaptype}
          data={MAP_DISPLAY}
          onChange={value => {
            if (ocrmaptype === value) return;
            onChange(handleAdvancedSettingChange(data, { ocrmaptype: value, ocrcid: '', ocrmap: '' }));
          }}
        />
        <div className="mTop10 Gray_9e">
          {ocrmaptype === '2'
            ? _l('选择映射子表明细，可进行多个附件批量映射识别')
            : _l('选择映射当前记录，仅能进行单次映射识别')}
        </div>
      </SettingItem>
      {ocrmaptype === '2' && (
        <SettingItem>
          <div className="settingItemTitle">{_l('选择子表')}</div>
          <WidgetDropdown
            value={ocrcid}
            data={FILED_LIST}
            onChange={value => {
              onChange(handleAdvancedSettingChange(data, { ocrcid: value }));
            }}
          />
        </SettingItem>
      )}
    </Fragment>
  );
}

export default function OcrDisplay(props) {
  const { data, allControls = [], onChange } = props;
  const { enumDefault } = data;
  const [visible, setVisible] = useState(false);
  const ocrMap = getAdvanceSetting(data, 'ocrmap');

  const { ocrapitype = '0', ocroriginal = '', ocrmaptype = '0', ocrcid = '' } = getAdvanceSetting(data);

  const FILED_LIST = allControls.filter(i => i.type === 14).map(i => ({ text: i.controlName, value: i.controlId }));
  const batchDisabled = ocrmaptype === '2' && !ocrcid;
  const FILED_RELATION_LIST =
    ocrmaptype === '2' && ocrcid
      ? (
          _.get(
            _.find(allControls, i => i.controlId === ocrcid),
            'relationControls',
          ) || []
        ).filter(i => !_.includes(ALL_SYS, i.controlId))
      : allControls;

  useEffect(() => {
    if (_.isUndefined(enumDefault)) {
      onChange(handleAdvancedSettingChange({ ...data, enumDefault: 1 }, { ocrmap: JSON.stringify([]) }));
    }
  }, [data.controlId]);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('接口服务')}</div>
        <RadioGroup
          size="middle"
          checkedValue={ocrapitype}
          data={API_DISPLAY.map(item =>
            item.value === '1' ? { ...item, disabled: md.global.SysSettings.hideIntegration } : item,
          )}
          onChange={value => {
            let newData = handleAdvancedSettingChange(data, { ocrapitype: value, ocrmaptype: '0', ocrcid: '' });
            if (value === '1' && _.isUndefined(data.hint)) {
              newData = { ...newData, hint: _l('识别文字') };
            }
            onChange(newData);
          }}
        />
        {ocrapitype !== '1' && (!_.get(md, 'global.Config.IsLocal') || _.get(md, 'global.Config.IsPlatformLocal')) && (
          <div className="mTop10 Gray_9e">
            {_l(
              '使用系统集成的识别服务，单次识别收费为%0/次，批量处理按照%0/附件数量计费，费用将直接从企业账务中心扣除。',
              _.get(md, 'global.PriceConfig.DataPipelinePrice'),
            )}
          </div>
        )}
      </SettingItem>

      {ocrapitype === '1' ? (
        <Fragment>
          {/**按查询按钮格式来，没有选项列表 */}
          <ApiSearchConfig {...props} />
          <SettingItem>
            <div className="settingItemTitle">{_l('保存识别原件')}</div>
            <WidgetDropdown
              placeholder={_l('选择附件字段')}
              value={ocroriginal}
              data={FILED_LIST}
              onChange={value => {
                onChange(handleAdvancedSettingChange(data, { ocroriginal: value }));
              }}
            />
          </SettingItem>
        </Fragment>
      ) : (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('识别模板')}</div>
            <WidgetDropdown
              placeholder={_l('请选择识别模板')}
              value={enumDefault}
              data={TEMPLATE_TYPE}
              onChange={value => {
                if (value !== enumDefault) {
                  onChange(
                    handleAdvancedSettingChange({ ...data, enumDefault: value }, { ocrmap: JSON.stringify([]) }),
                  );
                }
              }}
            />
          </SettingItem>
          <OcrMapType {...props} />
          {_.isNumber(enumDefault) && (
            <SettingItem>
              <div className="settingItemTitle">{_l('字段映射')}</div>
              {isEmpty(ocrMap) ? (
                <Button
                  style={{
                    borderStyle: isEmpty(ocrMap) ? 'dashed' : 'solid',
                    color: batchDisabled ? 'rgba(51, 51, 51, 0.5)' : '#151515',
                  }}
                  onClick={() => {
                    if (batchDisabled) return;
                    setVisible(true);
                  }}
                >
                  {_l('点击设置')}
                </Button>
              ) : (
                <Button onClick={() => setVisible(true)}>
                  <i style={{ position: 'relative', top: '2px' }} className="icon-check_circle active Font18"></i>
                  <span>{_l('已设置')}</span>
                </Button>
              )}
              {visible && <OcrMap {...props} allControls={FILED_RELATION_LIST} onClose={() => setVisible(false)} />}
            </SettingItem>
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
