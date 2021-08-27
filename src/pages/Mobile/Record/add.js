import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'ming-ui';
import DocumentTitle from 'react-document-title';
import { Flex, ActivityIndicator } from 'antd-mobile';
import worksheetAjax from 'src/api/worksheet';
import CustomFields from 'src/components/newCustomFields';
import { getCellValue } from 'src/pages/worksheet/constants/common';
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
    const { saveLoading } = this.state;
    const { params } = this.props.match;
    if (!this.customwidget.current) return;
    const customwidgetData = this.customwidget.current.getSubmitData();
    const controls = customwidgetData.data;
    const isVerify = customwidgetData.hasError;
    const receiveControls = controls
      .filter(item => item.type !== 'SHEETFIELD' && item.originType !== 31 && item.originType !== 32)
      .map(formatControlToServer);

    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }

    if (isVerify) {
      alert(_l('请正确填写记录'), 3);
      return;
    }

    if (customwidgetData.hasRuleError) {
      return;
    }

    if (saveLoading) {
      return;
    }

    this.setState({ saveLoading: true });

    sheetAjax
      .addWorksheetRow({
        ...params,
        receiveControls,
      })
      .then(result => {
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
  }
  renderContent() {
    const { sheetRow, controls } = this.state;
    const { params } = this.props.match;
    return (
      <Fragment>
        <DocumentTitle title={`${_l('添加')}${sheetRow.entityName}`} />
        <div className="flex" style={{ overflow: 'hidden auto' }}>
          <CustomFields
            ref={this.customwidget}
            worksheetId={params.worksheetId}
            projectId={sheetRow.projectId}
            from={5}
            data={controls}
            onChange={result => {
              this.setState({
                controls: result,
              });
            }}
          />
        </div>
        <Flex className="saveWrapper" justify="start">
          <div className="save" onClick={this.handleSave.bind(this)}>
            {_l('确定')}
          </div>
        </Flex>
        <Back
          className="low"
          onClick={() => {
            history.back();
          }}
        />
      </Fragment>
    );
  }
  render() {
    const { loading } = this.state;
    return (
      <div className="mobileSheetRowRecord flexColumn h100">
        {loading ? (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        ) : (
          this.renderContent()
        )}
      </div>
    );
  }
}

export default connect(state => {
  return {};
})(AddRecord);
