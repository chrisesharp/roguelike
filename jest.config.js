module.exports = {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "collectCoverage": true,
    "collectCoverageFrom": [
        "**/*.[jt]s?(x)",
        "!**/*.d.ts"
    ],
    "coverageProvider": "v8",
    "testMatch": [
        "**/?(*.)+(spec|test).ts"
    ]
}
