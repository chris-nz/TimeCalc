<?php

// Checks for errors and checks that the file is uploaded
if (($_FILES['restoreFile']['error'] == UPLOAD_ERR_OK) && (is_uploaded_file($_FILES['restoreFile']['tmp_name'])))
{
	// Outputs the JSON into the iframe so jQuery can read it
	echo '<span id="uploadedJsonData">' . file_get_contents($_FILES['restoreFile']['tmp_name']) . '</span>';
}