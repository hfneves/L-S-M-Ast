function MapManager(container, astralMap) {

	var ui = {};
	
	this.astralMap = astralMap;
	
	this.ui = ui;

require([
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/Search"
], function(Map, MapView, Search
) {

  ui.map = new Map({
    basemap: "topo-vector"
  });
    
	
  ui.view = new MapView({
    container: container,  
    map: ui.map,
    center: [astralMap.longitude, astralMap.latitude],
    zoom: 12
  });

  // Search widget
  var search = new Search({
    view: ui.view
  });

  ui.view.ui.add(search, "top-right"); // Add to the view
  
  
      //*** Add div element to show coordates ***//
      var coordsWidget = document.createElement("div");
      coordsWidget.id = "coordsWidget";
      coordsWidget.className = "esri-widget esri-component";
      coordsWidget.style.padding = "7px 15px 5px";
      ui.view.ui.add(coordsWidget, "bottom-right");

      //*** Update lat, lon, zoom and scale ***//
      function showCoordinates(pt) {
        var coords = "Lat/Lon " + pt.latitude.toFixed(7) + " " + pt.longitude.toFixed(7) + 
            " | Scale 1:" + Math.round(ui.view.scale * 1) / 1 +
            " | Zoom " + ui.view.zoom;
        coordsWidget.innerHTML = coords;
      }
      
      //*** Add event and show center coordinates after the view is finished moving e.g. zoom, pan ***//
      ui.view.watch(["stationary"], function() {
        showCoordinates(ui.view.center);
      });

      //*** Add event to show mouse coordinates on click and move ***//
      ui.view.on(["pointer-down","pointer-move"], function(evt) {
        showCoordinates(ui.view.toMap({ x: evt.x, y: evt.y }));
      });
});

	renderPoint = function() {
		
		require([
		  "esri/Graphic",
		  "esri/geometry/Point",
		  "esri/symbols/SimpleMarkerSymbol"],
			function(Graphic, Point, SimpleMarkerSymbol) {
			// Create a point
			  var point = new Point({
				 latitude: astralMap.latitude,
				 longitude: astralMap.longitude
			  });

			  // Create a symbol for drawing the point
			  var markerSymbol = new SimpleMarkerSymbol({
				color: [226, 119, 40],
				outline: { 
				  color: [255, 255, 254],
				  width: 1
				}
			  });
			  
			  // Create attributes
			  var attributes = {
				Name: "I am a point",  // The name of the pipeline
				Park: "Griffith Park",  // The owner of the pipeline
				City: "Los Angeles"  // The length of the pipeline
			  };
			  
			  // Create popup template
			  var popupTemplate = {
				title: "",
				content: "Meu ponto é: " + astralMap.latitude + " Latitude e " + astralMap.longitude + " Longitude",
			  };

			  // Create a graphic and add the geometry and symbol to it
			  var pointGraphic = new Graphic({
				geometry: point,
				symbol: markerSymbol,
				attributes: attributes,
				popupTemplate: popupTemplate
			  });
				
			  ui.view.graphics.add(pointGraphic);
		});
	}
	
	renderFeature = function(astralFeature) {
		
		require([
		  "esri/Graphic",
		  "esri/geometry/Polyline",
		  "esri/symbols/SimpleLineSymbol"],
			function(Graphic, Polyline, SimpleLineSymbol) {
			  var popupTemplate = {
				title: astralFeature.attrs.Name,
				content: "Meu angulo é " + astralFeature.angle + " partindo do norte",
				actions: []
			  };
			  
			  // Create a line geometry
			  var polyline = new Polyline({
				paths: [
				  [astralMap.longitude-astralFeature.getWidth(), astralMap.latitude-astralFeature.getHeight()],
				  [astralMap.longitude, astralMap.latitude],
				  [astralMap.longitude+astralFeature.getWidth(), astralMap.latitude+astralFeature.getHeight()]
				]
			  });
			  
			  // Create a symbol for drawing the line
			  var lineSymbol = new SimpleLineSymbol({
				color: astralFeature.color,
				width: 2
			  });

			  // Create a line graphic
			  var polylineGraphic = new Graphic({
				geometry: polyline,
				symbol: lineSymbol,
				popupTemplate: popupTemplate
			  });

			  // Add the graphic to the view
			  ui.view.graphics.add(polylineGraphic);
		});
	}
}

MapManager.prototype.reload = function()
{
	this.ui.view.center = [this.astralMap.longitude, this.astralMap.latitude];
	this.ui.view.zoom = 12;
	
	this.ui.view.graphics.removeAll();
	
	for(var i=0; i<this.astralMap.features.length; i++) {
		if(this.astralMap.features[i].enabled) { renderFeature(this.astralMap.features[i]); }
	}
	renderPoint();
}