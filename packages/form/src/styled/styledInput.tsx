
import styled from "styled-components";

export const StyledInput = styled.input<{
	error?: boolean;
	isUpperCase?: boolean;
}>`
	display: block;
	width: 100%;
	padding: 0.375rem 0.75rem;
	font-size: 1rem;
	line-height: 1.5;
	color: #495057;
	background-color: white;
	background-clip: padding-box;
	border: 1px solid #ced4da;
	border-radius: 1px;
	transition: border-bottom-color 0.3s linear;
	&:focus {
		border-bottom-color: #888888;
		outline: none;
		box-shadow: none;
	}

	${props => (props.error ? `border-color: #dc3545;` : "")}
	${props => (props.isUpperCase ? `text-transform: uppercase;` : "")}
`;
