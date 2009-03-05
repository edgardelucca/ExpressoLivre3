<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Group
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id$
 */

/**
 * defines the datatype for the group object
 * 
 * @package     Tinebase
 * @subpackage  Group
 */
class Tinebase_Model_Group extends Tinebase_Record_Abstract
{
    /**
     * list of zend inputfilter
     * 
     * this filter get used when validating user generated content with Zend_Input_Filter
     *
     * @var array
     */
    protected $_filters = array(
        'id'            => 'Digits',
        'name'          => 'StringTrim',
        'description'   => 'StringTrim',
    );
    
    /**
     * list of zend validator
     * 
     * this validators get used when validating user generated content with Zend_Input_Filter
     *
     * @var array
     */
    protected $_validators = array(
        'id'            => array('Digits', Zend_Filter_Input::ALLOW_EMPTY => true),
        'name'          => array('presence' => 'required'),
        'description'   => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'members'       => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => array()),
    );
    
   /**
     * key in $_validators/$_properties array for the filed which 
     * represents the identifier
     * 
     * @var string
     */    
    protected $_identifier = 'id';    
    
    /**
     * converts a int, string or Tinebase_Model_Group to a groupid
     *
     * @param   int|string|Tinebase_Model_Group $_groupId the groupid to convert
     * @return  int
     * @throws  Tinebase_Exception_InvalidArgument
     */
    static public function convertGroupIdToInt($_groupId)
    {
        if($_groupId instanceof Tinebase_Model_Group) {
            if(empty($_groupId->id)) {
                throw new Tinebase_Exception_InvalidArgument('No group id set.');
            }
            $groupId = (int) $_groupId->id;
        } else {
            $groupId = (int) $_groupId;
        }
        
        if($groupId === 0) {
            throw new Tinebase_Exception_InvalidArgument('Group id can not be 0.');
        }
        
        return $groupId;
    }
}