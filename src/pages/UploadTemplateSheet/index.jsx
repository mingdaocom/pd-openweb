import React from 'react';
import DocumentTitle from 'react-document-title';
import sheetAjax from 'src/api/worksheet';
import { Icon, Support, Dialog } from 'ming-ui';
import copy from 'copy-to-clipboard';
import './index.less';
import _ from 'lodash';
import { FILTER_SYS, APPROVAL_SYS } from 'src/pages/Print/config';
import processVersionAjax from 'src/pages/workflow/api/processVersion';

// let controlNo = [22, 10010, 43, 45, 47]; //分割线、备注、OCR、嵌入字段,条码/
let controlNo = [22, 10010, 43, 45]; //分割线、备注、OCR、嵌入字段/
const qrcodeField = ['sharelink', 'privatelink', 'recordid'];
export default class UploadTemplateSheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      worksheetName: '',
      downLoadUrl: '',

      // 系统字段列表
      systemControl: [
        {
          controlId: 'caid',
          controlName: _l('创建人'),
          type: 26,
        },
        {
          controlId: 'ownerid',
          controlName: _l('拥有者'),
          type: 26,
        },
        {
          controlId: 'ctime',
          controlName: _l('创建时间'),
          type: 16,
        },
        {
          controlId: 'utime',
          controlName: _l('最近修改时间'),
          type: 16,
        },
        // {
        //   controlId: 'qrCode',
        //   controlName: _l('二维码'),
        //   type: 16,
        // },
        {
          controlId: 'sharelink',
          controlName: _l('二维码（公开分享链接）'),
          type: 16,
          size: '20*20',
        },
        {
          controlId: 'privatelink',
          controlName: _l('二维码（内部访问链接）'),
          type: 16,
          size: '20*20',
        },
        {
          controlId: 'recordid',
          controlName: _l('条形码（记录ID）'),
          type: 16,
          size: '40*10',
        },
      ],
      cardControls: [],

      // 页面是否支持滑动
      scroll: true,
      approvalList: [],
    };
  }

  componentWillMount() {}

  componentDidMount() {
    (async () => {
      // 显示模板打印弹框
      $('html').addClass('uploadTemplateSheet');
      const { match } = this.props;
      const { worksheetId } = match.params;
      const { systemControl } = this.state;

      // 通过API获取项目详情信息
      const res = await sheetAjax.getWorksheetInfo({
        getTemplate: true,
        worksheetId: worksheetId,
      });

      const { template = [] } = res;
      const { controls = [] } = template;

      // 获取子表
      for (let i = 0; i < controls.length; i++) {
        if (controls[i].type != 34) continue;
        const { type } = await sheetAjax.getWorksheetInfo({
          getTemplate: true,
          worksheetId: controls[i].dataSource,
        });

        // 判断是否为空白创建的子表
        controls[i].isEmptyControl = type == 2;
      }

      // 通过API获取关联表的属性
      const { data } = await sheetAjax.getWorksheetsControls({
        appId: res.appId,
        worksheetIds: _.map(
          controls.filter(i => [29, 34, 51].includes(i.type)),
          'dataSource',
        ),
        handControlSource: true,
      });

      const commonControls = [];
      const cardControls = [];
      for (let i = 0; i < controls.length; i++) {
        const { type, advancedSetting, showControls = [], dataSource } = controls[i];

        // 获取关联字段
        const controlList = (data.find(o => dataSource === o.worksheetId) || {}).controls || [];
        controls[i].controlList = controlList;
        controls[i].relationControls = showControls
          .map(showControl =>
            _.find(
              controlList.concat(systemControl),
              control => control.controlId === showControl && !controlNo.includes(control.type),
            ),
          )
          .filter(c => c);

        // 是否展开
        controls[i].expandControls = false;
        controls[i].showDialog = false;

        // 是否为关联记录（列表）、子表
        const isRalate = (type == 29 && advancedSetting && advancedSetting.showtype === '2') || type == 34 || (type == 51 && advancedSetting && advancedSetting.showtype === '2');
        if (isRalate) cardControls.push(controls[i]);
        else commonControls.push(controls[i]);
      }

      // 流程列表
      const approval = await processVersionAjax.list({
        relationId: res.appId,
        processListType: 11,
      });

      this.setState({
        appId: res.appId,
        worksheetName: res.name,

        // 普通字段
        controls: commonControls.sort((a, b) => {
          if (a.row === b.row) {
            return a.col - b.col;
          }
          return a.row - b.row;
        }),

        // 关联表、子表字段
        cardControls,
        downLoadUrl: res.downLoadUrl,
        approvalList: (approval.find(l => l.groupId === worksheetId) || { processList: [] }).processList.map(l => {
          return { ...l, expandControls: false };
        }),
      });

      // 剪切板功能
      this.copy();

      // 下载功能
      $('.urlForTel').on('click', () => {
        this.downTem();
      });
    })().catch(console.error);
  }

  componentWillUnmount() {
    $('html').removeClass('uploadTemplateSheet');
  }

  /**
   * 打开弹层显示所有字段
   */
  openDialog = it => {
    it.showDialog = true;
    $('.uploadTemplateSheet').css('overflow-y', 'hidden');
    this.setState({
      scroll: false,
    });
  };

  /**
   * 关闭弹层显示的字段
   */
  closeDialog = it => {
    it.showDialog = false;
    $('.uploadTemplateSheet').css('overflow-y', 'auto');
    this.setState({
      scroll: true,
    });
  };

  copy = () => {
    $('body').on('click', 'i.copy', function () {
      if ($(this).closest('.copySpan').length) {
        copy($(this).closest('.copySpan').text());
        alert(_l('复制成功'));
      }
    });
  };

  renderIcon = () => {
    return (
      <span title={_l('复制')}>
        <Icon icon="content-copy" className="copy" />
      </span>
    );
  };

  strQrcodeField = (it, alias = false) => {
    const { controls } = this.state;
    const { enumDefault, dataSource } = it;
    let ISBN = 'ISBN号';
    if (it.enumDefault2 === 1) {
      ISBN = 'privatelink';
    } else if (alias) {
      ISBN = it.dataSource.slice(1, -1);
    } else {
      let control = controls.find(l => l.controlId === it.dataSource.slice(1, -1));
      control && (ISBN = control.controlName);
    }

    return `[${enumDefault === 1 ? 'barcode' : 'qrcode'}]${dataSource === '$rowid$' ? 'recordid' : ISBN}${
      enumDefault === 1 ? '$[40*10]$' : '$[20*20]$'
    }`;
  };

  renderItem = it => {
    const that = this;

    // 显示的子字段列表
    const showControls = (it.showControls || []).filter(o => {
      const data = it.relationControls.find(a => o === a.controlId);
      return data && data.attribute !== 1 && !controlNo.includes(data.type);
    });

    return (
      <React.Fragment>
        <div
          className="list"
          style={{ position: 'relative', left: [29, 51].includes(it.type) && it.showControls.length ? '-1em' : '0' }}
        >
          {/** 左侧展开子字段按钮 */}
          {[29, 51].includes(it.type) && it.showControls.length ? (
            <Icon
              icon={!it.expandControls ? 'arrow-right-tip' : 'arrow-down'}
              onClick={() => {
                const { controls } = that.state;
                it.expandControls = !it.expandControls;
                that.setState({ controls });
              }}
              className="copy Font13 pointer"
            />
          ) : (
            ''
          )}

          {/** 字段名称 */}
          <span
            className="pointer"
            onClick={() => {
              const { controls } = that.state;
              it.expandControls = !it.expandControls;
              that.setState({ controls });
            }}
          >
            {it.controlName}
          </span>

          {/** 点击复制图标 */}
          <span className="copySpan">
            {`#{${
              qrcodeField.indexOf(it.controlId) > -1
                ? `[${it.controlId === 'recordid' ? 'barcode' : 'qrcode'}]${it.controlId}`
                : it.type === 47
                ? this.strQrcodeField(it)
                : it.controlName
            }${[29, 51].includes(it.type) ? '[S]' : ''}${this.strForFile(it)}}`}
            {this.renderIcon()}
          </span>

          {/** 点击复制二维码图标 */}
          <span className="copySpan">
            {`#{${
              qrcodeField.indexOf(it.controlId) > -1 ? (it.controlId === 'recordid' ? '[barcode]' : '[qrcode]') : ''
            }${it.type === 47 ? this.strQrcodeField(it, true) : it.alias || it.controlId}${
              [29, 51].includes(it.type) ? '[S]' : ''
            }${this.strForFile(it)}}`}
            {[qrcodeField].indexOf(it.controlId) < 0 && this.renderIcon()}
          </span>
        </div>

        {/** 是否为关联表字段 */}
        {[29, 51].includes(it.type) &&
        it.expandControls &&
        it.showControls.length &&
        // 是否以卡片形式展现关联表
        it.advancedSetting &&
        it.advancedSetting.showtype !== '2' ? (
          <React.Fragment>
            {/** 字段列表 */}
            {showControls.map(o => {
              const control = (it.relationControls || []).find(a => o === a.controlId);
              // 过滤掉关联字段列表类型
              const isRealtionList =
                [29, 51].includes(control.type) && control.advancedSetting && control.advancedSetting.showtype === '2';
              // 是否为子表。分割线。备注
              const isNotSupport = [21, 34].concat(controlNo).includes(control.type);
              return isRealtionList || isNotSupport ? '' : this.renderRelaItem(it, control, true);
            })}

            {/** 点击查看所有字段 */}
            <div className="list" onClick={() => this.openDialog(it)}>
              <span className="showDialog">{_l('查看所有字段')}</span>
            </div>
          </React.Fragment>
        ) : (
          ''
        )}

        {/** 弹层显示关联表格的所有字段 */}
        {it.showDialog && (
          <Dialog
            showFooter={false}
            type="scroll"
            width={880}
            title={<span className="Bold">{it.controlName + _l('所有字段')}</span>}
            visible={it.showDialog}
            onCancel={() => this.closeDialog(it)}
            onOk={() => this.closeDialog(it)}
          >
            <div className="modallistCon">
              {/** 表头 */}
              <div className="list Bold">
                <span className="textIndent">{_l('字段名称')}</span>
                <span className="copySpan">{_l('字段代码')}</span>
                <span className="copySpan">{_l('字段ID/别名')}</span>
              </div>

              {/** 分割线 */}
              <p className="line" />

              {/** 弹层中的字段列表 */}
              {(it.controlList || []).map(o => {
                const { type, advancedSetting } = o;

                // 过滤掉关联字段列表类型
                const isRealtionList = [29, 51].includes(type) && advancedSetting && advancedSetting.showtype === '2';

                // 是否为子表、分割线、备注
                const isNotSupport = [21, 34].concat(controlNo).includes(type);
                return !isRealtionList && !isNotSupport ? this.renderRelaItem(it, o, true) : '';
              })}
            </div>
          </Dialog>
        )}
      </React.Fragment>
    );
  };

  /**
   * 兼容他表字段
   */
  strForFile = data => {
    let o = data.type === 30 ? { ...data, type: !data.sourceControlType ? data.type : data.sourceControlType } : data;
    if (qrcodeField.indexOf(o.controlId) > -1) {
      return o.size ? `$[${o.size}]$` : '';
    }
    return o.type === 42 || o.type === 14 || o.controlId === 'qrCode'
      ? `$[${o.type === 42 ? '48*20' : o.type === 14 ? '90*auto' : '20*20'}]$`
      : '';
  };

  /**
   * 关联表字段
   */
  renderRelaItem = (it, o, isRela) => {
    return (
      <div className="list">
        <span className="textIndent">{`${o.controlName}`}</span>
        <span className="copySpan">
          {`#{${it.controlName}.${o.controlName}${isRela ? '[S]' : ''}${this.strForFile(o)}}`}
          {this.renderIcon()}
        </span>
        <span className="copySpan">
          {`#{${it.alias || it.controlId}.${o.alias || o.controlId}${isRela ? '[S]' : ''}${this.strForFile(o)}}`}
          {this.renderIcon()}
        </span>
      </div>
    );
  };

  /**
   * 字段列表
   */
  renderList = () => {
    const { systemControl = [], cardControls = [], controls = [] } = this.state;
    const that = this;
    return (
      <div className="listCon">
        <div className="topHeader">
          <span className="Bold">{_l('字段名称')}</span>
          <span className="Bold">{_l('字段代码')}</span>
          <span className="Bold">{_l('字段ID/字段别名')}</span>
        </div>

        {/** 系统字段列表 */}
        <div className="title">{_l('系统字段')}</div>
        {systemControl.map(it => this.renderItem(it))}

        {/** 表单字段列表 */}
        <p className="line" />
        <div className="title">{_l('表单字段')}</div>
        <p className="mTop12 Gray_75">
          {_l(
            '当表单字段包含多个值时，默认以逗号隔开列出所有值。如需将关联表（卡片、下拉框）以表格方式逐行向下列出所有记录的字段值，可将字段代码或字段ID中的“[S]”去掉，并放在表格中使用。',
          )}
        </p>
        {controls.map(it => {
          if (
            !controlNo.includes(it.type) &&
            !systemControl.some(o => o.controlId == it.controlId) &&
            !FILTER_SYS.includes(it.controlId) //排除部分系统字段
          )
            return this.renderItem(it);
          else return '';
        })}

        {/** 关联记录、子表 */}
        {cardControls.length > 0 && (
          <React.Fragment>
            <p className="line" />
            <div className="title">{_l('子表、关联记录、查询记录（列表）')}</div>
            <p className="mTop12 Gray_75">
              <span>{_l('关联记录（列表）、子表中的字段支持三种打印方式。')}</span>
              <ol>
                <li className="Gray_75 pLeft12">
                  {_l(
                    '（1）表格打印（默认）：直接将字段代码放入表格中，在表格中逐行向下列出所有记录的字段值。如果要对相同值进行合并单元格，可在字段代码中加上“[M]”，如：#{客户.客户名称[M]}',
                  )}
                </li>
                <li className="Gray_75 pLeft12">
                  {_l(
                    '（2）逐条打印：关联记录（列表）中 每一条记录作为一个整体依次逐条打印。可以将以下代码插入到模板中，代码下方的内容将识别为记录的基本单元。',
                  )}
                </li>
                <li className="Gray_75 pLeft12">
                  {_l(
                    '（3）拼接打印：以逗号隔开列出所有记录的字段值。可在字段代码中加上“[S]”，如#{客户.客户名称[S]}。',
                  )}
                </li>
              </ol>
            </p>
            <p className="mTop12 Gray_75">
              {_l('查看')}
              <Support
                className="mRight5 supportVerticalTop"
                type={3}
                href="https://help.mingdao.com/operation18"
                text={_l('帮助文档')}
              />
              {_l('了解更多')}
            </p>

            {/** 字段列表 */}
            <div className="bgCon mTop18">
              <ul>
                <li>
                  <span>#{_l('关联表.整体重复')}#</span>
                  <span>
                    ——
                    {_l('单独一行放置在模板中，表示下方的明细记录需要一条条单独列出。')}
                  </span>
                </li>
              </ul>
            </div>

            {/* 关联记录（列表）、子表中的字段列表 */}
            {cardControls.map((it, i) => (
              <React.Fragment>
                {/** 分割线 */}
                {i + 1 <= cardControls.length && i > 0 && <p className="line" />}

                {/** 字段列表 */}
                <p
                  className="mTop20 Bold Font13 pointer"
                  style={{ left: '-1em', position: 'relative' }}
                  onClick={() => {
                    it.expandControls = !it.expandControls;
                    that.setState({ cardControls });
                  }}
                >
                  {/** 左侧展开子字段按钮 */}
                  <Icon icon={!it.expandControls ? 'arrow-right-tip' : 'arrow-down'} className="copy Font13" />
                  <span>{it.controlName}</span>
                </p>

                {/** 展开的字段列表 */}
                {it.expandControls && (
                  <React.Fragment>
                    {it.relationControls.map(o => this.renderRelaItem(it, o, false))}

                    {/** 点击查看所有字段 */}
                    {!it.isEmptyControl && (
                      <div className="list" onClick={() => this.openDialog(it)}>
                        <span className="showDialog">{_l('查看所有字段')}</span>
                      </div>
                    )}
                  </React.Fragment>
                )}

                {/** 弹层显示字段 */}
                {it.showDialog && (
                  <Dialog
                    showFooter={false}
                    type="scroll"
                    width={880}
                    title={<span className="Bold">{it.controlName + _l('所有字段')}</span>}
                    visible={it.showDialog}
                    onCancel={() => this.closeDialog(it)}
                    onOk={() => this.closeDialog(it)}
                  >
                    <div className="modallistCon">
                      {/** 表头 */}
                      <div className="list Bold">
                        <span className="textIndent">{_l('字段名称')}</span>
                        <span className="copySpan">{_l('字段代码')}</span>
                        <span className="copySpan">{_l('字段ID/别名')}</span>
                      </div>

                      {/** 分割线 */}
                      <p className="line" />

                      {/** 弹层中的字段列表 */}
                      {(it.controlList || []).map(o => {
                        const { type, advancedSetting } = o;

                        // 过滤掉关联字段列表类型
                        const isRealtionList = [29, 51].includes(type) && advancedSetting && advancedSetting.showtype === '2';

                        // 是否为子表。分割线。备注
                        const isNotSupport = controlNo.includes(type) || type == 34;
                        return !isRealtionList && !isNotSupport ? this.renderRelaItem(it, o, false) : '';
                      })}
                    </div>
                  </Dialog>
                )}
              </React.Fragment>
            ))}
          </React.Fragment>
        )}

        {/* 审批明细 */}
        <p className="line" />
        <div className="title">{_l('审批明细')}</div>

        <p className="mTop12 Gray_75">
          <span>{_l('审批明细字段支持三种打印方式。如果同一条审批流程被重复发起了多次，则只会打印发起时间最近的一次。')}</span>
          <ol>
            <li className="Gray_75 pLeft12">
              {_l(
                '（1）表格打印（默认）：直接将字段代码放入表格中，在表格中逐行向下列出所有记录的字段值。如果要对相同值进行合并单元格，可在字段代码中加上“[M]”，如：#{客户.客户名称[M]}',
              )}
            </li>
            <li className="Gray_75 pLeft12">
              {_l(
                '（2）逐条打印：关联记录（列表）中 每一条记录作为一个整体依次逐条打印。可以将以下代码插入到模板中，代码下方的内容将识别为记录的基本单元。',
              )}
            </li>
            <li className="Gray_75 pLeft12">
              {_l('（3）拼接打印：以逗号隔开列出所有记录的字段值。可在字段代码中加上“[S]”，如#{客户.客户名称[S]}。')}
            </li>
          </ol>
        </p>
        <p className="mTop12 Gray_75">
          {_l('查看')}
          <Support
            className="mRight5 supportVerticalTop"
            type={3}
            href="https://help.mingdao.com/operation18"
            text={_l('帮助文档')}
          />
          {_l('了解更多')}
        </p>
      </div>
    );
  };

  renderApprovalList = () => {
    const { approvalList } = this.state;

    return (
      <div className="listCon">
        <div className="bgCon mTop18">
          <ul>
            <li>
              <span>#{_l('审批.整体重复')}#</span>
              <span>
                ——
                {_l('单独一行放置在模板中，表示下方的明细记录需要一条条单独列出。')}
              </span>
            </li>
          </ul>
        </div>
        {approvalList.map((item, i) => (
          <React.Fragment>
            <p
              className="mTop20 Bold Font13 pointer"
              style={{ left: '-1em', position: 'relative' }}
              onClick={() => {
                item.expandControls = !item.expandControls;
                this.setState({ approvalList });
              }}
            >
              <Icon icon={!item.expandControls ? 'arrow-right-tip' : 'arrow-down'} className="copy Font13" />
              <span>{item.name}</span>
            </p>

            {item.expandControls && (
              <React.Fragment>
                {APPROVAL_SYS.map(l => (
                  <div className="list">
                    <span className="textIndent">{`${l.name}`}</span>
                    <span className="copySpan">
                      {`#{${_l('[审批]')}${item.name}.${l.name}${l.key === 'signature' ? '$[48*20]$' : ''}}`}
                      {this.renderIcon()}
                    </span>
                    <span className="copySpan">
                      {`#{${_l('[审批]')}${item.id}.${l.key}}`}
                      {this.renderIcon()}
                    </span>
                  </div>
                ))}
              </React.Fragment>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  downTem = () => {
    const { downLoadUrl } = this.state;
    const { match } = this.props;
    const { worksheetId } = match.params;
    let ajaxUrl = downLoadUrl + '/ExportWord/DownloadDefaultWord';
    let str = `<form action=${ajaxUrl} method="get" id="forms">
        <input type="hidden" name="worksheetId" value=${worksheetId} />
        <input type="hidden" name="accountId" value=${md.global.Account.accountId} />
        <input type="submit" value="提交"/>
    </form>`;
    $('body').append(str);
    $('#forms').submit().remove();
  };

  render() {
    const { worksheetName, scroll } = this.state;
    return (
      <React.Fragment>
        <DocumentTitle title={_l('制作模板 - %0', worksheetName || '')} />
        <div className="header">
          <span className="Font17 Bold">{_l('制作模板: %0', worksheetName)}</span>
        </div>
        <div className="con">
          <h5 className="pTop45 Font20 Gray">{_l('制作说明')}</h5>
          <div className="mTop20">
            <p className="Gray_75">
              {_l(
                '1. 复制你需要的字段代码然后粘贴到您本地 Word 模板（只支持docx格式）中相应的位置，打印时会获取实际数据中该字段填写的内容。',
              )}
            </p>
            <p className="Gray_75">
              {_l(
                '2. 字段代码必须按照表中的格式填写，否则无法获取到对应字段的数据；如果某两个字段的字段名称相同，为了系统能够识别请选择复制字段ID/字段别名用于制作模板。',
              )}
            </p>
            <p className="Gray_75">
              <span>
                {_l(
                  '3. 平铺类的选项字段如需打印未选中的选项，可在字段代码或ID/别名后加“_Alloptions”，例如：#{单选_Alloptions}。',
                )}
              </span>
            </p>
            <p className="Gray_75">
              {_l(
                '4. 可获取附件字段中的图片，字段代码为：#{附件$[90*auto_L]$}。其中：90*auto 表示图片宽/高尺寸（单位mm）；_L表示获取的图片质量。',
              )}
              <ol className="">
                <li className="Gray_75 pLeft12">
                  {_l(
                    '（1）图片尺寸支持4种设置方式。[90*auto] 表示宽度固定为90，高度自适应。[auto*90] 表示宽度自适应，高度固定为90。[90*50_auto]表示宽高在90*50的范围内同时自适应。[90*50]表示宽高为固定尺寸。',
                  )}
                </li>
                <li className="Gray_75 pLeft12">
                  {_l(
                    '（2）图片质量支持低、中、高三种设置（默认为低）。低（L）—生成速度快，用于一般打印；中（M）—生成速度适中，打印较清晰；高（H）—生成速度慢，用于高质量彩色打印。',
                  )}
                </li>
              </ol>
            </p>
            <p className="Gray_75">
              <span>
                {_l(
                  '5.可通过代码 #{[qrcode]字段名$[20*20]$} 或 #{[barcode]字段名$[40*10]$} 获取任意字段的二维码 或 条形码。二维码编码方式：QR-code，最大包含150个字（支持汉字）；条形码编码方式：code128，最大包含30个字符（仅支持数字、字母、符号）。',
                )}
              </span>
            </p>
            <p className="Gray_75">
              <span>
                {_l(
                  '6. 如需不打印没有数据的关联表/子表，请将代码：#NoDataNotPrint[start]# 和 #NoDataNotPrint[end]# 插入到模板中，代码之间的关联记录/子表没有数据则不会打印。',
                )}
              </span>
            </p>

            <p className="Gray_75">
              <span>
                {_l(
                  '7. 批量打印时，默认所有数据连续打印，如需实现分页功能（每条数据另起一页），需在模板中的第一个段落配置段前分页。设置方法可参考',
                )}
              </span>
              <Support type={3} href="https://help.mingdao.com/operation20" text={_l('这里')} />
            </p>
            <p className="Gray_75">
              <span>
                {_l('查看')}
                <Support
                  className="mRight5 supportVerticalTop"
                  type={3}
                  href="https://help.mingdao.com/operation17"
                  text={_l('帮助文档')}
                />
              </span>
              {_l('了解更多制作技巧和注意事项。')}
              {_l('或')}
              <span className="urlForTel mLeft5 mRight5">{_l('下载')}</span>
              {_l('示范模板快速开始')}
            </p>
          </div>
          <h5 className="mTop50 Font20 Gray">{_l('字段代码对照表')}</h5>
          {this.renderList()}
          {this.renderApprovalList()}
        </div>
      </React.Fragment>
    );
  }
}
