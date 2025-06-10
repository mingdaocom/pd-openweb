import React, { useRef } from 'react';
import { useSetState } from 'react-use';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Dialog, Icon, Input, Radio, SvgIcon, Switch } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import worksheetAjax from 'src/api/worksheet';
import { getTranslateInfo } from 'src/utils/app';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'worksheet/constants/enum';
import { COPY_CONFIGS, TITLE_ENUM, VIEW_TYPE_FILTER_CONFIG, VIEW_TYPE_OPTIONS } from './config';

const ContentWrap = styled.div`
  display: flex;
  flex-direction: ${props => (props.isCopyFrom ? 'column' : 'column-reverse')};
  gap: 24px;
  padding: 0 24px;
  margin-bottom: 14px;
  .SelectWrap {
    position: relative;
    .expandIcon {
      position: absolute;
      top: 10px;
      right: 13px;
    }
  }
  .selectViewCon {
    .ant-select-selector {
      height: 36px !important;
      input {
        height: 34px !important;
      }
    }
    .ant-select-selection-placeholder,
    .ant-select-selection-item > div {
      line-height: 34px !important;
    }
    &.ant-select-multiple .ant-select-selection-item {
      border-radius: 13px !important;
      align-items: center !important;
      background: #f5f5f5 !important;
      border: none !important;
      padding: 0 10px;
      .ant-select-selection-item-remove {
        margin-left: 8px;
      }
    }
  }
  .selectTypeRadio {
    .Radio-box {
      margin-right: 10px !important;
    }
  }
`;

const SearchCon = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid #dddddd;
  margin-bottom: 6px;
  input {
    flex: 1;
    border: none !important;
  }
`;

const EmptyWrap = styled.div`
  display: flex;
  align-items: center;
  height: 80px;
  > div {
    text-align: center;
    width: 100%;
  }
`;

const SelectItem = styled.div`
  min-height: 26px;
  svg {
    vertical-align: middle !important;
  }
`;

const DialogWrap = styled(Dialog)`
  .mui-dialog-header {
    border-bottom: 1px solid #ededed !important;
  }
  .mui-dialog-body {
    padding: 16px 0 22px !important;
  }
