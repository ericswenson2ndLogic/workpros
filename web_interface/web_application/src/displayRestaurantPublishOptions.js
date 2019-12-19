import React from "react";

import aws from "aws-sdk";

import TextField from "@material-ui/core/TextField";

import Button from "@material-ui/core/Button";

import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

export const displayRestaurantPublishOptions = scope => {
  return (
    <div>
      <Button
        style={{
          backgroundColor: "red"
        }}
        onClick={async () => {
          const { restaurantName, restaurantLocation } = scope.state;

          if (restaurantName && restaurantLocation) {
            const event = {
              restaurantName,
              restaurantLocation
            };
            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            var params = {
              FunctionName: "restaurant_name_location",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(event)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let response = await lambdaPromise;

            scope.setState({
              saveRestaurantNameAndLocationResponse: response.Payload
            });
          } else {
            alert("Missing Value");
          }
        }}
      >
        Save Restaurant Name ${scope.state.restaurantName}and Location
      </Button>
      {scope.state.saveRestaurantNameAndLocationResponse}
      <div style={{ margin: 10 }}>
        Restaurant
        <Select
          value={scope.state.restaurantNameAndLocationStringified}
          onChange={event => {
            scope.setState({
              // managerNameAndPhoneNumber: JSON.parse(event.target.value),
              // managerNameAndPhoneNumberStringified: event.target.value,
              restaurantName: JSON.parse(event.target.value).restaurantName,
              // managerPhoneNumber: JSON.parse(event.target.value)
              //   .managerPhoneNumber
              restaurantLocation: JSON.parse(event.target.value)
                .restaurantLocation,
              shiftLocation: {
                shiftAddress: JSON.parse(event.target.value).restaurantLocation
                  .restaurantAddress
              },
              shiftAddress: JSON.parse(event.target.value).restaurantLocation
                .restaurantAddress
            });
          }}
        >
          {scope.state.restaurantNameAndLocationArray
            .sort(function(a, b) {
              return a.restaurantName.localeCompare(b.restaurantName);
            })
            .map(restaurantNameAndLocation => {
              return (
                <MenuItem value={JSON.stringify(restaurantNameAndLocation)}>
                  {restaurantNameAndLocation.restaurantName}{" "}
                  {restaurantNameAndLocation.restaurantLocation &&
                    restaurantNameAndLocation.restaurantLocation
                      .restaurantAddress}
                </MenuItem>
              );
            })}
        </Select>
      </div>

      <div style={{ margin: 10 }}>
        <TextField
          id="standard-with-placeholder"
          label="Restaurant Name 🏰"
          placeholder="Élephante"
          margin="normal"
          value={scope.state.restaurantName}
          onChange={event => {
            scope.setState({
              restaurantName: event.target.value
            });
          }}
        />
      </div>
      <div style={{ flexDirection: "column" }}>
        <div>
          Restaurant Location 📍
          {!scope.state.restaurantLocation.restaurantAddress && (
            <TextField
              type="text"
              value={scope.state.restaurantAddress}
              onChange={event => {
                scope.setState({
                  restaurantAddress: event.target.value
                });
                scope.findRestaurantAddresses(event.target.value);
              }}
            />
          )}
          {!scope.state.restaurantLocation.restaurantAddress &&
            scope.state.restaurantAddresses.length > 0 &&
            scope.state.restaurantAddresses.map(address => {
              return (
                <div style={{ margin: 10 }}>
                  <Button
                    style={{ backgroundColor: "red" }}
                    onClick={() => {
                      scope.handleRestaurantAddressClick(address);
                    }}
                  >
                    {address.formatted_address}
                  </Button>
                </div>
              );
            })}
        </div>
        <div>
          {scope.state.restaurantLocation.restaurantAddress &&
            scope.state.restaurantLocation.restaurantAddress}
        </div>
      </div>
    </div>
  );
};
