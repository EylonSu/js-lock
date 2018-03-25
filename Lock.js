
// import TimeoutError from './TimeoutError'

// /**
//  * Private field symbols.
//  *
//  * @type {Object<string, symbol>}
//  */
// const PRIVATE = Object.freeze({
//   locked: Symbol('locked'),
//   taskTriggerQueue: Symbol('taskTriggerQueue')
// })

// /**
//  * A simple locking mechanism for synchronizing tasks performed in async
//  * functions.
//  */
// export default class Lock {
//   /**
//    * Initializes the lock.
//    *
//    * @param {string=} lockName The name of this lock. The name must not be an
//    *        empty string and should be unique to help identify the lock in
//    *        timeout error messages.
//    */
//   constructor(lockName = generateLockName()) {
//     if (typeof lockName !== 'string') {
//       throw new TypeError(
//         `The lock name must be a non-empty string, ${lockName} was provided`
//       )
//     }
//     if (!lockName) {
//       throw new Error(
//         'The lock name must be a non-empty string, but an empty string was ' +
//         'provided'
//       )
//     }

//     /**
//      * The name of this lock.
//      *
//      * @type {string}
//      */
//     this.name = lockName
//     Object.defineProperty(this, 'name', {
//       configurable: false,
//       enumerable: false,
//       writable: false
//     })

//     /**
//      * Whether or not is this lock currently locked.
//      *
//      * @type {boolean}
//      */
//     this[PRIVATE.locked] = false
//     Object.defineProperty(this, PRIVATE.locked, {
//       configurable: false,
//       enumerable: false
//     })

//     /**
//      * The queue of task resume callback for tasks that are waiting for the lock.
//      *
//      * @type {function()[]}
//      */
//     this[PRIVATE.taskTriggerQueue] = []
//     Object.defineProperty(this, PRIVATE.taskTriggerQueue, {
//       configurable: false,
//       enumerable: false,
//       writable: false
//     })

//     Object.seal(this)
//   }

//   /**
//    * Returns {@code true} when this lock is currently locked by an active task.
//    *
//    * @return {boolean} {@code true} when this lock is currently locked by an
//    *         active task.
//    */
//   get isLocked() {
//     return this[PRIVATE.locked]
//   }

//   /**
//    * Executes the provided task by acquiring this lock for the test (once
//    * available), running the task, releasing the lock and returning the task's
//    * result.
//    *
//    * @template R
//    * @param {function(): (R|Promise<R>)} task The task that should be performed
//    *        synchronized by this lock.
//    * @param {number=} timeout The maximum number of milliseconds the task
//    *        should wait for the lock to be acquired. Should the task time out,
//    *        the method will throw a {@linkcode TimeoutError}.
//    *        The {@code timeout} can be set to 0 if the task may way
//    *        indefinitely (this is not recommended). Defaults to 60 seconds.
//    * @return {R} The result of the provided task.
//    */
//   async lock(task, timeout = 60000) {
//     if (!(task instanceof Function)) {
//       throw new TypeError(
//         `The task has to be a function, ${task} has been provided`
//       )
//     }
//     if ((typeof timeout !== 'number') || (Math.floor(timeout) !== timeout)) {
//       throw new TypeError(
//         `The timeout has to be a non-negative integer, ${timeout} has been ` +
//         `provided`
//       )
//     }
//     if (timeout < 0) {
//       throw new RangeError(
//         `The timeout has to be a non-negative integer, ${timeout} has been ` +
//         `provided`
//       )
//     }

//     if (this[PRIVATE.locked]) {
//       await new Promise((resolve, reject) => {
//         this[PRIVATE.taskTriggerQueue].push(resolve)

//         if (timeout) {
//           setTimeout(() => {
//             let triggerIndex = this[PRIVATE.taskTriggerQueue].indexOf(resolve)
//             if (triggerIndex === -1) {
//               return // the task has been already started
//             }

//             this[PRIVATE.taskTriggerQueue].splice(triggerIndex, 1)
//             reject(new TimeoutError(
//               `The provided task did not acquire the ${this.name} lock ` +
//               `within the specified timeout of ${timeout} milliseconds`
//             ))
//           }, timeout)
//         }
//       })
//     } else {
//       this[PRIVATE.locked] = true
//     }

