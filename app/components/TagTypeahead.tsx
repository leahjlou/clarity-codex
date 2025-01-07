import Autocomplete from "@mui/material/Autocomplete";
import Tag from "./Tag";
import { TextField } from "@mui/material";

const TagTypeahead = ({
  allTags,
  value,
  onChange,
}: {
  allTags: string[];
  value: string[];
  onChange: (options: string[]) => void;
}) => {
  return (
    <Autocomplete
      multiple
      options={allTags}
      value={value}
      onChange={(e, options) => {
        onChange(options);
      }}
      renderTags={(value: readonly string[]) =>
        value.map((option: string) => {
          return <Tag tag={option} key={option} />;
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Find Contracts with Keywords"
          placeholder="Search Keywords"
        />
      )}
      // renderInput={(params) => (
      //   <Input {...params} />
      // <TextField
      //   {...params}
      //   variant="filled"
      //   label="freeSolo"
      //   placeholder="Favorites"
      // />
      // )}
    />

    // <Typeahead
    //   multiple
    //   options={allTags}
    //   selected={value}
    //   onChange={onChange}
    // />
  );
};

export default TagTypeahead;
