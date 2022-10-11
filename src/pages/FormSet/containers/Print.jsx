import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Icon, ScrollView, LoadDiv, Dialog, Support } from 'ming-ui';
import * as actions from '../redux/actions/print';
import cx from 'classnames';
import './print.less';
import EditPrint from '../components/EditPrint';
import MoreOption from '../components/MoreOption';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import PrintTemDialog from '../components/PrintTemDialog';
import withClickAway from 'ming-ui/decorators/withClickAway';
import RangeDrop from 'src/pages/FormSet/components/RangeDrop';
import { PRINT_TYPE } from 'src/pages/Print/config';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
@withClickAway
class ActDia extends React.Component {
  render() {
    const { setFn, projectId } = this.props;
    let featureType = getFeatureStatus(projectId, 20);

    return (
      <ul className="actDia">
        <li
          onClick={() => {
            setFn({
              showPrintTemDialog: true,
              templateId: '',
              type: 'new',
              isDefault: true,
            });
          }}
          className={cx({})}
        >
          <Icon icon="print" className="" />
          {_l('通过系统打印创建')}
        </li>
        {featureType && (
          <li
            onClick={() => {
              if (featureType === '2') {
                buriedUpgradeVersionDialog(projectId, 20);
              } else {
                setFn({
                  showEditPrint: true,
                });
              }
            }}
            className={cx('Relative', {})}
          >
            <Icon icon="new_word" className="" />
            {_l('上传 Word 模板')}
            {featureType === '2' && (
              <span className="upNew">
                <Icon icon="goprev" className="" />
              </span>
            )}
          </li>
        )}
      </ul>
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
      showactDia: false,
      isChangeDrop: false,
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

  renderItem = (data, isDefault) => {
    const { showDropOption, isRename, templateId, showMoreOption, isChangeDrop } = this.state;
    const { editPrintName, updatePrint, deletePrint, formSet, editPrintRange } = this.props;
    const { worksheetInfo = [] } = formSet;
    const { views = [] } = worksheetInfo;
    return data.map(it => {
      return (
        <div className={cx('templates')}>
          <div className={cx('topBox', { defaulteTem: isDefault })}>
            <Icon icon={isDefault ? 'print' : 'new_word'} className="iconTitle Font16" />
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
              {it.range === 1 && <span className="viewText Gray_9e">{_l('所有记录')}</span>}
              {it.range !== 1 && it.views.length <= 0 && <span className="viewText Gray_9e">{_l('未指定视图')}</span>}
              {it.range === 3 && it.views.length > 0 && (
                <span
                  className="viewText Gray_9e"
                  style={{ WebkitBoxOrient: 'vertical' }}
                  title={it.views.map((item, i) => {
                    return i + 1 >= it.views.length ? item.name || item.viewName : `${item.name || item.viewName}、`;
                  })}
                >
                  {_l('%0视图', it.views.length)}：
                  {it.views.map((item, i) => {
                    return i + 1 >= it.views.length ? item.name || item.viewName : `${item.name || item.viewName}、`;
                  })}
                </span>
              )}
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
                  this.setState({
                    templateId: it.id,
                    name: it.name,
                    type: 'preview',
                    showPrintTemDialog: true,
                    isDefault: isDefault,
                  });
                }}
              >
                {_l('预览')}
              </span>
              <span
                className="Hand mLeft24"
                onClick={() => {
                  if (!isDefault) {
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
                      isDefault: isDefault,
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
    const { showEditPrint, list, isRename, templateId, showMoreOption, showactDia } = this.state;
    let defaulteTemData = printData.filter(it => it.type === PRINT_TYPE.SYS_PRINT); //系统打印
    let uploadTemData = printData.filter(it => it.type === PRINT_TYPE.WORD_PRINT); //word模版打印
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
                  <Support type={3} text={_l('帮助')} href="https://help.mingdao.com/operation15.html" />
                </p>
              </div>
              <span
                className="add Relative bold"
                onClick={() => {
                  this.setState({
                    showactDia: true,
                  });
                }}
              >
                <Icon icon="plus" className="mRight8" />
                {_l('新建模板')}
                {showactDia && (
                  <ActDia
                    onClickAwayExceptions={['.dialogUpdata']}
                    onClickAway={() =>
                      this.setState({
                        showactDia: false,
                        type: '',
                        templateId: '',
                      })
                    }
                    projectId={formSet.worksheetInfo.projectId}
                    setFn={data => {
                      this.setState({
                        ...this.state,
                        ...data,
                        templateId: '',
                        type: 'new',
                      });
                    }}
                  />
                )}
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
                  {defaulteTemData.length > 0 && <p className="printTemTi">{_l('系统打印模板')}</p>}
                  {defaulteTemData.length > 0 && this.renderItem(defaulteTemData || [], true)}
                  {uploadTemData.length > 0 && <p className="printTemTi">{_l('Word模板')}</p>}
                  {uploadTemData.length > 0 && this.renderItem(uploadTemData || [], false)}
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
