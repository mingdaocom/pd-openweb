import React, { useRef, useEffect } from 'react';
import { Icon, Dialog, Tooltip, SvgIcon } from 'ming-ui';
import MoreOption from '../components/MoreOption';
import BtnRangeDrop from 'src/pages/FormSet/components/BtnRangeDrop';
import Trigger from 'rc-trigger';
import { useSetState } from 'react-use';
const confirm = Dialog.confirm;
import sheetAjax from 'src/api/worksheet';

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
      .then(res => {
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
  const optionWorksheetBtn = ({ appId, viewId, optionType, callback }) => {
    sheetAjax
      .optionWorksheetBtn({
        appId,
        viewId,
        btnId: it.btnId,
        worksheetId,
        optionType: optionType, // * @param { integer } args.optionType 操作类型 1：视图添加按钮 2：视图删除按钮 9：删除按钮
      })
      .then(data => {
        if (data) {
          alert(_l('删除成功'));
          getSheetBtns();
        } else {
          alert(_l('删除失败'), 2);
        }
      });
  };
  const renderTxt = () => {
    const list = safeParse(_.get(it, 'advancedSetting.listviews'), 'array');
    const dt = safeParse(_.get(it, 'advancedSetting.detailviews'), 'array');
    const noBatch = (it.writeObject === 2 || it.writeType === 2) && it.clickType === 3; //填写且配置了关联=>不能设置成批量按钮
    const allList = !noBatch ? [...dt, ...list] : dt;
    const data = _.uniq(allList);
    if (data.length > 0) {
      let str = data
        .map(item => {
          let view = views.find(o => o.viewId === item) || {};
          return view.name;
        })
        .filter(l => l)
        .join(',');
      return str;
    }
    return _l('未分配视图');
  };
  const color = !it.color
    ? '#2196f3'
    : it.color === 'transparent' && !it.icon
    ? '#9e9e9e'
    : it.color === 'transparent'
    ? '#333'
    : it.color;
  return (
    <div className="printTemplatesList-tr printBtnsList-tr">
      <div className="name flex mRight20 valignWrapper overflowHidden">
        {!!it.iconUrl && it.icon.endsWith('_svg') ? (
          <SvgIcon
            className="InlineBlock TxtTop mRight13 Icon iconTitle"
            addClassName="TxtMiddle"
            url={it.iconUrl}
            fill={color}
            size={24}
          />
        ) : (
          <Icon
            icon={it.icon || 'custom_actions'}
            style={{
              color: color,
            }}
            className="iconTitle Font24 mRight13"
          />
        )}
        {isRename ? (
          <input
            type="text"
            ref={input}
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
          <Tooltip text={it.name}>
            <span className="overflow_ellipsis">{it.name}</span>
          </Tooltip>
        )}
      </div>

      <div className="views flex mRight20">
        <div className="viewsBox">
          {it.isAllView === 1 ? (
            <span className="viewText Gray">{_l('所有记录')}</span>
          ) : (
            <span className="viewText Gray" style={{ WebkitBoxOrient: 'vertical' }}>
              {renderTxt()}
            </span>
          )}
        </div>
      </div>

      <div className="activeCon mRight8 w120px">
        <Trigger
          popupVisible={showDropOption}
          action={['click']}
          popupAlign={{
            points: ['tl', 'bl'],
            overflow: { adjustX: true, adjustY: true },
          }}
          getPopupContainer={() => document.body}
          onPopupVisibleChange={showDropOption => {
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
          <span className="Hand Bold">{_l('使用范围')}</span>
        </Trigger>
        <span
          className="Hand mLeft20 Bold"
          onClick={() => {
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
        <Icon
          icon="task-point-more"
          className="moreActive Hand Font18 Gray_9e Hover_21"
          onClick={() => {
            setState({
              showMoreOption: true,
              templateId: it.btnId,
            });
          }}
        />
        {showMoreOption && (
          <MoreOption
            showCopy
            onCopy={() => {
              return confirm({
                title: <span className="WordBreak Block">{_l('复制自定义动作“%0”', it.name)}</span>,
                description: _l('将复制目标自定义动作的所有节点和配置'),
                onOk: () => {
                  handleCopy();
                },
              });
            }}
            delTxt={_l('删除动作')}
            description={_l('动作将被删除，请确认执行此操作')}
            showMoreOption={showMoreOption}
            onClickAwayExceptions={[]}
            onClickAway={() => {
              setState({
                showMoreOption: false,
              });
            }}
            setFn={data => {
              setState({
                showMoreOption: false,
                isRename: true,
              });
            }}
            deleteFn={() => {
              optionWorksheetBtn({
                appId,
                viewId: '', //* @param { string } args.viewId 视图ID
                optionType: 9, // * @param { integer } args.optionType 操作类型 1：视图添加按钮 2：视图删除按钮 9：删除按钮
                callback: () => {},
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
