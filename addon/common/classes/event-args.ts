import { ICancellableEventArgs, IEventArgs } from "ember-ux-controls/common/types";

export class EventArgs implements IEventArgs { }

export class CancellableEventArgs extends EventArgs implements ICancellableEventArgs {
    public canceled: boolean = false;
    public cancel() {
        this.canceled = true;
    }
} 