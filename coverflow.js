'use strict';

angular.module('angular-coverflow', []);

angular.module('angular-coverflow').directive('coverflow', function(){
	return {
		restrict: 'E',
		replace: true,
		template: '<div class="coverflow-container"></div>',
		scope: { coverflow: "=", images: "=" },
		link: function(scope, element, attributes) {

			// Initialize
			scope.coverflow = new Coverflow({
				width:   568,
				height:  320,
				element: element,
				scope:   scope,
				images:  scope.images
			}).init();

			// Setup touch listeners
			element.bind('touchstart',  scope.coverflow.touchStart.bind(scope.coverflow));
			element.bind('touchmove',   scope.coverflow.touchMove.bind(scope.coverflow));
			element.bind('touchend',    scope.coverflow.touchEnd.bind(scope.coverflow));

			// Setup mouse listeners
			element.bind('mousedown',  scope.coverflow.mouseDown.bind(scope.coverflow));
			element.bind('mousemove',  scope.coverflow.mouseMove.bind(scope.coverflow));
			element.bind('mouseup',    scope.coverflow.mouseUp.bind(scope.coverflow));
		}
	};
});


// Request Animation Frame Shim
window.requestAnimFrame = (function(){
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame  ||
	window.mozRequestAnimationFrame     ||
	function(callback){
		window.setTimeout(callback, 1000 / 60);
	};
})();

// Cover Object
var Cover = function(params){
	this.coverId      = params.id;
	this.positionId   = params.id;
	this.flow         = params.flow;
	this.image        = params.image;
	this.size         = params.size;
	this.frame        = this.size - this.size/12;
	this.x            = 0;
	this.y            = this.flow.height/2 - this.size/2;
	this.rotation     = 0;
	this.scale        = 1;
	this.element      = null;
	this.imageElement = null;
	this.overflow     = 0;
	this.lastPositionIndex = this.flow.positionIndex;
};

Cover.prototype.init = function(){
	this.flow.element.append(this.template());
	this.element = this.flow.element.find(".coverflow-cover-id-" + this.coverId);
	this.updateCover(this.image);
	return this;
};

Cover.prototype.template = function(){
	return '<div class="coverflow-cover coverflow-cover-id-' + this.coverId + '"></div>';
};

Cover.prototype.center = function(){
	return this.x + (this.size/2);
};

Cover.prototype.updateCover = function(image){
	this.image = image;
	this.element[0].style.backgroundImage = "url('" + this.image + "')";
};

Cover.prototype.applyNextStyle = function(){
	this.element[0].style["-webkit-transform"] = "translate3d(" + this.x + "px, " + this.y + "px, 0px) rotateY(" + this.rotation + "deg) scale3d(" + this.scale + ", " + this.scale + ", 1)";
	this.element[0].style["transform"] = this.element[0].style["-webkit-transform"];
};

Cover.prototype.calculateNextStyle = function(){
	this.x        = this.nextCoverX();
	this.rotation = this.nextRotation();
	this.scale    = this.nextScale();
};

Cover.prototype.animateFrame = function(){
	this.calculateNextStyle();
	this.applyNextStyle();
};

Cover.prototype.overflowAt = function(leftOrRight){
	var overflow        = this.overflow + leftOrRight,
			fromPositionId  = this.positionId,
			positionId      = this.coverId - (this.flow.totalCovers * overflow);

	// Images Bounds
	if(this.flow.images){
		if(positionId < 0) return;
		if(positionId > this.flow.totalImages-1) return;
	}

	// Commit
	this.overflow   = overflow;
	this.positionId = positionId;
	if(!this.flow.images) return;
	this.updateCover(this.flow.images[this.positionId]);
};

Cover.prototype.nextCoverX = function(){
	var rightBound  = this.flow.visibleCovers * this.frame,
			positionX   = this.flow.position + (this.positionId * this.frame);

	// Overflows - take outermost
	if(positionX > rightBound){  this.overflowAt(1);  } // Right
	if(positionX < -this.frame){ this.overflowAt(-1); } // Left

	return this.flow.position + (this.positionId * this.frame);
};

Cover.prototype.nextRotation = function(i, cover){
	var delta   = this.flow.center - this.center(),
			sign    = this.center() < this.flow.center ? 1 : -1,
			offset  = Math.abs(delta / this.flow.center);

	offset = 4 * offset*offset;
	if(offset > 1) offset = 1;

	return 0 + (sign * offset) * this.flow.maxRotation;
};

Cover.prototype.nextScale = function(i, cover){  
	return (1 - Math.abs(this.rotation / this.flow.maxRotation) + 5) / 6;
};




