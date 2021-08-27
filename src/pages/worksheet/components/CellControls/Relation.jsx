/**
 * 工作表控件-关联
 */
/**
 * 工作表控件-关联
 */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import UserHead from 'src/pages/feed/components/userHead';
import { FROM, RELATION_TYPE_NAME } from './enum';

const Icons = {
  '0': '',
  '1': 'icon-task-responsible',
  '2': 'icon-knowledge_file',
  '3': 'icon-task_custom_today',
  '7': 'icon-task_custom_today',
  '4': 'icon-file',
  '5': 'icon-content_paste2',
};

function Relation(props) {
  const { from, cell, className, style } = props;
  const { value } = cell;
  const relationData = value ? JSON.parse(value) : [];
  switch (from) {
    case FROM.COMMON:
    case FROM.RELATE_WORKSHEET:
      return (<div className={cx('cellRelations common cellControl', className)} style={style} onClick={props.onClick}>
        { relationData.length > 1 ? _l('%0 个关联', relationData.length) : (relationData.slice(0, 1).map((relation, index) => (
          relation.name ? <a
            className="cellRelation ellipsis"
            target="_blank"
            rel="noopener noreferrer"
            key={index}
            href={relation.link}
            onClick={(e) => { e.stopPropagation(); }}
          >
            <span className="relatioName ThemeHoverColor3">{`[${RELATION_TYPE_NAME[relation.type]}]` + relation.name + (relation.type === 4 ? relation.ext1 : '')}</span>
          </a> : <span className="relatioName">{`[${RELATION_TYPE_NAME[relation.type]}]` + _l('已删除')}</span>
        ))) }
      </div>);
    case FROM.LAND:
      return (<div className="cellRelations land cellControl">
        { relationData.map((relation, index) => (
          <div className="cellRelation" key={index}>
            <div className="cellRelationIcon">
              <i className={Icons[relation.type]}></i>
            </div>
            {
              relation.name
              ? <a className="relationName ThemeHoverColor3" href={relation.link} target="_blank" rel="noopener noreferrer"> { relation.name } </a>
              : <span className="relationName">{`${RELATION_TYPE_NAME[relation.type]}` + _l('已删除')}</span>
            }
            { relation.name && <UserHead
              className="chargeAccount"
              user={{
                accountId: relation.accountId,
                userHead: relation.avatar,
              }}
              size={24}
            /> }
          </div>
        )) }
      </div>);
    default:
      return '';
  }
}

Relation.propTypes = {
  className: PropTypes.string,
  style: PropTypes.shape({}),
  from: PropTypes.number,
  cell: PropTypes.shape({}),
};

export default Relation;
