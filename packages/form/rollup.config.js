import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

export default {
	input: "./src/index.ts",
	output: [
		{
			file: pkg.main,
			format: "cjs"
		},
		{
			file: pkg.module,
			format: "es"
		}
	],
	plugins: [
		commonjs({
			namedExports: {
				lodash: [
					"cloneDeep",
					"each",
					"every",
					"find",
					"isPlainObject",
					"findIndex"
				]
			}
		}),
		typescript()
	],
	external: [
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.peerDependencies || {})
	]
};
