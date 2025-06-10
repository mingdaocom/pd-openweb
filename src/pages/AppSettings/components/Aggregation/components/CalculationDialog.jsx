import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { Button, Checkbox, Dialog, Input } from 'ming-ui';
import 'src/pages/Role/PortalCon/components/AddUserByTelDialog.less';
import { getVerifyInfo } from 'src/pages/widgetConfig/util/setting.js';
import FormulaFunc from 'src/pages/widgetConfig/widgetSetting/settings/formula_func.jsx';
import FormulaNumber from 'src/pages/widgetConfig/widgetSetting/settings/formula_number.jsx';
import { handleAdvancedSettingChange } from 'src/utils/control';

const Wrap = styled.div`
  .enumDefaultType {
    display: none;
  }
  .formulaBtns {
    width: 330px;
  }
  .settingItemTitle {
    color: #151515;
  }
  .customTip {
    color: #9e9e9e;
  }
  .ant-input {
    border-radius: 3px 0 0 3px;
  }
  .numberControlBox .iconWrap {
    border-radius: 0 0 3px 0;
    &:hover {
      i {
        color: #2196f3;
      }
    }
  }
  .numberControlBox .iconWrap:first-child {
    border-radius: 0 3px 0 0;
  }
  .flexCenter {
    display: inline-flex !important;
    .Dropdown--input {
      width: 200px;
      padding: 5px 8px 5px 12px !important;
      margin-right: 16px;
    }
  }
  .AggregationFormula {
    .Checkbox {
      display: inline-flex !important;
      height: 24px !important;
    }
  }
`;

export default function CalculationDialog(props) {
  const { onHide, onOk, visible, className, allControls } = props;
  const [{ calculation }, setState] = useSetState({
    calculation: props.calculation || {
      advancedSetting: {
        dot: 2,
      },
      dot: 2,
      type: 31,
    },
  });
  const getData = () => {
    return {
      ...calculation,
      enumDefault: calculation.enumDefault || 1, //默认自定义
      enumDefault2: calculation.enumDefault2,
      type: calculation.type || 31,
      controlName: calculation.controlName,
      dataSource: calculation.dataSource,
      advancedSetting: {
        ...calculation.advancedSetting,
        numshow: '1', //不配置单位
      },
      dot: Number(_.get(calculation, 'advancedSetting.dot')) || 2,
    };
  };

  const onChange = result => {
    setState({
      calculation: {
        ...calculation,
        ...result,
        advancedSetting: {
          ...calculation.advancedSetting,
          ...result.advancedSetting,
          ..._.pick(result, ['dot']),
          numshow: _.get(calculation, 'advancedSetting.numshow'),
        },
      },
    });
  };

  return (
    <Dialog
      dialogClasses={className}
      className={cx('calculationConPolymerizationDialog addUserByTelDialog')}
      visible={visible}
      anim={false}
      title={_l('计算')}
      width={560}
      onCancel={onHide}
      onOk={() => {
        if (!calculation.controlName) {
          return alert(_l('请设置名称'), 3);
        }

        const info = getVerifyInfo(
          { ...calculation, type: calculation.type || 31, enumDefault: calculation.enumDefault || 1 },
          { controls: allControls },
        );
        const funcObj = safeParse(calculation.dataSource || '{}');
        if (!info.isValid || (calculation.type === 53 && _.get(funcObj, 'status') === -1)) {
          alert(info.text || _l('表达式错误，请修改后保存'), 3);
          return;
        }
        if (calculation.type === 53 && calculation.enumDefault2 !== 6) {
          onOk({ ..._.omit(calculation, 'dot'), advancedSetting: { ..._.omit(calculation.advancedSetting, 'dot') } });
          return;
        }

        onOk(calculation);
      }}
    >
      <Wrap className="">
        <div className="Bold mTop10" style={{ marginTop: -4 }}>
          {_l('名称')}
        </div>
        <Input
          value={calculation.controlName}
          className="w100 mTop10 placeholderColor"
          placeholder={_l('输入字段名称')}
          onChange={controlName => {
            setState({
              calculation: { ...calculation, controlName },
            });
          }}
          maxLength={60}
          autoFocus
        />
        {calculation.type !== 31 ? (
          <FormulaFunc
            fromAggregation
            className="AggregationFormula"
            data={getData()}
            allControls={allControls}
            onChange={onChange}
          />
        ) : (
          <React.Fragment>
            <FormulaNumber
              data={getData()}
              className="AggregationFormula"
              fromAggregation
              allControls={allControls}
              dataSourceTitle={_l('表达式')}
              onChange={onChange}
            />
            <div className="Bold mTop24">{_l('数据格式')}</div>
            <div className="labelWrap mTop12">
              <Checkbox
                className="InlineBlock"
                checked={_.get(calculation, 'advancedSetting.thousandth') !== '1'}
                onClick={checked => {
                  setState({
                    calculation: handleAdvancedSettingChange(calculation, {
                      thousandth: checked ? '1' : '0',
                    }),
                  });
                }}
                text={_l('显示千分位')}
              />
              <Checkbox
                className="InlineBlock mLeft60"
                checked={_.get(calculation, 'advancedSetting.numshow') === '1'}
                onClick={checked => {
                  setState({
                    calculation: handleAdvancedSettingChange(calculation, {
                      suffix: checked ? '' : '%',
                      prefix: '',
                      numshow: checked ? '0' : '1',
                    }),
                  });
                }}
                text={_l('按百分比显示')}
              />
            </div>
          </React.Fragment>
        )}
      </Wrap>
    </Dialog>
  );
}
