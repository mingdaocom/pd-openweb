import React, { Fragment } from 'react';
import _ from 'lodash';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import Abstract from './Abstract';
import CoverSetting from './CoverSettingCon';
import DisplayControl from './DisplayControl';
import TitleControl from './TitleControl';

export default function CardSet(props) {
  const { appId, view, updateCurrentView, worksheetControls } = props;
  const { advancedSetting } = view;
  const info = { ...view, appId, editAttrs: ['advancedSetting'] };
  const viewTypeText = VIEW_DISPLAY_TYPE[view.viewType];
  const getWorksheetControls = () => {
    if (['gunter'].includes(viewTypeText)) {
      const ids = [_.get(view, 'advancedSetting.begindate'), _.get(view, 'advancedSetting.enddate')].filter(o => !!o);
      return worksheetControls.filter(o => !ids.includes(o.controlId));
    }
    if (['calendar'].includes(viewTypeText)) {
      const items = safeParse(_.get(view, 'advancedSetting.calendarcids') || '[]');
      let ids = [];
      items.map(item => {
        ids.push(item.begin, item.end);
      });
      ids = ids.filter(o => !!o);
      return worksheetControls.filter(o => !ids.includes(o.controlId));
    }
    return worksheetControls;
  };
  return (
    <Fragment>
      {!['gunter', 'calendar'].includes(viewTypeText) && (
        <TitleControl
          {...props}
          advancedSetting={advancedSetting}
          isCard
          handleChange={value => {
            updateCurrentView({ ...info, advancedSetting: { viewtitle: value }, editAdKeys: ['viewtitle'] });
          }}
        />
      )}
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
        //卡片上的显示字段 displayControls  Gunter图卡片的显示字段 showControls
        view={{
          ...view,
          controlsSorts: ['gunter'].includes(viewTypeText) ? view.showControls : view.controlsSorts,
          displayControls: ['gunter'].includes(viewTypeText) ? view.showControls : view.displayControls,
        }}
        worksheetControls={getWorksheetControls()}
        text={['calendar', 'gunter'].includes(viewTypeText) ? _l('始终显示开始和结束时间字段') : ''}
        handleChange={data => {
          updateCurrentView({ ...view, appId, ...data }, false);
        }}
        handleChangeSort={({ newControlSorts, newShowControls }) => {
          if (['board', 'gallery'].includes(viewTypeText)) {
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
          } else if (['gunter'].includes(viewTypeText)) {
            updateCurrentView(
              {
                ...view,
                appId,
                showControls: newShowControls,
                editAttrs: ['showControls'],
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
        canShowCount={['board', 'gallery'].includes(viewTypeText)}
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
