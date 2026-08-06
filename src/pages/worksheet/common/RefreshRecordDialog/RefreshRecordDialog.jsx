import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import { arrayOf, shape } from 'prop-types';
import styled from 'styled-components';
import { Checkbox, Dialog, Icon, Support } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { FORM_HIDDEN_CONTROL_IDS, WORKFLOW_SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { FlexCenter } from 'src/pages/worksheet/components/Basics';
import { refreshRecord } from './dal';

const NewDialog = styled(Dialog)`
  .titleTag {
    height: 26px;
    line-height: 26px;
    padding: 0 8px;
    border-radius: 4px;
    color: var(--color-primary);
    background: var(--color-primary-transparent);
    font-size: 13px;
    font-weight: 400;
    margin-left: 12px;
  }
  .secTitle {
    cursor: pointer;
    margin: 18px 0;
    &:nth-child(1) {
      margin-top: 0;
    }
  }
  .Checkbox {
    margin-bottom: 14px;
    [class^='icon-'] {
      vertical-align: text-bottom;
    }
  }
  .relationControls {
    display: flex;
    gap: 0 20px;
    margin-left: 24px;
    flex-wrap: wrap;
  }
`;

const Empty = styled(FlexCenter)`
  height: 260px;
  flex-direction: column;
`;

const Circle = styled(FlexCenter)`
  width: 130px;
  height: 130px;
  border-radius: 130px;
  background: var(--color-background-secondary);
  font-size: 100px;
  color: var(--color-text-disabled);
`;

const Info = styled.div`
  background: var(--color-yellow-black);
  border-radius: 3px;
  border: 1px solid var(--color-warning-border);
  padding: 8px;
  color: var(--color-text-title);
  font-size: 13px;
  margin-top: 8px;
  .icon {
    color: var(--color-warning);
    margin-right: 8px;
    font-size: 18px;
  }
`;

function getRefreshControls(controls) {
  return controls.filter(
    c =>
      _.includes(
        [
          WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER, // 公式数值
          WIDGETS_TO_API_TYPE_ENUM.FORMULA_FUNC, // 公式函数
          WIDGETS_TO_API_TYPE_ENUM.FORMULA_DATE, // 公式日期
          WIDGETS_TO_API_TYPE_ENUM.CONCATENATE, // 文本组合
        ],
        c.type,
      ) ||
      (c.type === WIDGETS_TO_API_TYPE_ENUM.CASCADER && _.get(c, 'advancedSetting.storelayer') === '1'),
  );
}

function getRefreshSortControls(controls) {
  return controls.filter(c =>
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, // 单选
        WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN, // 单选
        WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, // 多选
      ],
      c.type,
    ),
  );
}

function getOtherTableControls(controls) {
  const list = controls.filter(
    l =>
      l.dataSource &&
      (WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL === l.type ||
        (l.type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD && _.get(l, 'strDefault.0') !== '1')),
  );
  const group = _.groupBy(list, l => l.dataSource);
  const data = [];
  _.forEach(group, (value, key) => {
    const sourceControlId = key.slice(1, key.length - 1);
    const control = controls.find(l => l.controlId === sourceControlId);
    data.push({
      ...(control
        ? _.pick(control, ['controlId', 'controlName', 'type'])
        : { controlId: sourceControlId, controlName: _l('已删除'), isDeletedControl: true }),
      children: value,
    });
  });

  return data;
}

const getWarningText = time => {
  const warningText =
    time < 60
      ? _l('单个工作表 %0 分钟内不可重复提交，建议勾选本次受影响的所有记录和字段。', time)
      : time % 60
        ? _l(
            '单个工作表 %0小时%1分钟 内不可重复提交，建议勾选本次受影响的所有记录和字段。',
            parseInt(time / 60),
            parseInt(time % 60),
          )
        : _l('单个工作表 %0 小时内不可重复提交，建议勾选本次受影响的所有记录和字段。', time / 60);

  return warningText;
};

const renderControlLabel = control => (
  <span>
    {!_.isUndefined(control.type) && (
      <i className={`icon-${getIconByType(control.type)} textTertiary Font16 mRight8`}></i>
    )}
    <span className={control.isDeletedControl ? 'Red' : undefined}>{control.controlName}</span>
  </span>
);

