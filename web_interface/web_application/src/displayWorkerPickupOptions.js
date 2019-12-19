import React from "react";
import { publishWorkerAndWorkerPickupLocation } from "./publishMessageToTopic";
import aws from "aws-sdk";
export const displayWorkerPickupPublishOptions = scope => {
  return (
    <div
      style={{
        justifyContent: "center",
        flexDirection: "column",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div style={{ margin: 10 }}>
        Worker
        <select
          value={scope.state.workerForPickupStringified}
          onChange={async event => {
            const workerForPickup = JSON.parse(event.target.value);

            await scope.setState({
              workerForPickup,
              workerForPickupStringified: event.target.value
            });
          }}
        >
          {scope.state.workerForPickupArray.map(worker => {
            return (
              <option value={JSON.stringify(worker)}>
                {worker.workerName}
              </option>
            );
          })}
        </select>
      </div>
      <div style={{ margin: 10 }}>
        Restaurant
        <select
          value={scope.state.restaurantStringified}
          onChange={async event => {
            const restaurant = JSON.parse(event.target.value);

            scope.setState({
              restaurant,
              restaurantStringified: event.target.value,
              workerDestinationAddress:
                restaurant.restaurantLocation.restaurantAddress,
              workerDestinationLocation: {
                workerDestinationAddress:
                  restaurant.restaurantLocation.restaurantAddress,
                workerLatitude:
                  restaurant.restaurantLocation.restaurantLatitude,
                workerLongitude:
                  restaurant.restaurantLocation.restaurantLongitude
              }
            });
          }}
        >
          {scope.state.restaurantArray.map(restaurant => {
            return (
              <option value={JSON.stringify(restaurant)}>
                {restaurant.restaurantName}
              </option>
            );
          })}
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "row", margin: 10 }}>
        {scope.displayLocationInputViaAddress()}
      </div>
      <button
        onClick={() => {
          scope.setState({
            workerPickupAddress: "",
            workerPickupAddresses: [],
            workerPickupLocation: {}
          });
        }}
      >
        Different Location
      </button>
      <div style={{ display: "flex", flexDirection: "row", margin: 10 }}>
        {scope.displayDestinationInputViaAddress()}
      </div>
      <button
        onClick={() => {
          scope.setState({
            workerDestinationAddress: "",
            workerDestinationAddresses: [],
            workerDestinationLocation: {}
          });
        }}
      >
        Different Location
      </button>
      <div style={{ margin: 10 }}>
        <button
          style={{
            color: "red"
          }}
          onClick={async () => {
            // publishWorkerAndWorkerPickupLocation(scope.state);
            const {
              workerForPickup,
              workerDestinationLocation,
              workerPickupLocation,
              transportSandbox,
              workerDestinationAddress,
              workerPickupAddress
            } = scope.state;

            if (
              workerForPickup &&
              workerDestinationLocation &&
              workerPickupLocation &&
              typeof transportSandbox == "boolean" &&
              workerPickupAddress &&
              workerDestinationAddress
            ) {
              const workerAndWorkerPickupLocation = {
                workerForPickup,
                workerDestinationLocation,
                workerPickupLocation,
                transportSandbox
              };

              var lambda = new aws.Lambda({
                region: "us-east-1"
              });

              var params = {
                FunctionName: "request_uber",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(workerAndWorkerPickupLocation)
              };

              let lambdaPromise = lambda.invoke(params).promise();

              let value = await lambdaPromise;

              scope.setState({ transportRequestID: JSON.stringify(value) });
            } else {
              alert(
                "missing value for publishing manager, shift and payment amount"
              );
            }
          }}
          style={{ color: "green" }}
        >
          Call Transport
        </button>
        <div>{scope.state.transportRequestID}</div>
      </div>
    </div>
  );
};
