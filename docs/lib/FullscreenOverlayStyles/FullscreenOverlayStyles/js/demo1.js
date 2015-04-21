(function() {
	var triggerBttn = document.getElementById( 'trigger-overlay' ),
		triggerBtnPhysic = document.getElementById( 'trigger-overlay_physic'),
		triggerBtnPipe = document.getElementById( 'trigger-overlay_pipe'),
		triggerBtnSound = document.getElementById( 'trigger-overlay_sound'),
		overlay = document.querySelector( 'div.overlay2' ),
		closeBttn = overlay.querySelector( 'button.overlay-close' );
		transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		},
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		support = { transitions : Modernizr.csstransitions };

	function toggleOverlay() {
		if( classie.has( overlay, 'open' ) ) {
			classie.remove( overlay, 'open' );
			classie.add( overlay, 'close' );
			var onEndTransitionFn = function( ev ) {
				if( support.transitions ) {
					if( ev.propertyName !== 'visibility' ) return;
					this.removeEventListener( transEndEventName, onEndTransitionFn );
				}
				classie.remove( overlay, 'close' );
			};
			if( support.transitions ) {
				overlay.addEventListener( transEndEventName, onEndTransitionFn );
			}
			else {
				onEndTransitionFn();
			}
		}
		else if( !classie.has( overlay, 'close' ) ) {
			classie.add( overlay, 'open' );
		}
	}
	triggerBtnSound.addEventListener( 'click', toggleOverlay );
	triggerBtnPhysic.addEventListener( 'click', toggleOverlay );
	triggerBtnPipe.addEventListener( 'click', toggleOverlay );
	triggerBttn.addEventListener( 'click', toggleOverlay );
	closeBttn.addEventListener( 'click', toggleOverlay );
})();