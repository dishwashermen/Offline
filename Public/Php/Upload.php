<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    require_once 'Functions.php';
	
	if (preg_array_key_exists('/ProjectId|LogData|Index/', $_POST) && isset($_FILES['file']) && count($_FILES['file'])) {
		
		require_once 'DbSettings.php';
		
		require_once 'Worker.php';
		
		$DB = new DBWORKER($dbu['host'], $dbu['db'], 'utf8', $dbu['user'], $dbu['pass']);
		
		$DBQ = new DBWORKER($dbu['host'], 'koksarea_hot' . $_POST['ProjectId'], 'utf8', $dbu['user'], $dbu['pass']);
		
		$LogData = (array) json_decode($_POST['LogData']);
		
		$Index = (integer) $_POST['Index'] + 1;

		$ud = $DB -> prep('SELECT `users`.`id`, `users`.`StateIndex` AS `Items` FROM `users` WHERE `users`.`prid` = :ProjectId AND `users`.`data1` = :data1 AND `users`.`data2` = :data2', array('ProjectId' => $_POST['ProjectId'], 'data1' => $LogData[0], 'data2' => $LogData[1])) -> fetch(PDO :: FETCH_ASSOC);
		
		if ($ud) {
			
			$Dir = '../../Upload/' . $ud['id'] . '/';
				
			if (! file_exists($Dir)) mkdir($Dir, 0755, true);
			
			$FileCount = 0;
			
			$File_ = reArrayFiles($_FILES['file']);
		
			foreach ($File_ as $File) if (empty($File['error']) && ! empty($File['tmp_name']) && move_uploaded_file($File['tmp_name'], $Dir . $Index . '-' . $File['name'])) $FileCount ++;
			
			if (count($File_) == $FileCount) {
				
				$DBQ -> prep('UPDATE `u' . $ud['id'] . '_' . $Index . '` SET `QResponse` = ' . $FileCount . ' WHERE `QName` = "RECQTY"');
				
				echo json_encode(array('Action' => 'Upload', 'Successful' => true, 'Index' => $_POST['Index']));
				
			} else echo json_encode(array('Action' => 'Upload', 'Successful' => false, 'Index' => $_POST['Index']));
	
		}
		
	}
	
}

function reArrayFiles(&$file_post) {

    $file_ary = array();
	
    $file_count = count($file_post['name']);
	
    $file_keys = array_keys($file_post);

    for ($i = 0; $i < $file_count; $i ++) foreach ($file_keys as $key) $file_ary[$i][$key] = $file_post[$key][$i];

    return $file_ary;
	
}

?>