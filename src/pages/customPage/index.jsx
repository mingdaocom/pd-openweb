import React, { Component, createRef } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { LoadDiv } from 'ming-ui';
import customApi from 'src/pages/worksheet/common/Statistics/api/custom.js';
import update from 'immutability-helper';
import ConfigHeader from './ConfigHeader';
import WebLayout from './webLayout';
import * as actions from './redux/action';
import { updateSheetList } from 'src/pages/worksheet/redux/actions/sheetList';
import { enumWidgetType, reorderComponents } from './util';
import MobileLayout from './mobileLayout';
import './index.less';

const TYPE_TO_COMP = {
  web: WebLayout,
  mobile: MobileLayout,
};

const CustomPageWrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background-color: #fff;
  .contentWrap {
    box-sizing: border-box;
    display: flex;
    height: 100%;
    padding-top: 50px;
  }
  .react-grid-item > .react-resizable-handle::after {
    width: 8px;
    height: 8px;
  }
`;

const mapStateToProps = ({ customPage, sheet }) => ({ ...customPage, ...sheet.base });

const mapDispatchToProps = dispatch => bindActionCreators({ ...actions, updateSheetList }, dispatch);

@connect(mapStateToProps, mapDispatchToProps)
export default class CustomPage extends Component {
  static propTypes = {};
  static defaultProps = {};

  state = {
    displayType: 'web',
  };

  componentDidMount() {
    this.getPageData();
    document.title = _l('编辑页面 - %0', _.get(this.props, ['pageName']));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pageName !== this.props.pageName) {
      document.title = _l('编辑页面 - %0', _.get(nextProps, ['pageName']));
    }
  }

  getPageData = () => {
    const { pageId, updatePageInfo, updateLoading } = this.props;
    updateLoading(true);
    customApi
      .getPage({ appId: pageId })
      .then(({ components, version }) => {
        updatePageInfo({ components, pageId, version, visible: true });
        this.$originComponents = components;
      })
      .always(() => updateLoading(false));
  };

  handleBack = () => {
    const { updateModified, updateEditPageVisible } = this.props;
    updateEditPageVisible(false);
    updateModified(false);
  };

  // 保存前处理数据,title处理掉空白字符，type转换为后端需要的数字
  dealComponents = components =>
    components.map(item =>
      _.omit(
        update(item, {
          web: { title: { $apply: value => value.trim() } },
          mobile: { title: { $apply: value => value.trim() } },
          type: { $apply: value => (typeof value === 'number' ? value : enumWidgetType[value]) },
        }),
        'uuid',
      ),
    );

  handleSave = () => {
    const { version, pageId, components, updatePageInfo } = this.props;
    customApi
      .savePage({
        appId: pageId,
        version: version,
        components: this.dealComponents(components),
      })
      .then(({ appId: pageId, version }) => {
        if (_.isNumber(version)) {
          updatePageInfo({ pageId, version, modified: false });
          alert(_l('保存成功'));
        } else {
          alert(_l('保存失败'));
        }
      })
      .fail(() => {
        alert(_l('保存失败'));
      });
  };

  cancelModified = () => {
    const { updatePageInfo } = this.props;
    updatePageInfo({ components: this.$originComponents });
    this.handleBack();
  };

  switchType = type => {
    const { updateComponents, components } = this.props;
    this.setState({ displayType: type });
    const orderComponent = reorderComponents(components);
    if (orderComponent) {
      updateComponents(orderComponent);
    }
  };

  render() {
    const { loading, ...rest } = this.props;
    const { displayType } = this.state;
    const Comp = TYPE_TO_COMP[displayType];
    return (
      <CustomPageWrap className="customPageWrap">
        <ConfigHeader
          {...rest}
          displayType={displayType}
          cancelModified={this.cancelModified}
          switchType={this.switchType}
          onBack={this.handleBack}
          onSave={this.handleSave}
        />
        <div className="contentWrap">{loading ? <LoadDiv style={{ marginTop: '60px' }} /> : <Comp {...rest} />}</div>
      </CustomPageWrap>
    );
  }
}
