import SchemaBuilder, {
	Group,
	SchemaItem,
	UnknownSchemaItemType,
	walk,
	AnySchemaItemType
} from "@epranka/test-schema";
import React from "react";
import { GridBlock, GridRow, Header } from ".";
import {
	HeaderSchemaItemType,
	GridBlockSchemaItemType,
	GridRowSchemaItemType
} from "./types";

export class LayoutSchemaBuilder {
	protected schema: SchemaBuilder;
	public constructor(schema: SchemaBuilder) {
		this.schema = schema;
	}

	private createGridBlockComponent(item: SchemaItem) {
		const size = item.custom.get("size");
		const className = item.custom.get("className").join(" ");
		const style = item.custom.get("style");
		const internal = item.getInternal() as any[];
		return class extends React.PureComponent<any, any> {
			static displayName = `SchemaGridBlock(${size})`;
			public render() {
				return (
					<div style={style} className={`${size} ${className}`}>
						{internal.map((Item: any, key) => {
							return <Item key={key} />;
						})}
					</div>
				);
			}
		};
	}

	private createRowComponent(item: SchemaItem) {
		const className = item.custom.get("className").join(" ");
		const style = item.custom.get("style");
		const internal = item.getInternal() as any[];
		return class extends React.PureComponent<any, any> {
			static displayName = `SchemaRow`;
			public render() {
				return (
					<div style={style} className={className}>
						{internal.map((Item: any, key) => {
							return <Item key={key} />;
						})}
					</div>
				);
			}
		};
	}

	protected manageGridBlock(item: GridBlock) {
		item.replace(this.createGridBlockComponent(item));
	}

	protected manageRow(item: GridRow) {
		item.replace(this.createRowComponent(item));
	}

	protected manageHeader(item: Header) {
		item.replace(item.render.bind(item));
	}

	protected manageSchemaItem(item: SchemaItem) {
		item.mergeAfterToParent();
	}

	protected manage(item: SchemaItem) {
		return null;
	}

	protected iterate(parent: any) {
		walk(parent, {
			[HeaderSchemaItemType]: this.manageHeader.bind(this),
			[GridBlockSchemaItemType]: this.manageGridBlock.bind(this),
			[GridRowSchemaItemType]: this.manageRow.bind(this),
			[UnknownSchemaItemType]: this.manageSchemaItem.bind(this),
			[AnySchemaItemType]: this.manage.bind(this)
		});
	}

	public build(): React.ComponentType {
		const g = Group.of(this.schema.getInternal());
		this.iterate(g);
		const internal = g.getInternal() as any[];
		return class extends React.PureComponent<any, any> {
			static displayName = `LayoutSchema`;
			public render() {
				return internal.map((Item: any, key) => {
					return <Item key={key} />;
				});
			}
		};
	}

	public static convertFrom<T>(
		this: new (schema: SchemaBuilder) => T,
		schema: SchemaBuilder
	): T {
		return new this(schema.clone());
	}
}
