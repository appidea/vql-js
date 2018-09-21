const {constructRule, runRule} = require('./rules');
const {constructValidator, runValidator} = require('./validators');

const Keywords = {
  FIELD: 'field',
  RULE: 'rule',
  VALIDATOR: 'validator'
};

const parseDeclarations = (content) => {
  let tokensRegex = /([a-z]+) ([a-zA-Z0-9]+)(:([a-zA-Z0-9]+))?( \= \[(([^\]]|(\\\]))+)\])?;/g;

  const tokensCollection = [];

  const copiedScript = content;

  copiedScript.replace(tokensRegex, function (...matches) {
    tokensCollection.push({
      keyword: matches[1],
      name: matches[2],
      body: matches[6]
    });
  });

  return tokensCollection;
}


class Vql {
  constructor(script, fieldMapping) {
    this.active = false;
    this.fieldMapping = fieldMapping;

    this.getScript(script)
      .then((content) => {
        this.tokens = parseDeclarations(content);
        this.bindFields();
        this.bindRules();
        this.bindValidators();

        this.active = true;
      })
  }

  bindFields() {
    this.fields = this.tokens.filter(el => el.keyword === Keywords.FIELD)
        .map(el => ({
          name: el.name,
          element: this.fieldMapping[el.name]
        }));
  }

  bindRules() {
    this.rules = this.tokens.filter(el => el.keyword === Keywords.RULE)
        .map(el => ({
          name: el.name,
          lines: constructRule(el.body)
        }));
  }

  bindValidators() {
    this.validators = this.tokens.filter(el => el.keyword === Keywords.VALIDATOR)
        .map(el => ({
          name: el.name,
          lines: constructValidator(this.rules, el.body)
        }));
  }

  run(validator) {
    const rules = runValidator(this.validators, validator);

    const results = rules.map(({ruleToRun, fieldName}) => {
      const inputValue = this.fields.find(field => field.name === fieldName).value;

      return runRule( inputValue, this.rules, this.rules.find(rule => rule.name === ruleToRun) );
    });
  }

  getScript(script) {
    return fetch(script).then((response) => response.text());
  }
}

window.Vql = Vql;
