import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Checkbox, Input, Segmented, Select, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { DisplayMode, SettingItem } from '../../styled';
import { SectionItem } from '../components/SplitLineConfig/style';
import WidgetVerify from '../components/WidgetVerify';

const SORT_TYPE_OPTIONS = [
  { value: 1, label: _l('新的在前') },
  { value: 2, label: _l('旧的在前') },
  {
    value: 3,
    label: _l('自定义'),
    content: (
      <div className="flexCenter" style={{ justifyContent: 'space-between' }}>
        <span>{_l('自定义')}</span>
        <Tooltip title={_l('附件默认旧文件在前，可拖拽调整顺序，但新上传文件仍会按默认规则排序')} placement="bottom">
          <span className="icon-info textTertiary Font16 subText" />
        </Tooltip>
      </div>
    ),
  },
];

const renderSortTypeOption = ({ data: option }) => option.content || option.label;
const DISABLED_FILE_TYPE_SELECT_STYLES = { content: { color: 'var(--color-text-primary)' } };
const CUSTOM_FILE_EXTENSION_REGEXP = /^[0-9A-Z_]+$/i;

export const parseCustomFileTypeInput = inputValue => {
  const normalizedInput = inputValue.replace(/，/g, ',');

  if (!normalizedInput) return [];

  const extensions = normalizedInput.split(',').map(extension => extension.trim());
  const lastIndex = extensions.length - 1;

  if (
    extensions.some(
      (extension, index) =>
        (!extension && index !== lastIndex) || (extension && !CUSTOM_FILE_EXTENSION_REGEXP.test(extension)),
    )
  ) {
    return null;
  }

  return extensions;
};

export const normalizeCustomFileTypes = values =>
  _.uniqBy(values.map(value => value.trim()).filter(Boolean), value => value.toLowerCase());

const getFillTypeOptions = () => [
  { value: '0', label: _l('填满') },
  { value: '1', label: _l('完整显示') },
];

const DISPLAY_TYPE = [
  { value: '1', text: _l('缩略图'), img: 'file-thumb' },
  { value: '2', text: _l('卡片'), img: 'file-card' },
  { value: '3', text: _l('列表'), img: 'list' },
  { value: '4', text: _l('海报'), img: 'file-post' },
];

const FILE_TYPE = [
  { value: '', label: _l('不限制') },
  {
    value: '1',
    label: _l('图片'),
    desc: _l('支持上传JPG、JPEG、PNG、Gif、WebP、Tiff、bmp、HEIC、HEIF格式的文件（在附件中支持预览）'),
  },
  { value: '2', label: _l('文档'), desc: _l('支持除图片、音频、视频以外的文件') },
  {
    value: '3',
    label: _l('音频'),
    desc: _l('支持WAV、FLAC、APE、ALAC、WavPack、MP3、M4a、AAC、Ogg Vorbis、Opus、Au、MMF、AIF格式的文件'),
  },
  {
    value: '4',
    label: _l('视频'),
    desc: _l('支持MP4、AVI、MOV、WMV、MKV、FLV、F4V、SWF、RMVB、MPG格式的文件'),
  },
  {
    value: '0',
    label: _l('自定义'),
    desc: _l('请输入自定义的文件扩展名，多个请用英文逗号隔开，不区分大小写。如：xls,doc,pdf'),
  },
];

export default function Attachment(props) {
  const { data, onChange } = props;
  const { enumDefault, advancedSetting = {} } = data;
  const { covertype = '0', showtype = '1' } = getAdvanceSetting(data);
  const { type = '', values = [] } = JSON.parse(advancedSetting.filetype || '{}');
  const isFileTypeDisabled = type === '1' && showtype === '4';
  const desc = _.get(
    _.find(FILE_TYPE, i => i.value === type),
    'desc',
  );
  const showfilename = _.isUndefined(advancedSetting.showfilename)
    ? _.includes(['2', '3'], showtype)
      ? '1'
      : '0'
    : advancedSetting.showfilename;

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <DisplayMode>
          {DISPLAY_TYPE.map(item => {
            return (
              <div
                className={cx('displayItem', { active: showtype === item.value })}
                onClick={() => {
                  let resProps = {};

                  if (item.value === '2') {
                    resProps.covertype = '1';
                  } else if (item.value === '4') {
                    resProps.covertype = '1';
                    resProps.filetype = JSON.stringify({ type: '1', values: [] });
                  } else {
                    resProps.covertype = '0';
                  }

                  onChange(handleAdvancedSettingChange(data, { showtype: item.value, ...resProps }));
                }}
              >
                <div className="mBottom4">
                  <Icon icon={item.img} className={cx(item.value === '3' ? 'Font28' : 'Font20')} />
                </div>
                <span className="text">{item.text}</span>
              </div>
            );
          })}
        </DisplayMode>
      </SettingItem>
      {showtype === '1' && (
        <SectionItem>
          <div className="label Width100">{_l('填充方式')}</div>
          <Segmented
            block
            className="flex"
            value={covertype}
            options={getFillTypeOptions()}
            onChange={value => onChange(handleAdvancedSettingChange(data, { covertype: value }))}
          />
        </SectionItem>
      )}
      <Checkbox
        className="mTop16"
        checked={showfilename === '1'}
        onChange={event =>
          onChange(
            handleAdvancedSettingChange(data, {
              showfilename: String(+event.target.checked),
            }),
          )
        }
        size="small"
      >
        {_l('在单元格中显示文件名')}
      </Checkbox>

      <SettingItem>
        <div className="settingItemTitle">{_l('文件类型')}</div>
        <Select
          className="w100"
          options={FILE_TYPE}
          disabled={isFileTypeDisabled}
          styles={isFileTypeDisabled ? DISABLED_FILE_TYPE_SELECT_STYLES : undefined}
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
              const nextValues = parseCustomFileTypeInput(e.target.value);

              if (!nextValues) return;

              onChange(
                handleAdvancedSettingChange(data, {
                  filetype: JSON.stringify({ type: '0', values: nextValues }),
                }),
              );
            }}
            onBlur={() => {
              const nextValues = normalizeCustomFileTypes(values);

              if (_.isEqual(values, nextValues)) return;

              onChange(
                handleAdvancedSettingChange(data, {
                  filetype: JSON.stringify({ type: '0', values: nextValues }),
                }),
              );
            }}
          />
        )}
        {desc && <div className="textTertiary mTop8">{desc}</div>}
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('排序')}</div>
        <Select
          className="w100"
          options={SORT_TYPE_OPTIONS}
          optionRender={renderSortTypeOption}
          value={enumDefault || 3}
          onChange={value => onChange({ enumDefault: value })}
        />
      </SettingItem>
      <SettingItem>
        <WidgetVerify {...props} />
      </SettingItem>
    </Fragment>
  );
}
