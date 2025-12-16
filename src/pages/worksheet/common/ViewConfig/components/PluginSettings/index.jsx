import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Drawer } from 'antd';
import { saveAs } from 'file-saver';
import _ from 'lodash';
import moment from 'moment';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Input, SvgIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';
import { SwitchStyle } from 'src/pages/worksheet/common/ViewConfig/style.jsx';
import AddDialog from './AddDialog';
import { controlTypeList, defaultData, PARAM_TYPES } from './config';
import Edit from './Edit';
import SettingList from './SettingList';
import './index.less';

const Wrap = styled.div`
  .tit {
    font-weight: 400;
  }
  .pluginSet {
    width: 440px;
    height: 36px;
    background: #ffffff;
    border-radius: 3px 3px 3px 3px;
    border: 1px solid #dddddd;
    &:hover {
      border: 1px solid #ccc;
    }
    .iconCon {
      width: 43px;
      height: 36px;
      border: 1px solid #dddddd;
      margin: -1px;
      z-index: 0;
      border-radius: 3px 0 0 3px;
      &:hover {
        border: 1px solid #ccc;
        z-index: 1;
      }
      & > div {
        margin: 0 auto;
      }
    }
    .Input {
      margin: -1px -1px -1px 0;
      border: 1px solid #dddddd;
      border-radius: 0 3px 3px 0;
      &:focus,
      &:hover {
        z-index: 1;
      }
    }
  }
  .paramCon {
    .w100 {
      width: 100px !important;
    }
    .w130 {
      width: 130px !important;
    }
    .actionCon {
      width: 60px;
    }
  }
`;
const WrapPopup = styled.div`
  background: #ffffff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.24);
  padding: 6px 0;
  border-radius: 3px 3px 3px 3px;
  width: 160px;
  & > div {
    line-height: 36px;
    padding: 0 16px;
    font-weight: 400;
    &:hover {
      background: #1677ff;
      color: #fff;
    }
  }
`;

