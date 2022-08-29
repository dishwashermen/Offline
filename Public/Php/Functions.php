<?php

define ('SECRET', 'u4sXZJqKLhvcvjww');

class DBWORKER {
	
	private $DBHD, $logname, $cphrase, $cmode, $ckey; 
	
	function __construct($host, $dbname, $charset, $dblogin, $dbpass) {
		
		try { 
		
			$this -> DBHD = new PDO('mysql:host=' . $host . ';dbname=' . $dbname . ';charset=' . $charset, $dblogin, $dbpass, array(PDO :: ATTR_ERRMODE => PDO :: ERRMODE_EXCEPTION)); 
			
		}  
	
		catch(PDOException $e) {
			
			customErrorHandler("DB Connect Error\n\n" . $_SERVER['REMOTE_ADDR'] . "\n\n" . $e -> getMessage());
			
			$this -> DBHD = null;
		
			die(); 
	
		}
		
	}
	
	public function prep($qstring, $data = null) {
		
		if ($data !== null) if (! is_array($data)) $data = array($data);
		
		try {
			
			$f = preg_match('/insert/i', $qstring) ? true : false;
			
			$query = $this -> DBHD -> prepare($qstring);
			
			$this -> DBHD -> beginTransaction();
			
			$data ? $query -> execute($data) : $query -> execute();
			
			$id = $f ? $this -> DBHD -> lastInsertId() : 0;
				
			$this -> DBHD -> commit();
			
//			customErrorHandler("DB Error\n\n" . $_SERVER['REMOTE_ADDR'] . "\n\nQuery String:\t" . $qstring . 
//			
//				($data ? "\n\n" . implode('', $data) : ''));
			
			return $f ? $id : $query;

		}
		
		catch(PDOException $e) {
			
			$this -> DBHD -> rollback();
			
			if ($data) {
				
				ob_start();
				
				foreach ($data as $key => $val) {
					
					var_dump($val);
					
					$data[$key] = "Data[" . $key . "]\t\t" . ob_get_contents();
					
					ob_clean();
					
				}
				
				ob_end_flush();
				
			}
			
			customErrorHandler("DB Error\n\n" . $_SERVER['REMOTE_ADDR'] . "\n\n" . $e -> getMessage() . "\n\nQuery String:\t" . $qstring . 
			
				($data ? "\n\n" . implode('', $data) : ''));
			
			$this -> DBHD = null;
				
			return false;
			
		}
		
	}
	
	public function close() {
		
		$this -> DBHD = null;
		
		die();
		
	}
	
	public function quote($str) {
		
		return $this -> DBHD -> quote($str);
		
	}
	
} // (class) DBWORKER

class CWORKER { // phrase, mode

	private $cmode, $cphrase, $ckey;
	
	function __construct($cphrase = 'DHknmsfFDg4376gm', $cmode = 'rijndael-256') {

		$this -> cphrase = $cphrase;
		
		$this -> cmode = $cmode;
		
	}
	
	private function encr() { 
		
		$arguments = func_get_args();
		
		return (string)base64_encode(mcrypt_encrypt(
		
			$this -> cmode, 
			
			substr(md5($this -> ckey), 0, mcrypt_get_key_size($this -> cmode, 'cbc')), 
			
			$arguments[0], 
			
			'cbc', 
			
			substr(md5($this -> ckey), 0, mcrypt_get_block_size($this -> cmode, 'cbc')))
			
		);
		
	}
	
	private function decr() {
		
		$arguments = func_get_args();
		
		return strip_tags((string)mcrypt_decrypt(
		
			$this -> cmode, 
			
			substr(md5($this -> ckey), 0, mcrypt_get_key_size($this -> cmode, 'cbc')), 
			
			base64_decode($arguments[0]), 
			
			'cbc', 
			
			substr(md5($this -> ckey), 0, mcrypt_get_block_size($this -> cmode, 'cbc'))
			
		));
		
	}

	public function crypt() { // state[en | de], data, array(key, shift_1, .., shift_n))
		
		$arguments = func_get_args();
		
		if (! is_array($arguments[1])) {
			
			$this -> ckey = $this -> cphrase . (isset($arguments[3]) ? (int)$arguments[2] * (int)$arguments[3] - (int)$arguments[2] : (isset($arguments[2]) ? $arguments[2] : ''));
			
			return ($arguments[0] == 'en') ? $this -> encr($arguments[1]) : $this -> decr($arguments[1]);
			
		} else {
			
			$result = $arguments[1];
			
			$i = 1;
			
			foreach ($arguments[1] as $key => $val) {
				
				$this -> ckey = $this -> cphrase . ((isset($arguments[2]) && $arguments[2][$i] > 0) ? ($arguments[2][0] * $arguments[2][$i] - $arguments[2][0]) : ''); 
				
				$result[$key] = ($arguments[0] == 'en') ? $this -> encr($val) : $this -> decr($val);
				
				$i ++;
				
			}
			
			return $result;
			
		}
		
	}
	
} // (class) CWORKER

function generator($x, $t = false) {

    if ($t) {
		
		for ($i = 0, $result = '' ; $i < $x ; $i ++) {
	
			$type = mt_rand(1, 2);
		
			$result .= ($type == 1) ? chr(mt_rand(97, 102)) : chr(mt_rand(48, 57));
			
		}
		
	} else for ($i = 0, $result = '' ; $i < $x ; $i ++) {
	
	    $type = mt_rand(1, 3);
	
	    $result .= ($type == 1) ? chr(mt_rand(97, 122)) : (($type == 2) ? chr(mt_rand(65, 90)) : chr(mt_rand(48, 57)));
		
	}
	
	return $result;

} // generator

