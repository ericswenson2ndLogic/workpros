import React from "react";
import { publishWorkerNamePhoneNumberPaymentStrategyUsernameAndAvailability } from "./publishMessageToTopic";

import firebase from "firebase";

import Sound from "react-sound";

import Button from "@material-ui/core/Button";

import TextField from "@material-ui/core/TextField";
import { MenuItem } from "@material-ui/core";

import Select from "@material-ui/core/Select";

import ToggleButton from "@material-ui/lab/ToggleButton";
import CheckIcon from "@material-ui/icons/Check";
import { arrayOf } from "prop-types";

const aws = require("aws-sdk");

var lambda = new aws.Lambda({
  region: "us-east-1"
});

export const displayWorkerPublishOptions = scope => {
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
        <TextField
          id="standard-with-placeholder"
          label="Worker Name"
          placeholder="Eddie Murphy"
          margin="normal"
          value={scope.state.workerName}
          onChange={event => {
            scope.setState({
              workerName: event.target.value
            });
          }}
        />
        <TextField
          id="standard-with-placeholder"
          label="Worker Phone Number"
          placeholder="Eddie Murphy"
          margin="normal"
          value={scope.state.workerPhoneNumber}
          onChange={event => {
            scope.setState({
              workerPhoneNumber: event.target.value
            });
          }}
        />
      </div>
      <Button
        onClick={() => {
          for (
            let i = 0;
            i < scope.state.ArrayOfWorkersNamesAndNumbers.length;
            i++
          ) {
            console.log(scope.state.ArrayOfWorkersNamesAndNumbers[i]);
          }
        }}
      >
        Ask all workers for something{" "}
        {scope.state.ArrayOfWorkersNamesAndNumbers.map(value => {
          // console.log(value);
          return <div>a</div>;
        })}
      </Button>
      <Button
        style={{
          backgroundColor: "red"
        }}
        onClick={async () => {
          const { workerName, workerPhoneNumber } = scope.state;

          if (workerName && workerPhoneNumber) {
            const event = {
              workerName,
              workerPhoneNumber
            };
            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            var params = {
              FunctionName: "worker_name_phone_number",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(event)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let response = await lambdaPromise;
            console.log(response);

            scope.setState({
              saveWorkerNameAndPhoneNumberResponse: response.Payload
            });
          } else {
            alert("Missing Value");
          }
        }}
      >
        Save Worker Name and Phone Number
      </Button>
      {scope.state.saveWorkerNameAndPhoneNumberResponse}
      <div style={{ margin: 10 }}>
        Worker for DELETE Sorted ALPHABETICAL
        <Select
          value={scope.state.workerNameAndPhoneNumberForDeleteStringified}
          onChange={event => {
            scope.setState({
              workerNameAndPhoneNumberForDelete: JSON.parse(event.target.value),
              workerNameAndPhoneNumberForDeleteStringified: event.target.value,
              workerNameForDelete: JSON.parse(event.target.value).workerName
            });
          }}
        >
          {scope.state.workerNameAndPhoneNumberArrayAlphabetical
            .sort(function(a, b) {
              return a.workerName.localeCompare(b.workerName);
            })
            .map(workerNameAndPhoneNumberForDelete => {
              return (
                <MenuItem
                  value={JSON.stringify(workerNameAndPhoneNumberForDelete)}
                >
                  {workerNameAndPhoneNumberForDelete.workerName}{" "}
                  {workerNameAndPhoneNumberForDelete.workerPhoneNumber}
                </MenuItem>
              );
            })}
        </Select>
      </div>
      <Button
        onClick={() => {
          for (let i = 0; i < scope.state.workerUIDArray.length; i++) {
            if (
              scope.state.workerUIDArray[i].workerName ==
              scope.state.workerNameForDelete
            ) {
              firebase
                .database()
                .ref(
                  "workerNamePhoneNumber/" + scope.state.workerUIDArray[i].uid
                )
                .remove()
                .then(() => {
                  console.log("snth");
                  scope.setState({
                    workerDeleteResponse: `worker ${scope.state.workerNameForDelete} was successfully deleted`
                  });
                });
            }
          }
        }}
      >
        Delete Worker {scope.state.workerNameForDelete}
      </Button>
      <div>{scope.state.workerDeleteResponse}</div>
      <div style={{ margin: 10 }}>
        Worker for BAN LIST Sorted ALPHABETICAL
        <Select
          value={scope.state.workerNameAndPhoneNumberForBanStringified}
          onChange={event => {
            scope.setState({
              workerNameAndPhoneNumberForBan: JSON.parse(event.target.value),
              workerNameAndPhoneNumberForBanStringified: event.target.value,
              workerNameForBan: JSON.parse(event.target.value).workerName,
              workerPhoneNumberForBan: JSON.parse(event.target.value)
                .workerPhoneNumber
            });
          }}
        >
          {scope.state.workerNameAndPhoneNumberArrayAlphabetical
            .sort(function(a, b) {
              return a.workerName.localeCompare(b.workerName);
            })
            .map(workerNameAndPhoneNumberForBan => {
              return (
                <MenuItem
                  value={JSON.stringify(workerNameAndPhoneNumberForBan)}
                >
                  {workerNameAndPhoneNumberForBan.workerName}{" "}
                  {workerNameAndPhoneNumberForBan.workerPhoneNumber}
                </MenuItem>
              );
            })}
        </Select>
      </div>
      <Button
        onClick={async () => {
          // console.log("banned");

          const event = {
            workerName: scope.state.workerNameForBan,
            workerPhoneNumber: scope.state.workerPhoneNumberForBan
          };

          var lambda = new aws.Lambda({
            region: "us-east-1"
          });

          var params = {
            FunctionName: "worker_name_phone_number_banned",
            InvocationType: "RequestResponse",
            LogType: "Tail",
            Payload: JSON.stringify(event)
          };

          let lambdaPromise = lambda.invoke(params).promise();

          let response = await lambdaPromise;

          console.log(response.Payload);
          scope.setState({ responseFromBan: response.Payload });
        }}
      >
        Ban Worker {scope.state.workerNameForBan}
      </Button>
      <Button
        onClick={async () => {
          // console.log("banned");

          const event = {
            workerName: scope.state.workerNameForBan,
            workerPhoneNumber: scope.state.workerPhoneNumberForBan
          };

          var lambda = new aws.Lambda({
            region: "us-east-1"
          });

          var params = {
            FunctionName: "worker_name_phone_number_banned",
            InvocationType: "RequestResponse",
            LogType: "Tail",
            Payload: JSON.stringify(event)
          };

          let lambdaPromise = lambda.invoke(params).promise();

          let response = await lambdaPromise;

          console.log(response.Payload);
          scope.setState({ responseFromBan: response.Payload });

          for (let i = 0; i < scope.state.workerUIDArray.length; i++) {
            if (
              scope.state.workerUIDArray[i].workerName ==
              scope.state.workerNameForBan
            ) {
              firebase
                .database()
                .ref(
                  "workerNamePhoneNumber/" + scope.state.workerUIDArray[i].uid
                )
                .remove()
                .then(() => {
                  console.log("snth");
                  scope.setState({
                    workerDeleteResponse: `worker ${scope.state.workerNameForBan} was successfully deleted`
                  });
                });
            }
          }
        }}
      >
        Ban and Delete Worker {scope.state.workerNameForBan}
      </Button>
      {scope.state.responseFromBan}
      <div style={{ margin: 10 }}>
        Worker Sorted ALPHABETICAL
        <Select
          value={scope.state.workerNameAndPhoneNumberStringified}
          onChange={event => {
            scope.setState({
              workerNameAndPhoneNumber: JSON.parse(event.target.value),
              workerNameAndPhoneNumberStringified: event.target.value,
              workerName: JSON.parse(event.target.value).workerName,
              workerPhoneNumber: JSON.parse(event.target.value)
                .workerPhoneNumber
            });
          }}
        >
          {scope.state.workerNameAndPhoneNumberArrayAlphabetical.map(
            workerNameAndPhoneNumber => {
              return (
                <MenuItem value={JSON.stringify(workerNameAndPhoneNumber)}>
                  {workerNameAndPhoneNumber.workerName}{" "}
                  {workerNameAndPhoneNumber.workerPhoneNumber}
                </MenuItem>
              );
            }
          )}
        </Select>
      </div>
      <div style={{ margin: 10 }}>
        Workers in PHILADELPHIA Sorted ALPHABETICAL
        <Select
          value={scope.state.workerNameAndPhoneNumberStringified}
          onChange={event => {
            scope.setState({
              workerNameAndPhoneNumber: JSON.parse(event.target.value),
              workerNameAndPhoneNumberStringified: event.target.value,
              workerName: JSON.parse(event.target.value).workerName,
              workerPhoneNumber: JSON.parse(event.target.value)
                .workerPhoneNumber
            });
          }}
        >
          {scope.state.workerNameAndPhoneNumberArrayPhiladelphia.map(
            workerNameAndPhoneNumber => {
              return (
                <MenuItem value={JSON.stringify(workerNameAndPhoneNumber)}>
                  {workerNameAndPhoneNumber.workerName}{" "}
                  {workerNameAndPhoneNumber.workerPhoneNumber}
                </MenuItem>
              );
            }
          )}
        </Select>
      </div>
      <div style={{ margin: 10 }}>
        Workers in DALLAS Sorted ALPHABETICAL
        <Select
          value={scope.state.workerNameAndPhoneNumberStringified}
          onChange={event => {
            scope.setState({
              workerNameAndPhoneNumber: JSON.parse(event.target.value),
              workerNameAndPhoneNumberStringified: event.target.value,
              workerName: JSON.parse(event.target.value).workerName,
              workerPhoneNumber: JSON.parse(event.target.value)
                .workerPhoneNumber
            });
          }}
        >
          {scope.state.workerNameAndPhoneNumberArrayDallas.map(
            workerNameAndPhoneNumber => {
              return (
                <MenuItem value={JSON.stringify(workerNameAndPhoneNumber)}>
                  {workerNameAndPhoneNumber.workerName}{" "}
                  {workerNameAndPhoneNumber.workerPhoneNumber}
                </MenuItem>
              );
            }
          )}
        </Select>
      </div>
      <div style={{ margin: 10 }}>
        Workers in LOS ANGELES Sorted ALPHABETICAL
        <Select
          value={scope.state.workerNameAndPhoneNumberStringified}
          onChange={event => {
            scope.setState({
              workerNameAndPhoneNumber: JSON.parse(event.target.value),
              workerNameAndPhoneNumberStringified: event.target.value,
              workerName: JSON.parse(event.target.value).workerName,
              workerPhoneNumber: JSON.parse(event.target.value)
                .workerPhoneNumber
            });
          }}
        >
          {scope.state.workerNameAndPhoneNumberArrayLosAngeles.map(
            workerNameAndPhoneNumber => {
              return (
                <MenuItem value={JSON.stringify(workerNameAndPhoneNumber)}>
                  {workerNameAndPhoneNumber.workerName}{" "}
                  {workerNameAndPhoneNumber.workerPhoneNumber}
                </MenuItem>
              );
            }
          )}
        </Select>
      </div>
      <div>
        <TextField
          id="standard-with-placeholder"
          label="Worker Name"
          placeholder="Eddie Murphy"
          margin="normal"
          value={scope.state.workerName}
          onChange={event => {
            scope.setState({
              workerName: event.target.value
            });
          }}
        />
      </div>
      <div>
        Shift
        <Select
          value={scope.state.shiftForDistributionStringified}
          onChange={event => {
            const shiftForDistribution = JSON.parse(event.target.value);

            const {
              shiftAddress,
              shiftEndTimeHour,
              shiftEndTimeMeridiem,
              shiftEndTimeMinute,
              shiftJobType,
              shiftLocation,
              shiftQuantityOfWorkers,
              shiftStartDate,
              shiftStartDayName,
              shiftStartTimeHour,
              shiftStartTimeMeridiem,
              shiftStartTimeMinute,
              biddingEndTime
            } = shiftForDistribution;

            scope.setState({
              shiftForDistributionStringified: event.target.value,
              shiftAddress,
              shiftEndTimeHour,
              shiftEndTimeMinute,
              shiftEndTimeMeridiem,
              shiftJobType,
              shiftLocation,
              shiftQuantityOfWorkers,
              shiftStartDate,
              shiftStartDayName,
              shiftStartTimeHour,
              shiftStartTimeMinute,
              shiftStartTimeMeridiem,
              biddingEndTime
            });
          }}
        >
          {scope.state.shiftsForDistributionArray.map(shiftForDistribution => {
            return (
              <MenuItem value={JSON.stringify(shiftForDistribution)}>
                {shiftForDistribution.shiftAddress}{" "}
                {shiftForDistribution.shiftStartDayName}{" "}
                {shiftForDistribution.shiftQuantityOfWorkers}
              </MenuItem>
            );
          })}
        </Select>
      </div>
      <TextField
        id="standard-with-placeholder"
        label="LENGTH"
        placeholder="3 HOURS"
        margin="normal"
        value={scope.state.shiftLength}
        onChange={event => {
          scope.setState({
            shiftLength: event.target.value
          });
        }}
      />
      <div>
        LOWEST
        {textButton(
          `Hi${scope.state.losingWorkerAdditionalTitle.toUpperCase()} ${scope.state.workerName.toUpperCase()}, for the ${scope.state.shiftLength.toUpperCase()} shift on ${scope.state.shiftStartDayName.toUpperCase()} 📆 from ${
            scope.state.shiftStartTimeHour
          }:${
            scope.state.shiftStartTimeMinute
          } ${scope.state.shiftStartTimeMeridiem.toUpperCase()} to ${
            scope.state.shiftEndTimeHour
          }:${
            scope.state.shiftEndTimeMinute
          } ${scope.state.shiftEndTimeMeridiem.toUpperCase()} 🕘 at location ${scope.state.shiftAddress.toUpperCase()} 📍, the current lowest total price 💵 is $${
            scope.state.shiftLowestPayment
          } by${scope.state.workerAdditionalTitle.toUpperCase()} ${scope.state.competingWorker.toUpperCase()} 🤵. Please reply with any lower total (not per hour) dollar amount that you are willing to work for by ${scope.state.biddingEndTime.toUpperCase()} 👨‍⚖️.`,
          scope.state.workerPhoneNumber,
          scope.state.workerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        <label>COMPETING WORKER</label>

        {scope.state.competingWorker}
        <div style={{ margin: 10 }}>
          Worker Sorted ALPHABETICAL for COMPETING
          <Select
            value={scope.state.workerNameAndPhoneNumberStringified}
            onChange={event => {
              scope.setState({
                competingWorker: JSON.parse(event.target.value).workerName
              });
            }}
          >
            {scope.state.workerNameAndPhoneNumberArrayAlphabetical.map(
              workerNameAndPhoneNumber => {
                return (
                  <MenuItem value={JSON.stringify(workerNameAndPhoneNumber)}>
                    {workerNameAndPhoneNumber.workerName}{" "}
                    {workerNameAndPhoneNumber.workerPhoneNumber}
                  </MenuItem>
                );
              }
            )}
          </Select>
        </div>
      </div>
      <div>
        <TextField
          id="standard-with-placeholder"
          label="Shift Lowest Payment"
          placeholder="35$"
          margin="normal"
          value={scope.state.shiftLowestPayment}
          onChange={event => {
            scope.setState({
              shiftLowestPayment: event.target.value
            });
          }}
        />
      </div>
      <div>{scope.state.AutoRespond + ""}</div>
      <Button
        onClick={() => {
          scope.setState({ AutoRespond: !scope.state.AutoRespond });
        }}
      >
        Auto Respond to worker with NEW lowest
      </Button>
      <div>
        {scope.state.WorkerLowestArray.map(WorkerLowest => {
          return (
            <div>
              Shift Lowest Payment:
              {WorkerLowest.workerLowest.ShiftLowestPayment} Name:{" "}
              {WorkerLowest.workerLowest.WorkerName} Worker Phone Number:{" "}
              {WorkerLowest.workerLowest.WorkerPhoneNumber}
              Date and Time Updated:{" "}
              {WorkerLowest.workerLowest.dateAndTimeUpdated}
              <Button
                onClick={() => {
                  scope.setState({
                    competingWorker: WorkerLowest.workerLowest.WorkerName,
                    shiftLowestPayment:
                      WorkerLowest.workerLowest.ShiftLowestPayment
                  });
                }}
              >
                SET this WORKER as LOWEST
              </Button>
            </div>
          );
        })}
      </div>
      <Button
        onClick={async () => {
          var lambda = new aws.Lambda({
            region: "us-east-1"
          });

          const Payload = {
            WorkerName: scope.state.workerName,
            ShiftLowestPayment: scope.state.shiftLowestPayment,
            WorkerPhoneNumber: scope.state.workerPhoneNumber
          };

          var params = {
            FunctionName: "worker_lowest",
            InvocationType: "RequestResponse",
            LogType: "Tail",
            Payload: JSON.stringify(Payload)
          };

          let lambdaPromise = lambda.invoke(params).promise();

          let value = await lambdaPromise;
        }}
      >
        SAVE {scope.state.workerName} as CURRENT lowest at{" "}
        {scope.state.shiftLowestPayment} with phone number{" "}
        {scope.state.workerPhoneNumber}
      </Button>
      <div>
        WINNING 🥇
        {textButton(
          `Hi${scope.state.workerAdditionalTitle} ${scope.state.workerName}, for the ${scope.state.shiftLength} shift on ${scope.state.shiftStartDayName} 📆 at ${scope.state.shiftStartTimeHour}:${scope.state.shiftStartTimeMinute} ${scope.state.shiftStartTimeMeridiem} 🕒 at location ${scope.state.shiftAddress} 📍 you are winning 🥇 with $${scope.state.shiftLowestPayment}. The opportunity to submit a lower rate ends at ${scope.state.biddingEndTime} at which point in time your bid will be sent to the manager for approval.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName}`,
          scope
        )}
      </div>
      <Button
        onClick={() => {
          firebase
            .database()
            .ref("/workerLowest/")
            .remove()
            .then(() => {
              alert("deleted successfully");
            });
        }}
      >
        Delete all WORKERS and LOWEST
      </Button>
      <div>
        {scope.state.CompetingWorkersArray.map(function(WorkerLowest, index) {
          return (
            <div>
              Name: {WorkerLowest.workerLowest.WorkerName} Worker Phone Number:{" "}
              {WorkerLowest.workerLowest.WorkerPhoneNumber}
              Date and Time Updated:{" "}
              {WorkerLowest.workerLowest.dateAndTimeUpdated}
              <Button
                style={{ backgroundColor: "red" }}
                onClick={event => {
                  const WorkerName = WorkerLowest.workerLowest.WorkerName;

                  const WorkerPhoneNumber =
                    WorkerLowest.workerLowest.WorkerPhoneNumber;

                  let found = false;
                  let foundKey = "";
                  // u;
                  for (let key in scope.state
                    .ArrayOfWorkersNamesAndNumbersCompeting) {
                    if (
                      scope.state.ArrayOfWorkersNamesAndNumbersCompeting[key]
                        .WorkerName == WorkerName
                    ) {
                      foundKey = key;
                      found = true;
                      break;
                    }
                  }

                  if (found) {
                    let NewArrayOfWorkersNamesAndNumbersCompeting = [];

                    for (let key in scope.state
                      .ArrayOfWorkersNamesAndNumbersCompeting) {
                      if (
                        scope.state.ArrayOfWorkersNamesAndNumbersCompeting[key]
                          .WorkerName == WorkerName
                      ) {
                      } else {
                        NewArrayOfWorkersNamesAndNumbersCompeting.push(
                          scope.state.ArrayOfWorkersNamesAndNumbersCompeting[
                            key
                          ]
                        );
                      }
                    }

                    scope.setState({
                      ArrayOfWorkersNamesAndNumbersCompeting: NewArrayOfWorkersNamesAndNumbersCompeting
                    });

                    console.log(
                      scope.state.ArrayOfWorkersNamesAndNumbersCompeting
                    );
                  } else {
                    let NewArrayOfWorkersNamesAndNumbersCompeting = [
                      ...scope.state.ArrayOfWorkersNamesAndNumbersCompeting,
                      { WorkerName, WorkerPhoneNumber }
                    ];

                    scope.setState({
                      ArrayOfWorkersNamesAndNumbersCompeting: NewArrayOfWorkersNamesAndNumbersCompeting
                    });
                    console.log(
                      scope.state.ArrayOfWorkersNamesAndNumbersCompeting
                    );
                  }
                }}
              >
                SET for TEXT
              </Button>
            </div>
          );
        })}
      </div>
      <div>
        {scope.state.ArrayOfWorkersNamesAndNumbersCompeting.map(value => {
          console.log(value);
          return <div> {value.WorkerName} </div>;
        })}
      </div>
      {scope.state.playDrum1 && (
        <Sound
          url={require("./Drum1.mp3")}
          playStatus={Sound.status.PLAYING}
          onLoading={() => {
            console.log("snth");
          }}
          onPlaying={() => {}}
          onFinishedPlaying={() => {}}
          loop={false}
        />
      )}
      {scope.state.playDrum3 && (
        <Sound
          url={require("./Drum3.mp3")}
          playStatus={Sound.status.PLAYING}
          onLoading={() => {
            console.log("snth");
          }}
          onPlaying={() => {}}
          onFinishedPlaying={() => {}}
          loop={false}
        />
      )}
      <Button
        onClick={async () => {
          scope.setState({ playDrum1: !scope.state.playDrum1 });
          let count = 0;
          let interval = setInterval(() => {
            count++;

            if (count == 4) {
              scope.setState({ playDrum1: !scope.state.playDrum1 });
              clearInterval(interval);
            }
          }, 1000);

          for (
            let i = 0;
            i < scope.state.ArrayOfWorkersNamesAndNumbersCompeting.length;
            i++
          ) {
            const Worker =
              scope.state.ArrayOfWorkersNamesAndNumbersCompeting[i];

            const Payload = {
              body: `✋ Hi${scope.state.losingWorkerAdditionalTitle} ${Worker.WorkerName} 🤵, for the work on ${scope.state.shiftStartDayName} at ${scope.state.shiftStartTimeHour}:${scope.state.shiftStartTimeMinute} ${scope.state.shiftStartTimeMeridiem} at location ${scope.state.shiftAddress} 📍, the current lowest total price is $${scope.state.shiftLowestPayment} by${scope.state.workerAdditionalTitle} ${scope.state.competingWorker}. Please reply with any lower total 💰 dollar amount that you are willing to work for by ${scope.state.biddingEndTime} 🕔.`,
              phoneNumber: Worker.WorkerPhoneNumber
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
          }
        }}
      >
        send `Hi${scope.state.losingWorkerAdditionalTitle.toUpperCase()}{" "}
        Worker.WorkerName.toUpperCase(), for the shift on $
        {scope.state.shiftStartDayName.toUpperCase()} at $
        {scope.state.shiftStartTimeHour}:${scope.state.shiftStartTimeMinute} $
        {scope.state.shiftStartTimeMeridiem.toUpperCase()} at location $
        {scope.state.shiftAddress.toUpperCase()}, the current LOWEST TOTAL PRICE
        is $${scope.state.shiftLowestPayment} by$
        {scope.state.workerAdditionalTitle.toUpperCase()} $
        {scope.state.competingWorker.toUpperCase()}. Please reply with any LOWER
        TOTAL dollar amount that you are willing to work for by $
        {scope.state.biddingEndTime.toUpperCase()}.`
      </Button>
      <Button
        onClick={() => {
          scope.setState({ playDrum1: !scope.state.playDrum1 });
          let count = 0;
          let interval = setInterval(() => {
            count++;

            if (count == 4) {
              scope.setState({ playDrum1: !scope.state.playDrum1 });
              clearInterval(interval);
            }
          }, 1000);

          for (
            let i = 0;
            i < scope.state.ArrayOfWorkersNamesAndNumbersCompeting.length;
            i++
          ) {
            const Worker =
              scope.state.ArrayOfWorkersNamesAndNumbersCompeting[i];

            const Payload = {
              body: `✋ Hi${scope.state.losingWorkerAdditionalTitle.toUpperCase()} ${Worker.WorkerName.toUpperCase()} 🤵, you may have lost this time, but better luck next time a shift is available.`,

              phoneNumber: Worker.WorkerPhoneNumber
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
          }
        }}
      >
        `✋ Hi${scope.state.losingWorkerAdditionalTitle} ${Worker.WorkerName}{" "}
        🤵, you have lost to a lower bidder this time, the more you compete and
        the lower the price, the more opportunities you will have in the future,
        as restaurants will increasingly use this service.`
      </Button>
      <div>
        SECONDARY WORDING of BEST PRICE
        {textButton(
          `✋ Hi ${scope.state.workerName} 🤵, for the 1 position on ${scope.state.shiftStartDayName} at ${scope.state.shiftStartTimeHour}:${scope.state.shiftStartTimeMinute} ${scope.state.shiftStartTimeMeridiem} at location ${scope.state.shiftAddress} 📍, you must have the lowest total price 💰. Your lowest must be less than $${scope.state.shiftLowestPayment} which is the lowest of competing 🆚 WorkPro ${scope.state.competingWorker}.`,
          scope.state.workerPhoneNumber,
          scope.state.workerName,
          scope
        )}
      </div>
      <div>
        TERTIARY WORDING of BEST PRICE
        {textButton(
          `✋ Hi ${scope.state.workerName} 🤵, for the 1 position on ${
            scope.state.shiftStartDayName
          } at ${scope.state.shiftStartTimeHour}:${
            scope.state.shiftStartTimeMinute
          } ${scope.state.shiftStartTimeMeridiem} at location ${
            scope.state.shiftAddress
          } 📍, you must have the lowest total price by at least 1 dollar 💰. Your lowest must be at most $${parseInt(
            scope.state.shiftLowestPayment
          ) -
            1} which is one dollar less than the current lowest of competing 🆚 WorkPro ${
            scope.state.competingWorker
          }.`,
          scope.state.workerPhoneNumber,
          scope.state.workerName,
          scope
        )}
      </div>
      <div>
        UPDATED TIME 🤵
        {textButton(
          `✋ Hi ${scope.state.workerName} the new updated time of the shift is from ${scope.state.shiftStartTimeHour}:${scope.state.shiftStartTimeMinute} ${scope.state.shiftStartTimeMeridiem} to ${scope.state.shiftEndTimeHour}:${scope.state.shiftEndTimeMinute} ${scope.state.shiftEndTimeMeridiem}.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName}`,
          scope
        )}
      </div>
      <div>
        LOWEST TOTAL 🤵
        {textButton(
          `✋ Hi ${scope.state.workerName} please reply with the lowest total amount, not per hour amount.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName}`,
          scope
        )}
      </div>
      <div>
        BID still ok after UPDATED TIME 🤵
        {textButton(
          `✋ Hi ${scope.state.workerName} given the new updated time of the shift is from ${scope.state.shiftStartTimeHour}:${scope.state.shiftStartTimeMinute} ${scope.state.shiftStartTimeMeridiem} to ${scope.state.shiftEndTimeHour}:${scope.state.shiftEndTimeMinute} ${scope.state.shiftEndTimeMeridiem} are you still ok with your bid of ${scope.state.shiftLowestPayment}? Please reply with YES 👍 or NO 👎.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        BID ok because BACK OUT 🤵
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} you are the winner with ${
            scope.state.shiftLowestPayment
          }. Does this work for you? Please reply with YES 👍 or NO 👎.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        USER NAME 🤵
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} please reply with a user name 🤵 to receive texts 🤳 about dishwasher 🍽, busser 🦵 or prep and line cook 👨‍🍳 opportunities from WorkPros.io 😁.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        REPEATER INTERVAL: VALUE in MINUTES 🔈
        <Button
          onClick={() => {
            scope.setState({ runningInterval: true });
          }}
        >
          START
        </Button>
        <Select
          value={scope.state.repeaterInterval}
          onChange={event => {
            scope.setState({ repeaterInterval: event.target.value });
          }}
        >
          <MenuItem value="0.5">Each 30 Seconds</MenuItem>
          <MenuItem value="1">Each Minute</MenuItem>
          <MenuItem value="5">Each 5 Minutes</MenuItem>
        </Select>
        <Button
          onClick={() => {
            clearInterval(scope.state.intervalId);

            scope.setState({ runningInterval: false });
          }}
        >
          STOP
        </Button>
        {scope.state.runningInterval && (
          <div>INTERVAL RUNNING for {scope.state.repeaterInterval}</div>
        )}
      </div>
      {scope.state.intervalCountdown}
      <div>
        FULL NAME 🤵
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} please reply with your first and last name 🤵 to receive texts 🤳 about dishwasher 🍽, busser 🦵 and prep or line cook 👨‍🍳 opportunities from WorkPros.io 😁.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        CITY 🤵
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} please reply with your city name.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        LAST NAME
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} please reply with your last name 🤵 to receive texts 🤳 about dishwasher 🍽, busser 🦵 and prep or line cook 👨‍🍳 opportunities from WorkPros.io 😁.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        CONFIRM
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} please confirm this is your phone number 📱 by replying with YES 👍 or NO 👎.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        EMAIL 📧
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()} please reply with your email address 📧 if you have one, or NO if you don't have an email or prefer not to receive emails.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        ROLE
        {textButton(
          `✋ Hi dishwasher (chef plongeur) or busser (chef de rang) or prep cook or line cook (sous chef) ${scope.state.workerName.toUpperCase()} please reply with your preferred roles.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        SOUS CHEF STATIONS 👨‍🍳
        {textButton(
          `✋ Hi sous chef ${scope.state.workerName.toUpperCase()} please reply with your preferred sous chef 👨‍🍳 stations. Experience with fish 🐟 (poissonnier). Experience with meat 🐄 (RÔTISSEUR). Experience with the grill (grillardin). Experience with frying 🌋 (friturier). Experience with soup 🍲 (potager). Experience with vegetables 🥒 (légumier). Experience with sauté 🥘 (saucier).`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        PAYMENT APP 🏦
        {textButton(
          `✋ Hi${scope.state.workerAdditionalTitle.toUpperCase()} ${scope.state.workerName.toUpperCase()} please reply with your (or a FRIEND'S or RELATIVE'S) preferred MOBILE PAYMENT APP 📱 where you would like to RECEIVE payment 🏦. Please respond with PAYPAL, VENMO, CASH APP or CASH. `,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        PAYMENT STRATEGY USERNAME
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} please reply with your USERNAME, PHONE NUMBER or EMAIL for ${scope.state.workerPaymentStrategy.toUpperCase()} where you would like to RECEIVE PAYMENT 💵. If it's the same as the EMAIL or PHONE NUMBER you've already provided, please reply with SAME.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
        <Select
          value={scope.state.workerPaymentStrategy}
          onChange={event => {
            scope.setState({ workerPaymentStrategy: event.target.value });
          }}
        >
          <MenuItem value="PayPal">PayPal</MenuItem>
          <MenuItem value="Venmo">Venmo</MenuItem>
          <MenuItem value="CashApp">CashApp</MenuItem>
          <MenuItem value="Cash">Cash</MenuItem>
        </Select>
      </div>
      <div>
        LINKS
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, please connect your bank account to paypal at ${"https://www.paypal.com/us/home".toUpperCase()}, venmo at ${"https://venmo.com/".toUpperCase()} or cashapp at ${"https://cash.app/".toUpperCase()} for payment the day after your shift. Please reply to this text with your username or email.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        DAYS and TIMES AVAILABLE
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} please reply with the days and times that you are available.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <Select
        value={scope.state.timeLength}
        onChange={event => {
          scope.setState({ timeLength: event.target.value });
        }}
      >
        <MenuItem value="For One Day">For One Day</MenuItem>
        <MenuItem value="For One Hour">For One Hour</MenuItem>
        <MenuItem value="Indefinitely">Indefinitely</MenuItem>
      </Select>
      <div>
        YELLOW CARD ⚠️
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, you have been issued a yellow card warning ⚠️ from WorkPros.io. Don't worry there are no significant consequences yet, but after enough yellow cards are issued a red card/permanent ban may result.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        PERMANENT BAN ⛔ ️️
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, you have been permanently banned ⛔️ from WorkPros.io.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        PAYMENT 💰
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, WorkPros.io pays 💰 pros 🤵 the day after 📆 the work.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        PICKUP ADDRESS 📍
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} please reply with the address 🏠 of a convenient pickup location for an uber pool 🚖 to take you to your shifts.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        PICKUP ADDRESS 🏠
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, is the ADDRESS 🏠 ${scope.state.workerAddress.toUpperCase()} for an uber pool 🚖 to take you to your shifts still correct? please reply with yes or no.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        PUBLIC 🚎 or PRIVATE 🚗
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} do you plan on using PUBLIC TRANSPORT 🚎 or your OWN CAR  🚗? Please reply with PUBLIC or PRIVATE.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        <TextField
          id="standard-with-placeholder"
          label="Public Transport URL"
          placeholder="Eddie Murphy"
          margin="normal"
          value={scope.state.publicTransportURL}
          onChange={event => {
            scope.setState({
              publicTransportURL: event.target.value
            });
          }}
        />
      </div>
      <div>
        PUBLIC 🚎
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} your PUBLIC TRANSPORT 🚎 information is available here: ${
            scope.state.publicTransportURL
          }.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        CANCEL
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, if you can no longer make it to your shift ON TIME, please reply with CANCEL. If you REPLY with CANCEL before the SHIFT STARTS, there is NO penalty. If you DON'T reply, you will receive a YELLOW CARD WARNING, and will next receive a RED CARD PERMANENT BAN.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div style={{ flexDirection: "column" }}>
        <div>
          Worker LOCATION
          {!scope.state.workerLocation.workerAddress && (
            <TextField
              type="text"
              value={scope.state.workerAddress}
              onChange={event => {
                scope.setState({
                  workerAddress: event.target.value
                });
                scope.findWorkerAddresses(event.target.value);
              }}
            />
          )}
          {!scope.state.workerLocation.workerAddress &&
            scope.state.workerAddresses.length > 0 &&
            scope.state.workerAddresses.map(address => {
              return (
                <div>
                  <Button
                    onClick={() => {
                      scope.handleWorkerAddressClick(address);
                    }}
                  >
                    {address.formatted_address}
                  </Button>
                </div>
              );
            })}
        </div>
        <div>
          {scope.state.workerLocation.workerAddress &&
            scope.state.workerLocation.workerAddress}
        </div>
      </div>
      <div>
        <Button
          onClick={async () => {
            let lambda = new aws.Lambda({
              region: "us-east-1"
            });
            const Payload = {
              origins: [scope.state.shiftAddress],
              destinations: [scope.state.workerLocation.workerAddress]
            };
            let params = {
              FunctionName: "get_distances",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(Payload)
            };
            let lambdaPromise = lambda.invoke(params).promise();
            let value = await lambdaPromise;

            let distanceValue = JSON.parse(value.Payload)[0].distance.value;

            let durationValue = JSON.parse(value.Payload)[0].duration.value;

            let kilometers = parseInt(distanceValue) / 1000;

            let miles = parseInt(kilometers) * 0.621371;

            let hours = "";
            let minutes = parseInt(durationValue) / 60;

            scope.setState({
              distance: value.Payload,
              estimatedCost:
                "estimated price is 0.2 * minutes + 0.8 * miles" +
                ": " +
                (minutes * 0.2 + miles * 0.8)
            });
          }}
        >
          Get Distance from WORKER LOCATION{" "}
          {scope.state.workerLocation &&
            scope.state.workerLocation.workerAddress}{" "}
          to RESTAURANT LOCATION {scope.state.shiftAddress}
          {scope.state.estimatedCost && scope.state.estimatedCost}
        </Button>
      </div>
      <div>{scope.state.distance}</div>
      <div>
        <TextField
          id="standard-with-placeholder"
          label="Total Transport Cost"
          placeholder="40.07"
          margin="normal"
          value={scope.state.totalTransportCost}
          onChange={event => {
            scope.setState({
              totalTransportCost: event.target.value
            });
          }}
        />
      </div>
      <div>
        <Button
          onClick={async () => {
            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            const Payload = {
              workerName: scope.state.workerName,
              workerPhoneNumber: scope.state.workerPhoneNumber,
              transportCost: scope.state.totalTransportCost
            };

            var params = {
              FunctionName: "worker_name_phone_number_transport_cost",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(Payload)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let value = await lambdaPromise;
          }}
        >
          Save Worker Name {scope.state.workerName}, Phone Number{" "}
          {scope.state.workerPhoneNumber} and Transport Cost{" "}
          {scope.state.totalTransportCost} to Firebase
        </Button>
      </div>
      <div style={{ margin: 10 }}>
        Worker with Transport Cost
        <Select
          value={scope.state.workerNameAndPhoneNumberStringified}
          onChange={event => {
            scope.setState({
              totalTransportCost: JSON.parse(event.target.value).transportCost
            });
          }}
        >
          {scope.state.workerNamePhoneNumberTransportCostArrayAlphabetical.map(
            workerNamePhoneNumberTransportCost => {
              return (
                <MenuItem
                  value={JSON.stringify(workerNamePhoneNumberTransportCost)}
                >
                  {workerNamePhoneNumberTransportCost.workerName}{" "}
                  {workerNamePhoneNumberTransportCost.workerPhoneNumber}
                  {workerNamePhoneNumberTransportCost.transportCost}
                </MenuItem>
              );
            }
          )}
        </Select>
      </div>
      <div>
        SHARE LOCATION ANDROID 🗺
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, share your location until you ARRIVE at the SHIFT in order for us to determine you START and END time AUTOMATICALLY so that you can receive PAYMENT 💰. Go to the following URL: https://support.google.com/maps/answer/7326816?co=GENIE.Platform%3DAndroid&hl=en 📜 and share "IF THEY HAVE A GOOGLE ACCOUNT" with WORKPROSIO@GMAIL.COM for INDEFINITELY.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        SHARE LOCATION SUCCESS 📍
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} your location is SUCCESSFULLY being shared. PLEASE SHARE from NOW until the END of the shift to ensure CORRECT PAYMENT 💰 for HOURS WORKED.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        IPHONE or ANDROID 📱
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, do you have an IPHONE or ANDROID?`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <Select
        value={scope.state.timeLength}
        onChange={event => {
          scope.setState({ timeLength: event.target.value });
        }}
      >
        <MenuItem value="For One Day">For One Day</MenuItem>
        <MenuItem value="For One Hour">For One Hour</MenuItem>
        <MenuItem value="Indefinitely">Indefinitely</MenuItem>
      </Select>
      <div>
        SHARE iphone ADDRESS
        {textButton(
          `Please follow the following steps until you arrive at the ADDRESS 📍 for your SHIFT. If you do NOT, you will NOT be payed 💰. 1. Launch the Contacts App. On the iPhone 📱 you can alternately use the Phone App if you prefer. 2. Use the + Button to add the contact WORKPROS with phone number 7578176517 and now tap on Share My Location. 3. Tap on Share ${scope.state.timeLength.toUpperCase()}.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        AGREE TO SHARE LOCATION ONCE ON WAY
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, do you agree to share location 🚩 once YOU 👨‍💼 are ON THE WAY 🚎/🚗 to the restaurant 📍? Please reply with YES 👍 or NO 👎.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        Turn on iphone Location Sharing
        {textButton(
          `Please turn on Location Sharing for Find My Friends. 1. Go to Settings -> Privacy -> Location Services and turn on. 2  Go to Find Friends -> While Using. You may also need to correct the date on your device by going to Settings -> General -> Date & Time. Please be sure the device is on and is connected to cellular data or Wi-Fi. Please ensure you have turned off Hide My Location in Find Friends. Please also be signed into Find Friends on the device being located.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        Turn on iphone Location Sharing
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, share your location until you ARRIVE at the SHIFT in order for us to determine you START and END time AUTOMATICALLY so that you can receive PAYMENT 💰. Go to the following URL: https://support.apple.com/kb/PH19426?locale=en_US&viewlocale=en_US 📜 and share with 7578176517 ${scope.state.timeLength.toUpperCase()}.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        DOWNLOAD find friends
        {textButton(
          `Please download Find Friends from the App Store.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        TEST share address
        {textButton(
          `Please TEST the following to ensure that your address may be shared on the DAY of the shift. On the day of the shift YOU will be required to share your location in order to RECEIVE PAYMENT. If you do NOT, you will NOT be payed. 1. Add the gmail address workprosio@gmail.com. 2. On your ANDROID, open the GOOGLE MAPS app and SIGN IN. 3. Tap Menu, then tap Location Sharing, then tap Add people. 4. Choose to share your location for ${scope.state.timeLength.toUpperCase()}. 5. Tap Select People. If you're asked about your contacts, give Google Maps access. 6. Choose who you want to share with. 7. Tap Share.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        Restaurant ADDRESS
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, the restaurant address is ${scope.state.shiftAddress.toUpperCase()} and is called ${scope.state.restaurantName.toUpperCase()}.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        CELLULAR DATA 🛰
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, do you have CELLULAR DATA? Please reply with UNLIMITED, the LIMIT in MB or NO.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        INSTAGRAM
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, do you have an INSTAGRAM? If YES, please reply with your USERNAME for a FOLLOW from WORKPROS. If NOT, or you would prefer NOT TO SHARE, please reply with NO.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        DESCRIPTION
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, WorkPros.io is a competitive all male restaurant staffing service which helps MATCH you with shifts and PAYS you AUTOMATICALLY the DAY AFTER your SHIFT. We work with different RESTAURANTS in your CITY.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        DRESS AND APPEARANCE 👨‍💼
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()}, please dress as NICELY as possible and comfortable 👨‍💼 for work on your feet, but don't worry about it. If it's convenient and you have time please SHOWER 🛁 and SHAVE. Close toed WORK SHOES 👞/👟 are the only requirement.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>🚌 TRANSPORT 🚖</div>
      <div>
        NO SHARE 📍
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} because you have not shared your location, you are required to take an UBER in order to ensure reliability. Please respond with YES 👍 or NO 👎 is response to this change.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        DIFFERENT PICKUP ADDRESS 📍
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} please reply with the ADDRESS 📍 of a DIFFERENT PICKUP LOCATION for an UBER to take you to your SHIFTS.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        ASK if READY ☝️
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, are you READY ☝️ for your UBER 🚖? Please reply with YES 👍 whenever YOU are ready.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        <TextField
          id="standard-with-placeholder"
          label="More Competitive Worker"
          placeholder="Darius Black"
          margin="normal"
          value={scope.state.moreCompetitiveWorker}
          onChange={event => {
            scope.setState({
              moreCompetitiveWorker: event.target.value
            });
          }}
        />
      </div>
      <div>
        SHIFT TAKEN
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} the previous SHIFT offered was taken by ${scope.state.moreCompetitiveWorker.toUpperCase()} who will be PAID TOMORROW, because he was willing to work for a LOWER RATE at $${
            scope.state.shiftLowestPayment
          } PER HOUR.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        WHO you BEAT
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} to WIN the SHIFT you SUCCESSFULLY OUT-BID the following WorkPros ${scope.state.whoYouBeat.toUpperCase()}${scope.state.ArrayOfWorkersNamesAndNumbersCompeting.map(
            function(worker) {
              return worker["WorkerName"];
            }
          ).join(" 👨‍💼 , ")}.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        UBER CALLED 🔔
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, your UBER POOL has been CALLED 🔔, please wait OUTSIDE.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        <TextField
          id="standard-with-placeholder"
          label="Car"
          placeholder="Toyota Camry"
          margin="normal"
          value={scope.state.car}
          onChange={event => {
            scope.setState({
              car: event.target.value
            });
          }}
        />

        <TextField
          id="standard-with-placeholder"
          label="License"
          placeholder="95VC324"
          margin="normal"
          value={scope.state.license}
          onChange={event => {
            scope.setState({
              license: event.target.value
            });
          }}
        />
      </div>
      <div>
        UBER CALLED
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, your CAR is a ${scope.state.car.toUpperCase()} with LICENSE plate ${scope.state.license.toUpperCase()}.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        <TextField
          id="standard-with-placeholder"
          label="Arriving In"
          placeholder="1 Minute"
          margin="normal"
          value={scope.state.arrivingIn}
          onChange={event => {
            scope.setState({
              arrivingIn: event.target.value
            });
          }}
        />
      </div>
      <div>
        ARRIVING IN
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, your UBER is ARRIVING in ${scope.state.arrivingIn.toUpperCase()} MINUTES.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        PUBLIC TRANSPORT ARRIVING IN
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, your PUBLIC TRANSPORT is ARRIVING in ${scope.state.arrivingIn.toUpperCase()} MINUTES.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        UBER ARRIVED 👨‍✈️
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()}, your UBER 👨‍✈️ has ARRIVED and is a ${scope.state.car.toUpperCase()} 🚖 with LICENSE plate ${scope.state.license.toUpperCase()} and is LEAVING SOON.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        LOCATION CALLING UBER TO
        {textButton(
          `✋ Hi ${scope.state.workerName.toUpperCase()} your UBER is being called to ${
            scope.state.workerAddress
          } NOW and will be ARRIVING SOON, please be ready OUTSIDE.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>PAY</div>
      <div>
        BIDDING END TIME
        <TextField
          value={scope.state.biddingEndTime}
          onChange={event => {
            scope.setState({ biddingEndTime: event.target.value });
          }}
        />
      </div>
      <div>
        READY TIME
        <TextField
          value={scope.state.readyTime}
          onChange={event => {
            scope.setState({ readyTime: event.target.value });
          }}
        />
      </div>
      <div>
        CONGRATULATIONS
        {textButton(
          `CONGRATULATIONS`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      FINALIZED SCHEDULING
      <div>
        {textButton(
          `You are the WINNER 🏆 ${scope.state.workerName.toUpperCase()}, your scheduling is FINALIZED. Please be ready by ${
            scope.state.shiftStartTimeHour == 1
              ? 12
              : scope.state.shiftStartTimeHour - 1
          }:${scope.state.shiftStartTimeMinute} ${
            scope.state.shiftStartTimeMeridiem
          } ${scope.state.readyTime.toUpperCase()}`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      BID APPROVED
      <div>
        {textButton(
          `${scope.state.workerName.toUpperCase()}, your final bid of ${
            scope.state.shiftLowestPayment
          } has been approved. Please be ready by ${
            scope.state.shiftStartTimeHour == 1
              ? 12
              : scope.state.shiftStartTimeHour - 1
          }:${scope.state.shiftStartTimeMinute} ${
            scope.state.shiftStartTimeMeridiem
          } ${scope.state.readyTime.toUpperCase()}`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      ON THE WAY FIRST
      <div>
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()} after 1 SHIFT, you will START in BRONZE 🥉 with a RANKING in STARS 🎖 based on your PERFORMANCE. Please inform the KITCHEN of ${scope.state.restaurantName.toUpperCase()} that you have arrived on behalf of WORKPROS.IO. Please refer to all team members as SIR. Please work as HARD and as PROFESSIONALLY as POSSIBLE. Please do not get ANGRY 🤬 for ANY reason. The OWNER/EXECUTIVE CHEF is named ${
            scope.state.managerName
          } and is available at ${scope.state.managerPhoneNumber}.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div style={{ margin: 10 }}>
        Worker Key Value Pairs
        <Select
          value={scope.state.workerNameAndPhoneNumberStringified}
          onChange={event => {
            scope.setState({
              workerNameAndPhoneNumber: JSON.parse(event.target.value),
              workerNameAndPhoneNumberStringified: event.target.value,
              workerName: JSON.parse(event.target.value).workerName,
              workerPhoneNumber: JSON.parse(event.target.value)
                .workerPhoneNumber
            });
          }}
        >
          {scope.state.workerNameAndPhoneNumberAndShiftCountArray
            .sort(function(a, b) {
              // console.log(a);
              return a.workerName.localeCompare(b.workerName);
            })
            .map(workerNameAndPhoneNumberAndShiftCount => {
              return (
                <MenuItem
                  value={JSON.stringify(workerNameAndPhoneNumberAndShiftCount)}
                >
                  {workerNameAndPhoneNumberAndShiftCount.workerName}{" "}
                  {workerNameAndPhoneNumberAndShiftCount.workerPhoneNumber}{" "}
                  {workerNameAndPhoneNumberAndShiftCount.key}{" "}
                  {JSON.stringify(workerNameAndPhoneNumberAndShiftCount.value)}{" "}
                </MenuItem>
              );
            })}
        </Select>
      </div>
      <Select
        value={scope.state.workerLanguage}
        onChange={event => {
          scope.setState({ workerLanguage: event.target.value });
        }}
      >
        <MenuItem value="Spanish">Spanish</MenuItem>
      </Select>
      <Button
        style={{
          backgroundColor: "red"
        }}
        onClick={async () => {
          const { workerName, workerPhoneNumber, workerLanguage } = scope.state;

          if (workerName && workerPhoneNumber && workerLanguage) {
            const event = {
              workerName,
              workerPhoneNumber,
              key: "workerLanguage",
              value: workerLanguage
            };

            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            var params = {
              FunctionName: "worker_name_phone_number_key_value",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(event)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let response = await lambdaPromise;

            scope.setState({ saveWorkerEmailResponse: response.Payload });
          } else {
            alert("Missing Value");
          }
        }}
      >
        Save Worker language {scope.state.workerLanguage} for{" "}
        {scope.state.workerName}
      </Button>
      <Button
        onClick={() => {
          console.log("snth");

          let stringOfEmails = "";

          for (
            let i = 0;
            i < scope.state.workerNameAndPhoneNumberAndShiftCountArray.length;
            i++
          ) {
            console.log(
              scope.state.workerNameAndPhoneNumberAndShiftCountArray[i]
            );

            let workerFact =
              scope.state.workerNameAndPhoneNumberAndShiftCountArray[i];

            if (workerFact.key == "workerEmail") {
              console.log(workerFact.value);

              if (workerFact.value != "no") {
                stringOfEmails += ", " + workerFact.value;
              }
            }
          }

          const event = {
            manager: true,
            name: scope.state.restaurantName,
            prices: [
              scope.state.shiftStartASAPTodayTomorrowOther +
                " " +
                scope.state.shiftStartDateMonth +
                "/" +
                scope.state.shiftStartDateDay +
                "/" +
                scope.state.shiftStartDateYear,
              scope.state.shiftStartTimeHour +
                ":" +
                scope.state.shiftStartTimeMinute +
                " " +
                scope.state.shiftStartTimeMeridiem,
              scope.state.shiftEndTimeHour +
                ":" +
                scope.state.shiftEndTimeMinute +
                " " +
                scope.state.shiftEndTimeMeridiem,
              scope.state.restaurantLocation.restaurantAddress,
              scope.state.shiftJobType,
              "Close Toed Shoes" + scope.state.safeHandlersRequired,
              scope.state.biddingEndTime
            ],
            ubers: [],
            items: [
              "Shift Date",
              "Shift Start Time",
              "Shift End Time",
              "Restaurant Address",
              "Work Type",
              "Requirements",
              "Bidding End Time"
            ],
            receiptId: Math.round(Math.random() * 10000),
            emailAddress: stringOfEmails,
            emailSubject: "WorkPros.io Receipt",
            emailBody: `
              
                    `,
            shiftLowestPayment: scope.state.shiftLowestPayment
          };

          console.log(event);

          var uri = `https://thawing-refuge-24509.herokuapp.com/distribute?jsonObj=${JSON.stringify(
            event
          )}`;

          window.open(uri);
        }}
      >
        Distribute Shift via Email
      </Button>
      <div style={{ margin: 10 }}>
        Worker Sorted ALPHABETICAL
        <Select
          value={scope.state.workerNameAndPhoneNumberStringified}
          onChange={event => {
            scope.setState({
              workerNameAndPhoneNumber: JSON.parse(event.target.value),
              workerNameAndPhoneNumberStringified: event.target.value,
              workerName: JSON.parse(event.target.value).workerName,
              workerPhoneNumber: JSON.parse(event.target.value)
                .workerPhoneNumber
            });
          }}
        >
          {scope.state.workerNameAndPhoneNumberArrayAlphabetical.map(
            workerNameAndPhoneNumber => {
              return (
                <MenuItem value={JSON.stringify(workerNameAndPhoneNumber)}>
                  {workerNameAndPhoneNumber.workerName}{" "}
                  {workerNameAndPhoneNumber.workerPhoneNumber}
                </MenuItem>
              );
            }
          )}
        </Select>
      </div>
      <Button
        style={{
          backgroundColor: "red"
        }}
        onClick={async () => {
          const { workerName, workerPhoneNumber, workerEmail } = scope.state;

          if (workerName && workerPhoneNumber && workerEmail) {
            const event = {
              workerName,
              workerPhoneNumber,
              key: "workerEmail",
              value: workerEmail
            };

            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            var params = {
              FunctionName: "worker_name_phone_number_key_value",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(event)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let response = await lambdaPromise;

            scope.setState({ saveWorkerEmailResponse: response.Payload });
          } else {
            alert("Missing Value");
          }
        }}
      >
        Save Worker EMAIL {scope.state.workerEmail} for {scope.state.workerName}
      </Button>
      Worker Email
      <TextField
        value={scope.state.workerEmail}
        onChange={event => {
          scope.setState({ workerEmail: event.target.value });
        }}
      />
      {scope.state.saveWorkerEmailResponse}
      <Button
        style={{
          backgroundColor: "red"
        }}
        onClick={async () => {
          const { workerName, workerPhoneNumber } = scope.state;

          if (workerName && workerPhoneNumber) {
            const event = {
              workerName,
              workerPhoneNumber,
              key: "shiftCount",
              value: "1"
            };

            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            var params = {
              FunctionName: "worker_name_phone_number_key_value",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(event)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let response = await lambdaPromise;
          } else {
            alert("Missing Value");
          }
        }}
      >
        Save Worker SHIFT COUNT +1 for {scope.state.workerName}
      </Button>
      <Button
        style={{
          backgroundColor: "red"
        }}
        onClick={async () => {
          const {
            workerName,
            workerPhoneNumber,
            workerPaymentStrategy
          } = scope.state;

          if (workerName && workerPhoneNumber && workerPaymentStrategy) {
            const event = {
              workerName,
              workerPhoneNumber,
              key: "workerPaymentStrategy",
              value: workerPaymentStrategy
            };

            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            var params = {
              FunctionName: "worker_name_phone_number_key_value",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(event)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let response = await lambdaPromise;
            scope.setState({ response: response + "" });
          } else {
            alert("Missing Value");
          }
        }}
      >
        Save Worker PAYMENT STRATEGY {scope.state.workerPaymentStrategy} for{" "}
        {scope.state.workerName}
      </Button>
      <Button
        style={{
          backgroundColor: "red"
        }}
        onClick={async () => {
          const { workerName, workerPhoneNumber, rating } = scope.state;

          if (workerName && workerPhoneNumber && rating) {
            const event = {
              workerName,
              workerPhoneNumber,
              key: "rating",
              value: rating
            };

            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            var params = {
              FunctionName: "worker_name_phone_number_key_value",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(event)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let response = await lambdaPromise;
            scope.setState({ response: response + "" });
          } else {
            alert("Missing Value");
          }
        }}
      >
        Save Worker RATING {scope.state.rating} for {scope.state.workerName}
      </Button>
      <Select
        value={scope.state.workerPaymentStrategy}
        onChange={event => {
          scope.setState({ workerPaymentStrategy: event.target.value });
        }}
      >
        <MenuItem value="PayPal">PayPal</MenuItem>
        <MenuItem value="Venmo">Venmo</MenuItem>
        <MenuItem value="CashApp">CashApp</MenuItem>
      </Select>
      {scope.state.response}
      <Button
        style={{
          backgroundColor: "red"
        }}
        onClick={async () => {
          const {
            workerName,
            workerPhoneNumber,
            iphoneOrAndroid
          } = scope.state;

          if (workerName && workerPhoneNumber && iphoneOrAndroid) {
            const event = {
              workerName,
              workerPhoneNumber,
              key: "iphoneOrAndroid",
              value: iphoneOrAndroid
            };

            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            var params = {
              FunctionName: "worker_name_phone_number_key_value",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(event)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let response = await lambdaPromise;
          } else {
            alert("Missing Value");
          }
        }}
      >
        Save Worker PHONE TYPE {scope.state.iphoneOrAndroid} for{" "}
        {scope.state.workerName}
      </Button>
      <Select
        value={scope.state.iphoneOrAndroid}
        onChange={event => {
          scope.setState({ iphoneOrAndroid: event.target.value });
        }}
      >
        <MenuItem value="IPHONE">IPHONE</MenuItem>
        <MenuItem value="ANDROID">ANDROID</MenuItem>
      </Select>
      <Button
        style={{
          backgroundColor: "red"
        }}
        onClick={async () => {
          const { workerName, workerPhoneNumber, workerAddress } = scope.state;

          if (workerName && workerPhoneNumber && workerAddress) {
            const event = {
              workerName,
              workerPhoneNumber,
              key: "workerAddress",
              value: workerAddress
            };

            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            var params = {
              FunctionName: "worker_name_phone_number_key_value",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(event)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let response = await lambdaPromise;
          } else {
            alert("Missing Value");
          }
        }}
      >
        Save Worker LOCATION {scope.state.workerAddress} for{" "}
        {scope.state.workerName}
      </Button>
      <div style={{ flexDirection: "column" }}>
        <div>
          Worker LOCATION
          {!scope.state.workerLocation.workerAddress && (
            <TextField
              type="text"
              value={scope.state.workerAddress}
              onChange={event => {
                scope.setState({
                  workerAddress: event.target.value
                });
                scope.findWorkerAddresses(event.target.value);
              }}
            />
          )}
          {!scope.state.workerLocation.workerAddress &&
            scope.state.workerAddresses.length > 0 &&
            scope.state.workerAddresses.map(address => {
              return (
                <div>
                  <Button
                    onClick={() => {
                      scope.handleWorkerAddressClick(address);
                    }}
                  >
                    {address.formatted_address}
                  </Button>
                </div>
              );
            })}
        </div>
        <div>
          {scope.state.workerLocation.workerAddress &&
            scope.state.workerLocation.workerAddress}
        </div>
      </div>
      <Button
        style={{
          backgroundColor: "red"
        }}
        onClick={async () => {
          const {
            workerName,
            workerPhoneNumber,
            workerPaymentStrategyUsername
          } = scope.state;

          if (
            workerName &&
            workerPhoneNumber &&
            workerPaymentStrategyUsername
          ) {
            const event = {
              workerName,
              workerPhoneNumber,
              key: "workerPaymentStrategyUsername",
              value: workerPaymentStrategyUsername
            };

            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            var params = {
              FunctionName: "worker_name_phone_number_key_value",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(event)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let response = await lambdaPromise;
          } else {
            alert("Missing Value");
          }
        }}
      >
        Save Worker USERNAME for PAYMENT STRATEGY{" "}
        {scope.state.workerPaymentStrategyUsername} for {scope.state.workerName}
      </Button>
      <TextField
        id="standard-with-placeholder"
        label="PAYMENT USERNAME 💳"
        placeholder="12/22"
        margin="normal"
        value={scope.state.workerPaymentStrategyUsername}
        onChange={event => {
          scope.setState({
            workerPaymentStrategyUsername: event.target.value
          });
        }}
      />
      <TextField
        id="standard-with-placeholder"
        label="Number Completed"
        placeholder="3"
        margin="normal"
        value={scope.state.numberCompleted}
        onChange={event => {
          scope.setState({
            numberCompleted: event.target.value
          });
        }}
      />
      ON THE WAY BRONZE
      <div>
        {textButton(
          `Hi 5 STAR BRONZE ${scope.state.workerName.toUpperCase()}. After 5 SHIFTS (YOU have COMPLETED ${scope.state.numberCompleted.toUpperCase()}), you will be PROMOTED to SILVER 🥈 with a PERCENT INCREASE in PAY BEYOND your MOST competitive PAY RATE EQUIVALENT to your RATING in STARS. Please inform the KITCHEN of ${scope.state.restaurantName.toUpperCase()} that you have arrived on behalf of WORKPROS.IO. Please refer to all team members as SIR. Please work as HARD and as PROFESSIONALLY as POSSIBLE. Please do not get ANGRY for ANY reason. The MANAGER is available at ${
            scope.state.managerPhoneNumber
          }.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        ask if prefer spanish
        {textButton(
          `si prefiere recibir comunicación en español, responda sí`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      {/* <div>SPANISH</div>
      <div>
        CONFIRME
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()} por favor confirme su número de teléfono. Responde con SI o NO.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        DIRECCIÓN
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()} por favor responda con su DIRECCIÓN de CORREO ELECTRÓNICO.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        ROL
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()} por favor responda con su ROL preferido LAVAPLATOS, BUSSER o COCINERO EN LÍNEA.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        TELÉFONO INTELIGENTE
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()} tiene un TELÉFONO INTELIGENTE? Por favor responda con SI o NO.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        APLICACIÓN DE PAGO MÓVIL
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()} por favor, responda con su APLICACIÓN DE PAGO MÓVIL preferida donde le gustaría RECIBIR el pago. Por favor responda con PAYPAL, VENMO o CASHAPP.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        NOMBRE DE USARIO
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()} por favor responda con su NOMBRE DE USUARIO, NÚMERO DE TELÉFONO o CORREO ELECTRÓNICO para ${scope.state.workerPaymentStrategy.toUpperCase()} en donde le gustaría RECIBIR EL PAGO. Si es el mismo que el CORREO ELECTRÓNICO o el NÚMERO DE TELÉFONO que ya ha proporcionado, responda con MISMO.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        IPHONE o ANDROID
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()} tiene un IPHONE o ANDROID?`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        DIRECCIÓN
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()} por favor, responda con una DIRECCIÓN que sea conveniente donde usted pueda ser RECOGIDO por un UBER.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        DISPONIBLE
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()} por favor responde con los DÍAS y HORAS en que estés DISPONIBLE.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        DESCRIPCIÓN
        {textButton(
          `Hi ${scope.state.workerName.toUpperCase()}, WorkPros.io es un servicio automatizado que le TRANSPORTA a su turno y le PAGA AUTOMÁTICAMENTE e INSTANTÁNEAMENTE el DÍA DESPUÉS DE SU CAMBIO. Trabajamos con diferentes RESTAURANTES en tu CIUDAD y te emparejamos con los restaurantes MÁS CERCANOS en los horarios que se ajustan a TU HORARIO.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div> */}
      {/* Worker Phone Number
      <TextField
        value={scope.state.workerPhoneNumber}
        onChange={event => {
          scope.setState({ workerPhoneNumber: event.target.value });
        }}
      /> */}
      {scope.state.workerConfirmPhoneNumberResponse}
      RATING 🥇
      <TextField
        value={scope.state.rating}
        onChange={event => {
          scope.setState({ rating: event.target.value });
        }}
      />
      <Select
        value={scope.state.rating}
        onChange={event => {
          scope.setState({ rating: event.target.value });
        }}
      >
        <MenuItem value="A 🥇">A 🥇</MenuItem>
        <MenuItem value="B 🥈">B 🥈</MenuItem>
        <MenuItem value="C 🥉">C 🥉</MenuItem>
        <MenuItem value="F 👎">F 👎</MenuItem>
      </Select>
      <div>
        RATING A 🥇, B 🥈, C 🥉 or F 👎
        {textButton(
          `${scope.state.workerName.toUpperCase()}, ${
            scope.state.competingWorker
          } received a GRADE of ${scope.state.rating.toUpperCase()} from ${scope.state.restaurantName.toUpperCase()}.`,
          `${scope.state.workerPhoneNumber}`,
          `${scope.state.workerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>EMAIL</div>
      <div>
        <TextField
          id="standard-with-placeholder"
          label="Worker Email"
          placeholder="worker@gmail.com"
          margin="normal"
          value={scope.state.workerEmail}
          onChange={event => {
            scope.setState({
              workerEmail: event.target.value
            });
          }}
        />
        <Button
          onClick={async () => {
            const Payload = {
              emailBody: `Hi ${scope.state.workerName.toUpperCase()},
              Welcome to WorkPros.io.
              `,
              emailAddress: scope.state.workerEmail,
              emailSubject: `WELCOME ${scope.state.workerName.toUpperCase()}`
            };

            var params = {
              FunctionName: "send_email",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(Payload)
            };

            let response = await lambda.invoke(params).promise();

            scope.setState({
              workerConfirmEmailResponse:
                response.Payload + "" + JSON.stringify(Payload)
            });
          }}
        >
          CONFIRM Email
        </Button>
        <Button
          onClick={async () => {
            const Payload = {
              emailBody: `Hi ${scope.state.workerName.toUpperCase()} , please text the number 7575005431 with your name if you would like to receive DISHWASHER, BUSSER and LINE COOK opportunities from WorkPros.io`,
              emailAddress: scope.state.workerEmail,
              emailSubject: `Hi ${scope.state.workerName.toUpperCase()}`
            };

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

            const response = await lambdaPromise;
            scope.setState({
              workerConfirmEmailResponse:
                response.Payload +
                `Hi ${scope.state.workerName.toUpperCase()}, please text the number 7575005431 with your NAME if you would like to receive DISHWASHER, BUSSER and LINE COOK opportunities from WorkPros.io`
            });
          }}
        >
          Ask PHONE NUMBER and NAME to twilio by email
        </Button>
        <Button
          onClick={async () => {
            const Payload = {
              emailBody: `Hi ${scope.state.workerName.toUpperCase()} , please text the number 7575005431 with your name if you would like to receive DISHWASHER, BUSSER and LINE COOK opportunities from WorkPros.io`,
              emailAddress: scope.state.workerEmail,
              emailSubject: `Hi ${scope.state.workerName.toUpperCase()}`
            };

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

            const response = await lambdaPromise;
            scope.setState({
              workerConfirmEmailResponse:
                response.Payload +
                `Hi ${scope.state.workerName.toUpperCase()}, please text the number 7575005431 with your NAME if you would like to receive DISHWASHER, BUSSER and LINE COOK opportunities from WorkPros.io`
            });
          }}
        >
          Ask NAME to twilio by email
        </Button>
        {scope.state.workerConfirmEmailResponse}
      </div>
      {/* <div style={{ margin: 5 }}>
        Worker Lowest Cost Per Hour
        <TextField
          value={scope.state.workerLowestCost}
          onChange={event => {
            scope.setState({ workerLowestCost: event.target.value });
          }}
        />
        <Button
          onClick={async () => {
            const Payload = {
              body: `Please FOLLOW WorkPros.io on SOCIAL MEDIA at https://twitter.com/workpros_io and https://www.instagram.com/workpros.io/ and we will be sure to follow YOU back ${scope.state.workerName.toUpperCase()}.`,
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
                response.Payload +
                " with body " +
                `Please FOLLOW WorkPros.io on SOCIAL MEDIA at https://twitter.com/workpros_io and https://www.instagram.com/workpros.io/ and we will be sure to follow YOU back ${scope.state.workerName.toUpperCase()}.`
            });
          }}
        >
          send SOCIAL MEDIA links
        </Button>
      </div> */}
      <div style={{ margin: 5 }}>
        Worker Availability
        {scope.updateAvailabilityToEveryDay()}
        {daysToScheduleAvailabilityForWorker.map(day =>
          showHoursFromAndUntil(day, scope)
        )}
      </div>
      <div style={{ margin: 5 }}>
        <Button
          style={{
            color: "red"
          }}
          onClick={() => {
            publishWorkerNamePhoneNumberPaymentStrategyUsernameAndAvailability(
              scope.state
            );
          }}
        >
          Publish Worker Name, Phone Number, and Availability
        </Button>
      </div>
    </div>
  );
};

const updateAvailabilityToAllDay = (dayToChooseAvailabilityFor, scope) => {
  return (
    <Button
      onClick={() => {
        handleClickOnAllDayButton(dayToChooseAvailabilityFor, scope);
      }}
    >
      all day
    </Button>
  );
};
const handleClickOnAllDayButton = (dayToChooseAvailabilityFor, scope) => {
  const allDayAvailability = {
    fromHour: "12",
    fromMinute: "01",
    fromMeridiem: "am",
    untilHour: "11",
    untilMinute: "59",
    untilMeridiem: "pm"
  };

  scope.setState({
    ["workerAvailability"]: {
      ...scope.state.workerAvailability,
      [dayToChooseAvailabilityFor]: allDayAvailability
    }
  });
};

const daysToScheduleAvailabilityForWorker = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];
const showHoursFromAndUntil = (dayToChooseAvailabilityFor, scope) => {
  return (
    <div style={{ display: "flex", flexDirection: "row", margin: 10 }}>
      <div> {dayToChooseAvailabilityFor} </div>
      {returnTimeSelector(dayToChooseAvailabilityFor, "from", scope)}
      {returnTimeSelector(dayToChooseAvailabilityFor, "until", scope)}
      {updateAvailabilityToAllDay(dayToChooseAvailabilityFor, scope)}
    </div>
  );
};
const returnTimeSelector = (dayToChooseAvailabilityFor, fromOrUntil, scope) => {
  return (
    <div style={{ display: "flex", flexDirection: "row", marginLeft: 10 }}>
      {fromOrUntil}
      {hourSelect(dayToChooseAvailabilityFor, `${fromOrUntil}Hour`, scope)}
      {minuteSelect(dayToChooseAvailabilityFor, `${fromOrUntil}Minute`, scope)}
      {meridiemSelect(
        dayToChooseAvailabilityFor,
        `${fromOrUntil}Meridiem`,
        scope
      )}
    </div>
  );
};

const hourSelect = (dayToChooseAvailabilityFor, fromOrUntil, scope) => {
  let fromHourOrUntilHour =
    fromOrUntil == "fromHour" ? "fromHour" : "untilHour";

  return (
    <Select
      value={
        scope.state.workerAvailability[dayToChooseAvailabilityFor][
          fromHourOrUntilHour
        ]
      }
      onChange={event => {
        scope.handleChange(
          dayToChooseAvailabilityFor,
          event,
          fromHourOrUntilHour
        );
      }}
    >
      <MenuItem value="1">1</MenuItem>
      <MenuItem value="2">2</MenuItem>
      <MenuItem value="3">3</MenuItem>
      <MenuItem value="4">4</MenuItem>
      <MenuItem value="5">5</MenuItem>
      <MenuItem value="6">6</MenuItem>
      <MenuItem value="7">7</MenuItem>
      <MenuItem value="8">8</MenuItem>
      <MenuItem value="9">9</MenuItem>
      <MenuItem value="10">10</MenuItem>
      <MenuItem value="11">11</MenuItem>
      <MenuItem value="12">12</MenuItem>
    </Select>
  );
};

const minuteSelect = (dayToChooseAvailabilityFor, fromOrUntil, scope) => {
  let fromMinuteOrUntilMinute =
    fromOrUntil == "fromMinute" ? "fromMinute" : "untilMinute";

  return (
    <Select
      value={
        scope.state.workerAvailability[dayToChooseAvailabilityFor][
          fromMinuteOrUntilMinute
        ]
      }
      onChange={event => {
        scope.handleChange(
          dayToChooseAvailabilityFor,
          event,
          fromMinuteOrUntilMinute
        );
      }}
    >
      <MenuItem value="01">01</MenuItem>
      <MenuItem value="15">15</MenuItem>
      <MenuItem value="30">30</MenuItem>
      <MenuItem value="45">45</MenuItem>
      <MenuItem value="59">59</MenuItem>
    </Select>
  );
};

const meridiemSelect = (dayToChooseAvailabilityFor, fromOrUntil, scope) => {
  let fromMeridiemOrUntilMeridiem =
    fromOrUntil == "fromMeridiem" ? "fromMeridiem" : "untilMeridiem";
  return (
    <Select
      value={
        scope.state.workerAvailability[dayToChooseAvailabilityFor][
          fromMeridiemOrUntilMeridiem
        ]
      }
      onChange={event => {
        scope.handleChange(
          dayToChooseAvailabilityFor,
          event,
          fromMeridiemOrUntilMeridiem
        );
      }}
    >
      <MenuItem value="am">am</MenuItem>
      <MenuItem value="pm">pm</MenuItem>
    </Select>
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
    <div>
      <Button
        style={{ textTransform: "none", backgroundColor: "red" }}
        variant="contained"
        onClick={async () => {
          scope.setState({ playDrum3: !scope.state.playDrum3 });
          let count = 0;
          let interval = setInterval(() => {
            count++;

            if (count == 4) {
              scope.setState({ playDrum3: !scope.state.playDrum3 });
              clearInterval(interval);
            }
          }, 1000);

          const Payload = {
            body: textMessage.toLowerCase(),
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

          var lambdaForCount = new aws.Lambda({
            region: "us-east-1"
          });

          const event = {
            body: textMessage.toLowerCase(),
            phoneNumber: workerPhoneNumber
          };

          var paramsForCount = {
            FunctionName: "count_cost_by_date",
            InvocationType: "RequestResponse",
            LogType: "Tail",
            Payload: JSON.stringify(event)
          };

          let lambdaPromiseForCount = lambdaForCount
            .invoke(paramsForCount)
            .promise();

          let value = await lambdaPromiseForCount;

          if (response.Payload.includes("errorMessage")) {
            scope.setState({
              error: "error occured while sending text message"
            });
          }

          await SaveSentToDatabase(Payload, workerName);

          scope.setState({
            workerConfirmPhoneNumberResponse: response.Payload + ""
          });

          if (scope.state.runningInterval) {
            var intervalId = setInterval(async () => {
              scope.setState({ playDrum3: !scope.state.playDrum3 });
              let count = 0;
              let interval = setInterval(() => {
                // console.log("snth");
                count++;
                // console.log(count);

                if (count == 4) {
                  scope.setState({ playDrum3: !scope.state.playDrum3 });
                  clearInterval(interval);
                }
              }, 1000);

              const Payload = {
                body: textMessage.toLowerCase(),
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

              var lambdaForCount = new aws.Lambda({
                region: "us-east-1"
              });

              const event = {
                body: textMessage.toLowerCase(),
                phoneNumber: workerPhoneNumber
              };

              var paramsForCount = {
                FunctionName: "count_cost_by_date",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(event)
              };

              let lambdaPromiseForCount = lambdaForCount
                .invoke(paramsForCount)
                .promise();

              let value = await lambdaPromiseForCount;

              scope.setState({
                workerConfirmPhoneNumberResponse: response.Payload + ""
              });
            }, 60 * 1000 * parseFloat(scope.state.repeaterInterval));
            scope.setState({ intervalId });

            let intervalCountdown =
              60 * parseFloat(scope.state.repeaterInterval);

            let countdownForInterval = setInterval(() => {
              if (scope.state.intervalCountdown == 0) {
                scope.setState({
                  intervalCountdown:
                    60 * parseFloat(scope.state.repeaterInterval)
                });
              } else {
                scope.setState({
                  intervalCountdown: scope.state.intervalCountdown - 1
                });
              }
            }, 1000);
          }
          console.log("snthaoeu");
          console.log(scope.state.ArrayOfWorkersNamesAndNumbers.length);
          if (scope.state.ArrayOfWorkersNamesAndNumbers.length > 0) {
            for (
              let i = 0;
              i < scope.state.ArrayOfWorkersNamesAndNumbers.length;
              i++
            ) {
              // console.log("snth");
              // console.log(scope.state.ArrayOfWorkersNamesAndNumbers[i]);

              let {
                workerPhoneNumber,
                workerName
              } = scope.state.ArrayOfWorkersNamesAndNumbers[i];

              console.log(workerPhoneNumber);
              console.log(workerName);
              console.log(textMessage);

              if (textMessage.includes("hi")) {
                textMessage =
                  workerName.toLowerCase() +
                  " " +
                  textMessage.toLowerCase().substring(4, textMessage.length);
              } else {
                textMessage =
                  workerName.toLowerCase() + ", " + textMessage.toLowerCase();
              }

              console.log(textMessage);

              const Payload = {
                body: textMessage.toLowerCase(),
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

              var lambdaForCount = new aws.Lambda({
                region: "us-east-1"
              });

              const event = {
                body: textMessage.toLowerCase(),
                phoneNumber: workerPhoneNumber
              };

              var paramsForCount = {
                FunctionName: "count_cost_by_date",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(event)
              };

              let lambdaPromiseForCount = lambdaForCount
                .invoke(paramsForCount)
                .promise();

              let value = await lambdaPromiseForCount;

              if (response.Payload.includes("errorMessage")) {
                scope.setState({
                  error: "error occured while sending text message"
                });
              }
              await SaveSentToDatabase(Payload, workerName);

              textMessage = textMessage.substring(
                workerName.length + 1,
                textMessage.length
              );
              console.log(textMessage);
            }
          }
        }}
      >
        to {workerName.toLowerCase()} send: {textMessage.toLowerCase()}
      </Button>
    </div>
  );
};
