/**
 * Tine 2.0
 * 
 * @package     Calendar
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id$
 *
 */
 
Ext.namespace('Tine.Calendar');

/**
 * Calendar Edit Dialog
 */
Tine.Calendar.EventEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
    /**
     * @cfg {Number}
     */
    containerId: -1,
    /**
     * @private
     */
    labelAlign: 'side',
    
    /**
     * @private
     */
    windowNamePrefix: 'EventEditWindow_',
    appName: 'Calendar',
    recordClass: Tine.Calendar.Model.Event,
    recordProxy: Tine.Calendar.backend,
    showContainerSelector: true,
    tbarItems: [{xtype: 'widget-activitiesaddbutton'}],
    
    mode: 'local',
    
    // note: we need up use new action updater here or generally in the widget!
    evalGrants: false,
    
    /**
     * @property {Ext.data.Store}
     */
    attendeeStore: null,
    
    afterRender: function() {
        Tine.Calendar.EventEditDialog.superclass.afterRender.apply(this, arguments);
        
    },
    
    onResize: function() {
        Tine.Calendar.EventEditDialog.superclass.onResize.apply(this, arguments);
        this.setTabHeight.defer(100, this);
    },
    
    getAttendeeGrid: function() {
        return {
            xtype: 'grid',
            store: this.attendeeStore,
            title: this.app.i18n._('Attendee'),
            autoExpandColumn: 'user_id',
            columns: [
                { id: 'role',      dataIndex: 'role',      width: 70,  sortable: true, header: this.app.i18n._('Role') },
                { id: 'quantity',  dataIndex: 'quantity',  width: 30,  sortable: true, header: '&#160;', tooltip: this.app.i18n._('Quantity') },
                { id: 'user_type', dataIndex: 'user_type', width: 30,  sortable: true, header: '&#160;', tooltip: this.app.i18n._('Type') },
                { id: 'user_id',   dataIndex: 'user_id',   width: 300, sortable: true, header: this.app.i18n._('Name') },
                { id: 'status',    dataIndex: 'status',    width: 100, sortable: true, header: this.app.i18n._('Status') }
            ]
        }
    },
    
    /**
     * returns dialog
     * 
     * NOTE: when this method gets called, all initalisation is done.
     */
    getFormItems: function() { 
        return {
            xtype: 'tabpanel',
            border: false,
            plain:true,
            activeTab: 0,
            border: false,
            items:[{
                title: this.app.i18n.n_('Event', 'Calendar', 1),
                border: false,
                frame: true,
                layout: 'border',
                items: [{
                    region: 'center',
                    layout: 'hfit',
                    border: false,
                    items: [{
                        xtype: 'fieldset',
                        layout: 'hfit',
                        autoHeight:true,
                        title: this.app.i18n._('Event'),
                        items: [{
                            xtype: 'columnform',
                            labelAlign: 'side',
                            labelWidth: 100,
                            formDefaults: {
                                xtype:'textfield',
                                anchor: '100%',
                                labelSeparator: '',
                                columnWidth: .5
                            },
                            items: [[{
                                columnWidth: 1,
                                fieldLabel: this.app.i18n._('Summary'),
                                name: 'summary',
                                listeners: {render: function(field){field.focus(false, 250);}},
                                allowBlank: false
                            }], [{
                                columnWidth: 1,
                                fieldLabel: this.app.i18n._('Location'),
                                name: 'location'
                            }], [{
                                xtype: 'datetimefield',
                                fieldLabel: this.app.i18n._('Start Time'),
                                listeners: {scope: this, change: this.onDtStartChange},
                                name: 'dtstart'
                            }, {
                                xtype: 'combo',
                                hideLabel: true,
                                readOnly: true,
                                hideTrigger: true,
                                disabled: true,
                                name: 'originator_tz'
                            }], [{
                                xtype: 'datetimefield',
                                fieldLabel: this.app.i18n._('End Time'),
                                listeners: {scope: this, change: this.onDtEndChange},
                                name: 'dtend'
                            }, {
                                xtype: 'checkbox',
                                hideLabel: true,
                                boxLabel: this.app.i18n._('whole day'),
                                listeners: {scope: this, check: this.onAllDayChange},
                                name: 'is_all_day_event'
                            }]]
                        }]
                    }, {
                        xtype: 'tabpanel',
                        activeTab: 0,
                        border: true,
                        height: 235,
                        form: true,
                        items: [this.getAttendeeGrid(), {
                            title: this.app.i18n._('Options'),
                            html: 'recurings and alamrs'
                        }]
                    }]
                }, {
                    // activities and tags
                    region: 'east',
                    layout: 'accordion',
                    animate: true,
                    width: 210,
                    split: true,
                    collapsible: true,
                    collapseMode: 'mini',
                    margins: '0 5 0 5',
                    border: true,
                    items: [
                        new Ext.Panel({
                            // @todo generalise!
                            title: this.app.i18n._('Description'),
                            iconCls: 'descriptionIcon',
                            layout: 'form',
                            labelAlign: 'top',
                            border: false,
                            items: [{
                                style: 'margin-top: -4px; border 0px;',
                                labelSeparator: '',
                                xtype:'textarea',
                                name: 'note',
                                hideLabel: true,
                                grow: false,
                                preventScrollbars:false,
                                anchor:'100% 100%',
                                emptyText: this.app.i18n._('Enter description')                            
                            }]
                        }),
                        new Tine.widgets.activities.ActivitiesPanel({
                            app: 'Calendar',
                            showAddNoteForm: false,
                            border: false,
                            bodyStyle: 'border:1px solid #B5B8C8;'
                        }),
                        new Tine.widgets.tags.TagPanel({
                            app: 'Calendar',
                            border: false,
                            bodyStyle: 'border:1px solid #B5B8C8;'
                        })
                    ]
                }]
            }, new Tine.widgets.activities.ActivitiesTabPanel({
                app: this.appName,
                record_id: (this.record) ? this.record.id : '',
                record_model: this.appName + '_Model_' + this.recordClass.getMeta('modelName')
            })]
        };
    },
    
    initComponent: function() {
        this.attendeeStore = new Ext.data.SimpleStore({
            fields: Tine.Calendar.Model.AttenderArray,
            sortInfo: {field: 'user_id', direction: 'ASC'}
        });
        
        Tine.Calendar.EventEditDialog.superclass.initComponent.call(this);
    },
    
    isValid: function() {
        var isValid = this.validateDtStart() && this.validateDtEnd();
        
        return isValid && Tine.Calendar.EventEditDialog.superclass.isValid.apply(this, arguments);
    },
    
    onAllDayChange: function(checkbox, isChecked) {
        var dtStartField = this.getForm().findField('dtstart');
        var dtEndField = this.getForm().findField('dtend');
        dtStartField.setDisabled(isChecked, 'time');
        dtEndField.setDisabled(isChecked, 'all');
        
        if (isChecked) {
            dtStartField.clearTime();
            dtEndField.setValue(dtStartField.getValue().add(Date.HOUR, 23).add(Date.MINUTE, 59));
        } else {
            dtStartField.undo();
            dtEndField.undo();
        }
    },
    
    onDtEndChange: function(dtEndField, newValue, oldValue) {
        this.validateDtEnd();
    },
    
    onDtStartChange: function(dtStartField, newValue, oldValue) {
        if (Ext.isDate(newValue) && Ext.isDate(oldValue)) {
            var diff = newValue.getTime() - oldValue.getTime();
            var dtEndField = this.getForm().findField('dtend');
            var dtEnd = dtEndField.getValue();
            if (Ext.isDate(dtEnd)) {
                dtEndField.setValue(dtEnd.add(Date.MILLI, diff));
            }
        }
    },
    
    onRecordLoad: function() {
        // NOTE: it comes again and again till 
        if (this.rendered) {
            this.attendeeStore.removeAll(attendee);
            var attendee = this.record.get('attendee');
            Ext.each(attendee, function(attender) {
                this.attendeeStore.add(new Tine.Calendar.Model.Attender(attender, attender.id));
            }, this);
        }
        
        Tine.Calendar.EventEditDialog.superclass.onRecordLoad.apply(this, arguments);
    },
    
    setTabHeight: function() {
        var eventTab = this.items.first().items.first();
        var centerPanel = eventTab.items.first();
        var tabPanel = centerPanel.items.last();
        tabPanel.setHeight(centerPanel.getEl().getBottom() - tabPanel.getEl().getTop());
    },
    
    validateDtEnd: function() {
        var dtStart = this.getForm().findField('dtstart').getValue();
        
        var dtEndField = this.getForm().findField('dtend');
        var dtEnd = dtEndField.getValue();
        
        if (! Ext.isDate(dtEnd)) {
            dtEndField.markInvalid(this.app.i18n._('End date is not valid'));
            return false;
        } else if (Ext.isDate(dtStart) && dtEnd.getTime() - dtStart.getTime() <= 0) {
            dtEndField.markInvalid(this.app.i18n._('End date must be after start date'));
            return false;
        } else {
            dtEndField.clearInvalid();
            return true;
        }
    },
    
    validateDtStart: function() {
        var dtStartField = this.getForm().findField('dtstart');
        var dtStart = dtStartField.getValue();
        
        if (! Ext.isDate(dtStart)) {
            dtStartField.markInvalid(this.app.i18n._('Start date is not valid'));
            return false;
        } else {
            dtStartField.clearInvalid();
            return true;
        }
        
    }
});

/**
 * Event Edit Window
 */
Tine.Calendar.EventEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 800,
        height: 470,
        name: Tine.Calendar.EventEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Calendar.EventEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};