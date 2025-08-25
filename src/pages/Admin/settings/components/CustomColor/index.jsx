import React, { Component } from 'react';
import { TinyColor } from '@ctrl/tinycolor';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Icon } from 'ming-ui';
import projectAjax from 'src/api/projectSetting';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import AddColorDialog from 'src/pages/AppHomepage/components/SelectIcon/AddColorDialog';
import { navigateTo } from 'src/router/navigateTo';
import { SYS_CHART_COLORS, SYS_COLOR } from '../../config';
import ChartColorSetting from './ChartColorSetting';
import ChartSettingDialog from './ChartSettingDialog';
import IllustrationTrigger from './IllustrationTrigger';
import '../index.less';

const ColorBox = styled.div(
  ({ color, select = false, hasRemove = false }) => `
  width: 36px;
  height: 36px;
  background: #ffffff;
  border: 1px solid;
  border-color: ${select ? '#d5d5d5' : '#fff'};
  border-radius: 4px;
  padding: 3px;
  position: relative;
  cursor: pointer;
  &:hover {
    border-color: #1677ff;
    .removeIcon {
      opacity: ${hasRemove ? 1 : 0};
    }
  }
  .colorBg {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    background: ${color};

    display: flex;
    align-items: center;
    justify-content: center;
    .selectIcon {
      font-size: 16px;
      color: #fff;
      opacity: 1;
    }
  }
  .removeIcon {
    position: absolute;
    font-size: 16px;
    top: 0;
    right: 0;
    background: #fff;
    transform: translate(50%, -50%);
    border-radius: 50%;
    opacity: 0;
    cursor: pointer;
    color: #bdbdbd;
    &:hover {
      color: #1677ff;
    }
  }
  .hide {
    opacity: 0;
  }
`,
);

