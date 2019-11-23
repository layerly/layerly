
import styled from "styled-components";

import { StyledInput } from "./styledInput";

export const StyledTextarea = styled(StyledInput)`
	overflow: auto;
	resize: vertical;
	min-height: 300px;

	transition: border-color 0.3s linear;
	&:focus {
		border-color: #888888;
		outline: none;
		box-shadow: none;
	}
`;
