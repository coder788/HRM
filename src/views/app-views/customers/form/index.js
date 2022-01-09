import React, {Component} from 'react';
import {Button, Card, Cascader, Col, Form, Input, Row} from "antd";
import {getAllZones, GOOGLE_MAPS_API_KEY} from "configs/AppConfig";
import GoogleMapReact from 'google-map-react';

export class CustomerForm extends Component {

  state = {
    zones: [],
    searchQuery: "",
  }

  componentDidMount() {
    console.log(this.props)
    this.getZones()
  }

  getZones() {
    this.setState({zones: getAllZones()})
  }

  render() {
    const {searchQuery} = this.state;

    const handleApiLoaded = (map, maps) => {
      let markersArray = [];

      function drawMarker(zoom){
        let lat = parseFloat(document.getElementById("gmapsLatitude").value);
        let lng = parseFloat(document.getElementById("gmapsLongitude").value);
        if(isNaN(lat) || isNaN(lng)) return

        for (let i = 0; i < markersArray.length; i++) {
          markersArray[i].setMap(null);
        }
        markersArray.length = 0;

        let marker = new maps.Marker({
          position: {lat: lat, lng: lng},
          map: map,
          animation: maps.Animation.DROP,
          draggable: true,
        });
        map.setCenter({lat: lat, lng: lng});
        if(zoom) map.setZoom(zoom)
        markersArray.push(marker)
        maps.event.addListener(marker, 'dragend', function () {
          document.getElementById("gmapsLatitude").value = marker.getPosition().lat();
          document.getElementById("gmapsLongitude").value = marker.getPosition().lng();
          drawMarker(false)
        });
      }

      map.addListener("click", (mapsMouseEvent) => {
        document.getElementById("gmapsLatitude").value = mapsMouseEvent.latLng.lat();
        document.getElementById("gmapsLongitude").value = mapsMouseEvent.latLng.lng();
        drawMarker(false)
      });

      document.getElementById("gmapsLatitude").addEventListener("change", function (event) {
        drawMarker(15)
      });

      document.getElementById("searchQueryHtml").addEventListener("keyup", function (event) {
        if (event.keyCode === 13) event.preventDefault();
        else return;
        if (document.getElementById("searchQueryHtml").value === "") return;
        for (let i = 0; i < markersArray.length; i++) {
          markersArray[i].setMap(null);
        }
        markersArray.length = 0;

        let searchQuery = document.getElementById("searchQueryHtml").value;
        new maps.Geocoder().geocode({'address': searchQuery}, function (results, status) {
          if (status === maps.GeocoderStatus.OK) {
            document.getElementById("gmapsLatitude").value = results[0].geometry.location.lat();
            document.getElementById("gmapsLongitude").value = results[0].geometry.location.lng();
            drawMarker(false)
            map.setZoom(15)
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }, false);

      drawMarker(15)
    };

    const newSearchQuery = (event) => {
      this.setState({searchQuery: event.target.value});
    }

    const checkHouseNumber = (event) => {
      this.props.updateHouseNumber(event.target.value.replace(/[^0-9a-zA-Z\-]/g, ''))
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
                        label="First Name"
                        name="fname"
                        rules={[
                          {
                            required: true,
                            message: 'Please input first name',
                          },
                        ]}
                      >
                        <Input/>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Last Name"
                        name="lname"
                        rules={[
                          {
                            required: true,
                            message: 'Please input last name',
                          },
                        ]}
                      >
                        <Input/>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Zone"
                        name="zone_id"
                        rules={[{
                          required: true,
                          message: 'Please choose the customer zone'
                        }]}
                      >
                        <Cascader options={this.state.zones} placeholder="Please select"/>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[{
                          required: false,
                          type: 'email',
                          message: 'Please enter a valid email'
                        }]}
                      >
                        <Input/>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Mobile Number"
                        name="mobile"
                        rules={[{
                          required: false,
                          type: 'string',
                          max: 15,
                          min: 9,
                          message: 'Please enter a valid mobile number'
                        }]}
                      >
                        <Input/>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Home Phone"
                        name="phone"
                        rules={[{
                          required: false,
                          type: 'string',
                          max: 15,
                          min: 9,
                          message: 'Please enter a valid phone number'
                        }]}
                      >
                        <Input/>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24}>
                      <Form.Item
                        label="Func. Location"
                        name="house_num"
                        rules={[{
                          required: true,
                          type: 'string',
                          max: 80,
                          min: 3,
                          message: 'Please enter a valid house number'
                        }]}
                      >
                        <Input onChange={checkHouseNumber} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24}>
                      <Form.Item
                        label="Address"
                        name="address"
                        rules={[{
                          required: true,
                          type: 'string',
                          max: 150,
                          message: 'Please enter physical address'
                        }]}
                      >
                        <Input placeholder="Physical Address"/>
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24}>
                  <Form.Item
                    label="Notes"
                    name="notes"
                    rules={[{
                      required: false,
                      type: 'string',
                      max: 255,
                      message: 'Max length is 255 charachters'
                    }]}
                  >
                    <Input.TextArea rows={8} placeholder="Type notes about this customer..."/>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={10}>
            <Card title="GPS Location" bordered={this.props.bordered}>
              <input type="hidden" id="gmapsLatitude"/>
              <input type="hidden" id="gmapsLongitude"/>
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

export default CustomerForm
