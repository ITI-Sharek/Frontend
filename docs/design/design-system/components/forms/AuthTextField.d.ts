export interface AuthTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Lucide icon name, e.g. "mail", "user", "building-2", "wrench", "github", "globe". */
  icon?: string;
}

export declare function AuthTextField(props: AuthTextFieldProps): JSX.Element;
