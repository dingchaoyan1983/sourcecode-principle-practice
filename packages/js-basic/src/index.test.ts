import fn from './index';

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
});


