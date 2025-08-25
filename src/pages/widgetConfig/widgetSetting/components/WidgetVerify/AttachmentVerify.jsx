import React, { Fragment, useEffect, useState } from 'react';
import { Input, Tooltip } from 'antd';
import cx from 'classnames';
import { Checkbox } from 'ming-ui';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import AttachmentConfig from '../AttachmentConfig';
import TextVerify from './TextVerify';

export default function AttachmentVerify(props) {
  const { data, onChange } = props;
  const { maxcount, max: originMax } = getAdvanceSetting(data);
  const [max, setMax] = useState(originMax);
  const [visible, setVisible] = useState();

  useEffect(() => {
    setMax(originMax);
    setVisible(!!originMax);
  }, [originMax]);

  return (
    <Fragment>
      <div className={cx('labelWrap', { mBottom8: maxcount })}>
        <Checkbox
          size="small"
          checked={!!maxcount}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { maxcount: checked ? '' : 1 }))}
        >
          <span>{_l('限制文件数量')}</span>
        </Checkbox>
      </div>
      {maxcount && <AttachmentConfig data={data} onChange={onChange} maxNum={100} attr="maxcount" />}

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
            autoCloseDelay={0}
            title={
              <span>
                {_l(
                  '用于限制单个文件的大小，可根据需要的文件类型做限制。如证件照1MB以内。最大不能超过4096MB，最多支持2位小数，例如',
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
        <div className="flexCenter mTop8">
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
              const value = !max || max < 0.01 ? 1 : max > 4096 ? 4096 : max;
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
      <TextVerify {...props} />
    </Fragment>
  );
}
