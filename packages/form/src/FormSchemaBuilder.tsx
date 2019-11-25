import update from "immutability-helper";
import * as React from "react";
import * as Yup from "yup";
import { isInput, SchemaInput } from "./Input";
import { isList, List } from "./List";
import { isShape } from "./Shape";
import { ArrayOfFields } from "./ArrayOfFields";
import { EmptyValueBuilder } from "./EmptyValueBuilder";
import { ValidationSchemaBuilder } from "./ValidationSchemaBuilder";
import SchemaBuilder, { SchemaItem } from "@layerly/schema";
import { LayoutSchemaBuilder } from "@layerly/grid";
import hoistNonReactStatics from "hoist-non-react-statics";
import arrayMove from "array-move";

type ObjectType = { [key: string]: any };
interface ReactStaticForm {
	validate(data: ObjectType, yupSchema: Yup.Schema<any>): Promise<ObjectType>;
	mapValuesToDotNotation(data: object): { [fieldName: string]: any };
}
export interface ReactFormLayout
	extends React.ComponentClass<FormLayoutProps, any>,
		ReactStaticForm {}

interface FormLayoutProps {
	ref?: React.RefObject<HTMLFormElement> | string;
	forwardedRef?: any;
	onChange?(name: string, value: any): void;
	values?: ObjectType;
	validation?: ObjectType;
}

interface FormLayoutContextProps {
	onChange(e): void;
	values: any;
	validation: any;
}

interface FormLayoutFieldProps {}

interface FormLayoutArrayWrappedFieldProps {
	onChange: (name: string, value: any) => void;
	value: any[];
	validation: any[];
}

const FormLayoutContext = React.createContext<FormLayoutContextProps>({
	onChange: () => null,
	values: {},
	validation: {}
});

export class FormSchemaBuilder extends LayoutSchemaBuilder {
	public constructor(schema) {
		super(schema);
	}

	protected createArrayField(list: List, listName: string) {
		const originalInternal = list.getOriginalInternal();
		const emptyValue = EmptyValueBuilder.ofInternal(originalInternal).build();
		const internal = list.getInternal();
		const max = list.custom.get("max");
		const isSortable = list.custom.get("sortable");
		const isStatic = list.custom.get("static");
		const labelForAppend = list.custom.get("labelForAppend");
		const FieldGroup = new FormSchemaBuilder(
			SchemaBuilder.ofInternal(internal)
		).build();

		const EMPTY_ARRAY = [];

		class ArrayFieldWrapped extends React.PureComponent<
			FormLayoutArrayWrappedFieldProps
		> {
			constructor(props) {
				super(props);
				this.preventSort = this.preventSort.bind(this);
				this.handleAppendItem = this.handleAppendItem.bind(this);
				this.handleItemChange = this.handleItemChange.bind(this);
				this.handleRemoveItem = this.handleRemoveItem.bind(this);
				this.handleSortEnd = this.handleSortEnd.bind(this);
			}

			private getValue() {
				return this.props.value || EMPTY_ARRAY;
			}

			private getValidation() {
				return this.props.validation || EMPTY_ARRAY;
			}

			private isMaxReached() {
				if (typeof max !== "undefined" && max > -1) {
					if (this.getValue().length >= max) return true;
				}
				return false;
			}

			private preventSort() {
				return isSortable === false || this.getValue().length <= 1;
			}

			private createEmptyValue() {
				return emptyValue;
			}

			private handleAppendItem(e) {
				e.preventDefault();
				if (isStatic) return;
				if (this.isMaxReached()) return;
				const newValue = update(this.getValue(), {
					$push: [this.createEmptyValue()]
				});
				this.props.onChange(listName, newValue);
			}

			private handleRemoveItem(index: number) {
				if (isStatic) return;
				const newValue = update(this.getValue(), {
					$splice: [[index, 1]]
				});
				this.props.onChange(listName, newValue);
			}

			private handleItemChange(
				index: number,
				propertyName: string,
				value: any
			) {
				let modifier;
				const currentValue = this.getValue()[index];
				if (typeof currentValue === "string" && propertyName) {
					modifier = { [index]: { $set: { [propertyName]: value } } };
				} else if (propertyName) {
					modifier = { [index]: { [propertyName]: { $set: value } } };
				} else {
					modifier = { [index]: { $set: value } };
				}
				const newValue = update(this.getValue(), modifier);
				this.props.onChange(listName, newValue);
			}

			private handleSortEnd({ oldIndex, newIndex }) {
				this.props.onChange(
					listName,
					arrayMove(this.getValue(), oldIndex, newIndex)
				);
			}

			public render() {
				return (
					<ArrayOfFields
						name={listName}
						onItemChange={this.handleItemChange}
						onItemAppend={this.handleAppendItem}
						onItemRemove={this.handleRemoveItem}
						onSortEnd={this.handleSortEnd}
						value={this.getValue()}
						validation={this.getValidation()}
						maxReached={this.isMaxReached()}
						lockAxis="y"
						useDragHandle={true}
						shouldCancelStart={this.preventSort}
						isSortable={isSortable}
						sortIsPrevented={this.preventSort()}
						isStatic={isStatic}
						labelForAppend={labelForAppend}
						FieldsGroup={FieldGroup}
					/>
				);
			}
		}

		return class extends React.PureComponent {
			constructor(props) {
				super(props);
			}

			public render() {
				return (
					<FormLayoutContext.Consumer>
						{({ onChange, values, validation }) => {
							const fieldValidation = validation ? validation[listName] : {};
							return (
								<ArrayFieldWrapped
									onChange={onChange}
									value={values[listName]}
									validation={fieldValidation}
								/>
							);
						}}
					</FormLayoutContext.Consumer>
				);
			}
		};
		// return ArrayFieldWrapper;
	}