function pr($a) {
	
	echo '<hr><br>';

	foreach($a as $key => $val) {
	
		echo '<b>' . $key . ':</b>&nbsp;&nbsp;';
	
		print_r($val);
		
		echo '<br><br>';
	
	}
	
	echo '<hr>';

} // pr

function customErrorHandler($e) {
	
	preg_match('/' . str_replace('/', '\/', $_SERVER['DOCUMENT_ROOT']) . '\/(\w*)/', $_SERVER['SCRIPT_FILENAME'], $dirname);
	
	file_put_contents($_SERVER['DOCUMENT_ROOT'] . '/' . $dirname[1] . '/.error_log_list', date('jS-M-y H-i-s') . "\n\n" . $e . "\n-----------------------------------------------------\n\n", 
	
		FILE_APPEND);
	
	return false;
	
} // customErrorHandler

function logger($log, $uid = false, $post = true) {
	
	global $_POST;
	
	$DateString = date('jS-M-y H-i-s');
	
	$DashString = str_repeat('-', 58 - strlen($DateString) - strlen($log));
	
	preg_match('/' . str_replace('/', '\/', $_SERVER['DOCUMENT_ROOT']) . '\/(\w*)/', $_SERVER['SCRIPT_FILENAME'], $dirname);
	
	$Dir = $_SERVER['DOCUMENT_ROOT'] . '/' . $dirname[1] . '/OFFLINE/LogData/' . $_POST['ProjectId'] . '/';
	
	if (! file_exists($Dir)) mkdir($Dir, 0755, true);
	
	$FN = $uid ? $uid : $_POST['UserId'];
	
	$PostString = '';
	
	if ($post) {
		
		$InitKey = true;
		
		foreach ($_POST as $key => $val) {
			
			if ($key == 'Media') {
				
				$Media = (array) json_decode($val);
				
				$PostString .= $key . ":\t" . json_encode($Media['Time']) . "\n";
				
			} else {
			
				if ($InitKey) {
					
					if (! Preg_match('/ProjectId|LogData|Index|Media/', $key)) {
					
						$InitKey = false;
						
						$PostString .= "\n" . $key . ":\t" . $val . "\n";
					
					} else $PostString .= $key . ":\t" . $val . "\n";
					
				} else $PostString .= $key . ":\t" . $val . "\n";
				
			}

		}
		
	}
	
	file_put_contents($Dir . $FN . '.log', $DateString . ' ' . $DashString . ' ' . $log . "\n\n" . ($post ? $PostString . "\n" : ''), 
	
		FILE_APPEND);
	
}

function userErrorHandler($errno, $errmsg, $filename, $linenum) {
	
	global $_POST;

    $errortype = array (
	
    	E_ERROR => 'Error',
				
        E_WARNING  => 'Warning',
				
        E_PARSE => 'Parsing Error',
				
        E_NOTICE => 'Notice',
				
        E_CORE_ERROR => 'Core Error',
				
        E_CORE_WARNING => 'Core Warning',
				
        E_COMPILE_ERROR => 'Compile Error',
				
        E_COMPILE_WARNING => 'Compile Warning',
				
        E_USER_ERROR => 'User Error',
				
        E_USER_WARNING => 'User Warning',
				
        E_USER_NOTICE => 'User Notice',
				
        E_STRICT => 'Runtime Notice'
				
    );
				
    $user_errors = array(E_USER_ERROR, E_USER_WARNING, E_USER_NOTICE);
    
    $message = date('jS-M-y H-i-s') . "\t" . $errortype[$errno] . "\n\n" . $errmsg . "\n\n" . $filename . " - " . $linenum;

    $message .= "\n\n\t" . json_encode($_POST);
   
    $message .= "\n-----------------------------------------------------\n\n";
	
	preg_match('/' . str_replace('/', '\/', $_SERVER['DOCUMENT_ROOT']) . '\/(\w*)/', $_SERVER['SCRIPT_FILENAME'], $dirname);

    error_log($message, 3, $_SERVER['DOCUMENT_ROOT'] . '/' . $dirname[1] . '/.error_log_list');
	
	return false;

} // userErrorHandler

function preg_array_key_exists($pattern, $array) {
	
    $keys = array_keys($array);    
	
    return count(explode('|', $pattern)) === count(preg_grep($pattern, $keys));
	
}

function query_generator($data, $exceptions = '', $type = 'update') {
	
	$FW = array();
	
	$qstring1 = '';
	
	$qstring2 = '';

	foreach ($data as $key => $val) if (! preg_match('/' . $exceptions . '/', $key, $matches)) {

		$key_ = preg_match('/_/', $key) ? $key : $key . '_';
		
		$rkey = preg_replace('/_/', '.', $key);
		
		$FW[$key_] = $val ? $val : 0;

		$qstring1 .= $type == 'update' ? '`' . $rkey . '` = :' . $key_ . ', ' : '`' . $rkey . '`, ';
		
		$qstring2 .= ':' . $key_ . ', ';

	}
	
	if ($type == 'update') {
		
		return array('q' => 'UPDATE `produce` SET ' . substr($qstring1, 0, -2) . ' ', 'a' => $FW);
		
	} else return array('q' => 'INSERT INTO `produce` (' . substr($qstring1, 0, -2) . ') VALUES (' . substr($qstring2, 0, -2) . ') ', 'a' => $FW);
	
}

error_reporting(0);

set_error_handler("userErrorHandler");

?>