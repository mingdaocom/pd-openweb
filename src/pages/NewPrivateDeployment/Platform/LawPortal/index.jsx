import React, { Fragment, useState, useEffect } from 'react';
import cx from 'classnames';
import ShareUrl from 'worksheet/components/ShareUrl';
import privateLegalApi from 'src/api/privateLegal';
import AddLegalDialog from './AddLegalDialog';
import { SortableContainer, SortableElement, arrayMove } from '@mdfe/react-sortable-hoc';
import { Icon, LoadDiv, Switch, Dialog } from 'ming-ui';
import { Button } from 'antd';
import './index.less';

const LegalItem = ({ item, ...other }) => {
  const { onEditLegal, onRemoveLegal, onEditLegalStatus } = other;
  return (
    <div className="flexRow alignItemsCenter legalItem" key={item.legalId}>
      <div className="flexRow alignItemsCenter">
        <Icon className={cx('Font15 Gray_9e pointer', { Visibility: item.preset })} icon="drag" />
        <div>{item.name}</div>
      </div>
      <div>{`/${item.key}`}</div>
      <div>
        <Switch
          checked={item.status === 1}
          disabled={item.preset}
          onClick={value => onEditLegalStatus(item, value ? 2 : 1)}
        />
      </div>
      <div className="flexRow alignItemsCenter">
        <span className="pointer ThemeColor" onClick={() => onEditLegal(item)}>{_l('编辑')}</span>
        {!item.preset && (
          <span className="pointer ThemeColor mLeft20" onClick={() => onRemoveLegal(item)}>{_l('删除')}</span>
        )}
      </div>
    </div>
  );
}

const SortableItem = SortableElement(LegalItem);

const SortableList = SortableContainer(({ legalList, ...other }) => {
  return (
    <div>
      {legalList.filter(n => n.preset).map((item, index) => (
        <LegalItem
          key={item.legalId}
          index={index}
          item={item}
          {...other}
        />
      ))}
      {legalList.filter(n => !n.preset).map((item, index) => (
        <SortableItem
          key={item.legalId}
          index={index}
          item={item}
          {...other}
        />
      ))}
    </div>
  );
});

const LawPortal = props => {
  const [loading, setLoading] = useState(true);
  const [legalList, setLegalList] = useState([]);
  const [legalInfo, setLegalInfo] = useState(null);

  useEffect(() => {
    getLegalList();
  }, []);

  const getLegalList = () => {
    setLoading(true);
    privateLegalApi.getLegalList().then(data => {
      setLegalList(data);
      setLoading(false);
    });
  }

  const handleRemoveLegal = legal => {
    Dialog.confirm({
      title: _l('确定删除%0 ?', legal.name),
      onOk: () => {
        privateLegalApi.removeLegal({
          legalId: legal.legalId,
        }).then(data => {
          data && getLegalList();
        });
      },
    });
  }

  const handleEditLegalStatus = (legal, status) => {
    privateLegalApi.editLegalStatus({
      legalId: legal.legalId,
      status
    }).then(data => {
      setLegalList(legalList.map(n => {
        if (n.legalId === legal.legalId) {
          return {
            ...n,
            status
          }
        } else {
          return n;
        }
      }));
    });
  }

  const handleEditLegalSortIndex = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    const presetList= legalList.filter(n => n.preset);
    const createList = legalList.filter(n => !n.preset);
    const newCreateList = arrayMove(createList, oldIndex, newIndex).map((n, index) => {
      n.sortIndex = index + 1;
      return n;
    });
    const sortMap = _.mapValues(_.mapKeys(newCreateList, 'legalId'), n => n.sortIndex);
    privateLegalApi.editLegalSortIndex({
      sortMap
    });
    setLegalList(presetList.concat(newCreateList));
  }

  const url = `${md.global.Config.WebUrl}legalportal`;

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('法律门户')}</div>
      <div className="Gray_9e mBottom15">{_l('添加平台遵守的相关法律条款')}</div>
      <div className="flexRow alignItemsCenter">
        <div className="mRight10">{_l('门户地址')}:</div>
        <ShareUrl
          className="flex"
          theme="light"
          copyShowText
          url={url}
          qrVisible={false}
          inputBtns={[
            {
              tip: _l('新窗口打开'),
              icon: 'task-new-detail',
              onClick: () => window.open(url),
            }
          ]}
        />
      </div>
      <div className="mTop30 mBottom10">
        <Button
          type="primary"
          style={{ width: 'max-content' }}
          onClick={() => setLegalInfo({ type: 1 })}
        >
          <Icon icon="add" />
          {_l('添加')}
        </Button>
      </div>
      <div className="legalListWrap">
        <div className="flexRow titleWrapper">
          <div className="title" style={{ textIndent: 20 }}>{_l('名称')}</div>
          <div className="title">{_l('路径')}</div>
          <div className="title">{_l('状态')}</div>
          <div className="title">{_l('操作')}</div>
        </div>
        {loading ? (
          <div className="mTop5"><LoadDiv size="small" /></div>
        ) : (
          <SortableList
            axis="y"
            helperClass="legalSortableCard"
            legalList={legalList}
            onEditLegal={setLegalInfo}
            onRemoveLegal={handleRemoveLegal}
            onEditLegalStatus={handleEditLegalStatus}
            onSortEnd={handleEditLegalSortIndex}
            shouldCancelStart={({ target }) => !target.classList.contains('icon-drag')}
          />
        )}
        {legalInfo && (
          <AddLegalDialog
            legal={legalInfo}
            onSave={getLegalList}
            onCancel={() => setLegalInfo(null)}
          />
        )}
      </div>
    </div>
  );
}

export default LawPortal;
