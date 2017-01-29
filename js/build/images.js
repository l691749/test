(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {
	"use strict";

	require('./modules/ui');
	require('./modules/builder');
	require('./modules/config');
	require('./modules/imageLibrary');
	require('./modules/account');

}());
},{"./modules/account":2,"./modules/builder":3,"./modules/config":5,"./modules/imageLibrary":6,"./modules/ui":8}],2:[function(require,module,exports){
(function () {
	"use strict";

	var appUI = require('./ui.js').appUI;

	var account = {
        
        buttonUpdateAccountDetails: document.getElementById('accountDetailsSubmit'),
        buttonUpdateLoginDetails: document.getElementById('accountLoginSubmit'),
        
        init: function() {
            
            $(this.buttonUpdateAccountDetails).on('click', this.updateAccountDetails);
            $(this.buttonUpdateLoginDetails).on('click', this.updateLoginDetails);
                        
        },
        
        
        /*
            updates account details
        */
        updateAccountDetails: function() {
            
            //all fields filled in?
            
            var allGood = 1;
            
            if( $('#account_details input#firstname').val() === '' ) {
                $('#account_details input#firstname').closest('.form-group').addClass('has-error');
                allGood = 0;
            } else {
                $('#account_details input#firstname').closest('.form-group').removeClass('has-error');
                allGood = 1;
            }
            
            if( $('#account_details input#lastname').val() === '' ) {
                $('#account_details input#lastname').closest('.form-group').addClass('has-error');
                allGood = 0;
            } else {
                $('#account_details input#lastname').closest('.form-group').removeClass('has-error');
                allGood = 1;
            }
		
            if( allGood === 1 ) {

                var theButton = $(this);
                
                //disable button
                $(this).addClass('disabled');
                
                //show loader
                $('#account_details .loader').fadeIn(500);
                
                //remove alerts
                $('#account_details .alerts > *').remove();
                
                $.ajax({
                    url: appUI.siteUrl+"users/uaccount",
                    type: 'post',
                    dataType: 'json',
                    data: $('#account_details').serialize()
                }).done(function(ret){
                    
                    //enable button
                    theButton.removeClass('disabled');
                    
                    //hide loader
                    $('#account_details .loader').hide();
                    $('#account_details .alerts').append( $(ret.responseHTML) );

                    if( ret.responseCode === 1 ) {//success
                        setTimeout(function () { 
                            $('#account_details .alerts > *').fadeOut(500, function () { $(this).remove(); });
                        }, 3000);
                    }
                });

            }
            
        },
        
        
        /*
            updates account login details
        */
        updateLoginDetails: function() {
			
			console.log(appUI);
            
            var allGood = 1;
            
            if( $('#account_login input#email').val() === '' ) {
                $('#account_login input#email').closest('.form-group').addClass('has-error');
                allGood = 0;
            } else {
                $('#account_login input#email').closest('.form-group').removeClass('has-error');
                allGood = 1;
            }
            
            if( $('#account_login input#password').val() === '' ) {
                $('#account_login input#password').closest('.form-group').addClass('has-error');
                allGood = 0;
            } else {
                $('#account_login input#password').closest('.form-group').removeClass('has-error');
                allGood = 1;
            }
            
            if( allGood === 1 ) {
                
                var theButton = $(this);

                //disable button
                $(this).addClass('disabled');
                
                //show loader
                $('#account_login .loader').fadeIn(500);
                
                //remove alerts
                $('#account_login .alerts > *').remove();
                
                $.ajax({
                    url: appUI.siteUrl+"users/ulogin",
                    type: 'post',
                    dataType: 'json',
                    data: $('#account_login').serialize()
                }).done(function(ret){
                    
                    //enable button
                    theButton.removeClass('disabled');
                    
                    //hide loader
                    $('#account_login .loader').hide();
                    $('#account_login .alerts').append( $(ret.responseHTML) );
					
                    if( ret.responseCode === 1 ) {//success
                        setTimeout(function () { 
                            $('#account_login .alerts > *').fadeOut(500, function () { $(this).remove(); });
                        }, 3000);
                    }
                
                });
            
            }
            
        }
        
    };
    
    account.init();

}());
},{"./ui.js":8}],3:[function(require,module,exports){
(function () {
	"use strict";

    var siteBuilderUtils = require('./utils.js');
    var bConfig = require('./config.js');
    var appUI = require('./ui.js').appUI;


	 /*
        Basic Builder UI initialisation
    */
    var builderUI = {
        
        allBlocks: {},                                              //holds all blocks loaded from the server
        menuWrapper: document.getElementById('menu'),
        primarySideMenuWrapper: document.getElementById('main'),
        buttonBack: document.getElementById('backButton'),
        buttonBackConfirm: document.getElementById('leavePageButton'),
        
        siteBuilderModes: document.getElementById('siteBuilderModes'),
        aceEditors: {},
        frameContents: '',                                      //holds frame contents
        templateID: 0,                                          //holds the template ID for a page (???)
        radioBlockMode: document.getElementById('modeBlock'),
                
        modalDeleteBlock: document.getElementById('deleteBlock'),
        modalResetBlock: document.getElementById('resetBlock'),
        modalDeletePage: document.getElementById('deletePage'),
        buttonDeletePageConfirm: document.getElementById('deletePageConfirm'),
        
        dropdownPageLinks: document.getElementById('internalLinksDropdown'),

        pageInUrl: null,
        
        tempFrame: {},
                
        init: function(){
                                                
            //load blocks
            $.getJSON(appUI.baseUrl+'elements.json?v=12345678', function(data){ builderUI.allBlocks = data; builderUI.implementBlocks(); });
            
            //sitebar hover animation action
            $(this.menuWrapper).on('mouseenter', function(){
                
                $(this).stop().animate({'left': '0px'}, 500);
                
            }).on('mouseleave', function(){
                
                //$(this).stop().animate({'left': '-190px'}, 500);
                
                $('#menu #main a').removeClass('active');
                $('.menu .second').stop().animate({
                    width: 0
                }, 500, function(){
                    $('#menu #second').hide();
                });
                
            });

            // scroll sidebar
            $(".main").mCustomScrollbar({
              axis:"y"
            });

            $(".second").mCustomScrollbar({
              axis:"y"
            });
            
            //prevent click event on ancors in the block section of the sidebar
            $(this.primarySideMenuWrapper).on('click', 'a:not(.actionButtons)', function(e){e.preventDefault();});
            
            $(this.buttonBack).on('click', this.backButton);
            $(this.buttonBackConfirm).on('click', this.backButtonConfirm);
            
            //notify the user of pending chnages when clicking the back button
            $(window).bind('beforeunload', function(){
                if( site.pendingChanges === true ) {
                    return 'Your site contains changed which haven\'t been saved yet. Are you sure you want to leave?';
                }
            });
                                                
            //make sure we start in block mode
            $(this.radioBlockMode).radiocheck('check').on('click', this.activateBlockMode);

            //URL parameters
            builderUI.pageInUrl = siteBuilderUtils.getParameterByName('p');

        },
        
        
        /*
            builds the blocks into the site bar
        */
        implementBlocks: function() {

            var newItem, loaderFunction;
            
            for( var key in this.allBlocks.elements ) {
                
                var niceKey = key.toLowerCase().replace(" ", "_");
                
                $('<li><a href="" id="'+niceKey+'">'+key+'</a></li>').appendTo('#menu #main ul#elementCats');
                
                for( var x = 0; x < this.allBlocks.elements[key].length; x++ ) {
                    
                    if( this.allBlocks.elements[key][x].thumbnail === null ) {//we'll need an iframe
                        
                        //build us some iframes!
                        
                        if( this.allBlocks.elements[key][x].sandbox ) {
                            
                            if( this.allBlocks.elements[key][x].loaderFunction ) {
                                loaderFunction = 'data-loaderfunction="'+this.allBlocks.elements[key][x].loaderFunction+'"';
                            }
                            
                            newItem = $('<li class="element '+niceKey+'"><iframe src="'+appUI.baseUrl+this.allBlocks.elements[key][x].url+'" scrolling="no" sandbox="allow-same-origin"></iframe></li>');
                        
                        } else {
                            
                            newItem = $('<li class="element '+niceKey+'"><iframe src="about:blank" scrolling="no"></iframe></li>');
                        
                        }
                        
                        newItem.find('iframe').uniqueId();
                        newItem.find('iframe').attr('src', appUI.baseUrl+this.allBlocks.elements[key][x].url);
                    
                    } else {//we've got a thumbnail
                        
                        if( this.allBlocks.elements[key][x].sandbox ) {
                            
                            if( this.allBlocks.elements[key][x].loaderFunction ) {
                                loaderFunction = 'data-loaderfunction="'+this.allBlocks.elements[key][x].loaderFunction+'"';
                            }
                            
                            newItem = $('<li class="element '+niceKey+'"><img src="'+appUI.baseUrl+this.allBlocks.elements[key][x].thumbnail+'" data-srcc="'+appUI.baseUrl+this.allBlocks.elements[key][x].url+'" data-height="'+this.allBlocks.elements[key][x].height+'" data-sandbox="" '+loaderFunction+'></li>');
                            
                        } else {
                                
                            newItem = $('<li class="element '+niceKey+'"><img src="'+appUI.baseUrl+this.allBlocks.elements[key][x].thumbnail+'" data-srcc="'+appUI.baseUrl+this.allBlocks.elements[key][x].url+'" data-height="'+this.allBlocks.elements[key][x].height+'"></li>');
                                
                        }
                    }
                    
                    newItem.appendTo('#menu #second ul#elements');
            
                    //zoomer works

                    var theHeight;
                    
                    if( this.allBlocks.elements[key][x].height ) {
                        
                        theHeight = this.allBlocks.elements[key][x].height*0.25;
                    
                    } else {
                        
                        theHeight = 'auto';
                        
                    }
                    
                    newItem.find('iframe').zoomer({
                        zoom: 0.25,
                        width: 270,
                        height: theHeight,
                        message: "Drag&Drop Me!"
                    });
                
                }
            
            }
            
            //draggables
            builderUI.makeDraggable();
            
        },
                
        
        /*
            event handler for when the back link is clicked
        */
        backButton: function() {
            
            if( site.pendingChanges === true ) {
                $('#backModal').modal('show');
                return false;
            }
            
        },
        
        
        /*
            button for confirming leaving the page
        */
        backButtonConfirm: function() {
            
            site.pendingChanges = false;//prevent the JS alert after confirming user wants to leave
            
        },
        
        
        /*
            activates block mode
        */
        activateBlockMode: function() {
                        
            site.activePage.toggleFrameCovers('On');
            
            //trigger custom event
            $('body').trigger('modeBlocks');
            
        },
        
       
        /*
            makes the blocks and templates in the sidebar draggable onto the canvas
        */
        makeDraggable: function() {
                        
            $('#elements li, #templates li').each(function(){

                $(this).draggable({
                    helper: function() {
                        return $('<div style="height: 100px; width: 300px; background: #F9FAFA; box-shadow: 5px 5px 1px rgba(0,0,0,0.1); text-align: center; line-height: 100px; font-size: 20px; color: #fff"><span class="fui-list"></span></div>');
                    },
                    revert: 'invalid',
                    appendTo: 'body',
                    connectToSortable: '#pageList > ul',
                    start: function(){

                        //switch to block mode
                        $('input:radio[name=mode]').parent().addClass('disabled');
                        $('input:radio[name=mode]#modeBlock').radiocheck('check');
                    
                    }
                
                }); 
            
            });
            
            $('#elements li a').each(function(){
                
                $(this).unbind('click').bind('click', function(e){
                    e.preventDefault();
                });
            
            });
            
        },
        
        
        /*
            Implements the site on the canvas, called from the Site object when the siteData has completed loading
        */
        populateCanvas: function() {

            var i;
                                    
            //if we have any blocks at all, activate the modes
            if( Object.keys(site.pages).length > 0 ) {
                var modes = builderUI.siteBuilderModes.querySelectorAll('input[type="radio"]');
                for( i = 0; i < modes.length; i++ ) {
                    modes[i].removeAttribute('disabled'); 
                }
            }
            
            var counter = 1;
                        
            //loop through the pages
                                    
            for( i in site.pages ) {
                
                var newPage = new Page(i, site.pages[i], counter);
                                            
                counter++;

                //set this page as active?
                if( builderUI.pageInUrl === i ) {
                    newPage.selectPage();
                }
                                
            }
            
            //activate the first page
            if(site.sitePages.length > 0 && builderUI.pageInUrl === null) {
                site.sitePages[0].selectPage();
            }
                                    
        }
        
    };


    /*
        Page constructor
    */
    function Page (pageName, page, counter) {
    
        this.name = pageName || "";
        this.pageID = page.pages_id || 0;
        this.blocks = [];
        this.parentUL = {}; //parent UL on the canvas
        this.status = '';//'', 'new' or 'changed'
        this.scripts = [];//tracks script URLs used on this page
        
        this.pageSettings = {
            title: page.pages_title || '',
            meta_description: page.meta_description || '',
            meta_keywords: page.meta_keywords || '',
            header_includes: page.header_includes || '',
            page_css: page.page_css || ''
        };
                
        this.pageMenuTemplate = '<a href="" class="menuItemLink">page</a><span class="pageButtons"><a href="" class="fileEdit fui-new"></a><a href="" class="fileDel fui-cross"><a class="btn btn-xs btn-primary btn-embossed fileSave fui-check" href="#"></a></span></a></span>';
        
        this.menuItem = {};//reference to the pages menu item for this page instance
        this.linksDropdownItem = {};//reference to the links dropdown item for this page instance
        
        this.parentUL = document.createElement('UL');
        this.parentUL.setAttribute('id', "page"+counter);
                
        /*
            makes the clicked page active
        */
        this.selectPage = function() {
            
            //console.log('select:');
            //console.log(this.pageSettings);
                        
            //mark the menu item as active
            site.deActivateAll();
            $(this.menuItem).addClass('active');
                        
            //let Site know which page is currently active
            site.setActive(this);
            
            //display the name of the active page on the canvas
            site.pageTitle.innerHTML = this.name;
            
            //load the page settings into the page settings modal
            site.inputPageSettingsTitle.value = this.pageSettings.title;
            site.inputPageSettingsMetaDescription.value = this.pageSettings.meta_description;
            site.inputPageSettingsMetaKeywords.value = this.pageSettings.meta_keywords;
            site.inputPageSettingsIncludes.value = this.pageSettings.header_includes;
            site.inputPageSettingsPageCss.value = this.pageSettings.page_css;
                          
            //trigger custom event
            $('body').trigger('changePage');
            
            //reset the heights for the blocks on the current page
            for( var i in this.blocks ) {
                
                if( Object.keys(this.blocks[i].frameDocument).length > 0 ){
                    this.blocks[i].heightAdjustment();
                }
            
            }
            
            //show the empty message?
            this.isEmpty();
                                    
        };
        
        /*
            changed the location/order of a block within a page
        */
        this.setPosition = function(frameID, newPos) {
            
            //we'll need the block object connected to iframe with frameID
            
            for(var i in this.blocks) {
                
                if( this.blocks[i].frame.getAttribute('id') === frameID ) {
                    
                    //change the position of this block in the blocks array
                    this.blocks.splice(newPos, 0, this.blocks.splice(i, 1)[0]);
                    
                }
                
            }
                        
        };
        
        /*
            delete block from blocks array
        */
        this.deleteBlock = function(block) {
            
            //remove from blocks array
            for( var i in this.blocks ) {
                if( this.blocks[i] === block ) {
                    //found it, remove from blocks array
                    this.blocks.splice(i, 1);
                }
            }
            
            site.setPendingChanges(true);
            
        };
        
        /*
            toggles all block frameCovers on this page
        */
        this.toggleFrameCovers = function(onOrOff) {
            
            for( var i in this.blocks ) {
                                 
                this.blocks[i].toggleCover(onOrOff);
                
            }
            
        };
        
        /*
            setup for editing a page name
        */
        this.editPageName = function() {
            
            if( !this.menuItem.classList.contains('edit') ) {
            
                //hide the link
                this.menuItem.querySelector('a.menuItemLink').style.display = 'none';
            
                //insert the input field
                var newInput = document.createElement('input');
                newInput.type = 'text';
                newInput.setAttribute('name', 'page');
                newInput.setAttribute('value', this.name);
                this.menuItem.insertBefore(newInput, this.menuItem.firstChild);
                    
                newInput.focus();
        
                var tmpStr = newInput.getAttribute('value');
                newInput.setAttribute('value', '');
                newInput.setAttribute('value', tmpStr);
                            
                this.menuItem.classList.add('edit');
            
            }
            
        };
        
        /*
            Updates this page's name (event handler for the save button)
        */
        this.updatePageNameEvent = function(el) {
            
            if( this.menuItem.classList.contains('edit') ) {
            
                //el is the clicked button, we'll need access to the input
                var theInput = this.menuItem.querySelector('input[name="page"]');
                
                //make sure the page's name is OK
                if( site.checkPageName(theInput.value) ) {
                   
                    this.name = site.prepPageName( theInput.value );
            
                    this.menuItem.querySelector('input[name="page"]').remove();
                    this.menuItem.querySelector('a.menuItemLink').innerHTML = this.name;
                    this.menuItem.querySelector('a.menuItemLink').style.display = 'block';
            
                    this.menuItem.classList.remove('edit');
                
                    //update the links dropdown item
                    this.linksDropdownItem.text = this.name;
                    this.linksDropdownItem.setAttribute('value', this.name+".html");
                    
                    //update the page name on the canvas
                    site.pageTitle.innerHTML = this.name;
            
                    //changed page title, we've got pending changes
                    site.setPendingChanges(true);
                                        
                } else {
                    
                    alert(site.pageNameError);
                    
                }
                                        
            }
            
        };
        
        /*
            deletes this entire page
        */
        this.delete = function() {
                        
            //delete from the Site
            for( var i in site.sitePages ) {
                
                if( site.sitePages[i] === this ) {//got a match!
                    
                    //delete from site.sitePages
                    site.sitePages.splice(i, 1);
                    
                    //delete from canvas
                    this.parentUL.remove();
                    
                    //add to deleted pages
                    site.pagesToDelete.push(this.name);
                    
                    //delete the page's menu item
                    this.menuItem.remove();
                    
                    //delet the pages link dropdown item
                    this.linksDropdownItem.remove();
                    
                    //activate the first page
                    site.sitePages[0].selectPage();
                    
                    //page was deleted, so we've got pending changes
                    site.setPendingChanges(true);
                    
                }
                
            }
                        
        };
        
        /*
            checks if the page is empty, if so show the 'empty' message
        */
        this.isEmpty = function() {

            if( this.blocks.length === 0 ) {
                
                site.messageStart.style.display = 'block';
                site.divFrameWrapper.classList.add('empty');
                             
            } else {
                
                site.messageStart.style.display = 'none';
                site.divFrameWrapper.classList.remove('empty');
                
            }
                        
        };
            
        /*
            preps/strips this page data for a pending ajax request
        */
        this.prepForSave = function() {
            
            var page = {};
                    
            page.name = this.name;
            page.pageSettings = this.pageSettings;
            page.status = this.status;
            page.blocks = [];
                    
            //process the blocks
                    
            for( var x = 0; x < this.blocks.length; x++ ) {
                        
                var block = {};
                        
                if( this.blocks[x].sandbox ) {
                            
                    block.frameContent = "<html>"+$('#sandboxes #'+this.blocks[x].sandbox).contents().find('html').html()+"</html>";
                    block.sandbox = true;
                    block.loaderFunction = this.blocks[x].sandbox_loader;
                            
                } else {
                                                        
                    block.frameContent = this.blocks[x].getSource();
                    block.sandbox = false;
                    block.loaderFunction = '';
                            
                }
                        
                block.frameHeight = this.blocks[x].frameHeight;
                block.originalUrl = this.blocks[x].originalUrl;
                                                                
                page.blocks.push(block);
                        
            }
            
            return page;
            
        };
            
        /*
            generates the full page, using skeleton.html
        */
        this.fullPage = function() {
            
            var page = this;//reference to self for later
            page.scripts = [];//make sure it's empty, we'll store script URLs in there later
                        
            var newDocMainParent = $('iframe#skeleton').contents().find( bConfig.pageContainer );
            
            //empty out the skeleton first
            $('iframe#skeleton').contents().find( bConfig.pageContainer ).html('');
            
            //remove old script tags
            $('iframe#skeleton').contents().find( 'script' ).each(function(){
                $(this).remove();
            });

            var theContents;
                        
            for( var i in this.blocks ) {
                
                //grab the block content
                if (this.blocks[i].sandbox !== false) {
                                
                    theContents = $('#sandboxes #'+this.blocks[i].sandbox).contents().find( bConfig.pageContainer ).clone();
                            
                } else {
                                
                    theContents = $(this.blocks[i].frameDocument.body).find( bConfig.pageContainer ).clone();
                            
                }
                                
                //remove video frameCovers
                theContents.find('.frameCover').each(function () {
                    $(this).remove();
                });
                
                //remove video frameWrappers
                theContents.find('.videoWrapper').each(function(){
                    
                    var cnt = $(this).contents();
                    $(this).replaceWith(cnt);
                    
                });
                
                //remove style leftovers from the style editor
                for( var key in bConfig.editableItems ) {
                                                                
                    theContents.find( key ).each(function(){
                                                                        
                        $(this).removeAttr('data-selector');
                        
                        $(this).css('outline', '');
                        $(this).css('outline-offset', '');
                        $(this).css('cursor', '');
                                                                        
                        if( $(this).attr('style') === '' ) {
                                        
                            $(this).removeAttr('style');
                                    
                        }
                                
                    });
                            
                }
                
                //remove style leftovers from the content editor
                for ( var x = 0; x < bConfig.editableContent.length; ++x) {
                                
                    theContents.find( bConfig.editableContent[x] ).each(function(){
                                    
                        $(this).removeAttr('data-selector');
                                
                    });
                            
                }
                
                //append to DOM in the skeleton
                newDocMainParent.append( $(theContents.html()) );
                
                //do we need to inject any scripts?
                var scripts = $(this.blocks[i].frameDocument.body).find('script');
                var theIframe = document.getElementById("skeleton");
                                            
                if( scripts.size() > 0 ) {
                                
                    scripts.each(function(){

                        var script;
                                    
                        if( $(this).text() !== '' ) {//script tags with content
                                        
                            script = theIframe.contentWindow.document.createElement("script");
                            script.type = 'text/javascript';
                            script.innerHTML = $(this).text();
                                        
                            theIframe.contentWindow.document.body.appendChild(script);
                                    
                        } else if( $(this).attr('src') !== null && page.scripts.indexOf($(this).attr('src')) === -1 ) {
                            //use indexOf to make sure each script only appears on the produced page once
                                        
                            script = theIframe.contentWindow.document.createElement("script");
                            script.type = 'text/javascript';
                            script.src = $(this).attr('src');
                                        
                            theIframe.contentWindow.document.body.appendChild(script);
                            
                            page.scripts.push($(this).attr('src'));
                                    
                        }
                                
                    });
                            
                }
            
            }
            
            console.log(this.scripts);
            
        };
            
        /*
            clear out this page
        */
        this.clear = function() {
            
            var block = this.blocks.pop();
            
            while( block !== undefined ) {
                
                block.delete();
                
                block = this.blocks.pop();
                
            }
                                    
        };
         
        
        //loop through the frames/blocks
        
        if( page.hasOwnProperty('blocks') ) {
        
            for( var x = 0; x < page.blocks.length; x++ ) {
            
                //create new Block
            
                var newBlock = new Block();
            
                page.blocks[x].src = appUI.siteUrl+"sites/getframe/"+page.blocks[x].frames_id;
                
                //sandboxed block?
                if( page.blocks[x].frames_sandbox === '1') {
                                        
                    newBlock.sandbox = true;
                    newBlock.sandbox_loader = page.blocks[x].frames_loaderfunction;
                
                }
                        
                newBlock.frameID = page.blocks[x].frames_id;
                newBlock.createParentLI(page.blocks[x].frames_height);
                newBlock.createFrame(page.blocks[x]);
                newBlock.createFrameCover();
                newBlock.insertBlockIntoDom(this.parentUL);
                                                                    
                //add the block to the new page
                this.blocks.push(newBlock);
                                        
            }
            
        }
        
        //add this page to the site object
        site.sitePages.push( this );
        
        //plant the new UL in the DOM (on the canvas)
        site.divCanvas.appendChild(this.parentUL);
        
        //make the blocks/frames in each page sortable
        
        var thePage = this;
        
        $(this.parentUL).sortable({
            revert: true,
            placeholder: "drop-hover",
            stop: function () {
                site.setPendingChanges(true);
            },
            beforeStop: function(event, ui){
                
                //template or regular block?
                var attr = ui.item.attr('data-frames');

                var newBlock;
                    
                if (typeof attr !== typeof undefined && attr !== false) {//template, build it
                 
                    $('#start').hide();
                                        
                    //clear out all blocks on this page    
                    thePage.clear();
                                            
                    //create the new frames
                    var frameIDs = ui.item.attr('data-frames').split('-');
                    var heights = ui.item.attr('data-heights').split('-');
                    var urls = ui.item.attr('data-originalurls').split('-');
                        
                    for( var x = 0; x < frameIDs.length; x++) {
                                                
                        newBlock = new Block();
                        newBlock.createParentLI(heights[x]);
                        
                        var frameData = {};
                        
                        frameData.src = appUI.siteUrl+'sites/getframe/'+frameIDs[x];
                        frameData.frames_original_url = appUI.siteUrl+'sites/getframe/'+frameIDs[x];
                        frameData.frames_height = heights[x];
                        
                        newBlock.createFrame( frameData );
                        newBlock.createFrameCover();
                        newBlock.insertBlockIntoDom(thePage.parentUL);
                        
                        //add the block to the new page
                        thePage.blocks.push(newBlock);
                        
                        //dropped element, so we've got pending changes
                        site.setPendingChanges(true);
                            
                    }
                
                    //set the tempateID
                    builderUI.templateID = ui.item.attr('data-pageid');
                                                                                    
                    //make sure nothing gets dropped in the lsit
                    ui.item.html(null);
                        
                    //delete drag place holder
                    $('body .ui-sortable-helper').remove();
                    
                } else {//regular block
                
                    //are we dealing with a new block being dropped onto the canvas, or a reordering og blocks already on the canvas?
                
                    if( ui.item.find('.frameCover > button').size() > 0 ) {//re-ordering of blocks on canvas
                    
                        //no need to create a new block object, we simply need to make sure the position of the existing block in the Site object
                        //is changed to reflect the new position of the block on th canvas
                    
                        var frameID = ui.item.find('iframe').attr('id');
                        var newPos = ui.item.index();
                    
                        site.activePage.setPosition(frameID, newPos);
                                        
                    } else {//new block on canvas
                                                
                        //new block                    
                        newBlock = new Block();
                                
                        newBlock.placeOnCanvas(ui);
                                    
                    }
                    
                }
                
            },
            start: function(event, ui){
                    
                if( ui.item.find('.frameCover').size() !== 0 ) {
                    builderUI.frameContents = ui.item.find('iframe').contents().find( bConfig.pageContainer ).html();
                }
            
            },
            over: function(){
                    
                $('#start').hide();
                
            }
        });
        
        //add to the pages menu
        this.menuItem = document.createElement('LI');
        this.menuItem.innerHTML = this.pageMenuTemplate;
        
        $(this.menuItem).find('a:first').text(pageName).attr('href', '#page'+counter);
        
        var theLink = $(this.menuItem).find('a:first').get(0);
        
        //bind some events
        this.menuItem.addEventListener('click', this, false);
        
        this.menuItem.querySelector('a.fileEdit').addEventListener('click', this, false);
        this.menuItem.querySelector('a.fileSave').addEventListener('click', this, false);
        this.menuItem.querySelector('a.fileDel').addEventListener('click', this, false);
        
        //add to the page link dropdown
        this.linksDropdownItem = document.createElement('OPTION');
        this.linksDropdownItem.setAttribute('value', pageName+".html");
        this.linksDropdownItem.text = pageName;
                
        builderUI.dropdownPageLinks.appendChild( this.linksDropdownItem );
        
        site.pagesMenu.appendChild(this.menuItem);
                    
    }
    
    Page.prototype.handleEvent = function(event) {
        switch (event.type) {
            case "click": 
                                
                if( event.target.classList.contains('fileEdit') ) {
                
                    this.editPageName();
                    
                } else if( event.target.classList.contains('fileSave') ) {
                                        
                    this.updatePageNameEvent(event.target);
                
                } else if( event.target.classList.contains('fileDel') ) {
                    
                    var thePage = this;
                
                    $(builderUI.modalDeletePage).modal('show');
                    
                    $(builderUI.modalDeletePage).off('click', '#deletePageConfirm').on('click', '#deletePageConfirm', function() {
                        
                        thePage.delete();
                        
                        $(builderUI.modalDeletePage).modal('hide');
                        
                    });
                                        
                } else {
                    
                    this.selectPage();
                
                }
                
        }
    };


    /*
        Block constructor
    */
    function Block () {
        
        this.frameID = 0;
        this.sandbox = false;
        this.sandbox_loader = '';
        this.status = '';//'', 'changed' or 'new'
        this.originalUrl = '';
        
        this.parentLI = {};
        this.frameCover = {};
        this.frame = {};
        this.frameDocument = {};
        this.frameHeight = 0;
        
        this.annot = {};
        this.annotTimeout = {};
        
        /*
            creates the parent container (LI)
        */
        this.createParentLI = function(height) {
            
            this.parentLI = document.createElement('LI');
            this.parentLI.setAttribute('class', 'element');
            //this.parentLI.setAttribute('style', 'height: '+height+'px');
            
        };
        
        /*
            creates the iframe on the canvas
        */
        this.createFrame = function(frame) {
                        
            this.frame = document.createElement('IFRAME');
            this.frame.setAttribute('frameborder', 0);
            this.frame.setAttribute('scrolling', 0);
            this.frame.setAttribute('src', frame.src);
            this.frame.setAttribute('data-originalurl', frame.frames_original_url);
            this.originalUrl = frame.frames_original_url;
            //this.frame.setAttribute('data-height', frame.frames_height);
            this.frameHeight = frame.frames_height;
            //this.frame.setAttribute('style', 'background: '+"#ffffff url('"+appUI.baseUrl+"images/loading.gif') 50% 50% no-repeat");
                        
            $(this.frame).uniqueId();
            
            //sandbox?
            if( this.sandbox !== false ) {
                            
                this.frame.setAttribute('data-loaderfunction', this.sandbox_loader);
                this.frame.setAttribute('data-sandbox', this.sandbox);
                            
                //recreate the sandboxed iframe elsewhere
                var sandboxedFrame = $('<iframe src="'+frame.src+'" id="'+this.sandbox+'" sandbox="allow-same-origin"></iframe>');
                $('#sandboxes').append( sandboxedFrame );
                            
            }
                        
        };
            
        /*
            insert the iframe into the DOM on the canvas
        */
        this.insertBlockIntoDom = function(theUL) {
            
            this.parentLI.appendChild(this.frame);
            theUL.appendChild( this.parentLI );
            
            this.frame.addEventListener('load', this, false);
            
        };
            
        /*
            sets the frame document for the block's iframe
        */
        this.setFrameDocument = function() {
            
            //set the frame document as well
            if( this.frame.contentDocument ) {
                this.frameDocument = this.frame.contentDocument;   
            } else {
                this.frameDocument = this.frame.contentWindow.document;
            }
            
            this.heightAdjustment();
                                    
        };
        
        /*
            creates the frame cover and block action button
        */
        this.createFrameCover = function() {
            
            //build the frame cover and block action buttons
            this.frameCover = document.createElement('DIV');
            this.frameCover.classList.add('frameCover');
            this.frameCover.classList.add('fresh');
            this.frameCover.style.height = this.frameHeight+"px";
            var preloader = document.createElement('DIV');
            preloader.classList.add('preloader');
                    
            var delButton = document.createElement('BUTTON');
            delButton.setAttribute('class', 'btn btn-danger deleteBlock');
            delButton.setAttribute('type', 'button');
            delButton.innerHTML = '<span class="fui-trash"></span> remove';
            delButton.addEventListener('click', this, false);
                    
            var resetButton = document.createElement('BUTTON');
            resetButton.setAttribute('class', 'btn btn-warning resetBlock');
            resetButton.setAttribute('type', 'button');
            resetButton.innerHTML = '<i class="fa fa-refresh"></i> reset';
            resetButton.addEventListener('click', this, false);
                    
            var htmlButton = document.createElement('BUTTON');
            htmlButton.setAttribute('class', 'btn btn-inverse htmlBlock');
            htmlButton.setAttribute('type', 'button');
            htmlButton.innerHTML = '<i class="fa fa-code"></i> source';
            htmlButton.addEventListener('click', this, false);
                    
            this.frameCover.appendChild(delButton);
            this.frameCover.appendChild(resetButton);
            this.frameCover.appendChild(htmlButton);

            this.frameCover.appendChild(preloader);
                            
            this.parentLI.appendChild(this.frameCover);
                                                        
        };
            
        /*
            automatically corrects the height of the block's iframe depending on its content
        */
        this.heightAdjustment = function() {
            
            var pageContainer = this.frameDocument.body;
            var height = pageContainer.scrollHeight;

            var frameElementHeight = this.frameHeight;

            if (this.frameHeight) {
                this.frame.style.height = frameElementHeight+"px";
                this.parentLI.style.height = frameElementHeight+"px";
                this.frameCover.style.height = frameElementHeight+"px";
                this.frameHeight = frameElementHeight;
            }  else {
                this.frame.style.height = height+"px";
                this.parentLI.style.height = height+"px";
                this.frameCover.style.height = height+"px";
                this.frameHeight = height;
            }
                                                                                    
        };
            
        /*
            deletes a block
        */
        this.delete = function() {
                        
            //remove from DOM/canvas with a nice animation
            $(this.frame.parentNode).fadeOut(500, function(){
                    
                this.remove();
                    
                site.activePage.isEmpty();
                
            });
            
            //remove from blocks array in the active page
            site.activePage.deleteBlock(this);
            
            //sanbox
            if( this.sanbdox ) {
                document.getElementById( this.sandbox ).remove();   
            }
            
            //element was deleted, so we've got pending change
            site.setPendingChanges(true);
                        
        };
            
        /*
            resets a block to it's orignal state
        */
        this.reset = function() {
            
            //reset frame by reloading it
            this.frame.contentWindow.location.reload();
            
            //sandbox?
            if( this.sandbox ) {
                var sandboxFrame = document.getElementById(this.sandbox).contentWindow.location.reload();  
            }
            
            //element was deleted, so we've got pending changes
            site.setPendingChanges(true);
            
        };
            
        /*
            launches the source code editor
        */
        this.source = function() {
            
            //hide the iframe
            this.frame.style.display = 'none';
            
            //disable sortable on the parentLI
            $(this.parentLI.parentNode).sortable('disable');
            
            //built editor element
            var theEditor = document.createElement('DIV');
            theEditor.classList.add('aceEditor');
            $(theEditor).uniqueId();
            
            this.parentLI.appendChild(theEditor);
            
            //build and append error drawer
            var newLI = document.createElement('LI');
            var errorDrawer = document.createElement('DIV');
            errorDrawer.classList.add('errorDrawer');
            errorDrawer.setAttribute('id', 'div_errorDrawer');
            errorDrawer.innerHTML = '<button type="button" class="btn btn-xs btn-embossed btn-default button_clearErrorDrawer" id="button_clearErrorDrawer">CLEAR</button>';
            newLI.appendChild(errorDrawer);
            errorDrawer.querySelector('button').addEventListener('click', this, false);
            this.parentLI.parentNode.insertBefore(newLI, this.parentLI.nextSibling);
            
            
            var theId = theEditor.getAttribute('id');
            var editor = ace.edit( theId );
            
            var pageContainer = this.frameDocument.querySelector( bConfig.pageContainer );
            var theHTML = pageContainer.innerHTML;
            
            editor.setValue( theHTML );
            editor.setTheme("ace/theme/twilight");
            editor.getSession().setMode("ace/mode/html");
            
            var block = this;
            
            
            editor.getSession().on("changeAnnotation", function(){
                
                block.annot = editor.getSession().getAnnotations();
                
                clearTimeout(block.annotTimeout);

                var timeoutCount;
                
                if( $('#div_errorDrawer p').size() === 0 ) {
                    timeoutCount = bConfig.sourceCodeEditSyntaxDelay;
                } else {
                    timeoutCount = 100;
                }
                
                block.annotTimeout = setTimeout(function(){
                                                            
                    for (var key in block.annot){
                    
                        if (block.annot.hasOwnProperty(key)) {
                        
                            if( block.annot[key].text !== "Start tag seen without seeing a doctype first. Expected e.g. <!DOCTYPE html>." ) {
                            
                                var newLine = $('<p></p>');
                                var newKey = $('<b>'+block.annot[key].type+': </b>');
                                var newInfo = $('<span> '+block.annot[key].text + "on line " + " <b>" + block.annot[key].row+'</b></span>');
                                newLine.append( newKey );
                                newLine.append( newInfo );
                    
                                $('#div_errorDrawer').append( newLine );
                        
                            }
                    
                        }
                
                    }
                
                    if( $('#div_errorDrawer').css('display') === 'none' && $('#div_errorDrawer').find('p').size() > 0 ) {
                        $('#div_errorDrawer').slideDown();
                    }
                        
                }, timeoutCount);
                
            
            });
            
            //buttons
            var cancelButton = document.createElement('BUTTON');
            cancelButton.setAttribute('type', 'button');
            cancelButton.classList.add('btn');
            cancelButton.classList.add('btn-danger');
            cancelButton.classList.add('editCancelButton');
            cancelButton.classList.add('btn-wide');
            cancelButton.innerHTML = '<span class="fui-cross"></span> Cancel';
            cancelButton.addEventListener('click', this, false);
            
            var saveButton = document.createElement('BUTTON');
            saveButton.setAttribute('type', 'button');
            saveButton.classList.add('btn');
            saveButton.classList.add('btn-primary');
            saveButton.classList.add('editSaveButton');
            saveButton.classList.add('btn-wide');
            saveButton.innerHTML = '<span class="fui-check"></span> Save';
            saveButton.addEventListener('click', this, false);
            
            var buttonWrapper = document.createElement('DIV');
            buttonWrapper.classList.add('editorButtons');
            
            buttonWrapper.appendChild( cancelButton );
            buttonWrapper.appendChild( saveButton );
            
            this.parentLI.appendChild( buttonWrapper );
            
            builderUI.aceEditors[ theId ] = editor;
            
        };
            
        /*
            cancels the block source code editor
        */
        this.cancelSourceBlock = function() {

            //enable draggable on the LI
            $(this.parentLI.parentNode).sortable('enable');
		
            //delete the errorDrawer
            $(this.parentLI.nextSibling).remove();
        
            //delete the editor
            this.parentLI.querySelector('.aceEditor').remove();
            $(this.frame).fadeIn(500);
                        
            $(this.parentLI.querySelector('.editorButtons')).fadeOut(500, function(){
                $(this).remove();
            });
            
        };
            
        /*
            updates the blocks source code
        */
        this.saveSourceBlock = function() {
            
            //enable draggable on the LI
            $(this.parentLI.parentNode).sortable('enable');
            
            var theId = this.parentLI.querySelector('.aceEditor').getAttribute('id');
            var theContent = builderUI.aceEditors[theId].getValue();
            
            //delete the errorDrawer
            document.getElementById('div_errorDrawer').parentNode.remove();
            
            //delete the editor
            this.parentLI.querySelector('.aceEditor').remove();
            
            //update the frame's content
            this.frameDocument.querySelector( bConfig.pageContainer ).innerHTML = theContent;
            this.frame.style.display = 'block';
            
            //sandboxed?
            if( this.sandbox ) {
                
                var sandboxFrame = document.getElementById( this.sandbox );
                var sandboxFrameDocument = sandboxFrame.contentDocument || sandboxFrame.contentWindow.document;
                
                builderUI.tempFrame = sandboxFrame;
                
                sandboxFrameDocument.querySelector( bConfig.pageContainer ).innerHTML = theContent;
                                
                //do we need to execute a loader function?
                if( this.sandbox_loader !== '' ) {
                    
                    /*
                    var codeToExecute = "sandboxFrame.contentWindow."+this.sandbox_loader+"()";
                    var tmpFunc = new Function(codeToExecute);
                    tmpFunc();
                    */
                    
                }
                
            }
            
            $(this.parentLI.querySelector('.editorButtons')).fadeOut(500, function(){
                $(this).remove();
            });
            
            //adjust height of the frame
            this.heightAdjustment();
            
            //new page added, we've got pending changes
            site.setPendingChanges(true);
            
            //block has changed
            this.status = 'changed';

        };
            
        /*
            clears out the error drawer
        */
        this.clearErrorDrawer = function() {

            var ps = this.parentLI.nextSibling.querySelectorAll('p');
                        
            for( var i = 0; i < ps.length; i++ ) {
                ps[i].remove();  
            }
                        
        };
            
        /*
            toggles the visibility of this block's frameCover
        */
        this.toggleCover = function(onOrOff) {
            
            if( onOrOff === 'On' ) {
                
                this.parentLI.querySelector('.frameCover').style.display = 'block';
                
            } else if( onOrOff === 'Off' ) {
             
                this.parentLI.querySelector('.frameCover').style.display = 'none';
                
            }
            
        };
            
        /*
            returns the full source code of the block's frame
        */
        this.getSource = function() {
            
            var source = "<html>";
            source += this.frameDocument.head.outerHTML;
            source += this.frameDocument.body.outerHTML;
            
            return source;
            
        };
            
        /*
            places a dragged/dropped block from the left sidebar onto the canvas
        */
        this.placeOnCanvas = function(ui) {
            
            //frame data, we'll need this before messing with the item's content HTML
            var frameData = {}, attr;
                
            if( ui.item.find('iframe').size() > 0 ) {//iframe thumbnail
                    
                frameData.src = ui.item.find('iframe').attr('src');
                frameData.frames_original_url = ui.item.find('iframe').attr('src');
                frameData.frames_height = ui.item.height();
                    
                //sandboxed block?
                attr = ui.item.find('iframe').attr('sandbox');
                                
                if (typeof attr !== typeof undefined && attr !== false) {
                    this.sandbox = siteBuilderUtils.getRandomArbitrary(10000, 1000000000);
                    this.sandbox_loader = ui.item.find('iframe').attr('data-loaderfunction');
                }
                                        
            } else {//image thumbnail
                    
                frameData.src = ui.item.find('img').attr('data-srcc');
                frameData.frames_original_url = ui.item.find('img').attr('data-srcc');
                frameData.frames_height = ui.item.find('img').attr('data-height');
                                    
                //sandboxed block?
                attr = ui.item.find('img').attr('data-sandbox');
                                
                if (typeof attr !== typeof undefined && attr !== false) {
                    this.sandbox = siteBuilderUtils.getRandomArbitrary(10000, 1000000000);
                    this.sandbox_loader = ui.item.find('img').attr('data-loaderfunction');
                }
                    
            }                
                                
            //create the new block object
            this.frameID = 0;
            this.parentLI = ui.item.get(0);
            this.parentLI.innerHTML = '';
            this.status = 'new';
            this.createFrame(frameData);
            this.parentLI.style.height = this.frameHeight+"px";
            this.createFrameCover();
                
            this.frame.addEventListener('load', this);
                
            //insert the created iframe
            ui.item.append($(this.frame));
                                           
            //add the block to the current page
            site.activePage.blocks.splice(ui.item.index(), 0, this);
                
            //custom event
            ui.item.find('iframe').trigger('canvasupdated');
                                
            //dropped element, so we've got pending changes
            site.setPendingChanges(true);
            
        };
            
        
    }
    
    Block.prototype.handleEvent = function(event) {
        switch (event.type) {
            case "load": 
                this.setFrameDocument();
                this.heightAdjustment();
                
                $(this.frameCover).removeClass('fresh', 500);
                $(this.frameCover).find('.preloader').remove();

                break;
                
            case "click":
                
                var theBlock = this;
                
                //figure out what to do next
                
                if( event.target.classList.contains('deleteBlock') ) {//delete this block
                    
                    $(builderUI.modalDeleteBlock).modal('show');                    
                    
                    $(builderUI.modalDeleteBlock).off('click', '#deleteBlockConfirm').on('click', '#deleteBlockConfirm', function(){
                        theBlock.delete(event);
                        $(builderUI.modalDeleteBlock).modal('hide');
                    });
                    
                } else if( event.target.classList.contains('resetBlock') ) {//reset the block
                    
                    $(builderUI.modalResetBlock).modal('show'); 
                    
                    $(builderUI.modalResetBlock).off('click', '#resetBlockConfirm').on('click', '#resetBlockConfirm', function(){
                        theBlock.reset();
                        $(builderUI.modalResetBlock).modal('hide');
                    });
                       
                } else if( event.target.classList.contains('htmlBlock') ) {//source code editor
                    
                    theBlock.source();
                    
                } else if( event.target.classList.contains('editCancelButton') ) {//cancel source code editor
                    
                    theBlock.cancelSourceBlock();
                    
                } else if( event.target.classList.contains('editSaveButton') ) {//save source code
                    
                    theBlock.saveSourceBlock();
                    
                } else if( event.target.classList.contains('button_clearErrorDrawer') ) {//clear error drawer
                    
                    theBlock.clearErrorDrawer();
                    
                }
                
        }
    };


    /*
        Site object literal
    */
    /*jshint -W003 */
    var site = {
        
        pendingChanges: false,      //pending changes or no?
        pages: {},                  //array containing all pages, including the child frames, loaded from the server on page load
        is_admin: 0,                //0 for non-admin, 1 for admin
        data: {},                   //container for ajax loaded site data
        pagesToDelete: [],          //contains pages to be deleted
                
        sitePages: [],              //this is the only var containing the recent canvas contents
        
        sitePagesReadyForServer: {},     //contains the site data ready to be sent to the server
        
        activePage: {},             //holds a reference to the page currently open on the canvas
        
        pageTitle: document.getElementById('pageTitle'),//holds the page title of the current page on the canvas
        
        divCanvas: document.getElementById('pageList'),//DIV containing all pages on the canvas
        
        pagesMenu: document.getElementById('pages'), //UL containing the pages menu in the sidebar
                
        buttonNewPage: document.getElementById('addPage'),
        liNewPage: document.getElementById('newPageLI'),
        
        inputPageSettingsTitle: document.getElementById('pageData_title'),
        inputPageSettingsMetaDescription: document.getElementById('pageData_metaDescription'),
        inputPageSettingsMetaKeywords: document.getElementById('pageData_metaKeywords'),
        inputPageSettingsIncludes: document.getElementById('pageData_headerIncludes'),
        inputPageSettingsPageCss: document.getElementById('pageData_headerCss'),
        
        buttonSubmitPageSettings: document.getElementById('pageSettingsSubmittButton'),
        
        modalPageSettings: document.getElementById('pageSettingsModal'),
        
        buttonSave: document.getElementById('savePage'),
        
        messageStart: document.getElementById('start'),
        divFrameWrapper: document.getElementById('frameWrapper'),
        
        skeleton: document.getElementById('skeleton'),
		
		autoSaveTimer: {},
        
        init: function() {
                        
            $.getJSON(appUI.siteUrl+"sites/siteData", function(data){
                
                if( data.site !== undefined ) {
                    site.data = data.site;
                }
                if( data.pages !== undefined ) {
                    site.pages = data.pages;
                }
                
                site.is_admin = data.is_admin;
                
				if( $('#pageList').size() > 0 ) {
                	builderUI.populateCanvas();
				}
                
                //fire custom event
                $('body').trigger('siteDataLoaded');
                
            });
            
            $(this.buttonNewPage).on('click', site.newPage);
            $(this.modalPageSettings).on('show.bs.modal', site.loadPageSettings);
            $(this.buttonSubmitPageSettings).on('click', site.updatePageSettings);
            $(this.buttonSave).on('click', function(){site.save(true);});
            
            //auto save time 
            this.autoSaveTimer = setTimeout(site.autoSave, bConfig.autoSaveTimeout);
                            
        },
        
        autoSave: function(){
                                    
            if(site.pendingChanges) {
                site.save(false);
            }
			
			window.clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = setTimeout(site.autoSave, bConfig.autoSaveTimeout);
        
        },
                
        setPendingChanges: function(value) {
                        
            this.pendingChanges = value;
            
            if( value === true ) {
				
				//reset timer
				window.clearInterval(this.autoSaveTimer);
            	this.autoSaveTimer = setTimeout(site.autoSave, bConfig.autoSaveTimeout);
                
                $('#savePage .bLabel').text("Save*");
                
                if( site.activePage.status !== 'new' ) {
                
                    site.activePage.status = 'changed';
                    
                }
			
            } else {
	
                $('#savePage .bLabel').text("Save");
				
                site.updatePageStatus('');

            }
            
        },
                   
        save: function(showConfirmModal) {
                                    
            //fire custom event
            $('body').trigger('beforeSave');

            //disable button
            $("a#savePage").addClass('disabled');
	
            //remove old alerts
            $('#errorModal .modal-body > *, #successModal .modal-body > *').each(function(){
                $(this).remove();
            });
	
            site.prepForSave(false);
            
            var serverData = {};
            serverData.pages = this.sitePagesReadyForServer;
            if( this.pagesToDelete.length > 0 ) {
                serverData.toDelete = this.pagesToDelete;
            }
            serverData.siteData = this.data;

            $.ajax({
                url: appUI.siteUrl+"sites/save",
                type: "POST",
                dataType: "json",
                data: serverData,
            }).done(function(res){
	
                //enable button
                $("a#savePage").removeClass('disabled');
	
                if( res.responseCode === 0 ) {
			
                    if( showConfirmModal ) {
				
                        $('#errorModal .modal-body').append( $(res.responseHTML) );
                        $('#errorModal').modal('show');
				
                    }
		
                } else if( res.responseCode === 1 ) {
		
                    if( showConfirmModal ) {
		
                        $('#successModal .modal-body').append( $(res.responseHTML) );
                        $('#successModal').modal('show');
				
                    }
			
			
                    //no more pending changes
                    site.setPendingChanges(false);
			

                    //update revisions?
                    $('body').trigger('changePage');
                
                }
            });
    
        },
        
        /*
            preps the site data before sending it to the server
        */
        prepForSave: function(template) {
            
            this.sitePagesReadyForServer = {};
            
            if( template ) {//saving template, only the activePage is needed
                
                this.sitePagesReadyForServer[this.activePage.name] = this.activePage.prepForSave();
                
                this.activePage.fullPage();
                
            } else {//regular save
            
                //find the pages which need to be send to the server
                for( var i = 0; i < this.sitePages.length; i++ ) {
                                
                    if( this.sitePages[i].status !== '' ) {
                                    
                        this.sitePagesReadyForServer[this.sitePages[i].name] = this.sitePages[i].prepForSave();
                    
                    }
                
                }
            
            }
                                                                            
        },
        
        
        /*
            sets a page as the active one
        */
        setActive: function(page) {
            
            //reference to the active page
            this.activePage = page;
            
            //hide other pages
            for(var i in this.sitePages) {
                this.sitePages[i].parentUL.style.display = 'none';   
            }
            
            //display active one
            this.activePage.parentUL.style.display = 'block';
            
        },
        
        
        /*
            de-active all page menu items
        */
        deActivateAll: function() {
            
            var pages = this.pagesMenu.querySelectorAll('li');
            
            for( var i = 0; i < pages.length; i++ ) {
                pages[i].classList.remove('active');
            }
            
        },
        
        
        /*
            adds a new page to the site
        */
        newPage: function() {
            
            site.deActivateAll();
            
            //create the new page instance
            
            var pageData = [];
            var temp = {
                pages_id: 0
            };
            pageData[0] = temp;
            
            var newPageName = 'page'+(site.sitePages.length+1);
            
            var newPage = new Page(newPageName, pageData, site.sitePages.length+1);
            
            newPage.status = 'new';
            
            newPage.selectPage();
            newPage.editPageName();
        
            newPage.isEmpty();
                        
            site.setPendingChanges(true);
                                    
        },
        
        
        /*
            checks if the name of a page is allowed
        */
        checkPageName: function(pageName) {
            
            //make sure the name is unique
            for( var i in this.sitePages ) {
                
                if( this.sitePages[i].name === pageName && this.activePage !== this.sitePages[i] ) {
                    this.pageNameError = "The page name must be unique.";
                    return false;
                }   
                
            }
            
            return true;
            
        },
        
        
        /*
            removes unallowed characters from the page name
        */
        prepPageName: function(pageName) {
            
            pageName = pageName.replace(' ', '');
            pageName = pageName.replace(/[?*!.|&#;$%@"<>()+,]/g, "");
            
            return pageName;
            
        },
        
        
        /*
            save page settings for the current page
        */
        updatePageSettings: function() {
            
            site.activePage.pageSettings.title = site.inputPageSettingsTitle.value;
            site.activePage.pageSettings.meta_description = site.inputPageSettingsMetaDescription.value;
            site.activePage.pageSettings.meta_keywords = site.inputPageSettingsMetaKeywords.value;
            site.activePage.pageSettings.header_includes = site.inputPageSettingsIncludes.value;
            site.activePage.pageSettings.page_css = site.inputPageSettingsPageCss.value;
                        
            site.setPendingChanges(true);
            
            $(site.modalPageSettings).modal('hide');
            
        },
        
        
        /*
            update page statuses
        */
        updatePageStatus: function(status) {
            
            for( var i in this.sitePages ) {
                this.sitePages[i].status = status;   
            }
            
        }
    
    };

    builderUI.init(); site.init();

    
    //**** EXPORTS
    module.exports.site = site;
    module.exports.builderUI = builderUI;

}());
},{"./config.js":5,"./ui.js":8,"./utils.js":9}],4:[function(require,module,exports){
(function () {
    "use strict";

    var siteBuilder = require('./builder.js');

    /*
        constructor function for Element
    */
    module.exports.Element = function (el) {
                
        this.element = el;
        this.sandbox = false;
        this.parentFrame = {};
        this.parentBlock = {};//reference to the parent block element
        
        //make current element active/open (being worked on)
        this.setOpen = function() {
            
            $(this.element).off('mouseenter mouseleave click');
            
            if( $(this.element).closest('body').width() !== $(this.element).width() ) {
                                
                $(this.element).css({'outline': '3px dashed red', 'cursor': 'pointer'});
            
            } else {
                
                $(this.element).css({'outline': '3px dashed red', 'outline-offset':'-3px',  'cursor': 'pointer'});
            
            }
            
        };
        
        //sets up hover and click events, making the element active on the canvas
        this.activate = function() {
            
            var element = this;
            
            $(this.element).css({'outline': 'none', 'cursor': 'inherit'});
                                    
            $(this.element).on('mouseenter', function() {
                
                if( $(this).closest('body').width() !== $(this).width() ) {
                    
                    $(this).css({'outline': '3px dashed red', 'cursor': 'pointer'});
                            
                } else {
                    
                    $(this).css({'outline': '3px dashed red', 'outline-offset': '-3px', 'cursor': 'pointer'});
                
                }
            
            }).on('mouseleave', function() {
                
                $(this).css({'outline': '', 'cursor': '', 'outline-offset': ''});
            
            }).on('click', function(e) {
                                                                
                e.preventDefault();
                e.stopPropagation();
                
                element.clickHandler(this);
            
            });
            
        };
        
        this.deactivate = function() {
            
            $(this.element).off('mouseenter mouseleave click');
            $(this.element).css({'outline': 'none', 'cursor': 'inherit'});

        };
        
        //removes the elements outline
        this.removeOutline = function() {
            
            $(this.element).css({'outline': 'none', 'cursor': 'inherit'});
            
        };
        
        //sets the parent iframe
        this.setParentFrame = function() {
            
            var doc = this.element.ownerDocument;
            var w = doc.defaultView || doc.parentWindow;
            var frames = w.parent.document.getElementsByTagName('iframe');
            
            for (var i= frames.length; i-->0;) {
                
                var frame= frames[i];
                
                try {
                    var d= frame.contentDocument || frame.contentWindow.document;
                    if (d===doc)
                        this.parentFrame = frame;
                } catch(e) {}
            }
            
        };
        
        //sets this element's parent block reference
        this.setParentBlock = function() {
            
            //loop through all the blocks on the canvas
            for( var i = 0; i < siteBuilder.site.sitePages.length; i++ ) {
                                
                for( var x = 0; x < siteBuilder.site.sitePages[i].blocks.length; x++ ) {
                                        
                    //if the block's frame matches this element's parent frame
                    if( siteBuilder.site.sitePages[i].blocks[x].frame === this.parentFrame ) {
                        //create a reference to that block and store it in this.parentBlock
                        this.parentBlock = siteBuilder.site.sitePages[i].blocks[x];
                    }
                
                }
                
            }
                        
        };
        
        
        this.setParentFrame();
        
        /*
            is this block sandboxed?
        */
        
        if( this.parentFrame.getAttribute('data-sandbox') ) {
            this.sandbox = this.parentFrame.getAttribute('data-sandbox');   
        }
                
    };

}());
},{"./builder.js":3}],5:[function(require,module,exports){
(function () {
	"use strict";
        
    module.exports.pageContainer = "#page";
    
    module.exports.editableItems = {
            'h1': ['color', 'font-size', 'text-align', 'font-family', 'font-style', 'font-weight', 'text-transform'],
            'h2': ['color', 'font-size', 'text-align', 'font-family', 'font-style', 'font-weight', 'text-transform'],
            'h3': ['color', 'font-size', 'text-align', 'font-family', 'font-style', 'font-weight', 'text-transform'],
            'h4': ['color', 'font-size', 'text-align', 'font-family', 'font-style', 'font-weight', 'text-transform'],
            'h5': ['color', 'font-size', 'text-align', 'font-family', 'font-style', 'font-weight', 'text-transform'],
            'p': ['color', 'font-size', 'text-align', 'font-family', 'font-style', 'font-weight'],
            '.text':['color', 'font-size', 'text-align', 'font-family', 'font-style', 'font-weight'],
            'ul.text-list':['color', 'font-size', 'text-align', 'font-family', 'font-style', 'font-weight'],
            '.text-advanced':['color', 'background-color', 'font-size', 'text-align', 'font-family', 'font-style', 'font-weight', 'border-color', 'border-radius'],
            'img':['width','height', 'margin', 'padding', 'border-color', 'border-width', 'border-style', 'border-radius'],
            'svg':['width','height', 'margin', 'padding'],
            'span.fa, i.fa': ['color', 'font-size'],
            '.icon-advanced':['color', 'font-size', 'background-color'],
            '.icon-border':['color', 'font-size', 'padding-top', 'border-color'],
            '.link':['color', 'font-size', 'font-family', 'font-style', 'font-weight', 'text-decoration', 'border-bottom-color', 'border-bottom-width'],
            '.edit-link':['color', 'font-size', 'font-family', 'font-style', 'font-weight', 'text-decoration', 'border-bottom-color', 'border-bottom-width'],
            '.edit-tags':['color', 'font-size', 'font-family', 'font-style', 'font-weight', 'background-color', 'border-color', 'border-width', 'border-style'],
            'a.btn, button.btn':[ 'color', 'font-size', 'background-color', 'border-radius'],
            '.progress-style':['background-color', 'border-color', 'border-radius'],
            '.progress-inner-style':['width', 'background-color', 'border-radius'],
            '.progress-inner-advanced':['width', 'color', 'background-color', 'background-image', 'font-size', 'text-align', 'font-family', 'font-style', 'font-weight', 'line-height', 'border-radius'],
            '.color':['color', 'background-color', 'border-color'],
            '.just-color':['color'],
            '.help-color':['background-color', 'border-color'],
            '.help-color-advanced': ['background-color', 'border-color', 'border-radius'],
            '.bg':['background-image', 'background-color', 'background-size', 'background-position', 'background-repeat'],
            '.bg-color':['background-color'],
            '.bg-image':['background-image', 'background-size', 'background-position', 'background-repeat'],
            '.border':['border-color', 'border-width', 'border-style'],
            '.devider-edit, .devider-brand': ['height', 'background-color', 'border-color', 'border-top-width', 'border-bottom-width', 'border-style'],
            'nav a':['color', 'font-weight', 'text-transform'],
            'a.edit':['color', 'font-weight', 'text-transform'],
            '.footer a':['color'],
            //'.bg.bg1, .bg.bg2, .header10, .header11': ['background-image', 'background-color'],
            '.frameCover': []
    };
    
    module.exports.editableItemOptions = {
            'nav a : font-weight': ['400', '700'],
            'a.btn : border-radius': ['0px', '4px', '10px'],
            'img : border-style': ['none', 'dotted', 'dashed', 'solid'],
            'h1 : text-align': ['left', 'right', 'center', 'justify'],
            'h1 : font-weight': ['normal', 'bold'],
            'h1 : font-style': ['normal', 'italic'],
            'h1 : text-transform': ['none', 'uppercase', 'lowercase', 'capitalize'],
            'h2 : text-align': ['left', 'right', 'center', 'justify'],
            'h2 : font-weight': ['normal', 'bold'],
            'h2 : font-style': ['normal', 'italic'],
            'h2 : text-transform': ['none', 'uppercase', 'lowercase', 'capitalize'],
            'h3 : text-align': ['left', 'right', 'center', 'justify'],
            'h3 : font-weight': ['normal', 'bold'],
            'h3 : font-style': ['normal', 'italic'],
            'h3 : text-transform': ['none', 'uppercase', 'lowercase', 'capitalize'],
            'h4 : text-align': ['left', 'right', 'center', 'justify'],
            'h4 : font-weight': ['normal', 'bold'],
            'h4 : font-style': ['normal', 'italic'],
            'h4 : text-transform': ['none', 'uppercase', 'lowercase', 'capitalize'],
            'h5 : text-align': ['left', 'right', 'center', 'justify'],
            'h5 : font-weight': ['normal', 'bold'],
            'h5 : font-style': ['normal', 'italic'],
            'h5 : text-transform': ['none', 'uppercase', 'lowercase', 'capitalize'],
            'p : text-align': ['left', 'right', 'center', 'justify'],
            'p : font-weight': ['normal', 'bold'],
            'p : font-style': ['normal', 'italic'],
            '.text : text-align': ['left', 'right', 'center', 'justify'],
            '.text : font-weight': ['normal', 'bold'],
            '.text : font-style': ['normal', 'italic'],
            '.text-advanced : text-align': ['left', 'right', 'center', 'justify'],
            '.text-advanced : font-weight': ['normal', 'bold'],
            '.text-advanced : font-style': ['normal', 'italic'],
            'ul.text-list : text-align': ['left', 'right', 'center', 'justify'],
            'ul.text-list : font-weight': ['normal', 'bold'],
            'ul.text-list : font-style': ['normal', 'italic'],
            '.link : font-weight': ['normal', 'bold'],
            '.link : font-style': ['normal', 'italic'],
            '.edit-link : font-weight': ['normal', 'bold'],
            '.edit-link : font-style': ['normal', 'italic'],
            '.edit-tags : font-weight': ['normal', 'bold'],
            '.edit-tags : font-style': ['normal', 'italic'],
            'nav a : text-transform': ['none', 'uppercase', 'lowercase', 'capitalize']
    };

    module.exports.editableContent = ['.editContent', '.navbar a', 'button', 'a.btn', '.footer a:not(.fa)', '.tableWrapper', 'h1'];

    module.exports.autoSaveTimeout = 60000;
    
    module.exports.sourceCodeEditSyntaxDelay = 10000;
                    
}());
},{}],6:[function(require,module,exports){
(function (){
	"use strict";

    var bConfig = require('./config.js');
    var siteBuilder = require('./builder.js');
    var editor = require('./styleeditor.js').styleeditor;
    var appUI = require('./ui.js').appUI;

    var imageLibrary = {
        
        imageModal: document.getElementById('imageModal'),
        inputImageUpload: document.getElementById('imageFile'),
        buttonUploadImage: document.getElementById('uploadImageButton'),
        imageLibraryLinks: document.querySelectorAll('.images > .image .buttons .btn-primary, .images .imageWrap > a'),//used in the library, outside the builder UI
        myImages: document.getElementById('myImages'),//used in the image library, outside the builder UI
    
        init: function(){
            
            $(this.imageModal).on('show.bs.modal', this.imageLibrary);
            $(this.inputImageUpload).on('change', this.imageInputChange);
            $(this.buttonUploadImage).on('click', this.uploadImage);
            $(this.imageLibraryLinks).on('click', this.imageInModal);
            $(this.myImages).on('click', '.buttons .btn-danger', this.deleteImage);
            
        },
        
        
        /*
            image library modal
        */
        imageLibrary: function() {
                        			
            $('#imageModal').off('click', '.image button.useImage');
			
            $('#imageModal').on('click', '.image button.useImage', function(){
                
                //update live image
                $(editor.activeElement.element).attr('src', $(this).attr('data-url'));

                //update image URL field
                $('input#imageURL').val( $(this).attr('data-url') );
				
                //hide modal
                $('#imageModal').modal('hide');
				
                //height adjustment of the iframe heightAdjustment
				editor.activeElement.parentBlock.heightAdjustment();							
				
                //we've got pending changes
                siteBuilder.site.setPendingChanges(true);
			
                $(this).unbind('click');
            
            });
            
        },
        
        
        /*
            image upload input chaneg event handler
        */
        imageInputChange: function() {
            
            if( $(this).val() === '' ) {
                //no file, disable submit button
                $('button#uploadImageButton').addClass('disabled');
            } else {
                //got a file, enable button
                $('button#uploadImageButton').removeClass('disabled');
            }
            
        },
        
        
        /*
            upload an image to the image library
        */
        uploadImage: function() {
            
            if( $('input#imageFile').val() !== '' ) {
                
                //remove old alerts
                $('#imageModal .modal-alerts > *').remove();
                
                //disable button
                $('button#uploadImageButton').addClass('disable');

                //show loader
                $('#imageModal .loader').fadeIn(500);
                
                var form = $('form#imageUploadForm');
                var formdata = false;

                if (window.FormData){
                    formdata = new FormData(form[0]);
                }
                
                var formAction = form.attr('action');
                
                $.ajax({
                    url : formAction,
                    data : formdata ? formdata : form.serialize(),
                    cache : false,
                    contentType : false,
                    processData : false,
                    dataType: "json",
                    type : 'POST'
                }).done(function(ret){
                    
                    //enable button
                    $('button#uploadImageButton').addClass('disable');
                    
                    //hide loader
                    $('#imageModal .loader').fadeOut(500);
                    
                    if( ret.responseCode === 0 ) {//error
                        
                        $('#imageModal .modal-alerts').append( $(ret.responseHTML) );
			
                    } else if( ret.responseCode === 1 ) {//success
                        
                        //append my image
                        $('#myImagesTab > *').remove();
                        $('#myImagesTab').append( $(ret.myImages) );
                        $('#imageModal .modal-alerts').append( $(ret.responseHTML) );
                        
                        setTimeout(function(){$('#imageModal .modal-alerts > *').fadeOut(500);}, 3000);
                    
                    }
                
                });
            
            } else {

                alert('No image selected');
            
            }
            
        },
        
        
        /*
            displays image in modal
        */
        imageInModal: function(e) {
            
            e.preventDefault();
    		
    		var theSrc = $(this).closest('.image').find('img').attr('src');
    		
    		$('img#thePic').attr('src', theSrc);
    		
    		$('#viewPic').modal('show');
            
        },
        
        
        /*
            deletes an image from the library
        */
        deleteImage: function(e) {
            
            e.preventDefault();
    		
    		var toDel = $(this).closest('.image');
    		var theURL = $(this).attr('data-img');
    		
    		$('#deleteImageModal').modal('show');
    		
    		$('button#deleteImageButton').click(function(){
    		
    			$(this).addClass('disabled');
    			
    			var theButton = $(this);
    		
    			$.ajax({
                    url: appUI.siteUrl+"assets/delImage",
    				data: {file: theURL},
    				type: 'post'
    			}).done(function(){
    			
    				theButton.removeClass('disabled');
    				
    				$('#deleteImageModal').modal('hide');
    				
    				toDel.fadeOut(800, function(){
    									
    					$(this).remove();
    										
    				});
    			
    			});
    		
    		
    		});
            
        }
        
    };
    
    imageLibrary.init();

}());
},{"./builder.js":3,"./config.js":5,"./styleeditor.js":7,"./ui.js":8}],7:[function(require,module,exports){
(function (){
	"use strict";

	var canvasElement = require('./canvasElement.js').Element;
	var bConfig = require('./config.js');
	var siteBuilder = require('./builder.js');

    var styleeditor = {

        radioStyle: document.getElementById('modeStyle'),
        labelStyleMode: document.getElementById('modeStyleLabel'),
        buttonSaveChanges: document.getElementById('saveStyling'),
        activeElement: {}, //holds the element currenty being edited
        allStyleItemsOnCanvas: [],
        _oldIcon: [],
        styleEditor: document.getElementById('styleEditor'),
        formStyle: document.getElementById('stylingForm'),
        buttonRemoveElement: document.getElementById('deleteElementConfirm'),
        buttonCloneElement: document.getElementById('cloneElementButton'),
        buttonResetElement: document.getElementById('resetStyleButton'),
        selectLinksInernal: document.getElementById('internalLinksDropdown'),
        selectLinksPages: document.getElementById('pageLinksDropdown'),
        videoInputYoutube: document.getElementById('youtubeID'),
        videoInputVimeo: document.getElementById('vimeoID'),
        inputCustomLink: document.getElementById('internalLinksCustom'),
        selectIcons: document.getElementById('icons'),
        buttonDetailsAppliedHide: document.getElementById('detailsAppliedMessageHide'),
        buttonCloseStyleEditor: document.querySelector('#styleEditor > a.close'),
        ulPageList: document.getElementById('pageList'),

        init: function() {

            //events
            $(this.radioStyle).on('click', this.activateStyleMode);
            $(this.buttonSaveChanges).on('click', this.updateStyling);
            $(this.formStyle).on('focus', 'input', this.animateStyleInputIn).on('blur', 'input', this.animateStyleInputOut);
            $(this.buttonRemoveElement).on('click', this.deleteElement);
            $(this.buttonCloneElement).on('click', this.cloneElement);
            $(this.buttonResetElement).on('click', this.resetElement);
            $(this.selectLinksInernal).on('change', this.resetSelectLinksInternal);
            $(this.selectLinksPages).on('change', this.resetSelectLinksPages);
            $(this.videoInputYoutube).on('focus', function(){ $(styleeditor.videoInputVimeo).val(''); });
            $(this.videoInputVimeo).on('focus', function(){ $(styleeditor.videoInputYoutube).val(''); });
            $(this.inputCustomLink).on('focus', this.resetSelectAllLinks);
            $(this.buttonDetailsAppliedHide).on('click', function(){$(this).parent().fadeOut(500);});
            $(this.buttonCloseStyleEditor).on('click', this.closeStyleEditor);
            $(document).on('modeContent modeBlocks', 'body', this.deActivateMode);

            //chosen font-awesome dropdown
            $(this.selectIcons).chosen({'search_contains': true});

            //check if formData is supported
            if (!window.FormData){
                this.hideFileUploads();
            }

            //show the style mode radio button
            $(this.labelStyleMode).show();

            //listen for the beforeSave event
            $('body').on('beforeSave', this.closeStyleEditor);

        },


        /*
            Activates style editor mode
        */
        activateStyleMode: function() {

            var i;

            //Element object extention
            canvasElement.prototype.clickHandler = function(el) {
                styleeditor.styleClick(el);
            };

            // Remove overlay span from portfolio
            for(i = 1; i <= $("ul#page1 li").length; i++){
                var id = "#ui-id-" + i;
                $(id).contents().find(".overlay").remove();
            }


            //trigger custom event
            $('body').trigger('modeDetails');

            //disable frameCovers
            for( i = 0; i < siteBuilder.site.sitePages.length; i++ ) {
                siteBuilder.site.sitePages[i].toggleFrameCovers('Off');
            }

            //create an object for every editable element on the canvas and setup it's events

            for( i = 0; i < siteBuilder.site.sitePages.length; i++ ) {

                for( var x = 0; x < siteBuilder.site.sitePages[i].blocks.length; x++ ) {

                    for( var key in bConfig.editableItems ) {

                        $(siteBuilder.site.sitePages[i].blocks[x].frame).contents().find( bConfig.pageContainer + ' '+ key ).each(function(){

                            var newElement = new canvasElement(this);

                            newElement.activate();

                            styleeditor.allStyleItemsOnCanvas.push( newElement );

                            $(this).attr('data-selector', key);

                        });

                    }

                }

            }

            /*$('#pageList ul li iframe').each(function(){

                for( var key in bConfig.editableItems ) {

                    $(this).contents().find( bConfig.pageContainer + ' '+ key ).each(function(){

                        var newElement = new canvasElement(this);

                        newElement.activate();

                        styleeditor.allStyleItemsOnCanvas.push( newElement );

                        $(this).attr('data-selector', key);

                    });

                }

            });*/

        },


        /*
            Event handler for when the style editor is envoked on an item
        */
        styleClick: function(el) {

            //if we have an active element, make it unactive
            if( Object.keys(this.activeElement).length !== 0) {
                this.activeElement.activate();
            }

            //set the active element
            var activeElement = new canvasElement(el);
            activeElement.setParentBlock();
            this.activeElement = activeElement;

            //unbind hover and click events and make this item active
            this.activeElement.setOpen();

            var theSelector = $(this.activeElement.element).attr('data-selector');

            $('#editingElement').text( theSelector );

            //activate first tab
            $('#detailTabs a:first').click();

            //hide all by default
            $('ul#detailTabs li:gt(0)').hide();

            //what are we dealing with?
            if( $(this.activeElement.element).prop('tagName') === 'A' || $(this.activeElement.element).parent().prop('tagName') === 'A' ) {

                this.editLink(this.activeElement.element);

            }

			if( $(this.activeElement.element).prop('tagName') === 'IMG' ){

                this.editImage(this.activeElement.element);

            }

			if( $(this.activeElement.element).attr('data-type') === 'video' ) {

                this.editVideo(this.activeElement.element);

            }

			if( $(this.activeElement.element).hasClass('fa') ) {

                this.editIcon(this.activeElement.element);

            }

            //load the attributes
            this.buildeStyleElements(theSelector);

            //open side panel
            this.toggleSidePanel('open');
        },


        /*
            dynamically generates the form fields for editing an elements style attributes
        */
        buildeStyleElements: function(theSelector) {

            //delete the old ones first
            $('#styleElements > *:not(#styleElTemplate)').each(function(){

                $(this).remove();

            });

            for( var x=0; x<bConfig.editableItems[theSelector].length; x++ ) {

                //create style elements
                var newStyleEl = $('#styleElTemplate').clone();
                newStyleEl.attr('id', '');
                newStyleEl.find('.control-label').text( bConfig.editableItems[theSelector][x]+":" );

                if( theSelector + " : " + bConfig.editableItems[theSelector][x] in bConfig.editableItemOptions) {//we've got a dropdown instead of open text input

                    newStyleEl.find('input').remove();

                    var newDropDown = $('<select class="form-control select select-primary btn-block select-sm"></select>');
                    newDropDown.attr('name', bConfig.editableItems[theSelector][x]);


                    for( var z=0; z<bConfig.editableItemOptions[ theSelector+" : "+bConfig.editableItems[theSelector][x] ].length; z++ ) {

                        var newOption = $('<option value="'+bConfig.editableItemOptions[theSelector+" : "+bConfig.editableItems[theSelector][x]][z]+'">'+bConfig.editableItemOptions[theSelector+" : "+bConfig.editableItems[theSelector][x]][z]+'</option>');


                        if( bConfig.editableItemOptions[theSelector+" : "+bConfig.editableItems[theSelector][x]][z] === $(styleeditor.activeElement.element).css( bConfig.editableItems[theSelector][x] ) ) {
                            //current value, marked as selected
                            newOption.attr('selected', 'true');

                        }

                        newDropDown.append( newOption );

                    }

                    newStyleEl.append( newDropDown );
                    newDropDown.select2();

                } else {

                    newStyleEl.find('input').val( $(styleeditor.activeElement.element).css( bConfig.editableItems[theSelector][x] ) ).attr('name', bConfig.editableItems[theSelector][x]);

                    if( bConfig.editableItems[theSelector][x] === 'background-image' ) {

                        newStyleEl.find('input').bind('focus', function(){

                            var theInput = $(this);

                            $('#imageModal').modal('show');
                            $('#imageModal .image button.useImage').unbind('click');
                            $('#imageModal').on('click', '.image button.useImage', function(){

                                $(styleeditor.activeElement.element).css('background-image',  'url("'+$(this).attr('data-url')+'")');

                                //update live image
                                theInput.val( 'url("'+$(this).attr('data-url')+'")' );

                                //hide modal
                                $('#imageModal').modal('hide');

                                //we've got pending changes
                                siteBuilder.site.setPendingChanges(true);

                            });

                        });

                    } else if( bConfig.editableItems[theSelector][x].indexOf("color") > -1 ) {

                        if( $(styleeditor.activeElement.element).css( bConfig.editableItems[theSelector][x] ) !== 'transparent' && $(styleeditor.activeElement.element).css( bConfig.editableItems[theSelector][x] ) !== 'none' && $(styleeditor.activeElement.element).css( bConfig.editableItems[theSelector][x] ) !== '' ) {

                            newStyleEl.val( $(styleeditor.activeElement.element).css( bConfig.editableItems[theSelector][x] ) );

                        }

                        newStyleEl.find('input').spectrum({
                            preferredFormat: "hex",
                            showPalette: true,
                            allowEmpty: true,
                            showInput: true,
                            palette: [
                                ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
                                ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
                                ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
                                ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
                                ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
                                ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
                                ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
                                ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
                            ]
                        });

                    }

                }

                newStyleEl.css('display', 'block');

                $('#styleElements').append( newStyleEl );

                $('#styleEditor form#stylingForm').height('auto');

            }

        },


        /*
            Applies updated styling to the canvas
        */
        updateStyling: function() {

            var elementID;

            $('#styleEditor #tab1 .form-group:not(#styleElTemplate) input, #styleEditor #tab1 .form-group:not(#styleElTemplate) select').each(function(){

				if( $(this).attr('name') !== undefined ) {

                	$(styleeditor.activeElement.element).css( $(this).attr('name'),  $(this).val());

				}

                /* SANDBOX */

                if( styleeditor.activeElement.sandbox ) {

                    elementID = $(styleeditor.activeElement.element).attr('id');

                    $('#'+styleeditor.activeElement.sandbox).contents().find('#'+elementID).css( $(this).attr('name'),  $(this).val() );

                }

                /* END SANDBOX */

            });

            //links
            if( $(styleeditor.activeElement.element).prop('tagName') === 'A' ) {

                //change the href prop?
                if( $('select#internalLinksDropdown').val() !== '#' ) {

                    $(styleeditor.activeElement.element).attr('href', $('select#internalLinksDropdown').val());

                } else if( $('select#pageLinksDropdown').val() !== '#' ) {

                    $(styleeditor.activeElement.element).attr('href', $('select#pageLinksDropdown').val() );

                } else if( $('input#internalLinksCustom').val() !== '' ) {

                    $(styleeditor.activeElement.element).attr('href', $('input#internalLinksCustom').val());

                }

                /* SANDBOX */

                if( styleeditor.activeElement.sandbox ) {

                    elementID = $(styleeditor.activeElement.element).attr('id');

                    if( $('select#internalLinksDropdown').val() !== '#' ) {

                        $('#'+styleeditor.activeElement.sandbox).contents().find('#'+elementID).attr('href', $('select#internalLinksDropdown').val());

                    } else if( $('select#pageLinksDropdown').val() !== '#' ) {

                        $('#'+styleeditor.activeElement.sandbox).contents().find('#'+elementID).attr('href', $('select#pageLinksDropdown').val() );

                    } else if( $('input#internalLinksCustom').val() !== '' ) {

                        $('#'+styleeditor.activeElement.sandbox).contents().find('#'+elementID).attr('href', $('input#internalLinksCustom').val());

                    }

                }

                /* END SANDBOX */

            }

            if( $(styleeditor.activeElement.element).parent().prop('tagName') === 'A' ) {

                //change the href prop?
				if( $('select#internalLinksDropdown').val() !== '#' ) {

                    $(styleeditor.activeElement.element).parent().attr('href', $('select#internalLinksDropdown').val());

                } else if( $('select#pageLinksDropdown').val() !== '#' ) {

                    $(styleeditor.activeElement.element).parent().attr('href', $('select#pageLinksDropdown').val() );

                } else if( $('input#internalLinksCustom').val() !== '' ) {

                    $(styleeditor.activeElement.element).parent().attr('href', $('input#internalLinksCustom').val());

                }

                /* SANDBOX */

                if( styleeditor.activeElement.sandbox ) {

                    elementID = $(styleeditor.activeElement.element).attr('id');

                    if( $('select#internalLinksDropdown').val() !== '#' ) {

                        $('#'+styleeditor.activeElement.sandbox).contents().find('#'+elementID).parent().attr('href', $('select#internalLinksDropdown').val());

                    } else if( $('select#pageLinksDropdown').val() !== '#' ) {

                        $('#'+styleeditor.activeElement.sandbox).contents().find('#'+elementID).parent().attr('href', $('select#pageLinksDropdown').val() );

                    } else if( $('input#internalLinksCustom').val() !== '' ) {

                        $('#'+styleeditor.activeElement.sandbox).contents().find('#'+elementID).parent().attr('href', $('input#internalLinksCustom').val());

                    }

                }

                /* END SANDBOX */

            }

            //icons
            if( $(styleeditor.activeElement.element).hasClass('fa') ) {

                //out with the old, in with the new :)
                //get icon class name, starting with fa-
                var get = $.grep(styleeditor.activeElement.element.className.split(" "), function(v, i){

                    return v.indexOf('fa-') === 0;

                }).join();

                //if the icons is being changed, save the old one so we can reset it if needed

                if( get !== $('select#icons').val() ) {

                    $(styleeditor.activeElement.element).uniqueId();
                    styleeditor._oldIcon[$(styleeditor.activeElement.element).attr('id')] = get;

                }

                $(styleeditor.activeElement.element).removeClass( get ).addClass( $('select#icons').val() );


                /* SANDBOX */

                if( styleeditor.activeElement.sandbox ) {

                    elementID = $(styleeditor.activeElement.element).attr('id');
                    $('#'+styleeditor.activeElement.sandbox).contents().find('#'+elementID).removeClass( get ).addClass( $('select#icons').val() );

                }

                /* END SANDBOX */

            }

            //video URL
            if( $(styleeditor.activeElement.element).attr('data-type') === 'video' ) {

                if( $('input#youtubeID').val() !== '' ) {

                    $(styleeditor.activeElement.element).prev().attr('src', "//www.youtube.com/embed/"+$('#video_Tab input#youtubeID').val());

                } else if( $('input#vimeoID').val() !== '' ) {

                    $(styleeditor.activeElement.element).prev().attr('src', "//player.vimeo.com/video/"+$('#video_Tab input#vimeoID').val()+"?title=0&amp;byline=0&amp;portrait=0");

                }

                /* SANDBOX */

                if( styleeditor.activeElement.sandbox ) {

                    elementID = $(styleeditor.activeElement.element).attr('id');

                    if( $('input#youtubeID').val() !== '' ) {

                        $('#'+styleeditor.activeElement.sandbox).contents().find('#'+elementID).prev().attr('src', "//www.youtube.com/embed/"+$('#video_Tab input#youtubeID').val());

                    } else if( $('input#vimeoID').val() !== '' ) {

                        $('#'+styleeditor.activeElement.sandbox).contents().find('#'+elementID).prev().attr('src', "//player.vimeo.com/video/"+$('#video_Tab input#vimeoID').val()+"?title=0&amp;byline=0&amp;portrait=0");

                    }

                }

                /* END SANDBOX */

            }

            $('#detailsAppliedMessage').fadeIn(600, function(){

                setTimeout(function(){ $('#detailsAppliedMessage').fadeOut(1000); }, 3000);

            });

            //adjust frame height
            styleeditor.activeElement.parentBlock.heightAdjustment();


            //we've got pending changes
            siteBuilder.site.setPendingChanges(true);

        },


        /*
            on focus, we'll make the input fields wider
        */
        animateStyleInputIn: function() {

            $(this).css('position', 'absolute');
            $(this).css('right', '0px');
            $(this).animate({'width': '100%'}, 500);
            $(this).focus(function(){
                this.select();
            });

        },


        /*
            on blur, we'll revert the input fields to their original size
        */
        animateStyleInputOut: function() {

            $(this).animate({'width': '42%'}, 500, function(){
                $(this).css('position', 'relative');
                $(this).css('right', 'auto');
            });

        },


        /*
            when the clicked element is an anchor tag (or has a parent anchor tag)
        */
        editLink: function(el) {

            $('a#link_Link').parent().show();

            var theHref;

            if( $(el).prop('tagName') === 'A' ) {

                theHref = $(el).attr('href');

            } else if( $(el).parent().prop('tagName') === 'A' ) {

                theHref = $(el).parent().attr('href');

            }

            var zIndex = 0;

            var pageLink = false;

            //the actual select

            $('select#internalLinksDropdown').prop('selectedIndex', 0);

            //set the correct item to "selected"
            $('select#internalLinksDropdown option').each(function(){

                if( $(this).attr('value') === theHref ) {

                    $(this).attr('selected', true);

                    zIndex = $(this).index();

                    pageLink = true;

                }

            });


            //the pretty dropdown
            $('.link_Tab .btn-group.select .dropdown-menu li').removeClass('selected');
            $('.link_Tab .btn-group.select .dropdown-menu li:eq('+zIndex+')').addClass('selected');
            $('.link_Tab .btn-group.select:eq(0) .filter-option').text( $('select#internalLinksDropdown option:selected').text() );
            $('.link_Tab .btn-group.select:eq(1) .filter-option').text( $('select#pageLinksDropdown option:selected').text() );

            if( pageLink === true ) {

                $('input#internalLinksCustom').val('');

            } else {

                if( $(el).prop('tagName') === 'A' ) {

                    if( $(el).attr('href')[0] !== '#' ) {
                        $('input#internalLinksCustom').val( $(el).attr('href') );
                    } else {
                        $('input#internalLinksCustom').val( '' );
                    }

                } else if( $(el).parent().prop('tagName') === 'A' ) {

                    if( $(el).parent().attr('href')[0] !== '#' ) {
                        $('input#internalLinksCustom').val( $(el).parent().attr('href') );
                    } else {
                        $('input#internalLinksCustom').val( '' );
                    }

                }

            }

            //list available blocks on this page, remove old ones first

            $('select#pageLinksDropdown option:not(:first)').remove();
            $('#pageList ul:visible iframe').each(function(){

                if( $(this).contents().find( bConfig.pageContainer + " > *:first" ).attr('id') !== undefined ) {

                    var newOption;

                    if( $(el).attr('href') === '#'+$(this).contents().find( bConfig.pageContainer + " > *:first" ).attr('id') ) {

                        newOption = '<option selected value=#'+$(this).contents().find( bConfig.pageContainer + " > *:first" ).attr('id')+'>#'+$(this).contents().find( bConfig.pageContainer + " > *:first" ).attr('id')+'</option>';

                    } else {

                        newOption = '<option value=#'+$(this).contents().find( bConfig.pageContainer + " > *:first" ).attr('id')+'>#'+$(this).contents().find( bConfig.pageContainer + " > *:first" ).attr('id')+'</option>';

                    }

                    $('select#pageLinksDropdown').append( newOption );

                }

            });

            //if there aren't any blocks to list, hide the dropdown

            if( $('select#pageLinksDropdown option').size() === 1 ) {

                $('select#pageLinksDropdown').next().hide();
                $('select#pageLinksDropdown').next().next().hide();

            } else {

                $('select#pageLinksDropdown').next().show();
                $('select#pageLinksDropdown').next().next().show();

            }

        },


        /*
            when the clicked element is an image
        */
        editImage: function(el) {

            $('a#img_Link').parent().show();

            //set the current SRC
            $('.imageFileTab').find('input#imageURL').val( $(el).attr('src') );

            //reset the file upload
            $('.imageFileTab').find('a.fileinput-exists').click();

        },


        /*
            when the clicked element is a video element
        */
        editVideo: function(el) {

            var matchResults;

            $('a#video_Link').parent().show();
            $('a#video_Link').click();

            //inject current video ID,check if we're dealing with Youtube or Vimeo

            if( $(el).prev().attr('src').indexOf("vimeo.com") > -1 ) {//vimeo

                matchResults = $(el).prev().attr('src').match(/player\.vimeo\.com\/video\/([0-9]*)/);

                $('#video_Tab input#vimeoID').val( matchResults[matchResults.length-1] );
                $('#video_Tab input#youtubeID').val('');

            } else {//youtube

                //temp = $(el).prev().attr('src').split('/');
                var regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
                matchResults = $(el).prev().attr('src').match(regExp);

                $('#video_Tab input#youtubeID').val( matchResults[1] );
                $('#video_Tab input#vimeoID').val('');

            }

        },


        /*
            when the clicked element is an fa icon
        */
        editIcon: function() {

            $('a#icon_Link').parent().show();

            //get icon class name, starting with fa-
            var get = $.grep(this.activeElement.element.className.split(" "), function(v, i){

                return v.indexOf('fa-') === 0;

            }).join();

            $('select#icons option').each(function(){

                if( $(this).val() === get ) {

                    $(this).attr('selected', true);

                    $('#icons').trigger('chosen:updated');

                }

            });

        },


        /*
            delete selected element
        */
        deleteElement: function() {

            var toDel;

            //determine what to delete
            if( $(styleeditor.activeElement.element).prop('tagName') === 'A' ) {//ancor

                if( $(styleeditor.activeElement.element).parent().prop('tagName') ==='LI' ) {//clone the LI

                    toDel = $(styleeditor.activeElement.element).parent();

                } else {

                    toDel = $(styleeditor.activeElement.element);

                }

            } else if( $(styleeditor.activeElement.element).prop('tagName') === 'IMG' ) {//image

                if( $(styleeditor.activeElement.element).parent().prop('tagName') === 'A' ) {//clone the A

                    toDel = $(styleeditor.activeElement.element).parent();

                } else {

                    toDel = $(styleeditor.activeElement.element);

                }

            } else {//everything else

                toDel = $(styleeditor.activeElement.element);

            }


            toDel.fadeOut(500, function(){

                var randomEl = $(this).closest('body').find('*:first');

                toDel.remove();

                /* SANDBOX */

                var elementID = $(styleeditor.activeElement.element).attr('id');

                $('#'+styleeditor.activeElement.sandbox).contents().find('#'+elementID).remove();

                /* END SANDBOX */

                styleeditor.activeElement.parentBlock.heightAdjustment();

                //we've got pending changes
                siteBuilder.site.setPendingChanges(true);

            });

            $('#deleteElement').modal('hide');

            styleeditor.closeStyleEditor();

        },


        /*
            clones the selected element
        */
        cloneElement: function() {

            var theClone, theClone2, theOne, cloned, cloneParent, elementID;

            if( $(styleeditor.activeElement.element).parent().hasClass('propClone') ) {//clone the parent element

                theClone = $(styleeditor.activeElement.element).parent().clone();
                theClone.find( $(styleeditor.activeElement.element).prop('tagName') ).attr('style', '');

                theClone2 = $(styleeditor.activeElement.element).parent().clone();
                theClone2.find( $(styleeditor.activeElement.element).prop('tagName') ).attr('style', '');

                theOne = theClone.find( $(styleeditor.activeElement.element).prop('tagName') );
                cloned = $(styleeditor.activeElement.element).parent();

                cloneParent = $(styleeditor.activeElement.element).parent().parent();

            } else {//clone the element itself

                theClone = $(styleeditor.activeElement.element).clone();

                theClone.attr('style', '');

                /*if( styleeditor.activeElement.sandbox ) {
                    theClone.attr('id', '').uniqueId();
                }*/

                theClone2 = $(styleeditor.activeElement.element).clone();
                theClone2.attr('style', '');

                /*
                if( styleeditor.activeElement.sandbox ) {
                    theClone2.attr('id', theClone.attr('id'));
                }*/

                theOne = theClone;
                cloned = $(styleeditor.activeElement.element);

                cloneParent = $(styleeditor.activeElement.element).parent();

            }

            cloned.after( theClone );

            /* SANDBOX */

            if( styleeditor.activeElement.sandbox ) {

                elementID = $(styleeditor.activeElement.element).attr('id');
                $('#'+styleeditor.activeElement.sandbox).contents().find('#'+elementID).after( theClone2 );

            }

            /* END SANDBOX */

            //make sure the new element gets the proper events set on it
            var newElement = new canvasElement(theOne.get(0));
            newElement.activate();

            //possible height adjustments
            styleeditor.activeElement.parentBlock.heightAdjustment();

            //we've got pending changes
            siteBuilder.site.setPendingChanges(true);

        },


        /*
            resets the active element
        */
        resetElement: function() {

            if( $(styleeditor.activeElement.element).closest('body').width() !== $(styleeditor.activeElement.element).width() ) {

                $(styleeditor.activeElement.element).attr('style', '').css({'outline': '3px dashed red', 'cursor': 'pointer'});

            } else {

                $(styleeditor.activeElement.element).attr('style', '').css({'outline': '3px dashed red', 'outline-offset':'-3px', 'cursor': 'pointer'});

            }

            /* SANDBOX */

            if( styleeditor.activeElement.sandbox ) {

                var elementID = $(styleeditor.activeElement.element).attr('id');
                $('#'+styleeditor.activeElement.sandbox).contents().find('#'+elementID).attr('style', '');

            }

            /* END SANDBOX */

            $('#styleEditor form#stylingForm').height( $('#styleEditor form#stylingForm').height()+"px" );

            $('#styleEditor form#stylingForm .form-group:not(#styleElTemplate)').fadeOut(500, function(){

                $(this).remove();

            });


            //reset icon

            if( styleeditor._oldIcon[$(styleeditor.activeElement.element).attr('id')] !== null ) {

                var get = $.grep(styleeditor.activeElement.element.className.split(" "), function(v, i){

                    return v.indexOf('fa-') === 0;

                }).join();

                $(styleeditor.activeElement.element).removeClass( get ).addClass( styleeditor._oldIcon[$(styleeditor.activeElement.element).attr('id')] );

                $('select#icons option').each(function(){

                    if( $(this).val() === styleeditor._oldIcon[$(styleeditor.activeElement.element).attr('id')] ) {

                        $(this).attr('selected', true);
                        $('#icons').trigger('chosen:updated');

                    }

                });

            }

            setTimeout( function(){styleeditor.buildeStyleElements( $(styleeditor.activeElement.element).attr('data-selector') );}, 550);

            siteBuilder.site.setPendingChanges(true);

        },


        resetSelectLinksPages: function() {

            $('#internalLinksDropdown').select2('val', '#');

        },

        resetSelectLinksInternal: function() {

            $('#pageLinksDropdown').select2('val', '#');

        },

        resetSelectAllLinks: function() {

            $('#internalLinksDropdown').select2('val', '#');
            $('#pageLinksDropdown').select2('val', '#');
            this.select();

        },

        /*
            hides file upload forms
        */
        hideFileUploads: function() {

            $('form#imageUploadForm').hide();
            $('#imageModal #uploadTabLI').hide();

        },


        /*
            closes the style editor
        */
        closeStyleEditor: function(){

            if( Object.keys(styleeditor.activeElement).length > 0 ) {
                styleeditor.activeElement.removeOutline();
                styleeditor.activeElement.activate();
            }

            if( $('#styleEditor').css('left') === '0px' ) {

                styleeditor.toggleSidePanel('close');

            }

        },


        /*
            toggles the side panel
        */
        toggleSidePanel: function(val) {

            if( val === 'open' && $('#styleEditor').css('left') === '-300px' ) {
                $('#styleEditor').animate({'left': '0px'}, 250);
            } else if( val === 'close' && $('#styleEditor').css('left') === '0px' ) {
                $('#styleEditor').animate({'left': '-300px'}, 250);
            }

        },


        /*
            Event handler for when this mode gets deactivated
        */
        deActivateMode: function() {

            if( Object.keys( styleeditor.activeElement ).length > 0 ) {
                styleeditor.closeStyleEditor();
            }

            //deactivate all style items on the canvas
            for( var i =0; i < styleeditor.allStyleItemsOnCanvas.length; i++ ) {
                styleeditor.allStyleItemsOnCanvas[i].deactivate();
            }

            //Add overlay again
            // for(var i = 1; i <= $("ul#page1 li").length; i++){
            //     var id = "#ui-id-" + i;
            //     alert(id);
            //     // overlay = $('<span class="overlay"><span class="fui-eye"></span></span>');
            //     // $(id).contents().find('a.over').append( overlay );
            // }

        }

    };

    styleeditor.init();

    exports.styleeditor = styleeditor;

}());
},{"./builder.js":3,"./canvasElement.js":4,"./config.js":5}],8:[function(require,module,exports){
(function () {

/* globals siteUrl:false, baseUrl:false */
    "use strict";
        
    var appUI = {
        
        firstMenuWidth: 190,
        secondMenuWidth: 300,
        loaderAnimation: document.getElementById('loader'),
        secondMenuTriggerContainers: $('#menu #main #elementCats, #menu #main #templatesUl'),
        siteUrl: siteUrl,
        baseUrl: baseUrl,
        
        setup: function(){
            
            // Fade the loader animation
            $(appUI.loaderAnimation).fadeOut(function(){
                $('#menu').animate({'left': 0}, 1000);
            });
            
            // Tabs
            $(".nav-tabs a").on('click', function (e) {
                e.preventDefault();
                $(this).tab("show");
            });
            
            $("select.select").select2();
            
            $(':radio, :checkbox').radiocheck();
            
            // Tooltips
            $("[data-toggle=tooltip]").tooltip("hide");
            
            // Table: Toggle all checkboxes
            $('.table .toggle-all :checkbox').on('click', function () {
                var $this = $(this);
                var ch = $this.prop('checked');
                $this.closest('.table').find('tbody :checkbox').radiocheck(!ch ? 'uncheck' : 'check');
            });
            
            // Add style class name to a tooltips
            $(".tooltip").addClass(function() {
                if ($(this).prev().attr("data-tooltip-style")) {
                    return "tooltip-" + $(this).prev().attr("data-tooltip-style");
                }
            });
            
            $(".btn-group").on('click', "a", function() {
                $(this).siblings().removeClass("active").end().addClass("active");
            });
            
            // Focus state for append/prepend inputs
            $('.input-group').on('focus', '.form-control', function () {
                $(this).closest('.input-group, .form-group').addClass('focus');
            }).on('blur', '.form-control', function () {
                $(this).closest('.input-group, .form-group').removeClass('focus');
            });
            
            // Table: Toggle all checkboxes
            $('.table .toggle-all').on('click', function() {
                var ch = $(this).find(':checkbox').prop('checked');
                $(this).closest('.table').find('tbody :checkbox').checkbox(!ch ? 'check' : 'uncheck');
            });
            
            // Table: Add class row selected
            $('.table tbody :checkbox').on('check uncheck toggle', function (e) {
                var $this = $(this)
                , check = $this.prop('checked')
                , toggle = e.type === 'toggle'
                , checkboxes = $('.table tbody :checkbox')
                , checkAll = checkboxes.length === checkboxes.filter(':checked').length;

                $this.closest('tr')[check ? 'addClass' : 'removeClass']('selected-row');
                if (toggle) $this.closest('.table').find('.toggle-all :checkbox').checkbox(checkAll ? 'check' : 'uncheck');
            });
            
            // Switch
            $("[data-toggle='switch']").wrap('<div class="switch" />').parent().bootstrapSwitch();
                        
            appUI.secondMenuTriggerContainers.on('click', 'a:not(.btn)', appUI.secondMenuAnimation);
                        
        },
        
        secondMenuAnimation: function(){
        
            $('#menu #main a').removeClass('active');
            $(this).addClass('active');
	
            //show only the right elements
            $('#menu #second ul li').hide();
            $('#menu #second ul li.'+$(this).attr('id')).show();

            if( $(this).attr('id') === 'all' ) {
                $('#menu #second ul#elements li').show();		
            }
	
            $('.menu .second').css('display', 'block').stop().animate({
                width: appUI.secondMenuWidth
            }, 500);	
                
        }
        
    };
    
    //initiate the UI
    appUI.setup();


    //**** EXPORTS
    module.exports.appUI = appUI;
    
}());
},{}],9:[function(require,module,exports){
(function () {
    "use strict";
    
    exports.getRandomArbitrary = function(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    };

    exports.getParameterByName = function (name, url) {

        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
        
    };
    
}());
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbWFnZXMuanMiLCJqcy9tb2R1bGVzL2FjY291bnQuanMiLCJqcy9tb2R1bGVzL2J1aWxkZXIuanMiLCJqcy9tb2R1bGVzL2NhbnZhc0VsZW1lbnQuanMiLCJqcy9tb2R1bGVzL2NvbmZpZy5qcyIsImpzL21vZHVsZXMvaW1hZ2VMaWJyYXJ5LmpzIiwianMvbW9kdWxlcy9zdHlsZWVkaXRvci5qcyIsImpzL21vZHVsZXMvdWkuanMiLCJqcy9tb2R1bGVzL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4eURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2poQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblxuXHRyZXF1aXJlKCcuL21vZHVsZXMvdWknKTtcblx0cmVxdWlyZSgnLi9tb2R1bGVzL2J1aWxkZXInKTtcblx0cmVxdWlyZSgnLi9tb2R1bGVzL2NvbmZpZycpO1xuXHRyZXF1aXJlKCcuL21vZHVsZXMvaW1hZ2VMaWJyYXJ5Jyk7XG5cdHJlcXVpcmUoJy4vbW9kdWxlcy9hY2NvdW50Jyk7XG5cbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cblx0dmFyIGFwcFVJID0gcmVxdWlyZSgnLi91aS5qcycpLmFwcFVJO1xuXG5cdHZhciBhY2NvdW50ID0ge1xuICAgICAgICBcbiAgICAgICAgYnV0dG9uVXBkYXRlQWNjb3VudERldGFpbHM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhY2NvdW50RGV0YWlsc1N1Ym1pdCcpLFxuICAgICAgICBidXR0b25VcGRhdGVMb2dpbkRldGFpbHM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhY2NvdW50TG9naW5TdWJtaXQnKSxcbiAgICAgICAgXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uVXBkYXRlQWNjb3VudERldGFpbHMpLm9uKCdjbGljaycsIHRoaXMudXBkYXRlQWNjb3VudERldGFpbHMpO1xuICAgICAgICAgICAgJCh0aGlzLmJ1dHRvblVwZGF0ZUxvZ2luRGV0YWlscykub24oJ2NsaWNrJywgdGhpcy51cGRhdGVMb2dpbkRldGFpbHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHVwZGF0ZXMgYWNjb3VudCBkZXRhaWxzXG4gICAgICAgICovXG4gICAgICAgIHVwZGF0ZUFjY291bnREZXRhaWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9hbGwgZmllbGRzIGZpbGxlZCBpbj9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGFsbEdvb2QgPSAxO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggJCgnI2FjY291bnRfZGV0YWlscyBpbnB1dCNmaXJzdG5hbWUnKS52YWwoKSA9PT0gJycgKSB7XG4gICAgICAgICAgICAgICAgJCgnI2FjY291bnRfZGV0YWlscyBpbnB1dCNmaXJzdG5hbWUnKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgICAgICBhbGxHb29kID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJCgnI2FjY291bnRfZGV0YWlscyBpbnB1dCNmaXJzdG5hbWUnKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgICAgICBhbGxHb29kID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoICQoJyNhY2NvdW50X2RldGFpbHMgaW5wdXQjbGFzdG5hbWUnKS52YWwoKSA9PT0gJycgKSB7XG4gICAgICAgICAgICAgICAgJCgnI2FjY291bnRfZGV0YWlscyBpbnB1dCNsYXN0bmFtZScpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgICAgIGFsbEdvb2QgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9kZXRhaWxzIGlucHV0I2xhc3RuYW1lJykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICAgICAgYWxsR29vZCA9IDE7XG4gICAgICAgICAgICB9XG5cdFx0XG4gICAgICAgICAgICBpZiggYWxsR29vZCA9PT0gMSApIHtcblxuICAgICAgICAgICAgICAgIHZhciB0aGVCdXR0b24gPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vZGlzYWJsZSBidXR0b25cbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vc2hvdyBsb2FkZXJcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9kZXRhaWxzIC5sb2FkZXInKS5mYWRlSW4oNTAwKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3JlbW92ZSBhbGVydHNcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9kZXRhaWxzIC5hbGVydHMgPiAqJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBhcHBVSS5zaXRlVXJsK1widXNlcnMvdWFjY291bnRcIixcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiAkKCcjYWNjb3VudF9kZXRhaWxzJykuc2VyaWFsaXplKClcbiAgICAgICAgICAgICAgICB9KS5kb25lKGZ1bmN0aW9uKHJldCl7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2VuYWJsZSBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgdGhlQnV0dG9uLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIGxvYWRlclxuICAgICAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9kZXRhaWxzIC5sb2FkZXInKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2RldGFpbHMgLmFsZXJ0cycpLmFwcGVuZCggJChyZXQucmVzcG9uc2VIVE1MKSApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAxICkgey8vc3VjY2Vzc1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2RldGFpbHMgLmFsZXJ0cyA+IConKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24gKCkgeyAkKHRoaXMpLnJlbW92ZSgpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDMwMDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICB1cGRhdGVzIGFjY291bnQgbG9naW4gZGV0YWlsc1xuICAgICAgICAqL1xuICAgICAgICB1cGRhdGVMb2dpbkRldGFpbHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XG5cdFx0XHRjb25zb2xlLmxvZyhhcHBVSSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBhbGxHb29kID0gMTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoICQoJyNhY2NvdW50X2xvZ2luIGlucHV0I2VtYWlsJykudmFsKCkgPT09ICcnICkge1xuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2xvZ2luIGlucHV0I2VtYWlsJykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICAgICAgYWxsR29vZCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2xvZ2luIGlucHV0I2VtYWlsJykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICAgICAgYWxsR29vZCA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCAkKCcjYWNjb3VudF9sb2dpbiBpbnB1dCNwYXNzd29yZCcpLnZhbCgpID09PSAnJyApIHtcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9sb2dpbiBpbnB1dCNwYXNzd29yZCcpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgICAgIGFsbEdvb2QgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9sb2dpbiBpbnB1dCNwYXNzd29yZCcpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgICAgIGFsbEdvb2QgPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggYWxsR29vZCA9PT0gMSApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgdGhlQnV0dG9uID0gJCh0aGlzKTtcblxuICAgICAgICAgICAgICAgIC8vZGlzYWJsZSBidXR0b25cbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vc2hvdyBsb2FkZXJcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9sb2dpbiAubG9hZGVyJykuZmFkZUluKDUwMCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9yZW1vdmUgYWxlcnRzXG4gICAgICAgICAgICAgICAgJCgnI2FjY291bnRfbG9naW4gLmFsZXJ0cyA+IConKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGFwcFVJLnNpdGVVcmwrXCJ1c2Vycy91bG9naW5cIixcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiAkKCcjYWNjb3VudF9sb2dpbicpLnNlcmlhbGl6ZSgpXG4gICAgICAgICAgICAgICAgfSkuZG9uZShmdW5jdGlvbihyZXQpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9lbmFibGUgYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHRoZUJ1dHRvbi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBsb2FkZXJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2FjY291bnRfbG9naW4gLmxvYWRlcicpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnI2FjY291bnRfbG9naW4gLmFsZXJ0cycpLmFwcGVuZCggJChyZXQucmVzcG9uc2VIVE1MKSApO1xuXHRcdFx0XHRcdFxuICAgICAgICAgICAgICAgICAgICBpZiggcmV0LnJlc3BvbnNlQ29kZSA9PT0gMSApIHsvL3N1Y2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9sb2dpbiAuYWxlcnRzID4gKicpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbiAoKSB7ICQodGhpcykucmVtb3ZlKCk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfTtcbiAgICBcbiAgICBhY2NvdW50LmluaXQoKTtcblxufSgpKTsiLCIoZnVuY3Rpb24gKCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBzaXRlQnVpbGRlclV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcycpO1xuICAgIHZhciBiQ29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcuanMnKTtcbiAgICB2YXIgYXBwVUkgPSByZXF1aXJlKCcuL3VpLmpzJykuYXBwVUk7XG5cblxuXHQgLypcbiAgICAgICAgQmFzaWMgQnVpbGRlciBVSSBpbml0aWFsaXNhdGlvblxuICAgICovXG4gICAgdmFyIGJ1aWxkZXJVSSA9IHtcbiAgICAgICAgXG4gICAgICAgIGFsbEJsb2Nrczoge30sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaG9sZHMgYWxsIGJsb2NrcyBsb2FkZWQgZnJvbSB0aGUgc2VydmVyXG4gICAgICAgIG1lbnVXcmFwcGVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWVudScpLFxuICAgICAgICBwcmltYXJ5U2lkZU1lbnVXcmFwcGVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLFxuICAgICAgICBidXR0b25CYWNrOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFja0J1dHRvbicpLFxuICAgICAgICBidXR0b25CYWNrQ29uZmlybTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xlYXZlUGFnZUJ1dHRvbicpLFxuICAgICAgICBcbiAgICAgICAgc2l0ZUJ1aWxkZXJNb2RlczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpdGVCdWlsZGVyTW9kZXMnKSxcbiAgICAgICAgYWNlRWRpdG9yczoge30sXG4gICAgICAgIGZyYW1lQ29udGVudHM6ICcnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9ob2xkcyBmcmFtZSBjb250ZW50c1xuICAgICAgICB0ZW1wbGF0ZUlEOiAwLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaG9sZHMgdGhlIHRlbXBsYXRlIElEIGZvciBhIHBhZ2UgKD8/PylcbiAgICAgICAgcmFkaW9CbG9ja01vZGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RlQmxvY2snKSxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgbW9kYWxEZWxldGVCbG9jazogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlbGV0ZUJsb2NrJyksXG4gICAgICAgIG1vZGFsUmVzZXRCbG9jazogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0QmxvY2snKSxcbiAgICAgICAgbW9kYWxEZWxldGVQYWdlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVsZXRlUGFnZScpLFxuICAgICAgICBidXR0b25EZWxldGVQYWdlQ29uZmlybTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlbGV0ZVBhZ2VDb25maXJtJyksXG4gICAgICAgIFxuICAgICAgICBkcm9wZG93blBhZ2VMaW5rczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ludGVybmFsTGlua3NEcm9wZG93bicpLFxuXG4gICAgICAgIHBhZ2VJblVybDogbnVsbCxcbiAgICAgICAgXG4gICAgICAgIHRlbXBGcmFtZToge30sXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbG9hZCBibG9ja3NcbiAgICAgICAgICAgICQuZ2V0SlNPTihhcHBVSS5iYXNlVXJsKydlbGVtZW50cy5qc29uP3Y9MTIzNDU2NzgnLCBmdW5jdGlvbihkYXRhKXsgYnVpbGRlclVJLmFsbEJsb2NrcyA9IGRhdGE7IGJ1aWxkZXJVSS5pbXBsZW1lbnRCbG9ja3MoKTsgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vc2l0ZWJhciBob3ZlciBhbmltYXRpb24gYWN0aW9uXG4gICAgICAgICAgICAkKHRoaXMubWVudVdyYXBwZXIpLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnN0b3AoKS5hbmltYXRlKHsnbGVmdCc6ICcwcHgnfSwgNTAwKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyQodGhpcykuc3RvcCgpLmFuaW1hdGUoeydsZWZ0JzogJy0xOTBweCd9LCA1MDApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQoJyNtZW51ICNtYWluIGEnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnLm1lbnUgLnNlY29uZCcpLnN0b3AoKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDBcbiAgICAgICAgICAgICAgICB9LCA1MDAsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICQoJyNtZW51ICNzZWNvbmQnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gc2Nyb2xsIHNpZGViYXJcbiAgICAgICAgICAgICQoXCIubWFpblwiKS5tQ3VzdG9tU2Nyb2xsYmFyKHtcbiAgICAgICAgICAgICAgYXhpczpcInlcIlxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQoXCIuc2Vjb25kXCIpLm1DdXN0b21TY3JvbGxiYXIoe1xuICAgICAgICAgICAgICBheGlzOlwieVwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9wcmV2ZW50IGNsaWNrIGV2ZW50IG9uIGFuY29ycyBpbiB0aGUgYmxvY2sgc2VjdGlvbiBvZiB0aGUgc2lkZWJhclxuICAgICAgICAgICAgJCh0aGlzLnByaW1hcnlTaWRlTWVudVdyYXBwZXIpLm9uKCdjbGljaycsICdhOm5vdCguYWN0aW9uQnV0dG9ucyknLCBmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCk7fSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy5idXR0b25CYWNrKS5vbignY2xpY2snLCB0aGlzLmJhY2tCdXR0b24pO1xuICAgICAgICAgICAgJCh0aGlzLmJ1dHRvbkJhY2tDb25maXJtKS5vbignY2xpY2snLCB0aGlzLmJhY2tCdXR0b25Db25maXJtKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9ub3RpZnkgdGhlIHVzZXIgb2YgcGVuZGluZyBjaG5hZ2VzIHdoZW4gY2xpY2tpbmcgdGhlIGJhY2sgYnV0dG9uXG4gICAgICAgICAgICAkKHdpbmRvdykuYmluZCgnYmVmb3JldW5sb2FkJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBpZiggc2l0ZS5wZW5kaW5nQ2hhbmdlcyA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdZb3VyIHNpdGUgY29udGFpbnMgY2hhbmdlZCB3aGljaCBoYXZlblxcJ3QgYmVlbiBzYXZlZCB5ZXQuIEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBsZWF2ZT8nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL21ha2Ugc3VyZSB3ZSBzdGFydCBpbiBibG9jayBtb2RlXG4gICAgICAgICAgICAkKHRoaXMucmFkaW9CbG9ja01vZGUpLnJhZGlvY2hlY2soJ2NoZWNrJykub24oJ2NsaWNrJywgdGhpcy5hY3RpdmF0ZUJsb2NrTW9kZSk7XG5cbiAgICAgICAgICAgIC8vVVJMIHBhcmFtZXRlcnNcbiAgICAgICAgICAgIGJ1aWxkZXJVSS5wYWdlSW5VcmwgPSBzaXRlQnVpbGRlclV0aWxzLmdldFBhcmFtZXRlckJ5TmFtZSgncCcpO1xuXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGJ1aWxkcyB0aGUgYmxvY2tzIGludG8gdGhlIHNpdGUgYmFyXG4gICAgICAgICovXG4gICAgICAgIGltcGxlbWVudEJsb2NrczogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBuZXdJdGVtLCBsb2FkZXJGdW5jdGlvbjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yKCB2YXIga2V5IGluIHRoaXMuYWxsQmxvY2tzLmVsZW1lbnRzICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBuaWNlS2V5ID0ga2V5LnRvTG93ZXJDYXNlKCkucmVwbGFjZShcIiBcIiwgXCJfXCIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQoJzxsaT48YSBocmVmPVwiXCIgaWQ9XCInK25pY2VLZXkrJ1wiPicra2V5Kyc8L2E+PC9saT4nKS5hcHBlbmRUbygnI21lbnUgI21haW4gdWwjZWxlbWVudENhdHMnKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IoIHZhciB4ID0gMDsgeCA8IHRoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV0ubGVuZ3RoOyB4KysgKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS50aHVtYm5haWwgPT09IG51bGwgKSB7Ly93ZSdsbCBuZWVkIGFuIGlmcmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2J1aWxkIHVzIHNvbWUgaWZyYW1lcyFcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0uc2FuZGJveCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS5sb2FkZXJGdW5jdGlvbiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyRnVuY3Rpb24gPSAnZGF0YS1sb2FkZXJmdW5jdGlvbj1cIicrdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS5sb2FkZXJGdW5jdGlvbisnXCInO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdJdGVtID0gJCgnPGxpIGNsYXNzPVwiZWxlbWVudCAnK25pY2VLZXkrJ1wiPjxpZnJhbWUgc3JjPVwiJythcHBVSS5iYXNlVXJsK3RoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0udXJsKydcIiBzY3JvbGxpbmc9XCJub1wiIHNhbmRib3g9XCJhbGxvdy1zYW1lLW9yaWdpblwiPjwvaWZyYW1lPjwvbGk+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbSA9ICQoJzxsaSBjbGFzcz1cImVsZW1lbnQgJytuaWNlS2V5KydcIj48aWZyYW1lIHNyYz1cImFib3V0OmJsYW5rXCIgc2Nyb2xsaW5nPVwibm9cIj48L2lmcmFtZT48L2xpPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uZmluZCgnaWZyYW1lJykudW5pcXVlSWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uZmluZCgnaWZyYW1lJykuYXR0cignc3JjJywgYXBwVUkuYmFzZVVybCt0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLnVybCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Ugey8vd2UndmUgZ290IGEgdGh1bWJuYWlsXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLnNhbmRib3ggKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0ubG9hZGVyRnVuY3Rpb24gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlckZ1bmN0aW9uID0gJ2RhdGEtbG9hZGVyZnVuY3Rpb249XCInK3RoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0ubG9hZGVyRnVuY3Rpb24rJ1wiJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbSA9ICQoJzxsaSBjbGFzcz1cImVsZW1lbnQgJytuaWNlS2V5KydcIj48aW1nIHNyYz1cIicrYXBwVUkuYmFzZVVybCt0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLnRodW1ibmFpbCsnXCIgZGF0YS1zcmNjPVwiJythcHBVSS5iYXNlVXJsK3RoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0udXJsKydcIiBkYXRhLWhlaWdodD1cIicrdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS5oZWlnaHQrJ1wiIGRhdGEtc2FuZGJveD1cIlwiICcrbG9hZGVyRnVuY3Rpb24rJz48L2xpPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbSA9ICQoJzxsaSBjbGFzcz1cImVsZW1lbnQgJytuaWNlS2V5KydcIj48aW1nIHNyYz1cIicrYXBwVUkuYmFzZVVybCt0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLnRodW1ibmFpbCsnXCIgZGF0YS1zcmNjPVwiJythcHBVSS5iYXNlVXJsK3RoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0udXJsKydcIiBkYXRhLWhlaWdodD1cIicrdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS5oZWlnaHQrJ1wiPjwvbGk+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBuZXdJdGVtLmFwcGVuZFRvKCcjbWVudSAjc2Vjb25kIHVsI2VsZW1lbnRzJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy96b29tZXIgd29ya3NcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhlSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0uaGVpZ2h0ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVIZWlnaHQgPSB0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLmhlaWdodCowLjI1O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlSGVpZ2h0ID0gJ2F1dG8nO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uZmluZCgnaWZyYW1lJykuem9vbWVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDAuMjUsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogMjcwLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGVIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkRyYWcmRHJvcCBNZSFcIlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9kcmFnZ2FibGVzXG4gICAgICAgICAgICBidWlsZGVyVUkubWFrZURyYWdnYWJsZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgZXZlbnQgaGFuZGxlciBmb3Igd2hlbiB0aGUgYmFjayBsaW5rIGlzIGNsaWNrZWRcbiAgICAgICAgKi9cbiAgICAgICAgYmFja0J1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCBzaXRlLnBlbmRpbmdDaGFuZ2VzID09PSB0cnVlICkge1xuICAgICAgICAgICAgICAgICQoJyNiYWNrTW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBidXR0b24gZm9yIGNvbmZpcm1pbmcgbGVhdmluZyB0aGUgcGFnZVxuICAgICAgICAqL1xuICAgICAgICBiYWNrQnV0dG9uQ29uZmlybTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNpdGUucGVuZGluZ0NoYW5nZXMgPSBmYWxzZTsvL3ByZXZlbnQgdGhlIEpTIGFsZXJ0IGFmdGVyIGNvbmZpcm1pbmcgdXNlciB3YW50cyB0byBsZWF2ZVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGFjdGl2YXRlcyBibG9jayBtb2RlXG4gICAgICAgICovXG4gICAgICAgIGFjdGl2YXRlQmxvY2tNb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgc2l0ZS5hY3RpdmVQYWdlLnRvZ2dsZUZyYW1lQ292ZXJzKCdPbicpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3RyaWdnZXIgY3VzdG9tIGV2ZW50XG4gICAgICAgICAgICAkKCdib2R5JykudHJpZ2dlcignbW9kZUJsb2NrcycpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgbWFrZXMgdGhlIGJsb2NrcyBhbmQgdGVtcGxhdGVzIGluIHRoZSBzaWRlYmFyIGRyYWdnYWJsZSBvbnRvIHRoZSBjYW52YXNcbiAgICAgICAgKi9cbiAgICAgICAgbWFrZURyYWdnYWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNlbGVtZW50cyBsaSwgI3RlbXBsYXRlcyBsaScpLmVhY2goZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICAgICQodGhpcykuZHJhZ2dhYmxlKHtcbiAgICAgICAgICAgICAgICAgICAgaGVscGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKCc8ZGl2IHN0eWxlPVwiaGVpZ2h0OiAxMDBweDsgd2lkdGg6IDMwMHB4OyBiYWNrZ3JvdW5kOiAjRjlGQUZBOyBib3gtc2hhZG93OiA1cHggNXB4IDFweCByZ2JhKDAsMCwwLDAuMSk7IHRleHQtYWxpZ246IGNlbnRlcjsgbGluZS1oZWlnaHQ6IDEwMHB4OyBmb250LXNpemU6IDIwcHg7IGNvbG9yOiAjZmZmXCI+PHNwYW4gY2xhc3M9XCJmdWktbGlzdFwiPjwvc3Bhbj48L2Rpdj4nKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmV2ZXJ0OiAnaW52YWxpZCcsXG4gICAgICAgICAgICAgICAgICAgIGFwcGVuZFRvOiAnYm9keScsXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RUb1NvcnRhYmxlOiAnI3BhZ2VMaXN0ID4gdWwnLFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zd2l0Y2ggdG8gYmxvY2sgbW9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnaW5wdXQ6cmFkaW9bbmFtZT1tb2RlXScpLnBhcmVudCgpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnaW5wdXQ6cmFkaW9bbmFtZT1tb2RlXSNtb2RlQmxvY2snKS5yYWRpb2NoZWNrKCdjaGVjaycpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0pOyBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNlbGVtZW50cyBsaSBhJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQodGhpcykudW5iaW5kKCdjbGljaycpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgSW1wbGVtZW50cyB0aGUgc2l0ZSBvbiB0aGUgY2FudmFzLCBjYWxsZWQgZnJvbSB0aGUgU2l0ZSBvYmplY3Qgd2hlbiB0aGUgc2l0ZURhdGEgaGFzIGNvbXBsZXRlZCBsb2FkaW5nXG4gICAgICAgICovXG4gICAgICAgIHBvcHVsYXRlQ2FudmFzOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vaWYgd2UgaGF2ZSBhbnkgYmxvY2tzIGF0IGFsbCwgYWN0aXZhdGUgdGhlIG1vZGVzXG4gICAgICAgICAgICBpZiggT2JqZWN0LmtleXMoc2l0ZS5wYWdlcykubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICAgICAgICB2YXIgbW9kZXMgPSBidWlsZGVyVUkuc2l0ZUJ1aWxkZXJNb2Rlcy5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwicmFkaW9cIl0nKTtcbiAgICAgICAgICAgICAgICBmb3IoIGkgPSAwOyBpIDwgbW9kZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVzW2ldLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTsgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgY291bnRlciA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbG9vcCB0aHJvdWdoIHRoZSBwYWdlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIGkgaW4gc2l0ZS5wYWdlcyApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgbmV3UGFnZSA9IG5ldyBQYWdlKGksIHNpdGUucGFnZXNbaV0sIGNvdW50ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb3VudGVyKys7XG5cbiAgICAgICAgICAgICAgICAvL3NldCB0aGlzIHBhZ2UgYXMgYWN0aXZlP1xuICAgICAgICAgICAgICAgIGlmKCBidWlsZGVyVUkucGFnZUluVXJsID09PSBpICkge1xuICAgICAgICAgICAgICAgICAgICBuZXdQYWdlLnNlbGVjdFBhZ2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2FjdGl2YXRlIHRoZSBmaXJzdCBwYWdlXG4gICAgICAgICAgICBpZihzaXRlLnNpdGVQYWdlcy5sZW5ndGggPiAwICYmIGJ1aWxkZXJVSS5wYWdlSW5VcmwgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzaXRlLnNpdGVQYWdlc1swXS5zZWxlY3RQYWdlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9O1xuXG5cbiAgICAvKlxuICAgICAgICBQYWdlIGNvbnN0cnVjdG9yXG4gICAgKi9cbiAgICBmdW5jdGlvbiBQYWdlIChwYWdlTmFtZSwgcGFnZSwgY291bnRlcikge1xuICAgIFxuICAgICAgICB0aGlzLm5hbWUgPSBwYWdlTmFtZSB8fCBcIlwiO1xuICAgICAgICB0aGlzLnBhZ2VJRCA9IHBhZ2UucGFnZXNfaWQgfHwgMDtcbiAgICAgICAgdGhpcy5ibG9ja3MgPSBbXTtcbiAgICAgICAgdGhpcy5wYXJlbnRVTCA9IHt9OyAvL3BhcmVudCBVTCBvbiB0aGUgY2FudmFzXG4gICAgICAgIHRoaXMuc3RhdHVzID0gJyc7Ly8nJywgJ25ldycgb3IgJ2NoYW5nZWQnXG4gICAgICAgIHRoaXMuc2NyaXB0cyA9IFtdOy8vdHJhY2tzIHNjcmlwdCBVUkxzIHVzZWQgb24gdGhpcyBwYWdlXG4gICAgICAgIFxuICAgICAgICB0aGlzLnBhZ2VTZXR0aW5ncyA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBwYWdlLnBhZ2VzX3RpdGxlIHx8ICcnLFxuICAgICAgICAgICAgbWV0YV9kZXNjcmlwdGlvbjogcGFnZS5tZXRhX2Rlc2NyaXB0aW9uIHx8ICcnLFxuICAgICAgICAgICAgbWV0YV9rZXl3b3JkczogcGFnZS5tZXRhX2tleXdvcmRzIHx8ICcnLFxuICAgICAgICAgICAgaGVhZGVyX2luY2x1ZGVzOiBwYWdlLmhlYWRlcl9pbmNsdWRlcyB8fCAnJyxcbiAgICAgICAgICAgIHBhZ2VfY3NzOiBwYWdlLnBhZ2VfY3NzIHx8ICcnXG4gICAgICAgIH07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHRoaXMucGFnZU1lbnVUZW1wbGF0ZSA9ICc8YSBocmVmPVwiXCIgY2xhc3M9XCJtZW51SXRlbUxpbmtcIj5wYWdlPC9hPjxzcGFuIGNsYXNzPVwicGFnZUJ1dHRvbnNcIj48YSBocmVmPVwiXCIgY2xhc3M9XCJmaWxlRWRpdCBmdWktbmV3XCI+PC9hPjxhIGhyZWY9XCJcIiBjbGFzcz1cImZpbGVEZWwgZnVpLWNyb3NzXCI+PGEgY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5IGJ0bi1lbWJvc3NlZCBmaWxlU2F2ZSBmdWktY2hlY2tcIiBocmVmPVwiI1wiPjwvYT48L3NwYW4+PC9hPjwvc3Bhbj4nO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5tZW51SXRlbSA9IHt9Oy8vcmVmZXJlbmNlIHRvIHRoZSBwYWdlcyBtZW51IGl0ZW0gZm9yIHRoaXMgcGFnZSBpbnN0YW5jZVxuICAgICAgICB0aGlzLmxpbmtzRHJvcGRvd25JdGVtID0ge307Ly9yZWZlcmVuY2UgdG8gdGhlIGxpbmtzIGRyb3Bkb3duIGl0ZW0gZm9yIHRoaXMgcGFnZSBpbnN0YW5jZVxuICAgICAgICBcbiAgICAgICAgdGhpcy5wYXJlbnRVTCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ1VMJyk7XG4gICAgICAgIHRoaXMucGFyZW50VUwuc2V0QXR0cmlidXRlKCdpZCcsIFwicGFnZVwiK2NvdW50ZXIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgbWFrZXMgdGhlIGNsaWNrZWQgcGFnZSBhY3RpdmVcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZWxlY3RQYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NlbGVjdDonKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2codGhpcy5wYWdlU2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL21hcmsgdGhlIG1lbnUgaXRlbSBhcyBhY3RpdmVcbiAgICAgICAgICAgIHNpdGUuZGVBY3RpdmF0ZUFsbCgpO1xuICAgICAgICAgICAgJCh0aGlzLm1lbnVJdGVtKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbGV0IFNpdGUga25vdyB3aGljaCBwYWdlIGlzIGN1cnJlbnRseSBhY3RpdmVcbiAgICAgICAgICAgIHNpdGUuc2V0QWN0aXZlKHRoaXMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2Rpc3BsYXkgdGhlIG5hbWUgb2YgdGhlIGFjdGl2ZSBwYWdlIG9uIHRoZSBjYW52YXNcbiAgICAgICAgICAgIHNpdGUucGFnZVRpdGxlLmlubmVySFRNTCA9IHRoaXMubmFtZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9sb2FkIHRoZSBwYWdlIHNldHRpbmdzIGludG8gdGhlIHBhZ2Ugc2V0dGluZ3MgbW9kYWxcbiAgICAgICAgICAgIHNpdGUuaW5wdXRQYWdlU2V0dGluZ3NUaXRsZS52YWx1ZSA9IHRoaXMucGFnZVNldHRpbmdzLnRpdGxlO1xuICAgICAgICAgICAgc2l0ZS5pbnB1dFBhZ2VTZXR0aW5nc01ldGFEZXNjcmlwdGlvbi52YWx1ZSA9IHRoaXMucGFnZVNldHRpbmdzLm1ldGFfZGVzY3JpcHRpb247XG4gICAgICAgICAgICBzaXRlLmlucHV0UGFnZVNldHRpbmdzTWV0YUtleXdvcmRzLnZhbHVlID0gdGhpcy5wYWdlU2V0dGluZ3MubWV0YV9rZXl3b3JkcztcbiAgICAgICAgICAgIHNpdGUuaW5wdXRQYWdlU2V0dGluZ3NJbmNsdWRlcy52YWx1ZSA9IHRoaXMucGFnZVNldHRpbmdzLmhlYWRlcl9pbmNsdWRlcztcbiAgICAgICAgICAgIHNpdGUuaW5wdXRQYWdlU2V0dGluZ3NQYWdlQ3NzLnZhbHVlID0gdGhpcy5wYWdlU2V0dGluZ3MucGFnZV9jc3M7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy90cmlnZ2VyIGN1c3RvbSBldmVudFxuICAgICAgICAgICAgJCgnYm9keScpLnRyaWdnZXIoJ2NoYW5nZVBhZ2UnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9yZXNldCB0aGUgaGVpZ2h0cyBmb3IgdGhlIGJsb2NrcyBvbiB0aGUgY3VycmVudCBwYWdlXG4gICAgICAgICAgICBmb3IoIHZhciBpIGluIHRoaXMuYmxvY2tzICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCBPYmplY3Qua2V5cyh0aGlzLmJsb2Nrc1tpXS5mcmFtZURvY3VtZW50KS5sZW5ndGggPiAwICl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tzW2ldLmhlaWdodEFkanVzdG1lbnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9zaG93IHRoZSBlbXB0eSBtZXNzYWdlP1xuICAgICAgICAgICAgdGhpcy5pc0VtcHR5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBjaGFuZ2VkIHRoZSBsb2NhdGlvbi9vcmRlciBvZiBhIGJsb2NrIHdpdGhpbiBhIHBhZ2VcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGZyYW1lSUQsIG5ld1Bvcykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3dlJ2xsIG5lZWQgdGhlIGJsb2NrIG9iamVjdCBjb25uZWN0ZWQgdG8gaWZyYW1lIHdpdGggZnJhbWVJRFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy5ibG9ja3MpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5ibG9ja3NbaV0uZnJhbWUuZ2V0QXR0cmlidXRlKCdpZCcpID09PSBmcmFtZUlEICkge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9jaGFuZ2UgdGhlIHBvc2l0aW9uIG9mIHRoaXMgYmxvY2sgaW4gdGhlIGJsb2NrcyBhcnJheVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJsb2Nrcy5zcGxpY2UobmV3UG9zLCAwLCB0aGlzLmJsb2Nrcy5zcGxpY2UoaSwgMSlbMF0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBkZWxldGUgYmxvY2sgZnJvbSBibG9ja3MgYXJyYXlcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVCbG9jayA9IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vcmVtb3ZlIGZyb20gYmxvY2tzIGFycmF5XG4gICAgICAgICAgICBmb3IoIHZhciBpIGluIHRoaXMuYmxvY2tzICkge1xuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmJsb2Nrc1tpXSA9PT0gYmxvY2sgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vZm91bmQgaXQsIHJlbW92ZSBmcm9tIGJsb2NrcyBhcnJheVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJsb2Nrcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzaXRlLnNldFBlbmRpbmdDaGFuZ2VzKHRydWUpO1xuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgdG9nZ2xlcyBhbGwgYmxvY2sgZnJhbWVDb3ZlcnMgb24gdGhpcyBwYWdlXG4gICAgICAgICovXG4gICAgICAgIHRoaXMudG9nZ2xlRnJhbWVDb3ZlcnMgPSBmdW5jdGlvbihvbk9yT2ZmKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIGkgaW4gdGhpcy5ibG9ja3MgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2Nrc1tpXS50b2dnbGVDb3Zlcihvbk9yT2ZmKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHNldHVwIGZvciBlZGl0aW5nIGEgcGFnZSBuYW1lXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuZWRpdFBhZ2VOYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCAhdGhpcy5tZW51SXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2VkaXQnKSApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vaGlkZSB0aGUgbGlua1xuICAgICAgICAgICAgICAgIHRoaXMubWVudUl0ZW0ucXVlcnlTZWxlY3RvcignYS5tZW51SXRlbUxpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9pbnNlcnQgdGhlIGlucHV0IGZpZWxkXG4gICAgICAgICAgICAgICAgdmFyIG5ld0lucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgICAgICBuZXdJbnB1dC50eXBlID0gJ3RleHQnO1xuICAgICAgICAgICAgICAgIG5ld0lucHV0LnNldEF0dHJpYnV0ZSgnbmFtZScsICdwYWdlJyk7XG4gICAgICAgICAgICAgICAgbmV3SW5wdXQuc2V0QXR0cmlidXRlKCd2YWx1ZScsIHRoaXMubmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tZW51SXRlbS5pbnNlcnRCZWZvcmUobmV3SW5wdXQsIHRoaXMubWVudUl0ZW0uZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG5ld0lucHV0LmZvY3VzKCk7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciB0bXBTdHIgPSBuZXdJbnB1dC5nZXRBdHRyaWJ1dGUoJ3ZhbHVlJyk7XG4gICAgICAgICAgICAgICAgbmV3SW5wdXQuc2V0QXR0cmlidXRlKCd2YWx1ZScsICcnKTtcbiAgICAgICAgICAgICAgICBuZXdJbnB1dC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgdG1wU3RyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVJdGVtLmNsYXNzTGlzdC5hZGQoJ2VkaXQnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgVXBkYXRlcyB0aGlzIHBhZ2UncyBuYW1lIChldmVudCBoYW5kbGVyIGZvciB0aGUgc2F2ZSBidXR0b24pXG4gICAgICAgICovXG4gICAgICAgIHRoaXMudXBkYXRlUGFnZU5hbWVFdmVudCA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCB0aGlzLm1lbnVJdGVtLmNsYXNzTGlzdC5jb250YWlucygnZWRpdCcpICkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9lbCBpcyB0aGUgY2xpY2tlZCBidXR0b24sIHdlJ2xsIG5lZWQgYWNjZXNzIHRvIHRoZSBpbnB1dFxuICAgICAgICAgICAgICAgIHZhciB0aGVJbnB1dCA9IHRoaXMubWVudUl0ZW0ucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInBhZ2VcIl0nKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL21ha2Ugc3VyZSB0aGUgcGFnZSdzIG5hbWUgaXMgT0tcbiAgICAgICAgICAgICAgICBpZiggc2l0ZS5jaGVja1BhZ2VOYW1lKHRoZUlucHV0LnZhbHVlKSApIHtcbiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uYW1lID0gc2l0ZS5wcmVwUGFnZU5hbWUoIHRoZUlucHV0LnZhbHVlICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51SXRlbS5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwicGFnZVwiXScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVJdGVtLnF1ZXJ5U2VsZWN0b3IoJ2EubWVudUl0ZW1MaW5rJykuaW5uZXJIVE1MID0gdGhpcy5uYW1lO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVJdGVtLnF1ZXJ5U2VsZWN0b3IoJ2EubWVudUl0ZW1MaW5rJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdlZGl0Jyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vdXBkYXRlIHRoZSBsaW5rcyBkcm9wZG93biBpdGVtXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlua3NEcm9wZG93bkl0ZW0udGV4dCA9IHRoaXMubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saW5rc0Ryb3Bkb3duSXRlbS5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgdGhpcy5uYW1lK1wiLmh0bWxcIik7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL3VwZGF0ZSB0aGUgcGFnZSBuYW1lIG9uIHRoZSBjYW52YXNcbiAgICAgICAgICAgICAgICAgICAgc2l0ZS5wYWdlVGl0bGUuaW5uZXJIVE1MID0gdGhpcy5uYW1lO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vY2hhbmdlZCBwYWdlIHRpdGxlLCB3ZSd2ZSBnb3QgcGVuZGluZyBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KHNpdGUucGFnZU5hbWVFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGRlbGV0ZXMgdGhpcyBlbnRpcmUgcGFnZVxuICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2RlbGV0ZSBmcm9tIHRoZSBTaXRlXG4gICAgICAgICAgICBmb3IoIHZhciBpIGluIHNpdGUuc2l0ZVBhZ2VzICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCBzaXRlLnNpdGVQYWdlc1tpXSA9PT0gdGhpcyApIHsvL2dvdCBhIG1hdGNoIVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgZnJvbSBzaXRlLnNpdGVQYWdlc1xuICAgICAgICAgICAgICAgICAgICBzaXRlLnNpdGVQYWdlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSBmcm9tIGNhbnZhc1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudFVMLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9hZGQgdG8gZGVsZXRlZCBwYWdlc1xuICAgICAgICAgICAgICAgICAgICBzaXRlLnBhZ2VzVG9EZWxldGUucHVzaCh0aGlzLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgdGhlIHBhZ2UncyBtZW51IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51SXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXQgdGhlIHBhZ2VzIGxpbmsgZHJvcGRvd24gaXRlbVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbmtzRHJvcGRvd25JdGVtLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9hY3RpdmF0ZSB0aGUgZmlyc3QgcGFnZVxuICAgICAgICAgICAgICAgICAgICBzaXRlLnNpdGVQYWdlc1swXS5zZWxlY3RQYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL3BhZ2Ugd2FzIGRlbGV0ZWQsIHNvIHdlJ3ZlIGdvdCBwZW5kaW5nIGNoYW5nZXNcbiAgICAgICAgICAgICAgICAgICAgc2l0ZS5zZXRQZW5kaW5nQ2hhbmdlcyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgY2hlY2tzIGlmIHRoZSBwYWdlIGlzIGVtcHR5LCBpZiBzbyBzaG93IHRoZSAnZW1wdHknIG1lc3NhZ2VcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIGlmKCB0aGlzLmJsb2Nrcy5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc2l0ZS5tZXNzYWdlU3RhcnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgc2l0ZS5kaXZGcmFtZVdyYXBwZXIuY2xhc3NMaXN0LmFkZCgnZW1wdHknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNpdGUubWVzc2FnZVN0YXJ0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgc2l0ZS5kaXZGcmFtZVdyYXBwZXIuY2xhc3NMaXN0LnJlbW92ZSgnZW1wdHknKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBwcmVwcy9zdHJpcHMgdGhpcyBwYWdlIGRhdGEgZm9yIGEgcGVuZGluZyBhamF4IHJlcXVlc3RcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5wcmVwRm9yU2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcGFnZSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHBhZ2UubmFtZSA9IHRoaXMubmFtZTtcbiAgICAgICAgICAgIHBhZ2UucGFnZVNldHRpbmdzID0gdGhpcy5wYWdlU2V0dGluZ3M7XG4gICAgICAgICAgICBwYWdlLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICAgICAgICAgICAgcGFnZS5ibG9ja3MgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3Byb2Nlc3MgdGhlIGJsb2Nrc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIHggPSAwOyB4IDwgdGhpcy5ibG9ja3MubGVuZ3RoOyB4KysgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgYmxvY2sgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmJsb2Nrc1t4XS5zYW5kYm94ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBibG9jay5mcmFtZUNvbnRlbnQgPSBcIjxodG1sPlwiKyQoJyNzYW5kYm94ZXMgIycrdGhpcy5ibG9ja3NbeF0uc2FuZGJveCkuY29udGVudHMoKS5maW5kKCdodG1sJykuaHRtbCgpK1wiPC9odG1sPlwiO1xuICAgICAgICAgICAgICAgICAgICBibG9jay5zYW5kYm94ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2subG9hZGVyRnVuY3Rpb24gPSB0aGlzLmJsb2Nrc1t4XS5zYW5kYm94X2xvYWRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgYmxvY2suZnJhbWVDb250ZW50ID0gdGhpcy5ibG9ja3NbeF0uZ2V0U291cmNlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLnNhbmRib3ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2subG9hZGVyRnVuY3Rpb24gPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBibG9jay5mcmFtZUhlaWdodCA9IHRoaXMuYmxvY2tzW3hdLmZyYW1lSGVpZ2h0O1xuICAgICAgICAgICAgICAgIGJsb2NrLm9yaWdpbmFsVXJsID0gdGhpcy5ibG9ja3NbeF0ub3JpZ2luYWxVcmw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcGFnZS5ibG9ja3MucHVzaChibG9jayk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHBhZ2U7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgZ2VuZXJhdGVzIHRoZSBmdWxsIHBhZ2UsIHVzaW5nIHNrZWxldG9uLmh0bWxcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5mdWxsUGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcGFnZSA9IHRoaXM7Ly9yZWZlcmVuY2UgdG8gc2VsZiBmb3IgbGF0ZXJcbiAgICAgICAgICAgIHBhZ2Uuc2NyaXB0cyA9IFtdOy8vbWFrZSBzdXJlIGl0J3MgZW1wdHksIHdlJ2xsIHN0b3JlIHNjcmlwdCBVUkxzIGluIHRoZXJlIGxhdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBuZXdEb2NNYWluUGFyZW50ID0gJCgnaWZyYW1lI3NrZWxldG9uJykuY29udGVudHMoKS5maW5kKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9lbXB0eSBvdXQgdGhlIHNrZWxldG9uIGZpcnN0XG4gICAgICAgICAgICAkKCdpZnJhbWUjc2tlbGV0b24nKS5jb250ZW50cygpLmZpbmQoIGJDb25maWcucGFnZUNvbnRhaW5lciApLmh0bWwoJycpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3JlbW92ZSBvbGQgc2NyaXB0IHRhZ3NcbiAgICAgICAgICAgICQoJ2lmcmFtZSNza2VsZXRvbicpLmNvbnRlbnRzKCkuZmluZCggJ3NjcmlwdCcgKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgdGhlQ29udGVudHM7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIGkgaW4gdGhpcy5ibG9ja3MgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9ncmFiIHRoZSBibG9jayBjb250ZW50XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYmxvY2tzW2ldLnNhbmRib3ggIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGVDb250ZW50cyA9ICQoJyNzYW5kYm94ZXMgIycrdGhpcy5ibG9ja3NbaV0uc2FuZGJveCkuY29udGVudHMoKS5maW5kKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKS5jbG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGVDb250ZW50cyA9ICQodGhpcy5ibG9ja3NbaV0uZnJhbWVEb2N1bWVudC5ib2R5KS5maW5kKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKS5jbG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9yZW1vdmUgdmlkZW8gZnJhbWVDb3ZlcnNcbiAgICAgICAgICAgICAgICB0aGVDb250ZW50cy5maW5kKCcuZnJhbWVDb3ZlcicpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vcmVtb3ZlIHZpZGVvIGZyYW1lV3JhcHBlcnNcbiAgICAgICAgICAgICAgICB0aGVDb250ZW50cy5maW5kKCcudmlkZW9XcmFwcGVyJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNudCA9ICQodGhpcykuY29udGVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZXBsYWNlV2l0aChjbnQpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3JlbW92ZSBzdHlsZSBsZWZ0b3ZlcnMgZnJvbSB0aGUgc3R5bGUgZWRpdG9yXG4gICAgICAgICAgICAgICAgZm9yKCB2YXIga2V5IGluIGJDb25maWcuZWRpdGFibGVJdGVtcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlQ29udGVudHMuZmluZCgga2V5ICkuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUF0dHIoJ2RhdGEtc2VsZWN0b3InKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoJ291dGxpbmUnLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnb3V0bGluZS1vZmZzZXQnLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnY3Vyc29yJywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggJCh0aGlzKS5hdHRyKCdzdHlsZScpID09PSAnJyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3JlbW92ZSBzdHlsZSBsZWZ0b3ZlcnMgZnJvbSB0aGUgY29udGVudCBlZGl0b3JcbiAgICAgICAgICAgICAgICBmb3IgKCB2YXIgeCA9IDA7IHggPCBiQ29uZmlnLmVkaXRhYmxlQ29udGVudC5sZW5ndGg7ICsreCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlQ29udGVudHMuZmluZCggYkNvbmZpZy5lZGl0YWJsZUNvbnRlbnRbeF0gKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQXR0cignZGF0YS1zZWxlY3RvcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vYXBwZW5kIHRvIERPTSBpbiB0aGUgc2tlbGV0b25cbiAgICAgICAgICAgICAgICBuZXdEb2NNYWluUGFyZW50LmFwcGVuZCggJCh0aGVDb250ZW50cy5odG1sKCkpICk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9kbyB3ZSBuZWVkIHRvIGluamVjdCBhbnkgc2NyaXB0cz9cbiAgICAgICAgICAgICAgICB2YXIgc2NyaXB0cyA9ICQodGhpcy5ibG9ja3NbaV0uZnJhbWVEb2N1bWVudC5ib2R5KS5maW5kKCdzY3JpcHQnKTtcbiAgICAgICAgICAgICAgICB2YXIgdGhlSWZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJza2VsZXRvblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoIHNjcmlwdHMuc2l6ZSgpID4gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNjcmlwdHMuZWFjaChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2NyaXB0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggJCh0aGlzKS50ZXh0KCkgIT09ICcnICkgey8vc2NyaXB0IHRhZ3Mgd2l0aCBjb250ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0ID0gdGhlSWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdC5pbm5lckhUTUwgPSAkKHRoaXMpLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVJZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggJCh0aGlzKS5hdHRyKCdzcmMnKSAhPT0gbnVsbCAmJiBwYWdlLnNjcmlwdHMuaW5kZXhPZigkKHRoaXMpLmF0dHIoJ3NyYycpKSA9PT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy91c2UgaW5kZXhPZiB0byBtYWtlIHN1cmUgZWFjaCBzY3JpcHQgb25seSBhcHBlYXJzIG9uIHRoZSBwcm9kdWNlZCBwYWdlIG9uY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQgPSB0aGVJZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0LnNyYyA9ICQodGhpcykuYXR0cignc3JjJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlSWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2Uuc2NyaXB0cy5wdXNoKCQodGhpcykuYXR0cignc3JjJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5zY3JpcHRzKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBjbGVhciBvdXQgdGhpcyBwYWdlXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGJsb2NrID0gdGhpcy5ibG9ja3MucG9wKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlKCBibG9jayAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJsb2NrLmRlbGV0ZSgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJsb2NrID0gdGhpcy5ibG9ja3MucG9wKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy9sb29wIHRocm91Z2ggdGhlIGZyYW1lcy9ibG9ja3NcbiAgICAgICAgXG4gICAgICAgIGlmKCBwYWdlLmhhc093blByb3BlcnR5KCdibG9ja3MnKSApIHtcbiAgICAgICAgXG4gICAgICAgICAgICBmb3IoIHZhciB4ID0gMDsgeCA8IHBhZ2UuYmxvY2tzLmxlbmd0aDsgeCsrICkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgbmV3IEJsb2NrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgQmxvY2soKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHBhZ2UuYmxvY2tzW3hdLnNyYyA9IGFwcFVJLnNpdGVVcmwrXCJzaXRlcy9nZXRmcmFtZS9cIitwYWdlLmJsb2Nrc1t4XS5mcmFtZXNfaWQ7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9zYW5kYm94ZWQgYmxvY2s/XG4gICAgICAgICAgICAgICAgaWYoIHBhZ2UuYmxvY2tzW3hdLmZyYW1lc19zYW5kYm94ID09PSAnMScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbmV3QmxvY2suc2FuZGJveCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIG5ld0Jsb2NrLnNhbmRib3hfbG9hZGVyID0gcGFnZS5ibG9ja3NbeF0uZnJhbWVzX2xvYWRlcmZ1bmN0aW9uO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG5ld0Jsb2NrLmZyYW1lSUQgPSBwYWdlLmJsb2Nrc1t4XS5mcmFtZXNfaWQ7XG4gICAgICAgICAgICAgICAgbmV3QmxvY2suY3JlYXRlUGFyZW50TEkocGFnZS5ibG9ja3NbeF0uZnJhbWVzX2hlaWdodCk7XG4gICAgICAgICAgICAgICAgbmV3QmxvY2suY3JlYXRlRnJhbWUocGFnZS5ibG9ja3NbeF0pO1xuICAgICAgICAgICAgICAgIG5ld0Jsb2NrLmNyZWF0ZUZyYW1lQ292ZXIoKTtcbiAgICAgICAgICAgICAgICBuZXdCbG9jay5pbnNlcnRCbG9ja0ludG9Eb20odGhpcy5wYXJlbnRVTCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBibG9jayB0byB0aGUgbmV3IHBhZ2VcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2Nrcy5wdXNoKG5ld0Jsb2NrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvL2FkZCB0aGlzIHBhZ2UgdG8gdGhlIHNpdGUgb2JqZWN0XG4gICAgICAgIHNpdGUuc2l0ZVBhZ2VzLnB1c2goIHRoaXMgKTtcbiAgICAgICAgXG4gICAgICAgIC8vcGxhbnQgdGhlIG5ldyBVTCBpbiB0aGUgRE9NIChvbiB0aGUgY2FudmFzKVxuICAgICAgICBzaXRlLmRpdkNhbnZhcy5hcHBlbmRDaGlsZCh0aGlzLnBhcmVudFVMKTtcbiAgICAgICAgXG4gICAgICAgIC8vbWFrZSB0aGUgYmxvY2tzL2ZyYW1lcyBpbiBlYWNoIHBhZ2Ugc29ydGFibGVcbiAgICAgICAgXG4gICAgICAgIHZhciB0aGVQYWdlID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgICQodGhpcy5wYXJlbnRVTCkuc29ydGFibGUoe1xuICAgICAgICAgICAgcmV2ZXJ0OiB0cnVlLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IFwiZHJvcC1ob3ZlclwiLFxuICAgICAgICAgICAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmVmb3JlU3RvcDogZnVuY3Rpb24oZXZlbnQsIHVpKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3RlbXBsYXRlIG9yIHJlZ3VsYXIgYmxvY2s/XG4gICAgICAgICAgICAgICAgdmFyIGF0dHIgPSB1aS5pdGVtLmF0dHIoJ2RhdGEtZnJhbWVzJyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbmV3QmxvY2s7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYXR0ciAhPT0gdHlwZW9mIHVuZGVmaW5lZCAmJiBhdHRyICE9PSBmYWxzZSkgey8vdGVtcGxhdGUsIGJ1aWxkIGl0XG4gICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKCcjc3RhcnQnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vY2xlYXIgb3V0IGFsbCBibG9ja3Mgb24gdGhpcyBwYWdlICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGVQYWdlLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSB0aGUgbmV3IGZyYW1lc1xuICAgICAgICAgICAgICAgICAgICB2YXIgZnJhbWVJRHMgPSB1aS5pdGVtLmF0dHIoJ2RhdGEtZnJhbWVzJykuc3BsaXQoJy0nKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhlaWdodHMgPSB1aS5pdGVtLmF0dHIoJ2RhdGEtaGVpZ2h0cycpLnNwbGl0KCctJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1cmxzID0gdWkuaXRlbS5hdHRyKCdkYXRhLW9yaWdpbmFsdXJscycpLnNwbGl0KCctJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZm9yKCB2YXIgeCA9IDA7IHggPCBmcmFtZUlEcy5sZW5ndGg7IHgrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdCbG9jayA9IG5ldyBCbG9jaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QmxvY2suY3JlYXRlUGFyZW50TEkoaGVpZ2h0c1t4XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmcmFtZURhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZnJhbWVEYXRhLnNyYyA9IGFwcFVJLnNpdGVVcmwrJ3NpdGVzL2dldGZyYW1lLycrZnJhbWVJRHNbeF07XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFtZURhdGEuZnJhbWVzX29yaWdpbmFsX3VybCA9IGFwcFVJLnNpdGVVcmwrJ3NpdGVzL2dldGZyYW1lLycrZnJhbWVJRHNbeF07XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFtZURhdGEuZnJhbWVzX2hlaWdodCA9IGhlaWdodHNbeF07XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Jsb2NrLmNyZWF0ZUZyYW1lKCBmcmFtZURhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Jsb2NrLmNyZWF0ZUZyYW1lQ292ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Jsb2NrLmluc2VydEJsb2NrSW50b0RvbSh0aGVQYWdlLnBhcmVudFVMKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgdGhlIGJsb2NrIHRvIHRoZSBuZXcgcGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlUGFnZS5ibG9ja3MucHVzaChuZXdCbG9jayk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZHJvcHBlZCBlbGVtZW50LCBzbyB3ZSd2ZSBnb3QgcGVuZGluZyBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXRlLnNldFBlbmRpbmdDaGFuZ2VzKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vc2V0IHRoZSB0ZW1wYXRlSURcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRlclVJLnRlbXBsYXRlSUQgPSB1aS5pdGVtLmF0dHIoJ2RhdGEtcGFnZWlkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9tYWtlIHN1cmUgbm90aGluZyBnZXRzIGRyb3BwZWQgaW4gdGhlIGxzaXRcbiAgICAgICAgICAgICAgICAgICAgdWkuaXRlbS5odG1sKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIGRyYWcgcGxhY2UgaG9sZGVyXG4gICAgICAgICAgICAgICAgICAgICQoJ2JvZHkgLnVpLXNvcnRhYmxlLWhlbHBlcicpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9IGVsc2Ugey8vcmVndWxhciBibG9ja1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2FyZSB3ZSBkZWFsaW5nIHdpdGggYSBuZXcgYmxvY2sgYmVpbmcgZHJvcHBlZCBvbnRvIHRoZSBjYW52YXMsIG9yIGEgcmVvcmRlcmluZyBvZyBibG9ja3MgYWxyZWFkeSBvbiB0aGUgY2FudmFzP1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiggdWkuaXRlbS5maW5kKCcuZnJhbWVDb3ZlciA+IGJ1dHRvbicpLnNpemUoKSA+IDAgKSB7Ly9yZS1vcmRlcmluZyBvZiBibG9ja3Mgb24gY2FudmFzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9ubyBuZWVkIHRvIGNyZWF0ZSBhIG5ldyBibG9jayBvYmplY3QsIHdlIHNpbXBseSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGUgcG9zaXRpb24gb2YgdGhlIGV4aXN0aW5nIGJsb2NrIGluIHRoZSBTaXRlIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pcyBjaGFuZ2VkIHRvIHJlZmxlY3QgdGhlIG5ldyBwb3NpdGlvbiBvZiB0aGUgYmxvY2sgb24gdGggY2FudmFzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZyYW1lSUQgPSB1aS5pdGVtLmZpbmQoJ2lmcmFtZScpLmF0dHIoJ2lkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3UG9zID0gdWkuaXRlbS5pbmRleCgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpdGUuYWN0aXZlUGFnZS5zZXRQb3NpdGlvbihmcmFtZUlELCBuZXdQb3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Ugey8vbmV3IGJsb2NrIG9uIGNhbnZhc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvL25ldyBibG9jayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdCbG9jayA9IG5ldyBCbG9jaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Jsb2NrLnBsYWNlT25DYW52YXModWkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YXJ0OiBmdW5jdGlvbihldmVudCwgdWkpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggdWkuaXRlbS5maW5kKCcuZnJhbWVDb3ZlcicpLnNpemUoKSAhPT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRlclVJLmZyYW1lQ29udGVudHMgPSB1aS5pdGVtLmZpbmQoJ2lmcmFtZScpLmNvbnRlbnRzKCkuZmluZCggYkNvbmZpZy5wYWdlQ29udGFpbmVyICkuaHRtbCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG92ZXI6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQoJyNzdGFydCcpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvL2FkZCB0byB0aGUgcGFnZXMgbWVudVxuICAgICAgICB0aGlzLm1lbnVJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnTEknKTtcbiAgICAgICAgdGhpcy5tZW51SXRlbS5pbm5lckhUTUwgPSB0aGlzLnBhZ2VNZW51VGVtcGxhdGU7XG4gICAgICAgIFxuICAgICAgICAkKHRoaXMubWVudUl0ZW0pLmZpbmQoJ2E6Zmlyc3QnKS50ZXh0KHBhZ2VOYW1lKS5hdHRyKCdocmVmJywgJyNwYWdlJytjb3VudGVyKTtcbiAgICAgICAgXG4gICAgICAgIHZhciB0aGVMaW5rID0gJCh0aGlzLm1lbnVJdGVtKS5maW5kKCdhOmZpcnN0JykuZ2V0KDApO1xuICAgICAgICBcbiAgICAgICAgLy9iaW5kIHNvbWUgZXZlbnRzXG4gICAgICAgIHRoaXMubWVudUl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLm1lbnVJdGVtLnF1ZXJ5U2VsZWN0b3IoJ2EuZmlsZUVkaXQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5tZW51SXRlbS5xdWVyeVNlbGVjdG9yKCdhLmZpbGVTYXZlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMubWVudUl0ZW0ucXVlcnlTZWxlY3RvcignYS5maWxlRGVsJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIFxuICAgICAgICAvL2FkZCB0byB0aGUgcGFnZSBsaW5rIGRyb3Bkb3duXG4gICAgICAgIHRoaXMubGlua3NEcm9wZG93bkl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdPUFRJT04nKTtcbiAgICAgICAgdGhpcy5saW5rc0Ryb3Bkb3duSXRlbS5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgcGFnZU5hbWUrXCIuaHRtbFwiKTtcbiAgICAgICAgdGhpcy5saW5rc0Ryb3Bkb3duSXRlbS50ZXh0ID0gcGFnZU5hbWU7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGJ1aWxkZXJVSS5kcm9wZG93blBhZ2VMaW5rcy5hcHBlbmRDaGlsZCggdGhpcy5saW5rc0Ryb3Bkb3duSXRlbSApO1xuICAgICAgICBcbiAgICAgICAgc2l0ZS5wYWdlc01lbnUuYXBwZW5kQ2hpbGQodGhpcy5tZW51SXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBQYWdlLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcImNsaWNrXCI6IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnZmlsZUVkaXQnKSApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZGl0UGFnZU5hbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmaWxlU2F2ZScpICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVBhZ2VOYW1lRXZlbnQoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZpbGVEZWwnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGVQYWdlID0gdGhpcztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJChidWlsZGVyVUkubW9kYWxEZWxldGVQYWdlKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJChidWlsZGVyVUkubW9kYWxEZWxldGVQYWdlKS5vZmYoJ2NsaWNrJywgJyNkZWxldGVQYWdlQ29uZmlybScpLm9uKCdjbGljaycsICcjZGVsZXRlUGFnZUNvbmZpcm0nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlUGFnZS5kZWxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJChidWlsZGVyVUkubW9kYWxEZWxldGVQYWdlKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFBhZ2UoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICAvKlxuICAgICAgICBCbG9jayBjb25zdHJ1Y3RvclxuICAgICovXG4gICAgZnVuY3Rpb24gQmxvY2sgKCkge1xuICAgICAgICBcbiAgICAgICAgdGhpcy5mcmFtZUlEID0gMDtcbiAgICAgICAgdGhpcy5zYW5kYm94ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2FuZGJveF9sb2FkZXIgPSAnJztcbiAgICAgICAgdGhpcy5zdGF0dXMgPSAnJzsvLycnLCAnY2hhbmdlZCcgb3IgJ25ldydcbiAgICAgICAgdGhpcy5vcmlnaW5hbFVybCA9ICcnO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5wYXJlbnRMSSA9IHt9O1xuICAgICAgICB0aGlzLmZyYW1lQ292ZXIgPSB7fTtcbiAgICAgICAgdGhpcy5mcmFtZSA9IHt9O1xuICAgICAgICB0aGlzLmZyYW1lRG9jdW1lbnQgPSB7fTtcbiAgICAgICAgdGhpcy5mcmFtZUhlaWdodCA9IDA7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmFubm90ID0ge307XG4gICAgICAgIHRoaXMuYW5ub3RUaW1lb3V0ID0ge307XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgY3JlYXRlcyB0aGUgcGFyZW50IGNvbnRhaW5lciAoTEkpXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuY3JlYXRlUGFyZW50TEkgPSBmdW5jdGlvbihoZWlnaHQpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0xJJyk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudExJLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnZWxlbWVudCcpO1xuICAgICAgICAgICAgLy90aGlzLnBhcmVudExJLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnaGVpZ2h0OiAnK2hlaWdodCsncHgnKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGNyZWF0ZXMgdGhlIGlmcmFtZSBvbiB0aGUgY2FudmFzXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUgPSBmdW5jdGlvbihmcmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnSUZSQU1FJyk7XG4gICAgICAgICAgICB0aGlzLmZyYW1lLnNldEF0dHJpYnV0ZSgnZnJhbWVib3JkZXInLCAwKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUuc2V0QXR0cmlidXRlKCdzY3JvbGxpbmcnLCAwKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUuc2V0QXR0cmlidXRlKCdzcmMnLCBmcmFtZS5zcmMpO1xuICAgICAgICAgICAgdGhpcy5mcmFtZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWx1cmwnLCBmcmFtZS5mcmFtZXNfb3JpZ2luYWxfdXJsKTtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxVcmwgPSBmcmFtZS5mcmFtZXNfb3JpZ2luYWxfdXJsO1xuICAgICAgICAgICAgLy90aGlzLmZyYW1lLnNldEF0dHJpYnV0ZSgnZGF0YS1oZWlnaHQnLCBmcmFtZS5mcmFtZXNfaGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVIZWlnaHQgPSBmcmFtZS5mcmFtZXNfaGVpZ2h0O1xuICAgICAgICAgICAgLy90aGlzLmZyYW1lLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnYmFja2dyb3VuZDogJytcIiNmZmZmZmYgdXJsKCdcIithcHBVSS5iYXNlVXJsK1wiaW1hZ2VzL2xvYWRpbmcuZ2lmJykgNTAlIDUwJSBuby1yZXBlYXRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy5mcmFtZSkudW5pcXVlSWQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9zYW5kYm94P1xuICAgICAgICAgICAgaWYoIHRoaXMuc2FuZGJveCAhPT0gZmFsc2UgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtbG9hZGVyZnVuY3Rpb24nLCB0aGlzLnNhbmRib3hfbG9hZGVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lLnNldEF0dHJpYnV0ZSgnZGF0YS1zYW5kYm94JywgdGhpcy5zYW5kYm94KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3JlY3JlYXRlIHRoZSBzYW5kYm94ZWQgaWZyYW1lIGVsc2V3aGVyZVxuICAgICAgICAgICAgICAgIHZhciBzYW5kYm94ZWRGcmFtZSA9ICQoJzxpZnJhbWUgc3JjPVwiJytmcmFtZS5zcmMrJ1wiIGlkPVwiJyt0aGlzLnNhbmRib3grJ1wiIHNhbmRib3g9XCJhbGxvdy1zYW1lLW9yaWdpblwiPjwvaWZyYW1lPicpO1xuICAgICAgICAgICAgICAgICQoJyNzYW5kYm94ZXMnKS5hcHBlbmQoIHNhbmRib3hlZEZyYW1lICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgaW5zZXJ0IHRoZSBpZnJhbWUgaW50byB0aGUgRE9NIG9uIHRoZSBjYW52YXNcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbnNlcnRCbG9ja0ludG9Eb20gPSBmdW5jdGlvbih0aGVVTCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnBhcmVudExJLmFwcGVuZENoaWxkKHRoaXMuZnJhbWUpO1xuICAgICAgICAgICAgdGhlVUwuYXBwZW5kQ2hpbGQoIHRoaXMucGFyZW50TEkgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5mcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcywgZmFsc2UpO1xuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHNldHMgdGhlIGZyYW1lIGRvY3VtZW50IGZvciB0aGUgYmxvY2sncyBpZnJhbWVcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRGcmFtZURvY3VtZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vc2V0IHRoZSBmcmFtZSBkb2N1bWVudCBhcyB3ZWxsXG4gICAgICAgICAgICBpZiggdGhpcy5mcmFtZS5jb250ZW50RG9jdW1lbnQgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZURvY3VtZW50ID0gdGhpcy5mcmFtZS5jb250ZW50RG9jdW1lbnQ7ICAgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVEb2N1bWVudCA9IHRoaXMuZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5oZWlnaHRBZGp1c3RtZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBjcmVhdGVzIHRoZSBmcmFtZSBjb3ZlciBhbmQgYmxvY2sgYWN0aW9uIGJ1dHRvblxuICAgICAgICAqL1xuICAgICAgICB0aGlzLmNyZWF0ZUZyYW1lQ292ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9idWlsZCB0aGUgZnJhbWUgY292ZXIgYW5kIGJsb2NrIGFjdGlvbiBidXR0b25zXG4gICAgICAgICAgICB0aGlzLmZyYW1lQ292ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVDb3Zlci5jbGFzc0xpc3QuYWRkKCdmcmFtZUNvdmVyJyk7XG4gICAgICAgICAgICB0aGlzLmZyYW1lQ292ZXIuY2xhc3NMaXN0LmFkZCgnZnJlc2gnKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVDb3Zlci5zdHlsZS5oZWlnaHQgPSB0aGlzLmZyYW1lSGVpZ2h0K1wicHhcIjtcbiAgICAgICAgICAgIHZhciBwcmVsb2FkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKTtcbiAgICAgICAgICAgIHByZWxvYWRlci5jbGFzc0xpc3QuYWRkKCdwcmVsb2FkZXInKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgZGVsQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnQlVUVE9OJyk7XG4gICAgICAgICAgICBkZWxCdXR0b24uc2V0QXR0cmlidXRlKCdjbGFzcycsICdidG4gYnRuLWRhbmdlciBkZWxldGVCbG9jaycpO1xuICAgICAgICAgICAgZGVsQnV0dG9uLnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICAgICAgICAgIGRlbEJ1dHRvbi5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJmdWktdHJhc2hcIj48L3NwYW4+IHJlbW92ZSc7XG4gICAgICAgICAgICBkZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHJlc2V0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnQlVUVE9OJyk7XG4gICAgICAgICAgICByZXNldEJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2J0biBidG4td2FybmluZyByZXNldEJsb2NrJyk7XG4gICAgICAgICAgICByZXNldEJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnYnV0dG9uJyk7XG4gICAgICAgICAgICByZXNldEJ1dHRvbi5pbm5lckhUTUwgPSAnPGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoXCI+PC9pPiByZXNldCc7XG4gICAgICAgICAgICByZXNldEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgaHRtbEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0JVVFRPTicpO1xuICAgICAgICAgICAgaHRtbEJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2J0biBidG4taW52ZXJzZSBodG1sQmxvY2snKTtcbiAgICAgICAgICAgIGh0bWxCdXR0b24uc2V0QXR0cmlidXRlKCd0eXBlJywgJ2J1dHRvbicpO1xuICAgICAgICAgICAgaHRtbEJ1dHRvbi5pbm5lckhUTUwgPSAnPGkgY2xhc3M9XCJmYSBmYS1jb2RlXCI+PC9pPiBzb3VyY2UnO1xuICAgICAgICAgICAgaHRtbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmZyYW1lQ292ZXIuYXBwZW5kQ2hpbGQoZGVsQnV0dG9uKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVDb3Zlci5hcHBlbmRDaGlsZChyZXNldEJ1dHRvbik7XG4gICAgICAgICAgICB0aGlzLmZyYW1lQ292ZXIuYXBwZW5kQ2hpbGQoaHRtbEJ1dHRvbik7XG5cbiAgICAgICAgICAgIHRoaXMuZnJhbWVDb3Zlci5hcHBlbmRDaGlsZChwcmVsb2FkZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5hcHBlbmRDaGlsZCh0aGlzLmZyYW1lQ292ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgYXV0b21hdGljYWxseSBjb3JyZWN0cyB0aGUgaGVpZ2h0IG9mIHRoZSBibG9jaydzIGlmcmFtZSBkZXBlbmRpbmcgb24gaXRzIGNvbnRlbnRcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5oZWlnaHRBZGp1c3RtZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwYWdlQ29udGFpbmVyID0gdGhpcy5mcmFtZURvY3VtZW50LmJvZHk7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gcGFnZUNvbnRhaW5lci5zY3JvbGxIZWlnaHQ7XG5cbiAgICAgICAgICAgIHZhciBmcmFtZUVsZW1lbnRIZWlnaHQgPSB0aGlzLmZyYW1lSGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAodGhpcy5mcmFtZUhlaWdodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWUuc3R5bGUuaGVpZ2h0ID0gZnJhbWVFbGVtZW50SGVpZ2h0K1wicHhcIjtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudExJLnN0eWxlLmhlaWdodCA9IGZyYW1lRWxlbWVudEhlaWdodCtcInB4XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZUNvdmVyLnN0eWxlLmhlaWdodCA9IGZyYW1lRWxlbWVudEhlaWdodCtcInB4XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZUhlaWdodCA9IGZyYW1lRWxlbWVudEhlaWdodDtcbiAgICAgICAgICAgIH0gIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWUuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0K1wicHhcIjtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudExJLnN0eWxlLmhlaWdodCA9IGhlaWdodCtcInB4XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZUNvdmVyLnN0eWxlLmhlaWdodCA9IGhlaWdodCtcInB4XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZUhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBkZWxldGVzIGEgYmxvY2tcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9yZW1vdmUgZnJvbSBET00vY2FudmFzIHdpdGggYSBuaWNlIGFuaW1hdGlvblxuICAgICAgICAgICAgJCh0aGlzLmZyYW1lLnBhcmVudE5vZGUpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzaXRlLmFjdGl2ZVBhZ2UuaXNFbXB0eSgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vcmVtb3ZlIGZyb20gYmxvY2tzIGFycmF5IGluIHRoZSBhY3RpdmUgcGFnZVxuICAgICAgICAgICAgc2l0ZS5hY3RpdmVQYWdlLmRlbGV0ZUJsb2NrKHRoaXMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3NhbmJveFxuICAgICAgICAgICAgaWYoIHRoaXMuc2FuYmRveCApIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggdGhpcy5zYW5kYm94ICkucmVtb3ZlKCk7ICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZWxlbWVudCB3YXMgZGVsZXRlZCwgc28gd2UndmUgZ290IHBlbmRpbmcgY2hhbmdlXG4gICAgICAgICAgICBzaXRlLnNldFBlbmRpbmdDaGFuZ2VzKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHJlc2V0cyBhIGJsb2NrIHRvIGl0J3Mgb3JpZ25hbCBzdGF0ZVxuICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vcmVzZXQgZnJhbWUgYnkgcmVsb2FkaW5nIGl0XG4gICAgICAgICAgICB0aGlzLmZyYW1lLmNvbnRlbnRXaW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vc2FuZGJveD9cbiAgICAgICAgICAgIGlmKCB0aGlzLnNhbmRib3ggKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNhbmRib3hGcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuc2FuZGJveCkuY29udGVudFdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTsgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2VsZW1lbnQgd2FzIGRlbGV0ZWQsIHNvIHdlJ3ZlIGdvdCBwZW5kaW5nIGNoYW5nZXNcbiAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgbGF1bmNoZXMgdGhlIHNvdXJjZSBjb2RlIGVkaXRvclxuICAgICAgICAqL1xuICAgICAgICB0aGlzLnNvdXJjZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2hpZGUgdGhlIGlmcmFtZVxuICAgICAgICAgICAgdGhpcy5mcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2Rpc2FibGUgc29ydGFibGUgb24gdGhlIHBhcmVudExJXG4gICAgICAgICAgICAkKHRoaXMucGFyZW50TEkucGFyZW50Tm9kZSkuc29ydGFibGUoJ2Rpc2FibGUnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9idWlsdCBlZGl0b3IgZWxlbWVudFxuICAgICAgICAgICAgdmFyIHRoZUVkaXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpO1xuICAgICAgICAgICAgdGhlRWRpdG9yLmNsYXNzTGlzdC5hZGQoJ2FjZUVkaXRvcicpO1xuICAgICAgICAgICAgJCh0aGVFZGl0b3IpLnVuaXF1ZUlkKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucGFyZW50TEkuYXBwZW5kQ2hpbGQodGhlRWRpdG9yKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9idWlsZCBhbmQgYXBwZW5kIGVycm9yIGRyYXdlclxuICAgICAgICAgICAgdmFyIG5ld0xJID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnTEknKTtcbiAgICAgICAgICAgIHZhciBlcnJvckRyYXdlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpO1xuICAgICAgICAgICAgZXJyb3JEcmF3ZXIuY2xhc3NMaXN0LmFkZCgnZXJyb3JEcmF3ZXInKTtcbiAgICAgICAgICAgIGVycm9yRHJhd2VyLnNldEF0dHJpYnV0ZSgnaWQnLCAnZGl2X2Vycm9yRHJhd2VyJyk7XG4gICAgICAgICAgICBlcnJvckRyYXdlci5pbm5lckhUTUwgPSAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1lbWJvc3NlZCBidG4tZGVmYXVsdCBidXR0b25fY2xlYXJFcnJvckRyYXdlclwiIGlkPVwiYnV0dG9uX2NsZWFyRXJyb3JEcmF3ZXJcIj5DTEVBUjwvYnV0dG9uPic7XG4gICAgICAgICAgICBuZXdMSS5hcHBlbmRDaGlsZChlcnJvckRyYXdlcik7XG4gICAgICAgICAgICBlcnJvckRyYXdlci5xdWVyeVNlbGVjdG9yKCdidXR0b24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMucGFyZW50TEkucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobmV3TEksIHRoaXMucGFyZW50TEkubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciB0aGVJZCA9IHRoZUVkaXRvci5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG4gICAgICAgICAgICB2YXIgZWRpdG9yID0gYWNlLmVkaXQoIHRoZUlkICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwYWdlQ29udGFpbmVyID0gdGhpcy5mcmFtZURvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGJDb25maWcucGFnZUNvbnRhaW5lciApO1xuICAgICAgICAgICAgdmFyIHRoZUhUTUwgPSBwYWdlQ29udGFpbmVyLmlubmVySFRNTDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZWRpdG9yLnNldFZhbHVlKCB0aGVIVE1MICk7XG4gICAgICAgICAgICBlZGl0b3Iuc2V0VGhlbWUoXCJhY2UvdGhlbWUvdHdpbGlnaHRcIik7XG4gICAgICAgICAgICBlZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE1vZGUoXCJhY2UvbW9kZS9odG1sXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgYmxvY2sgPSB0aGlzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVkaXRvci5nZXRTZXNzaW9uKCkub24oXCJjaGFuZ2VBbm5vdGF0aW9uXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYmxvY2suYW5ub3QgPSBlZGl0b3IuZ2V0U2Vzc2lvbigpLmdldEFubm90YXRpb25zKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGJsb2NrLmFubm90VGltZW91dCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGltZW91dENvdW50O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCAkKCcjZGl2X2Vycm9yRHJhd2VyIHAnKS5zaXplKCkgPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXRDb3VudCA9IGJDb25maWcuc291cmNlQ29kZUVkaXRTeW50YXhEZWxheTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0Q291bnQgPSAxMDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJsb2NrLmFubm90VGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gYmxvY2suYW5ub3Qpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChibG9jay5hbm5vdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggYmxvY2suYW5ub3Rba2V5XS50ZXh0ICE9PSBcIlN0YXJ0IHRhZyBzZWVuIHdpdGhvdXQgc2VlaW5nIGEgZG9jdHlwZSBmaXJzdC4gRXhwZWN0ZWQgZS5nLiA8IURPQ1RZUEUgaHRtbD4uXCIgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdMaW5lID0gJCgnPHA+PC9wPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3S2V5ID0gJCgnPGI+JytibG9jay5hbm5vdFtrZXldLnR5cGUrJzogPC9iPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3SW5mbyA9ICQoJzxzcGFuPiAnK2Jsb2NrLmFubm90W2tleV0udGV4dCArIFwib24gbGluZSBcIiArIFwiIDxiPlwiICsgYmxvY2suYW5ub3Rba2V5XS5yb3crJzwvYj48L3NwYW4+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0xpbmUuYXBwZW5kKCBuZXdLZXkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3TGluZS5hcHBlbmQoIG5ld0luZm8gKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkaXZfZXJyb3JEcmF3ZXInKS5hcHBlbmQoIG5ld0xpbmUgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoICQoJyNkaXZfZXJyb3JEcmF3ZXInKS5jc3MoJ2Rpc3BsYXknKSA9PT0gJ25vbmUnICYmICQoJyNkaXZfZXJyb3JEcmF3ZXInKS5maW5kKCdwJykuc2l6ZSgpID4gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkaXZfZXJyb3JEcmF3ZXInKS5zbGlkZURvd24oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSwgdGltZW91dENvdW50KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vYnV0dG9uc1xuICAgICAgICAgICAgdmFyIGNhbmNlbEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0JVVFRPTicpO1xuICAgICAgICAgICAgY2FuY2VsQnV0dG9uLnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICAgICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4nKTtcbiAgICAgICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4tZGFuZ2VyJyk7XG4gICAgICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LmFkZCgnZWRpdENhbmNlbEJ1dHRvbicpO1xuICAgICAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bi13aWRlJyk7XG4gICAgICAgICAgICBjYW5jZWxCdXR0b24uaW5uZXJIVE1MID0gJzxzcGFuIGNsYXNzPVwiZnVpLWNyb3NzXCI+PC9zcGFuPiBDYW5jZWwnO1xuICAgICAgICAgICAgY2FuY2VsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcywgZmFsc2UpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgc2F2ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0JVVFRPTicpO1xuICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnYnV0dG9uJyk7XG4gICAgICAgICAgICBzYXZlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bicpO1xuICAgICAgICAgICAgc2F2ZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4tcHJpbWFyeScpO1xuICAgICAgICAgICAgc2F2ZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdlZGl0U2F2ZUJ1dHRvbicpO1xuICAgICAgICAgICAgc2F2ZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4td2lkZScpO1xuICAgICAgICAgICAgc2F2ZUJ1dHRvbi5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJmdWktY2hlY2tcIj48L3NwYW4+IFNhdmUnO1xuICAgICAgICAgICAgc2F2ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGJ1dHRvbldyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKTtcbiAgICAgICAgICAgIGJ1dHRvbldyYXBwZXIuY2xhc3NMaXN0LmFkZCgnZWRpdG9yQnV0dG9ucycpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBidXR0b25XcmFwcGVyLmFwcGVuZENoaWxkKCBjYW5jZWxCdXR0b24gKTtcbiAgICAgICAgICAgIGJ1dHRvbldyYXBwZXIuYXBwZW5kQ2hpbGQoIHNhdmVCdXR0b24gKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5hcHBlbmRDaGlsZCggYnV0dG9uV3JhcHBlciApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBidWlsZGVyVUkuYWNlRWRpdG9yc1sgdGhlSWQgXSA9IGVkaXRvcjtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBjYW5jZWxzIHRoZSBibG9jayBzb3VyY2UgY29kZSBlZGl0b3JcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jYW5jZWxTb3VyY2VCbG9jayA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAvL2VuYWJsZSBkcmFnZ2FibGUgb24gdGhlIExJXG4gICAgICAgICAgICAkKHRoaXMucGFyZW50TEkucGFyZW50Tm9kZSkuc29ydGFibGUoJ2VuYWJsZScpO1xuXHRcdFxuICAgICAgICAgICAgLy9kZWxldGUgdGhlIGVycm9yRHJhd2VyXG4gICAgICAgICAgICAkKHRoaXMucGFyZW50TEkubmV4dFNpYmxpbmcpLnJlbW92ZSgpO1xuICAgICAgICBcbiAgICAgICAgICAgIC8vZGVsZXRlIHRoZSBlZGl0b3JcbiAgICAgICAgICAgIHRoaXMucGFyZW50TEkucXVlcnlTZWxlY3RvcignLmFjZUVkaXRvcicpLnJlbW92ZSgpO1xuICAgICAgICAgICAgJCh0aGlzLmZyYW1lKS5mYWRlSW4oNTAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJCh0aGlzLnBhcmVudExJLnF1ZXJ5U2VsZWN0b3IoJy5lZGl0b3JCdXR0b25zJykpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICB1cGRhdGVzIHRoZSBibG9ja3Mgc291cmNlIGNvZGVcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zYXZlU291cmNlQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9lbmFibGUgZHJhZ2dhYmxlIG9uIHRoZSBMSVxuICAgICAgICAgICAgJCh0aGlzLnBhcmVudExJLnBhcmVudE5vZGUpLnNvcnRhYmxlKCdlbmFibGUnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHRoZUlkID0gdGhpcy5wYXJlbnRMSS5xdWVyeVNlbGVjdG9yKCcuYWNlRWRpdG9yJykuZ2V0QXR0cmlidXRlKCdpZCcpO1xuICAgICAgICAgICAgdmFyIHRoZUNvbnRlbnQgPSBidWlsZGVyVUkuYWNlRWRpdG9yc1t0aGVJZF0uZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9kZWxldGUgdGhlIGVycm9yRHJhd2VyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2X2Vycm9yRHJhd2VyJykucGFyZW50Tm9kZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9kZWxldGUgdGhlIGVkaXRvclxuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5xdWVyeVNlbGVjdG9yKCcuYWNlRWRpdG9yJykucmVtb3ZlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vdXBkYXRlIHRoZSBmcmFtZSdzIGNvbnRlbnRcbiAgICAgICAgICAgIHRoaXMuZnJhbWVEb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKS5pbm5lckhUTUwgPSB0aGVDb250ZW50O1xuICAgICAgICAgICAgdGhpcy5mcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9zYW5kYm94ZWQ/XG4gICAgICAgICAgICBpZiggdGhpcy5zYW5kYm94ICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBzYW5kYm94RnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggdGhpcy5zYW5kYm94ICk7XG4gICAgICAgICAgICAgICAgdmFyIHNhbmRib3hGcmFtZURvY3VtZW50ID0gc2FuZGJveEZyYW1lLmNvbnRlbnREb2N1bWVudCB8fCBzYW5kYm94RnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBidWlsZGVyVUkudGVtcEZyYW1lID0gc2FuZGJveEZyYW1lO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNhbmRib3hGcmFtZURvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGJDb25maWcucGFnZUNvbnRhaW5lciApLmlubmVySFRNTCA9IHRoZUNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vZG8gd2UgbmVlZCB0byBleGVjdXRlIGEgbG9hZGVyIGZ1bmN0aW9uP1xuICAgICAgICAgICAgICAgIGlmKCB0aGlzLnNhbmRib3hfbG9hZGVyICE9PSAnJyApIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIHZhciBjb2RlVG9FeGVjdXRlID0gXCJzYW5kYm94RnJhbWUuY29udGVudFdpbmRvdy5cIit0aGlzLnNhbmRib3hfbG9hZGVyK1wiKClcIjtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRtcEZ1bmMgPSBuZXcgRnVuY3Rpb24oY29kZVRvRXhlY3V0ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRtcEZ1bmMoKTtcbiAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKHRoaXMucGFyZW50TEkucXVlcnlTZWxlY3RvcignLmVkaXRvckJ1dHRvbnMnKSkuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2FkanVzdCBoZWlnaHQgb2YgdGhlIGZyYW1lXG4gICAgICAgICAgICB0aGlzLmhlaWdodEFkanVzdG1lbnQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9uZXcgcGFnZSBhZGRlZCwgd2UndmUgZ290IHBlbmRpbmcgY2hhbmdlc1xuICAgICAgICAgICAgc2l0ZS5zZXRQZW5kaW5nQ2hhbmdlcyh0cnVlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9ibG9jayBoYXMgY2hhbmdlZFxuICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSAnY2hhbmdlZCc7XG5cbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgY2xlYXJzIG91dCB0aGUgZXJyb3IgZHJhd2VyXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuY2xlYXJFcnJvckRyYXdlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgcHMgPSB0aGlzLnBhcmVudExJLm5leHRTaWJsaW5nLnF1ZXJ5U2VsZWN0b3JBbGwoJ3AnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBwcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICBwc1tpXS5yZW1vdmUoKTsgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHRvZ2dsZXMgdGhlIHZpc2liaWxpdHkgb2YgdGhpcyBibG9jaydzIGZyYW1lQ292ZXJcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy50b2dnbGVDb3ZlciA9IGZ1bmN0aW9uKG9uT3JPZmYpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIG9uT3JPZmYgPT09ICdPbicgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5xdWVyeVNlbGVjdG9yKCcuZnJhbWVDb3ZlcicpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmKCBvbk9yT2ZmID09PSAnT2ZmJyApIHtcbiAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudExJLnF1ZXJ5U2VsZWN0b3IoJy5mcmFtZUNvdmVyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICByZXR1cm5zIHRoZSBmdWxsIHNvdXJjZSBjb2RlIG9mIHRoZSBibG9jaydzIGZyYW1lXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0U291cmNlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBcIjxodG1sPlwiO1xuICAgICAgICAgICAgc291cmNlICs9IHRoaXMuZnJhbWVEb2N1bWVudC5oZWFkLm91dGVySFRNTDtcbiAgICAgICAgICAgIHNvdXJjZSArPSB0aGlzLmZyYW1lRG9jdW1lbnQuYm9keS5vdXRlckhUTUw7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgcGxhY2VzIGEgZHJhZ2dlZC9kcm9wcGVkIGJsb2NrIGZyb20gdGhlIGxlZnQgc2lkZWJhciBvbnRvIHRoZSBjYW52YXNcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5wbGFjZU9uQ2FudmFzID0gZnVuY3Rpb24odWkpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9mcmFtZSBkYXRhLCB3ZSdsbCBuZWVkIHRoaXMgYmVmb3JlIG1lc3Npbmcgd2l0aCB0aGUgaXRlbSdzIGNvbnRlbnQgSFRNTFxuICAgICAgICAgICAgdmFyIGZyYW1lRGF0YSA9IHt9LCBhdHRyO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIHVpLml0ZW0uZmluZCgnaWZyYW1lJykuc2l6ZSgpID4gMCApIHsvL2lmcmFtZSB0aHVtYm5haWxcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZnJhbWVEYXRhLnNyYyA9IHVpLml0ZW0uZmluZCgnaWZyYW1lJykuYXR0cignc3JjJyk7XG4gICAgICAgICAgICAgICAgZnJhbWVEYXRhLmZyYW1lc19vcmlnaW5hbF91cmwgPSB1aS5pdGVtLmZpbmQoJ2lmcmFtZScpLmF0dHIoJ3NyYycpO1xuICAgICAgICAgICAgICAgIGZyYW1lRGF0YS5mcmFtZXNfaGVpZ2h0ID0gdWkuaXRlbS5oZWlnaHQoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9zYW5kYm94ZWQgYmxvY2s/XG4gICAgICAgICAgICAgICAgYXR0ciA9IHVpLml0ZW0uZmluZCgnaWZyYW1lJykuYXR0cignc2FuZGJveCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGF0dHIgIT09IHR5cGVvZiB1bmRlZmluZWQgJiYgYXR0ciAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYW5kYm94ID0gc2l0ZUJ1aWxkZXJVdGlscy5nZXRSYW5kb21BcmJpdHJhcnkoMTAwMDAsIDEwMDAwMDAwMDApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhbmRib3hfbG9hZGVyID0gdWkuaXRlbS5maW5kKCdpZnJhbWUnKS5hdHRyKCdkYXRhLWxvYWRlcmZ1bmN0aW9uJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIHsvL2ltYWdlIHRodW1ibmFpbFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmcmFtZURhdGEuc3JjID0gdWkuaXRlbS5maW5kKCdpbWcnKS5hdHRyKCdkYXRhLXNyY2MnKTtcbiAgICAgICAgICAgICAgICBmcmFtZURhdGEuZnJhbWVzX29yaWdpbmFsX3VybCA9IHVpLml0ZW0uZmluZCgnaW1nJykuYXR0cignZGF0YS1zcmNjJyk7XG4gICAgICAgICAgICAgICAgZnJhbWVEYXRhLmZyYW1lc19oZWlnaHQgPSB1aS5pdGVtLmZpbmQoJ2ltZycpLmF0dHIoJ2RhdGEtaGVpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3NhbmRib3hlZCBibG9jaz9cbiAgICAgICAgICAgICAgICBhdHRyID0gdWkuaXRlbS5maW5kKCdpbWcnKS5hdHRyKCdkYXRhLXNhbmRib3gnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhdHRyICE9PSB0eXBlb2YgdW5kZWZpbmVkICYmIGF0dHIgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2FuZGJveCA9IHNpdGVCdWlsZGVyVXRpbHMuZ2V0UmFuZG9tQXJiaXRyYXJ5KDEwMDAwLCAxMDAwMDAwMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYW5kYm94X2xvYWRlciA9IHVpLml0ZW0uZmluZCgnaW1nJykuYXR0cignZGF0YS1sb2FkZXJmdW5jdGlvbicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vY3JlYXRlIHRoZSBuZXcgYmxvY2sgb2JqZWN0XG4gICAgICAgICAgICB0aGlzLmZyYW1lSUQgPSAwO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSSA9IHVpLml0ZW0uZ2V0KDApO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gJ25ldyc7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUZyYW1lKGZyYW1lRGF0YSk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudExJLnN0eWxlLmhlaWdodCA9IHRoaXMuZnJhbWVIZWlnaHQrXCJweFwiO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVGcmFtZUNvdmVyKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vaW5zZXJ0IHRoZSBjcmVhdGVkIGlmcmFtZVxuICAgICAgICAgICAgdWkuaXRlbS5hcHBlbmQoJCh0aGlzLmZyYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2FkZCB0aGUgYmxvY2sgdG8gdGhlIGN1cnJlbnQgcGFnZVxuICAgICAgICAgICAgc2l0ZS5hY3RpdmVQYWdlLmJsb2Nrcy5zcGxpY2UodWkuaXRlbS5pbmRleCgpLCAwLCB0aGlzKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vY3VzdG9tIGV2ZW50XG4gICAgICAgICAgICB1aS5pdGVtLmZpbmQoJ2lmcmFtZScpLnRyaWdnZXIoJ2NhbnZhc3VwZGF0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2Ryb3BwZWQgZWxlbWVudCwgc28gd2UndmUgZ290IHBlbmRpbmcgY2hhbmdlc1xuICAgICAgICAgICAgc2l0ZS5zZXRQZW5kaW5nQ2hhbmdlcyh0cnVlKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBCbG9jay5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJsb2FkXCI6IFxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RnJhbWVEb2N1bWVudCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0QWRqdXN0bWVudCgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQodGhpcy5mcmFtZUNvdmVyKS5yZW1vdmVDbGFzcygnZnJlc2gnLCA1MDApO1xuICAgICAgICAgICAgICAgICQodGhpcy5mcmFtZUNvdmVyKS5maW5kKCcucHJlbG9hZGVyJykucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGNhc2UgXCJjbGlja1wiOlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciB0aGVCbG9jayA9IHRoaXM7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9maWd1cmUgb3V0IHdoYXQgdG8gZG8gbmV4dFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCBldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdkZWxldGVCbG9jaycpICkgey8vZGVsZXRlIHRoaXMgYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICQoYnVpbGRlclVJLm1vZGFsRGVsZXRlQmxvY2spLm1vZGFsKCdzaG93Jyk7ICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICQoYnVpbGRlclVJLm1vZGFsRGVsZXRlQmxvY2spLm9mZignY2xpY2snLCAnI2RlbGV0ZUJsb2NrQ29uZmlybScpLm9uKCdjbGljaycsICcjZGVsZXRlQmxvY2tDb25maXJtJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZUJsb2NrLmRlbGV0ZShldmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKGJ1aWxkZXJVSS5tb2RhbERlbGV0ZUJsb2NrKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdyZXNldEJsb2NrJykgKSB7Ly9yZXNldCB0aGUgYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICQoYnVpbGRlclVJLm1vZGFsUmVzZXRCbG9jaykubW9kYWwoJ3Nob3cnKTsgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKGJ1aWxkZXJVSS5tb2RhbFJlc2V0QmxvY2spLm9mZignY2xpY2snLCAnI3Jlc2V0QmxvY2tDb25maXJtJykub24oJ2NsaWNrJywgJyNyZXNldEJsb2NrQ29uZmlybScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVCbG9jay5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChidWlsZGVyVUkubW9kYWxSZXNldEJsb2NrKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdodG1sQmxvY2snKSApIHsvL3NvdXJjZSBjb2RlIGVkaXRvclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlQmxvY2suc291cmNlKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnZWRpdENhbmNlbEJ1dHRvbicpICkgey8vY2FuY2VsIHNvdXJjZSBjb2RlIGVkaXRvclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlQmxvY2suY2FuY2VsU291cmNlQmxvY2soKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdlZGl0U2F2ZUJ1dHRvbicpICkgey8vc2F2ZSBzb3VyY2UgY29kZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlQmxvY2suc2F2ZVNvdXJjZUJsb2NrKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnYnV0dG9uX2NsZWFyRXJyb3JEcmF3ZXInKSApIHsvL2NsZWFyIGVycm9yIGRyYXdlclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlQmxvY2suY2xlYXJFcnJvckRyYXdlcigpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICAvKlxuICAgICAgICBTaXRlIG9iamVjdCBsaXRlcmFsXG4gICAgKi9cbiAgICAvKmpzaGludCAtVzAwMyAqL1xuICAgIHZhciBzaXRlID0ge1xuICAgICAgICBcbiAgICAgICAgcGVuZGluZ0NoYW5nZXM6IGZhbHNlLCAgICAgIC8vcGVuZGluZyBjaGFuZ2VzIG9yIG5vP1xuICAgICAgICBwYWdlczoge30sICAgICAgICAgICAgICAgICAgLy9hcnJheSBjb250YWluaW5nIGFsbCBwYWdlcywgaW5jbHVkaW5nIHRoZSBjaGlsZCBmcmFtZXMsIGxvYWRlZCBmcm9tIHRoZSBzZXJ2ZXIgb24gcGFnZSBsb2FkXG4gICAgICAgIGlzX2FkbWluOiAwLCAgICAgICAgICAgICAgICAvLzAgZm9yIG5vbi1hZG1pbiwgMSBmb3IgYWRtaW5cbiAgICAgICAgZGF0YToge30sICAgICAgICAgICAgICAgICAgIC8vY29udGFpbmVyIGZvciBhamF4IGxvYWRlZCBzaXRlIGRhdGFcbiAgICAgICAgcGFnZXNUb0RlbGV0ZTogW10sICAgICAgICAgIC8vY29udGFpbnMgcGFnZXMgdG8gYmUgZGVsZXRlZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBzaXRlUGFnZXM6IFtdLCAgICAgICAgICAgICAgLy90aGlzIGlzIHRoZSBvbmx5IHZhciBjb250YWluaW5nIHRoZSByZWNlbnQgY2FudmFzIGNvbnRlbnRzXG4gICAgICAgIFxuICAgICAgICBzaXRlUGFnZXNSZWFkeUZvclNlcnZlcjoge30sICAgICAvL2NvbnRhaW5zIHRoZSBzaXRlIGRhdGEgcmVhZHkgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyXG4gICAgICAgIFxuICAgICAgICBhY3RpdmVQYWdlOiB7fSwgICAgICAgICAgICAgLy9ob2xkcyBhIHJlZmVyZW5jZSB0byB0aGUgcGFnZSBjdXJyZW50bHkgb3BlbiBvbiB0aGUgY2FudmFzXG4gICAgICAgIFxuICAgICAgICBwYWdlVGl0bGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlVGl0bGUnKSwvL2hvbGRzIHRoZSBwYWdlIHRpdGxlIG9mIHRoZSBjdXJyZW50IHBhZ2Ugb24gdGhlIGNhbnZhc1xuICAgICAgICBcbiAgICAgICAgZGl2Q2FudmFzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZUxpc3QnKSwvL0RJViBjb250YWluaW5nIGFsbCBwYWdlcyBvbiB0aGUgY2FudmFzXG4gICAgICAgIFxuICAgICAgICBwYWdlc01lbnU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlcycpLCAvL1VMIGNvbnRhaW5pbmcgdGhlIHBhZ2VzIG1lbnUgaW4gdGhlIHNpZGViYXJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYnV0dG9uTmV3UGFnZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZFBhZ2UnKSxcbiAgICAgICAgbGlOZXdQYWdlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3UGFnZUxJJyksXG4gICAgICAgIFxuICAgICAgICBpbnB1dFBhZ2VTZXR0aW5nc1RpdGxlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZURhdGFfdGl0bGUnKSxcbiAgICAgICAgaW5wdXRQYWdlU2V0dGluZ3NNZXRhRGVzY3JpcHRpb246IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlRGF0YV9tZXRhRGVzY3JpcHRpb24nKSxcbiAgICAgICAgaW5wdXRQYWdlU2V0dGluZ3NNZXRhS2V5d29yZHM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlRGF0YV9tZXRhS2V5d29yZHMnKSxcbiAgICAgICAgaW5wdXRQYWdlU2V0dGluZ3NJbmNsdWRlczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2VEYXRhX2hlYWRlckluY2x1ZGVzJyksXG4gICAgICAgIGlucHV0UGFnZVNldHRpbmdzUGFnZUNzczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2VEYXRhX2hlYWRlckNzcycpLFxuICAgICAgICBcbiAgICAgICAgYnV0dG9uU3VibWl0UGFnZVNldHRpbmdzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZVNldHRpbmdzU3VibWl0dEJ1dHRvbicpLFxuICAgICAgICBcbiAgICAgICAgbW9kYWxQYWdlU2V0dGluZ3M6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlU2V0dGluZ3NNb2RhbCcpLFxuICAgICAgICBcbiAgICAgICAgYnV0dG9uU2F2ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NhdmVQYWdlJyksXG4gICAgICAgIFxuICAgICAgICBtZXNzYWdlU3RhcnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFydCcpLFxuICAgICAgICBkaXZGcmFtZVdyYXBwZXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmcmFtZVdyYXBwZXInKSxcbiAgICAgICAgXG4gICAgICAgIHNrZWxldG9uOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2tlbGV0b24nKSxcblx0XHRcblx0XHRhdXRvU2F2ZVRpbWVyOiB7fSxcbiAgICAgICAgXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAkLmdldEpTT04oYXBwVUkuc2l0ZVVybCtcInNpdGVzL3NpdGVEYXRhXCIsIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCBkYXRhLnNpdGUgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICAgICAgc2l0ZS5kYXRhID0gZGF0YS5zaXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiggZGF0YS5wYWdlcyAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICAgICAgICBzaXRlLnBhZ2VzID0gZGF0YS5wYWdlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc2l0ZS5pc19hZG1pbiA9IGRhdGEuaXNfYWRtaW47XG4gICAgICAgICAgICAgICAgXG5cdFx0XHRcdGlmKCAkKCcjcGFnZUxpc3QnKS5zaXplKCkgPiAwICkge1xuICAgICAgICAgICAgICAgIFx0YnVpbGRlclVJLnBvcHVsYXRlQ2FudmFzKCk7XG5cdFx0XHRcdH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL2ZpcmUgY3VzdG9tIGV2ZW50XG4gICAgICAgICAgICAgICAgJCgnYm9keScpLnRyaWdnZXIoJ3NpdGVEYXRhTG9hZGVkJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJCh0aGlzLmJ1dHRvbk5ld1BhZ2UpLm9uKCdjbGljaycsIHNpdGUubmV3UGFnZSk7XG4gICAgICAgICAgICAkKHRoaXMubW9kYWxQYWdlU2V0dGluZ3MpLm9uKCdzaG93LmJzLm1vZGFsJywgc2l0ZS5sb2FkUGFnZVNldHRpbmdzKTtcbiAgICAgICAgICAgICQodGhpcy5idXR0b25TdWJtaXRQYWdlU2V0dGluZ3MpLm9uKCdjbGljaycsIHNpdGUudXBkYXRlUGFnZVNldHRpbmdzKTtcbiAgICAgICAgICAgICQodGhpcy5idXR0b25TYXZlKS5vbignY2xpY2snLCBmdW5jdGlvbigpe3NpdGUuc2F2ZSh0cnVlKTt9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9hdXRvIHNhdmUgdGltZSBcbiAgICAgICAgICAgIHRoaXMuYXV0b1NhdmVUaW1lciA9IHNldFRpbWVvdXQoc2l0ZS5hdXRvU2F2ZSwgYkNvbmZpZy5hdXRvU2F2ZVRpbWVvdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgYXV0b1NhdmU6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKHNpdGUucGVuZGluZ0NoYW5nZXMpIHtcbiAgICAgICAgICAgICAgICBzaXRlLnNhdmUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuXHRcdFx0XG5cdFx0XHR3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmF1dG9TYXZlVGltZXIpO1xuICAgICAgICAgICAgdGhpcy5hdXRvU2F2ZVRpbWVyID0gc2V0VGltZW91dChzaXRlLmF1dG9TYXZlLCBiQ29uZmlnLmF1dG9TYXZlVGltZW91dCk7XG4gICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBzZXRQZW5kaW5nQ2hhbmdlczogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IHZhbHVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggdmFsdWUgPT09IHRydWUgKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHQvL3Jlc2V0IHRpbWVyXG5cdFx0XHRcdHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuYXV0b1NhdmVUaW1lcik7XG4gICAgICAgICAgICBcdHRoaXMuYXV0b1NhdmVUaW1lciA9IHNldFRpbWVvdXQoc2l0ZS5hdXRvU2F2ZSwgYkNvbmZpZy5hdXRvU2F2ZVRpbWVvdXQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQoJyNzYXZlUGFnZSAuYkxhYmVsJykudGV4dChcIlNhdmUqXCIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCBzaXRlLmFjdGl2ZVBhZ2Uuc3RhdHVzICE9PSAnbmV3JyApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2l0ZS5hY3RpdmVQYWdlLnN0YXR1cyA9ICdjaGFuZ2VkJztcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuXHRcdFx0XG4gICAgICAgICAgICB9IGVsc2Uge1xuXHRcbiAgICAgICAgICAgICAgICAkKCcjc2F2ZVBhZ2UgLmJMYWJlbCcpLnRleHQoXCJTYXZlXCIpO1xuXHRcdFx0XHRcbiAgICAgICAgICAgICAgICBzaXRlLnVwZGF0ZVBhZ2VTdGF0dXMoJycpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgc2F2ZTogZnVuY3Rpb24oc2hvd0NvbmZpcm1Nb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2ZpcmUgY3VzdG9tIGV2ZW50XG4gICAgICAgICAgICAkKCdib2R5JykudHJpZ2dlcignYmVmb3JlU2F2ZScpO1xuXG4gICAgICAgICAgICAvL2Rpc2FibGUgYnV0dG9uXG4gICAgICAgICAgICAkKFwiYSNzYXZlUGFnZVwiKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XG4gICAgICAgICAgICAvL3JlbW92ZSBvbGQgYWxlcnRzXG4gICAgICAgICAgICAkKCcjZXJyb3JNb2RhbCAubW9kYWwtYm9keSA+ICosICNzdWNjZXNzTW9kYWwgLm1vZGFsLWJvZHkgPiAqJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgICAgICB9KTtcblx0XG4gICAgICAgICAgICBzaXRlLnByZXBGb3JTYXZlKGZhbHNlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHNlcnZlckRhdGEgPSB7fTtcbiAgICAgICAgICAgIHNlcnZlckRhdGEucGFnZXMgPSB0aGlzLnNpdGVQYWdlc1JlYWR5Rm9yU2VydmVyO1xuICAgICAgICAgICAgaWYoIHRoaXMucGFnZXNUb0RlbGV0ZS5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgICAgIHNlcnZlckRhdGEudG9EZWxldGUgPSB0aGlzLnBhZ2VzVG9EZWxldGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXJ2ZXJEYXRhLnNpdGVEYXRhID0gdGhpcy5kYXRhO1xuXG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogYXBwVUkuc2l0ZVVybCtcInNpdGVzL3NhdmVcIixcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICAgICAgZGF0YTogc2VydmVyRGF0YSxcbiAgICAgICAgICAgIH0pLmRvbmUoZnVuY3Rpb24ocmVzKXtcblx0XG4gICAgICAgICAgICAgICAgLy9lbmFibGUgYnV0dG9uXG4gICAgICAgICAgICAgICAgJChcImEjc2F2ZVBhZ2VcIikucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFxuICAgICAgICAgICAgICAgIGlmKCByZXMucmVzcG9uc2VDb2RlID09PSAwICkge1xuXHRcdFx0XG4gICAgICAgICAgICAgICAgICAgIGlmKCBzaG93Q29uZmlybU1vZGFsICkge1xuXHRcdFx0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNlcnJvck1vZGFsIC5tb2RhbC1ib2R5JykuYXBwZW5kKCAkKHJlcy5yZXNwb25zZUhUTUwpICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZXJyb3JNb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG5cdFx0XHRcdFxuICAgICAgICAgICAgICAgICAgICB9XG5cdFx0XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCByZXMucmVzcG9uc2VDb2RlID09PSAxICkge1xuXHRcdFxuICAgICAgICAgICAgICAgICAgICBpZiggc2hvd0NvbmZpcm1Nb2RhbCApIHtcblx0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNzdWNjZXNzTW9kYWwgLm1vZGFsLWJvZHknKS5hcHBlbmQoICQocmVzLnJlc3BvbnNlSFRNTCkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNzdWNjZXNzTW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuXHRcdFx0XHRcbiAgICAgICAgICAgICAgICAgICAgfVxuXHRcdFx0XG5cdFx0XHRcbiAgICAgICAgICAgICAgICAgICAgLy9ubyBtb3JlIHBlbmRpbmcgY2hhbmdlc1xuICAgICAgICAgICAgICAgICAgICBzaXRlLnNldFBlbmRpbmdDaGFuZ2VzKGZhbHNlKTtcblx0XHRcdFxuXG4gICAgICAgICAgICAgICAgICAgIC8vdXBkYXRlIHJldmlzaW9ucz9cbiAgICAgICAgICAgICAgICAgICAgJCgnYm9keScpLnRyaWdnZXIoJ2NoYW5nZVBhZ2UnKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBwcmVwcyB0aGUgc2l0ZSBkYXRhIGJlZm9yZSBzZW5kaW5nIGl0IHRvIHRoZSBzZXJ2ZXJcbiAgICAgICAgKi9cbiAgICAgICAgcHJlcEZvclNhdmU6IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuc2l0ZVBhZ2VzUmVhZHlGb3JTZXJ2ZXIgPSB7fTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIHRlbXBsYXRlICkgey8vc2F2aW5nIHRlbXBsYXRlLCBvbmx5IHRoZSBhY3RpdmVQYWdlIGlzIG5lZWRlZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuc2l0ZVBhZ2VzUmVhZHlGb3JTZXJ2ZXJbdGhpcy5hY3RpdmVQYWdlLm5hbWVdID0gdGhpcy5hY3RpdmVQYWdlLnByZXBGb3JTYXZlKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVQYWdlLmZ1bGxQYWdlKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2Ugey8vcmVndWxhciBzYXZlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL2ZpbmQgdGhlIHBhZ2VzIHdoaWNoIG5lZWQgdG8gYmUgc2VuZCB0byB0aGUgc2VydmVyXG4gICAgICAgICAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLnNpdGVQYWdlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLnNpdGVQYWdlc1tpXS5zdGF0dXMgIT09ICcnICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNpdGVQYWdlc1JlYWR5Rm9yU2VydmVyW3RoaXMuc2l0ZVBhZ2VzW2ldLm5hbWVdID0gdGhpcy5zaXRlUGFnZXNbaV0ucHJlcEZvclNhdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgc2V0cyBhIHBhZ2UgYXMgdGhlIGFjdGl2ZSBvbmVcbiAgICAgICAgKi9cbiAgICAgICAgc2V0QWN0aXZlOiBmdW5jdGlvbihwYWdlKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vcmVmZXJlbmNlIHRvIHRoZSBhY3RpdmUgcGFnZVxuICAgICAgICAgICAgdGhpcy5hY3RpdmVQYWdlID0gcGFnZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9oaWRlIG90aGVyIHBhZ2VzXG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy5zaXRlUGFnZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNpdGVQYWdlc1tpXS5wYXJlbnRVTC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2Rpc3BsYXkgYWN0aXZlIG9uZVxuICAgICAgICAgICAgdGhpcy5hY3RpdmVQYWdlLnBhcmVudFVMLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGRlLWFjdGl2ZSBhbGwgcGFnZSBtZW51IGl0ZW1zXG4gICAgICAgICovXG4gICAgICAgIGRlQWN0aXZhdGVBbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcGFnZXMgPSB0aGlzLnBhZ2VzTWVudS5xdWVyeVNlbGVjdG9yQWxsKCdsaScpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHBhZ2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgIHBhZ2VzW2ldLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGFkZHMgYSBuZXcgcGFnZSB0byB0aGUgc2l0ZVxuICAgICAgICAqL1xuICAgICAgICBuZXdQYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2l0ZS5kZUFjdGl2YXRlQWxsKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vY3JlYXRlIHRoZSBuZXcgcGFnZSBpbnN0YW5jZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcGFnZURhdGEgPSBbXTtcbiAgICAgICAgICAgIHZhciB0ZW1wID0ge1xuICAgICAgICAgICAgICAgIHBhZ2VzX2lkOiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcGFnZURhdGFbMF0gPSB0ZW1wO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgbmV3UGFnZU5hbWUgPSAncGFnZScrKHNpdGUuc2l0ZVBhZ2VzLmxlbmd0aCsxKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIG5ld1BhZ2UgPSBuZXcgUGFnZShuZXdQYWdlTmFtZSwgcGFnZURhdGEsIHNpdGUuc2l0ZVBhZ2VzLmxlbmd0aCsxKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbmV3UGFnZS5zdGF0dXMgPSAnbmV3JztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbmV3UGFnZS5zZWxlY3RQYWdlKCk7XG4gICAgICAgICAgICBuZXdQYWdlLmVkaXRQYWdlTmFtZSgpO1xuICAgICAgICBcbiAgICAgICAgICAgIG5ld1BhZ2UuaXNFbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzaXRlLnNldFBlbmRpbmdDaGFuZ2VzKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGNoZWNrcyBpZiB0aGUgbmFtZSBvZiBhIHBhZ2UgaXMgYWxsb3dlZFxuICAgICAgICAqL1xuICAgICAgICBjaGVja1BhZ2VOYW1lOiBmdW5jdGlvbihwYWdlTmFtZSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL21ha2Ugc3VyZSB0aGUgbmFtZSBpcyB1bmlxdWVcbiAgICAgICAgICAgIGZvciggdmFyIGkgaW4gdGhpcy5zaXRlUGFnZXMgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuc2l0ZVBhZ2VzW2ldLm5hbWUgPT09IHBhZ2VOYW1lICYmIHRoaXMuYWN0aXZlUGFnZSAhPT0gdGhpcy5zaXRlUGFnZXNbaV0gKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFnZU5hbWVFcnJvciA9IFwiVGhlIHBhZ2UgbmFtZSBtdXN0IGJlIHVuaXF1ZS5cIjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgcmVtb3ZlcyB1bmFsbG93ZWQgY2hhcmFjdGVycyBmcm9tIHRoZSBwYWdlIG5hbWVcbiAgICAgICAgKi9cbiAgICAgICAgcHJlcFBhZ2VOYW1lOiBmdW5jdGlvbihwYWdlTmFtZSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwYWdlTmFtZSA9IHBhZ2VOYW1lLnJlcGxhY2UoJyAnLCAnJyk7XG4gICAgICAgICAgICBwYWdlTmFtZSA9IHBhZ2VOYW1lLnJlcGxhY2UoL1s/KiEufCYjOyQlQFwiPD4oKSssXS9nLCBcIlwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHBhZ2VOYW1lO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHNhdmUgcGFnZSBzZXR0aW5ncyBmb3IgdGhlIGN1cnJlbnQgcGFnZVxuICAgICAgICAqL1xuICAgICAgICB1cGRhdGVQYWdlU2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzaXRlLmFjdGl2ZVBhZ2UucGFnZVNldHRpbmdzLnRpdGxlID0gc2l0ZS5pbnB1dFBhZ2VTZXR0aW5nc1RpdGxlLnZhbHVlO1xuICAgICAgICAgICAgc2l0ZS5hY3RpdmVQYWdlLnBhZ2VTZXR0aW5ncy5tZXRhX2Rlc2NyaXB0aW9uID0gc2l0ZS5pbnB1dFBhZ2VTZXR0aW5nc01ldGFEZXNjcmlwdGlvbi52YWx1ZTtcbiAgICAgICAgICAgIHNpdGUuYWN0aXZlUGFnZS5wYWdlU2V0dGluZ3MubWV0YV9rZXl3b3JkcyA9IHNpdGUuaW5wdXRQYWdlU2V0dGluZ3NNZXRhS2V5d29yZHMudmFsdWU7XG4gICAgICAgICAgICBzaXRlLmFjdGl2ZVBhZ2UucGFnZVNldHRpbmdzLmhlYWRlcl9pbmNsdWRlcyA9IHNpdGUuaW5wdXRQYWdlU2V0dGluZ3NJbmNsdWRlcy52YWx1ZTtcbiAgICAgICAgICAgIHNpdGUuYWN0aXZlUGFnZS5wYWdlU2V0dGluZ3MucGFnZV9jc3MgPSBzaXRlLmlucHV0UGFnZVNldHRpbmdzUGFnZUNzcy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgc2l0ZS5zZXRQZW5kaW5nQ2hhbmdlcyh0cnVlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJChzaXRlLm1vZGFsUGFnZVNldHRpbmdzKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHVwZGF0ZSBwYWdlIHN0YXR1c2VzXG4gICAgICAgICovXG4gICAgICAgIHVwZGF0ZVBhZ2VTdGF0dXM6IGZ1bmN0aW9uKHN0YXR1cykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIHZhciBpIGluIHRoaXMuc2l0ZVBhZ2VzICkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2l0ZVBhZ2VzW2ldLnN0YXR1cyA9IHN0YXR1czsgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgXG4gICAgfTtcblxuICAgIGJ1aWxkZXJVSS5pbml0KCk7IHNpdGUuaW5pdCgpO1xuXG4gICAgXG4gICAgLy8qKioqIEVYUE9SVFNcbiAgICBtb2R1bGUuZXhwb3J0cy5zaXRlID0gc2l0ZTtcbiAgICBtb2R1bGUuZXhwb3J0cy5idWlsZGVyVUkgPSBidWlsZGVyVUk7XG5cbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBzaXRlQnVpbGRlciA9IHJlcXVpcmUoJy4vYnVpbGRlci5qcycpO1xuXG4gICAgLypcbiAgICAgICAgY29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIEVsZW1lbnRcbiAgICAqL1xuICAgIG1vZHVsZS5leHBvcnRzLkVsZW1lbnQgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWw7XG4gICAgICAgIHRoaXMuc2FuZGJveCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBhcmVudEZyYW1lID0ge307XG4gICAgICAgIHRoaXMucGFyZW50QmxvY2sgPSB7fTsvL3JlZmVyZW5jZSB0byB0aGUgcGFyZW50IGJsb2NrIGVsZW1lbnRcbiAgICAgICAgXG4gICAgICAgIC8vbWFrZSBjdXJyZW50IGVsZW1lbnQgYWN0aXZlL29wZW4gKGJlaW5nIHdvcmtlZCBvbilcbiAgICAgICAgdGhpcy5zZXRPcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy5lbGVtZW50KS5vZmYoJ21vdXNlZW50ZXIgbW91c2VsZWF2ZSBjbGljaycpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggJCh0aGlzLmVsZW1lbnQpLmNsb3Nlc3QoJ2JvZHknKS53aWR0aCgpICE9PSAkKHRoaXMuZWxlbWVudCkud2lkdGgoKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsZW1lbnQpLmNzcyh7J291dGxpbmUnOiAnM3B4IGRhc2hlZCByZWQnLCAnY3Vyc29yJzogJ3BvaW50ZXInfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsZW1lbnQpLmNzcyh7J291dGxpbmUnOiAnM3B4IGRhc2hlZCByZWQnLCAnb3V0bGluZS1vZmZzZXQnOictM3B4JywgICdjdXJzb3InOiAncG9pbnRlcid9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvL3NldHMgdXAgaG92ZXIgYW5kIGNsaWNrIGV2ZW50cywgbWFraW5nIHRoZSBlbGVtZW50IGFjdGl2ZSBvbiB0aGUgY2FudmFzXG4gICAgICAgIHRoaXMuYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKHRoaXMuZWxlbWVudCkuY3NzKHsnb3V0bGluZSc6ICdub25lJywgJ2N1cnNvcic6ICdpbmhlcml0J30pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAkKHRoaXMuZWxlbWVudCkub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggJCh0aGlzKS5jbG9zZXN0KCdib2R5Jykud2lkdGgoKSAhPT0gJCh0aGlzKS53aWR0aCgpICkge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoeydvdXRsaW5lJzogJzNweCBkYXNoZWQgcmVkJywgJ2N1cnNvcic6ICdwb2ludGVyJ30pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcyh7J291dGxpbmUnOiAnM3B4IGRhc2hlZCByZWQnLCAnb3V0bGluZS1vZmZzZXQnOiAnLTNweCcsICdjdXJzb3InOiAncG9pbnRlcid9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH0pLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoeydvdXRsaW5lJzogJycsICdjdXJzb3InOiAnJywgJ291dGxpbmUtb2Zmc2V0JzogJyd9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfSkub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xpY2tIYW5kbGVyKHRoaXMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy5lbGVtZW50KS5vZmYoJ21vdXNlZW50ZXIgbW91c2VsZWF2ZSBjbGljaycpO1xuICAgICAgICAgICAgJCh0aGlzLmVsZW1lbnQpLmNzcyh7J291dGxpbmUnOiAnbm9uZScsICdjdXJzb3InOiAnaW5oZXJpdCd9KTtcblxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy9yZW1vdmVzIHRoZSBlbGVtZW50cyBvdXRsaW5lXG4gICAgICAgIHRoaXMucmVtb3ZlT3V0bGluZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKHRoaXMuZWxlbWVudCkuY3NzKHsnb3V0bGluZSc6ICdub25lJywgJ2N1cnNvcic6ICdpbmhlcml0J30pO1xuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvL3NldHMgdGhlIHBhcmVudCBpZnJhbWVcbiAgICAgICAgdGhpcy5zZXRQYXJlbnRGcmFtZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgZG9jID0gdGhpcy5lbGVtZW50Lm93bmVyRG9jdW1lbnQ7XG4gICAgICAgICAgICB2YXIgdyA9IGRvYy5kZWZhdWx0VmlldyB8fCBkb2MucGFyZW50V2luZG93O1xuICAgICAgICAgICAgdmFyIGZyYW1lcyA9IHcucGFyZW50LmRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpZnJhbWUnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yICh2YXIgaT0gZnJhbWVzLmxlbmd0aDsgaS0tPjA7KSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIGZyYW1lPSBmcmFtZXNbaV07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGQ9IGZyYW1lLmNvbnRlbnREb2N1bWVudCB8fCBmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAoZD09PWRvYylcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50RnJhbWUgPSBmcmFtZTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoKGUpIHt9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vc2V0cyB0aGlzIGVsZW1lbnQncyBwYXJlbnQgYmxvY2sgcmVmZXJlbmNlXG4gICAgICAgIHRoaXMuc2V0UGFyZW50QmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9sb29wIHRocm91Z2ggYWxsIHRoZSBibG9ja3Mgb24gdGhlIGNhbnZhc1xuICAgICAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBzaXRlQnVpbGRlci5zaXRlLnNpdGVQYWdlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yKCB2YXIgeCA9IDA7IHggPCBzaXRlQnVpbGRlci5zaXRlLnNpdGVQYWdlc1tpXS5ibG9ja3MubGVuZ3RoOyB4KysgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGJsb2NrJ3MgZnJhbWUgbWF0Y2hlcyB0aGlzIGVsZW1lbnQncyBwYXJlbnQgZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgaWYoIHNpdGVCdWlsZGVyLnNpdGUuc2l0ZVBhZ2VzW2ldLmJsb2Nrc1t4XS5mcmFtZSA9PT0gdGhpcy5wYXJlbnRGcmFtZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIGEgcmVmZXJlbmNlIHRvIHRoYXQgYmxvY2sgYW5kIHN0b3JlIGl0IGluIHRoaXMucGFyZW50QmxvY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50QmxvY2sgPSBzaXRlQnVpbGRlci5zaXRlLnNpdGVQYWdlc1tpXS5ibG9ja3NbeF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB0aGlzLnNldFBhcmVudEZyYW1lKCk7XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgaXMgdGhpcyBibG9jayBzYW5kYm94ZWQ/XG4gICAgICAgICovXG4gICAgICAgIFxuICAgICAgICBpZiggdGhpcy5wYXJlbnRGcmFtZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2FuZGJveCcpICkge1xuICAgICAgICAgICAgdGhpcy5zYW5kYm94ID0gdGhpcy5wYXJlbnRGcmFtZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2FuZGJveCcpOyAgIFxuICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgfTtcblxufSgpKTsiLCIoZnVuY3Rpb24gKCkge1xuXHRcInVzZSBzdHJpY3RcIjtcbiAgICAgICAgXG4gICAgbW9kdWxlLmV4cG9ydHMucGFnZUNvbnRhaW5lciA9IFwiI3BhZ2VcIjtcbiAgICBcbiAgICBtb2R1bGUuZXhwb3J0cy5lZGl0YWJsZUl0ZW1zID0ge1xuICAgICAgICAgICAgJ2gxJzogWydjb2xvcicsICdmb250LXNpemUnLCAndGV4dC1hbGlnbicsICdmb250LWZhbWlseScsICdmb250LXN0eWxlJywgJ2ZvbnQtd2VpZ2h0JywgJ3RleHQtdHJhbnNmb3JtJ10sXG4gICAgICAgICAgICAnaDInOiBbJ2NvbG9yJywgJ2ZvbnQtc2l6ZScsICd0ZXh0LWFsaWduJywgJ2ZvbnQtZmFtaWx5JywgJ2ZvbnQtc3R5bGUnLCAnZm9udC13ZWlnaHQnLCAndGV4dC10cmFuc2Zvcm0nXSxcbiAgICAgICAgICAgICdoMyc6IFsnY29sb3InLCAnZm9udC1zaXplJywgJ3RleHQtYWxpZ24nLCAnZm9udC1mYW1pbHknLCAnZm9udC1zdHlsZScsICdmb250LXdlaWdodCcsICd0ZXh0LXRyYW5zZm9ybSddLFxuICAgICAgICAgICAgJ2g0JzogWydjb2xvcicsICdmb250LXNpemUnLCAndGV4dC1hbGlnbicsICdmb250LWZhbWlseScsICdmb250LXN0eWxlJywgJ2ZvbnQtd2VpZ2h0JywgJ3RleHQtdHJhbnNmb3JtJ10sXG4gICAgICAgICAgICAnaDUnOiBbJ2NvbG9yJywgJ2ZvbnQtc2l6ZScsICd0ZXh0LWFsaWduJywgJ2ZvbnQtZmFtaWx5JywgJ2ZvbnQtc3R5bGUnLCAnZm9udC13ZWlnaHQnLCAndGV4dC10cmFuc2Zvcm0nXSxcbiAgICAgICAgICAgICdwJzogWydjb2xvcicsICdmb250LXNpemUnLCAndGV4dC1hbGlnbicsICdmb250LWZhbWlseScsICdmb250LXN0eWxlJywgJ2ZvbnQtd2VpZ2h0J10sXG4gICAgICAgICAgICAnLnRleHQnOlsnY29sb3InLCAnZm9udC1zaXplJywgJ3RleHQtYWxpZ24nLCAnZm9udC1mYW1pbHknLCAnZm9udC1zdHlsZScsICdmb250LXdlaWdodCddLFxuICAgICAgICAgICAgJ3VsLnRleHQtbGlzdCc6Wydjb2xvcicsICdmb250LXNpemUnLCAndGV4dC1hbGlnbicsICdmb250LWZhbWlseScsICdmb250LXN0eWxlJywgJ2ZvbnQtd2VpZ2h0J10sXG4gICAgICAgICAgICAnLnRleHQtYWR2YW5jZWQnOlsnY29sb3InLCAnYmFja2dyb3VuZC1jb2xvcicsICdmb250LXNpemUnLCAndGV4dC1hbGlnbicsICdmb250LWZhbWlseScsICdmb250LXN0eWxlJywgJ2ZvbnQtd2VpZ2h0JywgJ2JvcmRlci1jb2xvcicsICdib3JkZXItcmFkaXVzJ10sXG4gICAgICAgICAgICAnaW1nJzpbJ3dpZHRoJywnaGVpZ2h0JywgJ21hcmdpbicsICdwYWRkaW5nJywgJ2JvcmRlci1jb2xvcicsICdib3JkZXItd2lkdGgnLCAnYm9yZGVyLXN0eWxlJywgJ2JvcmRlci1yYWRpdXMnXSxcbiAgICAgICAgICAgICdzdmcnOlsnd2lkdGgnLCdoZWlnaHQnLCAnbWFyZ2luJywgJ3BhZGRpbmcnXSxcbiAgICAgICAgICAgICdzcGFuLmZhLCBpLmZhJzogWydjb2xvcicsICdmb250LXNpemUnXSxcbiAgICAgICAgICAgICcuaWNvbi1hZHZhbmNlZCc6Wydjb2xvcicsICdmb250LXNpemUnLCAnYmFja2dyb3VuZC1jb2xvciddLFxuICAgICAgICAgICAgJy5pY29uLWJvcmRlcic6Wydjb2xvcicsICdmb250LXNpemUnLCAncGFkZGluZy10b3AnLCAnYm9yZGVyLWNvbG9yJ10sXG4gICAgICAgICAgICAnLmxpbmsnOlsnY29sb3InLCAnZm9udC1zaXplJywgJ2ZvbnQtZmFtaWx5JywgJ2ZvbnQtc3R5bGUnLCAnZm9udC13ZWlnaHQnLCAndGV4dC1kZWNvcmF0aW9uJywgJ2JvcmRlci1ib3R0b20tY29sb3InLCAnYm9yZGVyLWJvdHRvbS13aWR0aCddLFxuICAgICAgICAgICAgJy5lZGl0LWxpbmsnOlsnY29sb3InLCAnZm9udC1zaXplJywgJ2ZvbnQtZmFtaWx5JywgJ2ZvbnQtc3R5bGUnLCAnZm9udC13ZWlnaHQnLCAndGV4dC1kZWNvcmF0aW9uJywgJ2JvcmRlci1ib3R0b20tY29sb3InLCAnYm9yZGVyLWJvdHRvbS13aWR0aCddLFxuICAgICAgICAgICAgJy5lZGl0LXRhZ3MnOlsnY29sb3InLCAnZm9udC1zaXplJywgJ2ZvbnQtZmFtaWx5JywgJ2ZvbnQtc3R5bGUnLCAnZm9udC13ZWlnaHQnLCAnYmFja2dyb3VuZC1jb2xvcicsICdib3JkZXItY29sb3InLCAnYm9yZGVyLXdpZHRoJywgJ2JvcmRlci1zdHlsZSddLFxuICAgICAgICAgICAgJ2EuYnRuLCBidXR0b24uYnRuJzpbICdjb2xvcicsICdmb250LXNpemUnLCAnYmFja2dyb3VuZC1jb2xvcicsICdib3JkZXItcmFkaXVzJ10sXG4gICAgICAgICAgICAnLnByb2dyZXNzLXN0eWxlJzpbJ2JhY2tncm91bmQtY29sb3InLCAnYm9yZGVyLWNvbG9yJywgJ2JvcmRlci1yYWRpdXMnXSxcbiAgICAgICAgICAgICcucHJvZ3Jlc3MtaW5uZXItc3R5bGUnOlsnd2lkdGgnLCAnYmFja2dyb3VuZC1jb2xvcicsICdib3JkZXItcmFkaXVzJ10sXG4gICAgICAgICAgICAnLnByb2dyZXNzLWlubmVyLWFkdmFuY2VkJzpbJ3dpZHRoJywgJ2NvbG9yJywgJ2JhY2tncm91bmQtY29sb3InLCAnYmFja2dyb3VuZC1pbWFnZScsICdmb250LXNpemUnLCAndGV4dC1hbGlnbicsICdmb250LWZhbWlseScsICdmb250LXN0eWxlJywgJ2ZvbnQtd2VpZ2h0JywgJ2xpbmUtaGVpZ2h0JywgJ2JvcmRlci1yYWRpdXMnXSxcbiAgICAgICAgICAgICcuY29sb3InOlsnY29sb3InLCAnYmFja2dyb3VuZC1jb2xvcicsICdib3JkZXItY29sb3InXSxcbiAgICAgICAgICAgICcuanVzdC1jb2xvcic6Wydjb2xvciddLFxuICAgICAgICAgICAgJy5oZWxwLWNvbG9yJzpbJ2JhY2tncm91bmQtY29sb3InLCAnYm9yZGVyLWNvbG9yJ10sXG4gICAgICAgICAgICAnLmhlbHAtY29sb3ItYWR2YW5jZWQnOiBbJ2JhY2tncm91bmQtY29sb3InLCAnYm9yZGVyLWNvbG9yJywgJ2JvcmRlci1yYWRpdXMnXSxcbiAgICAgICAgICAgICcuYmcnOlsnYmFja2dyb3VuZC1pbWFnZScsICdiYWNrZ3JvdW5kLWNvbG9yJywgJ2JhY2tncm91bmQtc2l6ZScsICdiYWNrZ3JvdW5kLXBvc2l0aW9uJywgJ2JhY2tncm91bmQtcmVwZWF0J10sXG4gICAgICAgICAgICAnLmJnLWNvbG9yJzpbJ2JhY2tncm91bmQtY29sb3InXSxcbiAgICAgICAgICAgICcuYmctaW1hZ2UnOlsnYmFja2dyb3VuZC1pbWFnZScsICdiYWNrZ3JvdW5kLXNpemUnLCAnYmFja2dyb3VuZC1wb3NpdGlvbicsICdiYWNrZ3JvdW5kLXJlcGVhdCddLFxuICAgICAgICAgICAgJy5ib3JkZXInOlsnYm9yZGVyLWNvbG9yJywgJ2JvcmRlci13aWR0aCcsICdib3JkZXItc3R5bGUnXSxcbiAgICAgICAgICAgICcuZGV2aWRlci1lZGl0LCAuZGV2aWRlci1icmFuZCc6IFsnaGVpZ2h0JywgJ2JhY2tncm91bmQtY29sb3InLCAnYm9yZGVyLWNvbG9yJywgJ2JvcmRlci10b3Atd2lkdGgnLCAnYm9yZGVyLWJvdHRvbS13aWR0aCcsICdib3JkZXItc3R5bGUnXSxcbiAgICAgICAgICAgICduYXYgYSc6Wydjb2xvcicsICdmb250LXdlaWdodCcsICd0ZXh0LXRyYW5zZm9ybSddLFxuICAgICAgICAgICAgJ2EuZWRpdCc6Wydjb2xvcicsICdmb250LXdlaWdodCcsICd0ZXh0LXRyYW5zZm9ybSddLFxuICAgICAgICAgICAgJy5mb290ZXIgYSc6Wydjb2xvciddLFxuICAgICAgICAgICAgLy8nLmJnLmJnMSwgLmJnLmJnMiwgLmhlYWRlcjEwLCAuaGVhZGVyMTEnOiBbJ2JhY2tncm91bmQtaW1hZ2UnLCAnYmFja2dyb3VuZC1jb2xvciddLFxuICAgICAgICAgICAgJy5mcmFtZUNvdmVyJzogW11cbiAgICB9O1xuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzLmVkaXRhYmxlSXRlbU9wdGlvbnMgPSB7XG4gICAgICAgICAgICAnbmF2IGEgOiBmb250LXdlaWdodCc6IFsnNDAwJywgJzcwMCddLFxuICAgICAgICAgICAgJ2EuYnRuIDogYm9yZGVyLXJhZGl1cyc6IFsnMHB4JywgJzRweCcsICcxMHB4J10sXG4gICAgICAgICAgICAnaW1nIDogYm9yZGVyLXN0eWxlJzogWydub25lJywgJ2RvdHRlZCcsICdkYXNoZWQnLCAnc29saWQnXSxcbiAgICAgICAgICAgICdoMSA6IHRleHQtYWxpZ24nOiBbJ2xlZnQnLCAncmlnaHQnLCAnY2VudGVyJywgJ2p1c3RpZnknXSxcbiAgICAgICAgICAgICdoMSA6IGZvbnQtd2VpZ2h0JzogWydub3JtYWwnLCAnYm9sZCddLFxuICAgICAgICAgICAgJ2gxIDogZm9udC1zdHlsZSc6IFsnbm9ybWFsJywgJ2l0YWxpYyddLFxuICAgICAgICAgICAgJ2gxIDogdGV4dC10cmFuc2Zvcm0nOiBbJ25vbmUnLCAndXBwZXJjYXNlJywgJ2xvd2VyY2FzZScsICdjYXBpdGFsaXplJ10sXG4gICAgICAgICAgICAnaDIgOiB0ZXh0LWFsaWduJzogWydsZWZ0JywgJ3JpZ2h0JywgJ2NlbnRlcicsICdqdXN0aWZ5J10sXG4gICAgICAgICAgICAnaDIgOiBmb250LXdlaWdodCc6IFsnbm9ybWFsJywgJ2JvbGQnXSxcbiAgICAgICAgICAgICdoMiA6IGZvbnQtc3R5bGUnOiBbJ25vcm1hbCcsICdpdGFsaWMnXSxcbiAgICAgICAgICAgICdoMiA6IHRleHQtdHJhbnNmb3JtJzogWydub25lJywgJ3VwcGVyY2FzZScsICdsb3dlcmNhc2UnLCAnY2FwaXRhbGl6ZSddLFxuICAgICAgICAgICAgJ2gzIDogdGV4dC1hbGlnbic6IFsnbGVmdCcsICdyaWdodCcsICdjZW50ZXInLCAnanVzdGlmeSddLFxuICAgICAgICAgICAgJ2gzIDogZm9udC13ZWlnaHQnOiBbJ25vcm1hbCcsICdib2xkJ10sXG4gICAgICAgICAgICAnaDMgOiBmb250LXN0eWxlJzogWydub3JtYWwnLCAnaXRhbGljJ10sXG4gICAgICAgICAgICAnaDMgOiB0ZXh0LXRyYW5zZm9ybSc6IFsnbm9uZScsICd1cHBlcmNhc2UnLCAnbG93ZXJjYXNlJywgJ2NhcGl0YWxpemUnXSxcbiAgICAgICAgICAgICdoNCA6IHRleHQtYWxpZ24nOiBbJ2xlZnQnLCAncmlnaHQnLCAnY2VudGVyJywgJ2p1c3RpZnknXSxcbiAgICAgICAgICAgICdoNCA6IGZvbnQtd2VpZ2h0JzogWydub3JtYWwnLCAnYm9sZCddLFxuICAgICAgICAgICAgJ2g0IDogZm9udC1zdHlsZSc6IFsnbm9ybWFsJywgJ2l0YWxpYyddLFxuICAgICAgICAgICAgJ2g0IDogdGV4dC10cmFuc2Zvcm0nOiBbJ25vbmUnLCAndXBwZXJjYXNlJywgJ2xvd2VyY2FzZScsICdjYXBpdGFsaXplJ10sXG4gICAgICAgICAgICAnaDUgOiB0ZXh0LWFsaWduJzogWydsZWZ0JywgJ3JpZ2h0JywgJ2NlbnRlcicsICdqdXN0aWZ5J10sXG4gICAgICAgICAgICAnaDUgOiBmb250LXdlaWdodCc6IFsnbm9ybWFsJywgJ2JvbGQnXSxcbiAgICAgICAgICAgICdoNSA6IGZvbnQtc3R5bGUnOiBbJ25vcm1hbCcsICdpdGFsaWMnXSxcbiAgICAgICAgICAgICdoNSA6IHRleHQtdHJhbnNmb3JtJzogWydub25lJywgJ3VwcGVyY2FzZScsICdsb3dlcmNhc2UnLCAnY2FwaXRhbGl6ZSddLFxuICAgICAgICAgICAgJ3AgOiB0ZXh0LWFsaWduJzogWydsZWZ0JywgJ3JpZ2h0JywgJ2NlbnRlcicsICdqdXN0aWZ5J10sXG4gICAgICAgICAgICAncCA6IGZvbnQtd2VpZ2h0JzogWydub3JtYWwnLCAnYm9sZCddLFxuICAgICAgICAgICAgJ3AgOiBmb250LXN0eWxlJzogWydub3JtYWwnLCAnaXRhbGljJ10sXG4gICAgICAgICAgICAnLnRleHQgOiB0ZXh0LWFsaWduJzogWydsZWZ0JywgJ3JpZ2h0JywgJ2NlbnRlcicsICdqdXN0aWZ5J10sXG4gICAgICAgICAgICAnLnRleHQgOiBmb250LXdlaWdodCc6IFsnbm9ybWFsJywgJ2JvbGQnXSxcbiAgICAgICAgICAgICcudGV4dCA6IGZvbnQtc3R5bGUnOiBbJ25vcm1hbCcsICdpdGFsaWMnXSxcbiAgICAgICAgICAgICcudGV4dC1hZHZhbmNlZCA6IHRleHQtYWxpZ24nOiBbJ2xlZnQnLCAncmlnaHQnLCAnY2VudGVyJywgJ2p1c3RpZnknXSxcbiAgICAgICAgICAgICcudGV4dC1hZHZhbmNlZCA6IGZvbnQtd2VpZ2h0JzogWydub3JtYWwnLCAnYm9sZCddLFxuICAgICAgICAgICAgJy50ZXh0LWFkdmFuY2VkIDogZm9udC1zdHlsZSc6IFsnbm9ybWFsJywgJ2l0YWxpYyddLFxuICAgICAgICAgICAgJ3VsLnRleHQtbGlzdCA6IHRleHQtYWxpZ24nOiBbJ2xlZnQnLCAncmlnaHQnLCAnY2VudGVyJywgJ2p1c3RpZnknXSxcbiAgICAgICAgICAgICd1bC50ZXh0LWxpc3QgOiBmb250LXdlaWdodCc6IFsnbm9ybWFsJywgJ2JvbGQnXSxcbiAgICAgICAgICAgICd1bC50ZXh0LWxpc3QgOiBmb250LXN0eWxlJzogWydub3JtYWwnLCAnaXRhbGljJ10sXG4gICAgICAgICAgICAnLmxpbmsgOiBmb250LXdlaWdodCc6IFsnbm9ybWFsJywgJ2JvbGQnXSxcbiAgICAgICAgICAgICcubGluayA6IGZvbnQtc3R5bGUnOiBbJ25vcm1hbCcsICdpdGFsaWMnXSxcbiAgICAgICAgICAgICcuZWRpdC1saW5rIDogZm9udC13ZWlnaHQnOiBbJ25vcm1hbCcsICdib2xkJ10sXG4gICAgICAgICAgICAnLmVkaXQtbGluayA6IGZvbnQtc3R5bGUnOiBbJ25vcm1hbCcsICdpdGFsaWMnXSxcbiAgICAgICAgICAgICcuZWRpdC10YWdzIDogZm9udC13ZWlnaHQnOiBbJ25vcm1hbCcsICdib2xkJ10sXG4gICAgICAgICAgICAnLmVkaXQtdGFncyA6IGZvbnQtc3R5bGUnOiBbJ25vcm1hbCcsICdpdGFsaWMnXSxcbiAgICAgICAgICAgICduYXYgYSA6IHRleHQtdHJhbnNmb3JtJzogWydub25lJywgJ3VwcGVyY2FzZScsICdsb3dlcmNhc2UnLCAnY2FwaXRhbGl6ZSddXG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzLmVkaXRhYmxlQ29udGVudCA9IFsnLmVkaXRDb250ZW50JywgJy5uYXZiYXIgYScsICdidXR0b24nLCAnYS5idG4nLCAnLmZvb3RlciBhOm5vdCguZmEpJywgJy50YWJsZVdyYXBwZXInLCAnaDEnXTtcblxuICAgIG1vZHVsZS5leHBvcnRzLmF1dG9TYXZlVGltZW91dCA9IDYwMDAwO1xuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzLnNvdXJjZUNvZGVFZGl0U3ludGF4RGVsYXkgPSAxMDAwMDtcbiAgICAgICAgICAgICAgICAgICAgXG59KCkpOyIsIihmdW5jdGlvbiAoKXtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgYkNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnLmpzJyk7XG4gICAgdmFyIHNpdGVCdWlsZGVyID0gcmVxdWlyZSgnLi9idWlsZGVyLmpzJyk7XG4gICAgdmFyIGVkaXRvciA9IHJlcXVpcmUoJy4vc3R5bGVlZGl0b3IuanMnKS5zdHlsZWVkaXRvcjtcbiAgICB2YXIgYXBwVUkgPSByZXF1aXJlKCcuL3VpLmpzJykuYXBwVUk7XG5cbiAgICB2YXIgaW1hZ2VMaWJyYXJ5ID0ge1xuICAgICAgICBcbiAgICAgICAgaW1hZ2VNb2RhbDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltYWdlTW9kYWwnKSxcbiAgICAgICAgaW5wdXRJbWFnZVVwbG9hZDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltYWdlRmlsZScpLFxuICAgICAgICBidXR0b25VcGxvYWRJbWFnZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VwbG9hZEltYWdlQnV0dG9uJyksXG4gICAgICAgIGltYWdlTGlicmFyeUxpbmtzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuaW1hZ2VzID4gLmltYWdlIC5idXR0b25zIC5idG4tcHJpbWFyeSwgLmltYWdlcyAuaW1hZ2VXcmFwID4gYScpLC8vdXNlZCBpbiB0aGUgbGlicmFyeSwgb3V0c2lkZSB0aGUgYnVpbGRlciBVSVxuICAgICAgICBteUltYWdlczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ215SW1hZ2VzJyksLy91c2VkIGluIHRoZSBpbWFnZSBsaWJyYXJ5LCBvdXRzaWRlIHRoZSBidWlsZGVyIFVJXG4gICAgXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy5pbWFnZU1vZGFsKS5vbignc2hvdy5icy5tb2RhbCcsIHRoaXMuaW1hZ2VMaWJyYXJ5KTtcbiAgICAgICAgICAgICQodGhpcy5pbnB1dEltYWdlVXBsb2FkKS5vbignY2hhbmdlJywgdGhpcy5pbWFnZUlucHV0Q2hhbmdlKTtcbiAgICAgICAgICAgICQodGhpcy5idXR0b25VcGxvYWRJbWFnZSkub24oJ2NsaWNrJywgdGhpcy51cGxvYWRJbWFnZSk7XG4gICAgICAgICAgICAkKHRoaXMuaW1hZ2VMaWJyYXJ5TGlua3MpLm9uKCdjbGljaycsIHRoaXMuaW1hZ2VJbk1vZGFsKTtcbiAgICAgICAgICAgICQodGhpcy5teUltYWdlcykub24oJ2NsaWNrJywgJy5idXR0b25zIC5idG4tZGFuZ2VyJywgdGhpcy5kZWxldGVJbWFnZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgaW1hZ2UgbGlicmFyeSBtb2RhbFxuICAgICAgICAqL1xuICAgICAgICBpbWFnZUxpYnJhcnk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XG4gICAgICAgICAgICAkKCcjaW1hZ2VNb2RhbCcpLm9mZignY2xpY2snLCAnLmltYWdlIGJ1dHRvbi51c2VJbWFnZScpO1xuXHRcdFx0XG4gICAgICAgICAgICAkKCcjaW1hZ2VNb2RhbCcpLm9uKCdjbGljaycsICcuaW1hZ2UgYnV0dG9uLnVzZUltYWdlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3VwZGF0ZSBsaXZlIGltYWdlXG4gICAgICAgICAgICAgICAgJChlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5hdHRyKCdzcmMnLCAkKHRoaXMpLmF0dHIoJ2RhdGEtdXJsJykpO1xuXG4gICAgICAgICAgICAgICAgLy91cGRhdGUgaW1hZ2UgVVJMIGZpZWxkXG4gICAgICAgICAgICAgICAgJCgnaW5wdXQjaW1hZ2VVUkwnKS52YWwoICQodGhpcykuYXR0cignZGF0YS11cmwnKSApO1xuXHRcdFx0XHRcbiAgICAgICAgICAgICAgICAvL2hpZGUgbW9kYWxcbiAgICAgICAgICAgICAgICAkKCcjaW1hZ2VNb2RhbCcpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRcdFxuICAgICAgICAgICAgICAgIC8vaGVpZ2h0IGFkanVzdG1lbnQgb2YgdGhlIGlmcmFtZSBoZWlnaHRBZGp1c3RtZW50XG5cdFx0XHRcdGVkaXRvci5hY3RpdmVFbGVtZW50LnBhcmVudEJsb2NrLmhlaWdodEFkanVzdG1lbnQoKTtcdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcbiAgICAgICAgICAgICAgICAvL3dlJ3ZlIGdvdCBwZW5kaW5nIGNoYW5nZXNcbiAgICAgICAgICAgICAgICBzaXRlQnVpbGRlci5zaXRlLnNldFBlbmRpbmdDaGFuZ2VzKHRydWUpO1xuXHRcdFx0XG4gICAgICAgICAgICAgICAgJCh0aGlzKS51bmJpbmQoJ2NsaWNrJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGltYWdlIHVwbG9hZCBpbnB1dCBjaGFuZWcgZXZlbnQgaGFuZGxlclxuICAgICAgICAqL1xuICAgICAgICBpbWFnZUlucHV0Q2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoICQodGhpcykudmFsKCkgPT09ICcnICkge1xuICAgICAgICAgICAgICAgIC8vbm8gZmlsZSwgZGlzYWJsZSBzdWJtaXQgYnV0dG9uXG4gICAgICAgICAgICAgICAgJCgnYnV0dG9uI3VwbG9hZEltYWdlQnV0dG9uJykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vZ290IGEgZmlsZSwgZW5hYmxlIGJ1dHRvblxuICAgICAgICAgICAgICAgICQoJ2J1dHRvbiN1cGxvYWRJbWFnZUJ1dHRvbicpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHVwbG9hZCBhbiBpbWFnZSB0byB0aGUgaW1hZ2UgbGlicmFyeVxuICAgICAgICAqL1xuICAgICAgICB1cGxvYWRJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCAkKCdpbnB1dCNpbWFnZUZpbGUnKS52YWwoKSAhPT0gJycgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9yZW1vdmUgb2xkIGFsZXJ0c1xuICAgICAgICAgICAgICAgICQoJyNpbWFnZU1vZGFsIC5tb2RhbC1hbGVydHMgPiAqJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9kaXNhYmxlIGJ1dHRvblxuICAgICAgICAgICAgICAgICQoJ2J1dHRvbiN1cGxvYWRJbWFnZUJ1dHRvbicpLmFkZENsYXNzKCdkaXNhYmxlJyk7XG5cbiAgICAgICAgICAgICAgICAvL3Nob3cgbG9hZGVyXG4gICAgICAgICAgICAgICAgJCgnI2ltYWdlTW9kYWwgLmxvYWRlcicpLmZhZGVJbig1MDApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBmb3JtID0gJCgnZm9ybSNpbWFnZVVwbG9hZEZvcm0nKTtcbiAgICAgICAgICAgICAgICB2YXIgZm9ybWRhdGEgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuRm9ybURhdGEpe1xuICAgICAgICAgICAgICAgICAgICBmb3JtZGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtWzBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIGZvcm1BY3Rpb24gPSBmb3JtLmF0dHIoJ2FjdGlvbicpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybCA6IGZvcm1BY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgOiBmb3JtZGF0YSA/IGZvcm1kYXRhIDogZm9ybS5zZXJpYWxpemUoKSxcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFR5cGUgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0RhdGEgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgICAgICAgICB0eXBlIDogJ1BPU1QnXG4gICAgICAgICAgICAgICAgfSkuZG9uZShmdW5jdGlvbihyZXQpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9lbmFibGUgYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICQoJ2J1dHRvbiN1cGxvYWRJbWFnZUJ1dHRvbicpLmFkZENsYXNzKCdkaXNhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2hpZGUgbG9hZGVyXG4gICAgICAgICAgICAgICAgICAgICQoJyNpbWFnZU1vZGFsIC5sb2FkZXInKS5mYWRlT3V0KDUwMCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiggcmV0LnJlc3BvbnNlQ29kZSA9PT0gMCApIHsvL2Vycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNpbWFnZU1vZGFsIC5tb2RhbC1hbGVydHMnKS5hcHBlbmQoICQocmV0LnJlc3BvbnNlSFRNTCkgKTtcblx0XHRcdFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIHJldC5yZXNwb25zZUNvZGUgPT09IDEgKSB7Ly9zdWNjZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYXBwZW5kIG15IGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjbXlJbWFnZXNUYWIgPiAqJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjbXlJbWFnZXNUYWInKS5hcHBlbmQoICQocmV0Lm15SW1hZ2VzKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2ltYWdlTW9kYWwgLm1vZGFsLWFsZXJ0cycpLmFwcGVuZCggJChyZXQucmVzcG9uc2VIVE1MKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7JCgnI2ltYWdlTW9kYWwgLm1vZGFsLWFsZXJ0cyA+IConKS5mYWRlT3V0KDUwMCk7fSwgMzAwMCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBhbGVydCgnTm8gaW1hZ2Ugc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGRpc3BsYXlzIGltYWdlIGluIG1vZGFsXG4gICAgICAgICovXG4gICAgICAgIGltYWdlSW5Nb2RhbDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgXHRcdFxuICAgIFx0XHR2YXIgdGhlU3JjID0gJCh0aGlzKS5jbG9zZXN0KCcuaW1hZ2UnKS5maW5kKCdpbWcnKS5hdHRyKCdzcmMnKTtcbiAgICBcdFx0XG4gICAgXHRcdCQoJ2ltZyN0aGVQaWMnKS5hdHRyKCdzcmMnLCB0aGVTcmMpO1xuICAgIFx0XHRcbiAgICBcdFx0JCgnI3ZpZXdQaWMnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGRlbGV0ZXMgYW4gaW1hZ2UgZnJvbSB0aGUgbGlicmFyeVxuICAgICAgICAqL1xuICAgICAgICBkZWxldGVJbWFnZTogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgXHRcdFxuICAgIFx0XHR2YXIgdG9EZWwgPSAkKHRoaXMpLmNsb3Nlc3QoJy5pbWFnZScpO1xuICAgIFx0XHR2YXIgdGhlVVJMID0gJCh0aGlzKS5hdHRyKCdkYXRhLWltZycpO1xuICAgIFx0XHRcbiAgICBcdFx0JCgnI2RlbGV0ZUltYWdlTW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgIFx0XHRcbiAgICBcdFx0JCgnYnV0dG9uI2RlbGV0ZUltYWdlQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKXtcbiAgICBcdFx0XG4gICAgXHRcdFx0JCh0aGlzKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICBcdFx0XHRcbiAgICBcdFx0XHR2YXIgdGhlQnV0dG9uID0gJCh0aGlzKTtcbiAgICBcdFx0XG4gICAgXHRcdFx0JC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBhcHBVSS5zaXRlVXJsK1wiYXNzZXRzL2RlbEltYWdlXCIsXG4gICAgXHRcdFx0XHRkYXRhOiB7ZmlsZTogdGhlVVJMfSxcbiAgICBcdFx0XHRcdHR5cGU6ICdwb3N0J1xuICAgIFx0XHRcdH0pLmRvbmUoZnVuY3Rpb24oKXtcbiAgICBcdFx0XHRcbiAgICBcdFx0XHRcdHRoZUJ1dHRvbi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICBcdFx0XHRcdFxuICAgIFx0XHRcdFx0JCgnI2RlbGV0ZUltYWdlTW9kYWwnKS5tb2RhbCgnaGlkZScpO1xuICAgIFx0XHRcdFx0XG4gICAgXHRcdFx0XHR0b0RlbC5mYWRlT3V0KDgwMCwgZnVuY3Rpb24oKXtcbiAgICBcdFx0XHRcdFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcbiAgICBcdFx0XHRcdFx0XHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0fSk7XG4gICAgXHRcdFx0XG4gICAgXHRcdFx0fSk7XG4gICAgXHRcdFxuICAgIFx0XHRcbiAgICBcdFx0fSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9O1xuICAgIFxuICAgIGltYWdlTGlicmFyeS5pbml0KCk7XG5cbn0oKSk7IiwiKGZ1bmN0aW9uICgpe1xuXHRcInVzZSBzdHJpY3RcIjtcblxuXHR2YXIgY2FudmFzRWxlbWVudCA9IHJlcXVpcmUoJy4vY2FudmFzRWxlbWVudC5qcycpLkVsZW1lbnQ7XG5cdHZhciBiQ29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcuanMnKTtcblx0dmFyIHNpdGVCdWlsZGVyID0gcmVxdWlyZSgnLi9idWlsZGVyLmpzJyk7XG5cbiAgICB2YXIgc3R5bGVlZGl0b3IgPSB7XG5cbiAgICAgICAgcmFkaW9TdHlsZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGVTdHlsZScpLFxuICAgICAgICBsYWJlbFN0eWxlTW9kZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGVTdHlsZUxhYmVsJyksXG4gICAgICAgIGJ1dHRvblNhdmVDaGFuZ2VzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2F2ZVN0eWxpbmcnKSxcbiAgICAgICAgYWN0aXZlRWxlbWVudDoge30sIC8vaG9sZHMgdGhlIGVsZW1lbnQgY3VycmVudHkgYmVpbmcgZWRpdGVkXG4gICAgICAgIGFsbFN0eWxlSXRlbXNPbkNhbnZhczogW10sXG4gICAgICAgIF9vbGRJY29uOiBbXSxcbiAgICAgICAgc3R5bGVFZGl0b3I6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdHlsZUVkaXRvcicpLFxuICAgICAgICBmb3JtU3R5bGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdHlsaW5nRm9ybScpLFxuICAgICAgICBidXR0b25SZW1vdmVFbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVsZXRlRWxlbWVudENvbmZpcm0nKSxcbiAgICAgICAgYnV0dG9uQ2xvbmVFbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xvbmVFbGVtZW50QnV0dG9uJyksXG4gICAgICAgIGJ1dHRvblJlc2V0RWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0U3R5bGVCdXR0b24nKSxcbiAgICAgICAgc2VsZWN0TGlua3NJbmVybmFsOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW50ZXJuYWxMaW5rc0Ryb3Bkb3duJyksXG4gICAgICAgIHNlbGVjdExpbmtzUGFnZXM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlTGlua3NEcm9wZG93bicpLFxuICAgICAgICB2aWRlb0lucHV0WW91dHViZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3lvdXR1YmVJRCcpLFxuICAgICAgICB2aWRlb0lucHV0VmltZW86IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aW1lb0lEJyksXG4gICAgICAgIGlucHV0Q3VzdG9tTGluazogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ludGVybmFsTGlua3NDdXN0b20nKSxcbiAgICAgICAgc2VsZWN0SWNvbnM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpY29ucycpLFxuICAgICAgICBidXR0b25EZXRhaWxzQXBwbGllZEhpZGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZXRhaWxzQXBwbGllZE1lc3NhZ2VIaWRlJyksXG4gICAgICAgIGJ1dHRvbkNsb3NlU3R5bGVFZGl0b3I6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzdHlsZUVkaXRvciA+IGEuY2xvc2UnKSxcbiAgICAgICAgdWxQYWdlTGlzdDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2VMaXN0JyksXG5cbiAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIC8vZXZlbnRzXG4gICAgICAgICAgICAkKHRoaXMucmFkaW9TdHlsZSkub24oJ2NsaWNrJywgdGhpcy5hY3RpdmF0ZVN0eWxlTW9kZSk7XG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uU2F2ZUNoYW5nZXMpLm9uKCdjbGljaycsIHRoaXMudXBkYXRlU3R5bGluZyk7XG4gICAgICAgICAgICAkKHRoaXMuZm9ybVN0eWxlKS5vbignZm9jdXMnLCAnaW5wdXQnLCB0aGlzLmFuaW1hdGVTdHlsZUlucHV0SW4pLm9uKCdibHVyJywgJ2lucHV0JywgdGhpcy5hbmltYXRlU3R5bGVJbnB1dE91dCk7XG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uUmVtb3ZlRWxlbWVudCkub24oJ2NsaWNrJywgdGhpcy5kZWxldGVFbGVtZW50KTtcbiAgICAgICAgICAgICQodGhpcy5idXR0b25DbG9uZUVsZW1lbnQpLm9uKCdjbGljaycsIHRoaXMuY2xvbmVFbGVtZW50KTtcbiAgICAgICAgICAgICQodGhpcy5idXR0b25SZXNldEVsZW1lbnQpLm9uKCdjbGljaycsIHRoaXMucmVzZXRFbGVtZW50KTtcbiAgICAgICAgICAgICQodGhpcy5zZWxlY3RMaW5rc0luZXJuYWwpLm9uKCdjaGFuZ2UnLCB0aGlzLnJlc2V0U2VsZWN0TGlua3NJbnRlcm5hbCk7XG4gICAgICAgICAgICAkKHRoaXMuc2VsZWN0TGlua3NQYWdlcykub24oJ2NoYW5nZScsIHRoaXMucmVzZXRTZWxlY3RMaW5rc1BhZ2VzKTtcbiAgICAgICAgICAgICQodGhpcy52aWRlb0lucHV0WW91dHViZSkub24oJ2ZvY3VzJywgZnVuY3Rpb24oKXsgJChzdHlsZWVkaXRvci52aWRlb0lucHV0VmltZW8pLnZhbCgnJyk7IH0pO1xuICAgICAgICAgICAgJCh0aGlzLnZpZGVvSW5wdXRWaW1lbykub24oJ2ZvY3VzJywgZnVuY3Rpb24oKXsgJChzdHlsZWVkaXRvci52aWRlb0lucHV0WW91dHViZSkudmFsKCcnKTsgfSk7XG4gICAgICAgICAgICAkKHRoaXMuaW5wdXRDdXN0b21MaW5rKS5vbignZm9jdXMnLCB0aGlzLnJlc2V0U2VsZWN0QWxsTGlua3MpO1xuICAgICAgICAgICAgJCh0aGlzLmJ1dHRvbkRldGFpbHNBcHBsaWVkSGlkZSkub24oJ2NsaWNrJywgZnVuY3Rpb24oKXskKHRoaXMpLnBhcmVudCgpLmZhZGVPdXQoNTAwKTt9KTtcbiAgICAgICAgICAgICQodGhpcy5idXR0b25DbG9zZVN0eWxlRWRpdG9yKS5vbignY2xpY2snLCB0aGlzLmNsb3NlU3R5bGVFZGl0b3IpO1xuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ21vZGVDb250ZW50IG1vZGVCbG9ja3MnLCAnYm9keScsIHRoaXMuZGVBY3RpdmF0ZU1vZGUpO1xuXG4gICAgICAgICAgICAvL2Nob3NlbiBmb250LWF3ZXNvbWUgZHJvcGRvd25cbiAgICAgICAgICAgICQodGhpcy5zZWxlY3RJY29ucykuY2hvc2VuKHsnc2VhcmNoX2NvbnRhaW5zJzogdHJ1ZX0pO1xuXG4gICAgICAgICAgICAvL2NoZWNrIGlmIGZvcm1EYXRhIGlzIHN1cHBvcnRlZFxuICAgICAgICAgICAgaWYgKCF3aW5kb3cuRm9ybURhdGEpe1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZUZpbGVVcGxvYWRzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vc2hvdyB0aGUgc3R5bGUgbW9kZSByYWRpbyBidXR0b25cbiAgICAgICAgICAgICQodGhpcy5sYWJlbFN0eWxlTW9kZSkuc2hvdygpO1xuXG4gICAgICAgICAgICAvL2xpc3RlbiBmb3IgdGhlIGJlZm9yZVNhdmUgZXZlbnRcbiAgICAgICAgICAgICQoJ2JvZHknKS5vbignYmVmb3JlU2F2ZScsIHRoaXMuY2xvc2VTdHlsZUVkaXRvcik7XG5cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qXG4gICAgICAgICAgICBBY3RpdmF0ZXMgc3R5bGUgZWRpdG9yIG1vZGVcbiAgICAgICAgKi9cbiAgICAgICAgYWN0aXZhdGVTdHlsZU1vZGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgaTtcblxuICAgICAgICAgICAgLy9FbGVtZW50IG9iamVjdCBleHRlbnRpb25cbiAgICAgICAgICAgIGNhbnZhc0VsZW1lbnQucHJvdG90eXBlLmNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVlZGl0b3Iuc3R5bGVDbGljayhlbCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgb3ZlcmxheSBzcGFuIGZyb20gcG9ydGZvbGlvXG4gICAgICAgICAgICBmb3IoaSA9IDE7IGkgPD0gJChcInVsI3BhZ2UxIGxpXCIpLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBcIiN1aS1pZC1cIiArIGk7XG4gICAgICAgICAgICAgICAgJChpZCkuY29udGVudHMoKS5maW5kKFwiLm92ZXJsYXlcIikucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgLy90cmlnZ2VyIGN1c3RvbSBldmVudFxuICAgICAgICAgICAgJCgnYm9keScpLnRyaWdnZXIoJ21vZGVEZXRhaWxzJyk7XG5cbiAgICAgICAgICAgIC8vZGlzYWJsZSBmcmFtZUNvdmVyc1xuICAgICAgICAgICAgZm9yKCBpID0gMDsgaSA8IHNpdGVCdWlsZGVyLnNpdGUuc2l0ZVBhZ2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgIHNpdGVCdWlsZGVyLnNpdGUuc2l0ZVBhZ2VzW2ldLnRvZ2dsZUZyYW1lQ292ZXJzKCdPZmYnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9jcmVhdGUgYW4gb2JqZWN0IGZvciBldmVyeSBlZGl0YWJsZSBlbGVtZW50IG9uIHRoZSBjYW52YXMgYW5kIHNldHVwIGl0J3MgZXZlbnRzXG5cbiAgICAgICAgICAgIGZvciggaSA9IDA7IGkgPCBzaXRlQnVpbGRlci5zaXRlLnNpdGVQYWdlcy5sZW5ndGg7IGkrKyApIHtcblxuICAgICAgICAgICAgICAgIGZvciggdmFyIHggPSAwOyB4IDwgc2l0ZUJ1aWxkZXIuc2l0ZS5zaXRlUGFnZXNbaV0uYmxvY2tzLmxlbmd0aDsgeCsrICkge1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciggdmFyIGtleSBpbiBiQ29uZmlnLmVkaXRhYmxlSXRlbXMgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICQoc2l0ZUJ1aWxkZXIuc2l0ZS5zaXRlUGFnZXNbaV0uYmxvY2tzW3hdLmZyYW1lKS5jb250ZW50cygpLmZpbmQoIGJDb25maWcucGFnZUNvbnRhaW5lciArICcgJysga2V5ICkuZWFjaChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0VsZW1lbnQgPSBuZXcgY2FudmFzRWxlbWVudCh0aGlzKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0VsZW1lbnQuYWN0aXZhdGUoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlZWRpdG9yLmFsbFN0eWxlSXRlbXNPbkNhbnZhcy5wdXNoKCBuZXdFbGVtZW50ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmF0dHIoJ2RhdGEtc2VsZWN0b3InLCBrZXkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyokKCcjcGFnZUxpc3QgdWwgbGkgaWZyYW1lJykuZWFjaChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgZm9yKCB2YXIga2V5IGluIGJDb25maWcuZWRpdGFibGVJdGVtcyApIHtcblxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNvbnRlbnRzKCkuZmluZCggYkNvbmZpZy5wYWdlQ29udGFpbmVyICsgJyAnKyBrZXkgKS5lYWNoKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdFbGVtZW50ID0gbmV3IGNhbnZhc0VsZW1lbnQodGhpcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0VsZW1lbnQuYWN0aXZhdGUoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVlZGl0b3IuYWxsU3R5bGVJdGVtc09uQ2FudmFzLnB1c2goIG5ld0VsZW1lbnQgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hdHRyKCdkYXRhLXNlbGVjdG9yJywga2V5KTtcblxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7Ki9cblxuICAgICAgICB9LFxuXG5cbiAgICAgICAgLypcbiAgICAgICAgICAgIEV2ZW50IGhhbmRsZXIgZm9yIHdoZW4gdGhlIHN0eWxlIGVkaXRvciBpcyBlbnZva2VkIG9uIGFuIGl0ZW1cbiAgICAgICAgKi9cbiAgICAgICAgc3R5bGVDbGljazogZnVuY3Rpb24oZWwpIHtcblxuICAgICAgICAgICAgLy9pZiB3ZSBoYXZlIGFuIGFjdGl2ZSBlbGVtZW50LCBtYWtlIGl0IHVuYWN0aXZlXG4gICAgICAgICAgICBpZiggT2JqZWN0LmtleXModGhpcy5hY3RpdmVFbGVtZW50KS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9zZXQgdGhlIGFjdGl2ZSBlbGVtZW50XG4gICAgICAgICAgICB2YXIgYWN0aXZlRWxlbWVudCA9IG5ldyBjYW52YXNFbGVtZW50KGVsKTtcbiAgICAgICAgICAgIGFjdGl2ZUVsZW1lbnQuc2V0UGFyZW50QmxvY2soKTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IGFjdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgICAgIC8vdW5iaW5kIGhvdmVyIGFuZCBjbGljayBldmVudHMgYW5kIG1ha2UgdGhpcyBpdGVtIGFjdGl2ZVxuICAgICAgICAgICAgdGhpcy5hY3RpdmVFbGVtZW50LnNldE9wZW4oKTtcblxuICAgICAgICAgICAgdmFyIHRoZVNlbGVjdG9yID0gJCh0aGlzLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkuYXR0cignZGF0YS1zZWxlY3RvcicpO1xuXG4gICAgICAgICAgICAkKCcjZWRpdGluZ0VsZW1lbnQnKS50ZXh0KCB0aGVTZWxlY3RvciApO1xuXG4gICAgICAgICAgICAvL2FjdGl2YXRlIGZpcnN0IHRhYlxuICAgICAgICAgICAgJCgnI2RldGFpbFRhYnMgYTpmaXJzdCcpLmNsaWNrKCk7XG5cbiAgICAgICAgICAgIC8vaGlkZSBhbGwgYnkgZGVmYXVsdFxuICAgICAgICAgICAgJCgndWwjZGV0YWlsVGFicyBsaTpndCgwKScpLmhpZGUoKTtcblxuICAgICAgICAgICAgLy93aGF0IGFyZSB3ZSBkZWFsaW5nIHdpdGg/XG4gICAgICAgICAgICBpZiggJCh0aGlzLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkucHJvcCgndGFnTmFtZScpID09PSAnQScgfHwgJCh0aGlzLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkucGFyZW50KCkucHJvcCgndGFnTmFtZScpID09PSAnQScgKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRMaW5rKHRoaXMuYWN0aXZlRWxlbWVudC5lbGVtZW50KTtcblxuICAgICAgICAgICAgfVxuXG5cdFx0XHRpZiggJCh0aGlzLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkucHJvcCgndGFnTmFtZScpID09PSAnSU1HJyApe1xuXG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0SW1hZ2UodGhpcy5hY3RpdmVFbGVtZW50LmVsZW1lbnQpO1xuXG4gICAgICAgICAgICB9XG5cblx0XHRcdGlmKCAkKHRoaXMuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5hdHRyKCdkYXRhLXR5cGUnKSA9PT0gJ3ZpZGVvJyApIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuZWRpdFZpZGVvKHRoaXMuYWN0aXZlRWxlbWVudC5lbGVtZW50KTtcblxuICAgICAgICAgICAgfVxuXG5cdFx0XHRpZiggJCh0aGlzLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkuaGFzQ2xhc3MoJ2ZhJykgKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRJY29uKHRoaXMuYWN0aXZlRWxlbWVudC5lbGVtZW50KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2xvYWQgdGhlIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgIHRoaXMuYnVpbGRlU3R5bGVFbGVtZW50cyh0aGVTZWxlY3Rvcik7XG5cbiAgICAgICAgICAgIC8vb3BlbiBzaWRlIHBhbmVsXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZVNpZGVQYW5lbCgnb3BlbicpO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgLypcbiAgICAgICAgICAgIGR5bmFtaWNhbGx5IGdlbmVyYXRlcyB0aGUgZm9ybSBmaWVsZHMgZm9yIGVkaXRpbmcgYW4gZWxlbWVudHMgc3R5bGUgYXR0cmlidXRlc1xuICAgICAgICAqL1xuICAgICAgICBidWlsZGVTdHlsZUVsZW1lbnRzOiBmdW5jdGlvbih0aGVTZWxlY3Rvcikge1xuXG4gICAgICAgICAgICAvL2RlbGV0ZSB0aGUgb2xkIG9uZXMgZmlyc3RcbiAgICAgICAgICAgICQoJyNzdHlsZUVsZW1lbnRzID4gKjpub3QoI3N0eWxlRWxUZW1wbGF0ZSknKS5lYWNoKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZm9yKCB2YXIgeD0wOyB4PGJDb25maWcuZWRpdGFibGVJdGVtc1t0aGVTZWxlY3Rvcl0ubGVuZ3RoOyB4KysgKSB7XG5cbiAgICAgICAgICAgICAgICAvL2NyZWF0ZSBzdHlsZSBlbGVtZW50c1xuICAgICAgICAgICAgICAgIHZhciBuZXdTdHlsZUVsID0gJCgnI3N0eWxlRWxUZW1wbGF0ZScpLmNsb25lKCk7XG4gICAgICAgICAgICAgICAgbmV3U3R5bGVFbC5hdHRyKCdpZCcsICcnKTtcbiAgICAgICAgICAgICAgICBuZXdTdHlsZUVsLmZpbmQoJy5jb250cm9sLWxhYmVsJykudGV4dCggYkNvbmZpZy5lZGl0YWJsZUl0ZW1zW3RoZVNlbGVjdG9yXVt4XStcIjpcIiApO1xuXG4gICAgICAgICAgICAgICAgaWYoIHRoZVNlbGVjdG9yICsgXCIgOiBcIiArIGJDb25maWcuZWRpdGFibGVJdGVtc1t0aGVTZWxlY3Rvcl1beF0gaW4gYkNvbmZpZy5lZGl0YWJsZUl0ZW1PcHRpb25zKSB7Ly93ZSd2ZSBnb3QgYSBkcm9wZG93biBpbnN0ZWFkIG9mIG9wZW4gdGV4dCBpbnB1dFxuXG4gICAgICAgICAgICAgICAgICAgIG5ld1N0eWxlRWwuZmluZCgnaW5wdXQnKS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3RHJvcERvd24gPSAkKCc8c2VsZWN0IGNsYXNzPVwiZm9ybS1jb250cm9sIHNlbGVjdCBzZWxlY3QtcHJpbWFyeSBidG4tYmxvY2sgc2VsZWN0LXNtXCI+PC9zZWxlY3Q+Jyk7XG4gICAgICAgICAgICAgICAgICAgIG5ld0Ryb3BEb3duLmF0dHIoJ25hbWUnLCBiQ29uZmlnLmVkaXRhYmxlSXRlbXNbdGhlU2VsZWN0b3JdW3hdKTtcblxuXG4gICAgICAgICAgICAgICAgICAgIGZvciggdmFyIHo9MDsgejxiQ29uZmlnLmVkaXRhYmxlSXRlbU9wdGlvbnNbIHRoZVNlbGVjdG9yK1wiIDogXCIrYkNvbmZpZy5lZGl0YWJsZUl0ZW1zW3RoZVNlbGVjdG9yXVt4XSBdLmxlbmd0aDsgeisrICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3T3B0aW9uID0gJCgnPG9wdGlvbiB2YWx1ZT1cIicrYkNvbmZpZy5lZGl0YWJsZUl0ZW1PcHRpb25zW3RoZVNlbGVjdG9yK1wiIDogXCIrYkNvbmZpZy5lZGl0YWJsZUl0ZW1zW3RoZVNlbGVjdG9yXVt4XV1bel0rJ1wiPicrYkNvbmZpZy5lZGl0YWJsZUl0ZW1PcHRpb25zW3RoZVNlbGVjdG9yK1wiIDogXCIrYkNvbmZpZy5lZGl0YWJsZUl0ZW1zW3RoZVNlbGVjdG9yXVt4XV1bel0rJzwvb3B0aW9uPicpO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBiQ29uZmlnLmVkaXRhYmxlSXRlbU9wdGlvbnNbdGhlU2VsZWN0b3IrXCIgOiBcIitiQ29uZmlnLmVkaXRhYmxlSXRlbXNbdGhlU2VsZWN0b3JdW3hdXVt6XSA9PT0gJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLmNzcyggYkNvbmZpZy5lZGl0YWJsZUl0ZW1zW3RoZVNlbGVjdG9yXVt4XSApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY3VycmVudCB2YWx1ZSwgbWFya2VkIGFzIHNlbGVjdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3T3B0aW9uLmF0dHIoJ3NlbGVjdGVkJywgJ3RydWUnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEcm9wRG93bi5hcHBlbmQoIG5ld09wdGlvbiApO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBuZXdTdHlsZUVsLmFwcGVuZCggbmV3RHJvcERvd24gKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3RHJvcERvd24uc2VsZWN0MigpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBuZXdTdHlsZUVsLmZpbmQoJ2lucHV0JykudmFsKCAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkuY3NzKCBiQ29uZmlnLmVkaXRhYmxlSXRlbXNbdGhlU2VsZWN0b3JdW3hdICkgKS5hdHRyKCduYW1lJywgYkNvbmZpZy5lZGl0YWJsZUl0ZW1zW3RoZVNlbGVjdG9yXVt4XSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoIGJDb25maWcuZWRpdGFibGVJdGVtc1t0aGVTZWxlY3Rvcl1beF0gPT09ICdiYWNrZ3JvdW5kLWltYWdlJyApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3R5bGVFbC5maW5kKCdpbnB1dCcpLmJpbmQoJ2ZvY3VzJywgZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGVJbnB1dCA9ICQodGhpcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjaW1hZ2VNb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2ltYWdlTW9kYWwgLmltYWdlIGJ1dHRvbi51c2VJbWFnZScpLnVuYmluZCgnY2xpY2snKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjaW1hZ2VNb2RhbCcpLm9uKCdjbGljaycsICcuaW1hZ2UgYnV0dG9uLnVzZUltYWdlJywgZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgICd1cmwoXCInKyQodGhpcykuYXR0cignZGF0YS11cmwnKSsnXCIpJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy91cGRhdGUgbGl2ZSBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVJbnB1dC52YWwoICd1cmwoXCInKyQodGhpcykuYXR0cignZGF0YS11cmwnKSsnXCIpJyApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaGlkZSBtb2RhbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjaW1hZ2VNb2RhbCcpLm1vZGFsKCdoaWRlJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy93ZSd2ZSBnb3QgcGVuZGluZyBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpdGVCdWlsZGVyLnNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBiQ29uZmlnLmVkaXRhYmxlSXRlbXNbdGhlU2VsZWN0b3JdW3hdLmluZGV4T2YoXCJjb2xvclwiKSA+IC0xICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLmNzcyggYkNvbmZpZy5lZGl0YWJsZUl0ZW1zW3RoZVNlbGVjdG9yXVt4XSApICE9PSAndHJhbnNwYXJlbnQnICYmICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5jc3MoIGJDb25maWcuZWRpdGFibGVJdGVtc1t0aGVTZWxlY3Rvcl1beF0gKSAhPT0gJ25vbmUnICYmICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5jc3MoIGJDb25maWcuZWRpdGFibGVJdGVtc1t0aGVTZWxlY3Rvcl1beF0gKSAhPT0gJycgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTdHlsZUVsLnZhbCggJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLmNzcyggYkNvbmZpZy5lZGl0YWJsZUl0ZW1zW3RoZVNlbGVjdG9yXVt4XSApICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3R5bGVFbC5maW5kKCdpbnB1dCcpLnNwZWN0cnVtKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmZXJyZWRGb3JtYXQ6IFwiaGV4XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1BhbGV0dGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsb3dFbXB0eTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93SW5wdXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFsZXR0ZTogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCIjMDAwXCIsXCIjNDQ0XCIsXCIjNjY2XCIsXCIjOTk5XCIsXCIjY2NjXCIsXCIjZWVlXCIsXCIjZjNmM2YzXCIsXCIjZmZmXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCIjZjAwXCIsXCIjZjkwXCIsXCIjZmYwXCIsXCIjMGYwXCIsXCIjMGZmXCIsXCIjMDBmXCIsXCIjOTBmXCIsXCIjZjBmXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCIjZjRjY2NjXCIsXCIjZmNlNWNkXCIsXCIjZmZmMmNjXCIsXCIjZDllYWQzXCIsXCIjZDBlMGUzXCIsXCIjY2ZlMmYzXCIsXCIjZDlkMmU5XCIsXCIjZWFkMWRjXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCIjZWE5OTk5XCIsXCIjZjljYjljXCIsXCIjZmZlNTk5XCIsXCIjYjZkN2E4XCIsXCIjYTJjNGM5XCIsXCIjOWZjNWU4XCIsXCIjYjRhN2Q2XCIsXCIjZDVhNmJkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCIjZTA2NjY2XCIsXCIjZjZiMjZiXCIsXCIjZmZkOTY2XCIsXCIjOTNjNDdkXCIsXCIjNzZhNWFmXCIsXCIjNmZhOGRjXCIsXCIjOGU3Y2MzXCIsXCIjYzI3YmEwXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCIjYzAwXCIsXCIjZTY5MTM4XCIsXCIjZjFjMjMyXCIsXCIjNmFhODRmXCIsXCIjNDU4MThlXCIsXCIjM2Q4NWM2XCIsXCIjNjc0ZWE3XCIsXCIjYTY0ZDc5XCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCIjOTAwXCIsXCIjYjQ1ZjA2XCIsXCIjYmY5MDAwXCIsXCIjMzg3NjFkXCIsXCIjMTM0ZjVjXCIsXCIjMGI1Mzk0XCIsXCIjMzUxYzc1XCIsXCIjNzQxYjQ3XCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCIjNjAwXCIsXCIjNzgzZjA0XCIsXCIjN2Y2MDAwXCIsXCIjMjc0ZTEzXCIsXCIjMGMzNDNkXCIsXCIjMDczNzYzXCIsXCIjMjAxMjRkXCIsXCIjNGMxMTMwXCJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbmV3U3R5bGVFbC5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcblxuICAgICAgICAgICAgICAgICQoJyNzdHlsZUVsZW1lbnRzJykuYXBwZW5kKCBuZXdTdHlsZUVsICk7XG5cbiAgICAgICAgICAgICAgICAkKCcjc3R5bGVFZGl0b3IgZm9ybSNzdHlsaW5nRm9ybScpLmhlaWdodCgnYXV0bycpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qXG4gICAgICAgICAgICBBcHBsaWVzIHVwZGF0ZWQgc3R5bGluZyB0byB0aGUgY2FudmFzXG4gICAgICAgICovXG4gICAgICAgIHVwZGF0ZVN0eWxpbmc6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgZWxlbWVudElEO1xuXG4gICAgICAgICAgICAkKCcjc3R5bGVFZGl0b3IgI3RhYjEgLmZvcm0tZ3JvdXA6bm90KCNzdHlsZUVsVGVtcGxhdGUpIGlucHV0LCAjc3R5bGVFZGl0b3IgI3RhYjEgLmZvcm0tZ3JvdXA6bm90KCNzdHlsZUVsVGVtcGxhdGUpIHNlbGVjdCcpLmVhY2goZnVuY3Rpb24oKXtcblxuXHRcdFx0XHRpZiggJCh0aGlzKS5hdHRyKCduYW1lJykgIT09IHVuZGVmaW5lZCApIHtcblxuICAgICAgICAgICAgICAgIFx0JChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLmNzcyggJCh0aGlzKS5hdHRyKCduYW1lJyksICAkKHRoaXMpLnZhbCgpKTtcblxuXHRcdFx0XHR9XG5cbiAgICAgICAgICAgICAgICAvKiBTQU5EQk9YICovXG5cbiAgICAgICAgICAgICAgICBpZiggc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5zYW5kYm94ICkge1xuXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRJRCA9ICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5hdHRyKCdpZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoJyMnK3N0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuc2FuZGJveCkuY29udGVudHMoKS5maW5kKCcjJytlbGVtZW50SUQpLmNzcyggJCh0aGlzKS5hdHRyKCduYW1lJyksICAkKHRoaXMpLnZhbCgpICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKiBFTkQgU0FOREJPWCAqL1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9saW5rc1xuICAgICAgICAgICAgaWYoICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5wcm9wKCd0YWdOYW1lJykgPT09ICdBJyApIHtcblxuICAgICAgICAgICAgICAgIC8vY2hhbmdlIHRoZSBocmVmIHByb3A/XG4gICAgICAgICAgICAgICAgaWYoICQoJ3NlbGVjdCNpbnRlcm5hbExpbmtzRHJvcGRvd24nKS52YWwoKSAhPT0gJyMnICkge1xuXG4gICAgICAgICAgICAgICAgICAgICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5hdHRyKCdocmVmJywgJCgnc2VsZWN0I2ludGVybmFsTGlua3NEcm9wZG93bicpLnZhbCgpKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggJCgnc2VsZWN0I3BhZ2VMaW5rc0Ryb3Bkb3duJykudmFsKCkgIT09ICcjJyApIHtcblxuICAgICAgICAgICAgICAgICAgICAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkuYXR0cignaHJlZicsICQoJ3NlbGVjdCNwYWdlTGlua3NEcm9wZG93bicpLnZhbCgpICk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoICQoJ2lucHV0I2ludGVybmFsTGlua3NDdXN0b20nKS52YWwoKSAhPT0gJycgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLmF0dHIoJ2hyZWYnLCAkKCdpbnB1dCNpbnRlcm5hbExpbmtzQ3VzdG9tJykudmFsKCkpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyogU0FOREJPWCAqL1xuXG4gICAgICAgICAgICAgICAgaWYoIHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuc2FuZGJveCApIHtcblxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50SUQgPSAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkuYXR0cignaWQnKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiggJCgnc2VsZWN0I2ludGVybmFsTGlua3NEcm9wZG93bicpLnZhbCgpICE9PSAnIycgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyMnK3N0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuc2FuZGJveCkuY29udGVudHMoKS5maW5kKCcjJytlbGVtZW50SUQpLmF0dHIoJ2hyZWYnLCAkKCdzZWxlY3QjaW50ZXJuYWxMaW5rc0Ryb3Bkb3duJykudmFsKCkpO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggJCgnc2VsZWN0I3BhZ2VMaW5rc0Ryb3Bkb3duJykudmFsKCkgIT09ICcjJyApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnIycrc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5zYW5kYm94KS5jb250ZW50cygpLmZpbmQoJyMnK2VsZW1lbnRJRCkuYXR0cignaHJlZicsICQoJ3NlbGVjdCNwYWdlTGlua3NEcm9wZG93bicpLnZhbCgpICk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKCAkKCdpbnB1dCNpbnRlcm5hbExpbmtzQ3VzdG9tJykudmFsKCkgIT09ICcnICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjJytzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LnNhbmRib3gpLmNvbnRlbnRzKCkuZmluZCgnIycrZWxlbWVudElEKS5hdHRyKCdocmVmJywgJCgnaW5wdXQjaW50ZXJuYWxMaW5rc0N1c3RvbScpLnZhbCgpKTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKiBFTkQgU0FOREJPWCAqL1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKCAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkucGFyZW50KCkucHJvcCgndGFnTmFtZScpID09PSAnQScgKSB7XG5cbiAgICAgICAgICAgICAgICAvL2NoYW5nZSB0aGUgaHJlZiBwcm9wP1xuXHRcdFx0XHRpZiggJCgnc2VsZWN0I2ludGVybmFsTGlua3NEcm9wZG93bicpLnZhbCgpICE9PSAnIycgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLnBhcmVudCgpLmF0dHIoJ2hyZWYnLCAkKCdzZWxlY3QjaW50ZXJuYWxMaW5rc0Ryb3Bkb3duJykudmFsKCkpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCAkKCdzZWxlY3QjcGFnZUxpbmtzRHJvcGRvd24nKS52YWwoKSAhPT0gJyMnICkge1xuXG4gICAgICAgICAgICAgICAgICAgICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5wYXJlbnQoKS5hdHRyKCdocmVmJywgJCgnc2VsZWN0I3BhZ2VMaW5rc0Ryb3Bkb3duJykudmFsKCkgKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggJCgnaW5wdXQjaW50ZXJuYWxMaW5rc0N1c3RvbScpLnZhbCgpICE9PSAnJyApIHtcblxuICAgICAgICAgICAgICAgICAgICAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkucGFyZW50KCkuYXR0cignaHJlZicsICQoJ2lucHV0I2ludGVybmFsTGlua3NDdXN0b20nKS52YWwoKSk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKiBTQU5EQk9YICovXG5cbiAgICAgICAgICAgICAgICBpZiggc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5zYW5kYm94ICkge1xuXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRJRCA9ICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5hdHRyKCdpZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKCAkKCdzZWxlY3QjaW50ZXJuYWxMaW5rc0Ryb3Bkb3duJykudmFsKCkgIT09ICcjJyApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnIycrc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5zYW5kYm94KS5jb250ZW50cygpLmZpbmQoJyMnK2VsZW1lbnRJRCkucGFyZW50KCkuYXR0cignaHJlZicsICQoJ3NlbGVjdCNpbnRlcm5hbExpbmtzRHJvcGRvd24nKS52YWwoKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKCAkKCdzZWxlY3QjcGFnZUxpbmtzRHJvcGRvd24nKS52YWwoKSAhPT0gJyMnICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjJytzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LnNhbmRib3gpLmNvbnRlbnRzKCkuZmluZCgnIycrZWxlbWVudElEKS5wYXJlbnQoKS5hdHRyKCdocmVmJywgJCgnc2VsZWN0I3BhZ2VMaW5rc0Ryb3Bkb3duJykudmFsKCkgKTtcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoICQoJ2lucHV0I2ludGVybmFsTGlua3NDdXN0b20nKS52YWwoKSAhPT0gJycgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyMnK3N0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuc2FuZGJveCkuY29udGVudHMoKS5maW5kKCcjJytlbGVtZW50SUQpLnBhcmVudCgpLmF0dHIoJ2hyZWYnLCAkKCdpbnB1dCNpbnRlcm5hbExpbmtzQ3VzdG9tJykudmFsKCkpO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qIEVORCBTQU5EQk9YICovXG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9pY29uc1xuICAgICAgICAgICAgaWYoICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5oYXNDbGFzcygnZmEnKSApIHtcblxuICAgICAgICAgICAgICAgIC8vb3V0IHdpdGggdGhlIG9sZCwgaW4gd2l0aCB0aGUgbmV3IDopXG4gICAgICAgICAgICAgICAgLy9nZXQgaWNvbiBjbGFzcyBuYW1lLCBzdGFydGluZyB3aXRoIGZhLVxuICAgICAgICAgICAgICAgIHZhciBnZXQgPSAkLmdyZXAoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50LmNsYXNzTmFtZS5zcGxpdChcIiBcIiksIGZ1bmN0aW9uKHYsIGkpe1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2LmluZGV4T2YoJ2ZhLScpID09PSAwO1xuXG4gICAgICAgICAgICAgICAgfSkuam9pbigpO1xuXG4gICAgICAgICAgICAgICAgLy9pZiB0aGUgaWNvbnMgaXMgYmVpbmcgY2hhbmdlZCwgc2F2ZSB0aGUgb2xkIG9uZSBzbyB3ZSBjYW4gcmVzZXQgaXQgaWYgbmVlZGVkXG5cbiAgICAgICAgICAgICAgICBpZiggZ2V0ICE9PSAkKCdzZWxlY3QjaWNvbnMnKS52YWwoKSApIHtcblxuICAgICAgICAgICAgICAgICAgICAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkudW5pcXVlSWQoKTtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVlZGl0b3IuX29sZEljb25bJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLmF0dHIoJ2lkJyldID0gZ2V0O1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLnJlbW92ZUNsYXNzKCBnZXQgKS5hZGRDbGFzcyggJCgnc2VsZWN0I2ljb25zJykudmFsKCkgKTtcblxuXG4gICAgICAgICAgICAgICAgLyogU0FOREJPWCAqL1xuXG4gICAgICAgICAgICAgICAgaWYoIHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuc2FuZGJveCApIHtcblxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50SUQgPSAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkuYXR0cignaWQnKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnIycrc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5zYW5kYm94KS5jb250ZW50cygpLmZpbmQoJyMnK2VsZW1lbnRJRCkucmVtb3ZlQ2xhc3MoIGdldCApLmFkZENsYXNzKCAkKCdzZWxlY3QjaWNvbnMnKS52YWwoKSApO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyogRU5EIFNBTkRCT1ggKi9cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL3ZpZGVvIFVSTFxuICAgICAgICAgICAgaWYoICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5hdHRyKCdkYXRhLXR5cGUnKSA9PT0gJ3ZpZGVvJyApIHtcblxuICAgICAgICAgICAgICAgIGlmKCAkKCdpbnB1dCN5b3V0dWJlSUQnKS52YWwoKSAhPT0gJycgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLnByZXYoKS5hdHRyKCdzcmMnLCBcIi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL1wiKyQoJyN2aWRlb19UYWIgaW5wdXQjeW91dHViZUlEJykudmFsKCkpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCAkKCdpbnB1dCN2aW1lb0lEJykudmFsKCkgIT09ICcnICkge1xuXG4gICAgICAgICAgICAgICAgICAgICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5wcmV2KCkuYXR0cignc3JjJywgXCIvL3BsYXllci52aW1lby5jb20vdmlkZW8vXCIrJCgnI3ZpZGVvX1RhYiBpbnB1dCN2aW1lb0lEJykudmFsKCkrXCI/dGl0bGU9MCZhbXA7YnlsaW5lPTAmYW1wO3BvcnRyYWl0PTBcIik7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKiBTQU5EQk9YICovXG5cbiAgICAgICAgICAgICAgICBpZiggc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5zYW5kYm94ICkge1xuXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRJRCA9ICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5hdHRyKCdpZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKCAkKCdpbnB1dCN5b3V0dWJlSUQnKS52YWwoKSAhPT0gJycgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyMnK3N0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuc2FuZGJveCkuY29udGVudHMoKS5maW5kKCcjJytlbGVtZW50SUQpLnByZXYoKS5hdHRyKCdzcmMnLCBcIi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL1wiKyQoJyN2aWRlb19UYWIgaW5wdXQjeW91dHViZUlEJykudmFsKCkpO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggJCgnaW5wdXQjdmltZW9JRCcpLnZhbCgpICE9PSAnJyApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnIycrc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5zYW5kYm94KS5jb250ZW50cygpLmZpbmQoJyMnK2VsZW1lbnRJRCkucHJldigpLmF0dHIoJ3NyYycsIFwiLy9wbGF5ZXIudmltZW8uY29tL3ZpZGVvL1wiKyQoJyN2aWRlb19UYWIgaW5wdXQjdmltZW9JRCcpLnZhbCgpK1wiP3RpdGxlPTAmYW1wO2J5bGluZT0wJmFtcDtwb3J0cmFpdD0wXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qIEVORCBTQU5EQk9YICovXG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCgnI2RldGFpbHNBcHBsaWVkTWVzc2FnZScpLmZhZGVJbig2MDAsIGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ICQoJyNkZXRhaWxzQXBwbGllZE1lc3NhZ2UnKS5mYWRlT3V0KDEwMDApOyB9LCAzMDAwKTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vYWRqdXN0IGZyYW1lIGhlaWdodFxuICAgICAgICAgICAgc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5wYXJlbnRCbG9jay5oZWlnaHRBZGp1c3RtZW50KCk7XG5cblxuICAgICAgICAgICAgLy93ZSd2ZSBnb3QgcGVuZGluZyBjaGFuZ2VzXG4gICAgICAgICAgICBzaXRlQnVpbGRlci5zaXRlLnNldFBlbmRpbmdDaGFuZ2VzKHRydWUpO1xuXG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKlxuICAgICAgICAgICAgb24gZm9jdXMsIHdlJ2xsIG1ha2UgdGhlIGlucHV0IGZpZWxkcyB3aWRlclxuICAgICAgICAqL1xuICAgICAgICBhbmltYXRlU3R5bGVJbnB1dEluOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgJCh0aGlzKS5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmNzcygncmlnaHQnLCAnMHB4Jyk7XG4gICAgICAgICAgICAkKHRoaXMpLmFuaW1hdGUoeyd3aWR0aCc6ICcxMDAlJ30sIDUwMCk7XG4gICAgICAgICAgICAkKHRoaXMpLmZvY3VzKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3QoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKlxuICAgICAgICAgICAgb24gYmx1ciwgd2UnbGwgcmV2ZXJ0IHRoZSBpbnB1dCBmaWVsZHMgdG8gdGhlaXIgb3JpZ2luYWwgc2l6ZVxuICAgICAgICAqL1xuICAgICAgICBhbmltYXRlU3R5bGVJbnB1dE91dDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICQodGhpcykuYW5pbWF0ZSh7J3dpZHRoJzogJzQyJSd9LCA1MDAsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoJ3Bvc2l0aW9uJywgJ3JlbGF0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoJ3JpZ2h0JywgJ2F1dG8nKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKlxuICAgICAgICAgICAgd2hlbiB0aGUgY2xpY2tlZCBlbGVtZW50IGlzIGFuIGFuY2hvciB0YWcgKG9yIGhhcyBhIHBhcmVudCBhbmNob3IgdGFnKVxuICAgICAgICAqL1xuICAgICAgICBlZGl0TGluazogZnVuY3Rpb24oZWwpIHtcblxuICAgICAgICAgICAgJCgnYSNsaW5rX0xpbmsnKS5wYXJlbnQoKS5zaG93KCk7XG5cbiAgICAgICAgICAgIHZhciB0aGVIcmVmO1xuXG4gICAgICAgICAgICBpZiggJChlbCkucHJvcCgndGFnTmFtZScpID09PSAnQScgKSB7XG5cbiAgICAgICAgICAgICAgICB0aGVIcmVmID0gJChlbCkuYXR0cignaHJlZicpO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYoICQoZWwpLnBhcmVudCgpLnByb3AoJ3RhZ05hbWUnKSA9PT0gJ0EnICkge1xuXG4gICAgICAgICAgICAgICAgdGhlSHJlZiA9ICQoZWwpLnBhcmVudCgpLmF0dHIoJ2hyZWYnKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgekluZGV4ID0gMDtcblxuICAgICAgICAgICAgdmFyIHBhZ2VMaW5rID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vdGhlIGFjdHVhbCBzZWxlY3RcblxuICAgICAgICAgICAgJCgnc2VsZWN0I2ludGVybmFsTGlua3NEcm9wZG93bicpLnByb3AoJ3NlbGVjdGVkSW5kZXgnLCAwKTtcblxuICAgICAgICAgICAgLy9zZXQgdGhlIGNvcnJlY3QgaXRlbSB0byBcInNlbGVjdGVkXCJcbiAgICAgICAgICAgICQoJ3NlbGVjdCNpbnRlcm5hbExpbmtzRHJvcGRvd24gb3B0aW9uJykuZWFjaChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgaWYoICQodGhpcykuYXR0cigndmFsdWUnKSA9PT0gdGhlSHJlZiApIHtcblxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmF0dHIoJ3NlbGVjdGVkJywgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgekluZGV4ID0gJCh0aGlzKS5pbmRleCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VMaW5rID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgLy90aGUgcHJldHR5IGRyb3Bkb3duXG4gICAgICAgICAgICAkKCcubGlua19UYWIgLmJ0bi1ncm91cC5zZWxlY3QgLmRyb3Bkb3duLW1lbnUgbGknKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICQoJy5saW5rX1RhYiAuYnRuLWdyb3VwLnNlbGVjdCAuZHJvcGRvd24tbWVudSBsaTplcSgnK3pJbmRleCsnKScpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgJCgnLmxpbmtfVGFiIC5idG4tZ3JvdXAuc2VsZWN0OmVxKDApIC5maWx0ZXItb3B0aW9uJykudGV4dCggJCgnc2VsZWN0I2ludGVybmFsTGlua3NEcm9wZG93biBvcHRpb246c2VsZWN0ZWQnKS50ZXh0KCkgKTtcbiAgICAgICAgICAgICQoJy5saW5rX1RhYiAuYnRuLWdyb3VwLnNlbGVjdDplcSgxKSAuZmlsdGVyLW9wdGlvbicpLnRleHQoICQoJ3NlbGVjdCNwYWdlTGlua3NEcm9wZG93biBvcHRpb246c2VsZWN0ZWQnKS50ZXh0KCkgKTtcblxuICAgICAgICAgICAgaWYoIHBhZ2VMaW5rID09PSB0cnVlICkge1xuXG4gICAgICAgICAgICAgICAgJCgnaW5wdXQjaW50ZXJuYWxMaW5rc0N1c3RvbScpLnZhbCgnJyk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBpZiggJChlbCkucHJvcCgndGFnTmFtZScpID09PSAnQScgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoICQoZWwpLmF0dHIoJ2hyZWYnKVswXSAhPT0gJyMnICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnaW5wdXQjaW50ZXJuYWxMaW5rc0N1c3RvbScpLnZhbCggJChlbCkuYXR0cignaHJlZicpICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCdpbnB1dCNpbnRlcm5hbExpbmtzQ3VzdG9tJykudmFsKCAnJyApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoICQoZWwpLnBhcmVudCgpLnByb3AoJ3RhZ05hbWUnKSA9PT0gJ0EnICkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKCAkKGVsKS5wYXJlbnQoKS5hdHRyKCdocmVmJylbMF0gIT09ICcjJyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJ2lucHV0I2ludGVybmFsTGlua3NDdXN0b20nKS52YWwoICQoZWwpLnBhcmVudCgpLmF0dHIoJ2hyZWYnKSApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnaW5wdXQjaW50ZXJuYWxMaW5rc0N1c3RvbScpLnZhbCggJycgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vbGlzdCBhdmFpbGFibGUgYmxvY2tzIG9uIHRoaXMgcGFnZSwgcmVtb3ZlIG9sZCBvbmVzIGZpcnN0XG5cbiAgICAgICAgICAgICQoJ3NlbGVjdCNwYWdlTGlua3NEcm9wZG93biBvcHRpb246bm90KDpmaXJzdCknKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICQoJyNwYWdlTGlzdCB1bDp2aXNpYmxlIGlmcmFtZScpLmVhY2goZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICAgIGlmKCAkKHRoaXMpLmNvbnRlbnRzKCkuZmluZCggYkNvbmZpZy5wYWdlQ29udGFpbmVyICsgXCIgPiAqOmZpcnN0XCIgKS5hdHRyKCdpZCcpICE9PSB1bmRlZmluZWQgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld09wdGlvbjtcblxuICAgICAgICAgICAgICAgICAgICBpZiggJChlbCkuYXR0cignaHJlZicpID09PSAnIycrJCh0aGlzKS5jb250ZW50cygpLmZpbmQoIGJDb25maWcucGFnZUNvbnRhaW5lciArIFwiID4gKjpmaXJzdFwiICkuYXR0cignaWQnKSApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3T3B0aW9uID0gJzxvcHRpb24gc2VsZWN0ZWQgdmFsdWU9IycrJCh0aGlzKS5jb250ZW50cygpLmZpbmQoIGJDb25maWcucGFnZUNvbnRhaW5lciArIFwiID4gKjpmaXJzdFwiICkuYXR0cignaWQnKSsnPiMnKyQodGhpcykuY29udGVudHMoKS5maW5kKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKyBcIiA+ICo6Zmlyc3RcIiApLmF0dHIoJ2lkJykrJzwvb3B0aW9uPic7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3T3B0aW9uID0gJzxvcHRpb24gdmFsdWU9IycrJCh0aGlzKS5jb250ZW50cygpLmZpbmQoIGJDb25maWcucGFnZUNvbnRhaW5lciArIFwiID4gKjpmaXJzdFwiICkuYXR0cignaWQnKSsnPiMnKyQodGhpcykuY29udGVudHMoKS5maW5kKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKyBcIiA+ICo6Zmlyc3RcIiApLmF0dHIoJ2lkJykrJzwvb3B0aW9uPic7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICQoJ3NlbGVjdCNwYWdlTGlua3NEcm9wZG93bicpLmFwcGVuZCggbmV3T3B0aW9uICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvL2lmIHRoZXJlIGFyZW4ndCBhbnkgYmxvY2tzIHRvIGxpc3QsIGhpZGUgdGhlIGRyb3Bkb3duXG5cbiAgICAgICAgICAgIGlmKCAkKCdzZWxlY3QjcGFnZUxpbmtzRHJvcGRvd24gb3B0aW9uJykuc2l6ZSgpID09PSAxICkge1xuXG4gICAgICAgICAgICAgICAgJCgnc2VsZWN0I3BhZ2VMaW5rc0Ryb3Bkb3duJykubmV4dCgpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAkKCdzZWxlY3QjcGFnZUxpbmtzRHJvcGRvd24nKS5uZXh0KCkubmV4dCgpLmhpZGUoKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICQoJ3NlbGVjdCNwYWdlTGlua3NEcm9wZG93bicpLm5leHQoKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgJCgnc2VsZWN0I3BhZ2VMaW5rc0Ryb3Bkb3duJykubmV4dCgpLm5leHQoKS5zaG93KCk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG5cbiAgICAgICAgLypcbiAgICAgICAgICAgIHdoZW4gdGhlIGNsaWNrZWQgZWxlbWVudCBpcyBhbiBpbWFnZVxuICAgICAgICAqL1xuICAgICAgICBlZGl0SW1hZ2U6IGZ1bmN0aW9uKGVsKSB7XG5cbiAgICAgICAgICAgICQoJ2EjaW1nX0xpbmsnKS5wYXJlbnQoKS5zaG93KCk7XG5cbiAgICAgICAgICAgIC8vc2V0IHRoZSBjdXJyZW50IFNSQ1xuICAgICAgICAgICAgJCgnLmltYWdlRmlsZVRhYicpLmZpbmQoJ2lucHV0I2ltYWdlVVJMJykudmFsKCAkKGVsKS5hdHRyKCdzcmMnKSApO1xuXG4gICAgICAgICAgICAvL3Jlc2V0IHRoZSBmaWxlIHVwbG9hZFxuICAgICAgICAgICAgJCgnLmltYWdlRmlsZVRhYicpLmZpbmQoJ2EuZmlsZWlucHV0LWV4aXN0cycpLmNsaWNrKCk7XG5cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qXG4gICAgICAgICAgICB3aGVuIHRoZSBjbGlja2VkIGVsZW1lbnQgaXMgYSB2aWRlbyBlbGVtZW50XG4gICAgICAgICovXG4gICAgICAgIGVkaXRWaWRlbzogZnVuY3Rpb24oZWwpIHtcblxuICAgICAgICAgICAgdmFyIG1hdGNoUmVzdWx0cztcblxuICAgICAgICAgICAgJCgnYSN2aWRlb19MaW5rJykucGFyZW50KCkuc2hvdygpO1xuICAgICAgICAgICAgJCgnYSN2aWRlb19MaW5rJykuY2xpY2soKTtcblxuICAgICAgICAgICAgLy9pbmplY3QgY3VycmVudCB2aWRlbyBJRCxjaGVjayBpZiB3ZSdyZSBkZWFsaW5nIHdpdGggWW91dHViZSBvciBWaW1lb1xuXG4gICAgICAgICAgICBpZiggJChlbCkucHJldigpLmF0dHIoJ3NyYycpLmluZGV4T2YoXCJ2aW1lby5jb21cIikgPiAtMSApIHsvL3ZpbWVvXG5cbiAgICAgICAgICAgICAgICBtYXRjaFJlc3VsdHMgPSAkKGVsKS5wcmV2KCkuYXR0cignc3JjJykubWF0Y2goL3BsYXllclxcLnZpbWVvXFwuY29tXFwvdmlkZW9cXC8oWzAtOV0qKS8pO1xuXG4gICAgICAgICAgICAgICAgJCgnI3ZpZGVvX1RhYiBpbnB1dCN2aW1lb0lEJykudmFsKCBtYXRjaFJlc3VsdHNbbWF0Y2hSZXN1bHRzLmxlbmd0aC0xXSApO1xuICAgICAgICAgICAgICAgICQoJyN2aWRlb19UYWIgaW5wdXQjeW91dHViZUlEJykudmFsKCcnKTtcblxuICAgICAgICAgICAgfSBlbHNlIHsvL3lvdXR1YmVcblxuICAgICAgICAgICAgICAgIC8vdGVtcCA9ICQoZWwpLnByZXYoKS5hdHRyKCdzcmMnKS5zcGxpdCgnLycpO1xuICAgICAgICAgICAgICAgIHZhciByZWdFeHAgPSAvLiooPzp5b3V0dS5iZVxcL3x2XFwvfHVcXC9cXHdcXC98ZW1iZWRcXC98d2F0Y2hcXD92PSkoW14jXFwmXFw/XSopLiovO1xuICAgICAgICAgICAgICAgIG1hdGNoUmVzdWx0cyA9ICQoZWwpLnByZXYoKS5hdHRyKCdzcmMnKS5tYXRjaChyZWdFeHApO1xuXG4gICAgICAgICAgICAgICAgJCgnI3ZpZGVvX1RhYiBpbnB1dCN5b3V0dWJlSUQnKS52YWwoIG1hdGNoUmVzdWx0c1sxXSApO1xuICAgICAgICAgICAgICAgICQoJyN2aWRlb19UYWIgaW5wdXQjdmltZW9JRCcpLnZhbCgnJyk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG5cbiAgICAgICAgLypcbiAgICAgICAgICAgIHdoZW4gdGhlIGNsaWNrZWQgZWxlbWVudCBpcyBhbiBmYSBpY29uXG4gICAgICAgICovXG4gICAgICAgIGVkaXRJY29uOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgJCgnYSNpY29uX0xpbmsnKS5wYXJlbnQoKS5zaG93KCk7XG5cbiAgICAgICAgICAgIC8vZ2V0IGljb24gY2xhc3MgbmFtZSwgc3RhcnRpbmcgd2l0aCBmYS1cbiAgICAgICAgICAgIHZhciBnZXQgPSAkLmdyZXAodGhpcy5hY3RpdmVFbGVtZW50LmVsZW1lbnQuY2xhc3NOYW1lLnNwbGl0KFwiIFwiKSwgZnVuY3Rpb24odiwgaSl7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdi5pbmRleE9mKCdmYS0nKSA9PT0gMDtcblxuICAgICAgICAgICAgfSkuam9pbigpO1xuXG4gICAgICAgICAgICAkKCdzZWxlY3QjaWNvbnMgb3B0aW9uJykuZWFjaChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgaWYoICQodGhpcykudmFsKCkgPT09IGdldCApIHtcblxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmF0dHIoJ3NlbGVjdGVkJywgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCgnI2ljb25zJykudHJpZ2dlcignY2hvc2VuOnVwZGF0ZWQnKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qXG4gICAgICAgICAgICBkZWxldGUgc2VsZWN0ZWQgZWxlbWVudFxuICAgICAgICAqL1xuICAgICAgICBkZWxldGVFbGVtZW50OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIHRvRGVsO1xuXG4gICAgICAgICAgICAvL2RldGVybWluZSB3aGF0IHRvIGRlbGV0ZVxuICAgICAgICAgICAgaWYoICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5wcm9wKCd0YWdOYW1lJykgPT09ICdBJyApIHsvL2FuY29yXG5cbiAgICAgICAgICAgICAgICBpZiggJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLnBhcmVudCgpLnByb3AoJ3RhZ05hbWUnKSA9PT0nTEknICkgey8vY2xvbmUgdGhlIExJXG5cbiAgICAgICAgICAgICAgICAgICAgdG9EZWwgPSAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkucGFyZW50KCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIHRvRGVsID0gJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYoICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5wcm9wKCd0YWdOYW1lJykgPT09ICdJTUcnICkgey8vaW1hZ2VcblxuICAgICAgICAgICAgICAgIGlmKCAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkucGFyZW50KCkucHJvcCgndGFnTmFtZScpID09PSAnQScgKSB7Ly9jbG9uZSB0aGUgQVxuXG4gICAgICAgICAgICAgICAgICAgIHRvRGVsID0gJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLnBhcmVudCgpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICB0b0RlbCA9ICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHsvL2V2ZXJ5dGhpbmcgZWxzZVxuXG4gICAgICAgICAgICAgICAgdG9EZWwgPSAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCk7XG5cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB0b0RlbC5mYWRlT3V0KDUwMCwgZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICAgIHZhciByYW5kb21FbCA9ICQodGhpcykuY2xvc2VzdCgnYm9keScpLmZpbmQoJyo6Zmlyc3QnKTtcblxuICAgICAgICAgICAgICAgIHRvRGVsLnJlbW92ZSgpO1xuXG4gICAgICAgICAgICAgICAgLyogU0FOREJPWCAqL1xuXG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRJRCA9ICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5hdHRyKCdpZCcpO1xuXG4gICAgICAgICAgICAgICAgJCgnIycrc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5zYW5kYm94KS5jb250ZW50cygpLmZpbmQoJyMnK2VsZW1lbnRJRCkucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICAgICAvKiBFTkQgU0FOREJPWCAqL1xuXG4gICAgICAgICAgICAgICAgc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5wYXJlbnRCbG9jay5oZWlnaHRBZGp1c3RtZW50KCk7XG5cbiAgICAgICAgICAgICAgICAvL3dlJ3ZlIGdvdCBwZW5kaW5nIGNoYW5nZXNcbiAgICAgICAgICAgICAgICBzaXRlQnVpbGRlci5zaXRlLnNldFBlbmRpbmdDaGFuZ2VzKHRydWUpO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJCgnI2RlbGV0ZUVsZW1lbnQnKS5tb2RhbCgnaGlkZScpO1xuXG4gICAgICAgICAgICBzdHlsZWVkaXRvci5jbG9zZVN0eWxlRWRpdG9yKCk7XG5cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qXG4gICAgICAgICAgICBjbG9uZXMgdGhlIHNlbGVjdGVkIGVsZW1lbnRcbiAgICAgICAgKi9cbiAgICAgICAgY2xvbmVFbGVtZW50OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIHRoZUNsb25lLCB0aGVDbG9uZTIsIHRoZU9uZSwgY2xvbmVkLCBjbG9uZVBhcmVudCwgZWxlbWVudElEO1xuXG4gICAgICAgICAgICBpZiggJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLnBhcmVudCgpLmhhc0NsYXNzKCdwcm9wQ2xvbmUnKSApIHsvL2Nsb25lIHRoZSBwYXJlbnQgZWxlbWVudFxuXG4gICAgICAgICAgICAgICAgdGhlQ2xvbmUgPSAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkucGFyZW50KCkuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICB0aGVDbG9uZS5maW5kKCAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkucHJvcCgndGFnTmFtZScpICkuYXR0cignc3R5bGUnLCAnJyk7XG5cbiAgICAgICAgICAgICAgICB0aGVDbG9uZTIgPSAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkucGFyZW50KCkuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICB0aGVDbG9uZTIuZmluZCggJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLnByb3AoJ3RhZ05hbWUnKSApLmF0dHIoJ3N0eWxlJywgJycpO1xuXG4gICAgICAgICAgICAgICAgdGhlT25lID0gdGhlQ2xvbmUuZmluZCggJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLnByb3AoJ3RhZ05hbWUnKSApO1xuICAgICAgICAgICAgICAgIGNsb25lZCA9ICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5wYXJlbnQoKTtcblxuICAgICAgICAgICAgICAgIGNsb25lUGFyZW50ID0gJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLnBhcmVudCgpLnBhcmVudCgpO1xuXG4gICAgICAgICAgICB9IGVsc2Ugey8vY2xvbmUgdGhlIGVsZW1lbnQgaXRzZWxmXG5cbiAgICAgICAgICAgICAgICB0aGVDbG9uZSA9ICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5jbG9uZSgpO1xuXG4gICAgICAgICAgICAgICAgdGhlQ2xvbmUuYXR0cignc3R5bGUnLCAnJyk7XG5cbiAgICAgICAgICAgICAgICAvKmlmKCBzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LnNhbmRib3ggKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoZUNsb25lLmF0dHIoJ2lkJywgJycpLnVuaXF1ZUlkKCk7XG4gICAgICAgICAgICAgICAgfSovXG5cbiAgICAgICAgICAgICAgICB0aGVDbG9uZTIgPSAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICB0aGVDbG9uZTIuYXR0cignc3R5bGUnLCAnJyk7XG5cbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIGlmKCBzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LnNhbmRib3ggKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoZUNsb25lMi5hdHRyKCdpZCcsIHRoZUNsb25lLmF0dHIoJ2lkJykpO1xuICAgICAgICAgICAgICAgIH0qL1xuXG4gICAgICAgICAgICAgICAgdGhlT25lID0gdGhlQ2xvbmU7XG4gICAgICAgICAgICAgICAgY2xvbmVkID0gJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpO1xuXG4gICAgICAgICAgICAgICAgY2xvbmVQYXJlbnQgPSAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkucGFyZW50KCk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xvbmVkLmFmdGVyKCB0aGVDbG9uZSApO1xuXG4gICAgICAgICAgICAvKiBTQU5EQk9YICovXG5cbiAgICAgICAgICAgIGlmKCBzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LnNhbmRib3ggKSB7XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50SUQgPSAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkuYXR0cignaWQnKTtcbiAgICAgICAgICAgICAgICAkKCcjJytzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LnNhbmRib3gpLmNvbnRlbnRzKCkuZmluZCgnIycrZWxlbWVudElEKS5hZnRlciggdGhlQ2xvbmUyICk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogRU5EIFNBTkRCT1ggKi9cblxuICAgICAgICAgICAgLy9tYWtlIHN1cmUgdGhlIG5ldyBlbGVtZW50IGdldHMgdGhlIHByb3BlciBldmVudHMgc2V0IG9uIGl0XG4gICAgICAgICAgICB2YXIgbmV3RWxlbWVudCA9IG5ldyBjYW52YXNFbGVtZW50KHRoZU9uZS5nZXQoMCkpO1xuICAgICAgICAgICAgbmV3RWxlbWVudC5hY3RpdmF0ZSgpO1xuXG4gICAgICAgICAgICAvL3Bvc3NpYmxlIGhlaWdodCBhZGp1c3RtZW50c1xuICAgICAgICAgICAgc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5wYXJlbnRCbG9jay5oZWlnaHRBZGp1c3RtZW50KCk7XG5cbiAgICAgICAgICAgIC8vd2UndmUgZ290IHBlbmRpbmcgY2hhbmdlc1xuICAgICAgICAgICAgc2l0ZUJ1aWxkZXIuc2l0ZS5zZXRQZW5kaW5nQ2hhbmdlcyh0cnVlKTtcblxuICAgICAgICB9LFxuXG5cbiAgICAgICAgLypcbiAgICAgICAgICAgIHJlc2V0cyB0aGUgYWN0aXZlIGVsZW1lbnRcbiAgICAgICAgKi9cbiAgICAgICAgcmVzZXRFbGVtZW50OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgaWYoICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5jbG9zZXN0KCdib2R5Jykud2lkdGgoKSAhPT0gJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLndpZHRoKCkgKSB7XG5cbiAgICAgICAgICAgICAgICAkKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkuYXR0cignc3R5bGUnLCAnJykuY3NzKHsnb3V0bGluZSc6ICczcHggZGFzaGVkIHJlZCcsICdjdXJzb3InOiAncG9pbnRlcid9KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5hdHRyKCdzdHlsZScsICcnKS5jc3MoeydvdXRsaW5lJzogJzNweCBkYXNoZWQgcmVkJywgJ291dGxpbmUtb2Zmc2V0JzonLTNweCcsICdjdXJzb3InOiAncG9pbnRlcid9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBTQU5EQk9YICovXG5cbiAgICAgICAgICAgIGlmKCBzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LnNhbmRib3ggKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudElEID0gJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLmF0dHIoJ2lkJyk7XG4gICAgICAgICAgICAgICAgJCgnIycrc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5zYW5kYm94KS5jb250ZW50cygpLmZpbmQoJyMnK2VsZW1lbnRJRCkuYXR0cignc3R5bGUnLCAnJyk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogRU5EIFNBTkRCT1ggKi9cblxuICAgICAgICAgICAgJCgnI3N0eWxlRWRpdG9yIGZvcm0jc3R5bGluZ0Zvcm0nKS5oZWlnaHQoICQoJyNzdHlsZUVkaXRvciBmb3JtI3N0eWxpbmdGb3JtJykuaGVpZ2h0KCkrXCJweFwiICk7XG5cbiAgICAgICAgICAgICQoJyNzdHlsZUVkaXRvciBmb3JtI3N0eWxpbmdGb3JtIC5mb3JtLWdyb3VwOm5vdCgjc3R5bGVFbFRlbXBsYXRlKScpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgLy9yZXNldCBpY29uXG5cbiAgICAgICAgICAgIGlmKCBzdHlsZWVkaXRvci5fb2xkSWNvblskKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudCkuYXR0cignaWQnKV0gIT09IG51bGwgKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZ2V0ID0gJC5ncmVwKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQuZWxlbWVudC5jbGFzc05hbWUuc3BsaXQoXCIgXCIpLCBmdW5jdGlvbih2LCBpKXtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdi5pbmRleE9mKCdmYS0nKSA9PT0gMDtcblxuICAgICAgICAgICAgICAgIH0pLmpvaW4oKTtcblxuICAgICAgICAgICAgICAgICQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5yZW1vdmVDbGFzcyggZ2V0ICkuYWRkQ2xhc3MoIHN0eWxlZWRpdG9yLl9vbGRJY29uWyQoc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5lbGVtZW50KS5hdHRyKCdpZCcpXSApO1xuXG4gICAgICAgICAgICAgICAgJCgnc2VsZWN0I2ljb25zIG9wdGlvbicpLmVhY2goZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICAgICAgICBpZiggJCh0aGlzKS52YWwoKSA9PT0gc3R5bGVlZGl0b3IuX29sZEljb25bJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLmF0dHIoJ2lkJyldICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmF0dHIoJ3NlbGVjdGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjaWNvbnMnKS50cmlnZ2VyKCdjaG9zZW46dXBkYXRlZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7c3R5bGVlZGl0b3IuYnVpbGRlU3R5bGVFbGVtZW50cyggJChzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50LmVsZW1lbnQpLmF0dHIoJ2RhdGEtc2VsZWN0b3InKSApO30sIDU1MCk7XG5cbiAgICAgICAgICAgIHNpdGVCdWlsZGVyLnNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG5cbiAgICAgICAgfSxcblxuXG4gICAgICAgIHJlc2V0U2VsZWN0TGlua3NQYWdlczogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICQoJyNpbnRlcm5hbExpbmtzRHJvcGRvd24nKS5zZWxlY3QyKCd2YWwnLCAnIycpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzZXRTZWxlY3RMaW5rc0ludGVybmFsOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgJCgnI3BhZ2VMaW5rc0Ryb3Bkb3duJykuc2VsZWN0MigndmFsJywgJyMnKTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIHJlc2V0U2VsZWN0QWxsTGlua3M6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAkKCcjaW50ZXJuYWxMaW5rc0Ryb3Bkb3duJykuc2VsZWN0MigndmFsJywgJyMnKTtcbiAgICAgICAgICAgICQoJyNwYWdlTGlua3NEcm9wZG93bicpLnNlbGVjdDIoJ3ZhbCcsICcjJyk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdCgpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLypcbiAgICAgICAgICAgIGhpZGVzIGZpbGUgdXBsb2FkIGZvcm1zXG4gICAgICAgICovXG4gICAgICAgIGhpZGVGaWxlVXBsb2FkczogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICQoJ2Zvcm0jaW1hZ2VVcGxvYWRGb3JtJykuaGlkZSgpO1xuICAgICAgICAgICAgJCgnI2ltYWdlTW9kYWwgI3VwbG9hZFRhYkxJJykuaGlkZSgpO1xuXG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKlxuICAgICAgICAgICAgY2xvc2VzIHRoZSBzdHlsZSBlZGl0b3JcbiAgICAgICAgKi9cbiAgICAgICAgY2xvc2VTdHlsZUVkaXRvcjogZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgaWYoIE9iamVjdC5rZXlzKHN0eWxlZWRpdG9yLmFjdGl2ZUVsZW1lbnQpLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5yZW1vdmVPdXRsaW5lKCk7XG4gICAgICAgICAgICAgICAgc3R5bGVlZGl0b3IuYWN0aXZlRWxlbWVudC5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiggJCgnI3N0eWxlRWRpdG9yJykuY3NzKCdsZWZ0JykgPT09ICcwcHgnICkge1xuXG4gICAgICAgICAgICAgICAgc3R5bGVlZGl0b3IudG9nZ2xlU2lkZVBhbmVsKCdjbG9zZScpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qXG4gICAgICAgICAgICB0b2dnbGVzIHRoZSBzaWRlIHBhbmVsXG4gICAgICAgICovXG4gICAgICAgIHRvZ2dsZVNpZGVQYW5lbDogZnVuY3Rpb24odmFsKSB7XG5cbiAgICAgICAgICAgIGlmKCB2YWwgPT09ICdvcGVuJyAmJiAkKCcjc3R5bGVFZGl0b3InKS5jc3MoJ2xlZnQnKSA9PT0gJy0zMDBweCcgKSB7XG4gICAgICAgICAgICAgICAgJCgnI3N0eWxlRWRpdG9yJykuYW5pbWF0ZSh7J2xlZnQnOiAnMHB4J30sIDI1MCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHZhbCA9PT0gJ2Nsb3NlJyAmJiAkKCcjc3R5bGVFZGl0b3InKS5jc3MoJ2xlZnQnKSA9PT0gJzBweCcgKSB7XG4gICAgICAgICAgICAgICAgJCgnI3N0eWxlRWRpdG9yJykuYW5pbWF0ZSh7J2xlZnQnOiAnLTMwMHB4J30sIDI1MCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qXG4gICAgICAgICAgICBFdmVudCBoYW5kbGVyIGZvciB3aGVuIHRoaXMgbW9kZSBnZXRzIGRlYWN0aXZhdGVkXG4gICAgICAgICovXG4gICAgICAgIGRlQWN0aXZhdGVNb2RlOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgaWYoIE9iamVjdC5rZXlzKCBzdHlsZWVkaXRvci5hY3RpdmVFbGVtZW50ICkubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICAgICAgICBzdHlsZWVkaXRvci5jbG9zZVN0eWxlRWRpdG9yKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vZGVhY3RpdmF0ZSBhbGwgc3R5bGUgaXRlbXMgb24gdGhlIGNhbnZhc1xuICAgICAgICAgICAgZm9yKCB2YXIgaSA9MDsgaSA8IHN0eWxlZWRpdG9yLmFsbFN0eWxlSXRlbXNPbkNhbnZhcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICBzdHlsZWVkaXRvci5hbGxTdHlsZUl0ZW1zT25DYW52YXNbaV0uZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL0FkZCBvdmVybGF5IGFnYWluXG4gICAgICAgICAgICAvLyBmb3IodmFyIGkgPSAxOyBpIDw9ICQoXCJ1bCNwYWdlMSBsaVwiKS5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAvLyAgICAgdmFyIGlkID0gXCIjdWktaWQtXCIgKyBpO1xuICAgICAgICAgICAgLy8gICAgIGFsZXJ0KGlkKTtcbiAgICAgICAgICAgIC8vICAgICAvLyBvdmVybGF5ID0gJCgnPHNwYW4gY2xhc3M9XCJvdmVybGF5XCI+PHNwYW4gY2xhc3M9XCJmdWktZXllXCI+PC9zcGFuPjwvc3Bhbj4nKTtcbiAgICAgICAgICAgIC8vICAgICAvLyAkKGlkKS5jb250ZW50cygpLmZpbmQoJ2Eub3ZlcicpLmFwcGVuZCggb3ZlcmxheSApO1xuICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBzdHlsZWVkaXRvci5pbml0KCk7XG5cbiAgICBleHBvcnRzLnN0eWxlZWRpdG9yID0gc3R5bGVlZGl0b3I7XG5cbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcblxuLyogZ2xvYmFscyBzaXRlVXJsOmZhbHNlLCBiYXNlVXJsOmZhbHNlICovXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgICAgIFxuICAgIHZhciBhcHBVSSA9IHtcbiAgICAgICAgXG4gICAgICAgIGZpcnN0TWVudVdpZHRoOiAxOTAsXG4gICAgICAgIHNlY29uZE1lbnVXaWR0aDogMzAwLFxuICAgICAgICBsb2FkZXJBbmltYXRpb246IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkZXInKSxcbiAgICAgICAgc2Vjb25kTWVudVRyaWdnZXJDb250YWluZXJzOiAkKCcjbWVudSAjbWFpbiAjZWxlbWVudENhdHMsICNtZW51ICNtYWluICN0ZW1wbGF0ZXNVbCcpLFxuICAgICAgICBzaXRlVXJsOiBzaXRlVXJsLFxuICAgICAgICBiYXNlVXJsOiBiYXNlVXJsLFxuICAgICAgICBcbiAgICAgICAgc2V0dXA6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEZhZGUgdGhlIGxvYWRlciBhbmltYXRpb25cbiAgICAgICAgICAgICQoYXBwVUkubG9hZGVyQW5pbWF0aW9uKS5mYWRlT3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJCgnI21lbnUnKS5hbmltYXRlKHsnbGVmdCc6IDB9LCAxMDAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUYWJzXG4gICAgICAgICAgICAkKFwiLm5hdi10YWJzIGFcIikub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS50YWIoXCJzaG93XCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoXCJzZWxlY3Quc2VsZWN0XCIpLnNlbGVjdDIoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJCgnOnJhZGlvLCA6Y2hlY2tib3gnKS5yYWRpb2NoZWNrKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRvb2x0aXBzXG4gICAgICAgICAgICAkKFwiW2RhdGEtdG9nZ2xlPXRvb2x0aXBdXCIpLnRvb2x0aXAoXCJoaWRlXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUYWJsZTogVG9nZ2xlIGFsbCBjaGVja2JveGVzXG4gICAgICAgICAgICAkKCcudGFibGUgLnRvZ2dsZS1hbGwgOmNoZWNrYm94Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgdmFyIGNoID0gJHRoaXMucHJvcCgnY2hlY2tlZCcpO1xuICAgICAgICAgICAgICAgICR0aGlzLmNsb3Nlc3QoJy50YWJsZScpLmZpbmQoJ3Rib2R5IDpjaGVja2JveCcpLnJhZGlvY2hlY2soIWNoID8gJ3VuY2hlY2snIDogJ2NoZWNrJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQWRkIHN0eWxlIGNsYXNzIG5hbWUgdG8gYSB0b29sdGlwc1xuICAgICAgICAgICAgJChcIi50b29sdGlwXCIpLmFkZENsYXNzKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICgkKHRoaXMpLnByZXYoKS5hdHRyKFwiZGF0YS10b29sdGlwLXN0eWxlXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcInRvb2x0aXAtXCIgKyAkKHRoaXMpLnByZXYoKS5hdHRyKFwiZGF0YS10b29sdGlwLXN0eWxlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKFwiLmJ0bi1ncm91cFwiKS5vbignY2xpY2snLCBcImFcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLmVuZCgpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEZvY3VzIHN0YXRlIGZvciBhcHBlbmQvcHJlcGVuZCBpbnB1dHNcbiAgICAgICAgICAgICQoJy5pbnB1dC1ncm91cCcpLm9uKCdmb2N1cycsICcuZm9ybS1jb250cm9sJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgnLmlucHV0LWdyb3VwLCAuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdmb2N1cycpO1xuICAgICAgICAgICAgfSkub24oJ2JsdXInLCAnLmZvcm0tY29udHJvbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5pbnB1dC1ncm91cCwgLmZvcm0tZ3JvdXAnKS5yZW1vdmVDbGFzcygnZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUYWJsZTogVG9nZ2xlIGFsbCBjaGVja2JveGVzXG4gICAgICAgICAgICAkKCcudGFibGUgLnRvZ2dsZS1hbGwnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2ggPSAkKHRoaXMpLmZpbmQoJzpjaGVja2JveCcpLnByb3AoJ2NoZWNrZWQnKTtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJy50YWJsZScpLmZpbmQoJ3Rib2R5IDpjaGVja2JveCcpLmNoZWNrYm94KCFjaCA/ICdjaGVjaycgOiAndW5jaGVjaycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRhYmxlOiBBZGQgY2xhc3Mgcm93IHNlbGVjdGVkXG4gICAgICAgICAgICAkKCcudGFibGUgdGJvZHkgOmNoZWNrYm94Jykub24oJ2NoZWNrIHVuY2hlY2sgdG9nZ2xlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICAgICAgICAgICAgLCBjaGVjayA9ICR0aGlzLnByb3AoJ2NoZWNrZWQnKVxuICAgICAgICAgICAgICAgICwgdG9nZ2xlID0gZS50eXBlID09PSAndG9nZ2xlJ1xuICAgICAgICAgICAgICAgICwgY2hlY2tib3hlcyA9ICQoJy50YWJsZSB0Ym9keSA6Y2hlY2tib3gnKVxuICAgICAgICAgICAgICAgICwgY2hlY2tBbGwgPSBjaGVja2JveGVzLmxlbmd0aCA9PT0gY2hlY2tib3hlcy5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgJHRoaXMuY2xvc2VzdCgndHInKVtjaGVjayA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXSgnc2VsZWN0ZWQtcm93Jyk7XG4gICAgICAgICAgICAgICAgaWYgKHRvZ2dsZSkgJHRoaXMuY2xvc2VzdCgnLnRhYmxlJykuZmluZCgnLnRvZ2dsZS1hbGwgOmNoZWNrYm94JykuY2hlY2tib3goY2hlY2tBbGwgPyAnY2hlY2snIDogJ3VuY2hlY2snKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBTd2l0Y2hcbiAgICAgICAgICAgICQoXCJbZGF0YS10b2dnbGU9J3N3aXRjaCddXCIpLndyYXAoJzxkaXYgY2xhc3M9XCJzd2l0Y2hcIiAvPicpLnBhcmVudCgpLmJvb3RzdHJhcFN3aXRjaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBhcHBVSS5zZWNvbmRNZW51VHJpZ2dlckNvbnRhaW5lcnMub24oJ2NsaWNrJywgJ2E6bm90KC5idG4pJywgYXBwVUkuc2Vjb25kTWVudUFuaW1hdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIHNlY29uZE1lbnVBbmltYXRpb246IGZ1bmN0aW9uKCl7XG4gICAgICAgIFxuICAgICAgICAgICAgJCgnI21lbnUgI21haW4gYScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcbiAgICAgICAgICAgIC8vc2hvdyBvbmx5IHRoZSByaWdodCBlbGVtZW50c1xuICAgICAgICAgICAgJCgnI21lbnUgI3NlY29uZCB1bCBsaScpLmhpZGUoKTtcbiAgICAgICAgICAgICQoJyNtZW51ICNzZWNvbmQgdWwgbGkuJyskKHRoaXMpLmF0dHIoJ2lkJykpLnNob3coKTtcblxuICAgICAgICAgICAgaWYoICQodGhpcykuYXR0cignaWQnKSA9PT0gJ2FsbCcgKSB7XG4gICAgICAgICAgICAgICAgJCgnI21lbnUgI3NlY29uZCB1bCNlbGVtZW50cyBsaScpLnNob3coKTtcdFx0XG4gICAgICAgICAgICB9XG5cdFxuICAgICAgICAgICAgJCgnLm1lbnUgLnNlY29uZCcpLmNzcygnZGlzcGxheScsICdibG9jaycpLnN0b3AoKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICB3aWR0aDogYXBwVUkuc2Vjb25kTWVudVdpZHRoXG4gICAgICAgICAgICB9LCA1MDApO1x0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfTtcbiAgICBcbiAgICAvL2luaXRpYXRlIHRoZSBVSVxuICAgIGFwcFVJLnNldHVwKCk7XG5cblxuICAgIC8vKioqKiBFWFBPUlRTXG4gICAgbW9kdWxlLmV4cG9ydHMuYXBwVUkgPSBhcHBVSTtcbiAgICBcbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBcbiAgICBleHBvcnRzLmdldFJhbmRvbUFyYml0cmFyeSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbik7XG4gICAgfTtcblxuICAgIGV4cG9ydHMuZ2V0UGFyYW1ldGVyQnlOYW1lID0gZnVuY3Rpb24gKG5hbWUsIHVybCkge1xuXG4gICAgICAgIGlmICghdXJsKSB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgXCJcXFxcJCZcIik7XG4gICAgICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAoXCJbPyZdXCIgKyBuYW1lICsgXCIoPShbXiYjXSopfCZ8I3wkKVwiKSxcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XG4gICAgICAgIGlmICghcmVzdWx0cykgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmICghcmVzdWx0c1syXSkgcmV0dXJuICcnO1xuICAgICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csIFwiIFwiKSk7XG4gICAgICAgIFxuICAgIH07XG4gICAgXG59KCkpOyJdfQ==
