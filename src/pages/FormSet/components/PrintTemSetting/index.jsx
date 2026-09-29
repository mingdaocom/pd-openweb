import React, { Fragment, useCallback, useEffect } from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Input, Radio, Tooltip } from 'ming-ui/antd-components';
import sheetAjax from 'src/api/worksheet';
import DynamicDefaultValue from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { renderText as renderCellText } from 'src/utils/domain/control/display';
import { transferValue } from 'src/utils/domain/control/value';

const getExportNameTypes = () => [
  {
    label: _l('默认'),
    value: '0',
  },
  {
    label: _l('自定义'),
    value: '1',
  },
];

export const PRINT_TEMPLATE_ADVANCE_KEYS = {
  exportNameType: 'export_type',
  exportName: 'export_name',
};

const ALLOW_SYS_IDS = ['ownerid', 'caid', 'uaid'];

const DefaultName = styled.div`
  height: 36px;
  background: var(--color-background-secondary);
  border-radius: 3px;
  border: 1px solid var(--color-border-primary);
  width: 100%;
  padding: 0 9px;
  display: flex;
  align-items: center;
  span {
    height: 24px;
    background: var(--color-border-secondary);
    border-radius: 18px;
    padding: 0 13px;
    line-height: 24px;
    display: inline-block;
  }
`;

const PrintTemplateDynamicValue = styled.div`
  .tagInputarea {
    width: calc(100% - 36px);
  }
  .tagInputareaIuput {
    box-sizing: border-box;
    height: 36px;
    min-height: 36px;
  }
`;

export const getFieldsFromDefsource = defsource => {
  let fields = '';

  safeParse(defsource || '[]').forEach(item => {
    const { cid, rcid, staticValue } = item;

    if (cid) {
      fields += rcid ? `$${cid}~${rcid}$` : `$${cid}$`;
    } else {
      fields += staticValue;
    }
  });

  return fields;
};

export const getAdvanceValue = (advanceSettings = [], key, defaultValue) => {
  const setting = _.find(advanceSettings, i => i.key === key);

  return _.isUndefined(setting?.value) ? defaultValue : setting.value;
};

