import React from "react";

import { publishManagerNamePhoneNumberCreditCardAndCustomerID } from "./publishMessageToTopic";
import aws from "aws-sdk";

import firebase from "firebase";

import Sound from "react-sound";

import Button from "@material-ui/core/Button";

import TextField from "@material-ui/core/TextField";

import Select from "@material-ui/core/Select";

import MenuItem from "@material-ui/core/MenuItem";

var lambda = new aws.Lambda({
  region: "us-east-1"
});
export const displayManagerPublishOptions = scope => {
  return (
    <div
      style={{
        justifyContent: "center",
        flexDirection: "column",
        display: "flex",
        alignItems: "center"
      }}
    >
      {scope.state.playDrum4 && (
        <Sound
          url={require("./Drum4.mp3")}
          playStatus={Sound.status.PLAYING}
          onLoading={() => {
            console.log("snth");
          }}
          onPlaying={() => {}}
          onFinishedPlaying={() => {}}
          loop={false}
        />
      )}
      <div>
        <TextField
          id="standard-with-placeholder"
          label="Manager Name"
          placeholder="Eddie Murphy"
          margin="normal"
          value={scope.state.managerName}
          onChange={event => {
            scope.setState({
              managerName: event.target.value
            });
          }}
        />

        <TextField
          id="standard-with-placeholder"
          label="Manager Phone Number"
          placeholder="Eddie Murphy"
          margin="normal"
          value={scope.state.managerPhoneNumber}
          onChange={event => {
            scope.setState({
              managerPhoneNumber: event.target.value
            });
          }}
        />
      </div>
      <Button
        style={{
          backgroundColor: "red"
        }}
        onClick={async () => {
          const { managerName, managerPhoneNumber } = scope.state;

          if (managerName && managerPhoneNumber) {
            const event = {
              managerName,
              managerPhoneNumber
            };
            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            var params = {
              FunctionName: "manager_name_phone_number",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(event)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let response = await lambdaPromise;
            console.log(response);

            scope.setState({
              saveManagerNameAndPhoneNumberResponse: response.Payload
            });
          } else {
            alert("Missing Value");
          }
        }}
      >
        Save Manager Name and Phone Number
      </Button>
      {scope.state.saveManagerNameAndPhoneNumberResponse}
      <div style={{ margin: 10 }}>
        Manager for DELETE Sorted ALPHABETICAL
        <Select
          value={scope.state.managerNameAndPhoneNumberForDeleteStringified}
          onChange={event => {
            scope.setState({
              managerNameAndPhoneNumberForDelete: JSON.parse(
                event.target.value
              ),
              managerNameAndPhoneNumberForDeleteStringified: event.target.value,
              managerNameForDelete: JSON.parse(event.target.value).managerName
            });
          }}
        >
          {scope.state.managerNameAndPhoneNumberArray.map(
            managerNameAndPhoneNumberForDelete => {
              return (
                <MenuItem
                  value={JSON.stringify(managerNameAndPhoneNumberForDelete)}
                >
                  {managerNameAndPhoneNumberForDelete.managerName}{" "}
                  {managerNameAndPhoneNumberForDelete.managerPhoneNumber}
                </MenuItem>
              );
            }
          )}
        </Select>
      </div>
      <Button
        onClick={() => {
          for (let i = 0; i < scope.state.managerUIDArray.length; i++) {
            console.log(
              scope.state.managerUIDArray[i].managerName ==
                scope.state.managerNameForDelete
            );
            if (
              scope.state.managerUIDArray[i].managerName ==
              scope.state.managerNameForDelete
            ) {
              firebase
                .database()
                .ref(
                  "managerNamePhoneNumber/" + scope.state.managerUIDArray[i].uid
                )
                .remove()
                .then(() => {
                  scope.setState({ managerDeleteResponse: "success" });
                });
            }
          }
        }}
      >
        Delete Manager {scope.state.workerNameForDelete}
      </Button>
      {scope.state.managerDeleteResponse}
      <div style={{ margin: 10 }}>
        Manager
        <Select
          value={scope.state.managerNameAndPhoneNumberStringified}
          onChange={event => {
            console.log(event.target.value);
            scope.setState({
              managerNameAndPhoneNumber: JSON.parse(event.target.value),
              managerNameAndPhoneNumberStringified: event.target.value,
              managerName: JSON.parse(event.target.value).managerName,
              managerPhoneNumber: JSON.parse(event.target.value)
                .managerPhoneNumber,
              managerOfShift: {
                managerName: JSON.parse(event.target.value).managerName,
                managerPhoneNumber: JSON.parse(event.target.value)
                  .managerPhoneNumber
              }
            });
          }}
        >
          {scope.state.managerNameAndPhoneNumberArray.map(
            managerNameAndPhoneNumber => {
              return (
                <MenuItem value={JSON.stringify(managerNameAndPhoneNumber)}>
                  {managerNameAndPhoneNumber.managerName}{" "}
                  {managerNameAndPhoneNumber.managerPhoneNumber}
                </MenuItem>
              );
            }
          )}
        </Select>
      </div>
      <div>
        <TextField
          id="standard-with-placeholder"
          label="Manager Name"
          placeholder="Eddie Murphy"
          margin="normal"
          value={scope.state.managerName}
          onChange={event => {
            scope.setState({
              managerName: event.target.value
            });
          }}
        />
      </div>
      <div>
        <TextField
          id="standard-with-placeholder"
          label="Phone Number"
          placeholder="1231231234"
          margin="normal"
          value={scope.state.managerPhoneNumber}
          onChange={event => {
            scope.setState({
              managerPhoneNumber: event.target.value
            });
            console.log(scope.state.managerOfShift);
          }}
        />
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
      <div>
        FULL NAME 🤵
        {textButton(
          `✋ Hi ${scope.state.managerName.toUpperCase()} please reply with your FULL NAME 🤵 to create shifts 🤳 for DISHWASHERS 🍽, BUSSERS 🦵 and PREP and LINE COOKS 👨‍🍳 using WorkPros.io 😁.`,
          `${scope.state.managerPhoneNumber}`,
          `${scope.state.managerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        BANNED 🙅‍♂️
        {textButton(
          `✋ Hi PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, ${scope.state.workerName.toUpperCase()} has been BANNED 🙅‍♂️ from WorkPros.io for INAPPROPRIATE BEHAVIOR 🤬.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        ASK ADDRESS 📍
        {textButton(
          `✋ Hi MANAGER 🤴 ${scope.state.managerName.toUpperCase()} please reply with the ADDRESS 📍 of YOUR restaurant 🏰.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        ASK NAME
        {textButton(
          `✋ Hi MANAGER 🤴 ${scope.state.managerName.toUpperCase()} please reply with the FULL NAME of YOUR restaurant 🏰.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        ASK DAY 📆
        {textButton(
          `✋ Hi MANAGER 🤴 ${scope.state.managerName.toUpperCase()} please reply with the DAY 📆 you want a WORKPRO 🤵 to ${scope.state.restaurantAddress.toUpperCase()}.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        ASK TIME 🕘
        {textButton(
          `✋ Hi MANAGER 🤴 ${scope.state.managerName.toUpperCase()} please reply with the TIME 🕘 you want a WORKPRO 🤵 on ${scope.state.shiftStartDayName.toUpperCase()} at ${scope.state.restaurantName.toUpperCase()}.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        ASK DURATION 🕘
        {textButton(
          `✋ Hi MANAGER 🤴 ${scope.state.managerName.toUpperCase()} please reply with the duration in hours 🕘 you want a WORKPRO 🤵 on ${scope.state.shiftStartDayName.toUpperCase()} at ${
            scope.state.shiftStartTimeHour
          }:${scope.state.shiftStartTimeMinute} ${
            scope.state.shiftStartTimeMeridiem
          } 🕐 at ${scope.state.restaurantName.toUpperCase()}.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        ASK TYPE
        {textButton(
          `✋ Hi MANAGER 🤴 ${scope.state.managerName.toUpperCase()} would you like a dishwasher, busser, prep cook or line cook on ${scope.state.shiftStartDayName.toUpperCase()} at ${scope.state.restaurantName.toUpperCase()}.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        PARKING
        {textButton(
          `Hi${scope.state.additionalTitle.toUpperCase()} MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, do you have any unique or additional parking instructions?`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        SCHEDULED SHIFT 📆 🕐
        {textButton(
          `Hi${scope.state.additionalTitle.toUpperCase()} PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()} WorkPros.io has scheduled ${scope.state.shiftQuantityOfWorkers.toUpperCase()} ${scope.state.shiftJobType.toUpperCase()} 🤵 for ${scope.state.shiftStartDayName.toUpperCase()} 📆 at ${
            scope.state.shiftStartTimeHour
          }:${scope.state.shiftStartTimeMinute} ${
            scope.state.shiftStartTimeMeridiem
          } 🕐 at ${scope.state.shiftAddress.toUpperCase()} 📍.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        CALCULATING 📆 🕐
        {textButton(
          `Hi${scope.state.additionalTitle.toUpperCase()} MANAGER 🤴 ${scope.state.managerName.toUpperCase()} WorkPros.io is calculating a price estimate for ${scope.state.shiftQuantityOfWorkers.toUpperCase()} ${scope.state.shiftJobType.toUpperCase()} 🤵 for ${scope.state.shiftStartDayName.toUpperCase()} 📆 at ${
            scope.state.shiftStartTimeHour
          }:${scope.state.shiftStartTimeMinute} ${
            scope.state.shiftStartTimeMeridiem
          } 🕐 at ${scope.state.shiftAddress.toUpperCase()} 📍.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        WORKER CONFIRMED 📆 🕐
        {textButton(
          `Hi${scope.state.additionalTitle.toUpperCase()} PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()} WorkPros.io has finalized scheduling for ${scope.state.workerName.toUpperCase()} 👨‍💼 for ${
            scope.state.shiftLowestPayment
          } for ${scope.state.shiftStartDayName.toUpperCase()} 📆 at ${
            scope.state.shiftStartTimeHour
          }:${scope.state.shiftStartTimeMinute} ${
            scope.state.shiftStartTimeMeridiem
          } 🕐 at ${scope.state.shiftAddress.toUpperCase()} 📍.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        <TextField
          id="standard-with-placeholder"
          label="confirmation code"
          placeholder="1234"
          margin="normal"
          value={scope.state.paymentCode}
          onChange={event => {
            scope.setState({
              paymentCode: event.target.value
            });
          }}
        />
      </div>
      <Button
        onClick={() => {
          var val = Math.floor(1000 + Math.random() * 9000);
          scope.setState({ paymentCode: val + "" });
        }}
      >
        Autogenerate 4 digit code
      </Button>
      <div>
        PRICE ESTIMATE
        {textButton(
          `Your WorkPros.io price estimate can be found at ${`https://www.workpros.io/?code=${scope.state.paymentCode}`}.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <Button
        onClick={async () => {
          var lambda = new aws.Lambda({
            region: "us-east-1"
          });

          let paymentCode = Math.floor(1000 + Math.random() * 9000) + "";
          scope.setState({ paymentCode: paymentCode + "" });

          let {
            // paymentCode,
            restaurantName,
            managerName,
            managerPhoneNumber,
            biddingEndTime,
            shiftAddress,
            shiftEndTimeHour,
            shiftEndTimeMeridiem,
            shiftEndTimeMinute,
            shiftJobType,
            shiftQuantityOfWorkers,
            shiftStartASAPTodayTomorrowOther,
            shiftStartDate,
            shiftStartDateDay,
            shiftStartDateMonth,
            shiftStartDateYear,
            shiftStartDayName,
            shiftStartTimeHour,
            shiftStartTimeMeridiem,
            shiftStartTimeMinute,
            shiftLowestPayment,
            uberCost,
            freeFirstMonth
          } = scope.state;

          let { restaurantAddress } = scope.state.restaurantLocation;

          console.log(
            paymentCode,
            restaurantName,
            restaurantAddress,
            managerName,
            managerPhoneNumber,
            biddingEndTime,
            shiftAddress,
            shiftEndTimeHour,
            shiftEndTimeMeridiem,
            shiftEndTimeMinute,
            shiftJobType,
            shiftQuantityOfWorkers,
            shiftStartASAPTodayTomorrowOther,
            shiftStartDate,
            shiftStartDateDay,
            shiftStartDateMonth,
            shiftStartDateYear,
            shiftStartDayName,
            shiftStartTimeHour,
            shiftStartTimeMeridiem,
            shiftStartTimeMinute,
            shiftLowestPayment,
            uberCost
          );
          if (
            // paymentCode &&
            restaurantName &&
            restaurantAddress &&
            managerName &&
            managerPhoneNumber &&
            biddingEndTime &&
            shiftAddress &&
            shiftEndTimeHour &&
            shiftEndTimeMeridiem &&
            shiftEndTimeMinute &&
            shiftJobType &&
            shiftQuantityOfWorkers &&
            shiftStartASAPTodayTomorrowOther &&
            shiftStartDate &&
            shiftStartDateDay &&
            shiftStartDateMonth &&
            shiftStartDateYear &&
            shiftStartDayName &&
            shiftStartTimeHour &&
            shiftStartTimeMeridiem &&
            shiftStartTimeMinute &&
            shiftLowestPayment
            //  &&
            // uberCost
          ) {
            const Payload = {
              paymentCode,

              restaurantName,
              restaurantAddress,

              managerOfShift: {
                managerName,
                managerPhoneNumber
              },

              biddingEndTime,

              shiftAddress,
              shiftEndTimeHour,
              shiftEndTimeMeridiem,
              shiftEndTimeMinute,
              shiftJobType,
              shiftLocation: {
                shiftAddress
              },
              shiftQuantityOfWorkers,
              shiftStartDate: {
                shiftStartASAPTodayTomorrowOther,
                shiftStartDate,
                shiftStartDateDay,
                shiftStartDateMonth,
                shiftStartDateYear
              },
              shiftStartDayName,
              shiftStartTimeHour,
              shiftStartTimeMeridiem,
              shiftStartTimeMinute,

              shiftLowestPayment,
              uberCost,
              freeFirstMonth
            };

            var params = {
              FunctionName: "payment_code_with_restaurant_manager_and_shift",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(Payload)
            };

            let lambdaPromise = lambda.invoke(params).promise();

            let value = await lambdaPromise;

            alert("published price estimate for public front end");
          } else {
            alert(
              "missing value for shift, restaurant, manager or confirmation code"
            );
          }
        }}
      >
        Publish Shift {scope.state.shiftAddress} Restaurant
        {scope.state.restaurantName} Manager
        {scope.state.managerName} Lowest Pay {scope.state.shiftLowestPayment}
        Transport Cost {scope.state.uberCost} and Payment Code
        {scope.state.paymentCode}
        and values {scope.state.paymentCode} {scope.state.restaurantName}
        {scope.state.restaurantAddress}
        managerOfShift: {scope.state.managerName}{" "}
        {scope.state.managerPhoneNumber}, biddingEndTime{" "}
        {scope.state.biddingEndTime}
        shiftAddress {scope.state.shiftAddress} shiftEndTimeHour{" "}
        {scope.state.shiftEndTimeHour}
        shiftEndTimeMeridiem {scope.state.shiftEndTimeMeridiem}
        shiftEndTimeMinute {scope.state.shiftEndTimeMinute} shiftJobType{" "}
        {scope.state.shiftJobType}
        shiftLocation: shiftAddress {scope.state.shiftAddress},
        shiftQuantityOfWorkers {scope.state.shiftQuantityOfWorkers}{" "}
        shiftStartDate {scope.state.shiftStartDate.toString()}: (
        shiftStartASAPTodayTomorrowOther{" "}
        {scope.state.shiftStartASAPTodayTomorrowOther}, shiftStartDate{" "}
        {scope.state.shiftStartDate.toString()},shiftStartDateDay{" "}
        {scope.state.shiftStartDateDay}, shiftStartDateMonth{" "}
        {scope.state.shiftStartDateMonth}, shiftStartDateYear{" "}
        {scope.state.shiftStartDateYear}
        shiftStartDayName {
          scope.state.shiftStartDayName
        } shiftStartTimeHour {scope.state.shiftStartTimeHour}
        shiftStartTimeMeridiem {scope.state.shiftStartTimeMeridiem}
        shiftStartTimeMinute {scope.state.shiftStartTimeMinute}{" "}
        shiftLowestPayment {scope.state.shiftLowestPayment}
        uberCost First Month Free {scope.state.freeFirstMonth}
        {/* FIRST TIME manager - hourOfEvent: {scope.state.hourOfEvent} */}
        {/* minuteOfEvent: {scope.state.minuteOfEvent}$ */}
        {/* allNumericalBids[allNumericalBids.length - 1]:
        {scope.state.allNumericalBids.length > 0 &&
          scope.state.allNumericalBids[scope.state.allNumericalBids.length - 1]
            .bid} */}
        uberCost: ${scope.state.uberCost}
        restaurantName: {scope.state.restaurantName} && restaurantAddress:{" "}
        {scope.state.restaurantLocation
          ? scope.state.restaurantLocation.restaurantAddress
          : ""}{" "}
        && managerName: {scope.state.managerName} && managerPhoneNumber:
        {scope.state.managerPhoneNumber} && biddingEndTime:{" "}
        {scope.state.biddingEndTime} && shiftAddress: {scope.state.shiftAddress}{" "}
        && shiftEndTimeHour: {scope.state.shiftEndTimeHour} &&
        shiftEndTimeMeridiem: {scope.state.shiftEndTimeMeridiem} &&
        shiftEndTimeMinute: {scope.state.shiftEndTimeMinute} && shiftJobType:{" "}
        {scope.state.shiftJobType} && shiftQuantityOfWorkers:{" "}
        {scope.state.shiftQuantityOfWorkers} &&
        shiftStartASAPTodayTomorrowOther:{" "}
        {scope.state.shiftStartASAPTodayTomorrowOther} && shiftStartDate:{" "}
        scope.state.shiftStartDate && shiftStartDateDay:{" "}
        {scope.state.shiftStartDateDay} && shiftStartDateMonth:{" "}
        {scope.state.shiftStartDateMonth} && shiftStartDateYear:{" "}
        {scope.state.shiftStartDateYear} && shiftStartDayName:{" "}
        {scope.state.shiftStartDayName} && shiftStartTimeHour:{" "}
        {scope.state.shiftStartTimeHour} && shiftStartTimeMeridiem:{" "}
        {scope.state.shiftStartTimeMeridiem} && shiftStartTimeMinute:{" "}
        {scope.state.shiftStartTimeMinute} && shiftLowestPayment:{" "}
        {scope.state.shiftLowestPayment} && uberCost: {scope.state.uberCost} &&
        freeFirstMonth (not required): {scope.state.freeFirstMonth + ""}
      </Button>
      <div>
        <label>Shift Uber Cost</label>
        <TextField
          type="text"
          value={scope.state.uberCost}
          onChange={event => {
            scope.setState({ uberCost: event.target.value });
          }}
        />
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
      <div>
        Worker CANCELLED
        {textButton(
          `Hi${scope.state.additionalTitle.toUpperCase()} PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, your${scope.state.workerAdditionalTitle.toUpperCase()} ${scope.state.shiftJobType.toUpperCase()} ${scope.state.workerName.toUpperCase()} has CANCELLED, we are working on a low cost replacement NOW.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        REPLACEMENT
        {textButton(
          `Hi${scope.state.additionalTitle.toUpperCase()} PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, we are working on a low cost replacement NOW.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        TRANSPORT ARRIVAL TIME
        <TextField
          value={scope.state.transportArrivalTime}
          onChange={event => {
            scope.setState({ transportArrivalTime: event.target.value });
          }}
        />
      </div>
      <div>
        ADDITIONAL TITLE
        <TextField
          value={scope.state.additionalTitle}
          onChange={event => {
            scope.setState({ additionalTitle: event.target.value });
          }}
        />
      </div>
      <div>
        UBER ARRIVAL TIME 🕘
        {textButton(
          `Hi${scope.state.additionalTitle.toUpperCase()} PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, your${scope.state.workerAdditionalTitle.toUpperCase()} ${scope.state.shiftJobType.toUpperCase()} ${scope.state.workerName.toUpperCase()} 👨‍💼👞👟 is ON THE WAY 🏁 in an UBER POOL 🚖 with an ETA of ${scope.state.transportArrivalTime.toUpperCase()} ⏳ and a TOTAL COST of ${
            scope.state.shiftLowestPayment
          } 💵.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        CAR ARRIVAL TIME 🕘
        {textButton(
          `Hi${scope.state.additionalTitle.toUpperCase()} PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, your${scope.state.workerAdditionalTitle.toUpperCase()} ${scope.state.shiftJobType.toUpperCase()} ${scope.state.workerName.toUpperCase()} 👨‍💼👞👟 is ON THE WAY 🏁 in HIS OWN CAR 🚗 (NO TRANSPORT COST) with an ETA of ${scope.state.transportArrivalTime.toUpperCase()} ⏳ and a TOTAL COST of ${
            scope.state.shiftLowestPayment
          } 💵.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      WORKER ADDITIONAL TITLE
      <TextField
        value={scope.state.workerAdditionalTitle}
        onChange={event => {
          scope.setState({ workerAdditionalTitle: event.target.value });
        }}
      />
      <div>
        UPDATED UBER ARRIVAL TIME 🕘
        {textButton(
          `Hi${scope.state.additionalTitle.toUpperCase()} PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, your${scope.state.workerAdditionalTitle.toUpperCase()} ${scope.state.shiftJobType.toUpperCase()} ${scope.state.workerName.toUpperCase()} is ARRIVING at ${scope.state.transportArrivalTime.toUpperCase()} 🚦.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        UBER ARRIVED
        {textButton(
          `Hi${scope.state.additionalTitle.toUpperCase()} PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, your${scope.state.workerAdditionalTitle.toUpperCase()} ${scope.state.shiftJobType.toUpperCase()} ${scope.state.workerName.toUpperCase()} has ARRIVED on behalf of WorkPros.io.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        CHANGING START TIME 🕘
        {textButton(
          `✋ Hi PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, changing the START TIME 🕘 significantly affects the COST. `,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        BIDDING PROCESS
        {textButton(
          `✋ Hi MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, pricing is determined on a PER SHIFT 📆 basis through a HIGHLY COMPETITIVE
          BIDDING 🏆 process.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        REFERENCES
        {textButton(
          `✋ Hi MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, we have been working with TOP restaurants 🏰 for 2 YEARS and 2 MONTHS 🕯, including restaurants in LOS ANGELES like: Harvest Bar, La Gondola, Patrick's Roadhouse, Limerick's Tavern, Hank's, Blue Ribbon Sushi, Tangaroa Fish Market, POUR HAUS WINE BAR, THE TASTING KITCHEN, KASSI CLUB, THE EVELEIGH, and ÉLEPHANTE and in PHILADELPHIA like: Avola, Twenty9 Restaurant and Bar, Fine Palate and THE STONE. Please CALL for a REFERENCE.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        WORKER RATING A 🥇, B 🥈, C 🥉 or F 👎
        {textButton(
          `Hi${scope.state.additionalTitle.toUpperCase()} PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, for ${scope.state.workerName.toUpperCase()} please reply with an ANONYMOUS LETTER RATING of A 🥇, B 🥈, C 🥉 or F 👎.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      <div>
        THANK YOU 🙏
        {textButton(
          `THANK YOU 🙏 for your feedback PREMIUM MANAGER ${scope.state.managerName.toUpperCase()} 🤴.`,
          `${scope.state.managerPhoneNumber}`,
          `${scope.state.managerName.toUpperCase()}`,
          scope
        )}
      </div>
      <div>
        CANCELLED SUBSCRIPTION
        {textButton(
          `✋ Hi ${scope.state.managerName.toUpperCase()}, all SHIFTS and SUBSCRIPTIONS have been CANCELLED.`,
          scope.state.managerPhoneNumber,
          scope.state.managerName.toUpperCase(),
          scope
        )}
      </div>
      {scope.state.managerConfirmPhoneNumberResponse}
      <div>
        <TextField
          id="standard-with-placeholder"
          label="Manager Email"
          placeholder="manager@restaurant.com"
          margin="normal"
          value={scope.state.managerEmail}
          onChange={event => {
            scope.setState({
              managerEmail: event.target.value
            });
          }}
        />
      </div>
      <div>
        EMAIL 📧
        {textButton(
          `Hi ${scope.state.managerName.toUpperCase()} please reply with your EMAIL ADDRESS 📧 if you have one, for RECEIPTS 🧾 to be sent the NEXT DAY.`,
          `${scope.state.managerPhoneNumber}`,
          `${scope.state.managerName.toUpperCase()}`,
          scope
        )}
      </div>
      <Button
        onClick={async () => {
          const Payload = {
            emailBody: `WELCOME to WorkPros.io MANAGER ${scope.state.managerName.toUpperCase()}`,
            emailAddress: scope.state.managerEmail,
            emailSubject: `WELCOME MANAGER ${scope.state.managerName.toUpperCase()}`
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
            managerConfirmEmailResponse:
              response.Payload +
              `WELCOME to WorkPros.io ${scope.state.managerName.toUpperCase()}`
          });
        }}
      >
        emailBody: `WELCOME to WorkPros.io MANAGER $
        {scope.state.managerName.toUpperCase()}`
      </Button>
      {scope.state.managerConfirmEmailResponse}
      <div style={{ margin: 5 }}>
        <TextField
          id="standard-with-placeholder"
          label="Credit Card Number"
          placeholder="1234 1234 1234 1234"
          margin="normal"
          value={scope.state.managerCreditCardNumber}
          onChange={event => {
            scope.setState({
              managerCreditCardNumber: event.target.value
            });
          }}
        />
        <TextField
          id="standard-with-placeholder"
          label="Security Code 💳"
          placeholder="1234"
          margin="normal"
          value={scope.state.managerCreditCardSecurityCode}
          onChange={event => {
            scope.setState({
              managerCreditCardSecurityCode: event.target.value
            });
          }}
        />
        <TextField
          id="standard-with-placeholder"
          label="Expiry 💳"
          placeholder="12/22"
          margin="normal"
          value={scope.state.managerCreditCardExpirationDate}
          onChange={event => {
            scope.setState({
              managerCreditCardExpirationDate: event.target.value
            });
          }}
        />
      </div>
      <div>
        Manager Customer ID
        <TextField
          value={scope.state.managerCustomerID}
          onChange={event => {
            scope.setState({
              managerCustomerID: event.target.value
            });
          }}
        />
      </div>
      <Button
        style={{
          color: "red",
          margin: 5
        }}
        onClick={() => {
          publishManagerNamePhoneNumberCreditCardAndCustomerID(scope.state);
        }}
      >
        Publish Manager Name {scope.state.managerName}, Number{" "}
        {scope.state.managerPhoneNumber}, Credit Card and Customer ID
      </Button>
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
    <div>
      <Button
        variant="contained"
        style={{ textTransform: "none", backgroundColor: "red" }}
        onClick={async () => {
          scope.setState({ playDrum4: !scope.state.playDrum4 });
          let count = 0;
          let interval = setInterval(() => {
            console.log("snth");
            count++;
            console.log(count);

            if (count == 4) {
              scope.setState({ playDrum4: !scope.state.playDrum4 });
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

          console.log(response);

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

              console.log(response);

              await SaveSentToDatabase(Payload, workerName);

              scope.setState({
                workerConfirmPhoneNumberResponse: response.Payload + ""
              });
            }, 60 * 1000 * parseFloat(scope.state.repeaterInterval));
            scope.setState({ intervalId });
          }
        }}
      >
        to {workerName.toLowerCase()} send: {textMessage.toLowerCase()}
      </Button>
    </div>
  );
};

const emailButton = (
  emailSubject,
  emailBody,
  managerEmail,
  managerName,
  scope
) => {
  return (
    <Button
      color="#21b6ae"
      variant="contained"
      style={{ textTransform: "none" }}
      onClick={async () => {
        const Payload = {
          emailBody: emailBody.toLowerCase(),
          emailAddress: managerEmail,
          emailSubject: `${emailSubject}`
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
          managerConfirmEmailResponse:
            response.Payload +
            `TO ${managerName} SUBJECT: ${emailSubject} SEND: ${emailBody}`
        });
      }}
    >
      TO {managerName} SUBJECT: {emailSubject} SEND: {emailBody.toLowerCase()}{" "}
      AT: {managerEmail}
    </Button>
  );
};