//     try {
//       return await task()
//     } catch (error) {
//       throw error
//     } finally {
//       if (this[PRIVATE.taskTriggerQueue].length) {
//         let trigger = this[PRIVATE.taskTriggerQueue].shift()
//         trigger()
//       } else {
//         this[PRIVATE.locked] = false
//       }
//     }
//   }

//   /**
//    * Attempts to acquire all of the specified locks within the specified
//    * timeout before executing the provided task. The task will be executed only
//    * if all of the locks are acquired within the time limit.
//    *
//    * The locks are acquired in lexicographical order of their names (the names
//    * of the provided locks must be unique) in order to prevent deadlocks in the
//    * application (should the timeout be set to 0, which is not recommended).
//    *
//    * @template R
//    * @param {Lock[]} locks The locks that must be acquired before the task can
//    *        be executed. The array must not be empty.
//    * @param {function(): (R|Promise<R>)} task The task to execute once all of
//    *        the specified locks have been acquired.
//    * @param {number=} timeout The maximum number of milliseconds the task may
//    *        wait to acquire all locks. Should the task time out, the method
//    *        will throw a {@linkcode TimeoutError}.
//    *        The {@code timeout} can be set to 0 if the task may way
//    *        indefinitely (this is not recommended). Defaults to 60 seconds.
//    */
//   static async all(locks, task, timeout = 60000) {
//     if (!(locks instanceof Array)) {
//       throw new TypeError(
//         `The locks must be an array of Lock instances, ${locks} has been ` +
//         `provided`
//       )
//     }
//     if (locks.some(lock => !(lock instanceof Lock))) {
//       throw new TypeError(
//           `The locks must be an array of Lock instances, ${locks} has been ` +
//           `provided`
//       )
//     }
//     if (!(task instanceof Function)) {
//       throw new TypeError(
//         `The task must be a function, ${task} has been provided`
//       )
//     }
//     if ((typeof timeout !== 'number') || (Math.floor(timeout) !== timeout)) {
//       throw new TypeError(
//         `The timeout has to be a non-negative integer, ${timeout} has been ` +
//         `provided`
//       )
//     }
//     if (timeout < 0) {
//       throw new RangeError(
//           `The timeout has to be a non-negative integer, ${timeout} has been ` +
//           `provided`
//       )
//     }
//     if (!locks.length) {
//       throw new RangeError('The array of locks cannot be empty')
//     }
//     if ((new Set(locks.map(lock => lock.name))).size !== locks.length) {
//       throw new Error(
//         'The names of the locks to acquire must be unique to ensure a ' +
//         'deadlock would not occur'
//       )
//     }

//     if (locks.length === 1) {
//       return await locks[0].lock(task, timeout)
//     }

//     let sortedLocks = locks.slice().sort(lock => lock.name)
//     let nextLock = sortedLocks.slice().shift()
//     let waitStart = Date.now()
//     return await nextLock.lock(async () => {
//       let timeWaited = Date.now() - waitStart
//       let remainingTime = Math.max(timeout - timeWaited, 1)
//       return await Lock.all(sortedLocks.slice(1), task, remainingTime)
//     }, timeout)
//   }
// }

// /**
//  * Generates a new, most likely unique, name for a freshly created lock that
//  * was not provided with a custom name.
//  *
//  * @return {string} The generated name for the lock.
//  */
// function generateLockName() {
//   let subMark = Math.floor(Math.random() * 1000).toString(36)
//   return `Lock:${Date.now().toString(36)}:${subMark}`
// }


// compiled with babel

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TimeoutError = require('./TimeoutError');

