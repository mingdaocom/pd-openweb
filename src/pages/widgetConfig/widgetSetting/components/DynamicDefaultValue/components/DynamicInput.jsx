import React, { useEffect, useState } from 'react';
import { DynamicInputStyle } from '../styled';
import { Tooltip } from 'ming-ui';
import { handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';

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
}) {
  const current = _.find(ICON_TYPES, item => item.key === defaultType) || {};
  const name = `<span>：${_.get(dynamicData, 'sourceName')}</span>`;
  const [sourceName, setSourceName] = useState(name);

  useEffect(() => {
    setSourceName(name);
    if (defaultType === 'dynamicsrc') {
      if (queryConfig.templates && !queryConfig.templates.length) {
        const com = `：<span class="Red">${_l('已删除')}</span>`;
        setSourceName(com);
      }
    }
  }, [data.controlId, dynamicData]);

  const handleDelete = e => {
    e.stopPropagation();
    if (defaultType === 'dynamicsrc') {
      onChange(handleAdvancedSettingChange(data, { dynamicsrc: '', defaulttype: '' }));
    } else if (defaultType === 'dynamiccustom') {
      onChange(handleAdvancedSettingChange(data, { defsource: JSON.stringify([]), defaulttype: '' }));
    } else if (defaultType === 'defaultfunc') {
      onChange(handleAdvancedSettingChange(data, { defaultfunc: '', defaulttype: '' }));
    }
  };

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
