import classnames from "classnames";
import * as React from "react";

import styled from "styled-components";
import { SchemaInput } from "./Input";
import { InputType } from "./types";
import { StyledError } from "./styled/styledError";
import { StyledFormCheck } from "./styled/styledFormCheck";
import { StyledInfo } from "./styled/styledInfo";
import { StyledRadioLabel, StyledRadioMark } from "./styled/styledRadio";

interface Props extends React.InputHTMLAttributes<any> {
	label?: string;
	info?: string;
	name?: string;
	value?: string;
	definedValue?: string;
	validation?: string;
}

export class RadioInput extends SchemaInput {
	constructor() {
		super();
		this.inputType = InputType.Radio;
	}

	public name(name: string) {
		this.properties.set("name", name);
		return this;
	}

	public value(value: string) {
		this.properties.set("definedValue", value);
		return this;
	}

	public render(props: Props) {
		let { name, label, info, definedValue, value, ...restProps } = props;
		name = name || this.properties.get("name");
		label = label || this.properties.get("label");
		info = info || this.properties.get("info");
		definedValue = definedValue || this.properties.get("definedValue");
		if (!definedValue) {
			throw new Error(
				"Radio button must have defined value. Set it with value(definedValue: string)"
			);
		}
		if (!label) throw new Error("Radio button must have a label");
		if (!name) throw new Error("Radio button must have a name");
		const { validation } = props;
		const error = validation ? validation : this.custom.get("error");
		const checkedProps = {};
		if (typeof value !== "undefined") {
			checkedProps["checked"] = value === definedValue;
		}
		return (
			<StyledFormCheck className={classnames({ error })}>
				<StyledRadioLabel>
					{label}
					<Input
						{...restProps}
						type="radio"
						value={definedValue}
						name={name}
						{...checkedProps}
					/>
					<StyledRadioMark error={!!error} />
				</StyledRadioLabel>
				{info ? <StyledInfo>{info}</StyledInfo> : null}
				{error ? <StyledError>{error}</StyledError> : null}
			</StyledFormCheck>
		);
	}

	public static Render(props: Props) {
		return radioinput().render(props);
	}
}

const Input = styled.input``;

export const radioinput = () => {
	return new RadioInput();
};
