/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id$
 *
 */
 
 Ext.namespace('Tine', 'Tine.widgets');
 
/**
 * sets text and disabled status of a set of actions according to the grants 
 * of a set of records
 * 
 * @param {Array|SelectionModel} records
 * @param {Array|Toolbar}        actions
 * @param {containerField}       string
 */
Tine.widgets.ActionUpdater = function(records, actions, containerField) {
    if (!containerField) {
        containerField = 'container_id';
    }

    if (typeof(records.getSelections) == 'function') {
        records = records.getSelections();
    } else if (typeof(records.beginEdit) == 'function') {
        records = [records];
    }
    
    // init grants
    var defaultGrant = records.length == 0 ? false : true;
    var grants = {
        addGrant:    defaultGrant,
        adminGrant:  defaultGrant,
        deleteGrant: defaultGrant,
        editGrant:   defaultGrant,
        readGrant:   defaultGrant
    };
    
    // calculate sum of grants
    for (var i=0; i<records.length; i++) {
        var recordGrants = records[i].get(containerField).account_grants;
        for (var grant in grants) {
            grants[grant] = grants[grant] & recordGrants[grant];
        }
    }
    
    /**
     * action iterator
     */
    var actionIterator = function(action) {
        var initialConfig = action.initialConfig;
        if (initialConfig) {
            
            // happens for direct extensions of button class, like the notes button
            if (action.requiredGrant) {
                initialConfig = {
                    requiredGrant: action.requiredGrant,
                    allowMultiple: action.allowMultiple,
                    singularText: action.singularText,
                    pluralText: action.pluralText,
                    translationObject: action.translationObject
                };
            }
            
            // NOTE: we don't handle add action for the moment!
            var requiredGrant = initialConfig.requiredGrant;
            if (requiredGrant && requiredGrant != 'addGrant') {
                var enable = grants[requiredGrant];
                if (records.length > 1 && ! initialConfig.allowMultiple) {
                    enable = false;
                }
                action.setDisabled(!enable);
                if (initialConfig.singularText && initialConfig.pluralText && initialConfig.translationObject) {
                    var text = initialConfig.translationObject.n_(initialConfig.singularText, initialConfig.pluralText, records.length);
                    action.setText(text);
                }
            }
        }
    };
    
    /**
     * call action iterator
     */
    switch (typeof(actions)) {
        case 'object':
            if (typeof(actions.each) == 'function') {
                actions.each(actionIterator, this);
            } else {
                for (var action in actions) {
                    actionIterator(actions[action]);
                }
            }
        break;
        case 'array':
            for (var i=0; i<actions.length; i++) {
                actionIterator(actions[i]);
            }
        break;
    }
    
};