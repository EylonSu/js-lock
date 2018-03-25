
// /**
//  * The {@code TimeoutError} represents an error thrown when an operation that
//  * has a time limit has timed out (exceeded its time limit).
//  */
// export default class TimeoutError extends Error {
//   /**
//    * Initializes the timeout error.
//    *
//    * @param {string=} message The message that describes the cause of the
//    *        error.
//    */
//   constructor(message = '') {
//     super(message)

//     this.name = 'TimeoutError'
//   }
// }


// compiled with babel

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The {@code TimeoutError} represents an error thrown when an operation that
 * has a time limit has timed out (exceeded its time limit).
 */
var TimeoutError = function (_Error) {
  _inherits(TimeoutError, _Error);

  /**
   * Initializes the timeout error.
   *
   * @param {string=} message The message that describes the cause of the
   *        error.
   */
  function TimeoutError() {
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    _classCallCheck(this, TimeoutError);

    var _this = _possibleConstructorReturn(this, (TimeoutError.__proto__ || Object.getPrototypeOf(TimeoutError)).call(this, message));

    _this.name = 'TimeoutError';
    return _this;
  }

  return TimeoutError;
}(Error);

exports.default = TimeoutError;