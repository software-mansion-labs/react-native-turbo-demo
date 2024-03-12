export type ComparableObject = Readonly<
  | {
      [key: string]: any;
    }
  | undefined
>;

const isObject = (object: ComparableObject) => {
  return object != null && typeof object === 'object';
};

export const isDeepEqual = (
  object1: ComparableObject,
  object2: ComparableObject
) => {
  if (!object1 || !object2) return false;

  const objKeys1 = Object.keys(object1);
  const objKeys2 = Object.keys(object2);

  if (objKeys1.length !== objKeys2.length) return false;

  for (var key of objKeys1) {
    const value1 = object1[key];
    const value2 = object2[key];

    const areValuesObjects = isObject(value1) && isObject(value2);

    if (areValuesObjects ? !isDeepEqual(value1, value2) : value1 !== value2) {
      return false;
    }
  }
  return true;
};
