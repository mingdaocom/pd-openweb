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
  .secTitle {
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
  background: #f5f5f5;
  font-size: 100px;
  color: #bdbdbd;
`;

const Info = styled.div`
  background: #fefbe7;
  border-radius: 3px;
  border: 1px solid #fce596;
  padding: 8px;
  color: #151515;
  font-size: 13px;
  margin-top: 8px;
  .icon {
    color: #f0b041;
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
    const control = controls.find(l => l.controlId === key.slice(1, key.length - 1));
    data.push({
      ..._.pick(control, ['controlId', 'controlName', 'type']),
      children: value,
    });
  });

  return data;
}

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
  const refreshVisible = !!refreshControls.concat(refreshSortControls, encryptControls, otherTableControls).length;
  const [calibrateConfig, setCalibrateConfig] = useState({});
  const [time, setTime] = useState(0);

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
          alert(
            data.successCount < 60
              ? _l('单表的刷新数据最小间隔为%0分钟，请稍后再试。', data.successCount)
              : data.successCount % 60 > 0
                ? _l(
                    '单表的刷新数据最小间隔为%0小时%1分钟，请稍后再试',
                    parseInt(data.successCount / 60),
                    parseInt(data.successCount % 60),
                  )
                : _l('单表的刷新数据最小间隔为%0小时，请稍后再试。', data.successCount / 60),
            3,
          );
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
        text={
          <span>
            <i className={`icon-${getIconByType(c.type)} Gray_9e Font16 mRight8`}></i>
            {c.controlName}
          </span>
        }
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
      title={_l('校准数据')}
      description={
        <Fragment>
          <div>
            {_l('仅限管理员操作，一次最多校准10万行数据，校准完成后将推送系统消息通知。')}
            <Support
              className="moreHelp"
              type={3}
              href="https://help.mingdao.com/worksheet/batch-refresh"
              text={_l('使用帮助')}
            />
          </div>
          <Info className="valignWrapper">
            <Icon icon="info" className="" />
            <span>
              {time < 60
                ? _l('单个工作表数据校准时间间隔为%0分钟，请确保已选择所有需要校准的记录和字段。', time)
                : time % 60
                  ? _l(
                      '单个工作表数据校准时间间隔为%0小时%1分钟，请确保已选择所有需要校准的记录和字段。',
                      parseInt(time / 60),
                      parseInt(time % 60),
                    )
                  : _l('单个工作表数据校准时间间隔为%0小时，请确保已选择所有需要校准的记录和字段。', time / 60)}
            </span>
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
            <span className="Gray_9e Font13 mTop20">{_l('当前工作表没有可以校准的字段。')}</span>
          </Empty>
        )}
        {[
          { title: _l('刷新计算结果'), controls: refreshControls },
          { title: _l('刷新选项排序和分值'), controls: refreshSortControls },
          { title: _l('刷新字段加密值'), controls: encryptControls },
          { title: _l('刷新他表字段和汇总结果'), controls: otherTableControls, hasChildren: true },
        ]
          .filter(item => item.controls.length)
          .map(item => {
            const notAllChecked = !item.hasChildren && _.some(item.controls, l => !calibrateConfig[l.controlId]);

            return (
              <Fragment>
                <div className="secTitle Bold">
                  {item.title}
                  {!item.hasChildren && (
                    <span
                      className="mLeft14 Gray_75 Normal Hand"
                      onClick={() => handleAllChecked(item.controls, notAllChecked)}
                    >
                      {notAllChecked ? _l('全选') : _l('取消全选')}
                    </span>
                  )}
                </div>
                {item.hasChildren
                  ? item.controls.map(l => {
                      const notAllChecked = _.some(l.children, l => !calibrateConfig[l.controlId]);

                      return (
                        <Fragment key={`relation-${l.controlId}`}>
                          <div className="mBottom14">
                            <i className={`icon-${getIconByType(l.type)} Gray_9e Font16 mRight8`}></i>
                            {l.controlName}
                            <span
                              className="mLeft14 Gray_75 Normal Hand"
                              onClick={() => handleAllChecked(l.children, notAllChecked)}
                            >
                              {notAllChecked ? _l('全选') : _l('取消全选')}
                            </span>
                          </div>
                          <div className="relationControls">{renderCheckbox(l.children)}</div>
                        </Fragment>
                      );
                    })
                  : renderCheckbox(item.controls)}
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
