import NativeArray from "@ember/array/-private/native-array";
import { IArrayObserver } from '../../types';
import ObservableProxyArray from './observable-proxy-array';
import { A } from '@ember/array';
import { notifyPropertyChange } from '@ember/object';
import { isArray } from '@ember/array';

export default abstract class SyncProxyArray<TContent, TSource> extends ObservableProxyArray<TContent> {
  public get source() {
    return this._source;
  }

  public set source(
    newSource: NativeArray<TSource> | undefined
  ) {
    let
      oldSource: NativeArray<TSource> | undefined;

    oldSource = this._source;

    if (oldSource === newSource) {
      return;
    }

    if (oldSource) {
      oldSource.removeArrayObserver(this, this.sourceArrayObserver);
    }

    if (this.content.length) {
      this.content.clear();
    }

    if (isArray(newSource)) {
      newSource.addArrayObserver(this, this.sourceArrayObserver);

      this.content.pushObjects(A(newSource.map(item =>
        this.serializeToContent(item)
      )));
    }

    this._source = newSource;

    notifyPropertyChange(this, 'source');
  }

  public willDestroy() {
    let
      source: NativeArray<TSource> | undefined;

    source = this.source;

    if (source) {
      source.removeArrayObserver(this, this.sourceArrayObserver);
    }

    super.willDestroy();
  }

  protected abstract serializeToContent(source: TSource): TContent

  protected abstract serializeToSource(content: TContent): TSource

  protected didSourceChange(
    sourceChanged: NativeArray<TSource>,
    offset: number,
    removeCount: number,
    addCount: number
  ): void {
    let
      source: TSource,
      contentToAdd = A<TContent>();

    for (source of sourceChanged.slice(offset, offset + addCount)) {
      contentToAdd.push(this.serializeToContent(source) as TContent);
    }

    super.replaceContent(offset, removeCount, contentToAdd);
  }

  protected willSourceChange(
    //@ts-ignore
    sourceChanged: NativeArray<TSource>,
    //@ts-ignore
    offset: number,
    //@ts-ignore
    removeCount: number,
    //@ts-ignore
    addCount: number
  ) { }

  protected get sourceArrayObserver() {
    if (typeof this._sourceArrayObserver === 'undefined') {
      this._sourceArrayObserver = {
        didChange: this.didSourceChange,
        willChange: this.willSourceChange
      }
    }

    return this._sourceArrayObserver;
  }

  protected replaceContent(
    offset: number,
    removeCount: number,
    contentToAdd?: NativeArray<TContent>
  ): void {

    if (!this.source) {
      return super.replaceContent(offset, removeCount, contentToAdd)
    }

    this.source.replace(offset, removeCount, contentToAdd?.map(content =>
      this.serializeToSource(content)
    ) ?? []);
  }

  private _source?: NativeArray<TSource>
  private _sourceArrayObserver?: IArrayObserver<unknown>
}

