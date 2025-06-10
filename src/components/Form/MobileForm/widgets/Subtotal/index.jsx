import React, { memo } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Support, Tooltip } from 'ming-ui';
import { getDatePickerConfigs } from 'src/pages/widgetConfig/util/setting';
import { formatNumberThousand, formatStrZero } from 'src/utils/control';

const Tips = styled.div`
  max-width: 230;
  max-height: 200;
  overflow-y: auto;
  color: var(--color-third);
  white-space: pre-wrap;
  .customSubtotalMessage {
    color: var(--color-third) !important;
  }
`;

const Subtotal = props => {
  const { value, dot, unit, advancedSetting = {}, enumDefault2, enumDefault, triggerCustomEvent, formDisabled } = props;

  const getContent = () => {
    let content = value;
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
    return content;
  };

  if (value === 'max') {
    return (
      <div
        className={cx('customFormControlBox customFormReadonly', formDisabled ? 'readonlyCheck' : 'readonlyRefresh')}
      >
        {_l('超出汇总数量上限')}
        <Tooltip
          text={
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
          action={['click']}
          popupPlacement={'top'}
          offset={[0, 0]}
        >
          <i className="icon-info_outline mLeft5" />
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={cx('customFormControlBox customFormReadonly', formDisabled ? 'readonlyCheck' : 'readonlyRefresh')}>
      {getContent()}
    </div>
  );
};

Subtotal.propTypes = {
  value: PropTypes.any,
  dot: PropTypes.number,
  unit: PropTypes.string,
  advancedSetting: PropTypes.object,
  onChange: PropTypes.func,
  worksheetId: PropTypes.string,
  recordId: PropTypes.string,
  controlId: PropTypes.string,
  enumDefault2: PropTypes.number,
  triggerCustomEvent: PropTypes.func,
  formDisabled: PropTypes.bool,
};

export default memo(Subtotal, (prevProps, nextProps) => {
  return _.isEqual(_.pick(prevProps, ['value', 'formDisabled']), _.pick(nextProps, ['value', 'formDisabled']));
});
