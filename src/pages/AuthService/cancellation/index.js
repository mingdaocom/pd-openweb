import React, { Component, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import moment from 'moment';
import { LoadDiv, RichText, VerifyPasswordInput } from 'ming-ui';
import { Button, Checkbox } from 'ming-ui/antd-components';
import verifyPassword from 'ming-ui/functions/verifyPassword';
import accountAjax from 'src/api/account';
import preall from 'src/common/entries/preall';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { mdAppResponse } from 'src/utils/services/project';
import { Wrap } from './style.jsx';

const CHECKBOX_LABEL_STYLES = {
  label: { paddingInlineEnd: 0 },
};

const getActionMsg = () => ({
  0: _l('操作失败'),
  1: _l('操作成功'),
  2: _l('验证密码错误！'),
  3: _l('您尚有未退出的组织，请先至 个人中心-我的组织 退出所有组织，方可注销！'),
  4: _l('账号已申请注销！'),
  5: _l('state过期或错误！'),
});
export default class Cancellation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      second: 30,
    };
    this.requestPending = false;
    this.timer = null;
    this.loginStateTimer = null;
  }
  componentDidMount() {
    this.checkLogoutStatus();
  }
  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  checkLogoutStatus = () => {
    const { state, createStateTime = moment().format('YYYY-MM-DD HH:mm:ss') } = localStorage.getItem('loginStatus')
      ? JSON.parse(localStorage.getItem('loginStatus'))
      : {};

    if (!state) {
      this.setState({ loading: false, step: 1 });
      return;
    }

    this.setState({ loading: true });
    accountAjax
      .getApplyLogOffAccount({ state })
      .then(res => {
        if (res === 0 || res === 5) {
          location.href = pathCompletion('/login');
        } else {
          this.setState(
            {
              step: 3,
              createTime: (res || {}).createTime,
              createStateTime,
              overdueDiff: moment(createStateTime).add(5, 'm').diff(moment(), 's'),
              loading: false,
            },
            () => {
              this.getLoginStateCountDown();
            },
          );
        }
      })
      .catch(() => {
        location.href = pathCompletion('/login');
      });
  };
  confirmPassword = () => {
    const { password = '' } = this.state;
    const _this = this;

    verifyPassword({
      password: password.trim(),
      success: () => {
        _this.setState({ step: 2 });
        _this.getCountDown();
      },
    });
  };
  applyCancellation = () => {
    const { second, checkedAgree } = this.state;

    if (second || !checkedAgree || this.requestPending) return;

    this.requestPending = true;
    return accountAjax
      .applyLogOffAccount({})
      .then(res => {
        const type = res === 0 || res === 5 ? 2 : res === 1 ? 1 : 3;

        alert(getActionMsg()[res], type);
        if (res === 1) {
          window.location.href = pathCompletion('/login');
        }

        if (window.isMingDaoApp) {
          mdAppResponse({
            type: 'native',
            sessionId: 'Native test session',
            settings: { action: 'deleteAccount' },
          });
        }
      })
      .finally(() => {
        this.requestPending = false;
      });
  };
  renderInputPassword = () => {
    return (
      <Fragment>
        <div className="Font13 Bold  mBottom16 w300 TxtLeft">{_l('请输入登录密码确认注销操作')}</div>
        <VerifyPasswordInput onChange={({ password }) => this.setState({ password })} />
        <Button type="primary" onClick={this.confirmPassword}>
          {_l('下一步')}
        </Button>
      </Fragment>
    );
  };
  getCountDown = () => {
    this.timer = setInterval(() => {
      const { second } = this.state;

      if (second <= 0) {
        clearInterval(this.timer);
      } else {
        this.setState({ second: second - 1 });
      }
    }, 1000);
  };

  showProtocol = () => {
    const { second, checkedAgree, summary = '' } = this.state;

    const isMobile = browserIsMobile();

    return (
      <Fragment>
        <div className={cx('privacyContent', { mLeft24: isMobile, mRight16: isMobile })}>
          <div className="termsDiv">
            {!(window.platformENV.isOverseas || window.platformENV.isLocal) ? (
              <>
                <div>
                  <div className="titleMain">{_l('明道云用户使用条款')}</div>
                  <p className="desMain">{_l('最新更新：2021年11月30日')}</p>
                </div>
                <div className="sytkcon">
                  <div className="sytkConTitle">{_l('一、约定')}</div>
                  <p>
                    {_l(
                      '1.本协议是明道云用户（包括使用的个人和代表的企业）与明道云运营企业上海万企明道软件有限公司之间的协议，用户注册明道云服务即代表接受本协议的约束，并自注册成功之时即成为本协议一方，付费版用户签署本协议并回传（包括使用传真，电子邮件等电子通信手段）给明道云即代表接受本协议中的计费和支付协议，并自发出协议之时即受该等协议约束。',
                    )}
                  </p>
                  <p>{_l('2. 本协议受中华人民共和国法律管辖，合同的签约地为上海。')}</p>
                  <p className="bold">
                    {_l(
                      '3.请您务必审慎阅读、充分理解各协议内容，特别是免除或者限制责任的协议、争议解决和法律适用协议。免除或者限制责任的协议可能将以加粗字体显示，您应重点阅读。',
                    )}
                  </p>
                  <p>
                    {_l(
                      '下文中的“明道云”指应用平台“明道云”（包括但不限于明道云网页、明道云App以及明道云微信小程序）或其运营企业上海万企明道软件有限公司，也是本协议的契约方之一。',
                    )}
                  </p>
                  <div className="sytkConTitle">{_l('二、账号管理')}</div>
                  <p>
                    {_l(
                      '1.明道云用户注册账号时应提交真实、准确、完整的信息，不得违反国家法律法规及本使用协议，未经他人许可不得使用他人名义注册账号，不得恶意注册账号。',
                    )}
                  </p>
                  <p>
                    {_l(
                      '2.明道云账号的所有权及相关权益属于明道云所有，明道云用户不得以任何方式转让或向提供他人使用其使用的明道云账号，否则明道云有权立即不经通知收回该账号，由此带来的因明道云用户使用明道云产品产生的全部数据、信息等被清空、丢失等损失，明道云用户应自行承担。',
                    )}
                  </p>
                  <p className="bold">
                    {_l(
                      '3.明道云用户应当对其明道云账户下的一切行为负责，包括发布的任何内容以及由此产生的任何后果。明道云不对用户使用明道云服务而上传、存储或共享的内容承担任何责任。',
                    )}
                  </p>
                  <p>
                    {_l('4.明道云的用户可以通过')}
                    <a href="/privacy" target="_blank" style={{ color: 'var(--color-primary)' }}>
                      {_l('《明道云隐私政策》')}
                    </a>
                    {_l('中所述方式注销账户。')}
                  </p>
                  <p>
                    {_l(
                      '5.明道云用户注销明道云账户的行为，将导致明道云终止提供服务，也将终止给明道云用户提供的外部门户服务。注销成功后，明道云将删除用户的个人信息，使其保持不可被检索、访问的状态，或对其进行匿名化处理。如果明道云用户仍执意注销账户，其账户需同时满足以下条件：',
                    )}
                    <br />
                    {_l('1)明道云账户中无资产、无欠款；')} <br />
                    {_l('2)不存在已提供服务但未支付的功能/服务；')} <br />
                    {_l('3)账户为正常使用中的账户且无任何账户被限制的记录；')} <br />
                    {_l('4)账户下无任何纠纷，包括投诉举报和被投诉举报；')} <br />
                    {_l('5)账户已经解除了与其他第三方账户的绑定。')}
                  </p>
                  <p className="bold">
                    {_l(
                      '6.在明道云账户注销期间，如果用户的明道云账户涉及争议纠纷，包括但不限于投诉、举报、诉讼、仲裁、国家有权机关调查等，明道云有权自行终止本账户的注销而无需另行获得明道云用户的同意。',
                    )}
                  </p>
                  <p className="bold">
                    {_l(
                      '7.请明道云用户在提交注销申请前，务必解绑其他相关的第三方账户，具体操作方式可与我们的客服联系。',
                    )}
                  </p>
                  <p className="bold">
                    {_l(
                      '8.明道云账户一旦被注销将不可恢复，请明道云用户在操作之前自行备份账户相关的所有信息和数据。注销明道云账户，明道云用户将无法再使用本明道云账户，也将无法找回用户的明道云账户中及与账户相关的任何内容或信息（即使使用相同的手机号码再次注册并使用明道云软件），包括但不限于：',
                    )}
                  </p>
                  <p>
                    {_l('1)无法登录、使用明道云账户；')}
                    <br />
                    {_l('2)明道云账户的个人资料和历史信息都将无法找回；')}
                    <br />
                    {_l(
                      '3)通过明道云账号进行登录的明道云旗下APP（包括但不限于明道云APP等）所有记录都将无法找回。无法再登录、使用前述服务，曾获得的SaaS服务、外部用户包、工作流执行行数付费包、应用附件上传量扩充包等视为自行放弃，将无法继续使用。明道云用户应当理解并同意，明道云无法协助重新恢复前述服务。',
                    )}
                  </p>
                  <p className="bold">
                    {_l('9.注销本明道云账户并不代表本明道云账户注销前用户在该账户下的行为和相关责任得到豁免或减轻。')}
                  </p>
                  <div className="sytkConTitle">{_l('三、合法使用')}</div>
                  <p>
                    {_l(
                      '1.明道云服务限于提供给客户用作正常和合法业务工具，客户如果使用明道云产品从事以下行为，将导致根本性违约，明道云有权随时停止服务、解除本协议，并追讨因此带来的损失：',
                    )}
                    <br />
                    {_l('1)客户使用明道云用于违反法律的业务；')}
                    <br />
                    {_l('2)对明道云产品进行了任何形式的对其他第三方的再授权使用，销售或转让；')}

                    <br />
                    {_l('3)为设计开发竞争产品对明道云产品进行任何形式的反向工程，或在竞争产品抄袭模仿明道云的设计；')}

                    <br />
                    {_l('4)滥用明道云产品的通信功能发送垃圾邮件和短信；')}

                    <br />
                    {_l('5)对明道云的连续服务和商誉构成损害的其他行为，包括对明道云服务器的攻击。')}
                  </p>
                  <p>
                    {_l(
                      '2.明道云使用客户所拥有的手机号作为用户权证的唯一识别信息。当客户不再拥有在明道云登记的手机号时，明道云有权终止提供服务，客户亦可以通过变更手机号的方式继续使用明道云服务。在付费版下，系统支持多个域名电子邮件地址，当最早登记的主域名权属发生改变时，明道云有权终止提供服务。',
                    )}
                  </p>
                  <p>
                    {_l(
                      '3.明道云用户须对自己在网上的言论和行为承担法律责任，若在明道云产品上散布和传播反动、色情或其它违反国家法律的信息，本公司的系统记录有可能作为明道云用户违反法律的证据。',
                    )}
                  </p>
                  <p>
                    {_l(
                      '4.本使用协议依据国家相关法律法规规章制定，明道云用户同意严格遵守以下义务：（1）不得利用明道云产品从事洗钱、窃取商业秘密、窃取个人信息等违法犯罪活动；（2）不得干扰明道云产品的正常运转，不得明道云产品及国家计算机信息系统；（3）不得传输或发表任何违法犯罪的、骚扰性的、中伤他人的、辱骂性的、恐吓性的、伤害性的、庸俗的、不文明的等信息；（4）不得教唆他人从事违法违规或本使用协议所禁止的行为；（5）不得利用在明道云注册的账户买卖进行牟利性经营活动；（6）不得发布任何侵犯他人个人信息、著作权、商标权等知识产权或合法权利的内容；',
                    )}
                  </p>
                  <p>
                    {_l(
                      '5.除非法律允许或本公司书面许可，使用明道云产品过程中不得从事下列行为：（1）删除明道云产品及其副本上关于著作权的信息；（2）对明道云产品进行反向工程、反向汇编、反向编译，或者以其他方式尝试发现明道云产品的源代码；（3）对明道云拥有知识产权的内容进行使用、出租、出借、复制、修改、链接、转载、汇编、发表、出版、建立镜像站点等；（4）对明道云产品或其运行过程中释放到任何终端内存中的数据、运行过程中客户端与服务器端的交互数据，以及明道云产品运行所必需的系统数据，进行复制、修改、增加、删除、挂接运行或创作任何衍生作品，形式包括但不限于使用插件、外挂或非经明道云授权的第三方工具/服务接入明道云产品和相关系统；（5）通过修改或伪造明道云产品运行中的指令、数据，增加、删减、变动明道云产品的功能或运行效果，或者将用于上述用途的软件、方法进行运营或向公众传播，无论这些行为是否为商业目的；（6）通过非明道云开发、授权的第三方软件、插件、外挂、系统，登录或使用明道云产品及服务，或制作、发布、传播上述工具；（7）自行或者授权他人、第三方软件对明道云产品及其组件、模块、数据进行干扰。',
                    )}
                  </p>
                  <p>
                    {_l(
                      '6.明道云用户不得制作、传输或发表以下违法信息：反对宪法所确定的基本原则的；危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；损害国家荣誉和利益的；歪曲、丑化、亵渎、否定英雄烈士事迹和精神，以侮辱、诽谤或者其他方式侵害英雄烈士的姓名、肖像、名誉、荣誉的；宣扬恐怖主义、极端主义或者煽动实施恐怖活动、极端主义活动的；煽动民族仇恨、民族歧视，破坏民族团结的；破坏国家宗教政策，宣扬邪教和封建迷信的；散布谣言，扰乱经济秩序和社会秩序的；散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；侮辱或者诽谤他人，侵害他人名誉、隐私和其他合法权益的；法律、行政法规禁止的其他内容。',
                    )}
                  </p>
                  <p>
                    {_l(
                      '7.明道云用户必须防范和抵制制作、复制、发布含有下列内容的不良信息：使用夸张标题，内容与标题严重不符的；炒作绯闻、丑闻、劣迹等的；不当评述自然灾害、重大事故等灾难的；带有性暗示、性挑逗等易使人产生性联想的；展现血腥、惊悚、残忍等致人身心不适的；煽动人群歧视、地域歧视等的；宣扬低俗、庸俗、媚俗内容的；可能引发未成年人模仿不安全行为和违反社会公德行为、诱导未成年人不良嗜好等的；其他对网络生态造成不良影响的内容。',
                    )}
                  </p>
                  <div className="sytkConTitle">{_l('四、数据和程序归属权')}</div>
                  <p>
                    {_l(
                      '1.用户在明道云平台创建的独创性数据归属客户所有，客户有权进行任何形式的处置，包括从平台中复制、导出和删除。',
                    )}
                  </p>
                  <p>
                    {_l(
                      '2.除非另有书面声明，明道云的网站、应用程序、源代码、LOGO、界面设计、应用程序编程接口（API）、以及明道云产品中的内容、图表、版式设计、网页、文字、图片、图像、色彩、地图、图标、音频、视频、电子文档、数据资料等，以及用于开发、维护、运营上述内容和信息的基础设施和平台，包括但不限于软件、网站、应用程序及其源代码、系统数据等所关联的所有知识产权（包括但不限于专利权、著作权、商标权、商业秘密及对数据享有的财产性权利）均归属上海万企明道软件有限公司。',
                    )}
                  </p>
                  <div className="sytkConTitle">{_l('五、用户隐私权')}</div>
                  <p>
                    {_l(
                      '1.明道云应当从组织结构和技术角度尽最大努力保护用户数据安全，只根据用户在网站上的行为指示来分发用户的信息。明道云永远不会将用户产生的具体数据提供给任何无关第三方。',
                    )}
                  </p>
                  <p>{_l('2.明道云保留使用汇总统计性信息的权利，这些信息应当是匿名，且不是针对特定用户的。')}</p>
                  <p>
                    {_l(
                      '3.明道云保留面向免费模式用户刊载广告的权利，这些广告刊载过程中将可能使用必要的定向技术来提高广告相关度，但明道云不会将用户的个人信息透露给广告商，而只会在匿名的基础上通过自动化匹配技术实现广告优化刊载。',
                    )}
                  </p>
                  <p>
                    {_l(
                      '4.如果明道云用户想要行使个人信息权利，或者想了解明道云如何处理其个人信息，请认真阅读《明道云隐私政策》，明道云将按照本协议以及《明道云隐私政策》的规定收集、使用、共享、储存和保护明道云用户的个人信息。本使用协议对个人信息保护相关内容未作明确规定的，均应以《明道云隐私政策》的内容为准。',
                    )}
                  </p>
                  <p>{_l('5.《明道云隐私政策》构成本使用协议不可分割的一部分。')}</p>
                  <div className="sytkConTitle">{_l('六、服务连续性')}</div>
                  <p className="bold">
                    {_l(
                      '1.明道云将尽最大努力保障软件平台的连续可靠运行，对付费版用户，明道云承诺99%以上的正常在线率，低于此比例，明道云有义务按照服务中断时间比例向客户退还相应的服务费用，客户理解该等赔偿。明道云对免费模式用户不提供任何补偿。',
                    )}
                  </p>
                  <p className="bold">
                    {_l(
                      '2.明道云将尽最大努力保障客户数据的安全备份，对付费版用户，明道云承诺在有任何用户数据因服务器存储设备损坏时以最快的速度从最近的备份中恢复数据，但无法承诺100%的数据恢复，对因数据丢失带来的其他连带或间接损失不承担任何责任。',
                    )}
                  </p>
                  <p>
                    {_l(
                      '3.在发生需要从备份文件中恢复数据的情形时，明道云通常需要4小时，最长48小时完成，在此时间范围内的数据恢复视作服务是连续的。',
                    )}
                  </p>
                  <div className="sytkConTitle">{_l('七、责任限制')}</div>
                  <p>
                    {_l(
                      '1.服务将按照“现状”和“可得到”的状态提供。明道云在此明确声明，除本协议有明确约定外，明道云对服务不作任何明示或暗示的保证，包括但不限于对服务的适用性、准确性、持续性、可靠性、服务没有错误或疏漏等。',
                    )}
                  </p>
                  <p>
                    {_l(
                      '2.不论在何种情况下，明道云不对由于网络连接故障、电脑或系统故障、电力故障、罢工、暴乱、火灾、洪水、爆炸、战争、政府行为、疫情等情况造成的不能服务或延迟服务承担任何责任。',
                    )}
                  </p>
                  <p>{_l('3.明道云不对任何间接的、惩罚性的、突发性的损害或利益损失承担责任。')}</p>
                  <p>
                    {_l(
                      '4.如因用户违反本协议、法律法规要求、用户未能履行付款义务或用户注销账户等造成数据丢失、删除、毁损的，明道云不承担任何责任，用户应自行负责对数据进行备份。',
                    )}
                  </p>
                  <p className="bold">
                    {_l(
                      '5.在法律允许的范围内，明道云对因：（1）明道云产品受到计算机病毒、木马或其他恶意程序、黑客攻击的破坏；（2）明道云用户操作不当或用户通过非明道云授权的方式使用本服务；（3）程序版本过时、设备的老化和/或其兼容性问题；（4）其他明道云无法控制或合理预见的情形，导致的明道云服务中断或终止，不承担赔偿责任。',
                    )}
                  </p>
                  <div className="sytkConTitle">{_l('八、第三方产品和服务')}</div>
                  <p>
                    {_l(
                      '在向用户提供服务的过程中，明道云可能会接入第三方的产品或服务，该产品或服务由明道云以外的第三方提供。在法律允许的范围内，明道云不对第三方的产品或服务承担任何责任。用户需遵守所有第三方的产品或服务的使用条款和隐私政策。',
                    )}
                  </p>
                  <div className="sytkConTitle">{_l('九、违约与赔偿')}</div>
                  <p>
                    {_l(
                      '1.如果明道云用户违反本协议，明道云有权根据独立判断，采取适当的处置措施，包括但不限于随时删除或屏蔽内容，或暂停向用户提供部分或全部服务等。',
                    )}
                  </p>
                  <p>
                    {_l(
                      '2.如果用户违反相关法律法规，明道云有权采取适当的法律措施，并根据相关法律法规的要求保存相关信息，并向有关主管部门报告、配合有关主管部门调查。',
                    )}
                  </p>
                  <p className="bold">
                    {_l(
                      '3.若因用户违反本协议或其他应当遵守的条款引起的任何索赔、要求或损失，用户应当承担全部责任。由此给明道云或关联方等主体造成的任何损失，用户也应承当全部赔偿责任。',
                    )}
                  </p>
                  <div className="sytkConTitle">{_l('十、计费和支付')}</div>
                  <p>
                    {_l(
                      '1.明道云付费版用户包中所限定的用户数是指客户网络中所有生效的用户总数，包括正常用户，屏蔽、移除、标疑但当月有过登录记录的用户，员工离职后正常关闭且实际无登录的用户不计算。',
                    )}
                  </p>
                  <p>
                    {_l(
                      '2.客户应当按照本订单载明的支付义务及时支付价款，用户逾期支付账单超过30天后系统会停止付费版服务，而转入免费模式，用户在付费版下的设定参数数据可能因此丢失或恢复缺省设置。即使在停止付费版服务后，任何未支付的账单均会作为客户的欠款，明道云保留追讨欠款及滞纳金的权利，滞纳金将根据拖欠天数，每天按欠款金额的万分之五计收。',
                    )}
                  </p>
                  <div className="sytkConTitle">{_l('十一、付费版服务终止')}</div>
                  <p>
                    {_l(
                      '明道云授权期限到期后，如果未能及时购买续约包，用户付费版自动终止。用户如需要继续使用明道云付费版，需要在授权到期前至少三个工作日内签订续约订单。',
                    )}
                  </p>
                  <div className="sytkConTitle">{_l('十二、协议修订')}</div>
                  <p>{_l('1.明道云有权随时对本协议的协议进行修订，并在修订生效日前一个工作日更新在明道云网站。')}</p>
                  <p>{_l('2.明道云有权对付费版的定价进行修订，并在修订生效日前一个月通告给所有付费版用户。')}</p>
                  <p>{_l('3.修订的协议始终公开在：www.mingdao.com/terms')}</p>
                  <div className="sytkConTitle">{_l('十三、争议解决')}</div>
                  <p>
                    {_l(
                      '如果就本协议的解释或执行发生争议，双方应首先力争通过友好协商解决该争议。如果在一方向其他方送达要求开始协商的书面通知后六十天内未能通过协商解决争议，那么任何一方均可将争议提交至中国国际经济贸易仲裁委员会上海分会，按照其届时有效的规则进行仲裁。仲裁裁决是终局的，对各方均有约束力，不可上诉。仲裁费用由败诉方承担，除非仲裁裁决另有规定。当任何争议发生时以及在对任何争议进行仲裁时，除争议事项外，各方应继续行使各自在本协议项下的其他权利，履行各自在本协议项下的其他义务。',
                    )}
                  </p>
                  <div className="sytkConTitle">{_l('十四、联系我们')}</div>
                  <p>
                    {_l(
                      '如果您对本协议或明道云产品有任何意见或建议，可通过feedback@mingdao.com与我们取得联系，我们会给予您必要的帮助。',
                    )}
                  </p>
                </div>
              </>
            ) : (
              <RichText data={summary || ''} disabled={true} backGroundColor={'#fff'} />
            )}
          </div>
        </div>
        <div className="protocol TxtLeft flexRow alignItemsCenter mTop24">
          <Checkbox
            checked={checkedAgree}
            styles={CHECKBOX_LABEL_STYLES}
            onChange={event =>
              this.setState({
                checkedAgree: event.target.checked,
              })
            }
          >
            <span className="Font20">{_l('同意（注销后15天内可撤销操作）')}</span>
          </Checkbox>
        </div>
        <Button
          type="primary"
          className="mTop40"
          disabled={Boolean(second) || !checkedAgree}
          onClick={this.applyCancellation}
        >
          {_l('确认注销')}
          {second ? `（${second}s）` : ''}
        </Button>
      </Fragment>
    );
  };
  revokeApply = () => {
    const { state } = localStorage.getItem('loginStatus') ? JSON.parse(localStorage.getItem('loginStatus')) : {};

    window
      .mdyAPI(
        '',
        '',
        { state },
        {
          ajaxOptions: { url: `${md.global.Config.AjaxApiUrl}Account/CancelLogOffAccount?state=${state}` },
        },
      )
      .then(data => {
        let type = data === 0 || data === 5 ? 2 : data === 1 ? 1 : 3;
        alert(getActionMsg()[data], type);
        if (data === 1) {
          // 撤销申请跳转至登录页
          window.location.href = pathCompletion('/login');
        }
      });
  };
  getLoginStateCountDown = () => {
    const { overdueDiff } = this.state;

    if (overdueDiff <= 0) {
      clearInterval(this.loginStateTimer);
      this.loginStateTimer = null;
    }

    this.loginStateTimer = setInterval(() => {
      this.countDown();
    }, 1000);
  };
  countDown = () => {
    const { overdueDiff } = this.state;
    let min = Math.floor(overdueDiff / 60);
    let sec = overdueDiff % 60;
    let overdueDate = min ? (sec > 0 ? _l('%0 分 %1 秒', min, sec) : _l('%0 分', min)) : _l('%0 秒', sec);
    this.setState({ overdueDate, overdueDiff: overdueDiff - 1 });
  };

  renderHasApplyLogout = () => {
    const { createTime, overdueDate = '', overdueDiff = 0 } = this.state;
    let diffValue = moment(createTime)
      .add(15 * 24, 'H')
      .diff(moment(), 'H');
    let days = Math.floor(diffValue / 24);
    let hours = diffValue % 24;
    let deadline = days
      ? hours > 0
        ? _l('%0 天 %1 小时', days, hours)
        : _l('%0 天', days)
      : hours > 0
        ? _l('%0 小时', hours)
        : _l('1 小时');

    return (
      <Fragment>
        <div className="Font13 Bold mBottom9">
          {_l('您于%0  申请账号注销', moment(createTime).format('YYYY-MM-DD'))}
        </div>
        <div className="Font13 Bold">
          {_l('账号将在')}
          <span className="mLeft3"> {deadline}</span>
          {_l('后正式注销，不可撤销！')}
        </div>
        {overdueDiff > 0 ? (
          <div className="mTop50">
            {_l('如需撤销，请在')} <span className="colorPrimary mTop50 mBottom10 mLeft3 mRight3">{overdueDate} </span>
            {_l('内撤销申请')}
          </div>
        ) : (
          ''
        )}
        {overdueDiff > 0 ? (
          <Button type="primary" onClick={this.revokeApply} className="mTop10">
            {_l('撤销申请')}
          </Button>
        ) : (
          ''
        )}
      </Fragment>
    );
  };

  render() {
    const { loading } = this.state;

    const { step } = this.state;
    const isMobile = browserIsMobile();

    return (
      <Wrap>
        {!(window.platformENV.isOverseas || window.platformENV.isLocal) ? (
          <DocumentTitle
            title={_l('账户注销 - 明道云 | APaaS平台、零代码、hpaPaaS、iPaaS、BaaS、快速开发工具、中台应用')}
          />
        ) : (
          <DocumentTitle title={_l('账户注销')} />
        )}
        {loading ? (
          <LoadDiv />
        ) : (
          <div className="contentWrap pTop25">
            <div
              className={cx('contentBox flexColumn alignItemsCenter', {
                privacyHieght: step === 2,
                mobileContainerWidth: isMobile,
              })}
            >
              <div className="title Font24 Bold mTop40">{step !== 3 ? _l('账号注销') : _l('您的账号已申请注销')}</div>
              {step === 1 ? this.renderInputPassword() : step === 2 ? this.showProtocol() : this.renderHasApplyLogout()}
            </div>
          </div>
        )}
      </Wrap>
    );
  }
}

const Comp = preall(Cancellation, { allowNotLogin: true });
const root = createRoot(document.getElementById('app'));

root.render(<Comp />);
