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
		
			<div class="col-md-6 col-md-offset-3">
			
				<div class="main-logo">
            <svg class="main-logo__svg" width="56" height="56" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <g>
                <path class="main-logo__svg-path" d="m18.8,14c-1.2,-0.2 -2.3,0.1 -3.2,0.6c-0.8,0.5 -1.8,0.2 -2.4,-0.7c-0.4,-0.8 -0.2,-1.8 0.7,-2.3c1.4,-0.7 3,-1.2 4.7,-1.1c-0.2,-0.1 -0.4,-0.2 -0.6,-0.4c-0.8,-0.7 -1.8,-1.3 -3,-1.4c-2.6,-0.3 -5.1,1.5 -5.4,4s1.6,4.9 4.2,5.2c1.2,0.1 2.3,-0.1 3.2,-0.6c0.8,-0.5 1.8,-0.2 2.4,0.7c0.4,0.8 0.2,1.8 -0.7,2.3c-1.3,0.7 -3,1.2 -4.7,1.1c0.2,0.1 0.4,0.2 0.6,0.4c0.8,0.7 1.8,1.3 3,1.4c2.6,0.3 5.1,-1.5 5.4,-4c0.4,-2.4 -1.5,-4.8 -4.2,-5.2zm-2.8,-14c-8.8,0 -16,7.2 -16,16s7.2,16 16,16c8.8,0 16,-7.2 16,-16s-7.2,-16 -16,-16zm10.5,19.7c-0.6,4.5 -4.8,7.5 -9.4,7c-2,-0.3 -3.7,-1.2 -4.9,-2.4c-0.7,-0.7 -0.7,-1.8 0,-2.4c0.3,-0.3 0.7,-0.4 1,-0.5c-4.4,-0.6 -7.6,-4.7 -7.1,-9c0.6,-4.5 4.8,-7.5 9.3,-7c2,0.2 3.7,1.2 5,2.4c0.7,0.7 0.7,1.8 0,2.4c-0.3,0.3 -0.7,0.4 -1,0.5c4.5,0.6 7.7,4.6 7.1,9z" fill="#ffffff">
              </g>
            </svg>
        </div>

        <h2 class="logo-text">Site Builder</h2>
				
				<?php
				
					$redir = ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == "on") ? "https" : "http");
					$redir .= "://".$_SERVER['HTTP_HOST'];
					$redir .= str_replace(basename($_SERVER['SCRIPT_NAME']),"",$_SERVER['SCRIPT_NAME']);
					$redir = str_replace('install/','',$redir); 
				
				?>
				
				<div class="alert alert-success">
					<button type="button" class="close fui-cross" data-dismiss="alert"></button>
				  	<h4>All done, yeah!</h4>
				  	<p>
				  		You're all set! Site Builder has successfully been installed. You can now continue to login and start building awesome websites!
				  	</p>
				  	<p>
				  		Notice! Install folder will be deleted automatically. If any problem contact john@orion.com
 				  	</p>
				  	<a href="../index.php/login" class="btn btn-primary btn-wide btn-embossed"><span class="fui-lock"></span>&nbsp;&nbsp;Log into Site Builder</a>
				</div>
			
			</div><!-- /.col-md-6 -->
		
		</div><!-- /.row -->
	
	</div><!-- /.container -->

	</body>
</html>