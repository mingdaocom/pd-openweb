<div class="repeatCalendarOperatorMain">
    <div class="repeatCalendarOperatorModel">
        <span id="btnOperatorAlone" class="repeatCalendarOperatorBtn pointer {{?it.isRecurChange && it.isEdit}}disabled{{?}}">{{=_l('仅此日程')}}</span>{{! it.isRecurChange && it.isEdit ? _l('日程重复性修改，不支持此操作') : _l('此操作仅更改单个日程，其他日程不受影响') }}
    </div>
    <div class="repeatCalendarOperatorModel">
        <span id="btnOperatorAll" class="repeatCalendarOperatorBtn pointer">{{=_l('所有日程')}}</span>{{=_l('此操作会更改后续所有的日程')}}
    </div>
</div>

