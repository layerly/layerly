import * as React from "react";
import { SortableHandle } from "react-sortable-hoc";

import styled from "styled-components";

export const SortHandle = SortableHandle(({ disabled }) => {
	return (
		<SortHandleStyled disabled={disabled}>
			<Bar />
			<Bar />
			<Bar />
		</SortHandleStyled>
	);
});

const SortHandleStyled = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	width: 20px;
	background: black;
	${(props: { disabled: boolean }) =>
		props.disabled === true ? `cursor: default;` : `cursor: move;`};
`;

const Bar = styled.div`
	background: #d4d4d4;
	width: 50%;
	height: 1px;
	margin: 1px auto;
`;
