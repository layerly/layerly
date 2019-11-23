import classnames from "classnames";
import * as React from "react";
import * as Yup from "yup";
import { SchemaInput } from "./Input";
import { InputType } from "./types";
import { StyledError } from "./styled/styledError";
import { StyledFormGroup } from "./styled/styledFormGroup";
import { StyledInfo } from "./styled/styledInfo";
import { StyledInput } from "./styled/styledInput";
import { StyledLabel } from "./styled/styledLabel";

interface Props extends React.InputHTMLAttributes<any> {
	label?: string;
	placeholder?: string;
	info?: string;
	name?: string;
	max?: number;
	uppercase?: boolean;
	value?: string;
	validation?: string;
}

export class TextInput extends SchemaInput<Yup.StringSchema> {
	constructor() {
		super();
		this.inputType = InputType.Text;
		this.validationSchema = Yup.string();
		this.custom.set("emptyValue", "");
	}

	public max(maxLength: number) {
		this.properties.set("max", maxLength);
		return this;
	}

	public uppercase() {
		this.properties.set("uppercase", true);
		return this;
	}

	public render(props: Props) {
		let {
			label,
			placeholder,
			info,
			value,
			validation,
			max,
			uppercase,
			...restProps
		} = props;
		label = label || this.properties.get("label");
		max = max || this.properties.get("max");
		uppercase = uppercase || this.properties.get("uppercase");
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
					type="text"
					maxLength={max}
					placeholder={placeholder}
					isUpperCase={uppercase}
				/>
				{info ? <StyledInfo>{info}</StyledInfo> : null}
				{error ? <StyledError>{error}</StyledError> : null}
			</StyledFormGroup>
		);
	}

	public static Render(props: Props) {
		return textinput().render(props);
	}
}

export const textinput = () => TextInput.create();