var _TimeoutError2 = _interopRequireDefault(_TimeoutError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Private field symbols.
 *
 * @type {Object<string, symbol>}
 */
var PRIVATE = Object.freeze({
  locked: Symbol('locked'),
  taskTriggerQueue: Symbol('taskTriggerQueue')
});

/**
 * A simple locking mechanism for synchronizing tasks performed in async
 * functions.
 */

var Lock = function () {
  /**
   * Initializes the lock.
   *
   * @param {string=} lockName The name of this lock. The name must not be an
   *        empty string and should be unique to help identify the lock in
   *        timeout error messages.
   */
  function Lock() {
    var lockName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : generateLockName();

    _classCallCheck(this, Lock);

    if (typeof lockName !== 'string') {
      throw new TypeError('The lock name must be a non-empty string, ' + lockName + ' was provided');
    }
    if (!lockName) {
      throw new Error('The lock name must be a non-empty string, but an empty string was ' + 'provided');
    }

    /**
     * The name of this lock.
     *
     * @type {string}
     */
    this.name = lockName;
    Object.defineProperty(this, 'name', {
      configurable: false,
      enumerable: false,
      writable: false
    });

    /**
     * Whether or not is this lock currently locked.
     *
     * @type {boolean}
     */
    this[PRIVATE.locked] = false;
    Object.defineProperty(this, PRIVATE.locked, {
      configurable: false,
      enumerable: false
    });

    /**
     * The queue of task resume callback for tasks that are waiting for the lock.
     *
     * @type {function()[]}
     */
    this[PRIVATE.taskTriggerQueue] = [];
    Object.defineProperty(this, PRIVATE.taskTriggerQueue, {
      configurable: false,
      enumerable: false,
      writable: false
    });

    Object.seal(this);
  }

  /**
   * Returns {@code true} when this lock is currently locked by an active task.
   *
   * @return {boolean} {@code true} when this lock is currently locked by an
   *         active task.
   */


  _createClass(Lock, [{
    key: 'lock',


    /**
     * Executes the provided task by acquiring this lock for the test (once
     * available), running the task, releasing the lock and returning the task's
     * result.
     *
     * @template R
     * @param {function(): (R|Promise<R>)} task The task that should be performed
     *        synchronized by this lock.
     * @param {number=} timeout The maximum number of milliseconds the task
     *        should wait for the lock to be acquired. Should the task time out,
     *        the method will throw a {@linkcode TimeoutError}.
     *        The {@code timeout} can be set to 0 if the task may way
     *        indefinitely (this is not recommended). Defaults to 60 seconds.
     * @return {R} The result of the provided task.
     */
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(task) {
        var _this = this;

        var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 60000;
        var trigger;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (task instanceof Function) {
                  _context.next = 2;
                  break;
                }

                throw new TypeError('The task has to be a function, ' + task + ' has been provided');

              case 2:
                if (!(typeof timeout !== 'number' || Math.floor(timeout) !== timeout)) {
                  _context.next = 4;
                  break;
                }

                throw new TypeError('The timeout has to be a non-negative integer, ' + timeout + ' has been ' + 'provided');

              case 4:
                if (!(timeout < 0)) {
                  _context.next = 6;
                  break;
                }

                throw new RangeError('The timeout has to be a non-negative integer, ' + timeout + ' has been ' + 'provided');

              case 6:
                if (!this[PRIVATE.locked]) {
                  _context.next = 11;
                  break;
                }

                _context.next = 9;
                return new Promise(function (resolve, reject) {
                  _this[PRIVATE.taskTriggerQueue].push(resolve);

                  if (timeout) {
                    setTimeout(function () {
                      var triggerIndex = _this[PRIVATE.taskTriggerQueue].indexOf(resolve);
                      if (triggerIndex === -1) {
                        return; // the task has been already started
                      }

                      _this[PRIVATE.taskTriggerQueue].splice(triggerIndex, 1);
                      reject(new _TimeoutError2.default('The provided task did not acquire the ' + _this.name + ' lock ' + ('within the specified timeout of ' + timeout + ' milliseconds')));
                    }, timeout);
                  }
                });

              case 9:
                _context.next = 12;
                break;

              case 11:
                this[PRIVATE.locked] = true;

              case 12:
                _context.prev = 12;
                _context.next = 15;
                return task();

              case 15:
                return _context.abrupt('return', _context.sent);

              case 18:
                _context.prev = 18;
                _context.t0 = _context['catch'](12);
                throw _context.t0;

              case 21:
                _context.prev = 21;

                if (this[PRIVATE.taskTriggerQueue].length) {
                  trigger = this[PRIVATE.taskTriggerQueue].shift();

                  trigger();
                } else {
                  this[PRIVATE.locked] = false;
                }
                return _context.finish(21);

              case 24:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[12, 18, 21, 24]]);
      }));

      function lock(_x2) {
        return _ref.apply(this, arguments);
      }

      return lock;
    }()

    /**
     * Attempts to acquire all of the specified locks within the specified
     * timeout before executing the provided task. The task will be executed only
     * if all of the locks are acquired within the time limit.
     *
     * The locks are acquired in lexicographical order of their names (the names
     * of the provided locks must be unique) in order to prevent deadlocks in the
     * application (should the timeout be set to 0, which is not recommended).
     *
     * @template R
     * @param {Lock[]} locks The locks that must be acquired before the task can
     *        be executed. The array must not be empty.
     * @param {function(): (R|Promise<R>)} task The task to execute once all of
     *        the specified locks have been acquired.
     * @param {number=} timeout The maximum number of milliseconds the task may
     *        wait to acquire all locks. Should the task time out, the method
     *        will throw a {@linkcode TimeoutError}.
     *        The {@code timeout} can be set to 0 if the task may way
     *        indefinitely (this is not recommended). Defaults to 60 seconds.
     */

  }, {
    key: 'isLocked',
    get: function get() {
      return this[PRIVATE.locked];
    }
  }], [{
    key: 'all',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(locks, task) {
        var _this2 = this;

        var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 60000;
        var sortedLocks, nextLock, waitStart;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (locks instanceof Array) {
                  _context3.next = 2;
                  break;
                }

                throw new TypeError('The locks must be an array of Lock instances, ' + locks + ' has been ' + 'provided');

              case 2:
                if (!locks.some(function (lock) {
                  return !(lock instanceof Lock);
                })) {
                  _context3.next = 4;
                  break;
                }

                throw new TypeError('The locks must be an array of Lock instances, ' + locks + ' has been ' + 'provided');

              case 4:
                if (task instanceof Function) {
                  _context3.next = 6;
                  break;
                }

                throw new TypeError('The task must be a function, ' + task + ' has been provided');

              case 6:
                if (!(typeof timeout !== 'number' || Math.floor(timeout) !== timeout)) {
                  _context3.next = 8;
                  break;
                }

                throw new TypeError('The timeout has to be a non-negative integer, ' + timeout + ' has been ' + 'provided');

              case 8:
                if (!(timeout < 0)) {
                  _context3.next = 10;
                  break;
                }

                throw new RangeError('The timeout has to be a non-negative integer, ' + timeout + ' has been ' + 'provided');

              case 10:
                if (locks.length) {
                  _context3.next = 12;
                  break;
                }

                throw new RangeError('The array of locks cannot be empty');

              case 12:
                if (!(new Set(locks.map(function (lock) {
                  return lock.name;
                })).size !== locks.length)) {
                  _context3.next = 14;
                  break;
                }

                throw new Error('The names of the locks to acquire must be unique to ensure a ' + 'deadlock would not occur');

              case 14:
                if (!(locks.length === 1)) {
                  _context3.next = 18;
                  break;
                }

                _context3.next = 17;
                return locks[0].lock(task, timeout);

              case 17:
                return _context3.abrupt('return', _context3.sent);

              case 18:
                sortedLocks = locks.slice().sort(function (lock) {
                  return lock.name;
                });
                nextLock = sortedLocks.slice().shift();
                waitStart = Date.now();
                _context3.next = 23;
                return nextLock.lock(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                  var timeWaited, remainingTime;
                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          timeWaited = Date.now() - waitStart;
                          remainingTime = Math.max(timeout - timeWaited, 1);
                          _context2.next = 4;
                          return Lock.all(sortedLocks.slice(1), task, remainingTime);

                        case 4:
                          return _context2.abrupt('return', _context2.sent);

                        case 5:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee2, _this2);
                })), timeout);

              case 23:
                return _context3.abrupt('return', _context3.sent);

              case 24:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function all(_x4, _x5) {
        return _ref2.apply(this, arguments);
      }

      return all;
    }()
  }]);

  return Lock;
}();

/**
 * Generates a new, most likely unique, name for a freshly created lock that
 * was not provided with a custom name.
 *
 * @return {string} The generated name for the lock.
 */


exports.default = Lock;
function generateLockName() {
  var subMark = Math.floor(Math.random() * 1000).toString(36);
  return 'Lock:' + Date.now().toString(36) + ':' + subMark;
}