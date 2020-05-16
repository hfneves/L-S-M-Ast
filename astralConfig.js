function DrawMaps(container, astralMap) {
	
	var ui = {};
	
	this.astralMap = astralMap;
	
	this.ui = ui;
  this.ui.ready = false;
  this.ui.flagPickpoint = false;
	
	
    require([
	  // ArcGIS
      "esri/Map",
      "esri/views/MapView",
      "esri/views/SceneView",
	  // Widgets
      "esri/widgets/Home",
      "esri/widgets/Search",
      "esri/widgets/BasemapGallery",
      "esri/core/watchUtils",
      // Calcite Maps
      "calcite-maps/calcitemaps-v0.8",

      // Calcite Maps ArcGIS Support
      "calcite-maps/calcitemaps-arcgis-support-v0.8",

      // Bootstrap
      "bootstrap/Collapse",
      "bootstrap/Dropdown",
      "bootstrap/Tab",
      // Can use @dojo shim for Array.from for IE11
      "@dojo/framework/shim/array"
    ], function(Map, MapView, SceneView, Home, Search, Basemaps, watchUtils, CalciteMaps, CalciteMapsArcGIS) {

      /******************************************************************
       *
       * App settings
       *
       ******************************************************************/

      app = {
        center: [-10, -10],
        scale: 50000000,
        basemap: "streets-navigation-vector",
        //basemap: "topo-vector",
        viewPadding: {
          top: 50,
          bottom: 0
        },
        uiComponents: ["home", "zoom", "compass", "attribution"],
        mapView: null,
        sceneView: null,
        containerMap: "mapViewDiv",
        containerScene: "sceneViewDiv",
        activeView: null,
        searchWidget: null
      };

      /******************************************************************
       *
       * Create the map and scene view and ui components
       *
       ******************************************************************/
   
	   
      // Map
      ui.map = new Map({
        basemap: "streets-navigation-vector"
        //basemap: "topo-vector"
      });

      // 2D view
      ui.mapView = new MapView({
        container: container,
        map: ui.map,
        center: [astralMap.longitude, astralMap.latitude],
		    zoom: 12,
        //scale: app.scale,
        padding: app.viewPadding,
        ui: {
          components: ["home", "zoom", "compass", "attribution"]
        }
      });

	  // Popup and panel sync
      ui.mapView.when(function(){
        CalciteMapArcGISSupport.setPopupPanelSync(ui.mapView);
      });
	  
      CalciteMapsArcGIS.setPopupPanelSync(ui.mapView);

      // 3D view
      app.sceneView = new SceneView({
        container: app.containerScene,
        map: ui.map,
        center: app.center,
		zoom: 12,
        //scale: app.scale,
        padding: app.viewPadding,
        ui: {
          components: app.uiComponents
        }
      });

      CalciteMapsArcGIS.setPopupPanelSync(app.sceneView);

      // Set the active view to mapView ... 1st 
      setActiveView(ui.mapView);

	  
	  // Map widgets
      var home = new Home({
        view: ui.mapView
      });
      ui.mapView.ui.add(home, "top-left");
	  
      // Create the search widget and add it to the navbar instead of view
      app.searchWidget = new Search({
        view: ui.mapView
      }, "searchWidgetDiv");

      CalciteMapsArcGIS.setSearchExpandEvents(app.searchWidget);

      // Create basemap widget
      app.basemapWidget = new Basemaps({
        view: ui.mapView,
        container: "basemapPanelDiv"
      });
		
		// Create Coordinates ... 1st 
		SetCoordinates(ui.mapView);
    SynchCoordinates(ui.mapView);
    PickCoordinates(ui.mapView);
    
	  
      /******************************************************************
       *
       * Synchronize the view, search and popup
       *
       ******************************************************************/

      // Views
      function setActiveView(view) {
        app.activeView = view;
      }

      function syncViews(fromView, toView) {
        const viewPt = fromView.viewpoint.clone();
		//fromView.ui.empty("bottom-right");
		fromView.ui.remove("coordsWidget","bottom-right");
        fromView.container = null;
        if (fromView.type === "3d") {
          toView.container = app.containerMap;
        } else {
          toView.container = app.containerScene;
        }
        toView.padding = app.viewPadding;
        toView.viewpoint = viewPt;
		SetCoordinates(toView);
		SynchCoordinates(toView);
      }

      // Search Widget
      function syncSearch(view) {
        watchUtils.whenTrueOnce(view, "ready", function() {
          app.searchWidget.view = view;
          if (app.searchWidget.selectedResult) {
            app.searchWidget.search(app.searchWidget.selectedResult.name)
          }
        });
      }
	
		// Function for Coordinates bottom
		function SetCoordinates(view) {
			var coordsWidget = null;
			//*** Add div element to show coordnates ***//
			if (view.type === "3d") {
				coordsWidget = document.createElement(app.containerScene);
				coordsWidget.id = "coordsWidget";
				coordsWidget.className = "esri-widget esri-component";
				coordsWidget.style.padding = "7px 15px 5px";
				view.ui.add(coordsWidget, "bottom-right");	
			} else {
				coordsWidget = document.createElement(app.containerMap);
				coordsWidget.id = "coordsWidget";
				coordsWidget.className = "esri-widget esri-component";
				coordsWidget.style.padding = "7px 15px 5px";
				view.ui.add(coordsWidget, "bottom-right");	
			}
		}	
		//*** Update lat, lon, zoom and scale ***//
		function showCoordinates(pt, view) {
			var coords = "Lat.: " + pt.latitude.toFixed(7) + " / Long.: " + pt.longitude.toFixed(7) + 
				" | Scale 1:" + Math.round(view.scale * 1) / 1 +
				" | Zoom " +view.zoom;
			coordsWidget.innerHTML = coords;
		}
			
		function SynchCoordinates(view) {
			//*** Add event and show center coordinates after the view is finished moving e.g. zoom, pan ***//
			view.watch(["stationary"], function() {
				showCoordinates(view.center, view);
			});
			//*** Add event to show mouse coordinates on click and move ***//
			view.on(["pointer-down","pointer-move"], function(evt) {
				showCoordinates(view.toMap({ x: evt.x, y: evt.y }),view);
      });
		}
    
    //
    function PickCoordinates(view) {
      view.on("click", function(event) {
        if (ui.flagPickpoint){
          // Get the coordinates of the click on the view
          const Picklat = event.mapPoint.latitude.toFixed(7);
          const Picklon = event.mapPoint.longitude.toFixed(7);
          //document.getElementById("latitude").value = Picklat;
          //view.popup.open({
          // Set the popup's title to the coordinates of the location
          //title: "Reverse geocode: [" + lon + ", " + lat + "]",
          //location: event.mapPoint // Set the location of the popup to the clicked location
          ui.flagPickpoint = false;

          ui.pickpointCallback(Picklat, Picklon);
        }
      });
    }

	
      // Tab - toggle between map and scene view
      const tabs = Array.from(document.querySelectorAll(
        ".calcite-navbar li a[data-toggle='tab']"));
      tabs.forEach(function(tab) {
        tab.addEventListener("click", function(event) {
          if (event.target.text.indexOf("Map") > -1) {
            syncViews(app.sceneView, ui.mapView);
            setActiveView(ui.mapView);
          } else {
            syncViews(ui.mapView, app.sceneView);
            setActiveView(app.sceneView);
          }
          syncSearch(app.activeView);
        });
      });

      /******************************************************************
       *
       * Apply Calcite Maps CSS classes to change application on the fly
       *
       * For more information about the CSS styles or Sass build visit:
       * http://github.com/esri/calcite-maps
       *
       ******************************************************************/

      const cssSelectorUi = [document.querySelector(".calcite-navbar"),
        document.querySelector(".calcite-panels")
      ];
      const cssSelectorMap = document.querySelector(".calcite-map");

      // Theme - light (default) or dark theme
      const settingsTheme = document.getElementById("settingsTheme");
      const settingsColor = document.getElementById("settingsColor");
      settingsTheme.addEventListener("change", function(event) {
        const textColor = event.target.options[event.target.selectedIndex]
          .dataset.textcolor;
        const bgColor = event.target.options[event.target.selectedIndex]
          .dataset.bgcolor;

        cssSelectorUi.forEach(function(element) {
          element.classList.remove(
            "calcite-text-dark", "calcite-text-light",
            "calcite-bg-dark", "calcite-bg-light",
            "calcite-bg-custom"
          );
          element.classList.add(textColor, bgColor);
          element.classList.remove(
            "calcite-bgcolor-dark-blue",
            "calcite-bgcolor-blue-75",
            "calcite-bgcolor-dark-green",
            "calcite-bgcolor-dark-brown",
            "calcite-bgcolor-darkest-grey",
            "calcite-bgcolor-lightest-grey",
            "calcite-bgcolor-black-75",
            "calcite-bgcolor-dark-red"
          );
          element.classList.add(bgColor);
        });
        settingsColor.value = "";
      });

      // Color - custom color
      settingsColor.addEventListener("change", function(event) {
        const customColor = event.target.value
        const textColor = event.target.options[event.target.selectedIndex]
          .dataset.textcolor;
        const bgColor = event.target.options[event.target.selectedIndex]
          .dataset.bgcolor;

        cssSelectorUi.forEach(function(element) {
          element.classList.remove(
            "calcite-text-dark", "calcite-text-light",
            "calcite-bg-dark", "calcite-bg-light",
            "calcite-bg-custom"
          );
          element.classList.add(textColor, bgColor);
          element.classList.remove(
            "calcite-bgcolor-dark-blue",
            "calcite-bgcolor-blue-75",
            "calcite-bgcolor-dark-green",
            "calcite-bgcolor-dark-brown",
            "calcite-bgcolor-darkest-grey",
            "calcite-bgcolor-lightest-grey",
            "calcite-bgcolor-black-75",
            "calcite-bgcolor-dark-red"
          );
          element.classList.add(customColor);
          if (!customColor) {
            settingsTheme.dispatchEvent(new Event("change"));
          }
        });
      });

      // Widgets - light (default) or dark theme
      const settingsWidgets = document.getElementById("settingsWidgets");
      settingsWidgets.addEventListener("change", function(event) {
        const theme = event.target.value;
        cssSelectorMap.classList.remove("calcite-widgets-dark",
          "calcite-widgets-light");
        cssSelectorMap.classList.add(theme);
      });

      // Layout - top or bottom nav position
      const settingsLayout = document.getElementById("settingsLayout");
      settingsLayout.addEventListener("change", function(event) {
        const layout = event.target.value;
        const layoutNav = event.target.options[event.target.selectedIndex]
          .dataset.nav;

        document.body.classList.remove("calcite-nav-bottom",
          "calcite-nav-top");
        document.body.classList.add(layout);

        const nav = document.querySelector("nav");
        nav.classList.remove("navbar-fixed-bottom", "navbar-fixed-top");
        nav.classList.add(layoutNav);
        setViewPadding(layout);
      });

      // Set view padding for widgets based on navbar position
      function setViewPadding(layout) {
        let padding, uiPadding;
        // Top
        if (layout === "calcite-nav-top") {
          padding = {
            padding: {
              top: 50,
              bottom: 0
            }
          };
          uiPadding = {
            padding: {
              top: 15,
              right: 15,
              bottom: 30,
              left: 15
            }
          };
        } else { // Bottom
          padding = {
            padding: {
              top: 0,
              bottom: 50
            }
          };
          uiPadding = {
            padding: {
              top: 30,
              right: 15,
              bottom: 15,
              left: 15
            }
          };
        }
        ui.mapView.set(padding);
        ui.mapView.ui.set(uiPadding);
        app.sceneView.set(padding);
        app.sceneView.ui.set(uiPadding);
        // Reset popup
        if (app.activeView.popup.visible && app.activeView.popup.dockEnabled) {
          app.activeView.popup.visible = false;
          app.activeView.popup.visible = true;
        }
      }
	  
	  
		ui.ready = true;
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
				
			  ui.mapView.graphics.add(pointGraphic);
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
			  ui.mapView.graphics.add(polylineGraphic);
    });


  }


}

DrawMaps.prototype.reload = function(applyzoom)
{
	if(!this.ui.ready) {
		setTimeout(this.reload.bind(this), 500);
		return;
	}
	
  this.ui.mapView.center = [this.astralMap.longitude, this.astralMap.latitude];
  if (applyzoom){
    this.ui.mapView.zoom = 12;
  }
	
	
	this.ui.mapView.graphics.removeAll();
	
	for(var i=0; i<this.astralMap.features.length; i++) {
		if(this.astralMap.features[i].enabled) { renderFeature(this.astralMap.features[i]); }
	}
	renderPoint();
}


DrawMaps.prototype.pickpoint = function(pickpointCallback)
{

  this.ui.flagPickpoint = true;
  this.ui.pickpointCallback = pickpointCallback;

  

  
  
}



