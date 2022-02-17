import React, { Component } from 'react';
import { Dialog } from 'ming-ui';
import {
  HAS_EXPLAIN_CONTROL,
  HAS_RADIO_CONTROL,
  HAS_OPTION_CONTROL,
  HAS_NUMBER_CONTROL,
  HAS_AREA_CONTROL,
  HAS_PHONE_CONTROL,
  HAS_VERITY_CONTROL,
} from './configs';
import { enumWidgetType, getWidgetInfo } from 'src/pages/widgetConfig/util';
import Settings from 'src/pages/widgetConfig/widgetSetting/settings';
import TelConfig from 'src/pages/widgetConfig/widgetSetting/components/ControlSetting/TelConfig';
import WidgetVerify from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify';
import WidgetExplain from 'src/pages/widgetConfig/widgetSetting/components/WidgetExplain';
import 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/inputTypes/SubSheet/style.less'
import { SettingItem } from 'src/pages/widgetConfig/styled';
import styled from 'styled-components';
import cx from 'classnames';

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
    const { onClose, onOk, globalSheetInfo } = this.props;
    const { data = {} } = this.state;
    const { type } = data;
    const ENUM_TYPE = enumWidgetType[type];
    const allProps = { data, onChange: this.onChange, globalSheetInfo };
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
          {HAS_NUMBER_CONTROL.includes(type) && <SettingComponent {...allProps} />}
          {HAS_AREA_CONTROL.includes(type) && <SettingComponent {...allProps} />}
          {/**验证 */}
          {HAS_VERITY_CONTROL.includes(type) && <WidgetVerify {...allProps} fromPortal={true} />}
          {/**电话设置 */}
          {HAS_PHONE_CONTROL.includes(type) && (
            <SettingItem>
              <div className="settingItemTitle">{_l('设置')}</div>
              <TelConfig {...allProps} />
            </SettingItem>
          )}
          {/**引导文案 */}
          {HAS_EXPLAIN_CONTROL.includes(type) && <WidgetExplain {...allProps} />}
        </PortalWrap>
      </Dialog>
    );
  }
}
