export interface ChipOption {
  value: string;
  label: string;
}

export interface ChipSelectProps {
  label: string;
  options: ChipOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
}

export declare function ChipSelect(props: ChipSelectProps): JSX.Element;
