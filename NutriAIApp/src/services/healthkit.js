import AppleHealthKit from 'react-native-health';

const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.DietaryEnergy,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.DietaryEnergy,
      AppleHealthKit.Constants.Permissions.DietaryProtein,
      AppleHealthKit.Constants.Permissions.DietaryCarbohydrates,
      AppleHealthKit.Constants.Permissions.DietaryFatTotal,
      AppleHealthKit.Constants.Permissions.Workout,
    ],
  },
};

let _initialized = false;

export function initHealthKit() {
  return new Promise((resolve, reject) => {
    if (_initialized) return resolve(true);
    AppleHealthKit.initHealthKit(permissions, (err) => {
      if (err) return reject(err);
      _initialized = true;
      resolve(true);
    });
  });
}

export function isHealthKitAvailable() {
  return new Promise((resolve) => {
    AppleHealthKit.isAvailable((err, available) => {
      resolve(!err && available);
    });
  });
}

export function writeMealToHealthKit(meal) {
  return new Promise((resolve) => {
    const date = new Date().toISOString();

    // Write calories
    if (meal.cal) {
      AppleHealthKit.saveFoodSample(
        { value: meal.cal, startDate: date, name: meal.name || 'Meal' },
        () => {}
      );
    }

    // Note: react-native-health food sample covers dietary energy.
    // Individual macros (protein, carbs, fat) require custom quantity samples
    // which have limited support. We write the calorie total as the primary sync.
    resolve();
  });
}

export function writeWorkoutToHealthKit(workout) {
  return new Promise((resolve, reject) => {
    const durationMin = parseInt(workout.duration) || 30;
    const end = new Date();
    const start = new Date(end.getTime() - durationMin * 60 * 1000);

    AppleHealthKit.saveWorkout(
      {
        type: AppleHealthKit.Constants.Activities.TraditionalStrengthTraining,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        energyBurned: workout.calBurn || 0,
      },
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

export function getTodaySteps() {
  return new Promise((resolve) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    AppleHealthKit.getStepCount(
      { date: start.toISOString(), includeManuallyAdded: true },
      (err, results) => {
        resolve(err ? 0 : Math.round(results?.value || 0));
      }
    );
  });
}

export function getTodayActiveCalories() {
  return new Promise((resolve) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    AppleHealthKit.getActiveEnergyBurned(
      { startDate: start.toISOString(), endDate: new Date().toISOString() },
      (err, results) => {
        if (err || !results || results.length === 0) return resolve(0);
        const total = results.reduce((sum, r) => sum + (r.value || 0), 0);
        resolve(Math.round(total));
      }
    );
  });
}
