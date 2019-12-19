import React, { Component } from "react";
import aws from "aws-sdk";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import { MenuItem } from "@material-ui/core";

export const displayBidEnd = scope => {
  return (
    <div>
      <div>
        <label>
          {"End" == "Start"
            ? "Shift Start Time 🕘"
            : "EVENT TIME OCCURRENCE 🕔"}
        </label>
        {scope.state.secondsLeft && <div>{scope.state.secondsLeft}</div>}

        <Select
          value={scope.state.hourOfEvent}
          onChange={event => scope.set(event, "hourOfEvent")}
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
        <Select
          value={scope.state.minuteOfEvent}
          onChange={event => scope.set(event, "minuteOfEvent")}
        >
          <MenuItem value="00">00</MenuItem>
          <MenuItem value="05">05</MenuItem>
          <MenuItem value="10">10</MenuItem>
          <MenuItem value="15">15</MenuItem>
          <MenuItem value="20">20</MenuItem>
          <MenuItem value="25">25</MenuItem>
          <MenuItem value="30">30</MenuItem>
          <MenuItem value="35">35</MenuItem>
          <MenuItem value="40">40</MenuItem>
          <MenuItem value="45">45</MenuItem>
          <MenuItem value="50">50</MenuItem>
          <MenuItem value="55">55</MenuItem>
        </Select>
        <Select
          value={scope.state.meridiemOfEvent}
          onChange={event => scope.set(event, "meridiemOfEvent")}
        >
          <MenuItem value="am">am</MenuItem>
          <MenuItem value="pm">pm</MenuItem>
        </Select>
      </div>
      <Button
        style={{ backgroundColor: "red", textTransform: "none" }}
        onClick={async () => {
          if (!scope.state.managerName || !scope.state.managerPhoneNumber) {
            alert("manager required");
            return;
          }
          var startDate = new Date();
          // Do your operations
          var endDate = new Date();
          if (scope.state.meridiemOfEvent == "pm") {
            endDate.setHours(parseInt(scope.state.hourOfEvent) + 12);
          } else {
            endDate.setHours(parseInt(scope.state.hourOfEvent));
          }
          endDate.setMinutes(parseInt(scope.state.minuteOfEvent));

          var seconds = (endDate.getTime() - startDate.getTime()) / 1000;

          scope.setState({ secondsLeft: seconds + "" });

          const intervalID = setInterval(() => {
            seconds--;
            scope.setState({ secondsLeft: seconds });
          }, 1000);

          setTimeout(async () => {
            clearInterval(intervalID);
            //get winner
            let allNumericalBids = [...scope.state.allNumericalBids];

            allNumericalBids.sort(scope.propComparator("bid")).reverse();

            if (allNumericalBids.length) {
              let winnerPhoneNumber =
                allNumericalBids[allNumericalBids.length - 1].from;

              var lambdaForGetNumber = new aws.Lambda({
                region: "us-east-1"
              });

              const PayloadWithPhoneNumber = {
                workerPhoneNumber: winnerPhoneNumber.substring(
                  1,
                  winnerPhoneNumber.length
                )
              };

              var getWorkerParams = {
                FunctionName: "get_worker_with_phone_number",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(PayloadWithPhoneNumber)
              };

              let lambdaPromiseForName = lambdaForGetNumber
                .invoke(getWorkerParams)
                .promise();

              let responseFromGetWorkerWithPhoneNumber = await lambdaPromiseForName;

              const workerName = responseFromGetWorkerWithPhoneNumber.Payload.replace(
                /"/g,
                ""
              );

              const textMessage = `You are the WINNER 🏆 ${workerName.toUpperCase()}, your bid is being submitted to the manager for approval. In the case that it is approved, please be ready by ${
                scope.state.shiftStartTimeHour == 1
                  ? 12
                  : scope.state.shiftStartTimeHour - 1
              }:${scope.state.shiftStartTimeMinute} ${
                scope.state.shiftStartTimeMeridiem
              } ${scope.state.readyTime.toUpperCase()}`;

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
                phoneNumber: winnerPhoneNumber
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

              await scope.SaveSentToDatabase(Payload, workerName);

              for (
                let i = scope.state.allNumericalBids.length - 1;
                i > 0;
                i--
              ) {
                if (
                  scope.state.allNumericalBids[i].from ==
                  allNumericalBids[allNumericalBids.length - 1].from
                ) {
                  console.log("this is the winner dont text rank");
                } else {
                  let loserPhoneNumber = allNumericalBids[i].from;

                  var lambdaForGetNumber = new aws.Lambda({
                    region: "us-east-1"
                  });

                  const PayloadWithPhoneNumber = {
                    workerPhoneNumber: loserPhoneNumber.substring(
                      1,
                      loserPhoneNumber.length
                    )
                  };

                  var getWorkerParams = {
                    FunctionName: "get_worker_with_phone_number",
                    InvocationType: "RequestResponse",
                    LogType: "Tail",
                    Payload: JSON.stringify(PayloadWithPhoneNumber)
                  };

                  let lambdaPromiseForName = lambdaForGetNumber
                    .invoke(getWorkerParams)
                    .promise();

                  let responseFromGetWorkerWithPhoneNumber = await lambdaPromiseForName;

                  const workerName = responseFromGetWorkerWithPhoneNumber.Payload.replace(
                    /"/g,
                    ""
                  );

                  //send winner text

                  const textMessage = `Hey ${workerName.toUpperCase()} you were ranked ${scope
                    .state.allNumericalBids.length -
                    i} in the auction, and in the case where the winner cannot make the shift for whatever reason, you may be contacted as a back up. In that case, please be ready by ${
                    scope.state.shiftStartTimeHour == 1
                      ? 12
                      : scope.state.shiftStartTimeHour - 1
                  }:${scope.state.shiftStartTimeMinute} ${
                    scope.state.shiftStartTimeMeridiem
                  } ${scope.state.readyTime.toUpperCase()}`;

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
                    phoneNumber: loserPhoneNumber
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

                  await scope.SaveSentToDatabase(Payload, workerName);
                }
              }

              scope.setState({
                workerConfirmPhoneNumberResponse: response.Payload + ""
              });

              // bid is ending so create price estimate with payment code

              let textMessageForManager = "";

              if (scope.state.firstTimeManager) {
                var lambda = new aws.Lambda({
                  region: "us-east-1"
                });

                let {
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

                if (
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
                  shiftLowestPayment &&
                  uberCost
                ) {
                } else {
                  alert(
                    "missing value for shift, restaurant, manager or payment code so only winner and rank to others texted not manager"
                  );
                  return;
                }

                const paymentCode =
                  Math.floor(1000 + Math.random() * 9000) + "";

                const PayloadForPaymentCode = {
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

                var paramsForPaymentCode = {
                  FunctionName:
                    "payment_code_with_restaurant_manager_and_shift",
                  InvocationType: "RequestResponse",
                  LogType: "Tail",
                  Payload: JSON.stringify(PayloadForPaymentCode)
                };

                let lambdaPromise = lambda
                  .invoke(paramsForPaymentCode)
                  .promise();

                let value = await lambdaPromise;

                textMessageForManager = `Hi MANAGER ${scope.state.managerName.toUpperCase()}, your link to check you price estimate is https://www.workpros.io/?code=${paymentCode}.`;
              } else {
                textMessageForManager = `Hi MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, for the work on ${
                  scope.state.shiftStartDayName
                } at ${scope.state.shiftStartTimeHour}:${
                  scope.state.shiftStartTimeMinute
                } ${scope.state.shiftStartTimeMeridiem} at location ${
                  scope.state.shiftAddress
                } 📍, ${scope.state.shiftJobType.toUpperCase()} ${workerName} 👨‍💼👞👟 has won the bid at ${
                  allNumericalBids[allNumericalBids.length - 1].bid
                } and transport cost of ${
                  scope.state.uberCost
                } 💵. Please reply with yes or no to confirm scheduling at this price.`;
              }

              const PayloadForManager = {
                body: textMessageForManager.toLowerCase(),
                phoneNumber: scope.state.managerPhoneNumber
              };

              let paramsForManager = {
                FunctionName: "send_text",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(PayloadForManager)
              };
              var lambda = new aws.Lambda({
                region: "us-east-1"
              });
              let lambdaPromiseForManager = lambda
                .invoke(paramsForManager)
                .promise();

              const responseFromManagerText = await lambdaPromiseForManager;

              await scope.SaveSentToDatabase(
                PayloadForManager,
                scope.state.managerName
              );
            } else {
              //send text to manager with bid cost and estimated transport cost
              const textMessageForManager = `Hi${scope.state.additionalTitle.toUpperCase()} PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, there were no workers available for the day and time selected.`;

              const PayloadForManager = {
                body: textMessageForManager.toLowerCase(),
                phoneNumber: scope.state.managerPhoneNumber
              };

              let paramsForManager = {
                FunctionName: "send_text",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(PayloadForManager)
              };
              var lambda = new aws.Lambda({
                region: "us-east-1"
              });
              let lambdaPromiseForManager = lambda
                .invoke(paramsForManager)
                .promise();

              const responseFromManagerText = await lambdaPromiseForManager;

              await scope.SaveSentToDatabase(
                PayloadForManager,
                scope.state.managerName
              );
            }
          }, seconds * 1000);
        }}
      >
        AT TIME text manager named: ${scope.state.managerName} at phone number $
        {scope.state.managerPhoneNumber} with hour {scope.state.hourOfEvent} and
        minute {scope.state.minuteOfEvent}$
        {scope.state.allNumericalBids.length > 0 &&
          scope.state.allNumericalBids[scope.state.allNumericalBids.length - 1]
            .bid}
        and TRANSPORT COST of ${scope.state.uberCost}
        and text winner and text losers `Hey workerName you were ranked i in the
        auction, and in the case where the winner cannot make the shift for
        whatever reason, you may be contacted as a back up. In that case, please
        be ready by $
        {scope.state.shiftStartTimeHour == 1
          ? 12
          : scope.state.shiftStartTimeHour - 1}
        :${scope.state.shiftStartTimeMinute} $
        {scope.state.shiftStartTimeMeridiem} $
        {scope.state.readyTime.toUpperCase()}` restaurantName &&
        restaurantAddress && managerName && managerPhoneNumber && biddingEndTime
        && shiftAddress && shiftEndTimeHour && shiftEndTimeMeridiem &&
        shiftEndTimeMinute && shiftJobType && shiftQuantityOfWorkers &&
        shiftStartASAPTodayTomorrowOther && shiftStartDate && shiftStartDateDay
        && shiftStartDateMonth && shiftStartDateYear && shiftStartDayName &&
        shiftStartTimeHour && shiftStartTimeMeridiem && shiftStartTimeMinute &&
        shiftLowestPayment && uberCost
      </Button>

      <Button
        style={{ backgroundColor: "red", textTransform: "none" }}
        onClick={async () => {
          if (!scope.state.managerName || !scope.state.managerPhoneNumber) {
            alert("manager required");
            return;
          }
          var startDate = new Date();
          // Do your operations
          var endDate = new Date();
          if (scope.state.meridiemOfEvent == "pm") {
            endDate.setHours(parseInt(scope.state.hourOfEvent) + 12);
          } else {
            endDate.setHours(parseInt(scope.state.hourOfEvent));
          }
          endDate.setMinutes(parseInt(scope.state.minuteOfEvent));

          var seconds = (endDate.getTime() - startDate.getTime()) / 1000;

          scope.setState({ secondsLeft: seconds + "" });

          const intervalID = setInterval(() => {
            seconds--;
            scope.setState({ secondsLeft: seconds });
          }, 1000);

          setTimeout(async () => {
            clearInterval(intervalID);
            //get winner
            let allNumericalBids = [...scope.state.allNumericalBids];

            allNumericalBids.sort(scope.propComparator("bid")).reverse();

            if (allNumericalBids.length) {
              // let winnerPhoneNumber =
              //   allNumericalBids[allNumericalBids.length - 1].from;

              // var lambdaForGetNumber = new aws.Lambda({
              //   region: "us-east-1"
              // });

              // const PayloadWithPhoneNumber = {
              //   workerPhoneNumber: winnerPhoneNumber.substring(
              //     1,
              //     winnerPhoneNumber.length
              //   )
              // };

              // var getWorkerParams = {
              //   FunctionName: "get_worker_with_phone_number",
              //   InvocationType: "RequestResponse",
              //   LogType: "Tail",
              //   Payload: JSON.stringify(PayloadWithPhoneNumber)
              // };

              // let lambdaPromiseForName = lambdaForGetNumber
              //   .invoke(getWorkerParams)
              //   .promise();

              // let responseFromGetWorkerWithPhoneNumber = await lambdaPromiseForName;

              // const workerName = responseFromGetWorkerWithPhoneNumber.Payload.replace(
              //   /"/g,
              //   ""
              // );

              // const textMessage = `You are the WINNER 🏆 ${workerName.toUpperCase()}, your bid is being submitted to the manager for approval. In the case that it is approved, please be ready by ${
              //   scope.state.shiftStartTimeHour == 1
              //     ? 12
              //     : scope.state.shiftStartTimeHour - 1
              // }:${scope.state.shiftStartTimeMinute} ${
              //   scope.state.shiftStartTimeMeridiem
              // } ${scope.state.readyTime.toUpperCase()}`;

              // scope.setState({ playDrum3: !scope.state.playDrum3 });
              // let count = 0;
              // let interval = setInterval(() => {
              //   count++;

              //   if (count == 4) {
              //     scope.setState({ playDrum3: !scope.state.playDrum3 });
              //     clearInterval(interval);
              //   }
              // }, 1000);

              // const Payload = {
              //   body: textMessage.toLowerCase(),
              //   phoneNumber: winnerPhoneNumber
              // };

              // let params = {
              //   FunctionName: "send_text",
              //   InvocationType: "RequestResponse",
              //   LogType: "Tail",
              //   Payload: JSON.stringify(Payload)
              // };
              // var lambda = new aws.Lambda({
              //   region: "us-east-1"
              // });
              // let lambdaPromise = lambda.invoke(params).promise();

              // const response = await lambdaPromise;

              // await scope.SaveSentToDatabase(Payload, workerName);

              // for (
              //   let i = scope.state.allNumericalBids.length - 1;
              //   i > 0;
              //   i--
              // ) {
              //   if (
              //     scope.state.allNumericalBids[i].from ==
              //     allNumericalBids[allNumericalBids.length - 1].from
              //   ) {
              //     console.log("this is the winner dont text rank");
              //   } else {
              //     let loserPhoneNumber = allNumericalBids[i].from;

              //     var lambdaForGetNumber = new aws.Lambda({
              //       region: "us-east-1"
              //     });

              //     const PayloadWithPhoneNumber = {
              //       workerPhoneNumber: loserPhoneNumber.substring(
              //         1,
              //         loserPhoneNumber.length
              //       )
              //     };

              //     var getWorkerParams = {
              //       FunctionName: "get_worker_with_phone_number",
              //       InvocationType: "RequestResponse",
              //       LogType: "Tail",
              //       Payload: JSON.stringify(PayloadWithPhoneNumber)
              //     };

              //     let lambdaPromiseForName = lambdaForGetNumber
              //       .invoke(getWorkerParams)
              //       .promise();

              //     let responseFromGetWorkerWithPhoneNumber = await lambdaPromiseForName;

              //     const workerName = responseFromGetWorkerWithPhoneNumber.Payload.replace(
              //       /"/g,
              //       ""
              //     );

              //     //send winner text

              //     const textMessage = `Hey ${workerName.toUpperCase()} you were ranked ${scope
              //       .state.allNumericalBids.length -
              //       i} in the auction, and in the case where the winner cannot make the shift for whatever reason, you may be contacted as a back up. In that case, please be ready by ${
              //       scope.state.shiftStartTimeHour == 1
              //         ? 12
              //         : scope.state.shiftStartTimeHour - 1
              //     }:${scope.state.shiftStartTimeMinute} ${
              //       scope.state.shiftStartTimeMeridiem
              //     } ${scope.state.readyTime.toUpperCase()}`;

              //     scope.setState({ playDrum3: !scope.state.playDrum3 });
              //     let count = 0;
              //     let interval = setInterval(() => {
              //       count++;

              //       if (count == 4) {
              //         scope.setState({ playDrum3: !scope.state.playDrum3 });
              //         clearInterval(interval);
              //       }
              //     }, 1000);

              //     const Payload = {
              //       body: textMessage.toLowerCase(),
              //       phoneNumber: loserPhoneNumber
              //     };

              //     let params = {
              //       FunctionName: "send_text",
              //       InvocationType: "RequestResponse",
              //       LogType: "Tail",
              //       Payload: JSON.stringify(Payload)
              //     };
              //     var lambda = new aws.Lambda({
              //       region: "us-east-1"
              //     });
              //     let lambdaPromise = lambda.invoke(params).promise();

              //     const response = await lambdaPromise;

              //     await scope.SaveSentToDatabase(Payload, workerName);
              //   }
              // }

              // scope.setState({
              //   workerConfirmPhoneNumberResponse: response.Payload + ""
              // });

              // bid is ending so create price estimate with payment code

              let textMessageForManager = "";

              // if (scope.state.firstTimeManager) {
              var lambda = new aws.Lambda({
                region: "us-east-1"
              });

              let {
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

              if (
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
                shiftLowestPayment &&
                uberCost
              ) {
              } else {
                alert(
                  "missing value for shift, restaurant, manager or payment code so only winner and rank to others texted not manager"
                );
                return;
              }

              const paymentCode = Math.floor(1000 + Math.random() * 9000) + "";

              const PayloadForPaymentCode = {
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

              var paramsForPaymentCode = {
                FunctionName: "payment_code_with_restaurant_manager_and_shift",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(PayloadForPaymentCode)
              };

              let lambdaPromise = lambda.invoke(paramsForPaymentCode).promise();

              let value = await lambdaPromise;

              textMessageForManager = `Hi MANAGER ${scope.state.managerName.toUpperCase()}, your link to check you price estimate is https://www.workpros.io/?code=${paymentCode}.`;
              // } else {
              //   textMessageForManager = `Hi MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, for the work on ${
              //     scope.state.shiftStartDayName
              //   } at ${scope.state.shiftStartTimeHour}:${
              //     scope.state.shiftStartTimeMinute
              //   } ${scope.state.shiftStartTimeMeridiem} at location ${
              //     scope.state.shiftAddress
              //   } 📍, ${scope.state.shiftJobType.toUpperCase()} ${workerName} 👨‍💼👞👟 has won the bid at ${
              //     allNumericalBids[allNumericalBids.length - 1].bid
              //   } and transport cost of ${
              //     scope.state.uberCost
              //   } 💵. Please reply with yes or no to confirm scheduling at this price.`;
              // }

              const PayloadForManager = {
                body: textMessageForManager.toLowerCase(),
                phoneNumber: scope.state.managerPhoneNumber
              };

              let paramsForManager = {
                FunctionName: "send_text",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(PayloadForManager)
              };
              var lambda = new aws.Lambda({
                region: "us-east-1"
              });
              let lambdaPromiseForManager = lambda
                .invoke(paramsForManager)
                .promise();

              const responseFromManagerText = await lambdaPromiseForManager;

              await scope.SaveSentToDatabase(
                PayloadForManager,
                scope.state.managerName
              );
            } else {
              //send text to manager with bid cost and estimated transport cost
              const textMessageForManager = `Hi${scope.state.additionalTitle.toUpperCase()} PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, there were no workers available for the day and time selected.`;

              const PayloadForManager = {
                body: textMessageForManager.toLowerCase(),
                phoneNumber: scope.state.managerPhoneNumber
              };

              let paramsForManager = {
                FunctionName: "send_text",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(PayloadForManager)
              };
              var lambda = new aws.Lambda({
                region: "us-east-1"
              });
              let lambdaPromiseForManager = lambda
                .invoke(paramsForManager)
                .promise();

              const responseFromManagerText = await lambdaPromiseForManager;

              await scope.SaveSentToDatabase(
                PayloadForManager,
                scope.state.managerName
              );
            }
          }, seconds * 1000);
        }}
      >
        FIRST TIME manager - hourOfEvent: {scope.state.hourOfEvent}
        minuteOfEvent: {scope.state.minuteOfEvent}$
        allNumericalBids[allNumericalBids.length - 1]:
        {scope.state.allNumericalBids.length > 0 &&
          scope.state.allNumericalBids[scope.state.allNumericalBids.length - 1]
            .bid}
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

      <Button
        style={{ backgroundColor: "red", textTransform: "none" }}
        onClick={async () => {
          if (!scope.state.managerName || !scope.state.managerPhoneNumber) {
            alert("manager required");
            return;
          }
          var startDate = new Date();
          // Do your operations
          var endDate = new Date();
          if (scope.state.meridiemOfEvent == "pm") {
            endDate.setHours(parseInt(scope.state.hourOfEvent) + 12);
          } else {
            endDate.setHours(parseInt(scope.state.hourOfEvent));
          }
          endDate.setMinutes(parseInt(scope.state.minuteOfEvent));

          var seconds = (endDate.getTime() - startDate.getTime()) / 1000;

          scope.setState({ secondsLeft: seconds + "" });

          const intervalID = setInterval(() => {
            seconds--;
            scope.setState({ secondsLeft: seconds });
          }, 1000);

          setTimeout(async () => {
            clearInterval(intervalID);
            //get winner
            let allNumericalBids = [...scope.state.allNumericalBids];

            allNumericalBids.sort(scope.propComparator("bid")).reverse();

            if (allNumericalBids.length) {
              let winnerPhoneNumber =
                allNumericalBids[allNumericalBids.length - 1].from;

              var lambdaForGetNumber = new aws.Lambda({
                region: "us-east-1"
              });

              const PayloadWithPhoneNumber = {
                workerPhoneNumber: winnerPhoneNumber.substring(
                  1,
                  winnerPhoneNumber.length
                )
              };

              var getWorkerParams = {
                FunctionName: "get_worker_with_phone_number",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(PayloadWithPhoneNumber)
              };

              let lambdaPromiseForName = lambdaForGetNumber
                .invoke(getWorkerParams)
                .promise();

              let responseFromGetWorkerWithPhoneNumber = await lambdaPromiseForName;

              const workerName = responseFromGetWorkerWithPhoneNumber.Payload.replace(
                /"/g,
                ""
              );

              // const textMessage = `You are the WINNER 🏆 ${workerName.toUpperCase()}, your bid is being submitted to the manager for approval. In the case that it is approved, please be ready by ${
              //   scope.state.shiftStartTimeHour == 1
              //     ? 12
              //     : scope.state.shiftStartTimeHour - 1
              // }:${scope.state.shiftStartTimeMinute} ${
              //   scope.state.shiftStartTimeMeridiem
              // } ${scope.state.readyTime.toUpperCase()}`;

              // scope.setState({ playDrum3: !scope.state.playDrum3 });
              // let count = 0;
              // let interval = setInterval(() => {
              //   count++;

              //   if (count == 4) {
              //     scope.setState({ playDrum3: !scope.state.playDrum3 });
              //     clearInterval(interval);
              //   }
              // }, 1000);

              // const Payload = {
              //   body: textMessage.toLowerCase(),
              //   phoneNumber: winnerPhoneNumber
              // };

              // let params = {
              //   FunctionName: "send_text",
              //   InvocationType: "RequestResponse",
              //   LogType: "Tail",
              //   Payload: JSON.stringify(Payload)
              // };
              // var lambda = new aws.Lambda({
              //   region: "us-east-1"
              // });
              // let lambdaPromise = lambda.invoke(params).promise();

              // const response = await lambdaPromise;

              // await scope.SaveSentToDatabase(Payload, workerName);

              // for (
              //   let i = scope.state.allNumericalBids.length - 1;
              //   i > 0;
              //   i--
              // ) {
              //   if (
              //     scope.state.allNumericalBids[i].from ==
              //     allNumericalBids[allNumericalBids.length - 1].from
              //   ) {
              //     console.log("this is the winner dont text rank");
              //   } else {
              //     let loserPhoneNumber = allNumericalBids[i].from;

              //     var lambdaForGetNumber = new aws.Lambda({
              //       region: "us-east-1"
              //     });

              //     const PayloadWithPhoneNumber = {
              //       workerPhoneNumber: loserPhoneNumber.substring(
              //         1,
              //         loserPhoneNumber.length
              //       )
              //     };

              //     var getWorkerParams = {
              //       FunctionName: "get_worker_with_phone_number",
              //       InvocationType: "RequestResponse",
              //       LogType: "Tail",
              //       Payload: JSON.stringify(PayloadWithPhoneNumber)
              //     };

              //     let lambdaPromiseForName = lambdaForGetNumber
              //       .invoke(getWorkerParams)
              //       .promise();

              //     let responseFromGetWorkerWithPhoneNumber = await lambdaPromiseForName;

              //     const workerName = responseFromGetWorkerWithPhoneNumber.Payload.replace(
              //       /"/g,
              //       ""
              //     );

              //     //send winner text

              //     const textMessage = `Hey ${workerName.toUpperCase()} you were ranked ${scope
              //       .state.allNumericalBids.length -
              //       i} in the auction, and in the case where the winner cannot make the shift for whatever reason, you may be contacted as a back up. In that case, please be ready by ${
              //       scope.state.shiftStartTimeHour == 1
              //         ? 12
              //         : scope.state.shiftStartTimeHour - 1
              //     }:${scope.state.shiftStartTimeMinute} ${
              //       scope.state.shiftStartTimeMeridiem
              //     } ${scope.state.readyTime.toUpperCase()}`;

              //     scope.setState({ playDrum3: !scope.state.playDrum3 });
              //     let count = 0;
              //     let interval = setInterval(() => {
              //       count++;

              //       if (count == 4) {
              //         scope.setState({ playDrum3: !scope.state.playDrum3 });
              //         clearInterval(interval);
              //       }
              //     }, 1000);

              //     const Payload = {
              //       body: textMessage.toLowerCase(),
              //       phoneNumber: loserPhoneNumber
              //     };

              //     let params = {
              //       FunctionName: "send_text",
              //       InvocationType: "RequestResponse",
              //       LogType: "Tail",
              //       Payload: JSON.stringify(Payload)
              //     };
              //     var lambda = new aws.Lambda({
              //       region: "us-east-1"
              //     });
              //     let lambdaPromise = lambda.invoke(params).promise();

              //     const response = await lambdaPromise;

              //     await scope.SaveSentToDatabase(Payload, workerName);
              //   }
              // }

              // scope.setState({
              //   workerConfirmPhoneNumberResponse: response.Payload + ""
              // });

              // bid is ending so create price estimate with payment code

              let textMessageForManager = "";

              // if (scope.state.firstTimeManager) {
              var lambda = new aws.Lambda({
                region: "us-east-1"
              });

              let {
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

              if (
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
                shiftLowestPayment &&
                uberCost
              ) {
              } else {
                alert(
                  "missing value for shift, restaurant, manager or payment code so only winner and rank to others texted not manager"
                );
                return;
              }

              const paymentCode = Math.floor(1000 + Math.random() * 9000) + "";

              const PayloadForPaymentCode = {
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

              var paramsForPaymentCode = {
                FunctionName: "payment_code_with_restaurant_manager_and_shift",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(PayloadForPaymentCode)
              };

              let lambdaPromise = lambda.invoke(paramsForPaymentCode).promise();

              let value = await lambdaPromise;

              // textMessageForManager = `Hi MANAGER ${scope.state.managerName.toUpperCase()}, your link to check you price estimate is https://www.workpros.io/?code=${paymentCode}.`;
              // } else {
              textMessageForManager = `Hi MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, for the work on ${
                scope.state.shiftStartDayName
              } at ${scope.state.shiftStartTimeHour}:${
                scope.state.shiftStartTimeMinute
              } ${scope.state.shiftStartTimeMeridiem} at location ${
                scope.state.shiftAddress
              } 📍, ${scope.state.shiftJobType.toUpperCase()} ${workerName} 👨‍💼👞👟 has won the bid at ${
                allNumericalBids[allNumericalBids.length - 1].bid
              } and transport cost of ${
                scope.state.uberCost
              } 💵. Please reply with yes or no to confirm scheduling at this price.`;
              // }

              const PayloadForManager = {
                body: textMessageForManager.toLowerCase(),
                phoneNumber: scope.state.managerPhoneNumber
              };

              let paramsForManager = {
                FunctionName: "send_text",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(PayloadForManager)
              };
              var lambda = new aws.Lambda({
                region: "us-east-1"
              });
              let lambdaPromiseForManager = lambda
                .invoke(paramsForManager)
                .promise();

              const responseFromManagerText = await lambdaPromiseForManager;

              await scope.SaveSentToDatabase(
                PayloadForManager,
                scope.state.managerName
              );
            } else {
              //send text to manager with bid cost and estimated transport cost
              const textMessageForManager = `Hi${scope.state.additionalTitle.toUpperCase()} PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, there were no workers available for the day and time selected.`;

              const PayloadForManager = {
                body: textMessageForManager.toLowerCase(),
                phoneNumber: scope.state.managerPhoneNumber
              };

              let paramsForManager = {
                FunctionName: "send_text",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(PayloadForManager)
              };
              var lambda = new aws.Lambda({
                region: "us-east-1"
              });
              let lambdaPromiseForManager = lambda
                .invoke(paramsForManager)
                .promise();

              const responseFromManagerText = await lambdaPromiseForManager;

              await scope.SaveSentToDatabase(
                PayloadForManager,
                scope.state.managerName
              );
            }
          }, seconds * 1000);
        }}
      >
        MANAGER with CONFIRMED PAYMENT METHOD - hourOfEvent:{" "}
        {scope.state.hourOfEvent}
        minuteOfEvent: {scope.state.minuteOfEvent}$
        allNumericalBids[allNumericalBids.length - 1]:
        {scope.state.allNumericalBids.length > 0 &&
          scope.state.allNumericalBids[scope.state.allNumericalBids.length - 1]
            .bid}
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

      <Button
        style={{ backgroundColor: "red", textTransform: "none" }}
        onClick={async () => {
          // if (!scope.state.managerName || !scope.state.managerPhoneNumber) {
          //   alert("manager required");
          //   return;
          // }
          var startDate = new Date();
          // Do your operations
          var endDate = new Date();
          if (scope.state.meridiemOfEvent == "pm") {
            endDate.setHours(parseInt(scope.state.hourOfEvent) + 12);
          } else {
            endDate.setHours(parseInt(scope.state.hourOfEvent));
          }
          endDate.setMinutes(parseInt(scope.state.minuteOfEvent));

          var seconds = (endDate.getTime() - startDate.getTime()) / 1000;

          scope.setState({ secondsLeft: seconds + "" });

          const intervalID = setInterval(() => {
            seconds--;
            scope.setState({ secondsLeft: seconds });
          }, 1000);

          setTimeout(async () => {
            clearInterval(intervalID);
            //get winner
            let allNumericalBids = [...scope.state.allNumericalBids];

            allNumericalBids.sort(scope.propComparator("bid")).reverse();

            if (allNumericalBids.length) {
              let winnerPhoneNumber =
                allNumericalBids[allNumericalBids.length - 1].from;

              var lambdaForGetNumber = new aws.Lambda({
                region: "us-east-1"
              });

              const PayloadWithPhoneNumber = {
                workerPhoneNumber: winnerPhoneNumber.substring(
                  1,
                  winnerPhoneNumber.length
                )
              };

              var getWorkerParams = {
                FunctionName: "get_worker_with_phone_number",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(PayloadWithPhoneNumber)
              };

              let lambdaPromiseForName = lambdaForGetNumber
                .invoke(getWorkerParams)
                .promise();

              let responseFromGetWorkerWithPhoneNumber = await lambdaPromiseForName;

              const workerName = responseFromGetWorkerWithPhoneNumber.Payload.replace(
                /"/g,
                ""
              );

              const textMessage = `You are the WINNER 🏆 ${workerName.toUpperCase()}, your bid of ${
                allNumericalBids[allNumericalBids.length - 1].bid
              } is being submitted to the manager for approval. In the case that it is approved, please be ready by ${
                scope.state.shiftStartTimeHour == 1
                  ? 12
                  : scope.state.shiftStartTimeHour - 1
              }:${scope.state.shiftStartTimeMinute} ${
                scope.state.shiftStartTimeMeridiem
              } ${scope.state.readyTime.toUpperCase()}`;

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
                phoneNumber: winnerPhoneNumber
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

              await scope.SaveSentToDatabase(Payload, workerName);

              // for (
              //   let i = scope.state.allNumericalBids.length - 1;
              //   i > 0;
              //   i--
              // ) {
              //   if (
              //     scope.state.allNumericalBids[i].from ==
              //     allNumericalBids[allNumericalBids.length - 1].from
              //   ) {
              //     console.log("this is the winner dont text rank");
              //   } else {
              //     let loserPhoneNumber = allNumericalBids[i].from;

              //     var lambdaForGetNumber = new aws.Lambda({
              //       region: "us-east-1"
              //     });

              //     const PayloadWithPhoneNumber = {
              //       workerPhoneNumber: loserPhoneNumber.substring(
              //         1,
              //         loserPhoneNumber.length
              //       )
              //     };

              //     var getWorkerParams = {
              //       FunctionName: "get_worker_with_phone_number",
              //       InvocationType: "RequestResponse",
              //       LogType: "Tail",
              //       Payload: JSON.stringify(PayloadWithPhoneNumber)
              //     };

              //     let lambdaPromiseForName = lambdaForGetNumber
              //       .invoke(getWorkerParams)
              //       .promise();

              //     let responseFromGetWorkerWithPhoneNumber = await lambdaPromiseForName;

              //     const workerName = responseFromGetWorkerWithPhoneNumber.Payload.replace(
              //       /"/g,
              //       ""
              //     );

              //     //send winner text

              //     const textMessage = `Hey ${workerName.toUpperCase()} you were ranked ${scope
              //       .state.allNumericalBids.length -
              //       i} in the auction, and in the case where the winner cannot make the shift for whatever reason, you may be contacted as a back up. In that case, please be ready by ${
              //       scope.state.shiftStartTimeHour == 1
              //         ? 12
              //         : scope.state.shiftStartTimeHour - 1
              //     }:${scope.state.shiftStartTimeMinute} ${
              //       scope.state.shiftStartTimeMeridiem
              //     } ${scope.state.readyTime.toUpperCase()}`;

              //     scope.setState({ playDrum3: !scope.state.playDrum3 });
              //     let count = 0;
              //     let interval = setInterval(() => {
              //       count++;

              //       if (count == 4) {
              //         scope.setState({ playDrum3: !scope.state.playDrum3 });
              //         clearInterval(interval);
              //       }
              //     }, 1000);

              //     const Payload = {
              //       body: textMessage.toLowerCase(),
              //       phoneNumber: loserPhoneNumber
              //     };

              //     let params = {
              //       FunctionName: "send_text",
              //       InvocationType: "RequestResponse",
              //       LogType: "Tail",
              //       Payload: JSON.stringify(Payload)
              //     };
              //     var lambda = new aws.Lambda({
              //       region: "us-east-1"
              //     });
              //     let lambdaPromise = lambda.invoke(params).promise();

              //     const response = await lambdaPromise;

              //     await scope.SaveSentToDatabase(Payload, workerName);
              //   }
              // }

              scope.setState({
                workerConfirmPhoneNumberResponse: response.Payload + ""
              });

              // bid is ending so create price estimate with payment code

              // let textMessageForManager = "";

              // // if (scope.state.firstTimeManager) {
              // var lambda = new aws.Lambda({
              //   region: "us-east-1"
              // });

              // let {
              //   restaurantName,
              //   managerName,
              //   managerPhoneNumber,
              //   biddingEndTime,
              //   shiftAddress,
              //   shiftEndTimeHour,
              //   shiftEndTimeMeridiem,
              //   shiftEndTimeMinute,
              //   shiftJobType,
              //   shiftQuantityOfWorkers,
              //   shiftStartASAPTodayTomorrowOther,
              //   shiftStartDate,
              //   shiftStartDateDay,
              //   shiftStartDateMonth,
              //   shiftStartDateYear,
              //   shiftStartDayName,
              //   shiftStartTimeHour,
              //   shiftStartTimeMeridiem,
              //   shiftStartTimeMinute,
              //   shiftLowestPayment,
              //   uberCost,
              //   freeFirstMonth
              // } = scope.state;

              // let { restaurantAddress } = scope.state.restaurantLocation;

              // if (
              //   restaurantName &&
              //   restaurantAddress &&
              //   managerName &&
              //   managerPhoneNumber &&
              //   biddingEndTime &&
              //   shiftAddress &&
              //   shiftEndTimeHour &&
              //   shiftEndTimeMeridiem &&
              //   shiftEndTimeMinute &&
              //   shiftJobType &&
              //   shiftQuantityOfWorkers &&
              //   shiftStartASAPTodayTomorrowOther &&
              //   shiftStartDate &&
              //   shiftStartDateDay &&
              //   shiftStartDateMonth &&
              //   shiftStartDateYear &&
              //   shiftStartDayName &&
              //   shiftStartTimeHour &&
              //   shiftStartTimeMeridiem &&
              //   shiftStartTimeMinute &&
              //   shiftLowestPayment &&
              //   uberCost
              // ) {
              // } else {
              //   alert(
              //     "missing value for shift, restaurant, manager or payment code so only winner and rank to others texted not manager"
              //   );
              //   return;
              // }

              // const paymentCode = Math.floor(1000 + Math.random() * 9000) + "";

              // const PayloadForPaymentCode = {
              //   paymentCode,

              //   restaurantName,
              //   restaurantAddress,

              //   managerOfShift: {
              //     managerName,
              //     managerPhoneNumber
              //   },

              //   biddingEndTime,

              //   shiftAddress,
              //   shiftEndTimeHour,
              //   shiftEndTimeMeridiem,
              //   shiftEndTimeMinute,
              //   shiftJobType,
              //   shiftLocation: {
              //     shiftAddress
              //   },
              //   shiftQuantityOfWorkers,
              //   shiftStartDate: {
              //     shiftStartASAPTodayTomorrowOther,
              //     shiftStartDate,
              //     shiftStartDateDay,
              //     shiftStartDateMonth,
              //     shiftStartDateYear
              //   },
              //   shiftStartDayName,
              //   shiftStartTimeHour,
              //   shiftStartTimeMeridiem,
              //   shiftStartTimeMinute,

              //   shiftLowestPayment,
              //   uberCost,
              //   freeFirstMonth
              // };

              // var paramsForPaymentCode = {
              //   FunctionName: "payment_code_with_restaurant_manager_and_shift",
              //   InvocationType: "RequestResponse",
              //   LogType: "Tail",
              //   Payload: JSON.stringify(PayloadForPaymentCode)
              // };

              // let lambdaPromise = lambda.invoke(paramsForPaymentCode).promise();

              // let value = await lambdaPromise;

              // // textMessageForManager = `Hi MANAGER ${scope.state.managerName.toUpperCase()}, your link to check you price estimate is https://www.workpros.io/?code=${paymentCode}.`;
              // // } else {
              // textMessageForManager = `Hi MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, for the work on ${
              //   scope.state.shiftStartDayName
              // } at ${scope.state.shiftStartTimeHour}:${
              //   scope.state.shiftStartTimeMinute
              // } ${scope.state.shiftStartTimeMeridiem} at location ${
              //   scope.state.shiftAddress
              // } 📍, ${scope.state.shiftJobType.toUpperCase()} ${workerName} 👨‍💼👞👟 has won the bid at ${
              //   allNumericalBids[allNumericalBids.length - 1].bid
              // } and transport cost of ${
              //   scope.state.uberCost
              // } 💵. Please reply with yes or no to confirm scheduling at this price.`;
              // // }

              // const PayloadForManager = {
              //   body: textMessageForManager.toLowerCase(),
              //   phoneNumber: scope.state.managerPhoneNumber
              // };

              // let paramsForManager = {
              //   FunctionName: "send_text",
              //   InvocationType: "RequestResponse",
              //   LogType: "Tail",
              //   Payload: JSON.stringify(PayloadForManager)
              // };
              // var lambda = new aws.Lambda({
              //   region: "us-east-1"
              // });
              // let lambdaPromiseForManager = lambda
              //   .invoke(paramsForManager)
              //   .promise();

              // const responseFromManagerText = await lambdaPromiseForManager;

              // await scope.SaveSentToDatabase(
              //   PayloadForManager,
              //   scope.state.managerName
              // );
            }
            // else {
            //   //send text to manager with bid cost and estimated transport cost
            //   const textMessageForManager = `Hi${scope.state.additionalTitle.toUpperCase()} PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, there were no workers available for the day and time selected.`;

            //   const PayloadForManager = {
            //     body: textMessageForManager.toLowerCase(),
            //     phoneNumber: scope.state.managerPhoneNumber
            //   };

            //   let paramsForManager = {
            //     FunctionName: "send_text",
            //     InvocationType: "RequestResponse",
            //     LogType: "Tail",
            //     Payload: JSON.stringify(PayloadForManager)
            //   };
            //   var lambda = new aws.Lambda({
            //     region: "us-east-1"
            //   });
            //   let lambdaPromiseForManager = lambda
            //     .invoke(paramsForManager)
            //     .promise();

            //   const responseFromManagerText = await lambdaPromiseForManager;

            //   await scope.SaveSentToDatabase(
            //     PayloadForManager,
            //     scope.state.managerName
            //   );
            // }
          }, seconds * 1000);
        }}
      >
        WINNING WORKER - hourOfEvent: {scope.state.hourOfEvent}
        minuteOfEvent: {scope.state.minuteOfEvent}$
        allNumericalBids[allNumericalBids.length - 1]:
        {scope.state.allNumericalBids.length > 0 &&
          scope.state.allNumericalBids[scope.state.allNumericalBids.length - 1]
            .bid}
        `You are the WINNER 🏆 workerName.toUpperCase(), your bid is being
        submitted to the manager for approval. In the case that it is approved,
        please be ready by $
        {scope.state.shiftStartTimeHour == 1
          ? 12
          : scope.state.shiftStartTimeHour - 1}
        :${scope.state.shiftStartTimeMinute} $
        {scope.state.shiftStartTimeMeridiem} $
        {scope.state.readyTime.toUpperCase()}`;
      </Button>

      <Button
        style={{ backgroundColor: "red", textTransform: "none" }}
        onClick={async () => {
          // if (!scope.state.managerName || !scope.state.managerPhoneNumber) {
          //   alert("manager required");
          //   return;
          // }
          var startDate = new Date();
          // Do your operations
          var endDate = new Date();
          if (scope.state.meridiemOfEvent == "pm") {
            endDate.setHours(parseInt(scope.state.hourOfEvent) + 12);
          } else {
            endDate.setHours(parseInt(scope.state.hourOfEvent));
          }
          endDate.setMinutes(parseInt(scope.state.minuteOfEvent));

          var seconds = (endDate.getTime() - startDate.getTime()) / 1000;

          scope.setState({ secondsLeft: seconds + "" });

          const intervalID = setInterval(() => {
            seconds--;
            scope.setState({ secondsLeft: seconds });
          }, 1000);

          setTimeout(async () => {
            clearInterval(intervalID);
            //get winner
            let allNumericalBids = [...scope.state.allNumericalBids];

            allNumericalBids.sort(scope.propComparator("bid")).reverse();

            if (allNumericalBids.length) {
              let winnerPhoneNumber =
                allNumericalBids[allNumericalBids.length - 1].from;

              var lambdaForGetNumber = new aws.Lambda({
                region: "us-east-1"
              });

              const PayloadWithPhoneNumber = {
                workerPhoneNumber: winnerPhoneNumber.substring(
                  1,
                  winnerPhoneNumber.length
                )
              };

              var getWorkerParams = {
                FunctionName: "get_worker_with_phone_number",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(PayloadWithPhoneNumber)
              };

              let lambdaPromiseForName = lambdaForGetNumber
                .invoke(getWorkerParams)
                .promise();

              let responseFromGetWorkerWithPhoneNumber = await lambdaPromiseForName;

              const workerName = responseFromGetWorkerWithPhoneNumber.Payload.replace(
                /"/g,
                ""
              );

              // const textMessage = `You are the WINNER 🏆 ${workerName.toUpperCase()}, your bid is being submitted to the manager for approval. In the case that it is approved, please be ready by ${
              //   scope.state.shiftStartTimeHour == 1
              //     ? 12
              //     : scope.state.shiftStartTimeHour - 1
              // }:${scope.state.shiftStartTimeMinute} ${
              //   scope.state.shiftStartTimeMeridiem
              // } ${scope.state.readyTime.toUpperCase()}`;

              // scope.setState({ playDrum3: !scope.state.playDrum3 });
              // let count = 0;
              // let interval = setInterval(() => {
              //   count++;

              //   if (count == 4) {
              //     scope.setState({ playDrum3: !scope.state.playDrum3 });
              //     clearInterval(interval);
              //   }
              // }, 1000);

              // const Payload = {
              //   body: textMessage.toLowerCase(),
              //   phoneNumber: winnerPhoneNumber
              // };

              // let params = {
              //   FunctionName: "send_text",
              //   InvocationType: "RequestResponse",
              //   LogType: "Tail",
              //   Payload: JSON.stringify(Payload)
              // };
              // var lambda = new aws.Lambda({
              //   region: "us-east-1"
              // });
              // let lambdaPromise = lambda.invoke(params).promise();

              // const response = await lambdaPromise;

              // await scope.SaveSentToDatabase(Payload, workerName);

              for (
                let i = scope.state.allNumericalBids.length - 1;
                i >= 0;
                i--
              ) {
                if (
                  scope.state.allNumericalBids[i].from ==
                  allNumericalBids[allNumericalBids.length - 1].from
                ) {
                  console.log("this is the winner dont text rank");
                } else {
                  let loserPhoneNumber = allNumericalBids[i].from;

                  console.log(loserPhoneNumber);

                  var lambdaForGetNumber = new aws.Lambda({
                    region: "us-east-1"
                  });

                  const PayloadWithPhoneNumber = {
                    workerPhoneNumber: loserPhoneNumber.substring(
                      1,
                      loserPhoneNumber.length
                    )
                  };

                  var getWorkerParams = {
                    FunctionName: "get_worker_with_phone_number",
                    InvocationType: "RequestResponse",
                    LogType: "Tail",
                    Payload: JSON.stringify(PayloadWithPhoneNumber)
                  };

                  let lambdaPromiseForName = lambdaForGetNumber
                    .invoke(getWorkerParams)
                    .promise();

                  let responseFromGetWorkerWithPhoneNumber = await lambdaPromiseForName;

                  const workerName = responseFromGetWorkerWithPhoneNumber.Payload.replace(
                    /"/g,
                    ""
                  );

                  //send winner text

                  const textMessage = `Hey ${workerName.toUpperCase()} you were ranked ${ordinalSuffixOf(
                    scope.state.allNumericalBids.length - i
                  )} in the auction, and in the case where the winner cannot make the shift for whatever reason, you may be contacted as a back up at your bid of ${
                    scope.state.allNumericalBids[i].bid
                  } for that rank. In that case, please be ready by ${
                    scope.state.shiftStartTimeHour == 1
                      ? 12
                      : scope.state.shiftStartTimeHour - 1
                  }:${scope.state.shiftStartTimeMinute} ${
                    scope.state.shiftStartTimeMeridiem
                  } ${scope.state.readyTime.toUpperCase()}`;

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
                    phoneNumber: loserPhoneNumber
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

                  await scope.SaveSentToDatabase(Payload, workerName);
                }
              }

              // scope.setState({
              //   workerConfirmPhoneNumberResponse: response.Payload + ""
              // });

              // bid is ending so create price estimate with payment code

              // let textMessageForManager = "";

              // // if (scope.state.firstTimeManager) {
              // var lambda = new aws.Lambda({
              //   region: "us-east-1"
              // });

              // let {
              //   restaurantName,
              //   managerName,
              //   managerPhoneNumber,
              //   biddingEndTime,
              //   shiftAddress,
              //   shiftEndTimeHour,
              //   shiftEndTimeMeridiem,
              //   shiftEndTimeMinute,
              //   shiftJobType,
              //   shiftQuantityOfWorkers,
              //   shiftStartASAPTodayTomorrowOther,
              //   shiftStartDate,
              //   shiftStartDateDay,
              //   shiftStartDateMonth,
              //   shiftStartDateYear,
              //   shiftStartDayName,
              //   shiftStartTimeHour,
              //   shiftStartTimeMeridiem,
              //   shiftStartTimeMinute,
              //   shiftLowestPayment,
              //   uberCost,
              //   freeFirstMonth
              // } = scope.state;

              // let { restaurantAddress } = scope.state.restaurantLocation;

              // if (
              //   restaurantName &&
              //   restaurantAddress &&
              //   managerName &&
              //   managerPhoneNumber &&
              //   biddingEndTime &&
              //   shiftAddress &&
              //   shiftEndTimeHour &&
              //   shiftEndTimeMeridiem &&
              //   shiftEndTimeMinute &&
              //   shiftJobType &&
              //   shiftQuantityOfWorkers &&
              //   shiftStartASAPTodayTomorrowOther &&
              //   shiftStartDate &&
              //   shiftStartDateDay &&
              //   shiftStartDateMonth &&
              //   shiftStartDateYear &&
              //   shiftStartDayName &&
              //   shiftStartTimeHour &&
              //   shiftStartTimeMeridiem &&
              //   shiftStartTimeMinute &&
              //   shiftLowestPayment &&
              //   uberCost
              // ) {
              // } else {
              //   alert(
              //     "missing value for shift, restaurant, manager or payment code so only winner and rank to others texted not manager"
              //   );
              //   return;
              // }

              // const paymentCode = Math.floor(1000 + Math.random() * 9000) + "";

              // const PayloadForPaymentCode = {
              //   paymentCode,

              //   restaurantName,
              //   restaurantAddress,

              //   managerOfShift: {
              //     managerName,
              //     managerPhoneNumber
              //   },

              //   biddingEndTime,

              //   shiftAddress,
              //   shiftEndTimeHour,
              //   shiftEndTimeMeridiem,
              //   shiftEndTimeMinute,
              //   shiftJobType,
              //   shiftLocation: {
              //     shiftAddress
              //   },
              //   shiftQuantityOfWorkers,
              //   shiftStartDate: {
              //     shiftStartASAPTodayTomorrowOther,
              //     shiftStartDate,
              //     shiftStartDateDay,
              //     shiftStartDateMonth,
              //     shiftStartDateYear
              //   },
              //   shiftStartDayName,
              //   shiftStartTimeHour,
              //   shiftStartTimeMeridiem,
              //   shiftStartTimeMinute,

              //   shiftLowestPayment,
              //   uberCost,
              //   freeFirstMonth
              // };

              // var paramsForPaymentCode = {
              //   FunctionName: "payment_code_with_restaurant_manager_and_shift",
              //   InvocationType: "RequestResponse",
              //   LogType: "Tail",
              //   Payload: JSON.stringify(PayloadForPaymentCode)
              // };

              // let lambdaPromise = lambda.invoke(paramsForPaymentCode).promise();

              // let value = await lambdaPromise;

              // // textMessageForManager = `Hi MANAGER ${scope.state.managerName.toUpperCase()}, your link to check you price estimate is https://www.workpros.io/?code=${paymentCode}.`;
              // // } else {
              // textMessageForManager = `Hi MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, for the work on ${
              //   scope.state.shiftStartDayName
              // } at ${scope.state.shiftStartTimeHour}:${
              //   scope.state.shiftStartTimeMinute
              // } ${scope.state.shiftStartTimeMeridiem} at location ${
              //   scope.state.shiftAddress
              // } 📍, ${scope.state.shiftJobType.toUpperCase()} ${workerName} 👨‍💼👞👟 has won the bid at ${
              //   allNumericalBids[allNumericalBids.length - 1].bid
              // } and transport cost of ${
              //   scope.state.uberCost
              // } 💵. Please reply with yes or no to confirm scheduling at this price.`;
              // // }

              // const PayloadForManager = {
              //   body: textMessageForManager.toLowerCase(),
              //   phoneNumber: scope.state.managerPhoneNumber
              // };

              // let paramsForManager = {
              //   FunctionName: "send_text",
              //   InvocationType: "RequestResponse",
              //   LogType: "Tail",
              //   Payload: JSON.stringify(PayloadForManager)
              // };
              // var lambda = new aws.Lambda({
              //   region: "us-east-1"
              // });
              // let lambdaPromiseForManager = lambda
              //   .invoke(paramsForManager)
              //   .promise();

              // const responseFromManagerText = await lambdaPromiseForManager;

              // await scope.SaveSentToDatabase(
              //   PayloadForManager,
              //   scope.state.managerName
              // );
            }
            // else {
            //   //send text to manager with bid cost and estimated transport cost
            //   const textMessageForManager = `Hi${scope.state.additionalTitle.toUpperCase()} PREMIUM MANAGER 🤴 ${scope.state.managerName.toUpperCase()}, there were no workers available for the day and time selected.`;

            //   const PayloadForManager = {
            //     body: textMessageForManager.toLowerCase(),
            //     phoneNumber: scope.state.managerPhoneNumber
            //   };

            //   let paramsForManager = {
            //     FunctionName: "send_text",
            //     InvocationType: "RequestResponse",
            //     LogType: "Tail",
            //     Payload: JSON.stringify(PayloadForManager)
            //   };
            //   var lambda = new aws.Lambda({
            //     region: "us-east-1"
            //   });
            //   let lambdaPromiseForManager = lambda
            //     .invoke(paramsForManager)
            //     .promise();

            //   const responseFromManagerText = await lambdaPromiseForManager;

            //   await scope.SaveSentToDatabase(
            //     PayloadForManager,
            //     scope.state.managerName
            //   );
            // }
          }, seconds * 1000);
        }}
      >
        LOSING WORKERS - hourOfEvent: {scope.state.hourOfEvent}
        minuteOfEvent: {scope.state.minuteOfEvent}$ `Hey $
        workerName.toUpperCase() you were ranked $
        scope.state.allNumericalBids.length - i in the auction, and in the case
        where the winner cannot make the shift for whatever reason, you may be
        contacted as a back up. In that case, please be ready by $
        {scope.state.shiftStartTimeHour == 1
          ? 12
          : scope.state.shiftStartTimeHour - 1}
        :${scope.state.shiftStartTimeMinute} $
        {scope.state.shiftStartTimeMeridiem} $
        {scope.state.readyTime.toUpperCase()}`
      </Button>
    </div>
  );
};

function ordinalSuffixOf(i) {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}