export default class CustomColor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      system_color: [],
      custom_color: [],
      system_char: [],
      custom_char: [],
      customChartDialog: {
        visible: false,
        data: null,
        editable: false,
        id: null,
      },
      mdProjectColorIndex: _.findIndex(md.global.Account.projects, l => l.projectId === props.projectId),
      addThemeColorVisible: false,
    };
  }

  componentDidMount() {
    this.getColorSettings();
  }

  getColorSettings = () => {
    const { projectId } = this.props;
    projectAjax.getColorSettings({ projectId }).then(res => {
      const { themeColor = {}, chartColor = {} } = res || {};

      this.setState({
        system_color: (!themeColor.system || _.isEmpty(themeColor.system) ? SYS_COLOR : themeColor.system).map(l => {
          return {
            ...l,
            enable: _.has(l, 'enable') ? l.enable : true,
          };
        }),
        custom_color: themeColor.custom || [],
        system_char: (!chartColor.system || _.isEmpty(chartColor.system) ? SYS_CHART_COLORS : chartColor.system).map(
          (l, i) => {
            return {
              ...SYS_CHART_COLORS[i],
              enable: _.has(l, 'enable') && i !== 0 ? l.enable : true,
            };
          },
        ),
        custom_char: chartColor.custom || [],
      });
    });
  };

  setColorSetting = (key, value, group) => {
    const { projectId } = this.props;
    const { mdProjectColorIndex } = this.state;
    projectAjax
      .editColorSettings({
        projectId,
        [group]:
          group === 'chart' && key.startsWith('system')
            ? value.map((l, i) => {
                return {
                  id: l.id,
                  enable: i === 0 ? true : l.enable,
                };
              })
            : value,
        type: key.startsWith('system') ? 0 : 1,
      })
      .then(res => {
        if (res) {
          if (typeof res !== 'boolean' && res[0]) {
            value[value.length - 1].id = res[0];
          }
          this.setState({ [key]: value });
          md.global.PorjectColor[mdProjectColorIndex][group === 'chart' ? 'chartColor' : 'themeColor'][
            key.split('_')[0]
          ] = value;
        } else alert(_l('设置失败'), 2);
      });
  };

  isMax = () => {
    const { system_color, custom_color } = this.state;

    if (system_color.filter(l => l.enable).length + custom_color.filter(l => l.enable).length > 17) return true;
    return false;
  };

  initChartDialog = () => {
    this.setState({ customChartDialog: { visible: false, data: null, editable: false, id: null } });
  };

  selected = (item, key) => {
    const { system_color, custom_color } = this.state;

    if (!item.enable && this.isMax()) {
      alert(_l('最多显示18个主题颜色'), 3);
      return;
    }

    if (item.enable && system_color.concat(custom_color).filter(l => l.enable).length === 1) {
      alert(_l('最少选择1个主题颜色'), 3);
      return;
    }

    let list = this.state[key];

    this.setColorSetting(
      key,
      list.map(l => {
        return {
          color: l.color,
          enable: l.color === item.color ? !l.enable : l.enable,
        };
      }),
      'theme',
    );
  };

  renderColorList = (list, key = 'system_color', editable) => {
    const { system_color, custom_color } = this.state;

    return (
      <div className="sysColorWrap mBottom24">
        {list.map(item => {
          return (
            <ColorBox
              color={item.color}
              select={item.enable}
              key={`${key}-${item.color}`}
              onClick={() => this.selected(item, key)}
              hasRemove={editable}
            >
              <div className="colorBg">
                <i className={cx('icon-done selectIcon', { hide: !item.enable })}></i>
              </div>
              <i
                className="icon-minus-square removeIcon"
                onClick={e => {
                  e.stopPropagation();

                  if (item.enable && system_color.concat(custom_color).filter(l => l.enable).length === 1) {
                    alert(_l('最少选择1个主题颜色'), 3);
                    return;
                  }

                  this.setColorSetting(
                    'custom_color',
                    custom_color.filter(l => l.color !== item.color),
                    'theme',
                  );
                }}
              ></i>
            </ColorBox>
          );
        })}
        {editable && (
          <div className="addColorWrap" onClick={() => this.setState({ addThemeColorVisible: true })}>
            <i className="icon-add addIcon"></i>
          </div>
        )}
      </div>
    );
  };

  renderChartList = (list, editable = false) => {
    const { custom_char } = this.state;

    return (
      <div className="chartSettingWrap">
        {list.map((item, index) => {
          return (
            <ChartColorSetting
              name={item.name}
              editable={editable}
              selected={item.enable}
              colors={item.colors}
              disablechecked={editable ? false : index === 0}
              openDialog={() => {
                this.setState({
                  customChartDialog: {
                    visible: true,
                    data: item,
                    editable: editable,
                    id: item.id,
                  },
                });
              }}
              handleSelect={value => {
                if (!editable && index === 0) return;

                let key = editable ? 'custom_char' : 'system_char';
                this.setColorSetting(
                  key,
                  this.state[key].map(l => {
                    return item.id === l.id ? { ...l, enable: value } : l;
                  }),
                  'chart',
                );
              }}
              copy={() => {
                if (!editable) return;
                if (custom_char.length > 9) {
                  alert(_l('最多添加十个自定义图标配色'), 3);
                  return;
                }
                this.setColorSetting(
                  'custom_char',
                  custom_char.concat({ ...item, themeColors: [], enable: false, id: null }),
                  'chart',
                );
              }}
              remove={() => {
                if (!editable) return;
                this.setColorSetting(
                  'custom_char',
                  custom_char.filter(l => l.id !== item.id),
                  'chart',
                );
              }}
            />
          );
        })}
      </div>
    );
  };

  render() {
    const { system_color, custom_color, system_char, custom_char, customChartDialog, addThemeColorVisible } =
      this.state;

    return (
      <div className="orgManagementWrap managementCustomColor flex flexColumn">
        <AdminTitle prefix={_l('自定义颜色')} />
        <div className="orgManagementHeader flexRow">
          <div className="flexRow alignItemsCenter">
            <Icon
              icon="backspace"
              className="Font22 ThemeHoverColor3 pointer"
              onClick={() => navigateTo(`/admin/settings/${this.props.projectId}`)}
            />
            <div className="Font17 bold flex mLeft10">
              {_l('自定义颜色')}
              <span className="Font13 Gray_9 mLeft10">{_l('自定义颜色可用于应用、自定义页面等地方')}</span>
            </div>
          </div>
        </div>
        <div className="managementCustomColorContent flex">
          <div className="themeColorSetting">
            <div className="Font15 Gray Bold mBottom24">
              {_l('主题色')}
              <span className="Font13 Gray_9 Normal mLeft16">{_l('最多显示18个主题颜色')}</span>
            </div>
            <div className="Font14 Gray Bold mBottom16">{_l('系统预设')}</div>
            {this.renderColorList(system_color, 'system_color', false)}
            <IllustrationTrigger type="theme">
              <div className="Font14 Gray Bold mBottom16 valignWrapper fitContent">
                {_l('自定义')}
                <span className="Gray_9 Font13 Normal mLeft8">{_l('对比度大于%0', '70%')}</span>
                <Icon icon="info_outline" className="Font16 Gray_bd mLeft4" />
              </div>
            </IllustrationTrigger>
            {this.renderColorList(custom_color, 'custom_color', true)}
          </div>
          <div className="chartColorSetting">
            <div className="Font15 Gray Bold flexRow chartSettingHeader">
              {_l('图表配色')}
              <Button
                className="createChartColorBtn"
                icon="add"
                radius
                onClick={() => {
                  if (custom_char.length > 9) {
                    alert(_l('最多添加十个自定义图标配色'), 3);
                    return;
                  }
                  this.setState({ customChartDialog: { visible: true, data: null, editable: true } });
                }}
              >
                <span className="mLeft6">{_l('创建自定义颜色')}</span>
              </Button>
            </div>
            <div className="Font14 Gray Bold mBottom16">{_l('系统预设')}</div>
            {this.renderChartList(system_char)}
            <div className="Font14 Gray Bold mBottom16 mTop40">{custom_char.length ? _l('自定义') : null}</div>
            {this.renderChartList(custom_char, true)}
          </div>
        </div>
        {customChartDialog.visible && (
          <ChartSettingDialog
            visible={customChartDialog.visible}
            data={customChartDialog.data}
            editable={customChartDialog.editable}
            customColors={custom_color}
            id={customChartDialog.id}
            customChar={custom_char}
            onCancel={() => this.initChartDialog()}
            onOk={value => {
              this.setColorSetting(
                'custom_char',
                customChartDialog.data
                  ? custom_char.map(l => (l.id === customChartDialog.id ? { ...value, enable: l.enable } : l))
                  : custom_char.concat({ ..._.pick(value, ['name', 'colors', 'themeColors']), enable: true }),
                'chart',
              );
              this.initChartDialog();
            }}
          />
        )}
        {addThemeColorVisible && (
          <AddColorDialog
            onSave={value => {
              if (custom_color.length > 17) {
                alert(_l('自定义主题色最多添加18个'), 3);
                return;
              }

              if (
                SYS_COLOR.concat(custom_color).find(
                  l => new TinyColor(l.color).toHex8String() === new TinyColor(value).toHex8String(),
                )
              ) {
                alert(_l('颜色已存在'), 3);
                return;
              }

              this.setColorSetting(
                'custom_color',
                custom_color.concat({ color: value, enable: !this.isMax() }),
                'theme',
              );
            }}
            onCancel={() => this.setState({ addThemeColorVisible: false })}
          />
        )}
      </div>
    );
  }
}
