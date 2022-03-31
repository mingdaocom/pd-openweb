import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { WaterMark, LoadDiv } from 'ming-ui';
import DocumentTitle from 'react-document-title';
import { Flex, ActivityIndicator } from 'antd-mobile';
import worksheetAjax from 'src/api/worksheet';
import CustomFields from 'src/components/newCustomFields';
import sheetAjax from 'src/api/worksheet';
import Back from '../components/Back';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils.js';
import * as actions from '../RecordList/redux/actions';
import './index.less';

class AddRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sheetRow: {},
      controls: [],
      loading: true,
      showError: false,
      saveLoading: false,
    };
  }
  componentDidMount() {
    const { params } = this.props.match;
    worksheetAjax
      .getWorksheetInfo({
        ...params,
        getTemplate: true,
      })
      .then(result => {
        const { controls } = result.template;
        const newControls = controls.filter(
          item => item.type !== 21 && !['caid', 'ownerid', 'ctime', 'utime'].includes(item.controlId),
        );
        result.template.controls = newControls;
        this.setState({
          sheetRow: result,
          controls: newControls,
          loading: false,
        });
      });
  }

  customwidget = React.createRef();

  handleSave() {
    this.setState({ submitLoading: true });
    this.customwidget.current.submitFormData();
  }
  onSave = (error, { data, updateControlIds }) => {
    if (error) {
      this.setState({ submitLoading: false });
      return;
    }
    const { saveLoading } = this.state;
    const { params } = this.props.match;
    if (!this.customwidget.current) return;
    const receiveControls = data
      .filter(item => item.type !== 'SHEETFIELD' && item.originType !== 31 && item.originType !== 32)
      .map(formatControlToServer);

    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    if (saveLoading) {
      return;
    }

    this.setState({ saveLoading: true, showError: false });

    sheetAjax
      .addWorksheetRow({
        ...params,
        receiveControls,
      })
      .then(result => {
        this.setState({ submitLoading: false });
        if (result && result.data) {
          alert(_l('添加成功'));
          this.props.dispatch(actions.emptySheetRows());
          history.back();
        } else {
          if (result.resultCode === 11) {
            if (this.customwidget.current && _.isFunction(this.customwidget.current.uniqueErrorUpdate)) {
              this.customwidget.current.uniqueErrorUpdate(result.badData);
            }
          } else {
            alert(_l('添加失败，请稍后重试'));
          }
        }
      })
      .fail(error => {
        alert(_l('添加失败，请稍后重试'));
      })
      .always(() => {
        this.setState({ saveLoading: false });
      });
  };
  renderContent() {
    const { submitLoading, sheetRow, controls, showError } = this.state;
    const { params } = this.props.match;
    return (
      <Fragment>
        {submitLoading && (
          <div className="loadingMask">
            <LoadDiv />
          </div>
        )}
        <DocumentTitle title={`${_l('添加')}${sheetRow.entityName}`} />
        <div className="flex pTop5" style={{ overflowX: 'hidden', overflowY: 'auto' }}>
          <CustomFields
            ref={this.customwidget}
            appId={params.appId || ''}
            worksheetId={params.worksheetId}
            projectId={sheetRow.projectId}
            isWorksheetQuery={sheetRow.isWorksheetQuery}
            from={5}
            showError={showError}
            data={controls}
            onChange={result => {
              this.setState({
                controls: result,
              });
            }}
            onSave={this.onSave}
          />
        </div>
        <Flex className="saveWrapper" justify="start">
          <div className="save" onClick={this.handleSave.bind(this)}>
            {_l('确定')}
          </div>
        </Flex>
        <Back
          onClick={() => {
            history.back();
          }}
        />
      </Fragment>
    );
  }
  render() {
    const { loading, sheetRow } = this.state;

    if (loading) {
      return (
        <div className="flexColumn h100">
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        </div>
      );
    }

    return (
      <WaterMark projectId={sheetRow.projectId}>
        <div className="mobileSheetRowRecord flexColumn h100">{this.renderContent()}</div>
      </WaterMark>
    );
  }
}

export default connect(state => {
  return {};
})(AddRecord);
