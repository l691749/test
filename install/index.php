<?php

//error_reporting(E_NONE); //Setting this to E_ALL showed that that cause of not redirecting were few blank lines added in some php files.
$config_path = '../application/config/config.php';
$db_config_path = '../application/config/database.php';

// Only load the classes in case the user submitted the form
if($_POST) {

	// Load the classes and create the new objects
	require_once('includes/core_class.php');
	require_once('includes/database_class.php');
	require_once('includes/Bcrypt.php');

	$core = new Core();
	$database = new Database();


	// Validate the post data
	if($core->validate_post($_POST) == true)
	{

		// First create the database, then create tables, then write config file
		if($database->create_database($_POST) == false) {
			$message = $core->show_message('error',"The database could not be created, please verify your settings.");
		} else if ($database->create_tables($_POST) == false) {
			$message = $core->show_message('error',"The database tables could not be created, please verify your settings.");
		} else if ($core->write_config($_POST) == false) {
			$message = $core->show_message('error',"The database configuration file could not be written, please chmod application/config/database.php file to 777");
		}
		
		sleep(14);
		
		//create admin user
		$database->create_admin($_POST, $_POST['email'], $_POST['password_admin']);

		// If no errors, redirect to registration page
		if(!isset($message)) {
		  $redir = ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == "on") ? "https" : "http");
      $redir .= "://".$_SERVER['HTTP_HOST'];
      $redir .= str_replace(basename($_SERVER['SCRIPT_NAME']),"",$_SERVER['SCRIPT_NAME']);
      $redir = str_replace('install/','',$redir); 
			header( 'Location: done.php') ;
		}
		
		

	}
	else {
		$message = $core->show_message('error','Not all fields have been filled in correctly. <b>All fields below are required to install SITEBUILDER.</b>');
	}
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta charset="utf-8">
	    <title>Site Builder Installation</title>
	    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	    <!-- Fonts -->
		<!-- OpenSans font -->
		<link href='http://fonts.googleapis.com/css?family=Open+Sans:400italic,400,700,600' rel='stylesheet' type='text/css'>
		<!-- Varela Round font -->
		<link href='http://fonts.googleapis.com/css?family=Varela+Round' rel='stylesheet' type='text/css'>
		<!-- Quicksand -->
		<link href='http://fonts.googleapis.com/css?family=Quicksand:400,700,300' rel='stylesheet' type='text/css'>
	
	    <!-- Loading Bootstrap -->
	    <link href="../css/build-main.css" rel="stylesheet">
	
	    <!-- Loading Flat UI -->
	    <link href="../css/login.css" rel="stylesheet">

	    <!-- Orion Styles -->
	    <link href="../css/custom-interface.css" rel="stylesheet">
	    	
	    <!--[if IE]><link rel="icon"  href="../images/favicon-orion.ico" /><![endif]-->
    	<link rel="shortcut icon" href="../images/apple-touch-icon-allec.png">
    	<!-- Specifying a Webpage Icon for Web Clip -->
    	<link rel="shortcut apple-touch-icon" href="../images/apple-touch-icon-allec.png">
	
	    <!-- HTML5 shim, for IE6-8 support of HTML5 elements. All other JS at the end of file. -->
	    <!--[if lt IE 9]>
	      <script src="../js/html5shiv.js"></script>
	      <script src="../js/respond.min.js"></script>
	    <![endif]-->

	</head>
	<body class="login install">
	
	<div class="container">
	
		<div class="row">
		
			<?php if( is_writable($db_config_path) && is_writable($config_path) ){?>
		
			<div class="col-md-4 col-md-offset-4">
			
				<div class="main-logo">
            <svg class="main-logo__svg" width="56" height="56" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <g>
                <path class="main-logo__svg-path" d="m18.8,14c-1.2,-0.2 -2.3,0.1 -3.2,0.6c-0.8,0.5 -1.8,0.2 -2.4,-0.7c-0.4,-0.8 -0.2,-1.8 0.7,-2.3c1.4,-0.7 3,-1.2 4.7,-1.1c-0.2,-0.1 -0.4,-0.2 -0.6,-0.4c-0.8,-0.7 -1.8,-1.3 -3,-1.4c-2.6,-0.3 -5.1,1.5 -5.4,4s1.6,4.9 4.2,5.2c1.2,0.1 2.3,-0.1 3.2,-0.6c0.8,-0.5 1.8,-0.2 2.4,0.7c0.4,0.8 0.2,1.8 -0.7,2.3c-1.3,0.7 -3,1.2 -4.7,1.1c0.2,0.1 0.4,0.2 0.6,0.4c0.8,0.7 1.8,1.3 3,1.4c2.6,0.3 5.1,-1.5 5.4,-4c0.4,-2.4 -1.5,-4.8 -4.2,-5.2zm-2.8,-14c-8.8,0 -16,7.2 -16,16s7.2,16 16,16c8.8,0 16,-7.2 16,-16s-7.2,-16 -16,-16zm10.5,19.7c-0.6,4.5 -4.8,7.5 -9.4,7c-2,-0.3 -3.7,-1.2 -4.9,-2.4c-0.7,-0.7 -0.7,-1.8 0,-2.4c0.3,-0.3 0.7,-0.4 1,-0.5c-4.4,-0.6 -7.6,-4.7 -7.1,-9c0.6,-4.5 4.8,-7.5 9.3,-7c2,0.2 3.7,1.2 5,2.4c0.7,0.7 0.7,1.8 0,2.4c-0.3,0.3 -0.7,0.4 -1,0.5c4.5,0.6 7.7,4.6 7.1,9z" fill="#ffffff">
              </g>
            </svg>
        </div>

        <h2 class="logo-text">Site Builder</h2>
				
				<?php if( isset($message) ):?>
				<div class="alert alert-error">
					<button type="button" class="close fui-cross" data-dismiss="alert"></button>
				  	<?php echo $message;?>
				</div>
				<?php endif?>
						
				<form role="form" method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>">
				
					<h5 class="smaller"><span class="fui-gear"></span> Database Configuration</h5>
					
					<div class="input-group">
    					<span class="input-group-btn">
    						 <button class="btn"><span class="fui-home"></span></button>
    					</span>
    			    	<input type="text" class="form-control" id="hostname" name="hostname" value="<?php if( isset($_POST['hostname']) ){echo $_POST['hostname'];}else{echo "localhost";}?>" placeholder="Hostname">
   					</div>
				
   					<div class="input-group">
    					<span class="input-group-btn">
    						 <button class="btn"><span class="fui-user"></span></button>
    					</span>
    			    	<input type="text" class="form-control" id="username" name="username" value="<?php if( isset($_POST['username']) ){echo $_POST['username'];}?>" placeholder="Username">
   					</div>
   					
   					<div class="input-group">
    					<span class="input-group-btn">
    						 <button class="btn"><span class="fui-lock"></span></button>
    					</span>
    			    	<input type="password" class="form-control" id="password" name="password" value="<?php if( isset($_POST['username']) ){echo $_POST['password'];}?>" placeholder="Password">
   					</div>
   					
   					<div class="input-group">
    					<span class="input-group-btn">
    						 <button class="btn"><span class="fui-list"></span></button>
    					</span>
    			    	<input type="text" class="form-control" id="database" name="database" value="<?php if( isset($_POST['database']) ){echo $_POST['database'];}?>" placeholder="Database name">
   					</div>
   									  	
				  	<hr class="dashed light" style="margin-top: 40px; margin-bottom: 40px">
				  	
				  	<h5 class="smaller"><span class="fui-user"></span> Admin User Setup</h5>
				  	
				  	<div class="input-group">
    					<span class="input-group-btn">
    						 <button class="btn"><span class="fui-mail"></span></button>
    					</span>
    			    	<input type="text" class="form-control" id="email" name="email" value="<?php if( isset($_POST['email']) ){echo $_POST['email'];}?>" placeholder="Email address">
   					</div>
   					
   					<div class="input-group">
    					<span class="input-group-btn">
    						 <button class="btn"><span class="fui-lock"></span></button>
    					</span>
    			    	<input type="password" class="form-control" id="password_admin" name="password_admin" value="<?php if( isset($_POST['password_admin']) ){echo $_POST['password_admin'];}?>" placeholder="Password">
   					</div>

            <hr class="dashed light" style="margin-top: 40px; margin-bottom: 40px">

            <h5 class="smaller"><span class="fui-home"></span> URL Setup</h5>

            <div class="input-group">
              <span class="input-group-btn">
                <button class="btn"><span class="fui-home"></span></button>
              </span>
              <input type="text" class="form-control" id="base_url" name="base_url" value="<?php if( isset($_POST['base_url']) ){echo $_POST['base_url'];}else{echo "http://".$_SERVER['HTTP_HOST']."/";}?>" placeholder="Base URL">
            </div>
				  	
				  	<button type="submit" class="btn btn-primary btn-embossed btn-block"><span class="fui-check"></span> Install <b>Site Builder</b></button>
				  	
				  	<br><br>
				  	
				</form>
							
			</div><!-- /.col-md-6 -->
			
			<?php } else { ?>
			<div class="col-md-6 col-md-offset-3">
			
				<h2 class="text-center">
    				Site Builder
    			</h2>
				
				<div class="alert alert-error">
					<button type="button" class="close fui-cross" data-dismiss="alert"></button>
					<p>
					Please make the application/config/config.php and application/config/database.php file writable.
            <br><strong>Example</strong>:<br /><code>chmod 777 application/config/config.php</code>
            <br><strong>Example</strong>:<br /><code>chmod 777 application/config/database.php</code>
				</div>
			</div>
			<?php } ?>
		
		</div><!-- /.row -->
	
	</div><!-- /.container -->

	</body>
</html>