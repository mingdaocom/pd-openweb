import React from 'react';
import { Dropdown, Icon } from 'ming-ui';
import { filterAndFormatterControls } from 'src/pages/worksheet/views/util';
import { COVER_DISPLAY_MODE, COVER_DISPLAY_POSITION } from '../util';
import styled from 'styled-components';
import { isGalleryOrBoard } from 'src/pages/worksheet/constants/common';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import { isIframeControl } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import cx from 'classnames';
import _ from 'lodash';
const SettingCon = styled.div`
  .ming.Dropdown.isDelete .Dropdown--input .value,
  .dropdownTrigger .Dropdown--input .value {
    color: red;
  }
  .ming.Dropdown.isDelete .Dropdown--border,
  .dropdownTrigger .Dropdown--border {
    border-color: red;
  }
`;
const CoverSettingCon = styled.div`
  margin-top: 20px;
  display: flex;
  & > div {
    flex: 1;
    .ming.Dropdown {
      margin-top: 10px;
    }
  }
`;
const SwitchStyle = styled.div`
  display: inline-block;
  .switchText {
    margin-right: 6px;
    line-height: 24px;
  }
  .icon {
    vertical-align: middle;
    &-ic_toggle_on {
      color: #00c345;
    }
    &-ic_toggle_off {
      color: #bdbdbd;
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
  render() {
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
        <div className="title Font13 bold">
          {_l('封面')}
          <div className="configSwitch Right">
            <SwitchStyle>
              <div className="switchText InlineBlock Normal Gray_9e">{_l('允许点击查看')}</div>
              {/* //空(默认没key)或者"1"：允许 "2"：不允许 */}
              <Icon
                icon={!!COVER_IMAGE_PREVIEW[opencover] ? 'ic_toggle_on' : 'ic_toggle_off'}
                className="Font24 Hand"
                onClick={() => {
                  handleChangeOpencover(!!COVER_IMAGE_PREVIEW[opencover] ? '2' : '1');
                }}
              />
            </SwitchStyle>
          </div>
        </div>
        <SettingCon>
          <div className="settingContent mTop10">
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
            {/* 封面图片 */}
            <CoverSettingCon>
              <div className="" style={{ width: '48%', marginRight: '4%' }}>
                {/* coverposition 封面位置  上 左 右*/}
                <div className="subTitle">{_l('显示位置')}</div>
                <Dropdown
                  disabled={coverValue === 'notDisplay'}
                  data={
                    // 仅看板视图、画廊视图封面 支持上
                    isGalleryOrBoard(viewType)
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
        </SettingCon>
      </div>
    );
  }
}