`;

export default function CopyViewConfig(props) {
  const { visible, type = 1, appId, view = {}, views = [], onClose = () => {}, updateViews } = props;
  const isCopyFrom = type === 1;
  const otherViews = views.map(view => {
    return {
      ...view,
      name: getTranslateInfo(appId, null, view.viewId).name || view.name
    }
  }).filter(l => l.viewId !== view.viewId);
  const inputRef = useRef();

  const getFilters = filterView => {
    const filterList = _.get(VIEW_TYPE_FILTER_CONFIG, VIEW_DISPLAY_TYPE[filterView.viewType]);

    switch (VIEW_DISPLAY_TYPE[filterView.viewType]) {
      case 'detail':
        return filterView.childType === 1 ? filterList.concat(['FastFilter', 'CardSet']) : filterList;
      case 'structure':
        return filterView.childType === 2
          ? filterList.concat(['FastFilter', 'NavGroup'])
          : filterView.advancedSetting.hierarchyViewType === '3'
            ? filterList.filter(l => !['ColStyle', 'Show'].includes(l)).concat('CardSet')
            : filterList;
      default:
        return filterList;
    }
  };

  const isFilterCardSet = (view1, view2) => {
    return (
      ([3, 1, 6, 2].includes(view1.viewType) && [5, 4, 8].includes(view2.viewType)) ||
      ([3, 1, 6, 2].includes(view2.viewType) && [5, 4, 8].includes(view1.viewType))
    );
  };

  const getConfigs = viewId => {
    const currentViewConfigs = COPY_CONFIGS.filter(l => !getFilters(view).includes(l.key));
    const currentViewId = viewId || selectViewId[0];

    if (!isCopyFrom || _.isEmpty(currentViewId)) return currentViewConfigs;

    const selected = _.find(views, l => l.viewId === currentViewId);

    return currentViewConfigs.filter(
      l => !getFilters(selected).includes(l.key) && (l.key !== 'CardSet' || !isFilterCardSet(selected, view)),
    );
  };

  const [{ keywords, viewType, selectViewId, selectConfigs, saveLoading }, setState] = useSetState({
    keywords: undefined,
    viewType: isCopyFrom ? undefined : 0,
    selectViewId: [],
    selectConfigs: isCopyFrom ? [] : getConfigs(view.viewId).map(l => l.key),
    saveLoading: false,
  });

  const getSelectedViews = () => {
    return {
      sameType: otherViews.filter(l => l.viewType === view.viewType),
      otherType: otherViews.filter(l => l.viewType !== view.viewType),
    };
  };

  const filterFun = l => !keywords || _.toLower(l.name).includes(_.toLower(keywords));

  const onBatchConfigs = type => {
    if (isCopyFrom && _.isEmpty(selectViewId)) return;

    setState({ selectConfigs: type === 'clear' ? [] : getConfigs().map(l => l.key) });
  };

  const onChangeSelectViews = value => {
    setState({ selectViewId: isCopyFrom ? [value] : value });

    if (isCopyFrom) {
      setState({
        selectConfigs: getConfigs(value).map(l => l.key),
      });
    }
  };

  const onSave = async () => {
    const targetViewIds = isCopyFrom ? [view.viewId] : viewType === 0 ? otherViews.map(l => l.viewId) : selectViewId;
    const param = {
      worksheetId: view.worksheetId,
      targetViewIds,
      viewId: !isCopyFrom ? view.viewId : selectViewId[0],
      copyKeys: COPY_CONFIGS.filter(l => selectConfigs.includes(l.key)).map(o => o.datakey),
    };
    setState({ saveLoading: true });
    const res = await worksheetAjax.copyWorksheetViewConfig(param);
    alert(res ? _l('复制成功') : _l('复制失败'), res ? 1 : 2);

    if (res) {
      const viewsRes = await worksheetAjax.getWorksheetViews({
        worksheetId: view.worksheetId,
        appId,
      });
      updateViews(viewsRes);
      onClose();
    }

    setState({ saveLoading: false });
  };

  const renderSelectViews = list => {
    return list.map(item => {
      const isCustomize = VIEW_DISPLAY_TYPE[item.viewType] === 'customize';
      const viewInfo = VIEW_TYPE_ICON.find(it => it.id === VIEW_DISPLAY_TYPE[item.viewType]) || {};

      return (
        <Select.Option key={`select-view-item-${item.viewId}`} value={item.viewId}>
          <SelectItem className="valignWrapper">
            {isCustomize ? (
              <SvgIcon
                url={_.get(item, 'pluginInfo.iconUrl') || 'https://fp1.mingdaoyun.cn/customIcon/sys_12_4_puzzle.svg'}
                fill={_.get(item, 'pluginInfo.iconColor') || '#445A65'}
                size={18}
              />
            ) : (
              <Icon style={{ color: viewInfo.color, fontSize: '18px' }} icon={viewInfo.icon} />
            )}
            <span className="overflow_ellipsis flex mLeft8">{item.name}</span>
          </SelectItem>
        </Select.Option>
      );
    });
  };

  const renderSelectView = () => {
    const selected = getSelectedViews();
    const others = selected.otherType.filter(filterFun);

    return (
      <div className="selectViewWrap">
        <div className="Font13 Gray_15 mBottom6 bold">{_l('选择视图')}</div>
        {!isCopyFrom && (
          <div className="mBottom12">
            {VIEW_TYPE_OPTIONS.map((l, i) => (
              <Radio
                key={`selectViewWrap-${l.value}`}
                className={cx('selectTypeRadio', { mRight36: i === 0 })}
                text={l.text}
                checked={viewType === l.value}
                onClick={() => setState({ viewType: l.value })}
              />
            ))}
          </div>
        )}
        {(viewType === 1 || isCopyFrom) && (
          <div className="SelectWrap">
            <Select
              autoFocus
              defaultOpen
              value={selectViewId}
              showSearch={false}
              ref={inputRef}
              dropdownMatchSelectWidth={false}
              className="w100 selectViewCon"
              placeholder={_l('请选择')}
              mode={isCopyFrom ? '' : 'multiple'}
              suffixIcon={<Icon icon="expand_more" className="Font18 Gray_9d" />}
              dropdownStyle={{ width: 512 }}
              dropdownRender={menu => (
                <div style={{ width: 512 }}>
                  <SearchCon className="searchCon">
                    <Icon icon="search1" className="Font16 Gray" />
                    <Input
                      className="Gray"
                      value={keywords}
                      placeholder={_l('搜索')}
                      onChange={value => setState({ keywords: value })}
                      onKeyDown={e => e.stopPropagation()}
                    />
                  </SearchCon>
                  {_.isEmpty(otherViews.filter(filterFun)) ? (
                    <EmptyWrap>
                      <div>{_l('暂无视图')}</div>
                    </EmptyWrap>
                  ) : (
                    menu
                  )}
                </div>
              )}
              onChange={onChangeSelectViews}
            >
              {renderSelectViews(selected.sameType.filter(filterFun))}
              {!_.isEmpty(others) && (
                <Select.Option disabled>
                  <div className="Font13 Gray_75">{_l('其他视图')}</div>
                </Select.Option>
              )}
              {renderSelectViews(others)}
            </Select>
            {!isCopyFrom && <Icon icon="expand_more" className="Font18 Gray_9d expandIcon" />}
          </div>
        )}
      </div>
    );
  };

  const renderConfig = () => {
    const disabledBtn = isCopyFrom && _.isEmpty(selectViewId);
    const configs = getConfigs();

    return (
      <div className="configWrap">
        <div className="Font13 Gray_15 mBottom10 bold">{_l('选择要复制的配置项')}</div>
        <div className="Font13 mBottom14">
          <span
            className={cx('mRight24', disabledBtn ? 'Gray_9e cursorNotAllowed' : 'Gray_75 Hand', {
              Hover_21: !disabledBtn,
            })}
            onClick={() => onBatchConfigs('all')}
          >
            {_l('选择全部')}
          </span>
          <span
            className={cx(disabledBtn ? 'Gray_9e cursorNotAllowed' : 'Gray_75 Hand', { Hover_21: !disabledBtn })}
            onClick={() => onBatchConfigs('clear')}
          >
            {_l('清除全部')}
          </span>
        </div>
        {configs.map(l => (
          <div className="valignWrapper mBottom14">
            <Switch
              size="small"
              className="mRight8"
              disabled={disabledBtn}
              checked={selectConfigs.includes(l.key)}
              onClick={value =>
                setState({
                  selectConfigs: value ? selectConfigs.filter(m => m !== l.key) : selectConfigs.concat(l.key),
                })
              }
            />
            <Icon icon={l.icon} className="Font20 mRight8 Gray_9e" />
            <span className="Gray_15 Font13">{l.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DialogWrap
      width={560}
      visible={visible}
      title={TITLE_ENUM[type]}
      okDisabled={(_.isEmpty(selectViewId) && viewType !== 0) || _.isEmpty(selectConfigs) || saveLoading}
      okText={saveLoading ? _l('保存中...') : _l('确定')}
      onOk={onSave}
      onCancel={onClose}
    >
      <ContentWrap isCopyFrom={isCopyFrom}>
        {renderSelectView()}
        {renderConfig()}
      </ContentWrap>
    </DialogWrap>
  );
}

CopyViewConfig.propTypes = {
  appId: PropTypes.string,
  visible: PropTypes.bool, // 弹层的显示隐藏
  type: PropTypes.number, // 类型 1: 复制另一个视图的配置 2: 将配置应用到其他视图
  view: PropTypes.object, // 当前的视图配置
  views: PropTypes.array, // 全部视图
  onClose: PropTypes.func,
  updateViews: PropTypes.func, // 更新所有视图
};

export const copyViewConfig = props => functionWrap(CopyViewConfig, props);
