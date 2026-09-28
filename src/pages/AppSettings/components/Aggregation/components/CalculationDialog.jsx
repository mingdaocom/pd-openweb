import React from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Input, Modal } from 'ming-ui/antd-components';
import FormulaFunc from 'src/pages/widgetConfig/widgetSetting/settings/formula_func.jsx';
import FormulaNumber from 'src/pages/widgetConfig/widgetSetting/settings/formula_number.jsx';
import { handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { getVerifyInfo } from 'src/utils/domain/control/validation';

const CALCULATION_MODAL_STYLES = {
  body: { overflow: 'visible' },
};

const Wrap = styled.div`
  .enumDefaultType {
    display: none;
  }
  .formulaBtns {
    width: 330px;
  }
  .settingItemTitle {
    color: var(--color-text-title);
  }
  .customTip {
    color: var(--color-text-tertiary);
  }
  .flexCenter {
    display: inline-flex !important;
  }
  .AggregationFormula .flexCenter + .hap-checkbox-wrapper {
    margin-left: 8px;
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
    <Modal
      wrapClassName={className}
      className="calculationConPolymerizationDialog"
      open={visible}
      title={_l('计算')}
      width={560}
      styles={CALCULATION_MODAL_STYLES}
      keyboard
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
        <div className="Bold" style={{ marginTop: -4 }}>
          {_l('名称')}
        </div>
        <Input
          value={calculation.controlName}
          className="w100 mTop10"
          placeholder={_l('输入字段名称')}
          onChange={event => {
            setState({
              calculation: { ...calculation, controlName: event.target.value },
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
                checked={_.get(calculation, 'advancedSetting.thousandth') !== '1'}
                onChange={event => {
                  setState({
                    calculation: handleAdvancedSettingChange(calculation, {
                      thousandth: !event.target.checked ? '1' : '0',
                    }),
                  });
                }}
              >
                {_l('显示千分位')}
              </Checkbox>
              <Checkbox
                className="mLeft60"
                checked={_.get(calculation, 'advancedSetting.numshow') === '1'}
                onChange={event => {
                  const checked = !event.target.checked;
                  setState({
                    calculation: handleAdvancedSettingChange(calculation, {
                      suffix: checked ? '' : '%',
                      prefix: '',
                      numshow: checked ? '0' : '1',
                    }),
                  });
                }}
              >
                {_l('按百分比显示')}
              </Checkbox>
            </div>
          </React.Fragment>
        )}
      </Wrap>
    </Modal>
  );
}
