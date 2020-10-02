module.exports = {
    presets: [
      [
        "@babel/preset-react",
        {
          // pragma: "dom", // default pragma is React.createElement (only in classic runtime)
          // pragmaFrag: "DomFrag", // default is React.Fragment (only in classic runtime)
          // throwIfNamespace: true, // defaults to true
          runtime: "automatic", // defaults to classic
          development: true,
          // useBuiltIns: true,
          // "importSource": "custom-jsx-library" // defaults to react (only in automatic runtime)
        }
      ],
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
    ],
    plugins: [
      "@babel/plugin-syntax-jsx",
      "@babel/plugin-transform-react-jsx",
      "@babel/plugin-transform-react-display-name",
    ]
  };