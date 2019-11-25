import { AxiosResponse } from "axios";
import classnames from "classnames";
import detect from "is-client";
import * as React from "react";
import { components } from "react-select";
import AsyncSelect from "react-select/async";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

import styled, { css } from "styled-components";
import * as Yup from "yup";
import { SchemaInput } from "./Input";
import { InputType } from "./types";
import { StyledError } from "./styled/styledError";
import { StyledFormGroup } from "./styled/styledFormGroup";
import { StyledInfo } from "./styled/styledInfo";
import { StyledLabel } from "./styled/styledLabel";
import invariant from "invariant";
import arrayMove from "array-move";

interface Props {
	label?: string;
	info?: string;
	name?: string;
	prefetch?: boolean;
	noCache?: boolean;
	notClearable?: boolean;
	multi?: boolean;
	sortable?: boolean;
	placeholder?: string;
	validation?: string;
	onChange?: (name: string, value: any) => void;
	value?: string | string[];
}

interface Select2InputOption {
	value: string;
	label: string;
}

const Select2InputMultiValueSortableElement = SortableElement(props => {
	return (
		<Select2InputMultiValueSortableElementStyled>
			{props.children}
		</Select2InputMultiValueSortableElementStyled>
	);
});

const Select2InputMultiValueSortableElementStyled = styled.div`
	display: flex;
	width: 100%;
`;

const Select2InputSortableValueContainer = SortableContainer(props => {
	const { children, ...restProps } = props;
	return (
		<components.ValueContainer {...restProps}>
			{Array.isArray(children[0])
				? children[0].map((childrenItem, index) => {
						return (
							<Select2InputMultiValueSortableElement key={index} index={index}>
								{childrenItem}
							</Select2InputMultiValueSortableElement>
						);
				})
				: children[0]
				? children[0]
				: null}
			{children[1] ? children[1] : null}
		</components.ValueContainer>
	);
});

class Select2InputValueContainer extends React.Component<any, any> {
	public render() {
		const {
			selectProps: { onSortEnd, ...restSelectProps },
			...restProps
		} = this.props;
		return (
			<Select2InputSortableValueContainer
				axis="y"
				pressDelay={200}
				onSortEnd={onSortEnd}
				{...{ ...restProps, selectProps: restSelectProps }}
			/>
		);
	}
}

interface Select2InputWithStateProps extends Props {
	properties: Map<string, any>;
	custom: Map<string, any>;
}

interface Select2InputWithStateState {
	cachedLabelsForValue: { [value: string]: string };
}

class Select2InputWithState extends React.Component<
	Select2InputWithStateProps,
	Select2InputWithStateState
