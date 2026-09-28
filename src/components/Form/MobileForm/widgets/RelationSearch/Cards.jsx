import React, { Fragment } from 'react';
import _, { identity } from 'lodash';
import { controlState } from 'src/utils/domain/control/state';
import { getCoverUrl } from 'src/utils/domain/worksheet/view';
import ChildTableFlatComp from '../../components/ChildTable/ChildTableFlatComp';
import { LoadingButton } from '../../components/RelateRecordCards';
import RecordCoverCard from '../../components/RelateRecordCards/RecordCoverCard';

export default function Cards(props) {
  const {
    loading,
    allowOpenRecord,
    allowNewRecord,
    entityName,
    showAll,
    projectId,
    viewId,
    isCharge,
    controls,
    control,
    showLoadMore,
    isLoadingMore,
    setState,
    loadRecords,
    pageIndex,
    onAdd,
    onOpen,
    disabled,
  } = props;
  let { records } = props;
  const showNewRecord = !disabled && allowNewRecord;

  if (control.type === 51 && control.enumDefault === 1) {
    records = records.slice(0, 1);
  }

  const isSingle = control.enumDefault === 1;
  const hideTitle = control.type === 51 && control.enumDefault === 1;
  const showControls = control.showControls || [];
  const advancedSetting = control.advancedSetting || {};
  const titleControl =
    _.find(controls, { controlId: advancedSetting.showtitleid }) || _.find(controls, { attribute: 1 });
  const displayControls = _.uniqBy(
    showControls
      .map(controlId => _.find(controls, { controlId }))
      .concat(titleControl)
      .filter(identity),
    'controlId',
  );
  const showRecords = showAll || records.length <= 3 ? records : records.slice(0, 3);

  return (
    <Fragment>
      {showNewRecord && (
        <div className="customFormControlBox customFormButton mTop12 mBottom12" onClick={onAdd}>
          <i className="icon icon-plus Font16 mRight6" />
          <span>{entityName || _l('记录')}</span>
        </div>
      )}
      <Fragment>
        {!loading && !!records.length && isSingle ? (
          <ChildTableFlatComp
            appId={control.appId}
            cellErrors={{}}
            control={{
              ...control,
              relationControls: controls,
              advancedSetting: {
                ...advancedSetting,
                showtitleid: advancedSetting.showtitleid || _.get(titleControl, 'controlId'),
              },
            }}
            controlPermission={{ ...controlState(control, control.from), editable: false }}
            controls={displayControls}
            disabled
            from={control.from}
            filterControlsByPermission={false}
            hideExpandAll
            h5abstractids={safeParse(advancedSetting.h5abstractids, 'array')}
            inheritCardStyle
            isEdit={false}
            onOpen={index => {
              const record = showRecords[index];

              if (record) {
                onOpen(record.rowid);
              }
            }}
            openRecordOnClick={allowOpenRecord}
            projectId={projectId}
            rows={showRecords}
            showControls={showControls}
            showNumber={false}
            worksheetId={control.dataSource}
          />
        ) : (
          !loading &&
          !!records.length &&
          showRecords.map((record, i) => (
            <RecordCoverCard
              projectId={projectId}
              viewId={viewId}
              disabled
              isCharge={isCharge}
              hideTitle={hideTitle}
              key={i}
              cover={getCoverUrl(control.coverCid, record, controls)}
              controls={control.showControls.map(cid => _.find(controls, { controlId: cid })).filter(identity)}
              data={record}
              allowlink={allowOpenRecord ? '1' : '0'}
              parentControl={{ ...control, relationControls: controls }}
              onClick={() => {
                if (!allowOpenRecord) {
                  return;
                }

                onOpen(record.rowid);
              }}
            />
          ))
        )}
        {records.length > 3 && (
          <div className="mBottom10">
            {showLoadMore && showAll && (
              <LoadingButton
                onClick={() => {
                  if (!isLoadingMore) {
                    loadRecords(pageIndex + 1);
                  }
                }}
              >
                {isLoadingMore && (
                  <span className="loading">
                    <i className="icon icon-loading_button"></i>
                  </span>
                )}
                {_l('加载更多')}
              </LoadingButton>
            )}
            <LoadingButton onClick={() => setState(old => ({ ...old, showAll: !showAll }))}>
              {showAll ? _l('收起') : _l('展开更多')}
            </LoadingButton>
          </div>
        )}
      </Fragment>
    </Fragment>
  );
}
