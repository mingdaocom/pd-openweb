import React, { Fragment, useState } from 'react';
import { useSetState } from 'react-use';
import { Checkbox, Dialog, Radio, WaterMark, UpgradeIcon } from 'ming-ui';
import { Tooltip } from 'antd';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import cx from 'classnames';
import { SettingItem, AnimationWrap } from 'src/pages/widgetConfig/styled';
import DynamicDefaultValue from '../../DynamicDefaultValue';
import styled from 'styled-components';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import { transferValue } from '../../DynamicDefaultValue/util';
import { SectionItem } from '../../SplitLineConfig/style';

const WaterMarkSettingWrap = styled.div`
  .markStyleContent {
    flex: 1;
    min-width: 0;
    display: flex;
    .markStyleItem {
      width: 120px;
      margin-right: 56px;
      margin-bottom: 14px;
      .itemExample {
        width: 120px;
        height: 160px;
        background: #ffffff;
        border: 1px solid #ededed;
        border-radius: 3px;
        margin-bottom: 6px;
      }
      .ming.Radio {
        margin-left: 34px;
      }
    }
    .ant-pro-layout-watermark {
      background: ${props => props.bgColor};
      border-radius: 3px;
    }
  }
  .colorBox {
    width: 32px;
    height: 32px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    cursor: pointer;
    border: 1px solid #d8d8d8;
    box-sizing: border-box;
    &.active {
      border: 1px solid #2196f3;
    }
  }
`;

const MARK_STYLE_OPTIONS = [
  // {
  //   text: _l('倾斜'),
  //   value: '1',
  // },
  {
    text: _l('水平'),
    value: '2',
  },
  {
    text: _l('密集'),
    value: '3',
  },
];

const MASK_FONT_OPTIONS = [
  { text: _l('宋体'), value: '0' },
  { text: _l('黑体'), value: '1' },
];

const MASK_SIZE_OPTIONS = [
  { text: _l('极小'), value: '0' },
  { text: _l('小'), value: '1' },
  { text: _l('中'), value: '2' },
  { text: _l('大'), value: '3' },
  { text: _l('超大'), value: '4' },
];

const MASK_COLOR_OPTIONS = [
  { value: '#bdbdbd', background: '#fff', color: '#757575', tips: _l('适合浅色') },
  { value: '#484848', background: '#333', color: '#d9d9d9', tips: _l('适合深色') },
];

const getMarkStyle = value => {
  if (value === '2') {
    return {
      rotate: 0,
      gapX: 20,
      gapY: 160,
      fontSize: 24,
      fontColor: '#bdbdbd',
    };
  } else if (value === '3') {
    return {
      rotate: -45,
      gapX: 5,
      gapY: 0,
      offsetTop: 35,
      offsetLeft: 15,
      fontSize: 10,
      width: 60,
      height: 60,
      fontColor: '#bdbdbd',
    };
  } else {
    return {
      rotate: -45,
      gapX: 60,
      gapY: 230,
      fontSize: 24,
      fontColor: '#bdbdbd',
    };
  }
};

