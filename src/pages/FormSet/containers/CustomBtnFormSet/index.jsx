import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import sheetAjax from 'src/api/worksheet';
import CreateCustomBtn from 'worksheet/common/CreateCustomBtn';
import { redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';
import 'src/pages/FormSet/containers/Print/style.less';
import { refreshBtnData } from 'src/pages/FormSet/util';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import TrashDialog from '../../components/Trash';
import Header from './Header';
import List from './List';
import SearchBox from './SearchBox';
import { Con } from './style';

function CustomBtnFormSet(props) {
  const { worksheetId, worksheetControls, worksheetInfo } = props;
  const [{ showCreateCustomBtn, btnId, showTrash, isEdit, btnList, sortDirection, searchKeywords }, setState] =
    useSetState({
      showCreateCustomBtn: false,
      btnId: '',
      showTrash: false,
      isEdit: false,
      btnList: [],
      sortDirection: '',
      searchKeywords: '',
    });
  const ajaxRef = useRef(null);

  useEffect(() => {
    if (!worksheetId) return;
    getSheetBtns();

    return () => {
      // 工作表切换或组件卸载时取消旧请求，避免旧按钮列表覆盖当前页面。
      ajaxRef.current && ajaxRef.current.abort();
    };
  }, [worksheetId]);

  const getSheetBtns = () => {
    if (ajaxRef.current) {
      ajaxRef.current.abort();
    }

    ajaxRef.current = sheetAjax.getWorksheetBtns({
      worksheetId,
    });
    ajaxRef.current
      .then(btnList => {
        setState({ btnList });
      })
      .catch(() => {});
  };

  // 创建/编辑弹层保存后先本地同步列表，避免等待重新拉取造成操作反馈延迟。
  const updateCustomButtons = (btns, isAdd) => {
    setState({ btnList: refreshBtnData(_.cloneDeep(btnList), btns, isAdd) });
  };

  const isFree =
    _.get(
      _.find(md.global.Account.projects, item => item.projectId === worksheetInfo.projectId),
      'licenseType',
    ) === 0;
  const featureType = getFeatureStatus(worksheetInfo.projectId, VersionProductType.recycle);
  const filteredBtnList = (() => {
    const keywords = _.trim(searchKeywords).toLowerCase();

    if (!keywords) {
      return btnList;
    }

    // 暂时前端搜索；后续接口支持后，可把这里替换为带关键词的 getWorksheetBtns 请求。
    return btnList.filter(item =>
      [item.name, item.desc, item.description].some(text =>
        String(text || '')
          .toLowerCase()
          .includes(keywords),
      ),
    );
  })();

  return (
    <React.Fragment>
      <Con className="printBox Relative flexColumn">
        <div className="printBoxList flex">
          <div className="flexColumn h100">
            <Header
              featureType={featureType}
              isFree={isFree}
              worksheetInfo={worksheetInfo}
              onOpenTrash={() => setState({ showTrash: true })}
              onAdd={() => {
                setState({
                  btnId: '',
                  showCreateCustomBtn: true,
                  isEdit: false,
                });
              }}
            />
            <SearchBox value={searchKeywords} onChange={searchKeywords => setState({ searchKeywords })} />
            <List
              btnList={btnList}
              getSheetBtns={getSheetBtns}
              list={filteredBtnList}
              onChange={state => {
                setState({ ...state });
              }}
              searchKeywords={searchKeywords}
              setSortDirection={sortDirection => setState({ sortDirection })}
              sortDirection={sortDirection}
              worksheetId={worksheetId}
              worksheetInfo={worksheetInfo}
            />
          </div>
        </div>
        {showCreateCustomBtn && (
          <CreateCustomBtn
            isClickAway={true}
            zIndex={9}
            from="formset"
            isEdit={isEdit}
            onClose={() => {
              setState({
                showCreateCustomBtn: false,
              });
            }}
            columns={worksheetControls
              // 自定义动作只能配置当前视图可见字段，隐藏字段不参与动作表单配置。
              .filter(item => {
                return item.viewDisplay || !('viewDisplay' in item);
              })
              .map(control => redefineComplexControl(control))}
            btnId={btnId}
            btnList={btnList}
            btnDataInfo={btnId ? _.find(btnList, item => item.btnId === btnId) : []}
            projectId={worksheetInfo.projectId}
            worksheetControls={worksheetControls}
            currentSheetInfo={{ ...worksheetInfo, template: { controls: worksheetControls } }}
            viewId={''}
            appId={worksheetInfo.appId}
            worksheetId={worksheetId}
            sheetSwitchPermit={worksheetInfo.switches}
            workflowId={''}
            refreshFn={() => {
              getSheetBtns();
            }}
            updateCustomButtons={updateCustomButtons}
          />
        )}
      </Con>
      {showTrash && (
        <TrashDialog
          projectId={worksheetInfo.projectId}
          appId={worksheetInfo.appId}
          worksheetId={worksheetId}
          views={worksheetInfo.views || []}
          onCancel={() => {
            setState({
              showTrash: false,
            });
          }}
          onChange={() => {
            getSheetBtns();
          }}
        />
      )}
    </React.Fragment>
  );
}

export default CustomBtnFormSet;
