// A custom test framework because I hate test frameworks!

/**
 * @callback TestFunc
 * @param {TestContext} t
 * @return {void}
 */

/**
 * @typedef TestCase
 * @type {object}
 *
 * @property {string} name
 * @property {TestFunc} func
 * @property {boolean} success
 * @property {Log[]} logs
 *
 * @property {TestCase[]} children
 */

/**
 * @typedef NormalLog
 * @type {object}
 *
 * @property {false} isError
 * @property {any[]} stuff
 */

/**
 * @typedef ErrorLog
 * @type {object}
 *
 * @property {true} isError
 * @property {Error} err
 */

/**
 * @typedef Log
 * @type {(NormalLog|ErrorLog)}
 */

export class TestContext {
  /**
   * @param {TestCase} testCase
   */
  constructor(testCase) {
    this.testCase = testCase;
  }

  /**
   * @param {string} [message]
   */
  fail(message) {
    this.testCase.success = false;
    if (message) {
      this.testCase.logs.push({
        err: new Error(message),
        isError: true,
      });
    }
  }

  /**
   * @param {string} name
   * @param {TestFunc} func
   */
  test(name, func) {
    this.testCase.children.push({
      name: name,
      func: func,
      success: true,
      logs: [],
      children: [],
    });
  }

  /**
   * @param {...any} args
   */
  log(...args) {
    this.testCase.logs.push({
      isError: false,
      stuff: args.map(v => {
        try {
          return JSON.parse(JSON.stringify(v));
        } catch (e) {
          if (e instanceof TypeError) {
            return v;
          }
        }
      }),
    });
  }
}

/**
 * @type {TestCase[]}
 */
const tests = [];

/**
 * @param {string} name
 * @param {TestFunc} func
 */
export function test(name, func) {
  tests.push({
    name: name,
    func: func,
    success: true,
    logs: [],
    children: [],
  });
}

/**
 * @param {TestCase[]} tests
 * @param {string} [name]
 * @returns {boolean}
 */
function runTests(tests, name) {
  let success = true;
  for (const test of tests) {
    const t = new TestContext(test);

    const oldConsole = console;
    console = {
      ...oldConsole,
      log(...args) {
        t.log(...args);
      },
      error(...args) {
        t.log(...args);
        t.fail();
      },
    };

    try {
      test.func(t);
    } catch (e) {
      test.logs.push({
        err: e instanceof Error ? e : new Error(JSON.stringify(e)),
        isError: true,
      });
      test.success = false;
    }

    console = oldConsole;
  
    runTests(test.children, name);

    if (!test.success) {
      success = false;
    }
  }
  return success;
}

/**
 * @param {string} [name]
 */
export function run(name) {
  const success = runTests(tests, name);

  /**
   * @param {TestCase} test
   */
  function printTest(test) {
    const emoji = test.success ? "✅" : "❌";
    if (!name || test.name === name) {
      console.groupCollapsed(`${emoji} ${test.name}`);
      for (const log of test.logs) {
        if (log.isError) {
          console.error(log.err);
        } else {
          // @ts-ignore: Somehow it does not understand that isError is a boolean.
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          console.log(...log.stuff);
        }
      }
      console.groupEnd();
    }

    for (const child of test.children) {
      console.group();
      printTest(child);
      console.groupEnd();
    }
  }

  for (const test of tests) {
    printTest(test);
  }

  process.exit(success ? 0 : 1);
}
