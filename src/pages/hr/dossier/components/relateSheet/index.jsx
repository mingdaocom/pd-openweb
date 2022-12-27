import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import sheetAjax from 'src/api/worksheet';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import RelateRecord from './RelateRecord';
import './style.less';
import { FormError } from '../lib';
import _ from 'lodash';

export default class RelateSheet extends Component {
  static propTypes = {
    /**
     * 文件数据
     */
    data: PropTypes.any,
    /**
     * 【回调】文件数据发生改变
     * @param {Event} event - 触发改变的事件
     * @param {Object} data - 文件数据
     */
    onChange: PropTypes.func,
    worksheetId: PropTypes.string, // 当前工作表Id
    recordId: PropTypes.string, // 记录Id
    dataSource: PropTypes.string, // 关联的工作表Id
    value: PropTypes.any, // 关联的行纪录
    enumDefault: PropTypes.number, // 关联类型 1-单挑， 2-多条
    disabled: PropTypes.bool,
  };
  static defaultProps = {
    data: null,
    onChange: (event, data) => {
      //
    },
  };
  constructor(props) {
    super(props);

    this.state = {
      /**
       * 文件数据
       */
      data: this.props.data || null,
      showRelateRecord: false, // 显示关联层
      entityName: '', // 关联的表的记录名称
      relateSheetBeLongProject: '', // 关联的表归属网络Id
      allowAdd: false, // 操作人是否有关联表的新建记录权限
      relationRecordDialogVisible: false, // 是否显示关联记录详情弹层
      previewItem: {}, // 要预览的关联项
    };
  }
  componentWillMount = function () {
    if (!this.props.disabled) {
      sheetAjax.getWorksheetInfo({ worksheetId: this.props.dataSource }).then(data => {
        this.setState({
          entityName: data.entityName,
          appId: data.appId,
          relateSheetBeLongProject: data.projectId,
          allowAdd: data.allowAdd,
        });
      });
    }
  };

  componentDidMount() {
    // check init value
    this.checkValue(this.state.value, false);
  }
  checkValue = function (value, dirty) {
    const error = {
      type: '',
      message: '',
      dirty,
    };
    if (this.props.required && (!value || !value.length)) {
      error.type = FormError.types.REQUIRED;
    }
    if (error.type) {
      // fire onError callback
      if (this.props.onError) {
        this.props.onError(error);
      }
    } else if (this.props.onValid) {
      // fire onValid callback
      this.props.onValid();
    }

    // update state.error
    // this.setState({
    //   error: !!error.type,
    //   dirty,
    //   showError: dirty || this.props.showError,
    // });
  }.bind(this);
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({
        data: nextProps.data,
      });
    }
  }
  deleteRecordItem = function (recordId) {
    if (this.props.onChange) {
      this.props.onChange(
        null,
        this.props.value.filter(item => item.sid !== recordId),
        {
          prevValue: this.props.value,
        },
      );
    }
  }.bind(this);
  dataChange = function (value) {
    this.setState(
      {
        showRelateRecord: false,
      },
      function () {
        this.checkValue((this.props.value || []).concat(value), true);
        if (this.props.onChange) {
          this.props.onChange(null, (this.props.value || []).concat(value), {
            prevValue: this.props.value,
          });
        }
      },
    );
  }.bind(this);
  renderList = function () {
    const { value, control, disabled } = this.props;
    if (value && value.length) {
      return (
        <div className="mui-sheetList">
          {this.props.value.map((item, index) => (
            <div className="relateRecordItem" key={index}>
              {/* <div className="type-icon">*/}
              {/* <i className='Icon icon icon-file' />*/}
              {/* </div>*/}
              <a
                className={cx({ ThemeHoverColor3: !disabled })}
                onClick={e => this.handleRelationRecordClick(item, e)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="link-name">
                  {renderCellText(Object.assign({}, control, { type: control.sourceControlType, value: item.name })) ||
                    _l('未命名')}
                </span>
              </a>
              {/* <div className="user-img">*/}
              {/* <img data-id={item.accountId} src={item.avatar} alt="" />*/}
              {/* </div>*/}
              {!disabled && (
                <Icon
                  className="ThemeHoverColor3"
                  icon="cancel"
                  onClick={event => {
                    this.deleteRecordItem(item.sid);
                    // this.iconOnClick(event, item, i);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      );
    }
  };
  handleRelationRecordClick = (item, e) => {
    if (!e.button) {
      e.preventDefault();
      const [worksheet = '', rowId = ''] = _.get(item, 'link').split('/row/');
      const [, worksheetId = ''] = worksheet.split('/worksheet/');
      this.setState({ relationRecordDialogVisible: true, previewItem: { ...item, rowId, worksheetId } });
    }
  };
  render() {
    const { control, recordId } = this.props;
    let style = {};
    if (this.state.showRelateRecord && $(this.addButton).offset()) {
      if ($('body').height() - $(this.addButton).offset().top - 40 < 290) {
        style = {
          top: 'inherit',
          bottom: $('body').height() - $(this.addButton).offset().top,
          left: $(this.addButton).offset().left - 10,
          position: 'fixed',
        };
      } else {
        style = { top: $(this.addButton).offset().top + 40, left: $(this.addButton).offset().left - 10 };
      }
    }

    let addButton = null;
    if (
      !this.props.disabled &&
      ((this.props.enumDefault === 1 && this.props.value.length < 1) || this.props.enumDefault === 2)
    ) {
      addButton = (
        <div
          ref={addButton => {
            this.addButton = addButton;
          }}
          className="mui-addRecord ThemeHoverColor3"
          onClick={event => {
            // this.pickLink();
            this.setState({ showRelateRecord: !this.state.showRelateRecord });
          }}
        >
          <Icon icon="plus" />
          <span>{_l('关联%0', this.state.entityName)}</span>
        </div>
      );
    }
    const { previewItem, relationRecordDialogVisible } = this.state;
    const { rowId, worksheetId } = previewItem;
    return (
      <div
        className="mui-relateSheet"
        ref={relateSheet => {
          this.relateSheet = relateSheet;
        }}
      >
        {this.renderList()}
        {addButton}
        {relationRecordDialogVisible && (
          // 关联表预览
          <RecordInfoWrapper
            visible
            appId={this.state.appId || control.appId}
            viewId={control.viewId}
            from={1}
            hideRecordInfo={() => {
              this.setState({ relationRecordDialogVisible: false });
            }}
            recordId={rowId}
            worksheetId={worksheetId}
          />
        )}
        {this.state.showRelateRecord && (
          <RelateRecord
            appId={this.state.appId || control.appId}
            viewId={control.viewId}
            style={style}
            allowAdd={this.state.allowAdd}
            entityName={this.state.entityName}
            relateSheetBeLongProject={this.state.relateSheetBeLongProject}
            relateSheetId={this.props.dataSource}
            worksheetId={this.props.worksheetId}
            dataChange={this.dataChange}
            closeRelate={() => {
              this.setState({ showRelateRecord: false });
            }}
            filterRowId={this.props.value.map(item => item.sid).concat(recordId)}
          />
        )}
      </div>
    );
  }
}