export const isCustomNameEmpty = (advanceSettings = [], typeKey, nameKey) => {
  return getAdvanceValue(advanceSettings, typeKey, '0') === '1' && !getAdvanceValue(advanceSettings, nameKey);
};

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

  const advanceMap = _.keyBy(advanceSettings, 'key');
  const type = advanceMap[PRINT_TEMPLATE_ADVANCE_KEYS.exportNameType]?.value || '0';
  const exportName = advanceMap[PRINT_TEMPLATE_ADVANCE_KEYS.exportName]?.value;
  const enableEmptyPlaceholder = !!Number(advanceMap.enableEmptyPlaceholder?.value);
  const emptyPlaceholderMode = advanceMap.emptyPlaceholderMode?.value;
  const titleControl = _.find(controls, i => i.attribute === 1);

  const getExampleData = useCallback(() => {
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
  }, [updateExampleData, worksheetId]);

  useEffect(() => {
    if (_.isEmpty(exampleData)) {
      getExampleData();
    }
  }, [exampleData, getExampleData]);

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

        return _l('未命名');
    }
  };

  const getPreviewText = text => {
    return text ? text.replace(/\$(.*?)\$/g, (_, key) => getValue(key)) : '';
  };

  const onChangeName = (newData, key) => {
    const { defsource } = getAdvanceSetting(newData);
    const fields = getFieldsFromDefsource(defsource);

    onChangeAdvance({ key, value: fields });
  };

  const onChangeExportName = newData => {
    onChangeName(newData, PRINT_TEMPLATE_ADVANCE_KEYS.exportName);
  };

  const onChangeAdvance = value => {
    onChangeAdvances([value]);
  };

  const onChangeAdvances = values => {
    const valueMap = _.keyBy(values, 'key');
    const existingKeys = advanceSettings.map(item => item.key);
    const newValues = values.filter(item => !existingKeys.includes(item.key));

    onChange({
      advanceSettings: advanceSettings.map(item => valueMap[item.key] || item).concat(newValues),
    });
  };

  const onChangeType = (item, typeKey, nameKey, defaultName) => {
    const currentType = getAdvanceValue(advanceSettings, typeKey, '0');

    if (currentType === item.value) return;
    const values = [{ key: typeKey, value: item.value }];

    if (item.value === '1' && !getAdvanceValue(advanceSettings, nameKey)) {
      values.unshift({ key: nameKey, value: defaultName });
    }

    onChangeAdvances(values);
  };

  const renderNameConfig = ({
    title,
    types,
    typeValue,
    nameValue,
    defaultContent,
    defaultName,
    typeKey,
    nameKey,
    onNameChange,
    previewText,
  }) => {
    const isDefaultType = typeValue === '0';

    return (
      <Fragment>
        <div className="mTop24 Font13 bold mBottom16">{title}</div>
        <div className="mBottom14">
          {types.map(item => (
            <Radio
              key={item.value}
              value={item.value}
              checked={typeValue === item.value}
              onChange={() => onChangeType(item, typeKey, nameKey, defaultName)}
            >
              {item.label}
            </Radio>
          ))}
        </div>
        <div>
          {isDefaultType ? (
            defaultContent
          ) : (
            <PrintTemplateDynamicValue>
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
                    defsource: JSON.stringify(transferValue(nameValue)),
                    defaulttype: '',
                  },
                  type: 2,
                }}
                allControls={controls.filter(i => i.controlId.length > 23 || ALLOW_SYS_IDS.includes(i.controlId))}
                onChange={onNameChange}
              />
            </PrintTemplateDynamicValue>
          )}
        </div>
        <div className="Font13 textTertiary mLeft8 mTop10">
          {_l('预览：')}
          {previewText}
        </div>
      </Fragment>
    );
  };

  return (
    <Fragment>
      <div className="tiTop mTop32">{_l('3.设置')}</div>
      <div className="mTop24 Font13 bold mBottom16">{_l('模版名称')}</div>
      <Input className="w100" value={templateName} onChange={event => onChange({ templateName: event.target.value })} />
      {renderNameConfig({
        title: _l('导出文件名称'),
        types: getExportNameTypes(),
        typeValue: type,
        nameValue: exportName,
        defaultName: getDefaultExportName(),
        typeKey: PRINT_TEMPLATE_ADVANCE_KEYS.exportNameType,
        nameKey: PRINT_TEMPLATE_ADVANCE_KEYS.exportName,
        onNameChange: onChangeExportName,
        previewText: getPreviewText(type === '0' ? getDefaultExportName() : exportName),
        defaultContent: (
          <DefaultName className="textTertiary Font12">
            <span className="InlineFlex flex-shrink-0">{_l('模版名称')}</span>_
            {titleControl && (
              <Fragment>
                <span className="WordBreak overflow_ellipsis">{titleControl.controlName}</span>_
              </Fragment>
            )}
            <span className="InlineFlex flex-shrink-0">{_l('导出时间')}</span>
          </DefaultName>
        ),
      })}
      <div className="mTop24 Font13 bold mBottom16">{_l('操作')}</div>
      <div className="checkBoxCon flexColumn">
        <Checkbox
          className="Font14"
          checked={!allowDownloadPermission}
          onChange={() =>
            onChange({
              allowDownloadPermission: Number(!allowDownloadPermission),
            })
          }
        >
          {_l('允许成员下载打印文件')}
        </Checkbox>
        {md.global.Config.EnableDocEdit !== false && (
          <Checkbox
            className="Font14 mTop12"
            checked={allowEditAfterPrint}
            onChange={() =>
              onChange({
                allowEditAfterPrint: !allowEditAfterPrint,
              })
            }
          >
            {_l('允许编辑后再打印')}
          </Checkbox>
        )}
        <Checkbox
          className="Font14 mTop12"
          checked={enableEmptyPlaceholder}
          onChange={() =>
            onChangeAdvance({
              key: 'enableEmptyPlaceholder',
              value: Number(!enableEmptyPlaceholder),
            })
          }
        >
          {_l('空值填充占位符')}
          <Tooltip
            placement="bottom"
            title={_l('开启后，字段为空时将打印占位符内容，用于保持打印板式完整，避免空白显示')}
          >
            <Icon icon="help" className="mTop2 mLeft5 Font14 textTertiary" />
          </Tooltip>
        </Checkbox>
        {enableEmptyPlaceholder && (
          <div className="pLeft26">
            <Input
              className="mTop10 w100"
              placeholder={_l('请输入占位符')}
              value={emptyPlaceholderMode}
              onChange={event => {
                onChangeAdvance({ key: 'emptyPlaceholderMode', value: event.target.value });
              }}
            />
          </div>
        )}
      </div>
    </Fragment>
  );
}

export default PrintTemSetting;
