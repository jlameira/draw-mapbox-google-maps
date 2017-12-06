var gmarkers = [];
var points = [];
var hullPoints = [];
var map = null;
var polyline;

var infowindow = new google.maps.InfoWindow({
  size: new google.maps.Size(150, 50)
});

function initializeMaps() {
  var myOptions = {
    zoom: 13,
    center: new google.maps.LatLng(-19.909381, -43.918318),
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    },
    navigationControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  google.maps.event.addListener(map, "click", function() {
    infowindow.close();
  });

  google.maps.event.addListenerOnce(map, "bounds_changed", function() {
    // Add 10 markers to the map at random locations
    var bounds = map.getBounds();
    var southWest = bounds.getSouthWest();
    var northEast = bounds.getNorthEast();
    var lngSpan = northEast.lng() - southWest.lng();
    var latSpan = northEast.lat() - southWest.lat();
    map.setCenter(map.getCenter());
    map.setZoom(map.getZoom() - 1);
    var numPoints = [
      [-19.90077, -43.936527],
      [-19.909381, -43.918318],
      [-19.923984, -43.909734],
      [-19.900157, -43.938346],
      [-19.926674, -43.949382]
    ];
    /* */

    for (var i = 0; i < numPoints.length; i++) {
      var point = new google.maps.LatLng(numPoints[i][0], numPoints[i][1]);
      points.push(point);
      var marker = createMarker(point, i);
      gmarkers.push(marker);
    }
    // for (var i = 0; i < points.length; i++) {
    //   document.getElementById("input_points").innerHTML +=
    //     i + ": " + points[i].toUrlValue() + "<br>";
    // }

    calculateConvexHull();
  });
  google.maps.event.addListener(map, "click", function(evt) {
    if (evt.latLng) {
      var latlng = evt.latLng;
      //            alert("latlng:"+latlng.toUrlValue());
      var marker = createMarker(latlng, gmarkers.length - 1);
      points.push(latlng);
      gmarkers.push(marker);
      calculateConvexHull();
    }
  });
}

function removeMarker(latlng) {
  for (var i = 0; i < gmarkers.length; i++) {
    if (
      google.maps.geometry.spherical.computeDistanceBetween(
        latlng,
        gmarkers[i].getPosition()
      ) < 0.1
    ) {
      gmarkers[i].setMap(null);
      gmarkers.splice(i, 1);
    }
  }
  calculateConvexHull();
}

function createMarker(latlng, marker_number) {
  var html = "marker " + marker_number;
  var marker = new google.maps.Marker({
    position: latlng,
    map: map,
    zIndex: Math.round(latlng.lat() * -100000) << 5
  });

  google.maps.event.addListener(marker, "click", function() {
    var contentString =
      html +
      "<br>" +
      marker.getPosition().toUrlValue() +
      "<br><a href='javascript:removeMarker(new google.maps.LatLng(" +
      marker.getPosition().toUrlValue() +
      "));'>Remove Marker</a>";
    infowindow.setContent(contentString);
    infowindow.open(map, marker);
  });
  return marker;
}

function calculateConvexHull() {
  if (polyline) polyline.setMap(null);
  // document.getElementById("hull_points").innerHTML = "";
  points = [];
  for (var i = 0; i < gmarkers.length; i++) {
    points.push(gmarkers[i].getPosition());
  }
  points.sort(sortPointY);
  points.sort(sortPointX);
  DrawHull();
}

function sortPointX(a, b) {
  return a.lng() - b.lng();
}
function sortPointY(a, b) {
  return a.lat() - b.lat();
}

function DrawHull() {
  hullPoints = [];
  chainHull_2D(points, points.length, hullPoints);
  polyline = new google.maps.Polygon({
    map: map,
    paths: hullPoints,
    fillColor: "#FF0000",
    strokeWidth: 2,
    fillOpacity: 0.5,
    strokeColor: "#0000FF",
    strokeOpacity: 0.5
  });
  // displayHullPts();
}

function displayHullPts() {
  document.getElementById("hull_points").innerHTML = "";
  for (var i = 0; i < hullPoints.length; i++) {
    document.getElementById("hull_points").innerHTML +=
      hullPoints[i].toUrlValue() + "<br>";
  }
}
