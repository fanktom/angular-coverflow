angular.module('angular-coverflow').service("covers", function(){
  
  // Service Reference
  var service = this;
  
  // State
  this.preloaded = false;
  this.images = [
    "covers/1.jpg",
    "covers/2.jpg",
    "covers/3.jpg",
    "covers/4.jpg",
    "covers/5.jpg",
    "covers/6.jpg",
    "covers/7.jpg",
    "covers/8.jpg",
    "covers/9.jpg",
    "covers/10.jpg",
    "covers/11.jpg",
    "covers/12.jpg",
    "covers/13.jpg",
    "covers/14.jpg",
    "covers/15.jpg",
    "covers/16.jpg",
    "covers/17.jpg",
    "covers/18.jpg",
    "covers/19.jpg",
    "covers/20.jpg"
  ];
  
  // Return an array of images
  this.all = function(){
    service.preload();
    return service.images;
  };
  
  // Preload all images
  this.preload = function(){
    if(service.preloaded){ return; }
    
    var totalImages = this.images.length;
    for(var i = 0; i < totalImages; i++){
      var cachedImage = new Image();
      cachedImage.src = service.images[i];
    }
    
    service.preloaded = true;
  };
  
});