import aws from "aws-sdk";
import moment from "moment";

export default async function(scope, response) {
  return new Promise(async (resolve, reject) => {
    let stringWithBid = decodeURIComponent(
      response.twilioResponseText.Body.replace(/\+/g, "%20")
    );
    let bid = "";
    let addTransportCost = false;
    let transportCostToBeAdded = 0;
    let winnerTransportCostToBeAdded = 0;

    for (var i = 0; i < stringWithBid.length; i++) {
      if (stringWithBid.charAt(i) == "$") {
        let j = 1;

        while (
          stringWithBid.charAt(i + j) != " " &&
          i + j <= stringWithBid.length
        ) {
          bid += stringWithBid.charAt(i + j);
          j++;
        }
      }
    }

    scope.setState({ shiftLowestPayment: bid });

    if (!isNaN(parseFloat(stringWithBid))) {
      bid = parseFloat(stringWithBid);
    }

    scope.setState({ shiftLowestPayment: bid });

    if (bid) {
      bid = parseFloat(bid);

      if (bid < 20 && scope.state.ignoreUnderTwenty) {
        console.log("ignoring under 20");

        var lambdaForGetNumber = new aws.Lambda({
          region: "us-east-1"
        });

        const PayloadWithPhoneNumber = {
          workerPhoneNumber: response.twilioResponseText.From.substring(
            4,
            response.twilioResponseText.From.length
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

        const oldMoment = moment(response.twilioResponseText.dateAndTimeAdded);

        if (
          Math.abs(oldMoment.diff(moment(), "minutes")) == 0 &&
          scope.state.autoRespondWithWinning
        ) {
          const textMessage = `Hi${scope.state.workerAdditionalTitle.toUpperCase()} ${workerName}, please reply with the total amount you would like and not a per hour amount.`;

          const workerPhoneNumber = response.twilioResponseText.From.substring(
            3,
            response.twilioResponseText.From.length
          );

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
          const lambdaResponse = await lambdaPromise;

          await SaveSentToDatabase(Payload, workerName);
          scope.setState({
            workerConfirmPhoneNumberResponse: response.Payload + ""
          });
        }

        reject("bid under 20");
        return;
      }

      let allNumericalBids = [
        ...scope.state.allNumericalBids,
        {
          bid,
          from: response.twilioResponseText.From.substring(
            3,
            response.twilioResponseText.From.length
          )
        }
      ];

      let allNumericalBidsBefore = [...scope.state.allNumericalBids];

      scope.setState({ allNumericalBids: allNumericalBids });

      allNumericalBids.sort(propComparator("bid")).reverse();

      if (scope.state.autoRespondWithWinning) {
        if (allNumericalBidsBefore.length) {
          console.log(
            scope.state.workerNamePhoneNumberTransportCostArrayAlphabetical
          );

          for (
            let i = 0;
            i <
            scope.state.workerNamePhoneNumberTransportCostArrayAlphabetical
              .length;
            i++
          ) {
            console.log(
              allNumericalBidsBefore[allNumericalBidsBefore.length - 1].from
            );

            console.log(
              scope.state.workerNamePhoneNumberTransportCostArrayAlphabetical[i]
                .workerPhoneNumber
            );
            if (
              scope.state.workerNamePhoneNumberTransportCostArrayAlphabetical[i]
                .workerPhoneNumber ==
              response.twilioResponseText.From.substring(
                4,
                response.twilioResponseText.From.length
              )
            ) {
              // bid =
              //   parseFloat(bid) +
              //   parseFloat(
              //     scope.state
              //       .workerNamePhoneNumberTransportCostArrayAlphabetical[i]
              //       .transportCost
              //   );

              addTransportCost = true;
              transportCostToBeAdded = parseFloat(
                scope.state.workerNamePhoneNumberTransportCostArrayAlphabetical[
                  i
                ].transportCost
              );
              console.log("transport cost has been calculated for this worker");
              console.log(
                scope.state.workerNamePhoneNumberTransportCostArrayAlphabetical[
                  i
                ]
              );
            } else if (
              allNumericalBidsBefore[
                allNumericalBidsBefore.length - 1
              ].from.includes(
                scope.state.workerNamePhoneNumberTransportCostArrayAlphabetical[
                  i
                ].workerPhoneNumber
              )
            ) {
              winnerTransportCostToBeAdded = parseFloat(
                scope.state.workerNamePhoneNumberTransportCostArrayAlphabetical[
                  i
                ].transportCost
              );

              console.log(winnerTransportCostToBeAdded);
            }
          }

          if (
            parseFloat(bid) + transportCostToBeAdded <
            parseFloat(
              allNumericalBidsBefore[allNumericalBidsBefore.length - 1].bid
            ) +
              winnerTransportCostToBeAdded
          ) {
            var lambdaForGetNumber = new aws.Lambda({
              region: "us-east-1"
            });

            const PayloadWithPhoneNumber = {
              workerPhoneNumber: response.twilioResponseText.From.substring(
                4,
                response.twilioResponseText.From.length
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

            let textMessage = `Hi${scope.state.workerAdditionalTitle.toUpperCase()} ${workerName}, for the ${scope.state.shiftLength.toUpperCase()} shift on ${scope.state.shiftStartDayName.toUpperCase()} 📆 at ${
              scope.state.shiftStartTimeHour
            }:${
              scope.state.shiftStartTimeMinute
            } ${scope.state.shiftStartTimeMeridiem.toUpperCase()} 🕒 at location ${scope.state.shiftAddress.toUpperCase()} 📍 you are WINNING 🥇 with $${
              scope.state.shiftLowestPayment
            }. The opportunity to submit a lower rate ENDS at ${scope.state.biddingEndTime.toUpperCase()} at which point in time your bid will be sent to the manager for approval.`;

            //new construction

            const event = {
              textToTranslate: textMessage
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

            let responseInSpanish = JSON.parse(responseFromLambda.Payload)
              .translatedText;

            // let messageForDistribution = textMessage;

            // let messageForDistribution = "";

            for (
              let j = 0;
              j < scope.state.workerNameAndPhoneNumberAndShiftCountArray.length;
              j++
            ) {
              console.log(
                scope.state.workerNameAndPhoneNumberAndShiftCountArray[j]
              );
              if (
                scope.state.workerNameAndPhoneNumberAndShiftCountArray[j].key ==
                  "workerLanguage" &&
                scope.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                  .value == "Spanish" &&
                scope.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                  .workerName == workerName
              ) {
                console.log(
                  scope.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                    .value
                );
                textMessage = responseInSpanish;
              }
            }

            // end of new construction

            const workerPhoneNumber = response.twilioResponseText.From.substring(
              3,
              response.twilioResponseText.From.length
            );

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
            const lambdaResponse = await lambdaPromise;

            await SaveSentToDatabase(Payload, workerName);
            scope.setState({
              workerConfirmPhoneNumberResponse: response.Payload + ""
            });

            var lambda = new aws.Lambda({
              region: "us-east-1"
            });

            const PayloadWithLowest = {
              WorkerName: workerName,

              ShiftLowestPayment: scope.state.shiftLowestPayment,
              WorkerPhoneNumber: workerPhoneNumber
            };

            var paramsWithLowest = {
              FunctionName: "worker_lowest",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(PayloadWithLowest)
            };

            let lambdaPromiseWithLowest = lambda
              .invoke(paramsWithLowest)
              .promise();

            let value = await lambdaPromiseWithLowest;
            //get other workers to send compete to
            let NewArrayOfWorkersNamesAndNumbersCompeting = [];

            for (let i = 0; i < scope.state.CompetingWorkersArray.length; i++) {
              const WorkerLowest = scope.state.CompetingWorkersArray[i];
              const WorkerName = WorkerLowest.workerLowest.WorkerName;

              const WorkerPhoneNumber =
                WorkerLowest.workerLowest.WorkerPhoneNumber;

              let found = false;

              for (let key in NewArrayOfWorkersNamesAndNumbersCompeting) {
                if (
                  NewArrayOfWorkersNamesAndNumbersCompeting[key].WorkerName ==
                  WorkerName
                ) {
                  found = true;
                  break;
                }
              }

              if (WorkerName == workerName) {
                found = true;
              }

              if (!found) {
                NewArrayOfWorkersNamesAndNumbersCompeting.push({
                  WorkerName,
                  WorkerPhoneNumber
                });
              }
            }
            // text other workers that the new lowest
            for (
              let i = 0;
              i < NewArrayOfWorkersNamesAndNumbersCompeting.length;
              i++
            ) {
              const Worker = NewArrayOfWorkersNamesAndNumbersCompeting[i];

              const Payload = {
                body: `✋ Hi${scope.state.losingWorkerAdditionalTitle.toUpperCase()} ${Worker.WorkerName.toUpperCase()}, for the WORK on ${scope.state.shiftStartDayName.toUpperCase()} at ${
                  scope.state.shiftStartTimeHour
                }:${
                  scope.state.shiftStartTimeMinute
                } ${scope.state.shiftStartTimeMeridiem.toUpperCase()} at location ${scope.state.shiftAddress.toUpperCase()} 📍, the current LOWEST TOTAL PRICE is $${
                  scope.state.shiftLowestPayment
                } by${scope.state.workerAdditionalTitle.toUpperCase()} ${workerName}. Please reply with any LOWER TOTAL 💰 dollar amount that you are willing to work for by ${scope.state.biddingEndTime.toUpperCase()} 🕔.`.toLowerCase(),
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

              await lambdaPromise;

              await SaveSentToDatabase(Payload, Worker.workerName);
            }
          } else {
            // reply with current lowest and that bidder should reply with lower

            const workerPhoneNumber = response.twilioResponseText.From.substring(
              3,
              response.twilioResponseText.From.length
            );

            var lambdaForGetNumber = new aws.Lambda({
              region: "us-east-1"
            });

            const PayloadWithPhoneNumber = {
              workerPhoneNumber: response.twilioResponseText.From.substring(
                4,
                response.twilioResponseText.From.length
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

            // current lowest worker name

            var lambdaForGetNumberOfLowestWorker = new aws.Lambda({
              region: "us-east-1"
            });

            const PayloadWithPhoneNumberOfLowestWorker = {
              workerPhoneNumber: allNumericalBidsBefore[
                allNumericalBidsBefore.length - 1
              ].from.substring(
                1,
                allNumericalBidsBefore[allNumericalBidsBefore.length - 1].from
                  .length
              )
            };

            var getWorkerParamsOfLowestWorker = {
              FunctionName: "get_worker_with_phone_number",
              InvocationType: "RequestResponse",
              LogType: "Tail",
              Payload: JSON.stringify(PayloadWithPhoneNumberOfLowestWorker)
            };

            let lambdaPromiseForNameOfLowestWorker = lambdaForGetNumberOfLowestWorker
              .invoke(getWorkerParamsOfLowestWorker)
              .promise();

            let responseFromGetWorkerWithPhoneNumberOfLowestWorker = await lambdaPromiseForNameOfLowestWorker;

            const workerNameOfLowest = responseFromGetWorkerWithPhoneNumberOfLowestWorker.Payload.replace(
              /"/g,
              ""
            );

            const Payload = {
              body: `✋ Hi${scope.state.losingWorkerAdditionalTitle.toUpperCase()} ${workerName}, for the WORK on ${scope.state.shiftStartDayName.toUpperCase()} at ${
                scope.state.shiftStartTimeHour
              }:${
                scope.state.shiftStartTimeMinute
              } ${scope.state.shiftStartTimeMeridiem.toUpperCase()} at location ${scope.state.shiftAddress.toUpperCase()} 📍, the current LOWEST TOTAL PRICE is $${
                allNumericalBidsBefore[allNumericalBidsBefore.length - 1].bid
              } by${scope.state.workerAdditionalTitle.toUpperCase()} ${workerNameOfLowest}. Please reply with any LOWER TOTAL 💰 dollar amount that you are willing to work for by ${scope.state.biddingEndTime.toUpperCase()} 🕔.`.toLowerCase(),
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

            await lambdaPromise;

            await SaveSentToDatabase(Payload, Worker.workerName);
            resolve("Done");
          }
        } else {
          // must be first bidder
          const PayloadWithPhoneNumber = {
            workerPhoneNumber: response.twilioResponseText.From.substring(
              4,
              response.twilioResponseText.From.length
            )
          };

          var getWorkerParams = {
            FunctionName: "get_worker_with_phone_number",
            InvocationType: "RequestResponse",
            LogType: "Tail",
            Payload: JSON.stringify(PayloadWithPhoneNumber)
          };

          var lambdaForGetNumber = new aws.Lambda({
            region: "us-east-1"
          });

          let lambdaPromiseForName = lambdaForGetNumber
            .invoke(getWorkerParams)
            .promise();

          let responseFromGetWorkerWithPhoneNumber = await lambdaPromiseForName;

          const workerName = responseFromGetWorkerWithPhoneNumber.Payload.replace(
            /"/g,
            ""
          );

          let textMessage = `Hi${scope.state.workerAdditionalTitle.toUpperCase()} ${workerName}, for the ${scope.state.shiftLength.toUpperCase()} shift on ${scope.state.shiftStartDayName.toUpperCase()} 📆 at ${
            scope.state.shiftStartTimeHour
          }:${
            scope.state.shiftStartTimeMinute
          } ${scope.state.shiftStartTimeMeridiem.toUpperCase()} 🕒 at location ${scope.state.shiftAddress.toUpperCase()} 📍 you are WINNING 🥇 with $${
            scope.state.shiftLowestPayment
          }. The opportunity to submit a lower rate ENDS at ${scope.state.biddingEndTime.toUpperCase()} at which point in time your bid will be sent to the manager for approval.`;

          //new construction

          const event = {
            textToTranslate: textMessage
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

          // console.log(responseInSpanish);

          let responseInSpanish = JSON.parse(responseFromLambda.Payload)
            .translatedText;

          for (
            let j = 0;
            j < scope.state.workerNameAndPhoneNumberAndShiftCountArray.length;
            j++
          ) {
            console.log(
              scope.state.workerNameAndPhoneNumberAndShiftCountArray[j]
            );
            if (
              scope.state.workerNameAndPhoneNumberAndShiftCountArray[j].key ==
                "workerLanguage" &&
              scope.state.workerNameAndPhoneNumberAndShiftCountArray[j].value ==
                "Spanish" &&
              scope.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                .workerName == workerName
            ) {
              console.log(
                scope.state.workerNameAndPhoneNumberAndShiftCountArray[j].value
              );
              textMessage = responseInSpanish;
            }
          }

          // end of new construction

          const workerPhoneNumber = response.twilioResponseText.From.substring(
            3,
            response.twilioResponseText.From.length
          );

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
          const lambdaResponse = await lambdaPromise;

          await SaveSentToDatabase(Payload, workerName);
          scope.setState({
            workerConfirmPhoneNumberResponse: response.Payload + ""
          });

          resolve("done");
        }
      } else {
        resolve("auto respond not on");
      }
    } else {
      resolve("not number");
    }
  });
}

const propComparator = propName => (a, b) =>
  a[propName] == b[propName] ? 0 : a[propName] < b[propName] ? -1 : 1;

const SaveSentToDatabase = async (Payload, name = "") => {
  var lambda = new aws.Lambda({
    region: "us-east-1"
  });
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
