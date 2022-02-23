export default function merge(...objects: any[]): any {
  return objects.reduce((result, object) => {
    Object.keys(object).forEach((key) => {
      if (
        typeof result[key] === 'object' &&
        typeof object[key] === 'object' &&
        !Array.isArray(result[key]) &&
        !Array.isArray(object[key])
      ) {
        result[key] = merge(result[key], object[key]);
      } else {
        result[key] = object[key];
      }
    });

    return result;
  }, {});
}
