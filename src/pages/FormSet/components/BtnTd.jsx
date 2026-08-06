import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Icon, Input, SvgIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import sheetAjax from 'src/api/worksheet';
import BtnRangeDrop from 'src/pages/FormSet/components/BtnRangeDrop';
import { WORKSHEET_BTN_OPTION_TYPE } from 'src/pages/worksheet/common/ViewConfig/components/customBtn/config';
import CustomBtnMoreOption from './CustomBtnMoreOption';

export default function BtnTd(props) {
  const input = useRef(null);
  const { onChange, getSheetBtns, views = [], appId, btnList, worksheetId } = props;
  const [{ showDropOption, showMoreOption, isRename, it }, setState] = useSetState({
    showDropOption: false,
    showMoreOption: false,
    isRename: false,
    it: props.it,
  });
  useEffect(() => {
    setState({
      it: props.it,
    });
  }, [props]);
  useEffect(() => {
    if (isRename) {
      input.current.focus();
    }
  }, [isRename]);
  const editBtn = (obj, cb) => {
    sheetAjax
      .saveWorksheetBtn({
        btnId: it.btnId,
        worksheetId,
        ...obj,
      })
      .then(() => {
        cb && cb();
      });
  };

  const handleCopy = () => {
    sheetAjax
      .copyWorksheetBtn({
        appId,
        viewId: '',
        btnId: it.btnId,
        worksheetId,
      })
      .then(data => {
        if (data) {
          getSheetBtns();
          alert(_l('复制成功'));
        } else {
          alert(_l('复制失败'), 2);
        }
      });
  };

  const optionWorksheetBtn = ({
    appId,
    viewId,
    optionType,
    successText = _l('删除成功'),
    failText = _l('删除失败'),
  }) => {
    sheetAjax
      .optionWorksheetBtn({
        appId,
        viewId,
        btnId: it.btnId,
        worksheetId,
        optionType: optionType, // * @param { integer } args.optionType 操作类型 9：删除按钮 12：停用按钮 13：启用按钮
      })
      .then(data => {
        if (data) {
          if (successText) {
            alert(successText);
          }

          getSheetBtns();
        } else {
          alert(failText, 2);
        }
      });
  };

  const handleToggleEnable = targetDisabled => {
    optionWorksheetBtn({
      appId,
      viewId: '',
      optionType: targetDisabled ? WORKSHEET_BTN_OPTION_TYPE.disable : WORKSHEET_BTN_OPTION_TYPE.enable,
      successText: '',
      failText: targetDisabled ? _l('停用失败') : _l('启用失败'),
    });
  };

  const renderTxt = () => {
    const canBatchViewIds = views
      .filter(o => o.viewType === 0 || (o.viewType === 2 && _.get(o, 'advancedSetting.hierarchyViewType') === '3'))
      .map(o => o.viewId);
    const noBatch = (it.writeObject === 2 || it.writeType === 2) && it.clickType === 3; //填写且配置了关联=>不能设置成批量按钮
    const detailViews = safeParse(_.get(it, 'advancedSetting.detailviews'), 'array');
    const listViews = safeParse(_.get(it, 'advancedSetting.listviews'), 'array').filter(o =>
      canBatchViewIds.includes(o),
    );
    const viewIds = _.uniq(noBatch ? detailViews : detailViews.concat(listViews));
    if (viewIds.length > 0) {
      return viewIds
        .map(id => _.get(_.find(views, { viewId: id }), 'name'))
        .filter(Boolean)
        .join(',');
    }

    return _l('未分配视图');
  };

  const color =
    !it.color || it.color !== 'transparent'
      ? it.color || 'var(--color-primary)'
      : it.icon
        ? 'var(--color-text-title)'
        : 'var(--color-text-tertiary)';
  const isDisabled = it.status === 0; //0停用
  const iconColor = isDisabled ? 'var(--color-text-disabled)' : color;

  const handleMoreOptionVisibleChange = showMoreOption =>
    setState({ showMoreOption, templateId: showMoreOption ? it.btnId : '' });

  const handleDelete = () => optionWorksheetBtn({ appId, viewId: '', optionType: 9 });

  return (
    <div className={cx('printTemplatesList-tr printBtnsList-tr', { disabledCustomBtn: isDisabled })}>
      <div className="name flex mRight20 valignWrapper overflowHidden">
        {!!it.iconUrl && it.icon.endsWith('_svg') ? (
          <SvgIcon
            className="InlineBlock TxtTop mRight13 Icon iconTitle"
            addClassName="TxtMiddle"
            url={it.iconUrl}
            fill={iconColor}
            size={24}
          />
        ) : (
          <Icon
            icon={it.icon || 'custom_actions'}
            style={{
              color: iconColor,
            }}
            className="iconTitle Font24 mRight13"
          />
        )}
        {isRename ? (
          <Input
            className="flex"
            manualRef={input}
            defaultValue={it.name}
            onBlur={e => {
              const newName = _.trim(e.target.value);
              setState({
                templateId: '',
                isRename: false,
              });
              if (!newName) {
                alert(_l('请输入按钮名称'), 3);
                input.current.focus();
                return;
              }

              if (btnList.find(l => l.name === newName && l.btnId !== it.btnId)) {
                alert(_l('按钮名称重名，请重新修改'), 3);
                input.current.focus();
                return;
              }

              let data = btnList.map(os => {
                if (os.btnId === it.btnId) {
                  return {
                    ...os,
                    name: newName,
                  };
                } else {
                  return os;
                }
              });
              onChange({
                btnList: data,
              });
              editBtn({
                name: _.trim(e.target.value),
                EditAttrs: ['name'],
                btnId: it.btnId,
              });
            }}
          />
        ) : (
          <Tooltip title={it.name}>
            <span className="overflow_ellipsis">
              {it.name}
              {isDisabled && <span className="textTertiary Normal mLeft5">{`[${_l('停用')}]`}</span>}
            </span>
          </Tooltip>
        )}
      </div>

      <div className="views flex mRight20">
        <div className="viewsBox">
          {it.isAllView === 1 ? (
            <span className="viewText textPrimary">{_l('所有记录')}</span>
          ) : (
            <span className="viewText textPrimary" style={{ WebkitBoxOrient: 'vertical' }}>
              {renderTxt()}
            </span>
          )}
        </div>
      </div>

      <div className="activeCon mRight8 w120px">
        <Trigger
          popupVisible={showDropOption}
          action={isDisabled ? [] : ['click']}
          popupAlign={{
            points: ['tl', 'bl'],
            overflow: { adjustX: true, adjustY: true },
          }}
          getPopupContainer={() => document.body}
          onPopupVisibleChange={showDropOption => {
            if (isDisabled) {
              return;
            }

            setState({ showDropOption, templateId: showDropOption ? it.btnId : '' });
          }}
          popup={
            <BtnRangeDrop
              onClose={() => {
                setState({ showDropOption: false });
              }}
              data={it}
              views={views}
              onChange={data => {
                let dataN = {
                  ...data,
                  displayViews: [], //清除老数据
                };
                editBtn(
                  {
                    ...dataN,
                    editAttrs: ['advancedSetting', 'isAllView', 'displayViews'],
                  },
                  () => {
                    let list = btnList.map(os => {
                      if (os.btnId === it.btnId) {
                        return dataN;
                      } else {
                        return os;
                      }
                    });
                    onChange({ btnList: list });
                  },
                );
              }}
            />
          }
        >
          <span className={cx('Bold', { Hand: !isDisabled })}>{_l('使用范围')}</span>
        </Trigger>
        <span
          className={cx('mLeft20 Bold', { Hand: !isDisabled })}
          onClick={() => {
            if (isDisabled) {
              return;
            }

            onChange({
              isEdit: true,
              showCreateCustomBtn: true,
              btnId: it.btnId,
            });
          }}
        >
          {_l('编辑')}
        </span>
      </div>
      <div className="more w80px TxtCenter">
        <CustomBtnMoreOption
          item={it}
          isDisabled={isDisabled}
          visible={showMoreOption}
          setFn={data => setState(data)}
          onCopy={handleCopy}
          onDelete={handleDelete}
          onToggleEnable={handleToggleEnable}
          onVisibleChange={handleMoreOptionVisibleChange}
        />
      </div>
    </div>
  );
}
