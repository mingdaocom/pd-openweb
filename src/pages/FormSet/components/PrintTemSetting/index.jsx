import React, { Fragment, useEffect } from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Checkbox, Input, Radio } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting';
import DynamicDefaultValue from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { renderText as renderCellText } from 'src/utils/control';

const EXPORT_NAME_TYPE = [
  {
    label: _l('默认'),
    value: '0',
  },
  {
    label: _l('自定义'),
    value: '1',
  },
];

const ALLOW_SYS_IDS = ['ownerid', 'caid', 'uaid'];

const DefaultName = styled.div`
  height: 36px;
  background: #f8f8f8;
  border-radius: 3px;
  border: 1px solid #dddddd;
  width: 100%;
  padding: 0 9px;
  display: flex;
  align-items: center;
  span {
    height: 24px;
    background: #eaeaea;
    border-radius: 18px;
    padding: 0 13px;
    line-height: 24px;
    display: inline-block;
  }
`;

function PrintTemSetting(props) {
  const {
    projectId,
    worksheetId,
    exampleData,
    templateName,
    controls = [],
    allowEditAfterPrint,
    advanceSettings = [],
    allowDownloadPermission,
    onChange = () => {},
    updateExampleData = () => {},
  } = props;

  const type =
    _.get(
      _.find(advanceSettings, i => i.key === 'export_type'),
      'value',
    ) || '0';
  const exportName = _.get(
    _.find(advanceSettings, i => i.key === 'export_name'),
    'value',
  );
  const titleControl = _.find(controls, i => i.attribute === 1);

  useEffect(() => {
    if (_.isEmpty(exampleData)) {
      getExampleData();
    }
  }, []);

  const getExampleData = () => {
    sheetAjax
      .getFilterRows({
        fastFilters: [],
        filterControls: [],
        getType: 7,
        isGetWorksheet: false,
        keyWords: '',
        pageIndex: 1,
        pageSize: 1,
        searchType: 1,
        sortControls: [],
        status: 1,
        worksheetId,
      })
      .then(res => {
        updateExampleData(_.get(res, 'data[0]'));
      });
  };

  const getDefaultExportName = () => {
    return `$temp-name$_${titleControl ? '$' + titleControl.controlId + '$_' : ''}$print-time$`;
  };

  const getValue = key => {
    switch (key) {
      case 'temp-name':
        return templateName;
      case 'print-time':
        return moment(new Date()).format('YYYYMMDD');
      default:
        const value = _.get(exampleData, key);
        const control = controls.find(l => l.controlId === key);

        if (value) return renderCellText({ ...control, value: value });

        return 'undefined';
    }
  };

  const getPreviewText = () => {
    const text = type === '0' ? getDefaultExportName() : exportName;

    return text ? text.replace(/\$(.*?)\$/g, (_, key) => getValue(key)) : '';
  };

  const onChangeExportName = newData => {
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

    onChangeAdvance({ key: 'export_name', value: fields });
  };

  const onChangeAdvance = value => {
    const exist = _.find(advanceSettings, i => i.key === value.key);
    onChange({
      advanceSettings: exist
        ? advanceSettings.map(item => {
            return value.key === item.key ? value : item;
          })
        : [...advanceSettings, value],
    });
  };

  const onChangeType = item => {
    if (type === item.type) return;
    if (type === 1) onChangeAdvance({ key: 'export_name', value: getDefaultExportName() });

    onChangeAdvance({ key: 'export_type', value: item.value });
  };

  return (
    <Fragment>
      <div className="tiTop mTop32">{_l('3.设置')}</div>
      <div className="mTop24 Font13 bold mBottom16">{_l('模版名称')}</div>
      <Input className="w100" value={templateName} onChange={value => onChange({ templateName: value })} />
      <div className="mTop24 Font13 bold mBottom16">{_l('导出文件名称')}</div>
      <div className="mBottom14">
        {EXPORT_NAME_TYPE.map(item => (
          <Radio key={item.value} value={item.value} checked={type === item.value} onClick={() => onChangeType(item)}>
            {item.label}
          </Radio>
        ))}
      </div>
      <div>
        {type === '0' ? (
          <DefaultName className="Gray_9e Font12">
            <span className="InlineFlex flex-shrink-0">{_l('模版名称')}</span>_
            {titleControl && (
              <Fragment>
                <span className="WordBreak overflow_ellipsis">{titleControl.controlName}</span>_
              </Fragment>
            )}
            <span className="InlineFlex flex-shrink-0">{_l('导出时间')}</span>
          </DefaultName>
        ) : (
          <DynamicDefaultValue
            from={12} // 为了异化默认值其他字段配置
            hideTitle={true}
            hideSearchAndFun={true}
            globalSheetInfo={{
              projectId,
              worksheetId,
            }}
            data={{
              advancedSetting: {
                defsource: JSON.stringify(transferValue(exportName)),
                defaulttype: '',
              },
              type: 2,
            }}
            allControls={controls.filter(i => i.controlId.length > 23 || ALLOW_SYS_IDS.includes(i.controlId))}
            onChange={onChangeExportName}
          />
        )}
      </div>
      <div className="Font13 Gray_9e mLeft8 mTop10">
        {_l('预览：')}
        {getPreviewText()}
      </div>
      <div className="mTop24 Font13 bold mBottom16">{_l('操作')}</div>
      <div className="checkBoxCon">
        <Checkbox
          className="Font14 mTop18"
          checked={!allowDownloadPermission}
          onClick={() => onChange({ allowDownloadPermission: Number(!allowDownloadPermission) })}
        >
          {_l('允许成员下载打印文件')}
        </Checkbox>
        {md.global.Config.EnableDocEdit !== false && (
          <Checkbox
            className="Font14 mTop18"
            checked={allowEditAfterPrint}
            onClick={() => onChange({ allowEditAfterPrint: !allowEditAfterPrint })}
          >
            {_l('允许编辑后再打印')}
          </Checkbox>
        )}
      </div>
    </Fragment>
  );
}

export default PrintTemSetting;
