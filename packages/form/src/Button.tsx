
import styled from "styled-components";

export const Button = styled.button`
	position: relative;
	min-width: 80px;
	display: inline-block;
	text-align: center;
	white-space: nowrap;
	vertical-align: middle;
	user-select: none;
	border: 1px solid transparent;
	padding: 0.375rem 0.75rem;
	font-size: 1rem;
	line-height: 1.5;
	background-color: black;
	transition: background-color 0.15s;
	box-shadow: none;
	outline: none;
	cursor: pointer;
	color: white;

	&:hover {
		background-color: #343a40;
	}

	&[disabled] {
		background-color: #343a40;
	}
`;
