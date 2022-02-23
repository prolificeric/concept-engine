export interface Preventable {
  preventDefault: () => void;
  stopPropagation: () => void;
}

export const intercept = <TEvent extends Preventable = Preventable>(
  handler?: (event: TEvent) => void,
) => {
  return (event: TEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (handler) {
      handler(event);
    }
  };
};
