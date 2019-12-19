import React from "react";
import { publishManagerShiftAndPaymentAmount } from "./publishMessageToTopic";
import aws from "aws-sdk";
import moment from "moment";
import DropIn from "braintree-web-drop-in-react";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";

import TextField from "@material-ui/core/TextField";

import MenuItem from "@material-ui/core/MenuItem";

const buy = async scope => {
  scope.setState({ playDrum6: !scope.state.playDrum6 });
  let count = 0;
  let interval = setInterval(() => {
    count++;

    if (count == 4) {
      scope.setState({ playDrum6: !scope.state.playDrum6 });
      clearInterval(interval);
    }
  }, 1000);

  const { nonce } = await scope.instance.requestPaymentMethod();
  const { shiftPaymentAmount } = scope.state;

  var lambda = new aws.Lambda({
    region: "us-east-1"
  });

  const Payload = {
    nonce,
    shiftPaymentAmount
  };

  var params = {
    FunctionName: "charge_manager",
    InvocationType: "RequestResponse",
    LogType: "Tail",
    Payload: JSON.stringify(Payload)
  };

  let lambdaPromise = lambda.invoke(params).promise();
  lambdaPromise.then(async data => {
    console.log(data.Payload);
    console.log(data.Payload.errorMessage);

    scope.setState({ braintreePaymentResponse: JSON.stringify(data) });
  });
};

export const displayManagerPaymentPublishOptions = scope => {
  return (
    <div
      style={{
        justifyContent: "center",
        flexDirection: "column",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div style={{ margin: 5 }}>
        Manager for Payment
        <Select
          value={scope.state.managerForPaymentStringified}
          onChange={event => {
            const managerForPayment = JSON.parse(event.target.value);
            scope.setState({
              managerForPayment,
              managerForPaymentStringified: event.target.value,
              managerCustomerID: managerForPayment.managerCustomerID
            });

            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            const Payload = {
              customerId: managerForPayment.managerCustomerID
            };

            var params = {
              FunctionName: "get_token",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(Payload)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            lambdaPromise.then(async data => {
              const Payload = data.Payload;

              let parsedPayload = JSON.parse(Payload);

              await scope.setState({
                clientToken: parsedPayload.clientToken
              });
            });
          }}
        >
          {scope.state.managerOfShiftArray.map(manager => {
            return (
              <MenuItem value={JSON.stringify(manager)}>
                {manager.managerName} {manager.managerCustomerID}
              </MenuItem>
            );
          })}
        </Select>
      </div>
      <div style={{ margin: 5 }}>
        Shift for Manager Payment
        <Select
          value={scope.state.shiftForManagerPaymentStringified}
          onChange={event => {
            const shiftForManagerPayment = JSON.parse(event.target.value);
            scope.setState({
              shiftForManagerPayment,
              shiftForManagerPaymentStringified: event.target.value
            });
          }}
        >
          {scope.state.shiftsForManagerPaymentArray.map(shift => {
            return (
              <MenuItem value={JSON.stringify(shift)}>
                {`${shift.shiftAddress} ${shift.shiftStartTimeHour}:${
                  shift.shiftStartTimeMinute
                } ${shift.shiftStartTimeMeridiem} ${shift.shiftEndTimeHour}:${
                  shift.shiftEndTimeMinute
                } ${shift.shiftEndTimeMeridiem} on ${moment(
                  shift.shiftStartDate.shiftStartDate
                ).format("LL")}`}
              </MenuItem>
            );
          })}
        </Select>
      </div>
      <div style={{ flexDirection: "row" }}>
        Payment Amount
        <TextField
          value={scope.state.shiftPaymentAmount}
          onChange={event => {
            scope.setState({
              shiftPaymentAmount: event.target.value
            });
          }}
        />
      </div>

      <div style={{ margin: 5 }}>
        <Button
          style={{
            color: "red"
          }}
          onClick={() => {
            publishManagerShiftAndPaymentAmount(scope.state);
          }}
        >
          Publish Manager, Shift, and Payment Amount
        </Button>
      </div>
      {scope.state.clientToken && (
        <div>
          <DropIn
            options={{ authorization: scope.state.clientToken }}
            onInstance={instance => (scope.instance = instance)}
          />
          <Button
            style={{ backgroundColor: "green" }}
            onClick={() => {
              buy(scope);
            }}
          >
            Pay
          </Button>
        </div>
      )}
    </div>
  );
};
