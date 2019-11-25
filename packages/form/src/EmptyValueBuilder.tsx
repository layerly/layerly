import SchemaBuilder, {
	Group,
	GroupSchemaItemType,
	SchemaItem,
	walk,
	UnknownSchemaItemType
} from "@layerly/schema";
import { SchemaInput } from "./Input";
import { List } from "./List";
import { isShape, Shape } from "./Shape";
import {
	ShapeSchemaItemType,
	InputSchemaItemType,
	ListSchemaItemType
} from "./types";

export class EmptyValueBuilder {
	protected schema: SchemaBuilder;
	private constructor(schema: SchemaBuilder) {
		this.schema = schema;
	}

	private iterateShapes(item: SchemaItem) {
		walk(item, {
			[ShapeSchemaItemType]: (item: Shape) => {
				item.replace(item.toObject());
			}
		});
	}

	private iterate(parent: any) {
		walk(parent, {
			[InputSchemaItemType]: (item: SchemaInput) => {
				const emptyValue = item.custom.get("emptyValue");
				item.replace(typeof emptyValue !== "undefined" ? emptyValue : null);
			},
			[GroupSchemaItemType]: (item: Group) => {
				item.mergeAfterToParent();
			},
			[ListSchemaItemType]: (item: List) => {
				item.mergeInternal();
				this.iterateShapes(item);
				item.replace([]);
			},
			[ShapeSchemaItemType]: (item: Shape) => {
				item.replace(EmptyValueBuilder.mapValuesToDotNotation(item.toObject()));
			},
			[UnknownSchemaItemType]: (item: SchemaItem) => {
				item.mergeAfterToParent();
			}
		});
	}

	public build() {
		const g = Group.of(this.schema.getInternal());
		const shape = Shape.ofObject({ result: g });
		this.iterate(shape);
		const result = shape.getProperty("result");
		if (isShape(result)) {
			return result.toObject();
		} else {
			return result;
		}
	}

	private static getFieldName(parentName: string, propertyName: string) {
		if (!parentName) return propertyName;
		else return [parentName, propertyName].join(".");
	}

	private static *iterateForMapValuesToDotNotation(
		values: object,
		parentName?
	) {
		for (let propertyName in values) {
			if (values.hasOwnProperty(propertyName)) {
				const value = values[propertyName];
				const fieldName = this.getFieldName(parentName, propertyName);
				if (
					typeof value === "object" &&
					value !== null &&
					!Array.isArray(value)
				) {
					yield* this.iterateForMapValuesToDotNotation(value, fieldName);
				} else {
					yield [fieldName, value];
				}
			}
		}
	}

	private static mapValuesToDotNotation(
		values: object
	): { [fieldName: string]: any } {
		const result = {};
		for (const [key, value] of this.iterateForMapValuesToDotNotation(values)) {
			result[key] = value;
		}
		return result;
	}

	public static convertFrom(schema: SchemaBuilder) {
		return new EmptyValueBuilder(schema.clone());
	}

	public static ofInternal(internal: SchemaItem[]) {
		return EmptyValueBuilder.convertFrom(SchemaBuilder.ofInternal(internal));
	}
}
