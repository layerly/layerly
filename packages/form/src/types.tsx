import { SchemaItemType } from "@layerly/schema";

export const ShapeSchemaItemType: SchemaItemType = "form-schema/shape";
export const InputSchemaItemType: SchemaItemType = "form-schema/input";
export const ListSchemaItemType: SchemaItemType = "form-schema/list";

export enum InputType {
	Text = "text",
	Textarea = "textarea",
	Article = "article",
	Password = "password",
	Number = "number",
	Select = "select",
	Select2 = "select2",
	Radio = "radio",
	Checkbox = "checkbox"
	// Youtube
	// Relationship
	// Image
	// Relationship Preview
}
