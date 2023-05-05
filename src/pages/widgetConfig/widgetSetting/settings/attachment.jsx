import React, { Fragment, useState, useEffect } from 'react';
import { Dropdown, Checkbox, Dialog, Icon } from 'ming-ui';
import { Input, Tooltip } from 'antd';
import { SettingItem } from '../../styled';
import Components from '../components';
import WidgetVerify from '../components/WidgetVerify';
import { updateConfig } from '../../util/setting';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import _ from 'lodash';

const SORT_TYPE = [
  { value: 1, text: _l('新的在前') },
  { value: 2, text: _l('旧的在前') },
  { value: 3, text: _l('自定义') },
];

const FILL_TYPE = [
  { value: '0', text: _l('填满') },
  { value: '1', text: _l('完整显示') },
];

const DISPLAY_TYPE = [
  { value: '1', text: _l('缩略图'), img: 'thumbnail', subText: _l('以缩略图预览图片和文档内容') },
  { value: '2', text: _l('卡片'), img: 'card', subText: _l('紧凑式文件展示') },
  { value: '3', text: _l('列表'), img: 'list1', subText: _l('以列表显示附件详细信息') },
  { value: '4', text: _l('平铺'), img: 'tiling', subText: _l('大图平铺显示，只支持图片类型') },
];

const FILE_TYPE = [
  { value: '', text: _l('不限制') },
  {
    value: '1',
    text: _l('图片'),
    desc: _l('支持上传JPG、JPEG、PNG、Gif、WebP、Tiff、bmp格式的文件（在附件中支持预览）'),
  },
  { value: '2', text: _l('文档'), desc: _l('支持除图片、音频、视频以外的文件') },
  {
    value: '3',
    text: _l('音频'),
    desc: _l('支持WAV、FLAC、APE、ALAC、WavPack、MP3、M4a、AAC、Ogg Vorbis、Opus、Au、MMF、AIF格式的文件'),
  },
  { value: '4', text: _l('视频'), desc: _l('支持MP4、AVI、MOV、WMV、MKV、FLV、F4V、SWF、RMVB、MPG格式的文件') },
  {
    value: '0',
    text: _l('自定义'),
    desc: _l('请输入自定义的文件扩展名，多个请用英文逗号隔开，不区分大小写。如：xls,doc,pdf'),
  },
];

const WATERMARK_TYPE = [
  { value: 'user', text: _l('当前用户') },
  { value: 'time', text: _l('当前拍摄时间') },
  { value: 'address', text: _l('当前地点') },
  { value: 'xy', text: _l('当前地点经纬度') },
];

