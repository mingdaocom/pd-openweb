import React, { Fragment, useState, useEffect } from 'react';
import { Checkbox, Dialog } from 'ming-ui';
import { Tooltip } from 'antd';
import { SettingItem } from '../../../styled';
import SheetDealDataType from '../SheetDealDataType';
import { updateConfig, getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
import _ from 'lodash';

const WATERMARK_TYPE = [
  { value: 'user', text: _l('当前用户') },
  { value: 'time', text: _l('当前拍摄时间') },
  { value: 'address', text: _l('当前地点') },
  { value: 'xy', text: _l('当前地点经纬度') },
];

export default ({ from, data, onChange }) => {
  let { strDefault, enumDefault2, advancedSetting = {} } = data;
  const [disableAlbum, onlyAllowMobileInput] = (strDefault || '00').split('');
  const { webcompress = '1' } = getAdvanceSetting(data);
  const { type = '' } = JSON.parse(advancedSetting.filetype || '{}');
  const originWatermark = JSON.parse(advancedSetting.watermark || '[]');
  const [visible, setVisible] = useState(false);
  const [watermark, setWatermark] = useState(originWatermark);

  useEffect(() => {
    setWatermark(originWatermark);
  }, [data.controlId]);

  useEffect(() => {
    if (!_.includes([1, 2, 3], enumDefault2)) {
      onChange({
        ...handleAdvancedSettingChange(data, {
          watermark: '',
          getsave: '0',
          getinput: '0',
        }),
        strDefault: '',
      });
    }
  }, [enumDefault2]);

  return (
    <Fragment>
      {from !== 'subList' && (_.includes(['1', '4'], type) || !type) && (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('移动端输入')}</div>
            <div className="labelWrap">
              <Checkbox
                size="small"
                checked={_.includes([1, 3], enumDefault2)}
                text={_l('拍摄照片')}
                onClick={checked => {
                  const value = checked ? (enumDefault2 === 3 ? 2 : 0) : enumDefault2 === 2 ? 3 : 1;
                  onChange({ enumDefault2: value });
                }}
              />
            </div>
            {type !== '1' && (
              <div className="labelWrap">
                <Checkbox
                  size="small"
                  checked={_.includes([2, 3], enumDefault2)}
                  text={_l('拍摄视频')}
                  onClick={checked => {
                    const value = checked ? (enumDefault2 === 3 ? 1 : 0) : enumDefault2 === 1 ? 3 : 2;
                    onChange({ enumDefault2: value });
                  }}
                />
              </div>
            )}
            {_.includes([1, 2, 3], data.enumDefault2) && (
              <SettingItem>
                <div className="settingItemTitle Normal">{_l('选项')}</div>
                <div className="labelWrap">
                  <Checkbox
                    size="small"
                    checked={onlyAllowMobileInput === '1'}
                    onClick={checked =>
                      onChange({ strDefault: updateConfig({ config: strDefault || '00', value: +!checked, index: 1 }) })
                    }
                    text={_l('禁止从桌面端输入')}
                  />
                </div>
                <div className="labelWrap">
                  <Checkbox
                    size="small"
                    checked={disableAlbum === '1'}
                    onClick={checked =>
                      onChange({ strDefault: updateConfig({ config: strDefault || '00', value: +!checked, index: 0 }) })
                    }
                    text={_l('禁用相册')}
                  />
                </div>
                <Fragment>
                  <div className="labelWrap labelBetween">
                    <Checkbox
                      size="small"
                      checked={originWatermark.length > 0}
                      onClick={checked => {
                        if (checked) {
                          setVisible(false);
                          setWatermark([]);
                          onChange({
                            ...handleAdvancedSettingChange(data, {
                              watermark: '',
                            }),
                          });
                        } else {
                          setVisible(true);
                          if (!watermark.length) {
                            setWatermark(['user', 'time']);
                            onChange({
                              ...handleAdvancedSettingChange(data, {
                                watermark: JSON.stringify(['user', 'time']),
                              }),
                            });
                          }
                        }
                      }}
                    >
                      <span style={{ marginRight: '4px' }}>{_l('添加照片水印')}</span>
                      <Tooltip
                        placement="bottom"
                        title={_l('在上传照片时添加水印，可显示上传者、上传时间、地点、经纬度信息')}
                      >
                        <i className="icon-help Gray_9e Font16 Hand"></i>
                      </Tooltip>
                    </Checkbox>
                    {originWatermark.length > 0 && (
                      <Tooltip placement="bottom" title={_l('设置水印内容')}>
                        <i
                          className="icon-settings Gray_9e Font16 Hand Right ThemeHoverColor3"
                          onClick={() => setVisible(true)}
                        ></i>
                      </Tooltip>
                    )}
                  </div>
                </Fragment>
                <SheetDealDataType data={data} onChange={onChange} />
              </SettingItem>
            )}
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle">{_l('自动压缩图片')}</div>
            <div className="flexRow">
              <div className="labelWrap flex">
                <Checkbox
                  size="small"
                  checked={advancedSetting.compress === '1'}
                  onClick={checked => onChange(handleAdvancedSettingChange(data, { compress: checked ? '0' : '1' }))}
                >
                  <span style={{ marginRight: '4px' }}>{_l('手机App')}</span>
                  <Tooltip
                    placement="bottom"
                    title={
                      <span className="WordBreak">
                        {_l('勾选后，将对图片压缩后再进行上传。未勾选时，用户可自行选择是否上传原图。')}
                      </span>
                    }
                  >
                    <i className="icon-help Gray_9e Font16 Hand"></i>
                  </Tooltip>
                </Checkbox>
              </div>
              <div className="labelWrap flex">
                <Checkbox
                  size="small"
                  checked={webcompress === '1'}
                  onClick={checked => onChange(handleAdvancedSettingChange(data, { webcompress: checked ? '0' : '1' }))}
                >
                  <span style={{ marginRight: '4px' }}>{_l('Web移动端（H5）')}</span>
                  <Tooltip
                    placement="bottom"
                    title={
                      <span className="WordBreak">
                        {_l(
                          'Web移动端通常建议勾选此配置，可以加快图片上传速度并节省流量。未勾选时，将始终按照原图上传。（此配置影响：原生H5、公开表单、外部门户，以及钉钉、企业微信等第三方平台的移动App）',
                        )}
                      </span>
                    }
                  >
                    <i className="icon-help Gray_9e Font16 Hand"></i>
                  </Tooltip>
                </Checkbox>
              </div>
            </div>
          </SettingItem>
        </Fragment>
      )}
      <Dialog
        visible={visible}
        title={_l('水印内容')}
        okText={_l('保存')}
        cancelText={_l('取消')}
        onCancel={() => setVisible(false)}
        onOk={() => {
          onChange({
            ...handleAdvancedSettingChange(data, {
              watermark: JSON.stringify(watermark),
            }),
          });
          setVisible(false);
        }}
      >
        {WATERMARK_TYPE.map(item => {
          return (
            <Checkbox
              size="small"
              className="mTop10"
              checked={_.includes(watermark, item.value)}
              onClick={checked =>
                setWatermark(checked ? watermark.filter(i => i !== item.value) : watermark.concat([item.value]))
              }
              text={item.text}
            />
          );
        })}
      </Dialog>
    </Fragment>
  );
};
