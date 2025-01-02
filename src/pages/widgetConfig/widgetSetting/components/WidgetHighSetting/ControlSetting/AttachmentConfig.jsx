import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Checkbox, Dialog, Radio, WaterMark, UpgradeIcon, ColorPicker, Icon, Button, LoadDiv } from 'ming-ui';
import { Tooltip, Slider, InputNumber } from 'antd';
import Dropdown from '../../../../components/Dropdown';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import cx from 'classnames';
import { SettingItem, AnimationWrap } from 'src/pages/widgetConfig/styled';
import DynamicDefaultValue from '../../DynamicDefaultValue';
import styled from 'styled-components';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import { transferValue } from '../../DynamicDefaultValue/util';
import { SectionItem } from '../../SplitLineConfig/style';
import 'src/pages/widgetConfig/styled/style.less';
import attachmentAjax from 'src/api/attachment.js';

const defaultImg = `https://fp1.mingdaoyun.cn/resources/preview_background.png`;

const WaterMarkSettingWrap = styled.div`
  display: flex;
  .settingContent {
    flex: 1;
    min-width: 0;
    padding-right: 24px;
    .label {
      width: 130px;
    }
    .colorWrap {
      width: 140px;
      height: 36px;
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #ddd;
      border-radius: 3px;
      padding: 4px;
      .colorCon {
        flex: 1;
        min-width: 0;
        height: 28px;
        border: 1px solid #cccccc;
        border-radius: 3px;
      }
      i {
        margin: 0 10px;
      }
    }
    .positionBox {
      border-right: 1px solid #f5f5f5;
      border-bottom: 1px solid #f5f5f5;
      border-radius: 3px;
      tr {
        display: flex;
      }
      td {
        font-size: 12px;
        min-width: 80px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #f5f5f5;
        border-right: none;
        border-bottom: none;
        cursor: pointer;
        &.active,
        &:hover {
          color: #2196f3;
        }
        &.active {
          font-weight: bold;
        }
      }
    }
  }
  .previewContent {
    width: 280px;
    padding-left: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .previewWrap {
      width: 100%;
      height: 210px;
      border-radius: 3px;
      border: 1px solid #dddddd;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
    }
    .imageBox {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-image: url(${props => props.previewUrl || defaultImg});
      background-repeat: no-repeat;
      background-position: center;
      background-size: 100% 100%;
      .defaultText {
        font-size: 33px;
        color: rgba(0, 0, 0, 0.2);
      }
    }
  }
  .markStyleContent {
    flex: 1;
    min-width: 0;
    display: flex;
    .markStyleItem {
      width: 120px;
      margin-right: 56px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .itemExample {
        width: 120px;
        height: 92px;
        background: #ffffff;
        border: 1px solid #ededed;
        border-radius: 3px;
        margin-bottom: 6px;
        cursor: pointer;
        &:hover {
          box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 6px;
        }
      }
      .ming.Radio {
        margin: 0 !important;
      }
    }
    .ant-pro-layout-watermark {
      background: #fff;
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

const COLORS = ['#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575'];

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
  { text: _l('仿宋'), value: '0' },
  { text: _l('书宋'), value: '2' },
  { text: _l('黑体'), value: '1' },
  { text: _l('楷体'), value: '3' },
  { text: _l('正黑'), value: '4' },
  { text: _l('米黑'), value: '5' },
];

const MASK_SIZE_OPTIONS = {
  0: '18',
  1: '28',
  2: '68',
  3: '98',
  4: '180',
};

const MASK_DENSITY = [
  { text: _l('疏'), value: '1' },
  { text: _l('标准'), value: '2' },
  { text: _l('密'), value: '3' },
];

const MASK_POSITION = [
  { text: _l('左上'), value: '1' },
  { text: _l('中上'), value: '2' },
  { text: _l('右上'), value: '3' },
  { text: _l('左中'), value: '4' },
  { text: _l('中'), value: '5' },
  { text: _l('右中'), value: '6' },
  { text: _l('左下'), value: '7' },
  { text: _l('中下'), value: '8' },
  { text: _l('右下'), value: '9' },
];

const getMarkStyle = value => {
  if (value === '2') {
    return {
      rotate: 0,
      gapX: 20,
      gapY: 105,
      fontSize: 24,
      fontColor: '#bdbdbd',
    };
  } else if (value === '3') {
    return {
      rotate: -45,
      gapX: 10,
      gapY: 0,
      offsetTop: 42,
      offsetLeft: 21,
      fontSize: 10,
      width: 40,
      height: 42,
      fontColor: '#bdbdbd',
    };
  }
};

function WaterMarkDialog(props) {
  const { data, onChange, allControls = [], globalSheetInfo = {}, onClose } = props;
  const {
    watermarkstyle = '2',
    watermarkinfo,
    valuesize = '68',
    valuestyle = '0',
    valuecolor = '#bdbdbd',
    position = '5',
    watermarkdensity = '2',
    showwatermark,
  } = getAdvanceSetting(data);
  const [info, setInfo] = useSetState({
    watermarkstyle,
    watermarkinfo,
    valuesize,
    valuestyle,
    valuecolor,
    position,
    watermarkdensity,
  });
  const [loading, setLoading] = useState(false);
  const [previewUrl, setUrl] = useState(null);

  const fontSize = MASK_SIZE_OPTIONS[info.valuesize] || info.valuesize;

  useEffect(() => {
    if (showwatermark === '1') {
      previewImage();
    }
  }, []);

  const previewImage = () => {
    if (loading) return;
    setLoading(true);
    attachmentAjax
      .getAttachmentViewUrlForWaterMark({
        advancedSetting: {
          ..._.omit(info, info.watermarkstyle === '3' ? ['position'] : ['watermarkdensity']),
          valuesize: fontSize,
          showwatermark: '1',
          watermarkinfo: _l('水印示例'),
        },
        picUrl: defaultImg,
      })
      .then(res => {
        setUrl(res);
        setLoading(false);
      });
  };

  return (
    <Dialog
      width={900}
      visible={true}
      title={_l('水印设置')}
      okText={_l('保存')}
      cancelText={_l('取消')}
      onCancel={onClose}
      className="attachmentConfigDialog"
      onOk={() => {
        if (!info.watermarkinfo) {
          alert(_l('水印内容不允许为空'), 3);
          return;
        }

        const saveConfig = { ...info, valuesize: fontSize, showwatermark: '1' };

        onChange(
          handleAdvancedSettingChange(
            data,
            _.omit(saveConfig, info.watermarkstyle === '3' ? ['position'] : ['watermarkdensity']),
          ),
        );
        onClose();
      }}
    >
      <WaterMarkSettingWrap previewUrl={previewUrl}>
        <div className="settingContent">
          <SettingItem className="mTop10">
            <div className="settingItemTitle">
              {_l('文字')}
              <Tooltip placement="bottom" title={_l('限制显示字数为100个字')}>
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
                      setInfo({
                        watermarkstyle: item.value,
                        ...(item.value === '3'
                          ? { valuesize: '20', watermarkdensity: '2', position: '' }
                          : { valuesize: '68', watermarkdensity: '', position: '5' }),
                      });
                    }}
                  >
                    <div className="itemExample">
                      <WaterMark
                        content={_l('水印示例')}
                        zIndex={10}
                        showWaterMark={true}
                        {...getMarkStyle(item.value)}
                      />
                    </div>
                    <Radio {...item} size="small" checked={item.value === info.watermarkstyle} />
                  </div>
                );
              })}
            </div>
          </SettingItem>
          <SectionItem className="mTop24">
            <div className="label">{_l('字体样式')}</div>
            <Dropdown
              className="flex mTop0"
              value={info.valuestyle}
              data={MASK_FONT_OPTIONS}
              onChange={value => setInfo({ valuestyle: value })}
            />
            <ColorPicker
              isPopupBody
              value={info.valuecolor}
              sysColor
              defaultColors={COLORS}
              popupAlign={{ offset: [10, 5] }}
              onChange={value => setInfo({ valuecolor: value })}
            >
              <div className="colorWrap mLeft10">
                <div className="colorCon" style={{ backgroundColor: info.valuecolor }}></div>
                <Icon type="expand_more" className="Gray_9d Font18" />
              </div>
            </ColorPicker>
          </SectionItem>
          <SectionItem className="mTop24 flexCenter">
            <div className="label">{_l('字体大小')}</div>
            <Slider
              className="flex"
              min={18}
              max={180}
              value={Number(fontSize)}
              onChange={value => setInfo({ valuesize: value.toString() })}
            />
            <InputNumber
              min={18}
              max={180}
              style={{ marginLeft: '10px' }}
              value={Number(fontSize)}
              onChange={value => setInfo({ valuesize: value.toString() })}
            />
            <span className="mLeft10">{_l('磅')}</span>
          </SectionItem>

          {info.watermarkstyle === '3' ? (
            <SectionItem className="mTop24">
              <div className="label ">{_l('疏密度')}</div>
              <AnimationWrap className="flex">
                {MASK_DENSITY.map(item => (
                  <div
                    className={cx('animaItem', { active: info.watermarkdensity === item.value })}
                    onClick={() => {
                      setInfo({ watermarkdensity: item.value });
                    }}
                  >
                    {item.text}
                  </div>
                ))}
              </AnimationWrap>
            </SectionItem>
          ) : (
            <SectionItem className="mTop24">
              <div className="label">{_l('水印位置')}</div>
              <table className="positionBox">
                {_.chunk(MASK_POSITION, 3).map(row => {
                  return (
                    <tr>
                      {row.map(col => (
                        <td
                          className={cx({ active: col.value === info.position })}
                          onClick={() => setInfo({ position: col.value })}
                        >
                          {col.text}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </table>
            </SectionItem>
          )}
        </div>

        <div className="splitLine"></div>

        <div className="previewContent">
          <div className="previewWrap">
            {loading ? (
              <LoadDiv />
            ) : (
              <div className="imageBox">{!previewUrl && <span className="defaultText">{_l('水印示例')}</span>}</div>
            )}
          </div>

          <Button size="small" type="ghost" disabled={loading} onClick={() => previewImage()}>
            {_l('预览')}
          </Button>
        </div>
      </WaterMarkSettingWrap>
    </Dialog>
  );
}

export default function AttachmentVerify(props) {
  const { data, onChange, globalSheetInfo } = props;
  const { showwatermark, filetype, onlyeditself, allowedit } = getAdvanceSetting(data);
  const [markVisible, setMarkVisible] = useState(false);

  const supportMark = !_.includes(['2', '3', '4'], safeParse(filetype || '{}').type);
  const featureType = getFeatureStatus(globalSheetInfo.projectId, VersionProductType.waterMark);

  const editFeatureType = getFeatureStatus(globalSheetInfo.projectId, VersionProductType.editAttachment);

  return (
    <Fragment>
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
                  handleAdvancedSettingChange(data, {
                    watermarkstyle: '2',
                    watermarkinfo: '',
                    showwatermark: '0',
                    valuesize: '68',
                    valuestyle: '0',
                    valuecolor: '#bdbdbd',
                    watermarkdensity: '2',
                  }),
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

      {md.global.Config.EnableDocEdit && (
        <Fragment>
          <div className="labelWrap labelBetween">
            <Checkbox
              size="small"
              checked={allowedit === '1'}
              onClick={checked => {
                if (editFeatureType === '2') {
                  buriedUpgradeVersionDialog(globalSheetInfo.projectId, VersionProductType.editAttachment);
                  return;
                }
                onChange(
                  handleAdvancedSettingChange(data, { allowedit: String(+!checked), onlyeditself: String(+!checked) }),
                );
              }}
            >
              <span style={{ marginRight: '4px' }}>{_l('文档在线编辑')}</span>
              <Tooltip
                placement="bottom"
                title={_l(
                  '基于WPS在线编辑能力，支持Office、WPS、PDF等主流文档格式编辑，最多10人在线协作编辑，最大文档尺寸100MB，具体可参考帮助文档说明。',
                )}
              >
                <i className="icon-help Gray_9e Font16 Hand"></i>
              </Tooltip>

              <Icon icon="beta1" className="mLeft6 mTop2" style={{ color: '#4caf50' }} />

              {editFeatureType === '2' && (
                <Tooltip placement="bottom" title={_l('当前版本无法使用此功能，请购买或者升级')}>
                  <UpgradeIcon />
                </Tooltip>
              )}
            </Checkbox>
          </div>
          {allowedit === '1' && (
            <div className="pLeft24">
              <div className="labelWrap">
                <Checkbox
                  size="small"
                  checked={onlyeditself === '1'}
                  onClick={checked => onChange(handleAdvancedSettingChange(data, { onlyeditself: String(+!checked) }))}
                >
                  <span style={{ marginRight: '4px' }}>{_l('只能编辑自己上传的附件')}</span>
                  <Tooltip
                    placement="bottom"
                    title={_l('勾选后只可编辑自己上传的文档；若不勾选则有此字段编辑权限即可编辑。')}
                  >
                    <i className="icon-help Gray_9e Font16 Hand"></i>
                  </Tooltip>
                </Checkbox>
              </div>
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
