interface SearchProps {
  value: string;
  onChange: (value: string) => void;
}

function Search({ value, onChange }: SearchProps) {
  return (
    <input
      type="search"
      value={value}
      placeholder="Keresés…"
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
}

export default Search;
