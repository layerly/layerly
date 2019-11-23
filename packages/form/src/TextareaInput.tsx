import classnames from "classnames";
import * as React from "react";

import styled from "styled-components";
import * as Yup from "yup";
import { SchemaInput } from "./Input";
import { InputType } from "./types";
import { StyledError } from "./styled/styledError";
import { StyledFormGroup } from "./styled/styledFormGroup";
import { StyledInfo } from "./styled/styledInfo";
import { StyledLabel } from "./styled/styledLabel";
import { StyledTextarea } from "./styled/styledTextarea";

interface Props extends React.TextareaHTMLAttributes<any> {
	label?: string;
	placeholder?: string;
	max?: number;
	uppercase?: boolean;
	info?: string;
	name?: string;
	value?: string;
	validation?: string;
}

export class TextareaInput extends SchemaInput {
	constructor() {
		super();
		this.inputType = InputType.Textarea;
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
		placeholder = placeholder || this.properties.get("placeholder");
		max = max || this.properties.get("max");
		uppercase = uppercase || this.properties.get("uppercase");
		info = info || this.properties.get("info");
		const error = validation ? validation : this.custom.get("error");
		return (
			<StyledFormGroup className={classnames({ error })}>
				{label ? (
					<StyledTextareaLabel hasInfo={!!info}>{label}</StyledTextareaLabel>
				) : null}
				{info ? <StyledTextareaInfo>{info}</StyledTextareaInfo> : null}
				{error ? <StyledTextareaError>{error}</StyledTextareaError> : null}
				<StyledTextarea
					as="textarea"
					{...restProps}
					value={value}
					error={!!error}
					placeholder={placeholder}
					maxLength={max}
					isUpperCase={uppercase}
				/>
			</StyledFormGroup>
		);
	}

	public static Render(props: Props) {
		return textareainput().render(props);
	}
}

const StyledTextareaLabel = styled(StyledLabel)`
	${(props: { hasInfo?: boolean }) =>
		props.hasInfo ? `margin-bottom: 0;` : ""};
`;

const StyledTextareaInfo = styled(StyledInfo)`
	margin-top: 0;
	margin-bottom: 0.25rem;
`;

const StyledTextareaError = styled(StyledError)`
	margin-top: 0;
	margin-bottom: 0.25rem;
`;

export const textareainput = () =>
	TextareaInput.create() as TextareaInput & Yup.StringSchema;
