const fs = require('fs');

const Keywords = {
  FIELD: 'field',
  RULE: 'rule',
  VALIDATOR: 'validator'
};

const RuleRegex = {
  BETWEEN: \<(\d+), entity, (\d+)\>,
  EQUAL: /entity = (\d+)/,
  PASS: /entity pass ([^\n]+)/
};

const handleToken = ({keyword, name, body}) => {
  switch (keyword) {
    case Keywords.FIELD:
      return name;
      break;

    case Keywords.RULE:
      body.
  }
}

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

  return tokensCollection.map(el => handleToken(el));
}

class Vql {
  constructor(script, fieldMapping) {
    this.active = false;
    this.fieldMapping = fieldMapping;

    return this.getScript(script)
      .then((content) => {
        const {fields, rules, validators} = parseDeclarations(content);
        this.fields = fields;
        this.rules = rules;
        this.validators = validators;

        this.active = true;
      })
  }

  getScript(script) {
    return fetch(script);
  }

  run(validator) {

  }
}
