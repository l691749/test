
<?php
    $install_path = str_replace("\\", "/", FCPATH . 'install');

    $this->load->database();
    
    if (is_dir($install_path)) {
        if( $this->db->username == '' ) {
            redirect( base_url()."install/", 'location' );
        } else{
            $this->load->helper("file"); // load the helper
            delete_files($install_path, true); // delete all files/folders

            rmdir($install_path);
        }       
    }
?>

<?php $this->load->view("shared/header.php");?>

<body class="login">
    
    <div class="container">
    
    	<div class="row">
    	
    		<div class="col-md-4 col-md-offset-4">

                <div class="main-logo">
                    <svg class="main-logo__svg" width="56" height="56" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                      <g>
                        <path class="main-logo__svg-path" d="m18.8,14c-1.2,-0.2 -2.3,0.1 -3.2,0.6c-0.8,0.5 -1.8,0.2 -2.4,-0.7c-0.4,-0.8 -0.2,-1.8 0.7,-2.3c1.4,-0.7 3,-1.2 4.7,-1.1c-0.2,-0.1 -0.4,-0.2 -0.6,-0.4c-0.8,-0.7 -1.8,-1.3 -3,-1.4c-2.6,-0.3 -5.1,1.5 -5.4,4s1.6,4.9 4.2,5.2c1.2,0.1 2.3,-0.1 3.2,-0.6c0.8,-0.5 1.8,-0.2 2.4,0.7c0.4,0.8 0.2,1.8 -0.7,2.3c-1.3,0.7 -3,1.2 -4.7,1.1c0.2,0.1 0.4,0.2 0.6,0.4c0.8,0.7 1.8,1.3 3,1.4c2.6,0.3 5.1,-1.5 5.4,-4c0.4,-2.4 -1.5,-4.8 -4.2,-5.2zm-2.8,-14c-8.8,0 -16,7.2 -16,16s7.2,16 16,16c8.8,0 16,-7.2 16,-16s-7.2,-16 -16,-16zm10.5,19.7c-0.6,4.5 -4.8,7.5 -9.4,7c-2,-0.3 -3.7,-1.2 -4.9,-2.4c-0.7,-0.7 -0.7,-1.8 0,-2.4c0.3,-0.3 0.7,-0.4 1,-0.5c-4.4,-0.6 -7.6,-4.7 -7.1,-9c0.6,-4.5 4.8,-7.5 9.3,-7c2,0.2 3.7,1.2 5,2.4c0.7,0.7 0.7,1.8 0,2.4c-0.3,0.3 -0.7,0.4 -1,0.5c4.5,0.6 7.7,4.6 7.1,9z" fill="#ffffff">
                      </g>
                    </svg>
                </div>

                <h2 class="logo-text">Site Builder By John</h2>
    		
    			<!-- <h2 class="text-center">
    				<?php echo $this->lang->line('login_sitetitle')?>
    			</h2> -->
    			
    			<!--<p><?php echo lang('login_subheading');?></p>-->
    			
    			<?php if( isset($message) && $message != '' ):?>
    			<div class="alert alert-success">
    				<button data-dismiss="alert" class="close fui-cross" type="button"></button>
    				<?php echo $message;?>
    			</div>
    			<?php endif;?>
    			    		
    			<form role="form" action="<?php echo site_url("auth/login");?>" method="post">
    				
    				<div class="input-group">
    					<span class="input-group-btn">
    						 <button class="btn"><span class="fui-user"></span></button>
    					</span>
    			    	<input type="email" class="form-control" id="identity" name="identity" tabindex="1" autofocus placeholder="Your email address" value="">
   					</div>
   					
    			  	<div class="input-group">
    			  		<span class="input-group-btn">
    			  			 <button class="btn"><span class="fui-lock"></span></button>
    			  		</span>
    					<input type="password" class="form-control" id="password" name="password" tabindex="2" placeholder="Your password" value="">
   					</div>
   					
    			    <div class="checkbox-group">
                        <input type="checkbox" value="1" id="remember" name="remember" tabindex="3" data-toggle="checkbox">
                        <label class="checkbox margin-bottom-20" for="remember"><?php echo $this->lang->line('login_rememberme')?></label>
                                            
                    </div>
                        
    			 	
    			  	<button type="submit" class="btn btn-primary btn-block" tabindex="4"><?php echo $this->lang->line('login_button_login')?><span class="fui-arrow-right"></span></button>
    			  	    			  	
    			  	<div class="row">
    			  		
    			  		<div class="col-md-12 text-center">
    			  			<a href="<?php echo site_url("auth/forgot_password");?>"  class="forgot_password"><?php echo $this->lang->line('login_lostpassword')?></a>
    			  		</div>
    			  	
    			  	</div><!-- /.row -->
										    			  	
    			</form>
				<!-- 
				<div class="divider">
					<span><?php echo $this->lang->line('OR')?></span>
				</div> -->
				
    			<h2 class="text-center margin-bottom-25">
    				<?php echo $this->lang->line('login_signupheading')?>
    			</h2>
									
				<a href="<?php echo site_url("auth/create_user");?>" class="btn btn-primary btn-block"><?php echo $this->lang->line('login_button_signup')?></a>
					    		
    		</div><!-- /.col -->
    	
    	</div><!-- /.row -->
    
    </div><!-- /.container -->
    
    <!-- Load JS here for greater good =============================-->
    <?php if( ENVIRONMENT == 'development' ):?>
    <script src="<?php echo base_url('js/vendor/jquery.min.js');?>"></script>
    <script src="<?php echo base_url('js/vendor/flat-ui-pro.min.js');?>"></script>
    <?php else:?>
    <script src="<?php echo base_url('js/build/login.min.js');?>"></script>
    <?php endif;?>
  </body>
</html>
