import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import preall from 'src/common/preall';
import { Button } from 'ming-ui';
import mdLogo from './images/mdLogo.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import upgradeController from 'src/api/upgrade';
import { getRequest } from 'src/util';
import moment from 'moment';
import './index.less';

const contactInfo = [
  [
    { key: 'companyName', text: _l('组织全称') },
    { key: 'city', text: _l('城市') },
  ],
  [
    { key: 'recipientName', text: _l('联系人姓名') },
    { key: 'job', text: _l('职位') },
  ],
  [
    { key: 'contactPhone', text: _l('电话') },
    { key: 'mobilePhone', text: _l('手机') },
  ],
  [
    { key: 'email', text: _l('电子邮件') },
    { key: 'fax', text: _l('传真（选填') },
  ],
  [{ key: 'postcode', text: _l('地址和邮编') }],
];

class ContractCom extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.getOrderContractInfo();
  }

  getOrderContractInfo = () => {
    const { projectId, selectYear, userCount, versionId } = getRequest(location.search);

    upgradeController
      .getOrderContractInfo({
        projectId: projectId,
        versionId: versionId && JSON.parse(versionId),
        userNum: userCount && JSON.parse(userCount),
        years: selectYear && JSON.parse(selectYear),
        unLimited: false,
      })
      .then(({ user = {}, order = {} }) => {
        this.setState({ user, order });
      });
  };

  // 打印合同
  printContract = () => {
    let originHtml = window.document.body.innerHTML;
    window.document.body.innerHTML = $('.printContent').html();
    window.print();
    setTimeout(function () {
      window.document.body.innerHTML = originHtml;
    }, 100);
  };

  // 下载合同
  genScreenshot = () => {
    $('.printMt200').css({ marginTop: 200 });
    $('.printMt').css({ marginTop: 130 });
    const $wrap = document.getElementById('printContent');
    let w = 592.28;
    let h = 841.89;
    try {
      let width = $wrap.offsetWidth;
      let height = $wrap.offsetHeight;
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      let scaleBy = 2;
      canvas.width = width * scaleBy;
      canvas.height = height * scaleBy;
      context.scale(scaleBy, scaleBy);
      html2canvas($wrap, {
        backgroundColor: '#fff',
        allowTaint: true,
        tainttest: false,
        scale: scaleBy,
        logging: false,
        width: width,
        height: height,
        canvas: canvas,
        useCORS: true,
      }).then(canvasData => {
        let pageData = canvasData.toDataURL('image/jpeg', 1.0);
        let pdf = new jsPDF('', 'pt', 'a4');
        let contentWidth = canvasData.width;
        let contentHeight = canvasData.height;
        //一页pdf显示html页面生成的canvas高度;
        let pageHeight = (contentWidth / w) * h;
        //未生成pdf的html页面高度
        let leftHeight = contentHeight;
        //页面偏移
        let position = 0;
        //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
        let imgWidth = w;
        let imgHeight = (w / contentWidth) * contentHeight;
        //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(h)
        //当内容未超过pdf一页显示的范围，无需分页
        if (leftHeight < pageHeight) {
          pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
        } else {
          while (leftHeight > 0) {
            pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
            leftHeight -= pageHeight;
            position -= h;
            //避免添加空白页
            if (leftHeight > 0) {
              pdf.addPage();
            }
          }
        }

        pdf.save('salesOrder.pdf');

        $('.printMt200,.printMt').css({ marginTop: 0 });
      });
    } catch (error) {
      $('.printMt200,.printMt').css({ marginTop: 0 });
      alert(_l('生成失败'), 3);
    }
  };

  render() {
    const { user = {}, order = {} } = this.state;

    return (
      <div className="contractWrap">
        <div className="header">
          <Button type="primary" className="printBtn mRight35" onClick={this.printContract}>
            {_l('打印合同')}
          </Button>
          <Button type="primary" className="actionBtn" onClick={this.genScreenshot}>
            {_l('下载合同')}
          </Button>
        </div>
        <div className="printContent" id="printContent">
          <div className="contractPrint">
            <div className="flexRow alignItemsCenter">
              <div className="desTxt">
                <div className="Font16 LineHeight80" style={{ fontSize: '16px' }}>
                  {_l('付费版')}
                </div>
                <div className="Font48">Sales Order{_l('订单')}</div>
              </div>
              <div className="flex TxtRight">
                <img src={mdLogo} />
              </div>
            </div>
            <br />
            <br />
            <div className="Font16 bold LineHeight30">
              {_l('联系人信息')} <span className="mLeft5 mRight5">CONTACT</span> INFORMATION
            </div>
            <table cellpadding="0" cellspacing="0" className="contactTable LineHeight30">
              {contactInfo.map((item, index) => {
                return (
                  <tr>
                    {item.map(v => {
                      return (
                        <Fragment>
                          <td className="label">{v.text}</td>
                          <td className="value">{user[v.key]}</td>
                        </Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </table>
            <span className="LineHeight30">
              {_l(
                '订单联系人将作为开通多网络的缺省管理员，如果需要指定其他人为网络管理员，或者购买了多个专业版，请另行通知客户经理。',
              )}
            </span>
            <br />
            <br />
            <div className="LineHeight30 Font16 bold">
              {_l('订购详情')}
              <span className="mLeft5">ORDER DETAILS</span>
            </div>
            <table cellpadding="0" className="w100 orderDetail LineHeight30 Font14 TxtCenter" cellspacing="0">
              <tr className="borderTopSolid tableBGColor bold">
                <td className="w50">NO</td>
                <td className="">{_l('产品名称')}</td>
                <td className="w50">{_l('人数')}</td>
                <td className="w130">{_l('开始日期')}</td>
                <td className="w130">{_l('结束日期')}</td>
                <td className="w100px">{_l('网络ID')}</td>
                <td className="w100px">{_l('金额（元）')}</td>
              </tr>
              <tr className="borderTopDashed borderBottomSolid">
                <td>1</td>
                <td>
                  {order.versionName}
                  {order.unLimited ? _l('(无限人数版)') : ''}
                </td>
                <td>{order.unLimited ? _l('无限') : order.userNum}</td>
                <td>{order.startDate && moment(order.startDate).format('YYYY年MM月DD日')}</td>
                <td>{order.endDate && moment(new Date(order.endDate)).format('YYYY年MM月DD日')}</td>
                <td>{order.projectAutoId}</td>
                <td>{order.price && order.price.toFixed(2)}</td>
              </tr>
              <tr className="borderBottomSolid">
                <td colspan="6" className="bold pRight20 TxtRight">
                  {_l('小计（人民币）')}
                </td>
                <td>{order.price && order.price.toFixed(2)}</td>
              </tr>
            </table>
            <span className="LineHeight30">
              *
              {_l(
                '增值服务充值金额将在收到付款后充入指定网络的企业账户中，用于客户支付短信，通讯，扩展应用等增值服务。',
              )}
            </span>
            <br />
            <br />
            <span className="LineHeight25">
              <span> {_l('支付信息 PAYMENT INFORMATION')}</span>
              <br />
              <span>{_l('客户应当在本订单签署后的___个工作日内，通过以下支付方式完成订单价款的支付。')}</span>
              <br />
              <span>
                <span>{_l('开户行：民生银行上海大宁支行')}</span>
                <span className="mLeft5 mRight5">{_l('账户：641967782')}</span>
                <span>{_l('户名：上海万企明道软件有限公司')}</span>
              </span>
              <br />
              <span>{_l('支付宝账户：payment@mingdao.com')}</span>
            </span>
            <br />
            <br />
            <br />
            <table cellpadding="0" cellspacing="0" className="orderSubscribe w100 LineHeight30">
              <tr className="borderTopSolid borderBottomDashed">
                <td className="bold" colspan="2">
                  {_l('订单签署')}
                  <span className="mLeft8">SIGNATURE</span>
                </td>
              </tr>
              <tr className="borderBottomDashed">
                <td>{_l('客户（盖章）')}</td>
                <td>{_l('授权销售方（盖章）')}</td>
              </tr>
              <tr className="borderBottomDashed">
                <td>{_l('签署代表：')}</td>
                <td>{_l('签署代表：')}</td>
              </tr>
              <tr className="borderBottomSolid">
                <td>{_l('日期')}：</td>
                <td>{_l('日期')}：</td>
              </tr>
            </table>
            <br />
            <br />
            <div className="LineHeight30">{_l('公司印章名称若和文字不一致，以公章名称为准')}</div>
            <table className="w100 LineHeight30 lastTable" cellpadding="0" cellspacing="0">
              <tr>
                <td className="w240 tableBGColor">PROCESS CODE</td>
                <td className="w140">PAY|ACT|AFF</td>
                <td className="w140">|RES</td>
                <td className="w140">|PREM</td>
                <td className="w140">|COMM</td>
              </tr>
            </table>
            <br />
            <div className="printMt200"></div>
            <div className="LineHeight30 conditions TxtCenter Font14 mTop10 bold">{_l('条款')} TERMS & CONDITIONS</div>
            <br />
            <br />
            <table className="LineHeight30" cellpadding="0" cellspacing="0">
              <tr>
                <td className="w415 pRight10 TxtTop">
                  {_l('约定')}
                  <br />
                  1.
                  {_l(
                    '本合约是明道云用户与明道云授权销售方之间的法律契约，高级模式（标准版、专业版、旗舰版都属于高级模式）用户签署本合约并回传（包括使用传真，电子邮件等电子通信手段）给明道云授权销售方即代表接受本合约中的计费和支付条款，并自发出合约之时即受该等条款约束。',
                  )}
                  <br />
                  2. {_l('本合约受中华人民共和国法律管辖。')}
                  <br />
                  {_l('下文中的“明道云”指明道云应用平台、明道云零代码应用平台、明道云APaaS平台或其运营企业。')}
                  <br />
                  <br />
                  {_l('合法使用')}
                  <br />
                  1.
                  {_l(
                    '明道云服务限于提供给客户用作正常和合法业务工具，客户如果使用明道云产品从事以下行为，将导致根本性违约，明道云有权随时停止服务、解除本合约，并追讨因此带来的损失:',
                  )}
                  <br />
                  1&#41; {_l('有明确证据表明客户使用明道云用于违反法律的业务。')}
                  <br />
                  2&#41; {_l('对明道云产品进行了任何形式的对其他第三方的再授权使用，销售或转让。')}
                  <br />
                  3&#41;{' '}
                  {_l('为设计开发竞争产品对明道云产品进行任何形式的反向工程，或在竞争产品抄袭模仿明道云的设计。')}
                  <br />
                  4&#41; {_l('滥用明道云产品的通信功能发送垃圾邮件和短信。')}
                  <br />
                  5&#41; {_l('对明道云的连续服务和商誉构成损害的其他行为，包括对明道云服务器的攻击。')}
                  <br />
                  <br />
                  {_l('数据和程序归属权')}
                  <br />
                  1.
                  {_l(
                    '用户在明道云平台创建的独创性数据归属客户所有，客户有权进行任何形式的处置，包括从平台中复制，导出和删除（额外导出服务按量另行收费）。',
                  )}
                  <br />
                  2.
                  {_l(
                    ' 明道云的应用程序、源代码、LOGO、界面设计、应用程序编程接口（API）所关联的所有知识产权均归属明道云运营企业。',
                  )}
                  <br />
                  <br />
                  {_l('用户隐私权和信息保密')}
                  <br />
                  1.
                  {_l(
                    ' 明道云应当从组织结构和技术角度尽最大努力保护用户数据安全，只根据用户在网站上的行为指示来分发用户的信息。明道云永远不会将用户产生的具体数据提供任何无关第三方。',
                  )}
                  <br />
                  <div className="printMt"></div>
                  2.{_l(' 明道云保留使用汇总统计性信息的权利，这些信息应当是匿名，且不是针对特定用户的。')}
                  <br />
                  <br />
                  {_l('服务连续性')}
                </td>
                <td className="w415 pRight10 TxtTop">
                  1.
                  {_l(
                    '对高级模式用户，明道云承诺提供服务期内99%的正常服务率，因产品更新而预先通知的小于一小时的停机维护应当视作正常服务范围。在发生需要从备份文件中恢复数据的情形时，明道云通常需要4小时，最长48小时完成，在此时间范围内的数据恢复视作服务是连续的。',
                  )}
                  <br />
                  2.{_l(' 因重大自然灾害，战争等不可抗力导致的明道云服务中断和长时间终止，明道云不承担赔偿责任。')}
                  <br />
                  <br />
                  {_l('计费和支付')}
                  <br />
                  1.{' '}
                  {_l('明道云高级模式用户包中所限定的用户数是指客户网络中所有生效的用户总数，邀请的外部用户不计算。')}
                  <br />
                  2.{' '}
                  {_l(
                    '客户应当按照本订单载明的支付义务及时支付价款，用户逾期支付账单超过30天后系统会停止高级模式服务，而转入免费模式，用户在高级模式下的设定参数数据可能因此丢失或恢复缺省设置。即使在停止高级模式服务后，任何未支付的账单均会作为客户的欠款，明道云保留追讨欠款及滞纳金的权利，滞纳金将根据拖欠天数，每天按欠款金额的万分之五计收。',
                  )}
                  <br />
                  3.
                  {_l(
                    '明道云授权期限到期后，如果未能及时购买续约包，用户高级模式自动终止。用户如需要继续使用明道云高级模式，需要在授权到期前至少三个工作日内签订续约订单。',
                  )}
                  <br />
                  <br />
                  {_l(' 应用定制服务交付')}
                  <br />
                  1.
                  {_l(
                    '乙方保证应用定制服务满足甲方的需求，所述需求内容以甲乙双方沟通确认的“需求表”所描述内容为准，服务在“需求表”所述内容范围内修订，可由甲乙双方协商调整，超出“需求表”内容，则由乙方对于新需求重新报价。',
                  )}
                  <br />
                  2.
                  {_l(
                    '购买行业标准应用解决方案的甲方，有权向乙方提出行业方案的新需求和修改建议，最终由乙方统一评定采纳，行业标准应用解决方案的后续统一升级更新由乙方负责。甲方如需对行业标准应用解决方案个性化调整服务，则由乙方与实际应用方案提供者协商报价。',
                  )}
                  <br />
                  3.
                  {_l(
                    '应用定制服务交付验收后，甲方应当在乙方提供的应用定制服务交付通知书签字确认，作为服务交付的依据。甲方在收到交付通知书后7日内无异议的，则认为甲方已经确认服务交付完成。',
                  )}
                  <br />
                  <br />
                  <div className="printMt"></div>
                  {_l('争议解决')}
                  <br />
                  {_l('双方同意就本合同无法协商的争议，按照中华人民共和国法律通过合同管辖地的人民法院诉讼解决。')}
                </td>
              </tr>
            </table>
          </div>
          <br />
          <br />
        </div>
      </div>
    );
  }
}

const WrappedComp = preall(ContractCom, { allownotlogin: true });

ReactDOM.render(<WrappedComp />, document.querySelector('#contractWrap'));
