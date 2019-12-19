import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { publishShiftToDatabase } from "./publishMessageToTopic";
import aws from "aws-sdk";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import firebase from "firebase";

var lambda = new aws.Lambda({
  region: "us-east-1"
});

const handleDateChange = (shiftStartDate, scope) => {
  console.log(typeof shiftStartDate);
  scope.setState({
    shiftStartDate,
    shiftStartDateYear: moment(shiftStartDate).year(),
    shiftStartDateMonth: moment(shiftStartDate).month(),
    shiftStartDateDay: moment(shiftStartDate).date(),
    shiftStartDayName: moment(shiftStartDate).format("dddd")
  });
};

const displayDateSelect = scope => {
  return (
    <div>
      <label>Shift Date 📆</label>

      <Select
        value={scope.state.shiftStartASAPTodayTomorrowOther}
        onChange={event => {
          let date = new moment();
          switch (event.target.value) {
            case "ASAP":
              date = new moment();
              scope.setState({
                shiftStartTimeHour: date.format("hh"),
                shiftStartTimeMinute: date.format("mm"),
                shiftStartTimeMeridiem: date.format("a")
              });
              break;
            case "Today":
              date = new moment();
              break;
            case "Tomorrow":
              date = moment().add(1, "days");
              break;
          }

          scope.setState({
            shiftStartDateYear: date.year(),
            shiftStartDateMonth: date.month(),
            shiftStartDateDay: date.date(),
            shiftStartDayName: date.format("dddd")
            // shiftStartDate: {
            //   shiftStartDateYear: date.year(),
            //   shiftStartDateMonth: date.month(),
            //   shiftStartDateDay: date.date()
            // }
          });
          scope.set(event, "shiftStartASAPTodayTomorrowOther");
        }}
      >
        <MenuItem value={"ASAP"}>ASAP</MenuItem>
        <MenuItem value={"Today"}>Today</MenuItem>
        <MenuItem value={"Tomorrow"}>Tomorrow</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </Select>
    </div>
  );
};

