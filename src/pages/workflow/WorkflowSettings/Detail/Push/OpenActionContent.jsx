import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dropdown, Radio } from 'ming-ui';
import homeApp from 'src/api/homeApp';
import worksheet from 'src/api/worksheet';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';
import { PUSH_TYPE } from '../../enum';
import { CustomTextarea, SelectNodeObject, SpecificFieldsValue } from '../components';

export default class OpenActionContent extends Component {
  state = {
    showOtherWorksheet: false,
    otherAppName: '',
    worksheetInfo: null,
  };

  componentDidMount() {
    const { data } = this.props;

    if (data.appId) {
      this.getWorksheetInfo(data.appId);
    }
  }

  /**
   * 获取应用详情
   */
  getAppDetail(appId) {
    homeApp.getApp({ appId }).then(result => {
      this.setState({ otherAppName: result.name });
    });
  }

  /**
   * 获取工作表详情
   */
  getWorksheetInfo(worksheetId) {
    const { data, relationId } = this.props;
    const { otherAppName } = this.state;
    let ajax;

    if (data.pushType === PUSH_TYPE.PAGE) {
      ajax = homeApp.getPageInfo({ id: worksheetId });
    } else {
      ajax = worksheet.getWorksheetInfo({ worksheetId, getViews: true });
    }

    ajax.then(result => {
      if (result.resultCode === 1) {
        this.setState({ worksheetInfo: result });
        if (result.appId !== relationId && otherAppName === '') {
          this.getAppDetail(result.appId);
        }
      } else {
        this.setState({ worksheetInfo: {} });
      }
    });
  }

  /**
   * 渲染选择表
   */
  renderSelectSheet() {
    const { data, currentAppList } = this.props;
    const { worksheetInfo, otherAppName } = this.state;
    const isCustomPage = data.pushType === PUSH_TYPE.PAGE;
    const otherWorksheet = [
      {
        text: isCustomPage ? _l('其它应用下的自定义页面') : _l('其它应用下的工作表'),
        value: 'other',
        className: 'Gray_75',
      },
    ];

    return (
      <Fragment>
        <div className="Font13 bold mTop20">
          {isCustomPage ? _l('自定义页面') : _l('工作表')}
          <span className="mLeft5 red">*</span>
        </div>
        <Dropdown
          className={cx('flowDropdown mTop10', {
            'errorBorder errorBG': data.appId && worksheetInfo !== null && _.isEmpty(worksheetInfo),
          })}
          data={[currentAppList.filter(item => item.type === (isCustomPage ? 1 : 0)), otherWorksheet]}
          value={data.appId}
          renderTitle={
            !data.appId || worksheetInfo === null
              ? () => <span className="Gray_75">{_l('请选择')}</span>
              : data.appId && _.isEmpty(worksheetInfo)
                ? () => (
                    <span className="errorColor">
                      {isCustomPage ? _l('自定义页面无效或已删除') : _l('工作表无效或已删除')}
                    </span>
                  )
                : () => (
                    <Fragment>
                      <span>{worksheetInfo.name}</span>
                      {otherAppName && <span className="Gray_75">（{otherAppName}）</span>}
                    </Fragment>
                  )
          }
          border
          openSearch
          onChange={appId => {
            if (appId === 'other') {
              this.setState({ showOtherWorksheet: true });
            } else {
              this.switchWorksheet(appId);
            }
          }}
        />
      </Fragment>
    );
  }

  /**
   * 渲染视图
   */
  renderView() {
    const { data, updateSource } = this.props;
    const { worksheetInfo } = this.state;

    if (!worksheetInfo || _.isEmpty(worksheetInfo) || worksheetInfo.worksheetId !== data.appId) {
      return null;
    }

    const views = worksheetInfo.views.map(o => ({
      text: o.name,
      value: o.viewId,
      className: data.viewId === o.viewId ? 'ThemeColor3' : '',
    }));
    const selectView = _.find(views, o => o.value === data.viewId);

    return (
      <Fragment>
        <div className="Font13 bold mTop20">
          {_l('视图')}
          <span className="mLeft5 red">*</span>
        </div>

        {data.pushType !== PUSH_TYPE.VIEW && (
          <div className="Font13 Gray_75 mTop5">
            {_l('按照所选视图配置的显示字段发送，如果操作者被分发了此视图，可以直接按权限编辑记录、执行自定义动作')}
          </div>
        )}

        <Dropdown
          className={cx('flowDropdown mTop10', {
            'errorBorder errorBG': data.viewId && !selectView,
          })}
          data={views}
          value={data.viewId}
          renderTitle={
            !data.viewId
              ? () => <span className="Gray_75">{_l('请选择')}</span>
              : data.viewId && !selectView
                ? () => <span className="errorColor">{_l('视图无效或已删除')}</span>
                : () => <span>{selectView.text}</span>
          }
          border
          onChange={viewId => updateSource({ viewId })}
        />
      </Fragment>
    );
  }

  /**
   * 渲染打开详情页面
   */
  renderOpenDetail() {
    const { data, flowNodeList, updateSource } = this.props;

    return (
      <Fragment>
        <div className="Font13 bold mTop20">
          {_l('记录')}
          <span className="mLeft5 red">*</span>
        </div>
        <SelectNodeObject
          smallBorder={true}
          appList={flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeId ? _.find(flowNodeList, o => o.nodeId === data.selectNodeId) || {} : {}}
          onChange={selectNodeId => {
            const selectNodeObj = _.find(flowNodeList, item => item.nodeId === selectNodeId);

            updateSource({ selectNodeId }, () => this.switchWorksheet(selectNodeObj.appId));
          }}
        />
      </Fragment>
    );
  }

