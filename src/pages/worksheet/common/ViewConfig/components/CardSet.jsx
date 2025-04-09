import React, { Fragment } from 'react';
import Abstract from './Abstract';
import CoverSetting from './CoverSettingCon';
import DisplayControl from './DisplayControl';
import TitleControl from './TitleControl';
import _ from 'lodash';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';

export default function CardSet(props) {
  const { appId, view, updateCurrentView } = props;
  const { advancedSetting } = view;
  const info = { ...view, appId, editAttrs: ['advancedSetting'] };
  return (
    <Fragment>
      <TitleControl
        {...props}
        advancedSetting={advancedSetting}
        isCard
        handleChange={value => {
          updateCurrentView({ ...info, advancedSetting: { viewtitle: value }, editAdKeys: ['viewtitle'] });
        }}
      />
      {/* abstract：摘要控件ID */}
      <div className="mTop32">
        <Abstract
          {...props}
          advancedSetting={advancedSetting}
          handleChange={value => {
            updateCurrentView({ ...info, advancedSetting: value, editAdKeys: _.keys(value) });
          }}
        />
      </div>
      {/* 显示字段 */}
      <DisplayControl
        {...props}
        handleChange={data => {
          updateCurrentView({ ...view, appId, ...data }, false);
        }}
        handleChangeSort={({ newControlSorts, newShowControls }) => {
          if (['board', 'gallery'].includes(VIEW_DISPLAY_TYPE[view.viewType])) {
            let showcount = _.get(view, 'advancedSetting.showcount');
            showcount = !!showcount
              ? newShowControls.length <= 0
                ? undefined
                : Number(showcount) > newShowControls.length
                  ? newShowControls.length
                  : showcount
              : undefined;
            updateCurrentView(
              {
                ...view,
                appId,
                controlsSorts: newControlSorts,
                displayControls: newShowControls,
                advancedSetting: {
                  showcount,
                },
                editAttrs: ['advancedSetting', 'controlsSorts', 'displayControls'],
                editAdKeys: ['showcount'],
              },
              false,
            );
          } else {
            updateCurrentView(
              {
                ...view,
                appId,
                controlsSorts: newControlSorts,
                displayControls: newShowControls,
                editAttrs: ['controlsSorts', 'displayControls'],
              },
              false,
            );
          }
        }}
        canShowCount={['board', 'gallery'].includes(VIEW_DISPLAY_TYPE[view.viewType])}
      />
      {/* 封面图片 */}
      <CoverSetting
        {...props}
        advancedSetting={advancedSetting}
        // 是否显示
        handleChangeIsCover={value =>
          updateCurrentView({
            ...view,
            appId,
            coverCid: value === 'notDisplay' ? '' : value,
            editAttrs: ['coverCid'],
          })
        }
        handleChangeCoverWidth={value => {
          updateCurrentView({
            ...view,
            appId,
            advancedSetting: { cardwidth: value },
            editAdKeys: ['cardwidth'],
            editAttrs: ['advancedSetting'],
          });
        }}
        // 允许点击查看
        handleChangeOpencover={value => {
          updateCurrentView({
            ...view,
            appId,
            advancedSetting: { opencover: value },
            editAdKeys: ['opencover'],
            editAttrs: ['advancedSetting'],
          });
        }}
        handleChangeCoverStyle={value => {
          updateCurrentView({
            ...view,
            appId,
            advancedSetting: { coverstyle: value },
            editAdKeys: ['coverstyle'],
            editAttrs: ['advancedSetting'],
          });
        }}
      />
    </Fragment>
  );
}
