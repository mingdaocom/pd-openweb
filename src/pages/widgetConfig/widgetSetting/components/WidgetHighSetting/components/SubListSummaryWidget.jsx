import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Dropdown, Icon } from 'ming-ui';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import { getSummaryInfo } from 'src/utils/record';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import AddFields from '../../CustomEvent/CustomAction/AddFields';

const SubListSummaryDialog = styled(Dialog)`
  .summaryContent {
    .summaryItem {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      .summaryControlName {
        flex: 1;
        margin-right: 12px;
        height: 36px;
        line-height: 36px;
        border-radius: 3px;
        background: var(--color-background-tertiary);
        border: 1px solid var(--color-border-primary);
      }
      i {
        color: var(--color-text-tertiary);
        &:hover {
          color: var(--color-error);
        }
      }
    }
  }
`;

export default function SubListSummaryWidget(props) {
  const { data, controls = [], onChange, onClose } = props;
  const { showControls = [] } = data;
  const originStatisticsSetting = getAdvanceSetting(data, 'statisticsseting') || [];
  const [settingList, setSettingList] = useState(originStatisticsSetting);

  useEffect(() => {
    setSettingList(originStatisticsSetting);
  }, []);

  const filterControls = filterOnlyShowField(controls)
    .filter(({ controlId, type, sourceControlType, strDefault }) => {
      if (!_.includes(showControls, controlId)) return false;
      let currentType = type === 30 ? sourceControlType : type;
      if (
        _.includes([22, 25, 33, 34, 43, 45, 47, 49, 51, 52, 54, 10010], currentType) ||
        (type === 30 && strDefault === '10')
      )
        return false;

      return true;
    })
    .map(i => ({ ...i, sectionId: '', relateControls: [] }));

  const getTypeList = control => {
    if (!control) return [];
    let type = control.sourceControlType || control.type;
    const summaryInfo = getSummaryInfo(type, control);
    // 过滤【不显示】
    return (summaryInfo.list || []).filter(_.identity).filter(item => !(item.type === 'COMMON' && !item.value));
  };

  const filterSettingControls = filterControls.filter(s => !_.find(settingList, r => r.id === s.controlId));

  return (
    <SubListSummaryDialog
      visible
      title={_l('统计设置')}
      description={_l('设置需要统计的字段及其统计方式')}
      width={480}
      onCancel={onClose}
      onOk={() => {
        const filterDeletedControls = settingList.filter(s => _.find(filterControls, c => c.controlId === s.id));
        onChange(
          handleAdvancedSettingChange(data, {
            statisticsseting: _.isEmpty(filterDeletedControls) ? '' : JSON.stringify(filterDeletedControls),
          }),
        );
        onClose();
      }}
    >
      <div className="summaryContent flexColumn">
        {settingList.length > 0 && (
          <Fragment>
            {settingList.map((s, index) => {
              const currentControl = _.find(filterControls, c => c.controlId === s.id);
              if (!currentControl) return null;
              const summaryTypeOptions = getTypeList(currentControl)
                .filter(_.identity)
                .map(i => ({ text: i.label, value: i.value }));
              return (
                <div className="summaryItem">
                  <div className="summaryControlName overflow_ellipsis">
                    <span className="mLeft12 mRight12">{currentControl.controlName}</span>
                  </div>
                  <Dropdown
                    className="flex"
                    border
                    isAppendToBody
                    value={s.type}
                    data={summaryTypeOptions}
                    onChange={value => {
                      const newList = settingList.map((item, idx) => (idx === index ? { ...item, type: value } : item));
                      setSettingList(newList);
                    }}
                  />
                  <Icon
                    icon="delete1"
                    className="Font18 pointer mLeft14"
                    onClick={() => {
                      const newList = settingList.filter((i, idx) => idx !== index);
                      setSettingList(newList);
                    }}
                  />
                </div>
              );
            })}
          </Fragment>
        )}

        <AddFields
          showSys={true}
          handleClick={value => {
            const defaultType = _.get(_.head(getTypeList(value)), 'value');
            setSettingList(settingList.concat([{ id: value.controlId, type: defaultType }]));
          }}
          selectControls={filterSettingControls}
          disabled={!filterSettingControls.length}
        />
      </div>
    </SubListSummaryDialog>
  );
}
