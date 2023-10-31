import React, { useRef, useEffect } from 'react';
import { Icon, Dialog } from 'ming-ui';
import MoreOption from '../components/MoreOption';
import cx from 'classnames';
import BtnRangeDrop from 'src/pages/FormSet/components/BtnRangeDrop';
import Trigger from 'rc-trigger';
import { useSetState } from 'react-use';
const confirm = Dialog.confirm;
import sheetAjax from 'src/api/worksheet';

export default function BtnCard(props) {
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
      let str = `${_l('%0视图', data.length)}：${data
        .map(item => {
          let view = views.find(o => o.viewId === item) || {};
          return view.name || _l('该视图已删除');
        })
        .join(',')}`;
      return str;
    }
    return _l('未分配视图');
  };
  return (
    <div className={cx('templates')} key={it.btnId}>
      <div className={cx('topBox')}>
        <div
          className="bg"
          style={{
            background: !it.color ? '#2196f3' : it.color !== 'transparent' ? it.color : '#9e9e9e',
            opacity: 0.1,
          }}
        />
        <Icon
          icon={it.icon || 'custom_actions'}
          style={{
            color: !it.color
              ? '#2196f3'
              : it.color === 'transparent' && !it.icon
              ? '#9e9e9e'
              : it.color === 'transparent'
              ? '#333'
              : it.color,
          }}
          className="iconTitle Font16"
        />
        {isRename ? (
          <input
            type="text"
            ref={input}
            defaultValue={it.name}
            onBlur={e => {
              setState({
                templateId: '',
                isRename: false,
              });
              if (!_.trim(e.target.value)) {
                alert(_l('请输入模板名称'), 3);
                input.current.focus();
                return;
              }
              let data = btnList.map(os => {
                if (os.btnId === it.btnId) {
                  return {
                    ...os,
                    name: _.trim(e.target.value),
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
          <span className="Bold"> {it.name}</span>
        )}
        <Icon
          icon="task-point-more"
          className="moreActive Hand Font18"
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
      <div className="con">
        <div className="view">
          {it.isAllView === 1 ? (
            <span className="viewText Gray_9e">{_l('所有记录')}</span>
          ) : (
            <span className="viewText Gray_9e" style={{ WebkitBoxOrient: 'vertical' }} title={renderTxt()}>
              {renderTxt()}
            </span>
          )}
        </div>
        <div className="activeCon Relative">
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
                  editBtn({ ...data, editAttrs: ['advancedSetting', 'isAllView'] }, () => {
                    let list = btnList.map(os => {
                      if (os.btnId === it.btnId) {
                        return data;
                      } else {
                        return os;
                      }
                    });
                    onChange({ btnList: list });
                  });
                }}
              />
            }
          >
            <span className="Hand">{_l('使用范围')}</span>
          </Trigger>
          <span
            className="Hand mLeft24"
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
      </div>
    </div>
  );
}
