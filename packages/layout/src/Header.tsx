import { SchemaItem, SchemaItemOpts } from "@epranka/test-schema";
import * as React from "react";
import styled from "styled-components";
import { HeaderSchemaItemType } from "./types";

interface HeaderOptions {
	title?: string;
}

class Header extends SchemaItem {
	public static Type = HeaderSchemaItemType;
	protected options?: HeaderOptions | string;
	constructor(opts?: SchemaItemOpts) {
		super(opts);
		this.custom.set("size", 1);
	}

	public title(title: string) {
		this.custom.set("title", title);
		return this;
	}

	public size(size: number) {
		this.custom.set("size", Math.max(Math.min(size, 6), 1));
		return this;
	}

	private getOptions(): {
		element: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
		fontSize: string;
	} {
		switch (this.custom.get("size")) {
			case 1:
				return { element: "h1", fontSize: "2.5rem" };
			case 3:
				return { element: "h3", fontSize: "1.75rem" };
			case 4:
				return { element: "h4", fontSize: "1.5rem" };
			case 5:
				return { element: "h5", fontSize: "1.25rem" };
			case 6:
				return { element: "h6", fontSize: "1rem" };
			case 2:
			default:
				return { element: "h2", fontSize: "2rem" };
		}
	}

	public render() {
		const options = this.getOptions();
		return (
			<HeaderStyled as={options.element} style={{ fontSize: options.fontSize }}>
				{this.custom.get("title")}
			</HeaderStyled>
		);
	}
}

const HeaderStyled = styled.h2`
	margin-bottom: 0.5rem;
	font-family: inherit;
	font-weight: 500;
	line-height: 1.2;
	color: inherit;
`;

const header = (title: string, size: number = 1) => {
	return Header.create(header => {
		header.title(title).size(size);
	});
};

function isHeader(item: any): item is Header {
	return item instanceof Header;
}

export { header, isHeader, Header, HeaderOptions };
