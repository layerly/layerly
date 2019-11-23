import { SchemaItem, SchemaItemOpts } from "@epranka/test-schema";
import { InputType } from "./types";
import * as Yup from "yup";
import { isList } from "./List";
import { isShape } from "./Shape";
import { InputSchemaItemType } from "./types";

type AvailableProperties =
	| "label"
	| "placeholder"
	| "info"
	| "options"
	| string;
type PropertyType = { type: "property" | "index"; value: string | number }[];
interface InputOptions {}

class SchemaInput<
	V extends Yup.Schema<any> = Yup.StringSchema
> extends SchemaItem {
	public static Type = InputSchemaItemType;
	protected inputType: InputType;
	protected properties: Map<AvailableProperties, any>;
	protected validationSchema: V;
	constructor(opts?: SchemaItemOpts) {
		super(opts);
		this.properties = new Map();
		this.inputType = InputType.Text;
		this.validationSchema = Yup.string() as any;

		this.custom.set("emptyValue", "");
	}

	public render(props): any {
		return null;
	}

	private *iterateForName(item: SchemaItem) {
		const parent = item.getParent();
		if (parent) {
			if (isShape(parent)) {
				yield parent.findPropertyName(item);
			}
			if (isList(parent)) return;
			yield* this.iterateForName(parent);
		}
	}

	public findName() {
		const name = Array.from(this.iterateForName(this))
			.reverse()
			.join(".");
		return name ? name : this.custom.get("name");
	}

	private iterateForPath(item: SchemaItem, keys: PropertyType) {
		const parent = item.getParent();
		if (parent) {
			if (isShape(parent)) {
				const propertyName = parent.findPropertyName(item);
				keys.push({ type: "property", value: propertyName! });
			} else if (isList(parent)) {
				const index = parent.findIndex(item);
				keys.push({ type: "index", value: index });
			}
			this.iterateForPath(parent, keys);
		}
	}

	public findPath() {
		console.warn("Not implemented");
		const keys: PropertyType = [];
		this.iterateForPath(this, keys);
		return keys.reverse().reduce((acc, key, index, keys) => {
			if (key.type === "property") {
				acc.push(key.value as string);
			} else if (key.type === "index") {
				const lastKey = acc[acc.length - 1] || "";
				if (acc.length > 0) {
					acc[acc.length - 1] = `${lastKey}[${index}]`;
				} else {
					acc.push(`[${index}]`);
				}
			}
			return acc;
		}, [] as string[]);
		// return Array.from(this.iterateForPath(this))
		// 	.reverse()
		// 	.join('.');
	}

	/* OPTIONS */
	public label(label: string) {
		this.properties.set("label", label);
		return this;
	}

	public placeholder(placeholder: string) {
		this.properties.set("placeholder", placeholder);
		return this;
	}

	public info(info: string) {
		this.properties.set("info", info);
		return this;
	}

	public error(error: string) {
		this.custom.set("error", error);
		return this;
	}

	/* YUP VALIDATION */

	public validation(
		validationCallback: (validationSchema: V) => Yup.Schema<any>
	) {
		this.validationSchema = validationCallback(this.validationSchema) as V;
		return this;
	}

	public getValidationSchema(): V {
		return this.validationSchema as V;
	}

	/* GETTERS */

	public getInputType() {
		return this.inputType;
	}

	public clone() {
		const item = new (this.constructor as any)();
		if (this.validationSchema) {
			item.validationSchema = this.validationSchema.clone();
		}
		item.properties = new Map(this.properties);
		item.inputType = this.inputType;
		item.type = this.type;
		item.custom = new Map(this.custom);
		return item;
	}
}

function isInput(item: SchemaItem): item is SchemaInput {
	return item instanceof SchemaInput;
}

export { isInput, SchemaInput, InputOptions };
