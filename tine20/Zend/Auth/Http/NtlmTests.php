<?php

require_once 'PHPUnit/Framework.php';
set_include_path('.' . PATH_SEPARATOR . '../../../library' . PATH_SEPARATOR . '../../..' . PATH_SEPARATOR . get_include_path());

require_once 'Zend/Loader/Autoloader.php';
$autoloader = Zend_Loader_Autoloader::getInstance();
$autoloader->setFallbackAutoloader(true);

class NtlmTests extends PHPUnit_Framework_TestCase
{
    
    public function setUp()
    {
        $this->_auth = new Zend_Auth_Http_Ntlm();
        
        // prepare response for testing (phpunit sets headers...)
        $this->_auth->getResponse()->headersSentThrowsException = FALSE;
        
        $targetInfo = array(
            'domain'        => 'DOMAIN',
            'servername'    => 'SERVER',
            'dnsdomain'     => 'domain.com',
            'fqserver'      => 'server.domain.com',
        );
        
        $this->_auth->setTargetInfo($targetInfo);
        
        $m1hex = '4e544c4d53535000010000000732000006000600330000000b000b0028000000050093080000000f574f524b53544154494f4e444f4d41494e';
        $m1bin = pack('H*', $m1hex);
        
        $authHeader = 'NTLM '. base64_encode($m1bin);
        $_SERVER['HTTP_AUTHORIZATION'] = $authHeader;
        
    }
    
    public function testMessage1Decode()
    {
        $authResult = $this->_auth->authenticate();
        
        $this->assertFalse($authResult->isValid(), 'Message 1 must not authenticate');
        
        $identity = $authResult->getIdentity();
        
        // assert flags
        $this->assertTrue($identity->hasFlag(Zend_Auth_Http_Ntlm::FLAG_NEGOTIATE_UNICODE));
        $this->assertTrue($identity->hasFlag(Zend_Auth_Http_Ntlm::FLAG_NEGOTIATE_OEM));
        $this->assertTrue($identity->hasFlag(Zend_Auth_Http_Ntlm::FLAG_REQUEST_TARGET));
        $this->assertTrue($identity->hasFlag(Zend_Auth_Http_Ntlm::FLAG_NEGOTIATE_NTLM));
        $this->assertTrue($identity->hasFlag(Zend_Auth_Http_Ntlm::FLAG_NEGOTIATE_DOMAIN_SUPPLIED));
        $this->assertTrue($identity->hasFlag(Zend_Auth_Http_Ntlm::FLAG_NEGOTIATE_WORKSTATION_SUPPLIED));
        $this->assertFalse($identity->hasFlag(Zend_Auth_Http_Ntlm::FLAG_NEGOTIATE_NTLM2_KEY));
        
        // assert domain / workstatsion
        $this->assertEquals('DOMAIN', $identity->getDomain());
        $this->assertEquals('WORKSTATION', $identity->getWorkstation());
    }
    
    public function testMessage2Encode()
    {
        $authResult = $this->_auth->authenticate();
        
        $headers = $this->_auth->getResponse()->getHeaders();
        $hexMessage2 = bin2hex(base64_decode(substr($headers[0]['value'], 5)));
        
        $m2hex =    "4e544c4d53535000020000000c000c003000000001028100".
                    "0123456789abcdef0000000000000000620062003c000000".
                    "44004f004d00410049004e0002000c0044004f004d004100".
                    "49004e0001000c0053004500520056004500520004001400".
                    "64006f006d00610069006e002e0063006f006d0003002200".
                    "7300650072007600650072002e0064006f006d0061006900".
                    "6e002e0063006f006d0000000000";
        
        $this->assertEquals($m2hex, $hexMessage2);
        
        /*
        echo $m2hex . "\n";
        echo bin2hex(base64_decode(substr($headers[0]['value'], 5))) . "\n";
        */
    }
}