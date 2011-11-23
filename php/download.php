<?php
$filename = '';
$content = '';

// Check the parameters exist
if (isset($_POST['filename']) && isset($_POST['content']))
{
	$filename = $_POST['filename'];
	$content = $_POST['content'];
	
	// Set the filename and pop up the save file dialogue
	header("Content-Type: application/octet-stream");
	header("Content-Disposition: attachment; filename=" . $filename);

	// Output the JSON content into the file
	echo $content;
}