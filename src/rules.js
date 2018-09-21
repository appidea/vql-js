const {trimStr} = require('./helpers');

const Tests = {
  BETWEEN: 1,
  EQUAL: 2,
  MATCH: 3,
  PASS: 4
};

const TestsRegex = {
  [Tests.BETWEEN]: /value in \<(\d+), (\d+)\>/,
  [Tests.EQUAL]: /value = (\d+)/,
  [Tests.MATCH]: /value match ([^\n]+)/,
  [Tests.PASS]: /value pass ([a-zA-Z0-9]+)/
};

const TestsFunctions = {
  [Tests.BETWEEN]: (val, from, to) => val >= from && val <= to,
  [Tests.EQUAL]: (val, assert) => val === assert,
  [Tests.MATCH]: (val, match) => val.test(match),
  [Tests.PASS]: (val, ruleToCall) => ruleToCall(val)
};

const constructRule = (body) => {
  const rules = trimStr(body).split('\n');
  return rules.map(rule => {
    const testIdToRun = Object.values(Tests).find(
      testId => TestsRegex[testId].test(rule)
    );

    if (!testIdToRun) {
      throw 'Unknown tester: ' + rule;
    }

    return {
      testIdToRun,
      params: rule.match(TestsRegex[testIdToRun]).splice(1)
    }
  });
}

const runRule = (inputValue, rules, rule, depth = 0) => {
  if (depth === 10) {
    throw 'Rule execution loop detected. Interrupting';
  }

  if (rule.testIdToRun === Tests.PASS) {
    const ruleToRunBefore = rules.find(rule => rule.name === rule.params[0]);

    if (!ruleToRunBefore) {
      throw 'Rule not found: ' + rule.param[0];
    }

    return runRule(inputValue, rules, ruleToRunBefore, depth++)
  }

  return rule.lines(line => TestsFunctions[line.testIdToRun](inputValue, ...line.params));
}

module.exports = {
  constructRule,
  runRule
};