  /**
   * 渲染打开方式
   */
  renderOpenType() {
    const { data, updateSource } = this.props;
    const type = [
      { text: _l('刷新当前页面'), value: 1 },
      { text: _l('弹层'), value: 3 },
      { text: _l('打开新页面'), value: 2 },
      { text: _l('推送模态窗口'), value: 4 },
    ];
    const isRemove = value => {
      switch (data.pushType) {
        case PUSH_TYPE.DETAIL:
          return _.includes([1, 4], value);
        case PUSH_TYPE.VIEW:
        case PUSH_TYPE.PAGE:
          return _.includes([3, 4], value);
        case PUSH_TYPE.LINK:
          return _.includes([3], value);
      }
    };

    _.remove(type, item => isRemove(item.value));

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('打开方式')}</div>
        <div className="workflowOpenModeBox">
          {type.map(item => {
            return (
              <div className="mTop15" key={item.value}>
                <Radio
                  text={item.text}
                  checked={item.value === data.openMode}
                  onClick={() => updateSource({ openMode: item.value })}
                />
              </div>
            );
          })}
        </div>

        {data.openMode === 4 && (
          <Fragment>
            <div className="Font13 bold mTop20">{_l('模态窗口大小')}</div>
            <div className="Font13 mTop10">{_l('宽度（px）')}</div>
            <div className="mTop5">
              <SpecificFieldsValue
                type="number"
                min={400}
                max={2000}
                hasOtherField={false}
                allowedEmpty
                data={{ fieldValue: data.windowSize?.width !== undefined ? data.windowSize.width : 800 }}
                updateSource={({ fieldValue }) =>
                  updateSource({ windowSize: { ...data.windowSize, width: parseInt(fieldValue) || '' } })
                }
              />
            </div>

            <div className="Font13 mTop10">{_l('高度（px）')}</div>
            <div className="mTop5">
              <SpecificFieldsValue
                type="number"
                min={300}
                max={1200}
                hasOtherField={false}
                allowedEmpty
                data={{ fieldValue: data.windowSize?.height !== undefined ? data.windowSize.height : 600 }}
                updateSource={({ fieldValue }) =>
                  updateSource({ windowSize: { ...data.windowSize, height: parseInt(fieldValue) || '' } })
                }
              />
            </div>
          </Fragment>
        )}
      </Fragment>
    );
  }

  /**
   * 渲染文本内容
   */
  renderTextContent(key = 'content') {
    const { data, updateSource, formulaMap, updateRootSource } = this.props;

    return (
      <CustomTextarea
        className="minH100"
        projectId={this.props.companyId}
        processId={this.props.processId}
        relationId={this.props.relationId}
        selectNodeId={this.props.selectNodeId}
        type={2}
        content={data.content}
        formulaMap={formulaMap}
        onChange={(err, value) => updateSource({ [key]: value })}
        updateSource={updateRootSource}
      />
    );
  }

  /**
   * 切换工作表
   */
  switchWorksheet = appId => {
    const { switchWorksheet } = this.props;

    this.getWorksheetInfo(appId);
    switchWorksheet(appId);
  };

  render() {
    const { data } = this.props;
    const { showOtherWorksheet } = this.state;

    return (
      <Fragment>
        {data.pushType === PUSH_TYPE.CREATE && this.renderSelectSheet()}

        {data.pushType === PUSH_TYPE.DETAIL && (
          <Fragment>
            {this.renderOpenDetail()}
            {this.renderView()}
            {this.renderOpenType()}
          </Fragment>
        )}

        {data.pushType === PUSH_TYPE.VIEW && (
          <Fragment>
            {this.renderSelectSheet()}
            {this.renderView()}
            {this.renderOpenType()}
          </Fragment>
        )}

        {data.pushType === PUSH_TYPE.PAGE && (
          <Fragment>
            {this.renderSelectSheet()}
            {this.renderOpenType()}
          </Fragment>
        )}

        {data.pushType === PUSH_TYPE.LINK && (
          <Fragment>
            <div className="Font13 bold mTop20">
              {_l('链接')}
              <span className="mLeft5 red">*</span>
            </div>
            {this.renderTextContent()}
            {this.renderOpenType()}
          </Fragment>
        )}

        {showOtherWorksheet && (
          <SelectOtherWorksheetDialog
            projectId={this.props.companyId}
            worksheetType={data.pushType === PUSH_TYPE.PAGE ? 1 : 0}
            selectedAppId={this.props.relationId}
            selectedWorksheetId={data.appId}
            visible
            onOk={(selectedAppId, worksheetId, obj) => {
              const isCurrentApp = this.props.relationId === selectedAppId;

              if (!isCurrentApp && selectedAppId) {
                this.setState({ otherAppName: !isCurrentApp && obj.appName });
              }

              this.switchWorksheet(worksheetId);
            }}
            onHide={() => this.setState({ showOtherWorksheet: false })}
          />
        )}
      </Fragment>
    );
  }
}
