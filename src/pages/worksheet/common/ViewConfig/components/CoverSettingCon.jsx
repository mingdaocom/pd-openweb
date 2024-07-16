import React from 'react';
import { Dropdown, Icon, Input } from 'ming-ui';
import { filterAndFormatterControls } from 'src/pages/worksheet/views/util';
import { COVER_DISPLAY_MODE, COVER_DISPLAY_POSITION } from '../util';
import styled from 'styled-components';
import { isGalleryOrBoardOrStructureOrDetail } from 'src/pages/worksheet/constants/common';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import { isIframeControl } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import cx from 'classnames';
import _ from 'lodash';
import { SwitchStyle } from '../style';

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
        border-color: #2196f3;
      }
      &:focus {
        border-color: #2196f3;
      }
    }
  }
`;
const CoverSettingCon = styled.div`
  margin-top: 20px;
  display: flex;
  & > div {
    flex: 1;
    .ming.Dropdown {
      margin-top: 8px;
    }
  }
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
    this.state = {
      cardwidth: _.get(!this.props.fromRelative ? this.props.view : this.props, 'advancedSetting.cardwidth'),
    };
  }

  onChangeWidth = e => {
    const { handleChangeCoverWidth } = this.props;
    let value = e.target.value.trim();
    if (value < 240) {
      value = 240;
    }
    if (value > 360) {
      value = 360;
    }
    handleChangeCoverWidth(value);
    this.setState({
      cardwidth: value,
    });
  };
  render() {
    const { cardwidth = 280 } = this.state;
    const {
      coverColumns = [],
      currentSheetInfo,
      updateCurrentView,
      view,
      appId,
      handleChangePosition,
      handleChangeIsCover,
      handleChangeType,
      handleChangeOpencover,
      handleChangeCoverWidth,
      fromRelative,
    } = this.props;
    if (coverColumns.length <= 0) {
      return '';
    }
    let data = !fromRelative ? view : this.props;
    const { viewType, coverType, advancedSetting = {} } = data;
    const coverCid =
      VIEW_DISPLAY_TYPE.gallery === String(viewType)
        ? _.isUndefined(data.coverCid)
          ? _.get(currentSheetInfo, ['advancedSetting', 'coverid']) //默认取表单设置里的封面
          : data.coverCid
        : data.coverCid;
    const { coverposition, opencover = '1' } = advancedSetting;
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
    VIEW_DISPLAY_TYPE.gallery === String(viewType) && isIframeControl(coverControl || {});
    // 看板视图、表视图、层级视图封面设置项  默认右'0'
    // 画廊视图封面设置项 默认上'2'
    const coverPositiondata = coverposition || (VIEW_DISPLAY_TYPE.gallery === String(viewType) ? '0' : '2');
    // 显示位置为：左/右时，支持显示为圆形/正方形
    const coverTypeData = isBarCode
      ? COVER_DISPLAY_MODE.filter(item => item.value === 1) //扫码字段 只有完整显示
      : coverPositiondata !== '2'
      ? COVER_DISPLAY_MODE //显示位置为：左/右时，支持显示为圆形/正方形
      : isGalleryIframe
      ? COVER_DISPLAY_MODE.filter(item => item.value === 0) //画廊视图且封面为嵌入iframe(只支持上、填满)
      : COVER_DISPLAY_MODE.filter(item => item.value < 2);
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
                  handleChangePosition('2'); //上
                  handleChangeType(0); //填满
                }
                if ((coverControl || {}).type === 47) {
                  handleChangeType(1); //完整显示
                }
                if (coverValue !== value || isDelete) {
                  handleChangeIsCover(value);
                }
              }}
              placeholder={isDelete ? _l('控件已删除，请重新配置') : _l('不显示')}
            />
            <div className="configSwitch mTop10">
              <SwitchStyle className="flexRow alignItemsCenter">
                {/* //空(默认没key)或者"1"：允许 "2"：不允许 */}
                <Icon
                  icon={!!COVER_IMAGE_PREVIEW[opencover] ? 'ic_toggle_on' : 'ic_toggle_off'}
                  className="Font28 Hand"
                  onClick={() => {
                    handleChangeOpencover(!!COVER_IMAGE_PREVIEW[opencover] ? '2' : '1');
                  }}
                />
                <div className="switchText InlineBlock Normal mLeft10">{_l('允许点击查看')}</div>
              </SwitchStyle>
            </div>
            {/* 封面图片 */}
            <CoverSettingCon>
              <div className="" style={{ width: '48%', marginRight: '4%' }}>
                {/* coverposition 封面位置  上 左 右*/}
                <div className="subTitle">{_l('显示位置')}</div>
                <Dropdown
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
                  border
                  style={{ width: '100%' }}
                  onChange={value => {
                    if (coverPositiondata !== value) {
                      handleChangePosition(value, value === '2' && coverType >= 2 ? 0 : coverType);
                    }
                  }}
                />
              </div>
              <div className="" style={{ width: '48%' }}>
                <div className="subTitle">{_l('显示方式')}</div>
                <Dropdown
                  disabled={coverValue === 'notDisplay'}
                  style={{ width: '100%' }}
                  data={coverTypeData}
                  value={coverType}
                  border
                  onChange={value => {
                    if (coverType !== value) {
                      handleChangeType(value);
                    }
                  }}
                />
              </div>
            </CoverSettingCon>
          </div>
          {!!handleChangeCoverWidth &&
            ![VIEW_DISPLAY_TYPE.detail, VIEW_DISPLAY_TYPE.map].includes(String(viewType)) && (
              <div className="mTop24">
                <div className="title Font13 bold">
                  {VIEW_DISPLAY_TYPE.gallery === String(viewType) ? _l('卡片最小宽度') : _l('卡片宽度')}
                </div>
                <div className="Relative navWidth mTop8">
                  <Input
                    type="number"
                    manualRef={ref => (this.input = { current: ref })}
                    className="flex placeholderColor w100 pRight30"
                    value={cardwidth + ''}
                    placeholder={_l('请输入')}
                    onChange={value => {
                      this.setState({
                        cardwidth: value,
                      });
                    }}
                    onKeyDown={e => {
                      if (e.keyCode === 13) {
                        this.onChangeWidth(e);
                      }
                    }}
                    onBlur={e => {
                      this.onChangeWidth(e);
                    }}
                  />
                  <span className="Absolute unit Gray_9e">px</span>
                </div>
              </div>
            )}
        </SettingCon>
      </div>
    );
  }
}
