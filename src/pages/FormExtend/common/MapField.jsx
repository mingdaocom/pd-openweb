import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Dropdown, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/enum';

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

const fieldsConfig = {
  pay: [
    { isTitle: true, title: _l('订单明细（注意：不能选择已在公开表单配置过映射的字段）') },
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
    { controlId: 'channelCheckId', controlName: _l('对账 ID'), type: [2] },
    { controlId: 'mchId', controlName: _l('商户号'), type: [2] },
    { controlId: 'sourceType', controlName: _l('订单来源'), type: [2, 11] },
    { controlId: 'payAccount', controlName: _l('下单人'), type: [2] },
  ],
  invoice: [
    { isTitle: true, title: _l('开票基础信息') },
    { controlId: 'invoiceTitle', controlName: _l('发票抬头'), type: [2] },
    { controlId: 'taxNo', controlName: _l('发票税号'), type: [2] },
    { controlId: 'invoiceType', controlName: _l('发票类型'), type: [2, 11] },
    { controlId: 'totalAmount', controlName: _l('发票总额'), type: [8] },
    { controlId: 'applyTime', controlName: _l('申请时间'), type: [16] },
    { controlId: 'invoiceContent', controlName: _l('开票内容'), type: [2] },
    { isTitle: true, title: _l('开票结果') },
    { controlId: 'invoiceNo', controlName: _l('发票号码'), type: [2] },
    { controlId: 'invoiceId', controlName: _l('发票单号'), type: [2] },
    { controlId: 'invoiceStatus', controlName: _l('开票状态'), type: [2, 11] },
    { controlId: 'invoiceTime', controlName: _l('开票时间'), type: [16] },
    { controlId: 'invoiceUrl', controlName: _l('电子发票'), type: [2] },
  ],
};

export default class MapField extends Component {
  constructor(props) {
    super(props);
    this.state = { showDialog: false, mapFields: fieldsConfig[props.type] };
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
    let newFieldsMap = {};
    mapFields
      .filter(item => !item.isTitle)
      .forEach(item => {
        newFieldsMap[item.controlId] = item.mapFieldControlId || '';
      });
    this.props.onOk(newFieldsMap);
    this.setState({ showDialog: false });
  };

  renderRow = item => {
    const { controls, filterIds = [] } = this.props;
    const { mapFields } = this.state;
    const filterControlIds = mapFields
      .map(item => item.mapFieldControlId)
      .filter(v => v)
      .concat(filterIds);

    const columns = controls
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
          {item.desc && (
            <Tooltip
              title={item.desc}
              align={{
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
    const { fieldMaps } = this.props;
    const { mapFields, showDialog } = this.state;
    const isEmptyField = Object.keys(fieldMaps).every(v => !fieldMaps[v]);

    return (
      <Fragment>
        <div className="mapSettingBtn" onClick={() => this.setState({ showDialog: true })}>
          {isEmptyField ? (
            _l('点击设置')
          ) : (
            <Fragment>
              <Icon icon="check_circle" className="mRight10 Font18 TxtMiddle" style={{ color: '#4CAF50' }} />
              {_l('已设置')}
            </Fragment>
          )}
        </div>
        <Dialog
          width={726}
          visible={showDialog}
          title={_l('建立字段映射')}
          okText={_l('保存')}
          overlayClosable={false}
          onCancel={() => this.setState({ showDialog: false })}
          onOk={this.onSave}
        >
          {mapFields.map(item => {
            return item.isTitle ? <div className="Gray_9e mBottom10">{item.title}</div> : this.renderRow(item);
          })}
        </Dialog>
      </Fragment>
    );
  }
}
