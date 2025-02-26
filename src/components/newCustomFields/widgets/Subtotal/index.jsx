import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Tooltip, Support } from 'ming-ui';
import styled from 'styled-components';
import { browserIsMobile, formatStrZero, formatNumberThousand } from 'src/util';
import { getDatePickerConfigs } from 'src/pages/widgetConfig/util/setting';
import moment from 'moment';
import _ from 'lodash';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

const Tips = styled.div`
  max-width: 230;
  max-height: 200;
  overflow-y: 'auto';
  color: '#fff';
  white-space: 'pre-wrap';
  .customSubtotalMessage {
    color: #fff !important;
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

export default class Widgets extends Component {
  static propTypes = {
    value: PropTypes.any,
    dot: PropTypes.number,
    unit: PropTypes.string,
    advancedSetting: PropTypes.object,
    onChange: PropTypes.func,
    worksheetId: PropTypes.string,
    recordId: PropTypes.string,
    controlId: PropTypes.string,
    enumDefault2: PropTypes.number,
  };

  componentDidMount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  }

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

  shouldComponentUpdate(nextProps) {
    if (!_.isEqual(_.pick(nextProps, ['value']), _.pick(this.props, ['value']))) {
      return true;
    }
    return false;
  }

  render() {
    const { value, dot, unit, advancedSetting = {}, enumDefault2, enumDefault } = this.props;
    let content = value;

    if (content === 'max') {
      const isMobile = browserIsMobile();
      const action = [isMobile ? 'click' : 'hover'];

      return (
        <div className="customFormControlBox customFormTextareaBox customFormReadonly Gray_9e">
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
            action={action}
            popupPlacement={'top'}
            offset={[0, 0]}
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
  }
}
