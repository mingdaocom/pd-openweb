import React, { Fragment } from 'react';
import { Icon } from 'ming-ui';
import RecordCoverCard from '../../components/RelateRecordCards/RecordCoverCard';
import { LoadingButton } from '../../components/RelateRecordCards';
import _, { identity } from 'lodash';

function getCoverUrl(coverId, record, controls) {
  const coverControl = _.find(controls, c => c.controlId && c.controlId === coverId);
  if (!coverControl) {
    return;
  }
  try {
    const coverFile = _.find(JSON.parse(record[coverId]), file => RegExpValidator.fileIsPicture(file.ext));
    const { previewUrl = '' } = coverFile;
    return previewUrl.indexOf('imageView2') > -1
      ? previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/200/h/140')
      : `${previewUrl}&imageView2/1/w/200/h/140`;
  } catch (err) {}
  return;
}

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
  const hideTitle = control.type === 51 && control.enumDefault === 1;
  return (
    <Fragment>
      {showNewRecord && (
        <div className="customFormControlBox customFormButton mBottom10" onClick={onAdd}>
          <Icon icon="plus" />
          <span>{entityName || _l('记录')}</span>
        </div>
      )}
      <Fragment>
        {!loading &&
          !!records.length &&
          (showAll || records.length <= 3 ? records : records.slice(0, 3)).map((record, i) => (
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
          ))}
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
