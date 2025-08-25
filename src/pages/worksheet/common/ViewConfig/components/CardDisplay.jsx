import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import Abstract from './Abstract';
import CoverSetting from './CoverSettingCon';
import DisplayControl from './DisplayControl';
import TitleControl from './TitleControl';

const isVisible = control => {
  let { fieldPermission = '111' } = control;
  const [visible] = fieldPermission.split('');
  if (visible === '0') {
    return false;
  }
  return true;
};

export default function CardDisplay(props) {
  const { visible, worksheetId, showControls, handleDisplayChange, advancedSetting } = props;
  const [{ controls, coverColumns }, setInfo] = useState({
    controls: [],
    availableControls: [],
    coverColumns: [],
  });
  const excludeTitleControls = controls => controls.filter(item => item.attribute !== 1);
  // 默认取标题控件 和 前三个控件
  const getDefaultShowControls = controls => {
    return controls.slice(0, 2).map(({ controlId }) => controlId);
  };

  useEffect(() => {
    if (!worksheetId) return;
    worksheetAjax.getWorksheetInfo({ worksheetId, getTemplate: true }).then(data => {
      const controls = _.get(data, ['template', 'controls']);
      const excludedTitle = excludeTitleControls(controls);
      const defaultShowControls = getDefaultShowControls(excludedTitle);
      const coverColumns = controls.filter(l => isVisible(l)).filter(c => !!c.controlName);
      setInfo({
        sheetInfo: data,
        controls,
        availableControls: excludedTitle,
        showControls: defaultShowControls,
        controlsSorts: excludedTitle.map(({ controlId }) => controlId),
        coverColumns: coverColumns,
      });
    });
  }, [worksheetId]);

  if (!visible) return null;

  return (
    <React.Fragment>
      <TitleControl
        {...props}
        worksheetControls={controls}
        className="mBottom32"
        advancedSetting={advancedSetting}
        isCard
        handleChange={value => {
          handleDisplayChange({
            advancedSetting: {
              ...advancedSetting,
              viewtitle: value,
            },
          });
        }}
      />
      {/* abstract：摘要控件ID */}
      <Abstract
        fromRelative={true} // 关联表的相关设置
        worksheetControls={controls}
        advancedSetting={advancedSetting}
        handleChange={value => {
          handleDisplayChange({
            advancedSetting: {
              ...advancedSetting,
              ...value,
            },
          });
        }}
      />
      {/* 显示字段 */}
      <DisplayControl
        {...props}
        text={''}
        fromRelative={true} // 关联表的相关设置
        worksheetControls={controls}
        displayControls={showControls}
        columns={controls}
        // min1msg={_l('至少显示一列')}
        handleChange={data => {
          const { showControlName } = data;
          handleDisplayChange({ showControlName });
        }}
        handleChangeSort={({ newControlSorts, newShowControls }) => {
          //层级视图 关联表 支持显隐 以及排序
          handleDisplayChange({ showControls: newShowControls, controlsSorts: newControlSorts });
        }}
      />
      {/* 封面图片 */}
      <CoverSetting
        {...props}
        coverColumns={coverColumns}
        viewType={'2'} // 层级视图
        fromRelative={true} // 关联表的相关设置
        advancedSetting={advancedSetting}
        worksheetControls={controls}
        // 是否显示
        handleChangeIsCover={value =>
          handleDisplayChange({
            coverCid: value === 'notDisplay' ? '' : value,
          })
        }
        // 允许点击查看
        handleChangeOpencover={value => {
          handleDisplayChange({
            advancedSetting: {
              ...advancedSetting,
              opencover: value,
            },
          });
        }}
        handleChangeCoverWidth={value => {
          handleDisplayChange({
            advancedSetting: {
              ...advancedSetting,
              cardwidth: value,
            },
          });
        }}
        handleChangeCoverStyle={value => {
          handleDisplayChange({
            advancedSetting: {
              ...advancedSetting,
              coverstyle: value,
            },
          });
        }}
      />
    </React.Fragment>
  );
}
