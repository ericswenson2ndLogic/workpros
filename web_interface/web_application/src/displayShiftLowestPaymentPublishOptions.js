import React from "react";

import moment from "moment";

import aws from "aws-sdk";

var lambda = new aws.Lambda({
  region: "us-east-1"
});

export const displayShiftLowestPaymentPublishOptions = scope => {
  return (
    <div
      style={{
        justifyContent: "center",
        flexDirection: "column",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div>
        Worker
        <select
          value={scope.state.workerWithLowestCostStringified}
          onChange={async event => {
            console.log(event.target.value);
            const workerWithLowestCost = JSON.parse(event.target.value);

            await scope.setState({
              workerWithLowestCost,
              workerWithLowestCostStringified: event.target.value
            });
          }}
        >
          {scope.state.workerWithLowestCostArray.map(worker => {
            return (
              <option value={JSON.stringify(worker)}>
                {worker.workerName}
              </option>
            );
          })}
        </select>
      </div>
      <div>
        <label>Shift Lowest Payment</label>
        <input
          type="text"
          value={scope.state.shiftLowestPayment}
          onChange={event => scope.set(event, "shiftLowestPayment")}
        />
      </div>

      <div style={{ margin: 5 }}>
        Shift for Updating Cost
        <select
          value={scope.state.shiftForUpdatingCostStringified}
          onChange={event => {
            const shiftForUpdatingCost = JSON.parse(event.target.value);
            scope.setState({
              shiftForUpdatingCost,
              shiftForUpdatingCostStringified: event.target.value
            });
          }}
        >
          {scope.state.shiftsForUpdatingCostArray.map(shift => {
            let allWorkersReceivingText = "";

            for (let worker in shift.workerForDistributionSelectedArray) {
              allWorkersReceivingText +=
                shift.workerForDistributionSelectedArray[worker];
            }
            return (
              <option value={JSON.stringify(shift)}>
                {`${shift.shiftAddress} ${shift.shiftStartTimeHour}:${
                  shift.shiftStartTimeMinute
                } ${shift.shiftStartTimeMeridiem} ${shift.shiftEndTimeHour}:${
                  shift.shiftEndTimeMinute
                } ${shift.shiftEndTimeMeridiem} on ${moment(
                  shift.shiftStartDate.shiftStartDate
                ).format("LL")} ${allWorkersReceivingText}`}
              </option>
            );
          })}
        </select>
      </div>

      <button
        onClick={async () => {
          if (
            Object.keys(scope.state.shiftForUpdatingCost).length > 0 &&
            scope.state.shiftLowestPayment &&
            Object.keys(scope.state.workerWithLowestCost).length > 0
          ) {
            const Payload = scope.state.shiftForUpdatingCost;
            Payload.shiftLowestPayment = scope.state.shiftLowestPayment;
            Payload.workerWithLowestCost = scope.state.workerWithLowestCost;

            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            var params = {
              FunctionName: "update_shift",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(Payload)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let value = await lambdaPromise;

            alert("success updating shift with lowest payment");
          } else {
            alert("missing value for updating shift cost");
          }
        }}
        style={{
          color: "green"
        }}
      >
        Update Shift with Lowest Payment
      </button>
      <button
        onClick={async () => {
          if (
            Object.keys(scope.state.workerWithLowestCost).length > 0 &&
            scope.state.shiftLowestPayment
          ) {
            const Payload = {
              workerWithLowestCost: scope.state.workerWithLowestCost
            };
            Payload.shiftLowestPayment = scope.state.shiftLowestPayment;

            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            var params = {
              FunctionName: "update_worker",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(Payload)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let value = await lambdaPromise;

            alert("success updating worker with lowest payment");
          } else {
            alert("missing value for updating lowest worker payment");
          }
        }}
        style={{
          color: "green"
        }}
      >
        Update Worker with Lowest Payment
      </button>
      <div style={{ margin: 5 }}>
        Shift with Updated Cost
        <select
          value={scope.state.shiftWithUpdatedCostStringified}
          onChange={event => {
            const shiftWithUpdatedCost = JSON.parse(event.target.value);
            scope.setState({
              shiftWithUpdatedCost,
              shiftWithUpdatedCostStringified: event.target.value
            });
          }}
        >
          {scope.state.shiftsWithUpdatedCostArray.map(shift => {
            let allWorkersReceivingText = "";

            for (let worker in shift.workerForDistributionSelectedArray) {
              allWorkersReceivingText +=
                shift.workerForDistributionSelectedArray[worker];
            }
            return (
              <option value={JSON.stringify(shift)}>
                {`${shift.shiftAddress} ${shift.shiftStartTimeHour}:${
                  shift.shiftStartTimeMinute
                } ${shift.shiftStartTimeMeridiem} ${shift.shiftEndTimeHour}:${
                  shift.shiftEndTimeMinute
                } ${shift.shiftEndTimeMeridiem} on ${moment(
                  shift.shiftStartDate.shiftStartDate
                ).format("LL")} all workers are ${allWorkersReceivingText} $${
                  shift.shiftLowestPayment
                } ${shift.workerWithLowestCost.workerName}`}
              </option>
            );
          })}
        </select>
      </div>
      <div>
        <label>LOSING WORKER ADDITIONAL TITLE</label>
        <input
          type="text"
          value={scope.state.losingWorkerAdditionalTitle}
          onChange={event => scope.set(event, "losingWorkerAdditionalTitle")}
        />
      </div>
      <div>
        LOWEST
        {textButton(
          `Hi${scope.state.losingWorkerAdditionalTitle.toUpperCase()} ${scope.state.workerName.toUpperCase()}, for the shift on ${scope.state.shiftStartDayName.toUpperCase()} at ${
            scope.state.shiftStartTimeHour
          }:${
            scope.state.shiftStartTimeMinute
          } ${scope.state.shiftStartTimeMeridiem.toUpperCase()} at location ${scope.state.shiftAddress.toUpperCase()}, the current LOWEST PRICE PER HOUR with FREE TRANSPORT by UBER is $${
            scope.state.shiftLowestPayment
          } by${scope.state.workerAdditionalTitle.toUpperCase()} ${scope.state.competingWorker.toUpperCase()}. Please reply with any LOWER dollar amount PER HOUR that you are willing to work for by ${scope.state.biddingEndTime.toUpperCase()}.`,
          scope.state.workerPhoneNumber,
          scope.state.workerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        LOWEST PAYMENT with BETTER LOCATION
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()}, based on your LOCATION, if you can work for any DOLLAR amount LESS than $11.50 PER HOUR, you will be MORE COMPETITIVE than SHEMAR MOORE.`,
          scope.state.workerPhoneNumber,
          scope.state.workerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        <label>COMPETING WORKER</label>
        <input
          type="text"
          value={scope.state.competingWorker}
          onChange={event => scope.set(event, "competingWorker")}
        />
      </div>
      <div>
        SECONDARY WORDING of BEST PRICE
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()}, for the 1 POSITION on ${scope.state.shiftStartDayName.toUpperCase()} at ${
            scope.state.shiftStartTimeHour
          }:${
            scope.state.shiftStartTimeMinute
          } ${scope.state.shiftStartTimeMeridiem.toUpperCase()} at location ${scope.state.shiftAddress.toUpperCase()}, you must have the LOWEST price per hour. Your lowest must be LESS than $${
            scope.state.shiftLowestPayment
          } per hour which is the lowest of COMPETING WorkPro ${scope.state.competingWorker.toUpperCase()}.`,
          scope.state.workerPhoneNumber,
          scope.state.workerName.toUpperCase(),
          scope
        )}
      </div>
      <button
        onClick={async () => {
          const Payload = {
            body: `Hi ${scope.state.workerName.toUpperCase()}, for the 1 POSITION on ${scope.state.shiftStartDayName.toUpperCase()} at ${
              scope.state.shiftStartTimeHour
            }:${
              scope.state.shiftStartTimeMinute
            } ${scope.state.shiftStartTimeMeridiem.toUpperCase()} at location ${scope.state.shiftAddress.toUpperCase()}, you must have the LOWEST price per hour. Your lowest must be LESS than $${
              scope.state.shiftLowestPayment
            } per hour which is the lowest of COMPETING WorkPro BRYCE TARO PETERSON (PHILADELPHIA).`,
            phoneNumber: scope.state.workerPhoneNumber
          };

          let params = {
            FunctionName: "send_text",
            InvocationType: "RequestResponse",
            LogType: "Tail",
            Payload: JSON.stringify(Payload)
          };
          var lambda = new aws.Lambda({
            region: "us-east-1"
          });
          let lambdaPromise = lambda.invoke(params).promise();

          await SaveSentToDatabase(Payload, Worker.workerName);
        }}
      >
        `Hi ${scope.state.workerName.toUpperCase()}, for the 1 POSITION on $
        {scope.state.shiftStartDayName.toUpperCase()} at $
        {scope.state.shiftStartTimeHour}:${scope.state.shiftStartTimeMinute} $
        {scope.state.shiftStartTimeMeridiem.toUpperCase()} at location $
        {scope.state.shiftAddress.toUpperCase()}, you must have the LOWEST price
        per hour. Your lowest must be LESS than $$
        {scope.state.shiftLowestPayment} per hour which is the lowest of
        COMPETING WorkPro BRYCE TARO PETERSON (PHILADELPHIA).`
      </button>

      <div>
        LOWEST PAYMENT with BETTER LOCATION
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()}, BIDDING CLOSES at 5:30 PM.`,
          scope.state.workerPhoneNumber,
          scope.state.workerName.toUpperCase(),
          scope
        )}
      </div>

      <button
        onClick={async () => {
          const Payload = {
            body: `Hi ${scope.state.workerName.toUpperCase()}, so long as you have the LOWEST PRICE by 5 PM TODAY, your SCHEDULING will be FINALIZED for the SHIFT on ${scope.state.shiftStartDayName.toUpperCase()} at ${
              scope.state.shiftStartTimeHour
            }:${scope.state.shiftStartTimeMinute} ${
              scope.state.shiftStartTimeMeridiem
            } at ${
              scope.state.shiftAddress
            }. You currently have the LOWEST PRICE at $${
              scope.state.shiftLowestPayment
            }.`,
            phoneNumber: scope.state.workerPhoneNumber
          };

          let params = {
            FunctionName: "send_text",
            InvocationType: "RequestResponse",
            LogType: "Tail",
            Payload: JSON.stringify(Payload)
          };
          var lambda = new aws.Lambda({
            region: "us-east-1"
          });
          let lambdaPromise = lambda.invoke(params).promise();

          const response = await lambdaPromise;

          await SaveSentToDatabase(Payload, scope.state.workerName);

          scope.setState({
            workerConfirmPhoneNumberResponse:
              response.Payload + "" + JSON.stringify(Payload)
          });
        }}
      >
        Send Day Time Location and current lowest pay
      </button>
      <button
        onClick={async () => {
          const Payload = {
            body: `Hi ${scope.state.workerName.toUpperCase()}, your SCHEDULING is FINALIZED for the SHIFT on ${scope.state.shiftStartDayName.toUpperCase()} at ${
              scope.state.shiftStartTimeHour
            }:${scope.state.shiftStartTimeMinute} ${
              scope.state.shiftStartTimeMeridiem
            } at ${scope.state.shiftAddress}. You had the LOWEST PRICE at $${
              scope.state.shiftLowestPayment
            }.`,
            phoneNumber: scope.state.workerPhoneNumber
          };

          let params = {
            FunctionName: "send_text",
            InvocationType: "RequestResponse",
            LogType: "Tail",
            Payload: JSON.stringify(Payload)
          };
          var lambda = new aws.Lambda({
            region: "us-east-1"
          });
          let lambdaPromise = lambda.invoke(params).promise();

          const response = await lambdaPromise;

          await SaveSentToDatabase(Payload, scope.state.workerName);

          scope.setState({
            workerConfirmPhoneNumberResponse:
              response.Payload + "" + JSON.stringify(Payload)
          });
        }}
      >
        Finalize SHIFT with WORKER
      </button>
    </div>
  );
};

const SaveSentToDatabase = async (Payload, name = "") => {
  Payload.name = name;
  var SaveParams = {
    FunctionName: "save_sent",
    InvocationType: "RequestResponse",
    LogType: "Tail",
    Payload: JSON.stringify(Payload)
  };

  let SaveSentLambdaPromise = lambda.invoke(SaveParams).promise();

  let value = await SaveSentLambdaPromise;
};

const textButton = (textMessage, workerPhoneNumber, workerName, scope) => {
  return (
    <button
      onClick={async () => {
        const Payload = {
          body: textMessage,
          phoneNumber: workerPhoneNumber
        };

        let params = {
          FunctionName: "send_text",
          InvocationType: "RequestResponse",
          LogType: "Tail",
          Payload: JSON.stringify(Payload)
        };
        var lambda = new aws.Lambda({
          region: "us-east-1"
        });
        let lambdaPromise = lambda.invoke(params).promise();

        const response = await lambdaPromise;

        await SaveSentToDatabase(Payload, workerName);

        scope.setState({
          workerConfirmPhoneNumberResponse: response.Payload + ""
        });
      }}
    >
      to {workerName} send: {textMessage}
    </button>
  );
};
