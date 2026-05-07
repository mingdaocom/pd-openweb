import React from 'react';
import { Drawer } from 'antd';
import _ from 'lodash';
import { Icon, LoadDiv, SortableList, Support, UpgradeIcon } from 'ming-ui';
import systemIntegrationAjax from 'src/api/systemIntegration';
import sheetAjax from 'src/api/worksheet';
import { printQrBarCode } from 'worksheet/common/PrintQrBarCode';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { PRINT_TYPE } from 'src/pages/Print/core/config';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import CloudPrint from '../../components/CloudPrint';
import EditPrint from '../../components/EditPrint';
import PrintTemDialog from '../../components/PrintTemDialog';
import KuaiMaiIcon from './assets/kuaimai.png';
import openKuaiMaiDialog from './BindKuaiMaiDialog';
import PrintSortableItem from './PrintSortableItem';
import './style.less';

const MAX_PRINT_COUNT = 500;

const PRINT_TYPE_CLASSIFY = {
  0: [PRINT_TYPE.SYS_PRINT, PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT],
  1: [PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT],
  6: [PRINT_TYPE.CLOUD_PRINT],
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
      addKuaiMaiPrintTemp,
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
        closeIcon={<Icon className="textTertiary" icon="close" onClick={onCloseDrawer} />}
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
            <p className="printTempDrawerListTitle" style={{ marginTop: '35px' }}>
              {_l('云打印')}
            </p>
            <div className="printTempDrawerListItem" onClick={addKuaiMaiPrintTemp}>
              <span className="iconbox kuaimaiIconBox">
                <img className="kuaimaiIcon" src={KuaiMaiIcon} alt="" />
              </span>
              {_l('快麦云打印')}
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
      exampleData: {},
      bindKuaiMai: false,
      showCloudPrint: false,
    };
  }
  componentDidMount() {
    const { worksheetId } = this.props;
    this.loadPrint({ worksheetId: worksheetId }); // 获取当前模板
    this.checkedCloudPrint();
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
    if (this.checkedPrintTempCount()) return;

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
    const defaultTypes = _.reduce(
      Object.keys(PRINT_TYPE_CLASSIFY),
      (res, item) => res.concat(Number(item) !== Number(type) ? PRINT_TYPE_CLASSIFY[item] : []),
      [],
    );
    const defaultItems = printData.filter(it => defaultTypes.includes(it.type));
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

  checkedPrintTempCount = () => {
    const data = this.state.printData || [];

    if (data.length >= MAX_PRINT_COUNT) {
      alert(_l('模版最多支持 %0 个，您已超出上限', MAX_PRINT_COUNT), 2);
      return true;
    }

    return false;
  };

  addNewRecordPrintTemp = () => {
    if (this.checkedPrintTempCount()) {
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

  // 校验是否集成云打印
  checkedCloudPrint = () => {
    const { worksheetInfo = {} } = this.props;

    systemIntegrationAjax.getSystemIntegrationList({ projectId: worksheetInfo.projectId, type: 1 }).then(res => {
      this.setState({ bindKuaiMai: res.length >= 1 });
    });
  };

  addKuaiMaiPrintTemp = () => {
    const { worksheetInfo = {} } = this.props;
    const { bindKuaiMai } = this.state;

    const featureType = getFeatureStatus(worksheetInfo.projectId, VersionProductType.wordPrintTemplate);

    if (featureType === '2') {
      buriedUpgradeVersionDialog(worksheetInfo.projectId, VersionProductType.wordPrintTemplate);
      return;
    }

    if (bindKuaiMai) {
      this.setState({
        showCloudPrint: true,
        showCreatePrintTemp: false,
      });
    } else {
      openKuaiMaiDialog({
        projectId: worksheetInfo.projectId,
        onOk: () => {
          this.setState({
            showCloudPrint: true,
            showCreatePrintTemp: false,
          });
        },
      });
    }
  };

  addCodePrintTemp = type => {
    const { worksheetInfo = {} } = this.props;

    if (this.checkedPrintTempCount()) return;

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
    const { showEditPrint, templateId, fileType, printData = [], exampleData, type } = this.state;

    return (
      <Drawer
        width={480}
        placement="right"
        className="Absolute"
        zIndex={10}
        onClose={() => this.setState({ showEditPrint: false, type: '' })}
        visible={showEditPrint}
        maskClosable={false}
        closable={false}
        getContainer={false}
        mask={false}
        bodyStyle={{ padding: 0 }}
      >
        <EditPrint
          type={type}
          downLoadUrl={worksheetInfo.downLoadUrl}
          onClose={() => this.setState({ showEditPrint: false, type: '' })}
          templateId={templateId}
          worksheetId={worksheetId}
          worksheetName={worksheetInfo.name}
          templateData={printData.find(it => it.id === templateId)}
          fileType={fileType}
          appId={_.get(worksheetInfo, 'appId')}
          roleType={_.get(worksheetInfo, 'roleType')}
          projectId={_.get(worksheetInfo, 'projectId')}
          controls={_.get(worksheetInfo, 'template.controls')}
          updatePrint={this.updatePrint}
          exampleData={exampleData}
          updateExampleData={value => this.setState({ exampleData: value })}
          refreshFn={(showEditPrint = false, id) => {
            this.setState({ showEditPrint, type: '', templateId: showEditPrint ? id || templateId : '' });
            this.loadPrint({ worksheetId: worksheetId }); // 获取当前模板
          }}
        />
      </Drawer>
    );
  };

  renderCloudPrint = () => {
    const { worksheetInfo = {} } = this.props;
    const { type, showCloudPrint, templateId, printData = [] } = this.state;

    if (!showCloudPrint) return null;

    return (
      <Drawer
        width={560}
        placement="right"
        className="Absolute"
        zIndex={10}
        onClose={() => this.setState({ showCloudPrint: false })}
        visible={showCloudPrint}
        maskClosable={false}
        closable={false}
        getContainer={false}
        mask={false}
        bodyStyle={{ padding: 0 }}
      >
        <CloudPrint
          type={type}
          worksheetInfo={worksheetInfo}
          templateData={printData.find(it => it.id === templateId)}
          getPrintData={() => this.loadPrint({ worksheetId: worksheetInfo.worksheetId })}
          onClose={() => this.setState({ showCloudPrint: false, type: '', templateId: '' })}
        />
      </Drawer>
    );
  };

  renderCon = () => {
    const { printData = [] } = this.state;
    const defaultTemData = printData.filter(it => PRINT_TYPE_CLASSIFY[0].includes(it.type)); //记录打印
    const codeTemData = printData.filter(it => PRINT_TYPE_CLASSIFY[1].includes(it.type)); //条码打印
    const cloudTemData = printData.filter(it => it.type === PRINT_TYPE.CLOUD_PRINT); //云打印

    return (
      <div className="printBox Relative">
        <div className="printBoxList">
          <div className="h100 overflowHidden">
            <div className="topBoxText">
              <div className="textCon">
                <h5 className="formName textPrimary Font17 Bold">{_l('打印模板')}</h5>
                <p className="desc mTop8">
                  <span className="Font13 textTertiary">
                    {_l('保存系统打印配置模板，或上传 Word、Excel 模板自定义记录打印样式，同时新增云打印功能。')}
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
                    <div className="name flex mRight20 valignWrapper overflow_ellipsis pLeft35">{_l('名称')}</div>
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
                    {cloudTemData.length > 0 && (
                      <p className="printTemTi">
                        {_l('云打印')}
                        {`（${cloudTemData.length}）`}
                      </p>
                    )}
                    {cloudTemData.length > 0 && this.renderPrintItem(cloudTemData || [], 6)}
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
    const {
      loading,
      previewRowId = '',
      showEditPrint,
      showPrintTemDialog,
      showCreatePrintTemp,
      showCloudPrint,
    } = this.state;
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
            onBack={() => {
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
        {showCloudPrint && this.renderCloudPrint()}
        {!loading && (
          <CreatePrintDrawer
            worksheetProjectId={worksheetInfo.projectId}
            onCloseDrawer={() => this.setState({ showCreatePrintTemp: false })}
            visible={showCreatePrintTemp}
            addNewRecordPrintTemp={this.addNewRecordPrintTemp}
            addWordPrintTemp={() => this.addDrawerPrintTemp('Word')}
            addExcelPrintTemp={() => this.addDrawerPrintTemp('Excel')}
            addCodePrintTemp={this.addCodePrintTemp}
            addKuaiMaiPrintTemp={this.addKuaiMaiPrintTemp}
          />
        )}
      </React.Fragment>
    );
  }
}

export default Print;
