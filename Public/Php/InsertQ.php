<?php 

die();

require_once 'Functions.php';

require_once 'DbSettings.php';

$DB = new DBWORKER($dbu['host'], 'koksarea_hot' . $_GET['Project'], 'utf8', $dbu['user'], $dbu['pass']);

$max_qid = $DB -> prep('SELECT MAX(`id`) FROM `[q]scheme`') -> fetch(PDO :: FETCH_NUM)[0];

$After = $_GET['After'];

$Col = isset($_GET['Col']) ? $_GET['Col'] : 1;

for ($i = $max_qid; $i > $After; $i --) $DB -> prep('UPDATE `[q]scheme` SET `id` = ' . ($i + $Col) . ' WHERE `id` = ' . $i);

for ($j = 1; $j <= $Col; $j ++) $DB -> prep('INSERT INTO `[q]scheme` (`id`) VALUES (' . ($After + $j) . ')');
	
echo 'Well done!';
	
?>