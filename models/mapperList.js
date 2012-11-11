var mapperViewModel;

function Mapper (data, parent) {
  var self = this;
  self.mapperName = data.name;
  self.contribution_ids = data.contribution_ids;
  self.numContributions = data.count || 0;
  self.lastUpdated = new Date();
  self.contributions = ko.observableArray();
  // self.folder = data.keyword;
  self.select = function () {
    location.hash = '/' + self.mapperName;
    $.getJSON('http://jazzycat-emit-meow-api.nko3.jit.su/contribution/' +
      self.mapperName,
      function (data, status) {
      if(status === 'success') {
        console.log('Contributions found: ', data.length);
        data.forEach(function (contrib) {
          self.contributions.push(new Contribution(contrib, self));
        });
        console.log('Viewing ' + self.contributions().length + ' contributions');

        // Load in map
        loadMapperMap();
      }
    });
    parent.selectedMapper(self);
  };
  self.deselect = function () {
    location.hash = '/';
    self.contributions([]);
    parent.selectedMapper(null);
  };
}

function MapperViewModel () {
  var self = this;
  $.getJSON('http://jazzycat-emit-meow-api.nko3.jit.su/keyword',
    function (data, status) {
    if(status === 'success') {
      console.log('Mappers found: ', data.length);
      data.forEach(function (mapper) {
        self.mappers.push(new Mapper(mapper, self));
      });
    }
  });
  // // DEV FOR ITEMS
  // setTimeout(function () {
    // var data = [{'name': 'you', 'count': 20}, {'name': 'are', 'count': 10}, {'name': 'on', 'count': 3}, {'name': 'dev', 'count': 19}];
    // console.log(data.length);
    // data.forEach(function (mapper) {
      // self.mappers.push(new Mapper(mapper, self));
    // });
  // }, 100);

  self.mappers = ko.observableArray();

  self.selectedMapper = ko.observable();
  self.createMapper = function () {
    // TODO: Gather data for creation of new mapper
    self.mappers.push(new Mapper({}, self));
  };
  self.user = ko.observable();
}

window.mapperViewModel = new MapperViewModel();

$(function() {
  ko.applyBindings(mapperViewModel);
});


function loadMapperMap() {
  var mapper = mapperViewModel.selectedMapper(),
      contributions = mapper.contributions();
  console.log(contributions);

  // Create list of cities
  var SF = {'lat': 37.7750, 'lng': -122.4183},
      SAN_JOSE = {'lat': 37.3041, 'lng': -121.8727},
      NYC = {'lat': 40.7142, 'lng': -74.0064},
      LONDON = {'lat': 51.5171, 'lng': -0.1062},
      MOSCOW = {'lat': 55.7517, 'lng': 37.6178},
      ZANZIBAR = {'lat': -6.1333, 'lng': 39.3167},
      SHANGHAI = {'lat': 31.2000, 'lng': 121.5000};

  // Populate the list of locations with our cities (stub data)
  var locations = [
    SF,SF,SF,SF,SF,SF,SF,SF,SF,SF,SF,SF,SF,SF,
    SAN_JOSE,SAN_JOSE,SAN_JOSE,SAN_JOSE,SAN_JOSE,SAN_JOSE,SAN_JOSE,SAN_JOSE,
    NYC,NYC,NYC,NYC,
    LONDON,
    MOSCOW,MOSCOW,MOSCOW,MOSCOW,MOSCOW,MOSCOW,
    ZANZIBAR,ZANZIBAR,ZANZIBAR,ZANZIBAR,ZANZIBAR,ZANZIBAR,ZANZIBAR,
    SHANGHAI
  ];

  // Generate our map
  var map = new GMaps({
    div: '#map',
    lat: SF.lat,
    lng: SF.lng
  });

  // DEV: Break all pass-by-objects to avoid GMaps deletion of cities
  locations = JSON.parse(JSON.stringify(locations));

  // Render locations to markers
  var markers = locations.map(function (location) {
    var marker = map.createMarker(location);
    return marker;
  });

  // Add the markers to the map manually (a small hack for MarkerClusterer)
  map.markers.push.apply(map.markers, markers);

  // Create a marker clusterer on the locations
  var mcOptions = {gridSize: 50, maxZoom: 15},
      mc = new MarkerClusterer(map.map, markers, mcOptions);

  // Fit the zoom to the markers on the map
  map.fitZoom();

}