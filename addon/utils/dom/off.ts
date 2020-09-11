export default function off(
  elements: Array<EventTarget | null> | EventTarget | null,
  eventNames: string,
  callback: (event: Event) => void,
  eventOptions?: boolean | AddEventListenerOptions | undefined
) {
  if (!(elements instanceof Array)) {
    elements = [elements];
  }
  const
     events = eventNames.split(" ");
     
  elements.map(element =>
    events.map(eventName => {
      if(element) {
        element.removeEventListener(eventName, callback, eventOptions);
      }
    })
  );
}
