import { isSchemaItem, SchemaItem } from "./SchemaItem";
import {
	SchemaItemType,
	UnknownSchemaItemType,
	AnySchemaItemType
} from "./types";

type WalkOverTypes = Partial<
	{ [type in SchemaItemType]: (item: SchemaItem) => any }
>;

function* iterate(items: SchemaItem[]) {
	for (const item of items) {
		if (item instanceof SchemaItem) {
			yield* iterate(item.getInternal());
		}
		yield item;
	}
}

function walk(tree: SchemaItem, types: WalkOverTypes) {
	const iterator = iterate(tree.getInternal());
	let node: { value: SchemaItem; done: boolean };
	let changedData: SchemaItem | undefined;
	while (!(node = iterator.next(changedData)).done) {
		changedData = undefined;
		if (node.value && types[node.value.type]) {
			changedData = types[node.value.type]!(node.value);
		} else if (isSchemaItem(node.value) && types[UnknownSchemaItemType]) {
			changedData = types[UnknownSchemaItemType]!(node.value);
		} else if (types[AnySchemaItemType]) {
			changedData = types[AnySchemaItemType]!(node.value);
		}
	}
}

export { walk };
