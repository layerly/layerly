import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

export default {
	input: "./src/index.ts",
	output: [
		{
			file: pkg.main,
			format: "cjs",
			exports: "named"
		},
		{
			file: pkg.module,
			format: "es",
			exports: "named"
		}
	],
	plugins: [
		commonjs({
			namedExports: {
				lodash: ["cloneDeep", "map", "filter", "each"]
			}
		}),
		typescript()
	],
	external: [
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.peerDependencies || {})
	]
};
