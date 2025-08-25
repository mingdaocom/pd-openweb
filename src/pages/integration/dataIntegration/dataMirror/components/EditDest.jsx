import React from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import autoSize from 'ming-ui/decorators/autoSize';
import ExistSourceModal from 'src/pages/integration/dataIntegration/components/ExistSourceModal';

const Wrap = styled.div`
  .addSource {
    background: #ffffff;
    border: 1px dashed #dddddd;
    border-radius: 4px;
    color: #1677ff;
    &:hover {
      border: 1px dashed #1677ff;
    }
  }
  .sourceCard {
    padding: 12px 20px;
    background: #ffffff;
    border: 1px solid #e2e2e2;
    border-radius: 4px;
    .imgCon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      svg {
        width: 18px;
        height: 18px;
      }
    }
  }
`;
//新增源|目的地
function EditDest(props) {
  const { onUpdate, dest = {} } = props;
  const { dsType, tableName, iconBgColor, className } = dest || {};
  const [{ show }, setState] = useSetState({
    show: false,
  });

  return (
    <Wrap>
      <div
        onClick={() => {
          setState({
            show: true,
            visible: false,
          });
        }}
      >
        {!dsType ? (
          <div
            className="addSource Bold Hand TxtCenter"
            style={{ height: `${props.height || 58}px`, lineHeight: `${props.height || 58}px` }}
          >
            <i className="icon icon-add_circle_outline  mRight5" />
            {_l('选择数据源')}
          </div>
        ) : (
          <div className="sourceCard flexRow mTop12">
            <div className="imgCon flexRow alignItemsCenter justifyContentCenter" style={{ background: iconBgColor }}>
              <svg className="icon svg-icon" aria-hidden="true">
                <use xlinkHref={`#icon${className}`}></use>
              </svg>
            </div>
            <div className="flex mLeft8">
              <div className="name Bold flexRow alignItemsCenter">{dest.sourceName}</div>
              <div className="des Gray_9e">{tableName}</div>
            </div>
            {props.canEdit && <i className="icon icon-expand_more Font20 Hand Block" />}
          </div>
        )}
      </div>
      {show && (
        <ExistSourceModal
          {...props}
          from="dataMirror"
          currentProjectId={props.projectId}
          roleType={'dest'}
          onClose={() => {
            setState({
              show: false,
            });
          }}
          setConnectorConfigData={data => {
            const infoTxt = 'dest';
            const { className, id, iconBgColor, type, sourceName, formData } = data[infoTxt];
            let param = {
              dataDestId: id,
            };
            if (className === 'kafka') {
              param.dbName = _.get(formData, 'extraParams.topic');
              param.tableName = _.get(formData, 'extraParams.topic');
            }

            let config = {
              dbName: '',
              tableName: '',
              dsType: type,
              schema: '',
              className,
              iconBgColor,
              workSheetId: '',
              appId: '',
              sourceName,
              ...param,
            };

            config = { ...config, fieldsMapping: [] };

            onUpdate(config);
          }}
        />
      )}
    </Wrap>
  );
}

export default autoSize(EditDest);
