import classnames from "classnames";
import * as React from "react";
import { SchemaInput } from "./Input";
import { InputType } from "./types";
import { StyledError } from "./styled/styledError";
import { StyledFormGroup } from "./styled/styledFormGroup";
import { StyledInfo } from "./styled/styledInfo";
import { StyledLabel } from "./styled/styledLabel";
import { StyledSelect } from "./styled/styledSelect";

interface SelectOptionType {
	text: string;
	value: any;
}

interface Props extends React.SelectHTMLAttributes<any> {
	label?: string;
	info?: string;
	options?: SelectOptionType[];
	name?: string;
	value?: string;
	validation?: string;
}

export class SelectInput extends SchemaInput {
	constructor() {
		super();
		this.inputType = InputType.Select;
		this.properties.set("options", []);
	}

	public options(options: SelectOptionType[]) {
		this.properties.set("options", options);
		return this;
	}

	public render(props: Props) {
		let { label, info, options, value, validation, ...restProps } = props;
		label = label || this.properties.get("label");
		info = info || this.properties.get("info");
		options = (options || this.properties.get("options") || []) as [];
		const error = validation ? validation : this.custom.get("error");
		return (
			<StyledFormGroup className={classnames({ error })}>
				{label ? <StyledLabel>{label}</StyledLabel> : null}
				<StyledSelect
					as="select"
					{...restProps}
					value={value}
					error={!!error}
				>
					{options.map((item, key) => {
						return (
							<option key={key} value={item.value}>
								{item.text}
							</option>
						);
					})}
				</StyledSelect>
				{info ? <StyledInfo>{info}</StyledInfo> : null}
				{error ? <StyledError>{error}</StyledError> : null}
			</StyledFormGroup>
		);
	}

	public static Render(props: Props) {
		return selectinput().render(props);
	}
}

export const selectinput = () => {
	return new SelectInput();
};
