export default function on(
  source: EventTarget | Array<EventTarget>,
  eventNames: string,
  callback: (event: Event) => void | boolean,
  eventOptions?: boolean | AddEventListenerOptions | undefined
) {
  const
    events = eventNames.split(" "),
    targets = source instanceof Array
      ? source.slice()
      : [source];

  targets.forEach(target => {
    events.map(eventName => {
      target.addEventListener(eventName, callback, eventOptions);
    });
  });
}
