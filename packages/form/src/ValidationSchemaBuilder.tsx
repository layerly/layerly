import * as Yup from "yup";
import { SchemaInput } from "./Input";
import { List } from "./List";
import { Shape } from "./Shape";
import SchemaBuilder, {
	SchemaItem,
	walk,
	Group,
	GroupSchemaItemType,
	UnknownSchemaItemType
} from "@epranka/test-schema";
import {
	ShapeSchemaItemType,
	InputSchemaItemType,
	ListSchemaItemType
} from "./types";
import { validate } from "./validate";

export class ValidationSchemaBuilder {
	protected schema: SchemaBuilder;
	private constructor(schema: SchemaBuilder) {
		this.schema = schema;
	}

	private iterateShapes(item: SchemaItem) {
		walk(item, {
			[ShapeSchemaItemType]: (item: Shape) => {
				item.replace(Yup.object().shape(item.toObject()));
			}
		});
	}

	private iterate(parent: any) {
		walk(parent, {
			[InputSchemaItemType]: (item: SchemaInput) => {
				item.replace(item.getValidationSchema());
			},
			[GroupSchemaItemType]: (item: Group) => {
				item.mergeAfterToParent();
			},
			[ListSchemaItemType]: (item: List) => {
				item.mergeInternal();
				this.iterateShapes(item);
				item.replace(Yup.array().of(item.getInternal()[0]));
			},
			[ShapeSchemaItemType]: (item: Shape) => {
				this.iterateShapes(item);
			},
			[UnknownSchemaItemType]: (item: SchemaItem) => {
				item.mergeAfterToParent();
			}
		});
	}

	public build(): Yup.Schema<any> {
		const g = Group.of(this.schema.getInternal());
		const shape = Shape.ofObject({ result: g });
		this.iterate(shape);
		const result = shape.getProperty("result");
		return Yup.object().shape(result.toObject());
	}

	public static convertFrom(schema: SchemaBuilder) {
		return new ValidationSchemaBuilder(schema.clone());
	}

	public static validate = validate;
}