	private createField(Input: SchemaInput, name: string) {
		const emptyValue = Input.custom.get("emptyValue");
		class FormLayoutField extends React.PureComponent<any, any> {
			constructor(props: FormLayoutFieldProps) {
				super(props);
			}

			public render() {
				const { name, onChange, value, validation } = this.props;
				return Input.render({ name, value, validation, onChange });
			}
		}

		class FormLayoutFieldWrapper extends React.PureComponent<
			FormLayoutFieldProps,
			any
		> {
			static fieldEmptyValue = emptyValue;
			constructor(props) {
				super(props);
				this.state = {};
			}

			public render() {
				return (
					<FormLayoutContext.Consumer>
						{({ onChange, values, validation }) => {
							// if values are object and name is defined try to access value from values object,
							// otherwise use whole values prop as value, its may be undefined or value itself (in direct input)
							const value =
								values !== null && typeof values === "object" && name
									? values[name]
									: values;
							const fieldValidation =
								validation && name ? validation[name] : validation;
							return (
								<FormLayoutField
									name={name}
									onChange={onChange}
									value={value}
									validation={fieldValidation}
								/>
							);
						}}
					</FormLayoutContext.Consumer>
				);
			}
		}

		return FormLayoutFieldWrapper;
	}

	private createReplaceComponent(item: SchemaItem) {
		const values = item.getInternal() as any[];
		return class extends React.PureComponent<any, any> {
			static displayName = `SchemaReplace${item.constructor.name}`;
			public render() {
				return values.map((Item: any, key) => {
					return <Item key={key} />;
				});
			}
		};
	}

	protected manageSchemaItem(item: SchemaItem) {
		if (isInput(item)) {
			const name = item.findName();
			item.replace(this.createField(item, name));
		} else if (isList(item)) {
			const path = item.findName();
			item.replace(this.createArrayField(item, path));
		} else if (isShape(item)) {
			item.replace(this.createReplaceComponent(item));
		} else {
			item.replace(this.createReplaceComponent(item));
		}
	}

	public build(): ReactFormLayout {
		// TODO manage components names
		const FormLayout = super.build();
		class FormLayoutWrapped extends React.PureComponent<any> {
			public render() {
				return <FormLayout />;
			}
		}
		class FormSchemaBuilderWrapper extends React.PureComponent<
			FormLayoutProps
		> {
			public static validate = ValidationSchemaBuilder.validate;

			private static getFieldName(parentName: string, propertyName: string) {
				if (!parentName) return propertyName;
				else return [parentName, propertyName].join(".");
			}

			public static *iterateForMapValuesToDotNotation(
				values: object,
				parentName?
			) {
				for (const propertyName in values) {
					if (values.hasOwnProperty(propertyName)) {
						const value = values[propertyName];
						const fieldName = FormSchemaBuilderWrapper.getFieldName(
							parentName,
							propertyName
						);
						if (
							typeof value === "object" &&
							value !== null &&
							!value["__r"] &&
							!Array.isArray(value)
						) {
							yield* FormSchemaBuilderWrapper.iterateForMapValuesToDotNotation(
								value,
								fieldName
							);
						} else {
							yield [fieldName, value];
						}
					}
				}
			}

			public static mapValuesToDotNotation(
				values: object
			): { [fieldName: string]: any } {
				const result = {};
				for (const [key, value] of this.iterateForMapValuesToDotNotation(
					values
				)) {
					result[key] = value;
				}
				return result;
			}

			constructor(props: FormLayoutProps) {
				super(props);
				this.handleChange = this.handleChange.bind(this);
			}

			private handleChange(name: string, value: any);
			private handleChange(e: React.ChangeEvent<HTMLElement>);
			private handleChange(
				eOrName: React.ChangeEvent<HTMLElement> | string,
				value?: any
			) {
				let name;
				if (typeof eOrName === "string") {
					name = eOrName;
				} else {
					const e = eOrName;
					const target = e.target as any;
					if (
						e.target.tagName === "INPUT" &&
						target.type.toLowerCase() === "checkbox"
					) {
						name = target.name;
						value = target.checked;
					} else {
						name = target.name;
						value = target.value;
					}
				}
				if (typeof this.props.onChange === "function") {
					this.props.onChange(name, value);
				}
			}

			public render() {
				const { values, validation } = this.props;
				return (
					<FormLayoutContext.Provider
						value={{
							onChange: this.handleChange,
							values,
							validation
						}}
					>
						<div ref={this.props.forwardedRef}>
							<FormLayoutWrapped />
						</div>
					</FormLayoutContext.Provider>
				);
			}
		}
		const ResultComponent = React.forwardRef(
			(props: FormLayoutProps, ref) =>
				(
					<FormSchemaBuilderWrapper {...(props as any)} forwardedRef={ref} />
				) as any
		);
		return (hoistNonReactStatics(
			ResultComponent,
			FormSchemaBuilderWrapper
		) as unknown) as ReactFormLayout;
	}
}