function PluginSettings(params) {
  const { projectId, worksheetControls, onChangeView, view } = params;
  const [
    { switchSettings, paramSettings, name, icon, iconUrl, iconColor, editInfo, showEdit, addVisible, key },
    setState,
  ] = useSetState({
    switchSettings: {},
    paramSettings: [],
    name: _l('自定义视图'),
    iconUrl: 'https://fp1.mingdaoyun.cn/customIcon/sys_12_4_puzzle.svg',
    icon: 'sys_12_4_puzzle',
    iconColor: '#445A65',
    editInfo: null,
    visible: false,
    addVisible: false,
    key: moment().format('YYYYMMDDhhmmss'),
    showEdit: false,
  });
  useEffect(() => {
    const { view } = params;
    const { pluginInfo = {} } = view;
    const { switchSettings = {}, paramSettings = [], name, iconUrl, icon, iconColor } = pluginInfo;
    setState({
      switchSettings,
      paramSettings,
      name,
      icon: icon || 'sys_12_4_puzzle',
      iconUrl: iconUrl || 'https://fp1.mingdaoyun.cn/customIcon/sys_12_4_puzzle.svg',
      iconColor: iconColor || '#445A65',
    });
  }, [params]);
  const handleSortEnd = list => {
    onChangeView(
      {
        paramSettings: list,
      },
      true,
    );
    setState({
      paramSettings: list,
    });
  };
  const openEdit = n => {
    setState({ editInfo: paramSettings.find((o, i) => i === n), showEdit: true });
  };
  const onEdit = (info, n) => {
    let list = paramSettings.map((o, i) => {
      if (i === n) {
        return { ...o, ...info };
      } else {
        return o;
      }
    });
    setState({
      paramSettings: list,
    });
    onChangeView(
      {
        paramSettings: list,
      },
      true,
    );
  };
  const onDelete = n => {
    const { view } = params;
    onChangeView(
      {
        paramSettings: paramSettings.filter((o, i) => i !== n),
      },
      true,
    );
    const { plugin_map } = _.get(view, 'advancedSetting');
    onChangeView(
      {
        plugin_map: JSON.stringify({
          ..._.omit(safeParse(plugin_map), [(paramSettings.find((o, i) => i === n) || {}).fieldId]),
        }),
      },
      false,
      { pluginId: _.get(view, 'pluginInfo.id'), editAttrs: ['advancedSetting', 'pluginId'] },
    );
  };
  return (
    <Wrap className="mTop24">
      {/* <div className="title Bold mTop24">{_l('提交设置')}</div> */}
      <div className="tit mTop16 Bold">{_l('插件名称')}</div>
      <div className="pluginSet flexRow alignItemsCenter mTop8">
        <Trigger
          action={['click']}
          popup={
            <SelectIcon
              className={''}
              hideInput
              iconColor={iconColor}
              icon={iconUrl}
              name={icon}
              projectId={projectId}
              onModify={({ iconColor, icon }) => {
                if (iconColor) {
                  onChangeView({ iconColor }, true);
                } else {
                  onChangeView({ icon: icon }, true);
                }
              }}
            />
          }
          zIndex={1000}
          popupAlign={{
            points: ['tl', 'bl'],
            offset: [-280, 0],
            overflow: {
              adjustX: true,
              adjustY: true,
            },
          }}
          getPopupContainer={() => document.body}
        >
          <div className="iconCon flexRow alignItemsCenter Hand TxtMiddle">
            <SvgIcon url={iconUrl} fill={iconColor} size={20} />
          </div>
        </Trigger>
        <Input
          className="flex"
          value={name}
          onChange={name => {
            setState({
              name,
            });
          }}
          onBlur={() => {
            let value = name.trim();
            if (_.get(view, 'pluginInfo.name') !== value) {
              onChangeView({ name: value }, true);
            }
          }}
        />
      </div>
      <div className="tit mTop24 Bold">{_l('系统功能')}</div>
      <SwitchStyle
        className="Hand flexRow alignItemsCenter mTop4"
        onClick={() => {
          onChangeView(
            {
              switchSettings: {
                ...switchSettings,
                showRefresh: switchSettings.showRefresh === '1' ? '' : '1',
              },
            },
            true,
          );
        }}
      >
        <Icon icon={switchSettings.showRefresh === '1' ? 'ic_toggle_on' : 'ic_toggle_off'} className="Font28" />
        <div className="switchText switchTextP mLeft12 InlineBlock Gray Hand">{_l('自动刷新')}</div>
        <Tooltip title={_l('每隔一段时间后自动刷新当前视图')} placement="right">
          <i className="icon-help Gray_9e Font16"></i>
        </Tooltip>
      </SwitchStyle>
      <SwitchStyle
        className="Hand flexRow alignItemsCenter mTop4"
        onClick={() => {
          onChangeView(
            {
              switchSettings: {
                ...switchSettings,
                showFastFilter: switchSettings.showFastFilter === '1' ? '' : '1',
              },
            },
            true,
          );
        }}
      >
        <Icon icon={switchSettings.showFastFilter === '1' ? 'ic_toggle_on' : 'ic_toggle_off'} className="Font28" />
        <div className="switchText switchTextP mLeft12 InlineBlock Gray Hand">{_l('快速筛选')}</div>
      </SwitchStyle>
      <SwitchStyle
        className="Hand flexRow alignItemsCenter"
        onClick={() => {
          onChangeView(
            {
              switchSettings: {
                ...switchSettings,
                showNav: switchSettings.showNav === '1' ? '' : '1',
              },
            },
            true,
          );
        }}
      >
        <Icon icon={switchSettings.showNav === '1' ? 'ic_toggle_on' : 'ic_toggle_off'} className="Font28" />
        <div className="switchText switchTextP mLeft12 InlineBlock Gray Hand">{_l('筛选列表')}</div>
      </SwitchStyle>
      <div className="title Bold mTop32">{_l('参数设置')}</div>
      <div className="mTop4 Gray_75">
        {_l('配置使用本视图时需要的设置项，对应变量可以在插件代码中引用')}
        <span
          className="editHref ThemeColor3 mLeft5 Hand"
          onClick={() => {
            params.onUpdateTab('ParameterSet');
          }}
        >
          {_l('预览')}
        </span>
      </div>
      <div className="paramCon">
        <div className="headCon flexRow alignItemsCenter mTop20">
          <div className="w100 Gray_75">{_l('类型')}</div>
          <div className="w130 mLeft12 Gray_75">{_l('名称')}</div>
          <div className="w130 mLeft12 Gray_75">
            {_l('变量 id')}
            <span className="Red">*</span>
          </div>
          <div className="actionCon TxtRight">
            <Tooltip title={_l('清空参数')}>
              <i
                className="icon-clean_all Font20 Gray_9e ThemeHoverColor3 Hand"
                onClick={() => {
                  setState({
                    key: moment().format('YYYYMMDDhhmmss'),
                  });
                  onChangeView(
                    {
                      paramSettings: [],
                    },
                    true,
                  );
                }}
              />
            </Tooltip>
          </div>
        </div>
        <div className="listCon">
          <SettingList
            items={paramSettings}
            key={key}
            helperClass={'itemSortLiHand'}
            onEdit={onEdit}
            openEdit={openEdit}
            onDelete={onDelete}
            onSortEnd={handleSortEnd}
          />
        </div>
        <div className="nextStep mTop20 flexRow alignItemsCenter">
          <Trigger
            // popupVisible={visible}
            // onPopupVisibleChange={visible => {
            //   setState({ visible });
            // }}
            popup={
              <WrapPopup>
                {PARAM_TYPES.map(o => {
                  return (
                    <div
                      className="Hand Font14"
                      onClick={() => {
                        let num = paramSettings.filter(a => a.fieldId === o.fieldId).length;
                        const getNum = num => {
                          if (paramSettings.find(a => a.fieldId === `${o.fieldId}${num}`)) {
                            return getNum(num + 1);
                          } else {
                            return num;
                          }
                        };
                        onChangeView(
                          {
                            paramSettings: paramSettings.concat(
                              defaultData(o.type, {
                                fieldId: `${o.fieldId}${num > 0 ? getNum(num) : ''}`,
                                paramName: o.paramName,
                                type: o.type,
                                sourceControlType: o.sourceControlType,
                              }),
                            ),
                          },
                          true,
                        );
                      }}
                    >
                      {o.paramName}
                    </div>
                  );
                })}
              </WrapPopup>
            }
            action={['click']}
            popupAlign={{
              points: ['tl', 'bl'],
              offset: [0, 5],
              overflow: { adjustX: true, adjustY: true },
            }}
            getPopupContainer={() => document.body}
          >
            <span className="Gray_9e Bold Hand flexRow alignItemsCenter ThemeHoverColor3">
              <Icon icon={'add'} className="Font20" />
              <span className="mLeft4">{_l('参数%05037')}</span>
            </span>
          </Trigger>
          <span className="mLeft8 Gray_d">｜</span>
          <span
            className="mLeft8 Gray_9e Bold Hand ThemeHoverColor3"
            onClick={() => {
              setState({ addVisible: true });
            }}
          >
            {_l('从代码添加')}
          </span>
          <span className="flex"></span>
          {paramSettings.length > 0 && (
            <span
              className="Gray_9e Bold Hand ThemeHoverColor3"
              onClick={() => {
                var jsonStr = JSON.stringify(paramSettings);
                var blob = new Blob([jsonStr], { type: 'application/json' });
                // 设置文件名称
                const now = new Date();
                const date = moment(now).format('YYYYMMDDhhmmss');
                // 下载文件
                saveAs(blob, `${name}_${date}.json`);
              }}
            >
              {_l('生成JSON代码')}
            </span>
          )}
        </div>
      </div>
      <Drawer
        width={400}
        className="Absolute"
        onClose={() => setState({ editInfo: null, showEdit: false })}
        placement="right"
        visible={showEdit}
        maskClosable={false}
        closable={false}
        getContainer={false}
        mask={false}
      >
        {showEdit && (
          <Edit
            controls={worksheetControls.filter(o => controlTypeList.includes(o.type))}
            info={editInfo}
            onClickAwayExceptions={[
              '.ant-select',
              '.scrollViewContainer',
              '.mui-dialog-container',
              '.ant-select-dropdown',
              '.rc-trigger-popup',
              '.selectUserBox',
              '.ant-picker-dropdown',
              '#quickSelectDept',
              '.selectRoleDialog',
              '.ant-modal',
            ]}
            onClickAway={() => setState({ editInfo: null, showEdit: false })}
            onClose={() => setState({ editInfo: null, showEdit: false })}
            onChange={data => {
              const list = paramSettings.map(o => {
                if (o.fieldId === data.fieldId) {
                  return data;
                } else {
                  return o;
                }
              });
              if (_.isEqual(list, paramSettings)) {
                return;
              }
              onChangeView(
                {
                  paramSettings: list,
                },
                true,
              );
              setState({ editInfo: data });
            }}
          />
        )}
      </Drawer>
      {addVisible && (
        <AddDialog
          onOk={str => {
            let value = [];
            try {
              value = safeParse(str, 'array');
            } catch (error) {
              console.log(error);
              return alert(_l('请输入正确的格式'), 3);
            }
            if (!(_.isObject(value) && _.isArray(value)) || value.length <= 0) {
              return alert(_l('请输入正确的格式'), 3);
            }
            let errData = value.filter(
              o =>
                !(
                  _.isObject(o) &&
                  //数组里面单个是对象
                  !_.isArray(o) &&
                  !!o.fieldId &&
                  !!o.type &&
                  //每个的控件类型符合
                  PARAM_TYPES.map(it => it.type).includes(o.type)
                ),
            );
            if (errData.length > 0) {
              return alert(_l('请输入正确的格式'), 3);
            }
            let ids = value.map(o => o.fieldId);
            if (_.uniq(ids).length < ids.length) {
              return alert(_l('请输入正确的格式'), 3);
            }
            onChangeView(
              {
                paramSettings: value,
              },
              true,
            );
            setState({
              addVisible: false,
            });
          }}
          onCancel={() =>
            setState({
              addVisible: false,
            })
          }
        />
      )}
    </Wrap>
  );
}
export default errorBoundary(PluginSettings);
