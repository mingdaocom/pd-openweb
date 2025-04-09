import React, { useRef, useState, Fragment } from 'react';
import * as actions from '../../redux/action';
import update from 'immutability-helper';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Tools from './Tools';
import { getTranslateInfo } from 'src/util';
import reportConfig from 'statistics/api/reportConfig';
import { v4 as uuidv4 } from 'uuid';
import { containerWidgets } from '../../enum';
import { componentCountLimit } from '../../util';

const WidgetTools = props => {
  const { ids, enumType, editable, iconColor, layoutType, widget, components, allComponents } = props;
  const { updateWidget, updateWidgetVisible, updatePageInfo, setWidget, insertTitle, copyWidget } = props;
  const widgetLayout = widget[layoutType] || {};
  const { title } = widgetLayout;
  const titleVisible = widget.sectionId ? false : widgetLayout.titleVisible;
  const translateInfo = getTranslateInfo(ids.appId, null, enumType === 'analysis' ? widget.value : widget.id);
  const [isEdit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToolClick = (clickType, { widget, result }) => {
    switch (clickType) {
      case 'setting':
        if (containerWidgets[enumType]) {
          updateWidget({
            widget,
            ...result
          });
          return;
        }
        setWidget(widget);
        break;
      case 'move':
      case 'del':
        props.delWidget(widget);
        break;
      case 'delTabsWidget':
        props.delTabsWidget(widget);
        break;
      case 'delWidgetTab':
        props.delWidgetTab(result);
        break;
      case 'insertTitle':
        insertTitle({ widget, visible: !widget[layoutType].titleVisible, layoutType });
        setEdit(!widget[layoutType].titleVisible);
        break;
      case 'copy':
        // 限制单个页面添加组件数量
        if (!componentCountLimit(components)) return;
        if (enumType === 'analysis') {
          setLoading(true);
          if (loading) return;
          reportConfig
            .copyReport({ reportId: widget.value, sourceType: 1 })
            .then(data => copyWidget({
              ..._.omit(widget, ['id', 'uuid']),
              value: data.reportId,
              layoutType,
              sourceValue: widget.value,
              needUpdate: Date.now(),
              config: {
                objectId: uuidv4()
              }
            }))
            .finally(() => setLoading(false));
        } else {
          copyWidget({ ..._.omit(widget, ['id', 'uuid']), layoutType });
        }
        alert(_l('复制成功'));
        break;
      case 'hideMobile':
        updateWidgetVisible({ widget, layoutType });
        break;
      case 'switchButtonDisplay':
        if (widget.type === 1) {
          updateWidget({
            widget,
            config: update(widget.config, {
              mobileCount: {
                $apply: (item = 1) => {
                  return item === 6 ? 1 : (item + 1);
                }
              }
            })
          });
        } else {
          const { btnType, direction } = _.get(widget, 'button.config') || {};
          updateWidget({
            widget,
            button: update(widget.button, {
              mobileCount: {
                $apply: item => {
                  // 图形按钮，上下结构
                  if (btnType === 2 && direction === 1) {
                    return item === 4 ? 1 : (item + 1);
                  } else {
                    return item === 1 ? 2 : 1;
                  }
                }
              }
            }),
          });
        }
        break;
      case 'changeFontSize':
      case 'moveIn':
      case 'moveOut':
        updateWidget({
          widget,
          ...result
        });
      break;
      default:
        break;
    }
  };

  return (
    <Fragment>
      {titleVisible && (
        <div className="componentTitle flexRow alignItemsCenter disableDrag bold" title={title}>
          {editable || isEdit ? (
            <input
              value={title}
              placeholder={_l('标题')}
              onBlur={() => setEdit(false)}
              onChange={e => updateWidget({ widget, title: e.target.value, layoutType })}
            ></input>
          ) : (
            <Fragment>
              {title && <div className="titleSign" style={{ backgroundColor: iconColor }} />}
              <span className="flex overflow_ellipsis">{translateInfo.title || title}</span>
            </Fragment>
          )}
        </div>
      )}
      {editable && (
        <Tools
          appId={ids.appId}
          pageId={ids.worksheetId}
          widget={widget}
          layoutType={layoutType}
          titleVisible={titleVisible}
          allComponents={allComponents}
          handleToolClick={(clickType, result) => handleToolClick(clickType, { widget, result })}
          updatePageInfo={updatePageInfo}
        />
      )}
    </Fragment>
  );
}

export default connect(
  (state) => ({
    allComponents: state.customPage.components,
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(WidgetTools);