// Coverflow Object
var Coverflow = function(params){
	this.width              = params.width;
	this.height             = params.height;
	this.images             = params.images;
	this.element            = params.element;
	this.center             = this.width/2;
	this.scope              = params.scope;
	this.totalCovers        = 4;
	this.visibleCovers      = 3;
	this.centerIndex        = Math.ceil(this.visibleCovers/2);
	this.covers             = [];
	this.cache              = [];
	this.totalImages        = 0;
	this.touch              = {};
	this.velocity           = 0.0;
	this.easing             = 1.05;
	this.position           = 0.0;
	this.maxRotation        = 60;
	this.positionLimitLeft  = +Infinity;
	this.positionLimitRight = -Infinity;
	this.lastPositionIndex  = 0;
	this.positionIndex      = 0;
};

// Create covers
Coverflow.prototype.init = function(){

	// Create
	for(var i = 0; i < this.totalCovers; i++){
		this.covers[i] = new Cover({ id: i, image: "../covers/cover.png", size: 200, flow: this }).init();
	}

	// Images
	if(this.images){
		this.totalImages        = this.images.length;
		this.positionLimitLeft  = (this.centerIndex-1) * this.covers[0].frame;
		this.positionLimitRight = -((this.totalImages-1) - (this.centerIndex-1)) * this.covers[0].frame;

		for(var i = 0; i < this.totalCovers; i++){
			this.covers[i].updateCover(this.images[i]);
		}

		// Preload
		var totalImages = this.images.length;
		for(var i = 0; i < totalImages; i++){
			var cachedImage = new Image();
			cachedImage.src = this.images[i];
		}
	}

	// Animate
	this.animateFrame();

	// Flag first cycle
	this.justInitialized = true;

	return this;
};

// Animate Frame
Coverflow.prototype.animateFrame = function(){
	var self = this;

	// Requires JS 1.8 - otherwise $.proxy - would be called with this = window instead
	requestAnimFrame(function(){
		self.scope.$apply(self.animateFrame.bind(self));
	});

	// Velocity, Position & Index
	this.velocity = this.nextVelocity();
	if (this.velocity === 0 && !self.justInitialized) {
		// skip animations to save power on idle
		return;
	}

	this.position = this.nextPosition();

	this.positionIndex = this.currentPositionIndex();

	// Animate Cover Frame
	for(var i = 0; i < this.totalCovers; i++){
		this.covers[i].animateFrame();
	}
	self.justInitialized = false;
};

// Easing
Coverflow.prototype.nextVelocity = function(){
	if(this.velocity <= 1.0 && this.velocity >= -1.0){ return 0.0; }
	return this.velocity / this.easing;
};

// Easing
Coverflow.prototype.nextPosition = function(){
	var position = this.position + this.velocity;
	if(position >= this.positionLimitLeft)  { this.velocity = 0; return this.positionLimitLeft; }
	if(position <= this.positionLimitRight) { this.velocity = 0; return this.positionLimitRight; }
	return position;
};

// Next Position Index
Coverflow.prototype.currentPositionIndex = function(){
	var index = Math.floor(-this.position / this.covers[0].frame) + this.centerIndex;
	if(index != this.lastPositionIndex){
		this.positionIndex     = index;
		this.lastPositionIndex = index;
	}
	return index;
};

Coverflow.prototype.coverForPositionIndex = function(index){
	for(var i = 0; i < this.totalCovers; i++){
		if(this.covers[i].positionId == index-1) return this.covers[i];
	}
};

// Touch Control
Coverflow.prototype.touchStart = function(event){
	event.preventDefault();
	this.velocity = 0;
	this.touch.start = event.originalEvent.changedTouches[0].pageX;
};

Coverflow.prototype.touchMove = function(event){
	event.preventDefault();
	var now   = event.originalEvent.changedTouches[0].pageX,
			delta = this.touch.start - now;
	this.position -= delta;
	this.velocity -= delta/4;
	this.touch.start = now;
};

Coverflow.prototype.touchEnd = function(event){
	event.preventDefault();
};

// Mouse Control
Coverflow.prototype.mouseDown = function(event){
	event.preventDefault();
	this.velocity = 0;
	this.touch.start = event.pageX;
	this.mouseIsDown = true;
};

Coverflow.prototype.mouseMove = function(event){
	event.preventDefault();
	if (this.mouseIsDown){
		var now   = event.originalEvent.pageX,
			delta = this.touch.start - now;
		this.position -= delta;
		this.velocity -= delta/4;
		this.touch.start = now;
	}
};

Coverflow.prototype.mouseUp = function(event){
	event.preventDefault();
	this.mouseIsDown = false;
};
