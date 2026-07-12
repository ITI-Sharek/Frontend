export interface AuthPasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export declare function AuthPasswordField(props: AuthPasswordFieldProps): JSX.Element;
