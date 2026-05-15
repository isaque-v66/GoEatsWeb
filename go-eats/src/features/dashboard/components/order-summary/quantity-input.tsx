interface Props {
  value: string | number
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void
  onBlur: (
    e: React.FocusEvent<HTMLInputElement>
  ) => void
  onKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => void
}

export function QuantityInput({
  value,
  onChange,
  onBlur,
  onKeyDown,
}: Props) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      className="
        w-12 text-center border rounded
        px-1 py-1 text-sm
        focus:outline-none
        focus:ring-2
        focus:ring-primary
      "
    />
  )
}