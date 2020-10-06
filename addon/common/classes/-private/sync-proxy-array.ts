import { isArray } from '@ember/array';
import NativeArray from "@ember/array/-private/native-array";
import { IArrayObserver } from '../../types';
import ObservableProxyArray from './observable-proxy-array';
import { A } from '@ember/array';
import { notifyPropertyChange } from '@ember/object';

export default abstract class SyncProxyArray<TContent, TSource> extends ObservableProxyArray<TContent> {
  //constructor
  public init() {
    let
      source: NativeArray<TSource> | undefined;

    source = this.source;

    if (
      isArray(source)
    ) {

      this.content = A(source.map(item =>
        this.serializeToContent(item)
      ));

      source.addArrayObserver(this, this.sourceArrayObserver);
    }

    super.init();
  }

  public get source() {
    return this._source;
  }

  public set source(
    value: NativeArray<TSource> | undefined
  ) {
    if (this._source !== value) {
      this._source = value;
      notifyPropertyChange(this, 'source')
    }
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
    _sourceChanged: NativeArray<TSource>,
    _offset: number,
    _removeCount: number,
    _addCount: number
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

