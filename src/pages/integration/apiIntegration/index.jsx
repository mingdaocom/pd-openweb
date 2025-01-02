import React, { useEffect, useState } from 'react';
import autoSize from 'ming-ui/decorators/autoSize';
import { Support, ScrollView } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import bg from 'staticfiles/images/query.png';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import _ from 'lodash';
import CustomLibrary from './CustomLibrary';
import { hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import loadScript from 'load-script';

const Wrap = styled.div`
  background: #fff;
  min-height: 100%;
  .desCon {
    height: 260px;
    background: linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%);
    box-sizing: border-box;
    .conBox {
      padding: 80px 0 0 50px;
      background: url(${bg}) no-repeat 85% bottom;
      background-size: auto 90%;
      width: 100%;
      height: 100%;
    }
  }
  .navTab {
    min-height: 48px;
    ul {
      text-align: center;
      li {
        display: inline-block;
        margin: 0 18px;
        box-sizing: border-box;
        border-bottom: 4px solid rgba(0, 0, 0, 0);
        a {
          height: 44px;
          color: #151515;
          padding: 10px;
          font-weight: 600;
          display: inline-block;
          font-size: 16px;
        }
        &.isCur {
          border-bottom: 4px solid #2196f3;
          a {
            color: #2196f3;
          }
        }
      }
    }
  }
  .listCon {
    margin-top: -48px;
  }
`;

const WrapLib = styled.div`
  padding: 32px 50px;
  max-width: 1600px;
  margin: 0 auto;
  .searchCon {
    height: 36px;
  }
`;

const list = [
  { type: 'commonLib', name: _l('公共') },
  { type: 'projectLib', name: _l('组织') },
];

function APILibraryCon(props) {
  // 是否启用明道云API库，默认开启
  const { currentProjectId, match = { params: {} }, myPermissions } = props;

  const hasAPIIntegrationAuth =
    _.get(
      _.find(md.global.Account.projects, item => item.projectId === currentProjectId),
      'allowAPIIntegration',
    ) || hasPermission(myPermissions, [PERMISSION_ENUM.CREATE_API_CONNECT, PERMISSION_ENUM.MANAGE_API_CONNECTS]);

  const hideIntegrationLibrary =
    (md.global.Config.IsLocal && md.global.SysSettings.hideIntegrationLibrary) || !hasAPIIntegrationAuth;

  const [tab, setTab] = useState(
    hideIntegrationLibrary
      ? 'projectLib'
      : match.params.listType || window.localStorage.getItem('apiLibTab') || 'commonLib',
  );
  const [loadMore, setLoadMore] = useState('');
  const [hasMore, setHasMore] = useState(false);

  const renderLibCon = () => {
    window.MDAPILibrary &&
      window.MDAPILibrary({
        DomId: 'containerApiLib',
        featureType: getFeatureStatus(currentProjectId, VersionProductType.apiIntergration),
        installCallBack: (id, tab) => {
          window.open(`/integrationConnect/${id}`);
        },
        buriedUpgradeVersionDialog: () => {
          buriedUpgradeVersionDialog(currentProjectId, VersionProductType.apiIntergration);
        },
        manageAllConnects: hasPermission(myPermissions, [PERMISSION_ENUM.MANAGE_API_CONNECTS]),
        currentProjectId: currentProjectId,
        getUrl: 'https://pd.mingdao.com/integration',
        installUrl: __api_server__.integration || md.global.Config.IntegrationAPIUrl,
      });
  };

  useEffect(() => {
    if (tab === 'commonLib') {
      if (window.MDAPILibrary) {
        renderLibCon();
      } else {
        loadScript(`https://alifile.mingdaocloud.com/open/js/apilibrary_v3.js?${+new Date()}`, err => {
          if (!err && window.MDAPILibrary) {
            renderLibCon();
          }
        });
      }
    }
  }, [tab]);

  const onScrollEnd = () => {
    if (tab === 'commonLib' || !hasMore) return;

    setLoadMore(+new Date());
  };

  return (
    <ScrollView onScrollEnd={onScrollEnd}>
      <Wrap>
        <div className="desCon">
          <div className="conBox">
            <h3 className="Bold Font24">{_l('API库')}</h3>
            <p className="Font15">
              {_l('连接第三方 API 并保存鉴权认证，在工作表或工作流中调用')}{' '}
              <Support
                type={3}
                href="https://help.mingdao.com/integration/api#connection-certification"
                text={_l('使用帮助')}
              />
            </p>
          </div>
        </div>
        <div className="listCon">
          <div className="navTab">
            {!hideIntegrationLibrary && (
              <ul>
                {list.map((o, i) => {
                  return (
                    <li
                      key={i}
                      className={cx({ isCur: o.type === tab })}
                      onClick={() => {
                        if (tab === o.type) {
                          return;
                        }
                        safeLocalStorageSetItem(`apiLibTab`, o.type);
                        setTab(o.type);
                      }}
                    >
                      <a className="pLeft18">{o.name}</a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="Con">
            <WrapLib>
              {tab === 'commonLib' ? (
                <div id="containerApiLib"></div>
              ) : (
                <CustomLibrary {...props} loadMore={loadMore} setHasMore={setHasMore} />
              )}
            </WrapLib>
          </div>
        </div>
      </Wrap>
    </ScrollView>
  );
}

function APILibrary(props) {
  const AutoSizeLib = autoSize(APILibraryCon);
  return <AutoSizeLib {...props} />;
}

export default APILibrary;
