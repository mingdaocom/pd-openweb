import React, { useEffect, useState } from 'react';
import { DynamicInputStyle } from '../styled';
import { Tooltip } from 'ming-ui';
import { handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import { getAdvanceSetting } from 'src/util/index.js';
import { DATE_TYPE } from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/config.js';
import { getDaterange } from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/util.js';

const ICON_TYPES = [
  { key: 'dynamicsrc', icon: 'icon-lookup', text: _l('查询工作表') },
  { key: 'defaultfunc', icon: 'icon-formula', text: _l('函数计算') },
  { key: 'dynamiccustom', icon: '', text: _l('自定义') },
];

export default function DynamicInput({
  defaultType,
  dynamicData = {},
  queryConfig = {},
  onTriggerClick,
  data = {},
  onChange,
  updateQueryConfigs = () => {},
  linkParams,
}) {
  const current = _.find(ICON_TYPES, item => item.key === defaultType) || {};
  const name = `<span>：${_.get(queryConfig, 'sourceName')}</span>`;
  const [sourceName, setSourceName] = useState(name);

  useEffect(() => {
    setSourceName(name);
    if (defaultType === 'dynamicsrc') {
      if (!(_.get(queryConfig, 'templates[0].controls') || []).length) {
        const com = `：<span class="Red">${_l('已删除')}</span>`;
        setSourceName(com);
      }
    }
  }, [data.controlId, dynamicData]);

  const handleDelete = e => {
    e.stopPropagation();
    if (defaultType === 'dynamicsrc') {
      onChange(handleAdvancedSettingChange(data, { dynamicsrc: '', defaulttype: '' }));
      updateQueryConfigs(dynamicData);
    } else if (defaultType === 'dynamiccustom') {
      onChange(handleAdvancedSettingChange(data, { defsource: JSON.stringify([]), defaulttype: '' }));
    } else if (defaultType === 'defaultfunc') {
      onChange(handleAdvancedSettingChange(data, { defaultfunc: '', defaulttype: '', defsource: '' }));
    }
  };
  const isLinkParams = (getAdvanceSetting(data, 'defsource') || []).filter(o => o.rcid === 'url').length > 0;
  const isDYDateTime = (getAdvanceSetting(data, 'defsource') || []).filter(o => o.rcid === 'dateRange').length > 0;
  if (isLinkParams || isDYDateTime) {
    return (
      <DynamicInputStyle className="">
        {(getAdvanceSetting(data, 'defsource') || []).map(o => {
          if (isLinkParams) {
            const isDel = !(linkParams || []).includes(o.cid);
            return <span className={isDel ? 'Red' : ''}>{!isDel ? o.cid : _l('该参数已删除')}</span>;
          }
          if (isDYDateTime) {
            const info = _.flattenDeep(DATE_TYPE).find(it => it.value == o.cid);
            const isDel = !info || !getDaterange(data.advancedSetting || {}).includes(o.cid);
            return <span className={isDel ? 'Red' : ''}>{!isDel ? info.text : _l('已删除')}</span>;
          }
        })}
        <Tooltip text={<span>{_l('清除')}</span>}>
          <div
            className="delete"
            onClick={() => {
              onChange(handleAdvancedSettingChange(data, { defsource: JSON.stringify([]) }));
            }}
          >
            <i className="icon-cancel1"></i>
          </div>
        </Tooltip>
      </DynamicInputStyle>
    );
  }
  return (
    <DynamicInputStyle onClick={onTriggerClick}>
      <div className={`text ${dynamicData && dynamicData.status === -1 ? 'error' : ''}`}>
        {current.icon && <i className={`${current.icon} Font16 mRight10 Gray_75`} />}
        <span className="Bold flex overflow_ellipsis">
          {current.text}
          {defaultType === 'dynamicsrc' && <span dangerouslySetInnerHTML={{ __html: sourceName }}></span>}
        </span>
      </div>
      <div className="options">
        <Tooltip text={<span>{_l('清除')}</span>}>
          <div className="delete" onClick={handleDelete}>
            <i className="icon-cancel1"></i>
          </div>
        </Tooltip>
        <div className="edit">
          <i className="icon-edit"></i>
        </div>
      </div>
    </DynamicInputStyle>
  );
}
