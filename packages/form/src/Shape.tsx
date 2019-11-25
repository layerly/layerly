import { Grid } from "@layerly/grid";
import { Group, isSchemaItem, SchemaItem } from "@layerly/schema";
import { cloneDeep, each, every, find, isPlainObject } from "lodash";
import { SchemaInput } from "./Input";
import { isList, List } from "./List";
import { ShapeSchemaItemType } from "./types";
import invariant from "invariant";

type AvailableTypes = Grid | Group | Shape | List | SchemaInput | any;

type IterableShapeFigure = Iterable<[string, AvailableTypes]>;

type ShapeFigure = Map<string, AvailableTypes>;

class Shape extends SchemaItem {
	public static Type = ShapeSchemaItemType;
	protected figure: ShapeFigure;
	constructor(opts?) {
		super(opts);
		this.figure = new Map();
		this.figure.forEach((value: any) => {
			if (value instanceof SchemaItem) {
				value.setParent(this);
			}
		});

		this.mergeAfter = this.mergeAfter.bind(this);
	}

	public getFigure() {
		return this.figure;
	}

	public entries() {
		return this.figure.entries();
	}

	public properties() {
		return this.figure.keys();
	}

	public name(name: string) {
		this.custom.set("name", name);
		return this;
	}

	private *iterateForPath(item: SchemaItem) {
		const parent = item.getParent();
		if (parent) {
			if (isShape(parent)) {
				const name = parent.findPropertyName(item);
				yield name ? name : (item as Shape).custom.get("name");
			}
			if (isList(parent)) return;
			yield* this.iterateForPath(parent);
		}
	}

	public findPath() {
		return Array.from(this.iterateForPath(this))
			.reverse()
			.join(".");
	}

	public getProperty(propertyName: string) {
		if (!this.figure.has(propertyName)) {
			throw new Error(
				`Shape doesn't have property with name '${propertyName}'`
			);
		}
		return this.figure.get(propertyName);
	}

	public property(propertyName: string, propertyValue: any): any {
		if (isSchemaItem(propertyValue)) {
			propertyValue.setParent(this);
		}
		this.figure.set(propertyName, propertyValue);
		return propertyValue;
	}

	public findPropertyName(property: any) {
		for (let entry of this.figure.entries()) {
			if (entry[1] === property) return entry[0];
		}
		return undefined;
	}

	public getInternal() {
		return Array.from(this.figure.values());
	}

	public replaceInternalItem(source: any, dest: any) {
		let propertyName;
		for (const [key, value] of this.figure) {
			if (value === source) {
				propertyName = key;
			}
		}
		if (!propertyName) {
			console.log("not found");
			return;
		}
		if (isSchemaItem(dest)) {
			dest.setParent(this);
		}
		this.figure.set(propertyName, dest);
	}

	public removeInternalItem(source: any) {
		const property = find(Array.from(this.figure.entries()), entry => {
			if (!entry) return false;
			const currentSource = entry[1];
			if (currentSource === source) return true;
			return false;
		});
		if (!property) return;
		const propertyName = property[0];
		this.figure.delete(propertyName);
	}

	public toObject() {
		const obj: { [key: string]: any } = {};
		this.figure.forEach((value, key) => {
			obj[key] = value;
		});
		return obj;
	}

	public mergeBeforeToParent() {
		invariant(this.parent, "No parent in SchemaItem to mergeToParent()");
		if (typeof this.parent!.mergeBefore === "function") {
			this.parent!.mergeBefore(this);
		}
	}

	public mergeAfterToParent() {
		invariant(this.parent, "No parent in SchemaItem to mergeToParent()");
		if (typeof this.parent!.mergeAfter === "function") {
			this.parent!.mergeAfter(this);
		}
	}

