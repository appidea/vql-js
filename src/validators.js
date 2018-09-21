const {trimStr} = require('./helpers');

const RUN_COMMAND = /^run ([a-zA-Z0-9]+)$/;
const TEST_COMMAND = /^testif ([a-zA-Z0-9]+) ([a-zA-Z0-9]+)$/

const constructValidator = (rules, body) => {
  const lines = trimStr(body).split('\n');

  return lines.map(line => {
    const sanitizedLine = trimStr(line);

    if (TEST_COMMAND.test(sanitizedLine)) {
      const [all, fieldName, ruleName] = sanitizedLine.match(TEST_COMMAND),
            ruleToRun = rules.find(rule => rule.name === ruleName);

      if (!ruleToRun) {
        throw 'Rule not found: ' + ruleName;
      }

      return {
        type: 'test',
        fieldName,
        ruleToRun
      }
    }
    else if (RUN_COMMAND.test(sanitizedLine)) {
      const [all, validatorName] = sanitizedLine.match(RUN_COMMAND);

      return {
        type: 'run',
        validatorName
      }
    }
  });
};

const runValidator = (validators, validatorName, depth = 0) => {
  const validator = validators.find(validator => validator.name === validatorName);

  if (!validator) {
    throw 'Validator not found: ' + validatorName;
  }

  return validator.lines.map(validatorLine => {
    if (validatorLine.type === 'test') {
      return {
        ruleToRun: validatorLine.ruleToRun,
        fieldName: validatorLine.fieldName
      };
    }
    else if (validatorLine.type === 'run') {
      // run dependant validator

      const validatorToRun = validators.find(validator => validator.name === validatorLine.validatorName);

      if (!validatorToRun) {
        throw 'Validator not found: ' + validatorLine.validatorName;
      }

      return runValidator(validators, validatorLine.validatorName, depth++);
    }
  })
}

module.exports = {
  constructValidator,
  runValidator
};