const displayShiftStartOrEndSelectors = (startOrEnd, scope) => {
  return (
    <div>
      <label>
        {startOrEnd == "Start" ? "Shift Start Time 🕘" : "Shift End Time 🕔"}
      </label>

      {selectHourOfStartOrEnd(`shift${startOrEnd}TimeHour`, scope)}
      <Select
        value={scope.state[`shift${startOrEnd}TimeMinute`]}
        onChange={event => scope.set(event, `shift${startOrEnd}TimeMinute`)}
      >
        <MenuItem value="00">00</MenuItem>
        <MenuItem value="30">30</MenuItem>
      </Select>
      <Select
        value={scope.state[`shift${startOrEnd}TimeMeridiem`]}
        onChange={event => scope.set(event, `shift${startOrEnd}TimeMeridiem`)}
      >
        <MenuItem value="am">am</MenuItem>
        <MenuItem value="pm">pm</MenuItem>
      </Select>
    </div>
  );
};
const selectHourOfStartOrEnd = (stateVariableToUpdate, scope) => {
  return (
    <Select
      value={scope.state[stateVariableToUpdate]}
      onChange={event => scope.set(event, stateVariableToUpdate)}
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

export const displayShiftPublishOptions = scope => {
  const textForDistribution = (workerName, travelTimeByCar) => {
    return `Hi ✋ ${workerName} 👨‍💼, would you like to work ${
      scope.state.shiftStartASAPTodayTomorrowOther != "OTHER" &&
      scope.state.shiftStartASAPTodayTomorrowOther == "Today" &&
      scope.state.shiftStartDayName == moment().format("dddd")
        ? " " + scope.state.shiftStartASAPTodayTomorrowOther
        : ""
    } on ${scope.state.shiftStartDayName} ${moment(
      scope.state.shiftStartDate
    ).format("MMMM Do YYYY")} 📆 from ${scope.state.shiftStartTimeHour}:${
      scope.state.shiftStartTimeMinute
    } ${scope.state.shiftStartTimeMeridiem} 🕘 to ${
      scope.state.shiftEndTimeHour
    }:${scope.state.shiftEndTimeMinute} ${
      scope.state.shiftEndTimeMeridiem
    } 🕔 as a ${scope.state.shiftJobType} at location ${
      scope.state.shiftAddress
    }${travelTimeByCar ? travelTimeByCar : ""}${
      scope.state.freeUber ? scope.state.freeUber : ""
    }${scope.state.freeMeal ? scope.state.freeMeal : ""}${
      scope.state.cashOnSite ? scope.state.cashOnSite : ""
    }${
      scope.state.safeHandlersRequired ? scope.state.safeHandlersRequired : ""
    }? If yes please reply with the total number of dollars you would like as your starting bid (number only). Bidding ends at ${
      scope.state.biddingEndTime
    } ⏳ at which point in time the best price will be sent to the manager for confirmation.`.toLowerCase();
  };
  return (
    <div
      style={{
        justifyContent: "center",
        flexDirection: "column",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div />

      <div style={{ margin: 10 }}>
        Manager
        <Select
          value={scope.state.managerOfShiftStringified}
          onChange={event => {
            scope.setState({
              managerOfShift: JSON.parse(event.target.value),
              managerOfShiftStringified: event.target.value
            });
          }}
        >
          {scope.state.managerForPaymentArray.map(managerOfShift => {
            return (
              <MenuItem value={JSON.stringify(managerOfShift)}>
                {managerOfShift.managerName} {managerOfShift.managerPhoneNumber}
              </MenuItem>
            );
          })}
        </Select>
      </div>
      <div>
        Shift for delete
        <div>
          <Select
            value={scope.state.shiftForDeleteStringified}
            onChange={event => {
              const shiftForDelete = JSON.parse(event.target.value);

              let { uid } = shiftForDelete;

              console.log(uid);
              scope.setState({
                shiftForDeleteStringified: event.target.value
              });
              scope.setState({ shiftUIDforDelete: uid });
            }}
          >
            {scope.state.shiftsForDistributionArray.map(
              shiftForDistribution => {
                return (
                  <MenuItem value={JSON.stringify(shiftForDistribution)}>
                    {shiftForDistribution.shiftAddress}{" "}
                    {shiftForDistribution.shiftStartDayName}{" "}
                    {shiftForDistribution.shiftQuantityOfWorkers}
                  </MenuItem>
                );
              }
            )}
          </Select>
        </div>
        <Button
          disabled={scope.state.shiftUIDforDelete == ""}
          style={{ backgroundColor: "red" }}
          onClick={() => {
            firebase
              .database()
              .ref(
                `/shiftDateTimeWorkerTypeLocationAndQuantity/${scope.state.shiftUIDforDelete}`
              )
              .remove()
              .then(() => {
                console.log("deleted");
                scope.setState({ shiftDeleteResponse: "successfully deleted" });
              });
          }}
        >
          Delete shift with uid {scope.state.shiftUIDforDelete}
        </Button>
        {scope.state.shiftDeleteResponse}
      </div>
      <div>
        Shift
        <Select
          value={scope.state.shiftForDistributionStringified}
          onChange={event => {
            const shiftForDistribution = JSON.parse(event.target.value);

            console.log(shiftForDistribution);
            let {
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
              biddingEndTime,
              managerOfShift,
              safeHandlersRequired,
              cashOnSite,
              freeMeal
            } = shiftForDistribution;

            console.log(typeof shiftStartDate);
            console.log(shiftStartDate);

            const {
              shiftStartDateMonth,
              shiftStartDateDay,
              shiftStartDateYear
            } = shiftStartDate;

            let shiftStartDateForCollquialName = new Date(
              shiftStartDate.shiftStartDateYear,
              shiftStartDate.shiftStartDateMonth,
              shiftStartDate.shiftStartDateDay
            );

            const today = new Date();

            var tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);

            if (
              shiftStartDateForCollquialName.getDay() == today.getDay() &&
              shiftStartDateForCollquialName.getMonth() == today.getMonth()
            ) {
              scope.setState({ shiftStartASAPTodayTomorrowOther: "Today" });
            } else if (
              shiftStartDateForCollquialName.getDay() == tomorrow.getDay() &&
              shiftStartDateForCollquialName.getMonth() == tomorrow.getMonth()
            ) {
              scope.setState({ shiftStartASAPTodayTomorrowOther: "Tomorrow" });
            } else {
              scope.setState({ shiftStartASAPTodayTomorrowOther: "Other" });
            }

            shiftStartDate = shiftStartDateForCollquialName;

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
              shiftStartDateMonth,
              shiftStartDateDay,
              shiftStartDateYear,
              biddingEndTime,
              managerName: `${
                managerOfShift ? managerOfShift.managerName : ""
              }`,
              managerPhoneNumber: `${
                managerOfShift ? managerOfShift.managerPhoneNumber : ""
              }`,
              safeHandlersRequired,
              cashOnSite,
              freeMeal
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
      <div>
        <div style={{ margin: 10 }}>{displayDateSelect(scope)}</div>
        <div>
          {scope.state.shiftStartDateMonth}/{scope.state.shiftStartDateDay}/
          {scope.state.shiftStartDateYear}
        </div>
        {scope.state.shiftStartASAPTodayTomorrowOther == "Other" && (
          <div>
            <DatePicker
              selected={scope.state.shiftStartDate}
              onChange={event => {
                handleDateChange(event, scope);
              }}
            />
          </div>
        )}
        <div style={{ margin: 10 }}>{scope.displayInputForShiftLocation()}</div>
        <div style={{ margin: 10 }}>
          {scope.displaySelectQuantityOfWorkers()}
        </div>
        <div style={{ margin: 10 }}>
          Shift Worker Type
          <Select
            value={scope.state.shiftJobType}
            onChange={event => scope.set(event, "shiftJobType")}
          >
            <MenuItem value="Line Cook (Sous Chef)">
              Line Cook (Sous Chef)
            </MenuItem>
            <MenuItem value="Prep Cook">Prep Cook</MenuItem>
            <MenuItem value="Dishwasher (Chef Plongeur)">
              Dishwasher (Chef Plongeur)
            </MenuItem>
            <MenuItem value="Busser (Chef de Rang)">
              Busser (Chef de Rang)
            </MenuItem>
            <MenuItem value="General Laborer">General Laborer</MenuItem>
          </Select>
        </div>
        <div>
          Bidding End Time
          <TextField
            value={scope.state.biddingEndTime}
            onChange={event => {
              scope.setState({ biddingEndTime: event.target.value });
            }}
          />
        </div>

        <div style={{ margin: 10 }}>
          {scope.state.shiftStartASAPTodayTomorrowOther != "ASAP" && (
            <div>{displayShiftStartOrEndSelectors("Start", scope)}</div>
          )}
        </div>
        <div style={{ margin: 10 }}>
          {displayShiftStartOrEndSelectors("End", scope)}
        </div>
      </div>

      <Button
        onClick={() => {
          scope.setState({
            cashOnSite:
              scope.state.cashOnSite == ""
                ? " with cash payment sometimes available"
                : ""
          });
        }}
      >
        Cash On Site
      </Button>
      {scope.state.cashOnSite}

      <Button
        onClick={() => {
          scope.setState({
            freeMeal:
              scope.state.freeMeal == "" ? " with free meal included" : ""
          });
        }}
      >
        Free Meal
      </Button>
      {scope.state.freeMeal}

      <Button
        onClick={() => {
          scope.setState({
            freeUber:
              scope.state.freeUber == "" ? " with free transport by uber" : ""
          });
        }}
      >
        Free Uber
      </Button>

      {scope.state.freeUber}

      <Button
        onClick={() => {
          scope.setState({
            freeUber:
              scope.state.freeUber == ""
                ? " with transport assistance via uber"
                : scope.state.freeUber == " with free transport by uber"
                ? " with transport assistance via uber"
                : ""
          });
        }}
      >
        Transport at worker cost
      </Button>

      {scope.state.freeUber}
      <Button
        onClick={() => {
          scope.setState({
            safeHandlersRequired:
              scope.state.safeHandlersRequired == ""
                ? " with Safe Handlers Card required (we can provide)"
                : ""
          });
        }}
      >
        Safe Handlers Required
      </Button>
      {scope.state.safeHandlersRequired}
      <Button
        onClick={() => {
          scope.setState({
            freeFirstMonth:
              scope.state.freeFirstMonth == "" ? "with free first month" : ""
          });
        }}
      >
        Free First Month Subscription
      </Button>
      {scope.state.freeFirstMonth}

      <Button
        style={{ color: "red" }}
        onClick={() => {
          const {
            shiftStartASAPTodayTomorrowOther,
            shiftStartDateYear,
            shiftStartDateMonth,
            shiftStartDateDay,
            shiftLocation,
            shiftAddress,
            shiftQuantityOfWorkers,
            shiftJobType,
            shiftStartTimeHour,
            shiftStartTimeMinute,
            shiftStartTimeMeridiem,
            shiftEndTimeHour,
            shiftEndTimeMinute,
            shiftEndTimeMeridiem,
            shiftStartDayName,
            shiftStartDate,
            managerOfShift,
            workerForDistributionSelectedArray,
            biddingEndTime,
            safeHandlersRequired,
            freeFirstMonth,
            cashOnSite,
            freeMeal
          } = scope.state;

          console.log(
            shiftStartASAPTodayTomorrowOther,
            shiftStartDateYear,
            shiftStartDateMonth,
            shiftStartDateDay,
            shiftLocation,
            shiftAddress,
            shiftQuantityOfWorkers,
            shiftJobType,
            shiftStartTimeHour,
            shiftStartTimeMinute,
            shiftStartTimeMeridiem,
            shiftEndTimeHour,
            shiftEndTimeMinute,
            shiftEndTimeMeridiem,
            shiftStartDayName,
            shiftStartDate,
            managerOfShift,
            workerForDistributionSelectedArray,
            biddingEndTime,
            safeHandlersRequired,
            cashOnSite,
            freeMeal
          );

          if (
            shiftStartASAPTodayTomorrowOther &&
            shiftStartDate &&
            shiftStartDateYear &&
            shiftStartDateMonth &&
            shiftStartDateDay &&
            shiftLocation &&
            shiftAddress &&
            shiftQuantityOfWorkers &&
            shiftJobType &&
            shiftStartTimeHour &&
            shiftStartTimeMinute &&
            shiftStartTimeMeridiem &&
            shiftEndTimeHour &&
            shiftEndTimeMinute &&
            shiftEndTimeMeridiem &&
            shiftStartDayName &&
            shiftStartDate &&
            managerOfShift
          ) {
            // alert("Success");

            const shiftDateTimeWorkerTypeLocationAndQuantity = {
              shiftStartDate: {
                shiftStartASAPTodayTomorrowOther,
                shiftStartDate: moment(shiftStartDate).format("LLL"),
                shiftStartDateYear,
                shiftStartDateMonth,
                shiftStartDateDay
              },
              shiftLocation,
              shiftAddress,
              shiftQuantityOfWorkers,
              shiftJobType,
              shiftStartTimeHour,
              shiftStartTimeMinute,
              shiftStartTimeMeridiem,
              shiftEndTimeHour,
              shiftEndTimeMinute,
              shiftEndTimeMeridiem,
              shiftStartDayName,
              managerOfShift,
              workerForDistributionSelectedArray,
              biddingEndTime,
              safeHandlersRequired,
              freeFirstMonth,
              cashOnSite,
              freeMeal
            };

            publishShiftToDatabase(
              shiftDateTimeWorkerTypeLocationAndQuantity,
              "shiftDateTimeWorkerTypeLocationAndQuantity"
            );
          } else {
            alert(
              "missing value for publishing shift date, time, worker type, location and quantity"
            );
          }
        }}
      >
        Publish Shift to Database Interface
      </Button>

      <div>
        Workers NAME/PHONE NUMBER for Distribution
        <Button
          onClick={() => {
            scope.setState({
              displayLosAngelesWorkersForDistribution: !scope.state
                .displayLosAngelesWorkersForDistribution
            });
          }}
        >
          DISPLAY LOS ANGELES workers for distribution
        </Button>
        {scope.state.displayLosAngelesWorkersForDistribution && (
          <div>
            {scope.state.workerNameAndPhoneNumberArray
              .sort(function(a, b) {
                return a.workerName.localeCompare(b.workerName);
              })
              .map(workerNameAndPhoneNumber => {
                if (
                  workerNameAndPhoneNumber.workerName.includes("Los Angeles")
                ) {
                  return (
                    <div style={{ margin: 10 }}>
                      Worker
                      <input
                        type="checkbox"
                        value={JSON.stringify(workerNameAndPhoneNumber)}
                        onClick={event => {
                          console.log(JSON.parse(event.target.value));
                          const WorkerNameNumberAndDateAndTimeAdded = JSON.parse(
                            event.target.value
                          );

                          let NewArrayOfWorkersNamesAndNumbers = [
                            ...scope.state.ArrayOfWorkersNamesAndNumbers,
                            WorkerNameNumberAndDateAndTimeAdded
                          ];
                          scope.setState({
                            ArrayOfWorkersNamesAndNumbers: NewArrayOfWorkersNamesAndNumbers
                          });
                        }}
                      />{" "}
                      {workerNameAndPhoneNumber.workerName}{" "}
                      {workerNameAndPhoneNumber.workerPhoneNumber}
                    </div>
                  );
                }
              })}
            <div>
              {scope.state.ArrayOfWorkersNamesAndNumbers.map(Worker => {
                return <div>{JSON.stringify(Worker)}</div>;
              })}
              <Button
                onClick={() => {
                  let NewArrayOfWorkersNamesAndNumbers = [];
                  console.log(scope.state.ArrayOfWorkersNamesAndNumbers);
                  for (
                    let i = 0;
                    i < scope.state.workerNameAndPhoneNumberArray.length;
                    i++
                  ) {
                    const WorkerNameNumberAndDateAndTimeAdded =
                      scope.state.workerNameAndPhoneNumberArray[i];
                    if (
                      WorkerNameNumberAndDateAndTimeAdded.workerName.includes(
                        "Los Angeles"
                      )
                    ) {
                      console.log(WorkerNameNumberAndDateAndTimeAdded);
                      NewArrayOfWorkersNamesAndNumbers.push(
                        WorkerNameNumberAndDateAndTimeAdded
                      );
                    }
                  }
                  console.log(NewArrayOfWorkersNamesAndNumbers);
                  scope.setState(
                    {
                      ArrayOfWorkersNamesAndNumbers: NewArrayOfWorkersNamesAndNumbers
                    },
                    () => {
                      // this.afterSetStateFinished();
                      console.log(scope.state.ArrayOfWorkersNamesAndNumbers);
                    }
                  );
                }}
              >
                select ALL los angeles workers
              </Button>
              <Button
                style={{ textTransform: "none" }}
                onClick={async () => {
                  let distributeLAShiftResponse = "";

                  // console.log(response);

                  // console.log(JSON.parse(response.Payload));

                  for (
                    let i = 0;
                    i < scope.state.ArrayOfWorkersNamesAndNumbers.length;
                    i++
                  ) {
                    const Worker = scope.state.ArrayOfWorkersNamesAndNumbers[i];

                    //nse construction
                    let addressOfWorker = "";

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      if (
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerAddress" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].workerName == Worker.workerName
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );
                        addressOfWorker =
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .value;
                      }
                    }

                    let travelTimeByCar = "";

                    if (addressOfWorker) {
                      let lambda = new aws.Lambda({
                        region: "us-east-1"
                      });
                      const Payload = {
                        origins: [addressOfWorker],
                        destinations: [scope.state.shiftAddress]
                      };
                      let params = {
                        FunctionName: "get_distances",
                        InvocationType: "RequestResponse",
                        LogType: "Tail",
                        Payload: JSON.stringify(Payload)
                      };
                      let lambdaPromise = lambda.invoke(params).promise();
                      let value = await lambdaPromise;

                      let distanceValue = JSON.parse(value.Payload)[0].distance
                        .value;

                      let durationValue = JSON.parse(value.Payload)[0].duration
                        .value;

                      let kilometers = parseInt(distanceValue) / 1000;

                      let miles = parseInt(kilometers) * 0.621371;

                      let hours = "";
                      let minutes = parseInt(durationValue) / 60;

                      console.log(value.Payload);

                      console.log(
                        "estimated price is 0.2 * minutes + 0.8 * miles" +
                          ": " +
                          (minutes * 0.2 + miles * 0.8)
                      );

                      travelTimeByCar = ` ${minutes.toFixed(
                        2
                      )} minutes from your address ${addressOfWorker} by car `;
                    }

                    // end of new contsrutctions

                    const event = {
                      textToTranslate: textForDistribution(
                        Worker.workerName,
                        travelTimeByCar
                      )
                    };

                    var lambda = new aws.Lambda({
                      region: "us-east-1"
                    });

                    var paramsForTranslate = {
                      FunctionName: "english_to_spanish",
                      InvocationType: "RequestResponse",
                      LogType: "Tail",
                      Payload: JSON.stringify(event)
                    };

                    let lambdaPromiseForTranslate = lambda
                      .invoke(paramsForTranslate)
                      .promise();

                    let responseFromLambda = await lambdaPromiseForTranslate;

                    console.log(responseInSpanish);

                    let responseInSpanish = JSON.parse(
                      responseFromLambda.Payload
                    ).translatedText;

                    let messageForDistribution = textForDistribution(
                      Worker.workerName,
                      travelTimeByCar
                    );

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      console.log(
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ]
                      );
                      if (
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerLanguage" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].value == "Spanish" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].workerName == Worker.workerName
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );
                        messageForDistribution = responseInSpanish;
                      }
                    }

                    const Payload = {
                      body: messageForDistribution,
                      phoneNumber: Worker.workerPhoneNumber
                    };

                    console.log(Payload);

                    //add work type restriction
                    let onlyTextIfJobTypeMatches = false;

                    let jobTypeSpecified = false;

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      console.log(
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key
                      );
                      if (
                        Worker.workerName ==
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .workerName &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerShiftJobTypes"
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );

                        jobTypeSpecified = true;

                        if (
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        ) {
                          for (
                            let k = 0;
                            k <
                            scope.state
                              .workerNameAndPhoneNumberAndShiftCountArray[j]
                              .value.length;
                            k++
                          ) {
                            if (
                              scope.state.shiftJobType
                                .toLowerCase()
                                .includes(
                                  scope.state
                                    .workerNameAndPhoneNumberAndShiftCountArray[
                                    j
                                  ].value[k]
                                )
                            ) {
                              console.log("yes this job type is included");
                              console.log(
                                scope.state
                                  .workerNameAndPhoneNumberAndShiftCountArray[j]
                                  .value[k]
                              );
                              onlyTextIfJobTypeMatches = true;
                            }
                          }
                        }
                      }
                    }

                    console.log(jobTypeSpecified);
                    console.log(onlyTextIfJobTypeMatches);

                    if (
                      (jobTypeSpecified && onlyTextIfJobTypeMatches) ||
                      !jobTypeSpecified
                    ) {
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

                      SaveSentToDatabase(Payload, Worker.workerName);

                      distributeLAShiftResponse += JSON.stringify(Payload);
                    }
                  }
                  scope.setState({ distributeLAShiftResponse });

                  var lambdaForCount = new aws.Lambda({
                    region: "us-east-1"
                  });

                  const eventForCountCost = {
                    body: textForDistribution(Worker.workerName),
                    phoneNumber: Worker.workerPhoneNumber
                  };

                  var paramsForCount = {
                    FunctionName: "count_cost_by_date",
                    InvocationType: "RequestResponse",
                    LogType: "Tail",
                    Payload: JSON.stringify(eventForCountCost)
                  };

                  let lambdaPromiseForCount = lambdaForCount
                    .invoke(paramsForCount)
                    .promise();

                  let value = await lambdaPromiseForCount;
                }}
              >
                distribute SHIFT to workers with message{" "}
                {textForDistribution(Worker.workerName)}
              </Button>
              <div> {scope.state.distributeLAShiftResponse} </div>

              <Button
                style={{ textTransform: "none" }}
                onClick={async () => {
                  let distributeLAShiftResponse = "";

                  // console.log(response);

                  // console.log(JSON.parse(response.Payload));

                  for (
                    let i = 0;
                    i < scope.state.ArrayOfWorkersNamesAndNumbers.length;
                    i++
                  ) {
                    const Worker = scope.state.ArrayOfWorkersNamesAndNumbers[i];

                    //nse construction
                    let addressOfWorker = "";

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      if (
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerAddress" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].workerName == Worker.workerName
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );
                        addressOfWorker =
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .value;
                      }
                    }

                    let travelTimeByCar = "";

                    if (addressOfWorker) {
                      let lambda = new aws.Lambda({
                        region: "us-east-1"
                      });
                      const Payload = {
                        origins: [addressOfWorker],
                        destinations: [scope.state.shiftAddress]
                      };
                      let params = {
                        FunctionName: "get_distances",
                        InvocationType: "RequestResponse",
                        LogType: "Tail",
                        Payload: JSON.stringify(Payload)
                      };
                      let lambdaPromise = lambda.invoke(params).promise();
                      let value = await lambdaPromise;

                      let distanceValue = JSON.parse(value.Payload)[0].distance
                        .value;

                      let durationValue = JSON.parse(value.Payload)[0].duration
                        .value;

                      let kilometers = parseInt(distanceValue) / 1000;

                      let miles = parseInt(kilometers) * 0.621371;

                      let hours = "";
                      let minutes = parseInt(durationValue) / 60;

                      console.log(value.Payload);

                      console.log(
                        "estimated price is 0.2 * minutes + 0.8 * miles" +
                          ": " +
                          (minutes * 0.2 + miles * 0.8)
                      );

                      travelTimeByCar = ` ${minutes.toFixed(
                        2
                      )} minutes from your address ${addressOfWorker} by car `;
                    }

                    // end of new contsrutctions

                    const event = {
                      textToTranslate: textForDistribution(
                        Worker.workerName,
                        travelTimeByCar
                      )
                    };

                    var lambda = new aws.Lambda({
                      region: "us-east-1"
                    });

                    var paramsForTranslate = {
                      FunctionName: "english_to_spanish",
                      InvocationType: "RequestResponse",
                      LogType: "Tail",
                      Payload: JSON.stringify(event)
                    };

                    let lambdaPromiseForTranslate = lambda
                      .invoke(paramsForTranslate)
                      .promise();

                    let responseFromLambda = await lambdaPromiseForTranslate;

                    console.log(responseInSpanish);

                    let responseInSpanish = JSON.parse(
                      responseFromLambda.Payload
                    ).translatedText;

                    let messageForDistribution = textForDistribution(
                      Worker.workerName,
                      travelTimeByCar
                    );

                    let subjectForDistribution = "workpros shift offer";

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      console.log(
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ]
                      );
                      if (
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerLanguage" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].value == "Spanish" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].workerName == Worker.workerName
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );
                        messageForDistribution = responseInSpanish;
                        subjectForDistribution =
                          "oferta de trabajo en restaurante de workpros";
                      }
                    }

                    let emailOfWorker = "";

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      console.log(
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ]
                      );
                      if (
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerEmail" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].workerName == Worker.workerName
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );
                        // messageForDistribution = responseInSpanish;
                        emailOfWorker =
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .value;
                      }
                    }

                    // const Payload = {
                    //   body: messageForDistribution,
                    //   phoneNumber: Worker.workerPhoneNumber
                    // };

                    if (emailOfWorker) {
                      //add work type restriction
                      let onlyTextIfJobTypeMatches = false;

                      let jobTypeSpecified = false;

                      for (
                        let j = 0;
                        j <
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray
                          .length;
                        j++
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].key
                        );
                        if (
                          Worker.workerName ==
                            scope.state
                              .workerNameAndPhoneNumberAndShiftCountArray[j]
                              .workerName &&
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .key == "workerShiftJobTypes"
                        ) {
                          console.log(
                            scope.state
                              .workerNameAndPhoneNumberAndShiftCountArray[j]
                              .value
                          );

                          jobTypeSpecified = true;

                          //built under time pressure(while shift going on)

                          if (
                            scope.state
                              .workerNameAndPhoneNumberAndShiftCountArray[j]
                              .value
                          ) {
                            for (
                              let k = 0;
                              k <
                              scope.state
                                .workerNameAndPhoneNumberAndShiftCountArray[j]
                                .value.length;
                              k++
                            ) {
                              if (
                                scope.state.shiftJobType
                                  .toLowerCase()
                                  .includes(
                                    scope.state
                                      .workerNameAndPhoneNumberAndShiftCountArray[
                                      j
                                    ].value[k]
                                  )
                              ) {
                                console.log("yes this job type is included");
                                console.log(
                                  scope.state
                                    .workerNameAndPhoneNumberAndShiftCountArray[
                                    j
                                  ].value[k]
                                );
                                onlyTextIfJobTypeMatches = true;
                              }
                            }
                          }
                        }
                      }

                      console.log(jobTypeSpecified);
                      console.log(onlyTextIfJobTypeMatches);

                      if (
                        (jobTypeSpecified && onlyTextIfJobTypeMatches) ||
                        !jobTypeSpecified
                      ) {
                        const Payload = {
                          emailAddress: emailOfWorker,
                          emailSubject: subjectForDistribution,
                          emailBody: messageForDistribution,
                          body: " by email " + messageForDistribution
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

                        SaveSentToDatabase(Payload, Worker.workerName);

                        distributeLAShiftResponse += JSON.stringify(Payload);
                      }
                    }
                    scope.setState({ distributeLAShiftResponse });

                    // var lambdaForCount = new aws.Lambda({
                    //   region: "us-east-1"
                    // });

                    // const eventForCountCost = {
                    //   body: textForDistribution(Worker.workerName),
                    //   phoneNumber: Worker.workerPhoneNumber
                    // };

                    // var paramsForCount = {
                    //   FunctionName: "count_cost_by_date",
                    //   InvocationType: "RequestResponse",
                    //   LogType: "Tail",
                    //   Payload: JSON.stringify(eventForCountCost)
                    // };

                    // let lambdaPromiseForCount = lambdaForCount
                    //   .invoke(paramsForCount)
                    //   .promise();

                    // let value = await lambdaPromiseForCount;
                  }
                }}
              >
                distribute by email SHIFT to workers with message
                {textForDistribution(Worker.workerName)}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div>
        Workers NAME/PHONE NUMBER for Distribution
        <Button
          onClick={() => {
            scope.setState({
              displayPhiladelphiaWorkersForDistribution: !scope.state
                .displayPhiladelphiaWorkersForDistribution
            });
          }}
        >
          DISPLAY PHILADELPHIA workers for distribution
        </Button>
        {scope.state.displayPhiladelphiaWorkersForDistribution && (
          <div>
            {scope.state.workerNameAndPhoneNumberArray
              .sort(function(a, b) {
                return a.workerName.localeCompare(b.workerName);
              })
              .map(workerNameAndPhoneNumber => {
                if (
                  workerNameAndPhoneNumber.workerName.includes("Philadelphia")
                ) {
                  return (
                    <div style={{ margin: 10 }}>
                      Worker
                      <input
                        type="checkbox"
                        value={JSON.stringify(workerNameAndPhoneNumber)}
                        onClick={event => {
                          const WorkerNameNumberAndDateAndTimeAdded = JSON.parse(
                            event.target.value
                          );

                          let NewArrayOfWorkersNamesAndNumbers = [
                            ...scope.state.ArrayOfWorkersNamesAndNumbers,
                            WorkerNameNumberAndDateAndTimeAdded
                          ];
                          scope.setState({
                            ArrayOfWorkersNamesAndNumbers: NewArrayOfWorkersNamesAndNumbers
                          });
                        }}
                      />{" "}
                      {workerNameAndPhoneNumber.workerName}{" "}
                      {workerNameAndPhoneNumber.workerPhoneNumber}
                    </div>
                  );
                }
              })}
            <div>
              {scope.state.ArrayOfWorkersNamesAndNumbers.map(Worker => {
                return <div>{JSON.stringify(Worker)}</div>;
              })}
              <Button
                onClick={() => {
                  let NewArrayOfWorkersNamesAndNumbers = [];

                  for (
                    let i = 0;
                    i < scope.state.workerNameAndPhoneNumberArray.length;
                    i++
                  ) {
                    const WorkerNameNumberAndDateAndTimeAdded =
                      scope.state.workerNameAndPhoneNumberArray[i];
                    if (
                      WorkerNameNumberAndDateAndTimeAdded.workerName.includes(
                        "Philadelphia"
                      )
                    ) {
                      NewArrayOfWorkersNamesAndNumbers.push(
                        WorkerNameNumberAndDateAndTimeAdded
                      );
                    }
                  }

                  scope.setState(
                    {
                      ArrayOfWorkersNamesAndNumbers: NewArrayOfWorkersNamesAndNumbers
                    },
                    () => {
                      // this.afterSetStateFinished();
                      console.log(scope.state.ArrayOfWorkersNamesAndNumbers);
                    }
                  );
                }}
              >
                select ALL Philadelphia workers
              </Button>
              <Button
                style={{ textTransform: "none" }}
                onClick={async () => {
                  //use promises.all here
                  // create all of the promises
                  // execute simultaneously with promises.all
                  for (
                    let i = 0;
                    i < scope.state.ArrayOfWorkersNamesAndNumbers.length;
                    i++
                  ) {
                    console.log(scope.state.ArrayOfWorkersNamesAndNumbers[i]);
                    const Worker = scope.state.ArrayOfWorkersNamesAndNumbers[i];
                    console.log(Worker.workerName);
                    console.log(moment().format("dddd"));

                    //nse construction
                    let addressOfWorker = "";

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      if (
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerAddress" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].workerName == Worker.workerName
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );
                        addressOfWorker =
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .value;
                      }
                    }

                    let travelTimeByCar = "";

                    if (addressOfWorker) {
                      let lambda = new aws.Lambda({
                        region: "us-east-1"
                      });
                      const Payload = {
                        origins: [addressOfWorker],
                        destinations: [scope.state.shiftAddress]
                      };
                      let params = {
                        FunctionName: "get_distances",
                        InvocationType: "RequestResponse",
                        LogType: "Tail",
                        Payload: JSON.stringify(Payload)
                      };
                      let lambdaPromise = lambda.invoke(params).promise();
                      let value = await lambdaPromise;

                      console.log(value);

                      let distanceValue = JSON.parse(value.Payload)[0].distance
                        .value;

                      let durationValue = JSON.parse(value.Payload)[0].duration
                        .value;

                      let kilometers = parseInt(distanceValue) / 1000;

                      let miles = parseInt(kilometers) * 0.621371;

                      let hours = "";
                      let minutes = parseInt(durationValue) / 60;

                      console.log(value.Payload);

                      console.log(
                        "estimated price is 0.2 * minutes + 0.8 * miles" +
                          ": " +
                          (minutes * 0.2 + miles * 0.8)
                      );

                      travelTimeByCar = ` ${minutes} minutes from your address ${addressOfWorker} by car `;
                    }

                    // end of new contsrutctions

                    const event = {
                      textToTranslate: textForDistribution(
                        Worker.workerName,
                        travelTimeByCar
                      )
                    };

                    var lambda = new aws.Lambda({
                      region: "us-east-1"
                    });

                    var paramsForTranslate = {
                      FunctionName: "english_to_spanish",
                      InvocationType: "RequestResponse",
                      LogType: "Tail",
                      Payload: JSON.stringify(event)
                    };

                    let lambdaPromiseForTranslate = lambda
                      .invoke(paramsForTranslate)
                      .promise();

                    let responseFromLambda = await lambdaPromiseForTranslate;

                    console.log(responseInSpanish);

                    let responseInSpanish = JSON.parse(
                      responseFromLambda.Payload
                    ).translatedText;

                    let messageForDistribution = textForDistribution(
                      Worker.workerName,
                      travelTimeByCar
                    );

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      console.log(
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ]
                      );
                      if (
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerLanguage" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].value == "Spanish" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].workerName == Worker.workerName
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );
                        messageForDistribution = responseInSpanish;
                      }
                    }

                    const Payload = {
                      body: messageForDistribution,
                      phoneNumber: Worker.workerPhoneNumber
                    };

                    //add work type restriction
                    let onlyTextIfJobTypeMatches = false;

                    let jobTypeSpecified = false;

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      console.log(
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key
                      );
                      if (
                        Worker.workerName ==
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .workerName &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerShiftJobTypes"
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );

                        jobTypeSpecified = true;

                        for (
                          let k = 0;
                          k <
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                            .length;
                          k++
                        ) {
                          if (
                            scope.state.shiftJobType
                              .toLowerCase()
                              .includes(
                                scope.state
                                  .workerNameAndPhoneNumberAndShiftCountArray[j]
                                  .value[k]
                              )
                          ) {
                            console.log("yes this job type is included");
                            console.log(
                              scope.state
                                .workerNameAndPhoneNumberAndShiftCountArray[j]
                                .value[k]
                            );
                            onlyTextIfJobTypeMatches = true;
                          }
                        }
                      }
                    }

                    console.log(jobTypeSpecified);
                    console.log(onlyTextIfJobTypeMatches);

                    if (
                      (jobTypeSpecified && onlyTextIfJobTypeMatches) ||
                      !jobTypeSpecified
                    ) {
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

                      SaveSentToDatabase(Payload, Worker.workerName);

                      var lambdaForCount = new aws.Lambda({
                        region: "us-east-1"
                      });

                      const eventForCount = {
                        body: textForDistribution(
                          Worker.workerName,
                          travelTimeByCar
                        ),
                        phoneNumber: Worker.workerPhoneNumber
                      };

                      var paramsForCount = {
                        FunctionName: "count_cost_by_date",
                        InvocationType: "RequestResponse",
                        LogType: "Tail",
                        Payload: JSON.stringify(eventForCount)
                      };

                      let lambdaPromiseForCount = lambdaForCount
                        .invoke(paramsForCount)
                        .promise();

                      let value = await lambdaPromiseForCount;
                    }
                  }
                }}
              >
                distribute SHIFT to workers with message
                {textForDistribution(Worker.workerName)}
              </Button>
              <Button
                style={{ textTransform: "none" }}
                onClick={async () => {
                  let distributeLAShiftResponse = "";

                  for (
                    let i = 0;
                    i < scope.state.ArrayOfWorkersNamesAndNumbers.length;
                    i++
                  ) {
                    const Worker = scope.state.ArrayOfWorkersNamesAndNumbers[i];

                    //nse construction
                    let addressOfWorker = "";

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      if (
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerAddress" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].workerName == Worker.workerName
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );
                        addressOfWorker =
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .value;
                      }
                    }

                    let travelTimeByCar = "";

                    if (addressOfWorker) {
                      let lambda = new aws.Lambda({
                        region: "us-east-1"
                      });
                      const Payload = {
                        origins: [addressOfWorker],
                        destinations: [scope.state.shiftAddress]
                      };
                      let params = {
                        FunctionName: "get_distances",
                        InvocationType: "RequestResponse",
                        LogType: "Tail",
                        Payload: JSON.stringify(Payload)
                      };
                      let lambdaPromise = lambda.invoke(params).promise();
                      let value = await lambdaPromise;

                      let distanceValue = JSON.parse(value.Payload)[0].distance
                        .value;

                      let durationValue = JSON.parse(value.Payload)[0].duration
                        .value;

                      let kilometers = parseInt(distanceValue) / 1000;

                      let miles = parseInt(kilometers) * 0.621371;

                      let hours = "";
                      let minutes = parseInt(durationValue) / 60;

                      console.log(value.Payload);

                      console.log(
                        "estimated price is 0.2 * minutes + 0.8 * miles" +
                          ": " +
                          (minutes * 0.2 + miles * 0.8)
                      );

                      travelTimeByCar = ` ${minutes.toFixed(
                        2
                      )} minutes from your address ${addressOfWorker} by car `;
                    }

                    // end of new contsrutctions

                    const event = {
                      textToTranslate: textForDistribution(
                        Worker.workerName,
                        travelTimeByCar
                      )
                    };

                    var lambda = new aws.Lambda({
                      region: "us-east-1"
                    });

                    var paramsForTranslate = {
                      FunctionName: "english_to_spanish",
                      InvocationType: "RequestResponse",
                      LogType: "Tail",
                      Payload: JSON.stringify(event)
                    };

                    let lambdaPromiseForTranslate = lambda
                      .invoke(paramsForTranslate)
                      .promise();

                    let responseFromLambda = await lambdaPromiseForTranslate;

                    console.log(responseInSpanish);

                    let responseInSpanish = JSON.parse(
                      responseFromLambda.Payload
                    ).translatedText;

                    let messageForDistribution = textForDistribution(
                      Worker.workerName,
                      travelTimeByCar
                    );

                    let subjectForDistribution = "workpros shift offer";

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      console.log(
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ]
                      );
                      if (
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerLanguage" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].value == "Spanish" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].workerName == Worker.workerName
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );
                        messageForDistribution = responseInSpanish;
                        subjectForDistribution =
                          "oferta de trabajo en restaurante de workpros";
                      }
                    }

                    let emailOfWorker = "";

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      console.log(
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ]
                      );
                      if (
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerEmail" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].workerName == Worker.workerName
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );
                        // messageForDistribution = responseInSpanish;
                        emailOfWorker =
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .value;
                      }
                    }

                    if (emailOfWorker) {
                      //add work type restriction
                      let onlyTextIfJobTypeMatches = false;

                      let jobTypeSpecified = false;

                      for (
                        let j = 0;
                        j <
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray
                          .length;
                        j++
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].key
                        );
                        if (
                          Worker.workerName ==
                            scope.state
                              .workerNameAndPhoneNumberAndShiftCountArray[j]
                              .workerName &&
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .key == "workerShiftJobTypes"
                        ) {
                          console.log(
                            scope.state
                              .workerNameAndPhoneNumberAndShiftCountArray[j]
                              .value
                          );

                          jobTypeSpecified = true;

                          for (
                            let k = 0;
                            k <
                            scope.state
                              .workerNameAndPhoneNumberAndShiftCountArray[j]
                              .value.length;
                            k++
                          ) {
                            if (
                              scope.state.shiftJobType
                                .toLowerCase()
                                .includes(
                                  scope.state
                                    .workerNameAndPhoneNumberAndShiftCountArray[
                                    j
                                  ].value[k]
                                )
                            ) {
                              console.log("yes this job type is included");
                              console.log(
                                scope.state
                                  .workerNameAndPhoneNumberAndShiftCountArray[j]
                                  .value[k]
                              );
                              onlyTextIfJobTypeMatches = true;
                            }
                          }
                        }
                      }

                      console.log(jobTypeSpecified);
                      console.log(onlyTextIfJobTypeMatches);

                      if (
                        (jobTypeSpecified && onlyTextIfJobTypeMatches) ||
                        !jobTypeSpecified
                      ) {
                        const Payload = {
                          emailAddress: emailOfWorker,
                          emailSubject: subjectForDistribution,
                          emailBody: messageForDistribution,
                          body: " by email " + messageForDistribution
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

                        SaveSentToDatabase(Payload, Worker.workerName);

                        distributeLAShiftResponse += JSON.stringify(Payload);
                      }
                    }
                    scope.setState({ distributeLAShiftResponse });
                  }
                }}
              >
                distribute by email SHIFT to workers with message
                {textForDistribution(Worker.workerName)}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div>
        Workers NAME/PHONE NUMBER for Distribution
        <Button
          onClick={() => {
            scope.setState({
              displayDallasWorkersForDistribution: !scope.state
                .displayDallasWorkersForDistribution
            });
          }}
        >
          DISPLAY DALLAS workers for distribution
        </Button>
        {scope.state.displayDallasWorkersForDistribution && (
          <div>
            {scope.state.workerNameAndPhoneNumberArray
              .sort(function(a, b) {
                return a.workerName.localeCompare(b.workerName);
              })
              .map(workerNameAndPhoneNumber => {
                if (workerNameAndPhoneNumber.workerName.includes("Dallas")) {
                  return (
                    <div style={{ margin: 10 }}>
                      Worker
                      <input
                        type="checkbox"
                        value={JSON.stringify(workerNameAndPhoneNumber)}
                        onClick={event => {
                          console.log(JSON.parse(event.target.value));
                          const WorkerNameNumberAndDateAndTimeAdded = JSON.parse(
                            event.target.value
                          );

                          let NewArrayOfWorkersNamesAndNumbers = [
                            ...scope.state.ArrayOfWorkersNamesAndNumbers,
                            WorkerNameNumberAndDateAndTimeAdded
                          ];
                          scope.setState({
                            ArrayOfWorkersNamesAndNumbers: NewArrayOfWorkersNamesAndNumbers
                          });
                        }}
                      />{" "}
                      {workerNameAndPhoneNumber.workerName}{" "}
                      {workerNameAndPhoneNumber.workerPhoneNumber}
                    </div>
                  );
                }
              })}
            <div>
              {scope.state.ArrayOfWorkersNamesAndNumbers.map(Worker => {
                return <div>{JSON.stringify(Worker)}</div>;
              })}
              <Button
                onClick={() => {
                  let NewArrayOfWorkersNamesAndNumbers = [];
                  console.log(scope.state.ArrayOfWorkersNamesAndNumbers);
                  for (
                    let i = 0;
                    i < scope.state.workerNameAndPhoneNumberArray.length;
                    i++
                  ) {
                    const WorkerNameNumberAndDateAndTimeAdded =
                      scope.state.workerNameAndPhoneNumberArray[i];
                    if (
                      WorkerNameNumberAndDateAndTimeAdded.workerName.includes(
                        "Dallas"
                      )
                    ) {
                      console.log(WorkerNameNumberAndDateAndTimeAdded);
                      NewArrayOfWorkersNamesAndNumbers.push(
                        WorkerNameNumberAndDateAndTimeAdded
                      );
                    }
                  }
                  console.log(NewArrayOfWorkersNamesAndNumbers);
                  scope.setState(
                    {
                      ArrayOfWorkersNamesAndNumbers: NewArrayOfWorkersNamesAndNumbers
                    },
                    () => {
                      // this.afterSetStateFinished();
                      console.log(scope.state.ArrayOfWorkersNamesAndNumbers);
                    }
                  );
                }}
              >
                select ALL Dallas workers
              </Button>
              <Button
                style={{ textTransform: "none" }}
                onClick={async () => {
                  let distributeDallasShiftResponse = "";
                  for (
                    let i = 0;
                    i < scope.state.ArrayOfWorkersNamesAndNumbers.length;
                    i++
                  ) {
                    const Worker = scope.state.ArrayOfWorkersNamesAndNumbers[i];

                    console.log(Worker);

                    console.log(
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                    );

                    let onlyTextIfJobTypeMatches = false;

                    let jobTypeSpecified = false;

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      console.log(
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key
                      );
                      if (
                        Worker.workerName ==
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .workerName &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerShiftJobTypes"
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );

                        jobTypeSpecified = true;

                        for (
                          let k = 0;
                          k <
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                            .length;
                          k++
                        ) {
                          if (
                            scope.state.shiftJobType
                              .toLowerCase()
                              .includes(
                                scope.state
                                  .workerNameAndPhoneNumberAndShiftCountArray[j]
                                  .value[k]
                              )
                          ) {
                            console.log("yes this job type is included");
                            console.log(
                              scope.state
                                .workerNameAndPhoneNumberAndShiftCountArray[j]
                                .value[k]
                            );
                            onlyTextIfJobTypeMatches = true;
                          }
                        }
                      }
                    }

                    console.log(jobTypeSpecified);
                    console.log(onlyTextIfJobTypeMatches);

                    if (
                      (jobTypeSpecified && onlyTextIfJobTypeMatches) ||
                      !jobTypeSpecified
                    ) {
                      //nse construction
                      let addressOfWorker = "";

                      for (
                        let j = 0;
                        j <
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray
                          .length;
                        j++
                      ) {
                        if (
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .key == "workerAddress" &&
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .workerName == Worker.workerName
                        ) {
                          console.log(
                            scope.state
                              .workerNameAndPhoneNumberAndShiftCountArray[j]
                              .value
                          );
                          addressOfWorker =
                            scope.state
                              .workerNameAndPhoneNumberAndShiftCountArray[j]
                              .value;
                        }
                      }

                      let travelTimeByCar = "";

                      if (addressOfWorker) {
                        let lambda = new aws.Lambda({
                          region: "us-east-1"
                        });
                        const Payload = {
                          origins: [addressOfWorker],
                          destinations: [scope.state.shiftAddress]
                        };
                        let params = {
                          FunctionName: "get_distances",
                          InvocationType: "RequestResponse",
                          LogType: "Tail",
                          Payload: JSON.stringify(Payload)
                        };
                        let lambdaPromise = lambda.invoke(params).promise();
                        let value = await lambdaPromise;

                        console.log(value);

                        let distanceValue = JSON.parse(value.Payload)[0]
                          .distance.value;

                        let durationValue = JSON.parse(value.Payload)[0]
                          .duration.value;

                        let kilometers = parseInt(distanceValue) / 1000;

                        let miles = parseInt(kilometers) * 0.621371;

                        let hours = "";
                        let minutes = parseInt(durationValue) / 60;

                        console.log(value.Payload);

                        console.log(
                          "estimated price is 0.2 * minutes + 0.8 * miles" +
                            ": " +
                            (minutes * 0.2 + miles * 0.8)
                        );

                        travelTimeByCar = ` ${minutes.toFixed(
                          2
                        )} minutes from your address ${addressOfWorker} by car `;
                      }

                      // end of new contsrutctions

                      var lambda = new aws.Lambda({
                        region: "us-east-1"
                      });

                      const eventForTranslation = {
                        textToTranslate: textForDistribution(
                          Worker.workerName,
                          travelTimeByCar
                        )
                      };

                      var paramsForTranslate = {
                        FunctionName: "english_to_spanish",
                        InvocationType: "RequestResponse",
                        LogType: "Tail",
                        Payload: JSON.stringify(eventForTranslation)
                      };

                      let lambdaPromiseForTranslate = lambda
                        .invoke(paramsForTranslate)
                        .promise();

                      let responseFromLambda = await lambdaPromiseForTranslate;

                      console.log(responseFromLambda);

                      let responseInSpanish = JSON.parse(
                        responseFromLambda.Payload
                      ).translatedText;

                      console.log(responseInSpanish);

                      let messageForDistribution = textForDistribution(
                        Worker.workerName,
                        travelTimeByCar
                      );

                      for (
                        let j = 0;
                        j <
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray
                          .length;
                        j++
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                        );
                        if (
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .key == "workerLanguage" &&
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .value == "Spanish" &&
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .workerName == Worker.workerName
                        ) {
                          console.log(
                            scope.state
                              .workerNameAndPhoneNumberAndShiftCountArray[j]
                              .value
                          );
                          messageForDistribution = responseInSpanish;
                        }
                      }

                      const Payload = {
                        body: messageForDistribution,
                        phoneNumber: Worker.workerPhoneNumber
                      };

                      console.log(Payload);
                      let paramsForText = {
                        FunctionName: "send_text",
                        InvocationType: "RequestResponse",
                        LogType: "Tail",
                        Payload: JSON.stringify(Payload)
                      };
                      var lambdaForText = new aws.Lambda({
                        region: "us-east-1"
                      });
                      let lambdaPromise = lambdaForText
                        .invoke(paramsForText)
                        .promise();

                      SaveSentToDatabase(Payload, Worker.workerName);

                      var lambdaForCount = new aws.Lambda({
                        region: "us-east-1"
                      });

                      const event = {
                        body: textForDistribution(Worker.workerName),
                        phoneNumber: Worker.workerPhoneNumber
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
                    }
                  }
                }}
              >
                distribute SHIFT to workers with message{" "}
                {textForDistribution(Worker.workerName)}
              </Button>
              <Button
                style={{ textTransform: "none" }}
                onClick={async () => {
                  let distributeLAShiftResponse = "";

                  for (
                    let i = 0;
                    i < scope.state.ArrayOfWorkersNamesAndNumbers.length;
                    i++
                  ) {
                    const Worker = scope.state.ArrayOfWorkersNamesAndNumbers[i];

                    //nse construction
                    let addressOfWorker = "";

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      if (
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerAddress" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].workerName == Worker.workerName
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );
                        addressOfWorker =
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .value;
                      }
                    }

                    let travelTimeByCar = "";

                    if (addressOfWorker) {
                      let lambda = new aws.Lambda({
                        region: "us-east-1"
                      });
                      const Payload = {
                        origins: [addressOfWorker],
                        destinations: [scope.state.shiftAddress]
                      };
                      let params = {
                        FunctionName: "get_distances",
                        InvocationType: "RequestResponse",
                        LogType: "Tail",
                        Payload: JSON.stringify(Payload)
                      };
                      let lambdaPromise = lambda.invoke(params).promise();
                      let value = await lambdaPromise;

                      console.log(value);

                      let distanceValue = JSON.parse(value.Payload)[0].distance
                        .value;

                      let durationValue = JSON.parse(value.Payload)[0].duration
                        .value;

                      let kilometers = parseInt(distanceValue) / 1000;

                      let miles = parseInt(kilometers) * 0.621371;

                      let hours = "";
                      let minutes = parseInt(durationValue) / 60;

                      console.log(value.Payload);

                      console.log(
                        "estimated price is 0.2 * minutes + 0.8 * miles" +
                          ": " +
                          (minutes * 0.2 + miles * 0.8)
                      );

                      travelTimeByCar = ` ${minutes.toFixed(
                        2
                      )} minutes from your address ${addressOfWorker} by car `;
                    }

                    // end of new contsrutctions

                    const event = {
                      textToTranslate: textForDistribution(
                        Worker.workerName,
                        travelTimeByCar
                      )
                    };

                    var lambda = new aws.Lambda({
                      region: "us-east-1"
                    });

                    var paramsForTranslate = {
                      FunctionName: "english_to_spanish",
                      InvocationType: "RequestResponse",
                      LogType: "Tail",
                      Payload: JSON.stringify(event)
                    };

                    let lambdaPromiseForTranslate = lambda
                      .invoke(paramsForTranslate)
                      .promise();

                    let responseFromLambda = await lambdaPromiseForTranslate;

                    console.log(responseInSpanish);

                    let responseInSpanish = JSON.parse(
                      responseFromLambda.Payload
                    ).translatedText;

                    let messageForDistribution = textForDistribution(
                      Worker.workerName,
                      travelTimeByCar
                    );

                    let subjectForDistribution = "workpros shift offer";

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      console.log(
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ]
                      );
                      if (
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerLanguage" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].value == "Spanish" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].workerName == Worker.workerName
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );
                        messageForDistribution = responseInSpanish;
                        subjectForDistribution =
                          "oferta de trabajo en restaurante de workpros";
                      }
                    }

                    let emailOfWorker = "";

                    for (
                      let j = 0;
                      j <
                      scope.state.workerNameAndPhoneNumberAndShiftCountArray
                        .length;
                      j++
                    ) {
                      console.log(
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ]
                      );
                      if (
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].key == "workerEmail" &&
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray[
                          j
                        ].workerName == Worker.workerName
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].value
                        );
                        // messageForDistribution = responseInSpanish;
                        emailOfWorker =
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .value;
                      }
                    }

                    if (emailOfWorker) {
                      let onlyTextIfJobTypeMatches = false;

                      let jobTypeSpecified = false;

                      for (
                        let j = 0;
                        j <
                        scope.state.workerNameAndPhoneNumberAndShiftCountArray
                          .length;
                        j++
                      ) {
                        console.log(
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j].key
                        );
                        if (
                          Worker.workerName ==
                            scope.state
                              .workerNameAndPhoneNumberAndShiftCountArray[j]
                              .workerName &&
                          scope.state
                            .workerNameAndPhoneNumberAndShiftCountArray[j]
                            .key == "workerShiftJobTypes"
                        ) {
                          console.log(
                            scope.state
                              .workerNameAndPhoneNumberAndShiftCountArray[j]
                              .value
                          );

                          jobTypeSpecified = true;

                          for (
                            let k = 0;
                            k <
                            scope.state
                              .workerNameAndPhoneNumberAndShiftCountArray[j]
                              .value.length;
                            k++
                          ) {
                            if (
                              scope.state.shiftJobType
                                .toLowerCase()
                                .includes(
                                  scope.state
                                    .workerNameAndPhoneNumberAndShiftCountArray[
                                    j
                                  ].value[k]
                                )
                            ) {
                              console.log("yes this job type is included");
                              console.log(
                                scope.state
                                  .workerNameAndPhoneNumberAndShiftCountArray[j]
                                  .value[k]
                              );
                              onlyTextIfJobTypeMatches = true;
                            }
                          }
                        }
                      }

                      console.log(jobTypeSpecified);
                      console.log(onlyTextIfJobTypeMatches);

                      if (
                        (jobTypeSpecified && onlyTextIfJobTypeMatches) ||
                        !jobTypeSpecified
                      ) {
                        const Payload = {
                          emailAddress: emailOfWorker,
                          emailSubject: subjectForDistribution,
                          emailBody: messageForDistribution,
                          body: " by email " + messageForDistribution
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

                        SaveSentToDatabase(Payload, Worker.workerName);

                        distributeLAShiftResponse += JSON.stringify(Payload);
                      }
                    }
                    scope.setState({ distributeLAShiftResponse });
                  }
                }}
              >
                distribute by email SHIFT to workers with message
                {textForDistribution(Worker.workerName)}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const checkIfWorkerAvailableForShift = (workerAvailability, scope) => {
  const workerAvailabilityForThatDay =
    workerAvailability[scope.state.shiftStartDayName];

  const {
    shiftStartTimeHour,
    shiftStartTimeMinute,
    shiftStartTimeMeridiem,

    shiftEndTimeHour,
    shiftEndTimeMinute,
    shiftEndTimeMeridiem
  } = scope.state;

  let goodOnStart = false;
  let fromHourWorker = 0;
  let fromHourShift = 0;

  if (workerAvailabilityForThatDay.fromMeridiem == "pm") {
    fromHourWorker = parseInt(workerAvailabilityForThatDay.fromHour) + 12;
  } else {
    if (parseInt(workerAvailabilityForThatDay.fromHour) == 12) {
      fromHourWorker = 0;
    } else {
      fromHourWorker = parseInt(workerAvailabilityForThatDay.fromHour);
    }
  }

  if (shiftStartTimeMeridiem == "pm") {
    fromHourShift = parseInt(shiftStartTimeHour) + 12;
  } else {
    fromHourShift = parseInt(shiftStartTimeHour);
  }

  if (fromHourWorker <= fromHourShift) {
    goodOnStart = true;
  }

  let goodOnEnd = false;

  let untilHourWorker = 0;
  let untilHourShift = 0;

  if (workerAvailabilityForThatDay.untilMeridiem == "pm") {
    untilHourWorker = parseInt(workerAvailabilityForThatDay.untilHour) + 12;
  } else {
    untilHourWorker = parseInt(workerAvailabilityForThatDay.untilHour);
  }

  if (shiftEndTimeMeridiem == "pm") {
    untilHourShift = parseInt(shiftEndTimeHour) + 12;
  } else {
    untilHourShift = parseInt(shiftEndTimeHour);
  }

  if (untilHourWorker >= untilHourShift) {
    goodOnEnd = true;
  }

  return goodOnStart && goodOnEnd;
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