export default function RefreshRecordDialog(props) {
  const {
    controls = [],
    appId,
    viewId,
    worksheetId,
    allWorksheetIsSelected,
    selectedRows,
    searchArgs,
    quickFilter,
    navGroupFilters,
    reloadWorksheet = () => {},
    getWorksheetSheetViewSummary = () => {},
    clearSelect = () => {},
    onClose = () => {},
  } = props;
  const visibleControls = controls.filter(
    c => !_.includes(FORM_HIDDEN_CONTROL_IDS.concat(WORKFLOW_SYSTEM_CONTROL.map(cc => cc.controlId)), c.controlId),
  );
  const refreshControls = getRefreshControls(visibleControls);
  const refreshSortControls = getRefreshSortControls(visibleControls);
  const encryptControls = visibleControls.filter(c => c.encryId);
  const otherTableControls = getOtherTableControls(visibleControls);
  const relationControls = visibleControls.filter(c =>
    _.includes([WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET, WIDGETS_TO_API_TYPE_ENUM.SUB_LIST], c.type),
  );
  const refreshVisible = !!refreshControls.concat(
    refreshSortControls,
    encryptControls,
    otherTableControls,
    relationControls,
  ).length;
  const [calibrateConfig, setCalibrateConfig] = useState({});
  const [time, setTime] = useState(0);
  const [expandKeys, setExpandKeys] = useState([]);

  const dataList = [
    {
      key: 'calculate',
      title: _l('更新计算结果'),
      desc: _l('当原始数据变化后，可重新计算公式、文本组合等字段的结果'),
      controls: refreshControls,
    },
    {
      key: 'option',
      title: _l('更新选项相关结果'),
      desc: _l('当选项排序、分值或配置变化后，可刷新对应字段的显示结果'),
      controls: refreshSortControls,
    },
    {
      key: 'encrypt',
      title: _l('更新字段加密值'),
      desc: _l('当字段的加密规则修改后，可刷新字段值按照新规则加密'),
      controls: encryptControls,
    },
    {
      key: 'otherTable',
      title: _l('更新他表字段与汇总结果'),
      desc: _l('当关联记录数据变化后，可重新获取他表字段、计算汇总字段'),
      controls: otherTableControls,
      hasChildren: true,
    },
    {
      key: 'relation',
      title: _l('更新记录之间的关联关系'),
      desc: _l('当关联的记录删除后，可取消记录之间的关联关系'),
      controls: relationControls,
    },
  ];

  useEffect(() => {
    worksheetAjax.getRefreshRowsMinute().then(res => res && setTime(Number(res)));
  }, []);

  const handleOk = () => {
    const hasAuthRowIds = selectedRows.filter(row => row.allowedit || row.allowEdit).map(row => row.rowid);
    const allConfig = Object.assign({}, calibrateConfig);
    const updateControls = Object.keys(allConfig)
      .filter(key => allConfig[key])
      .map(key => {
        const control = _.find(controls, { controlId: key });
        return control
          ? {
              ...{
                ..._.pick(control, ['controlId', 'type']),
              },
              ...(control.encryId ? { editType: 21 } : {}),
            }
          : undefined;
      })
      .filter(_.identity);

    if (!updateControls.length) {
      return;
    }

    refreshRecord({
      appId,
      viewId,
      worksheetId,
      hasAuthRowIds,
      allWorksheetIsSelected,
      selectedRows,
      searchArgs,
      quickFilter,
      navGroupFilters,
      updateControls,
      cb: data => {
        if (data.isSuccess) {
          alert(_l('刷新成功'));
          clearSelect();
          onClose();
          reloadWorksheet();
          getWorksheetSheetViewSummary();
        } else {
          const alertText = getWarningText(data.successCount) + _l('请稍后再试。');
          alert(alertText, 3);
        }
      },
    });
  };

  const handleAllChecked = (controls, checked) => {
    const value = {};
    controls.forEach(l => {
      value[l.controlId] = checked;
    });
    setCalibrateConfig({ ...calibrateConfig, ...value });
  };

  const renderCheckbox = list => {
    return list.map((c, i) => (
      <Checkbox
        key={i}
        text={renderControlLabel(c)}
        checked={calibrateConfig[c.controlId]}
        onClick={() => {
          setCalibrateConfig(config => ({ ...config, [c.controlId]: !calibrateConfig[c.controlId] }));
        }}
      />
    ));
  };

  return (
    <NewDialog
      visible
      title={
        <div className="flexRow alignItemsCenter">
          <span>{_l('校准数据')}</span>
          <div className="titleTag">{_l('管理员工具')}</div>
        </div>
      }
      description={
        <Fragment>
          <div>
            {_l('选择需要重新计算的字段值。单次最多处理10万行数据，完成后通过系统消息通知结果。')}
            <Support
              className="mBottom2"
              type={3}
              href="https://help.mingdao.com/worksheet/batch-refresh"
              text={_l('帮助')}
            />
          </div>
          <Info className="valignWrapper">
            <Icon icon="info" className="" />
            <span>{getWarningText(time)}</span>
          </Info>
        </Fragment>
      }
      overlayClosable={false}
      width="640"
      anim={false}
      okDisabled={!Object.keys(calibrateConfig).filter(key => calibrateConfig[key]).length}
      onCancel={onClose}
      onOk={handleOk}
    >
      <div>
        {!refreshVisible && (
          <Empty>
            <Circle>
              <i className="icon-view_quilt"></i>
            </Circle>
            <span className="textTertiary Font13 mTop20">{_l('当前工作表没有可以校准的字段。')}</span>
          </Empty>
        )}
        {dataList
          .filter(item => item.controls.length)
          .map(item => {
            const isExpand = expandKeys.includes(item.key);

            return (
              <Fragment key={item.key}>
                <div
                  className="secTitle"
                  onClick={() => {
                    const newKeys = isExpand ? expandKeys.filter(k => k !== item.key) : expandKeys.concat(item.key);
                    setExpandKeys(newKeys);
                  }}
                >
                  <div className="flexRow alignItemsCenter">
                    <Icon icon={isExpand ? 'arrow-down' : 'arrow-right-tip'} className="textSecondary" />
                    <div className="Bold mLeft4">{item.title}</div>
                  </div>
                  <div className="textSecondary mTop6 mLeft17">{item.desc}</div>
                </div>
                {isExpand && (
                  <div className="mLeft17">
                    {item.hasChildren
                      ? item.controls.map(l => {
                          const notAllChecked = _.some(l.children, l => !calibrateConfig[l.controlId]);

                          return (
                            <Fragment key={`relation-${l.controlId}`}>
                              <div className="mBottom14">
                                <Checkbox
                                  text={renderControlLabel(l)}
                                  checked={!notAllChecked}
                                  onClick={() => handleAllChecked(l.children, notAllChecked)}
                                />
                              </div>
                              <div className="relationControls">{renderCheckbox(l.children)}</div>
                            </Fragment>
                          );
                        })
                      : renderCheckbox(item.controls)}
                  </div>
                )}
              </Fragment>
            );
          })}
      </div>
    </NewDialog>
  );
}

RefreshRecordDialog.propTypes = {
  controls: arrayOf(shape({})),
};
