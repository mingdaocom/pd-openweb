import React, { memo } from 'react';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Support } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getDatePickerConfigs } from 'src/pages/widgetConfig/util/setting';
import { formatNumberThousand, formatStrZero } from 'src/utils/control';

const Tips = styled.div`
  max-width: 230;
  max-height: 200;
  overflow-y: auto;
  color: var(--color-background-primary);
  white-space: 'pre-wrap';
  .customSubtotalMessage {
    color: var(--color-background-primary) !important;
    &:hover {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    .mLeft5 {
      margin-left: 0 !important;
    }
  }
`;
const Box = styled.div`
  &.customFormSubtotal {
    &:hover {
      span {
        display: inline-block;
      }
    }
    > span {
      display: none;
      white-space: normal;
    }
  }
`;

const Subtotal = ({ value, dot, unit, advancedSetting = {}, enumDefault2, enumDefault }) => {
  let content = value;

  if (content === 'max') {
    return (
      <div className="customFormControlBox customFormTextareaBox customFormReadonly Gray_9e">
        {_l('超出汇总数量上限')}

        <Tooltip
          title={
            <Tips>
              {_l('最大支持汇总1000行数据。如需要汇总更多数据，请通过配置工作流运算写入。')}
              <Support
                className="customSubtotalMessage"
                type={3}
                href="https://help.mingdao.com/worksheet/control-rollup-application"
                text={_l('【点击查看帮助】')}
              />
            </Tips>
          }
          trigger={['hover']}
          placement={'top'}
          align={{ offset: [0, 0] }}
        >
          <i className="icon-info_outline Font16 mLeft5" />
        </Tooltip>
      </div>
    );
  }

  if (!_.isUndefined(value) && enumDefault2 === 6) {
    if (advancedSetting.numshow === '1') {
      content = parseFloat(value) * 100;
    }
    content = _.isUndefined(dot) ? content : _.round(content, dot).toFixed(dot);

    if (advancedSetting.dotformat === '1') {
      content = formatStrZero(content);
    }

    if (advancedSetting.thousandth !== '1') {
      content = formatNumberThousand(content);
    }
    content = content + (unit ? ` ${unit}` : '');
  }

  if (!_.isUndefined(value) && _.includes([15, 16], enumDefault2) && _.includes([2, 3], enumDefault)) {
    const { formatMode } = getDatePickerConfigs({
      type: enumDefault2,
      advancedSetting: { showtype: unit },
    });
    content = moment(value).format(formatMode);
  }

  if (!_.isUndefined(value) && advancedSetting.summaryresult === '1') {
    content = _.round(parseFloat(value) * 100, dot || 0).toFixed(dot || 0) + '%';
  }

  if (advancedSetting.prefix || advancedSetting.suffix) {
    content = `${advancedSetting.prefix || ''} ` + content + ` ${advancedSetting.suffix || ''}`;
  }

  return (
    <Box className="customFormControlBox customFormTextareaBox customFormReadonly customFormSubtotal">{content}</Box>
  );
};

Subtotal.propTypes = {
  value: PropTypes.any,
  dot: PropTypes.number,
  unit: PropTypes.string,
  advancedSetting: PropTypes.object,
  onChange: PropTypes.func,
  enumDefault2: PropTypes.number,
  enumDefault: PropTypes.number,
};

// 使用React.memo来优化性能，相当于shouldComponentUpdate的逻辑
export default memo(Subtotal, (prevProps, nextProps) => {
  return _.isEqual(_.pick(nextProps, ['value']), _.pick(prevProps, ['value']));
});
