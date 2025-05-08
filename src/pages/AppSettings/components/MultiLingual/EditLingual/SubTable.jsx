import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Icon, ScrollView, Dialog } from 'ming-ui';
import sheetApi from 'src/api/worksheet';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';

export default function SubTable(props) {
  const { app, comparisonLangId, comparisonLangData, worksheetId, control, translateData, translateInfo } = props;
  const [sheetInfo, setSheetInfo] = useState({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const scrollViewRef = useRef();
  const appId = app.id;

  useEffect(() => {
    sheetApi.getWorksheetInfo({
      worksheetId,
      getTemplate: true
    }).then(data => {
      setSheetInfo(data);
    });
  }, [worksheetId]);

  if (_.isEmpty(sheetInfo)) {
    return null;
  }

  const controls = (_.get(sheetInfo, 'template.controls') || []).filter(c => !ALL_SYS.includes(c.controlId));

  const renderSubTableDialog = () => {
    const handlePositionControl = c => {
      const el = document.querySelector(`.navItem-${c.controlId}`);
      const className = 'highlight';
      const highlightEl = el.querySelector('.itemName');
      $(highlightEl).addClass(className).on('webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend', function () {
        $(this).removeClass(className);
      });
      $(scrollViewRef.current.nanoScroller).nanoScroller({ scrollTop: el.offsetTop });
    }

    const renderControlNav = c => {
      const data = _.find(translateData, { correlationId: c.controlId }) || {};
      const translateInfo = data.data || {};
      return (
        <div
          className="navItem flexRow alignItemsCenter pointer"
          key={c.controlId}
          onClick={() => handlePositionControl(c)}
        >
          <Icon icon={getIconByType(c.type)} className="Gray_9e Font16" />
          <span className="mLeft5 Font13 ellipsis">{translateInfo.name || c.controlName}</span>
        </div>
      );
    }

    return (
      <div className="flexRow" style={{ height: document.body.offsetHeight - 180 }}>
        <div className="nav flexColumn">
          <div className="searchWrap flexRow alignItemsCenter mBottom10">
            <Icon className="Gray_9e Font20 mRight5" icon="search" />
            <input
              placeholder={_l('字段')}
              className="flex"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
            />
            {searchValue && (
              <Icon className="Gray_9e pointer Font15" icon="closeelement-bg-circle" onClick={() => setSearchValue('')} />
            )}
          </div>
          <ScrollView className="flex">
            {controls.filter(c => c.controlName.includes(searchValue)).map(c => (
              renderControlNav(c)
            ))}
          </ScrollView>
        </div>
        <ScrollView className="flex" ref={scrollViewRef}>
          <div className="pLeft20 pRight20">
            {controls.map(c => (
              props.renderControlContent({
                isSubTable: true,
                app,
                control: c,
                selectNode: { workSheetId: worksheetId },
                comparisonLangId,
                comparisonLangData,
                translateData,
                onSelectedKeys: props.onSelectedKeys,
                setExpandedKeys: props.setExpandedKeys,
                onEditAppLang: data => {
                  data.parentId = worksheetId;
                  props.onEditAppLang(data);
                }
              })
            ))}
          </div>
        </ScrollView>
      </div>
    );
  }

  if (sheetInfo.type === 2) {
    const alreadyControls = controls.filter(c => _.find(translateData, { parentId: worksheetId, correlationId: c.controlId }));
    const withoutLenght = controls.length - alreadyControls.length;
    return (
      <Fragment>
        <div className="flex mRight20">
          {_l('有%0个字段', controls.length)}
          {!!withoutLenght && `，${_l('%0个没有译文', withoutLenght)}`}
        </div>
        <div className="flex">
          <span className="ThemeColor pointer" onClick={() => setDialogVisible(true)}>{_l('编辑译文')}</span>
        </div>
        {dialogVisible && (
          <Dialog
            visible={true}
            className="editLingualDialog"
            width={860}
            title={(
              <div className="flexRow alignItemsCenter mBottom10">
                <Icon icon={getIconByType(control.type)} className="Font20 Gray_9e mRight10" />
                <span>{translateInfo.name || control.controlName}</span>
              </div>
            )}
            showFooter={false}
            onCancel={() => setDialogVisible(false)}
          >
            {renderSubTableDialog()}
          </Dialog>
        )}
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <div className="flex mRight20">
          {appId === sheetInfo.appId ? (
            sheetInfo.name
          ) : (
            <span className="Gray_9e">{_l('暂不支持跨应用数据')}</span>
          )}
        </div>
        <div className="flex">
          {appId === sheetInfo.appId && (
            <span
              className="ThemeColor pointer"
              onClick={() => {
                props.setExpandedKeys(['appItemEntrance', sheetInfo.groupId]);
                props.onSelectedKeys([sheetInfo.worksheetId], {
                  event: 'select',
                  selected: true,
                  node: {
                    key: sheetInfo.worksheetId,
                    type: 0
                  }
                });
              }}
            > 
              {_l('前往编辑')}
            </span>
          )}
        </div>
      </Fragment>
    );
  }
}
