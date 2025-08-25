import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, Icon, Input } from 'ming-ui';
import { isIframeControl } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { isGalleryOrBoardOrStructureOrDetail } from 'src/pages/worksheet/constants/common';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import { filterAndFormatterControls } from 'src/pages/worksheet/views/util';
import { CARD_WIDTH_OPTIONS, COVER_DISPLAY_FILL, COVER_DISPLAY_MODE, COVER_DISPLAY_POSITION } from '../config';
import { SwitchStyle } from '../style';
import { getCoverStyle } from '../utils';
import ButtonTabs from './ButtonTabs';

const SettingCon = styled.div`
  .ming.Dropdown.isDelete .Dropdown--input .value,
  .dropdownTrigger .Dropdown--input .value {
    color: red;
  }
  .ming.Dropdown.isDelete .Dropdown--border,
  .dropdownTrigger .Dropdown--border {
    border-color: red;
  }
  .navWidth {
    width: 48%;
    input[type='number'] {
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        margin: 0;
        -webkit-appearance: none !important;
      }
    }
    .unit {
      right: 12px;
      line-height: 34px;
    }
    .ming.Input {
      font-size: 13px;
      border: 1px solid #ddd;
      &:hover {
        border-color: #1677ff;
      }
      &:focus {
        border-color: #1677ff;
      }
    }
  }
  .cardWidthWrap {
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
    input {
      width: 100px;
    }
  }
`;
const CoverSettingCon = styled.div`
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
`;

//空(默认没key)或者"1"：允许 "2"：不允许
const COVER_IMAGE_PREVIEW = {
  2: false,
  1: true,
};
// 封面图片
export default class CoverSetting extends React.Component {
  constructor(props) {
    super(props);
    const cardwidth = _.get(!props.fromRelative ? props.view : props, 'advancedSetting.cardwidth') || '2';
    this.state = {
      customWidth: Number(cardwidth) > 4 ? Number(cardwidth) : 320,
    };
  }

