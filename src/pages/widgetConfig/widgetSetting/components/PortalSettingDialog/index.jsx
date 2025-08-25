import React, { Component } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import 'src/pages/widgetConfig/styled/style.less';
import { enumWidgetType, getWidgetInfo } from 'src/pages/widgetConfig/util';
import WidgetExplain from 'src/pages/widgetConfig/widgetSetting/components/WidgetExplain';
import WidgetVerify from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify';
import Settings from 'src/pages/widgetConfig/widgetSetting/settings';
import Switch from '../../settings/switch';
import DynamicDefaultValue from '../DynamicDefaultValue';
import {
  HAS_AREA_CONTROL,
  HAS_EXPLAIN_CONTROL,
  HAS_NUMBER_CONTROL,
  HAS_OPTION_CONTROL,
  HAS_RADIO_CONTROL,
  HAS_RELATE_CONTROL,
  HAS_VERITY_CONTROL,
} from './configs';

const PortalWrap = styled.div`
  & > div:first-child {
    margin-top: 0 !important;
  }
`;

// 参数data(单个控件详情),globalSheetInfo（appId、groupId、name、projectId、worksheetId）
export default class PortalSettingDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
    };
  }

  onChange = value => {
    this.setState({
      data: Object.assign({}, this.state.data, value),
    });
  };

  render() {
    const { onClose, onOk, globalSheetInfo, from, allControls } = this.props;
    const { data = {} } = this.state;
    const { type } = data;
    const ENUM_TYPE = enumWidgetType[type];
    const allProps = { data, onChange: this.onChange, globalSheetInfo, from, allControls };
    const SettingComponent = Settings[ENUM_TYPE];
    const { icon, widgetName } = getWidgetInfo(type);
    return (
      <Dialog
        title={
          <div className="flexCenter">
            <i className={cx('icon Font20 mRight10 Gray_75', `icon-${icon}`)} />
            <span>{widgetName}</span>
          </div>
        }
        className="portalSettingsDialog"
        visible={true}
        width={360}
        onCancel={onClose}
        okText={_l('保存')}
        onOk={() => onOk(data)}
      >
        <PortalWrap>
          {/**类型切换 */}
          {HAS_RADIO_CONTROL.includes(type) && <SettingComponent className="mTop0" {...allProps} />}
          {/**选项、数值、地区设置 */}
          {HAS_OPTION_CONTROL.includes(type) && <SettingComponent className="mTop0" {...allProps} fromPortal={true} />}
          {HAS_NUMBER_CONTROL.includes(type) && <SettingComponent {...allProps} fromPortal={true} />}
          {HAS_AREA_CONTROL.includes(type) && <SettingComponent {...allProps} />}
          {HAS_RELATE_CONTROL.includes(type) && <SettingComponent {...allProps} fromPortal={true} />}
          {/** 检查项 */}
          {type === 36 && (
            <div className="checkWrap">
              <Switch {...allProps} />
              <DynamicDefaultValue {...allProps} allControls={[]} />
            </div>
          )}
          {/**验证 */}
          {HAS_VERITY_CONTROL.includes(type) && <WidgetVerify {...allProps} fromPortal={true} />}
          {/**引导文案 */}
          {HAS_EXPLAIN_CONTROL.includes(type) && <WidgetExplain {...allProps} />}
        </PortalWrap>
      </Dialog>
    );
  }
}
