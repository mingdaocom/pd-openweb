import React from 'react';
import { Icon, LoadDiv, Support, UpgradeIcon, SortableList } from 'ming-ui';
import { Drawer } from 'antd';
import './print.less';
import EditPrint from '../components/EditPrint';
import PrintTemDialog from '../components/PrintTemDialog';
import { PRINT_TYPE } from 'src/pages/Print/config';
import { getFeatureStatus } from 'src/util';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/util/enum';
import { printQrBarCode } from 'worksheet/common/PrintQrBarCode';
import _ from 'lodash';
import sheetAjax from 'src/api/worksheet';
import PrintSortableItem from '../components/PrintSortableItem';

const MAX_PRINT_COUNT = 50;

const PRINT_TYPE_CLASSIFY = {
  0: [PRINT_TYPE.SYS_PRINT, PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT],
  1: [PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT],
};

class CreatePrintDrawer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      worksheetProjectId,
      onCloseDrawer,
      visible,
      addNewRecordPrintTemp,
      addWordPrintTemp,
      addCodePrintTemp,
      addExcelPrintTemp,
    } = this.props;

    const currentProjectId = worksheetProjectId || (md.global.Account.projects[0] || {}).projectId;
    const featureType = getFeatureStatus(currentProjectId, VersionProductType.wordPrintTemplate);

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
        {featureType && (
          <React.Fragment>
            <p className="printTempDrawerListTitle" style={{ marginTop: '35px' }}>
              {_l('自定义')}
            </p>
            <div className="printTempDrawerListItem" onClick={addWordPrintTemp}>
              <span className="iconbox">
                <Icon icon="new_word" className="printTempDrawerListItemIcon" />
              </span>
              {_l('新建 Word 模板')}
              {featureType === '2' && <UpgradeIcon />}
            </div>
            <div className="printTempDrawerListItem" onClick={addExcelPrintTemp}>
              <span className="iconbox">
                <Icon icon="new_excel" className="printTempDrawerListItemIcon" />
              </span>
              {_l('新建 Excel 模板')}
              {featureType === '2' && <UpgradeIcon />}
            </div>
          </React.Fragment>
        )}
      </Drawer>
    );
  }
}
class Print extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showEditPrint: false,
      templateId: '', // 当前正在编辑的模板ID
      showPrintTemDialog: false,
      type: '',
      isDefault: false,
      showCreatePrintTemp: false,
      fileType: undefined, // 自定义模版 word/excel
      fileTypeNum: null,
      printData: [],
      loading: false,
      sortIds: [],
    };
  }
  componentDidMount() {
    const { worksheetId } = this.props;
    this.loadPrint({ worksheetId: worksheetId }); // 获取当前模板
  }

  loadPrint = ({ worksheetId }) => {
    this.setState({ loading: true });
    sheetAjax
      .getPrintList({
        worksheetId,
      })
      .then(data => {
        this.setState({
          loading: false,
          printData: data,
        });
      });
  };

  addDrawerPrintTemp = fileType => {
    if (this.checkedPrintTempCount(0)) return;

    const { worksheetInfo } = this.props;

    if (getFeatureStatus(worksheetInfo.projectId, VersionProductType.wordPrintTemplate) === '2') {
      buriedUpgradeVersionDialog(worksheetInfo.projectId, VersionProductType.wordPrintTemplate);
    } else {
      this.setState({
        ...this.state,
        showEditPrint: true,
        templateId: '',
        type: 'new',
        showCreatePrintTemp: false,
        fileType: fileType,
      });
    }
  };

  updatePrint = (id, data) => {
    const { printData } = this.state;

    this.setState({
      printData: printData.map(l => ({
        ...l,
        ...(l.id === id ? data : {}),
      })),
    });
  };

  onSortEnd = (newItems = [], type) => {
    const { printData } = this.state;
    const { worksheetInfo = {}, worksheetId } = this.props;
    const defaultItems = printData.filter(it => PRINT_TYPE_CLASSIFY[Number(!type)].includes(it.type));
    const sortItems = type ? defaultItems.concat(newItems) : newItems.concat(defaultItems);

    sheetAjax
      .editPrintTemplateSort({
        projectId: worksheetInfo.projectId,
        worksheetId: worksheetId,
        sortItems: sortItems.map((l, i) => ({ printId: l.id, sort: i })),
      })
      .then(res => {
        this.setState({ printData: res ? sortItems : _.cloneDeep(printData) });
        !res && alert(_l('移动失败'), 2);
      });
  };

  changeState = value => {
    this.setState({
      ...value,
    });
  };

  checkedPrintTempCount = type => {
    const data = this.state.printData.filter(it => PRINT_TYPE_CLASSIFY[type].includes(it.type));

    if (data.length >= MAX_PRINT_COUNT) {
      alert(
        type === 0
          ? _l('记录打印模版数量已达上限（%0）', MAX_PRINT_COUNT)
          : _l('条码打印模版数量已达上限（%0）', MAX_PRINT_COUNT),
        3,
      );
      return true;
    }

    return false;
  };

  addNewRecordPrintTemp = () => {
    if (this.checkedPrintTempCount(0)) {
      return;
    }

    this.setState({
      ...this.state,
      showPrintTemDialog: true,
      templateId: '',
      type: 'new',
      isDefault: true,
      showCreatePrintTemp: false,
    });
  };

  addCodePrintTemp = type => {
    const { worksheetInfo = {} } = this.props;

    if (this.checkedPrintTempCount(1)) return;

    this.setState({ showCreatePrintTemp: false });
    printQrBarCode({
      isCharge: true,
      mode: 'newTemplate',
      printType: type === PRINT_TYPE.QR_CODE_PRINT ? 1 : 3,
      projectId: worksheetInfo.projectId,
      worksheetId: worksheetInfo.worksheetId,
      controls: _.get(worksheetInfo, 'template.controls'),
      onClose: () => {
        this.loadPrint({ worksheetId: worksheetInfo.worksheetId });
      },
    });
  };

  renderPrintItem = (data, type) => {
    const { worksheetInfo = {}, worksheetControls } = this.props;

    return (
      <SortableList
        useDragHandle
        items={data}
        itemKey="id"
        helperClass="printSortableHelper"
        onSortEnd={newItems => this.onSortEnd(newItems, type)}
        renderItem={({ item, DragHandle }) => (
          <PrintSortableItem
            item={item}
            DragHandle={DragHandle}
            worksheetInfo={worksheetInfo}
            worksheetControls={worksheetControls}
            updatePrint={this.updatePrint}
            changeState={this.changeState}
            loadPrint={this.loadPrint}
          />
        )}
      />
    );
  };

  renderEditPrint = () => {
    const { worksheetId, worksheetInfo = {} } = this.props;
    const { showEditPrint, templateId, showCreatePrintTemp, fileType, printData = [] } = this.state;

    return (
      <Drawer
        width={480}
        placement="right"
        className="Absolute"
        zIndex={9}
        onClose={() => this.setState({ showEditPrint: false, type: '' })}
        visible={showEditPrint}
        maskClosable={true}
        closable={false}
        getContainer={false}
        mask={false}
        bodyStyle={{ padding: 0 }}
      >
        <EditPrint
          onClickAwayExceptions={['.mui-dialog-dialog', '.ant-picker-dropdown']}
          downLoadUrl={worksheetInfo.downLoadUrl}
          onClickAway={() => this.setState({ showEditPrint: false, type: '' })}
          onClose={() => this.setState({ showEditPrint: false, type: '' })}
          templateId={templateId}
          worksheetId={worksheetId}
          templateData={printData.find(it => it.id === templateId)}
          fileType={fileType}
          appId={_.get(worksheetInfo, 'appId')}
          roleType={_.get(worksheetInfo, 'roleType')}
          projectId={_.get(worksheetInfo, 'projectId')}
          updatePrint={this.updatePrint}
          refreshFn={(showEditPrint = false, id) => {
            this.setState({ showEditPrint, type: '', templateId: id || templateId });
            this.loadPrint({ worksheetId: worksheetId }); // 获取当前模板
          }}
        />
      </Drawer>
    );
  };

  renderCon = () => {
    const { printData = [] } = this.state;
    const defaultTemData = printData.filter(it => PRINT_TYPE_CLASSIFY[0].includes(it.type)); //记录打印
    const codeTemData = printData.filter(it => PRINT_TYPE_CLASSIFY[1].includes(it.type)); //条码打印

    return (
      <div className="printBox Relative">
        <div className="printBoxList">
          <div className="h100 overflowHidden">
            <div className="topBoxText">
              <div className="textCon">
                <h5 className="formName Gray Font17 Bold">{_l('打印模板')}</h5>
                <p className="desc mTop8">
                  <span className="Font13 Gray_9e">
                    {_l('保存系统打印的配置为模板，或上传 Word、Excel 模板自由定义记录打印的样式。')}
                  </span>
                  <Support type={3} text={_l('帮助')} href="https://help.mingdao.com/worksheet/print-template" />
                </p>
              </div>
              <span className="add Relative bold" onClick={() => this.setState({ showCreatePrintTemp: true })}>
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
                <div className="printTemplatesList withPrintTemp flex overflowHidden flexColumn">
                  <div className="printTemplatesList-header">
                    <div className="name flex mRight20 valignWrapper overflow_ellipsis">{_l('名称')}</div>
                    <div className="views flex mRight20">{_l('使用范围')}</div>
                    <div className="action mRight8 w180px">{_l('操作')}</div>
                    <div className="more w80px"></div>
                  </div>
                  <div className="printTemplatesList-box sortablePrintItemList flex">
                    {defaultTemData.length > 0 && (
                      <p className="printTemTi">
                        {_l('记录打印')}
                        {`（${defaultTemData.length}）`}
                      </p>
                    )}
                    {defaultTemData.length > 0 && this.renderPrintItem(defaultTemData || [], 0)}
                    {codeTemData.length > 0 && (
                      <p className="printTemTi">
                        {_l('条码打印')}
                        {`（${codeTemData.length}）`}
                      </p>
                    )}
                    {codeTemData.length > 0 && this.renderPrintItem(codeTemData || [], 1)}
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { loading, previewRowId = '', showEditPrint, showPrintTemDialog, showCreatePrintTemp } = this.state;
    const { worksheetInfo = {}, worksheetId } = this.props;

    return (
      <React.Fragment>
        {loading ? <LoadDiv /> : this.renderCon()}
        {showPrintTemDialog && (
          <PrintTemDialog
            printId={this.state.templateId}
            name={this.state.name}
            type={this.state.type} // 预览编辑新建
            isDefault={this.state.isDefault}
            worksheetId={worksheetId}
            projectId={worksheetInfo.projectId}
            rowId={previewRowId}
            viewId={''}
            appId={worksheetInfo.appId}
            getType={1}
            workId={''}
            from="formSet" // 表单设置
            fileTypeNum={this.state.fileTypeNum}
            onBack={value => {
              this.loadPrint({ worksheetId: worksheetId }); // 获取当前模板
              this.setState({
                showPrintTemDialog: false,
                type: '',
                templateId: '',
                name: '',
              });
            }}
          />
        )}
        {showEditPrint && this.renderEditPrint()}
        {!loading && (
          <CreatePrintDrawer
            worksheetProjectId={worksheetInfo.projectId}
            onCloseDrawer={() => this.setState({ showCreatePrintTemp: false })}
            visible={showCreatePrintTemp}
            addNewRecordPrintTemp={this.addNewRecordPrintTemp}
            addWordPrintTemp={() => this.addDrawerPrintTemp('Word')}
            addExcelPrintTemp={() => this.addDrawerPrintTemp('Excel')}
            addCodePrintTemp={this.addCodePrintTemp}
          />
        )}
      </React.Fragment>
    );
  }
}

export default Print;
