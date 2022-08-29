<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    require_once 'Functions.php';
	
	if (preg_array_key_exists('/Data|ProjectId|LogData|ItemId/', $_POST)) {
		
		require_once 'DbSettings.php';
		
		require_once 'Worker.php';
		
		$DB = new DBWORKER($dbu['host'], $dbu['db'], 'utf8', $dbu['user'], $dbu['pass']);
		
		$DBQ = new DBWORKER($dbu['host'], 'koksarea_hot' . $_POST['ProjectId'], 'utf8', $dbu['user'], $dbu['pass']);
		
		$Data = (array) json_decode($_POST['Data']);
		
		$LogData = (array) json_decode($_POST['LogData']);
		
		$Media = isset($_POST['Media']) ? (array) json_decode($_POST['Media']) : false;
		
		$UploadedQuantity = 0;
		
		$UploadedStatus = false;
		
		$InsertStatus = false;
		
		$ItemsQuantity = 0;
		
		$TableIdentifier = substr($_POST['ItemId'], 20);
		
		$DoubleIdentifier = '_dbl_' . generator(4);
		
		// Получение данных проекта ---------------------------------------------------------------------------------------------
		
		$pd = $DB -> prep('SELECT `projects`.`Mode` FROM `projects` WHERE `projects`.`id` = :ProjectId', array('ProjectId' => $_POST['ProjectId'])) -> fetch(PDO :: FETCH_ASSOC);
		
		if ($pd['Mode'] != 'ON') {
			
			echo json_encode(array('Action' => 'Closed'));
			
			die();
			
		}
		
		// ----------------------------------------------------------------------------------------------------------------------

		// Получение данных пользователя ----------------------------------------------------------------------------------------
		
		$ud = $DB -> prep('SELECT `users`.`id`, `users`.`StateIndex` AS `Items` FROM `users` WHERE `users`.`prid` = :ProjectId AND `users`.`data1` = :data1 AND `users`.`data2` = :data2', array('ProjectId' => $_POST['ProjectId'], 'data1' => $LogData[0], 'data2' => $LogData[1])) -> fetch(PDO :: FETCH_ASSOC);
		
		if ($ud) {
			
			$ItemsQuantity = $ud['Items'];

		} else $ud = NewUser($LogData);
		
		// ----------------------------------------------------------------------------------------------------------------------

		// Обработка медиаданных ------------------------------------------------------------------------------------------------
		
		if ($Media) {
			
			foreach ($Media['Context'] as $MK => $MV) {
				
				$PureData = substr($MV, strpos($MV, ',') + 1);
				
				$DirName = '../../Upload/' . $ud['id'] . '/';
				
				$FileName = $TableIdentifier . '-' . $Media['Time'][$MK];
				
				if (! file_exists($DirName)) mkdir($DirName);
				
				if (file_exists($DirName . $FileName . '.ogg')) $FileName .= $DoubleIdentifier;
				
				$F = fopen($DirName . $FileName . '.ogg', 'w');
				
				if ($F) {
                    
                    if (fwrite($F, base64_decode($PureData)) !== false) $UploadedQuantity ++;
                
                    fclose($F);
                    
                }
				
			}
			
			if ($UploadedQuantity == count($Media['Context'])) $UploadedStatus = true;
			
			logger('Upload attach: ' . (string) $UploadedQuantity . ' of ' . count($Media['Context']), $ud['id'], false);
			
		}
		
		// ----------------------------------------------------------------------------------------------------------------------
		
		// Обработка текстовых данных -------------------------------------------------------------------------------------------
		
		if (! $Media || ($Media && $UploadedStatus)) {

			$QueryString = '(:QName,:QResponse,:QSI),';
			
			$PostValues = array('QName' => 'RECQTY', 'QResponse' => $Media ? count($Media['Context']) : '0', 'QSI' => '0');

			$i = 1;
			
			foreach ($Data as $key => $val) {
				
				$QueryString .= '(:QName' . $i . ',:QResponse' . $i . ',:QSI' . $i . '),';
				
				$PostValues['QName' . $i] = str_replace('.', '_', $key);
				
				$PostValues['QResponse' . $i] = $val[0];
				
				$PostValues['QSI' . $i] = $val[1];
				
				$i ++; 
				
			}
			
			$TableName = 'u' . $ud['id'] . '_' . $TableIdentifier;
			
			$TableExist = $DBQ -> prep('SHOW TABLES FROM `koksarea_hot' . $_POST['ProjectId'] . '` like "' . $TableName . '"') -> fetch(PDO :: FETCH_NUM);
			
			if ($TableExist && count($TableExist)) $TableName .= $DoubleIdentifier;

			$DBQ -> prep('CREATE TABLE `' . $TableName . '` (QName VARCHAR(14) NOT NULL UNIQUE PRIMARY KEY, QResponse TEXT NOT NULL, QSI SMALLINT(5) NULL, Journal SMALLINT(5) NULL, TimeStamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB');
			
			logger('Write', $ud['id']);
			
			$InsertStatus = $DBQ -> prep('INSERT INTO `' . $TableName . '` (`QName`, `QResponse`, `QSI`) VALUES ' . substr($QueryString, 0, -1) . ' ON DUPLICATE KEY UPDATE QResponse = VALUES(QResponse), QSI = VALUES(QSI), TimeStamp = CURRENT_TIMESTAMP', $PostValues);
			
			if ($InsertStatus !== false) {
				
				$ItemsQuantity ++;
				
				$DB -> prep('UPDATE `users` SET `StateIndex` = ' . $ItemsQuantity . ' WHERE `id` = :id', array('id' => $ud['id']));
				
			}
		
		}

		echo json_encode(array('Action' => $InsertStatus !== false ? 'Resume' : 'Failure', 'ItemId' => $_POST['ItemId']));
		
	}
	
}

?>