  render() {
    const {
      coverColumns = [],
      currentSheetInfo,
      view,
      handleChangeIsCover,
      handleChangeOpencover,
      handleChangeCoverWidth,
      handleChangeCoverStyle,
      fromRelative,
    } = this.props;

    if (coverColumns.length <= 0) {
      return '';
    }

    let data = !fromRelative ? view : this.props;
    const { viewType, advancedSetting = {} } = data;
    const cardwidth = _.get(advancedSetting, 'cardwidth') || '2';
    const coverCid =
      VIEW_DISPLAY_TYPE.gallery === String(viewType)
        ? _.isUndefined(data.coverCid)
          ? _.get(currentSheetInfo, ['advancedSetting', 'coverid']) //默认取表单设置里的封面
          : data.coverCid
        : data.coverCid;
    const { opencover = '1' } = advancedSetting;
    const { coverPosition, coverFillType, coverType } = getCoverStyle(data);
    const coverControls = filterAndFormatterControls({
      controls: coverColumns,
      ////扫码|附件可作为封面
      filter:
        VIEW_DISPLAY_TYPE.gallery === String(viewType) //目前只有画廊视图支持嵌入字段(统计图不支持)作为封面
          ? item =>
              [14, 47].includes(item.type) ||
              [14, 47].includes(item.sourceControlType) ||
              (item.type === 45 && item.enumDefault === 1)
          : item => [14, 47].includes(item.type) || [14, 47].includes(item.sourceControlType),
    });
    let coverValue =
      _.get(
        _.find(coverControls, item => item.value === coverCid),
        'value',
      ) || 'notDisplay';
    let isDelete = false;
    const coverControl = _.find(coverColumns, item => item.controlId === coverCid);
    if (coverCid && !coverControl) {
      isDelete = true;
      coverValue = '';
    }
    // 画廊视图且封面为嵌入iframe(只支持上、填满)
    const isGalleryIframe = VIEW_DISPLAY_TYPE.gallery === String(viewType) && isIframeControl(coverControl || {});
    //扫码字段 只有完整显示
    const isBarCode = (coverControl || {}).type === 47;
    // 看板视图、表视图、层级视图封面设置项  默认右'0'
    // 画廊视图封面设置项 默认上'2'
    const coverPositiondata = coverPosition || (VIEW_DISPLAY_TYPE.gallery === String(viewType) ? '2' : '1');
    // 显示位置为：左/右时，支持显示为圆形/正方形
    //扫码字段 只有完整显示
    //显示位置为：左/右时，支持显示为圆形/正方形

    //画廊视图且封面为嵌入iframe(只支持上、填满)

    const coverTypeData =
      isBarCode || isGalleryIframe
        ? COVER_DISPLAY_MODE.filter(item => item.value === 0) //扫码字段 只有完整显示 画廊视图且封面为嵌入iframe(只支持上、填满)
        : COVER_DISPLAY_MODE;
    const coverFillOptions =
      isBarCode || isGalleryIframe ? COVER_DISPLAY_FILL.filter(l => l.value === 1) : COVER_DISPLAY_FILL;

    return (
      <div className="mTop32">
        <div className="title Font13 bold">{_l('封面')}</div>
        <SettingCon>
          <div className="settingContent mTop8">
            <Dropdown
              data={coverControls.concat({ value: 'notDisplay', text: _l('不显示') })}
              value={coverValue}
              className={cx({ isDelete })}
              border
              style={{ width: '100%' }}
              onChange={value => {
                let coverControl = _.find(coverColumns, item => item.controlId === value) || {};
                if (isIframeControl(coverControl)) {
                  handleChangeCoverStyle(JSON.stringify({ position: '2', style: 0, type: 0 }));
                }
                if ((coverControl || {}).type === 47) {
                  handleChangeCoverStyle(JSON.stringify({ position: coverPositiondata, style: 0, type: 1 }));
                }
                if (coverValue !== value || isDelete) {
                  handleChangeIsCover(value);
                }
              }}
              placeholder={isDelete ? _l('控件已删除，请重新配置') : _l('不显示')}
            />

            {coverValue !== 'notDisplay' && (
              <Fragment>
                {/* 封面图片 */}
                <CoverSettingCon>
                  <div style={{ marginRight: '28px' }}>
                    {/* coverposition 封面位置  上 左 右*/}
                    <div className="subTitle Gray_75">{_l('位置')}</div>
                    <ButtonTabs
                      className="mTop8"
                      disabled={coverValue === 'notDisplay'}
                      data={
                        // 仅看板视图、画廊视图、层级封面、详情视图 支持上
                        isGalleryOrBoardOrStructureOrDetail(viewType)
                          ? isGalleryIframe
                            ? COVER_DISPLAY_POSITION.filter(it => Number(it.value) === 2)
                            : COVER_DISPLAY_POSITION
                          : COVER_DISPLAY_POSITION.filter(it => Number(it.value) < 2)
                      }
                      value={coverPositiondata}
                      onChange={value => {
                        if (coverPositiondata !== value) {
                          handleChangeCoverStyle(
                            JSON.stringify({
                              position: value,
                              style: coverType,
                              type: coverFillType,
                            }),
                          );
                        }
                      }}
                    />
                  </div>
                  <div>
                    <div className="subTitle Gray_75">{_l('显示方式')}</div>
                    <ButtonTabs
                      className="mTop8"
                      disabled={coverValue === 'notDisplay'}
                      data={coverTypeData}
                      value={coverType}
                      onChange={value => {
                        if (coverType !== value) {
                          handleChangeCoverStyle(
                            JSON.stringify({
                              position: coverPositiondata,
                              style: value,
                              type: coverFillType,
                            }),
                          );
                        }
                      }}
                    />
                  </div>
                  <div className="mTop20 w100">
                    <div className="subTitle Gray_75">{_l('图片填充方式')}</div>
                    <div className="InlineBlock">
                      <ButtonTabs
                        className="mTop8 flexRow"
                        disabled={coverValue === 'notDisplay'}
                        data={coverFillOptions}
                        value={coverFillType}
                        onChange={value => {
                          if (coverFillType !== value) {
                            handleChangeCoverStyle(
                              JSON.stringify({
                                position: coverPositiondata,
                                style: coverType,
                                type: value,
                              }),
                            );
                          }
                        }}
                      />
                    </div>
                  </div>
                </CoverSettingCon>
                <div className="configSwitch mTop10">
                  <SwitchStyle className="flexRow alignItemsCenter">
                    {/* //空(默认没key)或者"1"：允许 "2"：不允许 */}
                    <Icon
                      icon={COVER_IMAGE_PREVIEW[opencover] ? 'ic_toggle_on' : 'ic_toggle_off'}
                      className="Font28 Hand"
                      onClick={() => {
                        handleChangeOpencover(COVER_IMAGE_PREVIEW[opencover] ? '2' : '1');
                      }}
                    />
                    <div className="switchText InlineBlock Normal mLeft10">{_l('允许点击查看')}</div>
                  </SwitchStyle>
                </div>
              </Fragment>
            )}
          </div>
          {!!handleChangeCoverWidth &&
            ![VIEW_DISPLAY_TYPE.map, VIEW_DISPLAY_TYPE.gunter, VIEW_DISPLAY_TYPE.calendar].includes(
              String(viewType),
            ) && (
              <div className="mTop24">
                <div className="title Font13 bold">
                  {VIEW_DISPLAY_TYPE.gallery === String(viewType) ? _l('卡片最小宽度') : _l('卡片宽度')}
                </div>
                <div className="flexRow cardWidthWrap">
                  <ButtonTabs
                    className="mTop8"
                    data={CARD_WIDTH_OPTIONS}
                    value={Number(cardwidth) < 5 ? cardwidth : '5'}
                    onChange={value => {
                      if (cardwidth !== value) {
                        handleChangeCoverWidth(value === '5' ? '320' : value);
                      }
                    }}
                  />
                  {Number(cardwidth) > 4 && (
                    <div className="mTop8 valignWrapper">
                      <Input
                        value={this.state.customWidth}
                        type="number"
                        min={200}
                        max={800}
                        onChange={e => this.setState({ customWidth: e })}
                        onBlur={e => {
                          const value = Math.max(200, Math.min(800, e.target.value));
                          this.setState({ customWidth: value });
                          handleChangeCoverWidth(value);
                        }}
                      />
                      <span className="Font13 mLeft10">px</span>
                    </div>
                  )}
                </div>
              </div>
            )}
        </SettingCon>
      </div>
    );
  }
}
