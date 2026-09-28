import React, { useState } from 'react';
import { Icon } from 'ming-ui';
import { Button, Input, Select } from 'ming-ui/antd-components';

const getColorOptions = () =>
  [
    { value: 0, className: 'colorBlockRed', label: _l('红色') },
    { value: 1, className: 'colorBlockViolet', label: _l('紫色') },
    { value: 2, className: 'colorBlockBrown', label: _l('褐色') },
    { value: 3, className: 'colorBlockOrange', label: _l('橙色') },
    { value: 4, className: 'colorBlockBlue', label: _l('蓝色') },
    { value: 5, className: 'colorBlockGreen', label: _l('绿色') },
    { value: 6, className: 'colorBlockYellow', label: _l('黄色') },
  ].map(option => ({
    value: option.value,
    label: (
      <span className="calendarColorOption">
        <span className={option.className} />
        {option.label}
      </span>
    ),
  }));

export default function CategoryEditor({ initialCategories, onChange, onDelete, onDeletingChange }) {
  const [categories, setCategories] = useState(initialCategories);
  const [deletingId, setDeletingId] = useState('');

  const updateCategories = nextCategories => {
    setCategories(nextCategories);
    onChange(nextCategories);
  };

  const updateCategory = (clientId, changes) => {
    updateCategories(
      categories.map(category => (category.clientId === clientId ? { ...category, ...changes } : category)),
    );
  };

  const handleDelete = async category => {
    if (category.catID) {
      setDeletingId(category.clientId);
      onDeletingChange(true);

      try {
        const deleted = await onDelete(category.catID);

        if (deleted) {
          updateCategories(categories.filter(item => item.clientId !== category.clientId));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setDeletingId('');
        onDeletingChange(false);
      }

      return;
    }

    updateCategories(categories.filter(item => item.clientId !== category.clientId));
  };

  const handleAdd = () => {
    updateCategories([
      ...categories,
      {
        clientId: `new-${categories.reduce((max, item) => Math.max(max, item.order || 0), 0) + 1}`,
        order: categories.reduce((max, item) => Math.max(max, item.order || 0), 0) + 1,
        catID: '',
        catName: '',
        color: 5,
      },
    ]);
  };

  return (
    <div className="classificationCalendarList">
      <ul>
        {categories.map(category => (
          <li key={category.clientId}>
            <div className="classificationListColumn">{_l('名称')}</div>
            <div className="classificationListColumnOperation">
              <Input
                className="classificationListName"
                value={category.catName}
                placeholder={_l('请输入分类日程名称')}
                onChange={event => updateCategory(category.clientId, { catName: event.target.value })}
              />
              <Select
                className="classificationListColor"
                value={category.color}
                options={getColorOptions()}
                popupMatchSelectWidth={false}
                onChange={color => updateCategory(category.clientId, { color })}
              />
            </div>
            <Button
              className="classificationListDel"
              type="text"
              danger
              loading={deletingId === category.clientId}
              icon={<Icon icon="delete" />}
              title={_l('删除')}
              onClick={() => handleDelete(category)}
            />
          </li>
        ))}
      </ul>
      <Button className="classificationCalendarListAdd" type="link" icon={<Icon icon="plus" />} onClick={handleAdd}>
        {_l('添加新分类')}
      </Button>
    </div>
  );
}