function WaterMarkDialog(props) {
  const { data, onChange, allControls = [], globalSheetInfo = {}, onClose } = props;
  const {
    watermarkstyle = '2',
    watermarkinfo,
    valuesize = '3',
    valuestyle = '0',
    valuecolor = '#bdbdbd',
  } = getAdvanceSetting(data);
  const [info, setInfo] = useSetState({
    watermarkstyle,
    watermarkinfo,
    valuesize,
    valuestyle,
    valuecolor,
  });
  const bgColor = _.get(
    _.find(MASK_COLOR_OPTIONS, m => m.value === info.valuecolor),
    'background',
  );
  return (
    <Dialog
      width={560}
      visible={true}
      title={_l('水印设置')}
      okText={_l('保存')}
      cancelText={_l('取消')}
      onCancel={onClose}
      onOk={() => {
        if (!info.watermarkinfo) {
          alert(_l('水印内容不允许为空'), 3);
          return;
        }
        onChange(
          handleAdvancedSettingChange(data, {
            ...info,
            showwatermark: '1',
          }),
        );
        onClose();
      }}
    >
      <WaterMarkSettingWrap bgColor={bgColor}>
        <SettingItem className="mTop10">
          <div className="settingItemTitle">
            {_l('文字')}
            <Tooltip placement="bottom" title={_l('限制显示字数为20个字')}>
              <i className="icon-help Gray_9e Font16 Hand mLeft4"></i>
            </Tooltip>
          </div>
          <DynamicDefaultValue
            from={4}
            hideTitle={true}
            hideSearchAndFun={true}
            globalSheetInfo={globalSheetInfo}
            data={{
              ...handleAdvancedSettingChange(data, {
                defsource: JSON.stringify(transferValue(info.watermarkinfo)) || '',
                defaulttype: '',
              }),
              type: 2,
            }}
            allControls={allControls.filter(i => _.includes([2, 3, 4, 5], i.type))}
            onChange={newData => {
              const { defsource } = getAdvanceSetting(newData);
              let fields = '';
              safeParse(defsource || '[]').forEach(item => {
                const { cid, rcid, staticValue } = item;
                if (cid) {
                  fields += rcid ? `$${cid}~${rcid}$` : `$${cid}$`;
                } else {
                  fields += staticValue;
                }
              });
              setInfo({ watermarkinfo: fields });
            }}
          />
        </SettingItem>
        <SettingItem>
          <div className="settingItemTitle">{_l('样式')}</div>
          <div className="markStyleContent">
            {MARK_STYLE_OPTIONS.map(item => {
              return (
                <div
                  className="markStyleItem"
                  onClick={() => {
                    setInfo({ watermarkstyle: item.value, valuesize: item.value === '3' ? '0' : '3' });
                  }}
                >
                  <div className="itemExample">
                    <WaterMark
                      content={_l('水印示例')}
                      zIndex={10}
                      showWaterMark={true}
                      fontColor={info.valuecolor}
                      {...getMarkStyle(item.value)}
                    />
                  </div>
                  <Radio {...item} size="small" checked={item.value === info.watermarkstyle} />
                </div>
              );
            })}
          </div>
        </SettingItem>
        <SectionItem className="mTop0">
          <div className="label">{_l('字体')}</div>
          <AnimationWrap style={{ width: '36%' }}>
            {MASK_FONT_OPTIONS.map(item => (
              <div
                className={cx('animaItem', { active: info.valuestyle === item.value })}
                onClick={() => {
                  setInfo({ valuestyle: item.value });
                }}
              >
                {item.text}
              </div>
            ))}
          </AnimationWrap>
        </SectionItem>
        {info.watermarkstyle !== '3' && (
          <SectionItem>
            <div className="label">{_l('大小')}</div>
            <AnimationWrap className="flex">
              {MASK_SIZE_OPTIONS.map(item => (
                <div
                  className={cx('animaItem', { active: info.valuesize === item.value })}
                  onClick={() => {
                    setInfo({ valuesize: item.value });
                  }}
                >
                  {item.text}
                </div>
              ))}
            </AnimationWrap>
          </SectionItem>
        )}
        <SectionItem>
          <div className="label">{_l('颜色')}</div>
          {MASK_COLOR_OPTIONS.map(item => {
            return (
              <Tooltip placement="bottom" title={item.tips}>
                <div
                  className={cx('colorBox', { active: info.valuecolor === item.value })}
                  style={{ background: item.background }}
                  onClick={() => setInfo({ valuecolor: item.value })}
                >
                  <i className="icon-letter_a Font15" style={{ color: item.color }}></i>
                </div>
              </Tooltip>
            );
          })}
        </SectionItem>
      </WaterMarkSettingWrap>
    </Dialog>
  );
}

export default function AttachmentVerify(props) {
  const { data, onChange, globalSheetInfo } = props;
  const { alldownload = '1', showwatermark, filetype } = getAdvanceSetting(data);
  const [markVisible, setMarkVisible] = useState(false);

  const supportMark = !_.includes(['2', '3', '4'], safeParse(filetype || '{}').type);
  const featureType = getFeatureStatus(globalSheetInfo.projectId, VersionProductType.waterMark);

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={alldownload === '1'}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { alldownload: checked ? '0' : '1' }))}
        >
          <span>{_l('允许全部下载')}</span>
        </Checkbox>
      </div>

      {supportMark && (
        <div className="labelWrap labelBetween">
          <Checkbox
            size="small"
            checked={showwatermark === '1'}
            onClick={checked => {
              if (featureType === '2') {
                buriedUpgradeVersionDialog(globalSheetInfo.projectId, VersionProductType.waterMark);
                return;
              }
              if (checked) {
                onChange(
                  handleAdvancedSettingChange(data, { watermarkstyle: '1', watermarkinfo: '', showwatermark: '0' }),
                );
              } else {
                setMarkVisible(true);
              }
            }}
          >
            <span style={{ marginRight: '4px' }}>{_l('图片水印')}</span>
            <Tooltip
              placement="bottom"
              title={_l(
                '在文件预览和下载时叠加水印。只支持文件大小5M以内图片水印。目前支持的图片的格式为：jepg、png、tiff、bmp、heif',
              )}
            >
              <i className="icon-help Gray_9e Font16 Hand"></i>
            </Tooltip>
            {featureType === '2' && <UpgradeIcon />}
          </Checkbox>
          {showwatermark === '1' && (
            <Tooltip placement="bottom" title={_l('水印设置')}>
              <i
                className="icon-settings Gray_9e Font16 Hand Right ThemeHoverColor3"
                onClick={() => {
                  if (featureType === '2') {
                    buriedUpgradeVersionDialog(globalSheetInfo.projectId, VersionProductType.waterMark);
                    return;
                  }
                  setMarkVisible(true);
                }}
              ></i>
            </Tooltip>
          )}
        </div>
      )}

      {markVisible && <WaterMarkDialog {...props} onClose={() => setMarkVisible(false)} />}
    </Fragment>
  );
}