	public mergeBefore(child: SchemaItem) {
		if (isShape(child)) {
			const targetFigure = [...child.entries(), ...this.figure.entries()];
			this.figure = new Map(targetFigure);
			this.removeInternalItem(child);
		} else if (typeof child === "object" && child.constructor === Object) {
			let targetFigure: [string, AvailableTypes][] = [];
			for (const propertyName of Object.keys(child)) {
				const property = child[propertyName];
				targetFigure.push([propertyName, property]);
			}
			// for (let i = 0; i < Object.keys(child).length; i++) {
			// 	const propertyName = Object.keys(child)[i];

			// }
			targetFigure = [...targetFigure, ...this.figure.entries()];
			this.figure = new Map(targetFigure);
			this.removeInternalItem(child);
		} else if (child instanceof SchemaItem) {
			let subFigure = new Map();
			const internal = child.getInternal();
			for (const item of internal) {
				if (isShape(item)) {
					subFigure = new Map(...(item.figure as any), ...subFigure);
				} else if (typeof item === "object" && item.constructor === Object) {
					for (const propertyName of Object.keys(item)) {
						const property = item[propertyName];
						subFigure.set(propertyName, property);
					}
					// for (let i = 0; i < Object.keys(item).length; i++) {
					// 	const propertyName = Object.keys(item)[i];
					// 	const property = item[propertyName];
					// 	subFigure.set(propertyName, property);
					// }
				} else {
					throw new Error(
						"Only other Shapes and plain objects (and them arrays) can be merged to Shape"
					);
				}
			}
			// for (let i = 0; i < internal.length; i++) {
			// const item = internal[i];
			// }

			this.replaceInternalItem(child, Shape.of(subFigure.entries()));
		} else {
			throw new Error(
				"Only other Shapes and plain objects (and them arrays) can be merged to Shape"
			);
		}
	}

	private mergeWithShape(shape: Shape) {
		const targetFigure = [...this.figure.entries(), ...shape.entries()];
		this.figure = new Map(targetFigure);
	}

	public mergeAfter(child: any) {
		if (isShape(child)) {
			this.mergeWithShape(child);
			child.dispose();
			this.removeInternalItem(child);
		} else if (isPlainObject(child)) {
			const shape = Shape.ofObject(child);
			this.mergeWithShape(shape);
			this.removeInternalItem(child);
		} else if (child instanceof SchemaItem) {
			const internal = child.getInternal();
			const allTheShapesOrPlainObjects = every(
				internal,
				item => isShape(item) || isPlainObject(item)
			);
			const allTheSame = every(
				internal,
				(item, index, items) => index === 0 || item === items[index - 1]
			);
			if (allTheShapesOrPlainObjects) {
				const mergedShape = mergeShapes(internal);
				child.dispose();
				this.replaceInternalItem(child, mergedShape);
			} else if (allTheSame) {
				const item = internal[0];
				this.replaceInternalItem(child, item);
			} else {
				throw new Error(
					"Only other shapes, plain objects, or schema items which every internal item is the same, can be merged to shape"
				);
			}
		}
	}

	public clone() {
		const item = new (this.constructor as any)();
		for (const [key, value] of this.figure) {
			if (isSchemaItem(value)) {
				const cloned = value.clone();
				cloned.setParent(item);
				item.figure.set(key, cloned);
			} else if (typeof value === "object") {
				item.figure.set(key, cloneDeep(value));
			} else {
				item.figure.set(key, value);
			}
		}
		item.type = this.type;
		item.custom = new Map(this.custom);
		return item;
	}

	public static of(figure: Iterable<[string, any]>) {
		const shape = new Shape();
		shape.figure = new Map(figure);
		shape.figure.forEach((value: any) => {
			if (value instanceof SchemaItem) {
				value.setParent(shape);
			}
		});
		return shape;
	}

	public static ofObject(object: object) {
		const shape = new Shape();
		shape.figure = new Map();
		each(object, (value, key) => {
			if (isSchemaItem(value)) {
				value.setParent(shape);
			}
			shape.figure.set(key, value);
		});
		return shape;
	}
}

function isShape(item: any): item is Shape {
	return item instanceof Shape;
}

function mergeShapes(arrayOfshapesOrPlainObjects: any[]) {
	const shape = new Shape();
	for (const item of arrayOfshapesOrPlainObjects) {
		if (isShape(item)) {
			item.dispose();
			item.getFigure().forEach((property, propertyName) => {
				shape.property(propertyName, property);
			});
		} else if (isPlainObject(item)) {
			Object.keys(item).forEach(propertyName => {
				const property = item[propertyName];
				shape.property(propertyName, property);
			});
		}
	}
	// for (let i = 0; i < arrayOfshapesOrPlainObjects.length; i++) {
	// 	const item = arrayOfshapesOrPlainObjects[i];
	// 	if (isShape(item)) {
	// 		item.dispose();
	// 		item.getFigure().forEach((property, propertyName) => {
	// 			shape.property(propertyName, property);
	// 		});
	// 	} else if (isPlainObject(item)) {
	// 		Object.keys(item).forEach(propertyName => {
	// 			const property = item[propertyName];
	// 			shape.property(propertyName, property);
	// 		});
	// 	}
	// }
	return shape;
}

export { isShape, mergeShapes, Shape, ShapeFigure, IterableShapeFigure };
