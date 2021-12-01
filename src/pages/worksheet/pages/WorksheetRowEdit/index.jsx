import React, { Component } from 'react';
import ReactDom from 'react-dom';
import preall from 'src/common/preall';
import { LoadDiv, Button, Icon, ScrollView } from 'ming-ui';
import { getSubListError } from 'worksheet/util';
import worksheetAjax from 'src/api/worksheet';
import './index.less';
import { renderCellText } from 'src/pages/worksheet/components/CellControls';
import CustomFields from 'src/components/newCustomFields';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils';
import RecordCard from 'src/components/recordCard';

class WorksheetRowEdit extends Component {
  state = {
    isComplete: false,
    showError: false,
    loading: true,
    data: null,
    rowRelationRowsData: null,
    controlName: '',
    coverCid: '',
    showControls: [],
    isError: false,
    pageIndex: 1,
    pageSize: 50,
    controlId: '',
    count: 0,
  };

  componentDidMount() {
    document.title = _l('加载中');
    $('body').addClass('recordShare');
    window.isPublicWorksheet = true;
    this.getLinkDetail();
  }

  customwidget = React.createRef();
  cellObjs = {};

  /**
   * 获取记录详情
   */
  getLinkDetail() {
    const id = location.pathname.match(/.*\/recordshare\/(.*)/)[1];

    window.recordShareLinkId = id;

    worksheetAjax.getLinkDetail({ id }).then(data => {
      if (data.resultCode === 1) {
        data.receiveControls.forEach(item => {
          item.fieldPermission = '111';
        });
        this.setState({ loading: false, data });
      } else if (data.resultCode === 4) {
        this.setState({ loading: false, isError: true });
      }
    });
  }

  /**
   * 获得关联多条记录
   */
  getRowRelationRowsData = id => {
    const { data, pageIndex, rowRelationRowsData = {}, pageSize } = this.state;
    const { controlName, coverCid, showControls } = _.find(data.receiveControls, item => item.controlId === id);
    const shareId = location.pathname.match(/.*\/recordshare\/(.*)/)[1];

    this.setState({ controlName, coverCid, showControls, loading: true });

    worksheetAjax
      .getRowRelationRows({
        worksheetId: data.worksheetId,
        rowId: data.rowId,
        controlId: id,
        pageIndex,
        pageSize,
        getWorksheet: true,
        shareId,
      })
      .then(data => {
        this.setState({
          rowRelationRowsData: pageIndex > 1 ? { ...data, data: rowRelationRowsData.data.concat(data.data) } : data,
          loading: false,
          controlId: id,
          count: data.count,
        });
      });
  };

  /**
   * 渲染标题
   */
  renderTitle() {
    const { data } = this.state;
    const titleControl = _.find(data.receiveControls, item => item.attribute === 1);
    const title = titleControl ? renderCellText(titleControl) || _l('未命名') : _l('未命名');

    document.title = `${data.appName}-${title}`;

    return <div className="Font22 bold mBottom10">{title}</div>;
  }

  /**
   * 提交
   */
  submitForm = () => {
    if (this.submitted) {
      return;
    }

    const id = location.pathname.match(/.*\/recordshare\/(.*)/)[1];
    let { data, updateControlIds, hasRuleError, hasError } = this.customwidget.current.getSubmitData();

    const subListControls = data.filter(item => item.type === 34);
    if (subListControls.length) {
      const errors = subListControls
        .map(control => ({
          id: control.controlId,
          value:
            control.value &&
            control.value.rows &&
            control.value.rows.length &&
            getSubListError(
              {
                rows: control.value.rows,
                rules: _.get(this.cellObjs || {}, `${control.controlId}.cell.worksheettable.current.table.state.rules`),
              },
              control.relationControls,
              control.showControls,
              2,
            ),
        }))
        .filter(c => !_.isEmpty(c.value));
      if (errors.length) {
        hasError = true;
        errors.forEach(error => {
          const errorSublist = (this.cellObjs || {})[error.id];
          if (errorSublist) {
            errorSublist.cell.setState({
              error: !_.isEmpty(error.value),
              cellErrors: error.value,
            });
          }
        });
      } else {
        subListControls.forEach(control => {
          const errorSublist = (this.cellObjs || {})[control.controlId];
          if (errorSublist) {
            errorSublist.cell.setState({
              error: false,
              cellErrors: {},
            });
          }
        });
      }
      if (document.querySelector('.worksheetRowEditBox .cellControlErrorTip')) {
        hasError = true;
      }
    }

    if (hasError) {
      this.setState({ showError: true });
      alert(_l('请正确填写'), 3);
      return false;
    } else if (document.querySelectorAll('.formMain .Progress--circle').length > 0) {
      alert(_l('附件正在上传，请稍后', 3));
      return false;
    } else if (hasRuleError) {
      return false;
    } else {
      this.submitted = true;
      const newOldControl = [];

      updateControlIds.forEach(id => {
        newOldControl.push(formatControlToServer(data.find(item => item.controlId === id)));
      });

      worksheetAjax.editRowByLink({ id, newOldControl }).then(res => {
        if (res.resultCode === 1) {
          this.setState({ isComplete: true });
        } else {
          alert(_l('操作失败，请刷新重试！'), 2);
        }

        this.submitted = false;
      });
    }
  };

