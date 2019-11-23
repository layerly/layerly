import { includes, isPlainObject } from "lodash";
import { isSchemaItem, SchemaItem } from "./SchemaItem";
import { SchemaItemType, AnySchemaItemType } from "./types";

export enum SchemaNodeType {
	ANY = "any",
	BEGIN = "begin",
	END = "end"
}

class SchemaNode<T = SchemaItem> {
	public item: T;
	public type: SchemaNodeType;

	constructor(item: any) {
		this.item = item;
		this.type = SchemaNodeType.ANY;
	}
}

class BeginNode<T> extends SchemaNode<T> {
	constructor(item) {
		super(item);
		this.type = SchemaNodeType.BEGIN;
	}
}
class EndNode<T> extends SchemaNode<T> {
	constructor(item) {
		super(item);
		this.type = SchemaNodeType.END;
	}
}

function isBeginNode<T>(node: SchemaNode<T>): node is BeginNode<T> {
	return node instanceof BeginNode;
}

function isEndNode<T>(node: SchemaNode<T>): node is EndNode<T> {
	return node instanceof EndNode;
}

function* iterateObject<T extends SchemaItem = SchemaItem>(
	item: any,
	itemType: SchemaItemType = AnySchemaItemType,
	nodeType: SchemaNodeType = SchemaNodeType.ANY
): IterableIterator<SchemaNode<T>> {
	const beginNode = new BeginNode<T>(item);
	if (
		isSchemaItem(item) &&
		(item.type === itemType || itemType === AnySchemaItemType) &&
		(nodeType === SchemaNodeType.BEGIN || nodeType === SchemaNodeType.ANY)
	) {
		yield beginNode;
	}
	if (beginNode.item instanceof SchemaItem) {
		yield* iterate(beginNode.item, itemType, nodeType);
	} else if (Array.isArray(beginNode.item)) {
		yield* iterateArray(beginNode.item, itemType, nodeType);
	} else if (isPlainObject(beginNode.item)) {
		yield* iterateObject(beginNode.item, itemType, nodeType);
	}
	const endNode = new EndNode<T>(beginNode.item);
	if (
		isSchemaItem(item) &&
		(item.type === itemType || itemType === AnySchemaItemType) &&
		(nodeType === SchemaNodeType.END || nodeType === SchemaNodeType.ANY)
	) {
		yield endNode;
	}
}

function* iterateArray<T extends SchemaItem = SchemaItem>(
	itemsArray: any[],
	itemType: SchemaItemType = AnySchemaItemType,
	nodeType: SchemaNodeType = SchemaNodeType.ANY
): IterableIterator<SchemaNode<T>> {
	for (const item of itemsArray) {
		yield* iterateObject(item, itemType, nodeType);
	}
}

function* iterate<T extends SchemaItem = SchemaItem>(
	parent: SchemaItem,
	itemType: SchemaItemType = AnySchemaItemType,
	nodeType: SchemaNodeType = SchemaNodeType.ANY
): IterableIterator<SchemaNode<T>> {
	const items = parent.getInternal();
	yield* iterateArray(items, itemType, nodeType);
}

function getNodes<T extends SchemaItem = SchemaItem>(
	parent: SchemaItem,
	...itemType: SchemaItemType[]
): SchemaNode<T>[] {
	return Array.from(
		iterate<T>(parent, AnySchemaItemType, SchemaNodeType.END)
	).filter(node => includes(itemType, node.item.type));
}

function getNodesNot<T extends SchemaItem = SchemaItem>(
	parent: SchemaItem,
	...itemType: SchemaItemType[]
): SchemaNode<T>[] {
	return Array.from(
		iterate<T>(parent, AnySchemaItemType, SchemaNodeType.END)
	).filter(node => !includes(itemType, node.item.type));
}

export {
	BeginNode,
	EndNode,
	SchemaNode,
	isBeginNode,
	isEndNode,
	iterate,
	getNodes,
	getNodesNot
};
