<nav class="mainnav navbar navbar-inverse navbar-embossed navbar-fixed-top" role="navigation" id="mainNav">
	<div class="navbar-header">
		<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navbar-collapse-01">
			<span class="sr-only"><?php echo $this->lang->line('nav_toggle_navigation')?></span>
		</button>
		<a class="navbar-brand" href="<?php echo site_url()?>">
			<!--<img src="<?php echo base_url();?>images/logo.png" style="height: 30px; position: relative; top: -3px; margin-right: 5px;">-->
			<svg class="logo__svg" width="32" height="32" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
							<g>
								<path class="logo__svg-path" d="m18.8,14c-1.2,-0.2 -2.3,0.1 -3.2,0.6c-0.8,0.5 -1.8,0.2 -2.4,-0.7c-0.4,-0.8 -0.2,-1.8 0.7,-2.3c1.4,-0.7 3,-1.2 4.7,-1.1c-0.2,-0.1 -0.4,-0.2 -0.6,-0.4c-0.8,-0.7 -1.8,-1.3 -3,-1.4c-2.6,-0.3 -5.1,1.5 -5.4,4s1.6,4.9 4.2,5.2c1.2,0.1 2.3,-0.1 3.2,-0.6c0.8,-0.5 1.8,-0.2 2.4,0.7c0.4,0.8 0.2,1.8 -0.7,2.3c-1.3,0.7 -3,1.2 -4.7,1.1c0.2,0.1 0.4,0.2 0.6,0.4c0.8,0.7 1.8,1.3 3,1.4c2.6,0.3 5.1,-1.5 5.4,-4c0.4,-2.4 -1.5,-4.8 -4.2,-5.2zm-2.8,-14c-8.8,0 -16,7.2 -16,16s7.2,16 16,16c8.8,0 16,-7.2 16,-16s-7.2,-16 -16,-16zm10.5,19.7c-0.6,4.5 -4.8,7.5 -9.4,7c-2,-0.3 -3.7,-1.2 -4.9,-2.4c-0.7,-0.7 -0.7,-1.8 0,-2.4c0.3,-0.3 0.7,-0.4 1,-0.5c-4.4,-0.6 -7.6,-4.7 -7.1,-9c0.6,-4.5 4.8,-7.5 9.3,-7c2,0.2 3.7,1.2 5,2.4c0.7,0.7 0.7,1.8 0,2.4c-0.3,0.3 -0.7,0.4 -1,0.5c4.5,0.6 7.7,4.6 7.1,9z" fill="#ffffff">
							</g>
						</svg>
				<h1 class="logo__text">Sites</h1>
			<!-- <?php echo $this->lang->line('nav_name')?> -->
		</a>
	</div>
	<div class="collapse navbar-collapse" id="navbar-collapse-01">
		<ul class="nav navbar-nav">
			
			<?php if( isset($siteData) || ( isset($page) && $page == 'newPage' ) ):?>
		
				<?php if( isset($siteData) ):?>
				<li class="mix-arrange simple-link">
					<a><span id="siteTitle"><?php echo $siteData['site']->sites_name?></span></a>
				</li>
				<?php endif;?>
				<?php if( isset($page) && $page == 'newPage' ):?>
				<li class="active">
					<a><span class="fui-home"></span> <span id="siteTitle"><?php echo $this->lang->line('newsite_default_title')?></span> </a>
				</li>
				<?php endif;?>
								
				<?php if( isset($_SERVER['HTTP_REFERER']) && $_SERVER['HTTP_REFERER'] != '' ):?>
				
					<?php
						
						//find out where we came from :)
						
						$temp = explode("/", $_SERVER['HTTP_REFERER']);
						
						if( array_pop($temp) == 'users' ) {
						
							$t = 'nav_goback_users';
							$to = site_url('users');
						
						} else {
							
							$t = 'nav_goback_sites';
							$to = site_url('sites');
						
						}
						
					?>
				
					<li class="mix-arrange backButton"><a href="<?php echo $_SERVER['HTTP_REFERER']?>" id="backButton"><span class="fui-arrow-left"></span> <?php echo $this->lang->line( $t )?></a></li>
			
				<?php else:?>
				
					<li><a href="<?php echo site_url('sites')?>" id="backButton"><span class="fui-arrow-left"></span> <?php echo $this->lang->line('nav_goback_users')?></a></li>
				
				<?php endif;?>
			
			<?php else:?>
			
				<li <?php if( isset($page) && $page == "sites" ):?>class="active"<?php endif;?>><a href="<?php echo site_url('sites')?>"><span class="fui-windows"></span> <?php echo $this->lang->line('nav_sites')?></a></li>
      			<li <?php if( isset($page) && $page == "images" ):?>class="active"<?php endif;?>><a href="<?php echo site_url('assets/images')?>"><span class="fui-image"></span> <?php echo $this->lang->line('nav_imagelibrary')?></a></li>
      			<?php if( $this->ion_auth->is_admin() ):?>
      			<li <?php if( isset($page) && $page == "users" ):?>class="active"<?php endif;?>><a href="<?php echo site_url('users')?>"><span class="fui-user"></span> <?php echo $this->lang->line('nav_users')?></a></li>
      			<li <?php if( isset($page) && $page == "settings" ):?>class="active"<?php endif;?>><a href="<?php echo site_url('settings')?>"><span class="fui-gear"></span> <?php echo $this->lang->line('nav_settings')?></a></li>
      			<?php endif;?>
      		
      		<?php endif;?>
		</ul>
		<ul class="nav navbar-nav navbar-right" style="margin-right: 20px;">
			<li class="dropdown">
				<?php
					$u = $this->ion_auth->user()->row();
				?>
				<a href="#" class="dropdown-toggle" data-toggle="dropdown">Hi, <?php echo $u->first_name." ".$u->last_name;?> <b class="caret"></b></a>
				<span class="dropdown-arrow"></span>
			  	<ul class="dropdown-menu">
			    	<li><a href="#accountModal" data-toggle="modal"><span class="fui-cmd"></span> <?php echo $this->lang->line('nav_myaccount')?></a></li>
			    	<li class="divider"></li>
			    	<li><a href="<?php echo site_url('logout')?>"><span class="fui-exit"></span> <?php echo $this->lang->line('nav_logout')?></a></li>
			  	</ul>
			</li>			      
		</ul>	      
	</div><!-- /.navbar-collapse -->
</nav><!-- /navbar -->