import React, {Component} from 'react';
import {Button, Card, Col, Form, Input, Row, Slider} from "antd";
import {GOOGLE_MAPS_API_KEY} from "configs/AppConfig";
import GoogleMapReact from 'google-map-react';

export class DistrictForm extends Component {

  state = {
    searchQuery: "",
  }

  componentDidMount() {
  }

  render() {
    const {searchQuery} = this.state;

    const handleApiLoaded = (map, maps) => {
      let markersArray = [];
      let circlesArray = [];
      let radius

      function clearMap(){
        for (let i = 0; i < markersArray.length; i++) {
          markersArray[i].setMap(null);
        }
        markersArray.length = 0;

        for (let i = 0; i < circlesArray.length; i++) {
          circlesArray[i].setMap(null);
        }
        circlesArray.length = 0;
      }

      function drawCircle(zoom){
        radius = parseInt(document.getElementById("radiusHtml").value);
        let lat = parseFloat(document.getElementById("gmapsLatitude").value);
        let lng = parseFloat(document.getElementById("gmapsLongitude").value);
        if(isNaN(radius) || isNaN(lat) || isNaN(lng) || radius === 0) return
        clearMap()
        let marker = new maps.Marker({
          position: {lat: lat, lng: lng},
          map: map,
          animation: maps.Animation.DROP,
          draggable: true,
        });
        markersArray.push(marker)
        map.setCenter({lat: lat, lng: lng})
        if(zoom) map.setZoom(zoom)
        let circle = new maps.Circle({
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.35,
          map,
          center: {lat: lat, lng: lng},
          radius: radius*100,
        });
        circlesArray.push(circle)
        maps.event.addListener(marker, 'dragend', function () {
          document.getElementById("gmapsLatitude").value = marker.getPosition().lat();
          document.getElementById("gmapsLongitude").value = marker.getPosition().lng();
          drawCircle(false)
        });
      }

      map.addListener("click", (mapsMouseEvent) => {
        document.getElementById("gmapsLatitude").value = mapsMouseEvent.latLng.lat();
        document.getElementById("gmapsLongitude").value = mapsMouseEvent.latLng.lng();
        drawCircle(false)
      });

      document.getElementById("radiusHtml").addEventListener("change", function (event) {
        drawCircle(false)
      });

      document.getElementById("searchQueryHtml").addEventListener("keyup", function (event) {
        if (event.keyCode === 13) event.preventDefault();
        else return;
        if (document.getElementById("searchQueryHtml").value === "") return;
        console.log("searchQuery", document.getElementById("searchQueryHtml").value)
        let searchQuery = document.getElementById("searchQueryHtml").value;
        new maps.Geocoder().geocode({'address': searchQuery}, function (results, status) {
          if (status === maps.GeocoderStatus.OK) {
            document.getElementById("gmapsLatitude").value = results[0].geometry.location.lat();
            document.getElementById("gmapsLongitude").value = results[0].geometry.location.lng();
            drawCircle(15)
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }, false);

      drawCircle(15)
    };

    const radiusChanged = (value) => {
      document.getElementById("radiusHtml").value = value;

      let event = document.createEvent("HTMLEvents");
      event.initEvent("change", true, false);
      document.getElementById("radiusHtml").dispatchEvent(event);

      this.setState({radiusInput: value});
    }

    const newSearchQuery = (event) => {
      this.setState({searchQuery: event.target.value});
    }

    return (
      <>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={14}>
            <Card title="Basic Info" bordered={this.props.bordered}>
              <Row>
                <Col xs={24} sm={24} md={24} lg={24}>
                  <Row gutter={24}>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                          {
                            required: true,
                            message: 'Please input a name for this district',
                          },
                        ]}
                      >
                        <Input/>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Size"
                        name="radius"
                        rules={[
                          {
                            required: true,
                            message: 'Please input a name for this district',
                          },
                        ]}
                      >
                        <Slider onAfterChange={radiusChanged} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24}>
                  <Form.Item
                    label="About"
                    name="about"
                    rules={[{
                      required: false,
                      type: 'string',
                      max: 255,
                      message: 'Max length is 255 charachters'
                    }]}
                  >
                    <Input.TextArea rows={8} placeholder="Type description about this district..."/>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={10}>
            <Card title="Covered Area" bordered={this.props.bordered}>
              <input type="hidden" id="gmapsLatitude"/>
              <input type="hidden" id="gmapsLongitude"/>
              <input type="hidden" id="radiusHtml"/>
              <div style={{height: '600px', width: '100%'}} className="position-relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={newSearchQuery}
                  onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}
                  id="searchQueryHtml"
                  className="ant-input position-absolute"
                  placeholder="Search about location..."
                  style={{left: 40, top: 40, zIndex: 2, width: "71%"}}
                />
                <GoogleMapReact
                  bootstrapURLKeys={{key: GOOGLE_MAPS_API_KEY}}
                  defaultCenter={{lat: 26.28862094, lng: 50.12869894}}
                  defaultZoom={9}
                  yesIWantToUseGoogleMapApiInternals={true}
                  onGoogleApiLoaded={({map, maps}) => handleApiLoaded(map, maps)}
                >
                </GoogleMapReact>
              </div>
            </Card>
          </Col>
        </Row>
        {this.props.saveBtn ?
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button> : ""}
      </>
    )
  }
}

export default DistrictForm
