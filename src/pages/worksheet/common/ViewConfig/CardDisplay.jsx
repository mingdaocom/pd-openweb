import React, { useState, useEffect } from 'react';
import worksheetAjax from 'src/api/worksheet';
import { Abstract, CoverSetting, DisplayControl } from './components';
import _ from 'lodash';

const isVisible = control => {
  let { fieldPermission = '111' } = control;
  const [visible, editable, canAdd] = fieldPermission.split('');
  if (visible === '0') {
    return false;
  }
  return true;
};

export default function CardDisplay(props) {
  const {
    visible,
    worksheetId,
    coverType,
    coverCid,
    showControlName = false,
    showControls,
    handleDisplayChange,
    advancedSetting,
  } = props;
  if (!visible) return null;
  const [{ sheetInfo, availableControls, coverColumns }, setInfo] = useState({
    sheetInfo: {},
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
        availableControls: excludedTitle,
        showControls: defaultShowControls,
        controlsSorts: excludedTitle.map(({ controlId }) => controlId),
        coverColumns: coverColumns,
      });
    });
  }, [worksheetId]);
  return (
    <React.Fragment>
      {/* abstract：摘要控件ID */}
      <Abstract
        fromRelative={true} // 关联表的相关设置
        worksheetControls={availableControls}
        advancedSetting={advancedSetting}
        handleChange={value => {
          handleDisplayChange({
            advancedSetting: {
              ...advancedSetting,
              abstract: value,
            },
          });
        }}
      />
      {/* 显示字段 */}
      <DisplayControl
        {...props}
        text={''}
        fromRelative={true} // 关联表的相关设置
        worksheetControls={availableControls}
        displayControls={showControls}
        columns={availableControls}
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
        worksheetControls={availableControls}
        // 是否显示
        handleChangeIsCover={value =>
          handleDisplayChange({
            coverCid: value === 'notDisplay' ? '' : value,
          })
        }
        // 显示位置
        handleChangePosition={(value, coverTypeValue) => {
          handleDisplayChange(
            {
              coverType: coverTypeValue,
              advancedSetting: {
                ...advancedSetting,
                coverposition: value,
              },
            },
            false,
          );
        }}
        // 显示方式
        handleChangeType={value => {
          handleDisplayChange({ coverType: value }, false);
        }}
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
      />
    </React.Fragment>
  );
}
