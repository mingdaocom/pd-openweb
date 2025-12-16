import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import sheetApi from 'src/api/worksheet';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import Input from 'src/pages/worksheet/common/CreateCustomBtn/components/Inputs';
import { DEF_R_TYPES, DEF_TYPES } from 'src/pages/worksheet/common/CreateCustomBtn/config';
import SortColumns from 'src/pages/worksheet/components/SortColumns';

const AddButton = styled.div`
  display: inline-flex;
  padding: 0 10px;
  height: 32px;
  max-width: 100%;
  border: 1px solid #eaeaea;
  border-radius: 15px;
  background-color: #ffffff;
  color: #1677ff;
  transition: all 0.3s;
  &:hover {
    color: #1079cc;
  }
`;

const SortColumnsWrap = styled.div`
  width: 300px;
  box-shadow:
    0 4px 20px #00000021,
    0 2px 6px #0000001a;
  border-radius: 3px;
  .searchBar {
    padding: 0 10px;
  }
  .sortColumnWrap {
    margin-top: 2px !important;
    padding: 6px 0;
    border-radius: 3px;
  }
  .quickOperate {
    display: none !important;
  }
  .columnCheckList {
    max-height: 360px !important;
  }
`;

const DefaultValueInputWrap = styled.div`
  width: 100%;
  .optionsCon {
    border-radius: 4px;
    padding: 0 10px;
    border: 1px solid #ccc;
    background: #ffffff;
    height: 36px;
    line-height: 36px;
    width: 100%;
    position: relative;
    .txt {
      display: block;
      width: 100%;
      line-height: 36px;
      height: 100%;
    }
  }
  .settingItemTitle {
    display: none;
  }
  & > div {
    margin-top: 0;
  }
  &.notOther {
    & > div {
      & > div {
        & > div:nth-child(1) {
          width: calc(100%) !important;
          border-radius: 4px !important;
        }
      }
    }
    .tagInputarea .tagInputareaIuput,
    .CityPicker-input-container input {
      border-radius: 4px !important;
    }
    .ant-input {
      width: calc(100%) !important;
      border-radius: 4px !important;
      &:hover {
        border-color: #ccc !important;
      }
    }
    .ant-input:focus,
    .ant-input-focused {
      border-color: #1677ff !important;
      box-shadow: none !important;
    }
    .selectOtherFieldContainer {
      display: none;
      & > div {
        display: none;
      }
    }
  }
`;

const FILTER_TYPES = DEF_TYPES.concat(DEF_R_TYPES);

