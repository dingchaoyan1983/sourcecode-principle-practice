declare interface Function {
  myCall<T, A extends any[], R>(this: (this: T, ...args: A) => R, thisArg: T, ...args: A): R,
  myApply<T, A extends any[], R>(this: (this: T, ...args: A) => R, thisArg: T, args: A): R
  // myBind<T>(this: T, thisArg: ThisParameterType<T>): OmitThisParameter<T>;
  myBind<T, A0, A extends any[], R>(this: (this: T, A0, ...args2: A) => R, thisArg: T, arg1: A0) : (...args2: A) => R;
  // myBind<T, A extends any[], R>(this: (this: T, ...args2: A) => R, thisArg: T) : (...args2: A) => R;
 }
