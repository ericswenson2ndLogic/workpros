import AWS from "aws-sdk";
import moment from "moment";

AWS.config.update({
  region: "us-east-1",
  accessKeyId: "AKIAS2CQTKI7Z37ONTGY",
  secretAccessKey: "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"
});

const publish = (objectToPublish, topicToPublishTo) => {
  const params = {
    Message: JSON.stringify(objectToPublish),
    TopicArn: `arn:aws:sns:us-east-1:193442566719:${topicToPublishTo}`
  };

  var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
    .publish(params)
    .promise();

  publishTextPromise
    .then(() => {
      alert(`success publishing ${topicToPublishTo}`);
    })
    .catch(err => {
      console.error(err, err.stack);
    });
};

export const publishShiftToDatabase = shiftDateTimeWorkerTypeLocationAndQuantity => {
  publish(
    shiftDateTimeWorkerTypeLocationAndQuantity,
    "shiftDateTimeWorkerTypeLocationAndQuantity"
  );
};

export const publishRestaurant = stateOfApp => {
  const { restaurantName, restaurantLocation } = stateOfApp;

  if (restaurantName && restaurantLocation) {
    const restaurant = {
      restaurantName,
      restaurantLocation
    };

    publish(restaurant, "restaurant");
  } else {
    alert("missing value for publishing manager, shift and payment amount");
  }
};

export const publishWorkerShiftAndWorkerCost = stateOfApp => {
  const { workerForShift, shiftForWorkerCost, workerCost } = stateOfApp;

  if (workerForShift && shiftForWorkerCost && workerCost) {
    const workerShiftAndWorkerCost = {
      workerForShift,
      shiftForWorkerCost,
      workerCost
    };

    publish(workerShiftAndWorkerCost, "workerShiftAndWorkerCost");
  } else {
    alert("missing value for publishing manager, shift and payment amount");
  }
};

export const publishManagerShiftAndPaymentAmount = stateOfApp => {
  const {
    managerForPayment,
    shiftForManagerPayment,
    shiftPaymentAmount
  } = stateOfApp;

  if (managerForPayment && shiftForManagerPayment && shiftPaymentAmount) {
    const managerShiftAndPaymentAmount = {
      managerForPayment,
      shiftForManagerPayment,
      shiftPaymentAmount
    };

    publish(managerShiftAndPaymentAmount, "managerShiftAndPaymentAmount");
  } else {
    alert("missing value for publishing manager, shift and payment amount");
  }
};

export const publishWorkerNamePhoneNumberPaymentStrategyUsernameAndAvailability = stateOfApp => {
  const {
    workerName,
    workerPhoneNumber,
    workerEmail,
    workerAvailability,
    workerPaymentUsername,
    workerPaymentStrategy,
    workerLowestCost
  } = stateOfApp;

  if (
    workerName &&
    workerPhoneNumber &&
    workerEmail &&
    workerAvailability &&
    workerPaymentUsername &&
    workerPaymentStrategy &&
    workerLowestCost
  ) {
    const workerNamePhoneNumberPaymentStrategyUsernameAndAvailability = {
      workerName,
      workerPhoneNumber,
      workerEmail,
      workerAvailability,
      workerPaymentUsername,
      workerPaymentStrategy,
      workerLowestCost
    };

    publish(
      workerNamePhoneNumberPaymentStrategyUsernameAndAvailability,
      "workerNamePhoneNumberPaymentStrategyUsernameAndAvailability"
    );
  } else {
    alert(
      "missing value for publishing worker naame, phone number, payment strategy, username and availability"
    );
  }
};
export const publishShiftDateTimeLocationWorkerTypeAndQuantity = async stateOfApp => {
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
    workerForDistributionSelectedArray
  } = stateOfApp;

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
    managerOfShift &&
    workerForDistributionSelectedArray.length > 0
  ) {
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
      workerForDistributionSelectedArray
    };

    var lambda = new AWS.Lambda({
      region: "us-east-1"
    });

    var params = {
      FunctionName: "distribute_offer_by_text",
      InvocationType: "RequestResponse",
      LogType: "Tail",
      Payload: JSON.stringify(shiftDateTimeWorkerTypeLocationAndQuantity)
    };

    let lambdaPromise = lambda.invoke(params).promise();

    let value = await lambdaPromise;
  } else {
    alert(
      "missing value for publishing shift date, time, worker type, location and quantity"
    );
  }
};
export const publishManagerNamePhoneNumberCreditCardAndCustomerID = stateOfApp => {
  const {
    managerName,
    managerPhoneNumber,
    managerEmail,
    managerCreditCardNumber,
    managerCreditCardExpirationDate,
    managerCreditCardSecurityCode,
    managerCustomerID
  } = stateOfApp;

  if (
    managerName &&
    managerPhoneNumber &&
    managerEmail &&
    managerCreditCardNumber &&
    managerCreditCardExpirationDate &&
    managerCreditCardSecurityCode &&
    managerCustomerID
  ) {
    const managerNamePhoneNumberCreditCardAndCustomerID = {
      managerName,
      managerPhoneNumber,
      managerEmail,
      managerCreditCard: {
        managerCreditCardNumber,
        managerCreditCardExpirationDate,
        managerCreditCardSecurityCode
      },
      managerCustomerID
    };

    createCustomer(managerName, managerCustomerID);

    publish(
      managerNamePhoneNumberCreditCardAndCustomerID,
      "managerNamePhoneNumberCreditCardAndCustomerID"
    );
  } else {
    alert(
      "missing value for publishing manager name, phone number, and credit card information"
    );
  }
};

const createCustomer = (managerName, managerCustomerID) => {
  const Payload = {
    managerCustomerID,
    managerName
  };

  var params = {
    FunctionName: "create_customer",
    InvocationType: "RequestResponse",
    LogType: "Tail",
    Payload: JSON.stringify(Payload)
  };

  var lambda = new AWS.Lambda({
    region: "us-east-1"
  });

  let lambdaPromise = lambda.invoke(params).promise();

  lambdaPromise.then(data => console.log(data));
};
