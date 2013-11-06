# angular-coverflow

An angular coverflow directive that uses `requestAnimationFrame()` and CSS3 transformations to achieve super-fluid animations.
The directive with all its content is embedded in angular's digest cycle so all values are watchable, etc.

## Examples
Use the Chrome touch overrides or a mobile device to swipe over the covers:
* [`images.html`](http://southdesign.github.io/angular-coverflow/examples/images.htm)
* [`endless.html`](http://southdesign.github.io/angular-coverflow/examples/endless.htm)

## Install

```shell
bower install angular-coverflow
```

## Usage
1. Include the `coverflow.js` script provided by this component into your app.
2. Include the `coverflow.css` style provided by this component.
3. Add `angular-coverflow` as a module dependency to your app.

Provide a directive handle and an image array in a controller:

```javascript
angular.module('angular-coverflow-example').controller('example-controller', function($scope){
  
  // Directive handle to watch values
  $scope.coverflow = {};
  
  // Coverflow image array
  $scope.images = [
    '../covers/1.jpg',
    '../covers/2.jpg',
    '../covers/3.jpg',
    '../covers/4.jpg',
    '../covers/5.jpg',
    '../covers/6.jpg',
    '../covers/7.jpg',
    '../covers/8.jpg',
    '../covers/9.jpg',
    '../covers/10.jpg',
    '../covers/11.jpg',
    '../covers/12.jpg',
    '../covers/13.jpg',
    '../covers/14.jpg',
    '../covers/15.jpg',
    '../covers/16.jpg',
    '../covers/17.jpg',
    '../covers/18.jpg',
    '../covers/19.jpg',
    '../covers/20.jpg'
  ];
  
});
```

Include the directive:
```html
<body ng-controller="example-controller">
  <coverflow coverflow="coverflow" images="images"></coverflow>
  
  <!-- Use {{coverflow.positionIndex}}, ... to display current selected cover -->
</body>
```

## License
MIT