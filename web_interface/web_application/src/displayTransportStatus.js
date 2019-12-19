const React = require("react");
const aws = require("aws-sdk");

var lambda = new aws.Lambda({
  region: "us-east-1"
});
export const displayTransportStatus = scope => {
  return (
    <div>
      <div style={{ margin: 5 }}>
        <button
          onClick={() => {
            scope.setState({
              transportSandbox: !scope.state.transportSandbox
            });
          }}
        >
          sandbox {scope.state.transportSandbox + ""}
        </button>
      </div>
      <select
        value={scope.state.managerForTransportStatusStringified}
        onChange={event => {
          scope.setState({
            managerForTransportStatus: JSON.parse(event.target.value),
            managerForTransportStatusStringified: event.target.value
          });
        }}
      >
        {scope.state.managerForTransportStatusArray.map(
          managerForTransportStatus => {
            return (
              <option value={JSON.stringify(managerForTransportStatus)}>
                {managerForTransportStatus.managerName}{" "}
                {managerForTransportStatus.managerPhoneNumber}
              </option>
            );
          }
        )}
      </select>
      <button
        onClick={() => {
          var lambda = new aws.Lambda({
            region: "us-east-1"
          });

          const Payload = {
            sandbox: scope.state.transportSandbox
          };

          var params = {
            FunctionName: "get_status",
            InvocationType: "RequestResponse",
            LogType: "Tail",
            Payload: JSON.stringify(Payload)
          };

          let lambdaPromise = lambda.invoke(params).promise();
          lambdaPromise.then(async data => {
            scope.setState({ transportStatus: JSON.stringify(data.Payload) });

            const checkIfCurrentTrip = () =>
              data.Payload.includes("no_current_trip");

            const checkIfCurrentTripProcessing = () =>
              data.Payload.includes("processing");

            const checkIfCurrentTripAccepted = () =>
              data.Payload.includes("accepted");

            const checkIfCurrentTripArriving = () =>
              data.Payload.includes("arriving");

            const checkIfCurrentTripInProgress = () =>
              data.Payload.includes("in_progress");

            const checkIfCurrentTripCompleted = () =>
              data.Payload.includes("completed");

            if (checkIfCurrentTrip()) {
              scope.setState({
                transportCurrentStatus: "no current trip"
              });
            } else if (checkIfCurrentTripAccepted()) {
              scope.setState({
                transportCurrentStatus: "TRIP ACCEPTED"
              });
            } else if (checkIfCurrentTripProcessing()) {
              scope.setState({
                transportCurrentStatus: "yes current trip processing"
              });
            } else if (checkIfCurrentTripArriving()) {
              scope.setState({
                transportCurrentStatus: "yes current trip arriving"
              });
            } else if (checkIfCurrentTripInProgress()) {
              scope.setState({
                transportCurrentStatus: "yes current trip in progress"
              });
            } else if (checkIfCurrentTripCompleted()) {
              scope.setState({
                transportCurrentStatus: "yes current trip completed"
              });
            }
          });
        }}
        style={{
          color: "green"
        }}
      >
        Get Transport Status
      </button>
      <div>{scope.state.transportStatus}</div>
      <button
        onClick={async () => {
          const Payload = {
            body: `Hi ${scope.state.workerName.toUpperCase()} please wait OUTSIDE, your UBER is ON ITS WAY.`,
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
            workerConfirmPhoneNumberResponse: response.Payload + ""
          });
        }}
      >
        Text worker uber ON ITS WAY
      </button>
      <button
        onClick={async () => {
          const Payload = {
            body: `Hi ${scope.state.workerName.toUpperCase()} your UBER is a NISSAN SENTRA with license plate 8KBX914.`,
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
            workerConfirmPhoneNumberResponse: response.Payload + ""
          });
        }}
      >
        Text Uber TYPE
      </button>
      <button
        onClick={async () => {
          const Payload = {
            body: `Hi ${scope.state.workerName.toUpperCase()} your UBER is arriving in 3 MINUTES.`,
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
            workerConfirmPhoneNumberResponse: response.Payload + ""
          });
        }}
      >
        Text Uber ARRIVAL TIME to ${scope.state.workerName.toUpperCase()}
      </button>

      <div>
        <button
          onClick={async () => {
            const Payload = {
              body: `Hi DOUBLE PREMIUM MANAGER ${scope.state.managerName.toUpperCase()} your 5 STAR BRONZE DISHWASHER (CHEF PLONGEUR) ${scope.state.workerName.toUpperCase()} is ON THE WAY in an UBER POOL with an ETA of 12:14 PM and a COST PER HOUR of $7.00.`,
              phoneNumber: scope.state.managerPhoneNumber
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

            await SaveSentToDatabase(Payload, scope.state.managerName);

            scope.setState({
              managerConfirmPhoneNumberResponse: response.Payload + ""
            });
          }}
        >
          `Hi DOUBLE PREMIUM MANAGER ${scope.state.managerName.toUpperCase()}{" "}
          your DISHWASHER ${scope.state.workerName.toUpperCase()} is ON THE WAY
          in an UBER POOL with an ETA of 9:12 AM and a COST PER HOUR of $7.00.`
        </button>
      </div>
      <button
        onClick={async () => {
          const Payload = {
            body: `Hi ${scope.state.restaurantName.toUpperCase()} MANAGER your LINE COOK ${scope.state.workerName.toUpperCase()} is ON THE WAY in an UBER POOL with an ETA of 12:02 PM and a COST PER HOUR of $7.00.`,
            phoneNumber: scope.state.managerPhoneNumber
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

          await SaveSentToDatabase(Payload, scope.state.managerName);

          scope.setState({
            managerConfirmPhoneNumberResponse: response.Payload + ""
          });
        }}
      >
        Text Uber On the Way to RESTAURANT manager ${scope.state.managerName}
      </button>

      {scope.state.transportCurrentStatus}
      {scope.state.transportSandboxBoolean}
      <button
        onClick={async () => {
          const Payload = {
            body: `Hi ${scope.state.managerForTransportStatus.managerName} your worker's uber status is ${scope.state.transportCurrentStatus} `,
            phoneNumber:
              scope.state.managerForTransportStatus.managerPhoneNumber
          };
          // console.log(Payload);

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

          let value = await lambdaPromise;

          console.log(value.Payload);
          scope.setState({ managerTransportStatusResponse: value.Payload });
        }}
      >
        Send Text with Status to Manager
      </button>
      <button
        onClick={async () => {
          const Payload = {
            emailAddress: "ejswenson@alumni.princeton.edu",
            emailSubject: "uber status",
            emailBody: `Hi your worker's uber status is ${scope.state.transportCurrentStatus}`
          };
          console.log(Payload);

          let params = {
            FunctionName: "send_email",
            InvocationType: "RequestResponse",
            LogType: "Tail",
            Payload: JSON.stringify(Payload)
          };

          var lambda = new aws.Lambda({
            region: "us-east-1"
          });
          let lambdaPromise = lambda.invoke(params).promise();

          await lambdaPromise;
        }}
      >
        Send Email with Status to Manager
      </button>
      {scope.state.managerTransportStatusResponse}
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
