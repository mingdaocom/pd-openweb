import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Tooltip, Support } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import styled from 'styled-components';
import { browserIsMobile } from 'src/util';

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
const RefreshBtn = styled.i`
  display: block;
  ${({ isLoading }) => (isLoading ? `animation:rotate 2s linear infinite;color:#2196f3;` : '')};
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

  state = {
    loading: false,
  };

  onRefresh = () => {
    const { onChange, worksheetId, recordId, controlId } = this.props;
    const { loading } = this.state;

    if (loading) return;

    this.setState({ loading: true });

    setTimeout(() => {
      sheetAjax.refreshSummary({ worksheetId, rowId: recordId, controlId }).then(data => {
        this.setState({ loading: false });
        onChange(data);
      });
    }, 1000);
  };

  render() {
    const { value, dot, unit, advancedSetting, recordId, enumDefault2 } = this.props;
    const { loading } = this.state;
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
                  href="https://help.mingdao.com/sheet20.html"
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
      content = _.isUndefined(dot) ? value : _.round(value, dot).toFixed(dot);
      content = content.replace(
        content.indexOf('.') > -1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g,
        '$1,',
      );
      content = content + (unit ? ` ${unit}` : '');
    }

    if (!_.isUndefined(value) && advancedSetting && advancedSetting.summaryresult === '1') {
      content = Math.round(parseFloat(value) * 100) + '%';
    }

    return (
      <Box className="customFormControlBox customFormTextareaBox customFormReadonly customFormSubtotal">
        {content}
        {!!recordId && (
          <span
            data-tip={loading ? _l('刷新中...') : _l('刷新')}
            className="tip-top Font14 mLeft5 Gray_9e ThemeHoverColor3 pointer"
            onClick={this.onRefresh}
          >
            <RefreshBtn className="icon-workflow_cycle" isLoading={loading} />
          </span>
        )}
      </Box>
    );
  }
}
