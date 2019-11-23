import classnames from "classnames";
import * as React from "react";
import { SchemaInput } from "./Input";
import { StyledError } from "./styled/styledError";
import { StyledFormGroup } from "./styled/styledFormGroup";
import { StyledInfo } from "./styled/styledInfo";
import { StyledInput } from "./styled/styledInput";
import { StyledLabel } from "./styled/styledLabel";
import { InputType } from "./types";

interface Props extends React.InputHTMLAttributes<any> {
	name?: string;
	error?: string;
	label?: string;
	placeholder?: string;
	info?: string;
	step?: string;
	value?: any;
	onChange?: (e) => void;
	onBlur?: (e) => void;
}

interface State {
	value: string;
	editing: boolean;
}

const ENTER_KEY = 13;
const ESCAPE_KEY = 27;
const BACKSPACE_KEY = 8;
const COMMA_KEY = 44;
const DOT_KEY = 46;
const KEY_0 = 48;
const KEY_9 = 57;

class NumberInputWithState extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			value: this.sanitizeValue(this.props.value || ""),
			editing: false
		};
		this.handleKeyPress = this.handleKeyPress.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	public componentDidUpdate(prevProps: Props) {
		if (this.props.value !== prevProps.value) {
			const sanitizedValue = this.sanitizeValue(this.props.value || "");
			this.setState({ value: sanitizedValue });
		}
	}

	private getStep() {
		return this.props.step || "1";
	}

	private sanitizeValue(value: string | number): string {
		if (typeof value === "number") value = value.toString();
		return value
			? this.roundNumber(
					parseFloat(value),
					NumberInputWithState.getDecimalPlaces(this.getStep())
			)
			: NumberInputWithState.createEmptyValue(this.getStep());
	}

	static getDecimalPlaces(step: string): number {
		if (!step) return 0;
		const splitted = step.split(".");
		if (splitted.length < 2) return 0;
		return splitted[1].length || 0;
	}

	static createEmptyValue(step: string): string {
		const places = NumberInputWithState.getDecimalPlaces(step);
		if (places === 0) return "0";
		else {
			let decimal = "";
			for (let i = 0; i < places; i++) {
				decimal += "0";
			}
			return "0." + decimal;
		}
	}

	private roundNumber(num: number, length: number): string {
		return (
			Math.round(num * Math.pow(10, length)) / Math.pow(10, length)
		).toFixed(length);
	}

	private getSanitizedValueFromState() {
		return parseFloat(this.sanitizeValue(this.state.value)).toString();
	}

	private confirmChange(e) {
		const sanitizedValue = this.getSanitizedValueFromState();
		e.target.value = sanitizedValue;
		if (typeof this.props.onChange === "function") {
			this.props.onChange(e);
		}
		this.setState({ value: sanitizedValue });
	}

	private handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value.replace(/,/g, ".");
		this.setState({ value });
	}

	private handleKeyPress(e) {
		const key = e.which;
		e.persist();
		if (key === ENTER_KEY) {
			// confirm change
			this.confirmChange(e);
		} else if (
			(key >= KEY_0 && key <= KEY_9) ||
			key === BACKSPACE_KEY ||
			key === COMMA_KEY ||
			key === DOT_KEY
		) {
			// disallow keys
			return;
		} else {
			e.preventDefault();
		}
	}

	private handleBlur(e: React.FocusEvent<HTMLInputElement>) {
		if (typeof this.props.onBlur === "function") {
			this.props.onBlur(e);
		}
		e.persist();
		this.confirmChange(e);
	}

	public render() {
		const {
			label,
			placeholder,
			info,
			step,
			value,
			error,
			...restProps
		} = this.props;
		return (
			<StyledFormGroup className={classnames({ error })}>
				{label ? <StyledLabel>{label}</StyledLabel> : null}
				<StyledInput
					{...restProps}
					value={this.state.value}
					type="text"
					error={!!error}
					placeholder={placeholder}
					onKeyPress={this.handleKeyPress}
					onBlur={this.handleBlur}
					onChange={this.handleChange}
				/>
				{info ? <StyledInfo>{info}</StyledInfo> : null}
				{error ? <StyledError>{error}</StyledError> : null}
			</StyledFormGroup>
		);
	}
}

interface NumberInputProps extends React.InputHTMLAttributes<any> {
	label?: string;
	placeholder?: string;
	info?: string;
	step?: string;
	validation?: string;
}

export class NumberInput extends SchemaInput {
	constructor() {
		super();
		this.inputType = InputType.Number;
		this.custom.set("emptyValue", "");
	}

	public step(step: string) {
		this.properties.set("step", step);
		return this;
	}

	public render(props: NumberInputProps) {
		let { label, placeholder, info, step, validation } = props;
		label = label || this.properties.get("label");
		placeholder = placeholder || this.properties.get("placeholder");
		info = info || this.properties.get("info");
		step = step || this.properties.get("step");
		const error = validation ? validation : this.custom.get("error");
		return (
			<NumberInputWithState
				{...props}
				label={label}
				info={info}
				placeholder={placeholder}
				step={step}
				error={error}
			/>
		);
	}

	public static Render(props: NumberInputProps) {
		return numberinput().render(props);
	}
}

export const numberinput = () => {
	return new NumberInput();
};