export default function Attachment({ from, data, onChange }) {
  const { enumDefault, enumDefault2, strDefault, advancedSetting = {} } = data;
  const [disableAlbum, onlyAllowMobileInput] = (strDefault || '00').split('');
  const { covertype = '0', showtype = '1' } = getAdvanceSetting(data);
  const { type = '', values = [] } = JSON.parse(advancedSetting.filetype || '{}');
  const originWatermark = JSON.parse(advancedSetting.watermark || '[]');
  const [visible, setVisible] = useState(false);
  const [watermark, setWatermark] = useState(originWatermark);
  const desc = _.get(
    _.find(FILE_TYPE, i => i.value === type),
    'desc',
  );

  useEffect(() => {
    setWatermark(originWatermark);
  }, [data.controlId]);

  useEffect(() => {
    if (!_.includes([1, 2, 3], enumDefault2)) {
      onChange({
        ...handleAdvancedSettingChange(data, {
          watermark: '',
          compress: '0',
          getsave: '0',
          getinput: '0',
        }),
        strDefault: '',
      });
    }
  }, [enumDefault2]);

  return (
    <Fragment>
      <SettingItem className="settingItem flexCenter">
        <div className="mRight10 flex">
          <div className="settingItemTitle">{_l('显示方式')}</div>
          <Dropdown
            border
            data={DISPLAY_TYPE}
            value={showtype}
            menuClass="attachmentDisplayType"
            renderItem={item => {
              return (
                <div className="flexCenter pTop10 pBottom10">
                  <Icon icon={item.img} className="Font28 mRight16" />
                  <span className="flex ellipsis flexColumn">
                    <span className="Bold mBottom5">{item.text}</span>
                    <span>{item.subText}</span>
                  </span>
                </div>
              );
            }}
            onChange={value => {
              let resProps = {};
              if (value === '2') {
                resProps.covertype = '1';
              } else if (value === '4') {
                resProps.covertype = '1';
                resProps.filetype = JSON.stringify({ type: '1', values: [] });
              } else {
                resProps.covertype = '0';
              }
              onChange(handleAdvancedSettingChange(data, { showtype: value, ...resProps }));
            }}
          />
        </div>
        {showtype === '1' && (
          <div className="flex">
            <div className="settingItemTitle">{_l('填充方式')}</div>
            <Dropdown
              border
              data={FILL_TYPE}
              value={covertype}
              onChange={value => onChange(handleAdvancedSettingChange(data, { covertype: value }))}
            />
          </div>
        )}
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('文件类型')}</div>
        <Dropdown
          border
          data={FILE_TYPE}
          disabled={type === '1' && showtype === '4'}
          value={type}
          onChange={value => {
            onChange({
              ...handleAdvancedSettingChange(data, {
                filetype: JSON.stringify({ type: value, values: [] }),
                watermark: '',
                getinput: '',
                getsave: '',
              }),
              enumDefault2: 0,
              strDefault: '',
            });
          }}
        />
        {type === '0' && (
          <Input
            style={{ marginTop: '12px' }}
            value={values.join(',')}
            onChange={e => {
              const values = e.target.value ? e.target.value.replace(/，/g, ',').split(',') : [];
              onChange(handleAdvancedSettingChange(data, { filetype: JSON.stringify({ type: '0', values }) }));
            }}
          />
        )}
        {desc && <div className="Gray_9e mTop8">{desc}</div>}
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('排序')}</div>
        <Dropdown
          border
          data={SORT_TYPE}
          value={enumDefault || 3}
          onChange={value => onChange({ enumDefault: value })}
        />
      </SettingItem>
      <SettingItem>
        <WidgetVerify data={data} onChange={onChange} />
      </SettingItem>
      {from !== 'subList' && (_.includes(['1', '4'], type) || !type) && (
        <SettingItem className="settingItem withSplitLine">
          <div className="settingItemTitle">{_l('限制移动端输入')}</div>
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
                  text={'禁止从桌面端输入'}
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
                    <span style={{ marginRight: '4px' }}>{_l('为照片添加水印（仅APP支持）')}</span>
                    <Tooltip
                      placement="bottom"
                      title={_l('添加水印设置只对App有效，勾选后 不支持在App拍摄照片时修改水印')}
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
              {enumDefault2 !== 2 && (
                <div className="labelWrap labelBetween">
                  <Checkbox
                    size="small"
                    checked={advancedSetting.compress === '1'}
                    onClick={checked => {
                      onChange({
                        ...handleAdvancedSettingChange(data, {
                          compress: checked ? '0' : '1',
                        }),
                      });
                    }}
                  >
                    <span style={{ marginRight: '4px' }}>{_l('压缩照片')}</span>
                    <Tooltip
                      placement="bottom"
                      title={
                        <span className="WordBreak">
                          {_l('压缩照片只对App有效，勾选后在App拍摄照片时不上传原图')}
                        </span>
                      }
                    >
                      <i className="icon-help Gray_9e Font16 Hand"></i>
                    </Tooltip>
                  </Checkbox>
                </div>
              )}
              <Components.SheetDealDataType data={data} onChange={onChange} />
            </SettingItem>
          )}
        </SettingItem>
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
}
