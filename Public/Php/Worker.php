<?php

function GetFileData($data) {
	
	$in_data = array();
				
	$in_data_index = 0;
	
	foreach ($data as $lkey => $lval) {
		
		$ldata = explode(';', $lval); 
		
		foreach ($ldata as $ldata_key => $ldata_value) {
		
			if ($lkey != 0) {
					
				if ($lkey > 1 && $ldata_key == 0) {
					
					if (! in_array($ldata_value, $in_data[$ldata_key]['fieldData'][$in_data_index])) {
				
						$in_data_index ++;
						
						array_push($in_data[$ldata_key]['fieldData'], array($ldata_value));
						
						if (count($ldata) > 1) for ($i = 1; $i < count($ldata); $i ++) array_push($in_data[$ldata_key + $i]['fieldData'], array());
				
					}
					
				} else array_push($in_data[$ldata_key]['fieldData'][$in_data_index], $ldata_value);

			} else array_push($in_data, array('fieldName' => $ldata_value, 'fieldData' => array(array())));
			
		} 
			
	}
	
	return $in_data;
	
}

function NewUser($data) {
	
	global $DB;
	
	global $DBQ;
	
	global $_SERVER;
	
	global $_POST;
	
	$EmptyId = $DB -> prep('SELECT (`users`.`id` + 1) as `empty_id` FROM `users` WHERE (SELECT 1 FROM `users` as `st` WHERE `st`.`id` = (`users`.`id` + 1)) IS NULL ORDER BY `users`.`id` LIMIT 1') -> fetch(PDO :: FETCH_NUM)[0];
	
	$query = 'INSERT INTO `users` (`id`, `prid`, `data1`' . (count($data) > 1 ? ', `data2`' : '') . ', `StateIndex`, `UserAgent`, `Status`) VALUES (' . $EmptyId . ', :prId, :data1' . (count($data) > 1 ? ', :data2' : '') . ', :StateIndex, :UserAgent, 1)';
	
	$array = array('prId' => $_POST['ProjectId'], 'data1' => $data[0], 'data2' => $data[1], 'StateIndex' => 0, 'UserAgent' => $_SERVER['HTTP_USER_AGENT']);
	
	$newId = $DB -> prep($query, $array);

	return array('id' => $EmptyId);
	
}

function GetR() {
	
	global $DBQ;
	
	$Event = ['Direct', 'Visual'];
	
	$Result = array();
	
	foreach ($Event as $E) {
		
		$Result[$E] = array();
	
		$r = $DBQ -> prep('SELECT * FROM `rscheme` WHERE `Disabled` IS NULL AND `rscheme`.`Event` = "' . $E . '"') -> fetchAll(PDO :: FETCH_ASSOC);
	
		if ($r) { 
	
			$c = array();
		
			foreach ($r as $rval) {
				
				if (! array_key_exists($rval['StateIndex'], $c)) $c[$rval['StateIndex']] = array();
				
				array_push($c[$rval['StateIndex']], $rval);
				
			}
		
			foreach ($c as $index_c => $value_c) {
			
				$b = array('Criterion' => $value_c[0]['Criterion'], 'Transit' => $value_c[0]['Transit'], 'AltTransit' => $value_c[0]['AltTransit'], 'TriggerVar' => [], 'Operation' => [], 'Target' => [], 'Equation' => [], 'Selection' => [], 'Action' => []);
				
				foreach ($value_c as $value_a) foreach ($value_a as $k => $v) if (preg_match('/TriggerVar|Target|Action|Selection|Equation|Operation/', $k)) array_push($b[$k], $v != null ? $v : '');
				
				$result[$E][$index_c] = $b;

			}
			
		}
	
	}

	return $result;
	
}

function GetQ() {
	
	global $DBQ; 

	$a = $DBQ -> prep('SELECT * FROM `qscheme`') -> fetchAll(PDO :: FETCH_ASSOC);
	
	foreach ($a as $aValue) {
		
		if (preg_match('/^\[content\](.+)$/', $aValue['ColsContent'], $FN)) {
					
			$FileName = '../../ContentData/' . $FN[1];
			
			if (file_exists($FileName)) {
			
				$lines = file_get_contents($FileName);
				
				$aValue['ColsContent'] = $lines;
		
			}
			
		}
		
	}
	
	return $a;
	
}

?>