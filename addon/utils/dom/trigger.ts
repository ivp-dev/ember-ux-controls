export default function trigger(
  element: EventTarget,
  eventName: string,
  boobles: boolean = true,
  cancelable: boolean = true,
  details: any = null
) {
  const
    event: Event | CustomEvent = window.CustomEvent
      ? new CustomEvent(eventName)
      : document.createEvent(
        'CustomEvent'
      );

  (<CustomEvent>event).initCustomEvent(
    eventName,
    boobles,
    cancelable,
    details
  );

  element.dispatchEvent(
    event
  );
}


