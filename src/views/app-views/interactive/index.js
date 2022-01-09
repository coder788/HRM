import React, {Component} from 'react';
import {Card} from "antd";
import {GOOGLE_MAPS_API_KEY, WEB_CONFIG, WSSOCKET} from "configs/AppConfig";
import GoogleMapReact from 'google-map-react';
import apiService from "services/ApiService";
import moment from "moment";

export class InteractiveMap extends Component {
  state = {
    mapTimer: null
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    clearInterval(this.state.mapTimer)
    WSSOCKET.off("arabianfal_database_map:remove")
    WSSOCKET.off("arabianfal_database_map:moving")
  }

  render() {

    const getHomeIconColor = (ticket) => {
      let problem = false

      if(ticket.operation_timeout < 0) problem = true
      if(ticket.respond_timeout < 0) problem = true
      if(["raised_problem_sv","raised_problem_foreman"].includes(ticket.status)) problem = true

      return problem ? "/img/map/clientIcon_r.png" : "/img/map/clientIcon_blu.png"
    }

    const handleApiLoaded = (map, maps) => {
      let markersArray = [];
      let trackersArray = [];
      let heatmap = false;

      WEB_CONFIG('settings').districts.map((district) => {
        new maps.Circle({
          strokeColor: "#FF0000",
          strokeOpacity: 0.3,
          strokeWeight: 2,
          fillColor: "transparent",
          fillOpacity: 0.1,
          map,
          center: {lat: parseFloat(district.latitude), lng: parseFloat(district.longitude)},
          radius: parseInt(district.radius)*100,
        });
        if(district.zones.length > 0){
          district.zones.map((zone) => {
            new maps.Circle({
              strokeColor: "#98d4a3",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#98d4a3",
              fillOpacity: 0.35,
              map,
              center: {lat: parseFloat(zone.latitude), lng: parseFloat(zone.longitude)},
              radius: parseInt(zone.radius)*100,
            });
          })
        }
      })

      function clearMap(){
        for (let i = 0; i < markersArray.length; i++) {
          markersArray[i].setMap(null);
        }
        markersArray.length = 0;
        if(heatmap){
          heatmap.setMap(null)
          heatmap = false
        }
      }

      function mapGetUpdates(firstOpen){
        clearMap()

        apiService.gpsHistory().then(resp => {
          if(resp.length > 0){
            resp.map((marker) => {
              drawMarker(marker)
            })
          }
        })

        apiService.getTickets({in_action: 1, nopaging: 1}).then(resp => {
          let heatmapData = []

          resp.map((ticket) => {
            let infoContent = `<div>`
              +`<h3>${ticket.code} <small style="background-color: ${ticket.type_color.bgcolor}; color: ${ticket.type_color.color};padding: 5px;">${ticket.type_name}</small></h3>`
              +`<h5 style="color: #ccc">${ticket.status_name}</h5>`
              +`<style>ul.infoWin li{list-style:square;margin-top:12px}</style>`
              +`<ul style="margin:0;padding:0 20px 10px" class="infoWin">`
              +`<li><strong>Start Time:</strong> <span>${moment(ticket.start_time).format("h:m A")} since ${moment(ticket.start_time).fromNow()}</span></li>`
            infoContent += ticket.timeout ? `<li><strong>Total Timeout:</strong> <span style="color: ${ticket.timeout_color}">${ticket.timeout}</span></li>` : ""
            infoContent += ticket.operation_timeout ? `<li><strong>Repaire Timeout:</strong> <span>${ticket.operation_timeout} minutes</span></li>` : ""
            infoContent += ticket.respond_timeout ? `<li><strong>Response Timeout:</strong> <span>${ticket.respond_timeout} minutes</span></li>` : ""
            infoContent += `<li><strong>Progress:</strong> <span>${ticket.progress} %</span></li>`
              +`</ul>`
              +`</div>`
            let infowindow = new maps.InfoWindow({
              content: infoContent
            });
            let marker = new maps.Marker({
              position: {lat: parseFloat(ticket.customer.latitude), lng: parseFloat(ticket.customer.longitude)},
              map: map,
              icon: getHomeIconColor(ticket),
              animation: firstOpen ? maps.Animation.DROP : false,
            });
            marker.addListener("click", () => {
              infowindow.open(map, marker);
            });
            markersArray.push(marker)
            heatmapData.push(new maps.LatLng(parseFloat(ticket.customer.latitude), parseFloat(ticket.customer.longitude)))
          })

          heatmap = new maps.visualization.HeatmapLayer({
            data: heatmapData
          });
          heatmap.setMap(map);
        })
      }

      const mapTimer = setInterval(() => {
        mapGetUpdates(false)
      }, 300000)
      this.setState({mapTimer: mapTimer})

      mapGetUpdates(true)

      WSSOCKET.on("arabianfal_database_map:remove", function(data){
        console.log(data)
        clearOneMarker(data.profile.id)
      })

      function clearOneMarker(profileID){
        let trackerIndex = trackersArray.findIndex(tracker => tracker.userid === profileID)
        if(trackerIndex > -1) {
          trackersArray[trackerIndex].marker.setMap(null)
          if(trackersArray[trackerIndex].direction){
            trackersArray[trackerIndex].direction.setMap(null)
          }
          trackersArray.splice(trackerIndex, 1)
        }
      }

      WSSOCKET.on("arabianfal_database_map:tracking", function(data){
        console.log("tracking", data)
        drawMarker(data)
      })

      function drawMarker(data){
        clearOneMarker(data.profile.id)

        let infoContent = `<div style="text-align: center">`
          +`<img src="${data.profile.photo_link}" alt="" style="max-width:120px;max-height:80px" />`
          +`<h4 style="margin-bottom:0;text-align:left">${data.profile.full_name}</h4>`
          +`<h5 style="margin:0;color: #ccc;text-align:left">${data.profile.role.title}</h5>`
          +`</div>`
        let infowindow = new maps.InfoWindow({
          content: infoContent
        });

        let trackerIndex = trackersArray.findIndex(tracker => tracker.userid === data.profile.id)
        if(trackerIndex > -1){
          let marker = trackersArray[trackerIndex].marker
          marker.setPosition(new maps.LatLng(parseFloat(data.gps.latitude), parseFloat(data.gps.longitude)))
        } else {
          let marker = new maps.Marker({
            position: {lat: parseFloat(data.gps.latitude), lng: parseFloat(data.gps.longitude)},
            map: map,
            icon: data.profile.role.name === "techboy" ? "/img/map/techicon_b.png" : "/img/map/deliveryIcon_b.png",
            animation: maps.Animation.DROP,
          });
          marker.addListener("click", () => {
            infowindow.open(map, marker)
          })
          trackersArray.push({marker: marker, direction: null, userid: data.profile.id})
        }
      }

      WSSOCKET.on("arabianfal_database_map:moving", function(data){
        console.log(data)
        let infoContent = `<div style="text-align: center">`
          +`<img src="${data.profile.photo_link}" alt="" style="max-width:120px;max-height:80px" />`
          +`<h4 style="margin-bottom:0;text-align:left">${data.profile.full_name}</h4>`
          +`<h5 style="margin:0;color: #ccc;text-align:left">${data.profile.role.title}</h5>`
          +`</div>`
        let infowindow = new maps.InfoWindow({
          content: infoContent
        });

        let trackerIndex = trackersArray.findIndex(tracker => tracker.userid === data.profile.id)
        if(trackerIndex > -1 && ! trackersArray[trackerIndex].direction){
          trackerIndex = -1
          clearOneMarker(data.profile.id)
        }

        if(trackerIndex > -1){
          let marker = trackersArray[trackerIndex].marker
          let direction = trackersArray[trackerIndex].direction
          marker.setPosition(new maps.LatLng(parseFloat(data.gps.latitude), parseFloat(data.gps.longitude)))
          direction.setMap(null)
          let directionsDisplay = drawRoute(data.gps, data.target)
          if(directionsDisplay){
            trackersArray[trackerIndex].direction = directionsDisplay
          }
        } else {
          let marker = new maps.Marker({
            position: {lat: parseFloat(data.gps.latitude), lng: parseFloat(data.gps.longitude)},
            map: map,
            icon: data.profile.role.name === "techboy" ? "/img/map/techicon_g.png" : "/img/map/deliveryIcon_g.png",
            animation: maps.Animation.DROP,
          });
          marker.addListener("click", () => {
            infowindow.open(map, marker)
          })
          let directionsDisplay = drawRoute(data.gps, data.target)
          console.log(directionsDisplay)
          trackersArray.push({marker: marker, direction: directionsDisplay, userid: data.profile.id})
        }

        function drawRoute(startPoint, endPoint){
          let request = {
            origin: new maps.LatLng(parseFloat(startPoint.latitude), parseFloat(startPoint.longitude)),
            destination: new maps.LatLng(parseFloat(endPoint.latitude), parseFloat(endPoint.longitude)),
            travelMode: maps.TravelMode.DRIVING
          };
          let directionsDisplay = new maps.DirectionsRenderer({suppressMarkers: true, preserveViewport: true})
          directionsDisplay.setMap(map)
          new maps.DirectionsService().route(request, function (response, status) {
            if (status === maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(response)
              directionsDisplay.setMap(map)
            } else {
              console.log("Error", response)
            }
          });
          return directionsDisplay
        }

      }.bind(this))
    }

    return (
      <>
        <Card title="Interactive Map" bordered={this.props.bordered}>
          <div style={{height: '600px', width: '100%'}} className="position-relative">
            <GoogleMapReact
              bootstrapURLKeys={{key: GOOGLE_MAPS_API_KEY, libraries:['visualization']}}
              defaultCenter={{lat: 26.28862094, lng: 50.12869894}}
              defaultZoom={9}
              mapTypeControl={true}
              yesIWantToUseGoogleMapApiInternals={true}
              onGoogleApiLoaded={({map, maps}) => handleApiLoaded(map, maps)}
            >
            </GoogleMapReact>
          </div>
        </Card>
      </>
    )
  }
}

export default InteractiveMap
