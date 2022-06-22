import React, { Fragment, useState, useEffect } from 'react';
import { Checkbox } from 'ming-ui';
import { Tooltip, Input } from 'antd';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import AttachmentConfig from '../AttachmentConfig';

export default function AttachmentVerify({ data, onChange }) {
  const { maxcount, max: originMax } = getAdvanceSetting(data);
  const [max, setMax] = useState(originMax);
  const [visible, setVisible] = useState();

  useEffect(() => {
    setMax(originMax);
    setVisible(!!originMax);
  }, [originMax]);

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={!!maxcount}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { maxcount: checked ? '' : 1 }))}
        >
          <span>{_l('限制文件数量')}</span>
        </Checkbox>
      </div>
      {maxcount && <AttachmentConfig data={data} onChange={onChange} attr="maxcount" />}

      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={visible}
          onClick={checked => {
            setVisible(!checked);
            onChange(handleAdvancedSettingChange(data, { max: checked ? '' : 1 }));
          }}
        >
          <span style={{ marginRight: '4px' }}>{_l('限制单个文件大小')}</span>
          <Tooltip
            placement="bottom"
            title={
              <span>
                {_l(
                  '用于限制单个文件的大小，可根据需要的文件类型做限制。如证件照1MB以内。最大不能超过1024MB，最多支持2位小数，例如',
                )}
                <br />
                {'0.01MB。'}
              </span>
            }
          >
            <i className="icon-help Gray_9e Font16 Hand"></i>
          </Tooltip>
        </Checkbox>
      </div>
      {visible && (
        <div className="flexCenter mTop10">
          <Input
            style={{ width: '96px', marginRight: '12px' }}
            value={max}
            onChange={e => {
              const value = e.target.value.trim();
              const newVal = value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1');
              if (!isNaN(value) && (value === '' || newVal)) {
                setMax(newVal);
              }
            }}
            onBlur={() => {
              const value = !max || max < 0.01 ? 1 : max > 1024 ? 1024 : max;
              setMax(value);
              onChange(
                handleAdvancedSettingChange(data, {
                  max: value,
                }),
              );
            }}
          />{' '}
          MB
        </div>
      )}
    </Fragment>
  );
}
