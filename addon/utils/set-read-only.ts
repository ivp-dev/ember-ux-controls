export default function setReadOnly<
  TSource extends object,
  TKey extends keyof TSource,
  TValue extends TSource[TKey]
>(
  src: TSource,
  key: TKey,
  value: TValue | ((src: TSource) => TValue)
) {
  const
    result = typeof value === 'function'
      ? value.call(null, src)
      : value;

  src[key] = result;

  return result;
}

