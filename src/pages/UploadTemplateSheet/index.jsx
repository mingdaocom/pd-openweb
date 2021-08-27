import React from 'react';
import DocumentTitle from 'react-document-title';
import sheetAjax from 'src/api/worksheet';
import { Icon, Support } from 'ming-ui';
import Clipboard from 'clipboard';
import './index.less';
let controlNo = [22, 10010, 43]; //分段、备注 OCR/
export default class UploadTemplateSheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      worksheetName: '',
      downLoadUrl: '',
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
        {
          controlId: 'qrCode',
          controlName: _l('二维码'),
          type: 16,
        },
      ],
      cardControls: [],
    };
  }

  componentWillMount() {
    const {
      match: {
        params: { worksheetId },
      },
    } = this.props;
  }

  componentDidMount() {
    $('html').addClass('uploadTemplateSheet');
    const { match } = this.props;
    const { worksheetId } = match.params;
    const { systemControl } = this.state;
    sheetAjax
      .getWorksheetInfo({
        getTemplate: true,
        worksheetId: worksheetId,
      })
      .then(res => {
        let { template = [] } = res;
        let { controls = [] } = template;
        let cardControls = controls.filter(
          control =>
            (control.type === 29 && control.advancedSetting && control.advancedSetting.showtype === '2') ||
            control.type === 34,
        ); // 关联表，子表
        controls = controls.filter(
          control =>
            !(
              (control.type === 29 && control.advancedSetting && control.advancedSetting.showtype === '2') ||
              control.type === 34
            ),
        ); // 除去关联表列表 子表
        if (cardControls.length > 0) {
          //更新关联表的controls
          sheetAjax
            .getWorksheetsControls({
              appId: res.appId,
              worksheetIds: _.map(cardControls, 'dataSource'),
            })
            .then(result => {
              this.setState({
                appId: res.appId,
                worksheetName: res.name,
                controls,
                cardControls: cardControls.map(it => {
                  const { showControls = [], dataSource } = it;
                  let controlList = (result.data.find(o => dataSource === o.worksheetId) || {}).controls || [];
                  return {
                    ...it,
                    relationControls: showControls
                      .map(showControl =>
                        _.find(
                          controlList.concat(systemControl),
                          control => control.controlId === showControl && !controlNo.includes(control.type),
                        ),
                      )
                      .filter(c => c),
                  };
                }), // 关联表，子表
                downLoadUrl: res.downLoadUrl,
              });
            });
        } else {
          this.setState({
            appId: res.appId,
            worksheetName: res.name,
            controls,
            cardControls, // 关联表，子表
            downLoadUrl: res.downLoadUrl,
          });
        }
      });
    this.copy();
    $('.urlForTel').on('click', () => {
      this.downTem();
    });
  }

  componentWillUnmount() {
    $('html').removeClass('uploadTemplateSheet');
  }

  copy = () => {
    const clipboard = new Clipboard('i.copy', {
      text(data) {
        return data.closest('.copySpan').innerText;
      },
    });
    clipboard.on('success', () => {
      alert(_l('复制成功'));
    });
  };

  renderIcon = () => {
    return (
      <span title={_l('复制')}>
        <Icon icon="content-copy" className="copy" />
      </span>
    );
  };

  renderItem = it => {
    let n = 0;
    return (
      <React.Fragment>
        <div className="list">
          <span className="">{it.controlName}</span>
          <span className="copySpan">
            {`#{${it.controlName}${it.type === 29 ? '[S]' : ''}${this.strForFile(it)}}`}
            {this.renderIcon()}
          </span>
          <span className="copySpan">
            {`#{${it.alias || it.controlId}${it.type === 29 ? '[S]' : ''}${this.strForFile(it)}}`}
            {it.controlId !== 'qrCode' && this.renderIcon()}
          </span>
        </div>
        {it.type === 29 &&
          it.advancedSetting &&
          it.advancedSetting.showtype === '1' && //关联表卡片
          it.showControls.map(o => {
            let data = it.relationControls.find(a => o === a.controlId);
            if (data) {
              if (
                data.attribute === 1 ||
                controlNo.includes(data.type) || ///分段、备注/
                n > 2
              ) {
                return '';
              }
              n = n + 1;
              return this.renderRelaItem(it, data);
            }
          })}
      </React.Fragment>
    );
  };

  strForFile = data => {
    //兼容他表字段
    let o = data.type === 30 ? { ...data, type: !data.sourceControlType ? data.type : data.sourceControlType } : data;
    return o.type === 42 || o.type === 14 || o.controlId === 'qrCode'
      ? `$[${o.type === 42 ? '48*20' : o.type === 14 ? '90*auto' : '20*20'}]$`
      : '';
  };

  renderRelaItem = (it, o, isRela) => {
    return (
      <div className="list">
        <span className="">{isRela ? `${o.controlName}` : `${it.controlName}.${o.controlName}`}</span>
        <span className="copySpan">
          {`#{${it.controlName}.${o.controlName}${isRela ? '' : '[S]'}${this.strForFile(o)}}`}
          {this.renderIcon()}
        </span>
        <span className="copySpan">
          {`#{${it.alias || it.controlId}.${o.alias || o.controlId}${isRela ? '' : '[S]'}${this.strForFile(o)}}`}
          {this.renderIcon()}
        </span>
      </div>
    );
  };

  renderList = () => {
    const { systemControl = [], cardControls = [], controls = [] } = this.state;
    return (
      <div className="listCon">
        <div className="topHeader">
          <span className="Bold">{_l('字段名称')}</span>
          <span className="Bold">{_l('字段代码')}</span>
          <span className="Bold">{_l('字段ID/字段别名')}</span>
        </div>
        <div className="title">{_l('系统字段')}</div>
        {systemControl.map(it => {
          return this.renderItem(it);
        })}
        <p className="line"></p>
        <div className="title">{_l('表单字段')}</div>
        <p className="mTop12 Gray_75">
          {_l(
            '当表单字段包含多个值时，默认以逗号隔开列出所有值。如需将关联表（卡片、下拉框）以表格方式逐行向下列出所有记录的字段值，可将字段代码或字段ID中的“[S]”去掉，并放在表格中使用。',
          )}
        </p>
        {controls.map(it => {
          if (controlNo.includes(it.type) || systemControl.map(o => o.controlId).includes(it.controlId)) {
            //分段、备注/ //系统字段/
            return '';
          }
          return this.renderItem(it);
        })}
        {cardControls.length > 0 && (
          <React.Fragment>
            <p className="line"></p>
            <div className="title">{_l('关联记录（列表）、子表')}</div>
            <p className="mTop12 Gray_75">
              <span>
                {_l(
                  '关联记录（列表）、子表字段默认为以表格方式逐行向下列出所有记录的字段值，如需以逗号隔开列出所有记录字段的值，可在字段代码或字段ID加上“[S]”，如#{客户.客户名称}加[S]写法为#{客户.客户名称[S]}。如果希望记录逐条打印，请将以下代码插入到模板中，代码下方的内容将识别为记录的基本单元。',
                )}
              </span>
              <Support type={3} href="https://help.mingdao.com/operation18.html" text={_l('帮助')} />
            </p>
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
            {/* 关联记录（列表）、子表 */}
            {cardControls.map((it, i) => {
              return (
                <React.Fragment>
                  {i + 1 <= cardControls.length && i > 0 && <p className="line"></p>}
                  <p className="mTop20 Bold Font13">{it.controlName}</p>
                  {it.relationControls.map(o => {
                    return this.renderRelaItem(it, o, true);
                  })}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        )}
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
    const { worksheetName } = this.state;
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
                '2. 字段代码必须按照表中的格式填写，否则无法获取到对应字段的数据；如果某两个主表字段或同一关联表的字段名称相同，为了系统能够识别请选择复制字段ID/字段别名用于制作模板。',
              )}
            </p>
            <p className="Gray_75">
              {_l('3. 附件图片呈现的四种方式：')}
              <ol className="">
                <li className="Gray_75 pLeft12">
                  {_l(
                    '方式一：宽度固定高度按照图片比例自适应，字段代码为：#{附件$[90*auto]$}，其中90可以是任意数值，默认是此方式；',
                  )}
                </li>
                <li className="Gray_75 pLeft12">
                  {_l('方式二：高度固定宽度按照图片比例自适应，字段代码为：#{附件$[auto*90]$}，其中90可以是任意数值；')}
                </li>
                <li className="Gray_75 pLeft12">
                  {_l(
                    '方式三：宽度和高度同时自适应，字段代码为：#{附件$[45*90_auto]$}，表示图片在45*90的范围内自适应显示，45*90可以是任意数值；',
                  )}
                </li>
                <li className="Gray_75 pLeft12">
                  {_l('方式四：宽度和高度都是固定大小，字段代码为：#{附件$[90*45]$}，其中90*45可以是任意数值；')}
                </li>
              </ol>
            </p>
            <p className="Gray_75">
              <span>
                {_l(
                  '4. 图片支持解析为低、中、高三种不同的质量，低（L）-生成速度快，用于一般打印；中（M）—生成速度适中，打印较清晰；高（H）—生成速度慢，用于高质量彩色打印。默认按照低质量的方式生成图片，如需打印更清晰图片，在字段代码后添加质量标签M或H即可，例如：#{附件$[auto*90_H]$}。',
                )}
              </span>
            </p>
            <p className="Gray_75">
              <span>
                {_l(
                  '5. 批量打印时，默认所有数据连续打印，如需实现分页功能（每条数据另起一页），需在模板中的第一个段落配置段前分页，设置方法可参考',
                )}
              </span>
              <Support type={3} href="https://help.mingdao.com/operation20.html" text={_l('这里')} />
            </p>
            <p className="Gray_75">
              <span>
                {_l(
                  '6. 如需不打印没有数据的关联表/子表，请将代码：#NoDataNotPrint[start]# 和 #NoDataNotPrint[end]# 插入到模板中，代码之间的关联记录/子表没有数据则不会打印。',
                )}
              </span>
            </p>
            <p className="Gray_75">
              7. <span className="urlForTel">{_l('下载系统模板')}</span>
              <span>
                {_l('作为参考范例、查看了解具体如何制作打印模板。')}
                <Support type={3} href="https://help.mingdao.com/operation17.html" text={_l('帮助')} />
              </span>
            </p>
          </div>
          <h5 className="mTop50 Font20 Gray">{_l('字段代码对照表')}</h5>
          {this.renderList()}
        </div>
      </React.Fragment>
    );
  }
}
