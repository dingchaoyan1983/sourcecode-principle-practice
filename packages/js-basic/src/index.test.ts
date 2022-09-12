import MyPromise from './my-promise'

jest.setTimeout(10000) 

describe('面试中常考的手写题', () => {
  it('call', () => {
    Function.prototype.myCall = function(context, ...args) {
      const _context: Record<keyof any, any> = {}
      Object.assign(_context, context ?? window);
      _context['fn'] = this;
      return _context.fn(...args);
    }

    const obj = {
      name: 'abc'
    }

    const arg1 = '1';
    const arg2 = {}

    const func = function(this: typeof obj, a?: typeof arg1, b?: typeof arg2) { return {
      ctx: this.name,
      arg1: a,
      arg2: b,
    }};

    const myCallResult = func.myCall(obj);

    expect(myCallResult.ctx === obj.name)
    expect(myCallResult.arg1 === arg1)
    expect(myCallResult.arg2 === arg2)
  });

  it('apply', () => {
    Function.prototype.myApply = function(context, args) {
      const _context: Record<keyof any, any> = {}
      Object.assign(_context, context ?? window);
      _context['fn'] = this;
      return _context.fn(...args)
    }

    const obj = {
      name: 'abc'
    }

    const arg1 = '1';
    const arg2 = {}

    const func = function(this: typeof obj, a: typeof arg1, b: typeof arg2) { return {
      ctx: this.name,
      arg1: a,
      arg2: b,
    }};

    const myApplyResult = func.myApply(obj, [arg1, arg2])

    expect(myApplyResult.ctx === obj.name)
    expect(myApplyResult.arg1 === arg1)
    expect(myApplyResult.arg2 === arg2)
  });

  it('bind', () => {
    Function.prototype.myBind = function(context, arg) {
      return (...args2) => {
        return this.myCall(context, arg, ...args2);
      }
    }

    const obj = {
      name: 'abc'
    }

    const arg1 = '1';
    const arg2 = {}

    const func = function(this: typeof obj, a: typeof arg1, b: typeof arg2) { return {
      ctx: this.name,
      arg1: a,
      arg2: b,
    }};

    const bindResult = func.myBind(obj, arg1)
    const myBindResult = bindResult(arg2);
    expect(myBindResult.ctx === obj.name)
    expect(myBindResult.arg1 === arg1)
    expect(myBindResult.arg2 === arg2)
  })

  it('promise resolve', (done) => {
    const resolvedValue = 'resolvedValue'
    const chainResolvedValue = 'chainResolvedValue'
    const promise = new MyPromise((resolve, reject) => {
      global.setTimeout(() => {
        resolve(resolvedValue)
      }, 1000);
    });

    promise.then((value) => {
      expect(value).toBe(resolvedValue);
      return chainResolvedValue;
    })?.then((value1) => {
      expect(value1).toBe(chainResolvedValue);
      done()
    })
  })

  it('promise reject', (done) => {
    const resolvedValue = 'resolvedValue'
    const chainResolvedValue = 'chainResolvedValue';
    const e = new Error();
    const promise = new MyPromise((resolve, reject) => {
      global.setTimeout(() => {
        reject(e)
      }, 1000);
    });

    promise.then(() => {}, (error) => {
      expect(error).toBe(e);
      done();
    })
  })

  it('promise reject from previous resolve', (done) => {
    const resolvedValue = 'resolvedValue'
    const e = new Error();
    const promise = new MyPromise((resolve, reject) => {
      global.setTimeout(() => {
        resolve(resolvedValue)
      }, 1000);
    });

    promise.then((value) => {
      expect(value).toBe(resolvedValue);
      throw e;
    })?.then(() => {}, (error) => {
      expect(error).toBe(e);
      done()
    })
  })
});

export default {}


