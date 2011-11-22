<?php

// Set the filename and pop up the save file dialogue
header("Content-Type: application/octet-stream");
header("Content-Disposition: attachment; filename=" . $_GET['filename']);

// Output the JSON content into the file
echo urldecode($_GET['content']);