  renderError() {
    return (
      <div
        className="worksheetRowEditBox flexColumn"
        style={{ height: 500, alignItems: 'center', justifyContent: 'center' }}
      >
        <i className="icon-Import-failure" style={{ color: '#FF7600', fontSize: 60 }} />
        <div className="Font17 bold mTop15">{_l('链接已失效')}</div>
      </div>
    );
  }

  renderComplete() {
    return (
      <div
        className="worksheetRowEditBox flexColumn"
        style={{ height: 500, alignItems: 'center', justifyContent: 'center' }}
      >
        <i className="icon-check_circle" style={{ color: '#4CAF50', fontSize: 60 }} />
        <div className="Font17 bold mTop15">{_l('提交成功')}</div>
      </div>
    );
  }

  renderContent() {
    const { showError, data, pageIndex } = this.state;

    return (
      <div className="worksheetRowEditBox">
        {this.renderTitle()}

        <CustomFields
          ref={this.customwidget}
          from={7}
          data={data.receiveControls}
          projectId={data.projectId}
          worksheetId={data.worksheetId}
          recordId={data.rowId}
          showError={showError}
          registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
          openRelateRecord={this.getRowRelationRowsData}
        />

        {data.type === 2 && (
          <div className="mTop50 TxtCenter">
            <Button style={{ height: '36px', lineHeight: '36px' }} onClick={this.submitForm}>
              <span className="InlineBlock">{_l('提交')}</span>
            </Button>
          </div>
        )}
      </div>
    );
  }

  handleScroll = (event, values) => {
    const { direction, maximum, position } = values;
    if (
      direction === 'down' &&
      maximum - position < 20 &&
      this.state.count > this.state.pageIndex * this.state.pageSize
    ) {
      this.setState(
        {
          pageIndex: this.state.pageIndex + 1,
        },
        () => {
          this.getRowRelationRowsData(this.state.controlId);
        },
      );
    }
  };

  renderRelationRows() {
    const { rowRelationRowsData, controlName, coverCid, showControls, loading, pageIndex } = this.state;

    return (
      <div className="flexColumn h100">
        <div className="worksheetRowEditHeader">
          <div className="flexRow">
            <Icon
              icon="backspace "
              className="Font18 ThemeHoverColor3 Gray pointer"
              onClick={() => this.setState({ rowRelationRowsData: null, pageIndex: 1, controlId: '', count: 0 })}
            />
            <div className='Font16 ellipsis WordBreak mLeft5'>
              {controlName}
            </div>
            <div className='Font16 Gray_75 mLeft5 mRight30'>
              ({rowRelationRowsData.data.length})
            </div>
            <div className='flex' />
          </div>
        </div>

        <ScrollView className="flex mTop20" updateEvent={this.handleScroll}>
          <div className="worksheetRowEditList">
            {!rowRelationRowsData.data.length && (
              <div
                className="worksheetRowEditBox flexColumn"
                style={{
                  height: 500,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  background: '#fff',
                }}
              >
                <div className="Font17 Gray_bd">{_l('暂未添加记录')}</div>
              </div>
            )}
            {rowRelationRowsData.data.map((record, i) => (
              <RecordCard
                key={i}
                disabled={true}
                coverCid={coverCid}
                showControls={showControls}
                controls={rowRelationRowsData.template.controls}
                data={record}
              />
            ))}
          </div>
          {loading && pageIndex > 1 && <LoadDiv className="mTop20" />}
        </ScrollView>
      </div>
    );
  }

  render() {
    const { isComplete, loading, data, rowRelationRowsData, isError, pageIndex } = this.state;

    if (loading && pageIndex <= 1) {
      return <LoadDiv className="mTop20" />;
    }

    if (rowRelationRowsData !== null) {
      return this.renderRelationRows();
    }

    return (
      <ScrollView className="worksheetRowEdit flexColumn">
        {isError
          ? this.renderError()
          : isComplete || data.writeCount > 0
          ? this.renderComplete()
          : this.renderContent()}
      </ScrollView>
    );
  }
}

const Comp = preall(WorksheetRowEdit, { allownotlogin: true });

ReactDom.render(<Comp />, document.getElementById('app'));
