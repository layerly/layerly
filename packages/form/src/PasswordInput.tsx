import classnames from "classnames";
import * as React from "react";
import { SchemaInput } from "./Input";
import { InputType } from "./types";
import { StyledError } from "./styled/styledError";
import { StyledFormGroup } from "./styled/styledFormGroup";
import { StyledInfo } from "./styled/styledInfo";
import { StyledInput } from "./styled/styledInput";
import { StyledLabel } from "./styled/styledLabel";

interface Props extends React.InputHTMLAttributes<any> {
	label?: string;
	info?: string;
	placeholder?: string;
	name?: string;
	value?: string;
	validation?: string;
}

export class PasswordInput extends SchemaInput {
	constructor() {
		super();
		this.inputType = InputType.Password;
		this.custom.set("emptyValue", "");
	}

	public render(props: Props) {
		let {
			label,
			placeholder,
			info,
			value,
			validation,
			...restProps
		} = props;
		label = label || this.properties.get("label");
		placeholder = placeholder || this.properties.get("placeholder");
		info = info || this.properties.get("info");
		const error = validation || this.custom.get("error");
		return (
			<StyledFormGroup className={classnames({ error })}>
				{label ? <StyledLabel>{label}</StyledLabel> : null}
				<StyledInput
					{...restProps}
					value={value}
					error={!!error}
					type="password"
					placeholder={placeholder}
				/>
				{info ? <StyledInfo>{info}</StyledInfo> : null}
				{error ? <StyledError>{error}</StyledError> : null}
			</StyledFormGroup>
		);
	}

	public static Render(props: Props) {
		return passwordinput().render(props);
	}
}

export const passwordinput = () => new PasswordInput();
