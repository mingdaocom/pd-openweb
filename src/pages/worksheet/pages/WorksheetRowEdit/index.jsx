import React, { Component } from 'react';
import ReactDom from 'react-dom';
import preall from 'src/common/preall';
import styled from 'styled-components';
import { LoadDiv, Button, Icon, ScrollView } from 'ming-ui';
import { getSubListError, filterHidedSubList } from 'worksheet/util';
import worksheetAjax from 'src/api/worksheet';
import './index.less';
import { getFilter } from 'worksheet/common/WorkSheetFilter/util';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import CustomFields from 'src/components/newCustomFields';
import { VerificationPass, SHARE_STATE } from 'worksheet/components/ShareState';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils';
import RecordCard from 'src/components/recordCard';
import _ from 'lodash';

const LoadMask = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 2;
`;
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
    formFlag: undefined,
  };

  componentDidMount() {
    document.title = _l('加载中');
    $('body').addClass('recordShare');
    window.isPublicWorksheet = true;
    this.getLinkDetail();
    $('body,html').scrollTop(0);
  }

  componentWillUnmount() {
    $(document).off('scroll');
  }

  customwidget = React.createRef();
  cellObjs = {};

  bindScroll() {
    const scrollElement = document.querySelector('.worksheetRowEdit');
    scrollElement.addEventListener('scroll', e => {
      var scrollTop = scrollElement.scrollTop;
      var scrollHeight = scrollElement.scrollHeight;
      if (scrollTop >= scrollHeight - 16 - scrollElement.clientHeight) {
        this.handleScroll();
      }
    });
  }

  /**
   * 获取记录详情
   */
  getLinkDetail() {
    const id = location.pathname.match(/.*\/public\/workflow\/(.*)/)[1];
    const clientId = sessionStorage.getItem(id);

    window.recordShareLinkId = id;

    this.requestLinkDetail({ clientId })
      .then(data => {
        this.setState({ loading: false, data, cardControls: data.receiveControls }, this.bindScroll);
      })
      .catch(data => {
        this.setState({ loading: false, data, isError: true });
      });
  }

  requestLinkDetail = param => {
    return new Promise((resolve, reject) => {
      worksheetAjax
        .getLinkDetail({
          id: window.recordShareLinkId,
          ...param,
        })
        .then(data => {
          if (data.resultCode === 1) {
            data.receiveControls.forEach(item => {
              item.fieldPermission = '111';
            });
            data.shareAuthor && (window.shareAuthor = data.shareAuthor);
            data.clientId && sessionStorage.setItem(window.recordShareLinkId, data.clientId);
            return resolve(data);
          } else {
            return reject(data);
          }
        });
    });
  };

  /**
   * 获得关联多条记录
   */
  getRowRelationRowsData = id => {
    const { data, pageIndex, rowRelationRowsData = {}, pageSize, cardControls = [] } = this.state;
    const { controlName, coverCid, showControls } = _.find(data.receiveControls, item => item.controlId === id);
    const shareId = location.pathname.match(/.*\/public\/workflow\/(.*)/)[1];

    const control = _.find(cardControls, { controlId: id });
    let filterControls;
    if (control && control.type === 51) {
      filterControls = getFilter({
        control: { ...control, ignoreFilterControl: true, recordId: data.rowId },
        formData: cardControls,
        filterKey: 'resultfilters',
      });
      if (!filterControls) {
        this.setState({ loading: false, rowRelationRowsData: { data: [] }, count: 0 });
        return;
      }
    }

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
        filterControls: filterControls || [],
      })
      .then(data => {
        this.setState(
          {
            rowRelationRowsData: pageIndex > 1 ? { ...data, data: rowRelationRowsData.data.concat(data.data) } : data,
            loading: false,
            controlId: id,
            count: data.count,
          },
          () => {
            if (pageIndex === 1) {
              $('body,html').scrollTop(0);
            }
          },
        );
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

  onSubmit = () => {
    this.setState({ submitLoading: true });
    this.customwidget.current.submitFormData();
  };

  /**
   * 提交
   */
  onSave = (error, { data, updateControlIds }) => {
    if (this.submitted || error) {
      this.setState({ submitLoading: false });
      return;
    }
    let hasError;
    const id = location.pathname.match(/.*\/public\/workflow\/(.*)/)[1];
    const subListControls = filterHidedSubList(data, 7);
    const getRows = controlId => {
      try {
        return this.cellObjs[controlId].cell.props.rows;
      } catch (err) {
        return [];
      }
    };
    if (subListControls.length) {
      const errors = subListControls
        .map(control => ({
          id: control.controlId,
          value: getSubListError(
            {
              rows: getRows(control.controlId),
              rules: _.get(this.cellObjs || {}, `${control.controlId}.cell.worksheettable.current.table.rules`),
            },
            _.get(this.cellObjs || {}, `${control.controlId}.cell.controls`) || control.relationControls,
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
      alert(_l('请正确填写'), 3);
      this.setState({ submitLoading: false });
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
        this.setState({ submitLoading: false });
      });
    }
  };

  renderError() {
    const { data } = this.state;

    if ([14, 18, 19].includes(data.resultCode)) {
      return (
        <div className="worksheetRowEditBox" style={{ height: 500 }}>
          <VerificationPass
            validatorPassPromise={(value, captchaResult) => {
              return new Promise((resolve, reject) => {
                if (value) {
                  this.requestLinkDetail({
                    password: value,
                    ...captchaResult,
                  })
                    .then(data => {
                      this.setState({ isError: false, data });
                    })
                    .catch(data => {
                      this.setState({ isError: true, data });
                      reject(SHARE_STATE[data.resultCode]);
                    });
                } else {
                  return reject();
                }
              });
            }}
          />
        </div>
      );
    }

    return (
      <div
        className="worksheetRowEditBox flexColumn"
        style={{ height: 500, alignItems: 'center', justifyContent: 'center' }}
      >
        <i className="icon-Import-failure" style={{ color: '#FF7600', fontSize: 60 }} />
        <div className="Font17 bold mTop15">{SHARE_STATE[data.resultCode]}</div>
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
    const { showError, data, submitLoading, formFlag } = this.state;

    return (
      <div className="worksheetRowEditBox">
        {submitLoading && <LoadMask />}
        {this.renderTitle()}

        <CustomFields
          ref={this.customwidget}
          flag={formFlag}
          from={7}
          data={data.receiveControls}
          controlProps={{
            updateRelationControls: (worksheetIdOfControl, newControls) => {
              this.setState(oldState => ({
                formFlag: Math.random(),
                data: {
                  ...oldState.data,
                  receiveControls: oldState.data.receiveControls.map(item => {
                    if (item.type === 34 && item.dataSource === worksheetIdOfControl) {
                      return { ...item, relationControls: newControls };
                    } else {
                      return item;
                    }
                  }),
                },
              }));
            },
          }}
          projectId={data.projectId}
          worksheetId={data.worksheetId}
          recordId={data.rowId}
          showError={showError}
          isWorksheetQuery
          registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
          openRelateRecord={this.getRowRelationRowsData}
          onSave={this.onSave}
        />

        {data.type === 2 && (
          <div className="mTop50 TxtCenter">
            <Button style={{ height: '36px', lineHeight: '36px' }} loading={submitLoading} onClick={this.onSubmit}>
              <span className="InlineBlock">{data.submitBtnName || _l('提交')}</span>
            </Button>
          </div>
        )}
      </div>
    );
  }

  handleScroll = () => {
    if (this.state.count > this.state.pageIndex * this.state.pageSize) {
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
            <div className="Font16 ellipsis WordBreak mLeft5">{controlName}</div>
            <div className="Font16 Gray_75 mLeft5 mRight30">({rowRelationRowsData.data.length})</div>
            <div className="flex" />
          </div>
        </div>

        <div className="flex mTop20">
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
        </div>
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
      <div className="worksheetRowEdit">
        {isError
          ? this.renderError()
          : isComplete || data.writeCount > 0
          ? this.renderComplete()
          : this.renderContent()}
      </div>
    );
  }
}

const Comp = preall(WorksheetRowEdit, { allownotlogin: true });

ReactDom.render(<Comp />, document.getElementById('app'));
