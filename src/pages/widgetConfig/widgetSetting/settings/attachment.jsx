import React, { Fragment } from 'react';
import { Dropdown, Icon } from 'ming-ui';
import { Input } from 'antd';
import { SettingItem } from '../../styled';
import WidgetVerify from '../components/WidgetVerify';
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
    desc: _l('支持上传JPG、JPEG、PNG、Gif、WebP、Tiff、bmp、HEIC、HEIF格式的文件（在附件中支持预览）'),
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

export default function Attachment({ from, data, onChange }) {
  const { enumDefault, advancedSetting = {} } = data;
  const { covertype = '0', showtype = '1', showwatermark } = getAdvanceSetting(data);
  const { type = '', values = [] } = JSON.parse(advancedSetting.filetype || '{}');
  const desc = _.get(
    _.find(FILE_TYPE, i => i.value === type),
    'desc',
  );

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
                ...(_.includes(['2', '3', '4'], value)
                  ? { watermarkinfo: '', showwatermark: '0', watermarkstyle: '2', valuesize: '3' }
                  : {}),
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
    </Fragment>
  );
}
