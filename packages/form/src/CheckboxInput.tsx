import * as React from "react";
import { SchemaInput } from "./Input";
import {
	StyledCheckboxLabel,
	StyledCheckboxMark
} from "./styled/styledCheckbox";
import { StyledFormCheck } from "./styled/styledFormCheck";
import { StyledInfo } from "./styled/styledInfo";
import { StyledError } from "./styled/styledError";
import classnames from "classnames";

import styled from "styled-components";
import { InputType } from "./types";

interface Props extends React.InputHTMLAttributes<any> {
	label?: string;
	info?: string;
	name?: string;
	validation?: string;
	value?: any;
}

export class CheckboxInput extends SchemaInput {
	constructor() {
		super();
		this.inputType = InputType.Checkbox;
		this.custom.set("emptyValue", false);
	}

	public default(defaultValue: boolean) {
		this.custom.set("emptyValue", defaultValue);
		return this;
	}

	public render(props: Props) {
		let { label, info, value, validation, ...restProps } = props;
		label = label || this.properties.get("label");
		info = info || this.properties.get("info");
		if (!label) throw new Error("Checkbox must have a label");
		const error = validation ? validation : this.custom.get("error");
		return (
			<StyledFormCheck className={classnames({ error })}>
				<StyledCheckboxLabel>
					{label}
					<Input {...restProps} checked={value} type="checkbox" />
					<StyledCheckboxMark error={!!error} />
				</StyledCheckboxLabel>
				{info ? <StyledInfo>{info}</StyledInfo> : null}
				{error ? <StyledError>{error}</StyledError> : null}
			</StyledFormCheck>
		);
	}

	public static Render(props: Props) {
		return checkboxinput().render(props);
	}
}

const Input = styled.input``;

export const checkboxinput = () => {
	return new CheckboxInput();
};
