import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import { Checkbox, Modal, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { updateConfig } from 'src/utils/domain/control/editorSetting';
import { transferValue } from 'src/utils/domain/control/value';
import { SettingItem } from '../../../styled';
import DynamicDefaultValue from '../DynamicDefaultValue';
import SheetDealDataType from '../SheetDealDataType';

const getWaterMarkValue = data => {
  const { h5watermark = '', watermark } = getAdvanceSetting(data);
  const oldWatermark = _.reduce(
    safeParse(watermark || '[]'),
    (result, cur) => {
      result += '\n' + `$${cur}$`;
      return result;
    },
    '',
  );
  return h5watermark || oldWatermark.replace(/^\s+/, '') || '';
};

export default ({ from, data, onChange, globalSheetInfo, allControls = [] }) => {
  let { strDefault, enumDefault2, advancedSetting = {} } = data;
  const [disableAlbum, onlyAllowMobileInput] = (strDefault || '00').split('');
  const { webcompress = '1' } = getAdvanceSetting(data);
  const { type = '' } = JSON.parse(advancedSetting.filetype || '{}');
  const [visible, setVisible] = useState(false);
  const [watermark, setWatermark] = useState('');
  const currentWaterMark = getWaterMarkValue(data);

  useEffect(() => {
    if (!_.includes([1, 2, 3], enumDefault2)) {
      onChange({
        ...handleAdvancedSettingChange(data, {
          watermark: '',
          h5watermark: '',
          getsave: '0',
          getinput: '0',
        }),
        strDefault: '',
      });
    }
  }, [enumDefault2]);

  return (
    <Fragment>
      {from !== 'subList' && (_.includes(['0', '1', '4'], type) || !type) && (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('移动端输入')}</div>
            <div className="labelWrap">
              <Checkbox
                checked={_.includes([1, 3], enumDefault2)}
                onChange={event => {
                  const value = !event.target.checked ? (enumDefault2 === 3 ? 2 : 0) : enumDefault2 === 2 ? 3 : 1;
                  onChange({
                    enumDefault2: value,
                  });
                }}
                size="small"
              >
                {_l('拍摄照片')}
              </Checkbox>
            </div>
            {type !== '1' && (
              <div className="labelWrap">
                <Checkbox
                  checked={_.includes([2, 3], enumDefault2)}
                  onChange={event => {
                    const value = !event.target.checked ? (enumDefault2 === 3 ? 1 : 0) : enumDefault2 === 1 ? 3 : 2;
                    onChange({
                      enumDefault2: value,
                    });
                  }}
                  size="small"
                >
                  {_l('拍摄视频')}
                </Checkbox>
              </div>
            )}
            {_.includes([1, 2, 3], data.enumDefault2) && (
              <SettingItem>
                <div className="settingItemTitle Normal">{_l('选项')}</div>
                <div className="labelWrap">
                  <Checkbox
                    checked={onlyAllowMobileInput === '1'}
                    onChange={event =>
                      onChange({
                        strDefault: updateConfig({
                          config: strDefault || '00',
                          value: +event.target.checked,
                          index: 1,
                        }),
                      })
                    }
                    size="small"
                  >
                    {_l('禁止从桌面端输入')}
                  </Checkbox>
                </div>
                <div className="labelWrap">
                  <Checkbox
                    checked={disableAlbum === '1'}
                    onChange={event =>
                      onChange({
                        strDefault: updateConfig({
                          config: strDefault || '00',
                          value: +event.target.checked,
                          index: 0,
                        }),
                      })
                    }
                    size="small"
                  >
                    {_l('禁用相册')}
                  </Checkbox>
                </div>
                <Fragment>
                  <div className="labelWrap labelBetween">
                    <Checkbox
                      checked={currentWaterMark}
                      onChange={event => {
                        if (!event.target.checked) {
                          setVisible(false);
                          setWatermark('');
                          onChange({
                            ...handleAdvancedSettingChange(data, {
                              watermark: '',
                              h5watermark: '',
                            }),
                          });
                        } else {
                          setVisible(true);
                          setWatermark('$user$$time$');
                        }
                      }}
                      size="small"
                    >
                      <span style={{ marginRight: '4px' }}>{_l('添加照片水印')}</span>
                      <Tooltip
                        placement="bottom"
                        title={_l('在上传照片时添加水印，可显示上传者、上传时间、地点、经纬度信息')}
                      >
                        <i className="icon-help textTertiary Font16 Hand"></i>
                      </Tooltip>
                    </Checkbox>
                    {currentWaterMark && (
                      <Tooltip placement="bottom" title={_l('设置水印内容')}>
                        <i
                          className="icon-settings textTertiary Font16 Hand Right hoverColorPrimary"
                          onClick={() => {
                            setVisible(true);
                            setWatermark(currentWaterMark);
                          }}
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
            <div className="flexRow flexCenter justifyContentBetween">
              <Checkbox
                checked={advancedSetting.compress === '1'}
                onChange={event =>
                  onChange(
                    handleAdvancedSettingChange(data, {
                      compress: !event.target.checked ? '0' : '1',
                    }),
                  )
                }
                size="small"
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
                  <i className="icon-help textTertiary Font16 Hand"></i>
                </Tooltip>
              </Checkbox>
              <Checkbox
                checked={webcompress === '1'}
                onChange={event =>
                  onChange(
                    handleAdvancedSettingChange(data, {
                      webcompress: !event.target.checked ? '0' : '1',
                    }),
                  )
                }
                size="small"
              >
                <span style={{ marginRight: '4px' }}>{_l('Web移动端（H5）')}</span>
                <Tooltip
                  placement="bottom"
                  title={
                    <span className="WordBreak">
                      {_l(
                        '开启后，上传图片时将尝试压缩图片以减少文件体积。JPG/JPEG、静态 WebP 支持质量和尺寸压缩；PNG 仅支持尺寸压缩，部分其他格式可能无法压缩。未勾选时按原图上传。此配置影响：原生 H5、公开表单、外部门户及第三方平台的移动 App）',
                      )}
                    </span>
                  }
                >
                  <i className="icon-help textTertiary Font16 Hand"></i>
                </Tooltip>
              </Checkbox>
            </div>
          </SettingItem>
        </Fragment>
      )}
      <Modal
        open={visible}
        mask={{ closable: true }}
        keyboard
        title={_l('水印内容')}
        okText={_l('保存')}
        cancelText={_l('取消')}
        onCancel={() => {
          setVisible(false);
          setWatermark(currentWaterMark);
        }}
        className="SearchWorksheetDialog"
        onOk={() => {
          onChange(
            handleAdvancedSettingChange(data, {
              watermark: '',
              h5watermark: watermark,
            }),
          );
          setVisible(false);
        }}
      >
        <SettingItem className="mTop10">
          <div className="settingItemTitle">
            {_l('文字')}
            <Tooltip placement="bottom" title={_l('限制显示字数为200个字符，超出部分以省略号显示')}>
              <i className="icon-help textTertiary Font16 Hand mLeft4"></i>
            </Tooltip>
          </div>
          <DynamicDefaultValue
            from={11}
            hideTitle={true}
            hideSearchAndFun={true}
            globalSheetInfo={globalSheetInfo}
            data={{
              ...handleAdvancedSettingChange(data, {
                defsource: JSON.stringify(transferValue(watermark)) || '',
                defaulttype: '',
              }),
              type: 2,
            }}
            allControls={allControls.filter(i => _.includes([2, 3, 4, 5, 6, 8, 15, 16, 46], i.type))}
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
              setWatermark(fields);
            }}
          />
        </SettingItem>
      </Modal>
    </Fragment>
  );
};
