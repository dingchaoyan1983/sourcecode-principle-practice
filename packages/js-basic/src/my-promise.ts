
interface ResolveFn<T> {
  (value?: T): any
  
};

interface RejectFn {
  (reason: any): any
}

interface Excutor<T> {
  (resolve: ResolveFn<T>, reject: RejectFn): void
}

enum State {
  Pending = 'pending',
  Resolved = 'resolved',
  Rejected = 'rejected',
}

class MyPromise<T> {
  private value?: T;
  private reason: any;
  private state: State = State.Pending;
  private onFulfilledCallbacks: ResolveFn<T>[] = [];
  private onRejectedCallbacks: RejectFn[] = [];

  constructor(excutor: Excutor<T>) {
    this.onRejectedCallbacks = [];
    const resolve = (value?: T) => {
      if (this.state === State.Pending) {
        if (value) {
          this.value = value;
        }
        this.state = State.Resolved;
        this.onFulfilledCallbacks.forEach((fn) => fn(this.value));
      }
    };

    const reject = (reason: any) => {
      if (this.state === "pending") {
        this.reason = reason;
        this.state = State.Rejected;
        this.onRejectedCallbacks.forEach((fn) => fn(this.reason));
      }
    };
    try {
      excutor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFullfiledCallback: ResolveFn<T>, onRejectedCallback?: RejectFn) {
    let promise;
    if (this.state === State.Resolved) {
      promise = new MyPromise((resolve, reject) => {
        try {
          const rt = onFullfiledCallback(this.value);
          if (rt instanceof MyPromise) {
            rt.then(resolve, reject);
          } else {
            resolve(rt);
          }
        } catch (e) {
          reject(e);
        }
      });
    }

    if (this.state === State.Rejected && onRejectedCallback) {
      promise = new MyPromise((resolve, reject) => {
        try {
          const rt = onRejectedCallback(this.reason);
          if (rt instanceof MyPromise) {
            rt.then(resolve, reject);
          } else {
            resolve(rt);
          }
        } catch (e) {
          reject(e);
        }
      });
    }

    if (this.state === State.Pending) {
      promise = new MyPromise((resolve, reject) => {
        this.onFulfilledCallbacks.push(() => {
          try {
            const rt = onFullfiledCallback(this.value);
            if (rt instanceof MyPromise) {
              rt.then(resolve, reject);
            } else {
              resolve(rt);
            }
          } catch (e) {
            reject(e);
          }
        });
        if (onRejectedCallback) {
          this.onRejectedCallbacks.push(() => {
            try {
              const rt = onRejectedCallback(this.reason);
              if (rt instanceof MyPromise) {
                rt.then(resolve, reject);
              } else {
                resolve(rt);
              }
            } catch (e) {
              reject(e);
            }
          });
        }
      });
    }
    return promise;
  }

}


export default MyPromise;