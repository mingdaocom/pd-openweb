import React, { Component } from 'react';
import _ from 'lodash';
import { Dialog, Dropdown, Icon, Tooltip } from 'ming-ui';
import styled from 'styled-components';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/enum';
import '../index.less';

const Row = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  .fieldText {
    height: 36px;
    background: #f8f8f8;
    border-radius: 3px;
    display: flex;
    align-items: center;
    font-weight: 500;
    padding: 0 12px;
    font-weight: 600;
  }
`;

export default class MapField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapFields: [
        { controlId: 'orderNo', controlName: _l('订单编号'), type: [2] },
        { controlId: 'totalFee', controlName: _l('交易金额'), type: [8] },
        {
          controlId: 'payStatus',
          controlName: _l('订单状态'),
          type: [2, 11],
          desc: _l('可映射状态：已支付、待支付、已退款、部分退款、退款中'),
        },
        { controlId: 'payMethod', controlName: _l('支付方式'), type: [2, 11] },
        { controlId: 'merchantPaymentChannel', controlName: _l('支付通道'), type: [2, 11] },
        { controlId: 'createOrderTime', controlName: _l('下单时间'), type: [16] },
        { controlId: 'payTime', controlName: _l('支付时间'), type: [16] },
        { controlId: 'refundFee', controlName: _l('退款金额'), type: [8] },
        { controlId: 'settleFee', controlName: _l('结算金额'), type: [8], desc: _l('微信/支付宝直连无法获取结算金额') },
        { controlId: 'tradeFee', controlName: _l('结算手续费'), type: [8], desc: _l('微信/支付宝直连无法获取手续费') },
        {
          controlId: 'tradeFeeRate',
          controlName: _l('结算手续费率'),
          type: [8],
          desc: _l('微信/支付宝直连无法获取手续费率'),
        },
        { controlId: 'mchId', controlName: _l('商户号'), type: [2] },
        { controlId: 'sourceType', controlName: _l('订单来源'), type: [2, 11] },
        { controlId: 'payAccount', controlName: _l('下单人'), type: [2] },
        // { controlId: 'refundOrderNo', controlName: _l('退款订单'), type: 2 },
        // { controlId: 'refundStatus', controlName: _l('退款状态'), type: 2 },
        // { controlId: 'refundFee', controlName: _l('退款金额'), type: 8 },
        // { controlId: 'applyRefundTime', controlName: _l('申请时间'), type: 16 },
        // { controlId: 'confirmRefundTime', controlName: _l('退款时间'), type: 16 },
        // { controlId: 'applyRefundUser', controlName: _l('申请人'), type: 2 },
      ],
    };
  }

  componentDidMount() {
    const { fieldMaps } = this.props;
    const { mapFields = [] } = this.state;
    this.setState({
      mapFields: mapFields.map(item =>
        fieldMaps[item.controlId] ? { ...item, mapFieldControlId: fieldMaps[item.controlId] } : item,
      ),
    });
  }

  onSave = () => {
    const { mapFields } = this.state;
    this.props.onOk(mapFields);
    this.props.onCancel();
  };

  renderRow = item => {
    const { worksheetInfo = {}, payContentControlId, payAmountControlId, boundControlIds = [] } = this.props;
    const { template } = worksheetInfo;
    const { mapFields } = this.state;
    const filterControlIds = mapFields
      .map(item => item.mapFieldControlId)
      .filter(v => v)
      .concat([payContentControlId, payAmountControlId, ...boundControlIds]);

    const columns = (template.controls || [])
      .filter(({ controlId }) => !_.includes([...NORMAL_SYSTEM_FIELDS_SORT, ...WORKFLOW_SYSTEM_FIELDS_SORT], controlId))
      .map(({ controlName, controlId, type }) => ({
        iconName: getIconByType(type),
        text: controlName,
        value: controlId,
        type: _.includes([6, 31, 37], type) ? 8 : type === 9 ? 11 : type,
      }));
    return (
      <Row>
        <div className="fieldText flex">
          <Icon className="Font16 Gray_9e mRight10" icon={getIconByType(item.type)} />
          {item.controlName}
          {_.includes(['payStatus', 'settleFee', 'tradeFee', 'tradeFeeRate'], item.controlId) && (
            <Tooltip
              text={<span>{item.desc}</span>}
              popupAlign={{
                points: ['tl', 'bl'],
                offset: [-15, 0],
                overflow: { adjustX: true, adjustY: true },
              }}
            >
              <i className="icon icon-info Gray_bd Hover_21 Hand Font14 mLeft8" />
            </Tooltip>
          )}
        </div>
        <Icon icon="arrow_forward" className="Font16 ThemeColor mLeft16 mRight16" />
        <Dropdown
          className="flex"
          menuClass="mapFieldMenuWrap"
          isAppendToBody
          border
          cancelAble
          data={columns.filter(
            v =>
              _.includes(item.type || [], v.type) &&
              !_.includes(
                filterControlIds.filter(t => t !== item.mapFieldControlId),
                v.value,
              ),
          )}
          value={item.mapFieldControlId}
          onChange={value => {
            const copyMapFields = [...mapFields];
            const index = _.findIndex(copyMapFields, v => item.controlId === v.controlId);
            const currentField = {
              ..._.find(copyMapFields, v => item.controlId === v.controlId),
              mapFieldControlId: value,
            };
            copyMapFields[index] = currentField;
            this.setState({ mapFields: copyMapFields });
          }}
        />
      </Row>
    );
  };

  render() {
    const { visible, onCancel = () => {} } = this.props;

    const { mapFields } = this.state;

    return (
      <Dialog
        width={726}
        visible={visible}
        title={_l('建立字段映射')}
        okText={_l('保存')}
        onCancel={onCancel}
        onOk={this.onSave}
      >
        <div className="Gray_9e mBottom10">
          {_l('订单明细')}
          <span>{'（' + _l('注意：不能选择已在公开表单配置过映射的字段') + '）'}</span>
        </div>
        {mapFields.map(item => this.renderRow(item))}
        {/* <div className="Gray_9e mBottom10">{_l('退款订单')}</div>
        {mapFields.slice(11).map(item => this.renderRow(item))} */}
      </Dialog>
    );
  }
}
