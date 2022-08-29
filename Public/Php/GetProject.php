<?php 

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	
	require_once 'Functions.php';
	
	if (count($_POST) == 4) {
		
		require_once 'DbSettings.php';
		
		require_once 'Worker.php';
		
		$DB = new DBWORKER($dbu['host'], $dbu['db'], 'utf8', $dbu['user'], $dbu['pass']);
		
		$Project = $DB -> prep('SELECT `projects`.* FROM `projects` WHERE `projects`.`id` = :ProjectId AND `projects`.`Hash` = :Hash AND `projects`.`Mode` = "ON"', array('ProjectId' => $_POST['ProjectId'], 'Hash' => md5($_POST['ProjectPassword']))) -> fetch(PDO :: FETCH_ASSOC);
		
		if ($Project) {
			
			//logger('Get project');
			
			$DBQ = new DBWORKER($dbu['host'], 'koksarea_hot' . $_POST['ProjectId'], 'utf8', $dbu['user'], $dbu['pass']);

			echo json_encode(array('Action' => 'Welcome', 'Project' => $Project, 'ProjectData' => GetQ(), 'RulesData' => GetR()));
			
		} else echo json_encode(array('Action' => 'Reject')); 
		
	}
	
}

?>