> {
	constructor(props) {
		super(props);

		this.state = {
			cachedLabelsForValue: {}
		};

		this.fetchData = this.fetchData.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSortEnd = this.handleSortEnd.bind(this);
	}

	private getValue() {
		let valueArray: string[] = [];
		// create temporary values array
		if (this.multi) {
			// if is multi selection, set value as temporary array (or empty array if value is not defined)
			valueArray = (this.props.value || []) as string[];
		} else if (this.props.value) {
			// if selection is not multi but value is defined, set value as first temporary array element
			valueArray = [this.props.value as string];
		} else {
			// otherwise set temporary array empty (no value defined)
			valueArray = [];
		}
		// create array to hold values which hasn't labels
		let noLabelsFoundForValues: string[] = [];
		// map other values (in temporary array)
		const mappedValues = valueArray.map((value: string) => {
			if (this.state.cachedLabelsForValue[value]) {
				// if label found for value, return fully qualified option
				return {
					label: this.state.cachedLabelsForValue[value],
					value
				};
			} else {
				// if label not found, return option with value, but label says that is loading.
				// also push this value to array of values without labels
				noLabelsFoundForValues.push(value);
				return {
					label: "Kraunama...",
					value
				};
			}
		});
		if (noLabelsFoundForValues.length > 0 && detect()) {
			// fetch labels for values
			this.fetchLabelsForValues(noLabelsFoundForValues);
		}
		// return value
		if (this.multi) return mappedValues;
		else if (mappedValues.length > 0) return mappedValues[0];
		else return null;
	}

	private async fetchLabelsForValues(values: string[]) {
		const { custom } = this.props;
		const fetchCallback = custom.get("fetchCallback");
		invariant(
			fetchCallback,
			"Cannot fetch data because fetchCallback is not set. Use fetch(fetchCallback: Promise) to set fetchCallback"
		);
		const response = await fetchCallback(undefined, values.join(","));
		this.updateLabelsForValuesCache(response.data);
	}

	private async fetchData(inputValue: string) {
		const { custom } = this.props;
		const fetchCallback = custom.get("fetchCallback");
		invariant(
			fetchCallback,
			"Cannot fetch data because fetchCallback is not set. Use fetch(fetchCallback: Promise) to set fetchCallback"
		);
		const response = await fetchCallback(inputValue);
		this.updateLabelsForValuesCache(response.data);
		return response.data;
	}

	private updateLabelsForValuesCache(options: Select2InputOption[]) {
		const extendedCachedLabelsForValue = options.reduce((cache, option) => {
			cache[option.value] = option.label;
			return cache;
		}, this.state.cachedLabelsForValue);
		this.setState({
			cachedLabelsForValue: extendedCachedLabelsForValue
		});
	}

	private handleChange(itemOrItems: Select2InputOption | Select2InputOption[]) {
		const name = this.props.name!;
		if (!itemOrItems) return this.props.onChange!(name, null);
		this.props.onChange!(
			name,
			this.multi
				? (itemOrItems as Select2InputOption[]).map(({ value }) => value)
				: (itemOrItems as Select2InputOption).value
		);
	}

	private handleSortEnd({ oldIndex, newIndex }) {
		if (this.props.value) {
			let value = Array.isArray(this.props.value)
				? this.props.value
				: [this.props.value];
			this.props.onChange!(
				this.props.name!,
				arrayMove(value, oldIndex, newIndex)
			);
		}
	}

	private get multi() {
		return this.props.multi || this.props.custom.get("multi");
	}

	private get label() {
		return this.props.label || this.props.properties.get("label");
	}

	private get info() {
		return this.props.info || this.props.properties.get("info");
	}

	private get placeholder() {
		return this.props.placeholder || this.props.properties.get("placeholder");
	}

	private get error() {
		return this.props.validation || this.props.custom.get("error");
	}

	private get prefetch() {
		return this.props.prefetch || this.props.custom.get("prefetch");
	}

	private get noCache() {
		return this.props.noCache || this.props.custom.get("noCache");
	}

	private get sortable() {
		const sortable = this.props.sortable || this.props.custom.get("sortable");
		if (sortable) {
			invariant(
				this.multi,
				`Cannot set Select2Input sortable, because it's not multi.`
			);
		}
		return sortable;
	}

	private get notClearable() {
		return this.props.notClearable || this.props.custom.get("notClearable");
	}

	private getSortableComponents() {
		if (!this.sortable) return {};
		return {
			ValueContainer: Select2InputValueContainer
		};
	}

	public render() {
		const {
			label,
			multi,
			info,
			placeholder,
			error,
			prefetch,
			noCache,
			notClearable
		} = this;
		return (
			<StyledFormGroup className={classnames({ error })}>
				{label ? <StyledLabel>{label}</StyledLabel> : null}
				{info ? <StyledSelect2InputInfo>{info}</StyledSelect2InputInfo> : null}
				{error ? (
					<StyledSelect2InputError>{error}</StyledSelect2InputError>
				) : null}
				<SelectStyleOverride isSortable={this.sortable} error={error}>
					<AsyncSelect
						onSortEnd={this.handleSortEnd}
						isClearable={!notClearable}
						labelKey="label"
						valueKey="value"
						value={this.getValue()}
						components={this.getSortableComponents()}
						defaultOptions={prefetch}
						cacheOptions={!noCache}
						loadOptions={this.fetchData}
						isMulti={multi}
						noOptionsMessage={() => "Nėra pasirinkimų"}
						classNamePrefix="select-input-2"
						placeholder={placeholder}
						onChange={this.handleChange}
					/>
				</SelectStyleOverride>
			</StyledFormGroup>
		);
	}
}

export class Select2Input extends SchemaInput<
	Yup.ArraySchema<Yup.StringSchema> | Yup.StringSchema
> {
	constructor() {
		super();
		this.inputType = InputType.Select2;
		this.validationSchema = Yup.string();
	}

	public fetch(
		fetchCallback: (
			search: string,
			ids?: string
		) => Promise<AxiosResponse<Select2InputOption[]>>
	) {
		this.custom.set("fetchCallback", fetchCallback);
		return this;
	}

	public prefetch() {
		this.custom.set("prefetch", true);
		return this;
	}

	public noCache() {
		this.custom.set("noCache", true);
		return this;
	}

	public notClearable() {
		this.custom.set("notClearable", true);
		return this;
	}

	public multi() {
		this.custom.set("multi", true);
		this.validationSchema = Yup.array<Yup.StringSchema>();
		return this;
	}

	public sortable() {
		invariant(
			this.custom.get("multi"),
			`To make Select2Input sortable, make input multi before by calling multi() method.`
		);
		this.custom.set("sortable", true);
		return this;
	}

	public render(props: Props) {
		return (
			<Select2InputWithState
				{...props}
				custom={this.custom}
				properties={this.properties}
			/>
		);
	}

	public static Render(props: Props) {
		return select2input().render(props);
	}
}

const SelectStyleOverride = styled.div`
	.select-input-2__control {
		border: 1px solid #ced4da;
		border-radius: 1px;
		transition: border-bottom-color 0.3s linear;

		${(props: { error?: boolean; isSortable?: boolean }) =>
			props.error ? "border-color: #dc3545;" : null}

		&:hover {
			border-color: #ced4da;
			${props => (props.error ? "border-color: #dc3545;" : null)}
		}
	}

	.select-input-2__control--is-focused {
		outline: none;
		box-shadow: none;
		border-bottom-color: #888888 !important;
	}

	${props =>
		props.isSortable
			? css`
					.select-input-2__multi-value {
						width: 100%;
						justify-content: space-between;
					}
			  `
			: null};
`;

const StyledSelect2InputInfo = styled(StyledInfo)`
	margin-top: 0;
	margin-bottom: 0.25rem;
`;

const StyledSelect2InputError = styled(StyledError)`
	margin-top: 0;
	margin-bottom: 0.25rem;
`;

export const select2input = () => {
	return new Select2Input();
};
