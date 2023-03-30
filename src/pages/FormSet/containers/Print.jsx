import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Icon, LoadDiv, Support } from 'ming-ui';
import { Drawer } from 'antd';
import * as actions from '../redux/actions/print';
import cx from 'classnames';
import './print.less';
import EditPrint from '../components/EditPrint';
import MoreOption from '../components/MoreOption';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import PrintTemDialog from '../components/PrintTemDialog';
import RangeDrop from 'src/pages/FormSet/components/RangeDrop';
import { PRINT_TYPE } from 'src/pages/Print/config';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { getPrintCardInfoOfTemplate } from 'src/pages/worksheet/common/PrintQrBarCode/enum';
import { printQrBarCode } from 'worksheet/common/PrintQrBarCode';
import _ from 'lodash';
class CreatePrintDrawer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { projectId, onCloseDrawer, visible, addNewRecordPrintTemp, addWordPrintTemp, addCodePrintTemp } = this.props;
    let featureType = getFeatureStatus(projectId, 20);

    return (
      <Drawer
        width={400}
        className="printTempDrawer"
        title={_l('创建打印模板')}
        placement="right"
        mask={false}
        onClose={onCloseDrawer}
        visible={visible}
      >
        <p className="printTempDrawerListTitle">{_l('通过系统默认打印创建')}</p>
        <div className="printTempDrawerListItem" onClick={addNewRecordPrintTemp}>
          <span className="iconbox">
            <Icon icon="doc" className="printTempDrawerListItemIcon" />
          </span>
          {_l('记录打印')}
        </div>
        <div
          className="printTempDrawerListItem"
          onClick={() => {
            addCodePrintTemp(PRINT_TYPE.BAR_CODE_PRINT);
            onCloseDrawer();
          }}
        >
          <span className="iconbox">
            <Icon icon="a-barcode" className="printTempDrawerListItemIcon" />
          </span>
          {_l('条形码打印')}
        </div>
        <div
          className="printTempDrawerListItem"
          onClick={() => {
            addCodePrintTemp(PRINT_TYPE.QR_CODE_PRINT);
            onCloseDrawer();
          }}
        >
          <span className="iconbox">
            <Icon icon="qr_code" className="printTempDrawerListItemIcon" />
          </span>
          {_l('二维码打印')}
        </div>
        <p className="printTempDrawerListTitle" style={{ marginTop: '35px' }}>
          {_l('自定义')}
        </p>
        <div className="printTempDrawerListItem" onClick={addWordPrintTemp}>
          <span className="iconbox">
            <Icon icon="new_word" className="printTempDrawerListItemIcon" />
          </span>
          {_l('上传word模板')}
        </div>
      </Drawer>
    );
  }
}
class Print extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showEditPrint: false,
      isRename: false,
      templateId: '', // 当前正在编辑的模板ID
      showDeletePrint: false, // 删除模板确认层
      showMoreOption: false, // 更多操作
      showDropOption: false,
      showPrintTemDialog: false,
      type: '',
      isDefault: false,
      isChangeDrop: false,
      showCreatePrintTemp: false,
    };
  }
  componentDidMount() {
    const { loadPrint, formSet } = this.props;
    loadPrint({ worksheetId: formSet.worksheetId }); // 获取当前模板
  }

  componentWillUpdate(nextProps, nextState) {
    const { isRename } = nextState;
    if (isRename) {
      setTimeout(() => {
        $(this.input).focus();
      }, 200);
    }
  }

  renderPrintItem = data => {
    const { showDropOption, isRename, templateId, showMoreOption, isChangeDrop } = this.state;
    const { editPrintName, updatePrint, deletePrint, formSet, editPrintRange, loadPrint } = this.props;
    const { worksheetInfo = [] } = formSet;
    const { views = [] } = worksheetInfo;

    return data.map(it => {
      let printInfo = getPrintCardInfoOfTemplate(it);
      return (
        <div className={cx('templates')}>
          <div className={cx('topBox', { defaulteTem: it.type !== PRINT_TYPE.WORD_PRINT })}>
            <Icon
              icon={it.type === PRINT_TYPE.WORD_PRINT ? 'new_word' : printInfo.icon}
              className={`iconTitle ${
                it.type === PRINT_TYPE.WORD_PRINT || printInfo.icon !== 'doc' ? 'Font22' : 'Font16'
              }`}
            />
            {isRename && templateId === it.id ? (
              <input
                type="text"
                ref={el => {
                  this.input = el;
                }}
                value={it.name}
                onChange={e => {
                  updatePrint(it.id, { name: e.target.value });
                }}
                onBlur={() => {
                  if (!_.trim(it.name)) {
                    alert(_l('请输入模板名称'), 3);
                    $(this.input).focus();
                    return;
                  }
                  editPrintName({ id: it.id, name: it.name });
                  this.setState({
                    templateId: '',
                    isRename: false,
                  });
                }}
              />
            ) : (
              <span className="Bold"> {it.name}</span>
            )}
            <Icon
              icon="task-point-more"
              className="moreActive Hand Font18"
              onClick={() => {
                this.setState({
                  templateId: it.id,
                  showMoreOption: true,
                });
              }}
            />
            {showMoreOption && templateId === it.id && (
              <MoreOption
                isRename={isRename}
                templateId={it.id}
                showMoreOption={showMoreOption}
                onClickAwayExceptions={[]}
                onClickAway={() => this.setState({ showMoreOption: false })}
                setFn={data => {
                  this.setState({
                    ...this.state,
                    ...data,
                  });
                }}
                deleteFn={data => {
                  deletePrint(it.id);
                  this.setState({
                    ...this.state,
                    ...data,
                  });
                }}
              />
            )}
          </div>
          <div className="con">
            <div className="view">
              {it.range === 1 && <span className="viewText">{_l('使用范围：所有记录')}</span>}
              {it.range !== 1 && it.views.length <= 0 && <span className="viewText">{_l('使用范围：未指定视图')}</span>}
              {it.range === 3 && it.views.length > 0 && (
                <span
                  className="viewText"
                  style={{ WebkitBoxOrient: 'vertical' }}
                  title={it.views.map((item, i) => {
                    return i + 1 >= it.views.length ? item.name || item.viewName : `${item.name || item.viewName}、`;
                  })}
                >
                  {_l('使用范围：%0视图', it.views.length)}（
                  {it.views.map((item, i) => {
                    return i + 1 >= it.views.length ? item.name || item.viewName : `${item.name || item.viewName}、`;
                  })}
                  ）
                </span>
              )}
            </div>
            {it.type > 2 && (
              <div className="printSize">
                {_l('打印尺寸')}：{printInfo.text}
              </div>
            )}
            <div className="createMethod">
              {_l('创建方式') + '：' + (it.type === PRINT_TYPE.WORD_PRINT ? _l('word模版') : _l('系统默认打印'))}
            </div>
            <div className="activeCon Relative">
              <span
                className="Hand"
                onClick={() => {
                  this.setState({
                    templateId: it.id,
                    showDropOption: true,
                  });
                }}
              >
                {_l('使用范围')}
              </span>
              {showDropOption && templateId === it.id && (
                <RangeDrop
                  printData={it}
                  views={views}
                  onClickAwayExceptions={[]}
                  onClickAway={() => {
                    this.setState({ showDropOption: false });
                    if (isChangeDrop) {
                      editPrintRange({
                        id: it.id,
                        range: it.range,
                        viewsIds: it.views.map(o => o.viewId),
                      });
                    }
                  }}
                  onClose={() => {
                    this.setState({ showDropOption: false });
                  }}
                  setData={data => {
                    updatePrint(data.printData.id, { ...data.printData });
                    this.setState({ isChangeDrop: true });
                  }}
                />
              )}
              <span
                className="Hand"
                onClick={() => {
                  if (_.includes([PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT], it.type)) {
                    printQrBarCode({
                      mode: 'preview',
                      id: it.id,
                      printType: it.printType,
                      projectId: formSet.worksheetInfo.projectId,
                      worksheetId: formSet.worksheetInfo.worksheetId,
                      controls: _.get(formSet, 'worksheetInfo.template.controls'),
                    });
                  } else {
                    this.setState({
                      templateId: it.id,
                      name: it.name,
                      type: 'preview',
                      showPrintTemDialog: true,
                      isDefault: it.type === PRINT_TYPE.SYS_PRINT,
                    });
                  }
                }}
              >
                {_l('预览')}
              </span>
              <span
                className="Hand mLeft24"
                onClick={() => {
                  if (_.includes([PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT], it.type)) {
                    printQrBarCode({
                      isCharge: true,
                      mode: 'editTemplate',
                      id: it.id,
                      printType: it.printType,
                      projectId: formSet.worksheetInfo.projectId,
                      worksheetId: formSet.worksheetInfo.worksheetId,
                      controls: _.get(formSet, 'worksheetInfo.template.controls'),
                      onClose: () => {
                        loadPrint({ worksheetId: formSet.worksheetInfo.worksheetId });
                      },
                    });
                  } else if (it.type === PRINT_TYPE.WORD_PRINT) {
                    // 上传的模板
                    this.setState({
                      templateId: it.id,
                      showEditPrint: true,
                      type: 'edit',
                    });
                  } else {
                    // 系统模板
                    this.setState({
                      templateId: it.id,
                      type: 'edit',
                      showPrintTemDialog: true,
                      isDefault: it.type === PRINT_TYPE.SYS_PRINT,
                    });
                  }
                }}
              >
                {_l('编辑')}
              </span>
            </div>
          </div>
        </div>
      );
    });
  };
  renderCon = () => {
    const { loadPrint, formSet } = this.props;
    const { printData = [], worksheetId } = formSet;
    const { showEditPrint, list, isRename, templateId, showMoreOption, showCreatePrintTemp } = this.state;
    let defaulteTemData = printData.filter(it => it.type === PRINT_TYPE.SYS_PRINT || it.type === PRINT_TYPE.WORD_PRINT); //记录打印
    let codeTemData = printData.filter(
      it => it.type === PRINT_TYPE.QR_CODE_PRINT || it.type === PRINT_TYPE.BAR_CODE_PRINT,
    ); //条码打印
    return (
      <div className="printBox Relative">
        <div className="printBoxList">
          <div className="">
            <div className="topBoxText">
              <div className="textCon">
                <h5 className="formName Gray Font17 Bold">{_l('打印模板')}</h5>
                <p className="desc mTop8">
                  <span className="Font13 Gray_9e">
                    {_l('保存系统打印的配置为模板，或上传word模板自由定义记录打印的样式。')}
                  </span>
                  <Support type={3} text={_l('帮助')} href="https://help.mingdao.com/zh/operation15.html" />
                </p>
              </div>
              <span
                className="add Relative bold"
                onClick={() => {
                  this.setState({
                    showCreatePrintTemp: true,
                  });
                }}
              >
                <Icon icon="plus" className="mRight8" />
                {_l('新建模板')}
              </span>
            </div>
            {printData.length <= 0 ? (
              <p className="noData">
                <Icon icon="print" className="icon" />
                <br />
                {_l('暂无打印模板')}
              </p>
            ) : (
              <React.Fragment>
                <div className="printTemplatesList">
                  {defaulteTemData.length > 0 && <p className="printTemTi">{_l('记录打印')}</p>}
                  {defaulteTemData.length > 0 && this.renderPrintItem(defaulteTemData || [])}
                  {codeTemData.length > 0 && <p className="printTemTi">{_l('条码打印')}</p>}
                  {codeTemData.length > 0 && this.renderPrintItem(codeTemData || [])}
                </div>
              </React.Fragment>
            )}
          </div>
          <CSSTransitionGroup transitionName="EditPrint" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
            {showEditPrint && (
              <EditPrint
                onClickAwayExceptions={[]}
                downLoadUrl={formSet.worksheetInfo.downLoadUrl}
                onClickAway={() => this.setState({ showEditPrint: false, type: '' })}
                onClose={() => {
                  this.setState({ showEditPrint: false, type: '' });
                }}
                printData={printData}
                templateId={templateId}
                worksheetId={worksheetId}
                refreshFn={() => {
                  this.setState({ showEditPrint: false, type: '' });
                  loadPrint({ worksheetId: worksheetId }); // 获取当前模板
                }}
              />
            )}
          </CSSTransitionGroup>
          <CreatePrintDrawer
            onCloseDrawer={() => {
              this.setState({ showCreatePrintTemp: false });
            }}
            visible={showCreatePrintTemp}
            addNewRecordPrintTemp={() => {
              this.setState({
                ...this.state,
                showPrintTemDialog: true,
                templateId: '',
                type: 'new',
                isDefault: true,
                showCreatePrintTemp: false,
              });
            }}
            addWordPrintTemp={() => {
              if (getFeatureStatus(formSet.worksheetInfo.projectId, 20) === '2') {
                buriedUpgradeVersionDialog(formSet.worksheetInfo.projectId, 20);
              } else {
                this.setState({
                  ...this.state,
                  showEditPrint: true,
                  templateId: '',
                  type: 'new',
                  showCreatePrintTemp: false,
                });
              }
            }}
            addCodePrintTemp={type => {
              printQrBarCode({
                isCharge: true,
                mode: 'newTemplate',
                printType: type === PRINT_TYPE.QR_CODE_PRINT ? 1 : 3,
                projectId: formSet.worksheetInfo.projectId,
                worksheetId: formSet.worksheetInfo.worksheetId,
                controls: _.get(formSet, 'worksheetInfo.template.controls'),
                onClose: () => {
                  loadPrint({ worksheetId: formSet.worksheetInfo.worksheetId });
                },
              });
            }}
          />
        </div>
      </div>
    );
  };

  render() {
    const { formSet, loadPrint } = this.props;
    const { worksheetInfo = [] } = formSet;
    const { views = [] } = worksheetInfo;
    let viewId = '';
    return (
      <React.Fragment>
        {formSet.loading ? <LoadDiv /> : this.renderCon()}
        {this.state.showPrintTemDialog && (
          <PrintTemDialog
            printId={this.state.templateId}
            name={this.state.name}
            type={this.state.type} // 预览编辑新建
            isDefault={this.state.isDefault}
            worksheetId={formSet.worksheetId}
            projectId={formSet.worksheetInfo.projectId}
            rowId={''}
            viewId={viewId}
            appId={formSet.worksheetInfo.appId}
            getType={1}
            workId={''}
            from="formSet" // 表单设置
            onBack={value => {
              loadPrint({ worksheetId: formSet.worksheetId }); // 获取当前模板
              this.setState({
                showPrintTemDialog: false,
                type: '',
                templateId: '',
                name: '',
              });
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  formSet: state.formSet,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Print);
