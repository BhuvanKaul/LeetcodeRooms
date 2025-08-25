class BadUserNameError extends Error {
  constructor(message) {
    super(message);
    this.name = "Bad UserName";
  }
}

export {BadUserNameError};