function DefaultValue(props) {
  const { projectId, appId, btnId, worksheetId, controls, config, onChangeConfig } = props;
  const { temporaryWriteControls = [], isEmptyWriteControls } = config || {};
  const [showControls, setShowControls] = useState(temporaryWriteControls.map(c => c.controlId));

  useEffect(() => {
    if (btnId && _.isEmpty(temporaryWriteControls) && !isEmptyWriteControls) {
      sheetApi
        .getWorksheetBtnByID({
          appId,
          worksheetId,
          btnId,
        })
        .then(data => {
          const { writeControls } = data;
          changeTemporaryWriteControls(writeControls);
          setShowControls(writeControls.map(c => c.controlId));
        });
    }
  }, [btnId]);

  const changeTemporaryWriteControls = writeControls => {
    onChangeConfig({
      ...config,
      controls,
      temporaryWriteControls: writeControls,
      isEmptyWriteControls: writeControls.length ? undefined : true,
    });
  };

  const defaultValueInput = data => {
    const control = _.find(controls, { controlId: data.controlId });

    if (_.isEmpty(control)) return null;

    const getDefsource = item => {
      if (!item.defsource) return item.defsource;
      if ([9, 10, 11].includes(control.type)) {
        const defsource = safeParse(item.defsource, 'array');
        const list = safeParse(_.get(defsource, `[0].staticValue`));
        if (!list || !_.isArray(list)) {
          return JSON.stringify([{ ...defsource[0], staticValue: '' }]);
        }
        return JSON.stringify(
          list.map(o => {
            return { ...defsource[0], staticValue: o };
          }),
        );
      }
      return item.defsource;
    };

    const advancedSetting = {
      ..._.omit(control.advancedSetting, ['dynamicsrc', 'defaultfunc']),
      defaulttype: '',
    };

    if (control.type === 34 && data.defsource) {
      advancedSetting.defaulttype = '0';
    }

    return (
      <div className="mBottom15" key={control.controlId}>
        <div className="mBottom10 Font13">{control.controlName}</div>
        <div className="valignWrapper">
          <DefaultValueInputWrap
            className={cx({ notOther: ![26, 15, 16, 17, 18, 46].includes(control.type) || control.type === 34 })}
          >
            <Input
              item={data}
              data={{
                ...control,
                advancedSetting: {
                  ...advancedSetting,
                  defsource: getDefsource(data),
                },
              }}
              writeObject={1}
              allControls={controls}
              globalSheetInfo={{
                projectId,
                appId,
                worksheetId,
              }}
              titleControl={(_.get(control, ['relationControls']) || []).find(o => o.attribute === 1)}
              onChange={data => {
                const { advancedSetting = {} } = data;
                let { defsource } = advancedSetting;
                if ([9, 10, 11].includes(data.type)) {
                  const dataDefsource = safeParse(defsource, 'array');
                  defsource = JSON.stringify([
                    {
                      ...dataDefsource[0],
                      staticValue: JSON.stringify(dataDefsource.map(o => o.staticValue)),
                    },
                  ]);
                }
                const newCells = temporaryWriteControls.map(c => {
                  if (c.controlId === control.controlId) {
                    return {
                      ...c,
                      defsource,
                    };
                  }
                  return c;
                });
                changeTemporaryWriteControls(newCells);
              }}
            />
          </DefaultValueInputWrap>
          <Icon
            className="Font18 Gray_9e pointer mLeft5"
            icon="delete_12"
            onClick={() => {
              const writeControls = temporaryWriteControls.filter(c => c.controlId !== control.controlId);
              changeTemporaryWriteControls(writeControls);
              setShowControls(writeControls.map(c => c.controlId));
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="settingItem">
      <div className="settingTitle valignWrapper mBottom10">
        <span>{_l('默认值')}</span>
        <Tooltip title={_l('通过点击按钮创建记录时，将会优先生效此处配置的默认值')}>
          <Icon className="mLeft5 Gray_9e Font16 pointer" icon="help" />
        </Tooltip>
      </div>
      {temporaryWriteControls.map(control => defaultValueInput(control))}
      <Trigger
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
        getPopupContainer={() => document.querySelector('.editWidgetDialogWrap .settingsBox')}
        popup={
          <SortColumnsWrap>
            <SortColumns
              layout={2}
              noShowCount={true}
              noempty={false}
              dragable={false}
              showControls={showControls}
              columns={controls.filter(c => {
                if (ALL_SYS.includes(c.controlId)) {
                  return false;
                }
                // 关联表列表
                if (c.type === 29 && _.get(c, ['advancedSetting', 'showtype']) === '2') {
                  return false;
                }
                return FILTER_TYPES.includes(c.type);
              })}
              onChange={({ newShowControls }) => {
                const addControlId = newShowControls.filter(id => !showControls.includes(id))[0];
                const removeControlId = showControls.filter(id => !newShowControls.includes(id))[0];
                setShowControls(newShowControls);
                if (addControlId) {
                  const control = _.find(controls, { controlId: addControlId });
                  const data = {
                    controlId: control.controlId,
                    type: 2,
                    defsource: undefined,
                  };
                  changeTemporaryWriteControls(temporaryWriteControls.concat(data));
                }
                if (removeControlId) {
                  changeTemporaryWriteControls(temporaryWriteControls.filter(c => c.controlId !== removeControlId));
                }
              }}
            />
          </SortColumnsWrap>
        }
      >
        <AddButton className="valignWrapper pointer">
          <Icon className="Font17" icon="add" />
          <span className="bold">{_l('字段默认值')}</span>
        </AddButton>
      </Trigger>
    </div>
  );
}

export default DefaultValue;
