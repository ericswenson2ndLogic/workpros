import firebase from "firebase";
import aws from "aws-sdk";

import attemptAutoRespondIfNumber from "./attemptAutoRespondIfNumber.js";

var lambda = new aws.Lambda({
  region: "us-east-1"
});

export const pullWorkersManagersAndShiftsFromDatabase = scope => {
  firebase
    .database()
    .ref("/workerNamePhoneNumberPaymentStrategyUsernameAndAvailability/")
    .once("value")
    .then(data => {
      const workerObjects = data.val();
      let workerForCostArray = [];
      let workerForPickupArray = [];
      let workerForDistributionArray = [];
      let workerWithLowestCostArray = [];
      let workerForUpdatingLowestPaymentArray = [];

      for (let uid in workerObjects) {
        workerForCostArray.push(
          workerObjects[uid]
            .workerNamePhoneNumberPaymentStrategyUsernameAndAvailability
        );
        workerForPickupArray.push(
          workerObjects[uid]
            .workerNamePhoneNumberPaymentStrategyUsernameAndAvailability
        );
        workerForDistributionArray.push(
          workerObjects[uid]
            .workerNamePhoneNumberPaymentStrategyUsernameAndAvailability
        );
        workerWithLowestCostArray.push(
          workerObjects[uid]
            .workerNamePhoneNumberPaymentStrategyUsernameAndAvailability
        );
        workerForUpdatingLowestPaymentArray.push(
          workerObjects[uid]
            .workerNamePhoneNumberPaymentStrategyUsernameAndAvailability
        );
      }
      scope.setState({
        workerForCostArray,
        workerForPickupArray,
        workerForDistributionArray,
        workerWithLowestCostArray,
        workerForUpdatingLowestPaymentArray
      });
    });

  firebase
    .database()
    .ref("/managerNamePhoneNumberCreditCardAndCustomerID/")
    .once("value")
    .then(data => {
      const managerObjects = data.val();
      let managerOfShiftArray = [];
      let managerForPaymentArray = [];
      let managerForTransportStatusArray = [];

      for (let uid in managerObjects) {
        managerOfShiftArray.push(
          managerObjects[uid].managerNamePhoneNumberCreditCardAndCustomerID
        );
        managerForPaymentArray.push(
          managerObjects[uid].managerNamePhoneNumberCreditCardAndCustomerID
        );
        managerForTransportStatusArray.push(
          managerObjects[uid].managerNamePhoneNumberCreditCardAndCustomerID
        );
      }
      scope.setState({
        managerOfShiftArray,
        managerForPaymentArray,
        managerForTransportStatusArray
      });
    });

  firebase
    .database()
    .ref("/shiftDateTimeWorkerTypeLocationAndQuantity/")
    .once("value")
    .then(data => {
      const shiftObjects = data.val();
      let shiftsForManagerPaymentArray = [];
      let shiftsForWorkerCostArray = [];
      let shiftsForUpdatingCostArray = [];
      let shiftsForDistributionArray = [];

      for (let uid in shiftObjects) {
        shiftsForManagerPaymentArray.push(
          shiftObjects[uid].shiftDateTimeWorkerTypeLocationAndQuantity
        );
        shiftsForWorkerCostArray.push(
          shiftObjects[uid].shiftDateTimeWorkerTypeLocationAndQuantity
        );
        shiftsForUpdatingCostArray.push(
          shiftObjects[uid].shiftDateTimeWorkerTypeLocationAndQuantity
        );
        shiftObjects[uid].shiftDateTimeWorkerTypeLocationAndQuantity.uid = uid;
        shiftsForDistributionArray.push(
          shiftObjects[uid].shiftDateTimeWorkerTypeLocationAndQuantity
        );
      }
      scope.setState({
        shiftsForManagerPaymentArray,
        shiftsForWorkerCostArray,
        shiftsForUpdatingCostArray,
        shiftsForDistributionArray
      });
    });

  firebase
    .database()
    .ref("/shiftUpdatedWithLowestPaymentAndWorker/")
    .once("value")
    .then(data => {
      const shiftObjects = data.val();

      let shiftsWithUpdatedCostArray = [];

      for (let uid in shiftObjects) {
        shiftsWithUpdatedCostArray.push(
          shiftObjects[uid].shiftUpdatedWithLowestPaymentAndWorker
        );
      }
      scope.setState({
        shiftsWithUpdatedCostArray
      });
    });

  firebase
    .database()
    .ref("/restaurant/")
    .once("value")
    .then(data => {
      const restaurantObjects = data.val();
      let restaurantArray = [];

      for (let uid in restaurantObjects) {
        restaurantArray.push(restaurantObjects[uid].restaurant);
      }
      scope.setState({
        restaurantArray
      });
    });

  firebase
    .database()
    .ref("/workerPhotoCode/")
    .once("value")
    .then(data => {
      const workerPhotoObjects = data.val();
      let workerPhotoArray = [];

      for (let uid in workerPhotoObjects) {
        // workerPhotoArray.push(workerPhotoObjects[uid].workerPhoto);
        console.log(workerPhotoObjects[uid]);
        console.log(workerPhotoObjects[uid].workerPhotoCode);
        if (
          workerPhotoObjects[uid].workerPhotoCode.workerName
            .toLowerCase()
            .includes("charlene")
        ) {
          console.log(workerPhotoObjects[uid]);
        }
      }
      // scope.setState({
      //   workerPhotoArray
      // });
    });

  firebase
    .database()
    .ref("/workerNamePhoneNumber/")
    .once("value")
    .then(data => {
      const workerObjects = data.val();
      let workerNameAndPhoneNumberArray = [];

      for (let uid in workerObjects) {
        workerNameAndPhoneNumberArray.push(
          workerObjects[uid].workerNamePhoneNumber
        );
      }
      scope.setState({
        workerNameAndPhoneNumberArray
      });
    });

  firebase
    .database()
    .ref("/workerNamePhoneNumberBanned/")
    .once("value")
    .then(data => {
      const workerObjects = data.val();
      let workerNameAndPhoneNumberBannedArray = [];

      for (let uid in workerObjects) {
        workerNameAndPhoneNumberBannedArray.push(
          workerObjects[uid].workerNamePhoneNumberBanned
        );
      }
      scope.setState({
        workerNameAndPhoneNumberBannedArray
      });
    });

  firebase
    .database()
    .ref("/workerNamePhoneNumber/")
    .once("value")
    .then(data => {
      const workerObjects = data.val();
      let workerNameAndPhoneNumberArrayAlphabetical = [];

      for (let uid in workerObjects) {
        workerNameAndPhoneNumberArrayAlphabetical.push(
          workerObjects[uid].workerNamePhoneNumber
        );
      }

      scope.setState({
        workerNameAndPhoneNumberArrayAlphabetical
      });
    });

  firebase
    .database()
    .ref("/workerNamePhoneNumberTransportCost/")
    .once("value")
    .then(data => {
      const workerObjects = data.val();
      let workerNamePhoneNumberTransportCostArrayAlphabetical = [];

      for (let uid in workerObjects) {
        workerNamePhoneNumberTransportCostArrayAlphabetical.push(
          workerObjects[uid].workerNamePhoneNumberTransportCost
        );
      }

      workerNamePhoneNumberTransportCostArrayAlphabetical.sort(function(a, b) {
        return a.workerName.localeCompare(b.workerName);
      });

      scope.setState({
        workerNamePhoneNumberTransportCostArrayAlphabetical
      });
    });

  firebase
    .database()
    .ref("/workerNamePhoneNumber/")
    .once("value")
    .then(data => {
      const workerObjects = data.val();
      let workerNameAndPhoneNumberArrayPhiladelphia = [];

      for (let uid in workerObjects) {
        if (
          workerObjects[uid].workerNamePhoneNumber.workerName.includes(
            "Philadelphia"
          )
        ) {
          workerNameAndPhoneNumberArrayPhiladelphia.push(
            workerObjects[uid].workerNamePhoneNumber
          );
        }
      }

      console.log(
        workerNameAndPhoneNumberArrayPhiladelphia.sort(function(a, b) {
          return a.workerName.localeCompare(b.workerName);
        })
      );

      scope.setState({
        workerNameAndPhoneNumberArrayPhiladelphia
      });
    });

  firebase
    .database()
    .ref("/countCostByDate/")
    .once("value")
    .then(data => {
      const countCostByDateObjects = data.val();
      let countCostByDateArray = [];

      for (let uid in countCostByDateObjects) {
        // if (
        //   countCostByDateObjects[uid].countCostByDate.workerName.includes(
        //     "Philadelphia"
        //   )
        // ) {
        countCostByDateArray.push(countCostByDateObjects[uid].countCostByDate);
        // }
      }

      // console.log(
      //   countCostByDateArray.sort(function(a, b) {
      //     return a.workerName.localeCompare(b.workerName);
      //   })
      // );

      scope.setState({
        countCostByDateArray
      });
    });

  firebase
    .database()
    .ref("/workerNamePhoneNumber/")
    .once("value")
    .then(data => {
      const workerObjects = data.val();
      let workerNameAndPhoneNumberArrayLosAngeles = [];

      for (let uid in workerObjects) {
        if (
          workerObjects[uid].workerNamePhoneNumber.workerName.includes(
            "Los Angeles"
          )
        ) {
          workerNameAndPhoneNumberArrayLosAngeles.push(
            workerObjects[uid].workerNamePhoneNumber
          );
        }
      }

      workerNameAndPhoneNumberArrayLosAngeles.sort(function(a, b) {
        return a.workerName.localeCompare(b.workerName);
      });

      console.log(workerNameAndPhoneNumberArrayLosAngeles.length);

      scope.setState({
        workerNameAndPhoneNumberArrayLosAngeles
      });
    });

  firebase
    .database()
    .ref("/workerNamePhoneNumber/")
    .once("value")
    .then(data => {
      const workerObjects = data.val();
      let workerNameAndPhoneNumberArrayDallas = [];

      for (let uid in workerObjects) {
        if (
          workerObjects[uid].workerNamePhoneNumber.workerName.includes("Dallas")
        ) {
          workerNameAndPhoneNumberArrayDallas.push(
            workerObjects[uid].workerNamePhoneNumber
          );
        }
      }

      workerNameAndPhoneNumberArrayDallas.sort(function(a, b) {
        return a.workerName.localeCompare(b.workerName);
      });

      scope.setState({
        workerNameAndPhoneNumberArrayDallas
      });
    });

  firebase
    .database()
    .ref("/workerNamePhoneNumber/")
    .once("value")
    .then(data => {
      const workerObjects = data.val();
      let workerNameAndPhoneNumberArrayDallas = [];
      let workerUIDArray = [];

      for (let uid in workerObjects) {
        workerUIDArray.push({
          uid,
          workerName: workerObjects[uid].workerNamePhoneNumber.workerName
        });
        if (
          workerObjects[uid].workerNamePhoneNumber.workerName.includes("Dallas")
        ) {
          workerNameAndPhoneNumberArrayDallas.push(
            workerObjects[uid].workerNamePhoneNumber
          );
        }
      }

      workerNameAndPhoneNumberArrayDallas.sort(function(a, b) {
        return a.workerName.localeCompare(b.workerName);
      });

      scope.setState({
        workerNameAndPhoneNumberArrayDallas,
        workerUIDArray
      });
    });

  firebase
    .database()
    .ref("/workerNamePhoneNumberKeyValue/")
    .once("value")
    .then(data => {
      const shiftCountObjects = data.val();
      let workerNameAndPhoneNumberAndShiftCountArray = [];

      for (let uid in shiftCountObjects) {
        workerNameAndPhoneNumberAndShiftCountArray.push(
          shiftCountObjects[uid].workerNamePhoneNumberKeyValue
        );
      }

      scope.setState({
        workerNameAndPhoneNumberAndShiftCountArray
      });
    });

  firebase
    .database()
    .ref("/managerNamePhoneNumber/")
    .once("value")
    .then(data => {
      const managerObjects = data.val();
      let managerNameAndPhoneNumberArray = [];

      for (let uid in managerObjects) {
        managerNameAndPhoneNumberArray.push(
          managerObjects[uid].managerNamePhoneNumber
        );
      }

      managerNameAndPhoneNumberArray.sort(function(a, b) {
        return a.managerName.localeCompare(b.managerName);
      });

      scope.setState({
        managerNameAndPhoneNumberArray
      });
    });

  firebase
    .database()
    .ref("/managerNameEmail/")
    .once("value")
    .then(data => {
      const managerObjects = data.val();
      let managerNameAndEmailArray = [];

      for (let uid in managerObjects) {
        managerNameAndEmailArray.push(managerObjects[uid].managerNameEmail);
      }

      scope.setState({
        managerNameAndEmailArray
      });
    });

  firebase
    .database()
    .ref("/managerNamePhoneNumber/")
    .once("value")
    .then(data => {
      const managerObjects = data.val();
      // let managerNameAndPhoneNumberArrayDallas = [];
      let managerUIDArray = [];

      for (let uid in managerObjects) {
        managerUIDArray.push({
          uid,
          managerName: managerObjects[uid].managerNamePhoneNumber.managerName
        });
      }

      scope.setState({
        // managerNameAndPhoneNumberArrayDallas,
        managerUIDArray
      });
    });

  firebase
    .database()
    .ref("/restaurantNameLocation/")
    .once("value")
    .then(data => {
      const restaurantObjects = data.val();
      let restaurantNameAndLocationArray = [];

      for (let uid in restaurantObjects) {
        restaurantNameAndLocationArray.push(
          restaurantObjects[uid].restaurantNameLocation
        );
      }

      scope.setState({
        restaurantNameAndLocationArray
      });
    });

  firebase
    .database()
    .ref("/twilioResponseText/")
    .on("child_added", async childSnapshot => {
      const childAdded = childSnapshot.val();
      const childKey = childSnapshot.key;
      console.log(childKey);
      childAdded.childKey = childKey;

      console.log(childAdded);

      console.log(scope.state.countCostByDateArray);

      // if (scope.state.countCostByDatee)

      let alreadyInCountCostByDateArray = false;

      if (scope.state.countCostByDateArray.length) {
        for (let i = 0; i < scope.state.countCostByDateArray.length; i++) {
          if (
            scope.state.countCostByDateArray[i].MessageSid ==
            childAdded.twilioResponseText.MessageSid
          ) {
            alreadyInCountCostByDateArray = true;
          }
        }
      }

      if (!alreadyInCountCostByDateArray) {
        var lambdaForCount = new aws.Lambda({
          region: "us-east-1"
        });
        const event = {
          body: childAdded.twilioResponseText.Body,
          phoneNumber: childAdded.twilioResponseText.From,
          MessageSid: childAdded.twilioResponseText.MessageSid
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

      let newTwilioResponseTextArray = [
        ...scope.state.twilioResponseTextArray,
        childAdded
      ];

      scope.setState({ twilioResponseTextArray: newTwilioResponseTextArray });
      console.log(
        await attemptAutoRespondIfNumber(scope, childAdded).catch(async () => {
          console.log("bid under 20 reject");
        })
      );

      let matchedWorkerFromDatabase = "";

      for (
        let i = 0;
        i < scope.state.workerNameAndPhoneNumberArray.length;
        i++
      ) {
        if (
          (scope.state.workerNameAndPhoneNumberArray[i].workerPhoneNumber &&
            scope.state.workerNameAndPhoneNumberArray[
              i
            ].workerPhoneNumber.includes(childAdded.twilioResponseText.From)) ||
          (childAdded.twilioResponseText.From &&
            childAdded.twilioResponseText.From.includes(
              scope.state.workerNameAndPhoneNumberArray[i].workerPhoneNumber
            ))
        ) {
          matchedWorkerFromDatabase =
            scope.state.workerNameAndPhoneNumberArray[i].workerName;
        }
      }

      for (
        let i = 0;
        i < scope.state.managerNameAndPhoneNumberArray.length;
        i++
      ) {
        if (
          (childAdded.twilioResponseText.From &&
            childAdded.twilioResponseText.From.includes(
              scope.state.managerNameAndPhoneNumberArray[i].managerPhoneNumber
            )) ||
          (scope.state.managerNameAndPhoneNumberArray[i].managerPhoneNumber &&
            scope.state.managerNameAndPhoneNumberArray[
              i
            ].managerPhoneNumber.includes(childAdded.twilioResponseText.From))
        ) {
          matchedWorkerFromDatabase =
            scope.state.managerNameAndPhoneNumberArray[i].managerName;
        }
      }

      for (
        let i = 0;
        i < scope.state.workerNameAndPhoneNumberBannedArray.length;
        i++
      ) {
        console.log(scope.state.workerNameAndPhoneNumberBannedArray);
        if (
          (childAdded.twilioResponseText.From &&
            childAdded.twilioResponseText.From.includes(
              scope.state.workerNameAndPhoneNumberBannedArray[i]
                .workerPhoneNumber
            )) ||
          (scope.state.workerNameAndPhoneNumberBannedArray[i]
            .workerPhoneNumber &&
            scope.state.workerNameAndPhoneNumberBannedArray[
              i
            ].workerPhoneNumber.includes(childAdded.twilioResponseText.From))
        ) {
          matchedWorkerFromDatabase =
            "BANNED WORKER " +
            scope.state.workerNameAndPhoneNumberBannedArray[i].workerName;
        }
      }

      // if (scope.state.workerNameAndPhoneNumberBannedArray && !matchedWorkerFromDatabase) {
      //   console.log(childAdded);
      //   let phoneNumber = childAdded.twilioResponseText.From.substring(
      //     3,
      //     childAdded.twilioResponseText.From.length
      //   );

      //   if (childAdded && scope.state.autoRespondName) {
      //     const Payload = {
      //       body: `✋ Hey please reply with your first name, last name and city in the following format - John Doe (Los Angeles) - to receive texts 🤳 about dishwasher, busser 🍽 and prep cook or line cook 👨‍🍳 opportunities from WorkPros.io.`,
      //       phoneNumber
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

      //     const childAdded = await lambdaPromise;

      //     await SaveSentToDatabase(Payload, "unknown");
      //   }
      // }
    });

  firebase
    .database()
    .ref("/twilioSentText/")
    .on("child_added", childSnapshot => {
      const childAdded = childSnapshot.val();

      let newTwilioSentTextArray = [
        ...scope.state.twilioSentTextArray,
        childAdded
      ];

      scope.setState({ twilioSentTextArray: newTwilioSentTextArray });
    });

  firebase
    .database()
    .ref("/workerLowest/")
    .on("child_added", childSnapshot => {
      const childAdded = childSnapshot.val();

      let NewWorkerLowestArray = [...scope.state.WorkerLowestArray, childAdded];

      scope.setState({ WorkerLowestArray: NewWorkerLowestArray });
    });

  firebase
    .database()
    .ref("/workerLowest/")
    .on("child_added", childSnapshot => {
      const childAdded = childSnapshot.val();

      let NewWorkerLowestArray = [
        ...scope.state.CompetingWorkersArray,
        childAdded
      ];

      scope.setState({ CompetingWorkersArray: NewWorkerLowestArray });
    });
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
